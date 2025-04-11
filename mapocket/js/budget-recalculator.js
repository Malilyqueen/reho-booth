/**
 * Solution complète pour calculer correctement les montants selon la structure hiérarchique des budgets
 * Créé pour résoudre les problèmes de calcul et maintenir la devise correcte (AED)
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation du recalculateur de budget...');

    // S'exécute après le chargement complet de la page
    window.addEventListener('load', function() {
        setTimeout(initBudgetRecalculator, 500);
    });

    function initBudgetRecalculator() {
        console.log('Activation du recalculateur de budget...');
        
        // Vérifier qu'on est sur une page de projet
        const projectForm = document.getElementById('newProjectForm');
        if (!projectForm) {
            console.log('Pas de formulaire de projet détecté');
            return;
        }

        // Vérifier et charger les catégories, sous-catégories et lignes existantes
        const categories = document.querySelectorAll('.expense-category');
        if (categories.length === 0) {
            console.log('Aucune catégorie détectée, attente...');
            setTimeout(initBudgetRecalculator, 500);
            return;
        }

        console.log(`${categories.length} catégories détectées, initialisation du recalculateur`);
        
        // Attacher des écouteurs d'événements
        attachRecalculationListeners();
        
        // Forcer un premier calcul
        setTimeout(recalculateAllAmounts, 1000);
        
        // Observer les changements dans le DOM
        setupMutationObserver();
    }

    function setupMutationObserver() {
        const categoriesContainer = document.getElementById('categoriesContainer');
        if (!categoriesContainer) return;
        
        const observer = new MutationObserver(function() {
            console.log('Changement détecté dans les catégories');
            setTimeout(function() {
                attachRecalculationListeners();
                recalculateAllAmounts();
            }, 200);
        });
        
        observer.observe(categoriesContainer, { 
            childList: true, 
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'contenteditable']
        });
    }

    function attachRecalculationListeners() {
        // Écouteurs pour les montants
        attachListenersToElements('.line-amount', handleAmountChange);
        attachListenersToElements('.subcategory-amount', handleAmountChange);
        attachListenersToElements('.category-amount', handleAmountChange);
    }
    
    function attachListenersToElements(selector, handler) {
        document.querySelectorAll(selector).forEach(function(element) {
            element.removeEventListener('input', handler);
            element.removeEventListener('blur', handler);
            element.addEventListener('input', handler);
            element.addEventListener('blur', handler);
        });
    }
    
    function handleAmountChange(event) {
        const target = event.target;
        console.log('Changement détecté sur', target.className);
        
        // Programmer un recalcul après que l'utilisateur ait terminé sa saisie
        setTimeout(recalculateAllAmounts, 300);
    }
    
    function recalculateAllAmounts() {
        console.log('Recalcul complet des montants...');
        
        // Vérifier si les montants sont vides alors qu'ils devraient être remplis
        const categoryAmounts = document.querySelectorAll('.category-amount');
        const subcategoryAmounts = document.querySelectorAll('.subcategory-amount');
        const lineAmounts = document.querySelectorAll('.line-amount');
        
        console.log('Analyse des montants existants:');
        console.log(`- Catégories: ${categoryAmounts.length} éléments`);
        console.log(`- Sous-catégories: ${subcategoryAmounts.length} éléments`);
        console.log(`- Lignes: ${lineAmounts.length} éléments`);
        
        // Vérifier et corriger le budget total si nécessaire
        const totalBudgetElement = document.getElementById('totalBudget');
        if (totalBudgetElement) {
            const currentValue = totalBudgetElement.textContent;
            console.log(`Budget total actuel: "${currentValue}"`);
            
            // Extraire la valeur numérique
            const numericValue = extractNumberFromString(currentValue);
            if (numericValue <= 0) {
                // Si le budget est à zéro ou vide, essayer de récupérer la valeur originale
                if (totalBudgetElement.getAttribute('data-original-value')) {
                    const originalValue = totalBudgetElement.getAttribute('data-original-value');
                    console.log(`Restauration du budget original: ${originalValue}`);
                    totalBudgetElement.textContent = originalValue;
                }
            }
            
            // S'assurer que le budget total a la bonne devise
            if (!currentValue.includes('AED') && numericValue > 0) {
                console.log('Correction de la devise dans le budget total');
                totalBudgetElement.textContent = `AED ${numericValue.toFixed(2)}`.replace('.', ',');
            }
            
            // Sauvegarder la valeur originale pour pouvoir la restaurer plus tard
            if (!totalBudgetElement.getAttribute('data-original-value') && currentValue) {
                totalBudgetElement.setAttribute('data-original-value', currentValue);
                console.log(`Budget original sauvegardé: ${currentValue}`);
            }
        }
        
        // 1. D'abord calculer les montants des sous-catégories à partir des lignes
        document.querySelectorAll('.subcategory').forEach(calculateSubcategoryAmount);
        
        // 2. Ensuite calculer les montants des catégories à partir des sous-catégories
        document.querySelectorAll('.expense-category').forEach(calculateCategoryAmount);
        
        // 3. Afficher un rapport
        console.log('Recalcul terminé!');
    }
    
    function calculateSubcategoryAmount(subcategory) {
        const lines = subcategory.querySelectorAll('.expense-line');
        const subcategoryAmount = subcategory.querySelector('.subcategory-amount');
        const subcategoryName = subcategory.querySelector('.subcategory-name')?.textContent || 'Sous-catégorie';
        
        if (!subcategoryAmount) return;
        
        // Obtenir la valeur actuelle
        const currentValue = extractNumberFromString(subcategoryAmount.textContent);
        
        // Si pas de lignes, conserver la valeur manuelle
        if (lines.length === 0) {
            console.log(`Sous-catégorie "${subcategoryName}": Pas de lignes, conservation valeur manuelle ${currentValue}`);
            return;
        }
        
        // Calculer la somme des montants des lignes
        let linesTotal = 0;
        lines.forEach(function(line) {
            const lineAmount = line.querySelector('.line-amount');
            if (lineAmount) {
                const lineValue = extractNumberFromString(lineAmount.textContent);
                linesTotal += lineValue;
            }
        });
        
        // Si les lignes n'ont pas de valeur mais qu'une valeur manuelle existe, la conserver
        if (linesTotal === 0 && currentValue > 0) {
            console.log(`Sous-catégorie "${subcategoryName}": Conservation valeur manuelle ${currentValue} car lignes vides`);
            return;
        }
        
        // Si les lignes ont une valeur et qu'une valeur manuelle existe, les additionner
        if (linesTotal > 0 && currentValue > 0 && !isAutoCalculated(subcategoryAmount)) {
            const newTotal = linesTotal + currentValue;
            console.log(`Sous-catégorie "${subcategoryName}": Addition ${linesTotal} + ${currentValue} = ${newTotal}`);
            subcategoryAmount.textContent = formatAED(newTotal);
            subcategoryAmount.dataset.calculated = 'true';
        } 
        // Sinon, juste utiliser le total des lignes
        else if (linesTotal > 0) {
            console.log(`Sous-catégorie "${subcategoryName}": Mise à jour avec total lignes ${linesTotal}`);
            subcategoryAmount.textContent = formatAED(linesTotal);
            subcategoryAmount.dataset.calculated = 'true';
        }
    }
    
    function calculateCategoryAmount(category) {
        const subcategories = category.querySelectorAll('.subcategory');
        const categoryAmount = category.querySelector('.category-amount');
        const categoryName = category.querySelector('.category-name')?.textContent || 'Catégorie';
        
        if (!categoryAmount) return;
        
        // Obtenir la valeur actuelle
        const currentValue = extractNumberFromString(categoryAmount.textContent);
        
        // Si pas de sous-catégories, conserver la valeur manuelle
        if (subcategories.length === 0) {
            console.log(`Catégorie "${categoryName}": Pas de sous-catégories, conservation valeur manuelle ${currentValue}`);
            return;
        }
        
        // Calculer la somme des montants des sous-catégories
        let subcategoriesTotal = 0;
        subcategories.forEach(function(subcategory) {
            const subcategoryAmount = subcategory.querySelector('.subcategory-amount');
            if (subcategoryAmount) {
                const subcategoryValue = extractNumberFromString(subcategoryAmount.textContent);
                subcategoriesTotal += subcategoryValue;
            }
        });
        
        // Si les sous-catégories n'ont pas de valeur mais qu'une valeur manuelle existe, la conserver
        if (subcategoriesTotal === 0 && currentValue > 0) {
            console.log(`Catégorie "${categoryName}": Conservation valeur manuelle ${currentValue} car sous-catégories vides`);
            return;
        }
        
        // Si les sous-catégories ont une valeur et qu'une valeur manuelle existe, les additionner
        if (subcategoriesTotal > 0 && currentValue > 0 && !isAutoCalculated(categoryAmount)) {
            const newTotal = subcategoriesTotal + currentValue;
            console.log(`Catégorie "${categoryName}": Addition ${subcategoriesTotal} + ${currentValue} = ${newTotal}`);
            categoryAmount.textContent = formatAED(newTotal);
            categoryAmount.dataset.calculated = 'true';
        } 
        // Sinon, juste utiliser le total des sous-catégories
        else if (subcategoriesTotal > 0) {
            console.log(`Catégorie "${categoryName}": Mise à jour avec total sous-catégories ${subcategoriesTotal}`);
            categoryAmount.textContent = formatAED(subcategoriesTotal);
            categoryAmount.dataset.calculated = 'true';
        }
    }
    
    // Vérifier si un élément a été calculé automatiquement (pour ne pas additionner plusieurs fois)
    function isAutoCalculated(element) {
        return element.dataset.calculated === 'true';
    }
    
    // Extraire le nombre d'une chaîne de caractères monétaire
    function extractNumberFromString(str) {
        if (!str) return 0;
        
        // Supprimer tout sauf les chiffres, points et virgules
        const cleaned = str.replace(/[^\d.,]/g, '').replace(',', '.');
        
        // Convertir en nombre
        const value = parseFloat(cleaned);
        return isNaN(value) ? 0 : value;
    }
    
    // Formater un nombre avec la devise appropriée
    function formatAED(amount) {
        // D'abord, préserver la devise d'origine des données
        const budgetElement = document.getElementById('totalBudget');
        if (budgetElement && budgetElement.textContent.includes("AED")) {
            return `AED ${amount.toFixed(2).replace('.', ',')}`;
        }
        
        // Ensuite, essayer d'utiliser la fonction de l'application pour récupérer la devise utilisateur
        if (typeof getCurrencySymbol === 'function') {
            const symbol = getCurrencySymbol();
            return `${symbol} ${amount.toFixed(2).replace('.', ',')}`;
        }
        
        // Vérifier si les préférences utilisateur sont disponibles
        if (window.userPreferences && window.userPreferences.currency) {
            // Obtenir le symbole de la devise
            let currencySymbol = "AED";
            
            if (window.userPreferences.currency === "EUR") {
                currencySymbol = "€";
            } else if (window.userPreferences.currency === "USD") {
                currencySymbol = "$";
            } else if (window.userPreferences.currency === "MAD") {
                currencySymbol = "DH";
            } else if (window.userPreferences.currency === "AED") {
                currencySymbol = "AED";
            }
            
            return `${currencySymbol} ${amount.toFixed(2).replace('.', ',')}`;
        }
        
        // Par défaut, conserver AED pour assurer la compatibilité avec les données existantes
        return `AED ${amount.toFixed(2).replace('.', ',')}`;
    }
});