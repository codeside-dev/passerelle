/*
 * Donnees des deux espaces de demonstration.
 *
 * Ce sont des exemples : aucun compte, aucune donnee reelle. L'ossature de
 * chaque page vient d'ici, le contenu propre a chaque ecran reste dans la page.
 */

export interface Utilisateur {
  nom: string;
  initiales: string;
  role: string;
}

export interface Entree {
  cle: string;
  libelle: string;
  lien: string;
}

export interface Espace {
  cle: "eleve" | "prof";
  nom: string;
  utilisateur: Utilisateur;
  navigation: Entree[];
}

export const espaces: Record<"eleve" | "prof", Espace> = {
  eleve: {
    cle: "eleve",
    nom: "Espace élève",
    utilisateur: { nom: "Adam T.", initiales: "AT", role: "Élève de Première" },
    navigation: [
      { cle: "tableau-de-bord", libelle: "Tableau de bord", lien: "/espace-eleve/" },
      { cle: "reservations", libelle: "Mes réservations", lien: "/espace-eleve/reservations/" },
      { cle: "ressources", libelle: "Ressources", lien: "/espace-eleve/ressources/" },
      { cle: "messagerie", libelle: "Messagerie", lien: "/espace-eleve/messagerie/" },
      { cle: "profil", libelle: "Profil", lien: "/espace-eleve/profil/" },
    ],
  },
  prof: {
    cle: "prof",
    nom: "Espace professeur",
    utilisateur: { nom: "Claire Fontaine", initiales: "CF", role: "Professeure" },
    navigation: [
      { cle: "tableau-de-bord", libelle: "Tableau de bord", lien: "/espace-prof/" },
      { cle: "reservations", libelle: "Réservations", lien: "/espace-prof/reservations/" },
      { cle: "eleves", libelle: "Mes élèves", lien: "/espace-prof/eleves/" },
      { cle: "cours", libelle: "Mes cours", lien: "/espace-prof/cours/" },
      { cle: "ressources", libelle: "Ressources", lien: "/espace-prof/ressources/" },
      { cle: "messagerie", libelle: "Messagerie", lien: "/espace-prof/messagerie/" },
      { cle: "profil", libelle: "Profil", lien: "/espace-prof/profil/" },
    ],
  },
};

/** L'autre espace, pour passer de l'un a l'autre dans la demonstration. */
export const autreEspace = (cle: "eleve" | "prof") =>
  cle === "eleve" ? espaces.prof : espaces.eleve;

/** Pastille a initiales, reprise partout dans les deux espaces. */
export const personnes = {
  AT: "Adam T.",
  LM: "Léa M.",
  NB: "Nour B.",
  HP: "Hugo P.",
  IK: "Inès K.",
  MD: "Marc D.",
  CF: "Claire Fontaine",
  YB: "Yanis Belkacem",
  SR: "Sofia Renard",
  IB: "Inès Bakri",
};
