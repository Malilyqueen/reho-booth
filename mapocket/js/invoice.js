/**
 * MaPocket Pro - JS Invoice
 * Gestion des factures
 */

let invoiceItems = []; // Tableau des éléments de la facture
let nextInvoiceNumber = ''; // Numéro de la prochaine facture
let editMode = false; // Mode édition (true) ou création (false)
let viewMode = false; // Mode visualisation (true) ou édition (false)
let currentInvoice = null; // Facture en cours d'édition
let fromQuoteMode = false; // Conversion depuis un devis
let sourceQuoteId = null; // ID du devis source

document.addEventListener('DOMContentLoaded', function() {
    console.log('Invoice form initialized');
    
    // Initialisation du formulaire
    initInvoiceForm();
    
    // Gestion des paramètres d'URL
    handleUrlParams();
    
    // Ajout des écouteurs d'événements
    setupEventListeners();
});

/**
 * Initialisation du formulaire de facture
 */
function initInvoiceForm() {
    // Initialisation de la date d'émission avec la date du jour
    const today = new Date();
    document.getElementById('invoiceDate').valueAsDate = today;
    
    // Initialisation de la date d'échéance (date du jour + 30 jours)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    document.getElementById('invoiceDueDate').valueAsDate = dueDate;
    
    // Génération du numéro de facture
    generateInvoiceNumber();
    
    // Ajout d'une première ligne d'élément
    addInvoiceItem();
    
    // Chargement des projets pour le select
    loadProjects();
    
    // Préremplissage des informations légales si disponibles
    loadLegalInfo();
}

/**
 * Génération du numéro de facture
 */
function generateInvoiceNumber() {
    // Récupération de toutes les factures
    const invoices = getInvoicesFromStorage();
    
    // Détermination du prochain numéro de facture
    let maxNumber = 0;
    invoices.forEach(invoice => {
        if (invoice.invoiceNumber) {
            const number = parseInt(invoice.invoiceNumber.replace('FACT-', ''));
            if (!isNaN(number) && number > maxNumber) {
                maxNumber = number;
            }
        }
    });
    
    // Formatage du numéro (FACT-001, FACT-002, etc.)
    nextInvoiceNumber = `FACT-${String(maxNumber + 1).padStart(3, '0')}`;
    document.getElementById('invoiceNumber').value = nextInvoiceNumber;
}

/**
 * Chargement des projets dans le select
 */
function loadProjects() {
    // Récupération des projets depuis le stockage local
    const projects = getProjectsFromStorage();
    
    // Ajout des options au select
    const select = document.getElementById('invoiceProject');
    
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.projectName;
        select.appendChild(option);
    });
}

/**
 * Chargement des informations légales
 */
function loadLegalInfo() {
    // Récupération des informations légales depuis le stockage local
    const legalInfo = getLegalInfoFromStorage();
    
    if (legalInfo) {
        document.getElementById('legalName').value = legalInfo.name || '';
        document.getElementById('legalSiret').value = legalInfo.siret || '';
        document.getElementById('legalAddress').value = legalInfo.address || '';
    }
}

/**
 * Récupère les informations légales depuis le stockage local
 */
function getLegalInfoFromStorage() {
    const legalInfo = localStorage.getItem('mapocket_legal_info');
    return legalInfo ? JSON.parse(legalInfo) : null;
}

/**
 * Sauvegarde les informations légales dans le stockage local
 */
function saveLegalInfoToStorage(legalInfo) {
    localStorage.setItem('mapocket_legal_info', JSON.stringify(legalInfo));
}

/**
 * Récupère les projets depuis le stockage local
 */
function getProjectsFromStorage() {
    const projects = localStorage.getItem('mapocket_projects');
    return projects ? JSON.parse(projects) : [];
}

/**
 * Récupère les factures depuis le stockage local
 */
function getInvoicesFromStorage() {
    const invoices = localStorage.getItem('mapocket_invoices');
    return invoices ? JSON.parse(invoices) : [];
}

/**
 * Récupère les devis depuis le stockage local
 */
function getQuotesFromStorage() {
    const quotes = localStorage.getItem('mapocket_quotes');
    return quotes ? JSON.parse(quotes) : [];
}

/**
 * Sauvegarde les factures dans le stockage local
 */
function saveInvoicesToStorage(invoices) {
    localStorage.setItem('mapocket_invoices', JSON.stringify(invoices));
}

/**
 * Gestion des paramètres d'URL
 */
function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = urlParams.get('id');
    viewMode = urlParams.get('view') === 'true';
    sourceQuoteId = urlParams.get('fromQuote');
    
    if (invoiceId) {
        // Mode édition ou visualisation d'une facture existante
        editMode = true;
        loadInvoice(invoiceId);
    } else if (sourceQuoteId) {
        // Mode création d'une facture à partir d'un devis
        fromQuoteMode = true;
        loadFromQuote(sourceQuoteId);
    }
}

/**
 * Chargement d'une facture existante
 */
function loadInvoice(invoiceId) {
    const invoices = getInvoicesFromStorage();
    currentInvoice = invoices.find(invoice => invoice.id == invoiceId);
    
    if (!currentInvoice) {
        // Facture non trouvée
        alert('La facture demandée n\'existe pas.');
        window.location.href = 'mapocket-pro.html';
        return;
    }
    
    // Remplissage du formulaire avec les données de la facture
    fillInvoiceForm(currentInvoice);
    
    // Si mode visualisation, désactiver les champs
    if (viewMode) {
        disableFormFields();
        document.querySelector('.form-actions').style.display = 'none';
        
        // Afficher un bouton pour éditer la facture
        const header = document.querySelector('.content-header');
        const editButton = document.createElement('button');
        editButton.className = 'btn btn-primary';
        editButton.innerHTML = '<i class="fas fa-edit"></i> Modifier';
        editButton.addEventListener('click', () => {
            window.location.href = `facture.html?id=${invoiceId}`;
        });
        
        header.appendChild(editButton);
    }
}

/**
 * Remplit le formulaire avec les données de la facture
 */
function fillInvoiceForm(invoice) {
    // Informations du client
    document.getElementById('clientName').value = invoice.clientName || '';
    document.getElementById('clientEmail').value = invoice.clientEmail || '';
    document.getElementById('clientPhone').value = invoice.clientPhone || '';
    document.getElementById('clientAddress').value = invoice.clientAddress || '';
    
    // Informations de la facture
    document.getElementById('invoiceId').value = invoice.id;
    document.getElementById('quoteId').value = invoice.quoteId || '';
    document.getElementById('invoiceNumber').value = invoice.invoiceNumber || '';
    document.getElementById('invoiceDate').value = invoice.invoiceDate || '';
    document.getElementById('invoiceDueDate').value = invoice.invoiceDueDate || '';
    document.getElementById('invoiceSubject').value = invoice.invoiceSubject || '';
    document.getElementById('invoiceStatus').value = invoice.status || 'draft';
    
    if (invoice.invoiceProject) {
        document.getElementById('invoiceProject').value = invoice.invoiceProject;
    }
    
    // Options
    document.getElementById('invoiceNotes').value = invoice.invoiceNotes || '';
    document.getElementById('linkToWallet').checked = invoice.linkToWallet || false;
    
    // Informations légales
    document.getElementById('legalName').value = invoice.legalName || '';
    document.getElementById('legalSiret').value = invoice.legalSiret || '';
    document.getElementById('legalAddress').value = invoice.legalAddress || '';
    
    // Éléments de la facture
    document.getElementById('itemsContainer').innerHTML = '';
    invoiceItems = [];
    
    if (invoice.items && invoice.items.length > 0) {
        invoice.items.forEach(item => {
            addInvoiceItem(item);
        });
    } else {
        addInvoiceItem(); // Ajouter au moins une ligne vide
    }
    
    // Calcul des totaux
    calculateTotals();
}

/**
 * Chargement à partir d'un devis
 */
function loadFromQuote(quoteId) {
    const quotes = getQuotesFromStorage();
    const quote = quotes.find(quote => quote.id == quoteId);
    
    if (!quote) {
        // Devis non trouvé
        alert('Le devis demandé n\'existe pas.');
        return;
    }
    
    // Création de la facture à partir du devis
    const invoice = {
        id: Date.now().toString(),
        quoteId: quote.id,
        clientName: quote.clientName,
        clientEmail: quote.clientEmail,
        clientPhone: quote.clientPhone,
        clientAddress: quote.clientAddress,
        
        invoiceSubject: quote.quoteSubject,
        invoiceProject: quote.quoteProject,
        invoiceNotes: quote.quoteNotes,
        linkToWallet: quote.linkToWallet,
        
        items: quote.items,
        totalHT: quote.totalHT,
        totalTVA: quote.totalTVA,
        totalTTC: quote.totalTTC,
        
        status: 'draft'
    };
    
    // Remplissage du formulaire
    fillInvoiceForm(invoice);
    
    // Mise à jour des informations du formulaire
    document.getElementById('quoteId').value = quote.id;
    document.querySelector('.content-header p').textContent = 'Facture créée à partir du devis ' + quote.quoteNumber;
}

/**
 * Désactive tous les champs du formulaire pour le mode visualisation
 */
function disableFormFields() {
    const form = document.getElementById('invoiceForm');
    const inputs = form.querySelectorAll('input, textarea, select, button');
    
    inputs.forEach(input => {
        input.disabled = true;
    });
    
    // Masquer les boutons d'ajout et de suppression d'éléments
    document.getElementById('addItemBtn').style.display = 'none';
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.style.display = 'none';
    });
    
    // Afficher un message en haut du formulaire
    const formHeader = document.createElement('div');
    formHeader.className = 'view-mode-notice';
    formHeader.innerHTML = '<i class="fas fa-eye"></i> Mode visualisation - Le formulaire n\'est pas modifiable';
    form.insertBefore(formHeader, form.firstChild);
}

/**
 * Configuration des écouteurs d'événements
 */
function setupEventListeners() {
    // Soumission du formulaire
    document.getElementById('invoiceForm').addEventListener('submit', handleFormSubmit);
    
    // Bouton d'ajout d'élément
    document.getElementById('addItemBtn').addEventListener('click', () => {
        addInvoiceItem();
    });
    
    // Bouton d'enregistrement comme brouillon
    document.getElementById('saveAsDraftBtn').addEventListener('click', () => {
        saveInvoice('draft');
    });
    
    // Bouton d'aperçu
    document.getElementById('previewInvoiceBtn').addEventListener('click', () => {
        previewInvoice();
    });
    
    // Fermeture de la modal d'aperçu
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('previewModal').style.display = 'none';
        });
    });
    
    // Bouton d'export PDF
    document.getElementById('exportPDFBtn').addEventListener('click', () => {
        exportInvoiceToPDF();
    });
    
    // Bouton de confirmation de paiement
    if (document.getElementById('confirmMarkAsPaidBtn')) {
        document.getElementById('confirmMarkAsPaidBtn').addEventListener('click', markInvoiceAsPaid);
    }
}

/**
 * Gestion de la soumission du formulaire
 */
function handleFormSubmit(event) {
    event.preventDefault();
    saveInvoice('sent');
}

/**
 * Sauvegarde de la facture
 */
function saveInvoice(status) {
    // Récupération des données du formulaire
    const invoiceData = getFormData();
    invoiceData.status = status;
    
    // Validation des données
    if (!validateInvoiceData(invoiceData)) {
        return;
    }
    
    // Sauvegarde des informations légales
    saveLegalInfoToStorage({
        name: invoiceData.legalName,
        siret: invoiceData.legalSiret,
        address: invoiceData.legalAddress
    });
    
    // Récupération des factures existantes
    let invoices = getInvoicesFromStorage();
    
    if (editMode) {
        // Mise à jour d'une facture existante
        const index = invoices.findIndex(invoice => invoice.id == invoiceData.id);
        if (index !== -1) {
            invoices[index] = invoiceData;
        }
    } else {
        // Ajout d'une nouvelle facture
        invoices.push(invoiceData);
        
        // Si provient d'un devis, mettre à jour le statut du devis
        if (fromQuoteMode && sourceQuoteId) {
            updateQuoteStatus(sourceQuoteId, 'accepted');
        }
    }
    
    // Sauvegarde des factures
    saveInvoicesToStorage(invoices);
    
    // Redirection vers la liste des factures
    alert(editMode 
        ? 'La facture a été mise à jour avec succès.'
        : 'La facture a été créée avec succès.');
    
    window.location.href = 'mapocket-pro.html';
}

/**
 * Mise à jour du statut d'un devis
 */
function updateQuoteStatus(quoteId, newStatus) {
    let quotes = getQuotesFromStorage();
    const index = quotes.findIndex(quote => quote.id == quoteId);
    
    if (index !== -1) {
        quotes[index].status = newStatus;
        localStorage.setItem('mapocket_quotes', JSON.stringify(quotes));
    }
}

/**
 * Récupération des données du formulaire
 */
function getFormData() {
    const form = document.getElementById('invoiceForm');
    
    // Récupération des éléments de la facture
    const items = [];
    document.querySelectorAll('.invoice-item').forEach(itemElem => {
        // Ignorer l'en-tête
        if (itemElem.classList.contains('invoice-item-header')) {
            return;
        }
        
        const description = itemElem.querySelector('.item-description')?.value || '';
        const quantity = parseFloat(itemElem.querySelector('.item-quantity')?.value || 0);
        const price = parseFloat(itemElem.querySelector('.item-price')?.value || 0);
        
        if (description || quantity > 0 || price > 0) {
            items.push({
                description,
                quantity,
                price,
                total: quantity * price
            });
        }
    });
    
    // Calcul des totaux
    const totalHT = items.reduce((sum, item) => sum + item.total, 0);
    const totalTVA = totalHT * 0.2; // TVA à 20%
    const totalTTC = totalHT + totalTVA;
    
    // Construction de l'objet facture
    return {
        id: document.getElementById('invoiceId').value || Date.now().toString(),
        quoteId: document.getElementById('quoteId').value || null,
        
        clientName: document.getElementById('clientName').value,
        clientEmail: document.getElementById('clientEmail').value,
        clientPhone: document.getElementById('clientPhone').value,
        clientAddress: document.getElementById('clientAddress').value,
        
        invoiceNumber: document.getElementById('invoiceNumber').value,
        invoiceDate: document.getElementById('invoiceDate').value,
        invoiceDueDate: document.getElementById('invoiceDueDate').value,
        invoiceSubject: document.getElementById('invoiceSubject').value,
        invoiceProject: document.getElementById('invoiceProject').value,
        
        invoiceNotes: document.getElementById('invoiceNotes').value,
        linkToWallet: document.getElementById('linkToWallet').checked,
        
        legalName: document.getElementById('legalName').value,
        legalSiret: document.getElementById('legalSiret').value,
        legalAddress: document.getElementById('legalAddress').value,
        
        items,
        totalHT,
        totalTVA,
        totalTTC,
        
        createdAt: new Date().toISOString()
    };
}

/**
 * Validation des données de la facture
 */
function validateInvoiceData(invoiceData) {
    if (!invoiceData.clientName) {
        alert('Veuillez indiquer le nom du client.');
        return false;
    }
    
    if (!invoiceData.invoiceSubject) {
        alert('Veuillez indiquer l\'objet de la facture.');
        return false;
    }
    
    if (!invoiceData.invoiceDate) {
        alert('Veuillez indiquer la date d\'émission de la facture.');
        return false;
    }
    
    if (!invoiceData.invoiceDueDate) {
        alert('Veuillez indiquer la date d\'échéance de la facture.');
        return false;
    }
    
    if (invoiceData.items.length === 0) {
        alert('Veuillez ajouter au moins un élément à la facture.');
        return false;
    }
    
    if (!invoiceData.legalName) {
        alert('Veuillez indiquer votre nom / raison sociale dans les mentions légales.');
        return false;
    }
    
    if (!invoiceData.legalSiret) {
        alert('Veuillez indiquer votre SIRET dans les mentions légales.');
        return false;
    }
    
    if (!invoiceData.legalAddress) {
        alert('Veuillez indiquer votre adresse dans les mentions légales.');
        return false;
    }
    
    return true;
}

/**
 * Ajout d'un élément à la facture
 */
function addInvoiceItem(itemData = null) {
    const itemsContainer = document.getElementById('itemsContainer');
    const template = document.getElementById('itemTemplate');
    const clone = template.content.cloneNode(true);
    
    // Si on a des données d'élément, les utiliser
    if (itemData) {
        clone.querySelector('.item-description').value = itemData.description || '';
        clone.querySelector('.item-quantity').value = itemData.quantity || 1;
        clone.querySelector('.item-price').value = itemData.price || 0;
        
        const total = parseFloat(itemData.quantity || 1) * parseFloat(itemData.price || 0);
        clone.querySelector('.item-total').textContent = formatCurrency(total);
    }
    
    // Ajout des écouteurs d'événements pour les calculs
    const itemElement = clone.querySelector('.invoice-item');
    
    itemElement.querySelector('.item-quantity').addEventListener('input', updateItemTotal);
    itemElement.querySelector('.item-price').addEventListener('input', updateItemTotal);
    
    // Bouton de suppression
    itemElement.querySelector('.remove-item-btn').addEventListener('click', function() {
        itemsContainer.removeChild(itemElement);
        calculateTotals();
    });
    
    // Ajout de l'élément au conteneur
    itemsContainer.appendChild(clone);
    
    // Ajout de l'élément au tableau invoiceItems
    invoiceItems.push({
        description: itemData?.description || '',
        quantity: itemData?.quantity || 1,
        price: itemData?.price || 0,
        total: itemData?.total || 0
    });
    
    // Calcul des totaux
    calculateTotals();
}

/**
 * Mise à jour du total d'un élément
 */
function updateItemTotal(event) {
    const itemElement = event.target.closest('.invoice-item');
    const quantity = parseFloat(itemElement.querySelector('.item-quantity').value || 0);
    const price = parseFloat(itemElement.querySelector('.item-price').value || 0);
    const total = quantity * price;
    
    itemElement.querySelector('.item-total').textContent = formatCurrency(total);
    
    // Recalcul des totaux
    calculateTotals();
}

/**
 * Calcul des totaux
 */
function calculateTotals() {
    let totalHT = 0;
    
    // Calcul du total HT
    document.querySelectorAll('.invoice-item').forEach(itemElem => {
        // Ignorer l'en-tête
        if (itemElem.classList.contains('invoice-item-header')) {
            return;
        }
        
        const quantity = parseFloat(itemElem.querySelector('.item-quantity')?.value || 0);
        const price = parseFloat(itemElem.querySelector('.item-price')?.value || 0);
        totalHT += quantity * price;
    });
    
    // Calcul de la TVA et du total TTC
    const totalTVA = totalHT * 0.2; // TVA à 20%
    const totalTTC = totalHT + totalTVA;
    
    // Mise à jour des éléments HTML
    document.getElementById('totalHT').textContent = formatCurrency(totalHT);
    document.getElementById('totalTVA').textContent = formatCurrency(totalTVA);
    document.getElementById('totalTTC').textContent = formatCurrency(totalTTC);
}

/**
 * Aperçu de la facture
 */
function previewInvoice() {
    // Récupération des données de la facture
    const invoiceData = getFormData();
    
    // Génération du contenu HTML de la facture
    const previewContent = generateInvoiceHTML(invoiceData);
    
    // Affichage dans la modal
    document.getElementById('previewContent').innerHTML = previewContent;
    document.getElementById('previewModal').style.display = 'block';
}

/**
 * Génération du HTML pour l'aperçu de la facture
 */
function generateInvoiceHTML(invoiceData) {
    // Formatage des dates
    const invoiceDate = formatDate(invoiceData.invoiceDate);
    const dueDate = formatDate(invoiceData.invoiceDueDate);
    
    // Génération des lignes de items
    let itemsHTML = '';
    invoiceData.items.forEach(item => {
        itemsHTML += `
            <tr>
                <td>${item.description}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${formatCurrency(item.price)}</td>
                <td class="text-right">${formatCurrency(item.total)}</td>
            </tr>
        `;
    });
    
    // Détermination du statut
    let statusText = '';
    let statusClass = '';
    switch (invoiceData.status) {
        case 'draft': statusText = 'BROUILLON'; statusClass = 'status-draft'; break;
        case 'sent': statusText = 'ÉMISE'; statusClass = 'status-sent'; break;
        case 'paid': statusText = 'PAYÉE'; statusClass = 'status-paid'; break;
        case 'overdue': statusText = 'EN RETARD'; statusClass = 'status-overdue'; break;
        default: statusText = 'BROUILLON'; statusClass = 'status-draft';
    }
    
    // HTML complet de la facture
    return `
        <div class="invoice-preview">
            <div class="invoice-header">
                <div class="invoice-title">
                    <h2>FACTURE <span class="${statusClass}">${statusText}</span></h2>
                    <div class="invoice-ref">
                        <p>N° : ${invoiceData.invoiceNumber}</p>
                        <p>Date : ${invoiceDate}</p>
                        <p>Échéance : ${dueDate}</p>
                    </div>
                </div>
                
                <div class="invoice-parties">
                    <div class="invoice-provider">
                        <h4>Émetteur</h4>
                        <p>${invoiceData.legalName}</p>
                        <p>${invoiceData.legalAddress}</p>
                        <p>SIRET : ${invoiceData.legalSiret}</p>
                    </div>
                    
                    <div class="invoice-client">
                        <h4>Client</h4>
                        <p>${invoiceData.clientName}</p>
                        ${invoiceData.clientAddress ? `<p>${invoiceData.clientAddress}</p>` : ''}
                        ${invoiceData.clientEmail ? `<p>Email: ${invoiceData.clientEmail}</p>` : ''}
                        ${invoiceData.clientPhone ? `<p>Téléphone: ${invoiceData.clientPhone}</p>` : ''}
                    </div>
                </div>
            </div>
            
            <div class="invoice-subject">
                <h3>Objet : ${invoiceData.invoiceSubject}</h3>
            </div>
            
            <div class="invoice-items">
                <table>
                    <thead>
                        <tr>
                            <th>Désignation</th>
                            <th class="text-center">Quantité</th>
                            <th class="text-right">Prix unitaire</th>
                            <th class="text-right">Total HT</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" class="text-right">Total HT</td>
                            <td class="text-right">${formatCurrency(invoiceData.totalHT)}</td>
                        </tr>
                        <tr>
                            <td colspan="3" class="text-right">TVA (20%)</td>
                            <td class="text-right">${formatCurrency(invoiceData.totalTVA)}</td>
                        </tr>
                        <tr class="total-row">
                            <td colspan="3" class="text-right">Total TTC</td>
                            <td class="text-right">${formatCurrency(invoiceData.totalTTC)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            ${invoiceData.invoiceNotes ? `
            <div class="invoice-notes">
                <h4>Conditions et notes</h4>
                <p>${invoiceData.invoiceNotes}</p>
            </div>
            ` : ''}
            
            <div class="invoice-footer">
                <div class="legal-mentions">
                    <p>En cas de retard de paiement, des pénalités seront exigibles sans qu'un rappel soit nécessaire (taux d'intérêt légal en vigueur). Une indemnité forfaitaire de 40€ pour frais de recouvrement sera due.</p>
                    <p>TVA non applicable, art. 293 B du CGI.</p>
                    <p>Dispensé d'immatriculation au registre du commerce et des sociétés (RCS) et au répertoire des métiers (RM).</p>
                </div>
            </div>
        </div>
    `;
}

/**
 * Export de la facture en PDF
 */
function exportInvoiceToPDF() {
    alert('Fonctionnalité d\'export en PDF à venir.');
    // Dans une implémentation réelle, nous utiliserions une bibliothèque comme jsPDF
}

/**
 * Marquer une facture comme payée
 */
function markInvoiceAsPaid() {
    // Récupération des données
    const invoiceId = document.getElementById('invoiceId').value;
    const paymentDate = document.getElementById('paymentDate').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const addToWallet = document.getElementById('addToWallet').checked;
    
    // Vérification des données
    if (!paymentDate) {
        alert('Veuillez indiquer la date de paiement.');
        return;
    }
    
    // Récupération de la facture
    let invoices = getInvoicesFromStorage();
    const index = invoices.findIndex(invoice => invoice.id == invoiceId);
    
    if (index === -1) {
        alert('Facture introuvable.');
        return;
    }
    
    // Mise à jour de la facture
    invoices[index].status = 'paid';
    invoices[index].paymentDate = paymentDate;
    invoices[index].paymentMethod = paymentMethod;
    
    // Sauvegarde des factures
    saveInvoicesToStorage(invoices);
    
    // Ajout du montant dans le portefeuille si demandé
    if (addToWallet) {
        addInvoiceAmountToWallet(invoices[index]);
    }
    
    // Fermeture de la modal et redirection
    document.getElementById('markAsPaidModal').style.display = 'none';
    
    alert('La facture a été marquée comme payée.');
    window.location.href = 'mapocket-pro.html';
}

/**
 * Ajout du montant de la facture dans le portefeuille
 */
function addInvoiceAmountToWallet(invoice) {
    // Récupération du portefeuille pro
    let wallets = getWalletsFromStorage();
    let proWallet = wallets.find(wallet => wallet.type === 'pro');
    
    // Si le portefeuille pro n'existe pas, le créer
    if (!proWallet) {
        proWallet = {
            id: Date.now().toString(),
            name: 'Portefeuille professionnel',
            type: 'pro',
            balance: 0,
            transactions: []
        };
        wallets.push(proWallet);
    }
    
    // Ajout de la transaction
    proWallet.transactions.push({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        type: 'income',
        category: 'Facture',
        description: `Paiement facture ${invoice.invoiceNumber} - ${invoice.clientName}`,
        amount: invoice.totalTTC,
        relatedId: invoice.id
    });
    
    // Mise à jour du solde
    proWallet.balance += invoice.totalTTC;
    
    // Sauvegarde du portefeuille
    saveWalletsToStorage(wallets);
}

/**
 * Récupère les portefeuilles depuis le stockage local
 */
function getWalletsFromStorage() {
    const wallets = localStorage.getItem('mapocket_wallets');
    return wallets ? JSON.parse(wallets) : [];
}

/**
 * Sauvegarde les portefeuilles dans le stockage local
 */
function saveWalletsToStorage(wallets) {
    localStorage.setItem('mapocket_wallets', JSON.stringify(wallets));
}

/**
 * Formate un montant en euros
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount || 0);
}

/**
 * Formate une date au format français
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}