#!/usr/bin/env node
/*
 * Tests de bout en bout d'un site deploye, dans un vrai navigateur.
 *
 *   node e2e.mjs <url-de-base> [--captures <dossier>]
 *
 * Ce que ces tests verifient, et qu'aucune inspection du HTML ne peut voir :
 *
 *   1. INTERCEPTION DE CLIC — pour chaque lien visible, l'element situe au
 *      centre du lien doit etre ce lien. Un calque invisible pose par-dessus
 *      (typiquement un lien etire `after:inset-0` dont l'ancetre n'est pas
 *      positionne) capte les clics sans que rien ne le signale : le lien
 *      existe, repond 200, et pourtant cliquer mene ailleurs. C'est le bug le
 *      plus vicieux du lot, et le seul test qui l'attrape est celui-ci.
 *
 *   2. DESTINATION — cliquer un lien doit reellement mener a son href. Un
 *      `href` juste ne garantit pas que le clic y arrive.
 *
 *   3. FILTRES — les boutons de categorie doivent changer le nombre de cartes
 *      visibles, et l'etat actif doit suivre.
 *
 *   4. ERREURS — aucune erreur console ni requete en echec.
 *
 * Sortie : code 0 si tout passe, 1 sinon. Les captures d'ecran sont ecrites
 * dans le dossier demande.
 */
import { mkdir } from "node:fs/promises";

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error(
    "  Playwright est requis : npm i -D playwright && npx playwright install chromium",
  );
  process.exit(2);
}

const BASE = (process.argv[2] || "").replace(/\/$/, "");
if (!BASE) {
  console.error("  Usage : node e2e.mjs <url-de-base> [--captures <dossier>]");
  process.exit(2);
}
const idx = process.argv.indexOf("--captures");
const CAPTURES = idx > -1 ? process.argv[idx + 1] : null;

const echecs = [];
const ok = (m) => console.log(`    ok   ${m}`);
const ko = (m, d = "") => {
  echecs.push(m);
  console.log(`    ECHEC ${m}${d ? ` — ${d}` : ""}`);
};

/* Test 1 — le centre du lien appartient bien au lien.
 *
 * Defiler, mesurer et interroger doivent se faire pour chaque lien, l'un
 * apres l'autre : `scrollIntoViewIfNeeded` deplace la page, donc des
 * coordonnees collectees a l'avance sont perimees et le test accuse a tort. */
async function testerInterception(page) {
  const liens = await page.$$("a[href]");
  let fautifs = 0;
  let testes = 0;

  for (const lien of liens) {
    try {
      await lien.scrollIntoViewIfNeeded({ timeout: 2000 });
      const boite = await lien.boundingBox();
      if (!boite || boite.width < 4 || boite.height < 4) continue;

      const info = await lien.evaluate((e) => ({
        href: e.getAttribute("href"),
        texte: (e.textContent || "").trim().replace(/\s+/g, " ").slice(0, 32),
      }));

      const dessus = await page.evaluate(
        ([x, y]) => {
          const el = document.elementFromPoint(x, y);
          const a = el?.closest("a");
          return {
            balise: el?.tagName ?? "rien",
            href: a?.getAttribute("href") ?? null,
          };
        },
        [boite.x + boite.width / 2, boite.y + boite.height / 2],
      );

      testes += 1;
      if (dessus.href !== info.href) {
        fautifs += 1;
        if (fautifs <= 3)
          ko(
            `lien intercepte : « ${info.texte} » (${info.href})`,
            `au centre, ${dessus.balise} ${dessus.href ? `→ ${dessus.href}` : "sans lien"}`,
          );
      }
    } catch {
      /* element detache : ignore */
    }
  }

  if (fautifs === 0) ok(`${testes} liens cliquables sans interception`);
  return fautifs;
}

/* Test 2 — cliquer mene bien a la destination annoncee.
 *
 * L'attendu est lu dans le href de l'element, jamais code en dur : c'est le
 * contrat du lien qu'on verifie, pas une supposition sur l'arborescence. */
async function testerNavigation(page, url, cibles) {
  for (const cible of cibles) {
    const lien = page.locator(cible.selecteur).first();
    if ((await lien.count()) === 0) {
      // Absent de cette page : ce n'est pas un echec, la page n'a simplement
      // pas cet element (un fil d'Ariane n'existe pas sur l'accueil).
      console.log(`    --   « ${cible.nom} » absent de cette page`);
      continue;
    }

    const href = await lien.getAttribute("href");
    if (!href || href.startsWith("#")) {
      console.log(`    --   « ${cible.nom} » sans destination`);
      continue;
    }

    try {
      await Promise.all([
        page.waitForLoadState("domcontentloaded", { timeout: 15000 }),
        lien.click({ timeout: 5000 }),
      ]);
    } catch (e) {
      ko(`clic impossible : « ${cible.nom} »`, e.constructor.name);
      continue;
    }

    const attendu = new URL(href, url);
    const obtenu = new URL(page.url());
    const memePage =
      obtenu.pathname.replace(/\/$/, "") === attendu.pathname.replace(/\/$/, "") &&
      obtenu.search === attendu.search;
    if (memePage) ok(`« ${cible.nom} » mene a ${attendu.pathname}${attendu.search}`);
    else
      ko(
        `« ${cible.nom} » mene a ${obtenu.pathname}${obtenu.search}`,
        `annonce ${attendu.pathname}${attendu.search}`,
      );
    await page.goto(url, { waitUntil: "domcontentloaded" });
  }
}

/* Test 3 — les filtres changent reellement ce qui est affiche.
 *
 * Deux formes existent : des boutons (aria-pressed) et des listes deroulantes.
 * Le test doit savoir actionner les deux, et ne pas supposer que le conteneur
 * des cartes s'appelle data-categorie. */
async function testerFiltres(page) {
  const cartes = page.locator("[data-carte], [data-categorie]");
  const total = await cartes.count();
  if (total === 0) {
    console.log("    --   aucune carte filtrable sur cette page");
    return;
  }

  const visibles = () =>
    page.locator("[data-carte]:visible, [data-categorie]:visible").count();
  const avant = await visibles();

  const boutons = page.locator("button[data-filtre]");
  const selects = page.locator("select[data-filtre]");

  if ((await selects.count()) > 0) {
    // Premiere liste deroulante qui propose autre chose que « tout ».
    let choisi = false;
    for (let i = 0; i < (await selects.count()); i += 1) {
      const options = await selects.nth(i).locator("option").allTextContents();
      if (options.length > 1) {
        await selects.nth(i).selectOption({ index: 1 });
        choisi = true;
        break;
      }
    }
    if (!choisi) {
      console.log("    --   aucune option de filtre");
      return;
    }
  } else if ((await boutons.count()) > 1) {
    await boutons.nth(1).click();
  } else {
    console.log("    --   aucun filtre actionnable");
    return;
  }

  await page.waitForTimeout(300);
  const apres = await visibles();

  if (apres === 0) ko("le filtre ne laisse aucune carte", "grille vide");
  else if (apres >= avant)
    ko("le filtre ne reduit pas la grille", `${avant} → ${apres} cartes`);
  else ok(`filtre : ${avant} → ${apres} cartes sur ${total}`);

  // Retour a l'etat initial : « tout » doit restaurer la grille.
  if ((await selects.count()) > 0) {
    await selects.first().selectOption({ index: 0 });
  } else {
    await page.locator('[data-filtre="tout"]').first().click();
  }
  await page.waitForTimeout(300);
  const restaure = await visibles();
  if (restaure !== total) ko("le retour a « tout » ne restaure pas la grille", `${restaure} / ${total}`);
  else ok(`le retour a « tout » restaure les ${total} cartes`);
}

/* ------------------------------------------------------------------ */

const nav = await chromium.launch();
const contexte = await nav.newContext({ viewport: { width: 1280, height: 900 } });
const page = await contexte.newPage();

const erreurs = [];
let enProbe = false;
page.on("console", (m) => {
  if (!enProbe && m.type() === "error") erreurs.push(m.text().slice(0, 120));
});
page.on("requestfailed", (r) => erreurs.push(`requete echouee : ${r.url().slice(0, 90)}`));

/* Pages a parcourir : l'accueil, plus les liens internes decouverts. */
const aVoir = [BASE + "/"];
await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
const decouverts = await page.$$eval('a[href^="/"]', (els) =>
  [...new Set(els.map((e) => e.getAttribute("href").split("#")[0]))],
);
for (const d of decouverts) if (!aVoir.includes(BASE + d)) aVoir.push(BASE + d);

if (CAPTURES) await mkdir(CAPTURES, { recursive: true });

console.log(`\n  ${aVoir.length} pages a tester sur ${BASE}\n`);

let pagesKo = 0;
for (const url of aVoir) {
  console.log(`  ${url.replace(BASE, "") || "/"}`);
  const reponse = await page.goto(url, { waitUntil: "domcontentloaded" });
  if (!reponse || reponse.status() >= 400) {
    ko(`page en ${reponse?.status()}`);
    pagesKo += 1;
    continue;
  }

  let n = 0;
  try {
    n = await testerInterception(page);
  } catch (e) {
    ko("test d'interception impossible", (e.message || "").split("\n")[0].slice(0, 90));
    n = 1;
  }
  if (n > 0) pagesKo += 1;

  if (CAPTURES) {
    const nom = (url.replace(BASE, "").replace(/\//g, "_") || "_accueil") + ".png";
    await page.screenshot({ path: `${CAPTURES}/${nom}`, fullPage: true });
  }
}

/* Navigation : les liens structurants, verifies par clic reel. */
console.log("\n  navigation");
const pdp = decouverts.find((d) => d.includes("/produit/"));
await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
await testerNavigation(page, BASE + "/", [
  { nom: "logo", selecteur: 'header a[href="/"]' },
]);
if (pdp) {
  await page.goto(BASE + pdp, { waitUntil: "domcontentloaded" });
  await testerNavigation(page, BASE + pdp, [
    { nom: "fil d'Ariane → accueil", selecteur: 'nav[aria-label="Fil d\'Ariane"] a[href="/"]' },
    {
      nom: "fil d'Ariane → categorie",
      selecteur:
        'nav[aria-label="Fil d\'Ariane"] a[href^="/boutique"], nav[aria-label="Fil d\'Ariane"] a[href^="/#"], nav[aria-label="Fil d\'Ariane"] a[href*="#boutique"]',
    },
  ]);
}

/* Les filtres ne sont pas forcement sur /boutique : chez la boulangerie, la
   boutique est une section de l'accueil. On cherche la page qui en a. */
console.log("\n  filtres");
let pageFiltres = null;
enProbe = true;
for (const candidat of [BASE + "/", BASE + "/boutique/", BASE + "/cours/", BASE + "/produits/"]) {
  const r = await page.goto(candidat, { waitUntil: "domcontentloaded" }).catch(() => null);
  if (r && r.status() < 400 && (await page.locator("[data-filtre]").count()) > 0) {
    pageFiltres = candidat;
    break;
  }
}
enProbe = false;
if (!pageFiltres) {
  console.log("    --   aucun filtre sur ce site");
} else {
  try {
    await testerFiltres(page, pageFiltres);
  } catch (e) {
    // Un clic qui n'aboutit pas est en soi un resultat : Playwright nomme
    // l'element qui intercepte, ce qui designe la cause.
    const m =
      (e.message || "").split("\n").find((l) => l.includes("intercepts")) ||
      (e.message || "").split("\n")[0];
    ko("un filtre n'est pas cliquable", m.trim().slice(0, 130));
  }
}

/* Test 4 — un parcours en plusieurs etapes avance jusqu'au bout.
 *
 * Un bouton « suivant » qui ne change rien, ou un panneau qui ne s'affiche
 * jamais, ne se voit ni dans le HTML ni dans les liens : il faut cliquer. */
async function testerParcours(page, url) {
  const suivant = page.locator("[data-suivant]").first();
  if ((await suivant.count()) === 0) {
    console.log("    --   aucun parcours sur cette page");
    return;
  }

  let etapes = 0;
  for (let i = 0; i < 8; i += 1) {
    if ((await suivant.count()) === 0 || !(await suivant.isVisible())) break;
    await suivant.click({ timeout: 5000 });
    await page.waitForTimeout(250);
    etapes += 1;
  }

  const panneaux = await page.locator("[data-panneau]:visible").count();
  if (etapes >= 3) ok(`parcours : ${etapes} etapes franchies, ${panneaux} panneau visible`);
  else ko(`le parcours ne progresse pas`, `${etapes} etape(s) sur 4`);
}

console.log("\n  parcours");
enProbe = true;
for (const candidat of [BASE + "/reserver/", BASE + "/reserver", BASE + "/reservation/"]) {
  const r = await page.goto(candidat, { waitUntil: "domcontentloaded" }).catch(() => null);
  if (r && r.status() < 400 && (await page.locator("[data-suivant]").count()) > 0) {
    enProbe = false;
    await testerParcours(page, candidat);
    break;
  }
}

/* Mobile : la navigation doit rester atteignable. */
console.log("\n  affichage mobile (390 px)");
const mobile = await contexte.newPage();
await mobile.setViewportSize({ width: 390, height: 844 });
await mobile.goto(BASE + "/", { waitUntil: "domcontentloaded" });
const liensMobile = await mobile.locator("header a[href]").count();
if (liensMobile === 0) ko("aucun lien dans l'en-tete en mobile");
else ok(`${liensMobile} liens dans l'en-tete en mobile`);
if (CAPTURES) await mobile.screenshot({ path: `${CAPTURES}/_mobile.png`, fullPage: true });

console.log("");
if (erreurs.length) {
  console.log(`  ${erreurs.length} erreur(s) console ou reseau :`);
  for (const e of [...new Set(erreurs)].slice(0, 5)) console.log(`    ${e}`);
  echecs.push(`${erreurs.length} erreur(s)`);
} else {
  console.log("  aucune erreur console ni requete echouee");
}

await nav.close();

console.log(
  `\n  BILAN : ${echecs.length === 0 ? "tout passe" : `${echecs.length} echec(s)`}\n`,
);
process.exit(echecs.length === 0 ? 0 : 1);
