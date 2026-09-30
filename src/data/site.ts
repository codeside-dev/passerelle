/* Textes d'ossature : navigation et pied de page, releves dans le .pen. */

export const marque = { nom: "Passerelle", initiale: "P" };

/* Les destinations existent toutes. « Tarifs » n'a pas de page dans la
   maquette : l'entree est rendue en texte plutot qu'en lien sans cible. */
export const navigation = [
  { libelle: "Cours", lien: "/cours", cle: "cours" },
  { libelle: "Professeurs", lien: "/cours#professeurs", cle: "professeurs" },
  { libelle: "Tarifs", lien: null, cle: "tarifs" },
  { libelle: "Comment ça marche", lien: "/#comment", cle: "comment" },
];

export const pied = {
  baseline:
    "Soutien scolaire en visioconférence, du collège au lycée. Professeurs vérifiés, sans abonnement.",
  colonnes: [
    {
      titre: "Cours",
      liens: [
        { libelle: "Mathématiques", lien: "/cours#professeurs" },
        { libelle: "Physique-Chimie", lien: "/cours#professeurs" },
        { libelle: "Français", lien: "/cours#professeurs" },
        { libelle: "Anglais", lien: "/cours#professeurs" },
      ],
    },
    {
      titre: "Passerelle",
      liens: [
        { libelle: "Devenir professeur", lien: null },
        { libelle: "Tarifs", lien: null },
        { libelle: "Aide", lien: null },
      ],
    },
    {
      titre: "Légal",
      liens: [
        { libelle: "Conditions", lien: null },
        { libelle: "Confidentialité", lien: null },
        { libelle: "Cookies", lien: null },
      ],
    },
  ],
  copyright:
    "© 2026 Passerelle — Maquette de démonstration, réservation simulée, aucun paiement réel.",
};
