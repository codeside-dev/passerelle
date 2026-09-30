import type { ImageMetadata } from "astro:assets";
import fiche from "../assets/fiche.jpg";
import labo from "../assets/labo.jpg";
import geometrie from "../assets/geometrie.jpg";
import livre from "../assets/livre.jpg";

export interface Cours {
  slug: string;
  titre: string;
  matiere: string;
  matiereSlug: string;
  niveau: string;
  niveauSlug: "college" | "lycee";
  professeur: string;
  note: string;
  avis: number;
  repond: string;
  tarif: number;
  resume: string;
  description: string;
  objectifs: string[];
  creneaux: string[];
  photo: ImageMetadata;
}

/*
 * Six cours, un par professeur. Le premier — « Fonctions et dérivées » — est
 * celui de la maquette : titre, description, objectifs, créneaux et photo en
 * viennent tels quels. Les cinq autres n'affichent dans la maquette que le nom
 * du professeur, la matière, le niveau, la note et le tarif : leurs titres et
 * descriptifs sont donc rédigés, et signalés comme tels dans le README.
 */
export const cours: Cours[] = [
  {
    slug: "fonctions-et-derivees",
    titre: "Fonctions et dérivées : reprendre les bases.",
    matiere: "Mathématiques",
    matiereSlug: "mathematiques",
    niveau: "Seconde",
    niveauSlug: "lycee",
    professeur: "Claire Fontaine",
    note: "4,9",
    avis: 128,
    repond: "répond en 2 h",
    tarif: 32,
    resume: "Mathématiques · Seconde",
    description:
      "Claire reprend le programme de Seconde depuis le début : lecture graphique, dérivation, puis les exercices type bac. Chaque séance finit par un point écrit sur ce qui est acquis et ce qui reste fragile.",
    objectifs: [
      "Lecture graphique et tableaux de variation",
      "Dérivation : formules et sens de variation",
      "Résolution d'équations et d'inéquations",
      "Rédiger une copie : justifier sans réciter",
    ],
    creneaux: ["Mardi 18h", "Mercredi 14h", "Jeudi 19h", "Samedi 10h", "Dimanche 11h"],
    photo: fiche,
  },
  {
    slug: "ondes-et-signaux",
    titre: "Ondes et signaux : préparer le bac",
    matiere: "Physique-Chimie",
    matiereSlug: "physique-chimie",
    niveau: "Terminale",
    niveauSlug: "lycee",
    professeur: "Yanis Belkacem",
    note: "5,0",
    avis: 94,
    repond: "répond en 3 h",
    tarif: 38,
    resume: "Physique-Chimie · Terminale",
    description:
      "Yanis attaque les ondes et les signaux par les exercices du bac : lecture d'énoncé, schéma, calcul, puis rédaction. Les formules viennent après le raisonnement, jamais avant.",
    objectifs: [
      "Ondes mécaniques et propagation",
      "Lentilles et formation des images",
      "Signaux et capteurs électriques",
      "Rédiger un exercice de bac sans perdre de points",
    ],
    creneaux: ["Lundi 18h", "Mercredi 17h", "Vendredi 19h", "Samedi 11h"],
    photo: labo,
  },
  {
    slug: "dissertation-construire-un-plan",
    titre: "Dissertation : construire un plan",
    matiere: "Français",
    matiereSlug: "francais",
    niveau: "Première",
    niveauSlug: "lycee",
    professeur: "Sofia Renard",
    note: "4,8",
    avis: 156,
    repond: "répond en 1 h",
    tarif: 30,
    resume: "Français · Première",
    description:
      "Sofia travaille la méthode avant le style : analyser le sujet, dégager une problématique, bâtir un plan qui tient debout. Les textes ne viennent qu'ensuite, pour nourrir une démonstration.",
    objectifs: [
      "Analyser un sujet et dégager une problématique",
      "Construire un plan en deux ou trois parties",
      "Mobiliser les œuvres au bon moment",
      "Soigner l'introduction et la conclusion",
    ],
    creneaux: ["Mardi 17h", "Jeudi 18h", "Samedi 9h", "Dimanche 10h"],
    photo: livre,
  },
  {
    slug: "suites-et-probabilites",
    titre: "Suites et probabilités, niveau Première",
    matiere: "Mathématiques",
    matiereSlug: "mathematiques",
    niveau: "Première",
    niveauSlug: "lycee",
    professeur: "Marc Delaunay",
    note: "4,9",
    avis: 211,
    repond: "répond en 4 h",
    tarif: 42,
    resume: "Mathématiques · Première",
    description:
      "Marc reprend les suites et les probabilités par le calcul, pas par le cours appris par cœur. Chaque notion est suivie d'exercices progressifs, du plus guidé au plus ouvert.",
    objectifs: [
      "Suites arithmétiques et géométriques",
      "Sens de variation et limites",
      "Probabilités conditionnelles",
      "Arbres de probabilités et tableaux croisés",
    ],
    creneaux: ["Lundi 19h", "Mercredi 18h", "Vendredi 17h", "Samedi 14h"],
    photo: geometrie,
  },
  {
    slug: "anglais-a-l-oral",
    titre: "Anglais à l'oral : gagner en aisance",
    matiere: "Anglais",
    matiereSlug: "anglais",
    niveau: "Collège et Lycée",
    niveauSlug: "college",
    professeur: "Inès Bouraoui",
    note: "5,0",
    avis: 87,
    repond: "répond en 2 h",
    tarif: 29,
    resume: "Anglais · Collège et Lycée",
    description:
      "Inès fait parler dès la première minute. On travaille la prononciation, les tournures utiles et la capacité à rebondir quand le mot manque — ce qui compte le jour de l'oral.",
    objectifs: [
      "Prononciation et rythme de la phrase",
      "Vocabulaire utile pour argumenter",
      "Comprendre une question et y répondre",
      "Tenir cinq minutes sans notes",
    ],
    creneaux: ["Mardi 18h", "Jeudi 17h", "Samedi 10h"],
    photo: livre,
  },
  {
    slug: "methode-de-la-composition",
    titre: "Méthode de la composition en histoire",
    matiere: "Histoire-Géo",
    matiereSlug: "histoire-geo",
    niveau: "Seconde et Première",
    niveauSlug: "lycee",
    professeur: "Thomas Girard",
    note: "4,7",
    avis: 63,
    repond: "répond en 5 h",
    tarif: 27,
    resume: "Histoire-Géo · Seconde et Première",
    description:
      "Thomas part des sujets tombés les années précédentes pour montrer ce qu'on attend vraiment : un plan qui répond, des exemples datés, et une conclusion qui tranche.",
    objectifs: [
      "Décortiquer un sujet et ses bornes",
      "Bâtir un plan qui répond à la question",
      "Mobiliser des exemples précis et datés",
      "Gérer le temps de l'épreuve",
    ],
    creneaux: ["Lundi 17h", "Mercredi 19h", "Samedi 15h"],
    photo: livre,
  },
];

export const filieres = [
  { slug: "tout", label: "Toutes" },
  { slug: "mathematiques", label: "Mathématiques" },
  { slug: "physique-chimie", label: "Physique-Chimie" },
  { slug: "francais", label: "Français" },
  { slug: "anglais", label: "Anglais" },
  { slug: "histoire-geo", label: "Histoire-Géo" },
];

export const niveaux = [
  { slug: "tout", label: "Tous" },
  { slug: "college", label: "Collège" },
  { slug: "lycee", label: "Lycée" },
];

export const coursParSlug = (slug: string) => cours.find((c) => c.slug === slug);

/* Les trois cours proposés en bas d'une fiche : les autres, dans l'ordre. */
export const coursSimilaires = (slug: string) => cours.filter((c) => c.slug !== slug).slice(0, 3);
