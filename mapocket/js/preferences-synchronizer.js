/**
 * Synchroniseur de préférences utilisateur - résout les conflits entre userPreferences et window.userPrefs
 * Ce script doit être inclus après preferences-manager.js et avant main.js
 */

// Fonction d'initialisation immédiatement exécutée
(function() {
    console.log("Synchroniseur de préférences chargé");

    // Créer un objet global userPreferences qui reflète window.userPrefs
    Object.defineProperty(window, 'userPreferences', {
        get: function() {
            return window.userPrefs;
        },
        set: function(newPrefs) {
            // Mettre à jour window.userPrefs avec les nouvelles valeurs
            if (typeof newPrefs === 'object') {
                Object.assign(window.userPrefs, newPrefs);
                
                // Sauvegarder les préférences dans localStorage
                try {
                    localStorage.setItem('userPreferences', JSON.stringify(window.userPrefs));
                    console.log("Préférences utilisateur mises à jour et sauvegardées");
                } catch (error) {
                    console.error("Erreur lors de la sauvegarde des préférences:", error);
                }
            }
            return window.userPrefs;
        },
        enumerable: true,
        configurable: false
    });
    
    // Charger les préférences depuis localStorage si pas déjà fait
    try {
        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
            const parsedPrefs = JSON.parse(savedPrefs);
            Object.assign(window.userPrefs, parsedPrefs);
            console.log("Préférences utilisateur chargées par le synchroniseur");
        }
    } catch (error) {
        console.error("Erreur lors du chargement des préférences:", error);
    }
    
    // Définir une fonction utilitaire pour obtenir le symbole de devise
    window.getCurrencySymbol = function(currencyCode) {
        // Si AVAILABLE_CURRENCIES est défini (depuis currencies.js), utiliser le symbole correspondant
        if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
            const currency = AVAILABLE_CURRENCIES.find(c => c.code === currencyCode);
            if (currency) {
                return currency.symbol;
            }
        }
        
        // Fallback - utiliser des symboles classiques
        switch (currencyCode) {
            case 'USD': return '$';
            case 'EUR': return '€';
            case 'GBP': return '£';
            case 'JPY': return '¥';
            case 'CNY': return '¥';
            case 'MGA': return 'Ar';
            case 'THB': return '฿';
            default: return currencyCode;
        }
    };
})();