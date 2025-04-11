/**
 * Correctif direct pour l'édition de projet
 * 
 * Une solution unique et simple pour résoudre 
 * le problème de perte de données lors de l'édition.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation du correctif direct pour l\'édition de projet');
    
    // Vérifier si nous sommes en mode édition
    const urlParams = new URLSearchParams(window.location.search);
    const isEditMode = urlParams.get('edit') === 'true';
    const projectId = urlParams.get('id');
    
    if (isEditMode && projectId) {
        console.log('Mode édition de projet détecté, ID:', projectId);
        
        // Définissons d'abord la fonction nécessaire à updateTemplateCategoriesUI
        // Cette fonction sera appelée quand on change de template, et doit préserver les données
        window.updateTemplateCategoriesUI = function(templateName) {
            console.log('Changement de template avec préservation de données:', templateName);
            
            // Récupérer les projets depuis le localStorage
            const projects = JSON.parse(localStorage.getItem('mapocket_projects') || '[]');
            const project = projects.find(p => p.id === projectId);
            
            if (project) {
                // Préserver les données du projet mais mettre à jour le template
                loadProjectData(project);
                
                // Le formulaire est déjà chargé, mais on doit mettre à jour le template visuellement
                document.querySelectorAll('.template-option').forEach(option => {
                    option.classList.remove('selected');
                    if (option.getAttribute('data-template') === templateName) {
                        option.classList.add('selected');
                    }
                });
                
                // Mise à jour du titre du type de projet
                const projectTypeElement = document.querySelector('.project-type');
                if (projectTypeElement) {
                    projectTypeElement.textContent = templateName;
                }
            } else {
                // Si on n'a pas le projet, utiliser le comportement par défaut (créer de nouvelles catégories)
                createDefaultCategories(templateName);
            }
        };
        
        // Attendons un peu pour permettre au reste de la page de se charger
        setTimeout(function() {
            // Charger les données du projet depuis le localStorage
            // Les projets sont stockés dans la clé 'savedProjects', pas 'mapocket_projects'
            const projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
            const project = projects.find(p => p.id === projectId);
            
            if (project) {
                console.log('Projet trouvé, chargement des données:', project);
                
                // Changer le titre de la page
                const pageTitle = document.querySelector('.page-title');
                if (pageTitle) {
                    pageTitle.innerHTML = '<i class="fas fa-edit"></i> MODIFIER PROJET';
                    pageTitle.style.color = '#007bff';
                }
                
                // Changer le bouton de soumission
                const submitButton = document.querySelector('.project-form button[type="submit"]');
                if (submitButton) {
                    submitButton.textContent = 'Enregistrer les modifications';
                    submitButton.classList.add('btn-success');
                }
                
                // Charger les données du projet dans le formulaire
                loadProjectData(project);
                
                // Intercepter la soumission du formulaire
                interceptFormSubmission(project, projectId);
            } else {
                console.error('Projet non trouvé:', projectId);
            }
        }, 300);
    }
});

/**
 * Charge les données du projet dans le formulaire
 */
function loadProjectData(project) {
    // Remplir les champs de base
    if (document.getElementById('projectName')) {
        document.getElementById('projectName').value = project.projectName || '';
    }
    
    if (document.getElementById('projectDate')) {
        document.getElementById('projectDate').value = project.projectDate || '';
    }
    
    if (document.getElementById('projectEndDate')) {
        document.getElementById('projectEndDate').value = project.projectEndDate || '';
    }
    
    if (document.getElementById('totalBudget')) {
        document.getElementById('totalBudget').value = project.totalBudget || '';
    }
    
    if (document.getElementById('projectStatus')) {
        document.getElementById('projectStatus').value = project.projectStatus || 'inProgress';
    }
    
    // Lien vers portefeuille
    if (document.getElementById('linkToWallet')) {
        document.getElementById('linkToWallet').checked = project.linkToWallet || false;
    }
    
    // Sélectionner le template
    if (project.template) {
        document.querySelectorAll('.template-option').forEach(option => {
            option.classList.remove('selected');
            if (option.getAttribute('data-template') === project.template) {
                option.classList.add('selected');
            }
        });
        
        // Mise à jour du titre du type de projet
        const projectTypeElement = document.querySelector('.project-type');
        if (projectTypeElement) {
            projectTypeElement.textContent = project.template;
        }
    }
    
    // Charger les catégories
    loadCategories(project.categories || []);
}

/**
 * Charge les catégories dans le DOM
 */
function loadCategories(categories) {
    const categoriesContainer = document.getElementById('categoriesContainer');
    if (!categoriesContainer) {
        console.error('Conteneur de catégories non trouvé');
        return;
    }
    
    // Vider le conteneur de catégories
    categoriesContainer.innerHTML = '';
    
    // Ajouter chaque catégorie
    categories.forEach(category => {
        // Créer l'élément de catégorie
        const categoryElement = document.createElement('div');
        categoryElement.className = 'expense-category';
        categoryElement.innerHTML = `
            <div class="category-header">
                <div class="category-name" contenteditable="true">${category.name || ''}</div>
                <div class="category-amount" contenteditable="true">${category.amount || ''}</div>
                <div class="category-actions">
                    <button class="btn-sm delete-category-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="subcategories-container"></div>
            <div class="category-footer">
                <button class="btn-sm add-subcategory-btn">
                    <i class="fas fa-plus"></i> Ajouter une sous-catégorie
                </button>
            </div>
        `;
        
        // Ajouter la catégorie au conteneur
        categoriesContainer.appendChild(categoryElement);
        
        // Récupérer le conteneur de sous-catégories
        const subcategoriesContainer = categoryElement.querySelector('.subcategories-container');
        
        // Ajouter chaque sous-catégorie
        if (category.subcategories && category.subcategories.length > 0) {
            category.subcategories.forEach(subcategory => {
                // Créer l'élément de sous-catégorie
                const subcategoryElement = document.createElement('div');
                subcategoryElement.className = 'subcategory';
                subcategoryElement.innerHTML = `
                    <div class="subcategory-header">
                        <div class="subcategory-name" contenteditable="true">${subcategory.name || ''}</div>
                        <div class="subcategory-amount" contenteditable="true">${subcategory.amount || ''}</div>
                        <div class="subcategory-actions">
                            <button class="btn-sm delete-subcategory-btn">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="expense-lines"></div>
                    <div class="subcategory-footer">
                        <button class="btn-sm add-line-btn">
                            <i class="fas fa-plus"></i> Ajouter une ligne
                        </button>
                    </div>
                `;
                
                // Ajouter la sous-catégorie au conteneur
                subcategoriesContainer.appendChild(subcategoryElement);
                
                // Récupérer le conteneur de lignes
                const linesContainer = subcategoryElement.querySelector('.expense-lines');
                
                // Ajouter chaque ligne
                if (subcategory.lines && subcategory.lines.length > 0) {
                    subcategory.lines.forEach(line => {
                        // Créer l'élément de ligne
                        const lineElement = document.createElement('div');
                        lineElement.className = 'expense-line';
                        lineElement.innerHTML = `
                            <div class="line-name" contenteditable="true">${line.name || ''}</div>
                            <div class="line-amount" contenteditable="true">${line.amount || ''}</div>
                            <div class="line-actions">
                                <button class="btn-sm delete-line-btn">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `;
                        
                        // Ajouter la ligne au conteneur
                        linesContainer.appendChild(lineElement);
                    });
                }
            });
        }
    });
    
    // Réinitialiser tous les écouteurs d'événements
    setTimeout(function() {
        console.log('Réinitialisation des écouteurs d\'événements');
        
        // Réinitialisation des calculs de budget
        if (typeof attachBudgetAmountListeners === 'function') {
            attachBudgetAmountListeners();
        }
        
        // Réinitialisation des éléments éditables
        if (typeof makeSubcategoriesEditableByDefault === 'function') {
            makeSubcategoriesEditableByDefault();
        }
        
        // Correction des éléments éditables
        if (typeof fixAllEditableElements === 'function') {
            fixAllEditableElements();
        }
        
        // Boutons de suppression
        if (typeof initCategoryDeletionButtons === 'function') {
            initCategoryDeletionButtons();
        }
        
        // Mise à jour des totaux
        if (typeof updateTotals === 'function') {
            updateTotals();
        }
    }, 200);
}

/**
 * Crée les catégories par défaut pour un template
 */
function createDefaultCategories(templateName) {
    const categoriesContainer = document.getElementById('categoriesContainer');
    if (!categoriesContainer) {
        console.error('Conteneur de catégories non trouvé');
        return;
    }
    
    // Vider le conteneur
    categoriesContainer.innerHTML = '';
    
    // Trouver le template dans les catégories par défaut
    let defaultCategories = [];
    
    // Récupérer les catégories par défaut depuis les variables globales si disponibles
    try {
        if (typeof DEFAULT_TEMPLATES !== 'undefined' && DEFAULT_TEMPLATES[templateName]) {
            defaultCategories = DEFAULT_TEMPLATES[templateName];
        } else if (typeof DEFAULT_CATEGORIES !== 'undefined' && DEFAULT_CATEGORIES[templateName]) {
            defaultCategories = DEFAULT_CATEGORIES[templateName];
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des catégories par défaut:', error);
    }
    
    // Si on a des catégories par défaut, les ajouter
    if (defaultCategories && defaultCategories.length > 0) {
        // Convertir au format attendu si nécessaire
        const categories = defaultCategories.map(cat => {
            return {
                name: cat.name || cat.nom || '',
                amount: cat.amount || cat.montant || '0',
                subcategories: (cat.subcategories || cat.sous_categories || []).map(sub => {
                    return {
                        name: sub.name || sub.nom || '',
                        amount: sub.amount || sub.montant || '0',
                        lines: []
                    };
                })
            };
        });
        
        // Charger ces catégories
        loadCategories(categories);
    } else {
        console.warn('Aucune catégorie par défaut trouvée pour le template:', templateName);
    }
}

/**
 * Intercepte la soumission du formulaire
 */
function interceptFormSubmission(project, projectId) {
    const form = document.querySelector('.project-form');
    if (!form) return;
    
    // Sauvegarder l'événement original
    const originalSubmit = form.onsubmit;
    
    // Redéfinir l'événement
    form.onsubmit = function(e) {
        e.preventDefault();
        
        console.log('Soumission du formulaire interceptée pour la mise à jour du projet');
        
        // Collecter les données du formulaire
        const updatedProject = {
            ...project,
            projectName: document.getElementById('projectName')?.value || project.projectName,
            projectDate: document.getElementById('projectDate')?.value || project.projectDate,
            projectEndDate: document.getElementById('projectEndDate')?.value || project.projectEndDate,
            totalBudget: document.getElementById('totalBudget')?.value || project.totalBudget,
            projectStatus: document.getElementById('projectStatus')?.value || project.projectStatus,
            template: document.querySelector('.template-option.selected')?.getAttribute('data-template') || project.template,
            linkToWallet: document.getElementById('linkToWallet')?.checked || false,
            categories: collectCategories()
        };
        
        // Sauvegarder le projet mis à jour
        saveProject(updatedProject, projectId);
        
        return false;
    };
}

/**
 * Collecte les catégories depuis le DOM
 */
function collectCategories() {
    const categories = [];
    const categoryElements = document.querySelectorAll('.expense-category');
    
    categoryElements.forEach(categoryEl => {
        const categoryName = categoryEl.querySelector('.category-name')?.textContent.trim() || '';
        const categoryAmount = categoryEl.querySelector('.category-amount')?.textContent.trim() || '';
        
        const subcategories = [];
        const subcategoryElements = categoryEl.querySelectorAll('.subcategory');
        
        subcategoryElements.forEach(subcategoryEl => {
            const subcategoryName = subcategoryEl.querySelector('.subcategory-name')?.textContent.trim() || '';
            const subcategoryAmount = subcategoryEl.querySelector('.subcategory-amount')?.textContent.trim() || '';
            
            const lines = [];
            const lineElements = subcategoryEl.querySelectorAll('.expense-line');
            
            lineElements.forEach(lineEl => {
                const lineName = lineEl.querySelector('.line-name')?.textContent.trim() || '';
                const lineAmount = lineEl.querySelector('.line-amount')?.textContent.trim() || '';
                
                if (lineName || lineAmount) {
                    lines.push({
                        name: lineName,
                        amount: lineAmount
                    });
                }
            });
            
            if (subcategoryName || subcategoryAmount || lines.length > 0) {
                subcategories.push({
                    name: subcategoryName,
                    amount: subcategoryAmount,
                    lines: lines
                });
            }
        });
        
        if (categoryName || categoryAmount || subcategories.length > 0) {
            categories.push({
                name: categoryName,
                amount: categoryAmount,
                subcategories: subcategories
            });
        }
    });
    
    return categories;
}

/**
 * Sauvegarde le projet
 */
function saveProject(project, projectId) {
    console.log('Sauvegarde du projet:', project);
    
    try {
        // Récupérer tous les projets - clé correcte est 'savedProjects'
        const projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        
        // Trouver l'index du projet à mettre à jour
        const index = projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            // Mettre à jour le projet
            projects[index] = project;
            
            // Sauvegarder tous les projets avec la clé correcte
            localStorage.setItem('savedProjects', JSON.stringify(projects));
            
            // Afficher une notification
            showSaveNotification();
            
            // Rediriger vers la page du projet
            setTimeout(function() {
                window.location.href = 'projet.html?id=' + projectId;
            }, 1000);
        } else {
            console.error('Projet non trouvé dans la liste des projets:', projectId);
            alert('Erreur: Le projet n\'a pas été trouvé. Veuillez réessayer.');
        }
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du projet:', error);
        alert('Une erreur est survenue lors de la sauvegarde du projet. Veuillez réessayer.');
    }
}

/**
 * Affiche une notification après la sauvegarde
 */
function showSaveNotification() {
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = 'save-notification';
    notification.innerHTML = '<i class="fas fa-check-circle"></i> Modifications enregistrées avec succès';
    
    // Styles
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#d4edda';
    notification.style.color = '#155724';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.zIndex = '9999';
    
    // Ajouter au corps du document
    document.body.appendChild(notification);
    
    // Supprimer après 3 secondes
    setTimeout(function() {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}