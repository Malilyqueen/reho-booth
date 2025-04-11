/**
 * Solution radicale pour le problème d'édition de projet
 * 
 * Au lieu d'essayer de corriger la page d'édition, nous allons :
 * 1. Créer une copie du projet
 * 2. Supprimer l'original
 * 3. Modifier la copie en tant que "nouveau projet"
 * 4. Utiliser l'ID original pour la sauvegarde
 * 
 * Cette approche contourne complètement le problème de modification
 */

// Fonction globale pour l'édition par copie
window.editProjectViaCopy = function(projectId) {
    console.log("Lancement de l'édition par copie pour le projet:", projectId);
    
    if (!projectId) {
        console.error("ID de projet manquant");
        return;
    }
    
    try {
        // 1. Récupérer le projet original
        const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        const projectIndex = savedProjects.findIndex(p => p.id === projectId);
        
        if (projectIndex === -1) {
            console.error("Projet non trouvé:", projectId);
            return;
        }
        
        // Sauvegarder le projet original dans le sessionStorage pour référence ultérieure
        const originalProject = savedProjects[projectIndex];
        sessionStorage.setItem('originalProjectForEdit', JSON.stringify(originalProject));
        
        console.log("Projet original sauvegardé:", originalProject);
        
        // 2. Rediriger vers la page de création avec un flag spécial
        window.location.href = 'nouveau-projet.html?copyedit=true&originalId=' + projectId;
    } catch (error) {
        console.error("Erreur lors de l'édition par copie:", error);
        alert("Une erreur est survenue lors de la préparation de l'édition. Veuillez réessayer.");
    }
};

// Ce script s'exécute sur la page de création de projet
document.addEventListener('DOMContentLoaded', function() {
    console.log("Vérification du mode d'édition par copie");
    
    // Vérifier si nous sommes en mode copyedit
    const urlParams = new URLSearchParams(window.location.search);
    const isCopyEditMode = urlParams.get('copyedit') === 'true';
    const originalProjectId = urlParams.get('originalId');
    
    if (isCopyEditMode && originalProjectId) {
        console.log("Mode d'édition par copie détecté pour le projet:", originalProjectId);
        
        // Récupérer le projet original depuis sessionStorage
        const originalProjectJson = sessionStorage.getItem('originalProjectForEdit');
        
        if (!originalProjectJson) {
            console.error("Données du projet original non trouvées");
            return;
        }
        
        try {
            // Charger les données du projet
            const originalProject = JSON.parse(originalProjectJson);
            console.log("Projet original chargé:", originalProject);
            
            // Changer le titre de la page
            const pageTitle = document.querySelector('.page-title');
            if (pageTitle) {
                pageTitle.innerHTML = '<i class="fas fa-edit"></i> MODIFIER PROJET';
                pageTitle.style.color = '#007bff';
            }
            
            // Changer le titre du bouton
            const submitButton = document.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.textContent = 'Enregistrer les modifications';
                submitButton.classList.add('btn-success');
            }
            
            // Remplir le formulaire avec les données du projet
            setTimeout(() => {
                fillFormWithProject(originalProject);
                
                // Intercepter la soumission du formulaire
                const form = document.querySelector('form.project-form');
                if (form) {
                    // Sauvegarder l'écouteur d'événements original
                    const originalSubmitHandler = form.onsubmit;
                    
                    // Remplacer par notre gestionnaire
                    form.onsubmit = function(e) {
                        e.preventDefault();
                        
                        console.log("Soumission du formulaire interceptée");
                        
                        // Collecter les données du formulaire
                        const formData = collectFormData();
                        
                        // Ajouter l'ID original
                        formData.id = originalProject.id;
                        formData.createdAt = originalProject.createdAt;
                        
                        // Sauvegarder le projet modifié
                        saveModifiedProject(formData, originalProject.id);
                        
                        return false;
                    };
                }
            }, 500);
        } catch (error) {
            console.error("Erreur lors du chargement du projet:", error);
        }
    }
});

// Remplir le formulaire avec les données du projet
function fillFormWithProject(project) {
    console.log("Remplissage du formulaire avec les données du projet");
    
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
        console.log("Sélection du template:", project.template);
        
        const templateElements = document.querySelectorAll('.template-option');
        templateElements.forEach(el => {
            el.classList.remove('selected');
            
            if (el.getAttribute('data-template') === project.template) {
                el.classList.add('selected');
                
                // Activer son accordéon parent si nécessaire
                const accordionContent = el.closest('.accordion-content');
                if (accordionContent) {
                    // Fermer tous les autres accordéons d'abord
                    document.querySelectorAll('.accordion-content').forEach(content => {
                        content.style.display = 'none';
                        const header = content.previousElementSibling;
                        if (header) {
                            header.classList.remove('active');
                            const icon = header.querySelector('i');
                            if (icon) icon.className = 'fas fa-chevron-down';
                        }
                    });
                    
                    // Ouvrir cet accordéon
                    accordionContent.style.display = 'block';
                    const header = accordionContent.previousElementSibling;
                    if (header) {
                        header.classList.add('active');
                        const icon = header.querySelector('i');
                        if (icon) icon.className = 'fas fa-chevron-up';
                    }
                }
                
                // Mettre à jour le titre du type de projet
                const projectTypeElement = document.querySelector('.project-type');
                if (projectTypeElement) {
                    projectTypeElement.textContent = project.template;
                }
            }
        });
    }
    
    // Attendre un peu que les éléments par défaut soient chargés,
    // puis remplacer les catégories par celles du projet
    setTimeout(() => {
        if (project.categories && project.categories.length > 0) {
            replaceAllCategories(project.categories);
        }
    }, 1000);
}

// Remplacer toutes les catégories du formulaire
function replaceAllCategories(categories) {
    console.log("Remplacement des catégories:", categories);
    
    const container = document.getElementById('categoriesContainer');
    if (!container) {
        console.error("Conteneur de catégories non trouvé");
        return;
    }
    
    // Vider le conteneur
    container.innerHTML = '';
    
    // Ajouter chaque catégorie
    categories.forEach(category => {
        // Créer l'élément de catégorie
        const categoryElement = document.createElement('div');
        categoryElement.className = 'expense-category';
        categoryElement.innerHTML = `
            <div class="category-header">
                <div class="category-name" contenteditable="true">${category.name || ''}</div>
                <div class="category-amount" contenteditable="true">${category.amount || '0'}</div>
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
        container.appendChild(categoryElement);
        
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
                        <div class="subcategory-amount" contenteditable="true">${subcategory.amount || '0'}</div>
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
                            <div class="line-amount" contenteditable="true">${line.amount || '0'}</div>
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
    
    // Réinitialiser les écouteurs d'événements pour les actions
    const initializerFunctions = [
        'attachCategoryEventListeners',
        'attachBudgetAmountListeners',
        'makeSubcategoriesEditableByDefault',
        'fixAllEditableElements',
        'initCategoryDeletionButtons',
        'setupLineEventListeners'
    ];
    
    initializerFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            try {
                window[funcName]();
            } catch (error) {
                console.warn(`Erreur lors de l'initialisation de ${funcName}:`, error);
            }
        }
    });
}

// Collecter les données du formulaire
function collectFormData() {
    console.log("Collecte des données du formulaire");
    
    const formData = {
        projectName: document.getElementById('projectName')?.value || '',
        projectDate: document.getElementById('projectDate')?.value || '',
        projectEndDate: document.getElementById('projectEndDate')?.value || '',
        totalBudget: document.getElementById('totalBudget')?.value || '',
        projectStatus: document.getElementById('projectStatus')?.value || 'inProgress',
        linkToWallet: document.getElementById('linkToWallet')?.checked || false
    };
    
    // Récupérer le template sélectionné
    const selectedTemplate = document.querySelector('.template-option.selected');
    if (selectedTemplate) {
        formData.template = selectedTemplate.getAttribute('data-template');
    }
    
    // Récupérer les catégories
    formData.categories = collectCategories();
    
    return formData;
}

// Collecter les catégories
function collectCategories() {
    const categories = [];
    
    // Récupérer tous les éléments de catégorie
    const categoryElements = document.querySelectorAll('.expense-category');
    
    categoryElements.forEach(categoryElement => {
        const categoryName = categoryElement.querySelector('.category-name')?.textContent || '';
        const categoryAmount = categoryElement.querySelector('.category-amount')?.textContent || '';
        
        const subcategories = [];
        
        // Récupérer toutes les sous-catégories de cette catégorie
        const subcategoryElements = categoryElement.querySelectorAll('.subcategory');
        
        subcategoryElements.forEach(subcategoryElement => {
            const subcategoryName = subcategoryElement.querySelector('.subcategory-name')?.textContent || '';
            const subcategoryAmount = subcategoryElement.querySelector('.subcategory-amount')?.textContent || '';
            
            const lines = [];
            
            // Récupérer toutes les lignes de cette sous-catégorie
            const lineElements = subcategoryElement.querySelectorAll('.expense-line');
            
            lineElements.forEach(lineElement => {
                const lineName = lineElement.querySelector('.line-name')?.textContent || '';
                const lineAmount = lineElement.querySelector('.line-amount')?.textContent || '';
                
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

// Sauvegarder le projet modifié
function saveModifiedProject(project, originalId) {
    console.log("Sauvegarde du projet modifié avec ID:", originalId);
    
    try {
        // Charger tous les projets existants
        const allProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        
        // Trouver l'index du projet original
        const projectIndex = allProjects.findIndex(p => p.id === originalId);
        
        if (projectIndex !== -1) {
            // Remplacer le projet original par la version modifiée
            allProjects[projectIndex] = project;
            
            // Sauvegarder la liste mise à jour
            localStorage.setItem('savedProjects', JSON.stringify(allProjects));
            
            // Notification de succès
            showSaveNotification();
            
            // Rediriger vers la page de détails du projet
            setTimeout(() => {
                window.location.href = 'projet.html?id=' + originalId;
            }, 1500);
        } else {
            console.error("Projet original non trouvé:", originalId);
            alert("Erreur: Le projet original n'a pas été trouvé.");
        }
    } catch (error) {
        console.error("Erreur lors de la sauvegarde du projet:", error);
        alert("Une erreur est survenue lors de la sauvegarde du projet.");
    }
}

// Afficher une notification de sauvegarde réussie
function showSaveNotification() {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = 'save-notification';
    notification.innerHTML = '<i class="fas fa-check-circle"></i> Modifications enregistrées avec succès';
    
    // Appliquer des styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#d4edda',
        color: '#155724',
        padding: '15px 20px',
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: '9999'
    });
    
    // Ajouter au document
    document.body.appendChild(notification);
    
    // Supprimer après quelques secondes
    setTimeout(() => {
        notification.remove();
    }, 3000);
}