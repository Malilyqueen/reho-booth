// Variables globales
let userPreferences = {
    theme: 'light',
    fontSize: 'medium',
    language: 'fr',
    dateFormat: 'DD/MM/YYYY',
    plan: 'freemium',
    currency: 'EUR',
    secondaryCurrency: 'USD'
};

// Lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('Paramètres page initialized');
    
    // Charger les préférences utilisateur
    loadUserPreferences();
    
    // Initialiser les onglets
    initTabs();
    
    // Initialiser les interrupteurs
    initSwitches();
    
    // Initialiser le sélecteur de thème
    initThemeSelector();
    
    // Initialiser le sélecteur de taille de police
    initFontSizeSelector();
    
    // Initialiser le sélecteur de langue
    initLanguageSelector();
    
    // Initialiser le sélecteur de devise
    initCurrencySelector();
    
    // Ajouter le bouton de conversion de devises
    addCurrencyConversionButton();
    
    // Initialiser le formulaire de profil
    initProfileForm();
    
    // Initialiser les fonctionnalités selon le plan
    initPlanFeatures();
    
    // Initialiser les fonctionnalités pour les modals
    initModals();
});

/**
 * Charge les préférences utilisateur depuis le localStorage
 */
function loadUserPreferences() {
    try {
        const storedPreferences = localStorage.getItem('userPreferences');
        if (storedPreferences) {
            userPreferences = JSON.parse(storedPreferences);
            console.log('Préférences utilisateur chargées:', userPreferences);
            
            // Appliquer les préférences
            applyUserPreferences();
        }
    } catch (error) {
        console.error('Erreur lors du chargement des préférences utilisateur:', error);
    }
}

/**
 * Applique les préférences utilisateur à l'interface
 */
function applyUserPreferences() {
    // Appliquer le thème
    document.body.classList.toggle('dark-mode', userPreferences.theme === 'dark');
    
    // Appliquer la taille de police
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add('font-' + userPreferences.fontSize);
    
    // Mettre à jour les interfaces
    updateThemeInterface();
    updateFontSizeInterface();
    updateLanguageInterface();
}

/**
 * Met à jour l'interface des sélecteurs de thème
 */
function updateThemeInterface() {
    const themeSwitch = document.getElementById('themeSwitch');
    if (themeSwitch) {
        themeSwitch.checked = userPreferences.theme === 'dark';
    }
}

/**
 * Met à jour l'interface des sélecteurs de taille de police
 */
function updateFontSizeInterface() {
    document.querySelectorAll('.font-size-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.size === userPreferences.fontSize);
    });
}

/**
 * Met à jour l'interface des sélecteurs de langue
 */
function updateLanguageInterface() {
    const languageRadio = document.querySelector(`input[name="language"][value="${userPreferences.language}"]`);
    if (languageRadio) {
        languageRadio.checked = true;
    }
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
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Activer/désactiver les onglets
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Afficher le contenu correspondant
            const tabId = button.dataset.tab;
            tabContents.forEach(content => {
                content.style.display = content.id === tabId ? 'block' : 'none';
            });
        });
    });
    
    // Activer le premier onglet par défaut
    if (tabButtons.length > 0) {
        tabButtons[0].click();
    }
}

/**
 * Initialise les interrupteurs
 */
function initSwitches() {
    document.querySelectorAll('.switch input').forEach(switchInput => {
        switchInput.addEventListener('change', () => {
            // Dans une application réelle, on sauvegarderait cette préférence
            showNotification('Préférence mise à jour', 'success');
        });
    });
}

/**
 * Initialise le sélecteur de thème
 */
function initThemeSelector() {
    const themeSwitch = document.getElementById('themeSwitch');
    
    if (themeSwitch) {
        themeSwitch.checked = userPreferences.theme === 'dark';
        
        themeSwitch.addEventListener('change', () => {
            userPreferences.theme = themeSwitch.checked ? 'dark' : 'light';
            document.body.classList.toggle('dark-mode', userPreferences.theme === 'dark');
            saveUserPreferences();
        });
    }
}

/**
 * Initialise le sélecteur de taille de police
 */
function initFontSizeSelector() {
    const fontSizeButtons = document.querySelectorAll('.font-size-btn');
    
    // Activer le bouton correspondant à la taille actuelle
    fontSizeButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.size === userPreferences.fontSize);
        
        button.addEventListener('click', () => {
            const newSize = button.dataset.size;
            
            // Mettre à jour l'interface
            fontSizeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Mettre à jour les classes du body
            document.body.classList.remove('font-small', 'font-medium', 'font-large');
            document.body.classList.add('font-' + newSize);
            
            // Sauvegarder la préférence
            userPreferences.fontSize = newSize;
            saveUserPreferences();
        });
    });
}

/**
 * Initialise le sélecteur de langue
 */
function initLanguageSelector() {
    const languageRadios = document.querySelectorAll('input[name="language"]');
    
    // S'assurer que la langue correcte est sélectionnée au chargement
    if (userPreferences.language) {
        const languageRadio = document.querySelector(`input[name="language"][value="${userPreferences.language}"]`);
        if (languageRadio) {
            languageRadio.checked = true;
        }
    }
    
    // Gestionnaire d'événements pour les radios de langue
    languageRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            userPreferences.language = radio.value;
            saveUserPreferences();
        });
    });
}

/**
 * Initialise les sélecteurs de devise
 */
function initCurrencySelector() {
    // Configuration et préférences par défaut
    if (!userPreferences.currency) {
        userPreferences.currency = 'EUR';
    }
    
    if (!userPreferences.secondaryCurrency) {
        userPreferences.secondaryCurrency = 'USD';
    }
    
    // Génération des listes déroulantes de devises
    const primaryCurrencyContainer = document.getElementById('primaryCurrencyContainer');
    const secondaryCurrencyContainer = document.getElementById('secondaryCurrencyContainer');
    
    if (primaryCurrencyContainer) {
        primaryCurrencyContainer.innerHTML = generateCurrencyDropdown('primaryCurrency', userPreferences.currency);
    }
    
    if (secondaryCurrencyContainer) {
        secondaryCurrencyContainer.innerHTML = generateCurrencyDropdown('secondaryCurrency', userPreferences.secondaryCurrency);
    }
    
    // Mise à jour de l'aperçu des devises
    updateCurrencyPreview();
    
    // Ajout des gestionnaires d'événements
    const primaryCurrencySelect = document.getElementById('primaryCurrency');
    const secondaryCurrencySelect = document.getElementById('secondaryCurrency');
    
    if (primaryCurrencySelect) {
        primaryCurrencySelect.addEventListener('change', function() {
            const selectedCurrency = this.value;
            const oldCurrency = userPreferences.currency;
            
            // Si la devise principale est la même que la secondaire, permuter
            if (selectedCurrency === userPreferences.secondaryCurrency) {
                userPreferences.secondaryCurrency = oldCurrency;
                if (secondaryCurrencySelect) {
                    secondaryCurrencySelect.value = oldCurrency;
                }
            }
            
            userPreferences.currency = selectedCurrency;
            
            try {
                // Simple sauvegarde des préférences sans conversion
                localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
                console.log('Préférences de devise principale sauvegardées:', userPreferences);
                
                // Mise à jour de l'aperçu
                updateCurrencyPreview();
                
                const currencyInfo = AVAILABLE_CURRENCIES.find(c => c.code === selectedCurrency);
                showNotification(`Devise principale changée en ${currencyInfo.name}.`, 'success');
                
                // Pour appliquer les conversions, rechargez la page ou appelez une fonction de conversion séparée
                // si (confirm("Voulez-vous convertir tous vos montants dans cette nouvelle devise?")) {
                //    convertAllProjectsAndWallets(oldCurrency, selectedCurrency);
                // }
            } catch (error) {
                console.error('Erreur lors du changement de devise principale:', error);
                showNotification('Erreur lors du changement de devise', 'error');
            }
        });
    }
    
    if (secondaryCurrencySelect) {
        secondaryCurrencySelect.addEventListener('change', function() {
            const selectedCurrency = this.value;
            const oldSecondaryCurrency = userPreferences.secondaryCurrency;
            
            // Si la devise secondaire est la même que la principale, permuter
            if (selectedCurrency === userPreferences.currency) {
                userPreferences.currency = oldSecondaryCurrency;
                if (primaryCurrencySelect) {
                    primaryCurrencySelect.value = oldSecondaryCurrency;
                }
            }
            
            userPreferences.secondaryCurrency = selectedCurrency;
            
            try {
                // Simple sauvegarde des préférences
                localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
                console.log('Préférences de devise secondaire sauvegardées:', userPreferences);
                
                // Mise à jour de l'aperçu
                updateCurrencyPreview();
                
                const currencyInfo = AVAILABLE_CURRENCIES.find(c => c.code === selectedCurrency);
                showNotification(`Devise secondaire changée en ${currencyInfo.name}.`, 'success');
                
            } catch (error) {
                console.error('Erreur lors du changement de devise secondaire:', error);
                showNotification('Erreur lors du changement de devise', 'error');
            }
        });
    }
}

/**
 * Met à jour l'aperçu des devises
 */
function updateCurrencyPreview() {
    const currencyPreview = document.getElementById('currencyPreview');
    if (!currencyPreview) return;
    
    const primaryCurrency = userPreferences.currency;
    const secondaryCurrency = userPreferences.secondaryCurrency;
    
    // Exemple de montant pour l'aperçu
    const amount = 100;
    
    const formattedAmount = formatCurrencyWithEquivalent(amount, primaryCurrency, secondaryCurrency);
    currencyPreview.querySelector('.example').textContent = formattedAmount;
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
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Dans une application réelle, nous enverrions ces données au serveur
            // Pour cette démo, on simule juste un changement local
            if (profileName) profileName.textContent = profileNameInput.value;
            if (profileEmail) profileEmail.textContent = profileEmailInput.value;
            
            showNotification('Profil mis à jour avec succès', 'success');
        });
    }
    
    // Gestionnaire d'événements pour l'upload d'avatar
    if (avatarUpload) {
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
                    if (profileAvatar) profileAvatar.src = event.target.result;
                    
                    // Dans une application réelle, nous enverrions l'image au serveur
                    showNotification('Avatar mis à jour avec succès', 'success');
                };
                reader.readAsDataURL(file);
            }
        });
    }
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
    const manageSubscriptionBtn = document.getElementById('manageSubscriptionBtn');
    if (manageSubscriptionBtn) {
        manageSubscriptionBtn.addEventListener('click', () => {
            // Dans une application réelle, cela redirigerait vers une page de gestion d'abonnement
            showNotification('Cette fonctionnalité sera disponible prochainement', 'info');
        });
    }
    
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
    if (currentPlanName) {
        currentPlanName.textContent = plan.charAt(0).toUpperCase() + plan.slice(1);
    }
    
    // Mettre à jour la classe du badge du plan
    if (planBadge) {
        planBadge.className = 'plan-badge ' + plan;
    }
    
    // Mettre à jour l'affichage des fonctionnalités utilisateur
    if (plan === 'freemium') {
        // Les utilisateurs Freemium n'ont pas accès à la gestion des utilisateurs
        if (usersTab) usersTab.style.display = 'none';
        
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
        if (usersTab) usersTab.style.display = 'flex';
        
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
    const subscription = document.getElementById('subscription-content');
    if (!subscription) return;
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'test-plan-buttons';
    buttonsContainer.style.marginTop = '20px';
    buttonsContainer.style.padding = '15px';
    buttonsContainer.style.backgroundColor = '#f8fafc';
    buttonsContainer.style.borderRadius = '8px';
    
    buttonsContainer.innerHTML = `
        <h4 style="margin-top: 0;">Mode démo: Tester les différents plans</h4>
        <p style="margin-bottom: 15px;">Ces boutons sont uniquement pour la démonstration. Ils permettent de simuler les différents plans.</p>
        <div style="display: flex; gap: 10px;">
            <button id="testFreemiumBtn" class="btn btn-secondary">Freemium</button>
            <button id="testBasicBtn" class="btn btn-secondary">Basic</button>
            <button id="testProBtn" class="btn btn-secondary">Pro</button>
        </div>
    `;
    
    subscription.appendChild(buttonsContainer);
    
    // Ajouter les gestionnaires d'événements
    document.getElementById('testFreemiumBtn').addEventListener('click', () => {
        userPreferences.plan = 'freemium';
        saveUserPreferences();
        updatePlanDisplay('freemium');
        showNotification('Plan changé en Freemium', 'success');
    });
    
    document.getElementById('testBasicBtn').addEventListener('click', () => {
        userPreferences.plan = 'basic';
        saveUserPreferences();
        updatePlanDisplay('basic');
        showNotification('Plan changé en Basic', 'success');
    });
    
    document.getElementById('testProBtn').addEventListener('click', () => {
        userPreferences.plan = 'pro';
        saveUserPreferences();
        updatePlanDisplay('pro');
        showNotification('Plan changé en Pro', 'success');
    });
}

/**
 * Initialise les modales
 */
function initModals() {
    // Boutons d'ouverture de modal
    document.querySelectorAll('[data-modal]').forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.dataset.modal;
            openModal(modalId);
        });
    });
    
    // Boutons de fermeture de modal
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal.id);
        });
    });
    
    // Fermer la modal en cliquant à l'extérieur
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Formulaire d'invitation
    const inviteForm = document.getElementById('inviteForm');
    if (inviteForm) {
        inviteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simuler l'envoi d'une invitation
            const email = document.getElementById('inviteEmail').value;
            const permission = document.getElementById('invitePermission').value;
            
            // Dans une application réelle, nous enverrions ces données au serveur
            showNotification(`Invitation envoyée à ${email} avec les droits de ${permission}`, 'success');
            
            // Fermer la modal
            closeModal('inviteModal');
        });
    }
}

/**
 * Ouvre une modal
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

/**
 * Ferme une modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Affiche une notification à l'utilisateur
 */
function showNotification(message, type = 'info') {
    // Vérifier si le conteneur de notifications existe
    let notificationsContainer = document.getElementById('notifications-container');
    
    // Créer le conteneur s'il n'existe pas
    if (!notificationsContainer) {
        notificationsContainer = document.createElement('div');
        notificationsContainer.id = 'notifications-container';
        notificationsContainer.style.position = 'fixed';
        notificationsContainer.style.top = '20px';
        notificationsContainer.style.right = '20px';
        notificationsContainer.style.zIndex = '9999';
        document.body.appendChild(notificationsContainer);
    }
    
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.backgroundColor = type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6';
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.margin = '0 0 10px 0';
    notification.style.borderRadius = '8px';
    notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    notification.style.transition = 'all 0.3s ease';
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(20px)';
    
    // Ajouter le message
    notification.textContent = message;
    
    // Ajouter la notification au conteneur
    notificationsContainer.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Supprimer la notification après 3 secondes
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(20px)';
        
        setTimeout(() => {
            notificationsContainer.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * Ajoute un bouton de conversion de devises
 */
function addCurrencyConversionButton() {
    const currencySettings = document.querySelector('.currency-settings');
    if (!currencySettings) return;
    
    // Créer le bouton de conversion
    const convertButton = document.createElement('button');
    convertButton.id = 'convertProjectsButton';
    convertButton.className = 'btn btn-primary mt-20';
    convertButton.style.width = '100%';
    convertButton.innerHTML = `<i class="fas fa-sync-alt"></i> Convertir tous les montants en ${userPreferences.currency}`;
    
    // Insérer le bouton après les paramètres de devise
    currencySettings.appendChild(convertButton);
    
    // Ajouter le gestionnaire d'événements
    convertButton.addEventListener('click', function() {
        const primaryCurrency = userPreferences.currency;
        
        showNotification(`Conversion des montants en ${primaryCurrency} en cours...`, 'info');
        
        // Appeler la fonction de conversion
        const success = convertAllProjects(primaryCurrency);
        
        if (success) {
            showNotification(`Tous les montants ont été convertis avec succès en ${primaryCurrency}`, 'success');
            
            // Ajouter un délai pour que l'utilisateur voie la notification
            setTimeout(() => {
                // Recharger la page pour voir les changements
                window.location.reload();
            }, 2000);
        }
    });
}

/**
 * Convertit tous les projets et portefeuilles à la devise spécifiée
 */
function convertAllProjects(toCurrency) {
    try {
        // Récupérer les projets et les portefeuilles
        const projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        const wallets = JSON.parse(localStorage.getItem('mapocket_wallets') || '[]');
        
        // Convertir les projets
        const updatedProjects = projects.map(project => {
            // Déterminer la devise actuelle du projet
            let fromCurrency = 'EUR'; // devise par défaut si non spécifiée
            
            if (project.currency) {
                fromCurrency = project.currency;
            } else {
                // Essayer de détecter la devise à partir du budget total
                if (project.totalBudget) {
                    if (project.totalBudget.includes('AED')) fromCurrency = 'EUR';
                    else if (project.totalBudget.includes('$')) fromCurrency = 'USD';
                    // Les autres devises peuvent être détectées similairement
                }
            }
            
            // Vérifier si la conversion est nécessaire
            if (fromCurrency === toCurrency) {
                return project;
            }
            
            // Obtenir le symbole de la devise cible
            const toCurrencySymbol = getCurrencySymbol(toCurrency);
            
            // Mettre à jour la devise du projet
            project.currency = toCurrency;
            
            // Convertir le budget total
            if (project.totalBudget) {
                // Extraire la valeur numérique
                const numericValue = extractNumericValue(project.totalBudget);
                if (!isNaN(numericValue)) {
                    // Convertir le montant
                    const convertedValue = numericValue * getExchangeRate(fromCurrency, toCurrency);
                    // Formater selon la devise cible
                    project.totalBudget = formatAmount(convertedValue, toCurrency);
                }
            }
            
            // Convertir les catégories
            if (project.categories && Array.isArray(project.categories)) {
                project.categories.forEach(category => {
                    // Convertir le montant de la catégorie
                    if (category.amount) {
                        const numericValue = extractNumericValue(category.amount);
                        if (!isNaN(numericValue)) {
                            const convertedValue = numericValue * getExchangeRate(fromCurrency, toCurrency);
                            category.amount = formatAmount(convertedValue, toCurrency);
                        }
                    }
                    
                    // Convertir les sous-catégories
                    if (category.subcategories && Array.isArray(category.subcategories)) {
                        category.subcategories.forEach(subcategory => {
                            if (subcategory.amount) {
                                const numericValue = extractNumericValue(subcategory.amount);
                                if (!isNaN(numericValue)) {
                                    const convertedValue = numericValue * getExchangeRate(fromCurrency, toCurrency);
                                    subcategory.amount = formatAmount(convertedValue, toCurrency);
                                }
                            }
                            
                            // Convertir les lignes
                            if (subcategory.lines && Array.isArray(subcategory.lines)) {
                                subcategory.lines.forEach(line => {
                                    if (line.amount) {
                                        const numericValue = extractNumericValue(line.amount);
                                        if (!isNaN(numericValue)) {
                                            const convertedValue = numericValue * getExchangeRate(fromCurrency, toCurrency);
                                            line.amount = formatAmount(convertedValue, toCurrency);
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
            
            // Convertir les dépenses réelles
            if (project.realExpenses && Array.isArray(project.realExpenses)) {
                project.realExpenses.forEach(expense => {
                    if (expense.amount !== undefined) {
                        const amount = typeof expense.amount === 'string' ? 
                            extractNumericValue(expense.amount) : expense.amount;
                        
                        expense.amount = amount * getExchangeRate(fromCurrency, toCurrency);
                    }
                });
            }
            
            return project;
        });
        
        // Sauvegarder les projets convertis
        localStorage.setItem('savedProjects', JSON.stringify(updatedProjects));
        
        // Convertir les portefeuilles
        const updatedWallets = wallets.map(wallet => {
            // Déterminer la devise actuelle
            let fromCurrency = 'EUR';
            if (wallet.currency === '$') fromCurrency = 'USD';
            else if (wallet.currency === 'AED') fromCurrency = 'EUR';
            
            // Vérifier si la conversion est nécessaire
            if (fromCurrency === toCurrency) {
                return wallet;
            }
            
            // Mettre à jour la devise
            wallet.currency = getCurrencySymbol(toCurrency);
            
            // Convertir le solde
            if (wallet.balance !== undefined) {
                wallet.balance = wallet.balance * getExchangeRate(fromCurrency, toCurrency);
            }
            
            // Convertir les transactions
            if (wallet.transactions && Array.isArray(wallet.transactions)) {
                wallet.transactions.forEach(transaction => {
                    if (transaction.amount !== undefined) {
                        transaction.amount = transaction.amount * getExchangeRate(fromCurrency, toCurrency);
                    }
                });
            }
            
            return wallet;
        });
        
        // Sauvegarder les portefeuilles convertis
        localStorage.setItem('mapocket_wallets', JSON.stringify(updatedWallets));
        
        return true;
    } catch (error) {
        console.error('Erreur lors de la conversion des projets:', error);
        showNotification('Erreur lors de la conversion des projets', 'error');
        return false;
    }
}

/**
 * Extrait la valeur numérique d'une chaîne de montant
 */
function extractNumericValue(amountString) {
    if (typeof amountString !== 'string') {
        return parseFloat(amountString) || 0;
    }
    
    // Supprimer tout ce qui n'est pas un chiffre, un point ou une virgule
    const numericString = amountString.replace(/[^0-9.,]/g, '');
    
    // Remplacer la virgule par un point pour la conversion
    const normalizedString = numericString.replace(',', '.');
    
    return parseFloat(normalizedString) || 0;
}

/**
 * Formate un montant selon la devise
 */
function formatAmount(amount, currencyCode) {
    return formatCurrency(amount, currencyCode);
}