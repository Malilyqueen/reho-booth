/**
 * Gestionnaire centralisé pour les projets MaPocket
 * Ce script gère tout le cycle de vie d'un projet : chargement, rendu, calcul, sauvegarde
 */

(function() {
    // Constantes et variables globales du module
    const MODULE_NAME = 'ProjectManager';
    const DEBUG = true;
    
    // Initialisation au chargement du DOM
    document.addEventListener('DOMContentLoaded', initialize);
    
    /**
     * Initialise le gestionnaire de projets
     */
    function initialize() {
        log('Initialisation du gestionnaire de projets');
        
        // Vérifier si nous sommes sur une page d'édition de projet
        const urlParams = new URLSearchParams(window.location.search);
        const editMode = urlParams.get('edit');
        const projectId = urlParams.get('id');
        
        if (editMode === 'true' && projectId) {
            log(`Mode édition détecté pour le projet ID: ${projectId}`);
            
            // Attendre que le DOM soit complètement chargé
            window.addEventListener('load', function() {
                // Utiliser requestAnimationFrame pour s'assurer que le DOM est prêt
                requestAnimationFrame(function() {
                    loadAndRenderProject(projectId);
                });
            });
            
            // Configurer l'observateur pour les modifications
            setupMutationObserver();
        } else {
            log('Pas en mode édition ou ID projet manquant');
        }
    }
    
    /**
     * Charge et affiche un projet complet
     * @param {string} projectId - L'ID du projet à charger
     */
    function loadAndRenderProject(projectId) {
        log(`Chargement et rendu du projet ID: ${projectId}`);
        
        // Récupérer les données du projet
        const project = getProjectFromStorage(projectId);
        if (!project) {
            log('Projet introuvable dans le stockage local', 'error');
            return;
        }
        
        log(`Projet trouvé: ${project.projectName}`);
        
        // Injecter les données dans le DOM
        renderProject(project, function() {
            // Callback appelé une fois le rendu terminé
            log('Rendu du projet terminé, démarrage du calcul des montants');
            
            // Exécuter dans le prochain cycle pour s'assurer que le DOM est à jour
            setTimeout(function() {
                recalculateAllAmounts();
                
                // Attacher les écouteurs d'événements après l'initialisation
                attachEventListeners();
                
                log('Initialisation complète du projet');
            }, 0);
        });
    }
    
    /**
     * Récupère un projet depuis le stockage local
     * @param {string} projectId - L'ID du projet à récupérer
     * @returns {Object|null} Le projet ou null s'il n'est pas trouvé
     */
    function getProjectFromStorage(projectId) {
        // Essayer les deux clés de stockage possible
        let projects = JSON.parse(localStorage.getItem('mapocket_projects') || '[]');
        if (projects.length === 0) {
            projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        }
        
        // Rechercher le projet par ID
        return projects.find(p => p.id === projectId) || null;
    }
    
    /**
     * Rend un projet dans l'interface
     * @param {Object} project - Les données du projet
     * @param {Function} callback - Fonction à appeler une fois le rendu terminé
     */
    function renderProject(project, callback) {
        log(`Rendu du projet: ${project.projectName}`);
        
        // Vérifier que les éléments principaux existent
        if (!document.getElementById('categoriesContainer')) {
            log('Conteneur de catégories non trouvé', 'error');
            return;
        }
        
        // Remplir le budget total
        const totalBudgetElement = document.getElementById('totalBudget');
        if (totalBudgetElement && project.totalBudget) {
            log(`Définition du budget total: ${project.totalBudget}`);
            totalBudgetElement.textContent = project.totalBudget;
        }
        
        // Remplir les catégories
        if (project.categories && project.categories.length > 0) {
            fillCategories(project.categories, function() {
                // Appeler le callback une fois le remplissage terminé
                if (typeof callback === 'function') {
                    callback();
                }
            });
        } else {
            log('Pas de catégories trouvées dans le projet', 'warn');
            if (typeof callback === 'function') {
                callback();
            }
        }
    }
    
    /**
     * Remplit les catégories dans l'interface
     * @param {Array} categories - Tableau des catégories
     * @param {Function} callback - Fonction à appeler une fois terminé
     */
    function fillCategories(categories, callback) {
        log(`Remplissage de ${categories.length} catégories`);
        
        // Vérifier si les éléments DOM existent
        const categoryElements = document.querySelectorAll('.expense-category');
        if (categoryElements.length === 0) {
            log('Aucun élément de catégorie trouvé dans le DOM', 'error');
            if (typeof callback === 'function') callback();
            return;
        }
        
        // Traitement de chaque catégorie
        categories.forEach(function(category, index) {
            if (index >= categoryElements.length) {
                log(`Pas assez d'éléments de catégorie dans le DOM (tentative d'accéder à l'index ${index})`, 'warn');
                return;
            }
            
            const categoryElement = categoryElements[index];
            
            // Remplir le nom et le montant
            const nameElement = categoryElement.querySelector('.category-name');
            const amountElement = categoryElement.querySelector('.category-amount');
            
            if (nameElement) {
                nameElement.textContent = category.name;
            }
            
            if (amountElement) {
                amountElement.textContent = category.amount;
            }
            
            // Remplir les sous-catégories si elles existent
            if (category.subcategories && category.subcategories.length > 0) {
                fillSubcategories(categoryElement, category.subcategories);
            }
        });
        
        if (typeof callback === 'function') {
            callback();
        }
    }
    
    /**
     * Remplit les sous-catégories d'une catégorie
     * @param {Element} categoryElement - L'élément DOM de la catégorie
     * @param {Array} subcategories - Tableau des sous-catégories
     */
    function fillSubcategories(categoryElement, subcategories) {
        const container = categoryElement.querySelector('.subcategories-container');
        if (!container) {
            log('Conteneur de sous-catégories non trouvé', 'warn');
            return;
        }
        
        const subcategoryElements = container.querySelectorAll('.subcategory');
        if (subcategoryElements.length === 0) {
            log('Aucun élément de sous-catégorie trouvé', 'warn');
            return;
        }
        
        // Traitement de chaque sous-catégorie
        subcategories.forEach(function(subcategory, index) {
            if (index >= subcategoryElements.length) {
                log(`Pas assez d'éléments de sous-catégorie (tentative d'accéder à l'index ${index})`, 'warn');
                return;
            }
            
            const subcategoryElement = subcategoryElements[index];
            
            // Remplir le nom et le montant
            const nameElement = subcategoryElement.querySelector('.subcategory-name');
            const amountElement = subcategoryElement.querySelector('.subcategory-amount');
            
            if (nameElement) {
                nameElement.textContent = subcategory.name;
            }
            
            if (amountElement) {
                amountElement.textContent = subcategory.amount;
            }
            
            // Remplir les lignes si elles existent
            if (subcategory.lines && subcategory.lines.length > 0) {
                fillLines(subcategoryElement, subcategory.lines);
            }
        });
    }
    
    /**
     * Remplit les lignes d'une sous-catégorie
     * @param {Element} subcategoryElement - L'élément DOM de la sous-catégorie
     * @param {Array} lines - Tableau des lignes
     */
    function fillLines(subcategoryElement, lines) {
        const container = subcategoryElement.querySelector('.lines-container');
        if (!container) {
            log('Conteneur de lignes non trouvé', 'warn');
            return;
        }
        
        const lineElements = container.querySelectorAll('.expense-line');
        if (lineElements.length === 0) {
            log('Aucun élément de ligne trouvé', 'warn');
            return;
        }
        
        // Traitement de chaque ligne
        lines.forEach(function(line, index) {
            if (index >= lineElements.length) {
                log(`Pas assez d'éléments de ligne (tentative d'accéder à l'index ${index})`, 'warn');
                return;
            }
            
            const lineElement = lineElements[index];
            
            // Remplir le nom et le montant
            const nameElement = lineElement.querySelector('.line-name');
            const amountElement = lineElement.querySelector('.line-amount');
            
            if (nameElement) {
                nameElement.textContent = line.name;
            }
            
            if (amountElement) {
                amountElement.textContent = line.amount;
            }
        });
    }
    
    /**
     * Recalcule tous les montants du projet
     */
    function recalculateAllAmounts() {
        log('Recalcul de tous les montants du projet');
        
        // Analyser les éléments actuels
        const categoryAmounts = document.querySelectorAll('.category-amount');
        const subcategoryAmounts = document.querySelectorAll('.subcategory-amount');
        const lineAmounts = document.querySelectorAll('.line-amount');
        
        log(`Éléments trouvés: ${categoryAmounts.length} catégories, ${subcategoryAmounts.length} sous-catégories, ${lineAmounts.length} lignes`);
        
        // Calcul de bas en haut: d'abord les sous-catégories, puis les catégories
        document.querySelectorAll('.subcategory').forEach(function(subcategory) {
            calculateSubcategoryTotal(subcategory);
        });
        
        document.querySelectorAll('.expense-category').forEach(function(category) {
            calculateCategoryTotal(category);
        });
        
        // Recalculer le budget total si nécessaire
        calculateTotalBudget();
        
        log('Recalcul des montants terminé');
    }
    
    /**
     * Calcule le montant total d'une sous-catégorie
     * @param {Element} subcategory - L'élément DOM de la sous-catégorie
     */
    function calculateSubcategoryTotal(subcategory) {
        const lines = subcategory.querySelectorAll('.expense-line');
        const amountElement = subcategory.querySelector('.subcategory-amount');
        if (!amountElement) return;
        
        const subcategoryName = subcategory.querySelector('.subcategory-name')?.textContent || 'Sous-catégorie';
        
        // Si pas de lignes, conserver le montant manuel existant
        if (lines.length === 0) {
            log(`Sous-catégorie "${subcategoryName}": pas de lignes, conservation du montant manuel`);
            return;
        }
        
        // Calculer le total des lignes
        let total = 0;
        lines.forEach(function(line) {
            const lineAmount = line.querySelector('.line-amount');
            if (lineAmount) {
                total += getAmountFromElement(lineAmount);
            }
        });
        
        // Mettre à jour le montant de la sous-catégorie
        if (total > 0) {
            amountElement.textContent = formatCurrency(total);
            log(`Sous-catégorie "${subcategoryName}": total calculé = ${total}`);
        }
    }
    
    /**
     * Calcule le montant total d'une catégorie
     * @param {Element} category - L'élément DOM de la catégorie
     */
    function calculateCategoryTotal(category) {
        const subcategories = category.querySelectorAll('.subcategory');
        const amountElement = category.querySelector('.category-amount');
        if (!amountElement) return;
        
        const categoryName = category.querySelector('.category-name')?.textContent || 'Catégorie';
        
        // Si pas de sous-catégories, conserver le montant manuel existant
        if (subcategories.length === 0) {
            log(`Catégorie "${categoryName}": pas de sous-catégories, conservation du montant manuel`);
            return;
        }
        
        // Calculer le total des sous-catégories
        let total = 0;
        subcategories.forEach(function(subcategory) {
            const subcategoryAmount = subcategory.querySelector('.subcategory-amount');
            if (subcategoryAmount) {
                total += getAmountFromElement(subcategoryAmount);
            }
        });
        
        // Mettre à jour le montant de la catégorie
        if (total > 0) {
            amountElement.textContent = formatCurrency(total);
            log(`Catégorie "${categoryName}": total calculé = ${total}`);
        }
    }
    
    /**
     * Calcule le budget total du projet
     */
    function calculateTotalBudget() {
        const totalBudgetElement = document.getElementById('totalBudget');
        if (!totalBudgetElement) return;
        
        // Calculer la somme de toutes les catégories
        let total = 0;
        document.querySelectorAll('.category-amount').forEach(function(categoryAmount) {
            total += getAmountFromElement(categoryAmount);
        });
        
        // Ne mettre à jour que si le montant est supérieur à zéro
        if (total > 0) {
            totalBudgetElement.textContent = formatCurrency(total);
            log(`Budget total recalculé: ${total}`);
        }
    }
    
    /**
     * Obtient la valeur numérique d'un élément, qu'il s'agisse d'un input ou d'un texte
     * @param {Element} element - L'élément DOM contenant le montant
     * @returns {number} La valeur numérique
     */
    function getAmountFromElement(element) {
        if (!element) return 0;
        
        if (element.tagName === 'INPUT') {
            return parseFloat(element.value) || 0;
        }
        
        return extractNumberFromString(element.textContent);
    }
    
    /**
     * Extrait un nombre d'une chaîne de caractères
     * @param {string} str - La chaîne à parser
     * @returns {number} Le nombre extrait
     */
    function extractNumberFromString(str) {
        if (!str) return 0;
        
        // Supprimer tout sauf les chiffres, points et virgules
        const cleaned = str.replace(/[^\d.,]/g, '').replace(',', '.');
        
        // Convertir en nombre
        const value = parseFloat(cleaned);
        return isNaN(value) ? 0 : value;
    }
    
    /**
     * Formate un nombre en devise
     * @param {number} amount - Le montant à formater
     * @returns {string} La chaîne formatée
     */
    function formatCurrency(amount) {
        // 1. Préserver la devise du budget total
        const totalBudgetElement = document.getElementById('totalBudget');
        if (totalBudgetElement) {
            const totalBudgetText = totalBudgetElement.textContent || '';
            // Extraire le symbole de devise du texte
            const currencyMatch = totalBudgetText.match(/^([^\d]+)/);
            if (currencyMatch && currencyMatch[1]) {
                const symbol = currencyMatch[1].trim();
                return `${symbol} ${amount.toFixed(2).replace('.', ',')}`;
            }
        }
        
        // 2. Utiliser la fonction de l'application pour la devise
        if (typeof getCurrencySymbol === 'function') {
            const symbol = getCurrencySymbol();
            return `${symbol} ${amount.toFixed(2).replace('.', ',')}`;
        }
        
        // 3. Utiliser les préférences utilisateur
        if (window.userPreferences && window.userPreferences.currency) {
            let symbol = "AED";
            
            switch (window.userPreferences.currency) {
                case "EUR": symbol = "€"; break;
                case "USD": symbol = "$"; break;
                case "MAD": symbol = "DH"; break;
                case "AED": symbol = "AED"; break;
            }
            
            return `${symbol} ${amount.toFixed(2).replace('.', ',')}`;
        }
        
        // 4. Conserver AED par défaut
        return `AED ${amount.toFixed(2).replace('.', ',')}`;
    }
    
    /**
     * Configure l'observateur de mutations pour le DOM
     */
    function setupMutationObserver() {
        const categoriesContainer = document.getElementById('categoriesContainer');
        if (!categoriesContainer) {
            log('Conteneur de catégories non trouvé pour l\'observateur', 'warn');
            return;
        }
        
        const observer = new MutationObserver(function(mutations) {
            let shouldRecalculate = false;
            
            mutations.forEach(function(mutation) {
                // Vérifier si des nœuds ont été ajoutés ou supprimés
                if (mutation.type === 'childList' && 
                   (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
                    shouldRecalculate = true;
                }
                // Vérifier si des attributs ont été modifiés
                else if (mutation.type === 'attributes' && 
                        (mutation.target.classList.contains('category-amount') || 
                         mutation.target.classList.contains('subcategory-amount') || 
                         mutation.target.classList.contains('line-amount'))) {
                    shouldRecalculate = true;
                }
                // Vérifier si le contenu d'un élément a été modifié
                else if (mutation.type === 'characterData' && 
                        mutation.target.parentNode && 
                        (mutation.target.parentNode.classList.contains('category-amount') || 
                         mutation.target.parentNode.classList.contains('subcategory-amount') || 
                         mutation.target.parentNode.classList.contains('line-amount'))) {
                    shouldRecalculate = true;
                }
            });
            
            if (shouldRecalculate) {
                log('Modification du DOM détectée, recalcul des montants');
                // Utiliser requestAnimationFrame pour s'assurer que le DOM est mis à jour
                requestAnimationFrame(recalculateAllAmounts);
            }
        });
        
        observer.observe(categoriesContainer, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
        });
        
        log('Observateur de mutations configuré');
    }
    
    /**
     * Attache les écouteurs d'événements aux éléments du projet
     */
    function attachEventListeners() {
        log('Attachement des écouteurs d\'événements');
        
        // Écouteurs pour les montants des lignes
        document.querySelectorAll('.line-amount').forEach(function(element) {
            element.removeEventListener('input', handleAmountChange);
            element.removeEventListener('blur', handleAmountChange);
            element.addEventListener('input', handleAmountChange);
            element.addEventListener('blur', handleAmountChange);
        });
        
        // Écouteurs pour les montants des sous-catégories
        document.querySelectorAll('.subcategory-amount').forEach(function(element) {
            element.removeEventListener('input', handleAmountChange);
            element.removeEventListener('blur', handleAmountChange);
            element.addEventListener('input', handleAmountChange);
            element.addEventListener('blur', handleAmountChange);
        });
        
        // Écouteurs pour les montants des catégories
        document.querySelectorAll('.category-amount').forEach(function(element) {
            element.removeEventListener('input', handleAmountChange);
            element.removeEventListener('blur', handleAmountChange);
            element.addEventListener('input', handleAmountChange);
            element.addEventListener('blur', handleAmountChange);
        });
        
        log('Écouteurs d\'événements attachés');
    }
    
    /**
     * Gère les changements de montant
     * @param {Event} event - L'événement déclencheur
     */
    function handleAmountChange(event) {
        log(`Changement détecté sur un montant: ${event.target.className}`);
        
        // Utiliser requestAnimationFrame pour s'assurer que le DOM est mis à jour
        requestAnimationFrame(recalculateAllAmounts);
    }
    
    /**
     * Utilitaire de journalisation
     * @param {string} message - Le message à journaliser
     * @param {string} [level='log'] - Le niveau de journalisation
     */
    function log(message, level = 'log') {
        if (!DEBUG) return;
        
        const prefix = `[${MODULE_NAME}]`;
        
        switch (level) {
            case 'error':
                console.error(`${prefix} ${message}`);
                break;
            case 'warn':
                console.warn(`${prefix} ${message}`);
                break;
            case 'info':
                console.info(`${prefix} ${message}`);
                break;
            default:
                console.log(`${prefix} ${message}`);
        }
    }
    
    // Exposer certaines fonctions à l'extérieur du module
    window.ProjectManager = {
        recalculateAllAmounts: recalculateAllAmounts,
        loadAndRenderProject: loadAndRenderProject
    };
    
})();