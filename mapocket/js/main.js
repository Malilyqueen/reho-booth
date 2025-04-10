// Main JavaScript file for MaPocket application

// Variables globales
let isAdmin = false;
let userPreferences = {
    currency: 'EUR', // Devise par défaut
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('MaPocket application initialized');
    
    // Charger les préférences utilisateur
    try {
        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
            userPreferences = JSON.parse(savedPrefs);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des préférences utilisateur:', error);
    }
    
    // Mettre à jour l'icône de devise
    updateCurrencyIcon();
    
    // Mettre à jour les affichages de devise sur la page
    updateCurrencyDisplays();
    
    // Écouter les changements de devise
    window.addEventListener('storage', function(e) {
        if (e.key === 'userPreferences') {
            try {
                const newPrefs = JSON.parse(e.newValue);
                const oldCurrency = userPreferences.currency;
                
                // Mettre à jour les préférences
                userPreferences = newPrefs;
                
                // Si la devise a changé, mettre à jour tous les affichages
                if (oldCurrency !== userPreferences.currency) {
                    console.log('Devise changée de', oldCurrency, 'à', userPreferences.currency);
                    
                    // Mettre à jour l'icône de devise
                    updateCurrencyIcon();
                    
                    // Mettre à jour tous les affichages de devise
                    updateCurrencyDisplays();
                }
            } catch (error) {
                console.error('Erreur lors du traitement des changements de préférences:', error);
            }
        }
    });
    
    // Vérifier si l'utilisateur est administrateur (version simplifiée)
    checkAdminStatus();
    
    // Initialiser l'accès à la page d'administration
    initAdminAccess();
    
    // Initialize the UI elements
    initializeUI();
    
    // Charger la liste des projets
    loadProjectsList();
    
    // Initialiser le rendu des statistiques mobiles
    initMobileStatsDisplay();
    
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
    
    // Initialiser les boutons d'exportation et d'importation
    if (typeof initializeBackupRestore === 'function') {
        try {
            initializeBackupRestore();
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des fonctions de sauvegarde/restauration:', error);
        }
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

// Met à jour l'icône de devise en fonction des préférences utilisateur
function updateCurrencyIcon() {
    const currencyIcons = document.querySelectorAll('.budget-currency-icon');
    if (currencyIcons.length === 0) return;
    
    // Trouver la devise sélectionnée
    const currencyCode = userPreferences.currency || 'EUR';
    
    // Définir la classe d'icône en fonction de la devise
    let iconClass = 'fas fa-euro-sign'; // Par défaut
    
    switch (currencyCode) {
        case 'USD':
            iconClass = 'fas fa-dollar-sign';
            break;
        case 'GBP':
            iconClass = 'fas fa-pound-sign';
            break;
        case 'JPY':
        case 'CNY':
            iconClass = 'fas fa-yen-sign';
            break;
        case 'MGA':
            // Ariary n'a pas d'icône FontAwesome, on utilise du texte
            currencyIcons.forEach(icon => {
                icon.className = 'budget-currency-icon';
                icon.textContent = 'Ar';
            });
            return;
        default:
            // Pour les autres devises, on garde l'euro par défaut
            iconClass = 'fas fa-euro-sign';
    }
    
    // Mettre à jour la classe pour toutes les icônes
    currencyIcons.forEach(icon => {
        // Conserver la classe 'budget-currency-icon' et ajouter les classes de FontAwesome
        icon.className = 'budget-currency-icon ' + iconClass;
        icon.textContent = '';
    });
    
    // Forcer la mise à jour des statistiques du tableau de bord
    updateDashboardStats();
}

// Mettre à jour tous les affichages de devise sur la page
function updateCurrencyDisplays() {
    console.log('Mise à jour de tous les affichages de devise');
    
    // Mettre à jour l'affichage des montants
    updateCurrencyDisplay();
    
    // Mettre à jour les montants spécifiques
    updateAllAmountsWithCurrency();
    
    // Déclencher un événement personnalisé pour informer les autres composants
    const event = new CustomEvent('currencyChanged', {
        detail: { 
            currency: userPreferences.currency,
            symbol: getCurrencySymbol(userPreferences.currency)
        }
    });
    window.dispatchEvent(event);
}

// Mettre à jour l'affichage des montants avec la devise actuelle
function updateCurrencyDisplay() {
    // Trouver la devise sélectionnée
    const currencyCode = userPreferences.currency || 'EUR';
    let currencySymbol = '€'; // Symbole par défaut
    
    // Si AVAILABLE_CURRENCIES est défini (depuis currencies.js), utiliser le symbole correspondant
    if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
        const currency = AVAILABLE_CURRENCIES.find(c => c.code === currencyCode);
        if (currency) {
            currencySymbol = currency.symbol;
        }
    }
    
    console.log("Devise actuelle:", currencyCode, "Symbole:", currencySymbol);
    
    // Mettre à jour tous les éléments qui contiennent des montants
    const budgetElements = document.querySelectorAll('#totalBudget, #walletBalance');
    
    budgetElements.forEach(element => {
        if (element) {
            // Conserver uniquement les chiffres et le point décimal
            const value = parseFloat(element.innerText.replace(/[^\d.]/g, '') || 0);
            element.innerText = `${currencySymbol} ${value.toFixed(2)}`;
        }
    });
    
    // Mettre à jour les statistiques mobiles
    updateMobileStatsDisplay();
}

// Fonction pour extraire la valeur numérique d'un montant avec devise
function parseMonetaryValue(monetaryString) {
    if (!monetaryString) return 0;
    
    // Enlever tous les caractères non numériques sauf le point et la virgule
    const cleanedString = monetaryString.toString().replace(/[^0-9.,]/g, '');
    
    // Remplacer la virgule par un point (format français -> format anglais)
    const normalizedString = cleanedString.replace(',', '.');
    
    // Convertir en nombre
    const value = parseFloat(normalizedString);
    
    // Retourner 0 si la conversion échoue
    return isNaN(value) ? 0 : value;
}

// Obtient le symbole d'une devise (fonction globale)
window.getCurrencySymbol = function(currencyCode) {
    // Si AVAILABLE_CURRENCIES est défini (depuis currencies.js), utiliser le symbole correspondant
    if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
        const currency = AVAILABLE_CURRENCIES.find(c => c.code === currencyCode);
        if (currency) {
            return currency.symbol;
        }
    }
    
    // Fallback - utiliser des symboles classiques en fonction du code de devise
    switch (currencyCode) {
        case 'USD': return '$';
        case 'EUR': return '€';
        case 'GBP': return '£';
        case 'JPY': return '¥';
        case 'CNY': return '¥';
        case 'MGA': return 'Ar';
        case 'THB': return '฿';
        default: return currencyCode; // Utiliser le code de la devise si le symbole n'est pas connu
    }
}

// Alias local pour la fonction globale
function getCurrencySymbol(currencyCode) {
    return window.getCurrencySymbol(currencyCode);
}

// Mise à jour de tous les montants avec la nouvelle devise
function updateAllAmountsWithCurrency() {
    // Trouver la devise sélectionnée
    const currencyCode = userPreferences.currency || 'EUR';
    let currencySymbol = getCurrencySymbol(currencyCode);
    
    // Mettre à jour tous les éléments avec la classe .currency-amount
    const amountElements = document.querySelectorAll('.currency-amount');
    
    amountElements.forEach(element => {
        if (element) {
            // Conserver uniquement les chiffres et le point décimal
            const valueText = element.innerText || element.textContent;
            const value = parseFloat(valueText.replace(/[^\d.,]/g, '').replace(',', '.') || 0);
            element.textContent = `${currencySymbol} ${value.toFixed(2)}`;
        }
    });
    
    // Mettre à jour les éléments avec attribut data-amount
    const dataAmountElements = document.querySelectorAll('[data-amount]');
    
    dataAmountElements.forEach(element => {
        if (element) {
            const amount = parseFloat(element.getAttribute('data-amount') || 0);
            element.textContent = `${currencySymbol} ${amount.toFixed(2)}`;
        }
    });
}

/**
 * Initialise l'affichage des statistiques mobiles
 * Cette fonction va créer un gestionnaire d'événements qui mettra à jour
 * les statistiques mobiles (avec la devise correcte) quand la devise changera
 */
function initMobileStatsDisplay() {
    // Observer les changements de devise
    window.addEventListener('currencyChanged', function(e) {
        console.log('Événement de changement de devise détecté pour les stats mobiles');
        updateMobileStatsDisplay();
    });
    
    // Mettre à jour les statistiques initialement
    updateMobileStatsDisplay();
}

/**
 * Met à jour l'affichage des statistiques mobiles
 * avec la devise correcte
 */
function updateMobileStatsDisplay() {
    // Récupérer les préférences utilisateur pour obtenir la devise
    let userPreferences = {
        currency: 'EUR', // Devise par défaut
    };
    
    try {
        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
            userPreferences = JSON.parse(savedPrefs);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des préférences utilisateur:', error);
    }
    
    // Obtenir le symbole de la devise
    let currencySymbol = '€'; // Euro comme symbole par défaut
    
    // Si AVAILABLE_CURRENCIES est défini (depuis currencies.js), utiliser le symbole correspondant
    if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
        const currency = AVAILABLE_CURRENCIES.find(c => c.code === userPreferences.currency);
        if (currency) {
            currencySymbol = currency.symbol;
        }
    }
    
    // Récupérer les statistiques de mobileDashboardStats
    try {
        const mobileDashboardStats = JSON.parse(localStorage.getItem('mobileDashboardStats') || '{}');
        const totalBudget = mobileDashboardStats.totalBudget || 0;
        const walletBalance = mobileDashboardStats.walletBalance || 0;
        
        // Mettre à jour tous les éléments relevant des statistiques mobiles
        // Ces éléments ont généralement des classes spécifiques dans la vue mobile
        
        // Budget total - vue mobile
        const mobileTotalBudgetElements = document.querySelectorAll('.mobile-view .budget-total-value, .mobile-stats .budget-total-value');
        mobileTotalBudgetElements.forEach(element => {
            if (element) {
                element.textContent = `${currencySymbol} ${totalBudget.toFixed(2)}`;
            }
        });
        
        // Solde portefeuille - vue mobile
        const mobileWalletBalanceElements = document.querySelectorAll('.mobile-view .wallet-balance-value, .mobile-stats .wallet-balance-value');
        mobileWalletBalanceElements.forEach(element => {
            if (element) {
                element.textContent = `${currencySymbol} ${walletBalance.toFixed(2)}`;
            }
        });
        
        console.log(`Statistiques mobiles mises à jour avec la devise ${currencySymbol}`);
    } catch (error) {
        console.error('Erreur lors de la mise à jour des statistiques mobiles:', error);
    }
}

/**
 * Vérifie si l'utilisateur a le statut d'administrateur
 * Dans une application réelle, cette vérification se ferait côté serveur
 */
function checkAdminStatus() {
    // Version simplifiée pour la démo : utiliser localStorage pour activer/désactiver le mode admin
    const adminStatus = localStorage.getItem('isAdmin');
    
    // Pour la démo, définir à true pour avoir accès aux fonctionnalités d'administration
    // Dans une vraie application, l'authentification serait plus sécurisée
    isAdmin = adminStatus === 'true';
    
    console.log('Statut admin :', isAdmin ? 'Administrateur' : 'Utilisateur standard');
    
    // Appliquer le statut admin à l'interface
    document.body.classList.toggle('is-admin', isAdmin);
}

/**
 * Initialise l'accès à la page d'administration
 * Gère l'affichage ou le masquage du lien admin, et redirige si nécessaire
 */
function initAdminAccess() {
    // Récupérer tous les éléments de menu admin
    const adminMenuItems = document.querySelectorAll('.admin-only');
    
    // Afficher ou masquer les éléments en fonction du statut admin
    if (adminMenuItems.length > 0) {
        adminMenuItems.forEach(item => {
            if (isAdmin) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    // Si on est sur la page d'administration mais qu'on n'est pas admin, rediriger vers l'accueil
    if (window.location.pathname.includes('admin.html') && !isAdmin) {
        console.log('Accès non autorisé à la page d\'administration, redirection...');
        window.location.href = 'index.html';
    }
    
    // Ajouter un bouton de test pour activer/désactiver le mode admin (pour la démo uniquement)
    // Dans une vraie application, cette fonctionnalité ne serait pas disponible
    addAdminToggle();
}

/**
 * Ajoute un bouton pour activer/désactiver le mode admin (pour la démo uniquement)
 */
function addAdminToggle() {
    try {
        console.log('Ajout du bouton admin toggle');
        
        // Supprimer le bouton s'il existe déjà pour éviter les doublons
        const existingButton = document.getElementById('adminToggle');
        if (existingButton) {
            existingButton.remove();
        }
        
        // Créer le bouton avec un style plus visible
        const adminToggle = document.createElement('div');
        adminToggle.id = 'adminToggle';
        adminToggle.style.position = 'fixed';
        adminToggle.style.bottom = '20px';
        adminToggle.style.right = '20px';
        adminToggle.style.padding = '12px 15px';
        adminToggle.style.backgroundColor = '#1d3557';
        adminToggle.style.color = 'white';
        adminToggle.style.borderRadius = '5px';
        adminToggle.style.fontSize = '14px';
        adminToggle.style.fontWeight = 'bold';
        adminToggle.style.cursor = 'pointer';
        adminToggle.style.zIndex = '9999';
        adminToggle.style.display = 'flex';
        adminToggle.style.alignItems = 'center';
        adminToggle.style.gap = '10px';
        adminToggle.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        
        // Contenu du bouton
        adminToggle.innerHTML = `
            <i class="fas fa-shield-alt"></i>
            <span>Mode admin: <strong>${isAdmin ? 'ACTIVÉ' : 'DÉSACTIVÉ'}</strong></span>
        `;
        
        // Ajouter l'événement de clic
        adminToggle.addEventListener('click', function() {
            console.log('Bouton admin toggle cliqué');
            
            // Inverser le statut admin
            isAdmin = !isAdmin;
            
            // Mettre à jour le localStorage
            localStorage.setItem('isAdmin', isAdmin);
            
            // Mettre à jour l'interface
            document.body.classList.toggle('is-admin', isAdmin);
            
            // Mettre à jour le texte du bouton
            this.querySelector('strong').textContent = isAdmin ? 'ACTIVÉ' : 'DÉSACTIVÉ';
            
            // Rafraîchir l'affichage des éléments admin
            initAdminAccess();
            
            try {
                // Notifier l'utilisateur
                showNotification(`Mode administrateur ${isAdmin ? 'activé' : 'désactivé'}`);
            } catch (notifyError) {
                console.error('Erreur lors de l\'affichage de la notification:', notifyError);
                alert(`Mode administrateur ${isAdmin ? 'activé' : 'désactivé'}`);
            }
            
            // Si on vient d'activer le mode admin, proposer d'aller à la page d'administration
            if (isAdmin && !window.location.pathname.includes('admin.html')) {
                if (confirm('Voulez-vous accéder à la page d\'administration ?')) {
                    window.location.href = 'admin.html';
                }
            }
            
            // Si on vient de désactiver le mode admin et qu'on est sur la page d'admin, rediriger
            if (!isAdmin && window.location.pathname.includes('admin.html')) {
                alert('Mode administrateur désactivé. Vous allez être redirigé vers la page d\'accueil.');
                window.location.href = 'index.html';
            }
        });
        
        // Ajouter le bouton au body
        document.body.appendChild(adminToggle);
        console.log('Bouton admin toggle ajouté avec succès');
        
    } catch (error) {
        console.error('Erreur lors de l\'ajout du bouton admin toggle:', error);
        // Fallback mode - créer un bouton plus simple
        try {
            const simpleToggle = document.createElement('button');
            simpleToggle.id = 'adminToggle';
            simpleToggle.innerText = 'Admin Mode';
            simpleToggle.style.position = 'fixed';
            simpleToggle.style.bottom = '20px';
            simpleToggle.style.right = '20px';
            simpleToggle.style.zIndex = '9999';
            simpleToggle.style.padding = '10px';
            
            simpleToggle.addEventListener('click', function() {
                isAdmin = !isAdmin;
                localStorage.setItem('isAdmin', isAdmin);
                alert(`Mode admin ${isAdmin ? 'activé' : 'désactivé'}`);
                location.reload();
            });
            
            document.body.appendChild(simpleToggle);
            console.log('Bouton admin simple ajouté avec succès');
        } catch (fallbackError) {
            console.error('Erreur lors de l\'ajout du bouton admin simple:', fallbackError);
        }
    }
}

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
    
    // Mettre à jour l'icône de devise
    updateCurrencyIcon();
    
    // Mettre à jour les statistiques
    updateDashboardStats();
    
    // Simulate data loading for charts (in a real application, this would fetch data from an API)
    simulateDataLoading();
}

function loadProjectsList() {
    // Récupérer les préférences utilisateur pour obtenir la devise
    let userPreferences = {
        currency: 'EUR', // Devise par défaut
    };
    
    try {
        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
            userPreferences = JSON.parse(savedPrefs);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des préférences utilisateur:', error);
    }
    
    // Obtenir le symbole de la devise
    let currencySymbol = '€'; // Euro comme symbole par défaut
    
    // Si AVAILABLE_CURRENCIES est défini (depuis currencies.js), utiliser le symbole correspondant
    if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
        const currency = AVAILABLE_CURRENCIES.find(c => c.code === userPreferences.currency);
        if (currency) {
            currencySymbol = currency.symbol;
        }
    }
    
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
        
        // Déterminer le statut du projet
        let projectStatus = project.projectStatus || 'inProgress';
        let statusLabel = '';
        let statusIcon = '';
        
        switch(projectStatus) {
            case 'inProgress':
                statusLabel = '✅ En cours';
                statusIcon = 'fa-play-circle';
                break;
            case 'almostComplete':
                statusLabel = '⏳ Presque terminé';
                statusIcon = 'fa-hourglass-half';
                break;
            case 'completed':
                statusLabel = '🟢 Terminé';
                statusIcon = 'fa-check-circle';
                break;
            case 'archived':
                statusLabel = '🔒 Archivé';
                statusIcon = 'fa-archive';
                break;
            default:
                statusLabel = '✅ En cours';
                statusIcon = 'fa-play-circle';
        }

        // Vérifier si le projet est presque terminé basé sur l'utilisation du budget
        if (projectStatus === 'inProgress' && utilizationPercent >= 80) {
            projectStatus = 'almostComplete';
            statusLabel = '⏳ Presque terminé';
            statusIcon = 'fa-hourglass-half';
        }

        // Construire la ligne du tableau
        row.innerHTML = `
            <td class="project-name">
                <a href="#" class="project-link" title="Voir les détails">
                    ${project.projectName || 'Sans titre'}
                </a>
            </td>
            <td>${formattedDate}</td>
            <td>${currencySymbol} ${budgetTotal.toFixed(2)}</td>
            <td>${currencySymbol} ${depensesTotal.toFixed(2)}</td>
            <td>
                <div class="progress-container">
                    <div class="progress-bar ${statusClass}" style="width: ${Math.min(utilizationPercent, 100)}%"></div>
                </div>
                <span class="utilization-text">${utilizationPercent}%</span>
            </td>
            <td>
                <span class="project-status ${projectStatus}">
                    <i class="fas ${statusIcon}"></i>
                    ${statusLabel}
                </span>
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
        console.log("Ouverture du projet en mode édition:", projectToEdit.projectName);
        
        // Sauvegarder le projet en cours d'édition dans le localStorage
        localStorage.setItem('currentProject', JSON.stringify(projectToEdit));
        localStorage.setItem('projectInEditing', projectId);
        
        // Rediriger vers la page d'édition avec l'ID du projet
        window.location.href = 'nouveau-projet.html?edit=true&id=' + projectId;
    } else {
        console.error("Projet non trouvé avec ID:", projectId);
        alert("Impossible de trouver le projet demandé.");
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
    // Récupérer les préférences utilisateur pour obtenir la devise
    let userPreferences = {
        currency: 'EUR', // Devise par défaut
    };
    
    try {
        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
            userPreferences = JSON.parse(savedPrefs);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des préférences utilisateur:', error);
    }
    
    // Obtenir le symbole de la devise
    let currencySymbol = '€'; // Symbole par défaut (Euro)
    let currencyCode = 'EUR';
    
    // Si AVAILABLE_CURRENCIES est défini (depuis currencies.js), utiliser le symbole correspondant
    if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
        const currency = AVAILABLE_CURRENCIES.find(c => c.code === userPreferences.currency);
        if (currency) {
            currencySymbol = currency.symbol;
            currencyCode = currency.code;
        }
    }
    
    console.log('Devise actuelle: ', userPreferences.currency, 'Symbole:', currencySymbol);
    
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
        // Forcer la suppression des symboles de devise précédents
        totalBudgetElement.innerHTML = '';
        totalBudgetElement.textContent = `${currencySymbol} ${totalBudget.toFixed(2)}`;
        console.log(`Mise à jour du budget total avec le symbole ${currencySymbol}`);
    }
    
    // Sauvegarder dans localStorage pour les vues mobiles éventuelles
    try {
        localStorage.setItem('mobileDashboardStats', JSON.stringify({
            currency: currencyCode,
            symbol: currencySymbol,
            totalBudget: totalBudget,
            lastUpdated: new Date().toISOString()
        }));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des stats mobiles:', error);
    }
    
    // Récupération et mise à jour du solde du portefeuille
    const walletBalanceElement = document.getElementById('walletBalance');
    if (walletBalanceElement) {
        let totalBalance = 0;
        let totalProjectExpenses = 0;
        
        try {
            // Récupérer tous les portefeuilles depuis mapocket_wallets
            const wallets = JSON.parse(localStorage.getItem('mapocket_wallets') || '[]');
            console.log('Portefeuilles récupérés:', wallets);
            
            if (Array.isArray(wallets)) {
                // Calculer le solde total des portefeuilles
                wallets.forEach(wallet => {
                    if (wallet.balance) {
                        totalBalance += parseFloat(wallet.balance);
                    }
                });
                
                // Récupérer tous les projets
                const projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
                
                // Calculer les dépenses totales des projets liés à un portefeuille
                if (Array.isArray(projects)) {
                    projects.forEach(project => {
                        // Vérifier si le projet est lié à un portefeuille
                        if (project.linkToWallet && project.realExpenses && Array.isArray(project.realExpenses)) {
                            // Calculer le total des dépenses réelles pour ce projet
                            const projectExpenses = project.realExpenses.reduce((total, expense) => {
                                return total + parseFloat(expense.amount || 0);
                            }, 0);
                            
                            // Ajouter aux dépenses totales
                            totalProjectExpenses += projectExpenses;
                        }
                    });
                }
                
                // Calculer le solde net (solde des portefeuilles - dépenses des projets liés)
                const netBalance = totalBalance - totalProjectExpenses;
                
                console.log('Solde total des portefeuilles:', totalBalance);
                console.log('Total des dépenses des projets liés:', totalProjectExpenses);
                console.log('Solde net des portefeuilles:', netBalance);
                
                // Mettre à jour l'affichage avec le solde net
                walletBalanceElement.innerHTML = '';
                walletBalanceElement.textContent = `${currencySymbol} ${netBalance.toFixed(2)}`;
                console.log(`Mise à jour du solde portefeuille avec le symbole ${currencySymbol}`);
                
                // Ajouter une info-bulle explicative
                walletBalanceElement.setAttribute('title', `Solde total: ${currencySymbol}${totalBalance.toFixed(2)} - Dépenses des projets liés: ${currencySymbol}${totalProjectExpenses.toFixed(2)}`);
                
                // Mettre à jour les statistiques mobiles
                try {
                    let mobileStats = JSON.parse(localStorage.getItem('mobileDashboardStats') || '{}');
                    mobileStats.walletBalance = netBalance;
                    localStorage.setItem('mobileDashboardStats', JSON.stringify(mobileStats));
                } catch (error) {
                    console.error('Erreur lors de la mise à jour des stats mobiles (solde):', error);
                }
                
                return;
            } else {
                console.error('Format incorrect pour mapocket_wallets:', wallets);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des portefeuilles:', error);
        }
        
        // Si on arrive ici, c'est qu'il y a eu une erreur dans le calcul
        walletBalanceElement.innerHTML = '';
        walletBalanceElement.textContent = `${currencySymbol} ${totalBalance.toFixed(2)}`;
        console.log(`Fallback: Mise à jour du solde portefeuille avec le symbole ${currencySymbol}`);
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

// Fonction utilitaire pour créer un portefeuille de test
function createTestWallet(name = "Portefeuille Principal", balance = 2000) {
    // Récupérer les préférences utilisateur pour obtenir la devise
    let userPreferences = {
        currency: 'EUR', // Devise par défaut
    };
    
    try {
        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
            userPreferences = JSON.parse(savedPrefs);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des préférences utilisateur:', error);
    }
    
    // Obtenir le symbole de la devise
    let currencySymbol = '€'; // Symbole par défaut (Euro)
    
    // Si AVAILABLE_CURRENCIES est défini (depuis currencies.js), utiliser le symbole correspondant
    if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
        const currency = AVAILABLE_CURRENCIES.find(c => c.code === userPreferences.currency);
        if (currency) {
            currencySymbol = currency.symbol;
        }
    }
    
    // Récupérer les portefeuilles existants ou créer un tableau vide
    let wallets = JSON.parse(localStorage.getItem('mapocket_wallets') || '[]');
    
    // Ajouter le nouveau portefeuille
    const newWallet = {
        id: Date.now().toString(),
        name: name,
        balance: balance,
        createdAt: new Date().toISOString(),
        currency: currencySymbol
    };
    
    wallets.push(newWallet);
    
    // Sauvegarder les portefeuilles
    localStorage.setItem('mapocket_wallets', JSON.stringify(wallets));
    
    // Recharger les données du tableau de bord
    updateDashboardStats();
    
    console.log('Portefeuille de test créé avec succès:', newWallet);
    return newWallet;
}