/**
 * Correctif anti-effacement pour l'édition de projet
 * 
 * Ce script empêche la réinitialisation des données lors de l'édition d'un projet.
 * Il s'assure que les projets existants restent intacts lorsqu'on les modifie.
 */

// On exécute ceci avant tout autre code
(function() {
    // Remplacer immédiatement la fonction de mise à jour du template
    window.updateTemplateCategoriesUI = function(templateName) {
        console.log('FONCTION SÉCURISÉE: Changement de template avec préservation des données:', templateName);
        
        // Vérifier si nous sommes en mode édition
        const urlParams = new URLSearchParams(window.location.search);
        const isEditMode = urlParams.get('edit') === 'true';
        const projectId = urlParams.get('id');
        
        if (isEditMode && projectId) {
            console.log('En mode édition, on préserve les données existantes');
            
            // Récupérer le projet depuis localStorage
            const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
            const project = savedProjects.find(p => p.id === projectId);
            
            if (project) {
                console.log('Projet trouvé, on conserve les catégories existantes');
                
                // On modifie uniquement le titre du template et la sélection visuelle
                const projectTypeElement = document.querySelector('.project-type');
                if (projectTypeElement) {
                    projectTypeElement.textContent = templateName;
                }
                
                document.querySelectorAll('.template-option').forEach(option => {
                    option.classList.remove('selected');
                    if (option.getAttribute('data-template') === templateName) {
                        option.classList.add('selected');
                    }
                });
                
                // On NE TOUCHE PAS aux catégories existantes
                return;
            }
        }
        
        // Si on n'est pas en mode édition ou si le projet n'est pas trouvé,
        // on utilise le comportement par défaut (créer des catégories basées sur le template)
        console.log('Mode standard: chargement des catégories par défaut pour le template:', templateName);
        
        // On cherche dans les conteneurs de catégories pour les remplacer
        const categoriesContainer = document.getElementById('categoriesContainer');
        if (!categoriesContainer) {
            console.warn('Conteneur de catégories non trouvé');
            return;
        }
        
        // Vider le conteneur
        categoriesContainer.innerHTML = '';
        
        // Rechercher les catégories par défaut pour ce template
        let categories = [];
        
        try {
            // Essayer de trouver les catégories par défaut
            if (typeof DEFAULT_TEMPLATES !== 'undefined' && DEFAULT_TEMPLATES[templateName]) {
                categories = DEFAULT_TEMPLATES[templateName];
            } else if (typeof DEFAULT_CATEGORIES !== 'undefined' && DEFAULT_CATEGORIES[templateName]) {
                categories = DEFAULT_CATEGORIES[templateName];
            } else {
                console.warn('Aucune catégorie par défaut trouvée pour le template:', templateName);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des catégories par défaut:', error);
        }
        
        // Ajouter les catégories par défaut
        if (categories && categories.length > 0) {
            console.log('Ajout des catégories par défaut pour le template:', templateName);
            
            categories.forEach(category => {
                // Créer l'élément de catégorie
                const categoryElement = document.createElement('div');
                categoryElement.className = 'expense-category';
                categoryElement.innerHTML = `
                    <div class="category-header">
                        <div class="category-name" contenteditable="true">${category.name || category.nom || ''}</div>
                        <div class="category-amount" contenteditable="true">0</div>
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
                
                // Ajouter au conteneur
                categoriesContainer.appendChild(categoryElement);
                
                // Récupérer le conteneur de sous-catégories
                const subcategoriesContainer = categoryElement.querySelector('.subcategories-container');
                
                // Ajouter les sous-catégories par défaut
                const subcategories = category.subcategories || category.sous_categories || [];
                
                subcategories.forEach(subcategory => {
                    // Créer l'élément de sous-catégorie
                    const subcategoryElement = document.createElement('div');
                    subcategoryElement.className = 'subcategory';
                    subcategoryElement.innerHTML = `
                        <div class="subcategory-header">
                            <div class="subcategory-name" contenteditable="true">${subcategory.name || subcategory.nom || ''}</div>
                            <div class="subcategory-amount" contenteditable="true">0</div>
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
                    
                    // Ajouter au conteneur
                    subcategoriesContainer.appendChild(subcategoryElement);
                });
            });
            
            // Réinitialiser les écouteurs d'événements
            setTimeout(function() {
                console.log('Réinitialisation des écouteurs d\'événements après l\'ajout des catégories par défaut');
                
                if (typeof attachBudgetAmountListeners === 'function') {
                    attachBudgetAmountListeners();
                }
                
                if (typeof makeSubcategoriesEditableByDefault === 'function') {
                    makeSubcategoriesEditableByDefault();
                }
                
                if (typeof fixAllEditableElements === 'function') {
                    fixAllEditableElements();
                }
                
                if (typeof initCategoryDeletionButtons === 'function') {
                    initCategoryDeletionButtons();
                }
            }, 200);
        }
    };
})();

// Attendre que le DOM soit chargé pour le reste
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation du correctif anti-effacement pour l\'édition de projet');
    
    // Vérifier si nous sommes en mode édition
    const urlParams = new URLSearchParams(window.location.search);
    const isEditMode = urlParams.get('edit') === 'true';
    const projectId = urlParams.get('id');
    
    if (isEditMode && projectId) {
        console.log('Mode édition détecté, ID:', projectId);
        
        // Le plus tôt possible, remplir le formulaire avec les données du projet
        loadProject(projectId);
    }
});

/**
 * Charge les données d'un projet depuis localStorage et remplit le formulaire
 */
function loadProject(projectId) {
    // Si le projet est déjà chargé, ne rien faire
    if (window._projectLoaded) {
        console.log('Projet déjà chargé, on ne le recharge pas');
        return;
    }
    
    console.log('Chargement du projet:', projectId);
    
    try {
        // Charger les projets depuis localStorage
        const projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
            console.log('Projet trouvé:', project);
            
            // Marquer le projet comme chargé pour éviter les rechargements
            window._projectLoaded = true;
            
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
            
            // Remplir le formulaire
            populateForm(project);
            
            // Intercepter la soumission du formulaire
            interceptFormSubmit(project);
        } else {
            console.error('Projet non trouvé:', projectId);
        }
    } catch (error) {
        console.error('Erreur lors du chargement du projet:', error);
    }
}

/**
 * Remplit le formulaire avec les données du projet
 */
function populateForm(project) {
    console.log('Remplissage du formulaire avec les données du projet');
    
    // Champs de base
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
        
        // Mettre à jour le titre du type de projet
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
    
    // Vider le conteneur
    categoriesContainer.innerHTML = '';
    
    // Ajouter les catégories
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
        
        // Ajouter au conteneur
        categoriesContainer.appendChild(categoryElement);
        
        // Récupérer le conteneur de sous-catégories
        const subcategoriesContainer = categoryElement.querySelector('.subcategories-container');
        
        // Ajouter les sous-catégories
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
                
                // Ajouter au conteneur
                subcategoriesContainer.appendChild(subcategoryElement);
                
                // Récupérer le conteneur de lignes
                const linesContainer = subcategoryElement.querySelector('.expense-lines');
                
                // Ajouter les lignes
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
                        
                        // Ajouter au conteneur
                        linesContainer.appendChild(lineElement);
                    });
                }
            });
        }
    });
    
    // Réinitialiser les écouteurs d'événements
    setTimeout(function() {
        console.log('Réinitialisation des écouteurs d\'événements après le chargement des catégories');
        
        if (typeof attachBudgetAmountListeners === 'function') {
            attachBudgetAmountListeners();
        }
        
        if (typeof makeSubcategoriesEditableByDefault === 'function') {
            makeSubcategoriesEditableByDefault();
        }
        
        if (typeof fixAllEditableElements === 'function') {
            fixAllEditableElements();
        }
        
        if (typeof initCategoryDeletionButtons === 'function') {
            initCategoryDeletionButtons();
        }
        
        if (typeof updateTotals === 'function') {
            updateTotals();
        }
    }, 200);
}

/**
 * Intercepte la soumission du formulaire
 */
function interceptFormSubmit(project) {
    const form = document.querySelector('.project-form');
    if (!form) return;
    
    // Sauvegarder l'événement original
    const originalSubmit = form.onsubmit;
    
    // Remplacer par notre version
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
        
        // Sauvegarder le projet
        saveProject(updatedProject, project.id);
        
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
        // IMPORTANT: Ne pas écraser accidentellement des données
        // On vérifie d'abord si les projets existent déjà
        const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        
        // Trouver l'index du projet à mettre à jour
        const index = savedProjects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            // Mettre à jour le projet existant
            savedProjects[index] = project;
        } else {
            // Si par hasard le projet n'existe pas, l'ajouter
            savedProjects.push(project);
        }
        
        // Sauvegarder tous les projets
        localStorage.setItem('savedProjects', JSON.stringify(savedProjects));
        
        // Afficher une notification de succès
        showSaveNotification();
        
        // Rediriger vers la page du projet
        setTimeout(function() {
            window.location.href = 'projet.html?id=' + projectId;
        }, 1000);
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