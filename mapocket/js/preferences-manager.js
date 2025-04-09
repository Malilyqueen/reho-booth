/**
 * Gestionnaire centralisé des préférences utilisateur
 * Ce fichier fournit des fonctions pour gérer les préférences utilisateur de manière cohérente
 * à travers toute l'application MaPocket.
 */

// Préférences utilisateur par défaut
const defaultPreferences = {
    theme: 'light',
    fontSize: 'medium',
    language: 'fr',
    dateFormat: 'DD/MM/YYYY',
    currency: 'EUR',
    secondaryCurrency: 'USD',
    plan: 'freemium'
};

// Préférences utilisateur actuelles
let userPrefs = { ...defaultPreferences };

/**
 * Charge les préférences utilisateur depuis le localStorage
 */
function loadPreferences() {
    try {
        const savedPreferences = localStorage.getItem('userPreferences');
        if (savedPreferences) {
            userPrefs = { ...defaultPreferences, ...JSON.parse(savedPreferences) };
            console.log('Préférences utilisateur chargées:', userPrefs);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des préférences:', error);
    }
}

/**
 * Sauvegarde les préférences utilisateur dans le localStorage
 */
function savePreferences() {
    try {
        localStorage.setItem('userPreferences', JSON.stringify(userPrefs));
        console.log('Préférences utilisateur sauvegardées:', userPrefs);
        
        // Déclencher un événement pour informer les autres parties de l'application
        const event = new CustomEvent('userPreferencesChanged', { 
            detail: { preferences: userPrefs } 
        });
        document.dispatchEvent(event);
        
        return true;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des préférences:', error);
        return false;
    }
}

/**
 * Met à jour une préférence utilisateur spécifique
 * @param {string} key - La clé de la préférence à mettre à jour
 * @param {any} value - La nouvelle valeur
 * @returns {boolean} - Succès ou échec de la mise à jour
 */
function updatePreference(key, value) {
    if (userPrefs.hasOwnProperty(key)) {
        userPrefs[key] = value;
        return savePreferences();
    }
    return false;
}

// Appliquer le thème actuel
function applyTheme() {
    const isDarkMode = userPrefs.theme === 'dark';
    
    // Appliquer à l'élément body
    document.body.classList.toggle('dark-mode', isDarkMode);
    
    // Mettre à jour les éléments d'interface si nécessaire
    const themeSwitch = document.getElementById('themeSwitch');
    if (themeSwitch) {
        themeSwitch.checked = isDarkMode;
    }
    
    // Mettre à jour les radio buttons si présents
    const lightThemeRadio = document.getElementById('light-theme');
    const darkThemeRadio = document.getElementById('dark-theme');
    
    if (lightThemeRadio && darkThemeRadio) {
        lightThemeRadio.checked = !isDarkMode;
        darkThemeRadio.checked = isDarkMode;
    }
    
    // Mettre à jour les prévisualisations de thèmes si elles existent
    const lightThemePreview = document.querySelector('.theme-preview.light-theme');
    const darkThemePreview = document.querySelector('.theme-preview.dark-theme');
    
    if (lightThemePreview && darkThemePreview) {
        lightThemePreview.classList.toggle('active', !isDarkMode);
        darkThemePreview.classList.toggle('active', isDarkMode);
    }
    
    // Mettre à jour les menus (s'assurer qu'ils restent visibles en mode sombre)
    const menuItems = document.querySelectorAll('.main-nav .nav-item');
    menuItems.forEach(item => {
        if (isDarkMode) {
            item.classList.add('dark-nav-item');
        } else {
            item.classList.remove('dark-nav-item');
        }
    });
    
    console.log('Theme applied:', isDarkMode ? 'dark' : 'light');
}

// Appliquer la taille de police
function applyFontSize() {
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add('font-' + userPrefs.fontSize);
}

// Fonction simple de traduction
function translateElement(element, dictionary) {
    if (element && element.textContent) {
        const text = element.textContent.trim();
        if (dictionary[text]) {
            element.textContent = dictionary[text];
        }
    }
}

// Appliquer la langue actuelle
function applyLanguage() {
    const lang = userPrefs.language;
    document.documentElement.lang = lang;
    
    // Mettre à jour les radio buttons si présents
    const langRadios = document.querySelectorAll('input[name="language"]');
    if (langRadios.length > 0) {
        langRadios.forEach(radio => {
            radio.checked = radio.value === lang;
        });
    }
    
    // Dictionnaire de traduction simplifiée (à développer selon les besoins)
    const frToEn = {
        // Navigation
        'Tableau de bord': 'Dashboard',
        'Mes Projets': 'My Projects',
        'Mon Portefeuille': 'My Wallet',
        'Paramètres': 'Settings',
        'Objectifs & Défis': 'Goals & Challenges',
        'Liste de souhaits': 'Wishlist',
        'Suggestions IA': 'AI Suggestions',
        'Produits Partenaires': 'Partner Products',
        'Outils Pro': 'Pro Tools',
        'Assistant Projet': 'Project Assistant',
        
        // Onglets Paramètres
        'Apparence': 'Appearance',
        'Profil': 'Profile',
        'Abonnement': 'Subscription',
        'Utilisateurs': 'Users',
        'Notifications': 'Notifications',
        'Sécurité': 'Security',
        
        // Paramètres d'apparence
        'Thème': 'Theme',
        'Mode d\'affichage': 'Display mode',
        'Clair': 'Light',
        'Sombre': 'Dark',
        'Taille du texte': 'Text size',
        'Taille de police': 'Font size',
        'Langue et région': 'Language and region',
        'Langue': 'Language',
        'Format de date': 'Date format',
        'Devise': 'Currency',
        'Devise principale': 'Primary currency',
        'Devise d\'affichage secondaire': 'Secondary display currency',
        'Aperçu': 'Preview'
    };
    
    const enToFr = {};
    // Générer le dictionnaire inverse
    for (const [fr, en] of Object.entries(frToEn)) {
        enToFr[en] = fr;
    }
    
    // Fonction simplifiée de traduction
    const dictionary = lang === 'en' ? frToEn : enToFr;
    const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, button, a, label');
    
    elements.forEach(element => {
        translateElement(element, dictionary);
    });
    
    console.log('Language applied:', lang);
}

// Appliquer la devise
function applyCurrency() {
    // Mettre à jour les sélecteurs de devise si présents
    const primarySelect = document.getElementById('primaryCurrency');
    if (primarySelect) {
        primarySelect.value = userPrefs.currency;
    }
    
    const secondarySelect = document.getElementById('secondaryCurrency');
    if (secondarySelect) {
        secondarySelect.value = userPrefs.secondaryCurrency;
    }
    
    // Mettre à jour les icônes de devise
    const currencyIcons = document.querySelectorAll('.budget-currency-icon');
    currencyIcons.forEach(icon => {
        icon.classList.remove('fa-euro-sign', 'fa-dollar-sign', 'fa-pound-sign');
        
        switch(userPrefs.currency) {
            case 'USD':
                icon.classList.add('fa-dollar-sign');
                break;
            case 'GBP':
                icon.classList.add('fa-pound-sign');
                break;
            default:
                icon.classList.add('fa-euro-sign'); // EUR par défaut
        }
    });
    
    // Mettre à jour les affichages de montants
    const amountElements = document.querySelectorAll('.amount, .budget-amount');
    amountElements.forEach(element => {
        if (element.textContent) {
            // Extraire le montant numérique
            const numericMatch = element.textContent.match(/[\d\s,.]+/);
            if (numericMatch) {
                const numericPart = numericMatch[0].trim();
                const symbol = getCurrencySymbol(userPrefs.currency);
                element.textContent = `${symbol} ${numericPart}`;
            }
        }
    });
}

// Obtenir le symbole de devise
function getCurrencySymbol(currency) {
    const symbols = {
        'EUR': '€',
        'USD': '$',
        'GBP': '£',
        'JPY': '¥',
        'CHF': 'Fr',
        'CAD': 'C$',
        'AUD': 'A$',
        'CNY': '¥',
        'INR': '₹',
        'RUB': '₽',
        'BRL': 'R$',
        'KRW': '₩',
        'TRY': '₺',
        'MXN': 'Mex$',
        'IDR': 'Rp',
        'PHP': '₱',
        'MYR': 'RM',
        'SGD': 'S$',
        'THB': '฿',
        'AED': 'د.إ',
        'MAD': 'DH',    // Dirham marocain
        'DZD': 'DA',    // Dinar algérien
        'TND': 'DT',    // Dinar tunisien
        'XOF': 'FCFA',  // Franc CFA BCEAO (Afrique de l'Ouest)
        'XAF': 'FCFA',  // Franc CFA BEAC (Afrique Centrale)
        'MGA': 'Ar',    // Ariary malgache
        'MUR': '₨'      // Roupie mauricienne
    };
    return symbols[currency] || currency;
}

// Appliquer toutes les préférences
function applyAllPreferences() {
    applyTheme();
    applyFontSize();
    applyLanguage();
    applyCurrency();
}

// Initialiser les préférences au chargement
loadPreferences();

// Écouter les changements de préférences
document.addEventListener('DOMContentLoaded', () => {
    // Appliquer les préférences chargées
    applyAllPreferences();
    
    // Ajouter des écouteurs pour les changements de préférences
    document.addEventListener('userPreferencesChanged', (event) => {
        console.log('Événement de changement de préférences détecté:', event.detail);
        applyAllPreferences();
    });
});

// Exporter les fonctions pour une utilisation externe
window.preferencesManager = {
    getPreferences: () => userPrefs,
    updatePreference,
    applyTheme,
    applyFontSize,
    applyLanguage,
    applyCurrency,
    applyAllPreferences,
    getCurrencySymbol,
    setTheme: (theme) => {
        if (theme === 'light' || theme === 'dark') {
            userPrefs.theme = theme;
            applyTheme();
            savePreferences();
            return true;
        }
        return false;
    },
    setLanguage: (lang) => {
        if (lang === 'fr' || lang === 'en') {
            userPrefs.language = lang;
            applyLanguage();
            savePreferences();
            return true;
        }
        return false;
    },
    setCurrency: (currency) => {
        if (currency) {
            userPrefs.currency = currency;
            applyCurrency();
            savePreferences();
            return true;
        }
        return false;
    }
};