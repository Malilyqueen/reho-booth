// Gestion des préférences utilisateur globales pour MaPocket
// Ce fichier est inclus dans toutes les pages pour assurer la cohérence des préférences utilisateur

const USER_PREFS_KEY = 'userPreferences';

// Préférences par défaut
const defaultPreferences = {
    theme: 'light',
    fontSize: 'medium',
    language: 'fr',
    dateFormat: 'DD/MM/YYYY',
    plan: 'freemium',
    currency: 'EUR',
    secondaryCurrency: 'USD'
};

// Vérifier si userPreferences existe déjà (définie dans main.js)
// Si non, la définir ici
if (typeof userPreferences === 'undefined') {
    // Charger les préférences existantes ou utiliser les valeurs par défaut
    var userPreferences = loadUserPreferences();
}

// Fonction pour charger les préférences
function loadUserPreferences() {
    try {
        const savedPrefs = localStorage.getItem(USER_PREFS_KEY);
        
        if (savedPrefs) {
            return JSON.parse(savedPrefs);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des préférences utilisateur:', error);
    }
    
    return { ...defaultPreferences };
}

// Fonction pour sauvegarder les préférences
function saveUserPreferences() {
    try {
        localStorage.setItem(USER_PREFS_KEY, JSON.stringify(userPreferences));
        console.log('Préférences utilisateur sauvegardées:', userPreferences);
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des préférences utilisateur:', error);
    }
}

// Fonction pour appliquer le thème
function applyTheme() {
    const isDarkMode = userPreferences.theme === 'dark';
    document.body.classList.toggle('dark-mode', isDarkMode);
    
    // Mettre à jour les éléments spécifiques si nécessaire
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
    
    console.log('Theme applied:', isDarkMode ? 'dark' : 'light');
}

// Fonction pour appliquer la taille de police
function applyFontSize() {
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add('font-' + userPreferences.fontSize);
}

// Fonction pour appliquer la langue
function applyLanguage() {
    const currentLang = userPreferences.language;
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
        // Restaurer le français (langue par défaut)
        translatePageToFrench();
    }
    
    console.log('Language applied:', currentLang);
}

// Fonction de traduction en anglais
function translatePageToEnglish() {
    try {
        // Traduire le menu principal
        document.querySelectorAll('.main-nav a .menu-text').forEach(item => {
            if (item.textContent.includes('Tableau de bord')) {
                item.textContent = 'Dashboard';
            } else if (item.textContent.includes('Mes Projets')) {
                item.textContent = 'My Projects';
            } else if (item.textContent.includes('Mon Portefeuille')) {
                item.textContent = 'My Wallet';
            } else if (item.textContent.includes('Objectifs & Défis')) {
                item.textContent = 'Goals & Challenges';
            } else if (item.textContent.includes('Projets partagés')) {
                item.textContent = 'Shared Projects';
            } else if (item.textContent.includes('Liste des souhaits')) {
                item.textContent = 'Wishlist';
            } else if (item.textContent.includes('Produits partenaires')) {
                item.textContent = 'Partner Products';
            } else if (item.textContent.includes('Suggestions')) {
                item.textContent = 'AI Suggestions';
            } else if (item.textContent.includes('Assistant')) {
                item.textContent = 'Project Assistant';
            } else if (item.textContent.includes('MaPocket Pro')) {
                item.textContent = 'MaPocket Pro';
            } else if (item.textContent.includes('Paramètres')) {
                item.textContent = 'Settings';
            }
        });
        
        // Traduire les onglets si présents
        document.querySelectorAll('.tab-btn').forEach(tab => {
            const tabContent = tab.textContent.trim();
            if (tabContent.includes('Profil')) {
                tab.innerHTML = tab.innerHTML.replace('Profil', 'Profile');
            } else if (tabContent.includes('Apparence')) {
                tab.innerHTML = tab.innerHTML.replace('Apparence', 'Appearance');
            } else if (tabContent.includes('Sécurité')) {
                tab.innerHTML = tab.innerHTML.replace('Sécurité', 'Security');
            } else if (tabContent.includes('Utilisateurs')) {
                tab.innerHTML = tab.innerHTML.replace('Utilisateurs', 'Users');
            } else if (tabContent.includes('Abonnement')) {
                tab.innerHTML = tab.innerHTML.replace('Abonnement', 'Subscription');
            } else if (tabContent.includes('Notifications')) {
                tab.innerHTML = tab.innerHTML.replace('Notifications', 'Notifications');
            }
        });
        
        // Traduire les titres de section et textes communs
        document.querySelectorAll('h1, h2').forEach(h => {
            if (h.textContent.includes('Paramètres')) {
                h.textContent = h.textContent.replace('Paramètres', 'Settings');
            } else if (h.textContent.includes('Tableau de bord')) {
                h.textContent = h.textContent.replace('Tableau de bord', 'Dashboard');
            } else if (h.textContent.includes('Mes Projets')) {
                h.textContent = h.textContent.replace('Mes Projets', 'My Projects');
            }
        });
        
        console.log('Page traduite en anglais');
    } catch (error) {
        console.error('Erreur lors de la traduction en anglais:', error);
    }
}

// Fonction de traduction en français
function translatePageToFrench() {
    try {
        // Traduire le menu principal
        document.querySelectorAll('.main-nav a .menu-text').forEach(item => {
            if (item.textContent.includes('Dashboard')) {
                item.textContent = 'Tableau de bord';
            } else if (item.textContent.includes('My Projects')) {
                item.textContent = 'Mes Projets';
            } else if (item.textContent.includes('My Wallet')) {
                item.textContent = 'Mon Portefeuille';
            } else if (item.textContent.includes('Goals & Challenges')) {
                item.textContent = 'Objectifs & Défis';
            } else if (item.textContent.includes('Shared Projects')) {
                item.textContent = 'Projets partagés';
            } else if (item.textContent.includes('Wishlist')) {
                item.textContent = 'Liste des souhaits';
            } else if (item.textContent.includes('Partner Products')) {
                item.textContent = 'Produits partenaires';
            } else if (item.textContent.includes('AI Suggestions')) {
                item.textContent = 'Suggestions IA';
            } else if (item.textContent.includes('Project Assistant')) {
                item.textContent = 'Assistant création de projet';
            } else if (item.textContent.includes('MaPocket Pro')) {
                item.textContent = 'MaPocket Pro';
            } else if (item.textContent.includes('Settings')) {
                item.textContent = 'Paramètres';
            }
        });
        
        // Traduire les onglets si présents
        document.querySelectorAll('.tab-btn').forEach(tab => {
            const tabContent = tab.textContent.trim();
            if (tabContent.includes('Profile')) {
                tab.innerHTML = tab.innerHTML.replace('Profile', 'Profil');
            } else if (tabContent.includes('Appearance')) {
                tab.innerHTML = tab.innerHTML.replace('Appearance', 'Apparence');
            } else if (tabContent.includes('Security')) {
                tab.innerHTML = tab.innerHTML.replace('Security', 'Sécurité');
            } else if (tabContent.includes('Users')) {
                tab.innerHTML = tab.innerHTML.replace('Users', 'Utilisateurs');
            } else if (tabContent.includes('Subscription')) {
                tab.innerHTML = tab.innerHTML.replace('Subscription', 'Abonnement');
            } else if (tabContent.includes('Notifications')) {
                tab.innerHTML = tab.innerHTML.replace('Notifications', 'Notifications');
            }
        });
        
        // Traduire les titres de section et textes communs
        document.querySelectorAll('h1, h2').forEach(h => {
            if (h.textContent.includes('Settings')) {
                h.textContent = h.textContent.replace('Settings', 'Paramètres');
            } else if (h.textContent.includes('Dashboard')) {
                h.textContent = h.textContent.replace('Dashboard', 'Tableau de bord');
            } else if (h.textContent.includes('My Projects')) {
                h.textContent = h.textContent.replace('My Projects', 'Mes Projets');
            }
        });
        
        console.log('Page traduite en français');
    } catch (error) {
        console.error('Erreur lors de la traduction en français:', error);
    }
}

// Fonction pour mettre à jour toutes les préférences
function applyAllPreferences() {
    applyTheme();
    applyFontSize();
    applyLanguage();
}

// Ajouter un gestionnaire pour le changement de préférences
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les préférences
    applyAllPreferences();
    
    // Vérifier s'il y a des éléments de sélection de préférences sur la page
    const themeSelectors = document.querySelectorAll('input[name="theme"]');
    if (themeSelectors.length > 0) {
        themeSelectors.forEach(selector => {
            selector.addEventListener('change', () => {
                if (selector.checked) {
                    userPreferences.theme = selector.value;
                    applyTheme();
                    saveUserPreferences();
                }
            });
        });
    }
    
    const fontSizeButtons = document.querySelectorAll('.font-size-btn');
    if (fontSizeButtons.length > 0) {
        fontSizeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const size = btn.dataset.size;
                userPreferences.fontSize = size;
                applyFontSize();
                saveUserPreferences();
                
                // Mettre à jour l'UI
                fontSizeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
    
    const langRadios = document.querySelectorAll('input[name="language"]');
    if (langRadios.length > 0) {
        langRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                userPreferences.language = radio.value;
                applyLanguage();
                saveUserPreferences();
            });
        });
    }
    
    console.log('Gestionnaires de préférences utilisateur initialisés');
});

// Charger les préférences au démarrage
console.log('Préférences utilisateur chargées:', userPreferences);