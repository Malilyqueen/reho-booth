/**
 * MaPocket Pro - JS Quote
 * Gestion des devis
 */

let quoteItems = []; // Tableau des éléments du devis
let nextQuoteNumber = ''; // Numéro du prochain devis
let editMode = false; // Mode édition (true) ou création (false)
let viewMode = false; // Mode visualisation (true) ou édition (false)
let currentQuote = null; // Devis en cours d'édition

document.addEventListener('DOMContentLoaded', function() {
    console.log('Quote form initialized');
    
    // Initialisation du formulaire
    initQuoteForm();
    
    // Gestion des paramètres d'URL
    handleUrlParams();
    
    // Ajout des écouteurs d'événements
    setupEventListeners();
});

/**
 * Initialisation du formulaire de devis
 */
function initQuoteForm() {
    // Initialisation de la date d'émission avec la date du jour
    const today = new Date();
    document.getElementById('quoteDate').valueAsDate = today;
    
    // Initialisation de la date de validité (date du jour + 30 jours)
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);
    document.getElementById('quoteValidUntil').valueAsDate = validUntil;
    
    // Génération du numéro de devis
    generateQuoteNumber();
    
    // Ajout d'une première ligne d'élément
    addQuoteItem();
    
    // Chargement des projets pour le select
    loadProjects();
}

/**
 * Génération du numéro de devis
 */
function generateQuoteNumber() {
    // Récupération de tous les devis
    const quotes = getQuotesFromStorage();
    
    // Détermination du prochain numéro de devis
    let maxNumber = 0;
    quotes.forEach(quote => {
        if (quote.quoteNumber) {
            const number = parseInt(quote.quoteNumber.replace('DEV-', ''));
            if (!isNaN(number) && number > maxNumber) {
                maxNumber = number;
            }
        }
    });
    
    // Formatage du numéro (DEV-001, DEV-002, etc.)
    nextQuoteNumber = `DEV-${String(maxNumber + 1).padStart(3, '0')}`;
    document.getElementById('quoteNumber').value = nextQuoteNumber;
}

/**
 * Chargement des projets dans le select
 */
function loadProjects() {
    // Récupération des projets depuis le stockage local
    const projects = getProjectsFromStorage();
    
    // Ajout des options au select
    const select = document.getElementById('quoteProject');
    
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.projectName;
        select.appendChild(option);
    });
}

/**
 * Récupère les projets depuis le stockage local
 */
function getProjectsFromStorage() {
    const projects = localStorage.getItem('mapocket_projects');
    return projects ? JSON.parse(projects) : [];
}

/**
 * Récupère les devis depuis le stockage local
 */
function getQuotesFromStorage() {
    const quotes = localStorage.getItem('mapocket_quotes');
    return quotes ? JSON.parse(quotes) : [];
}

/**
 * Sauvegarde les devis dans le stockage local
 */
function saveQuotesToStorage(quotes) {
    localStorage.setItem('mapocket_quotes', JSON.stringify(quotes));
}

/**
 * Gestion des paramètres d'URL
 */
function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const quoteId = urlParams.get('id');
    viewMode = urlParams.get('view') === 'true';
    
    if (quoteId) {
        // Mode édition ou visualisation d'un devis existant
        editMode = true;
        loadQuote(quoteId);
    }
}

/**
 * Chargement d'un devis existant
 */
function loadQuote(quoteId) {
    const quotes = getQuotesFromStorage();
    currentQuote = quotes.find(quote => quote.id == quoteId);
    
    if (!currentQuote) {
        // Devis non trouvé
        alert('Le devis demandé n\'existe pas.');
        window.location.href = 'mapocket-pro.html';
        return;
    }
    
    // Remplissage du formulaire avec les données du devis
    fillQuoteForm(currentQuote);
    
    // Si mode visualisation, désactiver les champs
    if (viewMode) {
        disableFormFields();
        document.querySelector('.form-actions').style.display = 'none';
        
        // Afficher un bouton pour éditer le devis
        const header = document.querySelector('.content-header');
        const editButton = document.createElement('button');
        editButton.className = 'btn btn-primary';
        editButton.innerHTML = '<i class="fas fa-edit"></i> Modifier';
        editButton.addEventListener('click', () => {
            window.location.href = `devis.html?id=${quoteId}`;
        });
        
        header.appendChild(editButton);
    }
}

/**
 * Remplit le formulaire avec les données du devis
 */
function fillQuoteForm(quote) {
    // Informations du client
    document.getElementById('clientName').value = quote.clientName || '';
    document.getElementById('clientEmail').value = quote.clientEmail || '';
    document.getElementById('clientPhone').value = quote.clientPhone || '';
    document.getElementById('clientAddress').value = quote.clientAddress || '';
    
    // Informations du devis
    document.getElementById('quoteId').value = quote.id;
    document.getElementById('quoteNumber').value = quote.quoteNumber || '';
    document.getElementById('quoteDate').value = quote.quoteDate || '';
    document.getElementById('quoteValidUntil').value = quote.quoteValidUntil || '';
    document.getElementById('quoteSubject').value = quote.quoteSubject || '';
    
    if (quote.quoteProject) {
        document.getElementById('quoteProject').value = quote.quoteProject;
    }
    
    // Options
    document.getElementById('quoteNotes').value = quote.quoteNotes || '';
    document.getElementById('linkToWallet').checked = quote.linkToWallet || false;
    
    // Éléments du devis
    document.getElementById('itemsContainer').innerHTML = '';
    quoteItems = [];
    
    if (quote.items && quote.items.length > 0) {
        quote.items.forEach(item => {
            addQuoteItem(item);
        });
    } else {
        addQuoteItem(); // Ajouter au moins une ligne vide
    }
    
    // Calcul des totaux
    calculateTotals();
}

/**
 * Désactive tous les champs du formulaire pour le mode visualisation
 */
function disableFormFields() {
    const form = document.getElementById('quoteForm');
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
    document.getElementById('quoteForm').addEventListener('submit', handleFormSubmit);
    
    // Bouton d'ajout d'élément
    document.getElementById('addItemBtn').addEventListener('click', () => {
        addQuoteItem();
    });
    
    // Bouton d'enregistrement comme brouillon
    document.getElementById('saveAsDraftBtn').addEventListener('click', () => {
        saveQuote('draft');
    });
    
    // Bouton d'aperçu
    document.getElementById('previewQuoteBtn').addEventListener('click', () => {
        previewQuote();
    });
    
    // Fermeture de la modal d'aperçu
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('previewModal').style.display = 'none';
        });
    });
    
    // Bouton d'export PDF
    document.getElementById('exportPDFBtn').addEventListener('click', () => {
        exportQuoteToPDF();
    });
}

/**
 * Gestion de la soumission du formulaire
 */
function handleFormSubmit(event) {
    event.preventDefault();
    saveQuote('sent');
}

/**
 * Sauvegarde du devis
 */
function saveQuote(status) {
    // Récupération des données du formulaire
    const quoteData = getFormData();
    quoteData.status = status;
    
    // Validation des données
    if (!validateQuoteData(quoteData)) {
        return;
    }
    
    // Récupération des devis existants
    let quotes = getQuotesFromStorage();
    
    if (editMode) {
        // Mise à jour d'un devis existant
        const index = quotes.findIndex(quote => quote.id == quoteData.id);
        if (index !== -1) {
            quotes[index] = quoteData;
        }
    } else {
        // Ajout d'un nouveau devis
        quotes.push(quoteData);
    }
    
    // Sauvegarde des devis
    saveQuotesToStorage(quotes);
    
    // Redirection vers la liste des devis
    alert(editMode 
        ? 'Le devis a été mis à jour avec succès.'
        : 'Le devis a été créé avec succès.');
    
    window.location.href = 'mapocket-pro.html';
}

/**
 * Récupération des données du formulaire
 */
function getFormData() {
    const form = document.getElementById('quoteForm');
    
    // Récupération des éléments du devis
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
    
    // Construction de l'objet devis
    return {
        id: document.getElementById('quoteId').value || Date.now().toString(),
        clientName: document.getElementById('clientName').value,
        clientEmail: document.getElementById('clientEmail').value,
        clientPhone: document.getElementById('clientPhone').value,
        clientAddress: document.getElementById('clientAddress').value,
        
        quoteNumber: document.getElementById('quoteNumber').value,
        quoteDate: document.getElementById('quoteDate').value,
        quoteValidUntil: document.getElementById('quoteValidUntil').value,
        quoteSubject: document.getElementById('quoteSubject').value,
        quoteProject: document.getElementById('quoteProject').value,
        
        quoteNotes: document.getElementById('quoteNotes').value,
        linkToWallet: document.getElementById('linkToWallet').checked,
        
        items,
        totalHT,
        totalTVA,
        totalTTC,
        
        createdAt: new Date().toISOString()
    };
}

/**
 * Validation des données du devis
 */
function validateQuoteData(quoteData) {
    if (!quoteData.clientName) {
        alert('Veuillez indiquer le nom du client.');
        return false;
    }
    
    if (!quoteData.quoteSubject) {
        alert('Veuillez indiquer l\'objet du devis.');
        return false;
    }
    
    if (!quoteData.quoteDate) {
        alert('Veuillez indiquer la date d\'émission du devis.');
        return false;
    }
    
    if (!quoteData.quoteValidUntil) {
        alert('Veuillez indiquer la date de validité du devis.');
        return false;
    }
    
    if (quoteData.items.length === 0) {
        alert('Veuillez ajouter au moins un élément au devis.');
        return false;
    }
    
    return true;
}

/**
 * Ajout d'un élément au devis
 */
function addQuoteItem(itemData = null) {
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
    
    // Ajout de l'élément au tableau quoteItems
    quoteItems.push({
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
 * Aperçu du devis
 */
function previewQuote() {
    // Récupération des données du devis
    const quoteData = getFormData();
    
    // Génération du contenu HTML du devis
    const previewContent = generateQuoteHTML(quoteData);
    
    // Affichage dans la modal
    document.getElementById('previewContent').innerHTML = previewContent;
    document.getElementById('previewModal').style.display = 'block';
}

/**
 * Génération du HTML pour l'aperçu du devis
 */
function generateQuoteHTML(quoteData) {
    // Formatage des dates
    const quoteDate = formatDate(quoteData.quoteDate);
    const validUntil = formatDate(quoteData.quoteValidUntil);
    
    // Génération des lignes de items
    let itemsHTML = '';
    quoteData.items.forEach(item => {
        itemsHTML += `
            <tr>
                <td>${item.description}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${formatCurrency(item.price)}</td>
                <td class="text-right">${formatCurrency(item.total)}</td>
            </tr>
        `;
    });
    
    // HTML complet du devis
    return `
        <div class="quote-preview">
            <div class="quote-header">
                <div class="quote-title">
                    <h2>DEVIS</h2>
                    <div class="quote-ref">
                        <p>Référence : ${quoteData.quoteNumber}</p>
                        <p>Date : ${quoteDate}</p>
                        <p>Validité : ${validUntil}</p>
                    </div>
                </div>
                
                <div class="quote-parties">
                    <div class="quote-provider">
                        <h4>Émetteur</h4>
                        <p>Votre Nom / Entreprise</p>
                        <p>Votre Adresse</p>
                        <p>Email: votre.email@example.com</p>
                        <p>Téléphone: +33 1 23 45 67 89</p>
                    </div>
                    
                    <div class="quote-client">
                        <h4>Client</h4>
                        <p>${quoteData.clientName}</p>
                        ${quoteData.clientAddress ? `<p>${quoteData.clientAddress}</p>` : ''}
                        ${quoteData.clientEmail ? `<p>Email: ${quoteData.clientEmail}</p>` : ''}
                        ${quoteData.clientPhone ? `<p>Téléphone: ${quoteData.clientPhone}</p>` : ''}
                    </div>
                </div>
            </div>
            
            <div class="quote-subject">
                <h3>Objet : ${quoteData.quoteSubject}</h3>
            </div>
            
            <div class="quote-items">
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
                            <td class="text-right">${formatCurrency(quoteData.totalHT)}</td>
                        </tr>
                        <tr>
                            <td colspan="3" class="text-right">TVA (20%)</td>
                            <td class="text-right">${formatCurrency(quoteData.totalTVA)}</td>
                        </tr>
                        <tr class="total-row">
                            <td colspan="3" class="text-right">Total TTC</td>
                            <td class="text-right">${formatCurrency(quoteData.totalTTC)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            ${quoteData.quoteNotes ? `
            <div class="quote-notes">
                <h4>Conditions et notes</h4>
                <p>${quoteData.quoteNotes}</p>
            </div>
            ` : ''}
            
            <div class="quote-footer">
                <p>Ce devis est valable jusqu'au ${validUntil}</p>
                <p>Pour accepter ce devis, veuillez le retourner signé avec la mention "Bon pour accord"</p>
            </div>
        </div>
    `;
}

/**
 * Export du devis en PDF
 */
function exportQuoteToPDF() {
    alert('Fonctionnalité d\'export en PDF à venir.');
    // Dans une implémentation réelle, nous utiliserions une bibliothèque comme jsPDF
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