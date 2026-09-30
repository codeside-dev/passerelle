#!/usr/bin/env node
/*
 * Verifications statiques sur un site construit (dossier dist/), sans navigateur.
 *
 *   node verifier_site.mjs <dossier-dist>
 *
 * Complementaire de e2e.mjs : ces controles tournent en quelques secondes, sans
 * Playwright ni Chromium, donc utilisables partout — y compris en integration
 * continue. Ils ne remplacent pas le navigateur, ils couvrent ce qui peut
 * l'etre sans lui.
 *
 * Le controle central est l'INVARIANT DU LIEN ETIRE, qui attrape sans
 * navigateur le bug le plus vicieux : un lien etire
 * (`after:absolute after:inset-0`) dont aucun ancetre n'est positionne couvre
 * la page entiere au lieu de sa carte, et capte silencieusement tous les clics.
 * Le lien existe, il repond 200, et pourtant cliquer mene ailleurs.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, dirname, resolve } from "node:path";

const DIST = process.argv[2];
if (!DIST || !existsSync(DIST)) {
  console.error("  Usage : node verifier_site.mjs <dossier-dist>");
  process.exit(2);
}

const problemes = [];
const note = (fichier, msg) => problemes.push(`${fichier} — ${msg}`);
const OK = (m) => console.log(`    ok    ${m}`);
const KO = (m) => {
  problemes.push(m);
  console.log(`    ECHEC ${m}`);
};

/* ---------------------------------------------------------------- fichiers */

function fichiersHtml(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...fichiersHtml(p));
    else if (e.endsWith(".html")) out.push(p);
  }
  return out;
}

const pages = fichiersHtml(DIST);

/* Interfaces applicatives : le CMS, par exemple. Ce sont des applications sans
 * contenu rendu cote serveur — les regles editoriales (un seul h1, images
 * decrites) ne les concernent pas. Les liens, eux, restent verifies partout. */
const APPLICATIONS = ["/admin/"];
const estApplication = (nom) => APPLICATIONS.some((prefixe) => nom.startsWith(prefixe));

/* Une URL interne correspond-elle a un fichier livre ? */
function cibleExiste(href) {
  const chemin = href.split("#")[0].split("?")[0];
  if (!chemin.startsWith("/")) return true; // externe, mailto, tel : hors perimetre
  const sansSlash = chemin.replace(/\/$/, "");
  const candidats = [
    join(DIST, chemin),
    join(DIST, chemin, "index.html"),
    join(DIST, chemin + ".html"),
    join(DIST, sansSlash + ".html"),
    join(DIST, sansSlash, "index.html"),
  ];
  return candidats.some((c) => existsSync(c) && statSync(c).isFile());
}

/* ------------------------------------------------- invariant du lien etire */

const VIDE = new Set([
  "area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr",
]);
const POSITIONNE = ["relative", "absolute", "fixed", "sticky"];
const ETIRE = (classes) =>
  /after:absolute/.test(classes) || /after:inset-0/.test(classes);

function classesDe(attrs) {
  const m = attrs.match(/class="([^"]*)"/);
  return m ? m[1] : "";
}

/*
 * Parcours lineaire avec pile : a chaque element porteur d'un lien etire, on
 * verifie qu'un ancetre (ou lui-meme) etablit un bloc conteneur. Sans cela,
 * `inset: 0` se rapporte au bloc conteneur initial, c'est-a-dire a la page.
 */
function verifierLiensEtires(html, fichier) {
  const pile = [];
  let fautifs = 0;
  const re = /<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|[^>"])*?)(\/?)>/g;
  let m;

  while ((m = re.exec(html))) {
    const [, fermant, balise, attrs, autoFermant] = m;
    const nom = balise.toLowerCase();

    if (fermant) {
      for (let i = pile.length - 1; i >= 0; i--) {
        if (pile[i].nom === nom) {
          pile.length = i;
          break;
        }
      }
      continue;
    }

    const classes = classesDe(attrs);

    if (ETIRE(classes)) {
      const ancre = POSITIONNE.some((p) => new RegExp(`(^|\\s)${p}(\\s|$)`).test(classes))
        ? { nom, classes }
        : pile.slice().reverse().find((e) => POSITIONNE.some((p) => new RegExp(`(^|\\s)${p}(\\s|$)`).test(e.classes)));

      if (!ancre || ["body", "html"].includes(ancre.nom)) {
        fautifs += 1;
        note(
          relative(DIST, fichier),
          `lien etire sans ancetre positionne (${classes.slice(0, 48)}…) : ` +
            `le calque se rapporte a la page, pas a la carte`,
        );
      }
    }

    if (!autoFermant && !VIDE.has(nom)) pile.push({ nom, classes });
  }
  return fautifs;
}

/* ------------------------------------------------------------------ tests */

console.log(`\n  ${pages.length} pages a verifier dans ${DIST}\n`);

let liens = 0;
let etires = 0;

for (const fichier of pages) {
  const html = readFileSync(fichier, "utf8");
  const nom = "/" + relative(DIST, fichier).replace(/index\.html$/, "").replace(/\\/g, "/");

  // 1. Les liens internes doivent correspondre a un fichier livre.
  const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
  for (const h of hrefs) {
    liens += 1;
    if (h === "#" || h.trim() === "")
      KO(`${nom} : lien sans destination (href="${h}")`);
    else if (!cibleExiste(h)) KO(`${nom} : lien vers ${h} — aucun fichier livre`);
  }

  // 2. Un seul titre de niveau 1 par page — sauf dans une interface, qui n'a
  //    pas de contenu rendu au serveur.
  if (!estApplication(nom)) {
    const h1 = (html.match(/<h1[\s>]/g) || []).length;
    if (h1 !== 1) KO(`${nom} : ${h1} titre(s) h1 (un seul attendu)`);
  }

  // 3. Toute image de contenu porte un attribut alt.
  if (!estApplication(nom)) {
    for (const m of html.matchAll(/<img\b[^>]*>/g)) {
      if (!/\balt(?=[\s=>])/.test(m[0]))
        KO(`${nom} : <img> sans attribut alt (${m[0].slice(0, 60)}…)`);
    }
  }

  // 4. Aucun placeholder de developpement oublie.
  if (/lorem ipsum/i.test(html)) KO(`${nom} : « lorem ipsum » laisse dans la page`);
  if (/href="\/undefined/.test(html) || />undefined</.test(html))
    KO(`${nom} : « undefined » affiche dans la page`);

  // 5. L'invariant du lien etire.
  etires += verifierLiensEtires(html, fichier);
}

if (liens && !problemes.some((p) => p.includes("lien"))) OK(`${liens} liens internes resolus`);
if (etires === 0) OK("aucun lien etire sans ancetre positionne");

/* 6. Les donnees : chaque produit liste a bien sa page. */
const accueil = pages.find((p) => p === join(DIST, "index.html"));
if (accueil) {
  const html = readFileSync(accueil, "utf8");
  const fiches = [...new Set([...html.matchAll(/href="(\/produit\/[^"?#]+)/g)].map((m) => m[1]))];
  const manquantes = fiches.filter((f) => !cibleExiste(f));
  if (manquantes.length) KO(`fiches annoncees mais absentes : ${manquantes.join(", ")}`);
  else if (fiches.length) OK(`${fiches.length} fiches produit annoncees, toutes livrees`);

  const doublons = fiches.length !== new Set(fiches).size;
  if (doublons) KO("des liens de fiche produit sont dupliques");
}

console.log(
  `\n  BILAN : ${problemes.length === 0 ? "tout passe" : `${problemes.length} probleme(s)`}\n`,
);
if (problemes.length) for (const p of problemes.slice(0, 12)) console.log(`    ${p}`);
process.exit(problemes.length === 0 ? 0 : 1);
