// Script simplifié pour enregistrer un projet sans perturber les fonctionnalités
// Se concentre uniquement sur la sauvegarde et n'interfère pas avec l'édition.

document.addEventListener('DOMContentLoaded', function() {
    // Ajouter un gestionnaire de clics sur le bouton de sauvegarde
    const saveBtn = document.querySelector('#saveProjectBtn, button[type="submit"]');
    if (saveBtn) {
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            saveProject();
        });
    }
    
    // Si nous sommes en mode édition (avec un ID dans l'URL)
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    const editMode = urlParams.get('edit') === 'true';
    
    if (editMode && projectId) {
        console.log('Mode édition détecté pour le projet:', projectId);
        
        // Changer le titre pour indiquer le mode édition
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.textContent = 'MODIFIER PROJET';
            pageTitle.style.color = '#2979ff';
        }
    }
});

// Fonction pour sauvegarder un projet (nouveau ou modifié)
function saveProject() {
    console.log('Sauvegarde du projet...');
    
    try {
        // Récupérer les données du formulaire
        const projectData = collectProjectData();
        
        // Vérifier si nous sommes en mode édition
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        const editMode = urlParams.get('edit') === 'true';
        
        if (editMode && projectId) {
            // Mode édition: modifier un projet existant
            updateProject(projectId, projectData);
        } else {
            // Mode création: créer un nouveau projet
            createNewProject(projectData);
        }
        
        // Afficher une confirmation
        showSaveConfirmation();
        
        // Redirection vers la liste de projets après un délai
        setTimeout(function() {
            window.location.href = 'index.html';
        }, 1500);
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Une erreur est survenue lors de la sauvegarde du projet. Veuillez réessayer.');
    }
}

// Collecter toutes les données du projet à partir du formulaire
function collectProjectData() {
    const projectData = {};
    
    // Informations de base
    projectData.projectName = document.getElementById('projectName').value || document.getElementById('projectName').textContent;
    projectData.projectDate = document.getElementById('projectDate').value;
    projectData.projectEndDate = document.getElementById('projectEndDate')?.value || '';
    projectData.totalBudget = document.getElementById('totalBudget').value || document.querySelector('.total-budget-amount').textContent;
    
    // Statut et options additionnelles
    const statusSelect = document.getElementById('projectStatus');
    if (statusSelect) {
        projectData.projectStatus = statusSelect.value;
    }
    
    const linkWallet = document.getElementById('linkToWallet');
    if (linkWallet) {
        projectData.linkToWallet = linkWallet.checked;
    }
    
    const createWishlist = document.getElementById('createWishlist');
    if (createWishlist) {
        projectData.createWishlist = createWishlist.checked;
    }
    
    // Template sélectionné
    const selectedTemplate = document.querySelector('.template-option.selected');
    if (selectedTemplate) {
        projectData.template = selectedTemplate.getAttribute('data-template');
    }
    
    // Les catégories de dépenses
    projectData.categories = collectCategories();
    
    return projectData;
}

// Collecter toutes les catégories et leurs données
function collectCategories() {
    const categories = [];
    
    // Sélectionner toutes les catégories
    document.querySelectorAll('.expense-category').forEach(function(categoryEl) {
        const categoryNameEl = categoryEl.querySelector('.category-name');
        const categoryAmountEl = categoryEl.querySelector('.category-amount');
        
        if (categoryNameEl && categoryAmountEl) {
            const category = {
                name: categoryNameEl.textContent.trim(),
                amount: categoryAmountEl.textContent.trim(),
                subcategories: []
            };
            
            // Collecter les sous-catégories
            categoryEl.querySelectorAll('.subcategory').forEach(function(subcategoryEl) {
                const subcategoryNameEl = subcategoryEl.querySelector('.subcategory-name');
                const subcategoryAmountEl = subcategoryEl.querySelector('.subcategory-amount');
                
                if (subcategoryNameEl && subcategoryAmountEl) {
                    const subcategory = {
                        name: subcategoryNameEl.textContent.trim(),
                        amount: subcategoryAmountEl.textContent.trim(),
                        lines: []
                    };
                    
                    // Collecter les lignes de dépense
                    subcategoryEl.querySelectorAll('.expense-line').forEach(function(lineEl) {
                        const lineNameEl = lineEl.querySelector('.expense-line-name');
                        const lineAmountEl = lineEl.querySelector('.expense-line-amount');
                        
                        if (lineNameEl && lineAmountEl) {
                            subcategory.lines.push({
                                name: lineNameEl.textContent.trim() || lineNameEl.value,
                                amount: lineAmountEl.textContent.trim() || lineAmountEl.value
                            });
                        }
                    });
                    
                    category.subcategories.push(subcategory);
                }
            });
            
            categories.push(category);
        }
    });
    
    return categories;
}

// Mettre à jour un projet existant
function updateProject(projectId, projectData) {
    console.log('Mise à jour du projet:', projectId);
    
    // Récupérer tous les projets
    let savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    
    // Trouver l'index du projet à mettre à jour
    const index = savedProjects.findIndex(p => p.id === projectId);
    
    if (index !== -1) {
        // Conserver l'ID et la date de création du projet original
        projectData.id = projectId;
        projectData.createdAt = savedProjects[index].createdAt || new Date().toISOString();
        
        // Mettre à jour le projet
        savedProjects[index] = projectData;
        
        // Sauvegarder la liste mise à jour
        localStorage.setItem('savedProjects', JSON.stringify(savedProjects));
        console.log('Projet mis à jour avec succès');
    } else {
        throw new Error('Projet non trouvé');
    }
}

// Créer un nouveau projet
function createNewProject(projectData) {
    console.log('Création d\'un nouveau projet');
    
    // Générer un ID unique
    projectData.id = Date.now().toString();
    projectData.createdAt = new Date().toISOString();
    
    // Récupérer les projets existants
    let savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    
    // Ajouter le nouveau projet
    savedProjects.push(projectData);
    
    // Sauvegarder la liste mise à jour
    localStorage.setItem('savedProjects', JSON.stringify(savedProjects));
    console.log('Nouveau projet créé avec succès');
}

// Afficher une confirmation de sauvegarde
function showSaveConfirmation() {
    const confirmationMessage = document.createElement('div');
    confirmationMessage.className = 'save-confirmation';
    confirmationMessage.textContent = '✅ Projet sauvegardé avec succès!';
    confirmationMessage.style.position = 'fixed';
    confirmationMessage.style.bottom = '20px';
    confirmationMessage.style.right = '20px';
    confirmationMessage.style.backgroundColor = '#4CAF50';
    confirmationMessage.style.color = 'white';
    confirmationMessage.style.padding = '10px 20px';
    confirmationMessage.style.borderRadius = '4px';
    confirmationMessage.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    confirmationMessage.style.zIndex = '9999';
    
    document.body.appendChild(confirmationMessage);
    
    // Supprimer le message après un délai
    setTimeout(function() {
        confirmationMessage.style.opacity = '0';
        confirmationMessage.style.transition = 'opacity 0.5s ease';
        
        setTimeout(function() {
            confirmationMessage.remove();
        }, 500);
    }, 1000);
}