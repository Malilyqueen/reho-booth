// Timeline.js - Gestion de la Timeline intelligente pour MaPocket

document.addEventListener('DOMContentLoaded', function() {
    console.log('Timeline initialisée');
    
    // Initialisation des événements de la timeline
    initTimeline();
    
    // Gestion du modal d'ajout de rappel
    initReminderModal();
    
    // Gestion du filtre de la timeline
    initTimelineFilter();
});

// Classe pour représenter un événement de la timeline
class TimelineEvent {
    constructor(id, title, date, type, description, status = 'pending', linked = null) {
        this.id = id;
        this.title = title;
        this.date = date; // Format YYYY-MM-DD
        this.type = type; // 'project', 'invoice', 'quote', 'income', 'goal', 'alert', 'reminder'
        this.description = description;
        this.status = status; // 'pending', 'done', 'overdue'
        this.linked = linked; // ID de l'élément lié (projet, facture, etc.)
        this.created = new Date().toISOString();
    }
    
    // Retourne true si l'événement se produit dans les X prochains jours
    isWithinDays(days) {
        const eventDate = new Date(this.date);
        const today = new Date();
        
        // Réinitialiser les heures pour comparer uniquement les dates
        today.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);
        
        const diffTime = eventDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays >= 0 && diffDays <= days;
    }
    
    // Retourne true si l'événement est urgent (moins de 3 jours)
    isUrgent() {
        return this.isWithinDays(3);
    }
    
    // Retourne true si l'événement est en retard
    isOverdue() {
        const eventDate = new Date(this.date);
        const today = new Date();
        
        // Réinitialiser les heures pour comparer uniquement les dates
        today.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);
        
        return eventDate < today && this.status === 'pending';
    }
    
    // Formater la date pour l'affichage
    getFormattedDate() {
        const date = new Date(this.date);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    // Obtenir l'icône correspondant au type d'événement
    getIcon() {
        const icons = {
            'project': 'fa-project-diagram',
            'invoice': 'fa-file-invoice',
            'quote': 'fa-file-contract',
            'income': 'fa-money-bill-wave',
            'goal': 'fa-bullseye',
            'alert': 'fa-exclamation-triangle',
            'reminder': 'fa-bell'
        };
        
        return icons[this.type] || 'fa-calendar-day';
    }
}

// Initialisation de la timeline
function initTimeline() {
    loadTimelineEvents();
}

// Chargement des événements de la timeline
function loadTimelineEvents() {
    // Récupérer les événements depuis le localStorage
    const timelineEvents = getTimelineEventsFromStorage();
    
    // Afficher les événements
    displayTimelineEvents(timelineEvents);
}

// Récupération des événements de la timeline depuis le localStorage
function getTimelineEventsFromStorage() {
    try {
        // Récupérer les événements déjà enregistrés
        const savedEvents = JSON.parse(localStorage.getItem('mapocket_timeline_events') || '[]');
        
        // Convertir les objets JSON en instances de TimelineEvent
        const events = savedEvents.map(event => {
            return new TimelineEvent(
                event.id,
                event.title,
                event.date,
                event.type,
                event.description,
                event.status,
                event.linked
            );
        });
        
        // Générer des événements automatiques basés sur les projets, factures, etc.
        const autoEvents = generateAutoEvents();
        
        // Combiner les événements manuels et automatiques
        const allEvents = [...events, ...autoEvents];
        
        // Trier par date
        allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        return allEvents;
        
    } catch (error) {
        console.error('Erreur lors du chargement des événements de la timeline:', error);
        return [];
    }
}

// Génération automatique d'événements basés sur les projets, factures, etc.
function generateAutoEvents() {
    const autoEvents = [];
    
    try {
        // Générer des événements à partir des projets
        generateProjectEvents(autoEvents);
        
        // Générer des événements à partir des factures
        generateInvoiceEvents(autoEvents);
        
        // Générer des événements à partir des devis
        generateQuoteEvents(autoEvents);
        
        // Générer des événements à partir des revenus
        generateIncomeEvents(autoEvents);
        
        // Générer des événements à partir des objectifs
        generateGoalEvents(autoEvents);
        
        // Générer des alertes budgétaires
        generateBudgetAlerts(autoEvents);
        
    } catch (error) {
        console.error('Erreur lors de la génération automatique des événements:', error);
    }
    
    return autoEvents;
}

// Génération d'événements à partir des projets
function generateProjectEvents(events) {
    try {
        const projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        
        projects.forEach(project => {
            // Événement pour la date de création du projet
            if (project.createdAt) {
                const creationDate = new Date(project.createdAt);
                
                events.push(new TimelineEvent(
                    `project_created_${project.id}`,
                    `Création: ${project.projectName}`,
                    creationDate.toISOString().split('T')[0],
                    'project',
                    `Projet créé: ${project.projectName}`,
                    'done',
                    project.id
                ));
            }
            
            // Événement pour la date du projet
            if (project.projectDate) {
                // Convertir la date si elle est au format JJ/MM/AAAA
                let projectDate = project.projectDate;
                if (projectDate.includes('/')) {
                    const parts = projectDate.split('/');
                    projectDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
                
                events.push(new TimelineEvent(
                    `project_date_${project.id}`,
                    `${project.projectName}`,
                    projectDate,
                    'project',
                    `Date du projet: ${project.projectName}`,
                    'pending',
                    project.id
                ));
            }
            
            // Événement pour la date de fin du projet (à implémenter dans la version future)
            if (project.endDate) {
                // Convertir la date si elle est au format JJ/MM/AAAA
                let endDate = project.endDate;
                if (endDate.includes('/')) {
                    const parts = endDate.split('/');
                    endDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
                
                events.push(new TimelineEvent(
                    `project_end_${project.id}`,
                    `Fin: ${project.projectName}`,
                    endDate,
                    'project',
                    `Date de fin prévue: ${project.projectName}`,
                    'pending',
                    project.id
                ));
            }
        });
    } catch (error) {
        console.error('Erreur lors de la génération des événements de projets:', error);
    }
}

// Génération d'événements à partir des factures
function generateInvoiceEvents(events) {
    try {
        const invoices = JSON.parse(localStorage.getItem('mapocket_invoices') || '[]');
        
        invoices.forEach(invoice => {
            // Événement pour la date d'émission de la facture
            if (invoice.issueDate) {
                events.push(new TimelineEvent(
                    `invoice_issued_${invoice.id}`,
                    `Facture émise: ${invoice.number}`,
                    invoice.issueDate,
                    'invoice',
                    `Facture émise pour ${invoice.client?.name || 'client'}: ${invoice.amount || '0'} €`,
                    'done',
                    invoice.id
                ));
            }
            
            // Événement pour la date d'échéance de la facture
            if (invoice.dueDate) {
                const status = invoice.status === 'paid' ? 'done' : 
                               (new Date(invoice.dueDate) < new Date() ? 'overdue' : 'pending');
                
                events.push(new TimelineEvent(
                    `invoice_due_${invoice.id}`,
                    `À régler avant le: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`,
                    invoice.dueDate,
                    'invoice',
                    `Échéance de la facture ${invoice.number} pour ${invoice.client?.name || 'client'}: ${invoice.amount || '0'} €`,
                    status,
                    invoice.id
                ));
            }
        });
    } catch (error) {
        console.error('Erreur lors de la génération des événements de factures:', error);
    }
}

// Génération d'événements à partir des devis
function generateQuoteEvents(events) {
    try {
        const quotes = JSON.parse(localStorage.getItem('mapocket_quotes') || '[]');
        
        quotes.forEach(quote => {
            // Événement pour la date d'envoi du devis
            if (quote.sentDate) {
                events.push(new TimelineEvent(
                    `quote_sent_${quote.id}`,
                    `Devis envoyé: ${quote.number}`,
                    quote.sentDate,
                    'quote',
                    `Devis envoyé à ${quote.client?.name || 'client'}: ${quote.amount || '0'} €`,
                    'done',
                    quote.id
                ));
                
                // Alerte si pas de retour après 5 jours
                if (quote.status === 'sent') {
                    const sentDate = new Date(quote.sentDate);
                    const followupDate = new Date(sentDate);
                    followupDate.setDate(sentDate.getDate() + 5);
                    
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    if (followupDate <= today) {
                        events.push(new TimelineEvent(
                            `quote_followup_${quote.id}`,
                            `Relance devis: ${quote.number}`,
                            followupDate.toISOString().split('T')[0],
                            'alert',
                            `Aucun retour sur le devis ${quote.number} depuis 5 jours`,
                            'pending',
                            quote.id
                        ));
                    }
                }
            }
            
            // Événement pour la date d'expiration du devis
            if (quote.expiryDate) {
                const status = quote.status === 'accepted' ? 'done' : 
                               (quote.status === 'expired' || new Date(quote.expiryDate) < new Date() ? 'overdue' : 'pending');
                
                events.push(new TimelineEvent(
                    `quote_expiry_${quote.id}`,
                    `Expiration: Devis ${quote.number}`,
                    quote.expiryDate,
                    'quote',
                    `Date d'expiration du devis ${quote.number} pour ${quote.client?.name || 'client'}`,
                    status,
                    quote.id
                ));
            }
        });
    } catch (error) {
        console.error('Erreur lors de la génération des événements de devis:', error);
    }
}

// Génération d'événements à partir des revenus
function generateIncomeEvents(events) {
    try {
        const incomes = JSON.parse(localStorage.getItem('mapocket_recurring_incomes') || '[]');
        
        incomes.forEach(income => {
            // Événement pour la prochaine date de versement
            if (income.nextPaymentDate) {
                events.push(new TimelineEvent(
                    `income_next_${income.id}`,
                    `${income.name || 'Revenu récurrent'}`,
                    income.nextPaymentDate,
                    'income',
                    `${income.name || 'Revenu récurrent'} prévu le ${new Date(income.nextPaymentDate).toLocaleDateString('fr-FR')} - +${income.amount || '0'} €`,
                    'pending',
                    income.id
                ));
            }
        });
    } catch (error) {
        console.error('Erreur lors de la génération des événements de revenus:', error);
    }
}

// Génération d'événements à partir des objectifs budgétaires
function generateGoalEvents(events) {
    try {
        const goals = JSON.parse(localStorage.getItem('mapocket_budget_goals') || '[]');
        
        goals.forEach(goal => {
            // Événement pour la date butoir de l'objectif
            if (goal.targetDate) {
                const progress = goal.currentAmount / goal.targetAmount * 100 || 0;
                const progressText = `${Math.round(progress)}% d'avancement vers l'objectif`;
                
                events.push(new TimelineEvent(
                    `goal_target_${goal.id}`,
                    `Objectif: ${goal.name || 'Sans nom'}`,
                    goal.targetDate,
                    'goal',
                    `${goal.name || 'Objectif budgétaire'} - ${progressText}`,
                    'pending',
                    goal.id
                ));
            }
        });
    } catch (error) {
        console.error('Erreur lors de la génération des événements d\'objectifs:', error);
    }
}

// Génération d'alertes budgétaires
function generateBudgetAlerts(events) {
    try {
        const projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        
        projects.forEach(project => {
            if (project && project.categories && Array.isArray(project.categories)) {
                project.categories.forEach(category => {
                    if (!category || !category.name) return;
                    
                    // Utiliser une expression régulière pour extraire les nombres de la chaîne de montant
                    // qui pourrait contenir différents symboles de devise
                    const amountStr = category.amount || '0';
                    let budgetAmount = 0;
                    
                    try {
                        // Extraire uniquement les chiffres et le point décimal
                        const matches = amountStr.match(/[\d.,]+/);
                        if (matches && matches.length > 0) {
                            // Remplacer les virgules par des points pour le parsing
                            budgetAmount = parseFloat(matches[0].replace(/,/g, '.'));
                        }
                    } catch (parseErr) {
                        console.error('Erreur lors du parsing du montant:', amountStr, parseErr);
                        budgetAmount = 0;
                    }
                    
                    // Calculer les dépenses réelles pour cette catégorie
                    let realExpenses = 0;
                    if (project.realExpenses && Array.isArray(project.realExpenses)) {
                        project.realExpenses.forEach(expense => {
                            if (expense && expense.category === category.name) {
                                try {
                                    // Extraire uniquement les chiffres et le point décimal
                                    const expenseStr = expense.amount || '0';
                                    const matches = expenseStr.match(/[\d.,]+/);
                                    if (matches && matches.length > 0) {
                                        // Remplacer les virgules par des points pour le parsing
                                        realExpenses += parseFloat(matches[0].replace(/,/g, '.'));
                                    }
                                } catch (parseErr) {
                                    console.error('Erreur lors du parsing de la dépense:', expense.amount, parseErr);
                                }
                            }
                        });
                    }
                    
                    // Générer une alerte si la catégorie dépasse 90% du budget
                    if (budgetAmount > 0 && realExpenses > budgetAmount * 0.9) {
                        const percentOver = Math.round((realExpenses / budgetAmount) * 100);
                        const today = new Date().toISOString().split('T')[0];
                        
                        events.push(new TimelineEvent(
                            `budget_alert_${project.id}_${category.name.replace(/\s+/g, '_')}`,
                            `Alerte budget: ${category.name}`,
                            today,
                            'alert',
                            `${percentOver >= 100 ? 'Dépassement' : 'Attention'}: catégorie ${category.name} - ${percentOver}% du budget prévu dans "${project.projectName}"`,
                            'pending',
                            project.id
                        ));
                    }
                });
            }
        });
    } catch (error) {
        console.error('Erreur lors de la génération des alertes budgétaires:', error);
    }
}

// Affichage des événements de la timeline
function displayTimelineEvents(events, filterType = 'all') {
    const timelineContent = document.getElementById('timelineContent');
    
    if (!timelineContent) {
        console.error('Élément #timelineContent non trouvé');
        return;
    }
    
    // Vider le contenu actuel
    timelineContent.innerHTML = '';
    
    // Filtrer les événements des 30 prochains jours et selon le type
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    const filteredEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        
        // Filtrer par date (événements des 30 prochains jours ou en retard)
        const isInTimeRange = (eventDate >= today && eventDate <= thirtyDaysLater) || 
                             (eventDate < today && event.status === 'pending');
        
        // Filtrer par type
        const matchesType = filterType === 'all' || event.type === filterType;
        
        return isInTimeRange && matchesType;
    });
    
    // Afficher un message si aucun événement
    if (filteredEvents.length === 0) {
        timelineContent.innerHTML = `
            <div class="empty-timeline-message">
                <p><i class="far fa-calendar-alt"></i> Aucun événement à venir dans les 30 prochains jours.</p>
            </div>
        `;
        return;
    }
    
    // Afficher les événements
    filteredEvents.forEach(event => {
        const eventElement = createEventElement(event);
        timelineContent.appendChild(eventElement);
    });
}

// Création d'un élément d'événement pour la timeline
function createEventElement(event) {
    const eventElement = document.createElement('div');
    eventElement.className = `timeline-event`;
    eventElement.dataset.id = event.id;
    eventElement.dataset.type = event.type;
    
    // Ajouter des classes selon le statut et l'urgence
    if (event.status === 'done') {
        eventElement.classList.add('done');
    } else if (event.isOverdue()) {
        eventElement.classList.add('overdue');
    } else if (event.isUrgent()) {
        eventElement.classList.add('urgent');
    }
    
    // Contenu de l'événement
    eventElement.innerHTML = `
        <div class="timeline-event-header">
            <h4 class="timeline-event-title">
                <span class="timeline-event-icon">
                    <i class="fas ${event.getIcon()}"></i>
                </span>
                ${event.title}
            </h4>
            <span class="timeline-event-date">${event.getFormattedDate()}</span>
        </div>
        <div class="timeline-event-content">
            ${event.description}
        </div>
        <div class="timeline-event-actions">
            ${event.status !== 'done' ? `
                <button class="timeline-btn btn-mark-done" data-id="${event.id}">
                    <i class="fas fa-check"></i> Marquer comme fait
                </button>
            ` : ''}
            <button class="timeline-btn btn-delete-event" data-id="${event.id}">
                <i class="fas fa-trash"></i> Supprimer
            </button>
        </div>
    `;
    
    // Ajouter les événements aux boutons
    setTimeout(() => {
        const markDoneBtn = eventElement.querySelector('.btn-mark-done');
        if (markDoneBtn) {
            markDoneBtn.addEventListener('click', function() {
                markEventAsDone(event.id);
            });
        }
        
        const deleteBtn = eventElement.querySelector('.btn-delete-event');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                deleteEvent(event.id);
            });
        }
    }, 0);
    
    return eventElement;
}

// Marquer un événement comme fait
function markEventAsDone(eventId) {
    try {
        // Récupérer les événements
        let savedEvents = JSON.parse(localStorage.getItem('mapocket_timeline_events') || '[]');
        
        // Trouver l'événement à mettre à jour
        const eventIndex = savedEvents.findIndex(event => event.id === eventId);
        
        if (eventIndex !== -1) {
            // Mettre à jour le statut
            savedEvents[eventIndex].status = 'done';
            
            // Enregistrer les modifications
            localStorage.setItem('mapocket_timeline_events', JSON.stringify(savedEvents));
            
            // Recharger la timeline
            loadTimelineEvents();
            
            // Notifier l'utilisateur
            showNotification('Événement marqué comme fait');
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut de l\'événement:', error);
    }
}

// Supprimer un événement
function deleteEvent(eventId) {
    try {
        // Confirmer la suppression
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
            return;
        }
        
        // Récupérer les événements
        let savedEvents = JSON.parse(localStorage.getItem('mapocket_timeline_events') || '[]');
        
        // Filtrer pour exclure l'événement à supprimer
        savedEvents = savedEvents.filter(event => event.id !== eventId);
        
        // Enregistrer les modifications
        localStorage.setItem('mapocket_timeline_events', JSON.stringify(savedEvents));
        
        // Recharger la timeline
        loadTimelineEvents();
        
        // Notifier l'utilisateur
        showNotification('Événement supprimé');
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement:', error);
    }
}

// Initialisation du modal d'ajout de rappel
function initReminderModal() {
    const addReminderBtn = document.getElementById('addReminderBtn');
    const reminderModal = document.getElementById('reminderModal');
    const reminderForm = document.getElementById('reminderForm');
    const cancelReminderBtn = document.getElementById('cancelReminderBtn');
    
    if (!addReminderBtn || !reminderModal || !reminderForm || !cancelReminderBtn) {
        console.error('Éléments du modal non trouvés');
        return;
    }
    
    // Ouvrir le modal
    addReminderBtn.addEventListener('click', function() {
        // Définir la date par défaut à aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('reminderDate').value = today;
        
        // Afficher le modal
        reminderModal.classList.add('active');
    });
    
    // Fermer le modal
    cancelReminderBtn.addEventListener('click', function() {
        reminderModal.classList.remove('active');
    });
    
    // Fermer le modal en cliquant à l'extérieur
    reminderModal.addEventListener('click', function(e) {
        if (e.target === reminderModal) {
            reminderModal.classList.remove('active');
        }
    });
    
    // Soumettre le formulaire
    reminderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Récupérer les valeurs du formulaire
        const title = document.getElementById('reminderTitle').value;
        const date = document.getElementById('reminderDate').value;
        const type = document.getElementById('reminderType').value;
        const description = document.getElementById('reminderDescription').value;
        
        // Créer un nouvel événement
        const newEvent = new TimelineEvent(
            `manual_${Date.now()}`,
            title,
            date,
            type,
            description,
            'pending',
            null
        );
        
        // Ajouter l'événement à la liste
        addEvent(newEvent);
        
        // Fermer le modal
        reminderModal.classList.remove('active');
        
        // Réinitialiser le formulaire
        reminderForm.reset();
    });
}

// Ajouter un événement à la timeline
function addEvent(event) {
    try {
        // Récupérer les événements existants
        const savedEvents = JSON.parse(localStorage.getItem('mapocket_timeline_events') || '[]');
        
        // Ajouter le nouvel événement
        savedEvents.push(event);
        
        // Enregistrer les modifications
        localStorage.setItem('mapocket_timeline_events', JSON.stringify(savedEvents));
        
        // Recharger la timeline
        loadTimelineEvents();
        
        // Notifier l'utilisateur
        showNotification('Événement ajouté à la timeline');
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'événement:', error);
    }
}

// Initialisation du filtre de la timeline
function initTimelineFilter() {
    const timelineFilter = document.getElementById('timelineFilter');
    
    if (!timelineFilter) {
        console.error('Élément #timelineFilter non trouvé');
        return;
    }
    
    // Appliquer le filtre au changement
    timelineFilter.addEventListener('change', function() {
        const filterType = this.value;
        
        // Recharger les événements avec le filtre
        const events = getTimelineEventsFromStorage();
        displayTimelineEvents(events, filterType);
    });
}

// Notification temporaire
function showNotification(message) {
    // Utiliser la fonction existante si disponible
    if (typeof window.showNotification === 'function') {
        window.showNotification(message);
        return;
    }
    
    // Sinon, créer une fonction de notification basique
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