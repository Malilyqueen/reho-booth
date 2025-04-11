/**
 * MODULE: events.js
 * 
 * Ce module centralise tous les écouteurs d'événements de l'application.
 * Il sert de point d'entrée unique pour toutes les interactions utilisateur,
 * garantissant cohérence et organisation dans la gestion des événements.
 * 
 * Fonctionnalités principales:
 * - Gestion des interactions utilisateur (clics, saisies, etc.)
 * - Délégation d'événements pour efficacité
 * - Centralisation des comportements interactifs
 * - Séparation claire entre événements et logique métier
 */

const EventsManager = (function() {
    // Configuration des sélecteurs DOM et classes CSS
    const DOM_SELECTORS = {
        // Sélecteurs généraux
        pageBody: 'body',
        mainContainer: '.container',
        
        // Projet
        projectForm: '#projectForm',
        projectName: '#projectName',
        projectDate: '#projectDate',
        projectEndDate: '#projectEndDate',
        totalBudget: '#totalBudget',
        
        // Structure budgétaire
        categoriesContainer: '#expenseCategories',
        categoryTemplateSelector: '#templateSelector',
        
        // Boutons d'action généraux
        saveButton: '#saveProjectButton',
        addCategoryButton: '#addCategoryButton',
        
        // Template selector
        templateOptions: '.template-option',
        accordion: '.accordion-item',
        accordionHeader: '.accordion-header',
        accordionContent: '.accordion-content',
        
        // Navigation
        navLinks: '.main-nav a',
        
        // Porte-monnaie
        walletLinkCheckbox: '#linkToWallet',
        
        // Wishlist
        wishlistLinkCheckbox: '#linkToWishlist'
    };
    
    const CSS_CLASSES = {
        // Classes d'état
        active: 'active',
        open: 'open',
        selected: 'selected',
        
        // Classes de structure budgétaire
        expenseCategory: 'expense-category',
        categoryHeader: 'category-header',
        categoryName: 'category-name',
        categoryAmount: 'category-amount',
        deleteCategoryBtn: 'delete-category-btn',
        
        subcategory: 'subcategory',
        subcategoryHeader: 'subcategory-header',
        subcategoryName: 'subcategory-name',
        subcategoryAmount: 'subcategory-amount',
        deleteSubcategoryBtn: 'delete-subcategory-btn',
        addSubcategoryBtn: 'add-subcategory-btn',
        
        expenseLine: 'expense-line',
        lineName: 'line-name',
        lineAmount: 'line-amount',
        deleteLine: 'delete-line',
        addLineBtn: 'add-line-btn'
    };
    
    // Événements personnalisés
    const CUSTOM_EVENTS = {
        projectSaved: 'mapocket.project.saved',
        projectLoaded: 'mapocket.project.loaded',
        templateChanged: 'mapocket.template.changed',
        budgetRecalculated: 'mapocket.budget.recalculated',
        categoryAdded: 'mapocket.category.added',
        categoryDeleted: 'mapocket.category.deleted',
        subcategoryAdded: 'mapocket.subcategory.added',
        subcategoryDeleted: 'mapocket.subcategory.deleted',
        lineAdded: 'mapocket.line.added',
        lineDeleted: 'mapocket.line.deleted'
    };
    
    // Liste des gestionnaires d'événements enregistrés pour nettoyage
    let _eventHandlers = [];
    
    /**
     * Initialise le gestionnaire d'événements
     */
    function initialize() {
        console.log('Initialisation du gestionnaire d\'événements...');
        
        // Supprimer tous les écouteurs existants (utile en cas de réinitialisation)
        _removeAllEventListeners();
        
        // Attacher les écouteurs d'événements principaux
        _attachMainEventListeners();
        
        console.log('✅ Gestionnaire d\'événements initialisé avec succès');
        return {
            success: true,
            message: 'Gestionnaire d\'événements initialisé avec succès'
        };
    }
    
    /**
     * Enregistre un écouteur d'événement personnalisé
     * @param {string} eventName Nom de l'événement personnalisé
     * @param {Function} callback Fonction à exécuter
     */
    function onCustomEvent(eventName, callback) {
        if (typeof callback !== 'function') {
            console.error('❌ Le callback doit être une fonction');
            return;
        }
        
        document.addEventListener(eventName, callback);
        
        // Enregistrer pour nettoyage ultérieur
        _eventHandlers.push({
            element: document,
            event: eventName,
            callback: callback
        });
    }
    
    /**
     * Déclenche un événement personnalisé
     * @param {string} eventName Nom de l'événement personnalisé
     * @param {Object} detail Détails de l'événement
     */
    function triggerCustomEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: detail,
            bubbles: true
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * Ajoute un écouteur d'événement avec délégation
     * @param {HTMLElement|string} elementOrSelector Élément ou sélecteur CSS
     * @param {string} eventType Type d'événement (click, input, etc.)
     * @param {string} childSelector Sélecteur CSS des enfants à cibler
     * @param {Function} callback Fonction à exécuter
     */
    function addDelegatedEventListener(elementOrSelector, eventType, childSelector, callback) {
        const element = typeof elementOrSelector === 'string' ? 
            document.querySelector(elementOrSelector) : elementOrSelector;
            
        if (!element) {
            console.error(`❌ Élément non trouvé: ${elementOrSelector}`);
            return;
        }
        
        const eventHandler = function(event) {
            const targetElement = event.target.closest(childSelector);
            
            if (targetElement && element.contains(targetElement)) {
                callback.call(targetElement, event);
            }
        };
        
        element.addEventListener(eventType, eventHandler);
        
        // Enregistrer pour nettoyage ultérieur
        _eventHandlers.push({
            element: element,
            event: eventType,
            callback: eventHandler
        });
    }
    
    /**
     * Ajoute un écouteur d'événement simple
     * @param {HTMLElement|string} elementOrSelector Élément ou sélecteur CSS
     * @param {string} eventType Type d'événement (click, input, etc.)
     * @param {Function} callback Fonction à exécuter
     */
    function addEventListener(elementOrSelector, eventType, callback) {
        const element = typeof elementOrSelector === 'string' ? 
            document.querySelector(elementOrSelector) : elementOrSelector;
            
        if (!element) {
            console.warn(`⚠️ Élément non trouvé: ${elementOrSelector}`);
            return;
        }
        
        element.addEventListener(eventType, callback);
        
        // Enregistrer pour nettoyage ultérieur
        _eventHandlers.push({
            element: element,
            event: eventType,
            callback: callback
        });
    }
    
    /**
     * Supprime un écouteur d'événement
     * @param {HTMLElement|string} elementOrSelector Élément ou sélecteur CSS
     * @param {string} eventType Type d'événement (click, input, etc.)
     * @param {Function} callback Fonction à supprimer
     */
    function removeEventListener(elementOrSelector, eventType, callback) {
        const element = typeof elementOrSelector === 'string' ? 
            document.querySelector(elementOrSelector) : elementOrSelector;
            
        if (!element) {
            console.warn(`⚠️ Élément non trouvé: ${elementOrSelector}`);
            return;
        }
        
        element.removeEventListener(eventType, callback);
        
        // Mettre à jour la liste des gestionnaires
        _eventHandlers = _eventHandlers.filter(handler => 
            !(handler.element === element && 
              handler.event === eventType && 
              handler.callback === callback)
        );
    }
    
    /**
     * Méthode privée pour attacher les écouteurs d'événements principaux
     * @private
     */
    function _attachMainEventListeners() {
        // === ÉCOUTEURS GÉNÉRAUX ===
        
        // 1. Évènements de formulaire
        addEventListener(DOM_SELECTORS.projectForm, 'submit', function(event) {
            event.preventDefault();
            _handleFormSubmit(event);
        });
        
        // 2. Bouton de sauvegarde
        const saveBtn = document.querySelector(DOM_SELECTORS.saveButton);
        if (saveBtn) {
            addEventListener(saveBtn, 'click', function(event) {
                _handleSaveProject(event);
            });
        }
        
        // 3. Sélection de template
        addDelegatedEventListener(document, 'click', DOM_SELECTORS.templateOptions, function(event) {
            _handleTemplateSelection(event, this);
        });
        
        // 4. Accordéon des catégories
        addDelegatedEventListener(document, 'click', DOM_SELECTORS.accordionHeader, function(event) {
            _handleAccordionToggle(event, this);
        });
        
        // === ÉCOUTEURS POUR LA STRUCTURE BUDGÉTAIRE ===
        
        // 1. Ajout de catégorie
        const addCategoryBtn = document.querySelector(DOM_SELECTORS.addCategoryButton);
        if (addCategoryBtn) {
            addEventListener(addCategoryBtn, 'click', function(event) {
                _handleAddCategory(event);
            });
        }
        
        // 2. Suppression de catégorie (délégation)
        const categoriesContainer = document.querySelector(DOM_SELECTORS.categoriesContainer);
        if (categoriesContainer) {
            addDelegatedEventListener(categoriesContainer, 'click', '.' + CSS_CLASSES.deleteCategoryBtn, function(event) {
                _handleDeleteCategory(event, this);
            });
        }
        
        // 3. Ajout de sous-catégorie (délégation)
        if (categoriesContainer) {
            addDelegatedEventListener(categoriesContainer, 'click', '.' + CSS_CLASSES.addSubcategoryBtn, function(event) {
                _handleAddSubcategory(event, this);
            });
        }
        
        // 4. Suppression de sous-catégorie (délégation)
        if (categoriesContainer) {
            addDelegatedEventListener(categoriesContainer, 'click', '.' + CSS_CLASSES.deleteSubcategoryBtn, function(event) {
                _handleDeleteSubcategory(event, this);
            });
        }
        
        // 5. Ajout de ligne (délégation)
        if (categoriesContainer) {
            addDelegatedEventListener(categoriesContainer, 'click', '.' + CSS_CLASSES.addLineBtn, function(event) {
                _handleAddLine(event, this);
            });
        }
        
        // 6. Suppression de ligne (délégation)
        if (categoriesContainer) {
            addDelegatedEventListener(categoriesContainer, 'click', '.' + CSS_CLASSES.deleteLine, function(event) {
                _handleDeleteLine(event, this);
            });
        }
        
        // === ÉCOUTEURS POUR LES CHAMPS DE SAISIE ===
        
        // 1. Montants des lignes (délégation)
        if (categoriesContainer) {
            addDelegatedEventListener(categoriesContainer, 'input', '.' + CSS_CLASSES.lineAmount, function(event) {
                _handleLineAmountChange(event, this);
            });
            
            addDelegatedEventListener(categoriesContainer, 'blur', '.' + CSS_CLASSES.lineAmount, function(event) {
                _handleLineAmountChange(event, this);
            });
        }
        
        // 2. Noms des lignes (délégation)
        if (categoriesContainer) {
            addDelegatedEventListener(categoriesContainer, 'input', '.' + CSS_CLASSES.lineName, function(event) {
                _handleLineNameChange(event, this);
            });
            
            addDelegatedEventListener(categoriesContainer, 'blur', '.' + CSS_CLASSES.lineName, function(event) {
                _handleLineNameChange(event, this);
            });
        }
        
        // 3. Noms des catégories (délégation)
        if (categoriesContainer) {
            addDelegatedEventListener(categoriesContainer, 'input', '.' + CSS_CLASSES.categoryName, function(event) {
                _handleCategoryNameChange(event, this);
            });
            
            addDelegatedEventListener(categoriesContainer, 'blur', '.' + CSS_CLASSES.categoryName, function(event) {
                _handleCategoryNameChange(event, this);
            });
        }
        
        // 4. Noms des sous-catégories (délégation)
        if (categoriesContainer) {
            addDelegatedEventListener(categoriesContainer, 'input', '.' + CSS_CLASSES.subcategoryName, function(event) {
                _handleSubcategoryNameChange(event, this);
            });
            
            addDelegatedEventListener(categoriesContainer, 'blur', '.' + CSS_CLASSES.subcategoryName, function(event) {
                _handleSubcategoryNameChange(event, this);
            });
        }
        
        // === ÉCOUTEURS POUR LES FONCTIONNALITÉS COMPLÉMENTAIRES ===
        
        // 1. Lien porte-monnaie
        const walletCheckbox = document.querySelector(DOM_SELECTORS.walletLinkCheckbox);
        if (walletCheckbox) {
            addEventListener(walletCheckbox, 'change', function(event) {
                _handleWalletLinkChange(event, this);
            });
        }
        
        // 2. Lien wishlist
        const wishlistCheckbox = document.querySelector(DOM_SELECTORS.wishlistLinkCheckbox);
        if (wishlistCheckbox) {
            addEventListener(wishlistCheckbox, 'change', function(event) {
                _handleWishlistLinkChange(event, this);
            });
        }
    }
    
    /**
     * Méthode privée pour supprimer tous les écouteurs d'événements
     * @private
     */
    function _removeAllEventListeners() {
        _eventHandlers.forEach(handler => {
            handler.element.removeEventListener(handler.event, handler.callback);
        });
        
        _eventHandlers = [];
    }
    
    /**
     * Méthode privée pour gérer la soumission du formulaire
     * @private
     * @param {Event} event Objet événement
     */
    function _handleFormSubmit(event) {
        event.preventDefault();
        _handleSaveProject(event);
    }
    
    /**
     * Méthode privée pour gérer la sauvegarde du projet
     * @private
     * @param {Event} event Objet événement
     */
    function _handleSaveProject(event) {
        console.log('💾 Sauvegarde du projet en cours...');
        
        try {
            // Utiliser FormManager si disponible
            if (window.FormManager) {
                // FormManager possède déjà la logique de sauvegarde
                triggerCustomEvent(CUSTOM_EVENTS.projectSaved, {
                    timestamp: new Date().toISOString()
                });
            } else if (typeof saveProject === 'function') {
                // Fallback: fonction globale
                saveProject();
                
                triggerCustomEvent(CUSTOM_EVENTS.projectSaved, {
                    timestamp: new Date().toISOString()
                });
            } else {
                console.error('❌ Aucune fonction de sauvegarde disponible');
            }
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde du projet:', error);
        }
    }
    
    /**
     * Méthode privée pour gérer la sélection de template
     * @private
     * @param {Event} event Objet événement
     * @param {HTMLElement} templateOption Élément option de template
     */
    function _handleTemplateSelection(event, templateOption) {
        console.log('🔄 Sélection de template:', templateOption.dataset.template);
        
        // Marquer cette option comme sélectionnée
        const allOptions = document.querySelectorAll(DOM_SELECTORS.templateOptions);
        allOptions.forEach(option => {
            option.classList.remove(CSS_CLASSES.selected);
        });
        templateOption.classList.add(CSS_CLASSES.selected);
        
        // Récupérer le type de template
        const template = templateOption.dataset.template;
        
        try {
            // Utiliser TemplateLoader si disponible
            if (window.TemplateLoader && typeof TemplateLoader.loadTemplate === 'function') {
                TemplateLoader.loadTemplate(template);
            } else if (typeof updateTemplateCategoriesUI === 'function') {
                // Fallback: fonction existante
                updateTemplateCategoriesUI(template);
            } else {
                console.warn('⚠️ Aucune fonction de chargement de template disponible');
            }
            
            // Mettre à jour le champ de sélection de template
            const templateSelector = document.querySelector(DOM_SELECTORS.categoryTemplateSelector);
            if (templateSelector) {
                templateSelector.value = template;
            }
            
            // Déclencher l'événement personnalisé
            triggerCustomEvent(CUSTOM_EVENTS.templateChanged, {
                template: template,
                element: templateOption
            });
        } catch (error) {
            console.error('❌ Erreur lors du chargement du template:', error);
        }
    }
    
    /**
     * Méthode privée pour gérer le toggle d'un accordéon
     * @private
     * @param {Event} event Objet événement
     * @param {HTMLElement} header En-tête de l'accordéon
     */
    function _handleAccordionToggle(event, header) {
        // Trouver l'élément accordéon parent
        const accordionItem = header.closest(DOM_SELECTORS.accordion);
        
        if (!accordionItem) {
            return;
        }
        
        // Toggle l'état
        const isOpen = accordionItem.classList.contains(CSS_CLASSES.open);
        
        // Fermer tous les accordéons
        document.querySelectorAll(DOM_SELECTORS.accordion).forEach(item => {
            item.classList.remove(CSS_CLASSES.open);
        });
        
        // Ouvrir celui-ci si ce n'était pas déjà ouvert
        if (!isOpen) {
            accordionItem.classList.add(CSS_CLASSES.open);
        }
    }
    
    /**
     * Méthode privée pour gérer l'ajout d'une catégorie
     * @private
     * @param {Event} event Objet événement
     */
    function _handleAddCategory(event) {
        console.log('➕ Ajout d\'une nouvelle catégorie');
        
        try {
            // Utiliser FormManager si disponible
            if (window.FormManager && typeof FormManager.createCategory === 'function') {
                const categoryElement = FormManager.createCategory();
                
                if (categoryElement) {
                    triggerCustomEvent(CUSTOM_EVENTS.categoryAdded, {
                        element: categoryElement
                    });
                }
            } else {
                console.warn('⚠️ FormManager non disponible pour l\'ajout de catégorie');
            }
        } catch (error) {
            console.error('❌ Erreur lors de l\'ajout de catégorie:', error);
        }
    }
    
    /**
     * Méthode privée pour gérer la suppression d'une catégorie
     * @private
     * @param {Event} event Objet événement
     * @param {HTMLElement} deleteButton Bouton de suppression
     */
    function _handleDeleteCategory(event, deleteButton) {
        // Trouver la catégorie parente
        const categoryElement = deleteButton.closest('.' + CSS_CLASSES.expenseCategory);
        
        if (!categoryElement) {
            return;
        }
        
        console.log('🗑️ Suppression d\'une catégorie');
        
        try {
            // Utiliser FormManager si disponible
            if (window.FormManager && typeof FormManager.deleteCategory === 'function') {
                const success = FormManager.deleteCategory(categoryElement);
                
                if (success) {
                    triggerCustomEvent(CUSTOM_EVENTS.categoryDeleted, {
                        element: categoryElement
                    });
                }
            } else {
                // Fallback: suppression directe après confirmation
                const categoryName = categoryElement.querySelector('.' + CSS_CLASSES.categoryName)?.textContent || 'cette catégorie';
                
                if (confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" ?`)) {
                    categoryElement.remove();
                    
                    // Recalculer si possible
                    if (typeof recalculateAllAmounts === 'function') {
                        setTimeout(recalculateAllAmounts, 0);
                    }
                    
                    triggerCustomEvent(CUSTOM_EVENTS.categoryDeleted, {
                        element: categoryElement
                    });
                }
            }
        } catch (error) {
            console.error('❌ Erreur lors de la suppression de catégorie:', error);
        }
    }
    
    /**
     * Méthode privée pour gérer l'ajout d'une sous-catégorie
     * @private
     * @param {Event} event Objet événement
     * @param {HTMLElement} addButton Bouton d'ajout
     */
    function _handleAddSubcategory(event, addButton) {
        // Trouver la catégorie parente
        const categoryElement = addButton.closest('.' + CSS_CLASSES.expenseCategory);
        
        if (!categoryElement) {
            return;
        }
        
        console.log('➕ Ajout d\'une nouvelle sous-catégorie');
        
        try {
            // Utiliser FormManager si disponible
            if (window.FormManager && typeof FormManager.createSubcategory === 'function') {
                const subcategoryElement = FormManager.createSubcategory(categoryElement);
                
                if (subcategoryElement) {
                    triggerCustomEvent(CUSTOM_EVENTS.subcategoryAdded, {
                        element: subcategoryElement,
                        parent: categoryElement
                    });
                }
            } else {
                console.warn('⚠️ FormManager non disponible pour l\'ajout de sous-catégorie');
            }
        } catch (error) {
            console.error('❌ Erreur lors de l\'ajout de sous-catégorie:', error);
        }
    }
    
    /**
     * Méthode privée pour gérer la suppression d'une sous-catégorie
     * @private
     * @param {Event} event Objet événement
     * @param {HTMLElement} deleteButton Bouton de suppression
     */
    function _handleDeleteSubcategory(event, deleteButton) {
        // Trouver la sous-catégorie parente
        const subcategoryElement = deleteButton.closest('.' + CSS_CLASSES.subcategory);
        
        if (!subcategoryElement) {
            return;
        }
        
        console.log('🗑️ Suppression d\'une sous-catégorie');
        
        try {
            // Utiliser FormManager si disponible
            if (window.FormManager && typeof FormManager.deleteSubcategory === 'function') {
                const success = FormManager.deleteSubcategory(subcategoryElement);
                
                if (success) {
                    triggerCustomEvent(CUSTOM_EVENTS.subcategoryDeleted, {
                        element: subcategoryElement
                    });
                }
            } else {
                // Fallback: suppression directe après confirmation
                const subcategoryName = subcategoryElement.querySelector('.' + CSS_CLASSES.subcategoryName)?.textContent || 'cette sous-catégorie';
                
                if (confirm(`Êtes-vous sûr de vouloir supprimer la sous-catégorie "${subcategoryName}" ?`)) {
                    subcategoryElement.remove();
                    
                    // Recalculer si possible
                    if (typeof recalculateAllAmounts === 'function') {
                        setTimeout(recalculateAllAmounts, 0);
                    }
                    
                    triggerCustomEvent(CUSTOM_EVENTS.subcategoryDeleted, {
                        element: subcategoryElement
                    });
                }
            }
        } catch (error) {
            console.error('❌ Erreur lors de la suppression de sous-catégorie:', error);
        }
    }
    
    /**
     * Méthode privée pour gérer l'ajout d'une ligne
     * @private
     * @param {Event} event Objet événement
     * @param {HTMLElement} addButton Bouton d'ajout
     */
    function _handleAddLine(event, addButton) {
        // Trouver la sous-catégorie parente
        const subcategoryElement = addButton.closest('.' + CSS_CLASSES.subcategory);
        
        if (!subcategoryElement) {
            return;
        }
        
        console.log('➕ Ajout d\'une nouvelle ligne');
        
        try {
            // Utiliser FormManager si disponible
            if (window.FormManager && typeof FormManager.createLine === 'function') {
                const lineElement = FormManager.createLine(subcategoryElement);
                
                if (lineElement) {
                    triggerCustomEvent(CUSTOM_EVENTS.lineAdded, {
                        element: lineElement,
                        parent: subcategoryElement
                    });
                }
            } else {
                console.warn('⚠️ FormManager non disponible pour l\'ajout de ligne');
            }
        } catch (error) {
            console.error('❌ Erreur lors de l\'ajout de ligne:', error);
        }
    }
    
    /**
     * Méthode privée pour gérer la suppression d'une ligne
     * @private
     * @param {Event} event Objet événement
     * @param {HTMLElement} deleteButton Bouton de suppression
     */
    function _handleDeleteLine(event, deleteButton) {
        // Trouver la ligne parente
        const lineElement = deleteButton.closest('.' + CSS_CLASSES.expenseLine);
        
        if (!lineElement) {
            return;
        }
        
        console.log('🗑️ Suppression d\'une ligne');
        
        try {
            // Utiliser FormManager si disponible
            if (window.FormManager && typeof FormManager.deleteLine === 'function') {
                const success = FormManager.deleteLine(lineElement);
                
                if (success) {
                    triggerCustomEvent(CUSTOM_EVENTS.lineDeleted, {
                        element: lineElement
                    });
                }
            } else {
                // Fallback: suppression directe
                const lineName = lineElement.querySelector('.' + CSS_CLASSES.lineName)?.value || 'cette ligne';
                lineElement.remove();
                
                // Recalculer si possible
                if (typeof recalculateAllAmounts === 'function') {
                    setTimeout(recalculateAllAmounts, 0);
                }
                
                triggerCustomEvent(CUSTOM_EVENTS.lineDeleted, {
                    element: lineElement
                });
            }
        } catch (error) {
            console.error('❌ Erreur lors de la suppression de ligne:', error);
        }
    }
    
    /**
     * Méthode privée pour gérer le changement du montant d'une ligne
     * @private
     * @param {Event} event Objet événement
     * @param {HTMLElement} amountInput Input de montant
     */
    function _handleLineAmountChange(event, amountInput) {
        // Déclencher le recalcul
        if (window.BudgetCalculator && typeof BudgetCalculator.recalculateAllAmounts === 'function') {
            setTimeout(BudgetCalculator.recalculateAllAmounts, 0);
        } else if (typeof recalculateAllAmounts === 'function') {
            setTimeout(recalculateAllAmounts, 0);
        }
    }
    
    /**
     * Méthode privée pour gérer le changement du nom d'une ligne
     * @private
     * @param {Event} event Objet événement
     * @param {HTMLElement} nameInput Input de nom
     */
    function _handleLineNameChange(event, nameInput) {
        // Aucune action spécifique nécessaire pour l'instant
    }
    
    /**
     * Méthode privée pour gérer le changement du nom d'une catégorie
     * @private
     * @param {Event} event Objet événement
     * @param {HTMLElement} nameElement Élément de nom
     */
    function _handleCategoryNameChange(event, nameElement) {
        // Aucune action spécifique nécessaire pour l'instant
    }
    
    /**
     * Méthode privée pour gérer le changement du nom d'une sous-catégorie
     * @private
     * @param {Event} event Objet événement
     * @param {HTMLElement} nameElement Élément de nom
     */
    function _handleSubcategoryNameChange(event, nameElement) {
        // Aucune action spécifique nécessaire pour l'instant
    }
    
    /**
     * Méthode privée pour gérer le changement du lien avec le porte-monnaie
     * @private
     * @param {Event} event Objet événement
     * @param {HTMLElement} checkbox Case à cocher
     */
    function _handleWalletLinkChange(event, checkbox) {
        console.log(`${checkbox.checked ? '🔗' : '🔓'} Lien avec le porte-monnaie ${checkbox.checked ? 'activé' : 'désactivé'}`);
        
        // D'autres actions spécifiques pourraient être ajoutées ici
    }
    
    /**
     * Méthode privée pour gérer le changement du lien avec la wishlist
     * @private
     * @param {Event} event Objet événement
     * @param {HTMLElement} checkbox Case à cocher
     */
    function _handleWishlistLinkChange(event, checkbox) {
        console.log(`${checkbox.checked ? '🔗' : '🔓'} Lien avec la wishlist ${checkbox.checked ? 'activé' : 'désactivé'}`);
        
        // Afficher/masquer les éléments liés à la wishlist
        const wishlistElements = document.querySelectorAll('.wishlist-integration-container');
        wishlistElements.forEach(element => {
            element.style.display = checkbox.checked ? 'block' : 'none';
        });
    }
    
    // Exposer l'API publique
    return {
        initialize,
        onCustomEvent,
        triggerCustomEvent,
        addDelegatedEventListener,
        addEventListener,
        removeEventListener,
        CUSTOM_EVENTS
    };
})();

// Auto-initialisation du module
document.addEventListener('DOMContentLoaded', function() {
    EventsManager.initialize();
});