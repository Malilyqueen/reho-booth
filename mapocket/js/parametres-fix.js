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
    const themeSwitch = document.getElementById('themeSwitch');
    if (!themeSwitch) return;
    
    themeSwitch.checked = userPreferences.theme === 'dark';
    
    themeSwitch.addEventListener('change', () => {
        userPreferences.theme = themeSwitch.checked ? 'dark' : 'light';
        applyTheme();
        saveUserPreferences();
    });
}

// Applique le thème actuel
function applyTheme() {
    document.body.classList.toggle('dark-mode', userPreferences.theme === 'dark');
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
    document.documentElement.lang = userPreferences.language;
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
    
    // Obtenir le taux de conversion
    const rate = getExchangeRate(fromCurrency, currencyCode);
    
    // Convertir le budget total
    if (convertedProject.totalBudget) {
        const amount = extractNumericValue(convertedProject.totalBudget);
        convertedProject.totalBudget = formatCurrency(amount * rate, currencyCode);
    }
    
    // Convertir les catégories
    if (convertedProject.categories && Array.isArray(convertedProject.categories)) {
        convertedProject.categories.forEach(category => {
            // Convertir le montant de la catégorie
            if (category.amount) {
                const amount = extractNumericValue(category.amount);
                category.amount = formatCurrency(amount * rate, currencyCode);
            }
            
            // Convertir les sous-catégories
            if (category.subcategories && Array.isArray(category.subcategories)) {
                category.subcategories.forEach(subcategory => {
                    if (subcategory.amount) {
                        const amount = extractNumericValue(subcategory.amount);
                        subcategory.amount = formatCurrency(amount * rate, currencyCode);
                    }
                    
                    // Convertir les lignes
                    if (subcategory.lines && Array.isArray(subcategory.lines)) {
                        subcategory.lines.forEach(line => {
                            if (line.amount) {
                                const amount = extractNumericValue(line.amount);
                                line.amount = formatCurrency(amount * rate, currencyCode);
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
                const amount = typeof expense.amount === 'string' ? 
                    extractNumericValue(expense.amount) : expense.amount;
                
                expense.amount = amount * rate;
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
    
    // Obtenir le taux de conversion
    const rate = getExchangeRate(fromCurrency, currencyCode);
    
    // Mettre à jour le symbole de la devise
    convertedWallet.currency = getCurrencySymbol(currencyCode);
    
    // Convertir le solde
    if (convertedWallet.balance !== undefined) {
        convertedWallet.balance = convertedWallet.balance * rate;
    }
    
    // Convertir les transactions
    if (convertedWallet.transactions && Array.isArray(convertedWallet.transactions)) {
        convertedWallet.transactions.forEach(transaction => {
            if (transaction.amount !== undefined) {
                transaction.amount = transaction.amount * rate;
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