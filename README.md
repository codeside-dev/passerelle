# Passerelle — vitrine

Site vitrine de **Passerelle**, plateforme de soutien scolaire : des professeurs
vérifiés proposent des cours particuliers payants, du collège au lycée, toutes
matières, réservables en ligne.

Traduit de la maquette pen.dev `passerelle`.

> **Vitrine.** Le parcours de réservation est **simulé** : la page `/reserver`
> déroule les quatre étapes côté navigateur, sans rien enregistrer et sans
> paiement. Les textes le disent, et le pied de page aussi.

## Stack

- [Astro](https://astro.build) 5, en sortie statique
- [Tailwind CSS](https://tailwindcss.com) v4, via `@tailwindcss/vite`

Le contenu vit dans un module de données (`src/data/`) : c'est le mode vitrine —
il n'y a ni CMS, ni base de données.

## Pages

| Route | Contenu |
| --- | --- |
| `/` | accueil : héros, preuve chiffrée, matières, trois étapes, professeurs, confiance, témoignages, appel à l'action |
| `/cours` | tous les cours, avec recherche et filtres fonctionnels (matière, niveau, prix) |
| `/cours/<slug>/` | fiche d'un cours : professeur, tarif, contenu travaillé, disponibilités |
| `/reserver` | parcours de réservation simulé en quatre étapes |

## Le parcours de réservation

Quatre étapes, entièrement côté navigateur : créneau, coordonnées,
récapitulatif, confirmation. L'état actif des créneaux est porté par
`aria-pressed`, et le récapitulatif se remplit à mesure.

**Rien n'est transmis ni conservé.** Un vrai parcours demanderait une base de
données, des comptes et un prestataire de paiement — c'est un autre projet.

## Commandes

```bash
pnpm install
pnpm dev                           # developpement
pnpm build                         # construction dans dist/
node qa/verifier_site.mjs dist     # controle du site construit
```

## Contenu rédigé, à relire

La maquette ne fournit le détail complet que du cours **« Fonctions et
dérivées : reprendre les bases. »** Pour les cinq autres, elle n'affiche que le
nom du professeur, la matière, le niveau, la note, le nombre d'avis et le
tarif. **Titres et descriptifs des cinq autres cours sont donc rédigés** — à
corriger ou compléter.

Les **deux témoignages** (Hélène M., Adam T.) sont inventés, comme les chiffres
du bandeau de preuve (1 200 professeurs, 38 000 cours, 4,9/5, 92 %).

## Aucun portrait de professeur

La maquette plaçait des photos de personnes sur les cartes de professeurs.
**Elles ont été remplacées par des monogrammes**, pour deux raisons :

1. l'un des portraits était une **image générée par IA** — une personne qui
   n'existe pas, sur une plateforme dont l'argument est « des professeurs
   vérifiés » ;
2. la recherche d'images libres n'a donné aucun visage crédible pour un
   enseignant : elle a proposé des militaires, un intérieur d'église et des
   **enfants** — que présenter comme professeurs aurait été inacceptable.

Des monogrammes valent mieux que de fausses personnes. La maquette emploie déjà
des pastilles à lettres pour les matières : le traitement reste cohérent.

## Photos

| Fichier | Licence | Auteur | Titre |
| --- | --- | --- | --- |
| `heros.jpg` | CC BY-SA 2.0 | EU-Ukraine cooperation | Допомога університетам |
| `fiche.jpg` | CC BY 2.0 | BryanAlexander | doing math at Stony Brook |
| `labo.jpg` | CC BY 2.0 | U.S. Army Combat Capabilities | RDECOM Scientist and Engineers |
| `geometrie.jpg` | CC0 1.0 | — | Mathematical compass, geometry drawing tool |
| `livre.jpg` | CC0 1.0 | freestocks.org | Open book |

**Quatre photos sur cinq exigent l'attribution** (CC BY et CC BY-SA). Le détail
complet est dans [`src/assets/CREDITS.json`](src/assets/CREDITS.json).

## Licence

MIT — voir [`LICENSE`](LICENSE). Elle couvre le code, les composants, les
styles et le texte, **à l'exclusion des photographies**, qui restent sous leurs
licences respectives.
