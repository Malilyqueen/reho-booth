// Script pour améliorer l'affichage récapitulatif des projets dans la page projet.html
// Ce script rend la fiche récap plus claire et professionnelle

document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si nous sommes sur la page projet.html (récapitulatif)
    const isProjectSummaryPage = window.location.pathname.includes('projet.html');
    if (!isProjectSummaryPage) return;
    
    // Chercher l'identifiant du projet dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    
    if (projectId) {
        console.log('Amélioration du récapitulatif pour le projet:', projectId);
        enhanceProjectSummary(projectId);
    }
});

// Améliore l'affichage du résumé de projet
function enhanceProjectSummary(projectId) {
    // Récupérer les données du projet
    const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    const project = savedProjects.find(p => p.id === projectId);
    
    if (!project) {
        console.error('Projet non trouvé:', projectId);
        return;
    }
    
    // Récupérer le conteneur du résumé du projet
    const summaryContainer = document.querySelector('.project-summary') || document.querySelector('.project-details');
    if (!summaryContainer) {
        console.error('Conteneur de résumé de projet non trouvé');
        return;
    }
    
    // Créer une fiche récapitulative professionnelle
    createProfessionalRecap(summaryContainer, project);
}

// Crée une fiche récapitulative professionnelle
function createProfessionalRecap(container, project) {
    // Vider le conteneur existant
    container.innerHTML = '';
    
    // En-tête du projet
    const header = document.createElement('div');
    header.className = 'project-header';
    header.innerHTML = `
        <h1 class="project-title">${project.projectName || 'Sans titre'}</h1>
        <div class="project-metadata">
            <div class="date-info">
                <span><i class="fas fa-calendar-alt"></i> ${formatDate(project.projectDate)}</span>
                ${project.projectEndDate ? `<span><i class="fas fa-calendar-check"></i> ${formatDate(project.projectEndDate)}</span>` : ''}
            </div>
            <div class="template-info">
                <span><i class="fas fa-tag"></i> ${project.template || 'Personnalisé'}</span>
            </div>
        </div>
    `;
    header.style.marginBottom = '25px';
    container.appendChild(header);
    
    // Résumé financier
    const financialSummary = document.createElement('div');
    financialSummary.className = 'financial-summary';
    
    // Extraire le symbole de devise (€, $, etc.)
    const currencySymbol = extractCurrencySymbol(project.totalBudget) || '€';
    
    // Budget total en format numérique pour les calculs
    const totalBudget = parseMonetaryValue(project.totalBudget);
    
    // Calculer les dépenses réelles si disponibles
    let realExpenses = 0;
    if (project.realExpenses) {
        realExpenses = parseMonetaryValue(project.realExpenses);
    } else {
        // Sinon, considérer 30% dépensé par défaut pour la démonstration
        realExpenses = totalBudget * 0.3;
    }
    
    // Budget restant
    const remainingBudget = totalBudget - realExpenses;
    
    // Pourcentage d'avancement
    const progressPercentage = totalBudget > 0 ? Math.round((realExpenses / totalBudget) * 100) : 0;
    
    financialSummary.innerHTML = `
        <div class="financial-metrics">
            <div class="metric total-budget">
                <span class="metric-label">Budget total</span>
                <span class="metric-value">${formatMoney(totalBudget, currencySymbol)}</span>
            </div>
            <div class="metric used-budget">
                <span class="metric-label">Dépensé</span>
                <span class="metric-value">${formatMoney(realExpenses, currencySymbol)}</span>
            </div>
            <div class="metric remaining-budget">
                <span class="metric-label">Restant</span>
                <span class="metric-value">${formatMoney(remainingBudget, currencySymbol)}</span>
            </div>
        </div>
        
        <div class="progress-container">
            <div class="progress-label">Avancement: ${progressPercentage}%</div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${progressPercentage}%"></div>
            </div>
        </div>
    `;
    
    // Styles pour le résumé financier
    financialSummary.style.backgroundColor = '#f8f9fa';
    financialSummary.style.padding = '20px';
    financialSummary.style.borderRadius = '8px';
    financialSummary.style.marginBottom = '30px';
    
    // Styles pour les métriques financières
    const metrics = financialSummary.querySelector('.financial-metrics');
    if (metrics) {
        metrics.style.display = 'flex';
        metrics.style.justifyContent = 'space-between';
        metrics.style.marginBottom = '20px';
    }
    
    // Styles pour chaque métrique
    const metricElements = financialSummary.querySelectorAll('.metric');
    metricElements.forEach(metric => {
        metric.style.display = 'flex';
        metric.style.flexDirection = 'column';
        metric.style.alignItems = 'center';
        metric.style.flex = '1';
    });
    
    // Styles pour les étiquettes de métrique
    const labels = financialSummary.querySelectorAll('.metric-label');
    labels.forEach(label => {
        label.style.fontSize = '14px';
        label.style.color = '#6c757d';
        label.style.marginBottom = '5px';
    });
    
    // Styles pour les valeurs de métrique
    const values = financialSummary.querySelectorAll('.metric-value');
    values.forEach(value => {
        value.style.fontSize = '22px';
        value.style.fontWeight = 'bold';
    });
    
    // Style spécifique pour le budget restant
    const remainingValue = financialSummary.querySelector('.remaining-budget .metric-value');
    if (remainingValue) {
        remainingValue.style.color = remainingBudget >= 0 ? '#28a745' : '#dc3545';
    }
    
    // Styles pour la barre de progression
    const progressContainer = financialSummary.querySelector('.progress-container');
    if (progressContainer) {
        progressContainer.style.marginTop = '10px';
    }
    
    const progressLabel = financialSummary.querySelector('.progress-label');
    if (progressLabel) {
        progressLabel.style.marginBottom = '5px';
        progressLabel.style.fontSize = '14px';
    }
    
    const progressBarContainer = financialSummary.querySelector('.progress-bar-container');
    if (progressBarContainer) {
        progressBarContainer.style.height = '10px';
        progressBarContainer.style.backgroundColor = '#e9ecef';
        progressBarContainer.style.borderRadius = '5px';
        progressBarContainer.style.overflow = 'hidden';
    }
    
    const progressBar = financialSummary.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.height = '100%';
        progressBar.style.backgroundColor = progressPercentage > 90 ? '#dc3545' : progressPercentage > 75 ? '#ffc107' : '#28a745';
        progressBar.style.transition = 'width 0.3s ease';
    }
    
    container.appendChild(financialSummary);
    
    // Détail des catégories de dépenses
    const categoriesContainer = document.createElement('div');
    categoriesContainer.className = 'expense-categories-recap';
    categoriesContainer.innerHTML = `<h2>Détail des postes de dépenses</h2>`;
    
    // Styles pour le conteneur des catégories
    categoriesContainer.style.marginBottom = '30px';
    
    // Ajouter chaque catégorie
    if (project.categories && project.categories.length > 0) {
        const categoriesList = document.createElement('div');
        categoriesList.className = 'categories-list';
        
        project.categories.forEach(category => {
            const categoryElement = createCategoryElement(category, currencySymbol);
            categoriesList.appendChild(categoryElement);
        });
        
        categoriesContainer.appendChild(categoriesList);
    } else {
        categoriesContainer.innerHTML += `<p class="no-categories">Aucune catégorie de dépenses définie.</p>`;
    }
    
    container.appendChild(categoriesContainer);
    
    // Notes ou informations complémentaires (si disponibles)
    if (project.notes || project.description) {
        const notesSection = document.createElement('div');
        notesSection.className = 'project-notes';
        notesSection.innerHTML = `
            <h2>Notes</h2>
            <div class="notes-content">${project.notes || project.description}</div>
        `;
        
        // Styles pour les notes
        notesSection.style.marginBottom = '30px';
        
        container.appendChild(notesSection);
    }
    
    // Ajouter des boutons d'action
    const actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';
    actionButtons.innerHTML = `
        <a href="nouveau-projet.html?edit=true&id=${project.id}" class="btn-edit">
            <i class="fas fa-edit"></i> Modifier
        </a>
        <button class="btn-download">
            <i class="fas fa-download"></i> Exporter en PDF
        </button>
        <button class="btn-share">
            <i class="fas fa-share-alt"></i> Partager
        </button>
    `;
    
    // Styles pour les boutons d'action
    actionButtons.style.display = 'flex';
    actionButtons.style.justifyContent = 'center';
    actionButtons.style.gap = '15px';
    
    const buttons = actionButtons.querySelectorAll('a, button');
    buttons.forEach(btn => {
        btn.style.padding = '10px 20px';
        btn.style.borderRadius = '5px';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.textDecoration = 'none';
        btn.style.display = 'inline-flex';
        btn.style.alignItems = 'center';
        btn.style.gap = '8px';
        btn.style.fontSize = '14px';
        btn.style.fontWeight = 'bold';
    });
    
    // Style spécifique pour le bouton Modifier
    const editButton = actionButtons.querySelector('.btn-edit');
    if (editButton) {
        editButton.style.backgroundColor = '#007bff';
        editButton.style.color = 'white';
    }
    
    // Style spécifique pour le bouton Exporter
    const downloadButton = actionButtons.querySelector('.btn-download');
    if (downloadButton) {
        downloadButton.style.backgroundColor = '#6c757d';
        downloadButton.style.color = 'white';
    }
    
    // Style spécifique pour le bouton Partager
    const shareButton = actionButtons.querySelector('.btn-share');
    if (shareButton) {
        shareButton.style.backgroundColor = '#28a745';
        shareButton.style.color = 'white';
    }
    
    container.appendChild(actionButtons);
}

// Crée un élément pour une catégorie de dépenses
function createCategoryElement(category, currencySymbol) {
    const categoryElement = document.createElement('div');
    categoryElement.className = 'category-item';
    
    // En-tête de la catégorie
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'category-header';
    categoryHeader.innerHTML = `
        <div class="category-name">${category.name}</div>
        <div class="category-amount">${category.amount}</div>
    `;
    
    // Styles pour l'en-tête de catégorie
    categoryHeader.style.display = 'flex';
    categoryHeader.style.justifyContent = 'space-between';
    categoryHeader.style.padding = '10px 15px';
    categoryHeader.style.backgroundColor = '#e3f2fd';
    categoryHeader.style.borderRadius = '5px';
    categoryHeader.style.marginBottom = '10px';
    categoryHeader.style.fontWeight = 'bold';
    
    categoryElement.appendChild(categoryHeader);
    
    // Sous-catégories
    if (category.subcategories && category.subcategories.length > 0) {
        const subcategoriesContainer = document.createElement('div');
        subcategoriesContainer.className = 'subcategories-container';
        subcategoriesContainer.style.paddingLeft = '20px';
        
        category.subcategories.forEach(subcategory => {
            const subcategoryElement = document.createElement('div');
            subcategoryElement.className = 'subcategory-item';
            
            // En-tête de la sous-catégorie
            const subcategoryHeader = document.createElement('div');
            subcategoryHeader.className = 'subcategory-header';
            subcategoryHeader.innerHTML = `
                <div class="subcategory-name">${subcategory.name}</div>
                <div class="subcategory-amount">${subcategory.amount}</div>
            `;
            
            // Styles pour l'en-tête de sous-catégorie
            subcategoryHeader.style.display = 'flex';
            subcategoryHeader.style.justifyContent = 'space-between';
            subcategoryHeader.style.padding = '8px 15px';
            subcategoryHeader.style.backgroundColor = '#f8f9fa';
            subcategoryHeader.style.borderRadius = '5px';
            subcategoryHeader.style.marginBottom = '8px';
            
            subcategoryElement.appendChild(subcategoryHeader);
            
            // Lignes de dépenses
            if (subcategory.lines && subcategory.lines.length > 0) {
                const linesContainer = document.createElement('div');
                linesContainer.className = 'expense-lines-container';
                linesContainer.style.paddingLeft = '20px';
                
                subcategory.lines.forEach(line => {
                    const lineElement = document.createElement('div');
                    lineElement.className = 'expense-line-item';
                    lineElement.innerHTML = `
                        <div class="expense-line-name">${line.name}</div>
                        <div class="expense-line-amount">${line.amount}</div>
                    `;
                    
                    // Styles pour les lignes de dépense
                    lineElement.style.display = 'flex';
                    lineElement.style.justifyContent = 'space-between';
                    lineElement.style.padding = '5px 15px';
                    lineElement.style.borderBottom = '1px solid #e9ecef';
                    
                    linesContainer.appendChild(lineElement);
                });
                
                subcategoryElement.appendChild(linesContainer);
            }
            
            subcategoriesContainer.appendChild(subcategoryElement);
        });
        
        categoryElement.appendChild(subcategoriesContainer);
    }
    
    // Styles pour l'élément de catégorie
    categoryElement.style.marginBottom = '20px';
    
    return categoryElement;
}

// Formater un montant monétaire
function formatMoney(amount, currencySymbol = '€') {
    return `${currencySymbol} ${amount.toFixed(2).replace('.', ',')}`;
}

// Extraire le symbole de devise d'une chaîne monétaire
function extractCurrencySymbol(monetaryString) {
    if (!monetaryString) return '€';
    const match = monetaryString.toString().match(/^([^\d]+)/);
    return match && match[1] ? match[1].trim() : '€';
}

// Extraire la valeur numérique d'une chaîne monétaire
function parseMonetaryValue(monetaryString) {
    if (!monetaryString) return 0;
    const numericPart = monetaryString.toString().replace(/[^\d.,]/g, '');
    return parseFloat(numericPart.replace(',', '.')) || 0;
}

// Formater une date
function formatDate(dateString) {
    if (!dateString) return '';
    
    // Vérifier si la date est déjà au format JJ/MM/AAAA
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
        return dateString;
    }
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (e) {
        console.error('Erreur lors du formatage de la date:', e);
        return dateString;
    }
}