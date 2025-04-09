/**
 * Script pour la gestion des paramètres de l'application - version simplifiée
 * 
 * Note: Ce script utilise les préférences utilisateur définies dans l'élément script
 * directement dans la page parametres.html et les fonctions de user-preferences.js
 */

// Déclaration globale des variables et constantes utilisées dans ce script
const USER_PREFS_KEY = 'userPreferences';
const availableCurrencies = window.availableCurrencies || ['EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL', 'RUB', 'KRW', 'TRY', 'MXN', 'IDR', 'PHP', 'MYR', 'SGD', 'THB', 'AED'];

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Paramètres page initialized - version simplifiée');
    
    // Initialiser les onglets
    initTabs();
    
    // Initialiser les contrôles spécifiques à la page des paramètres
    initProfileForm();
    
    // Initialiser les sélecteurs de devise
    initCurrencySelectors();
    
    // Initialiser les fonctionnalités de plan
    initPlanFeatures();
    
    // Ajouter le bouton de conversion
    addConversionButton();
    
    // Ajouter l'écouteur pour les boutons de sélection de thème
    initThemeSelectors();
    
    // Ajouter l'écouteur pour les boutons de sélection de langue
    initLanguageSelectors();
    
    // Appliquer le thème actuel
    applyTheme();
    
    // Appliquer la langue actuelle
    applyLanguage();
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

// Initialise les sélecteurs de devise
function initCurrencySelectors() {
    // Générer les options pour les sélecteurs
    const primaryContainer = document.getElementById('primaryCurrencyContainer');
    const secondaryContainer = document.getElementById('secondaryCurrencyContainer');
    
    if (primaryContainer) {
        primaryContainer.innerHTML = generateCurrencyDropdown('primaryCurrency', userPreferences.currency);
    }
    
    if (secondaryContainer) {
        secondaryContainer.innerHTML = generateCurrencyDropdown('secondaryCurrency', userPreferences.secondaryCurrency);
    }
    
    // Mise à jour de l'aperçu
    updateCurrencyPreview();
    
    // Ajouter les gestionnaires d'événements
    const primarySelect = document.getElementById('primaryCurrency');
    const secondarySelect = document.getElementById('secondaryCurrency');
    
    if (primarySelect) {
        primarySelect.addEventListener('change', () => {
            // Récupérer la valeur sélectionnée
            const selected = primarySelect.value;
            
            // Si la devise principale est la même que la secondaire, permuter
            if (selected === userPreferences.secondaryCurrency && secondarySelect) {
                const old = userPreferences.currency;
                userPreferences.secondaryCurrency = old;
                secondarySelect.value = old;
            }
            
            // Mettre à jour les préférences
            userPreferences.currency = selected;
            
            // Mise à jour de l'aperçu
            updateCurrencyPreview();
            
            // Mise à jour du bouton de conversion
            updateConversionButton();
            
            // Mettre à jour automatiquement tous les projets avec la nouvelle devise
            try {
                // Afficher une notification de début
                showNotification(`Mise à jour des symboles de devise en ${selected} en cours...`, 'info');
                
                // Mise à jour des projets
                convertProjects(selected);
                
                // Mise à jour des portefeuilles
                convertWallets(selected);
                
                // Notification de succès
                showNotification(`Tous les symboles ont été mis à jour en ${selected}`, 'success');
            } catch (error) {
                console.error('Erreur lors de la mise à jour des symboles:', error);
                showNotification('Erreur lors de la mise à jour des symboles', 'error');
            }
            
            // Sauvegarder les préférences
            saveUserPreferences();
        });
    }
    
    if (secondarySelect) {
        secondarySelect.addEventListener('change', () => {
            // Récupérer la valeur sélectionnée
            const selected = secondarySelect.value;
            
            // Si la devise secondaire est la même que la principale, permuter
            if (selected === userPreferences.currency && primarySelect) {
                const old = userPreferences.secondaryCurrency;
                userPreferences.currency = old;
                primarySelect.value = old;
            }
            
            // Mettre à jour les préférences
            userPreferences.secondaryCurrency = selected;
            
            // Mise à jour de l'aperçu
            updateCurrencyPreview();
            
            // Sauvegarder les préférences
            saveUserPreferences();
        });
    }
}

// Met à jour l'aperçu des devises
function updateCurrencyPreview() {
    const preview = document.getElementById('currencyPreview');
    if (!preview) return;
    
    const amount = 100;
    const formattedAmount = formatCurrencyWithEquivalent(amount, userPreferences.currency, userPreferences.secondaryCurrency);
    
    const example = preview.querySelector('.example');
    if (example) {
        example.textContent = formattedAmount;
    }
}

// Génère une liste déroulante de devises
function generateCurrencyDropdown(id, selectedCurrency) {
    // Obtenir les devises depuis currencies.js
    const currencies = window.availableCurrencies || [];
    
    let html = `<select id="${id}" class="form-control">`;
    
    currencies.forEach(curr => {
        const selected = curr === selectedCurrency ? 'selected' : '';
        html += `<option value="${curr}" ${selected}>${curr}</option>`;
    });
    
    html += '</select>';
    return html;
}

// Initialise les fonctionnalités selon le plan
function initPlanFeatures() {
    // Appliquer le plan actuel
    updatePlanDisplay(userPreferences.plan);
    
    // Ajouter des boutons de test pour la démo
    addPlanTestButtons();
}

// Mise à jour de l'affichage selon le plan
function updatePlanDisplay(plan) {
    const usersTab = document.getElementById('usersTab');
    const currentPlanName = document.getElementById('currentPlanName');
    const planBadge = document.querySelector('.current-plan .plan-badge');
    
    // Mettre à jour le nom du plan
    if (currentPlanName) {
        currentPlanName.textContent = plan.charAt(0).toUpperCase() + plan.slice(1);
    }
    
    // Mettre à jour la classe du badge
    if (planBadge) {
        planBadge.className = 'plan-badge ' + plan;
    }
    
    // Masquer ou afficher l'onglet des utilisateurs
    if (usersTab) {
        usersTab.style.display = plan === 'freemium' ? 'none' : 'flex';
    }
}

// Ajoute des boutons de test pour simuler différents plans
function addPlanTestButtons() {
    const subscription = document.getElementById('subscription-content');
    if (!subscription) return;
    
    const container = document.createElement('div');
    container.className = 'test-plan-buttons';
    container.style.marginTop = '20px';
    container.style.padding = '15px';
    container.style.backgroundColor = '#f8fafc';
    container.style.borderRadius = '8px';
    
    container.innerHTML = `
        <h4 style="margin-top: 0;">Mode démo: Tester les différents plans</h4>
        <p style="margin-bottom: 15px;">Ces boutons sont uniquement pour la démonstration.</p>
        <div style="display: flex; gap: 10px;">
            <button id="testFreemiumBtn" class="btn btn-secondary">Freemium</button>
            <button id="testBasicBtn" class="btn btn-secondary">Basic</button>
            <button id="testProBtn" class="btn btn-secondary">Pro</button>
        </div>
    `;
    
    subscription.appendChild(container);
    
    // Ajouter les gestionnaires d'événements
    document.getElementById('testFreemiumBtn').addEventListener('click', () => {
        userPreferences.plan = 'freemium';
        updatePlanDisplay('freemium');
        saveUserPreferences();
    });
    
    document.getElementById('testBasicBtn').addEventListener('click', () => {
        userPreferences.plan = 'basic';
        updatePlanDisplay('basic');
        saveUserPreferences();
    });
    
    document.getElementById('testProBtn').addEventListener('click', () => {
        userPreferences.plan = 'pro';
        updatePlanDisplay('pro');
        saveUserPreferences();
    });
}

// Ajoute un bouton de conversion de devise
function addConversionButton() {
    const currencySettings = document.querySelector('.currency-settings');
    if (!currencySettings) return;
    
    // Vérifier si le bouton existe déjà
    let convertButton = document.getElementById('convertProjectsButton');
    
    // Si le bouton n'existe pas, le créer
    if (!convertButton) {
        convertButton = document.createElement('button');
        convertButton.id = 'convertProjectsButton';
        convertButton.className = 'btn btn-primary mt-20';
        convertButton.style.width = '100%';
        
        // Insérer le bouton après les paramètres de devise
        currencySettings.appendChild(convertButton);
    }
    
    // Mise à jour du texte du bouton
    updateConversionButton();
    
    // Supprimer les gestionnaires d'événements existants
    const newButton = convertButton.cloneNode(true);
    if (convertButton.parentNode) {
        currencySettings.replaceChild(newButton, convertButton);
    }
    
    // Gestionnaire d'événements pour le bouton de conversion
    newButton.addEventListener('click', () => {
        const currency = userPreferences.currency;
        
        // Afficher une notification de début
        showNotification(`Conversion des montants en ${currency} en cours...`, 'info');
        
        // Essayer de convertir tous les projets et portefeuilles
        setTimeout(() => {
            try {
                // Convertir les projets
                convertProjects(currency);
                
                // Convertir les portefeuilles
                convertWallets(currency);
                
                // Afficher une notification de succès
                showNotification(`Tous les montants ont été convertis en ${currency}`, 'success');
                
                // Recharger la page après un délai
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } catch (error) {
                console.error('Erreur lors de la conversion:', error);
                showNotification('Erreur lors de la conversion', 'error');
            }
        }, 500);
    });
}

// Met à jour le texte du bouton de conversion
function updateConversionButton() {
    const button = document.getElementById('convertProjectsButton');
    if (button) {
        const currency = userPreferences.currency;
        button.textContent = `Convertir les montants en ${currency}`;
    }
}

// Formate un montant avec la devise et son équivalent dans une autre devise
function formatCurrencyWithEquivalent(amount, primaryCurrency, secondaryCurrency) {
    // Ceci est un exemple simple, dans une application réelle, il faudrait utiliser des taux de change à jour
    const conversionRates = {
        EUR: 1,
        USD: 1.1,
        GBP: 0.85,
        JPY: 130,
        CAD: 1.45,
        AUD: 1.6,
        CHF: 1.02,
        CNY: 7.5,
        INR: 85,
        BRL: 5.8,
        RUB: 85,
        KRW: 1300,
        TRY: 15,
        MXN: 22,
        IDR: 15500,
        PHP: 55,
        MYR: 4.5,
        SGD: 1.5,
        THB: 35,
        AED: 4.0
    };
    
    // Convertir en EUR comme monnaie intermédiaire
    const amountInEUR = primaryCurrency === 'EUR' ? amount : amount / conversionRates[primaryCurrency];
    const amountInSecondary = amountInEUR * conversionRates[secondaryCurrency];
    
    // Formater avec 2 décimales
    const formattedPrimary = `${primaryCurrency} ${amount.toFixed(2)}`;
    const formattedSecondary = `${secondaryCurrency} ${amountInSecondary.toFixed(2)}`;
    
    return `${formattedPrimary} (≈ ${formattedSecondary})`;
}

// Convertir les projets à la nouvelle devise
function convertProjects(newCurrency) {
    const storedProjects = localStorage.getItem('savedProjects');
    if (!storedProjects) return;
    
    try {
        const projects = JSON.parse(storedProjects);
        
        // Convertir chaque projet
        const convertedProjects = projects.map(project => {
            // Remplacer uniquement les symboles de devise, pas les montants
            if (project.totalBudget && typeof project.totalBudget === 'string') {
                project.totalBudget = project.totalBudget.replace(/^[A-Z]+/, newCurrency);
            }
            
            // Parcourir les catégories
            if (project.categories && Array.isArray(project.categories)) {
                project.categories.forEach(category => {
                    if (category.amount && typeof category.amount === 'string') {
                        category.amount = category.amount.replace(/^[A-Z]+/, newCurrency);
                    }
                    
                    // Parcourir les sous-catégories
                    if (category.subcategories && Array.isArray(category.subcategories)) {
                        category.subcategories.forEach(subcategory => {
                            if (subcategory.amount && typeof subcategory.amount === 'string') {
                                subcategory.amount = subcategory.amount.replace(/^[A-Z]+/, newCurrency);
                            }
                            
                            // Parcourir les lignes
                            if (subcategory.lines && Array.isArray(subcategory.lines)) {
                                subcategory.lines.forEach(line => {
                                    if (line.amount && typeof line.amount === 'string') {
                                        line.amount = line.amount.replace(/^[A-Z]+/, newCurrency);
                                    }
                                });
                            }
                        });
                    }
                });
            }
            
            return project;
        });
        
        // Sauvegarder les projets convertis
        localStorage.setItem('savedProjects', JSON.stringify(convertedProjects));
        
        return true;
    } catch (error) {
        console.error('Erreur lors de la conversion des projets:', error);
        return false;
    }
}

// Convertir les portefeuilles à la nouvelle devise
function convertWallets(newCurrency) {
    const storedWallets = localStorage.getItem('mapocket_wallets');
    if (!storedWallets) return;
    
    try {
        const wallets = JSON.parse(storedWallets);
        
        // Convertir chaque portefeuille
        const convertedWallets = wallets.map(wallet => {
            // Remplacer uniquement les symboles de devise, pas les montants
            if (wallet.balance && typeof wallet.balance === 'string') {
                wallet.balance = wallet.balance.replace(/^[A-Z]+/, newCurrency);
            }
            
            // Parcourir les transactions
            if (wallet.transactions && Array.isArray(wallet.transactions)) {
                wallet.transactions.forEach(transaction => {
                    if (transaction.amount && typeof transaction.amount === 'string') {
                        transaction.amount = transaction.amount.replace(/^[A-Z]+/, newCurrency);
                    }
                });
            }
            
            return wallet;
        });
        
        // Sauvegarder les portefeuilles convertis
        localStorage.setItem('mapocket_wallets', JSON.stringify(convertedWallets));
        
        return true;
    } catch (error) {
        console.error('Erreur lors de la conversion des portefeuilles:', error);
        return false;
    }
}

// Fonction pour appliquer le thème (implémentée ici pour assurer la compatibilité)
function applyTheme() {
    const isDarkMode = userPreferences.theme === 'dark';
    document.body.classList.toggle('dark-mode', isDarkMode);
    
    // Mettre à jour le switch si présent
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

// Fonction pour appliquer la langue
function applyLanguage() {
    const currentLang = userPreferences.language;
    document.documentElement.lang = currentLang;
    
    // Mettre à jour le sélecteur de langue
    const langRadios = document.querySelectorAll('input[name="language"]');
    langRadios.forEach(radio => {
        radio.checked = radio.value === currentLang;
    });
    
    // Appliquer la traduction en fonction de la langue
    if (currentLang === 'en') {
        translatePageToEnglish();
    } else {
        translatePageToFrench();
    }
    
    console.log('Language applied:', currentLang);
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

// Fonction de traduction en anglais
function translatePageToEnglish() {
    try {
        // Traduire les onglets
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
            }
        });
        
        document.querySelectorAll('p').forEach(p => {
            if (p.textContent.includes('Personnalisez')) {
                p.textContent = 'Personalize your MaPocket experience';
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
        // Traduire les onglets
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
            }
        });
        
        document.querySelectorAll('p').forEach(p => {
            if (p.textContent.includes('Personalize your')) {
                p.textContent = 'Personnalisez votre expérience MaPocket';
            }
        });
        
        console.log('Page traduite en français');
    } catch (error) {
        console.error('Erreur lors de la traduction en français:', error);
    }
}
