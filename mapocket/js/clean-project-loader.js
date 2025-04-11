/**
 * Gestionnaire de chargement de projet propre et structuré
 * Remplace les fonctionnalités de chargement de projet précédentes
 * pour éviter les problèmes de doublons, de lignes manquantes et de montants incorrects
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🧹 Initialisation du système propre de chargement de projet');

    // 1. Déterminer si nous sommes en mode édition et récupérer l'ID du projet si c'est le cas
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    const isEditMode = urlParams.get('edit') === 'true';
    
    console.log(`Mode: ${isEditMode ? 'Édition' : 'Création'}, ID Projet: ${projectId || 'Nouveau'}`);
    
    if (isEditMode && projectId) {
        // En mode édition, charger et afficher le projet
        console.log('🔄 Chargement du projet pour édition...');
        
        // Nettoyer l'interface avant de charger le projet
        clearProjectInterface();
        
        // Charger le projet et l'afficher proprement
        cleanLoadProject(projectId);
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
        
        // Créer l'élément de ligne
        const lineElement = document.createElement('div');
        lineElement.className = 'expense-line';
        
        // Créer le champ de nom
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'line-name';
        nameInput.value = line.name || 'Nouvelle dépense';
        
        // Créer le champ de montant
        const amountInput = document.createElement('input');
        amountInput.type = 'number';
        amountInput.className = 'line-amount';
        amountInput.value = extractNumericValue(line.amount);
        
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
        initializeLineEvents(lineElement);
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
    function initializeLineEvents(lineElement) {
        // Écouteur pour le bouton de suppression
        const deleteButton = lineElement.querySelector('.delete-line');
        if (deleteButton) {
            deleteButton.addEventListener('click', function() {
                lineElement.remove();
                recalculateAllAmounts();
            });
        }
        
        // Écouteurs pour le montant
        const amountInput = lineElement.querySelector('.line-amount');
        if (amountInput) {
            amountInput.addEventListener('input', function() {
                recalculateAllAmounts();
            });
            amountInput.addEventListener('change', function() {
                recalculateAllAmounts();
            });
        }
    }
    
    /**
     * Finalise le rendu du projet
     */
    function finalizeProjectRendering() {
        console.log('🏁 Finalisation du rendu du projet');
        
        // Exécuter un recalcul complet
        if (typeof recalculateAllAmounts === 'function') {
            setTimeout(function() {
                recalculateAllAmounts();
                console.log('✅ Recalcul final effectué');
            }, 200);
        } else {
            console.warn('⚠️ Fonction recalculateAllAmounts non disponible');
        }
        
        // Désactiver tout autre système de chargement
        disableConflictingSystems();
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