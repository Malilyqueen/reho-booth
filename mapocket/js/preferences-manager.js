/**
 * Gestionnaire centralisé des préférences utilisateur pour MaPocket
 * 
 * Ce fichier est le point unique d'accès aux préférences utilisateur.
 * Il doit être chargé avant tous les autres scripts qui utilisent les préférences.
 */

// Clé utilisée pour le stockage dans localStorage
const STORAGE_KEY = 'mapocket_user_preferences';

// Préférences par défaut
const defaultPreferences = {
    // Apparence
    theme: 'light',             // 'light' ou 'dark'
    fontSize: 'medium',         // 'small', 'medium', 'large'
    
    // Localisation
    language: 'fr',             // 'fr' ou 'en'
    dateFormat: 'DD/MM/YYYY',   // Format de date
    currency: 'EUR',            // Devise principale (EUR, USD, etc.)
    secondaryCurrency: 'USD',   // Devise secondaire pour les conversions
    
    // Compte
    plan: 'freemium',           // 'freemium', 'basic', 'pro'
    
    // Autres
    lastProjectId: null,        // Dernier projet consulté
    dashboardLayout: 'grid'     // Mise en page du tableau de bord
};

// Objet global des préférences (accessible via window.userPrefs)
let userPrefs;

// Charger les préférences depuis localStorage
function loadPreferences() {
    try {
        const savedPrefs = localStorage.getItem(STORAGE_KEY);
        
        if (savedPrefs) {
            // Si des préférences existent, les charger et fusionner avec les valeurs par défaut
            // pour gérer les nouveaux champs ajoutés après la sauvegarde initiale
            userPrefs = { ...defaultPreferences, ...JSON.parse(savedPrefs) };
        } else {
            // Sinon, utiliser les préférences par défaut
            userPrefs = { ...defaultPreferences };
        }
        
        console.log('Préférences utilisateur chargées:', userPrefs);
    } catch (error) {
        console.error('Erreur lors du chargement des préférences:', error);
        userPrefs = { ...defaultPreferences };
    }
    
    // Rendre les préférences disponibles globalement
    window.userPrefs = userPrefs;
    
    // Pour la compatibilité avec le code existant (à supprimer progressivement)
    window.userPreferences = userPrefs;
    
    return userPrefs;
}

// Sauvegarder les préférences dans localStorage
function savePreferences() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userPrefs));
        console.log('Préférences utilisateur sauvegardées:', userPrefs);
        
        // Déclencher un événement personnalisé pour notifier les autres parties de l'application
        document.dispatchEvent(new CustomEvent('userPreferencesChanged', { 
            detail: { preferences: userPrefs } 
        }));
        
        return true;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des préférences:', error);
        return false;
    }
}

// Mettre à jour une préférence spécifique
function updatePreference(key, value) {
    if (userPrefs.hasOwnProperty(key) && userPrefs[key] !== value) {
        userPrefs[key] = value;
        savePreferences();
        return true;
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

// Appliquer la langue actuelle
function applyLanguage() {
    const currentLang = userPrefs.language;
    document.documentElement.lang = currentLang;
    
    // Mettre à jour les radio buttons si présents
    const langRadios = document.querySelectorAll('input[name="language"]');
    if (langRadios.length > 0) {
        langRadios.forEach(radio => {
            radio.checked = radio.value === currentLang;
        });
    }
    
    // Appliquer la traduction en fonction de la langue
    if (currentLang === 'en') {
        translatePageToEnglish();
    } else {
        translatePageToFrench();
    }
    
    console.log('Language applied:', currentLang);
}

// Récupère toutes les chaînes traduisibles de la page
function getAllTranslatableElements() {
    // Sélectionner tous les éléments qui contiennent du texte visible
    return [
        ...document.querySelectorAll('.main-nav a .menu-text'), // Menu principal
        ...document.querySelectorAll('.tab-btn'),               // Onglets
        ...document.querySelectorAll('h1, h2, h3'),             // Titres
        ...document.querySelectorAll('button'),                 // Boutons
        ...document.querySelectorAll('label'),                  // Labels
        ...document.querySelectorAll('p'),                      // Paragraphes
        ...document.querySelectorAll('th'),                     // En-têtes de tableau
        ...document.querySelectorAll('.card-title'),            // Titres de cartes
        ...document.querySelectorAll('.section-title')          // Titres de sections
    ];
}

// Dictionnaire de traduction français -> anglais
const frToEnDict = {
    // Menu principal
    'Tableau de bord': 'Dashboard',
    'Mes Projets': 'My Projects',
    'Mon Portefeuille': 'My Wallet',
    'Objectifs & Défis': 'Goals & Challenges',
    'Projets partagés': 'Shared Projects',
    'Liste des souhaits': 'Wishlist',
    'Produits partenaires': 'Partner Products',
    'Suggestions IA': 'AI Suggestions',
    'Assistant création de projet': 'Project Assistant',
    'MaPocket Pro': 'MaPocket Pro',
    'Paramètres': 'Settings',
    
    // Onglets de paramètres
    'Profil': 'Profile',
    'Apparence': 'Appearance',
    'Sécurité': 'Security',
    'Utilisateurs': 'Users',
    'Abonnement': 'Subscription',
    'Notifications': 'Notifications',
    
    // Boutons d'action
    'Ajouter': 'Add',
    'Modifier': 'Edit',
    'Supprimer': 'Delete',
    'Sauvegarder': 'Save',
    'Annuler': 'Cancel',
    'Continuer': 'Continue',
    'Valider': 'Validate',
    'Enregistrer': 'Save',
    'Confirmer': 'Confirm',
    
    // Projet
    'Nouveau projet': 'New project',
    'Date du projet': 'Project date',
    'Budget total': 'Total budget',
    'Catégories': 'Categories',
    'Sous-catégories': 'Subcategories',
    'Dépenses': 'Expenses',
    'Revenus': 'Income',
    'Ajouter une catégorie': 'Add category',
    'Ajouter une sous-catégorie': 'Add subcategory',
    'Ajouter une ligne': 'Add line',
    
    // Portefeuille
    'Solde actuel': 'Current balance',
    'Ajouter une transaction': 'Add transaction',
    'Revenus': 'Income',
    'Dépenses': 'Expenses',
    'Transfert': 'Transfer',
    
    // Phrases complètes
    'Personnalisez votre expérience MaPocket': 'Personalize your MaPocket experience',
    'Gérez vos paramètres de compte': 'Manage your account settings',
    'Choisissez votre thème': 'Choose your theme',
    'Clair': 'Light',
    'Sombre': 'Dark',
    'Langue': 'Language',
    'Français': 'French',
    'Anglais': 'English',
    'Devise principale': 'Primary currency',
    'Devise secondaire': 'Secondary currency',
    'Prévisualisation': 'Preview',
    'Nom complet': 'Full name',
    'Adresse e-mail': 'Email address',
    'Téléphone': 'Phone',
    'Changer le mot de passe': 'Change password',
    'Ancien mot de passe': 'Old password',
    'Nouveau mot de passe': 'New password',
    'Confirmer le mot de passe': 'Confirm password',
    'Plan actuel': 'Current plan',
    'Mettre à niveau': 'Upgrade',
    'Fonctionnalités disponibles': 'Available features',
    'Gérer les utilisateurs': 'Manage users',
    'Ajouter un utilisateur': 'Add user',
    'Nom': 'Name',
    'Email': 'Email',
    'Rôle': 'Role',
    'Actions': 'Actions',
    'Administrateur': 'Administrator',
    'Éditeur': 'Editor',
    'Lecteur': 'Reader',
    
    // Messages
    'Profil mis à jour avec succès': 'Profile updated successfully',
    'Mot de passe changé avec succès': 'Password changed successfully',
    'Utilisateur ajouté avec succès': 'User added successfully',
    'Utilisateur supprimé avec succès': 'User deleted successfully',
    'Une erreur est survenue': 'An error occurred',
    'Êtes-vous sûr de vouloir supprimer cet utilisateur ?': 'Are you sure you want to delete this user?',
    'Cette action est irréversible': 'This action cannot be undone'
};

// Dictionnaire de traduction anglais -> français
const enToFrDict = {};
// Génération inverse du dictionnaire
Object.entries(frToEnDict).forEach(([fr, en]) => {
    enToFrDict[en] = fr;
});

// Fonction de traduction en anglais avec le nouveau dictionnaire
function translatePageToEnglish() {
    try {
        const elements = getAllTranslatableElements();
        
        elements.forEach(el => {
            const text = el.textContent.trim();
            
            // Vérifier si le texte existe dans le dictionnaire
            if (frToEnDict[text]) {
                el.textContent = frToEnDict[text];
            }
            // Vérifier des correspondances partielles pour les titres composés
            else {
                Object.entries(frToEnDict).forEach(([fr, en]) => {
                    if (text.includes(fr)) {
                        el.textContent = text.replace(fr, en);
                    }
                });
            }
        });
        
        console.log('Page traduite en anglais');
    } catch (error) {
        console.error('Erreur lors de la traduction en anglais:', error);
    }
}

// Fonction de traduction en français avec le nouveau dictionnaire
function translatePageToFrench() {
    try {
        const elements = getAllTranslatableElements();
        
        elements.forEach(el => {
            const text = el.textContent.trim();
            
            // Vérifier si le texte existe dans le dictionnaire
            if (enToFrDict[text]) {
                el.textContent = enToFrDict[text];
            }
            // Vérifier des correspondances partielles pour les titres composés
            else {
                Object.entries(enToFrDict).forEach(([en, fr]) => {
                    if (text.includes(en)) {
                        el.textContent = text.replace(en, fr);
                    }
                });
            }
        });
        
        console.log('Page traduite en français');
    } catch (error) {
        console.error('Erreur lors de la traduction en français:', error);
    }
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
    
    // Mettre à jour les affichages de montants
    updateCurrencyDisplay();
}

// Mettre à jour l'affichage des montants dans la devise actuelle
function updateCurrencyDisplay() {
    const currencySymbol = userPrefs.currency;
    
    // Mettre à jour tous les éléments qui affichent des montants
    document.querySelectorAll('.amount, .budget-amount, .expense-amount, .income-amount').forEach(el => {
        // Extraire le montant numérique (sans le symbole de devise actuel)
        const numericAmount = parseFloat(el.textContent.replace(/[^\d.,\-]/g, '').replace(',', '.')) || 0;
        
        // Formater avec la nouvelle devise
        el.textContent = `${currencySymbol} ${numericAmount.toFixed(2).replace('.', ',')}`;
    });
    
    console.log('Currency display updated to', currencySymbol);
}

// Convertir tous les projets à la nouvelle devise
function convertProjects(newCurrency) {
    try {
        // Récupérer les projets du localStorage
        const projectsStr = localStorage.getItem('userProjects');
        if (!projectsStr) return;
        
        const projects = JSON.parse(projectsStr);
        
        projects.forEach(project => {
            // Supprimer le symbole de devise
            project.totalBudget = project.totalBudget.toString().replace(/[^0-9,\.]/g, '').trim();
            
            // Ajouter le nouveau symbole
            project.totalBudget = `${newCurrency} ${project.totalBudget}`;
            
            // Convertir les catégories et sous-catégories
            if (project.categories) {
                project.categories.forEach(cat => {
                    if (cat.amount) {
                        cat.amount = cat.amount.toString().replace(/[^0-9,\.]/g, '').trim();
                        cat.amount = `${newCurrency} ${cat.amount}`;
                    }
                    
                    if (cat.subcategories) {
                        cat.subcategories.forEach(subcat => {
                            if (subcat.amount) {
                                subcat.amount = subcat.amount.toString().replace(/[^0-9,\.]/g, '').trim();
                                subcat.amount = `${newCurrency} ${subcat.amount}`;
                            }
                            
                            if (subcat.lines) {
                                subcat.lines.forEach(line => {
                                    if (line.amount) {
                                        line.amount = line.amount.toString().replace(/[^0-9,\.]/g, '').trim();
                                        line.amount = `${newCurrency} ${line.amount}`;
                                    }
                                });
                            }
                        });
                    }
                });
            }
            
            // Convertir les dépenses réelles
            if (project.realExpenses) {
                project.realExpenses.forEach(expense => {
                    if (expense.amount) {
                        expense.amount = expense.amount.toString().replace(/[^0-9,\.]/g, '').trim();
                        expense.amount = `${newCurrency} ${expense.amount}`;
                    }
                });
            }
        });
        
        // Enregistrer les projets mis à jour
        localStorage.setItem('userProjects', JSON.stringify(projects));
        
        console.log('Projets convertis en', newCurrency);
        return true;
    } catch (error) {
        console.error('Erreur lors de la conversion des projets:', error);
        return false;
    }
}

// Convertir tous les portefeuilles à la nouvelle devise
function convertWallets(newCurrency) {
    try {
        // Récupérer les portefeuilles du localStorage
        const walletsStr = localStorage.getItem('userWallets');
        if (!walletsStr) return;
        
        const wallets = JSON.parse(walletsStr);
        
        wallets.forEach(wallet => {
            // Convertir le solde
            if (wallet.balance) {
                wallet.balance = wallet.balance.toString().replace(/[^0-9,\.\-]/g, '').trim();
                wallet.balance = `${newCurrency} ${wallet.balance}`;
            }
            
            // Convertir les transactions
            if (wallet.transactions) {
                wallet.transactions.forEach(transaction => {
                    if (transaction.amount) {
                        transaction.amount = transaction.amount.toString().replace(/[^0-9,\.\-]/g, '').trim();
                        transaction.amount = `${newCurrency} ${transaction.amount}`;
                    }
                });
            }
        });
        
        // Enregistrer les portefeuilles mis à jour
        localStorage.setItem('userWallets', JSON.stringify(wallets));
        
        console.log('Portefeuilles convertis en', newCurrency);
        return true;
    } catch (error) {
        console.error('Erreur lors de la conversion des portefeuilles:', error);
        return false;
    }
}

// Appliquer toutes les préférences
function applyAllPreferences() {
    applyTheme();
    applyFontSize();
    applyLanguage();
    applyCurrency();
}

// Changer de thème
function setTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
        userPrefs.theme = theme;
        applyTheme();
        savePreferences();
        return true;
    }
    return false;
}

// Changer de langue
function setLanguage(lang) {
    if (lang === 'fr' || lang === 'en') {
        userPrefs.language = lang;
        applyLanguage();
        savePreferences();
        return true;
    }
    return false;
}

// Changer de devise
function setCurrency(currency) {
    if (currency && currency.length > 0) {
        // Si la nouvelle devise est différente
        if (userPrefs.currency !== currency) {
            // Convertir tous les projets et portefeuilles
            convertProjects(currency);
            convertWallets(currency);
            
            // Mettre à jour la préférence
            userPrefs.currency = currency;
            applyCurrency();
            savePreferences();
        }
        return true;
    }
    return false;
}

// Exporter l'API publique
window.preferencesManager = {
    // Getter pour les préférences
    getPreferences: () => userPrefs,
    
    // Fonctions de mise à jour
    updatePreference,
    setTheme,
    setLanguage,
    setCurrency,
    
    // Fonctions d'application
    applyTheme,
    applyLanguage,
    applyFontSize,
    applyCurrency,
    applyAllPreferences,
    
    // Fonctions de traduction
    translatePageToEnglish,
    translatePageToFrench,
    
    // Fonctions de conversion
    convertProjects,
    convertWallets
};

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