// Correctif pour les problèmes de variables userPreferences
// Ce script doit être inclus AVANT main.js

// Définir l'objet global window.userPreferences
window.userPreferences = {
    theme: 'light',
    fontSize: 'medium',
    language: 'fr',
    dateFormat: 'DD/MM/YYYY',
    currency: 'EUR',
    secondaryCurrency: 'USD',
    plan: 'freemium'
};

// Charger les préférences depuis localStorage
try {
    const savedPrefs = localStorage.getItem('userPreferences');
    if (savedPrefs) {
        const parsedPrefs = JSON.parse(savedPrefs);
        // Mettre à jour l'objet global avec les préférences sauvegardées
        Object.assign(window.userPreferences, parsedPrefs);
    }
} catch (error) {
    console.error('Erreur lors du chargement des préférences utilisateur:', error);
}

// Fonctions utilitaires globales pour manipuler les préférences
window.getUserPreference = function(key, defaultValue) {
    return window.userPreferences[key] !== undefined ? window.userPreferences[key] : defaultValue;
};

window.setUserPreference = function(key, value) {
    window.userPreferences[key] = value;
    localStorage.setItem('userPreferences', JSON.stringify(window.userPreferences));
    return value;
};

// Fonction pour mettre à jour toutes les préférences
window.updateAllUserPreferences = function(newPrefs) {
    Object.assign(window.userPreferences, newPrefs);
    localStorage.setItem('userPreferences', JSON.stringify(window.userPreferences));
    return window.userPreferences;
};

// Fonction pour obtenir le symbole de devise
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
        case 'EUR': return 'AED';
        case 'GBP': return '£';
        case 'JPY': return '¥';
        case 'CNY': return '¥';
        case 'MGA': return 'Ar';
        case 'THB': return '฿';
        default: return currencyCode;
    }
};

// Empêcher la redéclaration de userPreferences dans main.js
// Cette technique utilise un Object.defineProperty pour modifier 
// le comportement de déclaration de variables dans l'espace global
(function() {
    const originalDefineProperty = Object.defineProperty;
    
    Object.defineProperty = function(obj, prop, descriptor) {
        // Si quelqu'un essaie de déclarer userPreferences, ignorer
        if (obj === window && prop === 'userPreferences') {
            console.log("Tentative de redéclaration de userPreferences bloquée");
            return obj;
        }
        
        // Sinon, comportement normal
        return originalDefineProperty.apply(this, arguments);
    };
    
    // Empêcher également la déclaration via let/const
    const originalEval = window.eval;
    window.eval = function(code) {
        // Remplacer les déclarations let/const userPreferences
        const modifiedCode = code
            .replace(/let\s+userPreferences\s*=/, 'window.tempVarToAvoidError =')
            .replace(/const\s+userPreferences\s*=/, 'window.tempVarToAvoidError =');
        
        return originalEval(modifiedCode);
    };
})();

console.log("Correction pour userPreferences chargée avec succès");