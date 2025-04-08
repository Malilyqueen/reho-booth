// Main JavaScript file for MaPocket application

document.addEventListener('DOMContentLoaded', function() {
    console.log('MaPocket application initialized');
    
    // Initialize the UI elements
    initializeUI();
    
    // Charger la liste des projets
    loadProjectsList();
    
    // Initialiser le bouton de réinitialisation
    const resetButton = document.getElementById('resetStorage');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            if (confirm('Êtes-vous sûr de vouloir réinitialiser l\'application ? Tous les projets seront supprimés.')) {
                localStorage.removeItem('savedProjects');
                localStorage.removeItem('currentProject');
                showNotification('Application réinitialisée');
                loadProjectsList();
                updateDashboardStats();
            }
        });
    }
});

function initializeUI() {
    // Mobile menu toggle (for responsive design)
    const moreMenu = document.querySelector('.more-menu');
    if (moreMenu) {
        moreMenu.addEventListener('click', function() {
            console.log('Menu clicked');
            // In a full implementation, this would toggle a dropdown menu
        });
    }
    
    // Add event listeners to action buttons
    const actionButtons = document.querySelectorAll('.action-buttons .btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!this.getAttribute('href')) {
                e.preventDefault();
                const action = this.textContent.trim();
                console.log(`Action triggered: ${action}`);
                
                if (action === 'Ajouter une dépense') {
                    // In a full implementation, this would open a modal or navigate to the expense page
                    alert('Fonctionnalité à venir: Ajouter une dépense');
                }
            }
        });
    });
    
    // Mettre à jour les statistiques
    updateDashboardStats();
    
    // Simulate data loading for charts (in a real application, this would fetch data from an API)
    simulateDataLoading();
}

function loadProjectsList() {
    // Récupérer les projets depuis le localStorage
    let projects = [];
    try {
        const savedProjectsData = localStorage.getItem('savedProjects');
        console.log('Données brutes des projets:', savedProjectsData);
        projects = JSON.parse(savedProjectsData || '[]');
        
        if (!Array.isArray(projects)) {
            console.error('Format de données incorrect pour savedProjects:', projects);
            projects = [];
        }
    } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        projects = [];
    }
    
    console.log('Projets chargés:', projects);
    
    const projectsList = document.querySelector('.projects-list');
    const emptyMessage = document.querySelector('.empty-projects-message');
    
    if (!projectsList) {
        console.error('Élément .projects-list non trouvé dans le DOM');
        return;
    }
    
    // Vider la liste actuelle
    projectsList.innerHTML = '';
    
    // Afficher un message si aucun projet n'existe
    if (projects.length === 0) {
        if (emptyMessage) {
            emptyMessage.style.display = 'block';
        }
        return;
    } else if (emptyMessage) {
        emptyMessage.style.display = 'none';
    }
    
    // Afficher chaque projet
    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.setAttribute('data-id', project.id);
        
        // Date formatée
        const projectDate = project.projectDate ? new Date(project.projectDate) : new Date();
        const formattedDate = projectDate.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        // Icône du type de projet
        let typeIcon = 'fa-file';
        if (project.template === 'Mariage') typeIcon = 'fa-ring';
        else if (project.template === 'Anniversaire') typeIcon = 'fa-birthday-cake';
        else if (project.template === 'Vacances') typeIcon = 'fa-umbrella-beach';
        else if (project.template === 'Rénovation') typeIcon = 'fa-hammer';
        else if (project.template === 'Événement') typeIcon = 'fa-calendar-day';
        
        projectCard.innerHTML = `
            <div class="project-info">
                <h4 class="project-title">${project.projectName || 'Sans titre'}</h4>
                <div class="project-details">
                    <div class="project-type">
                        <i class="fas ${typeIcon}"></i>
                        <span>${project.template || 'Personnalisé'}</span>
                    </div>
                    <div class="project-date">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="project-budget">
                        <i class="fas fa-euro-sign"></i>
                        <span>${project.totalBudget || '0'} €</span>
                    </div>
                </div>
            </div>
            <div class="project-actions">
                <button type="button" class="btn-action btn-duplicate" title="Dupliquer">
                    <i class="fas fa-copy"></i>
                </button>
                <button type="button" class="btn-action btn-edit" title="Modifier">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn-action btn-delete" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Ajouter à la liste
        projectsList.appendChild(projectCard);
        
        // Initialiser les boutons d'action
        initializeProjectActions(projectCard);
    });
}

function initializeProjectActions(projectCard) {
    const projectId = projectCard.getAttribute('data-id');
    
    // Bouton de duplication
    const duplicateBtn = projectCard.querySelector('.btn-duplicate');
    if (duplicateBtn) {
        duplicateBtn.addEventListener('click', function() {
            duplicateProject(projectId);
        });
    }
    
    // Bouton d'édition
    const editBtn = projectCard.querySelector('.btn-edit');
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            editProject(projectId);
        });
    }
    
    // Bouton de suppression
    const deleteBtn = projectCard.querySelector('.btn-delete');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            deleteProject(projectId);
        });
    }
}

function duplicateProject(projectId) {
    // Récupérer tous les projets
    let projects = [];
    try {
        projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        if (!Array.isArray(projects)) {
            console.error('Format de données incorrect pour savedProjects dans duplicateProject:', projects);
            projects = [];
        }
    } catch (error) {
        console.error('Erreur lors du chargement des projets dans duplicateProject:', error);
        projects = [];
    }
    
    // Trouver le projet à dupliquer
    const projectToDuplicate = projects.find(p => p.id === projectId);
    
    if (projectToDuplicate) {
        // Créer une copie du projet
        const duplicatedProject = JSON.parse(JSON.stringify(projectToDuplicate));
        
        // Mettre à jour les propriétés pour la nouvelle copie
        duplicatedProject.id = Date.now().toString();
        duplicatedProject.projectName = `${duplicatedProject.projectName || 'Sans titre'} (copie)`;
        duplicatedProject.createdAt = new Date().toISOString();
        
        // Ajouter à la liste des projets
        projects.push(duplicatedProject);
        localStorage.setItem('savedProjects', JSON.stringify(projects));
        
        // Notifier l'utilisateur
        showNotification('Projet dupliqué avec succès !');
        
        // Rafraîchir la liste des projets
        loadProjectsList();
        
        // Mettre à jour les statistiques
        updateDashboardStats();
    }
}

function editProject(projectId) {
    // Récupérer tous les projets
    const projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    
    // Trouver le projet à éditer
    const projectToEdit = projects.find(p => p.id === projectId);
    
    if (projectToEdit) {
        // Sauvegarder le projet en cours d'édition dans le localStorage
        localStorage.setItem('currentProject', JSON.stringify(projectToEdit));
        
        // Rediriger vers la page d'édition
        window.location.href = 'nouveau-projet.html?edit=true';
    }
}

function deleteProject(projectId) {
    // Demander confirmation
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
        // Récupérer tous les projets
        const projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        
        // Filtrer pour exclure le projet à supprimer
        const updatedProjects = projects.filter(p => p.id !== projectId);
        
        // Mettre à jour le localStorage
        localStorage.setItem('savedProjects', JSON.stringify(updatedProjects));
        
        // Notifier l'utilisateur
        showNotification('Projet supprimé');
        
        // Rafraîchir la liste des projets
        loadProjectsList();
        
        // Mettre à jour les statistiques
        updateDashboardStats();
    }
}

function updateDashboardStats() {
    // Récupérer tous les projets
    let projects = [];
    try {
        projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        if (!Array.isArray(projects)) {
            console.error('Format de données incorrect pour savedProjects dans updateDashboardStats:', projects);
            projects = [];
        }
    } catch (error) {
        console.error('Erreur lors du chargement des projets dans updateDashboardStats:', error);
        projects = [];
    }
    
    console.log('Statistiques des projets à mettre à jour:', projects.length, 'projets trouvés');
    
    // Mettre à jour le nombre de projets
    const projectsCountElement = document.querySelector('.stat-card:nth-child(1) .stat-value');
    if (projectsCountElement) {
        projectsCountElement.textContent = projects.length;
    }
    
    // Calculer le budget global
    let totalBudget = 0;
    projects.forEach(project => {
        const budget = parseFloat(project.totalBudget?.replace(/[^0-9.]/g, '') || 0);
        totalBudget += budget;
    });
    
    // Mettre à jour le budget global
    const globalBudgetElement = document.querySelector('.stat-card:nth-child(2) .stat-value');
    if (globalBudgetElement) {
        globalBudgetElement.textContent = `€ ${totalBudget}`;
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'temporary-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Supprimer la notification après 3 secondes
    setTimeout(function() {
        notification.classList.add('fade-out');
        setTimeout(function() {
            notification.remove();
        }, 500);
    }, 2500);
}

function simulateDataLoading() {
    // This function simulates loading data for the charts and other dynamic elements
    // In a real application, you would fetch this data from an API or database
    
    setTimeout(() => {
        console.log('Data loaded successfully');
        
        // Update the charts (in a real implementation)
        // updateCharts(data);
    }, 500);
}