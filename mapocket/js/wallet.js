// Initialisation de la page portefeuille
document.addEventListener('DOMContentLoaded', function() {
    initWalletPage();
});

// Fonction principale d'initialisation de la page
function initWalletPage() {
    // Chargement des données du portefeuille
    loadWalletData();
    
    // Chargement des projets liés
    loadLinkedProjects();
    
    // Initialisation des événements
    document.getElementById('addIncomeBtn').addEventListener('click', function() {
        openIncomeModal();
    });
    
    document.getElementById('addIncomeBtn2').addEventListener('click', function() {
        openIncomeModal();
    });
    
    document.getElementById('linkProjectBtn').addEventListener('click', function() {
        // Redirection vers la page index avec focus sur les projets
        window.location.href = 'index.html#projects-list';
    });
    
    // Gestion des événements de la modale
    document.querySelector('.close-modal').addEventListener('click', closeIncomeModal);
    document.querySelectorAll('.cancel-modal').forEach(button => {
        button.addEventListener('click', closeIncomeModal);
    });
    
    // Gestion du changement de fréquence
    document.getElementById('incomeFrequency').addEventListener('change', function() {
        updateFrequencyFields(this.value);
    });
    
    // Gestion de la soumission du formulaire
    document.getElementById('incomeForm').addEventListener('submit', function(event) {
        event.preventDefault();
        saveIncome();
    });

    // Définir la date du jour comme date par défaut
    document.getElementById('incomeStartDate').valueAsDate = new Date();
}

// Fonction pour charger les données du portefeuille depuis localStorage
function loadWalletData() {
    let walletData = localStorage.getItem('walletData');
    
    if (walletData) {
        walletData = JSON.parse(walletData);
        
        // Remplir le tableau des revenus
        populateIncomesTable(walletData.incomes || []);
        
        // Mettre à jour les soldes
        updateBalances();
    } else {
        // Initialiser les données du portefeuille si elles n'existent pas
        walletData = {
            incomes: [],
            linkedProjects: []
        };
        localStorage.setItem('walletData', JSON.stringify(walletData));
        
        // Afficher le message de revenus vides
        document.querySelector('.empty-incomes-message').style.display = 'block';
    }
}

// Fonction pour remplir le tableau des revenus
function populateIncomesTable(incomes) {
    const tableBody = document.getElementById('incomesTableBody');
    tableBody.innerHTML = '';
    
    if (incomes.length === 0) {
        document.querySelector('.empty-incomes-message').style.display = 'block';
        return;
    }
    
    document.querySelector('.empty-incomes-message').style.display = 'none';
    
    incomes.forEach(income => {
        const row = document.createElement('tr');
        
        // Formatage de la fréquence
        let frequencyText = '';
        switch(income.frequency) {
            case 'once': frequencyText = 'Ponctuel'; break;
            case 'weekly': frequencyText = 'Hebdomadaire'; break;
            case 'monthly': frequencyText = 'Mensuel'; break;
            case 'quarterly': frequencyText = 'Trimestriel'; break;
            case 'yearly': frequencyText = 'Annuel'; break;
            default: frequencyText = 'Inconnu';
        }
        
        // Déterminer la prochaine date de revenu
        const nextDate = getNextIncomeDate(income);
        
        row.innerHTML = `
            <td>${income.description}</td>
            <td>${formatCurrency(income.amount)}</td>
            <td>${frequencyText}</td>
            <td>${nextDate ? formatDate(nextDate) : 'N/A'}</td>
            <td class="actions-cell">
                <button class="btn-sm btn-edit" title="Modifier">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-sm btn-delete" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // Initialiser les actions pour ce revenu
        initIncomeActions(row, income.id);
    });
}

// Fonction pour charger les projets liés
function loadLinkedProjects() {
    // Récupérer les données du portefeuille
    let walletData = JSON.parse(localStorage.getItem('walletData') || '{"linkedProjects":[]}');
    
    // Récupérer les projets (utilisation de la clé 'savedProjects')
    let projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    
    // Filtrer les projets liés
    let linkedProjects = projects.filter(project => 
        walletData.linkedProjects.includes(project.id)
    );
    
    // Mettre à jour le compteur de projets liés
    document.getElementById('linkedProjectsCount').textContent = linkedProjects.length;
    
    // Remplir le tableau des projets liés
    populateLinkedProjectsTable(linkedProjects);
}

// Fonction pour remplir le tableau des projets liés
function populateLinkedProjectsTable(projects) {
    const tableBody = document.getElementById('linkedProjectsTableBody');
    tableBody.innerHTML = '';
    
    if (projects.length === 0) {
        document.querySelector('.empty-linked-projects-message').style.display = 'block';
        return;
    }
    
    document.querySelector('.empty-linked-projects-message').style.display = 'none';
    
    projects.forEach(project => {
        // Extraction du budget sans le symbole €
        const budgetText = project.totalBudget;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${project.projectName}</td>
            <td>${project.projectDate}</td>
            <td>${budgetText}</td>
            <td><span class="status-badge status-active">Actif</span></td>
            <td class="actions-cell">
                <button class="btn-sm btn-view" title="Voir">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-sm btn-unlink" title="Délier">
                    <i class="fas fa-unlink"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // Initialiser les actions pour ce projet
        initProjectActions(row, project.id);
    });
}

// Fonction pour mettre à jour les soldes
function updateBalances() {
    let walletData = JSON.parse(localStorage.getItem('walletData') || '{"incomes":[]}');
    const now = new Date();
    const sixMonthsLater = new Date(now);
    sixMonthsLater.setMonth(now.getMonth() + 6);
    
    // Calcul du solde actuel (somme des revenus déjà reçus)
    let currentBalance = 0;
    
    // Calcul du solde prévisionnel (somme des revenus prévus pour les 6 prochains mois)
    let forecastedBalance = 0;
    
    // Calcul des revenus réguliers mensuels
    let regularMonthlyIncome = 0;
    
    walletData.incomes.forEach(income => {
        const startDate = new Date(income.startDate);
        
        if (income.frequency === 'once') {
            // Revenu ponctuel
            if (startDate <= now) {
                // Déjà reçu
                currentBalance += parseFloat(income.amount);
                forecastedBalance += parseFloat(income.amount);
            } else if (startDate <= sixMonthsLater) {
                // Prévu dans les 6 prochains mois
                forecastedBalance += parseFloat(income.amount);
            }
        } else {
            // Revenu récurrent
            let nextDate = new Date(startDate);
            let endDate = income.endDate ? new Date(income.endDate) : null;
            
            // Calculer les revenus déjà reçus
            while (nextDate <= now) {
                if (endDate && nextDate > endDate) break;
                
                currentBalance += parseFloat(income.amount);
                forecastedBalance += parseFloat(income.amount);
                
                // Passer à la prochaine occurrence
                switch(income.frequency) {
                    case 'weekly':
                        nextDate.setDate(nextDate.getDate() + 7);
                        break;
                    case 'monthly':
                        nextDate.setMonth(nextDate.getMonth() + 1);
                        break;
                    case 'quarterly':
                        nextDate.setMonth(nextDate.getMonth() + 3);
                        break;
                    case 'yearly':
                        nextDate.setFullYear(nextDate.getFullYear() + 1);
                        break;
                }
            }
            
            // Calculer les revenus prévus
            while (nextDate <= sixMonthsLater) {
                if (endDate && nextDate > endDate) break;
                
                forecastedBalance += parseFloat(income.amount);
                
                // Passer à la prochaine occurrence
                switch(income.frequency) {
                    case 'weekly':
                        nextDate.setDate(nextDate.getDate() + 7);
                        break;
                    case 'monthly':
                        nextDate.setMonth(nextDate.getMonth() + 1);
                        break;
                    case 'quarterly':
                        nextDate.setMonth(nextDate.getMonth() + 3);
                        break;
                    case 'yearly':
                        nextDate.setFullYear(nextDate.getFullYear() + 1);
                        break;
                }
            }
            
            // Calculer les revenus mensuels
            if (['weekly', 'monthly', 'quarterly', 'yearly'].includes(income.frequency)) {
                let monthlyEquivalent = parseFloat(income.amount);
                
                switch(income.frequency) {
                    case 'weekly':
                        monthlyEquivalent = monthlyEquivalent * 4.33; // 52 semaines / 12 mois
                        break;
                    case 'quarterly':
                        monthlyEquivalent = monthlyEquivalent / 3;
                        break;
                    case 'yearly':
                        monthlyEquivalent = monthlyEquivalent / 12;
                        break;
                }
                
                regularMonthlyIncome += monthlyEquivalent;
            }
        }
    });
    
    // Soustraire les budgets des projets liés
    let projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    let linkedProjectIds = walletData.linkedProjects || [];
    
    linkedProjectIds.forEach(projectId => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            const budget = parseFloat(project.totalBudget.replace('€', '').trim());
            forecastedBalance -= budget;
        }
    });
    
    // Mettre à jour l'affichage
    document.getElementById('currentBalance').textContent = formatCurrency(currentBalance);
    document.getElementById('forecastedBalance').textContent = formatCurrency(forecastedBalance);
    document.getElementById('regularIncomeTotal').textContent = formatCurrency(regularMonthlyIncome);
    
    // Mettre à jour la date prévisionnelle
    document.getElementById('forecastedDate').textContent = 
        `au ${sixMonthsLater.getDate().toString().padStart(2, '0')}/${(sixMonthsLater.getMonth() + 1).toString().padStart(2, '0')}/${sixMonthsLater.getFullYear()}`;
}

// Fonction pour ouvrir la modale d'ajout/modification de revenu
function openIncomeModal(incomeId = null) {
    const modal = document.getElementById('incomeModal');
    const modalTitle = document.getElementById('incomeModalTitle');
    const form = document.getElementById('incomeForm');
    
    // Réinitialiser le formulaire
    form.reset();
    
    if (incomeId) {
        // Mode édition
        modalTitle.textContent = 'Modifier un revenu';
        
        // Récupérer les données du revenu
        const walletData = JSON.parse(localStorage.getItem('walletData') || '{"incomes":[]}');
        const income = walletData.incomes.find(inc => inc.id === incomeId);
        
        if (income) {
            document.getElementById('incomeId').value = income.id;
            document.getElementById('incomeDescription').value = income.description;
            document.getElementById('incomeAmount').value = income.amount;
            document.getElementById('incomeFrequency').value = income.frequency;
            document.getElementById('incomeStartDate').value = income.startDate;
            
            if (income.endDate) {
                document.getElementById('incomeEndDate').value = income.endDate;
            }
            
            // Mettre à jour l'affichage des champs selon la fréquence
            updateFrequencyFields(income.frequency);
        }
    } else {
        // Mode ajout
        modalTitle.textContent = 'Ajouter un revenu';
        document.getElementById('incomeId').value = '';
        updateFrequencyFields('once');
    }
    
    // Afficher la modale
    modal.style.display = 'block';
}

// Fonction pour fermer la modale
function closeIncomeModal() {
    document.getElementById('incomeModal').style.display = 'none';
}

// Fonction pour mettre à jour l'affichage des champs selon la fréquence
function updateFrequencyFields(frequency) {
    const endDateGroup = document.getElementById('incomeEndDateGroup');
    
    if (frequency === 'once') {
        endDateGroup.style.display = 'none';
    } else {
        endDateGroup.style.display = 'block';
    }
}

// Fonction pour enregistrer un revenu
function saveIncome() {
    // Récupérer les données du formulaire
    const incomeId = document.getElementById('incomeId').value;
    const description = document.getElementById('incomeDescription').value;
    const amount = document.getElementById('incomeAmount').value;
    const frequency = document.getElementById('incomeFrequency').value;
    const startDate = document.getElementById('incomeStartDate').value;
    const endDate = document.getElementById('incomeEndDate').value || null;
    
    // Récupérer les données du portefeuille
    let walletData = JSON.parse(localStorage.getItem('walletData') || '{"incomes":[]}');
    
    if (incomeId) {
        // Mode édition
        const incomeIndex = walletData.incomes.findIndex(inc => inc.id === incomeId);
        
        if (incomeIndex !== -1) {
            walletData.incomes[incomeIndex] = {
                id: incomeId,
                description,
                amount,
                frequency,
                startDate,
                endDate
            };
        }
    } else {
        // Mode ajout
        const newIncome = {
            id: Date.now().toString(),
            description,
            amount,
            frequency,
            startDate,
            endDate
        };
        
        walletData.incomes.push(newIncome);
    }
    
    // Enregistrer les données
    saveWalletData(walletData);
    
    // Fermer la modale
    closeIncomeModal();
    
    // Afficher une notification
    showNotification(incomeId ? 'Revenu modifié avec succès' : 'Revenu ajouté avec succès');
}

// Fonction pour enregistrer les données du portefeuille
function saveWalletData(data) {
    localStorage.setItem('walletData', JSON.stringify(data));
    
    // Recharger les données
    loadWalletData();
    
    // Mettre à jour les projets liés (au cas où)
    loadLinkedProjects();
}

// Fonction pour initialiser les actions d'un revenu
function initIncomeActions(row, incomeId) {
    // Bouton d'édition
    row.querySelector('.btn-edit').addEventListener('click', function() {
        openIncomeModal(incomeId);
    });
    
    // Bouton de suppression
    row.querySelector('.btn-delete').addEventListener('click', function() {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce revenu ?')) {
            deleteIncome(incomeId);
        }
    });
}

// Fonction pour initialiser les actions d'un projet
function initProjectActions(row, projectId) {
    // Bouton de visualisation
    row.querySelector('.btn-view').addEventListener('click', function() {
        viewProject(projectId);
    });
    
    // Bouton de déliaison
    row.querySelector('.btn-unlink').addEventListener('click', function() {
        if (confirm('Êtes-vous sûr de vouloir délier ce projet du portefeuille ?')) {
            unlinkProject(projectId);
        }
    });
}

// Fonction pour supprimer un revenu
function deleteIncome(incomeId) {
    // Récupérer les données du portefeuille
    let walletData = JSON.parse(localStorage.getItem('walletData') || '{"incomes":[]}');
    
    // Filtrer le revenu à supprimer
    walletData.incomes = walletData.incomes.filter(inc => inc.id !== incomeId);
    
    // Enregistrer les données
    saveWalletData(walletData);
    
    // Afficher une notification
    showNotification('Revenu supprimé avec succès');
}

// Fonction pour visualiser un projet
function viewProject(projectId) {
    // Redirection vers la page d'accueil avec l'ID du projet en paramètre pour l'afficher
    window.location.href = 'index.html?projectId=' + projectId;
}

// Fonction pour délier un projet
function unlinkProject(projectId) {
    // Récupérer les données du portefeuille
    let walletData = JSON.parse(localStorage.getItem('walletData') || '{"linkedProjects":[]}');
    
    // Filtrer le projet à délier
    walletData.linkedProjects = walletData.linkedProjects.filter(id => id !== projectId);
    
    // Enregistrer les données
    saveWalletData(walletData);
    
    // Afficher une notification
    showNotification('Projet délié avec succès');
}

// Fonction pour déterminer la prochaine date de revenu
function getNextIncomeDate(income) {
    const now = new Date();
    const startDate = new Date(income.startDate);
    
    if (income.frequency === 'once') {
        // Pour un revenu ponctuel, s'il est dans le futur, c'est la date de début
        // sinon, il n'y a pas de prochaine date
        return startDate > now ? startDate : null;
    }
    
    // Pour un revenu récurrent, calculer la prochaine occurrence
    let nextDate = new Date(startDate);
    
    // Si une date de fin est spécifiée et est dépassée, pas de prochaine date
    if (income.endDate && new Date(income.endDate) < now) {
        return null;
    }
    
    // Trouver la prochaine occurrence après aujourd'hui
    while (nextDate <= now) {
        switch(income.frequency) {
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            case 'quarterly':
                nextDate.setMonth(nextDate.getMonth() + 3);
                break;
            case 'yearly':
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                break;
        }
        
        // Vérifier si on a dépassé la date de fin
        if (income.endDate && nextDate > new Date(income.endDate)) {
            return null;
        }
    }
    
    return nextDate;
}

// Fonction pour formater une date (JJ/MM/AAAA)
function formatDate(date) {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

// Fonction pour formater un montant en devise
function formatCurrency(amount) {
    return `€ ${parseFloat(amount).toFixed(2)}`;
}

// Fonction pour afficher une notification
function showNotification(message) {
    // Créer un élément de notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Ajouter la notification au document
    document.body.appendChild(notification);
    
    // Afficher la notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Supprimer la notification après 3 secondes
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}