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
                localStorage.removeItem('walletData');
                showNotification('Application réinitialisée');
                loadProjectsList();
                updateDashboardStats();
            }
        });
    }
    
    // Configuration pour actualiser la liste des projets lorsque l'utilisateur revient sur la page
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            console.log('Utilisateur revenu sur la page, actualisation des projets');
            loadProjectsList();
            updateDashboardStats();
        }
    });
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
    
    console.log('Projets chargés:', projects.length);
    
    const projectsTableBody = document.getElementById('projectsTableBody');
    const emptyMessage = document.querySelector('.empty-projects-message');
    
    if (!projectsTableBody) {
        console.error('Élément #projectsTableBody non trouvé dans le DOM');
        return;
    }
    
    // Vider le tableau actuel
    projectsTableBody.innerHTML = '';
    
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
    console.log('Début du rendu des projets dans le tableau');
    projects.forEach((project, index) => {
        console.log(`Rendu du projet ${index+1}/${projects.length}:`, project.projectName);
        
        const row = document.createElement('tr');
        if (project.id) {
            row.setAttribute('data-id', project.id);
        } else {
            console.error('Projet sans ID:', project);
            row.setAttribute('data-id', 'sans-id-' + Date.now() + '-' + index);
        }
        row.classList.add('project-row');
        
        // Calculer le budget total et les dépenses
        const budgetTotal = parseFloat(project.totalBudget?.replace(/[^0-9.]/g, '') || 0);
        
        // Calculer les dépenses totales en additionnant toutes les catégories
        let depensesTotal = 0;
        if (project.categories && Array.isArray(project.categories)) {
            project.categories.forEach(category => {
                const categoryAmount = parseFloat(category.amount?.replace(/[^0-9.]/g, '') || 0);
                depensesTotal += categoryAmount;
            });
        }
        
        // Calculer le pourcentage d'utilisation
        const utilizationPercent = budgetTotal > 0 ? Math.round((depensesTotal / budgetTotal) * 100) : 0;
        
        // Déterminer le statut
        let statusClass = 'success';
        if (utilizationPercent >= 90 && utilizationPercent < 100) {
            statusClass = 'warning';
        } else if (utilizationPercent >= 100) {
            statusClass = 'danger';
        }
        
        // Date formatée
        let formattedDate = 'Non définie';
        if (project.projectDate) {
            try {
                // Essayer de convertir directement si c'est déjà au format JJ/MM/AAAA
                if (project.projectDate.includes('/')) {
                    formattedDate = project.projectDate;
                } else {
                    const projectDate = new Date(project.projectDate);
                    formattedDate = projectDate.toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                }
                console.log('Date formatée:', formattedDate);
            } catch (e) {
                console.error('Erreur de formatage de date:', e);
                formattedDate = project.projectDate;
            }
        }
        
        // Construire la ligne du tableau
        row.innerHTML = `
            <td class="project-name">
                <a href="#" class="project-link" title="Voir les détails">
                    ${project.projectName || 'Sans titre'}
                </a>
            </td>
            <td>${formattedDate}</td>
            <td>${budgetTotal} €</td>
            <td>${depensesTotal} €</td>
            <td>
                <div class="progress-container">
                    <div class="progress-bar ${statusClass}" style="width: ${Math.min(utilizationPercent, 100)}%"></div>
                </div>
                <span class="utilization-text">${utilizationPercent}%</span>
            </td>
            <td>
                <span class="status-indicator ${statusClass}" title="${statusClass === 'danger' ? 'Dépassement' : statusClass === 'warning' ? 'Attention' : 'Normal'}"></span>
            </td>
            <td>
                <div class="project-actions">
                    <button type="button" class="btn-action btn-view" title="Voir">
                        <i class="fas fa-eye"></i>
                    </button>
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
            </td>
        `;
        
        // Ajouter à la liste
        projectsTableBody.appendChild(row);
        
        // Initialiser les boutons d'action
        initializeProjectActions(row);
        
        // Initialiser le lien de visualisation du projet
        const projectLink = row.querySelector('.project-link');
        const viewButton = row.querySelector('.btn-view');
        
        if (projectLink) {
            projectLink.addEventListener('click', function(e) {
                e.preventDefault();
                viewProject(project.id);
            });
        }
        
        if (viewButton) {
            viewButton.addEventListener('click', function() {
                viewProject(project.id);
            });
        }
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
        
        // Si le projet est lié au portefeuille, le délier
        let walletData = JSON.parse(localStorage.getItem('walletData') || '{"linkedProjects":[]}');
        if (walletData.linkedProjects && walletData.linkedProjects.includes(projectId)) {
            walletData.linkedProjects = walletData.linkedProjects.filter(id => id !== projectId);
            localStorage.setItem('walletData', JSON.stringify(walletData));
            console.log('Projet délié du portefeuille lors de la suppression:', projectId);
        }
        
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
    
    // Mise à jour du nombre de projets actifs
    const activeProjectsCount = document.getElementById('activeProjectsCount');
    if (activeProjectsCount) {
        activeProjectsCount.textContent = projects.length;
    }
    
    // Calculer le budget global
    let totalBudget = 0;
    projects.forEach(project => {
        const budget = parseFloat(project.totalBudget?.replace(/[^0-9.]/g, '') || 0);
        totalBudget += budget;
    });
    
    // Mettre à jour le budget total
    const totalBudgetElement = document.getElementById('totalBudget');
    if (totalBudgetElement) {
        totalBudgetElement.textContent = `€ ${totalBudget.toFixed(2)}`;
    }
    
    // Récupération et mise à jour du solde du portefeuille
    const walletBalanceElement = document.getElementById('walletBalance');
    if (walletBalanceElement) {
        let totalBalance = 0;
        
        try {
            // Récupérer tous les portefeuilles depuis mapocket_wallets
            const wallets = JSON.parse(localStorage.getItem('mapocket_wallets') || '[]');
            console.log('Portefeuilles récupérés:', wallets);
            
            if (Array.isArray(wallets)) {
                // Calculer le solde total
                wallets.forEach(wallet => {
                    if (wallet.balance) {
                        totalBalance += parseFloat(wallet.balance);
                    }
                });
                console.log('Solde total des portefeuilles:', totalBalance);
            } else {
                console.error('Format incorrect pour mapocket_wallets:', wallets);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des portefeuilles:', error);
        }
        
        walletBalanceElement.textContent = `€ ${totalBalance.toFixed(2)}`;
    }
    
    // Récupération et mise à jour des statistiques d'activité professionnelle
    const proActivitySummaryElement = document.getElementById('proActivitySummary');
    if (proActivitySummaryElement) {
        // Dans une implémentation complète, récupérer les devis et factures
        // Pour l'instant, on utilise 0 / 0
        let pendingQuotes = 0;
        let pendingInvoices = 0;
        
        try {
            const quotes = JSON.parse(localStorage.getItem('mapocket_quotes') || '[]');
            const invoices = JSON.parse(localStorage.getItem('mapocket_invoices') || '[]');
            
            if (Array.isArray(quotes)) {
                pendingQuotes = quotes.filter(q => q.status === 'sent').length;
            }
            
            if (Array.isArray(invoices)) {
                pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').length;
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des devis et factures:', error);
        }
        
        proActivitySummaryElement.textContent = `${pendingQuotes} devis / ${pendingInvoices} factures`;
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

function viewProject(projectId) {
    // Récupérer tous les projets
    const projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    
    // Trouver le projet à visualiser
    const projectToView = projects.find(p => p.id === projectId);
    
    if (projectToView) {
        // Sauvegarder le projet à visualiser dans le localStorage
        localStorage.setItem('currentProject', JSON.stringify(projectToView));
        
        // Rediriger vers la nouvelle page de détail de projet
        window.location.href = 'projet.html?id=' + projectId;
    } else {
        showNotification('Projet non trouvé');
    }
}