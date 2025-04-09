/**
 * Script d'initialisation spécifique pour la page des paramètres
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation de la page des paramètres');

    // Initialisation des onglets
    initTabs();

    // Initialisation des sélecteurs de préférences
    initPreferencesUI();

    // Ajouter un gestionnaire pour les changements de langue
    initLanguageHandlers();

    // Ajouter un gestionnaire pour les changements de devise
    initCurrencyHandlers();

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
            contents.forEach(c => c.classList.remove('active'));
            
            // Activer l'onglet cible
            tab.classList.add('active');
            document.getElementById(target + '-content').classList.add('active');
        });
    });
}

// Initialise les sélecteurs de préférences UI
function initPreferencesUI() {
    // Récupérer les préférences actuelles
    const preferences = preferencesManager.getPreferences();
    
    // Initialiser le sélecteur de thème
    const lightThemeRadio = document.getElementById('light-theme');
    const darkThemeRadio = document.getElementById('dark-theme');
    
    if (lightThemeRadio && darkThemeRadio) {
        lightThemeRadio.checked = preferences.theme === 'light';
        darkThemeRadio.checked = preferences.theme === 'dark';
    }
    
    // Initialiser le sélecteur de taille de police
    const fontSizeButtons = document.querySelectorAll('.font-size-btn');
    fontSizeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.size === preferences.fontSize);
        
        btn.addEventListener('click', () => {
            fontSizeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            preferencesManager.updatePreference('fontSize', btn.dataset.size);
        });
    });
    
    // Initialiser le sélecteur de langue
    const langFrRadio = document.getElementById('lang-fr');
    const langEnRadio = document.getElementById('lang-en');
    
    if (langFrRadio && langEnRadio) {
        langFrRadio.checked = preferences.language === 'fr';
        langEnRadio.checked = preferences.language === 'en';
    }
    
    // Initialiser le sélecteur de format de date
    const dateFormatSelect = document.getElementById('dateFormat');
    if (dateFormatSelect) {
        dateFormatSelect.value = preferences.dateFormat;
        
        dateFormatSelect.addEventListener('change', () => {
            preferencesManager.updatePreference('dateFormat', dateFormatSelect.value);
        });
    }
    
    // Initialiser les sélecteurs de devise
    initCurrencySelectors();
}

// Initialise les sélecteurs de devise
function initCurrencySelectors() {
    const primaryCurrencyContainer = document.getElementById('primaryCurrencyContainer');
    const secondaryCurrencyContainer = document.getElementById('secondaryCurrencyContainer');
    
    if (primaryCurrencyContainer) {
        const primarySelect = document.createElement('select');
        primarySelect.id = 'primaryCurrency';
        primarySelect.className = 'select-input';
        
        const currencies = [
            {code: 'EUR', name: 'Euro (€)', symbol: '€'},
            {code: 'USD', name: 'Dollar américain ($)', symbol: '$'},
            {code: 'GBP', name: 'Livre sterling (£)', symbol: '£'},
            {code: 'JPY', name: 'Yen japonais (¥)', symbol: '¥'},
            {code: 'CHF', name: 'Franc suisse (Fr)', symbol: 'Fr'},
            {code: 'CAD', name: 'Dollar canadien (C$)', symbol: 'C$'}
        ];
        
        currencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency.code;
            option.textContent = currency.name;
            primarySelect.appendChild(option);
        });
        
        primaryCurrencyContainer.appendChild(primarySelect);
        
        // Sélectionner la devise actuelle
        primarySelect.value = preferencesManager.getPreferences().currency;
    }
    
    if (secondaryCurrencyContainer) {
        const secondarySelect = document.createElement('select');
        secondarySelect.id = 'secondaryCurrency';
        secondarySelect.className = 'select-input';
        
        const currencies = [
            {code: 'EUR', name: 'Euro (€)', symbol: '€'},
            {code: 'USD', name: 'Dollar américain ($)', symbol: '$'},
            {code: 'GBP', name: 'Livre sterling (£)', symbol: '£'},
            {code: 'JPY', name: 'Yen japonais (¥)', symbol: '¥'},
            {code: 'CHF', name: 'Franc suisse (Fr)', symbol: 'Fr'},
            {code: 'CAD', name: 'Dollar canadien (C$)', symbol: 'C$'}
        ];
        
        currencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency.code;
            option.textContent = currency.name;
            secondarySelect.appendChild(option);
        });
        
        secondaryCurrencyContainer.appendChild(secondarySelect);
        
        // Sélectionner la devise secondaire actuelle
        secondarySelect.value = preferencesManager.getPreferences().secondaryCurrency;
    }
}

// Initialise les gestionnaires d'événements pour les changements de thème
function initThemeHandlers() {
    const lightThemeRadio = document.getElementById('light-theme');
    const darkThemeRadio = document.getElementById('dark-theme');
    
    if (lightThemeRadio && darkThemeRadio) {
        lightThemeRadio.addEventListener('change', () => {
            if (lightThemeRadio.checked) {
                preferencesManager.setTheme('light');
            }
        });
        
        darkThemeRadio.addEventListener('change', () => {
            if (darkThemeRadio.checked) {
                preferencesManager.setTheme('dark');
            }
        });
    }
}

// Initialise les gestionnaires d'événements pour les changements de langue
function initLanguageHandlers() {
    const langFrRadio = document.getElementById('lang-fr');
    const langEnRadio = document.getElementById('lang-en');
    
    if (langFrRadio && langEnRadio) {
        langFrRadio.addEventListener('change', () => {
            if (langFrRadio.checked) {
                preferencesManager.setLanguage('fr');
            }
        });
        
        langEnRadio.addEventListener('change', () => {
            if (langEnRadio.checked) {
                preferencesManager.setLanguage('en');
            }
        });
    }
}

// Initialise les gestionnaires d'événements pour les changements de devise
function initCurrencyHandlers() {
    const primaryCurrencySelect = document.getElementById('primaryCurrency');
    const secondaryCurrencySelect = document.getElementById('secondaryCurrency');
    
    if (primaryCurrencySelect) {
        primaryCurrencySelect.addEventListener('change', () => {
            preferencesManager.setCurrency(primaryCurrencySelect.value);
            updateCurrencyPreview();
        });
    }
    
    if (secondaryCurrencySelect) {
        secondaryCurrencySelect.addEventListener('change', () => {
            preferencesManager.updatePreference('secondaryCurrency', secondaryCurrencySelect.value);
            updateCurrencyPreview();
        });
    }
    
    // Mise à jour initiale de l'aperçu
    updateCurrencyPreview();
}

// Met à jour l'aperçu des devises
function updateCurrencyPreview() {
    const currencyPreview = document.getElementById('currencyPreview');
    const preferences = preferencesManager.getPreferences();
    
    if (currencyPreview) {
        const primarySymbol = getCurrencySymbol(preferences.currency);
        const secondarySymbol = getCurrencySymbol(preferences.secondaryCurrency);
        const exchangeRate = getExchangeRate(preferences.currency, preferences.secondaryCurrency);
        
        const amount = 100;
        const convertedAmount = Math.round(amount * exchangeRate);
        
        currencyPreview.innerHTML = `<p class="example">${amount} ${preferences.currency} ≈ ${convertedAmount} ${preferences.secondaryCurrency}</p>`;
    }
}

// Récupère le symbole d'une devise
function getCurrencySymbol(currencyCode) {
    const symbols = {
        'EUR': '€',
        'USD': '$',
        'GBP': '£',
        'JPY': '¥',
        'CHF': 'Fr',
        'CAD': 'C$'
    };
    
    return symbols[currencyCode] || currencyCode;
}

// Récupère le taux de change entre deux devises (simulé)
function getExchangeRate(fromCurrency, toCurrency) {
    // Taux de change simulés par rapport à l'EUR
    const ratesVsEUR = {
        'EUR': 1,
        'USD': 1.09,
        'GBP': 0.85,
        'JPY': 164.53,
        'CHF': 0.98,
        'CAD': 1.47
    };
    
    // Calculer le taux de change entre les deux devises
    const fromRate = ratesVsEUR[fromCurrency] || 1;
    const toRate = ratesVsEUR[toCurrency] || 1;
    
    return toRate / fromRate;
}

// Initialise le formulaire de profil
function initProfileForm() {
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            // Simuler une sauvegarde réussie
            showNotification('success', 'Profil mis à jour avec succès');
        });
    }
    
    // Gestionnaire pour le changement d'avatar
    const avatarUpload = document.getElementById('avatarUpload');
    const profileAvatar = document.getElementById('profileAvatar');
    
    if (avatarUpload && profileAvatar) {
        avatarUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];
            
            if (file && file.type.match('image.*')) {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    profileAvatar.src = e.target.result;
                };
                
                reader.readAsDataURL(file);
            }
        });
    }
}

// Affiche une notification
function showNotification(type, message) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    const notificationIcon = document.getElementById('notificationIcon').querySelector('i');
    
    if (notification && notificationMessage && notificationIcon) {
        // Définir le message
        notificationMessage.textContent = message;
        
        // Définir l'icône selon le type
        notificationIcon.className = 'fas';
        
        switch (type) {
            case 'success':
                notificationIcon.classList.add('fa-check-circle');
                notification.className = 'notification success';
                break;
            case 'error':
                notificationIcon.classList.add('fa-times-circle');
                notification.className = 'notification error';
                break;
            case 'warning':
                notificationIcon.classList.add('fa-exclamation-triangle');
                notification.className = 'notification warning';
                break;
            default:
                notificationIcon.classList.add('fa-info-circle');
                notification.className = 'notification info';
        }
        
        // Afficher la notification
        notification.style.display = 'flex';
        
        // Masquer après 3 secondes
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

// Ajouter un gestionnaire pour fermer la notification
document.addEventListener('DOMContentLoaded', () => {
    const notificationClose = document.getElementById('notificationClose');
    
    if (notificationClose) {
        notificationClose.addEventListener('click', () => {
            const notification = document.getElementById('notification');
            if (notification) {
                notification.style.display = 'none';
            }
        });
    }
});