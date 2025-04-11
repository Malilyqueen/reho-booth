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

// Préférences utilisateur actuelles - Forcer le thème clair (light) temporairement
// Utilisons window.userPrefs pour éviter les conflits de variable entre les fichiers
window.userPrefs = window.userPrefs || { ...defaultPreferences, theme: 'light' };

/**
 * Charge les préférences utilisateur depuis le localStorage
 */
function loadPreferences() {
    try {
        const savedPreferences = localStorage.getItem('userPreferences');
        if (savedPreferences) {
            // Charger les préférences mais forcer le thème clair (light) temporairement
            const parsedPrefs = JSON.parse(savedPreferences);
            window.userPrefs = { ...defaultPreferences, ...parsedPrefs, theme: 'light' };
            console.log('Préférences utilisateur chargées:', window.userPrefs);
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
        localStorage.setItem('userPreferences', JSON.stringify(window.userPrefs));
        console.log('Préférences utilisateur sauvegardées:', window.userPrefs);
        
        // Déclencher un événement pour informer les autres parties de l'application
        const event = new CustomEvent('userPreferencesChanged', { 
            detail: { preferences: window.userPrefs } 
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
    if (window.userPrefs.hasOwnProperty(key)) {
        window.userPrefs[key] = value;
        return savePreferences();
    }
    return false;
}

// Appliquer le thème actuel
function applyTheme() {
    const isDarkMode = window.userPrefs.theme === 'dark';
    
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
    document.body.classList.add('font-' + window.userPrefs.fontSize);
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
    const lang = window.userPrefs.language;
    document.documentElement.lang = lang;
    
    // Mettre à jour les radio buttons si présents
    const langRadios = document.querySelectorAll('input[name="language"]');
    if (langRadios.length > 0) {
        langRadios.forEach(radio => {
            radio.checked = radio.value === lang;
        });
    }
    
    // Messages de notification
    const notifications = {
        fr: {
            themeApplied: 'Thème appliqué avec succès',
            languageChanged: 'Langue changée',
            currencyChanged: 'Devise changée',
            fontSizeChanged: 'Taille de texte modifiée'
        },
        en: {
            themeApplied: 'Theme applied successfully',
            languageChanged: 'Language changed',
            currencyChanged: 'Currency changed',
            fontSizeChanged: 'Font size changed'
        }
    };

    // Dictionnaire de traduction complet
    const frToEn = {
        // Navigation
        'Tableau de bord': 'Dashboard',
        'Mes Projets': 'My Projects',
        'Créer un projet': 'Create a project',
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
        'Aperçu': 'Preview',
        
        // Portefeuille
        'Mon Portefeuille': 'My Wallet',
        'Solde total': 'Total Balance',
        'Dépenses': 'Expenses',
        'Revenus': 'Income',
        'Ajouter un portefeuille': 'Add a wallet',
        'Gérer mes portefeuilles': 'Manage my wallets',
        'Ajouter un revenu': 'Add income',
        'Ajouter une dépense': 'Add expense',
        'Transactions récentes': 'Recent transactions',
        'Date': 'Date',
        'Montant': 'Amount',
        'Type': 'Type',
        'Catégorie': 'Category',
        'Description': 'Description',
        'Voir toutes les transactions': 'View all transactions',
        
        // Objectifs & Défis
        'Objectifs d\'épargne': 'Savings Goals',
        'Défis budgétaires': 'Budget Challenges',
        'Suivi & Statistiques': 'Tracking & Stats',
        'Créer un objectif': 'Create a goal',
        'Créer un défi': 'Create a challenge',
        'Objectif': 'Goal',
        'Défi': 'Challenge',
        'Progression': 'Progress',
        'Actions': 'Actions',
        'Voir les détails': 'View details',
        'Modifier': 'Edit',
        'Supprimer': 'Delete',
        
        // Liste de souhaits
        'Mes listes de souhaits': 'My wishlists',
        'Créer une liste': 'Create a list',
        'Partager': 'Share',
        'Prix': 'Price',
        'Priorité': 'Priority',
        'Lien': 'Link',
        'Ajouter un produit': 'Add a product',
        'Haute': 'High',
        'Moyenne': 'Medium',
        'Basse': 'Low',
        
        // Produits Partenaires
        'Produits recommandés': 'Recommended products',
        'Offres spéciales': 'Special offers',
        'Voir l\'offre': 'View offer',
        'Ajouter à ma liste': 'Add to my list',
        
        // Outils Pro
        'Gestion des devis': 'Quote management',
        'Gestion des factures': 'Invoice management',
        'Vue comptable': 'Accounting view',
        'Créer un devis': 'Create a quote',
        'Créer une facture': 'Create an invoice',
        'Nouveau devis': 'New quote',
        'Nouvelle facture': 'New invoice',
        'Client': 'Client',
        'Statut': 'Status',
        'Total': 'Total',
        'Brouillon': 'Draft',
        'Envoyé': 'Sent',
        'Accepté': 'Accepted',
        'Refusé': 'Declined',
        'En attente': 'Pending',
        'Payée': 'Paid',
        'En retard': 'Late',
        'Annulée': 'Cancelled',
        
        // Projets et budget
        'Tous les projets': 'All projects',
        'Projets actifs': 'Active projects',
        'Projets terminés': 'Completed projects',
        'Projets archivés': 'Archived projects',
        'Nom du projet': 'Project name',
        'Budget total': 'Total budget',
        'Budget disponible': 'Available budget',
        'Budget utilisé': 'Used budget',
        'Date de début': 'Start date',
        'Date de fin': 'End date',
        'Statut': 'Status',
        'En cours': 'In progress',
        'Terminé': 'Completed',
        'Archivé': 'Archived',
        'Catégories': 'Categories',
        'Ajouter une catégorie': 'Add category',
        'Ajouter une sous-catégorie': 'Add subcategory',
        'Ajouter une ligne': 'Add line',
        
        // Messages et notifications
        'Profil mis à jour avec succès': 'Profile updated successfully',
        'Paramètres sauvegardés': 'Settings saved',
        'Erreur': 'Error',
        'Succès': 'Success',
        'Attention': 'Warning',
        'Information': 'Information',
        
        // Assistant IA
        'Discuter avec l\'assistant': 'Chat with assistant',
        'Générer un projet': 'Generate a project',
        'Suggestions personnalisées': 'Personalized suggestions',
        'Envoyer': 'Send',
        'Effacer': 'Clear',
        'Tapez votre message ici...': 'Type your message here...',
        
        // Communs
        'Enregistrer': 'Save',
        'Annuler': 'Cancel',
        'Confirmer': 'Confirm',
        'Continuer': 'Continue',
        'Retour': 'Back',
        'Suivant': 'Next',
        'Rechercher': 'Search',
        'Filtrer': 'Filter',
        'Trier par': 'Sort by',
        'Afficher': 'Show',
        'Masquer': 'Hide',
        'Partager': 'Share',
        'Imprimer': 'Print',
        'Télécharger': 'Download',
        'Importer': 'Import',
        'Exporter': 'Export',
        'Tout': 'All',
        'Aucun': 'None',
        'Oui': 'Yes',
        'Non': 'No'
    };
    
    const enToFr = {};
    // Générer le dictionnaire inverse
    for (const [fr, en] of Object.entries(frToEn)) {
        enToFr[en] = fr;
    }
    
    // Fonction de traduction plus complète
    const dictionary = lang === 'en' ? frToEn : enToFr;
    
    // Sélectionner un éventail plus large d'éléments à traduire
    const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, button, a, label, div.title, div.subtitle, div.caption, th, td, input[type="submit"], input[type="button"], textarea[placeholder], option, .menu-text, .card-title, .card-subtitle, .section-title, .tab-btn, .nav-link');
    
    elements.forEach(element => {
        // Traduire le texte de l'élément
        translateElement(element, dictionary);
        
        // Traduire également les attributs placeholder et title si présents
        if (element.hasAttribute('placeholder')) {
            const placeholderText = element.getAttribute('placeholder');
            if (dictionary[placeholderText]) {
                element.setAttribute('placeholder', dictionary[placeholderText]);
            }
        }
        
        if (element.hasAttribute('title')) {
            const titleText = element.getAttribute('title');
            if (dictionary[titleText]) {
                element.setAttribute('title', dictionary[titleText]);
            }
        }
        
        // Vérifier les attributs aria-label pour l'accessibilité
        if (element.hasAttribute('aria-label')) {
            const ariaText = element.getAttribute('aria-label');
            if (dictionary[ariaText]) {
                element.setAttribute('aria-label', dictionary[ariaText]);
            }
        }
    });
    
    console.log('Language applied:', lang);
}

// Appliquer la devise
function applyCurrency() {
    // Mettre à jour les sélecteurs de devise si présents
    const primarySelect = document.getElementById('primaryCurrency');
    if (primarySelect) {
        primarySelect.value = window.userPrefs.currency;
    }
    
    const secondarySelect = document.getElementById('secondaryCurrency');
    if (secondarySelect) {
        secondarySelect.value = window.userPrefs.secondaryCurrency;
    }
    
    // Mettre à jour les icônes de devise
    const currencyIcons = document.querySelectorAll('.budget-currency-icon');
    currencyIcons.forEach(icon => {
        icon.classList.remove('fa-euro-sign', 'fa-dollar-sign', 'fa-pound-sign');
        
        switch(window.userPrefs.currency) {
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
                const symbol = getCurrencySymbol(window.userPrefs.currency);
                element.textContent = `${symbol} ${numericPart}`;
            }
        }
    });
}

// Obtenir le symbole de devise
function getCurrencySymbol(currency) {
    const symbols = {
        'EUR': 'AED',
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
            // Forcer le thème clair (light) temporairement
            userPrefs.theme = 'light';
            applyTheme();
            // Enregistrer la valeur 'light' même si l'utilisateur choisit 'dark'
            savePreferences();
            // Afficher une notification
            if (window.NotificationManager) {
                window.NotificationManager.success(
                    notifications[userPrefs.language]?.themeApplied || 'Thème appliqué avec succès'
                );
            }
            return true;
        }
        return false;
    },
    setLanguage: (lang) => {
        if (lang === 'fr' || lang === 'en') {
            userPrefs.language = lang;
            applyLanguage();
            savePreferences();
            // Afficher une notification
            if (window.NotificationManager) {
                const message = notifications[lang]?.languageChanged ?
                    `${notifications[lang].languageChanged} : ${lang === 'fr' ? 'Français' : 'English'}` :
                    (lang === 'fr' ? 'Langue changée : Français' : 'Language changed: English');
                window.NotificationManager.success(message);
            }
            return true;
        }
        return false;
    },
    setCurrency: (currency) => {
        if (currency) {
            userPrefs.currency = currency;
            applyCurrency();
            savePreferences();
            // Afficher une notification
            if (window.NotificationManager) {
                const currencyName = CURRENCY_DATA[currency]?.name || currency;
                const message = notifications[userPrefs.language]?.currencyChanged ?
                    `${notifications[userPrefs.language].currencyChanged} : ${currencyName}` :
                    `Devise changée : ${currencyName}`;
                window.NotificationManager.success(message);
            }
            return true;
        }
        return false;
    }
};