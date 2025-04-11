/**
 * Gestionnaire de chargement de projet propre et structuré
 * Remplace les fonctionnalités de chargement de projet précédentes
 * pour éviter les problèmes de doublons, de lignes manquantes et de montants incorrects
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🧹 Initialisation du système propre de chargement de projet');

    // Variable globale pour stocker les données du projet en cours
    let currentProjectData = null;

    // 1. Déterminer si nous sommes en mode édition et récupérer l'ID du projet si c'est le cas
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    const isEditMode = urlParams.get('edit') === 'true';
    
    console.log(`Mode: ${isEditMode ? 'Édition' : 'Création'}, ID Projet: ${projectId || 'Nouveau'}`);
    
    // Initialiser les écouteurs d'événements du bouton de sauvegarde
    initSaveButton();
    
    if (isEditMode && projectId) {
        // En mode édition, charger et afficher le projet
        console.log('🔄 Chargement du projet pour édition...');
        
        // Nettoyer l'interface avant de charger le projet
        clearProjectInterface();
        
        // Charger le projet et l'afficher proprement
        cleanLoadProject(projectId);
    }
    
    /**
     * Initialise le bouton de sauvegarde du projet
     */
    function initSaveButton() {
        const saveButton = document.getElementById('saveProject');
        if (saveButton) {
            saveButton.addEventListener('click', function(e) {
                e.preventDefault();
                saveCurrentProject();
            });
            console.log('✅ Bouton de sauvegarde initialisé');
        } else {
            console.warn('⚠️ Bouton de sauvegarde non trouvé');
        }
    }
    
    /**
     * Nettoie complètement l'interface du projet
     */
    function clearProjectInterface() {
        console.log('🧹 Nettoyage complet de l\'interface du projet');
        
        // Nettoyer le conteneur de catégories
        const categoriesContainer = document.getElementById('categoriesContainer');
        if (categoriesContainer) {
            categoriesContainer.innerHTML = '';
            console.log('✅ Conteneur de catégories vidé');
        } else {
            console.error('❌ Conteneur de catégories non trouvé');
        }
        
        // Réinitialiser le formulaire
        const projectForm = document.getElementById('projectForm');
        if (projectForm) {
            projectForm.reset();
            console.log('✅ Formulaire réinitialisé');
        }
    }
    
    /**
     * Charge et rend proprement un projet depuis son ID
     * @param {string} projectId - L'ID du projet à charger
     */
    function cleanLoadProject(projectId) {
        console.log('📂 Chargement propre du projet:', projectId);
        
        // Récupérer les données du projet
        let projectData = null;
        
        // Essayer d'utiliser ProjectData.getProjectById (nouvelle architecture)
        if (window.ProjectData && typeof ProjectData.getProjectById === 'function') {
            projectData = ProjectData.getProjectById(projectId);
            console.log('📦 Projet récupéré via ProjectData');
        } 
        // Fallback: utiliser getProjectById (ancienne architecture)
        else if (typeof getProjectById === 'function') {
            projectData = getProjectById(projectId);
            console.log('📦 Projet récupéré via getProjectById');
        }
        
        if (!projectData) {
            console.error('❌ Projet non trouvé:', projectId);
            alert('Projet non trouvé. Veuillez réessayer.');
            return;
        }
        
        console.log('📊 Projet chargé:', projectData);
        
        // Remplir les informations de base du projet
        fillBasicProjectInfo(projectData);
        
        // Rendre proprement la structure complète du projet
        renderProjectStructure(projectData);
        
        // Finaliser le rendu
        finalizeProjectRendering();
    }
    
    /**
     * Remplit les informations de base d'un projet
     * @param {Object} projectData - Les données du projet
     */
    function fillBasicProjectInfo(projectData) {
        console.log('📝 Remplissage des informations de base du projet');
        
        // Remplir les champs de base
        const fields = [
            { id: 'projectName', value: projectData.projectName },
            { id: 'projectDate', value: projectData.projectDate },
            { id: 'projectEndDate', value: projectData.projectEndDate },
            { id: 'totalBudget', value: extractNumericValue(projectData.totalBudget) }
        ];
        
        fields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) {
                element.value = field.value || '';
                console.log(`✅ Champ '${field.id}' défini à '${field.value}'`);
            } else {
                console.warn(`⚠️ Élément '${field.id}' non trouvé`);
            }
        });
        
        // Définir le template
        const templateSelector = document.getElementById('templateSelector');
        if (templateSelector && projectData.template) {
            templateSelector.value = projectData.template;
            console.log(`✅ Template défini à '${projectData.template}'`);
        }
        
        // Définir les options (checkboxes)
        const checkboxes = [
            { id: 'linkToWallet', checked: projectData.linkToWallet },
            { id: 'linkToWishlist', checked: projectData.linkToWishlist }
        ];
        
        checkboxes.forEach(checkbox => {
            const element = document.getElementById(checkbox.id);
            if (element) {
                element.checked = checkbox.checked || false;
                console.log(`✅ Checkbox '${checkbox.id}' définie à '${checkbox.checked}'`);
            }
        });
    }
    
    /**
     * Rend la structure complète du projet (catégories, sous-catégories, lignes)
     * @param {Object} projectData - Les données du projet
     */
    function renderProjectStructure(projectData) {
        console.log('🏗️ Rendu de la structure complète du projet');
        
        const categoriesContainer = document.getElementById('categoriesContainer');
        if (!categoriesContainer) {
            console.error('❌ Conteneur de catégories non trouvé');
            return;
        }
        
        // S'assurer que le conteneur est vide
        categoriesContainer.innerHTML = '';
        
        // Vérifier si le projet a des catégories
        if (!projectData.categories || !Array.isArray(projectData.categories)) {
            console.warn('⚠️ Pas de catégories dans le projet');
            return;
        }
        
        // Rendre chaque catégorie
        projectData.categories.forEach(category => {
            renderCategory(categoriesContainer, category);
        });
        
        console.log(`✅ ${projectData.categories.length} catégories rendues`);
    }
    
    /**
     * Rend une catégorie
     * @param {HTMLElement} container - Le conteneur où ajouter la catégorie
     * @param {Object} category - Les données de la catégorie
     */
    function renderCategory(container, category) {
        console.log(`🔸 Rendu de la catégorie: ${category.name}`);
        
        // Créer l'élément de catégorie
        const categoryElement = document.createElement('div');
        categoryElement.className = 'expense-category';
        categoryElement.setAttribute('data-category', category.name);
        
        // Créer l'en-tête de la catégorie
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        
        // Créer l'icône de la catégorie
        const categoryIcon = document.createElement('span');
        categoryIcon.className = 'category-icon';
        categoryIcon.textContent = category.icon || '📊';
        
        // Créer le nom de la catégorie
        const categoryName = document.createElement('span');
        categoryName.className = 'category-name';
        categoryName.textContent = category.name || 'Nouvelle catégorie';
        categoryName.contentEditable = 'true';
        
        // Créer le montant de la catégorie
        const categoryAmount = document.createElement('span');
        categoryAmount.className = 'category-amount';
        categoryAmount.textContent = formatAmount(extractNumericValue(category.amount));
        
        // Créer le bouton de suppression
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn-sm delete-category-btn';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        
        // Assembler l'en-tête
        categoryHeader.appendChild(categoryIcon);
        categoryHeader.appendChild(categoryName);
        categoryHeader.appendChild(categoryAmount);
        categoryHeader.appendChild(deleteButton);
        
        // Créer le conteneur des sous-catégories
        const subcategoriesContainer = document.createElement('div');
        subcategoriesContainer.className = 'subcategories-container';
        
        // Créer le pied de la catégorie
        const categoryFooter = document.createElement('div');
        categoryFooter.className = 'category-footer';
        
        // Créer le bouton d'ajout de sous-catégorie
        const addSubcategoryButton = document.createElement('button');
        addSubcategoryButton.className = 'btn-sm add-subcategory-btn';
        addSubcategoryButton.innerHTML = '<i class="fas fa-plus"></i> Ajouter une sous-catégorie';
        
        // Assembler le pied
        categoryFooter.appendChild(addSubcategoryButton);
        
        // Assembler la catégorie
        categoryElement.appendChild(categoryHeader);
        categoryElement.appendChild(subcategoriesContainer);
        categoryElement.appendChild(categoryFooter);
        
        // Ajouter la catégorie au conteneur
        container.appendChild(categoryElement);
        
        // Rendre les sous-catégories
        if (category.subcategories && Array.isArray(category.subcategories)) {
            category.subcategories.forEach(subcategory => {
                renderSubcategory(subcategoriesContainer, subcategory);
            });
            console.log(`✅ ${category.subcategories.length} sous-catégories rendues pour ${category.name}`);
        }
        
        // Ajouter les écouteurs d'événements
        initializeCategoryEvents(categoryElement);
    }
    
    /**
     * Rend une sous-catégorie
     * @param {HTMLElement} container - Le conteneur où ajouter la sous-catégorie
     * @param {Object} subcategory - Les données de la sous-catégorie
     */
    function renderSubcategory(container, subcategory) {
        console.log(`🔹 Rendu de la sous-catégorie: ${subcategory.name}`);
        
        // Créer l'élément de sous-catégorie
        const subcategoryElement = document.createElement('div');
        subcategoryElement.className = 'subcategory';
        
        // Créer l'en-tête de la sous-catégorie
        const subcategoryHeader = document.createElement('div');
        subcategoryHeader.className = 'subcategory-header';
        
        // Créer le nom de la sous-catégorie
        const subcategoryName = document.createElement('span');
        subcategoryName.className = 'subcategory-name';
        subcategoryName.textContent = subcategory.name || 'Nouvelle sous-catégorie';
        subcategoryName.contentEditable = 'true';
        
        // Créer le montant de la sous-catégorie
        const subcategoryAmount = document.createElement('span');
        subcategoryAmount.className = 'subcategory-amount';
        subcategoryAmount.textContent = formatAmount(extractNumericValue(subcategory.amount));
        
        // Créer le bouton de suppression
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn-sm delete-subcategory-btn';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        
        // Assembler l'en-tête
        subcategoryHeader.appendChild(subcategoryName);
        subcategoryHeader.appendChild(subcategoryAmount);
        subcategoryHeader.appendChild(deleteButton);
        
        // Créer le conteneur des lignes
        const linesContainer = document.createElement('div');
        linesContainer.className = 'expense-lines';
        
        // Créer le pied de la sous-catégorie
        const subcategoryFooter = document.createElement('div');
        subcategoryFooter.className = 'subcategory-footer';
        
        // Créer le bouton d'ajout de ligne
        const addLineButton = document.createElement('button');
        addLineButton.className = 'btn-sm add-line-btn';
        addLineButton.innerHTML = '<i class="fas fa-plus"></i> Ajouter une ligne';
        
        // Assembler le pied
        subcategoryFooter.appendChild(addLineButton);
        
        // Assembler la sous-catégorie
        subcategoryElement.appendChild(subcategoryHeader);
        subcategoryElement.appendChild(linesContainer);
        subcategoryElement.appendChild(subcategoryFooter);
        
        // Ajouter la sous-catégorie au conteneur
        container.appendChild(subcategoryElement);
        
        // Rendre les lignes
        if (subcategory.lines && Array.isArray(subcategory.lines)) {
            subcategory.lines.forEach(line => {
                renderExpenseLine(linesContainer, line);
            });
            console.log(`✅ ${subcategory.lines.length} lignes rendues pour ${subcategory.name}`);
        }
        
        // Ajouter les écouteurs d'événements
        initializeSubcategoryEvents(subcategoryElement);
    }
    
    /**
     * Rend une ligne de dépense
     * @param {HTMLElement} container - Le conteneur où ajouter la ligne
     * @param {Object} line - Les données de la ligne
     */
    function renderExpenseLine(container, line) {
        console.log(`🔸 Rendu de la ligne: ${line.name} = ${line.amount}`);
        
        // S'assurer que l'objet ligne a les propriétés de base
        const safeLine = {
            name: line.name || 'Nouvelle dépense',
            amount: extractNumericValue(line.amount)
        };
        
        // Créer l'élément de ligne
        const lineElement = document.createElement('div');
        lineElement.className = 'expense-line';
        
        // Stocker les données de la ligne dans l'élément DOM pour y accéder facilement
        lineElement.dataset.lineName = safeLine.name;
        lineElement.dataset.lineAmount = safeLine.amount;
        
        // Créer le champ de nom
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'line-name';
        nameInput.value = safeLine.name;
        
        // Créer le champ de montant
        const amountInput = document.createElement('input');
        amountInput.type = 'number';
        amountInput.className = 'line-amount';
        amountInput.value = safeLine.amount;
        amountInput.step = "0.01";
        
        // Créer le bouton de suppression
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-line';
        deleteButton.innerHTML = '🗑️';
        
        // Assembler la ligne
        lineElement.appendChild(nameInput);
        lineElement.appendChild(amountInput);
        lineElement.appendChild(deleteButton);
        
        // Ajouter la ligne au conteneur
        container.appendChild(lineElement);
        
        // Ajouter les écouteurs d'événements
        initializeLineEvents(lineElement, safeLine);
    }
    
    /**
     * Initialise les écouteurs d'événements d'une catégorie
     * @param {HTMLElement} categoryElement - L'élément de catégorie
     */
    function initializeCategoryEvents(categoryElement) {
        // Écouteur pour le bouton de suppression
        const deleteButton = categoryElement.querySelector('.delete-category-btn');
        if (deleteButton) {
            deleteButton.addEventListener('click', function() {
                if (confirm('Voulez-vous vraiment supprimer cette catégorie et toutes ses sous-catégories ?')) {
                    categoryElement.remove();
                    recalculateAllAmounts();
                }
            });
        }
        
        // Écouteur pour le bouton d'ajout de sous-catégorie
        const addSubcategoryButton = categoryElement.querySelector('.add-subcategory-btn');
        if (addSubcategoryButton) {
            addSubcategoryButton.addEventListener('click', function() {
                const subcategoriesContainer = categoryElement.querySelector('.subcategories-container');
                if (subcategoriesContainer) {
                    const subcategory = {
                        name: 'Nouvelle sous-catégorie',
                        amount: 0,
                        lines: []
                    };
                    renderSubcategory(subcategoriesContainer, subcategory);
                    recalculateAllAmounts();
                }
            });
        }
        
        // Écouteur pour le nom (éditable)
        const nameElement = categoryElement.querySelector('.category-name');
        if (nameElement) {
            nameElement.addEventListener('blur', function() {
                categoryElement.setAttribute('data-category', this.textContent);
                recalculateAllAmounts();
            });
        }
    }
    
    /**
     * Initialise les écouteurs d'événements d'une sous-catégorie
     * @param {HTMLElement} subcategoryElement - L'élément de sous-catégorie
     */
    function initializeSubcategoryEvents(subcategoryElement) {
        // Écouteur pour le bouton de suppression
        const deleteButton = subcategoryElement.querySelector('.delete-subcategory-btn');
        if (deleteButton) {
            deleteButton.addEventListener('click', function() {
                if (confirm('Voulez-vous vraiment supprimer cette sous-catégorie et toutes ses lignes ?')) {
                    subcategoryElement.remove();
                    recalculateAllAmounts();
                }
            });
        }
        
        // Écouteur pour le bouton d'ajout de ligne
        const addLineButton = subcategoryElement.querySelector('.add-line-btn');
        if (addLineButton) {
            addLineButton.addEventListener('click', function() {
                const linesContainer = subcategoryElement.querySelector('.expense-lines');
                if (linesContainer) {
                    const line = {
                        name: 'Nouvelle dépense',
                        amount: 0
                    };
                    renderExpenseLine(linesContainer, line);
                    recalculateAllAmounts();
                }
            });
        }
    }
    
    /**
     * Initialise les écouteurs d'événements d'une ligne
     * @param {HTMLElement} lineElement - L'élément de ligne
     */
    function initializeLineEvents(lineElement, lineData) {
        // S'assurer que lineData existe, sinon le créer à partir des valeurs des inputs
        if (!lineData) {
            lineData = {
                name: lineElement.querySelector('.line-name')?.value || '',
                amount: parseFloat(lineElement.querySelector('.line-amount')?.value || 0)
            };
        }
        
        // Écouteur pour le bouton de suppression
        const deleteButton = lineElement.querySelector('.delete-line');
        if (deleteButton) {
            deleteButton.addEventListener('click', function() {
                lineElement.remove();
                recalculateProjectAmounts();
                // Mettre à jour les données du projet après suppression
                collectAndSaveProjectData();
            });
        }
        
        // Écouteur pour le nom de la dépense
        const nameInput = lineElement.querySelector('.line-name');
        if (nameInput) {
            nameInput.addEventListener('input', function() {
                // Mettre à jour la valeur dans l'objet ligne (important)
                lineData.name = this.value;
                lineElement.dataset.lineName = this.value;
                // Mettre à jour les données du projet après modification
                collectAndSaveProjectData();
            });
            
            nameInput.addEventListener('blur', function() {
                lineData.name = this.value;
                lineElement.dataset.lineName = this.value;
                collectAndSaveProjectData();
            });
        }
        
        // Écouteurs pour le montant
        const amountInput = lineElement.querySelector('.line-amount');
        if (amountInput) {
            amountInput.addEventListener('input', function() {
                // Mettre à jour la valeur dans l'objet ligne (important)
                const amount = parseFloat(this.value) || 0;
                lineData.amount = amount;
                lineElement.dataset.lineAmount = amount;
                // Recalculer tous les montants
                recalculateProjectAmounts();
                // Mettre à jour les données du projet après modification
                collectAndSaveProjectData();
            });
            
            amountInput.addEventListener('change', function() {
                const amount = parseFloat(this.value) || 0;
                lineData.amount = amount;
                lineElement.dataset.lineAmount = amount;
                recalculateProjectAmounts();
                collectAndSaveProjectData();
            });
        }
    }
    
    /**
     * Finalise le rendu du projet
     */
    function finalizeProjectRendering() {
        console.log('🏁 Finalisation du rendu du projet');
        
        // Exécuter un recalcul complet
        setTimeout(function() {
            // Utiliser notre fonction de recalcul interne
            recalculateProjectAmounts();
            console.log('✅ Recalcul final effectué');
        }, 200);
        
        // Désactiver tout autre système de chargement
        disableConflictingSystems();
    }
    
    /**
     * Recalcule tous les montants du projet en cascade
     * Lit les montants des lignes, calcule les sous-totaux et le total
     */
    function recalculateProjectAmounts() {
        console.log("🔄 Recalcul en cascade lancé");

        let projectTotal = 0;

        // Pour chaque catégorie
        document.querySelectorAll(".expense-category").forEach(categoryEl => {
            let categoryTotal = 0;

            const subcategories = categoryEl.querySelectorAll(".subcategory");
            subcategories.forEach(subEl => {
                let subTotal = 0;

                const lines = subEl.querySelectorAll(".expense-line");
                lines.forEach(lineEl => {
                    const amountInput = lineEl.querySelector(".line-amount");
                    const amount = parseFloat(amountInput?.value || 0);
                    subTotal += amount;
                });

                // Mettre à jour le montant affiché dans la sous-catégorie
                const subAmountEl = subEl.querySelector(".subcategory-amount");
                if (subAmountEl) {
                    subAmountEl.textContent = formatAmount(subTotal);
                }

                categoryTotal += subTotal;
            });

            // Mettre à jour le montant affiché dans la catégorie
            const catAmountEl = categoryEl.querySelector(".category-amount");
            if (catAmountEl) {
                catAmountEl.textContent = formatAmount(categoryTotal);
            }

            projectTotal += categoryTotal;
        });

        // Mettre à jour le budget total du projet
        const totalBudgetEl = document.getElementById("totalBudget");
        if (totalBudgetEl) {
            totalBudgetEl.value = projectTotal;
        }

        console.log(`✅ Recalcul terminé : total = ${projectTotal}`);
    }
    
    /**
     * Désactive les systèmes qui pourraient entrer en conflit
     */
    function disableConflictingSystems() {
        console.log('🛑 Désactivation des systèmes conflictuels');
        
        // Liste des fonctions à désactiver pour éviter les conflits
        const functionsToDisable = [
            'loadProjectForEditing',
            'loadOldProjectData'
        ];
        
        functionsToDisable.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                window[funcName] = function() {
                    console.log(`🚫 Fonction ${funcName} désactivée par le système propre de chargement`);
                    return null;
                };
                console.log(`✅ Fonction ${funcName} désactivée`);
            }
        });
    }
    
    /**
     * Collecte toutes les données du projet depuis le DOM et les sauvegarde
     */
    function collectAndSaveProjectData() {
        console.log('💾 Collecte et sauvegarde des données du projet');
        
        // Créer un objet pour contenir toutes les données
        const projectData = {
            projectName: document.getElementById('projectName')?.value,
            projectDate: document.getElementById('projectDate')?.value,
            projectEndDate: document.getElementById('projectEndDate')?.value,
            totalBudget: document.getElementById('totalBudget')?.value,
            template: document.getElementById('templateSelector')?.value,
            linkToWallet: document.getElementById('linkToWallet')?.checked,
            linkToWishlist: document.getElementById('linkToWishlist')?.checked,
            categories: []
        };
        
        // Si nous sommes en mode édition, récupérer l'ID du projet
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        if (projectId) {
            projectData.id = projectId;
        } else {
            // Générer un nouvel ID pour un nouveau projet
            projectData.id = Date.now().toString();
            projectData.createdAt = new Date().toISOString();
        }
        
        // Collecter toutes les catégories
        document.querySelectorAll('.expense-category').forEach(categoryEl => {
            const categoryName = categoryEl.querySelector('.category-name')?.textContent;
            const categoryAmount = extractNumericValue(categoryEl.querySelector('.category-amount')?.textContent);
            
            const category = {
                name: categoryName,
                amount: categoryAmount,
                subcategories: []
            };
            
            // Collecter toutes les sous-catégories de cette catégorie
            categoryEl.querySelectorAll('.subcategory').forEach(subcategoryEl => {
                const subcategoryName = subcategoryEl.querySelector('.subcategory-name')?.textContent;
                const subcategoryAmount = extractNumericValue(subcategoryEl.querySelector('.subcategory-amount')?.textContent);
                
                const subcategory = {
                    name: subcategoryName,
                    amount: subcategoryAmount,
                    lines: []
                };
                
                // Collecter toutes les lignes de cette sous-catégorie
                subcategoryEl.querySelectorAll('.expense-line').forEach(lineEl => {
                    const lineName = lineEl.querySelector('.line-name')?.value;
                    const lineAmount = parseFloat(lineEl.querySelector('.line-amount')?.value || 0);
                    
                    const line = {
                        name: lineName,
                        amount: lineAmount
                    };
                    
                    subcategory.lines.push(line);
                });
                
                category.subcategories.push(subcategory);
            });
            
            projectData.categories.push(category);
        });
        
        // Sauvegarder les données du projet
        saveCurrentProject(projectData);
        
        return projectData;
    }
    
    /**
     * Sauvegarde un projet dans le localStorage
     * @param {Object} projectData - Les données du projet à sauvegarder
     */
    function saveCurrentProject(projectData) {
        console.log('💾 Sauvegarde du projet dans localStorage:', projectData.projectName);
        
        // Récupérer tous les projets existants
        let allProjects = [];
        try {
            allProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        } catch (e) {
            console.error('Erreur lors de la lecture des projets:', e);
            allProjects = [];
        }
        
        // Vérifier si le projet existe déjà
        const existingIndex = allProjects.findIndex(p => p.id === projectData.id);
        
        if (existingIndex >= 0) {
            // Mettre à jour le projet existant
            allProjects[existingIndex] = projectData;
            console.log('✅ Projet mis à jour dans localStorage');
        } else {
            // Ajouter le nouveau projet
            allProjects.push(projectData);
            console.log('✅ Nouveau projet ajouté dans localStorage');
        }
        
        // Sauvegarder tous les projets
        try {
            localStorage.setItem('savedProjects', JSON.stringify(allProjects));
            console.log(`✅ ${allProjects.length} projets sauvegardés dans localStorage`);
        } catch (e) {
            console.error('Erreur lors de la sauvegarde des projets:', e);
        }
    }
    
    /**
     * Extrait une valeur numérique à partir d'une chaîne ou d'un nombre
     * @param {string|number} value - La valeur à convertir
     * @returns {number} La valeur numérique
     */
    function extractNumericValue(value) {
        if (value === undefined || value === null) return 0;
        
        if (typeof value === 'number') return value;
        
        if (typeof value === 'string') {
            // Supprimer tout sauf les chiffres, points, virgules et le signe moins
            const cleanedValue = value.replace(/[^0-9.,\-]/g, '').replace(',', '.');
            const numericValue = parseFloat(cleanedValue);
            return isNaN(numericValue) ? 0 : numericValue;
        }
        
        return 0;
    }
    
    /**
     * Formate un montant en devise
     * @param {number} amount - Le montant à formater
     * @returns {string} Le montant formaté
     */
    function formatAmount(amount) {
        let currencySymbol = '€';
        
        // Utiliser la devise de l'utilisateur si disponible
        if (window.PreferencesManager && typeof PreferencesManager.getCurrentCurrencySymbol === 'function') {
            currencySymbol = PreferencesManager.getCurrentCurrencySymbol();
        }
        
        return `${currencySymbol} ${amount.toFixed(2).replace('.', ',')}`;
    }
    
    console.log('✅ Système propre de chargement de projet initialisé avec succès');
});