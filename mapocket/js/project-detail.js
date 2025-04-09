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
    
    const btnDeleteProject = document.querySelector('.btn-delete-project');
    if (btnDeleteProject) {
        btnDeleteProject.addEventListener('click', deleteProject);
    }
    
    const btnExportProject = document.querySelector('.btn-export-project');
    if (btnExportProject) {
        btnExportProject.addEventListener('click', exportProject);
    }
    
    const btnLinkWallet = document.querySelector('.btn-link-wallet');
    if (btnLinkWallet) {
        btnLinkWallet.addEventListener('click', linkWallet);
    }
    
    const btnAddCategory = document.querySelector('.btn-add-category');
    if (btnAddCategory) {
        btnAddCategory.addEventListener('click', addCategory);
    }
    
    const btnAddExpense = document.querySelector('.btn-add-expense');
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
    
    // Gestionnaires d'événements pour les modales
    document.querySelectorAll('.close-modal, .cancel-modal').forEach(element => {
        element.addEventListener('click', function() {
            closeAllModals();
        });
    });
    
    // Gestionnaires d'événements pour les formulaires
    const realExpenseForm = document.getElementById('realExpenseForm');
    if (realExpenseForm) {
        realExpenseForm.addEventListener('submit', function(event) {
            event.preventDefault();
            saveRealExpense();
        });
    }
    
    const attachmentForm = document.getElementById('attachmentForm');
    if (attachmentForm) {
        attachmentForm.addEventListener('submit', function(event) {
            event.preventDefault();
            saveAttachment();
        });
    }
    
    const saveCommentBtn = document.getElementById('saveComment');
    if (saveCommentBtn) {
        saveCommentBtn.addEventListener('click', saveComment);
    }
    
    // Gestionnaires d'événements pour l'exportation
    document.querySelectorAll('.btn-export').forEach(button => {
        button.addEventListener('click', function() {
            const format = this.getAttribute('data-format');
            exportReport(format);
        });
    });
});

// Fonction pour initialiser la page de détail du projet
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
    
    // Calculer l'écart budgétaire
    const budgetGap = initialBudget - usedBudget;
    
    // Calculer le pourcentage d'utilisation
    const usagePercentage = initialBudget > 0 ? Math.round((usedBudget / initialBudget) * 100) : 0;
    
    // Mettre à jour l'interface
    document.getElementById('usedBudget').textContent = formatCurrency(usedBudget);
    document.getElementById('budgetGap').textContent = formatCurrency(Math.abs(budgetGap));
    document.getElementById('budgetPercentage').textContent = `${usagePercentage}%`;
    
    // Mettre à jour la barre de progression
    const progressFill = document.querySelector('.progress-fill');
    progressFill.style.width = `${Math.min(usagePercentage, 100)}%`;
    
    // Ajouter une classe CSS en fonction de l'écart budgétaire
    const budgetGapCard = document.getElementById('budgetGapCard');
    budgetGapCard.classList.remove('positive', 'negative');
    
    if (budgetGap < 0) {
        // Dépassement de budget
        budgetGapCard.classList.add('negative');
        document.getElementById('budgetGap').textContent = `- ${formatCurrency(Math.abs(budgetGap))}`;
        progressFill.classList.add('over-budget');
    } else {
        // Budget respecté
        budgetGapCard.classList.add('positive');
        document.getElementById('budgetGap').textContent = formatCurrency(budgetGap);
        progressFill.classList.remove('over-budget');
    }
}

// Fonction pour charger les catégories du projet
function loadCategories(project) {
    const categoriesContainer = document.getElementById('categoriesContainer');
    categoriesContainer.innerHTML = '';
    
    if (!project.categories || project.categories.length === 0) {
        categoriesContainer.innerHTML = '<div class="empty-categories-message">Aucune catégorie n\'a été définie pour ce projet.</div>';
        return;
    }
    
    // Créer un élément pour chaque catégorie
    project.categories.forEach((category, categoryIndex) => {
        const categoryEl = createCategoryElement(category, categoryIndex);
        categoriesContainer.appendChild(categoryEl);
    });
}

// Fonction pour créer un élément de catégorie
function createCategoryElement(category, categoryIndex) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'expense-category';
    categoryDiv.setAttribute('data-category-index', categoryIndex);
    
    // En-tête de la catégorie
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'category-header';
    categoryHeader.innerHTML = `
        <h4 class="category-name">${category.name}</h4>
        <span class="category-amount">${category.amount}</span>
        <div class="category-controls">
            <button type="button" class="btn-sm btn-edit-category" title="Modifier">
                <i class="fas fa-edit"></i>
            </button>
            <button type="button" class="btn-sm btn-delete-category" title="Supprimer">
                <i class="fas fa-trash"></i>
            </button>
            <button type="button" class="category-toggle open">
                <i class="fas fa-chevron-up"></i>
            </button>
        </div>
    `;
    
    // Conteneur des sous-catégories
    const subcategoriesContainer = document.createElement('div');
    subcategoriesContainer.className = 'subcategories-container open';
    
    // Ajouter les sous-catégories
    if (category.subcategories && category.subcategories.length > 0) {
        category.subcategories.forEach((subcategory, subcategoryIndex) => {
            const subcategoryEl = createSubcategoryElement(subcategory, categoryIndex, subcategoryIndex);
            subcategoriesContainer.appendChild(subcategoryEl);
        });
    } else {
        subcategoriesContainer.innerHTML = '<div class="empty-subcategories-message">Aucune sous-catégorie n\'a été définie.</div>';
    }
    
    // Bouton pour ajouter une sous-catégorie
    const addSubcategoryBtn = document.createElement('button');
    addSubcategoryBtn.type = 'button';
    addSubcategoryBtn.className = 'add-subcategory-btn';
    addSubcategoryBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter une sous-catégorie';
    addSubcategoryBtn.addEventListener('click', function() {
        addSubcategory(categoryIndex);
    });
    
    subcategoriesContainer.appendChild(addSubcategoryBtn);
    
    // Assembler la catégorie
    categoryDiv.appendChild(categoryHeader);
    categoryDiv.appendChild(subcategoriesContainer);
    
    // Ajouter les événements
    categoryHeader.querySelector('.category-toggle').addEventListener('click', function() {
        subcategoriesContainer.classList.toggle('open');
        this.classList.toggle('open');
        this.querySelector('i').classList.toggle('fa-chevron-up');
        this.querySelector('i').classList.toggle('fa-chevron-down');
    });
    
    categoryHeader.querySelector('.btn-edit-category').addEventListener('click', function() {
        editCategory(categoryIndex);
    });
    
    categoryHeader.querySelector('.btn-delete-category').addEventListener('click', function() {
        deleteCategory(categoryIndex);
    });
    
    return categoryDiv;
}

// Fonction pour créer un élément de sous-catégorie
function createSubcategoryElement(subcategory, categoryIndex, subcategoryIndex) {
    const subcategoryDiv = document.createElement('div');
    subcategoryDiv.className = 'subcategory';
    subcategoryDiv.setAttribute('data-category-index', categoryIndex);
    subcategoryDiv.setAttribute('data-subcategory-index', subcategoryIndex);
    
    // En-tête de la sous-catégorie
    const subcategoryHeader = document.createElement('div');
    subcategoryHeader.className = 'subcategory-header';
    subcategoryHeader.innerHTML = `
        <h5 class="subcategory-name">${subcategory.name}</h5>
        <span class="subcategory-amount">${subcategory.amount}</span>
        <div class="subcategory-controls">
            <button type="button" class="btn-sm btn-edit-subcategory" title="Modifier">
                <i class="fas fa-edit"></i>
            </button>
            <button type="button" class="btn-sm btn-delete-subcategory" title="Supprimer">
                <i class="fas fa-trash"></i>
            </button>
            <button type="button" class="subcategory-toggle open">
                <i class="fas fa-chevron-up"></i>
            </button>
        </div>
    `;
    
    // Conteneur des lignes de dépenses
    const expenseLinesContainer = document.createElement('div');
    expenseLinesContainer.className = 'expense-lines open';
    
    // Ajouter les lignes de dépenses
    if (subcategory.lines && subcategory.lines.length > 0) {
        subcategory.lines.forEach((line, lineIndex) => {
            const lineEl = createExpenseLineElement(line, categoryIndex, subcategoryIndex, lineIndex);
            expenseLinesContainer.appendChild(lineEl);
        });
    }
    
    // Bouton pour ajouter une ligne de dépense
    const addLineBtn = document.createElement('button');
    addLineBtn.type = 'button';
    addLineBtn.className = 'add-line-btn';
    addLineBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter une ligne';
    addLineBtn.addEventListener('click', function() {
        addExpenseLine(categoryIndex, subcategoryIndex);
    });
    
    expenseLinesContainer.appendChild(addLineBtn);
    
    // Assembler la sous-catégorie
    subcategoryDiv.appendChild(subcategoryHeader);
    subcategoryDiv.appendChild(expenseLinesContainer);
    
    // Ajouter les événements
    subcategoryHeader.querySelector('.subcategory-toggle').addEventListener('click', function() {
        expenseLinesContainer.classList.toggle('open');
        this.classList.toggle('open');
        this.querySelector('i').classList.toggle('fa-chevron-up');
        this.querySelector('i').classList.toggle('fa-chevron-down');
    });
    
    subcategoryHeader.querySelector('.btn-edit-subcategory').addEventListener('click', function() {
        editSubcategory(categoryIndex, subcategoryIndex);
    });
    
    subcategoryHeader.querySelector('.btn-delete-subcategory').addEventListener('click', function() {
        deleteSubcategory(categoryIndex, subcategoryIndex);
    });
    
    return subcategoryDiv;
}

// Fonction pour créer un élément de ligne de dépense
function createExpenseLineElement(line, categoryIndex, subcategoryIndex, lineIndex) {
    const lineDiv = document.createElement('div');
    lineDiv.className = 'expense-line';
    lineDiv.setAttribute('data-category-index', categoryIndex);
    lineDiv.setAttribute('data-subcategory-index', subcategoryIndex);
    lineDiv.setAttribute('data-line-index', lineIndex);
    
    lineDiv.innerHTML = `
        <input type="text" class="form-control expense-line-name" value="${line.name}" readonly>
        <input type="text" class="form-control expense-line-amount" value="${line.amount}" readonly>
        <div class="expense-line-actions">
            <button type="button" class="btn-sm btn-edit-line" title="Modifier">
                <i class="fas fa-edit"></i>
            </button>
            <button type="button" class="btn-sm btn-delete-line" title="Supprimer">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Ajouter les événements
    lineDiv.querySelector('.btn-edit-line').addEventListener('click', function() {
        editExpenseLine(categoryIndex, subcategoryIndex, lineIndex);
    });
    
    lineDiv.querySelector('.btn-delete-line').addEventListener('click', function() {
        deleteExpenseLine(categoryIndex, subcategoryIndex, lineIndex);
    });
    
    return lineDiv;
}

// Fonction pour charger les dépenses réelles
function loadRealExpenses(projectId) {
    const tableBody = document.getElementById('realExpensesTableBody');
    tableBody.innerHTML = '';
    
    const emptyMessage = document.querySelector('.empty-expenses-message');
    
    // Récupérer le projet
    const project = window.currentProject;
    
    if (!project.realExpenses || project.realExpenses.length === 0) {
        emptyMessage.style.display = 'block';
        document.getElementById('totalRealExpenses').textContent = formatCurrency(0);
        document.getElementById('totalBudgetGap').textContent = formatCurrency(0);
        return;
    }
    
    emptyMessage.style.display = 'none';
    
    // Calculer le budget initial
    const initialBudget = parseFloat(project.totalBudget?.replace(/[^0-9.]/g, '') || 0);
    
    // Calculer le total des dépenses réelles
    let totalRealExpenses = 0;
    
    // Afficher chaque dépense
    project.realExpenses.forEach((expense, index) => {
        const row = document.createElement('tr');
        
        // Calculer l'écart pour cette dépense
        const expenseAmount = parseFloat(expense.amount || 0);
        totalRealExpenses += expenseAmount;
        
        // Trouver la catégorie correspondante
        const categoryName = expense.category || 'Non catégorisé';
        
        row.innerHTML = `
            <td>${formatDate(new Date(expense.date))}</td>
            <td>${categoryName}</td>
            <td>${expense.description}</td>
            <td>${formatCurrency(expenseAmount)}</td>
            <td class="budget-gap-cell">-</td>
            <td class="actions-cell">
                <button class="btn-sm btn-edit" title="Modifier">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-sm btn-delete" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        // Ajouter des événements
        row.querySelector('.btn-edit').addEventListener('click', function() {
            openRealExpenseModal(index);
        });
        
        row.querySelector('.btn-delete').addEventListener('click', function() {
            deleteRealExpense(index);
        });
        
        tableBody.appendChild(row);
    });
    
    // Mettre à jour le total
    document.getElementById('totalRealExpenses').textContent = formatCurrency(totalRealExpenses);
    
    // Calculer l'écart budgétaire total
    const budgetGap = initialBudget - totalRealExpenses;
    const gapElement = document.getElementById('totalBudgetGap');
    
    if (budgetGap < 0) {
        gapElement.textContent = `- ${formatCurrency(Math.abs(budgetGap))}`;
        gapElement.classList.add('negative-gap');
    } else {
        gapElement.textContent = formatCurrency(budgetGap);
        gapElement.classList.remove('negative-gap');
    }
}

// Fonction pour charger les justificatifs
function loadAttachments(projectId) {
    const attachmentsList = document.getElementById('attachmentsList');
    attachmentsList.innerHTML = '';
    
    const emptyMessage = document.querySelector('.empty-attachments-message');
    
    // Récupérer le projet
    const project = window.currentProject;
    
    if (!project.attachments || project.attachments.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }
    
    emptyMessage.style.display = 'none';
    
    // Afficher chaque pièce jointe
    project.attachments.forEach((attachment, index) => {
        const item = document.createElement('li');
        item.className = 'attachment-item';
        
        // Déterminer l'icône en fonction du type de fichier
        let fileIcon = 'fa-file';
        const fileType = attachment.file.split('.').pop().toLowerCase();
        
        if (['pdf'].includes(fileType)) {
            fileIcon = 'fa-file-pdf';
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
            fileIcon = 'fa-file-image';
        } else if (['doc', 'docx'].includes(fileType)) {
            fileIcon = 'fa-file-word';
        } else if (['xls', 'xlsx'].includes(fileType)) {
            fileIcon = 'fa-file-excel';
        }
        
        item.innerHTML = `
            <div class="attachment-icon">
                <i class="fas ${fileIcon}"></i>
            </div>
            <div class="attachment-details">
                <h4>${attachment.title}</h4>
                <p class="attachment-category">${attachment.category || 'Non catégorisé'}</p>
                <p class="attachment-description">${attachment.description || 'Aucune description'}</p>
            </div>
            <div class="attachment-actions">
                <button class="btn-sm btn-view-attachment" title="Voir">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-sm btn-delete-attachment" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Ajouter des événements
        item.querySelector('.btn-view-attachment').addEventListener('click', function() {
            viewAttachment(index);
        });
        
        item.querySelector('.btn-delete-attachment').addEventListener('click', function() {
            deleteAttachment(index);
        });
        
        attachmentsList.appendChild(item);
    });
}

// Fonction pour charger les commentaires
function loadComments(projectId) {
    const commentsContainer = document.getElementById('commentsContainer');
    commentsContainer.innerHTML = '';
    
    // Récupérer le projet
    const project = window.currentProject;
    
    if (!project.comments || project.comments.length === 0) {
        commentsContainer.innerHTML = '<div class="empty-comments-message">Aucun commentaire n\'a encore été ajouté.</div>';
        return;
    }
    
    // Afficher chaque commentaire
    project.comments.forEach((comment, index) => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        
        commentElement.innerHTML = `
            <div class="comment-header">
                <span class="comment-date">${formatDate(new Date(comment.date))}</span>
                <div class="comment-actions">
                    <button class="btn-sm btn-edit-comment" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-sm btn-delete-comment" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="comment-text">${comment.text}</div>
        `;
        
        // Ajouter des événements
        commentElement.querySelector('.btn-edit-comment').addEventListener('click', function() {
            editComment(index);
        });
        
        commentElement.querySelector('.btn-delete-comment').addEventListener('click', function() {
            deleteComment(index);
        });
        
        commentsContainer.appendChild(commentElement);
    });
}

// Fonction pour vérifier si le projet est lié à un portefeuille
function checkWalletLink(project) {
    const walletLinkStatus = document.getElementById('walletLinkStatus');
    
    if (project.linkToWallet) {
        walletLinkStatus.innerHTML = `
            <span class="wallet-status linked">Lié au portefeuille personnel</span>
            <button class="btn-sm btn-unlink-wallet">
                <i class="fas fa-unlink"></i> Délier
            </button>
        `;
        
        // Ajouter un événement pour délier le portefeuille
        walletLinkStatus.querySelector('.btn-unlink-wallet').addEventListener('click', unlinkWallet);
    } else {
        walletLinkStatus.innerHTML = `
            <span class="wallet-status">Aucun portefeuille lié</span>
            <button class="btn-sm btn-link-wallet">
                <i class="fas fa-link"></i> Lier un portefeuille
            </button>
        `;
        
        // Ajouter un événement pour lier le portefeuille
        walletLinkStatus.querySelector('.btn-link-wallet').addEventListener('click', linkWallet);
    }
}

// Fonction pour changer d'onglet
function switchTab(tabId) {
    // Désactiver tous les onglets
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Activer l'onglet sélectionné
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

// Fonction pour ouvrir la modale de dépense réelle
function openRealExpenseModal(expenseIndex = null) {
    const modal = document.getElementById('realExpenseModal');
    const modalTitle = document.getElementById('expenseModalTitle');
    const form = document.getElementById('realExpenseForm');
    
    form.reset();
    
    // Définir la date par défaut à aujourd'hui
    document.getElementById('expenseDate').valueAsDate = new Date();
    
    // Remplir la liste des catégories
    const categorySelect = document.getElementById('expenseCategory');
    categorySelect.innerHTML = '';
    
    // Option par défaut
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Sélectionnez une catégorie --';
    categorySelect.appendChild(defaultOption);
    
    // Ajouter les catégories du projet
    const project = window.currentProject;
    if (project.categories && project.categories.length > 0) {
        project.categories.forEach((category, index) => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }
    
    // Ajouter l'option "Autre"
    const otherOption = document.createElement('option');
    otherOption.value = "Autre";
    otherOption.textContent = "Autre";
    categorySelect.appendChild(otherOption);
    
    if (expenseIndex !== null) {
        // Mode édition
        modalTitle.textContent = 'Modifier une dépense réelle';
        
        const expense = project.realExpenses[expenseIndex];
        document.getElementById('expenseId').value = expenseIndex;
        document.getElementById('expenseDate').value = expense.date;
        document.getElementById('expenseCategory').value = expense.category || '';
        document.getElementById('expenseDescription').value = expense.description || '';
        document.getElementById('expenseAmount').value = expense.amount || '';
        document.getElementById('expenseNotes').value = expense.notes || '';
    } else {
        // Mode ajout
        modalTitle.textContent = 'Ajouter une dépense réelle';
        document.getElementById('expenseId').value = '';
    }
    
    modal.style.display = 'block';
}

// Fonction pour ouvrir la modale de justificatif
function openAttachmentModal() {
    const modal = document.getElementById('attachmentModal');
    const form = document.getElementById('attachmentForm');
    
    form.reset();
    
    // Remplir la liste des catégories
    const categorySelect = document.getElementById('attachmentCategory');
    categorySelect.innerHTML = '';
    
    // Option par défaut
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Sélectionnez une catégorie --';
    categorySelect.appendChild(defaultOption);
    
    // Ajouter les catégories du projet
    const project = window.currentProject;
    if (project.categories && project.categories.length > 0) {
        project.categories.forEach((category, index) => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }
    
    // Ajouter l'option "Autre"
    const otherOption = document.createElement('option');
    otherOption.value = "Autre";
    otherOption.textContent = "Autre";
    categorySelect.appendChild(otherOption);
    
    modal.style.display = 'block';
}

// Fonction pour fermer toutes les modales
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Fonction pour éditer le projet
function editProject() {
    const project = window.currentProject;
    // Rediriger vers la page d'édition de projet avec l'ID du projet
    window.location.href = `nouveau-projet.html?id=${project.id}`;
}

// Fonction pour supprimer le projet
function deleteProject() {
    const project = window.currentProject;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.projectName}" ?`)) {
        // Récupérer tous les projets
        let projects = [];
        try {
            projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        } catch (error) {
            console.error('Erreur lors du chargement des projets:', error);
            showNotification('Erreur lors de la suppression du projet', 'error');
            return;
        }
        
        // Filtrer le projet à supprimer
        projects = projects.filter(p => p.id !== project.id);
        
        // Enregistrer les projets mis à jour
        localStorage.setItem('savedProjects', JSON.stringify(projects));
        
        // Si le projet était lié à un portefeuille, mettre à jour les données du portefeuille
        if (project.linkToWallet) {
            unlinkWalletSilent(project.id);
        }
        
        showNotification('Projet supprimé avec succès');
        
        // Rediriger vers la page d'accueil
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Fonction pour exporter le projet
function exportProject() {
    alert('La fonctionnalité d\'exportation du projet sera disponible prochainement.');
}

// Fonction pour lier le projet à un portefeuille
function linkWallet() {
    const project = window.currentProject;
    
    // Mettre à jour le projet
    project.linkToWallet = true;
    
    // Mettre à jour le localStorage
    updateProject(project);
    
    // Mettre à jour la liste des projets liés dans le portefeuille
    let walletData = {};
    try {
        walletData = JSON.parse(localStorage.getItem('walletData') || '{"linkedProjects":[]}');
        if (!walletData.linkedProjects) {
            walletData.linkedProjects = [];
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données du portefeuille:', error);
        walletData = { linkedProjects: [] };
    }
    
    // Ajouter le projet à la liste des projets liés (s'il n'y est pas déjà)
    if (!walletData.linkedProjects.includes(project.id)) {
        walletData.linkedProjects.push(project.id);
        localStorage.setItem('walletData', JSON.stringify(walletData));
    }
    
    // Mettre à jour l'interface
    checkWalletLink(project);
    
    showNotification('Projet lié au portefeuille avec succès');
}

// Fonction pour délier le projet du portefeuille
function unlinkWallet() {
    const project = window.currentProject;
    
    if (confirm('Êtes-vous sûr de vouloir délier ce projet du portefeuille ?')) {
        // Mettre à jour le projet
        project.linkToWallet = false;
        
        // Mettre à jour le localStorage
        updateProject(project);
        
        // Supprimer le projet de la liste des projets liés dans le portefeuille
        unlinkWalletSilent(project.id);
        
        // Mettre à jour l'interface
        checkWalletLink(project);
        
        showNotification('Projet délié du portefeuille avec succès');
    }
}

// Fonction pour délier le projet du portefeuille sans confirmation
function unlinkWalletSilent(projectId) {
    let walletData = {};
    try {
        walletData = JSON.parse(localStorage.getItem('walletData') || '{"linkedProjects":[]}');
        if (!walletData.linkedProjects) {
            walletData.linkedProjects = [];
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données du portefeuille:', error);
        walletData = { linkedProjects: [] };
    }
    
    // Supprimer le projet de la liste des projets liés
    walletData.linkedProjects = walletData.linkedProjects.filter(id => id !== projectId);
    localStorage.setItem('walletData', JSON.stringify(walletData));
}

// Fonction pour ajouter une catégorie
function addCategory() {
    const categoryName = prompt('Nom de la nouvelle catégorie:');
    if (!categoryName) return;
    
    const categoryAmount = prompt('Montant budgété pour cette catégorie (€):', '0');
    if (categoryAmount === null) return;
    
    const project = window.currentProject;
    
    // Initialiser le tableau des catégories s'il n'existe pas
    if (!project.categories) {
        project.categories = [];
    }
    
    // Ajouter la nouvelle catégorie
    project.categories.push({
        name: categoryName,
        amount: formatCurrency(parseFloat(categoryAmount)),
        subcategories: []
    });
    
    // Mettre à jour le localStorage
    updateProject(project);
    
    // Mettre à jour l'interface
    loadCategories(project);
    
    showNotification('Catégorie ajoutée avec succès');
}

// Fonction pour éditer une catégorie
function editCategory(categoryIndex) {
    const project = window.currentProject;
    const category = project.categories[categoryIndex];
    
    const categoryName = prompt('Nom de la catégorie:', category.name);
    if (!categoryName) return;
    
    const categoryAmount = prompt('Montant budgété pour cette catégorie (€):', category.amount.replace(/[^0-9.]/g, ''));
    if (categoryAmount === null) return;
    
    // Mettre à jour la catégorie
    project.categories[categoryIndex] = {
        ...category,
        name: categoryName,
        amount: formatCurrency(parseFloat(categoryAmount))
    };
    
    // Mettre à jour le localStorage
    updateProject(project);
    
    // Mettre à jour l'interface
    loadCategories(project);
    
    showNotification('Catégorie modifiée avec succès');
}

// Fonction pour supprimer une catégorie
function deleteCategory(categoryIndex) {
    const project = window.currentProject;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer cette catégorie et toutes ses sous-catégories ?`)) {
        // Supprimer la catégorie
        project.categories.splice(categoryIndex, 1);
        
        // Mettre à jour le localStorage
        updateProject(project);
        
        // Mettre à jour l'interface
        loadCategories(project);
        
        showNotification('Catégorie supprimée avec succès');
    }
}

// Fonction pour ajouter une sous-catégorie
function addSubcategory(categoryIndex) {
    const subcategoryName = prompt('Nom de la nouvelle sous-catégorie:');
    if (!subcategoryName) return;
    
    const subcategoryAmount = prompt('Montant budgété pour cette sous-catégorie (€):', '0');
    if (subcategoryAmount === null) return;
    
    const project = window.currentProject;
    const category = project.categories[categoryIndex];
    
    // Initialiser le tableau des sous-catégories s'il n'existe pas
    if (!category.subcategories) {
        category.subcategories = [];
    }
    
    // Ajouter la nouvelle sous-catégorie
    category.subcategories.push({
        name: subcategoryName,
        amount: formatCurrency(parseFloat(subcategoryAmount)),
        lines: []
    });
    
    // Mettre à jour le localStorage
    updateProject(project);
    
    // Mettre à jour l'interface
    loadCategories(project);
    
    showNotification('Sous-catégorie ajoutée avec succès');
}

// Fonction pour éditer une sous-catégorie
function editSubcategory(categoryIndex, subcategoryIndex) {
    const project = window.currentProject;
    const category = project.categories[categoryIndex];
    const subcategory = category.subcategories[subcategoryIndex];
    
    const subcategoryName = prompt('Nom de la sous-catégorie:', subcategory.name);
    if (!subcategoryName) return;
    
    const subcategoryAmount = prompt('Montant budgété pour cette sous-catégorie (€):', subcategory.amount.replace(/[^0-9.]/g, ''));
    if (subcategoryAmount === null) return;
    
    // Mettre à jour la sous-catégorie
    category.subcategories[subcategoryIndex] = {
        ...subcategory,
        name: subcategoryName,
        amount: formatCurrency(parseFloat(subcategoryAmount))
    };
    
    // Mettre à jour le localStorage
    updateProject(project);
    
    // Mettre à jour l'interface
    loadCategories(project);
    
    showNotification('Sous-catégorie modifiée avec succès');
}

// Fonction pour supprimer une sous-catégorie
function deleteSubcategory(categoryIndex, subcategoryIndex) {
    const project = window.currentProject;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer cette sous-catégorie et toutes ses lignes de dépenses ?`)) {
        // Supprimer la sous-catégorie
        project.categories[categoryIndex].subcategories.splice(subcategoryIndex, 1);
        
        // Mettre à jour le localStorage
        updateProject(project);
        
        // Mettre à jour l'interface
        loadCategories(project);
        
        showNotification('Sous-catégorie supprimée avec succès');
    }
}

// Fonction pour ajouter une ligne de dépense
function addExpenseLine(categoryIndex, subcategoryIndex) {
    const lineName = prompt('Description de la dépense:');
    if (!lineName) return;
    
    const lineAmount = prompt('Montant budgété pour cette dépense (€):', '0');
    if (lineAmount === null) return;
    
    const project = window.currentProject;
    const category = project.categories[categoryIndex];
    const subcategory = category.subcategories[subcategoryIndex];
    
    // Initialiser le tableau des lignes s'il n'existe pas
    if (!subcategory.lines) {
        subcategory.lines = [];
    }
    
    // Ajouter la nouvelle ligne
    subcategory.lines.push({
        name: lineName,
        amount: formatCurrency(parseFloat(lineAmount))
    });
    
    // Mettre à jour le localStorage
    updateProject(project);
    
    // Mettre à jour l'interface
    loadCategories(project);
    
    showNotification('Ligne de dépense ajoutée avec succès');
}

// Fonction pour éditer une ligne de dépense
function editExpenseLine(categoryIndex, subcategoryIndex, lineIndex) {
    const project = window.currentProject;
    const category = project.categories[categoryIndex];
    const subcategory = category.subcategories[subcategoryIndex];
    const line = subcategory.lines[lineIndex];
    
    const lineName = prompt('Description de la dépense:', line.name);
    if (!lineName) return;
    
    const lineAmount = prompt('Montant budgété pour cette dépense (€):', line.amount.replace(/[^0-9.]/g, ''));
    if (lineAmount === null) return;
    
    // Mettre à jour la ligne
    subcategory.lines[lineIndex] = {
        name: lineName,
        amount: formatCurrency(parseFloat(lineAmount))
    };
    
    // Mettre à jour le localStorage
    updateProject(project);
    
    // Mettre à jour l'interface
    loadCategories(project);
    
    showNotification('Ligne de dépense modifiée avec succès');
}

// Fonction pour supprimer une ligne de dépense
function deleteExpenseLine(categoryIndex, subcategoryIndex, lineIndex) {
    const project = window.currentProject;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer cette ligne de dépense ?`)) {
        // Supprimer la ligne
        project.categories[categoryIndex].subcategories[subcategoryIndex].lines.splice(lineIndex, 1);
        
        // Mettre à jour le localStorage
        updateProject(project);
        
        // Mettre à jour l'interface
        loadCategories(project);
        
        showNotification('Ligne de dépense supprimée avec succès');
    }
}

// Fonction pour enregistrer une dépense réelle
function saveRealExpense() {
    const expenseId = document.getElementById('expenseId').value;
    const expenseDate = document.getElementById('expenseDate').value;
    const expenseCategory = document.getElementById('expenseCategory').value;
    const expenseDescription = document.getElementById('expenseDescription').value;
    const expenseAmount = document.getElementById('expenseAmount').value;
    const expenseNotes = document.getElementById('expenseNotes').value;
    
    const project = window.currentProject;
    
    // Initialiser le tableau des dépenses réelles s'il n'existe pas
    if (!project.realExpenses) {
        project.realExpenses = [];
    }
    
    const expense = {
        date: expenseDate,
        category: expenseCategory,
        description: expenseDescription,
        amount: expenseAmount,
        notes: expenseNotes
    };
    
    if (expenseId !== '') {
        // Mode édition
        project.realExpenses[parseInt(expenseId)] = expense;
    } else {
        // Mode ajout
        project.realExpenses.push(expense);
    }
    
    // Mettre à jour le localStorage
    updateProject(project);
    
    // Fermer la modale
    closeAllModals();
    
    // Mettre à jour l'interface
    loadRealExpenses(project.id);
    updateBudgetStats(project);
    
    showNotification('Dépense enregistrée avec succès');
}

// Fonction pour supprimer une dépense réelle
function deleteRealExpense(expenseIndex) {
    const project = window.currentProject;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer cette dépense ?`)) {
        // Supprimer la dépense
        project.realExpenses.splice(expenseIndex, 1);
        
        // Mettre à jour le localStorage
        updateProject(project);
        
        // Mettre à jour l'interface
        loadRealExpenses(project.id);
        updateBudgetStats(project);
        
        showNotification('Dépense supprimée avec succès');
    }
}

// Fonction pour enregistrer un justificatif
function saveAttachment() {
    const attachmentTitle = document.getElementById('attachmentTitle').value;
    const attachmentFile = document.getElementById('attachmentFile').value;
    const attachmentCategory = document.getElementById('attachmentCategory').value;
    const attachmentDescription = document.getElementById('attachmentDescription').value;
    
    // Récupérer juste le nom de fichier (simulé pour le démo)
    const fileName = attachmentFile.split('\\').pop();
    
    const project = window.currentProject;
    
    // Initialiser le tableau des justificatifs s'il n'existe pas
    if (!project.attachments) {
        project.attachments = [];
    }
    
    // Ajouter le nouveau justificatif
    project.attachments.push({
        title: attachmentTitle,
        file: fileName,
        category: attachmentCategory,
        description: attachmentDescription,
        dateAdded: new Date().toISOString()
    });
    
    // Mettre à jour le localStorage
    updateProject(project);
    
    // Fermer la modale
    closeAllModals();
    
    // Mettre à jour l'interface
    loadAttachments(project.id);
    
    showNotification('Justificatif ajouté avec succès');
}

// Fonction pour visualiser un justificatif
function viewAttachment(attachmentIndex) {
    const project = window.currentProject;
    const attachment = project.attachments[attachmentIndex];
    
    alert(`Visualisation du justificatif : ${attachment.title}\n\nCette fonctionnalité sera disponible prochainement.`);
}

// Fonction pour supprimer un justificatif
function deleteAttachment(attachmentIndex) {
    const project = window.currentProject;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ce justificatif ?`)) {
        // Supprimer le justificatif
        project.attachments.splice(attachmentIndex, 1);
        
        // Mettre à jour le localStorage
        updateProject(project);
        
        // Mettre à jour l'interface
        loadAttachments(project.id);
        
        showNotification('Justificatif supprimé avec succès');
    }
}

// Fonction pour enregistrer un commentaire
function saveComment() {
    const commentText = document.getElementById('commentText').value.trim();
    
    if (!commentText) {
        showNotification('Le commentaire ne peut pas être vide', 'error');
        return;
    }
    
    const project = window.currentProject;
    
    // Initialiser le tableau des commentaires s'il n'existe pas
    if (!project.comments) {
        project.comments = [];
    }
    
    // Ajouter le nouveau commentaire
    project.comments.push({
        text: commentText,
        date: new Date().toISOString()
    });
    
    // Mettre à jour le localStorage
    updateProject(project);
    
    // Vider le champ de commentaire
    document.getElementById('commentText').value = '';
    
    // Mettre à jour l'interface
    loadComments(project.id);
    
    showNotification('Commentaire ajouté avec succès');
}

// Fonction pour éditer un commentaire
function editComment(commentIndex) {
    const project = window.currentProject;
    const comment = project.comments[commentIndex];
    
    const newText = prompt('Modifier le commentaire:', comment.text);
    if (!newText) return;
    
    // Mettre à jour le commentaire
    project.comments[commentIndex] = {
        ...comment,
        text: newText,
        edited: true,
        editDate: new Date().toISOString()
    };
    
    // Mettre à jour le localStorage
    updateProject(project);
    
    // Mettre à jour l'interface
    loadComments(project.id);
    
    showNotification('Commentaire modifié avec succès');
}

// Fonction pour supprimer un commentaire
function deleteComment(commentIndex) {
    const project = window.currentProject;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ce commentaire ?`)) {
        // Supprimer le commentaire
        project.comments.splice(commentIndex, 1);
        
        // Mettre à jour le localStorage
        updateProject(project);
        
        // Mettre à jour l'interface
        loadComments(project.id);
        
        showNotification('Commentaire supprimé avec succès');
    }
}

// Fonction pour exporter un rapport
function exportReport(format) {
    alert(`Export au format ${format.toUpperCase()} sera disponible prochainement.`);
}

// Fonction pour mettre à jour le projet dans le localStorage
function updateProject(project) {
    // Récupérer tous les projets
    let projects = [];
    try {
        projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        projects = Array.isArray(projects) ? projects : [];
    } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        projects = [];
    }
    
    // Trouver l'index du projet
    const projectIndex = projects.findIndex(p => p.id === project.id);
    
    if (projectIndex !== -1) {
        // Mettre à jour le projet existant
        projects[projectIndex] = project;
    } else {
        // Ajouter le nouveau projet
        projects.push(project);
    }
    
    // Enregistrer les projets mis à jour
    localStorage.setItem('savedProjects', JSON.stringify(projects));
    
    // Mettre à jour la variable globale
    window.currentProject = project;
}

// Fonction pour afficher une notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Fonction pour formater un montant en devise
function formatCurrency(amount) {
    // Obtenir le symbole de la devise des préférences utilisateur
    let currencySymbol = getCurrencySymbol();
    
    // Formater le montant avec le symbole de devise approprié
    return `${currencySymbol} ${parseFloat(amount).toFixed(2)}`;
}

// Fonction pour récupérer le symbole de devise actuel
function getCurrencySymbol() {
    // Valeur par défaut
    let currencySymbol = "€";
    
    try {
        // Récupérer les préférences utilisateur
        const savedPrefs = localStorage.getItem("userPreferences");
        if (savedPrefs) {
            const userPreferences = JSON.parse(savedPrefs);
            const currencyCode = userPreferences.currency || 'EUR';
            
            // Si la fonction globale getCurrencySymbol existe (depuis main.js), l'utiliser
            if (typeof window.getCurrencySymbol === 'function') {
                return window.getCurrencySymbol(currencyCode);
            }
            
            // Sinon, utiliser notre propre implémentation
            // Si AVAILABLE_CURRENCIES est défini, utiliser le symbole correspondant
            if (typeof AVAILABLE_CURRENCIES !== "undefined") {
                const currency = AVAILABLE_CURRENCIES.find(c => c.code === currencyCode);
                if (currency) {
                    currencySymbol = currency.symbol;
                }
            }
            
            // Fallback pour les symboles courants si aucun symbole n'est trouvé
            if (!currencySymbol || currencySymbol === "€") {
                switch (currencyCode) {
                    case 'EUR': currencySymbol = '€'; break;
                    case 'USD': currencySymbol = '$'; break;
                    case 'GBP': currencySymbol = '£'; break;
                    case 'JPY': currencySymbol = '¥'; break;
                    case 'CNY': currencySymbol = '¥'; break;
                    case 'MGA': currencySymbol = 'Ar'; break;
                    case 'MAD': currencySymbol = 'DH'; break;
                    case 'XAF': currencySymbol = 'F CFA'; break;
                    case 'XOF': currencySymbol = 'F CFA'; break;
                    case 'AED': currencySymbol = 'AED'; break;
                    default: currencySymbol = currencyCode;
                }
            }
        }
    } catch (error) {
        console.error("Erreur lors de la récupération du symbole de devise:", error);
    }
    
    return currencySymbol;
}

// Fonction pour formater une date
function formatDate(date) {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}