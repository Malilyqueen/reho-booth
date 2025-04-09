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
    
    // Appliquer aux conteneurs principaux pour assurer une application complète
    document.querySelectorAll('.container, .app-container, .content, .sidebar').forEach(element => {
        if (isDarkMode) {
            element.classList.add('dark-mode');
        } else {
            element.classList.remove('dark-mode');
        }
    });
    
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
    
    // Appliquer le thème à tous les éléments importants
    if (isDarkMode) {
        // Appliquer le thème sombre à tous les composants importants
        document.querySelectorAll('.dashboard-stats, .stat-card, .widget, .projects-table, .projects-table th, .projects-table td, .card, .panel, .modal, .notification, .timeline, .timeline-item').forEach(el => {
            el.classList.add('dark-mode');
        });
    } else {
        // Supprimer le thème sombre
        document.querySelectorAll('.dashboard-stats, .stat-card, .widget, .projects-table, .projects-table th, .projects-table td, .card, .panel, .modal, .notification, .timeline, .timeline-item').forEach(el => {
            el.classList.remove('dark-mode');
        });
    }
    
    // Mettre à jour les menus (s'assurer qu'ils restent visibles en mode sombre)
    const menuItems = document.querySelectorAll('.main-nav .nav-item, .main-nav li');
    menuItems.forEach(item => {
        if (isDarkMode) {
            item.classList.add('dark-nav-item');
        } else {
            item.classList.remove('dark-nav-item');
        }
    });
    
    // Sauvegarde de préférence dans localStorage en plus des settings
    localStorage.setItem('theme_preference', isDarkMode ? 'dark' : 'light');
    
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
        ...document.querySelectorAll('.main-nav a .menu-text'),    // Menu principal
        ...document.querySelectorAll('.tab-btn'),                  // Onglets
        ...document.querySelectorAll('h1, h2, h3, h4, h5, h6'),    // Tous les titres
        ...document.querySelectorAll('button'),                    // Boutons
        ...document.querySelectorAll('label'),                     // Labels
        ...document.querySelectorAll('p'),                         // Paragraphes
        ...document.querySelectorAll('th'),                        // En-têtes de tableau
        ...document.querySelectorAll('td'),                        // Cellules de tableau
        ...document.querySelectorAll('.card-title'),               // Titres de cartes
        ...document.querySelectorAll('.section-title'),            // Titres de sections
        ...document.querySelectorAll('.btn'),                      // Boutons avec classe .btn
        ...document.querySelectorAll('.widget-header h3'),         // Titres de widgets
        ...document.querySelectorAll('.stat-info h3'),             // Titres de statistiques
        ...document.querySelectorAll('.user-greeting h2'),         // Titre de bienvenue
        ...document.querySelectorAll('.user-greeting p'),          // Sous-titre de bienvenue
        ...document.querySelectorAll('.content-header h2'),        // Titres d'en-tête de contenu
        ...document.querySelectorAll('.content-header p'),         // Sous-titres d'en-tête
        ...document.querySelectorAll('.stat-card .stat-info h3'),  // Titres de cartes statistiques
        ...document.querySelectorAll('.btn-text'),                 // Texte des boutons
        ...document.querySelectorAll('.advice-card p'),            // Texte des conseils
        ...document.querySelectorAll('.empty-projects-message p'), // Message quand aucun projet
        ...document.querySelectorAll('.option-help'),              // Textes d'aide
        ...document.querySelectorAll('.form-group label'),         // Labels de formulaire
        ...document.querySelectorAll('input[type="submit"]'),      // Boutons de soumission
        ...document.querySelectorAll('input[type="button"]'),      // Boutons input
        ...document.querySelectorAll('select option'),             // Options de select
        ...document.querySelectorAll('.project-status'),           // Statut des projets
        ...document.querySelectorAll('.timeline-header h3'),       // Titre de timeline
        ...document.querySelectorAll('.empty-timeline-message p')  // Message quand timeline vide
    ];
}

// Dictionnaire de traduction français -> anglais
const frToEnDict = {
    // Menu principal
    'Tableau de bord': 'Dashboard',
    'Mes Projets': 'My Projects',
    'Créer un projet': 'Create a project',
    'Mon Portefeuille': 'My Wallet',
    'Objectifs & Défis': 'Goals & Challenges',
    'Projets partagés': 'Shared Projects',
    'Liste de souhaits': 'Wishlist',
    'Liste des souhaits': 'Wishlist',
    'Produits partenaires': 'Partner Products',
    'Suggestions IA': 'AI Suggestions',
    'Assistant Projet': 'Project Assistant',
    'Assistant création de projet': 'Project Assistant',
    'MaPocket Pro': 'MaPocket Pro',
    'Outils Pro': 'Pro Tools',
    'Paramètres': 'Settings',
    'Créer avec l\'IA': 'Create with AI',
    
    // Éléments du tableau de bord
    'Bonjour': 'Hello',
    'Voici un aperçu de votre budget actuel': 'Here is an overview of your current budget',
    'Projets en cours': 'Active projects',
    'Budget total': 'Total budget',
    'Solde portefeuille': 'Wallet balance',
    'Activité pro': 'Pro activity',
    'Conseil IA du jour': 'AI tip of the day',
    'Répartition des budgets': 'Budget distribution',
    'Statistiques générales': 'General statistics',
    'À venir dans les 30 jours': 'Coming up in the next 30 days',
    'Nouveau': 'New',
    'Nom': 'Name',
    'Date': 'Date',
    'Dépenses': 'Expenses',
    'Utilisation': 'Usage',
    'Statut': 'Status',
    'Actions': 'Actions',
    'Vous n\'avez pas encore de projets. Créez votre premier projet pour commencer!': 'You don\'t have any projects yet. Create your first project to get started!',
    'Aucun événement à venir dans les 30 prochains jours.': 'No events coming up in the next 30 days.',
    'devis': 'quotes',
    'factures': 'invoices',
    
    // Onglets de paramètres
    'Profil': 'Profile',
    'Apparence': 'Appearance',
    'Sécurité': 'Security',
    'Utilisateurs': 'Users',
    'Abonnement': 'Subscription',
    'Notifications': 'Notifications',
    'Personnalisez l\'application selon vos préférences': 'Customize the application according to your preferences',
    
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
    'Exporter': 'Export',
    'Importer': 'Import',
    'Réinitialiser': 'Reset',
    'Ajouter un rappel': 'Add reminder',
    
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
    'Titre': 'Title',
    'Date': 'Date',
    'Type': 'Type',
    'Description': 'Description',
    'Rappel': 'Reminder',
    'Facture': 'Invoice',
    'Devis': 'Quote',
    'Revenu': 'Income',
    'Objectif': 'Goal',
    'Ajoutez des détails supplémentaires...': 'Add additional details...',
    
    // Portefeuille
    'Solde actuel': 'Current balance',
    'Ajouter une transaction': 'Add transaction',
    'Revenus': 'Income',
    'Dépenses': 'Expenses',
    'Transfert': 'Transfer',
    
    // Statistiques
    'Projets actifs': 'Active projects',
    'Budget total': 'Total budget',
    'Solde portefeuille': 'Wallet balance',
    'Activité Pro': 'Pro Activity',
    
    // Timeline
    'Tous les événements': 'All events',
    'Projets': 'Projects',
    'Factures': 'Invoices',
    'Devis': 'Quotes',
    'Revenus': 'Income',
    'Objectifs': 'Goals',
    'Alertes': 'Alerts',
    
    // Phrases complètes
    'Personnalisez votre expérience MaPocket': 'Personalize your MaPocket experience',
    'Gérez vos paramètres de compte': 'Manage your account settings',
    'Choisissez votre thème': 'Choose your theme',
    'Mode d\'affichage': 'Display mode',
    'Choisissez un thème clair ou sombre': 'Choose a light or dark theme',
    'Clair': 'Light',
    'Sombre': 'Dark',
    'Langue': 'Language',
    'Sélectionnez votre langue préférée': 'Select your preferred language',
    'Français': 'French',
    'Anglais': 'English',
    'Format de date': 'Date format',
    'Choisissez comment les dates sont affichées': 'Choose how dates are displayed',
    'Devise': 'Currency',
    'Choisissez votre devise préférée': 'Choose your preferred currency',
    'Devise principale': 'Primary currency',
    'Devise secondaire': 'Secondary currency',
    'Devise d\'affichage secondaire': 'Secondary display currency',
    'Cette devise sera utilisée pour tous les nouveaux projets et portefeuilles.': 'This currency will be used for all new projects and wallets.',
    'Les montants seront aussi affichés dans cette devise pour comparaison.': 'Amounts will also be displayed in this currency for comparison.',
    'Aperçu': 'Preview',
    'Les taux de change sont mis à jour quotidiennement. Dernière mise à jour:': 'Exchange rates are updated daily. Last update:',
    
    // Profil
    'Nom complet': 'Full name',
    'Adresse e-mail': 'Email address',
    'Téléphone': 'Phone',
    'Téléphone (optionnel)': 'Phone (optional)',
    'Changer d\'avatar': 'Change avatar',
    'Changer le mot de passe': 'Change password',
    'Ancien mot de passe': 'Old password',
    'Nouveau mot de passe': 'New password',
    'Confirmer le mot de passe': 'Confirm password',
    'Plan actuel': 'Current plan',
    'Mettre à niveau': 'Upgrade',
    'Fonctionnalités disponibles': 'Available features',
    'Gérer les utilisateurs': 'Manage users',
    'Ajouter un utilisateur': 'Add user',
    'Rôle': 'Role',
    'Administrateur': 'Administrator',
    'Éditeur': 'Editor',
    'Lecteur': 'Reader',
    
    // Taille de texte
    'Taille du texte': 'Text size',
    'Taille de police': 'Font size',
    'Ajustez la taille du texte dans l\'application': 'Adjust the text size in the application',
    
    // Abonnement
    'Freemium': 'Freemium',
    'Basic': 'Basic',
    'Pro': 'Pro',
    'Vous utilisez actuellement le plan': 'You are currently using the plan',
    'avec des fonctionnalités limitées': 'with limited features',
    'Mettre à niveau pour débloquer toutes les fonctionnalités': 'Upgrade to unlock all features',
    'Comparer les plans': 'Compare plans',
    'Fonctionnalités': 'Features',
    'Nombre de projets': 'Number of projects',
    'illimité': 'unlimited',
    'Portefeuilles': 'Wallets',
    'Objectifs et défis': 'Goals and challenges',
    'Outils pro': 'Pro tools',
    'Suggestions IA': 'AI suggestions',
    'Collaboration': 'Collaboration',
    'Support premium': 'Premium support',
    'par mois': 'per month',
    'Démarrer gratuitement': 'Start for free',
    'Choisir ce plan': 'Choose this plan',
    'Plan actuel': 'Current plan',
    'Contactez-nous': 'Contact us',
    'pour plus d\'informations sur les offres entreprises': 'for more information on business offers',
    
    // Messages
    'Profil mis à jour avec succès': 'Profile updated successfully',
    'Mot de passe changé avec succès': 'Password changed successfully',
    'Utilisateur ajouté avec succès': 'User added successfully',
    'Utilisateur supprimé avec succès': 'User deleted successfully',
    'Une erreur est survenue': 'An error occurred',
    'Êtes-vous sûr de vouloir supprimer cet utilisateur ?': 'Are you sure you want to delete this user?',
    'Cette action est irréversible': 'This action cannot be undone',
    'Thème mis à jour avec succès': 'Theme updated successfully',
    'Langue mise à jour avec succès': 'Language updated successfully',
    'Devise mise à jour avec succès': 'Currency updated successfully',
    'Taille de texte mise à jour avec succès': 'Text size updated successfully',
    'Préférences mises à jour avec succès': 'Preferences updated successfully',
    'Tous les montants ont été convertis': 'All amounts have been converted',
    'Vous n\'avez pas encore de projets.': 'You don\'t have any projects yet.',
    'Créez votre premier projet pour commencer!': 'Create your first project to get started!',
    'Optimisez votre budget alimentaire en planifiant vos repas': 'Optimize your food budget by planning your meals',
    
    // Timeline et rappels
    'Ajouter un rappel': 'Add a reminder',
    'Titre': 'Title',
    'Date': 'Date',
    'Type': 'Type',
    'Description (optionnel)': 'Description (optional)'
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
    
    // Mettre à jour l'icône de devise pour tous les éléments ayant la classe .budget-currency-icon
    updateCurrencyIcons();
    
    // Mettre à jour tous les affichages de montants
    updateCurrencyDisplay();
    
    // Mettre à jour les montants dans le tableau de projets
    updateProjectsTable();
    
    // Mettre à jour les statistiques
    updateStatsCurrency();
    
    // Forcer la mise à jour visuelle
    document.querySelectorAll('.currency-display').forEach(el => {
        el.style.visibility = 'hidden';
        setTimeout(() => {
            el.style.visibility = 'visible';
        }, 50);
    });
}

// Met à jour les icônes de devise
function updateCurrencyIcons() {
    const currencySymbol = getCurrencySymbol(userPrefs.currency);
    
    // Mettre à jour toutes les icônes de devise
    document.querySelectorAll('.budget-currency-icon').forEach(icon => {
        // Supprimer toutes les classes d'icône de devise
        icon.classList.remove('fa-euro-sign', 'fa-dollar-sign', 'fa-pound-sign', 'fa-yen-sign', 'fa-ruble-sign', 'fa-rupee-sign');
        
        // Ajouter la classe appropriée selon la devise
        switch(userPrefs.currency) {
            case 'USD':
                icon.classList.add('fa-dollar-sign');
                break;
            case 'GBP':
                icon.classList.add('fa-pound-sign');
                break;
            case 'JPY':
                icon.classList.add('fa-yen-sign');
                break;
            case 'RUB':
                icon.classList.add('fa-ruble-sign');
                break;
            case 'INR':
                icon.classList.add('fa-rupee-sign');
                break;
            default:
                icon.classList.add('fa-euro-sign'); // EUR et autres devises par défaut
        }
    });
    
    console.log('Devise actuelle:', userPrefs.currency, 'Symbole:', currencySymbol);
}

// Obtenir le symbole correspondant à une devise
function getCurrencySymbol(currencyCode) {
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
        'AED': 'د.إ'
    };
    
    return symbols[currencyCode] || currencyCode;
}

// Mettre à jour l'affichage des montants dans la devise actuelle
function updateCurrencyDisplay() {
    const currencyCode = userPrefs.currency;
    const currencySymbol = getCurrencySymbol(currencyCode);
    
    // Mettre à jour tous les éléments qui affichent des montants
    document.querySelectorAll('.amount, .budget-amount, .expense-amount, .income-amount, .stat-value').forEach(el => {
        if (!el.textContent || el.textContent.trim() === '') return;
        
        try {
            // Extraire le montant numérique (sans le symbole de devise actuel)
            let textContent = el.textContent.trim();
            
            // Ignorer certains éléments qui ne sont pas des montants de devise
            if (textContent.includes('devis') || textContent.includes('factures') || 
                textContent.includes('quotes') || textContent.includes('invoices') ||
                !textContent.match(/[0-9]/)) {
                return;
            }
            
            // Extraire le montant numérique
            let numericStr = textContent.replace(/[^\d.,\-]/g, '').trim();
            if (!numericStr) return;
            
            // Convertir le format français (virgule) au format anglais (point)
            numericStr = numericStr.replace(',', '.');
            
            // Convertir en nombre
            const numericAmount = parseFloat(numericStr);
            if (isNaN(numericAmount)) return;
            
            // Formater avec la nouvelle devise
            const formattedAmount = `${currencySymbol} ${numericAmount.toFixed(2).replace('.', ',')}`;
            
            // Appliquer le texte formaté
            el.textContent = formattedAmount;
        } catch (error) {
            console.error('Erreur lors du parsing de la dépense:', el.textContent, error);
        }
    });
    
    console.log('Currency display updated to', currencyCode);
}

// Met à jour le tableau des projets avec la nouvelle devise
function updateProjectsTable() {
    const projectsTableBody = document.getElementById('projectsTableBody');
    if (!projectsTableBody) return;
    
    const currencySymbol = getCurrencySymbol(userPrefs.currency);
    
    // Récupérer les projets du localStorage
    const projectsStr = localStorage.getItem('userProjects');
    if (!projectsStr) return;
    
    try {
        const projects = JSON.parse(projectsStr);
        
        // Parcourir toutes les cellules du tableau qui contiennent des montants
        const budgetCells = projectsTableBody.querySelectorAll('td:nth-child(3)'); // Budget
        const expenseCells = projectsTableBody.querySelectorAll('td:nth-child(4)'); // Dépenses
        
        // Mise à jour des cellules de budget
        budgetCells.forEach((cell, index) => {
            if (index < projects.length) {
                const project = projects[index];
                const budget = project.totalBudget.toString().replace(/[^0-9,\.]/g, '').trim();
                cell.textContent = `${currencySymbol} ${budget}`;
            }
        });
        
        // Mise à jour des cellules de dépenses
        expenseCells.forEach((cell, index) => {
            if (index < projects.length) {
                const project = projects[index];
                let expenses = 0;
                
                if (project.realExpenses && project.realExpenses.length > 0) {
                    expenses = project.realExpenses.reduce((total, expense) => {
                        const amount = parseFloat(expense.amount.toString().replace(/[^0-9,\.]/g, '').replace(',', '.')) || 0;
                        return total + amount;
                    }, 0);
                }
                
                cell.textContent = `${currencySymbol} ${expenses.toFixed(2).replace('.', ',')}`;
            }
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du tableau des projets:', error);
    }
}

// Mettre à jour les statistiques avec la nouvelle devise
function updateStatsCurrency() {
    const totalBudgetElements = document.querySelectorAll('#totalBudget');
    const walletBalanceElements = document.querySelectorAll('#walletBalance');
    
    if (totalBudgetElements.length === 0 && walletBalanceElements.length === 0) return;
    
    const currencySymbol = getCurrencySymbol(userPrefs.currency);
    
    // Mise à jour des statistiques de projets
    try {
        const projectsStr = localStorage.getItem('userProjects');
        if (projectsStr) {
            const projects = JSON.parse(projectsStr);
            console.log('Statistiques des projets à mettre à jour:', projects.length, 'projets trouvés');
            
            // Calculer le budget total
            let totalBudget = 0;
            projects.forEach(project => {
                const budget = parseFloat(project.totalBudget.toString().replace(/[^0-9,\.]/g, '').replace(',', '.')) || 0;
                totalBudget += budget;
            });
            
            // Mettre à jour l'affichage du budget total
            totalBudgetElements.forEach(el => {
                el.textContent = `${currencySymbol} ${totalBudget.toFixed(2).replace('.', ',')}`;
            });
            
            console.log('Mise à jour du budget total avec le symbole', currencySymbol);
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour des statistiques de projets:', error);
    }
    
    // Mise à jour des statistiques de portefeuilles
    try {
        const walletsStr = localStorage.getItem('userWallets');
        let wallets = [];
        
        if (walletsStr) {
            wallets = JSON.parse(walletsStr);
        }
        
        console.log('Portefeuilles récupérés:', wallets);
        
        // Calculer le solde total des portefeuilles
        let totalBalance = 0;
        wallets.forEach(wallet => {
            const balance = parseFloat(wallet.balance.toString().replace(/[^0-9,\.\-]/g, '').replace(',', '.')) || 0;
            totalBalance += balance;
        });
        
        console.log('Solde total des portefeuilles:', totalBalance);
        
        // Calculer les dépenses des projets liés aux portefeuilles
        const projectsStr = localStorage.getItem('userProjects');
        let totalProjectExpenses = 0;
        
        if (projectsStr) {
            const projects = JSON.parse(projectsStr);
            projects.forEach(project => {
                if (project.linkToWallet && project.realExpenses) {
                    project.realExpenses.forEach(expense => {
                        const amount = parseFloat(expense.amount.toString().replace(/[^0-9,\.]/g, '').replace(',', '.')) || 0;
                        totalProjectExpenses += amount;
                    });
                }
            });
        }
        
        console.log('Total des dépenses des projets liés:', totalProjectExpenses);
        
        // Calculer le solde net (solde - dépenses)
        const netBalance = totalBalance - totalProjectExpenses;
        console.log('Solde net des portefeuilles:', netBalance);
        
        // Mettre à jour l'affichage du solde portefeuille
        walletBalanceElements.forEach(el => {
            el.textContent = `${currencySymbol} ${netBalance.toFixed(2).replace('.', ',')}`;
        });
        
        console.log('Mise à jour du solde portefeuille avec le symbole', currencySymbol);
    } catch (error) {
        console.error('Erreur lors de la mise à jour des statistiques de portefeuilles:', error);
    }
    
    // Mise à jour des statistiques mobiles
    try {
        const mobileStatsElements = document.querySelectorAll('.statistics-mobile .stat-value');
        mobileStatsElements.forEach(el => {
            const text = el.textContent;
            if (text && text.match(/[0-9]/)) {
                const numericPart = text.replace(/[^\d.,\-]/g, '').replace(',', '.');
                const amount = parseFloat(numericPart) || 0;
                el.textContent = `${currencySymbol} ${amount.toFixed(2).replace('.', ',')}`;
            }
        });
        
        console.log('Statistiques mobiles mises à jour avec la devise', userPrefs.currency);
    } catch (error) {
        console.error('Erreur lors de la mise à jour des statistiques mobiles:', error);
    }
    
    // Mise à jour de tous les éléments affichant des devises
    console.log('Mise à jour de tous les affichages de devise');
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