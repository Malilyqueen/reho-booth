/**
 * MODULE: formManager.js
 * 
 * Ce module gère toutes les interactions avec les formulaires de l'application.
 * Il centralise les opérations d'ajout, modification et suppression d'éléments,
 * en déclenchant les mises à jour du DOM, les recalculs et les sauvegardes.
 * 
 * Fonctionnalités principales:
 * - Gestion des ajouts/suppressions de catégories
 * - Gestion des ajouts/suppressions de sous-catégories
 * - Gestion des ajouts/suppressions de lignes
 * - Synchronisation avec la sauvegarde
 * - Maintien de la cohérence de l'interface
 */

const FormManager = (function() {
    // Configuration des sélecteurs DOM et classes CSS
    const DOM_SELECTORS = {
        projectForm: '#projectForm',
        expenseCategories: '#expenseCategories',
        categoriesContainer: '#categoriesContainer',
        saveButton: '#saveProjectButton',
        addCategoryButton: '#addCategoryButton',
        categoryTemplateSelector: '#templateSelector'
    };
    
    const CSS_CLASSES = {
        expenseCategory: 'expense-category',
        categoryHeader: 'category-header',
        categoryName: 'category-name',
        categoryAmount: 'category-amount',
        deleteCategoryBtn: 'delete-category-btn',
        subcategoriesContainer: 'subcategories-container',
        subcategory: 'subcategory',
        subcategoryHeader: 'subcategory-header',
        subcategoryName: 'subcategory-name',
        subcategoryAmount: 'subcategory-amount',
        deleteSubcategoryBtn: 'delete-subcategory-btn',
        addSubcategoryBtn: 'add-subcategory-btn',
        expenseLinesContainer: 'expense-lines-container',
        expenseLine: 'expense-line',
        lineName: 'line-name',
        lineAmount: 'line-amount',
        deleteLine: 'delete-line',
        addLineBtn: 'add-line-btn'
    };
    
    // Configuration par défaut
    let _config = {
        autoSave: true,          // Sauvegarde automatique après chaque modification
        recalculateOnChange: true, // Recalcul automatique après chaque modification
        debounceMs: 300          // Délai avant sauvegarde/recalcul pour éviter les opérations trop fréquentes
    };
    
    // Variables pour les timers de debounce
    let _saveTimer = null;
    let _recalculateTimer = null;
    
    /**
     * Initialise le gestionnaire de formulaires
     * @param {Object} options Options de configuration
     */
    function initialize(options = {}) {
        console.log('Initialisation du gestionnaire de formulaires...');
        
        // Fusion des options avec la configuration par défaut
        _config = {
            ..._config,
            ...options
        };
        
        // Attacher les écouteurs d'événements de base
        _attachBaseEventListeners();
        
        console.log('✅ Gestionnaire de formulaires initialisé avec succès');
        return {
            success: true,
            message: 'Gestionnaire de formulaires initialisé avec succès',
            config: _config
        };
    }
    
    /**
     * Attache des écouteurs d'événements pour une nouvelle catégorie
     * @param {HTMLElement} categoryElement Élément DOM de la catégorie
     */
    function attachCategoryEventListeners(categoryElement) {
        if (!categoryElement) {
            console.error('❌ Aucun élément de catégorie fourni');
            return;
        }
        
        // Éviter de réattacher des écouteurs
        if (categoryElement.dataset.eventsAttached === 'true') {
            return;
        }
        
        // === ÉCOUTEURS POUR LA CATÉGORIE ===
        
        // 1. Bouton de suppression
        const deleteBtn = categoryElement.querySelector('.' + CSS_CLASSES.deleteCategoryBtn);
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                _handleCategoryDelete(categoryElement);
            });
        }
        
        // 2. Modifications du nom (contentEditable)
        const nameElement = categoryElement.querySelector('.' + CSS_CLASSES.categoryName);
        if (nameElement) {
            nameElement.addEventListener('input', function() {
                _handleDataChange();
            });
            
            nameElement.addEventListener('blur', function() {
                _handleDataChange();
            });
        }
        
        // 3. Bouton d'ajout de sous-catégorie
        const addSubcategoryBtn = categoryElement.querySelector('.' + CSS_CLASSES.addSubcategoryBtn);
        if (addSubcategoryBtn) {
            addSubcategoryBtn.addEventListener('click', function() {
                _handleAddSubcategory(categoryElement);
            });
        }
        
        // === ÉCOUTEURS POUR CHAQUE SOUS-CATÉGORIE ===
        const subcategories = categoryElement.querySelectorAll('.' + CSS_CLASSES.subcategory);
        subcategories.forEach(subcategory => {
            attachSubcategoryEventListeners(subcategory);
        });
        
        // Marquer comme ayant des écouteurs attachés
        categoryElement.dataset.eventsAttached = 'true';
    }
    
    /**
     * Attache des écouteurs d'événements pour une nouvelle sous-catégorie
     * @param {HTMLElement} subcategoryElement Élément DOM de la sous-catégorie
     */
    function attachSubcategoryEventListeners(subcategoryElement) {
        if (!subcategoryElement) {
            console.error('❌ Aucun élément de sous-catégorie fourni');
            return;
        }
        
        // Éviter de réattacher des écouteurs
        if (subcategoryElement.dataset.eventsAttached === 'true') {
            return;
        }
        
        // === ÉCOUTEURS POUR LA SOUS-CATÉGORIE ===
        
        // 1. Bouton de suppression
        const deleteBtn = subcategoryElement.querySelector('.' + CSS_CLASSES.deleteSubcategoryBtn);
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                _handleSubcategoryDelete(subcategoryElement);
            });
        }
        
        // 2. Modifications du nom (contentEditable)
        const nameElement = subcategoryElement.querySelector('.' + CSS_CLASSES.subcategoryName);
        if (nameElement) {
            nameElement.addEventListener('input', function() {
                _handleDataChange();
            });
            
            nameElement.addEventListener('blur', function() {
                _handleDataChange();
            });
        }
        
        // 3. Bouton d'ajout de ligne
        const addLineBtn = subcategoryElement.querySelector('.' + CSS_CLASSES.addLineBtn);
        if (addLineBtn) {
            addLineBtn.addEventListener('click', function() {
                _handleAddLine(subcategoryElement);
            });
        }
        
        // === ÉCOUTEURS POUR CHAQUE LIGNE ===
        const lines = subcategoryElement.querySelectorAll('.' + CSS_CLASSES.expenseLine);
        lines.forEach(line => {
            attachLineEventListeners(line);
        });
        
        // Marquer comme ayant des écouteurs attachés
        subcategoryElement.dataset.eventsAttached = 'true';
    }
    
    /**
     * Attache des écouteurs d'événements pour une nouvelle ligne
     * @param {HTMLElement} lineElement Élément DOM de la ligne
     */
    function attachLineEventListeners(lineElement) {
        if (!lineElement) {
            console.error('❌ Aucun élément de ligne fourni');
            return;
        }
        
        // Éviter de réattacher des écouteurs
        if (lineElement.dataset.eventsAttached === 'true') {
            return;
        }
        
        // === ÉCOUTEURS POUR LA LIGNE ===
        
        // 1. Bouton de suppression
        const deleteBtn = lineElement.querySelector('.' + CSS_CLASSES.deleteLine);
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                _handleLineDelete(lineElement);
            });
        }
        
        // 2. Modifications du nom
        const nameInput = lineElement.querySelector('.' + CSS_CLASSES.lineName);
        if (nameInput) {
            nameInput.addEventListener('input', function() {
                _handleDataChange();
            });
            
            nameInput.addEventListener('blur', function() {
                _handleDataChange();
            });
        }
        
        // 3. Modifications du montant
        const amountInput = lineElement.querySelector('.' + CSS_CLASSES.lineAmount);
        if (amountInput) {
            amountInput.addEventListener('input', function() {
                _handleDataChange();
            });
            
            amountInput.addEventListener('blur', function() {
                _handleDataChange();
            });
        }
        
        // Marquer comme ayant des écouteurs attachés
        lineElement.dataset.eventsAttached = 'true';
    }
    
    /**
     * Crée une nouvelle catégorie et l'ajoute au DOM
     * @param {Object} categoryData Données de la catégorie à créer
     * @returns {HTMLElement} L'élément créé
     */
    function createCategory(categoryData = {}) {
        console.log('✨ Création d\'une nouvelle catégorie', categoryData);
        
        // Valeurs par défaut
        const defaultData = {
            name: 'Nouvelle catégorie',
            icon: '📊',
            amount: 0,
            subcategories: []
        };
        
        // Fusionner avec les valeurs par défaut
        const data = {
            ...defaultData,
            ...categoryData
        };
        
        // Créer l'élément
        let categoryElement;
        
        // Si ProjectRenderer est disponible, utiliser sa méthode
        if (window.ProjectRenderer && typeof ProjectRenderer.renderCategory === 'function') {
            categoryElement = ProjectRenderer.renderCategory(data, { editMode: true });
        } else {
            // Fallback: créer manuellement
            categoryElement = _createCategoryElement(data);
        }
        
        // Trouver le conteneur et ajouter la catégorie
        const container = document.querySelector(DOM_SELECTORS.expenseCategories) || 
                          document.querySelector(DOM_SELECTORS.categoriesContainer);
                          
        if (!container) {
            console.error('❌ Conteneur de catégories non trouvé');
            return null;
        }
        
        container.appendChild(categoryElement);
        
        // Attacher les écouteurs d'événements
        attachCategoryEventListeners(categoryElement);
        
        // Déclencher les calculs et sauvegardes
        _handleDataChange();
        
        return categoryElement;
    }
    
    /**
     * Crée une nouvelle sous-catégorie et l'ajoute à une catégorie existante
     * @param {HTMLElement} categoryElement Élément DOM de la catégorie parente
     * @param {Object} subcategoryData Données de la sous-catégorie à créer
     * @returns {HTMLElement} L'élément créé
     */
    function createSubcategory(categoryElement, subcategoryData = {}) {
        if (!categoryElement) {
            console.error('❌ Aucune catégorie parente fournie');
            return null;
        }
        
        console.log('✨ Création d\'une nouvelle sous-catégorie', subcategoryData);
        
        // Valeurs par défaut
        const defaultData = {
            name: 'Nouvelle sous-catégorie',
            amount: 0,
            lines: []
        };
        
        // Fusionner avec les valeurs par défaut
        const data = {
            ...defaultData,
            ...subcategoryData
        };
        
        // Créer l'élément
        let subcategoryElement;
        
        // Si ProjectRenderer est disponible, utiliser sa méthode
        if (window.ProjectRenderer && typeof ProjectRenderer.renderSubcategory === 'function') {
            subcategoryElement = ProjectRenderer.renderSubcategory(data, { editMode: true });
        } else {
            // Fallback: créer manuellement
            subcategoryElement = _createSubcategoryElement(data);
        }
        
        // Trouver le conteneur et ajouter la sous-catégorie
        const container = categoryElement.querySelector('.' + CSS_CLASSES.subcategoriesContainer);
        
        if (!container) {
            console.error('❌ Conteneur de sous-catégories non trouvé');
            return null;
        }
        
        container.appendChild(subcategoryElement);
        
        // Attacher les écouteurs d'événements
        attachSubcategoryEventListeners(subcategoryElement);
        
        // Déclencher les calculs et sauvegardes
        _handleDataChange();
        
        return subcategoryElement;
    }
    
    /**
     * Crée une nouvelle ligne et l'ajoute à une sous-catégorie existante
     * @param {HTMLElement} subcategoryElement Élément DOM de la sous-catégorie parente
     * @param {Object} lineData Données de la ligne à créer
     * @returns {HTMLElement} L'élément créé
     */
    function createLine(subcategoryElement, lineData = {}) {
        if (!subcategoryElement) {
            console.error('❌ Aucune sous-catégorie parente fournie');
            return null;
        }
        
        console.log('✨ Création d\'une nouvelle ligne', lineData);
        
        // Valeurs par défaut
        const defaultData = {
            name: 'Nouvelle ligne',
            amount: 0
        };
        
        // Fusionner avec les valeurs par défaut
        const data = {
            ...defaultData,
            ...lineData
        };
        
        // Créer l'élément
        let lineElement;
        
        // Si ProjectRenderer est disponible, utiliser sa méthode
        if (window.ProjectRenderer && typeof ProjectRenderer.renderExpenseLine === 'function') {
            lineElement = ProjectRenderer.renderExpenseLine(data, { editMode: true });
        } else {
            // Fallback: créer manuellement
            lineElement = _createLineElement(data);
        }
        
        // Trouver le conteneur et ajouter la ligne
        const container = subcategoryElement.querySelector('.' + CSS_CLASSES.expenseLinesContainer);
        
        if (!container) {
            console.error('❌ Conteneur de lignes non trouvé');
            return null;
        }
        
        container.appendChild(lineElement);
        
        // Attacher les écouteurs d'événements
        attachLineEventListeners(lineElement);
        
        // Déclencher les calculs et sauvegardes
        _handleDataChange();
        
        return lineElement;
    }
    
    /**
     * Supprime une catégorie du DOM
     * @param {HTMLElement} categoryElement Élément DOM de la catégorie à supprimer
     */
    function deleteCategory(categoryElement) {
        if (!categoryElement) {
            console.error('❌ Aucun élément de catégorie fourni pour la suppression');
            return false;
        }
        
        // Confirmation avant suppression
        const categoryName = categoryElement.querySelector('.' + CSS_CLASSES.categoryName)?.textContent || 'cette catégorie';
        if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" et toutes ses sous-catégories ?`)) {
            return false;
        }
        
        console.log(`🗑️ Suppression de la catégorie: ${categoryName}`);
        
        // Supprimer l'élément
        categoryElement.remove();
        
        // Déclencher les calculs et sauvegardes
        _handleDataChange();
        
        return true;
    }
    
    /**
     * Supprime une sous-catégorie du DOM
     * @param {HTMLElement} subcategoryElement Élément DOM de la sous-catégorie à supprimer
     */
    function deleteSubcategory(subcategoryElement) {
        if (!subcategoryElement) {
            console.error('❌ Aucun élément de sous-catégorie fourni pour la suppression');
            return false;
        }
        
        // Confirmation avant suppression
        const subcategoryName = subcategoryElement.querySelector('.' + CSS_CLASSES.subcategoryName)?.textContent || 'cette sous-catégorie';
        if (!confirm(`Êtes-vous sûr de vouloir supprimer la sous-catégorie "${subcategoryName}" et toutes ses lignes ?`)) {
            return false;
        }
        
        console.log(`🗑️ Suppression de la sous-catégorie: ${subcategoryName}`);
        
        // Supprimer l'élément
        subcategoryElement.remove();
        
        // Déclencher les calculs et sauvegardes
        _handleDataChange();
        
        return true;
    }
    
    /**
     * Supprime une ligne du DOM
     * @param {HTMLElement} lineElement Élément DOM de la ligne à supprimer
     */
    function deleteLine(lineElement) {
        if (!lineElement) {
            console.error('❌ Aucun élément de ligne fourni pour la suppression');
            return false;
        }
        
        // Pas besoin de confirmation pour une simple ligne
        const lineName = lineElement.querySelector('.' + CSS_CLASSES.lineName)?.value || 'cette ligne';
        console.log(`🗑️ Suppression de la ligne: ${lineName}`);
        
        // Supprimer l'élément
        lineElement.remove();
        
        // Déclencher les calculs et sauvegardes
        _handleDataChange();
        
        return true;
    }
    
    /**
     * Méthode privée pour attacher les écouteurs d'événements de base
     * @private
     */
    function _attachBaseEventListeners() {
        // 1. Bouton d'ajout de catégorie
        const addCategoryBtn = document.querySelector(DOM_SELECTORS.addCategoryButton);
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', function() {
                _handleAddCategory();
            });
        }
        
        // 2. Bouton de sauvegarde
        const saveBtn = document.querySelector(DOM_SELECTORS.saveButton);
        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                _handleSaveProject();
            });
        }
        
        // 3. Initialiser les éléments existants
        _initializeExistingElements();
        
        // 4. Configurer un observateur de mutation pour les nouveaux éléments
        _setupMutationObserver();
    }
    
    /**
     * Méthode privée pour initialiser les éléments existants
     * @private
     */
    function _initializeExistingElements() {
        // Attacher des écouteurs aux catégories existantes
        const categories = document.querySelectorAll('.' + CSS_CLASSES.expenseCategory);
        categories.forEach(category => {
            attachCategoryEventListeners(category);
        });
    }
    
    /**
     * Méthode privée pour configurer un observateur de mutation
     * @private
     */
    function _setupMutationObserver() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Parcourir les nouveaux nœuds
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Catégorie
                            if (node.classList && node.classList.contains(CSS_CLASSES.expenseCategory)) {
                                attachCategoryEventListeners(node);
                            }
                            
                            // Sous-catégorie
                            if (node.classList && node.classList.contains(CSS_CLASSES.subcategory)) {
                                attachSubcategoryEventListeners(node);
                            }
                            
                            // Ligne
                            if (node.classList && node.classList.contains(CSS_CLASSES.expenseLine)) {
                                attachLineEventListeners(node);
                            }
                            
                            // Rechercher récursivement
                            const categories = node.querySelectorAll('.' + CSS_CLASSES.expenseCategory);
                            categories.forEach(category => attachCategoryEventListeners(category));
                            
                            const subcategories = node.querySelectorAll('.' + CSS_CLASSES.subcategory);
                            subcategories.forEach(subcategory => attachSubcategoryEventListeners(subcategory));
                            
                            const lines = node.querySelectorAll('.' + CSS_CLASSES.expenseLine);
                            lines.forEach(line => attachLineEventListeners(line));
                        }
                    });
                }
            });
        });
        
        // Observer le corps du document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Méthode privée pour gérer l'ajout d'une catégorie
     * @private
     */
    function _handleAddCategory() {
        createCategory();
    }
    
    /**
     * Méthode privée pour gérer la suppression d'une catégorie
     * @private
     * @param {HTMLElement} categoryElement Élément DOM de la catégorie
     */
    function _handleCategoryDelete(categoryElement) {
        deleteCategory(categoryElement);
    }
    
    /**
     * Méthode privée pour gérer l'ajout d'une sous-catégorie
     * @private
     * @param {HTMLElement} categoryElement Élément DOM de la catégorie parente
     */
    function _handleAddSubcategory(categoryElement) {
        createSubcategory(categoryElement);
    }
    
    /**
     * Méthode privée pour gérer la suppression d'une sous-catégorie
     * @private
     * @param {HTMLElement} subcategoryElement Élément DOM de la sous-catégorie
     */
    function _handleSubcategoryDelete(subcategoryElement) {
        deleteSubcategory(subcategoryElement);
    }
    
    /**
     * Méthode privée pour gérer l'ajout d'une ligne
     * @private
     * @param {HTMLElement} subcategoryElement Élément DOM de la sous-catégorie parente
     */
    function _handleAddLine(subcategoryElement) {
        createLine(subcategoryElement);
    }
    
    /**
     * Méthode privée pour gérer la suppression d'une ligne
     * @private
     * @param {HTMLElement} lineElement Élément DOM de la ligne
     */
    function _handleLineDelete(lineElement) {
        deleteLine(lineElement);
    }
    
    /**
     * Méthode privée pour gérer les changements de données
     * @private
     */
    function _handleDataChange() {
        // Déclencher le recalcul si activé
        if (_config.recalculateOnChange) {
            // Annuler le timer précédent
            if (_recalculateTimer) {
                clearTimeout(_recalculateTimer);
            }
            
            // Définir un nouveau timer
            _recalculateTimer = setTimeout(() => {
                // Utiliser BudgetCalculator si disponible
                if (window.BudgetCalculator && typeof BudgetCalculator.recalculateAllAmounts === 'function') {
                    BudgetCalculator.recalculateAllAmounts();
                } else if (typeof recalculateAllAmounts === 'function') {
                    // Fallback: fonction globale
                    recalculateAllAmounts();
                } else {
                    console.warn('⚠️ Aucune fonction de recalcul trouvée');
                }
            }, _config.debounceMs);
        }
        
        // Déclencher la sauvegarde si activée
        if (_config.autoSave) {
            // Annuler le timer précédent
            if (_saveTimer) {
                clearTimeout(_saveTimer);
            }
            
            // Définir un nouveau timer
            _saveTimer = setTimeout(() => {
                _handleSaveProject();
            }, _config.debounceMs * 2); // Double du délai pour s'assurer que le recalcul est terminé
        }
    }
    
    /**
     * Méthode privée pour gérer la sauvegarde du projet
     * @private
     */
    function _handleSaveProject() {
        console.log('💾 Sauvegarde du projet...');
        
        // Extraire les données du formulaire
        let projectData = {};
        
        // Utiliser ProjectRenderer si disponible
        if (window.ProjectRenderer && typeof ProjectRenderer.extractProjectFromDOM === 'function') {
            projectData = ProjectRenderer.extractProjectFromDOM();
        } else {
            // Fallback: extraction manuelle
            const form = document.querySelector(DOM_SELECTORS.projectForm);
            if (form) {
                const formData = new FormData(form);
                
                // Extraire les champs de base
                projectData = {
                    projectName: formData.get('projectName') || '',
                    projectDate: formData.get('projectDate') || '',
                    projectEndDate: formData.get('projectEndDate') || '',
                    totalBudget: formData.get('totalBudget') || 0,
                    template: formData.get('template') || 'Personnalisé',
                    // Les catégories seraient extraites séparément
                    categories: _extractCategoriesFromDOM()
                };
            }
        }
        
        // Sauvegarder avec ProjectData si disponible
        if (window.ProjectData) {
            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('id');
            
            if (projectId) {
                // Mise à jour d'un projet existant
                ProjectData.updateProject(projectId, projectData);
            } else {
                // Création d'un nouveau projet
                ProjectData.createProject(projectData);
            }
        } else {
            // Fallback: sauvegarde avec la méthode existante
            if (typeof saveProject === 'function') {
                saveProject();
            } else {
                console.warn('⚠️ Aucune fonction de sauvegarde trouvée');
            }
        }
    }
    
    /**
     * Méthode privée pour extraire les catégories du DOM
     * @private
     * @returns {Array} Liste des catégories extraites
     */
    function _extractCategoriesFromDOM() {
        const categories = [];
        
        // Trouver les éléments de catégorie
        const categoryElements = document.querySelectorAll('.' + CSS_CLASSES.expenseCategory);
        
        categoryElements.forEach(categoryElement => {
            const nameElement = categoryElement.querySelector('.' + CSS_CLASSES.categoryName);
            const amountElement = categoryElement.querySelector('.' + CSS_CLASSES.categoryAmount);
            const iconElement = categoryElement.querySelector('.' + CSS_CLASSES.categoryIcon);
            
            const category = {
                name: nameElement ? nameElement.textContent.trim() : 'Catégorie sans nom',
                amount: amountElement ? _extractAmountFromText(amountElement.textContent) : 0,
                icon: iconElement ? iconElement.textContent.trim() : '📊',
                subcategories: []
            };
            
            // Extraire les sous-catégories
            const subcategoryElements = categoryElement.querySelectorAll('.' + CSS_CLASSES.subcategory);
            
            subcategoryElements.forEach(subcategoryElement => {
                const nameElement = subcategoryElement.querySelector('.' + CSS_CLASSES.subcategoryName);
                const amountElement = subcategoryElement.querySelector('.' + CSS_CLASSES.subcategoryAmount);
                
                const subcategory = {
                    name: nameElement ? nameElement.textContent.trim() : 'Sous-catégorie sans nom',
                    amount: amountElement ? _extractAmountFromText(amountElement.textContent) : 0,
                    lines: []
                };
                
                // Extraire les lignes
                const lineElements = subcategoryElement.querySelectorAll('.' + CSS_CLASSES.expenseLine);
                
                lineElements.forEach(lineElement => {
                    const nameInput = lineElement.querySelector('.' + CSS_CLASSES.lineName);
                    const amountInput = lineElement.querySelector('.' + CSS_CLASSES.lineAmount);
                    
                    let lineName = 'Ligne sans nom';
                    let lineAmount = 0;
                    
                    if (nameInput) {
                        lineName = nameInput.tagName === 'INPUT' ? nameInput.value : nameInput.textContent.trim();
                    }
                    
                    if (amountInput) {
                        lineAmount = amountInput.tagName === 'INPUT' ? 
                            (parseFloat(amountInput.value) || 0) : 
                            _extractAmountFromText(amountInput.textContent);
                    }
                    
                    subcategory.lines.push({
                        name: lineName,
                        amount: lineAmount
                    });
                });
                
                category.subcategories.push(subcategory);
            });
            
            categories.push(category);
        });
        
        return categories;
    }
    
    /**
     * Méthode privée pour extraire un montant d'une chaîne de texte
     * @private
     * @param {string} text Texte contenant un montant
     * @returns {number} Le montant extrait
     */
    function _extractAmountFromText(text) {
        if (!text) return 0;
        
        // Supprimer tous les caractères non numériques sauf point et virgule
        const numericStr = text.replace(/[^\d.,]/g, '').replace(',', '.');
        return parseFloat(numericStr) || 0;
    }
    
    /**
     * Méthode privée pour créer un élément de catégorie (fallback)
     * @private
     * @param {Object} data Données de la catégorie
     * @returns {HTMLElement} L'élément créé
     */
    function _createCategoryElement(data) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = CSS_CLASSES.expenseCategory;
        categoryDiv.setAttribute('data-category', data.name);
        
        // En-tête de la catégorie
        const categoryHeader = document.createElement('div');
        categoryHeader.className = CSS_CLASSES.categoryHeader;
        
        // Icône de la catégorie
        const categoryIcon = document.createElement('span');
        categoryIcon.className = CSS_CLASSES.categoryIcon;
        categoryIcon.textContent = data.icon || '📊';
        
        // Nom de la catégorie
        const categoryName = document.createElement('span');
        categoryName.className = CSS_CLASSES.categoryName;
        categoryName.textContent = data.name;
        categoryName.contentEditable = 'true';
        
        // Montant de la catégorie
        const categoryAmount = document.createElement('span');
        categoryAmount.className = CSS_CLASSES.categoryAmount;
        categoryAmount.textContent = formatCurrency(data.amount || 0);
        
        // Bouton de suppression
        const deleteBtn = document.createElement('button');
        deleteBtn.className = CSS_CLASSES.deleteCategoryBtn;
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.setAttribute('title', 'Supprimer cette catégorie');
        
        // Assembler l'en-tête
        categoryHeader.appendChild(categoryIcon);
        categoryHeader.appendChild(categoryName);
        categoryHeader.appendChild(categoryAmount);
        categoryHeader.appendChild(deleteBtn);
        
        categoryDiv.appendChild(categoryHeader);
        
        // Conteneur des sous-catégories
        const subcategoriesContainer = document.createElement('div');
        subcategoriesContainer.className = CSS_CLASSES.subcategoriesContainer;
        
        // Ajouter les sous-catégories existantes
        if (data.subcategories && data.subcategories.length > 0) {
            data.subcategories.forEach(subcategory => {
                const subcategoryElement = _createSubcategoryElement(subcategory);
                subcategoriesContainer.appendChild(subcategoryElement);
            });
        }
        
        categoryDiv.appendChild(subcategoriesContainer);
        
        // Bouton pour ajouter une sous-catégorie
        const addSubcategoryBtn = document.createElement('button');
        addSubcategoryBtn.className = CSS_CLASSES.addSubcategoryBtn;
        addSubcategoryBtn.textContent = '+ Ajouter une sous-catégorie';
        categoryDiv.appendChild(addSubcategoryBtn);
        
        return categoryDiv;
    }
    
    /**
     * Méthode privée pour créer un élément de sous-catégorie (fallback)
     * @private
     * @param {Object} data Données de la sous-catégorie
     * @returns {HTMLElement} L'élément créé
     */
    function _createSubcategoryElement(data) {
        const subcategoryDiv = document.createElement('div');
        subcategoryDiv.className = CSS_CLASSES.subcategory;
        
        // En-tête de la sous-catégorie
        const subcategoryHeader = document.createElement('div');
        subcategoryHeader.className = CSS_CLASSES.subcategoryHeader;
        
        // Nom de la sous-catégorie
        const subcategoryName = document.createElement('span');
        subcategoryName.className = CSS_CLASSES.subcategoryName;
        subcategoryName.textContent = data.name;
        subcategoryName.contentEditable = 'true';
        
        // Montant de la sous-catégorie
        const subcategoryAmount = document.createElement('span');
        subcategoryAmount.className = CSS_CLASSES.subcategoryAmount;
        subcategoryAmount.textContent = formatCurrency(data.amount || 0);
        
        // Bouton de suppression
        const deleteBtn = document.createElement('button');
        deleteBtn.className = CSS_CLASSES.deleteSubcategoryBtn;
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.setAttribute('title', 'Supprimer cette sous-catégorie');
        
        // Assembler l'en-tête
        subcategoryHeader.appendChild(subcategoryName);
        subcategoryHeader.appendChild(subcategoryAmount);
        subcategoryHeader.appendChild(deleteBtn);
        
        subcategoryDiv.appendChild(subcategoryHeader);
        
        // Conteneur des lignes de dépense
        const expenseLinesContainer = document.createElement('div');
        expenseLinesContainer.className = CSS_CLASSES.expenseLinesContainer;
        
        // Ajouter les lignes existantes
        if (data.lines && data.lines.length > 0) {
            data.lines.forEach(line => {
                const lineElement = _createLineElement(line);
                expenseLinesContainer.appendChild(lineElement);
            });
        }
        
        subcategoryDiv.appendChild(expenseLinesContainer);
        
        // Bouton pour ajouter une ligne
        const addLineBtn = document.createElement('button');
        addLineBtn.className = CSS_CLASSES.addLineBtn;
        addLineBtn.textContent = '+ Ajouter une ligne';
        subcategoryDiv.appendChild(addLineBtn);
        
        return subcategoryDiv;
    }
    
    /**
     * Méthode privée pour créer un élément de ligne (fallback)
     * @private
     * @param {Object} data Données de la ligne
     * @returns {HTMLElement} L'élément créé
     */
    function _createLineElement(data) {
        const lineDiv = document.createElement('div');
        lineDiv.className = CSS_CLASSES.expenseLine;
        
        // Nom de la ligne
        const lineName = document.createElement('input');
        lineName.type = 'text';
        lineName.className = CSS_CLASSES.lineName;
        lineName.value = data.name || '';
        
        // Montant de la ligne
        const lineAmount = document.createElement('input');
        lineAmount.type = 'number';
        lineAmount.className = CSS_CLASSES.lineAmount;
        lineAmount.value = parseFloat(data.amount) || 0;
        
        // Bouton de suppression
        const deleteBtn = document.createElement('button');
        deleteBtn.className = CSS_CLASSES.deleteLine;
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.setAttribute('title', 'Supprimer cette ligne');
        
        // Assembler
        lineDiv.appendChild(lineName);
        lineDiv.appendChild(lineAmount);
        lineDiv.appendChild(deleteBtn);
        
        return lineDiv;
    }
    
    /**
     * Fonction utilitaire pour formater un montant en devise
     * @param {number|string} amount Le montant à formater
     * @returns {string} Le montant formaté
     */
    function formatCurrency(amount) {
        // Convertir en nombre si c'est une chaîne
        if (typeof amount === 'string') {
            amount = parseFloat(amount.replace(/[^\d.-]/g, '')) || 0;
        }
        
        // Utiliser la devise préférée de l'utilisateur si disponible
        let symbol = '€';
        
        if (window.PreferencesManager && window.PreferencesManager.getCurrentCurrencySymbol) {
            symbol = PreferencesManager.getCurrentCurrencySymbol();
        }
        
        // Format: symbole suivi du montant avec 2 décimales
        return `${symbol} ${amount.toFixed(2).replace(".", ",")}`;
    }
    
    // Exposer l'API publique
    return {
        initialize,
        attachCategoryEventListeners,
        attachSubcategoryEventListeners,
        attachLineEventListeners,
        createCategory,
        createSubcategory,
        createLine,
        deleteCategory,
        deleteSubcategory,
        deleteLine
    };
})();

// Auto-initialisation du module
document.addEventListener('DOMContentLoaded', function() {
    FormManager.initialize();
});