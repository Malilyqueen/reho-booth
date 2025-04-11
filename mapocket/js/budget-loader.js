/**
 * Gestionnaire de chargement et recalcul des budgets
 * Ce script s'assure que le recalcul des budgets est effectué correctement
 * après le chargement d'un projet, en respectant les principes suivants:
 * 1. Attendre que le DOM soit entièrement prêt
 * 2. Extraire correctement les valeurs des montants
 * 3. Parcourir correctement tous les niveaux hiérarchiques
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation du chargeur de budget...');

    // Observer le DOM pour détecter quand le projet est chargé
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Vérifier si les catégories ont été ajoutées
                const categoriesContainer = document.getElementById('categoriesContainer');
                if (categoriesContainer && categoriesContainer.children.length > 0) {
                    console.log('Projet détecté dans le DOM, préparation du recalcul...');
                    
                    // Désactiver l'observateur pour éviter des appels multiples
                    observer.disconnect();
                    
                    // Attendre que le DOM soit complètement stabilisé
                    setTimeout(function() {
                        recalculateAllBudgets();
                    }, 200);
                }
            }
        });
    });

    // Observer le corps du document pour détecter les changements
    observer.observe(document.body, { childList: true, subtree: true });

    /**
     * Fonction principale de recalcul de tous les budgets
     * Cette fonction lit les valeurs de toutes les lignes et remonte la hiérarchie
     */
    function recalculateAllBudgets() {
        console.log('🔄 RECALCUL COMPLET DU BUDGET DU PROJET');
        
        // 1. Récupérer et traiter chaque ligne de budget
        const lineAmounts = document.querySelectorAll('.line-amount');
        console.log(`Lignes de budget trouvées: ${lineAmounts.length}`);
        
        // S'assurer que chaque ligne a sa valeur numérique extraite
        lineAmounts.forEach(lineAmount => {
            const textValue = lineAmount.textContent.trim();
            const numericValue = extractNumericValue(textValue);
            
            // Stocker la valeur numérique comme attribut data
            lineAmount.dataset.value = numericValue;
            console.log(`Ligne: "${textValue}" → valeur: ${numericValue}`);
        });

        // 2. Recalculer chaque sous-catégorie
        const subcategories = document.querySelectorAll('.subcategory');
        console.log(`Sous-catégories trouvées: ${subcategories.length}`);
        
        subcategories.forEach(subcategory => {
            let subcategoryTotal = 0;
            
            // Additionner toutes les lignes de cette sous-catégorie
            subcategory.querySelectorAll('.line-amount').forEach(lineAmount => {
                subcategoryTotal += parseFloat(lineAmount.dataset.value || 0);
            });
            
            // Mettre à jour le montant de la sous-catégorie
            const subcategoryAmount = subcategory.querySelector('.subcategory-amount');
            if (subcategoryAmount) {
                subcategoryAmount.textContent = formatCurrency(subcategoryTotal);
                subcategoryAmount.dataset.value = subcategoryTotal;
                subcategoryAmount.dataset.calculated = "true";
                console.log(`Sous-catégorie "${subcategory.querySelector('.subcategory-name')?.textContent}" → total: ${subcategoryTotal}`);
            }
        });

        // 3. Recalculer chaque catégorie
        const categories = document.querySelectorAll('.expense-category');
        console.log(`Catégories trouvées: ${categories.length}`);
        
        let projectTotal = 0;
        
        categories.forEach(category => {
            let categoryTotal = 0;
            
            // Additionner toutes les sous-catégories de cette catégorie
            category.querySelectorAll('.subcategory-amount').forEach(subcategoryAmount => {
                categoryTotal += parseFloat(subcategoryAmount.dataset.value || 0);
            });
            
            // Mettre à jour le montant de la catégorie
            const categoryAmount = category.querySelector('.category-amount');
            if (categoryAmount) {
                categoryAmount.textContent = formatCurrency(categoryTotal);
                categoryAmount.dataset.value = categoryTotal;
                categoryAmount.dataset.calculated = "true";
                console.log(`Catégorie "${category.querySelector('.category-name')?.textContent}" → total: ${categoryTotal}`);
            }
            
            projectTotal += categoryTotal;
        });

        // 4. Mettre à jour le budget total du projet
        const totalBudgetInput = document.getElementById('totalBudget');
        if (totalBudgetInput) {
            console.log(`Budget total du projet calculé: ${projectTotal}`);
            
            // Si le budget calculé est supérieur à 0, utiliser ce montant
            if (projectTotal > 0) {
                totalBudgetInput.value = formatCurrency(projectTotal);
                console.log(`Budget total mis à jour: ${formatCurrency(projectTotal)}`);
            } 
            // Sinon, si un budget est déjà défini, le conserver
            else if (totalBudgetInput.value && totalBudgetInput.value !== '0' && totalBudgetInput.value !== '€ 0,00') {
                console.log(`Conservation du budget existant: ${totalBudgetInput.value}`);
            }
            // En dernier recours, récupérer le budget depuis l'URL
            else {
                const urlParams = new URLSearchParams(window.location.search);
                const projectId = urlParams.get('id');
                
                if (projectId) {
                    // Tenter de récupérer le projet depuis le stockage local
                    try {
                        const allProjects = JSON.parse(localStorage.getItem('mapocket_projects') || '[]');
                        const currentProject = allProjects.find(p => p.id === projectId);
                        
                        if (currentProject && currentProject.totalBudget) {
                            totalBudgetInput.value = currentProject.totalBudget;
                            console.log(`Budget récupéré depuis localStorage: ${currentProject.totalBudget}`);
                        }
                    } catch (error) {
                        console.error('Erreur lors de la récupération du projet:', error);
                    }
                }
            }
        }
    }

    /**
     * Extrait la valeur numérique d'une chaîne représentant un montant
     * @param {string} amountStr - La chaîne contenant le montant (ex: "€ 1 234,56" ou "USD 500")
     * @returns {number} - La valeur numérique extraite
     */
    function extractNumericValue(amountStr) {
        if (!amountStr) return 0;
        
        // Nettoyer la chaîne: supprimer les symboles de devise et les espaces
        let cleaned = amountStr.replace(/[^\d.,]/g, '');
        
        // Gestion des formats internationaux: remplacer la virgule par un point
        cleaned = cleaned.replace(',', '.');
        
        // Convertir en nombre
        const value = parseFloat(cleaned);
        
        // Retourner le nombre ou 0 si invalide
        return isNaN(value) ? 0 : value;
    }

    /**
     * Formate un nombre en devise selon les préférences de l'utilisateur
     * @param {number} amount - Le montant à formater
     * @returns {string} - Chaîne formatée (ex: "€ 1 234,56")
     */
    function formatCurrency(amount) {
        // Vérifier si la fonction getCurrencySymbol est disponible (définie dans currencies.js)
        if (typeof getCurrencySymbol === 'function') {
            const symbol = getCurrencySymbol();
            return `${symbol} ${amount.toFixed(2).replace('.', ',')}`;
        }
        
        // Par défaut, utiliser l'euro
        return `€ ${amount.toFixed(2).replace('.', ',')}`;
    }
});