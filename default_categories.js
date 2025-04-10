// Définition des catégories par défaut pour chaque type de projet
// Seules les catégories principales sont définies, sans sous-catégories ni lignes
const DEFAULT_CATEGORIES = {
    "Mariage": [
        { name: "Lieu de réception", subcategories: [] },
        { name: "Traiteur", subcategories: [] },
        { name: "Tenues", subcategories: [] },
        { name: "Décoration", subcategories: [] },
        { name: "Animation", subcategories: [] },
        { name: "Photo & Vidéo", subcategories: [] },
        { name: "Transport", subcategories: [] },
        { name: "Divers", subcategories: [] }
    ],
    "Anniversaire": [
        { name: "Lieu", subcategories: [] },
        { name: "Nourriture", subcategories: [] },
        { name: "Boissons", subcategories: [] },
        { name: "Décoration", subcategories: [] },
        { name: "Animation", subcategories: [] },
        { name: "Cadeaux", subcategories: [] }
    ],
    "Vacances": [
        { name: "Transport", subcategories: [] },
        { name: "Hébergement", subcategories: [] },
        { name: "Nourriture", subcategories: [] },
        { name: "Activités", subcategories: [] },
        { name: "Shopping", subcategories: [] },
        { name: "Assurances", subcategories: [] }
    ],
    "Rénovation": [
        { name: "Matériaux", subcategories: [] },
        { name: "Main d'œuvre", subcategories: [] },
        { name: "Outils", subcategories: [] },
        { name: "Décoration", subcategories: [] },
        { name: "Équipements", subcategories: [] },
        { name: "Permis & Documents", subcategories: [] }
    ],
    "Études": [
        { name: "Frais de scolarité", subcategories: [] },
        { name: "Livres & Fournitures", subcategories: [] },
        { name: "Logement", subcategories: [] },
        { name: "Transport", subcategories: [] },
        { name: "Nourriture", subcategories: [] },
        { name: "Loisirs", subcategories: [] }
    ],
    "Déménagement": [
        { name: "Location véhicule", subcategories: [] },
        { name: "Déménageurs", subcategories: [] },
        { name: "Cartons & Emballages", subcategories: [] },
        { name: "Frais administratifs", subcategories: [] },
        { name: "Nouveaux achats", subcategories: [] },
        { name: "Équipements", subcategories: [] }
    ],
    "Naissance": [
        { name: "Chambre bébé", subcategories: [] },
        { name: "Vêtements", subcategories: [] },
        { name: "Équipements", subcategories: [] },
        { name: "Puériculture", subcategories: [] },
        { name: "Soins médicaux", subcategories: [] },
        { name: "Divers", subcategories: [] }
    ],
    "Campagne marketing": [
        { name: "Conception", subcategories: [] },
        { name: "Médias sociaux", subcategories: [] },
        { name: "Publicité en ligne", subcategories: [] },
        { name: "Imprimés", subcategories: [] },
        { name: "Évènements", subcategories: [] },
        { name: "Analyse & Suivi", subcategories: [] }
    ],
    "Démarrage entreprise": [
        { name: "Frais juridiques", subcategories: [] },
        { name: "Équipement", subcategories: [] },
        { name: "Marketing", subcategories: [] },
        { name: "Locaux", subcategories: [] },
        { name: "Personnel", subcategories: [] },
        { name: "Stock initial", subcategories: [] }
    ]
};