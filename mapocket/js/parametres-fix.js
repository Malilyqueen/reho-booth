/**
 * Script pour la gestion des paramètres de l'application - version simplifiée
 */

// Préférences par défaut
let userPreferences = {
    theme: 'light',
    fontSize: 'medium',
    language: 'fr',
    dateFormat: 'DD/MM/YYYY',
    currency: 'EUR',
    secondaryCurrency: 'USD',
    plan: 'freemium'
};

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Paramètres page initialized - version simplifiée');
    
    // Charger les préférences
    loadUserPreferences();
    
    // Initialiser les onglets
    initTabs();
    
    // Initialiser les contrôles
    initThemeSelector();
    initFontSizeSelector();
    initLanguageSelector();
    initCurrencySelectors();
    initProfileForm();
    initPlanFeatures();
    
    // Ajouter le bouton de conversion
    addConversionButton();
});

// Charge les préférences utilisateur du localStorage
function loadUserPreferences() {
    try {
        const saved = localStorage.getItem('userPreferences');
        if (saved) {
            userPreferences = JSON.parse(saved);
            console.log('Préférences utilisateur chargées:', userPreferences);
        }
        
        // Appliquer les préférences
        applyTheme();
        applyFontSize();
        applyLanguage();
    } catch (error) {
        console.error('Erreur lors du chargement des préférences:', error);
    }
}

// Sauvegarde les préférences utilisateur dans localStorage
function saveUserPreferences() {
    try {
        localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
        console.log('Préférences utilisateur sauvegardées:', userPreferences);
        showNotification('Préférences sauvegardées', 'success');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des préférences:', error);
        showNotification('Erreur lors de la sauvegarde', 'error');
    }
}

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
function initThemeSelector() {
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

// Applique le thème actuel
function applyTheme() {
    const isDarkMode = userPreferences.theme === 'dark';
    document.body.classList.toggle('dark-mode', isDarkMode);
    
    // Mettre à jour l'élément HTML (le switch)
    const themeSwitch = document.getElementById('themeSwitch');
    if (themeSwitch) {
        themeSwitch.checked = isDarkMode;
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

// Initialise le sélecteur de taille de police
function initFontSizeSelector() {
    const fontButtons = document.querySelectorAll('.font-size-btn');
    
    // Appliquer la taille actuelle
    fontButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.size === userPreferences.fontSize);
        
        btn.addEventListener('click', () => {
            const size = btn.dataset.size;
            
            // Mettre à jour l'UI
            fontButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Mettre à jour les préférences
            userPreferences.fontSize = size;
            applyFontSize();
            saveUserPreferences();
        });
    });
}

// Applique la taille de police
function applyFontSize() {
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add('font-' + userPreferences.fontSize);
}

// Initialise le sélecteur de langue
function initLanguageSelector() {
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

// Applique les paramètres de langue
function applyLanguage() {
    const currentLang = userPreferences.language;
    document.documentElement.lang = currentLang;
    
    // Mettre à jour le sélecteur de langue
    const langRadios = document.querySelectorAll('input[name="language"]');
    langRadios.forEach(radio => {
        radio.checked = radio.value === currentLang;
    });
    
    // Simuler un changement de langue pour la démo
    if (currentLang === 'en') {
        translatePageToEnglish();
    } else {
        // Restaurer le français (langue par défaut)
        translatePageToFrench();
    }
    
    console.log('Language applied:', currentLang);
}

// Fonction de traduction en anglais pour la démo
function translatePageToEnglish() {
    try {
        // Traduire les onglets
        document.querySelectorAll('.tab-btn').forEach(tab => {
            const tabContent = tab.textContent.trim();
            if (tabContent.includes('Profil')) {
                tab.innerHTML = `<i class="fas fa-user"></i> Profile`;
            } else if (tabContent.includes('Apparence')) {
                tab.innerHTML = `<i class="fas fa-palette"></i> Appearance`;
            } else if (tabContent.includes('Sécurité')) {
                tab.innerHTML = `<i class="fas fa-shield-alt"></i> Security`;
            } else if (tabContent.includes('Utilisateurs')) {
                tab.innerHTML = `<i class="fas fa-users"></i> Users`;
            } else if (tabContent.includes('Abonnement')) {
                tab.innerHTML = `<i class="fas fa-crown"></i> Subscription`;
            } else if (tabContent.includes('Notifications')) {
                tab.innerHTML = `<i class="fas fa-bell"></i> Notifications`;
            }
        });
        
        // Traduire les titres et descriptions des sections pour la page paramètres
        document.querySelectorAll('h2').forEach(h2 => {
            if (h2.textContent.includes('Paramètres')) {
                h2.textContent = 'Settings';
            }
        });
        
        document.querySelectorAll('p').forEach(p => {
            if (p.textContent.includes('Personnalisez')) {
                p.textContent = 'Personalize your MaPocket experience';
            }
        });
        
        // Traduire les éléments du profil
        document.querySelectorAll('label').forEach(label => {
            if (label.textContent.includes('Nom complet')) {
                label.textContent = 'Full name';
            } else if (label.textContent.includes('Adresse e-mail')) {
                label.textContent = 'Email address';
            } else if (label.textContent.includes('Téléphone')) {
                label.textContent = 'Phone (optional)';
            }
        });
        
        // Traduire les boutons
        document.querySelectorAll('button').forEach(button => {
            if (button.textContent.includes('Enregistrer')) {
                button.textContent = 'Save';
            }
        });
        
        // Traduire les sections spécifiques
        document.querySelectorAll('h4').forEach(h4 => {
            switch(h4.textContent.trim()) {
                case 'Thème':
                    h4.textContent = 'Theme';
                    break;
                case 'Taille de police':
                    h4.textContent = 'Font size';
                    break;
                case 'Langue':
                    h4.textContent = 'Language';
                    break;
                case 'Devise':
                    h4.textContent = 'Currency';
                    break;
                case 'Fonctionnalités incluses :':
                    h4.textContent = 'Included features:';
                    break;
            }
        });
        
        // Traduire certains paragraphes spécifiques
        document.querySelectorAll('p').forEach(p => {
            if (p.textContent.includes('Choisissez entre le mode clair et sombre')) {
                p.textContent = 'Choose between light and dark mode';
            } else if (p.textContent.includes('Définissez votre devise préférée')) {
                p.textContent = 'Set your preferred currency for all projects';
            } else if (p.textContent.includes('Vous utilisez actuellement le plan')) {
                p.textContent = 'You are currently using the Freemium plan with limited features.';
            }
        });
        
        // Traduire les éléments de liste d'abonnement
        document.querySelectorAll('.features-list li').forEach(li => {
            const text = li.textContent.trim();
            if (text.includes('1 projet maximum')) {
                li.innerHTML = '<i class="fas fa-check"></i> 1 project maximum';
            } else if (text.includes('Fonctionnalités de base')) {
                li.innerHTML = '<i class="fas fa-check"></i> Basic budget management features';
            } else if (text.includes('Accès à la version mobile')) {
                li.innerHTML = '<i class="fas fa-check"></i> Mobile version access';
            }
        });
        
        console.log('Page traduite en anglais');
    } catch (error) {
        console.error('Erreur lors de la traduction en anglais:', error);
    }
}

// Fonction de traduction en français pour la démo
function translatePageToFrench() {
    try {
        // Restaurer les onglets
        document.querySelectorAll('.tab-btn').forEach(tab => {
            const tabContent = tab.textContent.trim();
            if (tabContent.includes('Profile')) {
                tab.innerHTML = `<i class="fas fa-user"></i> Profil`;
            } else if (tabContent.includes('Appearance')) {
                tab.innerHTML = `<i class="fas fa-palette"></i> Apparence`;
            } else if (tabContent.includes('Security')) {
                tab.innerHTML = `<i class="fas fa-shield-alt"></i> Sécurité`;
            } else if (tabContent.includes('Users')) {
                tab.innerHTML = `<i class="fas fa-users"></i> Utilisateurs`;
            } else if (tabContent.includes('Subscription')) {
                tab.innerHTML = `<i class="fas fa-crown"></i> Abonnement`;
            } else if (tabContent.includes('Notifications')) {
                tab.innerHTML = `<i class="fas fa-bell"></i> Notifications`;
            }
        });
        
        // Restaurer les titres et descriptions des sections
        document.querySelectorAll('h2').forEach(h2 => {
            if (h2.textContent.includes('Settings')) {
                h2.textContent = 'Paramètres';
            }
        });
        
        document.querySelectorAll('p').forEach(p => {
            if (p.textContent.includes('Personalize your')) {
                p.textContent = 'Personnalisez votre expérience MaPocket';
            }
        });
        
        // Restaurer les éléments du profil
        document.querySelectorAll('label').forEach(label => {
            if (label.textContent.includes('Full name')) {
                label.textContent = 'Nom complet';
            } else if (label.textContent.includes('Email address')) {
                label.textContent = 'Adresse e-mail';
            } else if (label.textContent.includes('Phone')) {
                label.textContent = 'Téléphone (optionnel)';
            }
        });
        
        // Restaurer les boutons
        document.querySelectorAll('button').forEach(button => {
            if (button.textContent.includes('Save')) {
                button.textContent = 'Enregistrer';
            }
        });
        
        // Restaurer les sections spécifiques
        document.querySelectorAll('h4').forEach(h4 => {
            switch(h4.textContent.trim()) {
                case 'Theme':
                    h4.textContent = 'Thème';
                    break;
                case 'Font size':
                    h4.textContent = 'Taille de police';
                    break;
                case 'Language':
                    h4.textContent = 'Langue';
                    break;
                case 'Currency':
                    h4.textContent = 'Devise';
                    break;
                case 'Included features:':
                    h4.textContent = 'Fonctionnalités incluses :';
                    break;
            }
        });
        
        // Restaurer certains paragraphes spécifiques
        document.querySelectorAll('p').forEach(p => {
            if (p.textContent.includes('Choose between light and dark mode')) {
                p.textContent = 'Choisissez entre le mode clair et sombre';
            } else if (p.textContent.includes('Set your preferred currency')) {
                p.textContent = 'Définissez votre devise préférée pour tous les projets';
            } else if (p.textContent.includes('You are currently using the')) {
                p.textContent = 'Vous utilisez actuellement le plan Freemium avec des fonctionnalités limitées.';
            }
        });
        
        // Restaurer les éléments de liste d'abonnement
        document.querySelectorAll('.features-list li').forEach(li => {
            const text = li.textContent.trim();
            if (text.includes('1 project maximum')) {
                li.innerHTML = '<i class="fas fa-check"></i> 1 projet maximum';
            } else if (text.includes('Basic budget management')) {
                li.innerHTML = '<i class="fas fa-check"></i> Fonctionnalités de base de gestion de budget';
            } else if (text.includes('Mobile version access')) {
                li.innerHTML = '<i class="fas fa-check"></i> Accès à la version mobile';
            }
        });
        
        console.log('Page traduite en français');
    } catch (error) {
        console.error('Erreur lors de la traduction en français:', error);
    }
}

// Fonction utilitaire pour traduire un élément
function translateElement(selector, text) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = text;
    }
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

// Initialise le formulaire de profil
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
        const currencyInfo = AVAILABLE_CURRENCIES.find(c => c.code === currency);
        const currencyName = currencyInfo ? currencyInfo.name : currency;
        
        button.innerHTML = `<i class="fas fa-sync-alt"></i> Convertir tous les montants en ${currencyName}`;
    }
}

// Convertit tous les projets dans la devise spécifiée
function convertProjects(currencyCode) {
    // Récupérer les projets
    const storedProjects = localStorage.getItem('savedProjects');
    if (!storedProjects) return;
    
    try {
        // Analyser les projets
        const projects = JSON.parse(storedProjects);
        
        // Convertir chaque projet
        const convertedProjects = projects.map(project => {
            return convertProject(project, currencyCode);
        });
        
        // Enregistrer les projets convertis
        localStorage.setItem('savedProjects', JSON.stringify(convertedProjects));
        
        console.log(`${convertedProjects.length} projets convertis en ${currencyCode}`);
    } catch (error) {
        console.error('Erreur lors de la conversion des projets:', error);
        throw error;
    }
}

// Convertit un projet dans la devise spécifiée
function convertProject(project, currencyCode) {
    // Détecter la devise actuelle du projet
    let fromCurrency = detectProjectCurrency(project);
    
    // Si la devise est déjà celle demandée, ne rien faire
    if (fromCurrency === currencyCode) {
        return project;
    }
    
    // Cloner le projet pour éviter de modifier l'original
    const convertedProject = JSON.parse(JSON.stringify(project));
    
    // Option 1: Conversion réelle avec taux de change
    const doRealConversion = false; // Mettre à true pour convertir les valeurs
    
    // Obtenir le taux de conversion si nécessaire
    const rate = doRealConversion ? getExchangeRate(fromCurrency, currencyCode) : 1;
    
    // Obtenir le symbole de la nouvelle devise
    const newCurrencySymbol = getCurrencySymbol(currencyCode);
    
    // Convertir le budget total
    if (convertedProject.totalBudget) {
        if (doRealConversion) {
            // Conversion réelle des montants
            const amount = extractNumericValue(convertedProject.totalBudget);
            convertedProject.totalBudget = formatCurrency(amount * rate, currencyCode);
        } else {
            // Juste remplacer le symbole sans changer la valeur
            const amount = convertedProject.totalBudget.replace(/[^0-9.,\s]/g, '').trim();
            convertedProject.totalBudget = `${newCurrencySymbol} ${amount}`;
        }
    }
    
    // Convertir les catégories
    if (convertedProject.categories && Array.isArray(convertedProject.categories)) {
        convertedProject.categories.forEach(category => {
            // Convertir le montant de la catégorie
            if (category.amount) {
                if (doRealConversion) {
                    // Conversion réelle des montants
                    const amount = extractNumericValue(category.amount);
                    category.amount = formatCurrency(amount * rate, currencyCode);
                } else {
                    // Juste remplacer le symbole sans changer la valeur
                    const amount = category.amount.replace(/[^0-9.,\s]/g, '').trim();
                    category.amount = `${newCurrencySymbol} ${amount}`;
                }
            }
            
            // Convertir les sous-catégories
            if (category.subcategories && Array.isArray(category.subcategories)) {
                category.subcategories.forEach(subcategory => {
                    if (subcategory.amount) {
                        if (doRealConversion) {
                            // Conversion réelle des montants
                            const amount = extractNumericValue(subcategory.amount);
                            subcategory.amount = formatCurrency(amount * rate, currencyCode);
                        } else {
                            // Juste remplacer le symbole sans changer la valeur
                            const amount = subcategory.amount.replace(/[^0-9.,\s]/g, '').trim();
                            subcategory.amount = `${newCurrencySymbol} ${amount}`;
                        }
                    }
                    
                    // Convertir les lignes
                    if (subcategory.lines && Array.isArray(subcategory.lines)) {
                        subcategory.lines.forEach(line => {
                            if (line.amount) {
                                if (doRealConversion) {
                                    // Conversion réelle des montants
                                    const amount = extractNumericValue(line.amount);
                                    line.amount = formatCurrency(amount * rate, currencyCode);
                                } else {
                                    // Juste remplacer le symbole sans changer la valeur
                                    const amount = line.amount.replace(/[^0-9.,\s]/g, '').trim();
                                    line.amount = `${newCurrencySymbol} ${amount}`;
                                }
                            }
                        });
                    }
                });
            }
        });
    }
    
    // Convertir les dépenses réelles
    if (convertedProject.realExpenses && Array.isArray(convertedProject.realExpenses)) {
        convertedProject.realExpenses.forEach(expense => {
            if (expense.amount !== undefined) {
                if (doRealConversion) {
                    // Conversion réelle des montants
                    const amount = typeof expense.amount === 'string' ? 
                        extractNumericValue(expense.amount) : expense.amount;
                    
                    expense.amount = amount * rate;
                    // Formater le montant avec le nouveau symbole
                    if (expense.formattedAmount) {
                        expense.formattedAmount = formatCurrency(expense.amount, currencyCode);
                    }
                } else {
                    // Juste mettre à jour le symbole pour formattedAmount si présent
                    if (expense.formattedAmount) {
                        const numericAmount = typeof expense.amount === 'string' ? 
                            extractNumericValue(expense.amount) : expense.amount;
                        expense.formattedAmount = `${newCurrencySymbol} ${numericAmount.toFixed(2)}`;
                    }
                    // Ne pas modifier la valeur numérique réelle (expense.amount)
                }
            }
        });
    }
    
    return convertedProject;
}

// Détecte la devise actuelle d'un projet
function detectProjectCurrency(project) {
    // Si le projet a une propriété de devise explicite, l'utiliser
    if (project.currency) {
        return project.currency;
    }
    
    // Sinon, essayer de détecter la devise à partir du budget total
    if (project.totalBudget) {
        const budget = project.totalBudget.toString();
        
        // Chercher les symboles ou codes de devise courants
        if (budget.includes('€') || budget.includes('EUR')) return 'EUR';
        if (budget.includes('$') || budget.includes('USD')) return 'USD';
        if (budget.includes('£') || budget.includes('GBP')) return 'GBP';
        if (budget.includes('¥') || budget.includes('JPY') || budget.includes('CNY')) {
            // Distinction entre JPY et CNY est difficile sans contexte
            return budget.includes('CNY') ? 'CNY' : 'JPY';
        }
        if (budget.includes('F CFA') || budget.includes('FCFA') || budget.includes('XAF')) return 'XAF';
        if (budget.includes('MAD') || budget.includes('DH')) return 'MAD';
        if (budget.includes('Ar') || budget.includes('MGA')) return 'MGA';
    }
    
    // Par défaut, supposer que c'est l'euro
    return 'EUR';
}

// Convertit tous les portefeuilles dans la devise spécifiée
function convertWallets(currencyCode) {
    // Récupérer les portefeuilles
    const storedWallets = localStorage.getItem('mapocket_wallets');
    if (!storedWallets) return;
    
    try {
        // Analyser les portefeuilles
        const wallets = JSON.parse(storedWallets);
        
        // Convertir chaque portefeuille
        const convertedWallets = wallets.map(wallet => {
            return convertWallet(wallet, currencyCode);
        });
        
        // Enregistrer les portefeuilles convertis
        localStorage.setItem('mapocket_wallets', JSON.stringify(convertedWallets));
        
        console.log(`${convertedWallets.length} portefeuilles convertis en ${currencyCode}`);
    } catch (error) {
        console.error('Erreur lors de la conversion des portefeuilles:', error);
        throw error;
    }
}

// Convertit un portefeuille dans la devise spécifiée
function convertWallet(wallet, currencyCode) {
    // Détecter la devise actuelle du portefeuille
    let fromCurrency = detectWalletCurrency(wallet);
    
    // Si la devise est déjà celle demandée, ne rien faire
    if (fromCurrency === currencyCode) {
        return wallet;
    }
    
    // Cloner le portefeuille pour éviter de modifier l'original
    const convertedWallet = JSON.parse(JSON.stringify(wallet));
    
    // Option 1: Conversion réelle avec taux de change
    const doRealConversion = false; // Mettre à true pour convertir les valeurs
    
    // Obtenir le taux de conversion si nécessaire
    const rate = doRealConversion ? getExchangeRate(fromCurrency, currencyCode) : 1;
    
    // Obtenir le symbole de la nouvelle devise
    const newCurrencySymbol = getCurrencySymbol(currencyCode);
    
    // Mettre à jour le symbole de la devise
    convertedWallet.currency = newCurrencySymbol;
    
    // Convertir le solde
    if (convertedWallet.balance !== undefined) {
        if (doRealConversion) {
            // Conversion réelle des montants
            convertedWallet.balance = convertedWallet.balance * rate;
        }
        // Si doRealConversion est false, on garde le solde tel quel
    }
    
    // Convertir les transactions
    if (convertedWallet.transactions && Array.isArray(convertedWallet.transactions)) {
        convertedWallet.transactions.forEach(transaction => {
            if (transaction.amount !== undefined) {
                if (doRealConversion) {
                    // Conversion réelle des montants
                    transaction.amount = transaction.amount * rate;
                }
                // Si doRealConversion est false, on garde les montants tels quels
                
                // Mettre à jour le symbole dans formattedAmount si présent
                if (transaction.formattedAmount) {
                    if (typeof transaction.formattedAmount === 'string') {
                        const amount = transaction.formattedAmount.replace(/[^0-9.,\s]/g, '').trim();
                        transaction.formattedAmount = `${newCurrencySymbol} ${amount}`;
                    }
                }
            }
        });
    }
    
    return convertedWallet;
}

// Détecte la devise actuelle d'un portefeuille
function detectWalletCurrency(wallet) {
    // Si le portefeuille a une propriété de devise explicite, essayer de la mapper
    if (wallet.currency) {
        switch (wallet.currency) {
            case '€': return 'EUR';
            case '$': return 'USD';
            case '£': return 'GBP';
            case '¥': return 'JPY';  // Peut être JPY ou CNY
            default: {
                // Chercher dans les devises disponibles
                const currency = AVAILABLE_CURRENCIES.find(c => c.symbol === wallet.currency);
                if (currency) return currency.code;
                
                // Par défaut, supposer que c'est l'euro
                return 'EUR';
            }
        }
    }
    
    // Par défaut, supposer que c'est l'euro
    return 'EUR';
}

// Extrait la valeur numérique d'une chaîne monétaire
function extractNumericValue(amountString) {
    if (typeof amountString !== 'string') {
        return parseFloat(amountString) || 0;
    }
    
    // Supprimer tout ce qui n'est pas un chiffre, un point ou une virgule
    const numericString = amountString.replace(/[^0-9.,]/g, '');
    
    // Normaliser les séparateurs décimaux
    const normalized = numericString.replace(',', '.');
    
    return parseFloat(normalized) || 0;
}

// Affiche une notification
function showNotification(message, type = 'info') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = type === 'success' ? '#22c55e' : 
                                      type === 'error' ? '#ef4444' : 
                                      type === 'warning' ? '#f59e0b' : '#3b82f6';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    notification.style.zIndex = '1000';
    
    notification.textContent = message;
    
    // Ajouter au DOM
    document.body.appendChild(notification);
    
    // Supprimer après un délai
    setTimeout(() => {
        notification.remove();
    }, 5000);
}