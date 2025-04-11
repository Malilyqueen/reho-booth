// Script simplifié pour enregistrer un projet sans perturber les fonctionnalités
// Se concentre uniquement sur la sauvegarde et n'interfère pas avec l'édition.

document.addEventListener('DOMContentLoaded', function() {
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
        
        // CORRECTION: Ajouter un bouton clair pour enregistrer les modifications
        addSaveButton(projectId);
    }
    
    // Gérer les boutons de sauvegarde existants
    const saveBtn = document.querySelector('#saveProjectBtn, button[type="submit"]');
    if (saveBtn) {
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            saveProject();
        });
    }
    
    // CORRECTION: Supprimer les lignes par défaut vides ou non modifiables
    setTimeout(removeEmptyDefaultLines, 500);
});

// Fonction pour supprimer les lignes par défaut non désirées
function removeEmptyDefaultLines() {
    console.log("Suppression des lignes par défaut vides...");
    
    // Chercher toutes les lignes de dépense
    document.querySelectorAll('.expense-line').forEach(function(line) {
        const nameEl = line.querySelector('.expense-line-name');
        const amountEl = line.querySelector('.expense-line-amount');
        
        // Vérifier si la ligne est vide ou contient juste des valeurs par défaut
        if (nameEl && amountEl) {
            const name = nameEl.textContent.trim();
            const amount = amountEl.textContent.trim();
            
            // Si le nom est vide ou contient un texte générique par défaut
            if (!name || name === '' || 
                name.includes('Ligne') || name.includes('ligne') || 
                name.includes('default') || name.includes('Default')) {
                
                // Supprimer cette ligne non désirée
                console.log("Suppression d'une ligne vide ou par défaut:", name);
                line.remove();
            }
        }
    });
}

// Fonction pour ajouter un bouton de sauvegarde clair
function addSaveButton(projectId) {
    console.log("Ajout du bouton de sauvegarde pour l'édition...");
    
    // Vérifier si un bouton de sauvegarde existe déjà
    if (document.getElementById('saveChangesBtn')) {
        return; // Ne pas dupliquer le bouton
    }
    
    // Créer un conteneur pour le bouton en bas du formulaire s'il n'existe pas déjà
    let formActions = document.querySelector('.form-actions');
    if (!formActions) {
        // Créer un nouveau conteneur pour le bouton
        formActions = document.createElement('div');
        formActions.className = 'form-actions';
        formActions.style.marginTop = '30px';
        formActions.style.textAlign = 'center';
        formActions.style.padding = '20px 0';
        
        // Trouver un bon endroit pour insérer le bouton
        const form = document.querySelector('form');
        if (form) {
            form.appendChild(formActions);
        } else {
            // Alternative: ajouter à la fin de la page
            const content = document.querySelector('.content');
            if (content) {
                content.appendChild(formActions);
            } else {
                document.body.appendChild(formActions);
            }
        }
    }
    
    // Créer le bouton d'enregistrement
    const saveButton = document.createElement('button');
    saveButton.id = 'saveChangesBtn';
    saveButton.className = 'btn-primary btn-save';
    saveButton.type = 'button';
    saveButton.innerHTML = '<i class="fas fa-save"></i> ✅ Enregistrer les modifications';
    saveButton.style.backgroundColor = '#4CAF50'; // Vert
    saveButton.style.color = 'white';
    saveButton.style.padding = '12px 24px';
    saveButton.style.fontSize = '16px';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '4px';
    saveButton.style.cursor = 'pointer';
    saveButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    saveButton.style.margin = '0 10px';
    
    // Ajouter l'événement de sauvegarde
    saveButton.addEventListener('click', function() {
        saveProject();
    });
    
    // Ajouter le bouton au conteneur
    formActions.appendChild(saveButton);
}

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