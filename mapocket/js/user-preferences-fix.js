// Fichier correctif pour harmoniser les références aux préférences utilisateur
// Ce fichier doit être inclus AVANT tout autre script qui utilise userPreferences

// Création d'un objet global qui sera accessible par tous les scripts
window.userPreferences = window.userPreferences || {
    theme: 'light',
    fontSize: 'normal',
    language: 'fr',
    dateFormat: 'DD/MM/YYYY',
    currency: 'EUR',
    secondaryCurrency: 'USD',
    plan: 'freemium'
};

// Chargement des préférences depuis le localStorage au démarrage
(function() {
    try {
        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
            // Fusionner avec les valeurs par défaut pour assurer la compatibilité
            const parsedPrefs = JSON.parse(savedPrefs);
            window.userPreferences = { ...window.userPreferences, ...parsedPrefs };
            console.log('Préférences utilisateur chargées depuis le correctif');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des préférences utilisateur:', error);
    }
})();