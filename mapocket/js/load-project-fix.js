/**
 * CORRECTIF POUR LE PROBLÈME DE CHARGEMENT DES LIGNES DE DÉPENSE
 * 
 * Ce script corrige trois problèmes spécifiques:
 * 1. Les lignes ajoutées manuellement qui ne s'affichent pas en mode édition
 * 2. Le budget total qui reste à 0 malgré les données existantes
 * 3. Le rendu complet des sous-catégories avec leurs lignes
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initialisation du correctif pour le chargement complet des projets');
    
    // Sauvegarder la référence aux fonctions originales
    const originalLoadAndRenderProject = window.loadAndRenderProject;
    const originalRenderProjectData = window.renderProjectData;
    const originalAddExpenseLine = window.addExpenseLine;
    
    // CORRECTIF 1: Améliorer la fonction de chargement du projet
    if (typeof originalLoadAndRenderProject === 'function') {
        window.loadAndRenderProject = function(projectId) {
            console.log('🔄 Interception du chargement du projet pour analyses avancées:', projectId);
            
            // Vérifier si nous sommes en mode édition
            const urlParams = new URLSearchParams(window.location.search);
            const isEdit = urlParams.get('edit') === 'true';
            
            if (isEdit) {
                console.log('📝 Mode édition détecté - Analyse approfondie requise');
                
                // Charger les données du projet à partir du localStorage
                let projectData = null;
                
                // Essayer d'abord ProjectData.getProjectById si c'est disponible
                if (window.ProjectData && typeof ProjectData.getProjectById === 'function') {
                    projectData = ProjectData.getProjectById(projectId);
                }
                
                // Sinon, fallback sur la fonction globale
                if (!projectData && typeof window.getProjectById === 'function') {
                    projectData = window.getProjectById(projectId);
                }
                
                // Si on a réussi à charger le projet
                if (projectData) {
                    console.log('📊 Projet chargé avec succès:', projectData.projectName);
                    console.log('💾 Budget total:', projectData.totalBudget);
                    console.log('📋 Catégories:', projectData.categories?.length || 0);
                    
                    // Mettre à jour le budget total immédiatement
                    const totalBudgetInput = document.getElementById('totalBudget');
                    if (totalBudgetInput && projectData.totalBudget) {
                        console.log('💰 Définition du budget total:', projectData.totalBudget);
                        totalBudgetInput.value = extractNumberFromString(projectData.totalBudget);
                    }
                    
                    // Compter toutes les lignes pour diagnostique
                    let totalLines = 0;
                    if (projectData.categories) {
                        projectData.categories.forEach(category => {
                            if (category.subcategories) {
                                category.subcategories.forEach(subcategory => {
                                    if (subcategory.lines) {
                                        totalLines += subcategory.lines.length;
                                        // Analyser chaque ligne pour déboguer
                                        subcategory.lines.forEach(line => {
                                            console.log(`📌 Ligne détectée: ${line.name} = ${line.amount}`);
                                        });
                                    }
                                });
                            }
                        });
                    }
                    console.log(`📋 Total des lignes détectées: ${totalLines}`);
                }
            }
            
            // Appeler la fonction originale
            originalLoadAndRenderProject(projectId);
        };
    }
    
    // CORRECTIF 2: Améliorer la fonction de rendu du projet
    if (typeof originalRenderProjectData === 'function') {
        window.renderProjectData = function(project) {
            console.log('🔄 Interception du rendu du projet:', project.projectName);
            
            // S'assurer que le budget total est correctement défini
            if (project.totalBudget) {
                const totalBudgetElement = document.getElementById('totalBudget');
                if (totalBudgetElement) {
                    console.log('💰 Définition du budget total depuis le rendu:', project.totalBudget);
                    totalBudgetElement.value = extractNumberFromString(project.totalBudget);
                }
            }
            
            // Appeler la fonction originale
            originalRenderProjectData(project);
            
            // Vérifier si les lignes existent et ont été rendues correctement
            verifyLinesRendering(project);
            
            // Forcer un recalcul après le rendu
            setTimeout(() => {
                console.log('🔄 Forçage du recalcul après rendu complet');
                if (typeof recalculateAllAmounts === 'function') {
                    recalculateAllAmounts();
                }
            }, 500);
        };
    }
    
    // CORRECTIF 3: Améliorer la fonction d'ajout de ligne
    if (typeof originalAddExpenseLine === 'function') {
        window.addExpenseLine = function(container, name = "", amount = 0) {
            console.log(`🔧 Ajout d'une ligne amélioré: "${name}" avec montant ${amount}`);
            
            // S'assurer que les arguments sont valides
            if (!container) {
                console.error('❌ Conteneur non valide pour l\'ajout de ligne');
                return;
            }
            
            // Convertir en nombre pour être sûr
            if (typeof amount === 'string') {
                amount = extractNumberFromString(amount);
            }
            
            // Appeler la fonction originale
            originalAddExpenseLine(container, name, amount);
        };
    }
    
    // Fonction utilitaire pour vérifier si les lignes ont été correctement rendues
    function verifyLinesRendering(project) {
        console.log('🔍 Vérification du rendu des lignes...');
        
        if (!project || !project.categories) {
            console.warn('⚠️ Pas de catégories à vérifier');
            return;
        }
        
        // Parcourir toutes les catégories pour vérifier
        project.categories.forEach(category => {
            if (!category.subcategories) return;
            
            const categoryElement = document.querySelector(`[data-category="${category.name}"]`);
            if (!categoryElement) {
                console.warn(`⚠️ Élément de catégorie "${category.name}" non trouvé dans le DOM`);
                return;
            }
            
            category.subcategories.forEach(subcategory => {
                if (!subcategory.lines) return;
                
                // Trouver l'élément de sous-catégorie dans le DOM
                const subcategoryElements = categoryElement.querySelectorAll('.subcategory');
                let subcategoryElement = null;
                
                // Chercher la bonne sous-catégorie par nom
                for (let i = 0; i < subcategoryElements.length; i++) {
                    const nameElement = subcategoryElements[i].querySelector('.subcategory-name');
                    if (nameElement && nameElement.textContent === subcategory.name) {
                        subcategoryElement = subcategoryElements[i];
                        break;
                    }
                }
                
                if (!subcategoryElement) {
                    console.warn(`⚠️ Sous-catégorie "${subcategory.name}" non trouvée dans le DOM`);
                    return;
                }
                
                // Trouver le conteneur de lignes
                const linesContainer = subcategoryElement.querySelector('.lines-container') || 
                                      subcategoryElement.querySelector('.expense-lines');
                
                if (!linesContainer) {
                    console.warn('⚠️ Conteneur de lignes non trouvé');
                    return;
                }
                
                // Compter les lignes déjà rendues
                const renderedLines = linesContainer.querySelectorAll('.expense-line');
                
                // Si le nombre de lignes est différent, forcer le rerendu
                if (renderedLines.length !== subcategory.lines.length) {
                    console.log(`🔄 Correction: ${renderedLines.length} lignes rendues vs ${subcategory.lines.length} attendues`);
                    
                    // Vider le conteneur pour éviter les doublons
                    linesContainer.innerHTML = '';
                    
                    // Ajouter chaque ligne manuellement
                    subcategory.lines.forEach(line => {
                        console.log(`➕ Ajout forcé de ligne: ${line.name} (${line.amount})`);
                        addExpenseLine(linesContainer, line.name, extractNumberFromString(line.amount));
                    });
                }
            });
        });
        
        console.log('✅ Vérification du rendu des lignes terminée');
    }
    
    // Fonction utilitaire d'extraction de nombre à partir d'une chaîne
    function extractNumberFromString(str) {
        if (!str) return 0;
        
        // Cas des objets
        if (typeof str === 'object') {
            return 0;
        }
        
        // Supprimer tout sauf les chiffres, points et virgules
        const cleaned = String(str).replace(/[^\d.,\-]/g, '').replace(',', '.');
        
        // Convertir en nombre
        const value = parseFloat(cleaned);
        return isNaN(value) ? 0 : value;
    }
    
    console.log('✅ Correctif pour le chargement des lignes initialisé avec succès');
});