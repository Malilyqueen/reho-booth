/**
 * Script pour la gestion du plan de trésorerie
 */

// Variables globales
let cashflowData = {
    config: {
        period: 6,
        startDate: new Date(),
        wallet: 'all'
    },
    incomes: {},
    expenses: {},
    months: []
};

let chart = null;

// Initialisation au chargement du document
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initialisation du plan de trésorerie');
    
    initCashflowData();
    initEventListeners();
    initDefaultDate();
    loadWallets();
    generateCashflowTable();
    initChart();
});

/**
 * Initialise les données de trésorerie
 */
function initCashflowData() {
    // Récupérer les données sauvegardées si elles existent
    const savedData = localStorage.getItem('cashflowData');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            cashflowData = {
                ...cashflowData,
                ...parsed
            };
            
            // Conversion de la date en objet Date
            if (typeof cashflowData.config.startDate === 'string') {
                cashflowData.config.startDate = new Date(cashflowData.config.startDate);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données de trésorerie:', error);
        }
    }
}

/**
 * Initialise les écouteurs d'événements
 */
function initEventListeners() {
    // Sélecteur de période
    document.getElementById('period').addEventListener('change', function() {
        cashflowData.config.period = parseInt(this.value);
        generateCashflowTable();
        saveConfig();
        updateChart();
    });
    
    // Sélecteur de mois de départ
    document.getElementById('startMonth').addEventListener('change', function() {
        const [year, month] = this.value.split('-');
        cashflowData.config.startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        generateCashflowTable();
        saveConfig();
        updateChart();
    });
    
    // Sélecteur de portefeuille
    document.getElementById('wallet').addEventListener('change', function() {
        cashflowData.config.wallet = this.value;
        generateCashflowTable();
        saveConfig();
        updateChart();
    });
    
    // Bouton d'affichage du graphique
    document.getElementById('toggleChartBtn').addEventListener('click', toggleChart);
    
    // Bouton d'entrée manuelle
    document.getElementById('manualEntryBtn').addEventListener('click', openManualEntryModal);
    
    // Bouton de chargement des factures
    document.getElementById('loadInvoicesBtn').addEventListener('click', openInvoiceSelectionModal);
    
    // Bouton d'export PDF
    document.getElementById('exportPdfBtn').addEventListener('click', exportToPdf);
    
    // Bouton d'export Excel
    document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
    
    // Fermeture des modales
    document.querySelectorAll('.close-modal, .cancel-entry, .cancel-invoice-selection').forEach(element => {
        element.addEventListener('click', closeAllModals);
    });
    
    // Soumission du formulaire d'entrée manuelle
    document.getElementById('manualEntryForm').addEventListener('submit', function(event) {
        event.preventDefault();
        addManualEntry();
    });
    
    // Changement de type d'entrée
    document.getElementById('entryType').addEventListener('change', updateEntryCategoryOptions);
    
    // Confirmation de la sélection des factures
    document.querySelector('.confirm-invoice-selection').addEventListener('click', confirmInvoiceSelection);
    
    // Délégation d'événement pour les cellules éditables
    document.querySelector('.cashflow-table').addEventListener('click', function(event) {
        if (event.target.classList.contains('editable-cell')) {
            editCellValue(event.target);
        }
    });
}

/**
 * Initialise la date de départ par défaut (mois courant)
 */
function initDefaultDate() {
    const today = new Date();
    const dateInput = document.getElementById('startMonth');
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    dateInput.value = formattedDate;
}

/**
 * Charge les portefeuilles disponibles
 */
function loadWallets() {
    const walletSelect = document.getElementById('wallet');
    
    // Vider les options existantes (sauf "Tous les portefeuilles")
    while (walletSelect.options.length > 1) {
        walletSelect.remove(1);
    }
    
    // Charger les portefeuilles depuis le localStorage
    try {
        const walletData = JSON.parse(localStorage.getItem('walletData') || '{"wallets":[]}');
        if (walletData.wallets && walletData.wallets.length > 0) {
            walletData.wallets.forEach(wallet => {
                const option = document.createElement('option');
                option.value = wallet.id;
                option.textContent = wallet.name;
                walletSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erreur lors du chargement des portefeuilles:', error);
    }
    
    // Définir la valeur sélectionnée
    if (cashflowData.config.wallet !== 'all') {
        walletSelect.value = cashflowData.config.wallet;
    }
}

/**
 * Génère le tableau de trésorerie
 */
function generateCashflowTable() {
    generateMonthColumns();
    fillTableData();
    calculateTotalsAndBalances();
    
    // Chargement automatique des données des factures et dépenses
    loadAutomaticData();
}

/**
 * Génère les colonnes de mois dans le tableau
 */
function generateMonthColumns() {
    const table = document.querySelector('.cashflow-table');
    const headerRow = table.querySelector('thead tr');
    
    // Réinitialiser les en-têtes de mois
    while (headerRow.children.length > 1) {
        headerRow.removeChild(headerRow.lastChild);
    }
    
    // Calculer et stocker les mois à afficher
    cashflowData.months = [];
    const startDate = new Date(cashflowData.config.startDate);
    
    for (let i = 0; i < cashflowData.config.period; i++) {
        const currentDate = new Date(startDate);
        currentDate.setMonth(startDate.getMonth() + i);
        
        const monthKey = formatDateForStorage(currentDate);
        cashflowData.months.push(monthKey);
        
        // Créer la colonne d'en-tête pour ce mois
        const th = document.createElement('th');
        th.textContent = formatMonth(currentDate);
        headerRow.insertBefore(th, headerRow.lastChild);
    }
    
    // Ajuster les attributs colspan des en-têtes de section
    document.querySelectorAll('.section-header td').forEach(header => {
        header.setAttribute('colspan', cashflowData.config.period + 2);
    });
}

/**
 * Remplit les données du tableau
 */
function fillTableData() {
    // Récupérer toutes les lignes de recettes et de dépenses
    const incomeRows = document.querySelectorAll('.income-item');
    const expenseRows = document.querySelectorAll('.expense-item');
    
    // Remplir les données des recettes
    incomeRows.forEach(row => {
        const category = row.querySelector('td').textContent;
        fillCategoryData(row, category, 'incomes');
    });
    
    // Remplir les données des dépenses
    expenseRows.forEach(row => {
        const category = row.querySelector('td').textContent;
        fillCategoryData(row, category, 'expenses');
    });
}

/**
 * Remplit les données d'une catégorie spécifique
 */
function fillCategoryData(row, category, type) {
    // Supprimer toutes les cellules de données existantes
    while (row.children.length > 1) {
        row.removeChild(row.lastChild);
    }
    
    // S'assurer que l'objet pour le type (recettes/dépenses) existe
    if (!cashflowData[type][category]) {
        cashflowData[type][category] = {};
    }
    
    // Créer les cellules pour chaque mois
    let total = 0;
    cashflowData.months.forEach(month => {
        const td = document.createElement('td');
        td.classList.add('editable-cell');
        td.dataset.type = type;
        td.dataset.category = category;
        td.dataset.month = month;
        
        // Afficher le montant s'il existe
        const amount = cashflowData[type][category][month] || 0;
        td.textContent = formatCurrency(amount);
        total += parseFloat(amount) || 0;
        
        row.appendChild(td);
    });
    
    // Ajouter la cellule de total
    const totalCell = document.createElement('td');
    totalCell.classList.add('total-column');
    totalCell.textContent = formatCurrency(total);
    row.appendChild(totalCell);
}

/**
 * Calcule les totaux et soldes
 */
function calculateTotalsAndBalances() {
    calculateRowTotals('.income-total', '.income-item');
    calculateRowTotals('.expense-total', '.expense-item');
    calculateMonthlyBalances();
    calculateCumulativeBalances();
    highlightNegativeBalances();
}

/**
 * Calcule les totaux pour une ligne spécifique
 */
function calculateRowTotals(totalRowClass, itemRowSelector) {
    const totalRow = document.querySelector(totalRowClass);
    
    // Supprimer toutes les cellules de données existantes dans la ligne de total
    while (totalRow.children.length > 1) {
        totalRow.removeChild(totalRow.lastChild);
    }
    
    // Calculer les totaux pour chaque mois
    const monthlyTotals = [];
    let grandTotal = 0;
    
    for (let i = 0; i < cashflowData.months.length; i++) {
        let monthTotal = 0;
        
        document.querySelectorAll(itemRowSelector).forEach(row => {
            if (row.children[i + 1]) {
                const value = row.children[i + 1].textContent;
                monthTotal += parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
            }
        });
        
        monthlyTotals.push(monthTotal);
        grandTotal += monthTotal;
        
        // Ajouter la cellule de total mensuel
        const td = document.createElement('td');
        td.textContent = formatCurrency(monthTotal);
        totalRow.appendChild(td);
    }
    
    // Ajouter la cellule de total général
    const totalCell = document.createElement('td');
    totalCell.classList.add('total-column');
    totalCell.textContent = formatCurrency(grandTotal);
    totalRow.appendChild(totalCell);
}

/**
 * Calcule les soldes mensuels
 */
function calculateMonthlyBalances() {
    const monthlyBalanceRow = document.querySelector('.monthly-balance');
    
    // Supprimer toutes les cellules de données existantes
    while (monthlyBalanceRow.children.length > 1) {
        monthlyBalanceRow.removeChild(monthlyBalanceRow.lastChild);
    }
    
    const incomeTotalRow = document.querySelector('.income-total');
    const expenseTotalRow = document.querySelector('.expense-total');
    
    let totalBalance = 0;
    
    // Calculer le solde pour chaque mois
    for (let i = 0; i < cashflowData.months.length; i++) {
        const incomeTotal = parseFloat(incomeTotalRow.children[i + 1].textContent.replace(/[^0-9.-]+/g, '')) || 0;
        const expenseTotal = parseFloat(expenseTotalRow.children[i + 1].textContent.replace(/[^0-9.-]+/g, '')) || 0;
        const balance = incomeTotal - expenseTotal;
        
        totalBalance += balance;
        
        // Ajouter la cellule de solde mensuel
        const td = document.createElement('td');
        td.textContent = formatCurrency(balance);
        monthlyBalanceRow.appendChild(td);
    }
    
    // Ajouter la cellule de solde total
    const totalCell = document.createElement('td');
    totalCell.classList.add('total-column');
    totalCell.textContent = formatCurrency(totalBalance);
    monthlyBalanceRow.appendChild(totalCell);
}

/**
 * Calcule les soldes cumulés
 */
function calculateCumulativeBalances() {
    const cumulativeBalanceRow = document.querySelector('.cumulative-balance');
    
    // Supprimer toutes les cellules de données existantes
    while (cumulativeBalanceRow.children.length > 1) {
        cumulativeBalanceRow.removeChild(cumulativeBalanceRow.lastChild);
    }
    
    const monthlyBalanceRow = document.querySelector('.monthly-balance');
    let cumulativeBalance = 0;
    
    // Calculer le solde cumulé pour chaque mois
    for (let i = 0; i < cashflowData.months.length; i++) {
        const monthlyBalance = parseFloat(monthlyBalanceRow.children[i + 1].textContent.replace(/[^0-9.-]+/g, '')) || 0;
        cumulativeBalance += monthlyBalance;
        
        // Ajouter la cellule de solde cumulé
        const td = document.createElement('td');
        td.textContent = formatCurrency(cumulativeBalance);
        cumulativeBalanceRow.appendChild(td);
    }
    
    // Ajouter la cellule de solde cumulé final
    const totalCell = document.createElement('td');
    totalCell.classList.add('total-column');
    totalCell.textContent = formatCurrency(cumulativeBalance);
    cumulativeBalanceRow.appendChild(totalCell);
}

/**
 * Met en évidence les soldes négatifs
 */
function highlightNegativeBalances() {
    // Mettre en évidence les soldes mensuels négatifs
    document.querySelectorAll('.monthly-balance td:not(:first-child)').forEach(cell => {
        const value = parseFloat(cell.textContent.replace(/[^0-9.-]+/g, '')) || 0;
        if (value < 0) {
            cell.classList.add('negative-balance');
        } else {
            cell.classList.remove('negative-balance');
        }
    });
    
    // Mettre en évidence les soldes cumulés négatifs
    document.querySelectorAll('.cumulative-balance td:not(:first-child)').forEach(cell => {
        const value = parseFloat(cell.textContent.replace(/[^0-9.-]+/g, '')) || 0;
        if (value < 0) {
            cell.classList.add('negative-balance');
            
            // Ajouter un badge d'alerte si c'est un solde cumulé négatif
            if (!cell.querySelector('.alert-badge')) {
                const badge = document.createElement('span');
                badge.className = 'alert-badge';
                badge.textContent = '!';
                cell.appendChild(badge);
            }
        } else {
            cell.classList.remove('negative-balance');
            const badge = cell.querySelector('.alert-badge');
            if (badge) {
                cell.removeChild(badge);
            }
        }
    });
}

/**
 * Édite la valeur d'une cellule
 */
function editCellValue(cell) {
    const currentValue = parseFloat(cell.textContent.replace(/[^0-9.-]+/g, '')) || 0;
    const newValue = prompt('Entrez la nouvelle valeur:', currentValue);
    
    if (newValue !== null && !isNaN(newValue)) {
        cell.textContent = formatCurrency(newValue);
        
        // Mettre à jour les données
        const type = cell.dataset.type;
        const category = cell.dataset.category;
        const month = cell.dataset.month;
        
        updateDataFromCell(type, category, month, newValue);
        
        // Recalculer les totaux et soldes
        calculateTotalsAndBalances();
        
        // Mettre à jour le graphique si visible
        if (document.querySelector('.chart-container').style.display !== 'none') {
            updateChart();
        }
    }
}

/**
 * Met à jour les données à partir d'une cellule éditée
 */
function updateDataFromCell(type, category, month, value) {
    // S'assurer que la structure de données existe
    if (!cashflowData[type]) {
        cashflowData[type] = {};
    }
    
    if (!cashflowData[type][category]) {
        cashflowData[type][category] = {};
    }
    
    // Mettre à jour la valeur
    cashflowData[type][category][month] = parseFloat(value) || 0;
    
    // Enregistrer les données
    saveData();
}

/**
 * Sauvegarde les données de trésorerie
 */
function saveData() {
    try {
        localStorage.setItem('cashflowData', JSON.stringify(cashflowData));
        console.log('Données de trésorerie sauvegardées');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des données de trésorerie:', error);
    }
}

/**
 * Sauvegarde la configuration
 */
function saveConfig() {
    try {
        const configData = {
            config: cashflowData.config
        };
        localStorage.setItem('cashflowConfig', JSON.stringify(configData));
        console.log('Configuration de trésorerie sauvegardée');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de la configuration de trésorerie:', error);
    }
}

/**
 * Initialise le graphique
 */
function initChart() {
    const ctx = document.getElementById('cashflowChart').getContext('2d');
    
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Recettes',
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    data: []
                },
                {
                    label: 'Dépenses',
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    data: []
                },
                {
                    label: 'Solde mensuel',
                    type: 'line',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                    pointBorderColor: '#fff',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    fill: false,
                    data: []
                },
                {
                    label: 'Solde cumulé',
                    type: 'line',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(153, 102, 255, 1)',
                    pointBorderColor: '#fff',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    fill: false,
                    data: []
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: false
                },
                y: {
                    stacked: false,
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Bascule l'affichage du graphique
 */
function toggleChart() {
    const chartContainer = document.querySelector('.chart-container');
    const toggleBtn = document.getElementById('toggleChartBtn');
    
    if (chartContainer.style.display === 'none') {
        chartContainer.style.display = 'block';
        toggleBtn.innerHTML = '<i class="fas fa-table"></i> Masquer graphique';
        updateChart();
    } else {
        chartContainer.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fas fa-chart-line"></i> Afficher graphique';
    }
}

/**
 * Crée le graphique
 */
function createChart() {
    updateChart();
}

/**
 * Met à jour le graphique
 */
function updateChart() {
    if (!chart) return;
    
    const labels = [];
    const incomeData = [];
    const expenseData = [];
    const balanceData = [];
    const cumulativeData = [];
    
    // Extraire les données du tableau pour le graphique
    const incomeTotalRow = document.querySelector('.income-total');
    const expenseTotalRow = document.querySelector('.expense-total');
    const monthlyBalanceRow = document.querySelector('.monthly-balance');
    const cumulativeBalanceRow = document.querySelector('.cumulative-balance');
    
    for (let i = 0; i < cashflowData.months.length; i++) {
        const monthCell = document.querySelector('.cashflow-table thead th:nth-child(' + (i + 2) + ')');
        labels.push(monthCell.textContent);
        
        // Recettes, dépenses et soldes
        const income = parseFloat(incomeTotalRow.children[i + 1].textContent.replace(/[^0-9.-]+/g, '')) || 0;
        const expense = parseFloat(expenseTotalRow.children[i + 1].textContent.replace(/[^0-9.-]+/g, '')) || 0;
        const balance = parseFloat(monthlyBalanceRow.children[i + 1].textContent.replace(/[^0-9.-]+/g, '')) || 0;
        const cumulative = parseFloat(cumulativeBalanceRow.children[i + 1].textContent.replace(/[^0-9.-]+/g, '')) || 0;
        
        incomeData.push(income);
        expenseData.push(expense);
        balanceData.push(balance);
        cumulativeData.push(cumulative);
    }
    
    // Mettre à jour les données du graphique
    chart.data.labels = labels;
    chart.data.datasets[0].data = incomeData;
    chart.data.datasets[1].data = expenseData;
    chart.data.datasets[2].data = balanceData;
    chart.data.datasets[3].data = cumulativeData;
    
    chart.update();
}

/**
 * Ouvre la modale d'ajout d'entrée manuelle
 */
function openManualEntryModal() {
    document.getElementById('manualEntryModal').style.display = 'block';
    updateEntryCategoryOptions();
    updateEntryMonthOptions();
}

/**
 * Met à jour les options de catégorie pour l'entrée manuelle
 */
function updateEntryCategoryOptions() {
    const entryType = document.getElementById('entryType').value;
    const categorySelect = document.getElementById('entryCategory');
    
    // Vider les options existantes
    categorySelect.innerHTML = '';
    
    // Ajouter les catégories en fonction du type
    const categories = entryType === 'income' 
        ? ['Factures clients', 'Prestations de services', 'Subventions', 'Autre recette']
        : ['Achats', 'Charges fixes', 'Salaires', 'Impôts et taxes', 'Autre dépense'];
    
    categories.forEach(category => {
        addOption(categorySelect, category, category);
    });
}

/**
 * Met à jour les options de mois pour l'entrée manuelle
 */
function updateEntryMonthOptions() {
    const monthSelect = document.getElementById('entryMonth');
    
    // Vider les options existantes
    monthSelect.innerHTML = '';
    
    // Ajouter les mois du tableau
    cashflowData.months.forEach(month => {
        const date = new Date(month.substring(0, 4), parseInt(month.substring(5)) - 1, 1);
        addOption(monthSelect, month, formatMonth(date));
    });
}

/**
 * Ajoute une option à un select
 */
function addOption(select, value, text) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    select.appendChild(option);
}

/**
 * Ajoute une entrée manuelle
 */
function addManualEntry() {
    const type = document.getElementById('entryType').value;
    const category = document.getElementById('entryCategory').value;
    const month = document.getElementById('entryMonth').value;
    const amount = parseFloat(document.getElementById('entryAmount').value) || 0;
    const description = document.getElementById('entryDescription').value;
    
    // Mettre à jour les données
    updateDataFromCell(type === 'income' ? 'incomes' : 'expenses', category, month, amount);
    
    // Régénérer le tableau
    generateCashflowTable();
    
    // Fermer la modale
    closeAllModals();
    
    // Message de confirmation
    showNotification(`${type === 'income' ? 'Recette' : 'Dépense'} de ${formatCurrency(amount)} ajoutée avec succès.`, 'success');
}

/**
 * Charge les données automatiques à partir des factures et dépenses
 */
function loadAutomaticData() {
    loadInvoicesData();
    loadProjectsData();
}

/**
 * Charge les données des factures pour les recettes
 */
function loadInvoicesData() {
    try {
        const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        
        if (invoices.length > 0) {
            // Initialiser la catégorie si nécessaire
            if (!cashflowData.incomes['Factures clients']) {
                cashflowData.incomes['Factures clients'] = {};
            }
            
            // Traiter chaque facture
            invoices.forEach(invoice => {
                // Ne prendre en compte que les factures avec statut "En attente" ou "Payée"
                if (invoice.status === 'pending' || invoice.status === 'paid') {
                    // Convertir la date d'échéance en objet Date
                    let dueDate;
                    if (invoice.dueDate) {
                        const [day, month, year] = invoice.dueDate.split('/');
                        dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    } else if (invoice.date) {
                        const [day, month, year] = invoice.date.split('/');
                        dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        // Ajouter 30 jours par défaut si pas de date d'échéance
                        dueDate.setDate(dueDate.getDate() + 30);
                    } else {
                        return; // Ignorer cette facture si pas de date
                    }
                    
                    // Formater la date pour le stockage
                    const monthKey = formatDateForStorage(dueDate);
                    
                    // Vérifier si le mois est dans la période affichée
                    if (cashflowData.months.includes(monthKey)) {
                        // Extraire le montant
                        let amount = 0;
                        if (invoice.totalAmount) {
                            amount = parseFloat(invoice.totalAmount.replace(/[^0-9.-]+/g, '')) || 0;
                        } else if (invoice.items) {
                            amount = invoice.items.reduce((sum, item) => {
                                return sum + (parseFloat(item.amount) || 0) * (parseInt(item.quantity) || 1);
                            }, 0);
                        }
                        
                        // Ajouter ou mettre à jour le montant pour ce mois
                        if (!cashflowData.incomes['Factures clients'][monthKey]) {
                            cashflowData.incomes['Factures clients'][monthKey] = amount;
                        } else {
                            cashflowData.incomes['Factures clients'][monthKey] += amount;
                        }
                    }
                }
            });
            
            // Sauvegarder les données mises à jour
            saveData();
            
            // Régénérer le tableau pour afficher les nouvelles données
            fillTableData();
            calculateTotalsAndBalances();
            
            // Mettre à jour le graphique si visible
            if (document.querySelector('.chart-container').style.display !== 'none') {
                updateChart();
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données des factures:', error);
    }
}

/**
 * Charge les données des projets pour les dépenses
 */
function loadProjectsData() {
    try {
        const projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        
        if (projects.length > 0) {
            // Traiter chaque projet
            projects.forEach(project => {
                // Vérifier si le projet a des dépenses réelles
                if (project.realExpenses && project.realExpenses.length > 0) {
                    project.realExpenses.forEach(expense => {
                        // Convertir la date en objet Date
                        let expenseDate;
                        if (expense.date) {
                            if (typeof expense.date === 'string') {
                                const parts = expense.date.split('-');
                                expenseDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                            } else {
                                expenseDate = new Date(expense.date);
                            }
                        } else {
                            return; // Ignorer cette dépense si pas de date
                        }
                        
                        // Formater la date pour le stockage
                        const monthKey = formatDateForStorage(expenseDate);
                        
                        // Vérifier si le mois est dans la période affichée
                        if (cashflowData.months.includes(monthKey)) {
                            // Déterminer la catégorie de dépense
                            let category = 'Charges fixes';
                            if (expense.category) {
                                if (expense.category.toLowerCase().includes('achats') || 
                                    expense.category.toLowerCase().includes('fourniture')) {
                                    category = 'Achats';
                                } else if (expense.category.toLowerCase().includes('salaire') || 
                                          expense.category.toLowerCase().includes('personnel')) {
                                    category = 'Salaires';
                                } else if (expense.category.toLowerCase().includes('impôt') || 
                                          expense.category.toLowerCase().includes('taxe')) {
                                    category = 'Impôts et taxes';
                                }
                            }
                            
                            // Initialiser la catégorie si nécessaire
                            if (!cashflowData.expenses[category]) {
                                cashflowData.expenses[category] = {};
                            }
                            
                            // Extraire le montant
                            let amount = parseFloat(expense.amount.replace(/[^0-9.-]+/g, '')) || 0;
                            
                            // Ajouter ou mettre à jour le montant pour ce mois
                            if (!cashflowData.expenses[category][monthKey]) {
                                cashflowData.expenses[category][monthKey] = amount;
                            } else {
                                cashflowData.expenses[category][monthKey] += amount;
                            }
                        }
                    });
                }
            });
            
            // Sauvegarder les données mises à jour
            saveData();
            
            // Régénérer le tableau pour afficher les nouvelles données
            fillTableData();
            calculateTotalsAndBalances();
            
            // Mettre à jour le graphique si visible
            if (document.querySelector('.chart-container').style.display !== 'none') {
                updateChart();
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données des projets:', error);
    }
}

/**
 * Ouvre la modale de sélection de factures
 */
function openInvoiceSelectionModal() {
    document.getElementById('invoiceSelectionModal').style.display = 'block';
    loadAvailableInvoices();
}

/**
 * Charge la liste des factures disponibles
 */
function loadAvailableInvoices() {
    const tableBody = document.getElementById('invoiceSelectionTableBody');
    tableBody.innerHTML = '';
    
    try {
        const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        const emptyMessage = document.querySelector('.empty-invoices-message');
        
        if (invoices.length === 0) {
            emptyMessage.style.display = 'block';
            return;
        }
        
        emptyMessage.style.display = 'none';
        
        // Afficher chaque facture dans le tableau
        invoices.forEach(invoice => {
            const row = document.createElement('tr');
            
            // Cellule de sélection (checkbox)
            const selectCell = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.dataset.invoiceId = invoice.id;
            // Présélectionner les factures en attente
            if (invoice.status === 'pending') {
                checkbox.checked = true;
            }
            selectCell.appendChild(checkbox);
            
            // Cellule du numéro de facture
            const numberCell = document.createElement('td');
            numberCell.textContent = invoice.number || '-';
            
            // Cellule du client
            const clientCell = document.createElement('td');
            clientCell.textContent = invoice.client || '-';
            
            // Cellule de la date
            const dateCell = document.createElement('td');
            dateCell.textContent = invoice.date || '-';
            
            // Cellule de la date d'échéance
            const dueDateCell = document.createElement('td');
            dueDateCell.textContent = invoice.dueDate || '-';
            
            // Cellule du montant
            const amountCell = document.createElement('td');
            amountCell.textContent = invoice.totalAmount || '-';
            
            // Cellule du statut
            const statusCell = document.createElement('td');
            let statusText = '-';
            let statusClass = '';
            
            switch (invoice.status) {
                case 'draft':
                    statusText = 'Brouillon';
                    statusClass = 'status-draft';
                    break;
                case 'sent':
                    statusText = 'Envoyée';
                    statusClass = 'status-sent';
                    break;
                case 'pending':
                    statusText = 'En attente';
                    statusClass = 'status-pending';
                    break;
                case 'paid':
                    statusText = 'Payée';
                    statusClass = 'status-paid';
                    break;
                case 'cancelled':
                    statusText = 'Annulée';
                    statusClass = 'status-cancelled';
                    break;
            }
            
            statusCell.textContent = statusText;
            statusCell.classList.add(statusClass);
            
            // Ajouter toutes les cellules à la ligne
            row.appendChild(selectCell);
            row.appendChild(numberCell);
            row.appendChild(clientCell);
            row.appendChild(dateCell);
            row.appendChild(dueDateCell);
            row.appendChild(amountCell);
            row.appendChild(statusCell);
            
            // Ajouter la ligne au tableau
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des factures disponibles:', error);
    }
}

/**
 * Confirme la sélection de factures
 */
function confirmInvoiceSelection() {
    // Réinitialiser les données de factures clients
    cashflowData.incomes['Factures clients'] = {};
    
    // Récupérer toutes les factures sélectionnées
    const selectedInvoices = [];
    document.querySelectorAll('#invoiceSelectionTableBody input[type="checkbox"]:checked').forEach(checkbox => {
        selectedInvoices.push(checkbox.dataset.invoiceId);
    });
    
    try {
        const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        
        // Traiter chaque facture sélectionnée
        invoices.forEach(invoice => {
            if (selectedInvoices.includes(invoice.id)) {
                // Convertir la date d'échéance en objet Date
                let dueDate;
                if (invoice.dueDate) {
                    const [day, month, year] = invoice.dueDate.split('/');
                    dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                } else if (invoice.date) {
                    const [day, month, year] = invoice.date.split('/');
                    dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    // Ajouter 30 jours par défaut si pas de date d'échéance
                    dueDate.setDate(dueDate.getDate() + 30);
                } else {
                    return; // Ignorer cette facture si pas de date
                }
                
                // Formater la date pour le stockage
                const monthKey = formatDateForStorage(dueDate);
                
                // Vérifier si le mois est dans la période affichée
                if (cashflowData.months.includes(monthKey)) {
                    // Extraire le montant
                    let amount = 0;
                    if (invoice.totalAmount) {
                        amount = parseFloat(invoice.totalAmount.replace(/[^0-9.-]+/g, '')) || 0;
                    } else if (invoice.items) {
                        amount = invoice.items.reduce((sum, item) => {
                            return sum + (parseFloat(item.amount) || 0) * (parseInt(item.quantity) || 1);
                        }, 0);
                    }
                    
                    // Ajouter ou mettre à jour le montant pour ce mois
                    if (!cashflowData.incomes['Factures clients'][monthKey]) {
                        cashflowData.incomes['Factures clients'][monthKey] = amount;
                    } else {
                        cashflowData.incomes['Factures clients'][monthKey] += amount;
                    }
                }
            }
        });
        
        // Sauvegarder les données mises à jour
        saveData();
        
        // Régénérer le tableau pour afficher les nouvelles données
        fillTableData();
        calculateTotalsAndBalances();
        
        // Mettre à jour le graphique si visible
        if (document.querySelector('.chart-container').style.display !== 'none') {
            updateChart();
        }
        
        // Fermer la modale
        closeAllModals();
        
        // Message de confirmation
        showNotification('Factures ajoutées au plan de trésorerie avec succès.', 'success');
    } catch (error) {
        console.error('Erreur lors de la confirmation des factures:', error);
    }
}

/**
 * Exporte le plan de trésorerie en PDF
 */
function exportToPdf() {
    // Vérifier que jspdf est chargé
    if (typeof jspdf === 'undefined') {
        showNotification('La bibliothèque PDF n\'est pas chargée. Veuillez rafraîchir la page.', 'error');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape');
        
        // Titre
        doc.setFontSize(20);
        doc.text('Plan de Trésorerie', 14, 20);
        
        // Sous-titre avec la période
        const period = cashflowData.config.period;
        const startDate = new Date(cashflowData.config.startDate);
        const endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + period - 1);
        
        const formattedStartDate = `${startDate.getMonth() + 1}/${startDate.getFullYear()}`;
        const formattedEndDate = `${endDate.getMonth() + 1}/${endDate.getFullYear()}`;
        
        doc.setFontSize(14);
        doc.text(`Période: ${formattedStartDate} - ${formattedEndDate}`, 14, 30);
        
        // Tableau des recettes
        doc.setFontSize(12);
        doc.text('Recettes', 14, 40);
        
        let y = 45;
        const incomeRows = document.querySelectorAll('.income-item');
        incomeRows.forEach((row, index) => {
            const category = row.querySelector('td').textContent;
            doc.setFontSize(10);
            doc.text(category, 14, y);
            
            // Valeurs mensuelles
            for (let i = 0; i < cashflowData.months.length; i++) {
                const value = row.children[i + 1].textContent;
                doc.text(value, 60 + i * 20, y);
            }
            
            y += 6;
        });
        
        // Total des recettes
        y += 2;
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Total Recettes', 14, y);
        
        const incomeTotalRow = document.querySelector('.income-total');
        for (let i = 0; i < cashflowData.months.length; i++) {
            const value = incomeTotalRow.children[i + 1].textContent;
            doc.text(value, 60 + i * 20, y);
        }
        doc.setFont(undefined, 'normal');
        
        // Tableau des dépenses
        y += 10;
        doc.setFontSize(12);
        doc.text('Dépenses', 14, y);
        
        y += 5;
        const expenseRows = document.querySelectorAll('.expense-item');
        expenseRows.forEach((row, index) => {
            const category = row.querySelector('td').textContent;
            doc.setFontSize(10);
            doc.text(category, 14, y);
            
            // Valeurs mensuelles
            for (let i = 0; i < cashflowData.months.length; i++) {
                const value = row.children[i + 1].textContent;
                doc.text(value, 60 + i * 20, y);
            }
            
            y += 6;
        });
        
        // Total des dépenses
        y += 2;
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Total Dépenses', 14, y);
        
        const expenseTotalRow = document.querySelector('.expense-total');
        for (let i = 0; i < cashflowData.months.length; i++) {
            const value = expenseTotalRow.children[i + 1].textContent;
            doc.text(value, 60 + i * 20, y);
        }
        
        // Solde mensuel
        y += 8;
        doc.text('Solde mensuel', 14, y);
        
        const monthlyBalanceRow = document.querySelector('.monthly-balance');
        for (let i = 0; i < cashflowData.months.length; i++) {
            const value = monthlyBalanceRow.children[i + 1].textContent;
            doc.text(value, 60 + i * 20, y);
        }
        
        // Solde cumulé
        y += 6;
        doc.text('Solde cumulé', 14, y);
        
        const cumulativeBalanceRow = document.querySelector('.cumulative-balance');
        for (let i = 0; i < cashflowData.months.length; i++) {
            const value = cumulativeBalanceRow.children[i + 1].textContent;
            doc.text(value, 60 + i * 20, y);
        }
        doc.setFont(undefined, 'normal');
        
        // Pied de page
        y = 180;
        doc.setFontSize(8);
        doc.text('Document généré par MaPocket Pro - ' + new Date().toLocaleDateString(), 14, y);
        
        // Enregistrer le PDF
        doc.save('plan-tresorerie.pdf');
        
        showNotification('Plan de trésorerie exporté en PDF avec succès.', 'success');
    } catch (error) {
        console.error('Erreur lors de l\'export en PDF:', error);
        showNotification('Erreur lors de l\'export en PDF. Veuillez réessayer.', 'error');
    }
}

/**
 * Exporte le plan de trésorerie en Excel
 */
function exportToExcel() {
    // Vérifier que XLSX est chargé
    if (typeof XLSX === 'undefined') {
        showNotification('La bibliothèque Excel n\'est pas chargée. Veuillez rafraîchir la page.', 'error');
        return;
    }
    
    try {
        // Créer un tableau pour l'export
        const data = [];
        
        // En-têtes
        const headers = ['Catégorie'];
        
        // Ajouter les mois
        document.querySelectorAll('.cashflow-table thead th').forEach((th, index) => {
            if (index > 0) { // Ignorer la première colonne (Catégorie)
                headers.push(th.textContent);
            }
        });
        
        data.push(headers);
        
        // Titre pour les recettes
        data.push(['Recettes']);
        
        // Recettes
        document.querySelectorAll('.income-item').forEach(row => {
            const rowData = [];
            row.querySelectorAll('td').forEach(cell => {
                rowData.push(cell.textContent);
            });
            data.push(rowData);
        });
        
        // Total des recettes
        const incomeTotalRow = [];
        document.querySelector('.income-total').querySelectorAll('td').forEach(cell => {
            incomeTotalRow.push(cell.textContent);
        });
        data.push(incomeTotalRow);
        
        // Ligne vide
        data.push([]);
        
        // Titre pour les dépenses
        data.push(['Dépenses']);
        
        // Dépenses
        document.querySelectorAll('.expense-item').forEach(row => {
            const rowData = [];
            row.querySelectorAll('td').forEach(cell => {
                rowData.push(cell.textContent);
            });
            data.push(rowData);
        });
        
        // Total des dépenses
        const expenseTotalRow = [];
        document.querySelector('.expense-total').querySelectorAll('td').forEach(cell => {
            expenseTotalRow.push(cell.textContent);
        });
        data.push(expenseTotalRow);
        
        // Ligne vide
        data.push([]);
        
        // Solde mensuel
        const monthlyBalanceRow = [];
        document.querySelector('.monthly-balance').querySelectorAll('td').forEach(cell => {
            monthlyBalanceRow.push(cell.textContent);
        });
        data.push(monthlyBalanceRow);
        
        // Solde cumulé
        const cumulativeBalanceRow = [];
        document.querySelector('.cumulative-balance').querySelectorAll('td').forEach(cell => {
            cumulativeBalanceRow.push(cell.textContent);
        });
        data.push(cumulativeBalanceRow);
        
        // Créer la feuille de calcul
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        
        // Créer le classeur
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Plan de Trésorerie');
        
        // Enregistrer le fichier Excel
        XLSX.writeFile(workbook, 'plan-tresorerie.xlsx');
        
        showNotification('Plan de trésorerie exporté en Excel avec succès.', 'success');
    } catch (error) {
        console.error('Erreur lors de l\'export en Excel:', error);
        showNotification('Erreur lors de l\'export en Excel. Veuillez réessayer.', 'error');
    }
}

/**
 * Ferme toutes les modales
 */
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

/**
 * Formate une date au format YYYY-MM pour le stockage
 */
function formatDateForStorage(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Formate un mois pour l'affichage
 */
function formatMonth(date) {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Formate un montant en devise
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
}

/**
 * Affiche une notification
 */
function showNotification(message, type = 'info') {
    // Vérifier si la fonction existe dans le script principal
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        // Implémentation de secours si la fonction n'existe pas
        console.log(`Notification (${type}): ${message}`);
        alert(message);
    }
}