// JavaScript pour la page de détail de projet
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page de détail de projet initialisée');
    
    // Initialiser la page
    initProjectDetailPage();
    
    // Ajouter les écouteurs d'événements seulement s'ils existent
    
    // Retour au tableau de bord
    const btnBackToDashboard = document.getElementById('btn-back-to-dashboard');
    if (btnBackToDashboard) {
        btnBackToDashboard.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    // Gestionnaires d'événements pour les onglets
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Gestionnaires d'événements pour les actions
    const btnEditProject = document.querySelector('.btn-edit-project');
    if (btnEditProject) {
        btnEditProject.addEventListener('click', editProject);
    }
    
    const btnCompleteProject = document.querySelector('.btn-complete-project');
    if (btnCompleteProject) {
        btnCompleteProject.addEventListener('click', function() {
            completeProject();
        });
    }
    
    const btnArchiveProject = document.querySelector('.btn-archive-project');
    if (btnArchiveProject) {
        btnArchiveProject.addEventListener('click', function() {
            archiveProject();
        });
    }

    const btnAddExpense = document.querySelector('.btn-add-real-expense');
    if (btnAddExpense) {
        btnAddExpense.addEventListener('click', function() {
            openRealExpenseModal();
        });
    }
    
    const btnAddAttachment = document.querySelector('.btn-add-attachment');
    if (btnAddAttachment) {
        btnAddAttachment.addEventListener('click', function() {
            openAttachmentModal();
        });
    }
    
    const btnLinkToWallet = document.querySelector('.btn-link-to-wallet');
    if (btnLinkToWallet) {
        btnLinkToWallet.addEventListener('click', function() {
            toggleWalletLink();
        });
    }
    
    const btnAddComment = document.querySelector('.btn-add-comment');
    if (btnAddComment) {
        btnAddComment.addEventListener('click', function() {
            addComment();
        });
    }
    
    const btnCreateWishlist = document.querySelector('.btn-create-wishlist');
    if (btnCreateWishlist) {
        btnCreateWishlist.addEventListener('click', function() {
            createWishlistForProject(window.currentProject.id);
        });
    }
    
    // Charger les projets associés (implémentation future)
    // loadRelatedProjects();
    
    // Gestionnaire de soumission du formulaire de dépense réelle
    const realExpenseForm = document.getElementById('real-expense-form');
    if (realExpenseForm) {
        realExpenseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveRealExpense();
        });
    }
    
    // Gestionnaire de soumission du formulaire de pièce jointe
    const attachmentForm = document.getElementById('attachment-form');
    if (attachmentForm) {
        attachmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAttachment();
        });
    }
    
    // Initialiser les modales
    initModals();
});

// Fonction pour initialiser les modales
function initModals() {
    // Gestionnaires pour fermer les modales
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Fermer la modale en cliquant à l'extérieur
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

// Fonction pour changer d'onglet
function switchTab(tabId) {
    // Masquer tous les contenus d'onglets
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Désactiver tous les boutons d'onglets
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Activer l'onglet sélectionné
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    console.log(`Onglet actif : ${tabId}`);
}

function initProjectDetailPage() {
    // Récupérer l'ID du projet depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    
    if (!projectId) {
        showNotification('Aucun projet spécifié', 'error');
        return;
    }
    
    // Charger les données du projet
    loadProjectDetails(projectId);
}

// Fonction pour charger les détails du projet
function loadProjectDetails(projectId) {
    // Récupérer le projet depuis le localStorage
    let projects = [];
    try {
        projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        showNotification('Erreur lors du chargement du projet', 'error');
        return;
    }
    
    // Trouver le projet par son ID
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
        showNotification('Projet non trouvé', 'error');
        return;
    }
    
    // Stocker le projet actuel dans une variable globale pour y accéder facilement
    window.currentProject = project;
    
    // Mettre à jour les informations du projet dans l'interface
    updateProjectUI(project);
    
    // Charger les catégories
    loadCategories(project);
    
    // Charger les dépenses réelles
    loadRealExpenses(projectId);
    
    // Charger les justificatifs
    loadAttachments(projectId);
    
    // Charger les commentaires
    loadComments(projectId);
    
    // Vérifier si le projet est lié à un portefeuille
    checkWalletLink(project);
    
    console.log('Projet chargé:', project.projectName);
}

// Fonction pour mettre à jour l'interface avec les données du projet
function updateProjectUI(project) {
    // Titre et type
    document.getElementById('projectTitle').textContent = project.projectName;
    document.getElementById('projectType').textContent = project.template || 'Personnalisé';
    
    // Date
    document.getElementById('projectDate').textContent = project.projectDate || '-';
    
    // Statut du projet
    const projectStatus = project.projectStatus || 'inProgress';
    let statusText = '';
    let statusClass = '';
    
    switch(projectStatus) {
        case 'inProgress':
            statusText = '✅ En cours';
            statusClass = 'status-in-progress';
            break;
        case 'almostComplete':
            statusText = '⏳ Presque terminé';
            statusClass = 'status-almost-complete';
            break;
        case 'completed':
            statusText = '🟢 Terminé';
            statusClass = 'status-completed';
            break;
        case 'archived':
            statusText = '🔒 Archivé';
            statusClass = 'status-archived';
            break;
        default:
            statusText = '✅ En cours';
            statusClass = 'status-in-progress';
    }
    
    // Mettre à jour le statut du projet dans l'interface
    const projectStatusElement = document.getElementById('projectStatus');
    if (projectStatusElement) {
        projectStatusElement.textContent = statusText;
        projectStatusElement.className = `project-status ${statusClass}`;
    }
    
    // Budget initial
    document.getElementById('initialBudget').textContent = project.totalBudget || '€ 0';
    
    // Budget utilisé et écart (à calculer)
    updateBudgetStats(project);
}

// Fonction pour mettre à jour les statistiques budgétaires
function updateBudgetStats(project) {
    // Calculer le budget initial
    const initialBudget = parseFloat(project.totalBudget?.replace(/[^0-9.]/g, '') || 0);
    
    // Calculer le budget utilisé (somme des dépenses réelles)
    let usedBudget = 0;
    if (project.realExpenses && Array.isArray(project.realExpenses)) {
        usedBudget = project.realExpenses.reduce((total, expense) => {
            return total + parseFloat(expense.amount || 0);
        }, 0);
    }
    
    // Calculer les dépenses de la wishlist (items achetés)
    let wishlistExpenses = 0;
    if (project.wishlistItems && Array.isArray(project.wishlistItems)) {
        wishlistExpenses = project.wishlistItems.reduce((total, item) => {
            // Ne compter que les articles marqués comme achetés
            if (item.purchased) {
                return total + parseFloat(item.price || 0);
            }
            return total;
        }, 0);
    }
    
    // Calculer le budget total utilisé (dépenses réelles + wishlist)
    const totalExpenses = usedBudget + wishlistExpenses;
    
    // Calculer l'écart budgétaire
    const budgetGap = initialBudget - totalExpenses;
    
    // Calculer le pourcentage d'utilisation
    const usagePercentage = initialBudget > 0 ? Math.round((totalExpenses / initialBudget) * 100) : 0;
    
    // Mettre à jour l'interface
    document.getElementById('usedBudget').textContent = formatCurrency(totalExpenses);
    document.getElementById('budgetGap').textContent = formatCurrency(Math.abs(budgetGap));
    document.getElementById('budgetPercentage').textContent = `${usagePercentage}%`;
    
    // Mettre à jour la barre de progression
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = `${Math.min(usagePercentage, 100)}%`;
    }
    
    // Ajouter une classe CSS en fonction de l'écart budgétaire
    const budgetGapCard = document.getElementById('budgetGapCard');
    if (budgetGapCard) {
        budgetGapCard.classList.remove('positive', 'negative');
        
        if (budgetGap < 0) {
            // Dépassement de budget
            budgetGapCard.classList.add('negative');
            document.getElementById('budgetGap').textContent = `- ${formatCurrency(Math.abs(budgetGap))}`;
            if (progressFill) progressFill.classList.add('over-budget');
        } else {
            // Budget respecté
            budgetGapCard.classList.add('positive');
            document.getElementById('budgetGap').textContent = formatCurrency(budgetGap);
            if (progressFill) progressFill.classList.remove('over-budget');
        }
    }
    
    // Mettre à jour le statut du projet basé sur l'utilisation du budget
    updateProjectStatus(project, usagePercentage);
}

// Fonction pour mettre à jour le statut d'un projet en fonction de divers critères
function updateProjectStatus(project, usagePercentage) {
    // Ne pas changer les projets qui ont été marqués manuellement comme "terminés" ou "archivés"
    if (project.projectStatus === 'completed' || project.projectStatus === 'archived') {
        return;
    }
    
    // Vérifier si une date de fin a été définie et est dépassée
    let shouldArchive = false;
    if (project.endDate) {
        const endDate = new Date(project.endDate);
        const currentDate = new Date();
        
        if (endDate < currentDate) {
            shouldArchive = true;
        }
    }
    
    // Archiver le projet si nécessaire
    if (shouldArchive) {
        project.projectStatus = 'archived';
        
        // Mettre à jour l'affichage du statut
        const projectStatusElement = document.getElementById('projectStatus');
        if (projectStatusElement) {
            projectStatusElement.textContent = '🔒 Archivé';
            projectStatusElement.className = 'project-status status-archived';
        }
        
        // Sauvegarder le projet mis à jour
        saveProjectChanges(project);
        return;
    }
    
    // Mettre à jour le statut en fonction du pourcentage d'utilisation du budget
    let newStatus = 'inProgress';
    
    if (usagePercentage >= 80 && usagePercentage < 100) {
        newStatus = 'almostComplete';
    }
    
    // Ne mettre à jour que si le statut a changé
    if (project.projectStatus !== newStatus) {
        project.projectStatus = newStatus;
        
        // Mettre à jour l'affichage du statut
        const projectStatusElement = document.getElementById('projectStatus');
        if (projectStatusElement) {
            let statusText = '';
            let statusClass = '';
            
            switch(newStatus) {
                case 'inProgress':
                    statusText = '✅ En cours';
                    statusClass = 'status-in-progress';
                    break;
                case 'almostComplete':
                    statusText = '⏳ Presque terminé';
                    statusClass = 'status-almost-complete';
                    break;
            }
            
            projectStatusElement.textContent = statusText;
            projectStatusElement.className = `project-status ${statusClass}`;
        }
        
        // Sauvegarder le projet mis à jour
        saveProjectChanges(project);
    }
}

// Fonction pour marquer un projet comme terminé manuellement
function completeProject() {
    const project = window.currentProject;
    
    if (!project) {
        showNotification('Projet non trouvé', 'error');
        return;
    }
    
    if (project.projectStatus === 'completed') {
        // Déjà terminé, on le remet en cours
        project.projectStatus = 'inProgress';
        showNotification('Le projet a été remis en cours');
    } else {
        // Marquer comme terminé
        project.projectStatus = 'completed';
        showNotification('Le projet a été marqué comme terminé');
    }
    
    // Mettre à jour l'interface
    updateProjectUI(project);
    
    // Sauvegarder les modifications
    saveProjectChanges(project);
}

// Fonction pour archiver un projet
function archiveProject() {
    const project = window.currentProject;
    
    if (!project) {
        showNotification('Projet non trouvé', 'error');
        return;
    }
    
    if (project.projectStatus === 'archived') {
        // Déjà archivé, on le remet en cours
        project.projectStatus = 'inProgress';
        showNotification('Le projet a été désarchivé');
    } else {
        if (confirm('Voulez-vous vraiment archiver ce projet ? Il ne sera plus modifiable.')) {
            project.projectStatus = 'archived';
            showNotification('Le projet a été archivé');
        } else {
            return;
        }
    }
    
    // Mettre à jour l'interface
    updateProjectUI(project);
    
    // Sauvegarder les modifications
    saveProjectChanges(project);
}

// Fonction pour sauvegarder les modifications d'un projet
function saveProjectChanges(project) {
    // Récupérer tous les projets
    let projects = [];
    try {
        projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        showNotification('Erreur lors de la sauvegarde du projet', 'error');
        return;
    }
    
    // Trouver l'index du projet à modifier
    const projectIndex = projects.findIndex(p => p.id === project.id);
    
    if (projectIndex === -1) {
        showNotification('Projet non trouvé pour la mise à jour', 'error');
        return;
    }
    
    // Mettre à jour le projet
    projects[projectIndex] = project;
    
    // Sauvegarder tous les projets
    localStorage.setItem('savedProjects', JSON.stringify(projects));
    
    console.log('Projet mis à jour:', project.projectName);
}

// Fonction pour formater une date
function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) {
        return '-';
    }
    
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Fonction pour formater un montant en devise
function formatCurrency(amount) {
    // Récupérer les préférences utilisateur
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
    if (typeof window.getCurrencySymbol === 'function') {
        currencySymbol = window.getCurrencySymbol(userPreferences.currency);
    }
    
    return `${currencySymbol} ${parseFloat(amount).toFixed(2)}`;
}

// Fonction pour afficher une notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Fonctions à implémenter pour les autres fonctionnalités
function editProject() {
    const project = window.currentProject;
    
    // Sauvegarder le projet en cours d'édition
    localStorage.setItem('currentProject', JSON.stringify(project));
    
    // Rediriger vers la page d'édition
    window.location.href = 'nouveau-projet.html?edit=true';
}

function openRealExpenseModal(expenseIndex = null) {
    const modal = document.getElementById('real-expense-modal');
    const form = document.getElementById('real-expense-form');
    const title = document.getElementById('real-expense-modal-title');
    
    if (!modal || !form) {
        return;
    }
    
    // Réinitialiser le formulaire
    form.reset();
    
    // Mettre à jour le titre de la modale en fonction du mode (création ou édition)
    if (expenseIndex !== null) {
        title.textContent = 'Modifier une dépense';
        
        // Charger les données de la dépense à modifier
        const project = window.currentProject;
        const expense = project.realExpenses[expenseIndex];
        
        if (expense) {
            form.querySelector('[name="expense-date"]').value = expense.date ? new Date(expense.date).toISOString().substr(0, 10) : '';
            form.querySelector('[name="expense-category"]').value = expense.category || '';
            form.querySelector('[name="expense-description"]').value = expense.description || '';
            form.querySelector('[name="expense-amount"]').value = expense.amount || '';
            form.querySelector('[name="expense-index"]').value = expenseIndex;
        }
    } else {
        title.textContent = 'Ajouter une dépense';
        form.querySelector('[name="expense-date"]').value = new Date().toISOString().substr(0, 10);
        form.querySelector('[name="expense-index"]').value = '';
    }
    
    // Afficher la modale
    modal.style.display = 'block';
}

function saveRealExpense() {
    const form = document.getElementById('real-expense-form');
    
    if (!form) {
        return;
    }
    
    // Récupérer les valeurs du formulaire
    const date = form.querySelector('[name="expense-date"]').value;
    const category = form.querySelector('[name="expense-category"]').value;
    const description = form.querySelector('[name="expense-description"]').value;
    const amount = parseFloat(form.querySelector('[name="expense-amount"]').value || 0);
    const expenseIndex = form.querySelector('[name="expense-index"]').value;
    
    if (!date || !description || isNaN(amount) || amount <= 0) {
        showNotification('Veuillez remplir tous les champs correctement', 'error');
        return;
    }
    
    const expense = {
        date: date,
        category: category,
        description: description,
        amount: amount
    };
    
    // Récupérer le projet actuel
    const project = window.currentProject;
    
    // S'assurer que le tableau de dépenses existe
    if (!project.realExpenses) {
        project.realExpenses = [];
    }
    
    // Ajouter ou mettre à jour la dépense
    if (expenseIndex !== '') {
        project.realExpenses[parseInt(expenseIndex)] = expense;
        showNotification('Dépense mise à jour');
    } else {
        project.realExpenses.push(expense);
        showNotification('Dépense ajoutée');
    }
    
    // Fermer la modale
    document.getElementById('real-expense-modal').style.display = 'none';
    
    // Mettre à jour l'affichage
    loadRealExpenses(project.id);
    
    // Mettre à jour les statistiques
    updateBudgetStats(project);
    
    // Sauvegarder les modifications
    saveProjectChanges(project);
}

function deleteRealExpense(expenseIndex) {
    if (!confirm('Voulez-vous vraiment supprimer cette dépense ?')) {
        return;
    }
    
    // Récupérer le projet actuel
    const project = window.currentProject;
    
    // S'assurer que le tableau de dépenses existe
    if (!project.realExpenses || expenseIndex >= project.realExpenses.length) {
        showNotification('Dépense introuvable', 'error');
        return;
    }
    
    // Supprimer la dépense
    project.realExpenses.splice(expenseIndex, 1);
    
    // Mettre à jour l'affichage
    loadRealExpenses(project.id);
    
    // Mettre à jour les statistiques
    updateBudgetStats(project);
    
    // Sauvegarder les modifications
    saveProjectChanges(project);
    
    showNotification('Dépense supprimée');
}

function openAttachmentModal(attachmentIndex = null) {
    const modal = document.getElementById('attachment-modal');
    const form = document.getElementById('attachment-form');
    const title = document.getElementById('attachment-modal-title');
    
    if (!modal || !form) {
        return;
    }
    
    // Réinitialiser le formulaire
    form.reset();
    
    // Mettre à jour le titre de la modale en fonction du mode (création ou édition)
    if (attachmentIndex !== null) {
        title.textContent = 'Modifier une pièce jointe';
        
        // Charger les données de la pièce jointe à modifier
        const project = window.currentProject;
        const attachment = project.attachments[attachmentIndex];
        
        if (attachment) {
            form.querySelector('[name="attachment-title"]').value = attachment.title || '';
            form.querySelector('[name="attachment-category"]').value = attachment.category || '';
            form.querySelector('[name="attachment-description"]').value = attachment.description || '';
            // Note: impossible de précharger le fichier pour des raisons de sécurité
            form.querySelector('[name="attachment-index"]').value = attachmentIndex;
        }
    } else {
        title.textContent = 'Ajouter une pièce jointe';
        form.querySelector('[name="attachment-index"]').value = '';
    }
    
    // Afficher la modale
    modal.style.display = 'block';
}

function saveAttachment() {
    const form = document.getElementById('attachment-form');
    
    if (!form) {
        return;
    }
    
    // Récupérer les valeurs du formulaire
    const title = form.querySelector('[name="attachment-title"]').value;
    const category = form.querySelector('[name="attachment-category"]').value;
    const description = form.querySelector('[name="attachment-description"]').value;
    const fileInput = form.querySelector('[name="attachment-file"]');
    const attachmentIndex = form.querySelector('[name="attachment-index"]').value;
    
    if (!title || fileInput.files.length === 0) {
        showNotification('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }
    
    // Dans une application réelle, nous téléchargerions le fichier sur un serveur
    // Ici, nous allons simplement sauvegarder le nom du fichier
    const file = fileInput.files[0];
    
    const attachment = {
        title: title,
        category: category,
        description: description,
        file: file.name,
        size: file.size,
        type: file.type,
        date: new Date().toISOString()
    };
    
    // Récupérer le projet actuel
    const project = window.currentProject;
    
    // S'assurer que le tableau de pièces jointes existe
    if (!project.attachments) {
        project.attachments = [];
    }
    
    // Ajouter ou mettre à jour la pièce jointe
    if (attachmentIndex !== '') {
        project.attachments[parseInt(attachmentIndex)] = attachment;
        showNotification('Pièce jointe mise à jour');
    } else {
        project.attachments.push(attachment);
        showNotification('Pièce jointe ajoutée');
    }
    
    // Fermer la modale
    document.getElementById('attachment-modal').style.display = 'none';
    
    // Mettre à jour l'affichage
    loadAttachments(project.id);
    
    // Sauvegarder les modifications
    saveProjectChanges(project);
}

function deleteAttachment(attachmentIndex) {
    if (!confirm('Voulez-vous vraiment supprimer cette pièce jointe ?')) {
        return;
    }
    
    // Récupérer le projet actuel
    const project = window.currentProject;
    
    // S'assurer que le tableau de pièces jointes existe
    if (!project.attachments || attachmentIndex >= project.attachments.length) {
        showNotification('Pièce jointe introuvable', 'error');
        return;
    }
    
    // Supprimer la pièce jointe
    project.attachments.splice(attachmentIndex, 1);
    
    // Mettre à jour l'affichage
    loadAttachments(project.id);
    
    // Sauvegarder les modifications
    saveProjectChanges(project);
    
    showNotification('Pièce jointe supprimée');
}

function loadComments(projectId) {
    const commentsContainer = document.getElementById('commentsContainer');
    commentsContainer.innerHTML = '';
    
    // Récupérer le projet
    const project = window.currentProject;
    
    if (!project.comments || project.comments.length === 0) {
        commentsContainer.innerHTML = '<div class="empty-comments-message">Aucun commentaire n\'a été ajouté à ce projet.</div>';
        return;
    }
    
    // Afficher chaque commentaire
    project.comments.forEach((comment, index) => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        
        // Formater la date
        const date = new Date(comment.date);
        const formattedDate = formatDate(date);
        
        commentElement.innerHTML = `
            <div class="comment-header">
                <div class="comment-author">${comment.author || 'Utilisateur'}</div>
                <div class="comment-date">${formattedDate}</div>
            </div>
            <div class="comment-content">${comment.content}</div>
            <div class="comment-actions">
                <button class="btn-sm btn-delete-comment" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Ajouter l'événement de suppression
        commentElement.querySelector('.btn-delete-comment').addEventListener('click', function() {
            deleteComment(index);
        });
        
        commentsContainer.appendChild(commentElement);
    });
}

function addComment() {
    const commentInput = document.getElementById('commentInput');
    
    if (!commentInput || !commentInput.value.trim()) {
        showNotification('Veuillez entrer un commentaire', 'error');
        return;
    }
    
    const comment = {
        author: 'Utilisateur', // Dans une application réelle, ce serait l'utilisateur connecté
        content: commentInput.value.trim(),
        date: new Date().toISOString()
    };
    
    // Récupérer le projet actuel
    const project = window.currentProject;
    
    // S'assurer que le tableau de commentaires existe
    if (!project.comments) {
        project.comments = [];
    }
    
    // Ajouter le commentaire
    project.comments.push(comment);
    
    // Réinitialiser le champ de saisie
    commentInput.value = '';
    
    // Mettre à jour l'affichage
    loadComments(project.id);
    
    // Sauvegarder les modifications
    saveProjectChanges(project);
    
    showNotification('Commentaire ajouté');
}

function deleteComment(commentIndex) {
    if (!confirm('Voulez-vous vraiment supprimer ce commentaire ?')) {
        return;
    }
    
    // Récupérer le projet actuel
    const project = window.currentProject;
    
    // S'assurer que le tableau de commentaires existe
    if (!project.comments || commentIndex >= project.comments.length) {
        showNotification('Commentaire introuvable', 'error');
        return;
    }
    
    // Supprimer le commentaire
    project.comments.splice(commentIndex, 1);
    
    // Mettre à jour l'affichage
    loadComments(project.id);
    
    // Sauvegarder les modifications
    saveProjectChanges(project);
    
    showNotification('Commentaire supprimé');
}

function checkWalletLink(project) {
    const linkToWalletBtn = document.querySelector('.btn-link-to-wallet');
    
    if (!linkToWalletBtn) {
        return;
    }
    
    // Mettre à jour le texte et l'apparence du bouton en fonction du statut de liaison
    if (project.linkToWallet) {
        linkToWalletBtn.innerHTML = '<i class="fas fa-unlink"></i> Délier du portefeuille';
        linkToWalletBtn.classList.add('linked');
    } else {
        linkToWalletBtn.innerHTML = '<i class="fas fa-link"></i> Lier au portefeuille';
        linkToWalletBtn.classList.remove('linked');
    }
}

function toggleWalletLink() {
    // Récupérer le projet actuel
    const project = window.currentProject;
    
    // Inverser l'état de liaison
    project.linkToWallet = !project.linkToWallet;
    
    // Récupérer les données du portefeuille
    let walletData = {
        linkedProjects: []
    };
    
    try {
        const savedWalletData = localStorage.getItem('walletData');
        if (savedWalletData) {
            walletData = JSON.parse(savedWalletData);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données du portefeuille:', error);
    }
    
    // Mettre à jour la liste des projets liés
    if (project.linkToWallet) {
        // Ajouter le projet à la liste
        if (!walletData.linkedProjects.includes(project.id)) {
            walletData.linkedProjects.push(project.id);
        }
        showNotification('Projet lié au portefeuille');
    } else {
        // Retirer le projet de la liste
        walletData.linkedProjects = walletData.linkedProjects.filter(id => id !== project.id);
        showNotification('Projet délié du portefeuille');
    }
    
    // Sauvegarder les données du portefeuille
    localStorage.setItem('walletData', JSON.stringify(walletData));
    
    // Mettre à jour l'interface
    checkWalletLink(project);
    
    // Sauvegarder les modifications du projet
    saveProjectChanges(project);
}

function createWishlistForProject(projectId) {
    // Vérifier si une wishlist existe déjà pour ce projet
    let wishlists = [];
    try {
        wishlists = JSON.parse(localStorage.getItem('wishlists') || '[]');
    } catch (error) {
        console.error('Erreur lors du chargement des wishlists:', error);
        wishlists = [];
    }
    
    const existingWishlist = wishlists.find(w => w.projectId === projectId);
    
    if (existingWishlist) {
        // Rediriger vers la wishlist existante
        window.location.href = `wishlist.html?id=${existingWishlist.id}`;
        return;
    }
    
    // Récupérer les données du projet
    const project = window.currentProject;
    
    // Créer une nouvelle wishlist
    const newWishlist = {
        id: Date.now().toString(),
        projectId: projectId,
        name: `Wishlist pour ${project.projectName}`,
        description: `Articles pour le projet "${project.projectName}"`,
        items: [],
        createdAt: new Date().toISOString(),
        public: false
    };
    
    // Ajouter la wishlist à la liste
    wishlists.push(newWishlist);
    
    // Sauvegarder la liste mise à jour
    localStorage.setItem('wishlists', JSON.stringify(wishlists));
    
    // Rediriger vers la nouvelle wishlist
    window.location.href = `wishlist.html?id=${newWishlist.id}`;
}