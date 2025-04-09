// Objectifs.js - Gère la fonctionnalité Objectifs & Défis de MaPocket

document.addEventListener('DOMContentLoaded', function() {
    console.log('Objectifs & Défis initialisés');
    
    // S'assurer que les préférences sont appliquées avant d'initialiser la page
    if (window.preferencesManager) {
        window.preferencesManager.applyAllPreferences();
    }
    
    // Initialisation des onglets
    initTabs();
    
    // Initialisation des modals
    initModals();
    
    // Chargement des objectifs d'épargne
    loadSavingsGoals();
    
    // Chargement des défis de dépenses
    loadChallenges();
    
    // Chargement des statistiques et de l'historique
    loadStatsAndHistory();
    
    // Initialisation des événements pour les défis suggérés
    initSuggestedChallenges();
});

// Classe pour représenter un objectif d'épargne
class SavingsGoal {
    constructor(id, name, targetAmount, currentAmount, deadline, walletId, description) {
        this.id = id;
        this.name = name;
        this.targetAmount = targetAmount;
        this.currentAmount = currentAmount || 0;
        this.deadline = deadline;
        this.walletId = walletId;
        this.description = description;
        this.createdAt = new Date().toISOString();
        this.status = 'active'; // active, completed, failed
    }
    
    getProgress() {
        return Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100));
    }
    
    getRemainingAmount() {
        return Math.max(0, this.targetAmount - this.currentAmount);
    }
    
    getRemainingDays() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = new Date(this.deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        
        const timeDiff = deadlineDate - today;
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
    
    isExpired() {
        return this.getRemainingDays() < 0;
    }
    
    isCompleted() {
        return this.currentAmount >= this.targetAmount;
    }
    
    updateStatus() {
        if (this.isCompleted()) {
            this.status = 'completed';
        } else if (this.isExpired()) {
            this.status = 'failed';
        }
    }
}

// Classe pour représenter un défi de dépenses
class SpendingChallenge {
    constructor(id, name, type, amount, category, duration, description, startDate) {
        this.id = id;
        this.name = name;
        this.type = type; // no-spend, limit-spend, avoid-category
        this.amount = amount;
        this.category = category;
        this.duration = duration; // weekend, week, 2weeks, month
        this.description = description;
        this.startDate = startDate || new Date().toISOString();
        this.currentSpent = 0;
        this.status = 'active'; // active, completed, failed
    }
    
    getDurationDays() {
        const durations = {
            'weekend': 2,
            'week': 7,
            '2weeks': 14,
            'month': 30
        };
        
        return durations[this.duration] || 7;
    }
    
    getEndDate() {
        const startDate = new Date(this.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + this.getDurationDays());
        return endDate.toISOString();
    }
    
    getRemainingDays() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDate = new Date(this.getEndDate());
        endDate.setHours(0, 0, 0, 0);
        
        const timeDiff = endDate - today;
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
    
    getProgress() {
        const totalDays = this.getDurationDays();
        const passedDays = totalDays - this.getRemainingDays();
        return Math.min(100, Math.round((passedDays / totalDays) * 100));
    }
    
    isExpired() {
        return this.getRemainingDays() < 0;
    }
    
    isSuccessful() {
        if (this.type === 'no-spend' && this.currentSpent === 0) {
            return true;
        } else if (this.type === 'limit-spend' && this.currentSpent <= this.amount) {
            return true;
        } else if (this.type === 'avoid-category' && this.currentSpent === 0) {
            return true;
        }
        
        return false;
    }
    
    updateStatus() {
        if (this.isExpired()) {
            this.status = this.isSuccessful() ? 'completed' : 'failed';
        }
    }
}

// Initialisation des onglets
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Enlever la classe active de tous les boutons et contenus d'onglet
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Ajouter la classe active au bouton cliqué
            this.classList.add('active');
            
            // Afficher le contenu de l'onglet correspondant
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Initialisation des modals
function initModals() {
    // Modal Objectif
    const createNewGoalBtn = document.getElementById('createNewGoalBtn');
    const createFirstGoalBtn = document.getElementById('createFirstGoalBtn');
    const goalModal = document.getElementById('goalModal');
    const newGoalForm = document.getElementById('newGoalForm');
    
    // Modal Défi
    const createNewChallengeBtn = document.getElementById('createNewChallengeBtn');
    const challengeModal = document.getElementById('challengeModal');
    const newChallengeForm = document.getElementById('newChallengeForm');
    
    // Éléments communs
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const cancelModalBtns = document.querySelectorAll('.cancel-modal');
    
    // Ouvrir modal objectif
    if (createNewGoalBtn) {
        createNewGoalBtn.addEventListener('click', function() {
            openGoalModal();
        });
    }
    
    // Ouvrir modal objectif depuis le message vide
    if (createFirstGoalBtn) {
        createFirstGoalBtn.addEventListener('click', function() {
            openGoalModal();
        });
    }
    
    // Ouvrir modal défi
    if (createNewChallengeBtn) {
        createNewChallengeBtn.addEventListener('click', function() {
            openChallengeModal();
        });
    }
    
    // Fermer les modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            closeAllModals();
        });
    });
    
    cancelModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            closeAllModals();
        });
    });
    
    // Soumettre le formulaire d'objectif d'épargne
    if (newGoalForm) {
        newGoalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createNewSavingsGoal();
        });
    }
    
    // Soumettre le formulaire de défi
    if (newChallengeForm) {
        newChallengeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createNewChallenge();
        });
        
        // Afficher/masquer le champ de montant en fonction du type de défi
        const challengeTypeSelect = document.getElementById('challengeType');
        if (challengeTypeSelect) {
            challengeTypeSelect.addEventListener('change', function() {
                const amountField = document.querySelector('.challenge-amount-field');
                if (this.value === 'limit-spend') {
                    amountField.style.display = 'block';
                    document.getElementById('challengeAmount').setAttribute('required', true);
                } else {
                    amountField.style.display = 'none';
                    document.getElementById('challengeAmount').removeAttribute('required');
                }
            });
        }
    }
    
    // Remplir le select des portefeuilles
    populateWalletSelect();
}

// Ouvrir la modal d'objectif d'épargne
function openGoalModal() {
    const goalModal = document.getElementById('goalModal');
    if (goalModal) {
        // Définir la date par défaut à 30 jours après
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 30);
        document.getElementById('goalDeadline').value = defaultDate.toISOString().split('T')[0];
        
        // Afficher la modal
        goalModal.classList.add('active');
    }
}

// Ouvrir la modal de défi
function openChallengeModal() {
    const challengeModal = document.getElementById('challengeModal');
    if (challengeModal) {
        // Masquer le champ de montant par défaut
        document.querySelector('.challenge-amount-field').style.display = 'none';
        
        // Afficher la modal
        challengeModal.classList.add('active');
    }
}

// Fermer toutes les modals
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('active');
    });
}

// Peupler le select des portefeuilles
function populateWalletSelect() {
    const goalWalletSelect = document.getElementById('goalWallet');
    
    if (goalWalletSelect) {
        try {
            const wallets = JSON.parse(localStorage.getItem('wallets') || '[]');
            
            // Vider le select sauf l'option par défaut
            goalWalletSelect.innerHTML = '<option value="">Aucun</option>';
            
            // Ajouter les portefeuilles
            wallets.forEach(wallet => {
                const option = document.createElement('option');
                option.value = wallet.id;
                option.textContent = `${wallet.name} (${formatCurrency(wallet.balance)})`;
                goalWalletSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erreur lors du chargement des portefeuilles:', error);
        }
    }
}

// Formater un montant en devise
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
}

// Créer un nouvel objectif d'épargne
function createNewSavingsGoal() {
    try {
        // Récupérer les valeurs du formulaire
        const name = document.getElementById('goalName').value;
        const targetAmount = parseFloat(document.getElementById('goalAmount').value);
        const deadline = document.getElementById('goalDeadline').value;
        const walletId = document.getElementById('goalWallet').value;
        const description = document.getElementById('goalDescription').value;
        
        // Créer l'objectif
        const newGoal = new SavingsGoal(
            Date.now().toString(),
            name,
            targetAmount,
            0,
            deadline,
            walletId,
            description
        );
        
        // Enregistrer l'objectif
        const savingsGoals = JSON.parse(localStorage.getItem('mapocket_savings_goals') || '[]');
        savingsGoals.push(newGoal);
        localStorage.setItem('mapocket_savings_goals', JSON.stringify(savingsGoals));
        
        // Recharger les objectifs
        loadSavingsGoals();
        
        // Fermer la modal
        closeAllModals();
        
        // Réinitialiser le formulaire
        document.getElementById('newGoalForm').reset();
        
        // Notification de succès
        if (window.NotificationManager) {
            window.NotificationManager.success('Objectif d\'épargne créé avec succès !');
        } else {
            showNotification('Objectif d\'épargne créé avec succès !');
        }
    } catch (error) {
        console.error('Erreur lors de la création de l\'objectif:', error);
        showNotification('Erreur lors de la création de l\'objectif.', 'error');
    }
}

// Créer un nouveau défi
function createNewChallenge() {
    try {
        // Récupérer les valeurs du formulaire
        const name = document.getElementById('challengeName').value;
        const type = document.getElementById('challengeType').value;
        const amount = type === 'limit-spend' ? parseFloat(document.getElementById('challengeAmount').value) : 0;
        const category = document.getElementById('challengeCategory').value;
        const duration = document.getElementById('challengeDuration').value;
        const description = document.getElementById('challengeDescription').value;
        
        // Créer le défi
        const newChallenge = new SpendingChallenge(
            Date.now().toString(),
            name,
            type,
            amount,
            category,
            duration,
            description
        );
        
        // Enregistrer le défi
        const challenges = JSON.parse(localStorage.getItem('mapocket_challenges') || '[]');
        challenges.push(newChallenge);
        localStorage.setItem('mapocket_challenges', JSON.stringify(challenges));
        
        // Recharger les défis
        loadChallenges();
        
        // Fermer la modal
        closeAllModals();
        
        // Réinitialiser le formulaire
        document.getElementById('newChallengeForm').reset();
        
        // Notification de succès
        showNotification('Défi budgétaire créé avec succès !');
    } catch (error) {
        console.error('Erreur lors de la création du défi:', error);
        showNotification('Erreur lors de la création du défi.', 'error');
    }
}

// Initialiser les défis suggérés
function initSuggestedChallenges() {
    const startButtons = document.querySelectorAll('.btn-start-challenge');
    
    startButtons.forEach(button => {
        button.addEventListener('click', function() {
            const template = this.parentElement.getAttribute('data-template');
            startSuggestedChallenge(template);
        });
    });
}

// Démarrer un défi suggéré
function startSuggestedChallenge(template) {
    try {
        // Configurer le défi en fonction du template
        let challenge;
        
        switch (template) {
            case 'weekend':
                challenge = new SpendingChallenge(
                    Date.now().toString(),
                    'Zéro Dépense ce week-end',
                    'no-spend',
                    0,
                    '',
                    'weekend',
                    'Ne pas effectuer de dépenses pendant le week-end'
                );
                break;
                
            case 'grocery':
                challenge = new SpendingChallenge(
                    Date.now().toString(),
                    'Budget Courses = 50€ cette semaine',
                    'limit-spend',
                    50,
                    'groceries',
                    'week',
                    'Limiter les dépenses en courses à 50€ sur 7 jours'
                );
                break;
                
            case 'delivery':
                challenge = new SpendingChallenge(
                    Date.now().toString(),
                    'Pas de livraison ce mois-ci',
                    'avoid-category',
                    0,
                    'delivery',
                    'month',
                    'Éviter toute dépense de livraison de repas pendant 30 jours'
                );
                break;
                
            default:
                return;
        }
        
        // Enregistrer le défi
        const challenges = JSON.parse(localStorage.getItem('mapocket_challenges') || '[]');
        challenges.push(challenge);
        localStorage.setItem('mapocket_challenges', JSON.stringify(challenges));
        
        // Recharger les défis
        loadChallenges();
        
        // Notification de succès
        showNotification('Défi budgétaire démarré !');
    } catch (error) {
        console.error('Erreur lors du démarrage du défi:', error);
        showNotification('Erreur lors du démarrage du défi.', 'error');
    }
}

// Charger les objectifs d'épargne
function loadSavingsGoals() {
    const goalsList = document.getElementById('savings-goals-list');
    
    if (!goalsList) return;
    
    try {
        // Récupérer les objectifs
        const savingsGoals = JSON.parse(localStorage.getItem('mapocket_savings_goals') || '[]');
        
        // Mettre à jour le statut des objectifs
        savingsGoals.forEach(goal => {
            const goalObj = new SavingsGoal(
                goal.id,
                goal.name,
                goal.targetAmount,
                goal.currentAmount,
                goal.deadline,
                goal.walletId,
                goal.description
            );
            goalObj.status = goal.status;
            goalObj.createdAt = goal.createdAt;
            goalObj.updateStatus();
            
            // Mettre à jour l'objectif s'il y a des changements
            if (goalObj.status !== goal.status) {
                goal.status = goalObj.status;
            }
        });
        
        // Enregistrer les mises à jour
        localStorage.setItem('mapocket_savings_goals', JSON.stringify(savingsGoals));
        
        // Tri des objectifs (actifs en premier, puis par date)
        savingsGoals.sort((a, b) => {
            if (a.status === 'active' && b.status !== 'active') return -1;
            if (a.status !== 'active' && b.status === 'active') return 1;
            return new Date(a.deadline) - new Date(b.deadline);
        });
        
        // Afficher les objectifs ou le message vide
        if (savingsGoals.length === 0) {
            goalsList.innerHTML = `
                <div class="empty-goals-message">
                    <div class="empty-icon"><i class="fas fa-piggy-bank"></i></div>
                    <h4>Vous n'avez pas encore d'objectif d'épargne</h4>
                    <p>Créez votre premier objectif pour commencer à épargner!</p>
                    <button id="createFirstGoalBtn" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Créer un objectif
                    </button>
                </div>
            `;
            
            // Réattacher l'événement au bouton
            const createFirstGoalBtn = document.getElementById('createFirstGoalBtn');
            if (createFirstGoalBtn) {
                createFirstGoalBtn.addEventListener('click', function() {
                    openGoalModal();
                });
            }
        } else {
            goalsList.innerHTML = '';
            
            // Créer les cartes pour chaque objectif
            savingsGoals.forEach(goal => {
                const goalObj = new SavingsGoal(
                    goal.id,
                    goal.name,
                    goal.targetAmount,
                    goal.currentAmount,
                    goal.deadline,
                    goal.walletId,
                    goal.description
                );
                goalObj.status = goal.status;
                goalObj.createdAt = goal.createdAt;
                
                const progress = goalObj.getProgress();
                const remainingAmount = goalObj.getRemainingAmount();
                const remainingDays = goalObj.getRemainingDays();
                
                // Créer la carte
                const goalCard = document.createElement('div');
                goalCard.className = `goal-card ${goalObj.status !== 'active' ? goalObj.status : ''}`;
                goalCard.dataset.id = goalObj.id;
                
                // Classe supplémentaire pour les objectifs expirés ou complétés
                if (goalObj.status === 'completed') {
                    goalCard.classList.add('completed');
                } else if (goalObj.status === 'failed') {
                    goalCard.classList.add('failed');
                }
                
                goalCard.innerHTML = `
                    <div class="goal-header">
                        <div class="goal-title">
                            <div class="goal-icon">
                                <i class="fas fa-piggy-bank"></i>
                            </div>
                            <h4>${goalObj.name}</h4>
                        </div>
                        <div class="goal-date">
                            ${goalObj.status === 'active' ? 
                                `<i class="far fa-calendar-alt"></i> ${remainingDays > 0 ? 
                                    `J-${remainingDays}` : 
                                    'Aujourd\'hui !'}` : 
                                goalObj.status === 'completed' ? 
                                    '<i class="fas fa-check-circle"></i> Objectif atteint' : 
                                    '<i class="fas fa-times-circle"></i> Objectif non atteint'}
                        </div>
                    </div>
                    <div class="goal-progress">
                        <div class="progress-info">
                            <div>
                                <strong>${formatCurrency(goalObj.currentAmount)}</strong> sur ${formatCurrency(goalObj.targetAmount)}
                            </div>
                            <div>${progress}%</div>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    ${goalObj.status === 'active' ? `
                        <div class="goal-info">
                            ${remainingAmount > 0 ? 
                                `<p>Il vous reste <strong>${formatCurrency(remainingAmount)}</strong> à épargner${remainingDays > 0 ? 
                                    ` en <strong>${remainingDays} jour${remainingDays > 1 ? 's' : ''}</strong>` : 
                                    ''}.</p>` : 
                                '<p>Félicitations ! Votre objectif est atteint.</p>'}
                        </div>
                        <div class="goal-actions">
                            <button class="goal-btn btn-update-goal" data-id="${goalObj.id}">
                                <i class="fas fa-plus-circle"></i> Ajouter un montant
                            </button>
                            <button class="goal-btn btn-edit-goal" data-id="${goalObj.id}">
                                <i class="fas fa-edit"></i> Modifier
                            </button>
                        </div>
                    ` : ''}
                `;
                
                goalsList.appendChild(goalCard);
                
                // Attacher les événements aux boutons
                setTimeout(() => {
                    const updateBtn = goalCard.querySelector('.btn-update-goal');
                    if (updateBtn) {
                        updateBtn.addEventListener('click', function() {
                            updateGoalAmount(goalObj.id);
                        });
                    }
                    
                    const editBtn = goalCard.querySelector('.btn-edit-goal');
                    if (editBtn) {
                        editBtn.addEventListener('click', function() {
                            editGoal(goalObj.id);
                        });
                    }
                }, 0);
            });
        }
    } catch (error) {
        console.error('Erreur lors du chargement des objectifs:', error);
        goalsList.innerHTML = `
            <div class="error-message">
                <p>Une erreur est survenue lors du chargement des objectifs. Veuillez réessayer.</p>
            </div>
        `;
    }
}

// Mettre à jour le montant d'un objectif
function updateGoalAmount(goalId) {
    try {
        // Récupérer les objectifs
        const savingsGoals = JSON.parse(localStorage.getItem('mapocket_savings_goals') || '[]');
        
        // Trouver l'objectif
        const goalIndex = savingsGoals.findIndex(g => g.id === goalId);
        
        if (goalIndex === -1) {
            showNotification('Objectif non trouvé.', 'error');
            return;
        }
        
        // Demander le montant à ajouter
        const amount = prompt('Montant à ajouter à votre épargne (€) :');
        
        if (amount === null) return; // Annulation
        
        const parsedAmount = parseFloat(amount.replace(',', '.'));
        
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            showNotification('Veuillez entrer un montant valide.', 'error');
            return;
        }
        
        // Mettre à jour le montant
        savingsGoals[goalIndex].currentAmount += parsedAmount;
        
        // Mettre à jour le statut
        const goalObj = new SavingsGoal(
            savingsGoals[goalIndex].id,
            savingsGoals[goalIndex].name,
            savingsGoals[goalIndex].targetAmount,
            savingsGoals[goalIndex].currentAmount,
            savingsGoals[goalIndex].deadline,
            savingsGoals[goalIndex].walletId,
            savingsGoals[goalIndex].description
        );
        goalObj.status = savingsGoals[goalIndex].status;
        goalObj.createdAt = savingsGoals[goalIndex].createdAt;
        goalObj.updateStatus();
        
        savingsGoals[goalIndex].status = goalObj.status;
        
        // Enregistrer les modifications
        localStorage.setItem('mapocket_savings_goals', JSON.stringify(savingsGoals));
        
        // Recharger les objectifs
        loadSavingsGoals();
        
        // Recharger les statistiques
        loadStatsAndHistory();
        
        // Notification de succès
        showNotification(`${formatCurrency(parsedAmount)} ajoutés à votre objectif !`);
        
        // Si l'objectif est atteint
        if (goalObj.status === 'completed') {
            showNotification('Félicitations ! Votre objectif est atteint !', 'success');
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du montant:', error);
        showNotification('Erreur lors de la mise à jour du montant.', 'error');
    }
}

// Charger les défis de dépenses
function loadChallenges() {
    const activeChallengesList = document.getElementById('active-challenges-list');
    
    if (!activeChallengesList) return;
    
    try {
        // Récupérer les défis
        const challenges = JSON.parse(localStorage.getItem('mapocket_challenges') || '[]');
        
        // Mettre à jour le statut des défis
        challenges.forEach(challenge => {
            const challengeObj = new SpendingChallenge(
                challenge.id,
                challenge.name,
                challenge.type,
                challenge.amount,
                challenge.category,
                challenge.duration,
                challenge.description,
                challenge.startDate
            );
            challengeObj.currentSpent = challenge.currentSpent;
            challengeObj.status = challenge.status;
            challengeObj.updateStatus();
            
            // Mettre à jour le défi s'il y a des changements
            if (challengeObj.status !== challenge.status) {
                challenge.status = challengeObj.status;
            }
        });
        
        // Enregistrer les mises à jour
        localStorage.setItem('mapocket_challenges', JSON.stringify(challenges));
        
        // Filtrer les défis actifs
        const activeChallenges = challenges.filter(challenge => challenge.status === 'active');
        
        // Afficher les défis actifs ou le message vide
        if (activeChallenges.length === 0) {
            activeChallengesList.innerHTML = `
                <div class="empty-challenges-message">
                    <div class="empty-icon"><i class="fas fa-trophy"></i></div>
                    <h4>Vous n'avez pas encore de défi actif</h4>
                    <p>Commencez un défi suggéré ou créez le vôtre!</p>
                </div>
            `;
        } else {
            activeChallengesList.innerHTML = '';
            
            // Créer les cartes pour chaque défi actif
            activeChallenges.forEach(challenge => {
                const challengeObj = new SpendingChallenge(
                    challenge.id,
                    challenge.name,
                    challenge.type,
                    challenge.amount,
                    challenge.category,
                    challenge.duration,
                    challenge.description,
                    challenge.startDate
                );
                challengeObj.currentSpent = challenge.currentSpent;
                
                const progress = challengeObj.getProgress();
                const remainingDays = challengeObj.getRemainingDays();
                
                // Icône en fonction du type de défi
                let icon = 'fa-ban';
                if (challengeObj.type === 'limit-spend') {
                    icon = 'fa-hand-holding-usd';
                } else if (challengeObj.type === 'avoid-category') {
                    icon = 'fa-shopping-basket';
                }
                
                // Créer la carte
                const challengeCard = document.createElement('div');
                challengeCard.className = 'challenge-card active';
                challengeCard.dataset.id = challengeObj.id;
                
                challengeCard.innerHTML = `
                    <div class="challenge-header">
                        <div class="challenge-icon">
                            <i class="fas ${icon}"></i>
                        </div>
                        <div class="challenge-details">
                            <h5>${challengeObj.name}</h5>
                            <div class="challenge-type">
                                ${challengeObj.type === 'no-spend' ? 
                                    'Aucune dépense' : 
                                    challengeObj.type === 'limit-spend' ? 
                                        `Limite: ${formatCurrency(challengeObj.amount)}` : 
                                        'Éviter une catégorie'}
                                ${challengeObj.category ? ` (${getCategoryName(challengeObj.category)})` : ''}
                            </div>
                        </div>
                        <div class="challenge-status in-progress">
                            <i class="fas fa-running"></i> En cours
                        </div>
                    </div>
                    <div class="challenge-body">
                        <div class="challenge-progress">
                            <div class="challenge-dates">
                                <div>
                                    <i class="far fa-calendar-alt"></i> 
                                    Début: ${new Date(challengeObj.startDate).toLocaleDateString('fr-FR')}
                                </div>
                                <div>
                                    <i class="far fa-calendar-check"></i>
                                    Fin: ${new Date(challengeObj.getEndDate()).toLocaleDateString('fr-FR')}
                                </div>
                            </div>
                            <div class="progress-bar-container">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                            <div class="progress-info">
                                <div>
                                    ${remainingDays > 0 ? 
                                        `J-${remainingDays} pour réussir le défi` : 
                                        'Dernier jour du défi !'}
                                </div>
                                <div>${progress}% écoulé</div>
                            </div>
                        </div>
                        ${challengeObj.type === 'limit-spend' ? `
                            <div class="challenge-spending">
                                <p>Dépenses actuelles: <strong>${formatCurrency(challengeObj.currentSpent)}</strong> sur ${formatCurrency(challengeObj.amount)}</p>
                                <p>Il vous reste: <strong>${formatCurrency(challengeObj.amount - challengeObj.currentSpent > 0 ? challengeObj.amount - challengeObj.currentSpent : 0)}</strong></p>
                            </div>
                        ` : ''}
                    </div>
                    <div class="challenge-actions">
                        <button class="goal-btn btn-add-expense" data-id="${challengeObj.id}">
                            <i class="fas fa-receipt"></i> Ajouter une dépense
                        </button>
                        <button class="goal-btn btn-cancel-challenge" data-id="${challengeObj.id}">
                            <i class="fas fa-times"></i> Abandonner
                        </button>
                    </div>
                `;
                
                activeChallengesList.appendChild(challengeCard);
                
                // Attacher les événements aux boutons
                setTimeout(() => {
                    const addExpenseBtn = challengeCard.querySelector('.btn-add-expense');
                    if (addExpenseBtn) {
                        addExpenseBtn.addEventListener('click', function() {
                            addChallengeExpense(challengeObj.id);
                        });
                    }
                    
                    const cancelBtn = challengeCard.querySelector('.btn-cancel-challenge');
                    if (cancelBtn) {
                        cancelBtn.addEventListener('click', function() {
                            cancelChallenge(challengeObj.id);
                        });
                    }
                }, 0);
            });
        }
    } catch (error) {
        console.error('Erreur lors du chargement des défis:', error);
        activeChallengesList.innerHTML = `
            <div class="error-message">
                <p>Une erreur est survenue lors du chargement des défis. Veuillez réessayer.</p>
            </div>
        `;
    }
}

// Obtenir le nom d'une catégorie à partir de son identifiant
function getCategoryName(categoryId) {
    const categories = {
        'groceries': 'Courses',
        'restaurant': 'Restaurant',
        'delivery': 'Livraison',
        'entertainment': 'Divertissement',
        'shopping': 'Shopping',
        'transport': 'Transport'
    };
    
    return categories[categoryId] || categoryId;
}

// Ajouter une dépense à un défi
function addChallengeExpense(challengeId) {
    try {
        // Récupérer les défis
        const challenges = JSON.parse(localStorage.getItem('mapocket_challenges') || '[]');
        
        // Trouver le défi
        const challengeIndex = challenges.findIndex(c => c.id === challengeId);
        
        if (challengeIndex === -1) {
            showNotification('Défi non trouvé.', 'error');
            return;
        }
        
        // Demander le montant de la dépense
        const amount = prompt('Montant de la dépense (€) :');
        
        if (amount === null) return; // Annulation
        
        const parsedAmount = parseFloat(amount.replace(',', '.'));
        
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            showNotification('Veuillez entrer un montant valide.', 'error');
            return;
        }
        
        // Mettre à jour le montant dépensé
        challenges[challengeIndex].currentSpent += parsedAmount;
        
        // Vérifier si le défi est échoué pour les défis de type 'no-spend' ou 'avoid-category'
        if ((challenges[challengeIndex].type === 'no-spend' || challenges[challengeIndex].type === 'avoid-category') && parsedAmount > 0) {
            challenges[challengeIndex].status = 'failed';
            showNotification('Défi échoué ! Vous avez effectué une dépense.', 'error');
        } else if (challenges[challengeIndex].type === 'limit-spend' && challenges[challengeIndex].currentSpent > challenges[challengeIndex].amount) {
            showNotification('Attention ! Vous avez dépassé votre limite de dépenses.', 'warning');
        }
        
        // Enregistrer les modifications
        localStorage.setItem('mapocket_challenges', JSON.stringify(challenges));
        
        // Recharger les défis
        loadChallenges();
        
        // Notification de succès
        showNotification(`Dépense de ${formatCurrency(parsedAmount)} ajoutée au défi.`);
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la dépense:', error);
        showNotification('Erreur lors de l\'ajout de la dépense.', 'error');
    }
}

// Abandonner un défi
function cancelChallenge(challengeId) {
    try {
        // Demander confirmation
        if (!confirm('Êtes-vous sûr de vouloir abandonner ce défi ?')) {
            return;
        }
        
        // Récupérer les défis
        const challenges = JSON.parse(localStorage.getItem('mapocket_challenges') || '[]');
        
        // Trouver le défi
        const challengeIndex = challenges.findIndex(c => c.id === challengeId);
        
        if (challengeIndex === -1) {
            showNotification('Défi non trouvé.', 'error');
            return;
        }
        
        // Marquer le défi comme échoué
        challenges[challengeIndex].status = 'failed';
        
        // Enregistrer les modifications
        localStorage.setItem('mapocket_challenges', JSON.stringify(challenges));
        
        // Recharger les défis
        loadChallenges();
        
        // Recharger les statistiques
        loadStatsAndHistory();
        
        // Notification
        showNotification('Défi abandonné.');
    } catch (error) {
        console.error('Erreur lors de l\'abandon du défi:', error);
        showNotification('Erreur lors de l\'abandon du défi.', 'error');
    }
}

// Charger les statistiques et l'historique
function loadStatsAndHistory() {
    try {
        // Récupérer les objectifs
        const savingsGoals = JSON.parse(localStorage.getItem('mapocket_savings_goals') || '[]');
        
        // Récupérer les défis
        const challenges = JSON.parse(localStorage.getItem('mapocket_challenges') || '[]');
        
        // Statistiques
        updateStatistics(savingsGoals, challenges);
        
        // Historique
        updateHistory(savingsGoals, challenges);
        
        // Initialiser le filtre d'historique
        initHistoryFilter(savingsGoals, challenges);
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques et de l\'historique:', error);
    }
}

// Mettre à jour les statistiques
function updateStatistics(savingsGoals, challenges) {
    // Nombre d'objectifs atteints
    const completedGoalsCount = document.getElementById('completed-goals-count');
    if (completedGoalsCount) {
        const count = savingsGoals.filter(goal => goal.status === 'completed').length;
        completedGoalsCount.textContent = count;
    }
    
    // Nombre de défis réussis
    const completedChallengesCount = document.getElementById('completed-challenges-count');
    if (completedChallengesCount) {
        const count = challenges.filter(challenge => challenge.status === 'completed').length;
        completedChallengesCount.textContent = count;
    }
    
    // Épargne totale
    const totalSavings = document.getElementById('total-savings');
    if (totalSavings) {
        const total = savingsGoals.reduce((sum, goal) => {
            return sum + (goal.currentAmount || 0);
        }, 0);
        totalSavings.textContent = formatCurrency(total);
    }
    
    // Meilleure série
    const bestStreak = document.getElementById('best-streak');
    if (bestStreak) {
        // Calculer la meilleure série
        let streak = 0;
        
        // Pour l'instant, on utilise juste le nombre de défis réussis consécutifs
        // Une logique plus complexe pourrait être implémentée plus tard
        const completedChallenges = challenges.filter(challenge => challenge.status === 'completed');
        if (completedChallenges.length > 0) {
            streak = completedChallenges.length;
        }
        
        bestStreak.textContent = `${streak} jour${streak > 1 ? 's' : ''}`;
    }
}

// Mettre à jour l'historique
function updateHistory(savingsGoals, challenges) {
    const historyList = document.getElementById('history-list');
    
    if (!historyList) return;
    
    // Filtrer les objectifs et défis terminés
    const completedGoals = savingsGoals.filter(goal => goal.status === 'completed' || goal.status === 'failed');
    const completedChallenges = challenges.filter(challenge => challenge.status === 'completed' || challenge.status === 'failed');
    
    // Combiner et trier
    const historyItems = [
        ...completedGoals.map(goal => ({
            type: 'goal',
            name: goal.name,
            status: goal.status,
            date: goal.deadline, // Date d'échéance pour les objectifs
            amount: goal.targetAmount,
            currentAmount: goal.currentAmount,
            id: goal.id
        })),
        ...completedChallenges.map(challenge => {
            // Calculer la date de fin
            const startDate = new Date(challenge.startDate);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + getDurationDays(challenge.duration));
            
            return {
                type: 'challenge',
                name: challenge.name,
                status: challenge.status,
                date: endDate.toISOString(), // Date de fin pour les défis
                challengeType: challenge.type,
                amount: challenge.amount,
                currentAmount: challenge.currentSpent,
                id: challenge.id
            };
        })
    ];
    
    // Trier par date (plus récent en premier)
    historyItems.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Afficher l'historique ou le message vide
    if (historyItems.length === 0) {
        historyList.innerHTML = `
            <div class="empty-history-message">
                <div class="empty-icon"><i class="fas fa-history"></i></div>
                <h4>Pas encore d'historique</h4>
                <p>Vos objectifs et défis terminés apparaîtront ici.</p>
            </div>
        `;
    } else {
        historyList.innerHTML = '';
        
        // Afficher chaque élément d'historique
        historyItems.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.dataset.type = item.type;
            historyItem.dataset.id = item.id;
            
            // Icône en fonction du type
            const iconClass = item.type === 'goal' ? 'fa-piggy-bank' : 'fa-trophy';
            
            // Résultat
            const resultIcon = item.status === 'completed' ? 'fa-check-circle' : 'fa-times-circle';
            const resultClass = item.status === 'completed' ? 'success' : 'failure';
            const resultText = item.status === 'completed' ? 'Réussi' : 'Échoué';
            
            historyItem.innerHTML = `
                <div class="history-icon ${item.type}">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="history-details">
                    <h5>${item.name}</h5>
                    <div class="history-info">
                        <div class="history-date">
                            <i class="far fa-calendar-alt"></i> ${new Date(item.date).toLocaleDateString('fr-FR')}
                        </div>
                        <div class="history-result ${resultClass}">
                            <i class="fas ${resultIcon}"></i> ${resultText}
                        </div>
                        ${item.type === 'goal' ? `
                            <div class="history-amount">
                                ${formatCurrency(item.currentAmount)} / ${formatCurrency(item.amount)}
                            </div>
                        ` : item.challengeType === 'limit-spend' ? `
                            <div class="history-amount">
                                ${formatCurrency(item.currentAmount)} / ${formatCurrency(item.amount)}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            
            historyList.appendChild(historyItem);
        });
    }
    
    // Enregistrer les éléments d'historique pour le filtre
    historyList.dataset.items = JSON.stringify(historyItems);
}

// Initialiser le filtre d'historique
function initHistoryFilter(savingsGoals, challenges) {
    const historyFilter = document.getElementById('history-filter');
    const historyList = document.getElementById('history-list');
    
    if (!historyFilter || !historyList) return;
    
    historyFilter.addEventListener('change', function() {
        const filter = this.value;
        const items = JSON.parse(historyList.dataset.items || '[]');
        
        // Filtrer les éléments
        const filteredItems = filter === 'all' ? 
            items : 
            items.filter(item => item.type === filter.replace('s', ''));
        
        // Mettre à jour l'affichage
        if (filteredItems.length === 0) {
            historyList.innerHTML = `
                <div class="empty-history-message">
                    <div class="empty-icon"><i class="fas fa-history"></i></div>
                    <h4>Pas d'éléments correspondants</h4>
                    <p>Aucun élément ne correspond à votre filtre.</p>
                </div>
            `;
        } else {
            // Afficher uniquement les éléments correspondants
            const historyItems = historyList.querySelectorAll('.history-item');
            historyItems.forEach(item => {
                if (filter === 'all' || item.dataset.type === filter.replace('s', '')) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        }
    });
}

// Obtenir le nombre de jours pour une durée
function getDurationDays(duration) {
    const durations = {
        'weekend': 2,
        'week': 7,
        '2weeks': 14,
        'month': 30
    };
    
    return durations[duration] || 7;
}

// Afficher une notification
function showNotification(message, type = 'info') {
    // Utiliser la fonction existante si disponible
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    // Sinon, créer une fonction de notification basique
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Supprimer la notification après 3 secondes
    setTimeout(function() {
        notification.classList.add('hide');
        setTimeout(function() {
            notification.remove();
        }, 500);
    }, 3000);
}