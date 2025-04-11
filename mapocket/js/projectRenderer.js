/**
 * MODULE: projectRenderer.js
 * 
 * Ce module gère le rendu des projets dans l'interface utilisateur.
 * Il est responsable de l'injection dynamique des données de projet 
 * dans le DOM, incluant les catégories, sous-catégories et lignes de dépenses.
 * 
 * Fonctionnalités principales:
 * - Rendu de la structure complète d'un projet
 * - Création dynamique des éléments du DOM
 * - Application des styles et classes appropriés
 * - Support pour les modes édition et affichage
 */

const ProjectRenderer = (function() {
    // Références aux éléments du DOM et constantes
    const DOM_SELECTORS = {
        expenseCategories: '#expenseCategories',
        projectName: '#projectName',
        projectDate: '#projectDate',
        projectEndDate: '#projectEndDate',
        totalBudget: '#totalBudget',
        templateSelector: '#templateSelector',
        categoriesContainer: '#categoriesContainer'
    };
    
    // Configuration des classes CSS
    const CSS_CLASSES = {
        expenseCategory: 'expense-category',
        categoryHeader: 'category-header',
        categoryIcon: 'category-icon',
        categoryName: 'category-name',
        categoryAmount: 'category-amount',
        deleteCategoryBtn: 'delete-category-btn',
        subcategoriesContainer: 'subcategories-container',
        subcategory: 'subcategory',
        subcategoryHeader: 'subcategory-header',
        subcategoryName: 'subcategory-name',
        subcategoryAmount: 'subcategory-amount',
        deleteSubcategoryBtn: 'delete-subcategory-btn',
        expenseLinesContainer: 'expense-lines-container',
        expenseLine: 'expense-line',
        lineName: 'line-name',
        lineAmount: 'line-amount',
        deleteLine: 'delete-line',
        addSubcategoryBtn: 'add-subcategory-btn',
        addLineBtn: 'add-line-btn'
    };
    
    /**
     * Initialise le moteur de rendu
     * @param {Object} options Options de configuration
     */
    function initialize(options = {}) {
        console.log('Initialisation du moteur de rendu...');
        
        // Fusion des options avec les valeurs par défaut
        const config = {
            editMode: false,
            ...options
        };
        
        // Stocker la configuration
        _config = config;
        
        return {
            success: true,
            message: 'Moteur de rendu initialisé avec succès',
            config
        };
    }
    
    // Variable privée pour stocker la configuration
    let _config = {
        editMode: false
    };
    
    /**
     * Rend un projet complet dans l'interface
     * @param {Object} project Données du projet à afficher
     * @param {Object} options Options supplémentaires pour le rendu
     */
    function renderProject(project, options = {}) {
        if (!project) {
            console.error('❌ Aucun projet fourni pour le rendu');
            return false;
        }
        
        console.log(`📝 Rendu du projet "${project.projectName}" (ID: ${project.id})`);
        
        // Fusionner les options avec la configuration actuelle
        const renderOptions = {
            ..._config,
            ...options
        };
        
        try {
            // Remplir les champs d'en-tête du projet
            _renderProjectHeader(project, renderOptions);
            
            // Rendre les catégories du projet
            _renderCategories(project.categories, renderOptions);
            
            console.log('✅ Projet rendu avec succès');
            return true;
        } catch (error) {
            console.error('❌ Erreur lors du rendu du projet:', error);
            return false;
        }
    }
    
    /**
     * Rend un élément de catégorie de dépenses
     * @param {Object} category Données de la catégorie
     * @param {Object} options Options pour le rendu
     * @returns {HTMLElement} L'élément DOM de la catégorie
     */
    function renderCategory(category, options = {}) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = CSS_CLASSES.expenseCategory;
        categoryDiv.setAttribute('data-category', category.name);
        
        // En-tête de la catégorie
        const categoryHeader = document.createElement('div');
        categoryHeader.className = CSS_CLASSES.categoryHeader;
        
        // Icône de la catégorie
        const categoryIcon = document.createElement('span');
        categoryIcon.className = CSS_CLASSES.categoryIcon;
        categoryIcon.textContent = category.icon || '📊';
        
        // Nom de la catégorie
        const categoryName = document.createElement('span');
        categoryName.className = CSS_CLASSES.categoryName;
        categoryName.textContent = category.name;
        categoryName.contentEditable = options.editMode ? 'true' : 'false';
        
        // Montant de la catégorie
        const categoryAmount = document.createElement('span');
        categoryAmount.className = CSS_CLASSES.categoryAmount;
        categoryAmount.textContent = formatCurrency(category.amount || 0);
        
        // Bouton de suppression
        const deleteBtn = document.createElement('button');
        deleteBtn.className = CSS_CLASSES.deleteCategoryBtn;
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.setAttribute('title', 'Supprimer cette catégorie');
        
        // Assembler l'en-tête
        categoryHeader.appendChild(categoryIcon);
        categoryHeader.appendChild(categoryName);
        categoryHeader.appendChild(categoryAmount);
        
        if (options.editMode) {
            categoryHeader.appendChild(deleteBtn);
        }
        
        categoryDiv.appendChild(categoryHeader);
        
        // Conteneur des sous-catégories
        const subcategoriesContainer = document.createElement('div');
        subcategoriesContainer.className = CSS_CLASSES.subcategoriesContainer;
        
        // Rendre les sous-catégories
        if (category.subcategories && category.subcategories.length > 0) {
            category.subcategories.forEach(subcategory => {
                const subcategoryElement = renderSubcategory(subcategory, options);
                subcategoriesContainer.appendChild(subcategoryElement);
            });
        }
        
        categoryDiv.appendChild(subcategoriesContainer);
        
        // Bouton pour ajouter une sous-catégorie (en mode édition)
        if (options.editMode) {
            const addSubcategoryBtn = document.createElement('button');
            addSubcategoryBtn.className = CSS_CLASSES.addSubcategoryBtn;
            addSubcategoryBtn.textContent = '+ Ajouter une sous-catégorie';
            categoryDiv.appendChild(addSubcategoryBtn);
        }
        
        return categoryDiv;
    }
    
    /**
     * Rend un élément de sous-catégorie
     * @param {Object} subcategory Données de la sous-catégorie
     * @param {Object} options Options pour le rendu
     * @returns {HTMLElement} L'élément DOM de la sous-catégorie
     */
    function renderSubcategory(subcategory, options = {}) {
        const subcategoryDiv = document.createElement('div');
        subcategoryDiv.className = CSS_CLASSES.subcategory;
        
        // En-tête de la sous-catégorie
        const subcategoryHeader = document.createElement('div');
        subcategoryHeader.className = CSS_CLASSES.subcategoryHeader;
        
        // Nom de la sous-catégorie
        const subcategoryName = document.createElement('span');
        subcategoryName.className = CSS_CLASSES.subcategoryName;
        subcategoryName.textContent = subcategory.name;
        subcategoryName.contentEditable = options.editMode ? 'true' : 'false';
        
        // Montant de la sous-catégorie
        const subcategoryAmount = document.createElement('span');
        subcategoryAmount.className = CSS_CLASSES.subcategoryAmount;
        subcategoryAmount.textContent = formatCurrency(subcategory.amount || 0);
        
        // Bouton de suppression
        const deleteBtn = document.createElement('button');
        deleteBtn.className = CSS_CLASSES.deleteSubcategoryBtn;
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.setAttribute('title', 'Supprimer cette sous-catégorie');
        
        // Assembler l'en-tête
        subcategoryHeader.appendChild(subcategoryName);
        subcategoryHeader.appendChild(subcategoryAmount);
        
        if (options.editMode) {
            subcategoryHeader.appendChild(deleteBtn);
        }
        
        subcategoryDiv.appendChild(subcategoryHeader);
        
        // Conteneur des lignes de dépense
        const expenseLinesContainer = document.createElement('div');
        expenseLinesContainer.className = CSS_CLASSES.expenseLinesContainer;
        
        // Rendre les lignes de dépense
        if (subcategory.lines && subcategory.lines.length > 0) {
            subcategory.lines.forEach(line => {
                const lineElement = renderExpenseLine(line, options);
                expenseLinesContainer.appendChild(lineElement);
            });
        }
        
        subcategoryDiv.appendChild(expenseLinesContainer);
        
        // Bouton pour ajouter une ligne (en mode édition)
        if (options.editMode) {
            const addLineBtn = document.createElement('button');
            addLineBtn.className = CSS_CLASSES.addLineBtn;
            addLineBtn.textContent = '+ Ajouter une ligne';
            subcategoryDiv.appendChild(addLineBtn);
        }
        
        return subcategoryDiv;
    }
    
    /**
     * Rend un élément de ligne de dépense
     * @param {Object} line Données de la ligne
     * @param {Object} options Options pour le rendu
     * @returns {HTMLElement} L'élément DOM de la ligne
     */
    function renderExpenseLine(line, options = {}) {
        const lineDiv = document.createElement('div');
        lineDiv.className = CSS_CLASSES.expenseLine;
        
        // Nom de la ligne
        if (options.editMode) {
            // En mode édition: champ de saisie
            const lineName = document.createElement('input');
            lineName.type = 'text';
            lineName.className = CSS_CLASSES.lineName;
            lineName.value = line.name || '';
            lineDiv.appendChild(lineName);
            
            // Montant de la ligne
            const lineAmount = document.createElement('input');
            lineAmount.type = 'number';
            lineAmount.className = CSS_CLASSES.lineAmount;
            lineAmount.value = parseFloat(line.amount) || 0;
            lineDiv.appendChild(lineAmount);
            
            // Bouton de suppression
            const deleteBtn = document.createElement('button');
            deleteBtn.className = CSS_CLASSES.deleteLine;
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.setAttribute('title', 'Supprimer cette ligne');
            lineDiv.appendChild(deleteBtn);
        } else {
            // En mode affichage: texte simple
            const lineName = document.createElement('span');
            lineName.className = CSS_CLASSES.lineName;
            lineName.textContent = line.name || '';
            
            const lineAmount = document.createElement('span');
            lineAmount.className = CSS_CLASSES.lineAmount;
            lineAmount.textContent = formatCurrency(line.amount || 0);
            
            lineDiv.appendChild(lineName);
            lineDiv.appendChild(lineAmount);
        }
        
        return lineDiv;
    }
    
    /**
     * Méthode privée pour rendre l'en-tête du projet
     * @private
     * @param {Object} project Données du projet
     * @param {Object} options Options pour le rendu
     */
    function _renderProjectHeader(project, options) {
        // Définir le nom du projet
        const projectNameElement = document.querySelector(DOM_SELECTORS.projectName);
        if (projectNameElement) {
            projectNameElement.value = project.projectName || '';
        }
        
        // Définir la date du projet
        const projectDateElement = document.querySelector(DOM_SELECTORS.projectDate);
        if (projectDateElement) {
            projectDateElement.value = project.projectDate || '';
        }
        
        // Définir la date de fin du projet
        const projectEndDateElement = document.querySelector(DOM_SELECTORS.projectEndDate);
        if (projectEndDateElement) {
            projectEndDateElement.value = project.projectEndDate || '';
        }
        
        // Définir le budget total
        const totalBudgetElement = document.querySelector(DOM_SELECTORS.totalBudget);
        if (totalBudgetElement) {
            totalBudgetElement.value = project.totalBudget || '';
        }
        
        // Sélectionner le template
        const templateSelectorElement = document.querySelector(DOM_SELECTORS.templateSelector);
        if (templateSelectorElement) {
            templateSelectorElement.value = project.template || 'Personnalisé';
        }
    }
    
    /**
     * Méthode privée pour rendre toutes les catégories
     * @private
     * @param {Array} categories Liste des catégories
     * @param {Object} options Options pour le rendu
     */
    function _renderCategories(categories, options) {
        // Trouver le conteneur des catégories
        const container = document.querySelector(DOM_SELECTORS.expenseCategories) || 
                          document.querySelector(DOM_SELECTORS.categoriesContainer);
                          
        if (!container) {
            console.error('❌ Conteneur de catégories non trouvé');
            return;
        }
        
        // Vider le conteneur
        container.innerHTML = '';
        
        // Rendre chaque catégorie
        if (categories && categories.length > 0) {
            categories.forEach(category => {
                const categoryElement = renderCategory(category, options);
                container.appendChild(categoryElement);
            });
        }
    }
    
    /**
     * Extrait les données des formulaires pour créer un objet projet
     * @returns {Object} Les données du projet extraites du DOM
     */
    function extractProjectFromDOM() {
        try {
            const projectData = {
                projectName: _getInputValue(DOM_SELECTORS.projectName),
                projectDate: _getInputValue(DOM_SELECTORS.projectDate),
                projectEndDate: _getInputValue(DOM_SELECTORS.projectEndDate),
                totalBudget: _getInputValue(DOM_SELECTORS.totalBudget),
                template: _getInputValue(DOM_SELECTORS.templateSelector),
                categories: _extractCategoriesFromDOM()
            };
            
            return projectData;
        } catch (error) {
            console.error('Erreur lors de l\'extraction des données du projet:', error);
            return null;
        }
    }
    
    /**
     * Méthode privée pour extraire les catégories du DOM
     * @private
     * @returns {Array} Liste des catégories extraites
     */
    function _extractCategoriesFromDOM() {
        const categories = [];
        const categoryElements = document.querySelectorAll('.' + CSS_CLASSES.expenseCategory);
        
        categoryElements.forEach(categoryElement => {
            const category = {
                name: _getElementText(categoryElement, '.' + CSS_CLASSES.categoryName),
                icon: _getElementText(categoryElement, '.' + CSS_CLASSES.categoryIcon),
                amount: _parseAmount(_getElementText(categoryElement, '.' + CSS_CLASSES.categoryAmount)),
                subcategories: []
            };
            
            // Extraire les sous-catégories
            const subcategoryElements = categoryElement.querySelectorAll('.' + CSS_CLASSES.subcategory);
            subcategoryElements.forEach(subcategoryElement => {
                const subcategory = {
                    name: _getElementText(subcategoryElement, '.' + CSS_CLASSES.subcategoryName),
                    amount: _parseAmount(_getElementText(subcategoryElement, '.' + CSS_CLASSES.subcategoryAmount)),
                    lines: []
                };
                
                // Extraire les lignes
                const lineElements = subcategoryElement.querySelectorAll('.' + CSS_CLASSES.expenseLine);
                lineElements.forEach(lineElement => {
                    const line = {
                        name: _getElementValueOrText(lineElement, '.' + CSS_CLASSES.lineName),
                        amount: _parseAmount(_getElementValueOrText(lineElement, '.' + CSS_CLASSES.lineAmount))
                    };
                    
                    subcategory.lines.push(line);
                });
                
                category.subcategories.push(subcategory);
            });
            
            categories.push(category);
        });
        
        return categories;
    }
    
    /**
     * Méthode privée pour obtenir la valeur d'un champ de saisie
     * @private
     * @param {string} selector Sélecteur CSS de l'élément
     * @returns {string} Valeur du champ
     */
    function _getInputValue(selector) {
        const element = document.querySelector(selector);
        return element ? element.value : '';
    }
    
    /**
     * Méthode privée pour obtenir le texte d'un élément
     * @private
     * @param {HTMLElement} parent Élément parent
     * @param {string} selector Sélecteur CSS de l'élément enfant
     * @returns {string} Texte de l'élément
     */
    function _getElementText(parent, selector) {
        const element = parent.querySelector(selector);
        return element ? element.textContent.trim() : '';
    }
    
    /**
     * Méthode privée pour obtenir la valeur ou le texte d'un élément
     * @private
     * @param {HTMLElement} parent Élément parent
     * @param {string} selector Sélecteur CSS de l'élément enfant
     * @returns {string} Valeur ou texte de l'élément
     */
    function _getElementValueOrText(parent, selector) {
        const element = parent.querySelector(selector);
        if (!element) return '';
        
        return element.tagName === 'INPUT' ? element.value : element.textContent.trim();
    }
    
    /**
     * Méthode privée pour extraire un montant d'une chaîne de caractères
     * @private
     * @param {string} amountStr Chaîne contenant un montant
     * @returns {number} Montant extrait
     */
    function _parseAmount(amountStr) {
        if (!amountStr) return 0;
        
        // Supprimer tous les caractères non numériques sauf point et virgule
        const numericStr = amountStr.replace(/[^\d.,]/g, '').replace(',', '.');
        return parseFloat(numericStr) || 0;
    }
    
    // Utilitaire pour formater les montants en devise
    function formatCurrency(amount) {
        if (typeof amount === 'string') {
            // Tenter d'extraire la valeur numérique si c'est une chaîne
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
        renderProject,
        renderCategory,
        renderSubcategory,
        renderExpenseLine,
        extractProjectFromDOM,
        formatCurrency
    };
})();

// Auto-initialisation du module
document.addEventListener('DOMContentLoaded', function() {
    ProjectRenderer.initialize();
});