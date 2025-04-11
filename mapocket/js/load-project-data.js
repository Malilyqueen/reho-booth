/**
 * Script pour charger les données des projets directement à partir du localStorage
 * Ce script est une solution pour le problème de valeurs nulles ou non chargées
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation du chargeur de données de projet...');
    
    // Attendre le chargement complet du DOM
    window.addEventListener('load', function() {
        setTimeout(initializeProjectDataLoader, 1000);
    });
    
    // Fonction principale d'initialisation
    function initializeProjectDataLoader() {
        console.log('Activation du chargeur de données de projet...');
        
        // Vérifier qu'on est sur une page d'édition de projet
        const urlParams = new URLSearchParams(window.location.search);
        const editMode = urlParams.get('edit');
        const projectId = urlParams.get('id');
        
        if (editMode !== 'true' || !projectId) {
            console.log('Pas en mode édition ou ID de projet manquant');
            return;
        }
        
        console.log(`Chargement des données pour le projet ID: ${projectId}`);
        
        // Charger les données du projet depuis le localStorage
        loadProjectDataFromStorage(projectId);
    }
    
    // Charger les données du projet depuis le localStorage
    function loadProjectDataFromStorage(projectId) {
        // Vérifier dans les deux clés de stockage possibles
        let projects = JSON.parse(localStorage.getItem('mapocket_projects') || '[]');
        if (projects.length === 0) {
            projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        }
        
        // Trouver le projet avec l'ID correspondant
        const project = projects.find(p => p.id === projectId);
        if (!project) {
            console.log('Projet non trouvé dans le stockage local');
            return;
        }
        
        console.log('Projet trouvé:', project.projectName);
        
        // Remplir les catégories, sous-catégories et lignes manuellement
        fillCategoriesFromProject(project);
    }
    
    // Remplir les catégories du formulaire avec les données du projet
    function fillCategoriesFromProject(project) {
        if (!project.categories || project.categories.length === 0) {
            console.log('Pas de catégories dans le projet');
            return;
        }
        
        console.log(`Le projet contient ${project.categories.length} catégories`);
        
        // Pour chaque catégorie dans le projet
        project.categories.forEach(function(category, categoryIndex) {
            // Trouver l'élément correspondant dans le DOM
            const categoryElements = document.querySelectorAll('.expense-category');
            if (categoryIndex >= categoryElements.length) {
                console.log(`Catégorie ${categoryIndex + 1} non trouvée dans le DOM`);
                return;
            }
            
            const categoryElement = categoryElements[categoryIndex];
            
            // Mettre à jour le nom et le montant si non définis
            const categoryNameElement = categoryElement.querySelector('.category-name');
            const categoryAmountElement = categoryElement.querySelector('.category-amount');
            
            if (categoryNameElement && !categoryNameElement.textContent.trim()) {
                categoryNameElement.textContent = category.name;
            }
            
            if (categoryAmountElement && !categoryAmountElement.textContent.trim()) {
                categoryAmountElement.textContent = category.amount;
                console.log(`Montant de catégorie défini: ${category.amount}`);
            }
            
            // Pour chaque sous-catégorie
            if (category.subcategories && category.subcategories.length > 0) {
                const subcategoryContainer = categoryElement.querySelector('.subcategories-container');
                if (!subcategoryContainer) {
                    console.log(`Conteneur de sous-catégories non trouvé pour la catégorie ${category.name}`);
                    return;
                }
                
                const subcategoryElements = subcategoryContainer.querySelectorAll('.subcategory');
                
                category.subcategories.forEach(function(subcategory, subcategoryIndex) {
                    if (subcategoryIndex >= subcategoryElements.length) {
                        console.log(`Sous-catégorie ${subcategoryIndex + 1} non trouvée dans le DOM`);
                        return;
                    }
                    
                    const subcategoryElement = subcategoryElements[subcategoryIndex];
                    
                    // Mettre à jour le nom et le montant si non définis
                    const subcategoryNameElement = subcategoryElement.querySelector('.subcategory-name');
                    const subcategoryAmountElement = subcategoryElement.querySelector('.subcategory-amount');
                    
                    if (subcategoryNameElement && !subcategoryNameElement.textContent.trim()) {
                        subcategoryNameElement.textContent = subcategory.name;
                    }
                    
                    if (subcategoryAmountElement && !subcategoryAmountElement.textContent.trim()) {
                        subcategoryAmountElement.textContent = subcategory.amount;
                        console.log(`Montant de sous-catégorie défini: ${subcategory.amount}`);
                    }
                    
                    // Pour chaque ligne
                    if (subcategory.lines && subcategory.lines.length > 0) {
                        const linesContainer = subcategoryElement.querySelector('.lines-container');
                        if (!linesContainer) {
                            console.log(`Conteneur de lignes non trouvé pour la sous-catégorie ${subcategory.name}`);
                            return;
                        }
                        
                        const lineElements = linesContainer.querySelectorAll('.expense-line');
                        
                        subcategory.lines.forEach(function(line, lineIndex) {
                            if (lineIndex >= lineElements.length) {
                                console.log(`Ligne ${lineIndex + 1} non trouvée dans le DOM`);
                                return;
                            }
                            
                            const lineElement = lineElements[lineIndex];
                            
                            // Mettre à jour le nom et le montant si non définis
                            const lineNameElement = lineElement.querySelector('.line-name');
                            const lineAmountElement = lineElement.querySelector('.line-amount');
                            
                            if (lineNameElement && !lineNameElement.textContent.trim()) {
                                lineNameElement.textContent = line.name;
                            }
                            
                            if (lineAmountElement && !lineAmountElement.textContent.trim()) {
                                lineAmountElement.textContent = line.amount;
                                console.log(`Montant de ligne défini: ${line.amount}`);
                            }
                        });
                    }
                });
            }
        });
        
        console.log('Données du projet chargées avec succès');
        
        // Déclencher un recalcul des montants si la fonction existe
        if (typeof recalculateAllAmounts === 'function') {
            console.log('Déclenchement du recalcul des montants...');
            setTimeout(recalculateAllAmounts, 500);
        }
    }
});