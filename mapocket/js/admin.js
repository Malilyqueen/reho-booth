/**
 * Script pour la page d'administration
 */

// Données utilisateurs (simulées pour la démonstration)
const simulatedUsers = [
    {
        id: 1,
        name: 'Sophie Martin',
        email: 'sophie.martin@example.com',
        plan: 'pro',
        signupDate: '2024-12-01',
        lastLogin: '2025-04-08',
        status: 'active',
        projectsCount: 12,
        totalBudget: 15600
    },
    {
        id: 2,
        name: 'Thomas Dubois',
        email: 'thomas.dubois@example.com',
        plan: 'basic',
        signupDate: '2025-01-15',
        lastLogin: '2025-04-07',
        status: 'active',
        projectsCount: 5,
        totalBudget: 3200
    },
    {
        id: 3,
        name: 'Marie Leclerc',
        email: 'marie.leclerc@example.com',
        plan: 'freemium',
        signupDate: '2025-02-20',
        lastLogin: '2025-03-25',
        status: 'inactive',
        projectsCount: 1,
        totalBudget: 500
    },
    {
        id: 4,
        name: 'Pierre Moreau',
        email: 'pierre.moreau@example.com',
        plan: 'pro',
        signupDate: '2025-01-05',
        lastLogin: '2025-04-08',
        status: 'active',
        projectsCount: 8,
        totalBudget: 12400
    },
    {
        id: 5,
        name: 'Camille Bernard',
        email: 'camille.bernard@example.com',
        plan: 'basic',
        signupDate: '2025-03-10',
        lastLogin: '2025-04-06',
        status: 'active',
        projectsCount: 3,
        totalBudget: 1800
    },
    {
        id: 6,
        name: 'Lucas Petit',
        email: 'lucas.petit@example.com',
        plan: 'freemium',
        signupDate: '2025-02-05',
        lastLogin: '2025-02-28',
        status: 'inactive',
        projectsCount: 1,
        totalBudget: 300
    },
    {
        id: 7,
        name: 'Emma Richard',
        email: 'emma.richard@example.com',
        plan: 'pro',
        signupDate: '2024-11-20',
        lastLogin: '2025-04-07',
        status: 'active',
        projectsCount: 15,
        totalBudget: 20800
    },
    {
        id: 8,
        name: 'Antoine Lefebvre',
        email: 'antoine.lefebvre@example.com',
        plan: 'basic',
        signupDate: '2025-01-22',
        lastLogin: '2025-04-05',
        status: 'active',
        projectsCount: 4,
        totalBudget: 2500
    }
];

// Données de feedback utilisateurs (simulées pour la démonstration)
const simulatedFeedbacks = [
    {
        id: 1,
        userId: 2,
        userName: 'Thomas Dubois',
        userEmail: 'thomas.dubois@example.com',
        date: '2025-04-03',
        message: "J'adore l'application, mais serait-il possible d'ajouter une option pour partager les projets avec des amis ? Ce serait utile pour les événements de groupe.",
        status: 'pending'
    },
    {
        id: 2,
        userId: 7,
        userName: 'Emma Richard',
        userEmail: 'emma.richard@example.com',
        date: '2025-04-01',
        message: "Je trouve que l'interface a vraiment été améliorée dans la dernière mise à jour. Par contre, j'ai remarqué un bug : parfois les montants ne s'affichent pas correctement quand j'utilise des virgules.",
        status: 'pending'
    },
    {
        id: 3,
        userId: 4,
        userName: 'Pierre Moreau',
        userEmail: 'pierre.moreau@example.com',
        date: '2025-03-28',
        message: "Est-ce qu'il serait possible d'avoir plus de modèles de projets ? Je travaille dans l'événementiel et j'utilise MaPocket Pro, mais je trouve que les modèles sont un peu limités pour des projets professionnels.",
        status: 'resolved'
    },
    {
        id: 4,
        userId: 1,
        userName: 'Sophie Martin',
        userEmail: 'sophie.martin@example.com',
        date: '2025-03-25',
        message: "Je voulais vous remercier pour les fonctionnalités MaPocket Pro, elles me font gagner beaucoup de temps ! Une suggestion : pouvoir télécharger les factures directement depuis l'application serait top.",
        status: 'resolved'
    },
    {
        id: 5,
        userId: 5,
        userName: 'Camille Bernard',
        userEmail: 'camille.bernard@example.com',
        date: '2025-03-20',
        message: "J'ai du mal à configurer les alertes budgétaires, le système ne semble pas fonctionner correctement. Je reçois parfois des alertes alors que je n'ai pas dépassé mon budget.",
        status: 'in-progress'
    }
];

// Données d'activité récentes (simulées pour la démonstration)
const simulatedActivities = [
    {
        id: 1,
        type: 'signup',
        userId: 8,
        userName: 'Antoine Lefebvre',
        date: '2025-04-07',
        details: 'Nouvel utilisateur inscrit avec plan Basic'
    },
    {
        id: 2,
        type: 'project',
        userId: 1,
        userName: 'Sophie Martin',
        date: '2025-04-06',
        details: 'A créé un nouveau projet : "Rénovation cuisine" avec un budget de €8200'
    },
    {
        id: 3,
        type: 'upgrade',
        userId: 5,
        userName: 'Camille Bernard',
        date: '2025-04-05',
        details: 'A fait une mise à niveau de Freemium vers Basic'
    },
    {
        id: 4,
        type: 'feedback',
        userId: 2,
        userName: 'Thomas Dubois',
        date: '2025-04-03',
        details: 'A envoyé un nouveau feedback'
    },
    {
        id: 5,
        type: 'project',
        userId: 4,
        userName: 'Pierre Moreau',
        date: '2025-04-02',
        details: 'A créé un nouveau projet : "Événement d\'entreprise" avec un budget de €5400'
    }
];

// Variable pour indiquer si l'utilisateur est admin
let isAdmin = false;

// Initialiser la page au chargement
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin dashboard initialized');
    
    // Activer le mode admin (pour la démo)
    isAdmin = true;
    
    // Initialiser les onglets
    initTabs();
    
    // Charger les statistiques globales
    loadStats();
    
    // Charger la liste des utilisateurs
    loadUsers();
    
    // Charger les feedbacks
    loadFeedbacks();
    
    // Charger l'activité récente
    loadActivity();
    
    // Initialiser les filtres et recherche
    initFilters();
    
    // Initialiser la pagination
    initPagination();
    
    // Initialiser les modales
    initModals();
    
    // Vérifier les permissions admin
    checkAdminAccess();
});

/**
 * Vérifie si l'utilisateur a les permissions admin
 */
function checkAdminAccess() {
    if (!isAdmin) {
        // Rediriger vers la page d'accueil si l'utilisateur n'est pas admin
        window.location.href = 'index.html';
        return;
    }
    
    // Ajouter une classe au body pour indiquer que l'utilisateur est admin
    document.body.classList.add('is-admin');
}

/**
 * Initialise les onglets de la page admin
 */
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Désactiver tous les onglets
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activer l'onglet sélectionné
            button.classList.add('active');
            document.getElementById(tabName + '-content').classList.add('active');
        });
    });
}

/**
 * Charge les statistiques globales
 */
function loadStats() {
    // Calculer les statistiques à partir des données simulées
    const totalUsers = simulatedUsers.length;
    const activeUsers = simulatedUsers.filter(user => user.status === 'active').length;
    const totalProjects = simulatedUsers.reduce((sum, user) => sum + user.projectsCount, 0);
    const totalBudget = simulatedUsers.reduce((sum, user) => sum + user.totalBudget, 0);
    
    // Compter les utilisateurs par plan
    const planCounts = {
        freemium: simulatedUsers.filter(user => user.plan === 'freemium').length,
        basic: simulatedUsers.filter(user => user.plan === 'basic').length,
        pro: simulatedUsers.filter(user => user.plan === 'pro').length
    };
    
    // Calculer le pourcentage d'utilisateurs actifs
    const activePercentage = Math.round((activeUsers / totalUsers) * 100);
    
    // Mettre à jour les éléments HTML
    document.getElementById('totalUsersCount').textContent = totalUsers;
    document.getElementById('activeUsersCount').textContent = activeUsers;
    document.getElementById('totalProjectsCount').textContent = totalProjects;
    document.getElementById('totalBudgetAmount').textContent = formatCurrency(totalBudget);
    
    document.getElementById('freemiumCount').textContent = planCounts.freemium;
    document.getElementById('basicCount').textContent = planCounts.basic;
    document.getElementById('proCount').textContent = planCounts.pro;
    
    document.getElementById('activeUsersPercentage').textContent = activePercentage + '%';
    
    // Initialiser les graphiques
    initCharts(planCounts);
}

/**
 * Initialise les graphiques
 */
function initCharts(planCounts) {
    // Dans une application réelle, nous utiliserions une bibliothèque comme Chart.js
    // Pour cette démo, nous utilisons des graphiques fictifs
    
    // Simuler un graphique pour la répartition des utilisateurs par plan
    const planChartPlaceholder = document.getElementById('planDistributionChart');
    if (planChartPlaceholder) {
        planChartPlaceholder.innerHTML = `
            <div style="height: 200px; display: flex; padding: 20px;">
                <div style="flex: ${planCounts.freemium}; background-color: #f1f5f9; margin-right: 5px; position: relative;">
                    <div style="position: absolute; bottom: 5px; left: 0; width: 100%; text-align: center; font-size: 12px;">Freemium</div>
                    <div style="position: absolute; top: 5px; left: 0; width: 100%; text-align: center; font-weight: bold;">${planCounts.freemium}</div>
                </div>
                <div style="flex: ${planCounts.basic}; background-color: #e0f2fe; margin-right: 5px; position: relative;">
                    <div style="position: absolute; bottom: 5px; left: 0; width: 100%; text-align: center; font-size: 12px;">Basic</div>
                    <div style="position: absolute; top: 5px; left: 0; width: 100%; text-align: center; font-weight: bold;">${planCounts.basic}</div>
                </div>
                <div style="flex: ${planCounts.pro}; background-color: #fef3c7; position: relative;">
                    <div style="position: absolute; bottom: 5px; left: 0; width: 100%; text-align: center; font-size: 12px;">Pro</div>
                    <div style="position: absolute; top: 5px; left: 0; width: 100%; text-align: center; font-weight: bold;">${planCounts.pro}</div>
                </div>
            </div>
        `;
    }
    
    // Simuler un graphique pour l'activité hebdomadaire
    const weeklyActivityChart = document.getElementById('weeklyActivityChart');
    if (weeklyActivityChart) {
        const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        const values = [8, 12, 15, 10, 20, 5, 3]; // Valeurs fictives
        
        let barsHtml = '';
        for (let i = 0; i < days.length; i++) {
            const height = (values[i] / Math.max(...values)) * 100;
            barsHtml += `
                <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                    <div style="height: ${height}%; background-color: #eaf4fb; width: 30px; margin-bottom: 10px;"></div>
                    <div style="font-size: 12px;">${days[i]}</div>
                </div>
            `;
        }
        
        weeklyActivityChart.innerHTML = `
            <div style="height: 200px; display: flex; align-items: flex-end; justify-content: space-around; padding: 20px;">
                ${barsHtml}
            </div>
        `;
    }
}

/**
 * Charge la liste des utilisateurs
 */
function loadUsers() {
    const usersTableBody = document.getElementById('usersTableBody');
    if (!usersTableBody) return;
    
    usersTableBody.innerHTML = '';
    
    simulatedUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background-color: #1d3557; color: white; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: 600;">
                        ${user.name.charAt(0)}${user.name.split(' ')[1].charAt(0)}
                    </div>
                    <div>
                        <div style="font-weight: 500;">${user.name}</div>
                        <div style="font-size: 12px; color: #666;">${user.email}</div>
                    </div>
                </div>
            </td>
            <td>
                <span class="badge ${user.plan === 'pro' ? 'badge-primary' : user.plan === 'basic' ? 'badge-info' : 'badge-secondary'}">
                    ${user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                </span>
            </td>
            <td>${formatDate(user.signupDate)}</td>
            <td>${formatDate(user.lastLogin)}</td>
            <td>
                <span class="badge ${user.status === 'active' ? 'badge-success' : 'badge-danger'}">
                    ${user.status === 'active' ? 'Actif' : 'Inactif'}
                </span>
            </td>
            <td>${user.projectsCount}</td>
            <td>${formatCurrency(user.totalBudget)}</td>
            <td>
                <div class="row-actions">
                    <button class="row-action-btn view-btn" title="Voir détails" onclick="viewUser(${user.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="row-action-btn edit-btn" title="Modifier" onclick="editUser(${user.id})">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="row-action-btn delete-btn" title="Supprimer" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        usersTableBody.appendChild(row);
    });
}

/**
 * Charge les feedbacks utilisateurs
 */
function loadFeedbacks() {
    const feedbacksList = document.getElementById('feedbacksList');
    if (!feedbacksList) return;
    
    feedbacksList.innerHTML = '';
    
    simulatedFeedbacks.forEach(feedback => {
        const item = document.createElement('div');
        item.className = 'feedback-item';
        
        item.innerHTML = `
            <div class="feedback-header">
                <div class="feedback-user">
                    <div class="feedback-avatar">${feedback.userName.charAt(0)}${feedback.userName.split(' ')[1].charAt(0)}</div>
                    <div class="feedback-details">
                        <h4>${feedback.userName}</h4>
                        <p>${feedback.userEmail}</p>
                    </div>
                </div>
                <div class="feedback-date">${formatDate(feedback.date)}</div>
            </div>
            <div class="feedback-content">
                ${feedback.message}
            </div>
            <div class="feedback-actions">
                <span class="badge ${feedback.status === 'resolved' ? 'badge-success' : feedback.status === 'in-progress' ? 'badge-warning' : 'badge-secondary'}">
                    ${feedback.status === 'resolved' ? 'Résolu' : feedback.status === 'in-progress' ? 'En cours' : 'En attente'}
                </span>
                <button class="action-btn" onclick="respondToFeedback(${feedback.id})">
                    <i class="fas fa-reply"></i> Répondre
                </button>
                <button class="action-btn" onclick="changeFeedbackStatus(${feedback.id})">
                    <i class="fas fa-check-circle"></i> Marquer comme résolu
                </button>
            </div>
        `;
        
        feedbacksList.appendChild(item);
    });
}

/**
 * Charge l'activité récente
 */
function loadActivity() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    activityList.innerHTML = '';
    
    simulatedActivities.forEach(activity => {
        const item = document.createElement('li');
        item.className = 'activity-item';
        
        // Définir l'icône en fonction du type d'activité
        let icon = '';
        switch (activity.type) {
            case 'signup':
                icon = 'fas fa-user-plus';
                break;
            case 'project':
                icon = 'fas fa-folder-plus';
                break;
            case 'upgrade':
                icon = 'fas fa-arrow-up';
                break;
            case 'feedback':
                icon = 'fas fa-comment';
                break;
            default:
                icon = 'fas fa-bell';
                break;
        }
        
        item.innerHTML = `
            <div class="activity-icon">
                <i class="${icon}"></i>
            </div>
            <div class="activity-content">
                <h4 class="activity-title"><strong>${activity.userName}</strong> ${getActivityDescription(activity)}</h4>
                <div class="activity-meta">
                    <span class="activity-date">
                        <i class="fas fa-calendar-alt"></i> ${formatDate(activity.date)}
                    </span>
                </div>
                <div class="activity-actions">
                    <button class="activity-action-btn" onclick="viewUserDetails(${activity.userId})">
                        Voir l'utilisateur
                    </button>
                </div>
            </div>
        `;
        
        activityList.appendChild(item);
    });
}

/**
 * Obtient la description d'une activité
 */
function getActivityDescription(activity) {
    switch (activity.type) {
        case 'signup':
            return 's\'est inscrit(e)';
        case 'project':
            return 'a créé un nouveau projet';
        case 'upgrade':
            return 'a mis à niveau son abonnement';
        case 'feedback':
            return 'a envoyé un feedback';
        default:
            return 'a effectué une action';
    }
}

/**
 * Initialise les filtres et la recherche
 */
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = button.nextElementSibling;
            dropdown.classList.toggle('show');
        });
    });
    
    // Fermer les dropdowns lorsqu'on clique ailleurs
    document.addEventListener('click', () => {
        document.querySelectorAll('.filter-dropdown-content').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    });
    
    // Gestionnaire pour les options de filtre
    document.querySelectorAll('.filter-option').forEach(option => {
        option.addEventListener('click', () => {
            const filterType = option.closest('.filter-dropdown-content').getAttribute('data-filter');
            const filterValue = option.getAttribute('data-value');
            
            // Mettre à jour l'interface
            document.querySelectorAll(`.filter-dropdown-content[data-filter="${filterType}"] .filter-option`).forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');
            
            // Appliquer le filtre (pour une application réelle)
            console.log(`Filtre appliqué: ${filterType} = ${filterValue}`);
            
            // Pour cette démo, nous simulons simplement un filtrage
            if (filterType === 'plan' && filterValue !== 'all') {
                const filteredUsers = simulatedUsers.filter(user => user.plan === filterValue);
                console.log('Utilisateurs filtrés:', filteredUsers);
            }
        });
    });
    
    // Gestionnaire pour la recherche
    const searchInput = document.getElementById('userSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            console.log(`Recherche: ${searchTerm}`);
            
            // Pour cette démo, nous simulons simplement une recherche
            if (searchTerm.length > 2) {
                const searchResults = simulatedUsers.filter(user => 
                    user.name.toLowerCase().includes(searchTerm) || 
                    user.email.toLowerCase().includes(searchTerm)
                );
                console.log('Résultats de recherche:', searchResults);
            }
        });
    }
}

/**
 * Initialise la pagination
 */
function initPagination() {
    const paginationButtons = document.querySelectorAll('.pagination-btn');
    
    paginationButtons.forEach(button => {
        if (!button.classList.contains('disabled')) {
            button.addEventListener('click', () => {
                // Désactiver le bouton actif
                document.querySelector('.pagination-btn.active')?.classList.remove('active');
                
                // Activer le bouton cliqué
                button.classList.add('active');
                
                // Pour cette démo, nous ne changeons pas réellement de page
                console.log(`Changement de page: ${button.textContent.trim()}`);
            });
        }
    });
}

/**
 * Initialise les modales
 */
function initModals() {
    const closeButtons = document.querySelectorAll('.close-modal');
    
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.admin-modal');
            modal.style.display = 'none';
        });
    });
    
    // Fermer la modale en cliquant en dehors
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('admin-modal')) {
            e.target.style.display = 'none';
        }
    });
}

/**
 * Affiche les détails d'un utilisateur
 */
function viewUser(userId) {
    console.log(`Voir les détails de l'utilisateur: ${userId}`);
    
    // Trouver l'utilisateur
    const user = simulatedUsers.find(u => u.id === userId);
    if (!user) return;
    
    // Mettre à jour la modale avec les détails de l'utilisateur
    const modal = document.getElementById('userDetailsModal');
    if (!modal) return;
    
    // Mettre à jour le contenu de la modale
    document.getElementById('userNameTitle').textContent = user.name;
    document.getElementById('userDetailsAvatar').textContent = `${user.name.charAt(0)}${user.name.split(' ')[1].charAt(0)}`;
    document.getElementById('userDetailsName').textContent = user.name;
    document.getElementById('userDetailsEmail').textContent = user.email;
    document.getElementById('userDetailsPlan').textContent = user.plan.charAt(0).toUpperCase() + user.plan.slice(1);
    document.getElementById('userDetailsSignup').textContent = formatDate(user.signupDate);
    document.getElementById('userDetailsLastLogin').textContent = formatDate(user.lastLogin);
    document.getElementById('userDetailsStatus').textContent = user.status === 'active' ? 'Actif' : 'Inactif';
    document.getElementById('userDetailsStatus').className = user.status === 'active' ? 'meta-value text-success' : 'meta-value text-danger';
    
    document.getElementById('userStatsProjects').textContent = user.projectsCount;
    document.getElementById('userStatsBudget').textContent = formatCurrency(user.totalBudget);
    
    // Afficher la modale
    modal.style.display = 'block';
}

/**
 * Édite un utilisateur
 */
function editUser(userId) {
    console.log(`Éditer l'utilisateur: ${userId}`);
    
    // Trouver l'utilisateur
    const user = simulatedUsers.find(u => u.id === userId);
    if (!user) return;
    
    // Mettre à jour la modale avec les détails de l'utilisateur
    const modal = document.getElementById('userEditModal');
    if (!modal) return;
    
    // Mettre à jour le contenu de la modale
    document.getElementById('editUserName').value = user.name;
    document.getElementById('editUserEmail').value = user.email;
    document.getElementById('editUserPlan').value = user.plan;
    document.getElementById('editUserStatus').checked = user.status === 'active';
    
    // Afficher la modale
    modal.style.display = 'block';
}

/**
 * Supprime un utilisateur
 */
function deleteUser(userId) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur #${userId} ?`)) {
        console.log(`Supprimer l'utilisateur: ${userId}`);
        // Dans une application réelle, nous enverrions une requête au serveur
    }
}

/**
 * Répond à un feedback
 */
function respondToFeedback(feedbackId) {
    console.log(`Répondre au feedback: ${feedbackId}`);
    
    // Trouver le feedback
    const feedback = simulatedFeedbacks.find(f => f.id === feedbackId);
    if (!feedback) return;
    
    // Mettre à jour la modale
    const modal = document.getElementById('feedbackResponseModal');
    if (!modal) return;
    
    // Mettre à jour le contenu de la modale
    document.getElementById('responseFeedbackId').value = feedbackId;
    document.getElementById('responseFeedbackUser').textContent = feedback.userName;
    document.getElementById('responseFeedbackMessage').textContent = feedback.message;
    
    // Afficher la modale
    modal.style.display = 'block';
}

/**
 * Change le statut d'un feedback
 */
function changeFeedbackStatus(feedbackId) {
    console.log(`Changer le statut du feedback: ${feedbackId}`);
    
    // Pour cette démo, nous simulons simplement un changement de statut
    const feedback = simulatedFeedbacks.find(f => f.id === feedbackId);
    if (feedback) {
        feedback.status = 'resolved';
        loadFeedbacks(); // Recharger la liste
    }
}

/**
 * Affiche les détails d'un utilisateur à partir d'une activité
 */
function viewUserDetails(userId) {
    viewUser(userId); // Réutiliser la fonction existante
}

/**
 * Formate une date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Formate un montant monétaire
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}