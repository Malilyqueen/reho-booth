/**
 * MaPocket Pro - JS
 * Gestion des fonctionnalités Pro (devis, factures, comptabilité)
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('MaPocket Pro initialized');
    
    // S'assurer que les préférences sont appliquées avant d'initialiser la page
    if (window.preferencesManager) {
        window.preferencesManager.applyAllPreferences();
    }
    
    // Configuration des onglets
    setupTabs();
    
    // Chargement des données
    loadQuotes();
    loadInvoices();
    loadAccountingData();
    
    // Mise à jour des statistiques
    updateProStats();
    
    // Initialisation des graphiques
    initCharts();
    
    // Gestion du changement de période comptable
    setupAccountingPeriodChange();
});

/**
 * Configuration des onglets
 */
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Suppression de la classe active de tous les onglets
            tabBtns.forEach(b => b.classList.remove('active'));
            
            // Ajout de la classe active à l'onglet cliqué
            btn.classList.add('active');
            
            // Affichage du contenu correspondant
            const tabId = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

/**
 * Chargement des devis
 */
function loadQuotes() {
    // Récupération des devis depuis le stockage local
    const quotes = getQuotesFromStorage();
    
    if (quotes.length === 0) {
        // Aucun devis trouvé
        document.querySelector('.quotes-table-container table').style.display = 'none';
        document.querySelector('.empty-quotes-message').style.display = 'block';
        return;
    }
    
    // Affichage des devis dans le tableau
    document.querySelector('.quotes-table-container table').style.display = 'table';
    document.querySelector('.empty-quotes-message').style.display = 'none';
    
    const tbody = document.getElementById('quotesTableBody');
    tbody.innerHTML = '';
    
    quotes.forEach(quote => {
        const row = document.createElement('tr');
        
        // Formatage du montant en utilisant la fonction formatCurrency
        const amount = formatCurrency(quote.totalTTC || 0);
        
        // Détermination du statut avec classe CSS
        let statusClass = '';
        switch (quote.status) {
            case 'draft': statusClass = 'status-draft'; break;
            case 'sent': statusClass = 'status-sent'; break;
            case 'accepted': statusClass = 'status-paid'; break;
            case 'rejected': statusClass = 'status-overdue'; break;
            case 'expired': statusClass = 'status-expired'; break;
            default: statusClass = 'status-draft';
        }
        
        // Traduction du statut
        let statusText = '';
        switch (quote.status) {
            case 'draft': statusText = 'Brouillon'; break;
            case 'sent': statusText = 'Envoyé'; break;
            case 'accepted': statusText = 'Accepté'; break;
            case 'rejected': statusText = 'Refusé'; break;
            case 'expired': statusText = 'Expiré'; break;
            default: statusText = 'Brouillon';
        }
        
        // Construction de la ligne
        row.innerHTML = `
            <td>${quote.quoteNumber}</td>
            <td>${quote.clientName}</td>
            <td>${quote.quoteSubject}</td>
            <td>${formatDate(quote.quoteDate)}</td>
            <td>${amount}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td class="actions">
                <button class="action-btn view-quote" data-id="${quote.id}" title="Voir">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit-quote" data-id="${quote.id}" title="Modifier">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn convert-to-invoice" data-id="${quote.id}" title="Convertir en facture">
                    <i class="fas fa-file-invoice-dollar"></i>
                </button>
                <button class="action-btn delete-quote" data-id="${quote.id}" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        // Ajout des écouteurs d'événements pour les boutons d'action
        tbody.appendChild(row);
    });
    
    // Ajout des écouteurs d'événements pour les boutons d'action
    addQuoteActionListeners();
}

/**
 * Ajout des écouteurs d'événements pour les actions sur les devis
 */
function addQuoteActionListeners() {
    // Voir un devis
    document.querySelectorAll('.view-quote').forEach(btn => {
        btn.addEventListener('click', () => {
            const quoteId = btn.getAttribute('data-id');
            window.location.href = `devis.html?id=${quoteId}&view=true`;
        });
    });
    
    // Modifier un devis
    document.querySelectorAll('.edit-quote').forEach(btn => {
        btn.addEventListener('click', () => {
            const quoteId = btn.getAttribute('data-id');
            window.location.href = `devis.html?id=${quoteId}`;
        });
    });
    
    // Convertir un devis en facture
    document.querySelectorAll('.convert-to-invoice').forEach(btn => {
        btn.addEventListener('click', () => {
            const quoteId = btn.getAttribute('data-id');
            window.location.href = `facture.html?fromQuote=${quoteId}`;
        });
    });
    
    // Supprimer un devis
    document.querySelectorAll('.delete-quote').forEach(btn => {
        btn.addEventListener('click', () => {
            const quoteId = btn.getAttribute('data-id');
            if (confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
                deleteQuote(quoteId);
                loadQuotes(); // Recharger la liste
                updateProStats(); // Mettre à jour les statistiques
            }
        });
    });
}

/**
 * Chargement des factures
 */
function loadInvoices() {
    // Récupération des factures depuis le stockage local
    const invoices = getInvoicesFromStorage();
    
    if (invoices.length === 0) {
        // Aucune facture trouvée
        document.querySelector('.invoices-table-container table').style.display = 'none';
        document.querySelector('.empty-invoices-message').style.display = 'block';
        return;
    }
    
    // Affichage des factures dans le tableau
    document.querySelector('.invoices-table-container table').style.display = 'table';
    document.querySelector('.empty-invoices-message').style.display = 'none';
    
    const tbody = document.getElementById('invoicesTableBody');
    tbody.innerHTML = '';
    
    invoices.forEach(invoice => {
        const row = document.createElement('tr');
        
        // Formatage du montant en utilisant la fonction formatCurrency
        const amount = formatCurrency(invoice.totalTTC || 0);
        
        // Détermination du statut avec classe CSS
        let statusClass = '';
        switch (invoice.status) {
            case 'draft': statusClass = 'status-draft'; break;
            case 'sent': statusClass = 'status-sent'; break;
            case 'paid': statusClass = 'status-paid'; break;
            case 'overdue': statusClass = 'status-overdue'; break;
            default: statusClass = 'status-draft';
        }
        
        // Traduction du statut
        let statusText = '';
        switch (invoice.status) {
            case 'draft': statusText = 'Brouillon'; break;
            case 'sent': statusText = 'Émise'; break;
            case 'paid': statusText = 'Payée'; break;
            case 'overdue': statusText = 'En retard'; break;
            default: statusText = 'Brouillon';
        }
        
        // Construction de la ligne
        row.innerHTML = `
            <td>${invoice.invoiceNumber}</td>
            <td>${invoice.clientName}</td>
            <td>${invoice.invoiceSubject}</td>
            <td>${formatDate(invoice.invoiceDate)}</td>
            <td>${amount}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td class="actions">
                <button class="action-btn view-invoice" data-id="${invoice.id}" title="Voir">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit-invoice" data-id="${invoice.id}" title="Modifier">
                    <i class="fas fa-edit"></i>
                </button>
                ${invoice.status !== 'paid' ? `
                <button class="action-btn mark-as-paid" data-id="${invoice.id}" title="Marquer comme payée">
                    <i class="fas fa-check-circle"></i>
                </button>
                ` : ''}
                <button class="action-btn delete-invoice" data-id="${invoice.id}" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Ajout des écouteurs d'événements pour les boutons d'action
    addInvoiceActionListeners();
}

/**
 * Ajout des écouteurs d'événements pour les actions sur les factures
 */
function addInvoiceActionListeners() {
    // Voir une facture
    document.querySelectorAll('.view-invoice').forEach(btn => {
        btn.addEventListener('click', () => {
            const invoiceId = btn.getAttribute('data-id');
            window.location.href = `facture.html?id=${invoiceId}&view=true`;
        });
    });
    
    // Modifier une facture
    document.querySelectorAll('.edit-invoice').forEach(btn => {
        btn.addEventListener('click', () => {
            const invoiceId = btn.getAttribute('data-id');
            window.location.href = `facture.html?id=${invoiceId}`;
        });
    });
    
    // Marquer une facture comme payée
    document.querySelectorAll('.mark-as-paid').forEach(btn => {
        btn.addEventListener('click', () => {
            const invoiceId = btn.getAttribute('data-id');
            openMarkAsPaidModal(invoiceId);
        });
    });
    
    // Supprimer une facture
    document.querySelectorAll('.delete-invoice').forEach(btn => {
        btn.addEventListener('click', () => {
            const invoiceId = btn.getAttribute('data-id');
            if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
                deleteInvoice(invoiceId);
                loadInvoices(); // Recharger la liste
                updateProStats(); // Mettre à jour les statistiques
                loadAccountingData(); // Mettre à jour les données comptables
            }
        });
    });
}

/**
 * Ouvre la modale pour marquer une facture comme payée
 */
function openMarkAsPaidModal(invoiceId) {
    // Implémentation à venir
    console.log('Marquer la facture comme payée :', invoiceId);
    // Ici, nous devrions ouvrir la modale et définir l'ID de la facture
}

/**
 * Mise à jour des statistiques Pro
 */
function updateProStats() {
    // Récupération des données
    const quotes = getQuotesFromStorage();
    const invoices = getInvoicesFromStorage();
    
    // Calcul des statistiques
    const activeQuotesCount = quotes.filter(q => q.status === 'sent').length;
    const pendingInvoicesCount = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').length;
    
    // Calcul du chiffre d'affaires du mois
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyRevenue = invoices
        .filter(invoice => {
            if (invoice.status !== 'paid') return false;
            
            const invoiceDate = new Date(invoice.invoiceDate);
            return invoiceDate.getMonth() === currentMonth && 
                   invoiceDate.getFullYear() === currentYear;
        })
        .reduce((total, invoice) => total + (invoice.totalTTC || 0), 0);
    
    // Calcul des cotisations estimées (22% pour auto-entrepreneur)
    const estimatedTaxes = monthlyRevenue * 0.22;
    
    // Mise à jour des éléments HTML
    document.getElementById('activeQuotesCount').textContent = activeQuotesCount;
    document.getElementById('pendingInvoicesCount').textContent = pendingInvoicesCount;
    
    // Formatage des montants en euros
    document.getElementById('monthlyRevenue').textContent = formatCurrency(monthlyRevenue);
    document.getElementById('estimatedTaxes').textContent = formatCurrency(estimatedTaxes);
}

/**
 * Chargement des données comptables
 */
function loadAccountingData() {
    // Récupération des factures
    const invoices = getInvoicesFromStorage();
    
    // Récupération de la période sélectionnée
    const periodType = document.getElementById('accountingPeriod').value;
    
    // Filtrage des factures selon la période
    const { startDate, endDate } = getPeriodDates(periodType);
    const filteredInvoices = filterInvoicesByPeriod(invoices, startDate, endDate);
    
    // Calcul des totaux
    const totalRevenue = filteredInvoices
        .filter(i => i.status === 'paid')
        .reduce((total, invoice) => total + (invoice.totalTTC || 0), 0);
    
    // Récupération des dépenses pro depuis le portefeuille (à implémenter)
    const totalExpenses = 0; // Placeholder, à remplacer par la récupération réelle
    
    const netResult = totalRevenue - totalExpenses;
    const estimatedContributions = totalRevenue * 0.22; // 22% pour auto-entrepreneur
    
    // Mise à jour des éléments HTML
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('netResult').textContent = formatCurrency(netResult);
    document.getElementById('estimatedContributions').textContent = formatCurrency(estimatedContributions);
    
    // Mise à jour des graphiques
    updateCharts(filteredInvoices);
}

/**
 * Calcule les dates de début et de fin selon la période sélectionnée
 */
function getPeriodDates(periodType) {
    const now = new Date();
    let startDate, endDate;
    
    switch(periodType) {
        case 'month':
            // Période : mois en cours
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
        case 'quarter':
            // Période : trimestre en cours
            const quarter = Math.floor(now.getMonth() / 3);
            startDate = new Date(now.getFullYear(), quarter * 3, 1);
            endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
            break;
        case 'year':
            // Période : année en cours
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
            break;
        case 'custom':
            // Période personnalisée
            startDate = new Date(document.getElementById('periodStart').value);
            endDate = new Date(document.getElementById('periodEnd').value);
            break;
        default:
            // Par défaut, mois en cours
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    
    return { startDate, endDate };
}

/**
 * Filtre les factures selon une période
 */
function filterInvoicesByPeriod(invoices, startDate, endDate) {
    return invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.invoiceDate);
        return invoiceDate >= startDate && invoiceDate <= endDate;
    });
}

/**
 * Configuration du changement de période comptable
 */
function setupAccountingPeriodChange() {
    const periodSelect = document.getElementById('accountingPeriod');
    const customPeriodContainer = document.getElementById('customPeriodContainer');
    
    // Affichage du conteneur de période personnalisée si nécessaire
    periodSelect.addEventListener('change', () => {
        if (periodSelect.value === 'custom') {
            customPeriodContainer.style.display = 'block';
        } else {
            customPeriodContainer.style.display = 'none';
            loadAccountingData(); // Recharger les données avec la nouvelle période
        }
    });
    
    // Gestion du bouton d'application de la période personnalisée
    const applyDateRangeBtn = document.getElementById('applyDateRange');
    if (applyDateRangeBtn) {
        applyDateRangeBtn.addEventListener('click', () => {
            loadAccountingData(); // Recharger les données avec la période personnalisée
        });
    }
    
    // Initialisation des dates par défaut
    const now = new Date();
    document.getElementById('periodStart').valueAsDate = new Date(now.getFullYear(), now.getMonth(), 1);
    document.getElementById('periodEnd').valueAsDate = now;
}

/**
 * Initialisation des graphiques
 */
function initCharts() {
    // Placeholder pour l'initialisation des graphiques
    // Dans une implémentation réelle, nous utiliserions une bibliothèque comme Chart.js
    console.log('Charts initialized with placeholder data');
}

/**
 * Mise à jour des graphiques
 */
function updateCharts(filteredInvoices) {
    // Placeholder pour la mise à jour des graphiques
    // Dans une implémentation réelle, nous mettrions à jour les graphiques avec les données filtrées
    console.log('Charts updated with filtered data');
}

/**
 * Récupère les devis depuis le stockage local
 */
function getQuotesFromStorage() {
    const quotes = localStorage.getItem('mapocket_quotes');
    return quotes ? JSON.parse(quotes) : [];
}

/**
 * Récupère les factures depuis le stockage local
 */
function getInvoicesFromStorage() {
    const invoices = localStorage.getItem('mapocket_invoices');
    return invoices ? JSON.parse(invoices) : [];
}

/**
 * Supprime un devis
 */
function deleteQuote(quoteId) {
    let quotes = getQuotesFromStorage();
    quotes = quotes.filter(quote => quote.id != quoteId);
    localStorage.setItem('mapocket_quotes', JSON.stringify(quotes));
}

/**
 * Supprime une facture
 */
function deleteInvoice(invoiceId) {
    let invoices = getInvoicesFromStorage();
    invoices = invoices.filter(invoice => invoice.id != invoiceId);
    localStorage.setItem('mapocket_invoices', JSON.stringify(invoices));
}

/**
 * Formate une date au format français
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

/**
 * Formate un montant en devise selon les préférences utilisateur
 */
function formatCurrency(amount) {
    // Utiliser la fonction globale si elle existe
    if (typeof window.getCurrencySymbol === 'function') {
        // Récupérer les préférences utilisateur pour obtenir la devise
        let currencyCode = 'EUR'; // Devise par défaut
        
        try {
            const savedPrefs = localStorage.getItem('userPreferences');
            if (savedPrefs) {
                const userPreferences = JSON.parse(savedPrefs);
                currencyCode = userPreferences.currency || 'EUR';
            }
        } catch (error) {
            console.error('Erreur lors du chargement des préférences utilisateur:', error);
        }
        
        const currencySymbol = window.getCurrencySymbol(currencyCode);
        return `${currencySymbol} ${parseFloat(amount || 0).toFixed(2)}`;
    }
    
    // Fallback à l'ancienne méthode si la fonction globale n'existe pas
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount || 0);
}