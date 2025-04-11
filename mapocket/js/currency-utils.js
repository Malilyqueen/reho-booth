// Utilitaire pour la gestion des devises dans l'application
// Cette fonction centralisée permet d'obtenir le symbole de devise actuel
function getCurrencySymbol() {
    // Essayer d'abord d'obtenir le symbole du projet courant
    if (window.currentProject && window.currentProject.currencySymbol) {
        return window.currentProject.currencySymbol;
    }
    
    // Puis essayer d'obtenir à partir des préférences utilisateur
    try {
        const userPrefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        if (userPrefs.currency) {
            // Si AVAILABLE_CURRENCIES est défini (depuis currencies.js)
            if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
                const currency = AVAILABLE_CURRENCIES.find(c => c.code === userPrefs.currency);
                if (currency) {
                    return currency.symbol;
                }
            }
            
            // Fallback pour les devises courantes
            if (userPrefs.currency === 'EUR') return 'AED';
            if (userPrefs.currency === 'USD') return '$';
            if (userPrefs.currency === 'GBP') return '£';
            if (userPrefs.currency === 'MAD') return 'DH';
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du symbole de devise:', error);
    }
    
    // Valeur par défaut en cas d'échec
    return 'AED';
}

// Fonction pour formater un montant avec le symbole de devise
function formatMoney(amount) {
    return `${getCurrencySymbol()} ${parseFloat(amount).toFixed(2)}`;
}

// Fonction pour extraire un montant numérique à partir d'une chaîne avec symbole de devise
function parseMonetaryValue(value) {
    if (!value) return 0;
    if (typeof value !== 'string') {
        if (typeof value === 'number') return value;
        return 0;
    }
    
    // Nettoyer la chaîne et extraire le nombre
    return parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
}