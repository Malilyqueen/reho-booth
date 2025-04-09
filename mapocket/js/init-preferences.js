/**
 * Script d'initialisation spécifique pour la page des paramètres
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation de la page des paramètres');

    // Initialisation des onglets
    initTabs();

    // Initialisation des éléments de préférences utilisateur
    initPreferencesSelectors();

    // Ajouter un gestionnaire pour les changements de langue
    initLanguageHandlers();

    // Ajouter un gestionnaire pour les changements de devise
    initCurrencyHandlers();

    // Ajouter un gestionnaire pour les changements de thème
    initThemeHandlers();

    // Initialiser le formulaire de profil
    initProfileForm();
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
    if (tabs.length > 0 && tabs[0].classList.contains('active')) {
        tabs[0].click();
    }
}

// Initialise les sélecteurs de préférences
function initPreferencesSelectors() {
    // Mettre à jour les radio buttons de thème
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    if (themeRadios.length > 0) {
        themeRadios.forEach(radio => {
            radio.checked = radio.value === window.userPrefs.theme;
        });
    }

    // Mettre à jour les radio buttons de langue
    const langRadios = document.querySelectorAll('input[name="language"]');
    if (langRadios.length > 0) {
        langRadios.forEach(radio => {
            radio.checked = radio.value === window.userPrefs.language;
        });
    }

    // Initialiser les sélecteurs de devise
    initCurrencySelectors();

    // Afficher le plan actuel
    const planBadge = document.querySelector('.plan-badge');
    const currentPlanName = document.getElementById('currentPlanName');
    if (planBadge && currentPlanName) {
        planBadge.className = 'plan-badge ' + window.userPrefs.plan;
        currentPlanName.textContent = window.userPrefs.plan.charAt(0).toUpperCase() + window.userPrefs.plan.slice(1);
    }

    // Masquer ou afficher les onglets selon le plan
    const usersTab = document.getElementById('usersTab');
    if (usersTab) {
        usersTab.style.display = window.userPrefs.plan === 'freemium' ? 'none' : 'flex';
    }
}

// Initialise les gestionnaires de langues
function initLanguageHandlers() {
    const langRadios = document.querySelectorAll('input[name="language"]');
    
    langRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                // Utiliser l'API du gestionnaire de préférences pour changer la langue
                window.preferencesManager.setLanguage(radio.value);
                
                // Afficher une notification de succès
                showNotification('Langue mise à jour avec succès', 'success');
            }
        });
    });
}

// Initialise les gestionnaires de thème
function initThemeHandlers() {
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    
    themeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                // Utiliser l'API du gestionnaire de préférences pour changer le thème
                window.preferencesManager.setTheme(radio.value);
                
                // Afficher une notification de succès
                showNotification('Thème mis à jour avec succès', 'success');
            }
        });
    });
    
    // Ajouter des gestionnaires aux prévisualisations
    const lightThemePreview = document.getElementById('light-theme-preview');
    const darkThemePreview = document.getElementById('dark-theme-preview');
    
    if (lightThemePreview) {
        lightThemePreview.addEventListener('click', () => {
            const lightThemeRadio = document.getElementById('light-theme');
            if (lightThemeRadio) {
                lightThemeRadio.checked = true;
                window.preferencesManager.setTheme('light');
                showNotification('Thème mis à jour avec succès', 'success');
            }
        });
    }
    
    if (darkThemePreview) {
        darkThemePreview.addEventListener('click', () => {
            const darkThemeRadio = document.getElementById('dark-theme');
            if (darkThemeRadio) {
                darkThemeRadio.checked = true;
                window.preferencesManager.setTheme('dark');
                showNotification('Thème mis à jour avec succès', 'success');
            }
        });
    }
}

// Initialise les sélecteurs de devise
function initCurrencySelectors() {
    // Générer les options pour les sélecteurs
    const primaryContainer = document.getElementById('primaryCurrencyContainer');
    const secondaryContainer = document.getElementById('secondaryCurrencyContainer');
    
    if (primaryContainer) {
        primaryContainer.innerHTML = generateCurrencyDropdown('primaryCurrency', window.userPrefs.currency);
    }
    
    if (secondaryContainer) {
        secondaryContainer.innerHTML = generateCurrencyDropdown('secondaryCurrency', window.userPrefs.secondaryCurrency);
    }
    
    // Mise à jour de l'aperçu
    updateCurrencyPreview();
}

// Initialise les gestionnaires de devise
function initCurrencyHandlers() {
    // Ajouter les gestionnaires d'événements après avoir généré les sélecteurs
    setTimeout(() => {
        const primarySelect = document.getElementById('primaryCurrency');
        const secondarySelect = document.getElementById('secondaryCurrency');
        
        if (primarySelect) {
            primarySelect.addEventListener('change', () => {
                // Récupérer la valeur sélectionnée
                const selected = primarySelect.value;
                
                // Si la devise principale est la même que la secondaire, permuter
                if (selected === window.userPrefs.secondaryCurrency && secondarySelect) {
                    const old = window.userPrefs.currency;
                    window.userPrefs.secondaryCurrency = old;
                    secondarySelect.value = old;
                }
                
                // Utiliser l'API du gestionnaire de préférences pour changer la devise
                window.preferencesManager.setCurrency(selected);
                
                // Afficher une notification de succès
                showNotification(`Devise mise à jour en ${selected} avec succès`, 'success');
                
                // Mise à jour de l'aperçu
                updateCurrencyPreview();
            });
        }
        
        if (secondarySelect) {
            secondarySelect.addEventListener('change', () => {
                // Récupérer la valeur sélectionnée
                const selected = secondarySelect.value;
                
                // Si la devise secondaire est la même que la principale, permuter
                if (selected === window.userPrefs.currency && primarySelect) {
                    const old = window.userPrefs.secondaryCurrency;
                    window.userPrefs.currency = old;
                    primarySelect.value = old;
                    
                    // Convertir les projets et portefeuilles à la nouvelle devise principale
                    window.preferencesManager.convertProjects(old);
                    window.preferencesManager.convertWallets(old);
                }
                
                // Mettre à jour les préférences
                window.userPrefs.secondaryCurrency = selected;
                window.preferencesManager.updatePreference('secondaryCurrency', selected);
                
                // Mise à jour de l'aperçu
                updateCurrencyPreview();
                
                // Afficher une notification de succès
                showNotification(`Devise secondaire mise à jour en ${selected} avec succès`, 'success');
            });
        }
        
        // Ajouter le bouton de conversion
        addConversionButton();
    }, 100);
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

// Met à jour l'aperçu des devises
function updateCurrencyPreview() {
    const preview = document.getElementById('currencyPreview');
    if (!preview) return;
    
    const amount = 100;
    const primaryCurrency = window.userPrefs.currency;
    const secondaryCurrency = window.userPrefs.secondaryCurrency;
    
    // Utiliser la fonction de conversion de devise du gestionnaire de préférences
    const formattedAmount = formatCurrencyWithEquivalent(amount, primaryCurrency, secondaryCurrency);
    
    const example = preview.querySelector('.example');
    if (example) {
        example.textContent = formattedAmount;
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
    const currency = window.userPrefs.currency;
    convertButton.textContent = `Convertir les montants en ${currency}`;
    
    // Supprimer les gestionnaires d'événements existants
    const newButton = convertButton.cloneNode(true);
    if (convertButton.parentNode) {
        currencySettings.replaceChild(newButton, convertButton);
    }
    
    // Gestionnaire d'événements pour le bouton de conversion
    newButton.addEventListener('click', () => {
        const currency = window.userPrefs.currency;
        
        // Afficher une notification de début
        showNotification(`Conversion des montants en ${currency} en cours...`, 'info');
        
        // Essayer de convertir tous les projets et portefeuilles
        setTimeout(() => {
            try {
                // Convertir les projets
                window.preferencesManager.convertProjects(currency);
                
                // Convertir les portefeuilles
                window.preferencesManager.convertWallets(currency);
                
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