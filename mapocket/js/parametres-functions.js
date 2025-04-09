/**
 * Script pour la gestion des paramètres de l'application
 * Version complètement refaite pour éviter les conflits
 */

// Récupérer les devises disponibles (depuis currencies.js ou utiliser une liste par défaut)
var availableCurrencies = window.availableCurrencies || ['EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL', 'RUB', 'KRW', 'TRY', 'MXN', 'IDR', 'PHP', 'MYR', 'SGD', 'THB', 'AED'];

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Paramètres page initialized - nouvelle version');
    
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
        if (window.userPreferences.theme === 'dark') {
            darkThemeRadio.checked = true;
            lightThemeRadio.checked = false;
        } else {
            lightThemeRadio.checked = true;
            darkThemeRadio.checked = false;
        }
        
        // Ajouter des écouteurs d'événements
        lightThemeRadio.addEventListener('change', () => {
            if (lightThemeRadio.checked) {
                window.userPreferences.theme = 'light';
                applyTheme();
                saveUserPreferences();
            }
        });
        
        darkThemeRadio.addEventListener('change', () => {
            if (darkThemeRadio.checked) {
                window.userPreferences.theme = 'dark';
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
                window.userPreferences.theme = 'light';
                applyTheme();
                saveUserPreferences();
            });
        }
        
        if (darkThemePreview) {
            darkThemePreview.addEventListener('click', () => {
                darkThemeRadio.checked = true;
                lightThemeRadio.checked = false;
                window.userPreferences.theme = 'dark';
                applyTheme();
                saveUserPreferences();
            });
        }
    }
    
    // Conserver la compatibilité avec la version switch
    const themeSwitch = document.getElementById('themeSwitch');
    if (themeSwitch) {
        themeSwitch.checked = window.userPreferences.theme === 'dark';
        
        themeSwitch.addEventListener('change', () => {
            window.userPreferences.theme = themeSwitch.checked ? 'dark' : 'light';
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
    const current = document.querySelector(`input[name="language"][value="${window.userPreferences.language}"]`);
    if (current) {
        current.checked = true;
    }
    
    // Ajouter les écouteurs d'événements
    langRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            window.userPreferences.language = radio.value;
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
        primaryContainer.innerHTML = generateCurrencyDropdown('primaryCurrency', window.userPreferences.currency);
    }
    
    if (secondaryContainer) {
        secondaryContainer.innerHTML = generateCurrencyDropdown('secondaryCurrency', window.userPreferences.secondaryCurrency);
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
            if (selected === window.userPreferences.secondaryCurrency && secondarySelect) {
                const old = window.userPreferences.currency;
                window.userPreferences.secondaryCurrency = old;
                secondarySelect.value = old;
            }
            
            // Mettre à jour les préférences
            window.userPreferences.currency = selected;
            
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
            if (selected === window.userPreferences.currency && primarySelect) {
                const old = window.userPreferences.secondaryCurrency;
                window.userPreferences.currency = old;
                primarySelect.value = old;
            }
            
            // Mettre à jour les préférences
            window.userPreferences.secondaryCurrency = selected;
            
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
    const formattedAmount = formatCurrencyWithEquivalent(amount, window.userPreferences.currency, window.userPreferences.secondaryCurrency);
    
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
    updatePlanDisplay(window.userPreferences.plan);
    
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
        window.userPreferences.plan = 'freemium';
        updatePlanDisplay('freemium');
        saveUserPreferences();
    });
    
    document.getElementById('testBasicBtn').addEventListener('click', () => {
        window.userPreferences.plan = 'basic';
        updatePlanDisplay('basic');
        saveUserPreferences();
    });
    
    document.getElementById('testProBtn').addEventListener('click', () => {
        window.userPreferences.plan = 'pro';
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
        const currency = window.userPreferences.currency;
        
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
        const currency = window.userPreferences.currency;
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
    
    // Convertir vers EUR comme base
    let amountInEUR = amount;
    if (primaryCurrency !== 'EUR') {
        amountInEUR = amount / conversionRates[primaryCurrency];
    }
    
    // Convertir de EUR vers la devise secondaire
    const amountInSecondary = amountInEUR * conversionRates[secondaryCurrency];
    
    // Formater le montant principal
    const formattedPrimary = `${primaryCurrency} ${amount.toFixed(2).replace('.', ',00')}`;
    
    // Formater le montant secondaire
    const formattedSecondary = `${secondaryCurrency} ${amountInSecondary.toFixed(2).replace('.', ',00')}`;
    
    return `${formattedPrimary} (${formattedSecondary})`;
}

// Fonction pour convertir les projets en une nouvelle devise
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
        
        return true;
    } catch (error) {
        console.error('Erreur lors de la conversion des projets:', error);
        return false;
    }
}

// Fonction pour convertir les portefeuilles en une nouvelle devise
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
        
        return true;
    } catch (error) {
        console.error('Erreur lors de la conversion des portefeuilles:', error);
        return false;
    }
}