/**
 * Script pour l'assistant de création de projet
 */

// Variables globales
let generatedProject = null;
let originalBudget = 0;

// Initialisation au chargement du document
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
});

/**
 * Initialise les écouteurs d'événements
 */
function initEventListeners() {
    // Bouton de génération
    document.getElementById('generateBtn').addEventListener('click', generateProject);
    
    // Entrée au clavier dans le champ de prompt
    document.getElementById('promptInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateProject();
        }
    });
    
    // Exemples de prompts
    document.querySelectorAll('.example-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            const prompt = this.getAttribute('data-prompt');
            document.getElementById('promptInput').value = prompt;
            // Faire défiler jusqu'au champ de saisie
            document.getElementById('promptInput').scrollIntoView({ behavior: 'smooth' });
            // Mettre le focus sur le champ
            setTimeout(() => document.getElementById('promptInput').focus(), 300);
        });
    });
    
    // Bouton de modification
    document.getElementById('modifyBtn').addEventListener('click', function() {
        // Faire défiler jusqu'au champ de saisie
        document.getElementById('promptInput').scrollIntoView({ behavior: 'smooth' });
        // Mettre le focus sur le champ
        setTimeout(() => document.getElementById('promptInput').focus(), 300);
    });
    
    // Bouton de création de projet
    document.getElementById('createProjectBtn').addEventListener('click', createProject);
}

/**
 * Génère un projet à partir du prompt
 */
async function generateProject() {
    const promptInput = document.getElementById('promptInput');
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
        showNotification('Veuillez entrer une description de votre projet', 'error');
        return;
    }
    
    // Afficher la section de chargement
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('loadingSection').style.display = 'flex';
    
    try {
        const response = await fetch('/api/create-project', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: prompt })
        });
        
        const data = await response.json();
        
        if (data.status === 'success' && data.project) {
            // Stocker le projet généré
            generatedProject = data.project;
            originalBudget = generatedProject.budget_total;
            
            // Remplir et afficher la section de résultat
            displayGeneratedProject();
        } else {
            // Afficher le message d'erreur
            showNotification('Erreur lors de la génération du projet : ' + (data.error || 'Veuillez réessayer'), 'error');
            document.getElementById('loadingSection').style.display = 'none';
        }
    } catch (error) {
        console.error('Erreur lors de la génération du projet:', error);
        showNotification('Erreur de connexion au serveur. Veuillez réessayer.', 'error');
        document.getElementById('loadingSection').style.display = 'none';
    }
}

/**
 * Affiche le projet généré
 */
function displayGeneratedProject() {
    if (!generatedProject) return;
    
    // Remplir les informations générales
    document.getElementById('projectTitle').textContent = generatedProject.name;
    document.getElementById('projectType').textContent = 'Type : ' + generatedProject.type;
    document.getElementById('projectBudget').textContent = 'Budget total : ' + formatCurrency(generatedProject.budget_total);
    
    // Remplir le tableau des catégories
    const tableBody = document.getElementById('categoriesTableBody');
    tableBody.innerHTML = '';
    
    generatedProject.categories.forEach((category, index) => {
        const row = document.createElement('tr');
        
        // Cellule nom avec icône
        const nameCell = document.createElement('td');
        const nameDiv = document.createElement('div');
        nameDiv.className = 'category-name';
        
        const iconSpan = document.createElement('span');
        iconSpan.className = 'category-icon';
        iconSpan.textContent = category.icon;
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = category.nom;
        
        nameDiv.appendChild(iconSpan);
        nameDiv.appendChild(nameSpan);
        nameCell.appendChild(nameDiv);
        
        // Cellule description
        const descCell = document.createElement('td');
        descCell.textContent = category.description;
        
        // Cellule montant
        const amountCell = document.createElement('td');
        amountCell.className = 'amount-cell';
        amountCell.textContent = formatCurrency(category.montant);
        
        // Cellule d'ajustement
        const adjustCell = document.createElement('td');
        
        const adjustDiv = document.createElement('div');
        adjustDiv.className = 'adjustment-control';
        
        const decreaseBtn = document.createElement('button');
        decreaseBtn.className = 'adjustment-btn';
        decreaseBtn.innerHTML = '<i class="fas fa-minus"></i>';
        decreaseBtn.onclick = () => adjustAmount(index, -Math.max(100, Math.round(category.montant * 0.05)));
        
        const valueInput = document.createElement('input');
        valueInput.type = 'number';
        valueInput.className = 'amount-input';
        valueInput.value = category.montant;
        valueInput.dataset.index = index;
        valueInput.addEventListener('change', function() {
            updateCategoryAmount(index, parseFloat(this.value) || 0);
        });
        
        const increaseBtn = document.createElement('button');
        increaseBtn.className = 'adjustment-btn';
        increaseBtn.innerHTML = '<i class="fas fa-plus"></i>';
        increaseBtn.onclick = () => adjustAmount(index, Math.max(100, Math.round(category.montant * 0.05)));
        
        adjustDiv.appendChild(decreaseBtn);
        adjustDiv.appendChild(valueInput);
        adjustDiv.appendChild(increaseBtn);
        
        adjustCell.appendChild(adjustDiv);
        
        // Ajouter les cellules à la ligne
        row.appendChild(nameCell);
        row.appendChild(descCell);
        row.appendChild(amountCell);
        row.appendChild(adjustCell);
        
        // Ajouter la ligne au tableau
        tableBody.appendChild(row);
    });
    
    // Mettre à jour le montant total
    updateTotalAmount();
    
    // Masquer la section de chargement et afficher la section de résultat
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'block';
    
    // Faire défiler jusqu'à la section de résultat
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Ajuste le montant d'une catégorie
 */
function adjustAmount(index, delta) {
    if (!generatedProject || !generatedProject.categories[index]) return;
    
    // Récupérer le montant actuel
    let currentAmount = generatedProject.categories[index].montant;
    
    // Calculer le nouveau montant (minimum 0)
    let newAmount = Math.max(0, currentAmount + delta);
    
    // Mettre à jour le montant dans l'objet
    updateCategoryAmount(index, newAmount);
}

/**
 * Met à jour le montant d'une catégorie
 */
function updateCategoryAmount(index, newAmount) {
    if (!generatedProject || !generatedProject.categories[index]) return;
    
    // Mettre à jour le montant dans l'objet
    generatedProject.categories[index].montant = newAmount;
    
    // Mettre à jour l'affichage
    const tableRows = document.getElementById('categoriesTableBody').querySelectorAll('tr');
    if (tableRows[index]) {
        const amountCell = tableRows[index].querySelector('.amount-cell');
        if (amountCell) {
            amountCell.textContent = formatCurrency(newAmount);
        }
        
        const amountInput = tableRows[index].querySelector('.amount-input');
        if (amountInput && amountInput.value != newAmount) {
            amountInput.value = newAmount;
        }
    }
    
    // Mettre à jour le montant total
    updateTotalAmount();
}

/**
 * Met à jour le montant total
 */
function updateTotalAmount() {
    if (!generatedProject) return;
    
    // Calculer le total
    const total = generatedProject.categories.reduce((sum, category) => sum + category.montant, 0);
    
    // Mettre à jour le budget total du projet
    generatedProject.budget_total = total;
    
    // Mettre à jour l'affichage
    document.getElementById('totalAmount').textContent = formatCurrency(total);
    document.getElementById('projectBudget').textContent = 'Budget total : ' + formatCurrency(total);
    
    // Si le budget total a changé par rapport à l'original, mettre en évidence
    if (total !== originalBudget) {
        document.getElementById('projectBudget').innerHTML = 'Budget total : ' + formatCurrency(total) + 
            ` <span style="font-size: 14px; color: #666;">(original: ${formatCurrency(originalBudget)})</span>`;
    }
}

/**
 * Crée le projet dans MaPocket
 */
function createProject() {
    if (!generatedProject) {
        showNotification('Aucun projet à créer', 'error');
        return;
    }
    
    try {
        // Convertir les catégories au format attendu par MaPocket
        const mappedCategories = generatedProject.categories.map(category => {
            return {
                name: category.nom,
                amount: formatCurrency(category.montant),
                subcategories: [{
                    name: category.description,
                    amount: formatCurrency(category.montant),
                    lines: [{
                        name: category.description,
                        amount: formatCurrency(category.montant)
                    }]
                }]
            };
        });
        
        // Créer l'objet projet
        const newProject = {
            projectName: generatedProject.name,
            projectDate: new Date().toISOString().split('T')[0],
            totalBudget: formatCurrency(generatedProject.budget_total),
            template: generatedProject.type,
            categories: mappedCategories,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            linkToWallet: false,
            realExpenses: []
        };
        
        // Récupérer les projets existants
        let projects = [];
        try {
            projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        } catch (error) {
            console.error('Erreur lors de la récupération des projets:', error);
            projects = [];
        }
        
        // Vérifier si un projet avec le même nom existe déjà
        const existingProject = projects.find(p => p.projectName === newProject.projectName);
        if (existingProject) {
            if (!confirm(`Un projet nommé "${newProject.projectName}" existe déjà. Voulez-vous le remplacer ?`)) {
                // Demander un nouveau nom
                const newName = prompt('Veuillez entrer un nouveau nom pour ce projet:', newProject.projectName + ' (2)');
                if (!newName) return; // Annulation
                
                newProject.projectName = newName;
            } else {
                // Supprimer l'ancien projet
                projects = projects.filter(p => p.id !== existingProject.id);
            }
        }
        
        // Ajouter le nouveau projet
        projects.push(newProject);
        
        // Sauvegarder les projets
        localStorage.setItem('savedProjects', JSON.stringify(projects));
        
        // Afficher une notification de succès
        showNotification('Projet créé avec succès!', 'success');
        
        // Rediriger vers la page du projet après un court délai
        setTimeout(() => {
            window.location.href = `projet.html?id=${newProject.id}`;
        }, 1500);
    } catch (error) {
        console.error('Erreur lors de la création du projet:', error);
        showNotification('Erreur lors de la création du projet', 'error');
    }
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
        alert(message);
    }
}