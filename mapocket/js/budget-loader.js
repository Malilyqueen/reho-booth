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
    
    // Préserver le budget total d'origine dès que possible
    let originalTotalBudget = '';
    
    // Fonction pour sauvegarder le budget total d'origine
    function preserveOriginalBudget() {
        const totalBudgetInput = document.getElementById('totalBudget');
        if (totalBudgetInput && totalBudgetInput.value && totalBudgetInput.value !== '0' && 
            totalBudgetInput.value !== '€ 0,00' && totalBudgetInput.value !== '0,00') {
            originalTotalBudget = totalBudgetInput.value;
            console.log(`Budget total d'origine sauvegardé: ${originalTotalBudget}`);
        } else {
            // Si pas de budget dans l'input, chercher dans l'URL et localStorage
            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('id');
            
            if (projectId) {
                try {
                    // Essayer d'abord mapocket_projects, puis savedProjects comme fallback
                    ['mapocket_projects', 'savedProjects'].forEach(storageKey => {
                        if (originalTotalBudget) return; // Si déjà trouvé, ne pas continuer
                        const allProjects = JSON.parse(localStorage.getItem(storageKey) || '[]');
                        const currentProject = allProjects.find(p => p.id === projectId);
                        
                        if (currentProject && currentProject.totalBudget) {
                            originalTotalBudget = currentProject.totalBudget;
                            console.log(`Budget récupéré depuis ${storageKey}: ${originalTotalBudget}`);
                            
                            // Appliquer immédiatement au champ si possible
                            if (totalBudgetInput) {
                                totalBudgetInput.value = originalTotalBudget;
                                console.log(`Budget appliqué immédiatement: ${originalTotalBudget}`);
                            }
                        }
                    });
                } catch (error) {
                    console.error('Erreur lors de la récupération du budget:', error);
                }
            }
        }
    }
    
    // Essayer de préserver le budget immédiatement
    preserveOriginalBudget();
    
    // Surveiller les changements de date
    const dateInputs = document.querySelectorAll('#projectDate, #projectEndDate');
    dateInputs.forEach(input => {
        input.addEventListener('change', function() {
            console.log(`Changement de date détecté, préservation du budget: ${originalTotalBudget}`);
            const totalBudgetInput = document.getElementById('totalBudget');
            if (totalBudgetInput && originalTotalBudget) {
                totalBudgetInput.value = originalTotalBudget;
            }
        });
    });
    
    // Observer le DOM pour détecter quand le projet est chargé
    const observer = new MutationObserver(function(mutations) {
        // Essayer de préserver le budget à chaque mutation importante
        if (originalTotalBudget === '') {
            preserveOriginalBudget();
        }
        
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Vérifier si les catégories ont été ajoutées
                const categoriesContainer = document.getElementById('categoriesContainer');
                if (categoriesContainer && categoriesContainer.children.length > 0) {
                    console.log('Projet détecté dans le DOM, préparation du recalcul...');
                    
                    // Si nous n'avons toujours pas le budget original, essayer encore une fois
                    if (originalTotalBudget === '') {
                        preserveOriginalBudget();
                    }
                    
                    // Désactiver l'observateur pour éviter des appels multiples
                    observer.disconnect();
                    
                    // Attendre que le DOM soit complètement stabilisé avant de recalculer
                    setTimeout(function() {
                        // Vérification de sécurité: s'assurer que le DOM est prêt
                        if (document.readyState === 'complete') {
                            recalculateAllBudgets();
                            
                            // Étape supplémentaire cruciale: s'assurer que le budget total est correct après le recalcul
                            setTimeout(function() {
                                const totalBudgetInput = document.getElementById('totalBudget');
                                if (totalBudgetInput && originalTotalBudget &&
                                    (!totalBudgetInput.value || totalBudgetInput.value === '0' || 
                                    totalBudgetInput.value === '€ 0,00' || totalBudgetInput.value === '0,00')) {
                                    totalBudgetInput.value = originalTotalBudget;
                                    console.log(`Budget restauré après recalcul: ${originalTotalBudget}`);
                                }
                            }, 300);
                        } else {
                            console.log('DOM pas encore prêt, report du recalcul...');
                            // Réessayer quand le DOM sera complètement chargé
                            window.addEventListener('load', function() {
                                recalculateAllBudgets();
                            });
                        }
                    }, 400);
                }
            }
        });
    });

    // Observer le corps du document pour détecter les changements, avec une surveillance approfondie
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

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

        // 4. Gestion intelligente du budget total du projet - CRITIQUE
        const totalBudgetInput = document.getElementById('totalBudget');
        if (totalBudgetInput) {
            console.log(`Budget total du projet calculé: ${projectTotal}`);
            console.log(`Budget total actuel: ${totalBudgetInput.value}`);
            console.log(`Budget total d'origine: ${originalTotalBudget}`);
            
            // PRIORITÉ #1: Si nous avons un budget d'origine qui a été sauvegardé, l'utiliser TOUJOURS
            if (originalTotalBudget && originalTotalBudget !== '0' && 
                originalTotalBudget !== '€ 0,00' && originalTotalBudget !== '0,00') {
                if (totalBudgetInput.value !== originalTotalBudget) {
                    totalBudgetInput.value = originalTotalBudget;
                    console.log(`RESTAURATION du budget total original: ${originalTotalBudget}`);
                } else {
                    console.log(`Le budget total est déjà défini correctement: ${originalTotalBudget}`);
                }
            }
            // PRIORITÉ #2: Si nous n'avons pas de budget d'origine, mais que l'utilisateur a défini un budget manuellement
            else if (totalBudgetInput.value && totalBudgetInput.value !== '0' && 
                     totalBudgetInput.value !== '€ 0,00' && totalBudgetInput.value !== '0,00') {
                console.log(`Conservation du budget défini manuellement: ${totalBudgetInput.value}`);
                // Mémoriser ce budget comme le nouveau budget d'origine
                originalTotalBudget = totalBudgetInput.value;
                console.log(`Nouveau budget d'origine défini: ${originalTotalBudget}`);
            }
            // PRIORITÉ #3: Si nous n'avons pas de budget d'origine et que l'utilisateur n'a pas défini de budget,
            // mais que nous avons calculé un total à partir des catégories (si > 0)
            else if (projectTotal > 0) {
                const formattedTotal = formatCurrency(projectTotal);
                totalBudgetInput.value = formattedTotal;
                console.log(`Budget total défini depuis les calculs: ${formattedTotal}`);
                // Mémoriser ce budget comme le nouveau budget d'origine
                originalTotalBudget = formattedTotal;
                console.log(`Nouveau budget d'origine défini: ${originalTotalBudget}`);
            }
            // PRIORITÉ #4: En dernier recours, chercher dans localStorage
            else {
                console.log('Tentative de récupération du budget depuis localStorage...');
                const urlParams = new URLSearchParams(window.location.search);
                const projectId = urlParams.get('id');
                
                if (projectId) {
                    // Chercher dans toutes les sources possibles
                    ['mapocket_projects', 'savedProjects', 'mapocket_projects_backup'].forEach(storageKey => {
                        if (originalTotalBudget) return; // Si déjà trouvé, ne pas continuer
                        
                        try {
                            const allProjects = JSON.parse(localStorage.getItem(storageKey) || '[]');
                            const currentProject = allProjects.find(p => p.id === projectId);
                            
                            if (currentProject && currentProject.totalBudget) {
                                originalTotalBudget = currentProject.totalBudget;
                                totalBudgetInput.value = originalTotalBudget;
                                console.log(`Budget récupéré depuis ${storageKey}: ${originalTotalBudget}`);
                            }
                        } catch (error) {
                            console.error(`Erreur lors de la récupération depuis ${storageKey}:`, error);
                        }
                    });
                }
                
                // Si après toutes ces tentatives, nous n'avons toujours pas de budget, utiliser 0
                if (!originalTotalBudget) {
                    console.log('Aucun budget trouvé, utilisation de 0 par défaut');
                    totalBudgetInput.value = '0,00';
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