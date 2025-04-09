/**
 * Script pour la gestion des paramètres de l'application
 */

// Variables pour stocker les préférences utilisateur
let userPreferences = {
    theme: 'light',
    fontSize: 'medium',
    language: 'fr',
    dateFormat: 'DD/MM/YYYY',
    currency: 'EUR',  // 'EUR' ou 'USD'
    plan: 'freemium'  // ou 'basic', 'pro'
};

// Initialisation au chargement du document
document.addEventListener('DOMContentLoaded', function() {
    console.log('Paramètres page initialized');
    
    // Charger les préférences utilisateur depuis le localStorage
    loadUserPreferences();
    
    // Initialiser les tabs
    initTabs();
    
    // Initialiser les interactions de la page
    initThemeSelector();
    initFontSizeSelector();
    initLanguageSelector();
    initCurrencySelector();
    initProfileForm();
    
    // Initialiser les fonctionnalités selon le plan utilisateur
    initPlanFeatures();
    
    // Initialiser les modales
    initModals();
});

/**
 * Charge les préférences utilisateur depuis le localStorage
 */
function loadUserPreferences() {
    try {
        const savedPreferences = localStorage.getItem('userPreferences');
        if (savedPreferences) {
            userPreferences = JSON.parse(savedPreferences);
            console.log('Préférences utilisateur chargées:', userPreferences);
        }
        
        // Appliquer les préférences chargées
        applyUserPreferences();
    } catch (error) {
        console.error('Erreur lors du chargement des préférences utilisateur:', error);
    }
}

/**
 * Applique les préférences utilisateur à l'interface
 */
function applyUserPreferences() {
    // Appliquer le thème
    if (userPreferences.theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('dark-theme').checked = true;
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('light-theme').checked = true;
    }
    
    // Appliquer la taille de police
    document.body.dataset.fontSize = userPreferences.fontSize;
    document.querySelectorAll('.font-size-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.size === userPreferences.fontSize);
    });
    
    // Appliquer la langue
    document.documentElement.lang = userPreferences.language;
    document.getElementById('lang-' + userPreferences.language).checked = true;
    
    // Appliquer le format de date
    document.getElementById('dateFormat').value = userPreferences.dateFormat;
    
    // Appliquer la devise
    if (userPreferences.currency) {
        const currencyRadio = document.getElementById('currency-' + userPreferences.currency.toLowerCase());
        if (currencyRadio) {
            currencyRadio.checked = true;
        }
    }
    
    // Appliquer le plan utilisateur
    updatePlanDisplay(userPreferences.plan);
}

/**
 * Sauvegarde les préférences utilisateur dans le localStorage
 */
function saveUserPreferences() {
    try {
        localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
        console.log('Préférences utilisateur sauvegardées:', userPreferences);
        
        // Afficher une notification de succès
        showNotification('Préférences sauvegardées avec succès', 'success');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des préférences utilisateur:', error);
        showNotification('Erreur lors de la sauvegarde des préférences', 'error');
    }
}

/**
 * Initialise la gestion des onglets
 */
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Gestionnaire d'événements pour les boutons d'onglet
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Désactiver tous les onglets
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activer l'onglet sélectionné
            button.classList.add('active');
            document.getElementById(tabName + '-content').classList.add('active');
        });
    });
    
    // Gestionnaire pour les liens d'onglet internes
    document.querySelectorAll('.tab-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = link.getAttribute('data-tab');
            document.querySelector(`.tab-btn[data-tab="${tabName}"]`).click();
        });
    });
}

/**
 * Initialise le sélecteur de thème
 */
function initThemeSelector() {
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    const themePreviews = document.querySelectorAll('.theme-preview');
    
    // Gestionnaire d'événements pour les radios
    themeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const selectedTheme = radio.value;
            userPreferences.theme = selectedTheme;
            
            // Appliquer le thème
            if (selectedTheme === 'dark') {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
            
            // Sauvegarder les préférences
            saveUserPreferences();
        });
    });
    
    // Gestionnaire d'événements pour les previews (pour une meilleure UX)
    themePreviews.forEach(preview => {
        preview.addEventListener('click', () => {
            const themeOption = preview.parentNode;
            const radio = themeOption.querySelector('input[type="radio"]');
            radio.checked = true;
            
            // Déclencher l'événement change manuellement
            const event = new Event('change');
            radio.dispatchEvent(event);
        });
    });
}

/**
 * Initialise le sélecteur de taille de police
 */
function initFontSizeSelector() {
    const fontSizeButtons = document.querySelectorAll('.font-size-btn');
    
    fontSizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedSize = button.getAttribute('data-size');
            
            // Mettre à jour l'UI
            fontSizeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Mettre à jour les préférences
            userPreferences.fontSize = selectedSize;
            document.body.dataset.fontSize = selectedSize;
            
            // Sauvegarder les préférences
            saveUserPreferences();
        });
    });
}

/**
 * Initialise le sélecteur de langue
 */
function initLanguageSelector() {
    const languageRadios = document.querySelectorAll('input[name="language"]');
    const dateFormatSelect = document.getElementById('dateFormat');
    
    // Gestionnaire d'événements pour les radios de langue
    languageRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const selectedLanguage = radio.value;
            userPreferences.language = selectedLanguage;
            
            // Mettre à jour la langue du document
            document.documentElement.lang = selectedLanguage;
            
            // Sauvegarder les préférences
            saveUserPreferences();
            
            // Dans une application réelle, nous rechargerions ici les traductions
            // Pour cette démo, on simule juste un changement
            showNotification('La langue a été changée en ' + (selectedLanguage === 'fr' ? 'français' : 'anglais'), 'info');
        });
    });
    
    // Gestionnaire d'événements pour le format de date
    dateFormatSelect.addEventListener('change', () => {
        const selectedFormat = dateFormatSelect.value;
        userPreferences.dateFormat = selectedFormat;
        
        // Sauvegarder les préférences
        saveUserPreferences();
    });
}

/**
 * Initialise le sélecteur de devise
 */
function initCurrencySelector() {
    const currencyRadios = document.querySelectorAll('input[name="currency"]');
    
    // S'assurer que la devise correcte est sélectionnée au chargement
    if (userPreferences.currency) {
        const currencyRadio = document.getElementById('currency-' + userPreferences.currency.toLowerCase());
        if (currencyRadio) {
            currencyRadio.checked = true;
        }
    }
    
    // Gestionnaire d'événements pour les radios de devise
    currencyRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const selectedCurrency = radio.value;
            const oldCurrency = userPreferences.currency;
            userPreferences.currency = selectedCurrency;
            
            // Sauvegarder les préférences
            saveUserPreferences();
            
            // Appliquer les changements de devise aux projets et portefeuilles
            if (oldCurrency !== selectedCurrency) {
                convertAllCurrencies(oldCurrency, selectedCurrency);
                
                // Afficher une notification de succès
                const currencyNames = {
                    'EUR': 'euros',
                    'USD': 'dollars US'
                };
                showNotification(`Devise changée en ${currencyNames[selectedCurrency]}. Tous les montants ont été convertis.`, 'success');
            }
        });
    });
    
    // Ajouter des styles CSS pour les boutons de devise
    addCurrencySelectorStyles();
}

/**
 * Convertit toutes les valeurs monétaires dans les projets et portefeuilles
 * de l'ancienne devise vers la nouvelle
 */
function convertAllCurrencies(fromCurrency, toCurrency) {
    try {
        // Définir le taux de conversion
        const conversionRate = getCurrencyConversionRate(fromCurrency, toCurrency);
        
        // Convertir les projets
        const projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        const convertedProjects = convertProjectsCurrency(projects, conversionRate, fromCurrency, toCurrency);
        localStorage.setItem('savedProjects', JSON.stringify(convertedProjects));
        
        // Convertir les portefeuilles
        const wallets = JSON.parse(localStorage.getItem('mapocket_wallets') || '[]');
        const convertedWallets = convertWalletsCurrency(wallets, conversionRate, fromCurrency, toCurrency);
        localStorage.setItem('mapocket_wallets', JSON.stringify(convertedWallets));
        
        console.log('Toutes les valeurs monétaires ont été converties avec succès');
        return true;
    } catch (error) {
        console.error('Erreur lors de la conversion des devises:', error);
        showNotification('Erreur lors de la conversion des devises', 'error');
        return false;
    }
}

/**
 * Convertit les montants des projets de l'ancienne devise vers la nouvelle
 */
function convertProjectsCurrency(projects, conversionRate, fromCurrency, toCurrency) {
    const currencySymbols = {
        'EUR': '€',
        'USD': '$'
    };
    
    return projects.map(project => {
        // Convertir le budget total du projet
        if (project.totalBudget) {
            // Extraire la valeur numérique du budget
            const budgetValue = parseFloat(project.totalBudget.replace(/[^0-9.,]/g, '').replace(',', '.'));
            if (!isNaN(budgetValue)) {
                // Convertir et formater le nouveau montant
                const convertedValue = (budgetValue * conversionRate).toFixed(2);
                project.totalBudget = `${currencySymbols[toCurrency]} ${convertedValue}`;
            }
        }
        
        // Convertir les montants des catégories et sous-catégories
        if (project.categories && Array.isArray(project.categories)) {
            project.categories = project.categories.map(category => {
                // Convertir le montant de la catégorie
                if (category.amount) {
                    const categoryValue = parseFloat(category.amount.replace(/[^0-9.,]/g, '').replace(',', '.'));
                    if (!isNaN(categoryValue)) {
                        const convertedValue = (categoryValue * conversionRate).toFixed(2);
                        category.amount = `${currencySymbols[toCurrency]} ${convertedValue}`;
                    }
                }
                
                // Convertir les montants des sous-catégories
                if (category.subcategories && Array.isArray(category.subcategories)) {
                    category.subcategories = category.subcategories.map(subcategory => {
                        if (subcategory.amount) {
                            const subcategoryValue = parseFloat(subcategory.amount.replace(/[^0-9.,]/g, '').replace(',', '.'));
                            if (!isNaN(subcategoryValue)) {
                                const convertedValue = (subcategoryValue * conversionRate).toFixed(2);
                                subcategory.amount = `${currencySymbols[toCurrency]} ${convertedValue}`;
                            }
                        }
                        
                        // Convertir les montants des lignes
                        if (subcategory.lines && Array.isArray(subcategory.lines)) {
                            subcategory.lines = subcategory.lines.map(line => {
                                if (line.amount) {
                                    const lineValue = parseFloat(line.amount.replace(/[^0-9.,]/g, '').replace(',', '.'));
                                    if (!isNaN(lineValue)) {
                                        const convertedValue = (lineValue * conversionRate).toFixed(2);
                                        line.amount = `${currencySymbols[toCurrency]} ${convertedValue}`;
                                    }
                                }
                                return line;
                            });
                        }
                        
                        return subcategory;
                    });
                }
                
                return category;
            });
        }
        
        // Convertir les dépenses réelles
        if (project.realExpenses && Array.isArray(project.realExpenses)) {
            project.realExpenses = project.realExpenses.map(expense => {
                if (expense.amount) {
                    const expenseValue = parseFloat(expense.amount.toString().replace(/[^0-9.,]/g, '').replace(',', '.'));
                    if (!isNaN(expenseValue)) {
                        expense.amount = expenseValue * conversionRate;
                    }
                }
                return expense;
            });
        }
        
        return project;
    });
}

/**
 * Convertit les montants des portefeuilles de l'ancienne devise vers la nouvelle
 */
function convertWalletsCurrency(wallets, conversionRate, fromCurrency, toCurrency) {
    return wallets.map(wallet => {
        // Convertir le solde du portefeuille
        if (wallet.balance) {
            wallet.balance = wallet.balance * conversionRate;
        }
        
        // Mettre à jour le symbole de la devise
        wallet.currency = toCurrency === 'EUR' ? '€' : '$';
        
        // Convertir l'historique des transactions si présent
        if (wallet.transactions && Array.isArray(wallet.transactions)) {
            wallet.transactions = wallet.transactions.map(transaction => {
                if (transaction.amount) {
                    transaction.amount = transaction.amount * conversionRate;
                }
                return transaction;
            });
        }
        
        return wallet;
    });
}

/**
 * Retourne le taux de conversion entre deux devises
 * Note: Dans une app réelle, nous utiliserions une API de taux de change
 */
function getCurrencyConversionRate(fromCurrency, toCurrency) {
    // Taux de conversion simplifiés pour la démo
    const rates = {
        'EUR_USD': 1.09,  // 1 EUR = 1.09 USD (taux approximatif)
        'USD_EUR': 0.92   // 1 USD = 0.92 EUR (taux approximatif)
    };
    
    const rateKey = `${fromCurrency}_${toCurrency}`;
    
    // Si les devises sont identiques, le taux est 1
    if (fromCurrency === toCurrency) {
        return 1;
    }
    
    // Retourner le taux approprié
    if (rates[rateKey]) {
        return rates[rateKey];
    }
    
    // Taux par défaut si non trouvé (ne devrait pas arriver)
    console.warn(`Taux de conversion non trouvé pour ${rateKey}, utilisation du taux par défaut 1`);
    return 1;
}

/**
 * Ajoute des styles CSS pour les boutons de devise
 */
function addCurrencySelectorStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .currency-selector {
            display: flex;
            gap: 10px;
        }
        .currency-option {
            flex: 1;
        }
        .currency-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            width: 100%;
            padding: 10px;
            border-radius: 8px;
            background-color: #f8fafc;
            border: 2px solid #e2e8f0;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .currency-symbol {
            font-weight: bold;
            font-size: 1.2em;
        }
        input[name="currency"]:checked + .currency-btn {
            background-color: #dbeafe;
            border-color: #3b82f6;
        }
    `;
    document.head.appendChild(styleElement);
}


/**
 * Initialise le formulaire de profil
 */
function initProfileForm() {
    const profileForm = document.querySelector('.profile-form');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const profileNameInput = document.getElementById('profileNameInput');
    const profileEmailInput = document.getElementById('profileEmailInput');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const avatarUpload = document.getElementById('avatarUpload');
    const profileAvatar = document.getElementById('profileAvatar');
    
    // Gestionnaire d'événements pour le bouton de sauvegarde
    saveProfileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Dans une application réelle, nous enverrions ces données au serveur
        // Pour cette démo, on simule juste un changement local
        profileName.textContent = profileNameInput.value;
        profileEmail.textContent = profileEmailInput.value;
        
        showNotification('Profil mis à jour avec succès', 'success');
    });
    
    // Gestionnaire d'événements pour l'upload d'avatar
    avatarUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Vérifier si c'est une image
            if (!file.type.startsWith('image/')) {
                showNotification('Veuillez sélectionner une image valide', 'error');
                return;
            }
            
            // Créer un aperçu de l'image
            const reader = new FileReader();
            reader.onload = (event) => {
                profileAvatar.src = event.target.result;
                
                // Dans une application réelle, nous enverrions l'image au serveur
                showNotification('Avatar mis à jour avec succès', 'success');
            };
            reader.readAsDataURL(file);
        }
    });
}

/**
 * Initialise les fonctionnalités en fonction du plan utilisateur
 */
function initPlanFeatures() {
    // Masquer/afficher les fonctionnalités premium selon le plan
    updatePlanDisplay(userPreferences.plan);
    
    // Gestionnaire pour les boutons de choix de plan
    document.querySelectorAll('.plan-option button').forEach(button => {
        button.addEventListener('click', () => {
            const planCard = button.closest('.plan-option');
            const planName = planCard.querySelector('h5').textContent.toLowerCase();
            
            // Dans une application réelle, cela redirigerait vers une page de paiement
            // Pour cette démo, on simule juste un changement de plan
            showNotification('Redirection vers la page de paiement pour le plan ' + planName, 'info');
        });
    });
    
    // Gestionnaire pour le bouton de gestion d'abonnement
    document.getElementById('manageSubscriptionBtn').addEventListener('click', () => {
        // Dans une application réelle, cela redirigerait vers une page de gestion d'abonnement
        showNotification('Cette fonctionnalité sera disponible prochainement', 'info');
    });
    
    // Boutons pour tester différents plans (pour démo uniquement)
    addPlanTestButtons();
}

/**
 * Met à jour l'affichage en fonction du plan utilisateur
 */
function updatePlanDisplay(plan) {
    const usersTab = document.getElementById('usersTab');
    const usersEligible = document.getElementById('usersEligible');
    const usersNotEligible = document.getElementById('usersNotEligible');
    const currentPlanName = document.getElementById('currentPlanName');
    const planBadge = document.querySelector('.current-plan .plan-badge');
    
    // Mettre à jour le nom du plan actuel
    currentPlanName.textContent = plan.charAt(0).toUpperCase() + plan.slice(1);
    
    // Mettre à jour la classe du badge du plan
    planBadge.className = 'plan-badge ' + plan;
    
    // Mettre à jour l'affichage des fonctionnalités utilisateur
    if (plan === 'freemium') {
        // Les utilisateurs Freemium n'ont pas accès à la gestion des utilisateurs
        usersTab.style.display = 'none';
        
        if (usersEligible && usersNotEligible) {
            usersEligible.style.display = 'none';
            usersNotEligible.style.display = 'block';
        }
        
        // Dans une application réelle, on mettrait aussi à jour les listes de fonctionnalités
        document.querySelectorAll('.features-list li').forEach(li => {
            const icon = li.querySelector('i');
            if (li.textContent.includes('1 projet maximum')) {
                icon.className = 'fas fa-check';
                icon.style.color = '#22c55e';
            }
        });
    } else {
        // Les utilisateurs Basic et Pro ont accès à la gestion des utilisateurs
        usersTab.style.display = 'flex';
        
        if (usersEligible && usersNotEligible) {
            usersEligible.style.display = 'block';
            usersNotEligible.style.display = 'none';
        }
        
        // Dans une application réelle, on mettrait aussi à jour les listes de fonctionnalités
        // selon le plan choisi
    }
}

/**
 * Ajoute des boutons de test pour simuler différents plans (pour démo uniquement)
 */
function addPlanTestButtons() {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'test-plan-buttons';
    buttonsContainer.style.marginTop = '20px';
    buttonsContainer.style.padding = '15px';
    buttonsContainer.style.backgroundColor = '#f8fafc';
    buttonsContainer.style.borderRadius = '8px';
    
    buttonsContainer.innerHTML = `
        <p style="margin-bottom: 10px; font-size: 14px; color: #666;">
            Pour tester différents plans (démo uniquement) :
        </p>
        <div style="display: flex; gap: 10px;">
            <button class="btn btn-sm btn-outline test-plan-btn" data-plan="freemium">
                Simuler Freemium
            </button>
            <button class="btn btn-sm btn-outline test-plan-btn" data-plan="basic">
                Simuler Basic
            </button>
            <button class="btn btn-sm btn-outline test-plan-btn" data-plan="pro">
                Simuler Pro
            </button>
        </div>
    `;
    
    document.querySelector('.subscription-card').appendChild(buttonsContainer);
    
    // Ajouter les gestionnaires d'événements
    document.querySelectorAll('.test-plan-btn').forEach(button => {
        button.addEventListener('click', () => {
            const plan = button.getAttribute('data-plan');
            userPreferences.plan = plan;
            updatePlanDisplay(plan);
            saveUserPreferences();
            showNotification(`Simulation du plan ${plan.charAt(0).toUpperCase() + plan.slice(1)} activée`, 'info');
        });
    });
}

/**
 * Initialise les modales
 */
function initModals() {
    // Gestionnaire pour ouvrir la modale d'invitation
    document.querySelectorAll('.add-collaborator button').forEach(button => {
        button.addEventListener('click', () => {
            const projectId = button.getAttribute('data-project-id');
            document.getElementById('inviteProjectId').value = projectId;
            document.getElementById('inviteModal').style.display = 'block';
        });
    });
    
    // Gestionnaire pour fermer les modales
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            document.getElementById('inviteModal').style.display = 'none';
        });
    });
    
    // Fermer les modales en cliquant en dehors
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Soumission du formulaire d'invitation
    document.getElementById('inviteForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('inviteEmail').value;
        const permission = document.getElementById('invitePermission').value;
        
        // Dans une application réelle, nous enverrions ces données au serveur
        // Pour cette démo, on simule juste une invitation
        showNotification(`Invitation envoyée à ${email} avec permission de ${permission === 'read' ? 'lecture seule' : 'modification'}`, 'success');
        
        // Fermer la modale
        document.getElementById('inviteModal').style.display = 'none';
        
        // Réinitialiser le formulaire
        document.getElementById('inviteForm').reset();
    });
}

/**
 * Affiche une notification à l'utilisateur
 */
function showNotification(message, type = 'info') {
    // Vérifier si la fonction existe dans le script principal
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        // Implémentation de secours si la fonction n'existe pas
        console.log(`Notification (${type}): ${message}`);
        
        // Créer un élément de notification simple
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Styles de base pour la notification
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = type === 'success' ? '#d1fae5' : type === 'error' ? '#fee2e2' : '#e0f2fe';
        notification.style.color = type === 'success' ? '#065f46' : type === 'error' ? '#991b1b' : '#0c4a6e';
        notification.style.padding = '12px 20px';
        notification.style.borderRadius = '8px';
        notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        notification.style.zIndex = '9999';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.justifyContent = 'space-between';
        notification.style.maxWidth = '350px';
        notification.style.animation = 'slideIn 0.3s ease';
        
        document.body.appendChild(notification);
        
        // Fermer la notification en cliquant sur le bouton
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        // Fermer automatiquement la notification après 5 secondes
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}