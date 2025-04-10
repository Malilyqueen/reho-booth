// JavaScript for the New Project page

// Variables globales pour la sauvegarde automatique
let autoSaveInterval;
let lastSavedData = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('New Project page initialized');
    
    // Ajouter les styles CSS pour le mode édition
    const style = document.createElement('style');
    style.textContent = `
        .edit-mode-notice {
            background-color: #e3f2fd;
            color: #0d6efd;
            padding: 8px 12px;
            border-radius: 4px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            font-weight: 500;
        }
        
        .edit-mode-notice i {
            margin-right: 8px;
        }
        
        .project-form-container.edit-mode .form-header h3 {
            color: #0d6efd;
        }
        
        .btn-update {
            background-color: #198754;
            border-color: #198754;
        }
        
        .save-changes-btn {
            margin-right: 10px;
            background-color: #0d6efd;
            border-color: #0d6efd;
            color: white;
        }
        
        .cancel-edit-btn {
            margin-left: 10px;
        }
    `;
    document.head.appendChild(style);
    
    // S'assurer que les préférences sont appliquées avant d'initialiser la page
    if (window.preferencesManager) {
        window.preferencesManager.applyAllPreferences();
    }
    
    // Vérifier si on est en mode visualisation ou édition
    const urlParams = new URLSearchParams(window.location.search);
    const viewMode = urlParams.get('view') === 'true' || localStorage.getItem('viewMode') === 'true';
    const editMode = urlParams.get('edit') === 'true';
    const projectId = urlParams.get('id');
    
    console.log("Mode détecté:", editMode ? "Édition" : viewMode ? "Visualisation" : "Création", "Projet ID:", projectId);
    
    // Initialiser le formulaire de nouveau projet
    initializeProjectForm();
    
    // Initialiser l'accordéon des catégories de modèles
    initializeTemplateAccordion();
    
    // Initialiser les options de modèles
    initializeTemplateOptions();
    
    // Initialiser les interactions avec les catégories et sous-catégories de dépenses
    initializeExpenseCategories();
    
    if (viewMode) {
        console.log('Mode visualisation activé');
        enableViewMode();
    } else if (editMode) {
        console.log('Mode édition activé');
        enableEditMode(projectId);
    } else {
        // Initialiser la sauvegarde automatique (seulement si pas en mode visualisation ou édition)
        initializeAutoSave();
    }
    
    // Initialiser le bouton d'ajout de catégorie principale
    const addMainCategoryBtn = document.getElementById('addMainCategoryBtn');
    if (addMainCategoryBtn) {
        addMainCategoryBtn.addEventListener('click', addMainCategory);
    }
    
    // Initialiser les fonctionnalités de sous-catégories
    initializeSubcategories();
    
    // Initialize budget calculation
    initializeBudgetCalculation();
    
    // Initialiser la section liste de souhaits
    const createWishlistCheckbox = document.getElementById('createWishlist');
    if (createWishlistCheckbox) {
        createWishlistCheckbox.addEventListener('change', function() {
            const wishlistOptions = document.getElementById('wishlistOptions');
            if (this.checked) {
                wishlistOptions.style.display = 'block';
            } else {
                wishlistOptions.style.display = 'none';
            }
        });
        
        // Gestion du destinataire
        const wishlistRecipientType = document.getElementById('wishlistRecipientType');
        if (wishlistRecipientType) {
            wishlistRecipientType.addEventListener('change', function() {
                const recipientNameContainer = document.getElementById('recipientNameContainer');
                if (this.value === 'other') {
                    recipientNameContainer.style.display = 'block';
                } else {
                    recipientNameContainer.style.display = 'none';
                }
            });
        }
    }
});

// Fonction pour initialiser la sauvegarde automatique
function initializeAutoSave() {
    console.log('Initializing auto-save functionality');
    
    // Démarrer l'intervalle de sauvegarde automatique (toutes les 30 secondes)
    autoSaveInterval = setInterval(saveProjectData, 30000);
    
    // Ajouter la notification de sauvegarde
    const projectContainer = document.querySelector('.project-container');
    if (projectContainer) {
        const saveNotification = document.createElement('div');
        saveNotification.className = 'save-notification';
        saveNotification.innerHTML = `
            <span class="save-status">Toutes les modifications sont enregistrées</span>
            <button type="button" class="manual-save-btn">
                <i class="fas fa-save"></i> Enregistrer
            </button>
        `;
        projectContainer.appendChild(saveNotification);
        
        // Initialiser le bouton de sauvegarde manuelle
        const manualSaveBtn = saveNotification.querySelector('.manual-save-btn');
        if (manualSaveBtn) {
            manualSaveBtn.addEventListener('click', function() {
                saveProjectData(true);
            });
        }
    }
    
    // Si on quitte la page, vérifier s'il y a des modifications non sauvegardées
    window.addEventListener('beforeunload', function(e) {
        const currentData = getProjectData();
        if (JSON.stringify(currentData) !== JSON.stringify(lastSavedData)) {
            saveProjectData();
            // Message standard pour confirmation de quitter la page
            e.returnValue = 'Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter cette page?';
            return e.returnValue;
        }
    });
}

// Fonction pour sauvegarder les données du projet
function saveProjectData(showNotification = false) {
    const data = getProjectData();
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('currentProject', JSON.stringify(data));
    lastSavedData = data;
    
    // Mettre à jour la notification de sauvegarde
    const saveStatus = document.querySelector('.save-status');
    if (saveStatus) {
        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ':' + 
                        now.getMinutes().toString().padStart(2, '0');
        
        saveStatus.textContent = `Dernière sauvegarde à ${timeStr}`;
        saveStatus.classList.add('saved');
        
        // Si demandé, afficher une notification temporaire
        if (showNotification) {
            const notification = document.createElement('div');
            notification.className = 'temporary-notification';
            notification.textContent = 'Projet sauvegardé!';
            document.body.appendChild(notification);
            
            // Supprimer la notification après 3 secondes
            setTimeout(function() {
                notification.classList.add('fade-out');
                setTimeout(function() {
                    notification.remove();
                }, 500);
            }, 2500);
        }
        
        // Réinitialiser le style après 3 secondes
        setTimeout(function() {
            saveStatus.classList.remove('saved');
            saveStatus.textContent = 'Toutes les modifications sont enregistrées';
        }, 3000);
    }
    
    console.log('Project data saved', data);
}

// Fonction pour récupérer les données actuelles du projet
function getProjectData() {
    // Récupérer les préférences utilisateur pour obtenir la devise
    let userPreferences = {
        currency: 'EUR', // Devise par défaut
    };
    
    try {
        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
            userPreferences = JSON.parse(savedPrefs);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des préférences utilisateur:', error);
    }
    
    // Obtenir le symbole de la devise
    let currencySymbol = '€'; // Symbole par défaut (Euro)
    let currencyCode = 'EUR';
    
    // Si AVAILABLE_CURRENCIES est défini (depuis currencies.js), utiliser le symbole correspondant
    if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
        const currency = AVAILABLE_CURRENCIES.find(c => c.code === userPreferences.currency);
        if (currency) {
            currencySymbol = currency.symbol;
            currencyCode = currency.code;
        }
    }
    
    console.log('Devise du projet:', currencyCode, 'Symbole:', currencySymbol);
    
    // Vérifier si la case à cocher de la liste de souhaits est cochée
    const createWishlist = document.getElementById('createWishlist')?.checked || false;
    let wishlistData = null;
    
    if (createWishlist) {
        const recipientType = document.getElementById('wishlistRecipientType')?.value || 'myself';
        const recipientName = recipientType === 'other' ? document.getElementById('wishlistRecipientName')?.value || '' : '';
        wishlistData = {
            recipientType: recipientType,
            recipientName: recipientName
        };
    }
    
    const data = {
        projectName: document.getElementById('projectName')?.value || '',
        projectDate: document.getElementById('projectDate')?.value || '',
        projectEndDate: document.getElementById('projectEndDate')?.value || '',
        totalBudget: document.getElementById('totalBudget')?.value || '',
        projectStatus: document.getElementById('projectStatus')?.value || 'inProgress',
        template: document.querySelector('.template-option.selected') ? 
            document.querySelector('.template-option.selected').getAttribute('data-template') : 'Personnalisé',
        linkToWallet: document.getElementById('linkToWallet')?.checked || false,
        currency: currencyCode,
        currencySymbol: currencySymbol,
        createWishlist: createWishlist,
        wishlistData: wishlistData,
        categories: [],
        budgetTracking: {
            totalBudget: document.getElementById('totalBudget')?.value || '0',
            totalSpent: 0,
            totalWishlistPurchased: 0,
            percentageUsed: 0
        }
    };
    
    // Collecter les catégories et leurs sous-catégories
    const expenseCategories = document.querySelectorAll('.expense-category');
    expenseCategories.forEach(category => {
        const categoryName = category.querySelector('.category-name')?.textContent || '';
        const categoryAmount = category.querySelector('.category-amount')?.textContent || '';
        
        const subcategories = [];
        const subcategoryElements = category.querySelectorAll('.subcategory');
        subcategoryElements.forEach(subcategory => {
            const subcategoryName = subcategory.querySelector('.subcategory-name')?.textContent || '';
            const subcategoryAmount = subcategory.querySelector('.subcategory-amount')?.textContent || '';
            
            const lines = [];
            const expenseLines = subcategory.querySelectorAll('.expense-line');
            expenseLines.forEach(line => {
                const lineName = line.querySelector('.expense-line-name')?.value || '';
                const lineAmount = line.querySelector('.expense-line-amount')?.value || '';
                
                if (lineName && lineAmount) {
                    lines.push({
                        name: lineName,
                        amount: lineAmount
                    });
                }
            });
            
            subcategories.push({
                name: subcategoryName,
                amount: subcategoryAmount,
                lines: lines
            });
        });
        
        data.categories.push({
            name: categoryName,
            amount: categoryAmount,
            subcategories: subcategories
        });
    });
    
    return data;
}

function initializeProjectForm() {
    // Date picker initialization (in a full implementation, this would use a date picker library)
    const dateInput = document.getElementById('projectDate');
    if (dateInput) {
        dateInput.addEventListener('click', function() {
            console.log('Date picker clicked');
            // In a full implementation, this would open a date picker
        });
    }
    
    // Récupérer les préférences utilisateur pour obtenir la devise
    let userPreferences = {
        currency: 'EUR', // Devise par défaut
    };
    
    try {
        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
            userPreferences = JSON.parse(savedPrefs);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des préférences utilisateur:', error);
    }
    
    // Obtenir le symbole de la devise
    let currencySymbol = '€'; // Symbole par défaut (Euro)
    let currencyCode = 'EUR';
    
    // Si AVAILABLE_CURRENCIES est défini (depuis currencies.js), utiliser le symbole correspondant
    if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
        const currency = AVAILABLE_CURRENCIES.find(c => c.code === userPreferences.currency);
        if (currency) {
            currencySymbol = currency.symbol;
            currencyCode = currency.code;
        }
    }
    
    console.log('Mise à jour du budget total avec la devise:', currencyCode, currencySymbol);
    
    // Mettre à jour le budget total avec le bon symbole de devise
    const totalBudgetInput = document.getElementById('totalBudget');
    if (totalBudgetInput) {
        const value = totalBudgetInput.value.replace(/[^0-9.,\s]/g, '').trim(); // Enlève tous les symboles de devise
        totalBudgetInput.value = `${currencySymbol} ${value}`;
    }
    
    // Mettre à jour les montants de projets affichés sur la page
    const totalBudgetDisplay = document.querySelector('.total-budget-amount');
    if (totalBudgetDisplay) {
        const value = totalBudgetDisplay.textContent.replace(/[^0-9.,\s]/g, '').trim();
        totalBudgetDisplay.textContent = `${currencySymbol} ${value}`;
    }
    
    // Mettre à jour les montants affichés avec le bon symbole dans le HTML initial
    const amounts = document.querySelectorAll('.category-amount, .subcategory-amount, .expense-line-amount');
    amounts.forEach(amount => {
        if (amount.tagName.toLowerCase() === 'input') {
            // Pour les inputs (expense-line-amount)
            const value = amount.value.replace(/[^0-9.,\s]/g, '').trim();
            amount.value = `${currencySymbol} ${value}`;
        } else {
            // Pour les spans (category-amount, subcategory-amount)
            const value = amount.textContent.replace(/[^0-9.,\s]/g, '').trim();
            amount.textContent = `${currencySymbol} ${value}`;
        }
    });
    
    // Restaurer les données sauvegardées s'il y en a
    const savedProject = localStorage.getItem('currentProject');
    if (savedProject) {
        try {
            const projectData = JSON.parse(savedProject);
            restoreProjectData(projectData);
            console.log('Restored project data:', projectData);
        } catch (error) {
            console.error('Error restoring project data:', error);
        }
    }

    // Handle form submission
    // Vérifier si nous sommes en mode édition
    const urlParams = new URLSearchParams(window.location.search);
    const editMode = urlParams.get('edit') === 'true';
    const projectId = urlParams.get('id');
    
    const projectForm = document.getElementById('newProjectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect form data
            const formData = getProjectData();
            console.log('Form submitted:', formData);
            
            // Sauvegarder dans localStorage pour accès futur (liste des projets)
            let savedProjects = [];
            try {
                savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
                if (!Array.isArray(savedProjects)) {
                    console.error('savedProjects n\'est pas un tableau:', savedProjects);
                    savedProjects = [];
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des projets sauvegardés:', error);
                savedProjects = [];
            }
            
            // Si nous sommes en mode édition, mettre à jour le projet existant
            if (editMode && projectId) {
                console.log('Mise à jour du projet existant avec ID:', projectId);
                formData.id = projectId;
                
                // Conserver la date de création d'origine du projet
                const existingProject = savedProjects.find(p => p.id === projectId);
                if (existingProject) {
                    formData.createdAt = existingProject.createdAt;
                } else {
                    formData.createdAt = new Date().toISOString();
                }
                
                // Remplacer le projet existant par le projet mis à jour
                savedProjects = savedProjects.map(project => {
                    if (project.id === projectId) {
                        return formData;
                    }
                    return project;
                });
            } else {
                // Création d'un nouveau projet
                formData.id = Date.now().toString(); // Identifiant unique pour le projet
                formData.createdAt = new Date().toISOString();
                savedProjects.push(formData);
            }
            
            try {
                localStorage.setItem('savedProjects', JSON.stringify(savedProjects));
                console.log('Projet sauvegardé avec succès. Total projets:', savedProjects.length);
            } catch (error) {
                console.error('Erreur lors de la sauvegarde des projets:', error);
                alert('Erreur lors de la sauvegarde du projet. Veuillez réessayer.');
            }
            
            // Effacer le projet en cours
            localStorage.removeItem('currentProject');
            
            // Si l'option de liaison au portefeuille est cochée, ajouter le projet aux projets liés
            if (formData.linkToWallet) {
                // Récupérer les données du portefeuille
                let walletData = JSON.parse(localStorage.getItem('walletData') || '{"linkedProjects":[]}');
                
                // Ajouter l'ID du projet à la liste des projets liés
                if (!Array.isArray(walletData.linkedProjects)) {
                    walletData.linkedProjects = [];
                }
                walletData.linkedProjects.push(formData.id);
                
                // Enregistrer les données du portefeuille
                localStorage.setItem('walletData', JSON.stringify(walletData));
                console.log('Projet lié au portefeuille:', formData.id);
            }
            
            // Si l'option de création de liste de souhaits est cochée, créer la liste de souhaits associée
            if (formData.createWishlist) {
                console.log('Création d\'une liste de souhaits pour le projet:', formData.id);
                
                // Créer les données de la liste de souhaits
                const wishlistData = {
                    name: `Liste de souhaits - ${formData.projectName}`,
                    description: `Liste de souhaits associée au projet "${formData.projectName}"`,
                    recipientType: formData.wishlistData.recipientType,
                    recipientName: formData.wishlistData.recipientName,
                    linkedProject: formData.id,
                    theme: formData.template.toLowerCase().includes('anniversaire') ? 'birthday' : 
                           formData.template.toLowerCase().includes('mariage') ? 'wedding' :
                           formData.template.toLowerCase().includes('naissance') ? 'baby' :
                           formData.template.toLowerCase().includes('noël') ? 'christmas' :
                           formData.template.toLowerCase().includes('voyage') ? 'travel' : 'default',
                    privacy: 'private',
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                    items: []
                };
                
                // Récupérer les listes de souhaits existantes
                let wishlists = [];
                try {
                    const storedWishlists = localStorage.getItem('mapocket_wishlists');
                    wishlists = storedWishlists ? JSON.parse(storedWishlists) : [];
                } catch (error) {
                    console.error('Erreur lors de la récupération des listes de souhaits:', error);
                    wishlists = [];
                }
                
                // Ajouter la nouvelle liste
                wishlists.push(wishlistData);
                
                // Sauvegarder les listes
                localStorage.setItem('mapocket_wishlists', JSON.stringify(wishlists));
                console.log('Liste de souhaits créée avec succès pour le projet:', formData.id);
            }
            
            // Afficher un message de succès différent selon le mode
            if (editMode && projectId) {
                alert('Projet mis à jour avec succès!');
            } else {
                alert('Projet créé avec succès!');
            }
            // Then redirect to dashboard
            window.location.href = 'index.html';
        });
    }
}

// Fonction pour restaurer un projet sauvegardé
function restoreProjectData(data) {
    // Récupérer les préférences utilisateur pour obtenir la devise actuelle
    let userPreferences = {
        currency: 'EUR', // Devise par défaut
    };
    
    try {
        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
            userPreferences = JSON.parse(savedPrefs);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des préférences utilisateur:', error);
    }
    
    // Obtenir le symbole de la devise
    let currencySymbol = '€'; // Symbole par défaut (Euro)
    let currencyCode = 'EUR';
    
    // Si AVAILABLE_CURRENCIES est défini (depuis currencies.js), utiliser le symbole correspondant
    if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
        const currency = AVAILABLE_CURRENCIES.find(c => c.code === userPreferences.currency);
        if (currency) {
            currencySymbol = currency.symbol;
            currencyCode = currency.code;
        }
    }
    
    // Restaurer les informations de base du projet
    if (data.projectName) document.getElementById('projectName').value = data.projectName;
    if (data.projectDate) document.getElementById('projectDate').value = data.projectDate;
    if (data.projectEndDate) document.getElementById('projectEndDate').value = data.projectEndDate;
    if (data.projectStatus) document.getElementById('projectStatus').value = data.projectStatus;
    
    // Mettre à jour le budget total avec le symbole de devise actuel
    if (data.totalBudget) {
        // Extraire uniquement la valeur numérique du budget total
        const totalBudgetValue = data.totalBudget.replace(/[^0-9.,\s]/g, '').trim();
        document.getElementById('totalBudget').value = `${currencySymbol} ${totalBudgetValue}`;
    }
    
    // Restaurer l'option de liaison au portefeuille
    if (document.getElementById('linkToWallet')) {
        document.getElementById('linkToWallet').checked = data.linkToWallet || false;
    }
    
    // Sélectionner le bon modèle
    if (data.template) {
        const templateOption = document.querySelector(`.template-option[data-template="${data.template}"]`);
        if (templateOption) {
            document.querySelectorAll('.template-option').forEach(opt => opt.classList.remove('selected'));
            templateOption.classList.add('selected');
            
            // Mettre à jour le titre du type de projet
            const projectTypeTitle = document.querySelector('.project-type');
            if (projectTypeTitle) {
                projectTypeTitle.textContent = data.template;
            }
            
            // Mettre à jour le conseil IA
            updateAIAdvice(data.template);
        }
    }
    
    // Restaurer les catégories et sous-catégories du projet
    if (data.categories && Array.isArray(data.categories)) {
        console.log('Restauration des catégories du projet:', data.categories);
        
        // D'abord, déclencher la mise à jour du template pour créer la structure
        updateTemplateCategories(data.template);
        
        // Ensuite, mettre à jour avec les données réelles du projet
        updateCategoriesUI(data.categories, currencySymbol);
    } else {
        console.warn('Aucune catégorie trouvée dans les données du projet ou format incorrect');
    }
    
    // Définir lastSavedData pour la sauvegarde automatique
    lastSavedData = data;
}

function initializeTemplateAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            // Toggle active class on header
            this.classList.toggle('active');
            
            // Toggle corresponding content
            const content = this.nextElementSibling;
            content.classList.toggle('active');
            
            // Update chevron icon
            const icon = this.querySelector('i');
            if (icon) {
                if (content.classList.contains('active')) {
                    icon.className = 'fas fa-chevron-up';
                } else {
                    icon.className = 'fas fa-chevron-down';
                }
            }
        });
    });
}

function initializeTemplateOptions() {
    const templateOptions = document.querySelectorAll('.template-option');
    
    templateOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            document.querySelectorAll('.template-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Add selected class to clicked option
            this.classList.add('selected');
            
            // Get the template type
            const templateType = this.getAttribute('data-template');
            
            // Update the project type title
            const projectTypeTitle = document.querySelector('.project-type');
            if (projectTypeTitle) {
                projectTypeTitle.textContent = templateType;
            }
            
            // Mise à jour des catégories et sous-catégories
            console.log('Template selected:', templateType);
            updateTemplateCategories(templateType);
            
            // Mise à jour du conseil IA
            updateAIAdvice(templateType);
        });
    });
}

function initializeExpenseCategories() {
    // Gérer les toggles de catégories principales
    const categoryToggles = document.querySelectorAll('.category-toggle');
    categoryToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Trouver le conteneur parent et le conteneur de sous-catégories
            const categoryHeader = this.closest('.category-header');
            const subcategoriesContainer = categoryHeader.nextElementSibling;
            
            // Toggle la classe open
            this.classList.toggle('open');
            subcategoriesContainer.classList.toggle('open');
            
            // Mettre à jour l'icône
            if (this.classList.contains('open')) {
                this.innerHTML = '<i class="fas fa-chevron-up"></i>';
            } else {
                this.innerHTML = '<i class="fas fa-chevron-down"></i>';
            }
        });
    });
    
    // Initialiser les boutons d'ajout de ligne
    const addLineButtons = document.querySelectorAll('.add-line-btn');
    addLineButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Trouver le conteneur de lignes parent
            const expenseLines = this.closest('.expense-lines');
            
            // Créer une nouvelle ligne
            const newLine = document.createElement('div');
            newLine.className = 'expense-line';
            newLine.innerHTML = `
                <input type="text" class="form-control expense-line-name" value="Nouvelle ligne">
                <input type="text" class="form-control expense-line-amount" value="${currencySymbol} 0">
                <div class="expense-line-actions">
                    <button type="button" class="btn-sm btn-delete-line">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            // Insérer la nouvelle ligne avant le bouton d'ajout
            expenseLines.insertBefore(newLine, this);
            
            // Initialiser le bouton de suppression de la nouvelle ligne
            initializeDeleteLineButton(newLine.querySelector('.btn-delete-line'));
            
            // Mettre à jour les totaux
            updateSubcategoryTotal(expenseLines.closest('.subcategory'));
        });
    });
    
    // Initialiser les boutons de suppression de ligne
    const deleteLineButtons = document.querySelectorAll('.btn-delete-line');
    deleteLineButtons.forEach(button => {
        initializeDeleteLineButton(button);
    });
}

function initializeDeleteLineButton(button) {
    button.addEventListener('click', function() {
        // Trouver la ligne parent
        const expenseLine = this.closest('.expense-line');
        // Trouver la sous-catégorie parente
        const subcategory = expenseLine.closest('.subcategory');
        
        // Supprimer la ligne
        expenseLine.remove();
        
        // Mettre à jour le total de la sous-catégorie
        updateSubcategoryTotal(subcategory);
    });
}

function initializeSubcategories() {
    // Gérer les toggles de sous-catégories
    const subcategoryToggles = document.querySelectorAll('.subcategory-toggle');
    subcategoryToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Trouver le conteneur parent et le conteneur de lignes
            const subcategoryHeader = this.closest('.subcategory-header');
            const expenseLines = subcategoryHeader.nextElementSibling;
            
            // Toggle la classe open
            this.classList.toggle('open');
            expenseLines.classList.toggle('open');
            
            // Mettre à jour l'icône
            if (this.classList.contains('open')) {
                this.innerHTML = '<i class="fas fa-chevron-up"></i>';
            } else {
                this.innerHTML = '<i class="fas fa-chevron-down"></i>';
            }
        });
    });
    
    // Initialiser les boutons d'ajout de sous-catégorie
    const addSubcategoryButtons = document.querySelectorAll('.add-subcategory-btn');
    addSubcategoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Trouver le conteneur de sous-catégories parent
            const subcategoriesContainer = this.closest('.subcategories-container');
            const subcategoryFooter = this.closest('.subcategory-footer');
            
            // Créer une nouvelle sous-catégorie
            const newSubcategory = document.createElement('div');
            newSubcategory.className = 'subcategory';
            newSubcategory.innerHTML = `
                <div class="subcategory-header">
                    <h5 class="subcategory-name">Nouvelle sous-catégorie</h5>
                    <span class="subcategory-amount">${currencySymbol} 0</span>
                    <button type="button" class="subcategory-toggle open">
                        <i class="fas fa-chevron-up"></i>
                    </button>
                </div>
                <div class="expense-lines open">
                    <div class="expense-line">
                        <input type="text" class="form-control expense-line-name" value="Nouvelle ligne">
                        <input type="text" class="form-control expense-line-amount" value="${currencySymbol} 0">
                        <div class="expense-line-actions">
                            <button type="button" class="btn-sm btn-delete-line">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <button type="button" class="add-line-btn">
                        <i class="fas fa-plus"></i> Ajouter une ligne
                    </button>
                </div>
            `;
            
            // Insérer la nouvelle sous-catégorie avant le footer
            subcategoriesContainer.insertBefore(newSubcategory, subcategoryFooter);
            
            // Initialiser les interactions pour cette nouvelle sous-catégorie
            const newToggle = newSubcategory.querySelector('.subcategory-toggle');
            newToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Trouver le conteneur de lignes
                const expenseLines = this.closest('.subcategory-header').nextElementSibling;
                
                // Toggle la classe open
                this.classList.toggle('open');
                expenseLines.classList.toggle('open');
                
                // Mettre à jour l'icône
                if (this.classList.contains('open')) {
                    this.innerHTML = '<i class="fas fa-chevron-up"></i>';
                } else {
                    this.innerHTML = '<i class="fas fa-chevron-down"></i>';
                }
            });
            
            // Initialiser le bouton d'ajout de ligne
            const newAddLineBtn = newSubcategory.querySelector('.add-line-btn');
            newAddLineBtn.addEventListener('click', function() {
                // Trouver le conteneur de lignes
                const expenseLines = this.closest('.expense-lines');
                
                // Créer une nouvelle ligne
                const newLine = document.createElement('div');
                newLine.className = 'expense-line';
                newLine.innerHTML = `
                    <input type="text" class="form-control expense-line-name" value="Nouvelle ligne">
                    <input type="text" class="form-control expense-line-amount" value="${currencySymbol} 0">
                    <div class="expense-line-actions">
                        <button type="button" class="btn-sm btn-delete-line">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                
                // Insérer la nouvelle ligne avant le bouton d'ajout
                expenseLines.insertBefore(newLine, this);
                
                // Initialiser le bouton de suppression de la nouvelle ligne
                initializeDeleteLineButton(newLine.querySelector('.btn-delete-line'));
                
                // Mettre à jour les totaux
                updateSubcategoryTotal(newSubcategory);
            });
            
            // Initialiser les boutons de suppression de ligne
            const newDeleteLineButtons = newSubcategory.querySelectorAll('.btn-delete-line');
            newDeleteLineButtons.forEach(btn => {
                initializeDeleteLineButton(btn);
            });
            
            // Mettre à jour les totaux de la catégorie parent
            const parentCategory = subcategoriesContainer.closest('.expense-category');
            updateCategoryTotal(parentCategory);
        });
    });
    
    // Ajouter des écouteurs d'événements pour la mise à jour automatique des totaux
    document.addEventListener('input', function(e) {
        if (e.target && e.target.classList.contains('expense-line-amount')) {
            // Trouver la sous-catégorie parente
            const subcategory = e.target.closest('.subcategory');
            if (subcategory) {
                updateSubcategoryTotal(subcategory);
            }
        }
    });
}

function updateSubcategoryTotal(subcategory) {
    // Récupérer les préférences utilisateur pour obtenir la devise
    let userPreferences = {
        currency: 'EUR', // Devise par défaut
    };
    
    try {
        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
            userPreferences = JSON.parse(savedPrefs);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des préférences utilisateur:', error);
    }
    
    // Obtenir le symbole de la devise
    let currencySymbol = '€'; // Symbole par défaut (Euro)
    let currencyCode = 'EUR';
    
    // Si AVAILABLE_CURRENCIES est défini (depuis currencies.js), utiliser le symbole correspondant
    if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
        const currency = AVAILABLE_CURRENCIES.find(c => c.code === userPreferences.currency);
        if (currency) {
            currencySymbol = currency.symbol;
            currencyCode = currency.code;
        }
    }
    
    let total = 0;
    
    // Calculer le total à partir de toutes les lignes de dépenses
    const amountInputs = subcategory.querySelectorAll('.expense-line-amount');
    amountInputs.forEach(input => {
        // Extraire le montant (supprimer le symbole € et convertir en nombre)
        const value = input.value.trim();
        const amount = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
        total += amount;
    });
    
    // Mettre à jour l'affichage du total de la sous-catégorie
    const subcategoryAmount = subcategory.querySelector('.subcategory-amount');
    if (subcategoryAmount) {
        subcategoryAmount.textContent = `${currencySymbol} ${total}`;
        // Ajouter un attribut data pour stocker le code de devise
        subcategoryAmount.setAttribute('data-currency', currencyCode);
    }
    
    // Mettre à jour le total de la catégorie parente
    const parentCategory = subcategory.closest('.expense-category');
    if (parentCategory) {
        updateCategoryTotal(parentCategory);
    }
}

function updateCategoryTotal(category) {
    // Récupérer les préférences utilisateur pour obtenir la devise
    let userPreferences = {
        currency: 'EUR', // Devise par défaut
    };
    
    try {
        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
            userPreferences = JSON.parse(savedPrefs);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des préférences utilisateur:', error);
    }
    
    // Obtenir le symbole de la devise
    let currencySymbol = '€'; // Symbole par défaut (Euro)
    let currencyCode = 'EUR';
    
    // Si AVAILABLE_CURRENCIES est défini (depuis currencies.js), utiliser le symbole correspondant
    if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
        const currency = AVAILABLE_CURRENCIES.find(c => c.code === userPreferences.currency);
        if (currency) {
            currencySymbol = currency.symbol;
            currencyCode = currency.code;
        }
    }
    
    let total = 0;
    
    // Calculer le total à partir de toutes les sous-catégories
    const subcategoryAmounts = category.querySelectorAll('.subcategory-amount');
    subcategoryAmounts.forEach(amountElem => {
        // Extraire le montant (supprimer le symbole € et convertir en nombre)
        const value = amountElem.textContent.trim();
        const amount = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
        total += amount;
    });
    
    // Mettre à jour l'affichage du total de la catégorie
    const categoryAmount = category.querySelector('.category-amount');
    if (categoryAmount) {
        categoryAmount.textContent = `${currencySymbol} ${total}`;
        // Ajouter un attribut data pour stocker le code de devise
        categoryAmount.setAttribute('data-currency', currencyCode);
    }
    
    // Mettre à jour le total général du budget
    updateTotalBudget();
}

function addMainCategory() {
    // Récupérer les préférences utilisateur pour obtenir la devise
    let userPreferences = {
        currency: 'EUR', // Devise par défaut
    };
    
    try {
        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
            userPreferences = JSON.parse(savedPrefs);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des préférences utilisateur:', error);
    }
    
    // Obtenir le symbole de la devise
    let currencySymbol = '€'; // Symbole par défaut (Euro)
    let currencyCode = 'EUR';
    
    // Si AVAILABLE_CURRENCIES est défini (depuis currencies.js), utiliser le symbole correspondant
    if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
        const currency = AVAILABLE_CURRENCIES.find(c => c.code === userPreferences.currency);
        if (currency) {
            currencySymbol = currency.symbol;
            currencyCode = currency.code;
        }
    }
    
    // Trouver le conteneur des catégories de dépenses
    const expenseCategories = document.querySelector('.expense-categories');
    const addCategoryContainer = document.querySelector('.add-category-container');
    
    // Créer une nouvelle catégorie principale
    const newCategory = document.createElement('div');
    newCategory.className = 'expense-category';
    newCategory.innerHTML = `
        <div class="category-header">
            <h4 class="category-name">Nouvelle catégorie</h4>
            <span class="category-amount">${currencySymbol} 0</span>
            <div class="category-controls">
                <button type="button" class="category-toggle open">
                    <i class="fas fa-chevron-up"></i>
                </button>
            </div>
        </div>
        <div class="subcategories-container open">
            <!-- Sous-catégorie par défaut -->
            <div class="subcategory">
                <div class="subcategory-header">
                    <h5 class="subcategory-name">Nouvelle sous-catégorie</h5>
                    <span class="subcategory-amount">${currencySymbol} 0</span>
                    <button type="button" class="subcategory-toggle open">
                        <i class="fas fa-chevron-up"></i>
                    </button>
                </div>
                <div class="expense-lines open">
                    <div class="expense-line">
                        <input type="text" class="form-control expense-line-name" value="Nouvelle ligne">
                        <input type="text" class="form-control expense-line-amount" value="${currencySymbol} 0">
                        <div class="expense-line-actions">
                            <button type="button" class="btn-sm btn-delete-line">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <button type="button" class="add-line-btn">
                        <i class="fas fa-plus"></i> Ajouter une ligne
                    </button>
                </div>
            </div>
            
            <div class="subcategory-footer">
                <button type="button" class="add-subcategory-btn">
                    <i class="fas fa-plus"></i> Ajouter une sous-catégorie
                </button>
            </div>
        </div>
    `;
    
    // Insérer la nouvelle catégorie avant le conteneur du bouton d'ajout
    expenseCategories.insertBefore(newCategory, addCategoryContainer);
    
    // Initialiser toutes les interactions pour cette nouvelle catégorie
    const newToggle = newCategory.querySelector('.category-toggle');
    newToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Trouver le conteneur de sous-catégories
        const subcategoriesContainer = this.closest('.category-header').nextElementSibling;
        
        // Toggle la classe open
        this.classList.toggle('open');
        subcategoriesContainer.classList.toggle('open');
        
        // Mettre à jour l'icône
        if (this.classList.contains('open')) {
            this.innerHTML = '<i class="fas fa-chevron-up"></i>';
        } else {
            this.innerHTML = '<i class="fas fa-chevron-down"></i>';
        }
    });
    
    // Initialiser la sous-catégorie par défaut
    const defaultSubcategory = newCategory.querySelector('.subcategory');
    const subcategoryToggle = defaultSubcategory.querySelector('.subcategory-toggle');
    subcategoryToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Trouver le conteneur de lignes
        const expenseLines = this.closest('.subcategory-header').nextElementSibling;
        
        // Toggle la classe open
        this.classList.toggle('open');
        expenseLines.classList.toggle('open');
        
        // Mettre à jour l'icône
        if (this.classList.contains('open')) {
            this.innerHTML = '<i class="fas fa-chevron-up"></i>';
        } else {
            this.innerHTML = '<i class="fas fa-chevron-down"></i>';
        }
    });
    
    // Initialiser le bouton d'ajout de ligne
    const addLineBtn = newCategory.querySelector('.add-line-btn');
    addLineBtn.addEventListener('click', function() {
        // Trouver le conteneur de lignes
        const expenseLines = this.closest('.expense-lines');
        
        // Créer une nouvelle ligne
        const newLine = document.createElement('div');
        newLine.className = 'expense-line';
        newLine.innerHTML = `
            <input type="text" class="form-control expense-line-name" value="Nouvelle ligne">
            <input type="text" class="form-control expense-line-amount" value="${currencySymbol} 0">
            <div class="expense-line-actions">
                <button type="button" class="btn-sm btn-delete-line">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Insérer la nouvelle ligne avant le bouton d'ajout
        expenseLines.insertBefore(newLine, this);
        
        // Initialiser le bouton de suppression de la nouvelle ligne
        initializeDeleteLineButton(newLine.querySelector('.btn-delete-line'));
        
        // Mettre à jour les totaux
        updateSubcategoryTotal(defaultSubcategory);
    });
    
    // Initialiser les boutons de suppression de ligne
    const deleteLineButtons = newCategory.querySelectorAll('.btn-delete-line');
    deleteLineButtons.forEach(button => {
        initializeDeleteLineButton(button);
    });
    
    // Initialiser le bouton d'ajout de sous-catégorie
    const addSubcategoryBtn = newCategory.querySelector('.add-subcategory-btn');
    addSubcategoryBtn.addEventListener('click', function() {
        // Trouver le conteneur de sous-catégories
        const subcategoriesContainer = this.closest('.subcategories-container');
        const subcategoryFooter = this.closest('.subcategory-footer');
        
        // Créer une nouvelle sous-catégorie
        const newSubcategory = document.createElement('div');
        newSubcategory.className = 'subcategory';
        newSubcategory.innerHTML = `
            <div class="subcategory-header">
                <h5 class="subcategory-name">Nouvelle sous-catégorie</h5>
                <span class="subcategory-amount">${currencySymbol} 0</span>
                <button type="button" class="subcategory-toggle open">
                    <i class="fas fa-chevron-up"></i>
                </button>
            </div>
            <div class="expense-lines open">
                <div class="expense-line">
                    <input type="text" class="form-control expense-line-name" value="Nouvelle ligne">
                    <input type="text" class="form-control expense-line-amount" value="${currencySymbol} 0">
                    <div class="expense-line-actions">
                        <button type="button" class="btn-sm btn-delete-line">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <button type="button" class="add-line-btn">
                    <i class="fas fa-plus"></i> Ajouter une ligne
                </button>
            </div>
        `;
        
        // Insérer la nouvelle sous-catégorie avant le footer
        subcategoriesContainer.insertBefore(newSubcategory, subcategoryFooter);
        
        // Initialiser toutes les interactions pour cette nouvelle sous-catégorie
        const newSubcategoryToggle = newSubcategory.querySelector('.subcategory-toggle');
        newSubcategoryToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Trouver le conteneur de lignes
            const expenseLines = this.closest('.subcategory-header').nextElementSibling;
            
            // Toggle la classe open
            this.classList.toggle('open');
            expenseLines.classList.toggle('open');
            
            // Mettre à jour l'icône
            if (this.classList.contains('open')) {
                this.innerHTML = '<i class="fas fa-chevron-up"></i>';
            } else {
                this.innerHTML = '<i class="fas fa-chevron-down"></i>';
            }
        });
        
        // Initialiser le bouton d'ajout de ligne
        const newAddLineBtn = newSubcategory.querySelector('.add-line-btn');
        newAddLineBtn.addEventListener('click', function() {
            // Trouver le conteneur de lignes
            const expenseLines = this.closest('.expense-lines');
            
            // Créer une nouvelle ligne
            const newLine = document.createElement('div');
            newLine.className = 'expense-line';
            newLine.innerHTML = `
                <input type="text" class="form-control expense-line-name" value="Nouvelle ligne">
                <input type="text" class="form-control expense-line-amount" value="${currencySymbol} 0">
                <div class="expense-line-actions">
                    <button type="button" class="btn-sm btn-delete-line">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            // Insérer la nouvelle ligne avant le bouton d'ajout
            expenseLines.insertBefore(newLine, this);
            
            // Initialiser le bouton de suppression de la nouvelle ligne
            initializeDeleteLineButton(newLine.querySelector('.btn-delete-line'));
            
            // Mettre à jour les totaux
            updateSubcategoryTotal(newSubcategory);
        });
        
        // Initialiser les boutons de suppression de ligne
        const newDeleteLineButtons = newSubcategory.querySelectorAll('.btn-delete-line');
        newDeleteLineButtons.forEach(btn => {
            initializeDeleteLineButton(btn);
        });
        
        // Mettre à jour les totaux
        updateCategoryTotal(newCategory);
    });
    
    // Mettre à jour le total général
    updateTotalBudget();
}

function updateTotalBudget() {
    // Récupérer les préférences utilisateur pour obtenir la devise
    let userPreferences = {
        currency: 'EUR', // Devise par défaut
    };
    
    try {
        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
            userPreferences = JSON.parse(savedPrefs);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des préférences utilisateur:', error);
    }
    
    // Obtenir le symbole de la devise
    let currencySymbol = '€'; // Symbole par défaut (Euro)
    let currencyCode = 'EUR';
    
    // Si AVAILABLE_CURRENCIES est défini (depuis currencies.js), utiliser le symbole correspondant
    if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
        const currency = AVAILABLE_CURRENCIES.find(c => c.code === userPreferences.currency);
        if (currency) {
            currencySymbol = currency.symbol;
            currencyCode = currency.code;
        }
    }
    
    console.log('Mise à jour du budget total avec la devise:', currencyCode, currencySymbol);
    
    let total = 0;
    
    // Calculer le total à partir de toutes les catégories principales
    const categoryAmounts = document.querySelectorAll('.category-amount');
    categoryAmounts.forEach(amountElem => {
        // Extraire le montant (supprimer le symbole € et convertir en nombre)
        const value = amountElem.textContent.trim();
        const amount = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
        total += amount;
    });
    
    // Mettre à jour l'affichage du total du budget
    const totalBudgetAmount = document.querySelector('.total-budget-amount');
    if (totalBudgetAmount) {
        totalBudgetAmount.textContent = `${currencySymbol} ${total}`;
        totalBudgetAmount.setAttribute('data-currency', currencyCode);
    }
    
    // Mettre à jour le champ de budget total (pour le formulaire)
    const totalBudgetInput = document.getElementById('totalBudget');
    if (totalBudgetInput) {
        totalBudgetInput.value = `${currencySymbol} ${total}`;
        totalBudgetInput.setAttribute('data-currency', currencyCode);
    }
}

function initializeBudgetCalculation() {
    // This function is called on page load to initialize budget calculation
    // and will update the total whenever amounts are changed
    
    // Mettre à jour le total à l'initialisation
    updateTotalBudget();
    
    // Écouter les changements sur tous les champs de montant
    document.addEventListener('input', function(e) {
        if (e.target && e.target.classList.contains('expense-line-amount')) {
            // Si un montant change, mettre à jour le total
            const subcategory = e.target.closest('.subcategory');
            if (subcategory) {
                updateSubcategoryTotal(subcategory);
            }
        }
    });
}

// Fonction pour mettre à jour les catégories de dépenses en fonction du modèle sélectionné
// Données de budgets par défaut pour chaque modèle
const defaultBudgets = {
    // 🎉 Événementiels
    "Anniversaire": {
        "categories": [
            {
                "name": "Restauration",
                "subcategories": [
                    {
                        "name": "Traiteur",
                        "lines": [
                            { "name": "Menu principal", "amount": "€ 150" },
                            { "name": "Desserts", "amount": "€ 50" }
                        ]
                    },
                    {
                        "name": "Boissons",
                        "lines": [
                            { "name": "Soft drinks", "amount": "€ 50" },
                            { "name": "Alcool", "amount": "€ 50" }
                        ]
                    }
                ]
            },
            {
                "name": "Animation",
                "subcategories": [
                    {
                        "name": "DJ",
                        "lines": [
                            { "name": "DJ forfait soirée", "amount": "€ 150" }
                        ]
                    },
                    {
                        "name": "Jeux",
                        "lines": [
                            { "name": "Matériel de jeux enfants", "amount": "€ 50" }
                        ]
                    }
                ]
            },
            {
                "name": "Décoration",
                "subcategories": [
                    {
                        "name": "Salle",
                        "lines": [
                            { "name": "Ballons", "amount": "€ 30" },
                            { "name": "Banderoles", "amount": "€ 20" }
                        ]
                    }
                ]
            }
        ]
    },
    "Mariage": {
        "categories": [
            {
                "name": "Lieu",
                "subcategories": [
                    {
                        "name": "Location",
                        "lines": [
                            { "name": "Location salle", "amount": "€ 800" }
                        ]
                    }
                ]
            },
            {
                "name": "Restauration",
                "subcategories": [
                    {
                        "name": "Repas",
                        "lines": [
                            { "name": "Cocktail", "amount": "€ 600" },
                            { "name": "Dîner", "amount": "€ 1200" }
                        ]
                    },
                    {
                        "name": "Dessert",
                        "lines": [
                            { "name": "Gâteau", "amount": "€ 200" }
                        ]
                    }
                ]
            },
            {
                "name": "Animation",
                "subcategories": [
                    {
                        "name": "Musique",
                        "lines": [
                            { "name": "DJ", "amount": "€ 500" },
                            { "name": "Groupe", "amount": "€ 300" }
                        ]
                    }
                ]
            },
            {
                "name": "Tenues",
                "subcategories": [
                    {
                        "name": "Vêtements",
                        "lines": [
                            { "name": "Robe", "amount": "€ 1000" },
                            { "name": "Costume", "amount": "€ 600" }
                        ]
                    }
                ]
            }
        ]
    },
    "Baby shower": {
        "categories": [
            {
                "name": "Restauration",
                "subcategories": [
                    {
                        "name": "Buffet",
                        "lines": [
                            { "name": "Amuse-bouches", "amount": "€ 80" },
                            { "name": "Desserts thématiques", "amount": "€ 60" }
                        ]
                    },
                    {
                        "name": "Boissons",
                        "lines": [
                            { "name": "Jus et sodas", "amount": "€ 40" },
                            { "name": "Champagne sans alcool", "amount": "€ 30" }
                        ]
                    }
                ]
            },
            {
                "name": "Décoration",
                "subcategories": [
                    {
                        "name": "Salle",
                        "lines": [
                            { "name": "Ballons", "amount": "€ 25" },
                            { "name": "Banderoles", "amount": "€ 15" },
                            { "name": "Accessoires thématiques", "amount": "€ 35" }
                        ]
                    }
                ]
            },
            {
                "name": "Animation",
                "subcategories": [
                    {
                        "name": "Jeux",
                        "lines": [
                            { "name": "Matériel pour jeux", "amount": "€ 40" },
                            { "name": "Petits cadeaux", "amount": "€ 50" }
                        ]
                    }
                ]
            }
        ]
    },
    "Fête d'entreprise": {
        "categories": [
            {
                "name": "Lieu",
                "subcategories": [
                    {
                        "name": "Location",
                        "lines": [
                            { "name": "Salle réception", "amount": "€ 1200" },
                            { "name": "Équipement audiovisuel", "amount": "€ 300" }
                        ]
                    }
                ]
            },
            {
                "name": "Restauration",
                "subcategories": [
                    {
                        "name": "Service traiteur",
                        "lines": [
                            { "name": "Cocktail dînatoire", "amount": "€ 2000" },
                            { "name": "Boissons", "amount": "€ 800" },
                            { "name": "Personnel de service", "amount": "€ 500" }
                        ]
                    }
                ]
            },
            {
                "name": "Animation",
                "subcategories": [
                    {
                        "name": "Divertissement",
                        "lines": [
                            { "name": "DJ/Musique", "amount": "€ 600" },
                            { "name": "Animations thématiques", "amount": "€ 800" }
                        ]
                    }
                ]
            },
            {
                "name": "Communication",
                "subcategories": [
                    {
                        "name": "Promotion",
                        "lines": [
                            { "name": "Invitations", "amount": "€ 150" },
                            { "name": "Signalétique", "amount": "€ 200" }
                        ]
                    }
                ]
            }
        ]
    },
    "Célébration religieuse": {
        "categories": [
            {
                "name": "Lieu de culte",
                "subcategories": [
                    {
                        "name": "Cérémonie",
                        "lines": [
                            { "name": "Don/Location", "amount": "€ 300" },
                            { "name": "Décoration", "amount": "€ 150" }
                        ]
                    }
                ]
            },
            {
                "name": "Réception",
                "subcategories": [
                    {
                        "name": "Salle",
                        "lines": [
                            { "name": "Location espace", "amount": "€ 600" }
                        ]
                    },
                    {
                        "name": "Traiteur",
                        "lines": [
                            { "name": "Repas", "amount": "€ 1000" },
                            { "name": "Boissons", "amount": "€ 300" }
                        ]
                    }
                ]
            },
            {
                "name": "Tenues",
                "subcategories": [
                    {
                        "name": "Vêtements cérémonie",
                        "lines": [
                            { "name": "Tenue principale", "amount": "€ 350" },
                            { "name": "Accessoires", "amount": "€ 100" }
                        ]
                    }
                ]
            },
            {
                "name": "Souvenirs",
                "subcategories": [
                    {
                        "name": "Cadeaux",
                        "lines": [
                            { "name": "Livrets/Images", "amount": "€ 200" },
                            { "name": "Petits présents", "amount": "€ 250" }
                        ]
                    }
                ]
            }
        ]
    },
    
    // 🏠 Vie personnelle
    "Budget mensuel": {
        "categories": [
            {
                "name": "Logement",
                "subcategories": [
                    {
                        "name": "Charges fixes",
                        "lines": [
                            { "name": "Loyer/Crédit", "amount": "€ 850" },
                            { "name": "Charges", "amount": "€ 120" }
                        ]
                    },
                    {
                        "name": "Factures",
                        "lines": [
                            { "name": "Électricité", "amount": "€ 75" },
                            { "name": "Internet", "amount": "€ 35" },
                            { "name": "Eau", "amount": "€ 40" }
                        ]
                    }
                ]
            },
            {
                "name": "Alimentation",
                "subcategories": [
                    {
                        "name": "Courses",
                        "lines": [
                            { "name": "Supermarché", "amount": "€ 300" },
                            { "name": "Marché", "amount": "€ 100" }
                        ]
                    },
                    {
                        "name": "Restaurants",
                        "lines": [
                            { "name": "Sorties", "amount": "€ 120" }
                        ]
                    }
                ]
            },
            {
                "name": "Transport",
                "subcategories": [
                    {
                        "name": "Véhicule",
                        "lines": [
                            { "name": "Carburant", "amount": "€ 120" },
                            { "name": "Assurance", "amount": "€ 50" }
                        ]
                    },
                    {
                        "name": "Transports publics",
                        "lines": [
                            { "name": "Abonnement", "amount": "€ 60" }
                        ]
                    }
                ]
            },
            {
                "name": "Loisirs",
                "subcategories": [
                    {
                        "name": "Divertissement",
                        "lines": [
                            { "name": "Sorties", "amount": "€ 80" },
                            { "name": "Abonnements", "amount": "€ 30" }
                        ]
                    }
                ]
            }
        ]
    },
    "Ménage familial": {
        "categories": [
            {
                "name": "Ménage",
                "subcategories": [
                    {
                        "name": "Courses alimentaires",
                        "lines": [
                            { "name": "Courses semaine 1", "amount": "€ 120" },
                            { "name": "Courses semaine 2", "amount": "€ 100" }
                        ]
                    },
                    {
                        "name": "Factures",
                        "lines": [
                            { "name": "Électricité", "amount": "€ 85" },
                            { "name": "Internet", "amount": "€ 45" }
                        ]
                    },
                    {
                        "name": "Entretien",
                        "lines": [
                            { "name": "Produits ménagers", "amount": "€ 30" },
                            { "name": "Réparations", "amount": "€ 50" }
                        ]
                    }
                ]
            },
            {
                "name": "Enfants",
                "subcategories": [
                    {
                        "name": "École",
                        "lines": [
                            { "name": "Fournitures", "amount": "€ 40" },
                            { "name": "Cantine", "amount": "€ 85" }
                        ]
                    },
                    {
                        "name": "Loisirs",
                        "lines": [
                            { "name": "Activités sportives", "amount": "€ 60" },
                            { "name": "Sorties", "amount": "€ 40" }
                        ]
                    }
                ]
            }
        ]
    },
    "Maison": {
        "categories": [
            {
                "name": "Loyer & Charges",
                "subcategories": [
                    {
                        "name": "Mensualités",
                        "lines": [
                            { "name": "Loyer/Crédit", "amount": "€ 850" },
                            { "name": "Charges", "amount": "€ 120" }
                        ]
                    },
                    {
                        "name": "Factures",
                        "lines": [
                            { "name": "Électricité", "amount": "€ 75" },
                            { "name": "Eau", "amount": "€ 45" },
                            { "name": "Internet/TV", "amount": "€ 40" }
                        ]
                    }
                ]
            },
            {
                "name": "Entretien",
                "subcategories": [
                    {
                        "name": "Réparations",
                        "lines": [
                            { "name": "Petits travaux", "amount": "€ 100" },
                            { "name": "Matériel", "amount": "€ 75" }
                        ]
                    },
                    {
                        "name": "Jardinage",
                        "lines": [
                            { "name": "Plantes", "amount": "€ 40" },
                            { "name": "Outils", "amount": "€ 50" }
                        ]
                    }
                ]
            }
        ]
    },
    "Famille": {
        "categories": [
            {
                "name": "Alimentation",
                "subcategories": [
                    {
                        "name": "Courses hebdomadaires",
                        "lines": [
                            { "name": "Supermarché", "amount": "€ 150" },
                            { "name": "Marché", "amount": "€ 50" }
                        ]
                    },
                    {
                        "name": "Extras",
                        "lines": [
                            { "name": "Repas restaurant", "amount": "€ 80" },
                            { "name": "Livraisons", "amount": "€ 40" }
                        ]
                    }
                ]
            },
            {
                "name": "Éducation",
                "subcategories": [
                    {
                        "name": "Scolarité",
                        "lines": [
                            { "name": "Frais scolaires", "amount": "€ 100" },
                            { "name": "Fournitures", "amount": "€ 70" }
                        ]
                    },
                    {
                        "name": "Activités extrascolaires",
                        "lines": [
                            { "name": "Sport", "amount": "€ 120" },
                            { "name": "Musique", "amount": "€ 90" }
                        ]
                    }
                ]
            },
            {
                "name": "Santé",
                "subcategories": [
                    {
                        "name": "Consultations",
                        "lines": [
                            { "name": "Médecin", "amount": "€ 50" },
                            { "name": "Spécialistes", "amount": "€ 100" }
                        ]
                    },
                    {
                        "name": "Pharmacie",
                        "lines": [
                            { "name": "Médicaments", "amount": "€ 60" },
                            { "name": "Produits santé", "amount": "€ 40" }
                        ]
                    }
                ]
            }
        ]
    },
    "Déménagement": {
        "categories": [
            {
                "name": "Transport",
                "subcategories": [
                    {
                        "name": "Déménageurs",
                        "lines": [
                            { "name": "Entreprise", "amount": "€ 800" },
                            { "name": "Pourboires", "amount": "€ 50" }
                        ]
                    },
                    {
                        "name": "Location",
                        "lines": [
                            { "name": "Camion", "amount": "€ 150" },
                            { "name": "Carburant", "amount": "€ 60" }
                        ]
                    }
                ]
            },
            {
                "name": "Emballage",
                "subcategories": [
                    {
                        "name": "Matériel",
                        "lines": [
                            { "name": "Cartons", "amount": "€ 80" },
                            { "name": "Protections", "amount": "€ 40" },
                            { "name": "Scotch/étiquettes", "amount": "€ 30" }
                        ]
                    }
                ]
            },
            {
                "name": "Logement",
                "subcategories": [
                    {
                        "name": "Ancien logement",
                        "lines": [
                            { "name": "Nettoyage", "amount": "€ 150" },
                            { "name": "Réparations", "amount": "€ 100" }
                        ]
                    },
                    {
                        "name": "Nouveau logement",
                        "lines": [
                            { "name": "Caution", "amount": "€ 1000" },
                            { "name": "Frais d'agence", "amount": "€ 500" },
                            { "name": "Premier loyer", "amount": "€ 800" }
                        ]
                    }
                ]
            }
        ]
    },
    "Rentrée scolaire": {
        "categories": [
            {
                "name": "Fournitures",
                "subcategories": [
                    {
                        "name": "Matériel scolaire",
                        "lines": [
                            { "name": "Cahiers/classeurs", "amount": "€ 40" },
                            { "name": "Stylos/crayons", "amount": "€ 25" },
                            { "name": "Autres fournitures", "amount": "€ 35" }
                        ]
                    },
                    {
                        "name": "Manuels",
                        "lines": [
                            { "name": "Livres", "amount": "€ 80" },
                            { "name": "Cahiers d'exercices", "amount": "€ 30" }
                        ]
                    }
                ]
            },
            {
                "name": "Vêtements",
                "subcategories": [
                    {
                        "name": "Tenues",
                        "lines": [
                            { "name": "Vêtements quotidiens", "amount": "€ 150" },
                            { "name": "Chaussures", "amount": "€ 70" }
                        ]
                    },
                    {
                        "name": "Sport",
                        "lines": [
                            { "name": "Tenue de sport", "amount": "€ 50" },
                            { "name": "Chaussures de sport", "amount": "€ 60" }
                        ]
                    }
                ]
            },
            {
                "name": "Équipement",
                "subcategories": [
                    {
                        "name": "Informatique",
                        "lines": [
                            { "name": "Calculatrice", "amount": "€ 60" },
                            { "name": "Accessoires", "amount": "€ 40" }
                        ]
                    }
                ]
            }
        ]
    },
    "Fêtes de fin d'année": {
        "categories": [
            {
                "name": "Cadeaux",
                "subcategories": [
                    {
                        "name": "Famille",
                        "lines": [
                            { "name": "Parents", "amount": "€ 150" },
                            { "name": "Enfants", "amount": "€ 200" },
                            { "name": "Autres membres", "amount": "€ 150" }
                        ]
                    },
                    {
                        "name": "Amis",
                        "lines": [
                            { "name": "Amis proches", "amount": "€ 120" },
                            { "name": "Collègues", "amount": "€ 50" }
                        ]
                    }
                ]
            },
            {
                "name": "Repas",
                "subcategories": [
                    {
                        "name": "Dîner",
                        "lines": [
                            { "name": "Nourriture", "amount": "€ 150" },
                            { "name": "Boissons", "amount": "€ 70" },
                            { "name": "Desserts", "amount": "€ 40" }
                        ]
                    }
                ]
            },
            {
                "name": "Décoration",
                "subcategories": [
                    {
                        "name": "Maison",
                        "lines": [
                            { "name": "Sapin/Ornements", "amount": "€ 80" },
                            { "name": "Lumières", "amount": "€ 40" },
                            { "name": "Table", "amount": "€ 30" }
                        ]
                    }
                ]
            }
        ]
    },
    "Vacances": {
        "categories": [
            {
                "name": "Transport",
                "subcategories": [
                    {
                        "name": "Aller-retour",
                        "lines": [
                            { "name": "Avion/Train", "amount": "€ 400" },
                            { "name": "Transferts locaux", "amount": "€ 60" }
                        ]
                    },
                    {
                        "name": "Sur place",
                        "lines": [
                            { "name": "Location véhicule", "amount": "€ 200" },
                            { "name": "Transport public", "amount": "€ 50" }
                        ]
                    }
                ]
            },
            {
                "name": "Hébergement",
                "subcategories": [
                    {
                        "name": "Logement",
                        "lines": [
                            { "name": "Hôtel/Airbnb", "amount": "€ 600" }
                        ]
                    }
                ]
            },
            {
                "name": "Restauration",
                "subcategories": [
                    {
                        "name": "Repas",
                        "lines": [
                            { "name": "Restaurants", "amount": "€ 400" },
                            { "name": "Courses", "amount": "€ 150" }
                        ]
                    }
                ]
            },
            {
                "name": "Activités",
                "subcategories": [
                    {
                        "name": "Loisirs",
                        "lines": [
                            { "name": "Visites", "amount": "€ 200" },
                            { "name": "Excursions", "amount": "€ 150" },
                            { "name": "Souvenirs", "amount": "€ 100" }
                        ]
                    }
                ]
            }
        ]
    },
    
    // 💼 Projets professionnels
    "Lancement de produit": {
        "categories": [
            {
                "name": "Communication",
                "subcategories": [
                    {
                        "name": "Marketing",
                        "lines": [
                            { "name": "Visuels", "amount": "€ 150" },
                            { "name": "Réseaux sociaux", "amount": "€ 100" },
                            { "name": "Flyers", "amount": "€ 50" }
                        ]
                    }
                ]
            },
            {
                "name": "Développement produit",
                "subcategories": [
                    {
                        "name": "Production",
                        "lines": [
                            { "name": "Prototype", "amount": "€ 800" },
                            { "name": "Packaging", "amount": "€ 400" }
                        ]
                    }
                ]
            },
            {
                "name": "Événement lancement",
                "subcategories": [
                    {
                        "name": "Organisation",
                        "lines": [
                            { "name": "Lieu", "amount": "€ 500" },
                            { "name": "Traiteur", "amount": "€ 300" },
                            { "name": "Communication", "amount": "€ 200" }
                        ]
                    }
                ]
            }
        ]
    },
    "Création de site web": {
        "categories": [
            {
                "name": "Conception",
                "subcategories": [
                    {
                        "name": "Design",
                        "lines": [
                            { "name": "Maquettes", "amount": "€ 500" },
                            { "name": "UX/UI", "amount": "€ 700" }
                        ]
                    }
                ]
            },
            {
                "name": "Développement",
                "subcategories": [
                    {
                        "name": "Front-end",
                        "lines": [
                            { "name": "Intégration", "amount": "€ 800" },
                            { "name": "Responsive", "amount": "€ 400" }
                        ]
                    },
                    {
                        "name": "Back-end",
                        "lines": [
                            { "name": "Base de données", "amount": "€ 600" },
                            { "name": "Fonctionnalités", "amount": "€ 1000" }
                        ]
                    }
                ]
            },
            {
                "name": "Contenu",
                "subcategories": [
                    {
                        "name": "Médias",
                        "lines": [
                            { "name": "Photos", "amount": "€ 300" },
                            { "name": "Vidéos", "amount": "€ 400" }
                        ]
                    },
                    {
                        "name": "Textes",
                        "lines": [
                            { "name": "Rédaction", "amount": "€ 500" },
                            { "name": "Traduction", "amount": "€ 300" }
                        ]
                    }
                ]
            },
            {
                "name": "Hébergement",
                "subcategories": [
                    {
                        "name": "Services",
                        "lines": [
                            { "name": "Nom de domaine", "amount": "€ 15" },
                            { "name": "Hébergement annuel", "amount": "€ 120" },
                            { "name": "SSL", "amount": "€ 50" }
                        ]
                    }
                ]
            }
        ]
    },
    "Campagne marketing": {
        "categories": [
            {
                "name": "Publicité",
                "subcategories": [
                    {
                        "name": "Digitale",
                        "lines": [
                            { "name": "Google Ads", "amount": "€ 500" },
                            { "name": "Facebook/Instagram", "amount": "€ 400" },
                            { "name": "LinkedIn", "amount": "€ 300" }
                        ]
                    },
                    {
                        "name": "Traditionnelle",
                        "lines": [
                            { "name": "Presse", "amount": "€ 600" },
                            { "name": "Affichage", "amount": "€ 1000" }
                        ]
                    }
                ]
            },
            {
                "name": "Contenu",
                "subcategories": [
                    {
                        "name": "Création",
                        "lines": [
                            { "name": "Design", "amount": "€ 700" },
                            { "name": "Vidéo", "amount": "€ 900" },
                            { "name": "Rédaction", "amount": "€ 500" }
                        ]
                    }
                ]
            },
            {
                "name": "Événementiel",
                "subcategories": [
                    {
                        "name": "Présence",
                        "lines": [
                            { "name": "Stand salon", "amount": "€ 1500" },
                            { "name": "Matériel promotionnel", "amount": "€ 300" }
                        ]
                    }
                ]
            },
            {
                "name": "Analyse",
                "subcategories": [
                    {
                        "name": "Mesure",
                        "lines": [
                            { "name": "Outils analytics", "amount": "€ 200" },
                            { "name": "Études d'impact", "amount": "€ 600" }
                        ]
                    }
                ]
            }
        ]
    },
    "Formation professionnelle": {
        "categories": [
            {
                "name": "Frais pédagogiques",
                "subcategories": [
                    {
                        "name": "Organisme",
                        "lines": [
                            { "name": "Inscription", "amount": "€ 1200" },
                            { "name": "Certification", "amount": "€ 300" }
                        ]
                    },
                    {
                        "name": "Matériel",
                        "lines": [
                            { "name": "Supports", "amount": "€ 100" },
                            { "name": "Logiciels", "amount": "€ 200" }
                        ]
                    }
                ]
            },
            {
                "name": "Déplacement",
                "subcategories": [
                    {
                        "name": "Transport",
                        "lines": [
                            { "name": "Train/Avion", "amount": "€ 250" },
                            { "name": "Local", "amount": "€ 100" }
                        ]
                    },
                    {
                        "name": "Hébergement",
                        "lines": [
                            { "name": "Hôtel", "amount": "€ 400" },
                            { "name": "Repas", "amount": "€ 200" }
                        ]
                    }
                ]
            }
        ]
    },
    "Lancement d'entreprise": {
        "categories": [
            {
                "name": "Formalités",
                "subcategories": [
                    {
                        "name": "Création",
                        "lines": [
                            { "name": "Frais juridiques", "amount": "€ 800" },
                            { "name": "Immatriculation", "amount": "€ 200" }
                        ]
                    },
                    {
                        "name": "Assurances",
                        "lines": [
                            { "name": "RC Pro", "amount": "€ 500" },
                            { "name": "Multirisque", "amount": "€ 400" }
                        ]
                    }
                ]
            },
            {
                "name": "Équipement",
                "subcategories": [
                    {
                        "name": "Matériel",
                        "lines": [
                            { "name": "Informatique", "amount": "€ 2000" },
                            { "name": "Mobilier", "amount": "€ 1500" }
                        ]
                    },
                    {
                        "name": "Local",
                        "lines": [
                            { "name": "Dépôt garantie", "amount": "€ 2000" },
                            { "name": "Loyer", "amount": "€ 1000" },
                            { "name": "Aménagement", "amount": "€ 3000" }
                        ]
                    }
                ]
            },
            {
                "name": "Marketing",
                "subcategories": [
                    {
                        "name": "Communication",
                        "lines": [
                            { "name": "Site web", "amount": "€ 1500" },
                            { "name": "Identité visuelle", "amount": "€ 800" },
                            { "name": "PLV", "amount": "€ 500" }
                        ]
                    }
                ]
            },
            {
                "name": "Trésorerie",
                "subcategories": [
                    {
                        "name": "Fond de roulement",
                        "lines": [
                            { "name": "Stock initial", "amount": "€ 5000" },
                            { "name": "Charges courantes", "amount": "€ 3000" }
                        ]
                    }
                ]
            }
        ]
    },
    
    // 💰 Objectifs financiers
    "Épargne mensuelle": {
        "categories": [
            {
                "name": "Épargne courte",
                "subcategories": [
                    {
                        "name": "Sécurité",
                        "lines": [
                            { "name": "Épargne de précaution", "amount": "€ 200" },
                            { "name": "Projets < 2 ans", "amount": "€ 100" }
                        ]
                    }
                ]
            },
            {
                "name": "Épargne moyenne",
                "subcategories": [
                    {
                        "name": "Projets",
                        "lines": [
                            { "name": "Achat immobilier", "amount": "€ 300" },
                            { "name": "Autres projets", "amount": "€ 100" }
                        ]
                    }
                ]
            },
            {
                "name": "Épargne longue",
                "subcategories": [
                    {
                        "name": "Retraite",
                        "lines": [
                            { "name": "PER", "amount": "€ 150" },
                            { "name": "Assurance-vie", "amount": "€ 100" }
                        ]
                    }
                ]
            }
        ]
    },
    "Remboursement de dettes": {
        "categories": [
            {
                "name": "Dettes prioritaires",
                "subcategories": [
                    {
                        "name": "Crédits à taux élevé",
                        "lines": [
                            { "name": "Crédit à la consommation", "amount": "€ 300" },
                            { "name": "Découvert", "amount": "€ 150" }
                        ]
                    }
                ]
            },
            {
                "name": "Crédits immobiliers",
                "subcategories": [
                    {
                        "name": "Hypothèques",
                        "lines": [
                            { "name": "Prêt principal", "amount": "€ 800" },
                            { "name": "Prêt secondaire", "amount": "€ 200" }
                        ]
                    }
                ]
            },
            {
                "name": "Autres dettes",
                "subcategories": [
                    {
                        "name": "Prêts personnels",
                        "lines": [
                            { "name": "Famille/Amis", "amount": "€ 100" },
                            { "name": "Autres", "amount": "€ 50" }
                        ]
                    }
                ]
            }
        ]
    },
    "Projet \"Gros achat\"": {
        "categories": [
            {
                "name": "Budget d'achat",
                "subcategories": [
                    {
                        "name": "Principal",
                        "lines": [
                            { "name": "Achat bien", "amount": "€ 5000" },
                            { "name": "Accessoires", "amount": "€ 500" }
                        ]
                    }
                ]
            },
            {
                "name": "Frais annexes",
                "subcategories": [
                    {
                        "name": "Taxes & Assurances",
                        "lines": [
                            { "name": "TVA/Taxes", "amount": "€ 1000" },
                            { "name": "Assurance", "amount": "€ 300" }
                        ]
                    },
                    {
                        "name": "Installation",
                        "lines": [
                            { "name": "Livraison", "amount": "€ 200" },
                            { "name": "Mise en service", "amount": "€ 150" }
                        ]
                    }
                ]
            }
        ]
    },
    
    // 🤝 Collectifs & communautaires
    "Cagnotte / tontine": {
        "categories": [
            {
                "name": "Contributions",
                "subcategories": [
                    {
                        "name": "Membres",
                        "lines": [
                            { "name": "Apports mensuels", "amount": "€ 1000" },
                            { "name": "Apports exceptionnels", "amount": "€ 500" }
                        ]
                    }
                ]
            },
            {
                "name": "Gestion",
                "subcategories": [
                    {
                        "name": "Frais",
                        "lines": [
                            { "name": "Frais bancaires", "amount": "€ 50" },
                            { "name": "Administration", "amount": "€ 30" }
                        ]
                    }
                ]
            },
            {
                "name": "Distribution",
                "subcategories": [
                    {
                        "name": "Versements",
                        "lines": [
                            { "name": "Distributions prévues", "amount": "€ 1200" }
                        ]
                    }
                ]
            }
        ]
    },
    "Association caritative": {
        "categories": [
            {
                "name": "Collecte",
                "subcategories": [
                    {
                        "name": "Dons",
                        "lines": [
                            { "name": "Dons particuliers", "amount": "€ 3000" },
                            { "name": "Dons entreprises", "amount": "€ 2000" }
                        ]
                    },
                    {
                        "name": "Événements",
                        "lines": [
                            { "name": "Gala annuel", "amount": "€ 5000" },
                            { "name": "Ventes caritatives", "amount": "€ 1500" }
                        ]
                    }
                ]
            },
            {
                "name": "Fonctionnement",
                "subcategories": [
                    {
                        "name": "Administration",
                        "lines": [
                            { "name": "Salaires", "amount": "€ 2000" },
                            { "name": "Loyer/Charges", "amount": "€ 800" },
                            { "name": "Matériel", "amount": "€ 300" }
                        ]
                    }
                ]
            },
            {
                "name": "Actions",
                "subcategories": [
                    {
                        "name": "Missions",
                        "lines": [
                            { "name": "Projet principal", "amount": "€ 6000" },
                            { "name": "Actions secondaires", "amount": "€ 2000" }
                        ]
                    }
                ]
            }
        ]
    },
    "Budget réunion / AG": {
        "categories": [
            {
                "name": "Logistique",
                "subcategories": [
                    {
                        "name": "Lieu",
                        "lines": [
                            { "name": "Location salle", "amount": "€ 600" },
                            { "name": "Équipement", "amount": "€ 200" }
                        ]
                    }
                ]
            },
            {
                "name": "Participants",
                "subcategories": [
                    {
                        "name": "Accueil",
                        "lines": [
                            { "name": "Restauration", "amount": "€ 500" },
                            { "name": "Documentation", "amount": "€ 150" }
                        ]
                    },
                    {
                        "name": "Déplacements",
                        "lines": [
                            { "name": "Remboursements", "amount": "€ 400" }
                        ]
                    }
                ]
            },
            {
                "name": "Communication",
                "subcategories": [
                    {
                        "name": "Supports",
                        "lines": [
                            { "name": "Présentations", "amount": "€ 100" },
                            { "name": "Compte-rendu", "amount": "€ 50" }
                        ]
                    }
                ]
            }
        ]
    },
    "Fonds commun": {
        "categories": [
            {
                "name": "Apports",
                "subcategories": [
                    {
                        "name": "Participations",
                        "lines": [
                            { "name": "Cotisations régulières", "amount": "€ 1200" },
                            { "name": "Apports exceptionnels", "amount": "€ 500" }
                        ]
                    }
                ]
            },
            {
                "name": "Dépenses",
                "subcategories": [
                    {
                        "name": "Achats communs",
                        "lines": [
                            { "name": "Équipement", "amount": "€ 800" },
                            { "name": "Consommables", "amount": "€ 400" }
                        ]
                    },
                    {
                        "name": "Services",
                        "lines": [
                            { "name": "Abonnements", "amount": "€ 150" },
                            { "name": "Maintenance", "amount": "€ 200" }
                        ]
                    }
                ]
            }
        ]
    }
}

function updateTemplateCategories(templateType) {
    console.log('Updating template categories for:', templateType);
    
    // Récupérer les préférences utilisateur pour obtenir la devise
    let userPreferences = {
        currency: 'EUR', // Devise par défaut
    };
    
    try {
        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
            userPreferences = JSON.parse(savedPrefs);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des préférences utilisateur:', error);
    }
    
    // Obtenir le symbole de la devise
    let currencySymbol = '€'; // Symbole par défaut (Euro)
    let currencyCode = 'EUR';
    
    // Si AVAILABLE_CURRENCIES est défini (depuis currencies.js), utiliser le symbole correspondant
    if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
        const currency = AVAILABLE_CURRENCIES.find(c => c.code === userPreferences.currency);
        if (currency) {
            currencySymbol = currency.symbol;
            currencyCode = currency.code;
        }
    }
    
    console.log('Mise à jour des catégories avec la devise:', currencyCode, currencySymbol);
    
    // Fonction utilitaire pour remplacer les symboles € dans les données de template
    const replaceEuroSymbol = (obj) => {
        if (obj && typeof obj === 'object') {
            Object.keys(obj).forEach(key => {
                if (key === 'amount' && typeof obj[key] === 'string') {
                    // Remplacer le symbole € par le symbole de la devise active
                    // Utiliser une regex pour remplacer tous les symboles € dans la chaîne
                    obj[key] = obj[key].replace(/€/g, currencySymbol);
                } else if (typeof obj[key] === 'object') {
                    replaceEuroSymbol(obj[key]);
                }
            });
        }
        return obj;
    };
    
    // Gestion spéciale pour le type "Personnalisé"
    if (templateType === 'Personnalisé') {
        console.log('Creating empty template for personalized budget');
        // Créer une structure vide pour un budget personnalisé
        const categoriesData = [
            {
                name: 'Catégorie à personnaliser',
                subcategories: [
                    {
                        name: 'Sous-catégorie à personnaliser',
                        lines: [
                            { name: 'Ligne à personnaliser', amount: '€ 0' }
                        ]
                    }
                ]
            }
        ];
        
        // Remplacer les symboles € par le symbole de devise choisi
        categoriesData.forEach(category => {
            replaceEuroSymbol(category);
        });
        
        updateCategoriesUI(categoriesData, currencySymbol);
        return;
    }
    
    // Vérifier si nous avons un modèle prédéfini pour ce type
    if (defaultBudgets[templateType]) {
        console.log('Found template data for:', templateType);
        // Copie profonde pour ne pas modifier l'original
        const categoriesData = JSON.parse(JSON.stringify(defaultBudgets[templateType].categories));
        
        // Remplacer les symboles € par le symbole de devise choisi
        categoriesData.forEach(category => {
            replaceEuroSymbol(category);
        });
        
        // Mettre à jour l'interface avec les nouvelles catégories
        updateCategoriesUI(categoriesData, currencySymbol);
        return;
    }
    
    // Si aucun modèle prédéfini n'existe, utiliser le comportement par défaut
    let categoriesData = [];
    
    // Définir les catégories et sous-catégories en fonction du modèle choisi
    switch(templateType) {
        case 'Ménage familial':
            categoriesData = [
                {
                    name: 'Ménage',
                    subcategories: [
                        {
                            name: 'Courses alimentaires',
                            lines: [
                                { name: 'Courses semaine 1', amount: '€ 52' },
                                { name: 'Courses semaine 2', amount: '€ 47' }
                            ]
                        },
                        {
                            name: 'Factures',
                            lines: [
                                { name: 'EDF', amount: '€ 78' },
                                { name: 'Internet', amount: '€ 30' }
                            ]
                        },
                        {
                            name: 'Entretien',
                            lines: [
                                { name: 'Produits ménagers', amount: '€ 25' },
                                { name: 'Réparations', amount: '€ 40' }
                            ]
                        }
                    ]
                },
                {
                    name: 'Enfants',
                    subcategories: [
                        {
                            name: 'École',
                            lines: [
                                { name: 'Fournitures', amount: '€ 30' },
                                { name: 'Cantine', amount: '€ 85' }
                            ]
                        },
                        {
                            name: 'Loisirs',
                            lines: [
                                { name: 'Activités sportives', amount: '€ 45' },
                                { name: 'Sorties', amount: '€ 35' }
                            ]
                        }
                    ]
                }
            ];
            break;
        
        case 'Maison':
            categoriesData = [
                {
                    name: 'Loyer & Charges',
                    subcategories: [
                        {
                            name: 'Mensualités',
                            lines: [
                                { name: 'Loyer/Crédit', amount: '€ 850' },
                                { name: 'Charges', amount: '€ 120' }
                            ]
                        },
                        {
                            name: 'Factures',
                            lines: [
                                { name: 'Électricité', amount: '€ 75' },
                                { name: 'Eau', amount: '€ 45' },
                                { name: 'Internet/TV', amount: '€ 40' }
                            ]
                        }
                    ]
                },
                {
                    name: 'Entretien',
                    subcategories: [
                        {
                            name: 'Réparations',
                            lines: [
                                { name: 'Petits travaux', amount: '€ 100' },
                                { name: 'Matériel', amount: '€ 75' }
                            ]
                        },
                        {
                            name: 'Jardinage',
                            lines: [
                                { name: 'Plantes', amount: '€ 40' },
                                { name: 'Outils', amount: '€ 50' }
                            ]
                        }
                    ]
                }
            ];
            break;
        
        case 'Famille':
            categoriesData = [
                {
                    name: 'Alimentation',
                    subcategories: [
                        {
                            name: 'Courses hebdomadaires',
                            lines: [
                                { name: 'Supermarché', amount: '€ 150' },
                                { name: 'Marché', amount: '€ 50' }
                            ]
                        },
                        {
                            name: 'Extras',
                            lines: [
                                { name: 'Repas restaurant', amount: '€ 80' },
                                { name: 'Livraisons', amount: '€ 40' }
                            ]
                        }
                    ]
                },
                {
                    name: 'Éducation',
                    subcategories: [
                        {
                            name: 'Scolarité',
                            lines: [
                                { name: 'Frais scolaires', amount: '€ 100' },
                                { name: 'Fournitures', amount: '€ 70' }
                            ]
                        },
                        {
                            name: 'Activités extrascolaires',
                            lines: [
                                { name: 'Sport', amount: '€ 120' },
                                { name: 'Musique', amount: '€ 90' }
                            ]
                        }
                    ]
                },
                {
                    name: 'Santé',
                    subcategories: [
                        {
                            name: 'Consultations',
                            lines: [
                                { name: 'Médecin', amount: '€ 50' },
                                { name: 'Spécialistes', amount: '€ 100' }
                            ]
                        },
                        {
                            name: 'Pharmacie',
                            lines: [
                                { name: 'Médicaments', amount: '€ 60' },
                                { name: 'Produits santé', amount: '€ 40' }
                            ]
                        }
                    ]
                }
            ];
            break;
        
        // Pour le template Anniversaire existant    
        case 'Anniversaire':
            categoriesData = [
                {
                    name: 'Restauration',
                    subcategories: [
                        {
                            name: 'Traiteur',
                            lines: [
                                { name: 'Menu principal', amount: '€ 150' },
                                { name: 'Desserts', amount: '€ 50' }
                            ]
                        },
                        {
                            name: 'Boissons',
                            lines: [
                                { name: 'Soft drinks', amount: '€ 50' },
                                { name: 'Alcool', amount: '€ 50' }
                            ]
                        }
                    ]
                },
                {
                    name: 'Animation',
                    subcategories: [
                        {
                            name: 'DJ',
                            lines: [
                                { name: 'DJ forfait soirée', amount: '€ 150' }
                            ]
                        },
                        {
                            name: 'Jeux',
                            lines: [
                                { name: 'Matériel de jeux', amount: '€ 50' }
                            ]
                        }
                    ]
                },
                {
                    name: 'Décoration',
                    subcategories: [
                        {
                            name: 'Salle',
                            lines: [
                                { name: 'Ballons/Guirlandes', amount: '€ 60' },
                                { name: 'Centre de table', amount: '€ 40' }
                            ]
                        }
                    ]
                }
            ];
            break;
        
        // Par défaut, conserver les catégories actuelles (ne rien faire)
        default:
            return;
    }
    
    // Remplacer les symboles € par le symbole de devise choisi dans les templates du switch
    if (categoriesData.length > 0) {
        // Remplacer les symboles € par le symbole de devise choisi
        categoriesData.forEach(category => {
            replaceEuroSymbol(category);
        });
        
        updateCategoriesUI(categoriesData, currencySymbol);
    }
}

// Fonction pour mettre à jour l'UI avec les nouvelles catégories
function updateCategoriesUI(categoriesData, incomingCurrencySymbol) {
    const currencySymbol = incomingCurrencySymbol || "€";
    console.log('Updating categories UI with data:', categoriesData);
    // Trouver le conteneur des catégories
    const expenseCategories = document.querySelector('.expense-categories');
    console.log('Found expense categories container:', expenseCategories);
    const addCategoryContainer = document.querySelector('.add-category-container');
    console.log('Found add category container:', addCategoryContainer);
    const totalBudgetElement = document.querySelector('.total-budget');
    
    // Supprimer les catégories existantes (sauf le bouton d'ajout et le total)
    const existingCategories = document.querySelectorAll('.expense-category');
    existingCategories.forEach(category => {
        category.remove();
    });
    
    // Créer les nouvelles catégories et sous-catégories
    categoriesData.forEach(categoryData => {
        // Créer la catégorie principale
        const category = document.createElement('div');
        category.className = 'expense-category';
        
        // Préparer le HTML de l'en-tête de catégorie
        let categoryHTML = `
            <div class="category-header">
                <h4 class="category-name">${categoryData.name}</h4>
                <span class="category-amount">${currencySymbol} 0</span>
                <div class="category-controls">
                    <button type="button" class="category-toggle open">
                        <i class="fas fa-chevron-up"></i>
                    </button>
                </div>
            </div>
            <div class="subcategories-container open">
        `;
        
        // Ajouter les sous-catégories
        if (categoryData.subcategories && categoryData.subcategories.length > 0) {
            categoryData.subcategories.forEach(subcategoryData => {
                // Ajouter l'HTML de la sous-catégorie
                categoryHTML += `
                    <div class="subcategory">
                        <div class="subcategory-header">
                            <h5 class="subcategory-name">${subcategoryData.name}</h5>
                            <span class="subcategory-amount">${currencySymbol} 0</span>
                            <button type="button" class="subcategory-toggle open">
                                <i class="fas fa-chevron-up"></i>
                            </button>
                        </div>
                        <div class="expense-lines open">
                `;
                
                // Ajouter les lignes de dépenses
                if (subcategoryData.lines && subcategoryData.lines.length > 0) {
                    subcategoryData.lines.forEach(line => {
                        categoryHTML += `
                            <div class="expense-line">
                                <input type="text" class="form-control expense-line-name" value="${line.name}">
                                <input type="text" class="form-control expense-line-amount" value="${line.amount.replace(/€/g, currencySymbol)}">
                                <div class="expense-line-actions">
                                    <button type="button" class="btn-sm btn-delete-line">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        `;
                    });
                }
                
                // Ajouter le bouton pour ajouter une ligne
                categoryHTML += `
                            <button type="button" class="add-line-btn">
                                <i class="fas fa-plus"></i> Ajouter une ligne
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        
        // Ajouter le footer avec le bouton pour ajouter une sous-catégorie
        categoryHTML += `
                <div class="subcategory-footer">
                    <button type="button" class="add-subcategory-btn">
                        <i class="fas fa-plus"></i> Ajouter une sous-catégorie
                    </button>
                </div>
            </div>
        `;
        
        // Définir le HTML complet de la catégorie
        category.innerHTML = categoryHTML;
        
        // Insérer la catégorie avant le bouton d'ajout
        expenseCategories.insertBefore(category, addCategoryContainer);
    });
    
    // Réinitialiser les interactions
    initializeExpenseCategories();
    initializeSubcategories();
    
    // Mettre à jour tous les totaux
    const subcategories = document.querySelectorAll('.subcategory');
    subcategories.forEach(subcategory => {
        updateSubcategoryTotal(subcategory);
    });
}

// Fonction pour activer le mode de visualisation (lecture seule)
function enableViewMode() {
    console.log('Activation du mode visualisation');
    
    // Modifier le titre de la page
    const pageTitle = document.querySelector('.page-header h2');
    if (pageTitle) {
        pageTitle.textContent = 'Détails du projet';
    }
    
    // Désactiver tous les champs d'entrée
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.setAttribute('disabled', 'disabled');
        input.classList.add('readonly');
    });
    
    // Masquer les boutons d'action (ajout, suppression, etc.)
    const actionButtons = document.querySelectorAll('.btn-add, .btn-delete, .btn-delete-line, .add-line-btn, .add-subcategory-btn');
    actionButtons.forEach(button => {
        button.style.display = 'none';
    });
    
    // Masquer la section des modèles si visible
    const templatesSection = document.querySelector('.templates-section');
    if (templatesSection) {
        templatesSection.style.display = 'none';
    }
    
    // Remplacer le bouton de soumission par un bouton de retour
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = 'Retour au tableau de bord';
        submitButton.type = 'button';
        submitButton.className = 'btn btn-secondary';
        submitButton.addEventListener('click', function() {
            // Nettoyer les indicateurs de mode vue
            localStorage.removeItem('viewMode');
            window.location.href = 'index.html';
        });
    }
    
    // Masque le footer s'il existe
    const formFooter = document.querySelector('.form-footer');
    if (formFooter) {
        formFooter.style.display = 'none';
    }
    
    // Déplier toutes les catégories
    const categoryToggles = document.querySelectorAll('.category-toggle');
    categoryToggles.forEach(toggle => {
        if (!toggle.classList.contains('open')) {
            toggle.click();
        }
    });
    
    // Masquer la notification de sauvegarde si présente
    const saveNotification = document.querySelector('.save-notification');
    if (saveNotification) {
        saveNotification.style.display = 'none';
    }
    
    // Ajouter une classe au corps pour des styles CSS spécifiques
    document.body.classList.add('view-mode');
}

function updateAIAdvice(templateType) {
    let advice = '';
    
    // Define advice based on template type
    switch (templateType) {
        // 🎉 Événementiels
        case 'Anniversaire':
            advice = 'Pensez à réserver l\'animation au moins deux semaines à l\'avance.';
            break;
        case 'Mariage':
            advice = 'Prévoyez 5-10% de budget supplémentaire pour les imprévus de dernière minute.';
            break;
        case 'Baby shower':
            advice = 'Pensez à des animations adaptées pour tous les invités, pas uniquement centrées sur bébé.';
            break;
        case 'Fête d\'entreprise':
            advice = 'Vérifiez les restrictions alimentaires de vos invités avant de finaliser le menu.';
            break;
        case 'Célébration religieuse':
            advice = 'Confirmez les exigences spécifiques du lieu de culte bien à l\'avance.';
            break;
            
        // 🏠 Vie personnelle
        case 'Budget mensuel':
            advice = 'Réservez 10% de votre budget pour les dépenses imprévues.';
            break;
        case 'Ménage familial':
            advice = 'Créez un calendrier pour répartir les dépenses importantes sur plusieurs mois.';
            break;
        case 'Maison':
            advice = 'Prévoyez un budget d\'entretien annuel d\'environ 1% de la valeur de votre logement.';
            break;
        case 'Famille':
            advice = 'Pensez à mettre en place un système d\'épargne pour les projets futurs des enfants.';
            break;
        case 'Déménagement':
            advice = 'Demandez plusieurs devis pour la société de déménagement pour comparer les prix.';
            break;
        case 'Rentrée scolaire':
            advice = 'Établissez une liste précise avant les achats pour éviter les dépenses superflues.';
            break;
        case 'Fêtes de fin d\'année':
            advice = 'Commencez vos achats de cadeaux tôt pour éviter le stress et les ruptures de stock.';
            break;
        case 'Vacances':
            advice = 'Réservez transport et hébergement en avance pour bénéficier des meilleurs tarifs.';
            break;
            
        // 💼 Projets professionnels
        case 'Lancement de produit':
            advice = 'Prévoyez un budget de contingence d\'au moins 15% pour les imprévus.';
            break;
        case 'Création de site web':
            advice = 'N\'oubliez pas d\'inclure les coûts de maintenance annuels dans votre budget.';
            break;
        case 'Campagne marketing':
            advice = 'Testez votre campagne sur un petit segment avant le déploiement complet.';
            break;
        case 'Formation professionnelle':
            advice = 'Vérifiez les possibilités de prise en charge par votre entreprise ou un organisme.';
            break;
        case 'Lancement d\'entreprise':
            advice = 'Prévoyez suffisamment de trésorerie pour couvrir 6 mois de fonctionnement sans revenus.';
            break;
            
        // 💰 Objectifs financiers
        case 'Épargne mensuelle':
            advice = 'Automatisez vos virements d\'épargne dès réception de votre salaire.';
            break;
        case 'Remboursement de dettes':
            advice = 'Commencez par rembourser les dettes aux taux d\'intérêt les plus élevés.';
            break;
        case 'Projet "Gros achat"':
            advice = 'Comparez plusieurs modèles et vendeurs pour obtenir le meilleur rapport qualité-prix.';
            break;
            
        // 🤝 Collectifs & communautaires
        case 'Cagnotte / tontine':
            advice = 'Établissez des règles claires dès le départ pour éviter les malentendus.';
            break;
        case 'Association caritative':
            advice = 'Recherchez des partenariats pour réduire vos coûts opérationnels.';
            break;
        case 'Budget réunion / AG':
            advice = 'Pensez à des alternatives numériques pour réduire les coûts de documentation.';
            break;
        case 'Fonds commun':
            advice = 'Utilisez une application de partage de dépenses pour faciliter la gestion.';
            break;
            
        // Personnalisé
        case 'Personnalisé':
            advice = 'Personnalisez complètement votre budget en fonction de vos besoins spécifiques. N\'hésitez pas à ajouter ou supprimer des catégories.';
            break;
        default:
            advice = 'Établissez clairement vos priorités et allouez votre budget en conséquence.';
    }
    
    // Update the advice text
    const adviceElement = document.querySelector('.ai-advice p');
    if (adviceElement) {
        adviceElement.textContent = advice;
    }
}

// Fonction pour activer le mode édition d'un projet existant
function enableEditMode(projectId) {
    // Si l'ID du projet n'est pas fourni, essayer de le récupérer depuis l'URL
    if (!projectId) {
        const urlParams = new URLSearchParams(window.location.search);
        projectId = urlParams.get('id');
        
        if (!projectId) {
            console.error("L'ID du projet est manquant pour le mode édition");
            return;
        }
    }
    
    console.log("Mode édition activé pour le projet:", projectId);
    
    // Stocker l'ID du projet en édition
    localStorage.setItem('projectInEditing', projectId);
    
    // Charger le projet existant depuis localStorage
    let savedProjects = [];
    try {
        savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    } catch (error) {
        console.error('Erreur lors du chargement des projets sauvegardés:', error);
        return;
    }
    
    // Trouver le projet avec l'ID correspondant
    const projectToEdit = savedProjects.find(project => project.id === projectId);
    if (!projectToEdit) {
        console.error('Projet non trouvé avec ID:', projectId);
        console.log('Projets disponibles:', savedProjects);
        return;
    }
    
    console.log('Projet à modifier:', projectToEdit);
    
    // Changer le titre de la page
    const pageTitle = document.querySelector('.page-header h2');
    if (pageTitle) {
        pageTitle.textContent = 'Modifier le projet';
    }
    
    // Charger les données du projet dans le formulaire
    restoreProjectData(projectToEdit);
    
    // Modifier l'apparence du formulaire pour le mode édition
    document.querySelector('.project-form-container').classList.add('edit-mode');
    
    // Ajouter un message indiquant qu'on est en mode édition
    const formHeader = document.querySelector('.form-header');
    if (formHeader) {
        const editModeNotice = document.createElement('div');
        editModeNotice.className = 'edit-mode-notice';
        editModeNotice.innerHTML = '<i class="fas fa-pencil-alt"></i> Mode Édition';
        formHeader.appendChild(editModeNotice);
    }
    
    // Ajouter un bouton de sauvegarde en temps réel
    const formActions = document.querySelector('.form-actions');
    if (formActions) {
        const saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.className = 'btn btn-secondary save-changes-btn';
        saveButton.innerHTML = '<i class="fas fa-save"></i> Enregistrer les modifications';
        
        // Insérer avant le bouton de soumission
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton && submitButton.parentNode) {
            submitButton.parentNode.insertBefore(saveButton, submitButton);
            
            // Ajouter l'event listener pour sauvegarder sans quitter
            saveButton.addEventListener('click', function() {
                // Collecter les données du formulaire
                const formData = getProjectData();
                // Conserver l'ID et la date de création du projet original
                formData.id = projectId;
                formData.createdAt = projectToEdit.createdAt;
                
                // Mise à jour du projet
                updateExistingProject(formData, projectToEdit, projectId, false);
            });
        }
    }
    
    // Modifier le bouton de soumission principal
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.innerHTML = '<i class="fas fa-check"></i> Mettre à jour et quitter';
        submitButton.classList.add('btn-update');
        
        // Supprimer tous les event listeners existants
        const oldButton = submitButton.cloneNode(true);
        submitButton.parentNode.replaceChild(oldButton, submitButton);
        
        // Ajouter le nouvel event listener pour la mise à jour et redirection
        oldButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Collecter les données du formulaire
            const formData = getProjectData();
            // Conserver l'ID et la date de création du projet original
            formData.id = projectId;
            formData.createdAt = projectToEdit.createdAt;
            
            // Mise à jour du projet et redirection
            updateExistingProject(formData, projectToEdit, projectId, true);
        });
    }
    
    // Ajouter un bouton pour annuler l'édition
    if (formActions && submitButton) {
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'btn btn-outline-secondary cancel-edit-btn';
        cancelButton.innerHTML = '<i class="fas fa-times"></i> Annuler';
        
        // Ajouter après le bouton de soumission
        submitButton.parentNode.appendChild(cancelButton);
        
        // Ajouter l'event listener pour annuler
        cancelButton.addEventListener('click', function() {
            if (confirm('Voulez-vous vraiment annuler les modifications ? Les changements non sauvegardés seront perdus.')) {
                // Effacer les données d'édition
                localStorage.removeItem('projectInEditing');
                localStorage.removeItem('currentProject');
                
                // Rediriger vers la page d'accueil
                window.location.href = 'index.html';
            }
        });
    }
}

// Fonction utilitaire pour mettre à jour un projet existant
function updateExistingProject(formData, originalProject, projectId, shouldRedirect) {
    // Charger les projets existants
    let savedProjects = [];
    try {
        savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        if (!Array.isArray(savedProjects)) {
            console.error('savedProjects n\'est pas un tableau:', savedProjects);
            savedProjects = [];
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des projets sauvegardés:', error);
        savedProjects = [];
    }
    
    // Remplacer le projet existant par le projet mis à jour
    const updatedProjects = savedProjects.map(project => {
        if (project.id === projectId) {
            return formData;
        }
        return project;
    });
    
    try {
        localStorage.setItem('savedProjects', JSON.stringify(updatedProjects));
        console.log('Projet mis à jour avec succès. Total projets:', updatedProjects.length);
        
        // Afficher une notification de succès
        if (window.showNotification) {
            if (shouldRedirect) {
                window.showNotification('Projet mis à jour avec succès!', 'success');
            } else {
                window.showNotification('Modifications enregistrées!', 'success');
            }
        } else {
            if (shouldRedirect) {
                alert('Projet mis à jour avec succès!');
            } else {
                alert('Modifications enregistrées!');
            }
        }
        
        // Si l'option de liaison au portefeuille a changé, mettre à jour les projets liés
        if (formData.linkToWallet !== originalProject.linkToWallet) {
            let walletData = JSON.parse(localStorage.getItem('walletData') || '{"linkedProjects":[]}');
            
            if (formData.linkToWallet) {
                // Ajouter à la liste des projets liés s'il n'y est pas déjà
                if (!walletData.linkedProjects.includes(projectId)) {
                    walletData.linkedProjects.push(projectId);
                }
            } else {
                // Retirer de la liste des projets liés
                walletData.linkedProjects = walletData.linkedProjects.filter(id => id !== projectId);
            }
            
            localStorage.setItem('walletData', JSON.stringify(walletData));
        }
        
        // Si on doit rediriger, nettoyer et aller à l'accueil
        if (shouldRedirect) {
            // Effacer le projet en cours d'édition
            localStorage.removeItem('projectInEditing');
            localStorage.removeItem('currentProject');
            
            // Rediriger vers la page d'accueil
            window.location.href = 'index.html';
        }
        
    } catch (error) {
        console.error('Erreur lors de la mise à jour du projet:', error);
        alert('Erreur lors de la mise à jour du projet. Veuillez réessayer.');
    }
}