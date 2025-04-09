/**
 * Script pour la gestion des paramètres de l'application - version simplifiée
 * 
 * Note: Ce script utilise les fonctions et variables définies dans user-preferences.js
 * pour garantir une cohérence dans la gestion des préférences utilisateur.
 */

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Paramètres page initialized - version simplifiée');
    
    // Initialiser les onglets
    initTabs();
    
    // Initialiser les contrôles spécifiques à la page des paramètres
    initProfileForm();
    
    // Appliquer les préférences utilisateur actuelles
    applyAllPreferences();
    
    // Ajouter l'écouteur pour les boutons de sélection de thème
    initThemeSelectors();
    
    // Ajouter l'écouteur pour les boutons de sélection de langue
    initLanguageSelectors();
});

// Initialise les onglets
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            
            // Désactiver tous les onglets
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.style.display = 'none');
            
            // Activer l'onglet cible
            tab.classList.add('active');
            document.getElementById(target + '-content').style.display = 'block';
        });
    });
    
    // Activer le premier onglet par défaut
    if (tabs.length > 0) {
        tabs[0].click();
    }
}

// Initialise le sélecteur de thème
function initThemeSelectors() {
    // Pour la nouvelle version avec radio buttons
    const lightThemeRadio = document.getElementById('light-theme');
    const darkThemeRadio = document.getElementById('dark-theme');
    
    if (lightThemeRadio && darkThemeRadio) {
        // Mettre le bon radio en fonction des préférences
        if (userPreferences.theme === 'dark') {
            darkThemeRadio.checked = true;
            lightThemeRadio.checked = false;
        } else {
            lightThemeRadio.checked = true;
            darkThemeRadio.checked = false;
        }
        
        // Ajouter des écouteurs d'événements
        lightThemeRadio.addEventListener('change', () => {
            if (lightThemeRadio.checked) {
                userPreferences.theme = 'light';
                applyTheme();
                saveUserPreferences();
            }
        });
        
        darkThemeRadio.addEventListener('change', () => {
            if (darkThemeRadio.checked) {
                userPreferences.theme = 'dark';
                applyTheme();
                saveUserPreferences();
            }
        });
        
        // Ajouter des gestionnaires aux prévisualisations
        const lightThemePreview = document.getElementById('light-theme-preview');
        const darkThemePreview = document.getElementById('dark-theme-preview');
        
        if (lightThemePreview) {
            lightThemePreview.addEventListener('click', () => {
                lightThemeRadio.checked = true;
                darkThemeRadio.checked = false;
                userPreferences.theme = 'light';
                applyTheme();
                saveUserPreferences();
            });
        }
        
        if (darkThemePreview) {
            darkThemePreview.addEventListener('click', () => {
                darkThemeRadio.checked = true;
                lightThemeRadio.checked = false;
                userPreferences.theme = 'dark';
                applyTheme();
                saveUserPreferences();
            });
        }
    }
    
    // Conserver la compatibilité avec la version switch
    const themeSwitch = document.getElementById('themeSwitch');
    if (themeSwitch) {
        themeSwitch.checked = userPreferences.theme === 'dark';
        
        themeSwitch.addEventListener('change', () => {
            userPreferences.theme = themeSwitch.checked ? 'dark' : 'light';
            applyTheme();
            saveUserPreferences();
        });
    }
}

// Fonction pour initialiser le formulaire de profil
function initProfileForm() {
    const saveBtn = document.getElementById('saveProfileBtn');
    const nameInput = document.getElementById('profileNameInput');
    const emailInput = document.getElementById('profileEmailInput');
    const nameDisplay = document.getElementById('profileName');
    const emailDisplay = document.getElementById('profileEmail');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (nameDisplay && nameInput) {
                nameDisplay.textContent = nameInput.value;
            }
            
            if (emailDisplay && emailInput) {
                emailDisplay.textContent = emailInput.value;
            }
            
            showNotification('Profil mis à jour avec succès', 'success');
        });
    }
}

// Affiche une notification
function showNotification(message, type = 'info') {
    const notificationEl = document.getElementById('notification');
    const messageEl = document.getElementById('notificationMessage');
    
    if (notificationEl && messageEl) {
        messageEl.textContent = message;
        
        // Définir le type
        notificationEl.className = 'notification';
        notificationEl.classList.add(type);
        
        // Afficher la notification
        notificationEl.style.display = 'flex';
        
        // Masquer après 3 secondes
        setTimeout(() => {
            notificationEl.style.display = 'none';
        }, 3000);
    }
}

// Initialise le sélecteur de langue
function initLanguageSelectors() {
    const langRadios = document.querySelectorAll('input[name="language"]');
    
    // Sélectionner la langue actuelle
    const current = document.querySelector(`input[name="language"][value="${userPreferences.language}"]`);
    if (current) {
        current.checked = true;
    }
    
    // Ajouter les écouteurs d'événements
    langRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            userPreferences.language = radio.value;
            applyLanguage();
            saveUserPreferences();
        });
    });
}
