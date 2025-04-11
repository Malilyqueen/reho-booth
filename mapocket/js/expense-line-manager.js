// expense-line-manager.js - Gestionnaire des lignes de dépenses
// Ce script gère l'ajout, la modification et la suppression des lignes de dépenses
// dans les catégories et sous-catégories du projet

// Variables globales
let selectedCategoryIndex = -1;
let selectedSubcategoryIndex = -1;
let expenseLineModal = null;
let expenseLineForm = null;

// Initialisation du gestionnaire de lignes de dépenses
function initExpenseLineManager() {
    console.log("Initialisation du gestionnaire de lignes de dépenses...");
    
    // Récupérer les éléments du DOM
    expenseLineModal = document.getElementById('expenseLineModal');
    expenseLineForm = document.getElementById('expense-line-form');
    
    if (!expenseLineModal || !expenseLineForm) {
        console.error("Impossible de trouver les éléments du modal de ligne de dépense");
        return;
    }
    
    // Ajouter l'écouteur d'événement pour le formulaire
    expenseLineForm.addEventListener('submit', function(event) {
        event.preventDefault();
        submitExpenseLine();
    });
    
    // Ajouter l'écouteur pour le bouton d'annulation
    document.getElementById('cancelExpenseLineBtn').addEventListener('click', function() {
        closeExpenseLineModal();
    });
    
    // Ajouter l'écouteur pour le bouton de fermeture (X)
    expenseLineModal.querySelector('.close-modal').addEventListener('click', function() {
        closeExpenseLineModal();
    });
    
    // Délégation d'événements pour les boutons d'ajout de ligne et suppression de ligne
    document.addEventListener('click', function(event) {
        // Vérifier si on a cliqué sur un bouton d'ajout de ligne
        if (event.target.closest('.btn-add-expense-line')) {
            const button = event.target.closest('.btn-add-expense-line');
            const subcategoryElement = button.closest('.subcategory');
            
            if (subcategoryElement) {
                // Remonter à la catégorie parente
                const categoryElement = subcategoryElement.closest('.category');
                
                if (categoryElement) {
                    // Chercher tous les éléments de catégorie et trouver l'index
                    const categoryElements = Array.from(document.querySelectorAll('.category'));
                    selectedCategoryIndex = categoryElements.indexOf(categoryElement);
                    
                    // Chercher tous les éléments de sous-catégorie dans cette catégorie et trouver l'index
                    const subcategoryElements = Array.from(categoryElement.querySelectorAll('.subcategory'));
                    selectedSubcategoryIndex = subcategoryElements.indexOf(subcategoryElement);
                    
                    // Ouvrir le modal
                    openExpenseLineModal(selectedCategoryIndex, selectedSubcategoryIndex);
                }
            }
        }
        
        // Vérifier si on a cliqué sur un bouton d'ajout de ligne dans l'interface moderne
        if (event.target.closest('.modern-btn-add-expense-line')) {
            const button = event.target.closest('.modern-btn-add-expense-line');
            const subcategoryElement = button.closest('.subcategory');
            
            if (subcategoryElement) {
                // Remonter à la catégorie parente
                const categoryElement = subcategoryElement.closest('.category');
                
                if (categoryElement) {
                    // Chercher tous les éléments de catégorie et trouver l'index
                    const categoryElements = Array.from(document.querySelectorAll('#modern-categoryList .category'));
                    selectedCategoryIndex = categoryElements.indexOf(categoryElement);
                    
                    // Chercher tous les éléments de sous-catégorie dans cette catégorie et trouver l'index
                    const subcategoryElements = Array.from(categoryElement.querySelectorAll('.subcategory'));
                    selectedSubcategoryIndex = subcategoryElements.indexOf(subcategoryElement);
                    
                    // Ouvrir le modal
                    openExpenseLineModal(selectedCategoryIndex, selectedSubcategoryIndex);
                }
            }
        }
        
        // Vérifier si on a cliqué sur un bouton de suppression de ligne
        if (event.target.closest('.btn-delete-expense-line')) {
            const button = event.target.closest('.btn-delete-expense-line');
            const lineElement = button.closest('.expense-line');
            const subcategoryElement = lineElement.closest('.subcategory');
            
            if (lineElement && subcategoryElement) {
                // Remonter à la catégorie parente
                const categoryElement = subcategoryElement.closest('.category');
                
                if (categoryElement) {
                    // Chercher tous les éléments de catégorie et trouver l'index
                    const categoryElements = Array.from(document.querySelectorAll('.category'));
                    const categoryIndex = categoryElements.indexOf(categoryElement);
                    
                    // Chercher tous les éléments de sous-catégorie dans cette catégorie et trouver l'index
                    const subcategoryElements = Array.from(categoryElement.querySelectorAll('.subcategory'));
                    const subcategoryIndex = subcategoryElements.indexOf(subcategoryElement);
                    
                    // Chercher tous les éléments de ligne dans cette sous-catégorie et trouver l'index
                    const lineElements = Array.from(subcategoryElement.querySelectorAll('.expense-line'));
                    const lineIndex = lineElements.indexOf(lineElement);
                    
                    // Supprimer la ligne
                    if (confirm('Voulez-vous vraiment supprimer cette ligne de dépense ?')) {
                        deleteExpenseLine(categoryIndex, subcategoryIndex, lineIndex);
                    }
                }
            }
        }
        
        // Vérifier si on a cliqué sur un bouton de suppression de ligne dans l'interface moderne
        if (event.target.closest('.modern-btn-delete-expense-line')) {
            const button = event.target.closest('.modern-btn-delete-expense-line');
            const lineElement = button.closest('.expense-line');
            const subcategoryElement = lineElement.closest('.subcategory');
            
            if (lineElement && subcategoryElement) {
                // Remonter à la catégorie parente
                const categoryElement = subcategoryElement.closest('.category');
                
                if (categoryElement) {
                    // Chercher tous les éléments de catégorie et trouver l'index
                    const categoryElements = Array.from(document.querySelectorAll('#modern-categoryList .category'));
                    const categoryIndex = categoryElements.indexOf(categoryElement);
                    
                    // Chercher tous les éléments de sous-catégorie dans cette catégorie et trouver l'index
                    const subcategoryElements = Array.from(categoryElement.querySelectorAll('.subcategory'));
                    const subcategoryIndex = subcategoryElements.indexOf(subcategoryElement);
                    
                    // Chercher tous les éléments de ligne dans cette sous-catégorie et trouver l'index
                    const lineElements = Array.from(subcategoryElement.querySelectorAll('.expense-line'));
                    const lineIndex = lineElements.indexOf(lineElement);
                    
                    // Supprimer la ligne
                    if (confirm('Voulez-vous vraiment supprimer cette ligne de dépense ?')) {
                        deleteExpenseLine(categoryIndex, subcategoryIndex, lineIndex);
                    }
                }
            }
        }
    });
    
    console.log("Gestionnaire de lignes de dépenses initialisé avec succès");
}

// Fonction pour ouvrir le modal d'ajout de ligne de dépense
function openExpenseLineModal(categoryIndex, subcategoryIndex) {
    // Stocker les indices dans le formulaire
    document.getElementById('categoryIndex').value = categoryIndex;
    document.getElementById('subcategoryIndex').value = subcategoryIndex;
    
    // Réinitialiser le formulaire
    expenseLineForm.reset();
    
    // Afficher le modal
    expenseLineModal.style.display = 'flex';
}

// Fonction pour fermer le modal
function closeExpenseLineModal() {
    expenseLineModal.style.display = 'none';
}

// Fonction pour soumettre le formulaire d'ajout de ligne
function submitExpenseLine() {
    // Récupérer les valeurs du formulaire
    const categoryIndex = parseInt(document.getElementById('categoryIndex').value);
    const subcategoryIndex = parseInt(document.getElementById('subcategoryIndex').value);
    const name = document.getElementById('expenseLineName').value.trim();
    const amount = parseFloat(document.getElementById('expenseLineAmount').value) || 0;
    
    // Vérifier que les données sont valides
    if (categoryIndex < 0 || subcategoryIndex < 0 || !name || amount <= 0) {
        showNotification("Veuillez remplir tous les champs correctement", "error");
        return;
    }
    
    // Récupérer la catégorie et la sous-catégorie concernées
    if (!currentProject || !currentProject.categories || 
        !currentProject.categories[categoryIndex] || 
        !currentProject.categories[categoryIndex].subcategories || 
        !currentProject.categories[categoryIndex].subcategories[subcategoryIndex]) {
        showNotification("Impossible de trouver la catégorie ou la sous-catégorie", "error");
        return;
    }
    
    const category = currentProject.categories[categoryIndex];
    const subcategory = category.subcategories[subcategoryIndex];
    
    // Initialiser le tableau des lignes s'il n'existe pas
    if (!subcategory.lines) {
        subcategory.lines = [];
    }
    
    // Ajouter la nouvelle ligne
    subcategory.lines.push({ 
        name: name, 
        amount: amount 
    });
    
    // Mettre à jour les montants
    recalculateAllAmounts();
    
    // Sauvegarder le projet
    saveProject();
    
    // Rafraîchir l'affichage
    renderCategories();
    if (isModernInterface) {
        renderModernCategories();
    }
    
    // Fermer le modal
    closeExpenseLineModal();
    
    // Afficher une notification de succès
    showNotification("Ligne de dépense ajoutée avec succès", "success");
}

// Fonction pour recalculer tous les montants
function recalculateAllAmounts() {
    if (!currentProject || !currentProject.categories) return;
    
    let totalProjectAmount = 0;
    
    // Pour chaque catégorie
    currentProject.categories.forEach(category => {
        let totalCategoryAmount = 0;
        
        // Pour chaque sous-catégorie
        if (category.subcategories && category.subcategories.length > 0) {
            category.subcategories.forEach(subcategory => {
                let totalSubcategoryAmount = 0;
                
                // Pour chaque ligne de dépense
                if (subcategory.lines && subcategory.lines.length > 0) {
                    subcategory.lines.forEach(line => {
                        // Ajouter le montant de la ligne au total de la sous-catégorie
                        totalSubcategoryAmount += parseFloat(line.amount) || 0;
                    });
                }
                
                // Mettre à jour le montant de la sous-catégorie
                subcategory.amount = totalSubcategoryAmount;
                
                // Ajouter le montant de la sous-catégorie au total de la catégorie
                totalCategoryAmount += totalSubcategoryAmount;
            });
        }
        
        // Mettre à jour le montant de la catégorie
        category.amount = totalCategoryAmount;
        
        // Ajouter le montant de la catégorie au total du projet
        totalProjectAmount += totalCategoryAmount;
    });
    
    // Mettre à jour le budget total du projet (uniquement si le montant utilisé est différent de 0)
    if (totalProjectAmount > 0) {
        document.getElementById('usedBudget').textContent = formatCurrency(totalProjectAmount);
        
        // Mettre à jour l'écart budgétaire
        const initialBudget = parseFloat(currentProject.totalBudget) || 0;
        const budgetGap = initialBudget - totalProjectAmount;
        const budgetGapElement = document.getElementById('budgetGap');
        budgetGapElement.textContent = formatCurrency(budgetGap);
        
        // Changer la couleur selon si positif ou négatif
        if (budgetGap < 0) {
            budgetGapElement.classList.remove('text-green-600');
            budgetGapElement.classList.add('text-red-600');
        } else {
            budgetGapElement.classList.remove('text-red-600');
            budgetGapElement.classList.add('text-green-600');
        }
        
        // Mettre à jour la barre de progression
        updateProgressBar(totalProjectAmount);
        
        // Si l'interface moderne est active, mettre à jour ces éléments aussi
        if (isModernInterface) {
            document.getElementById('modern-usedBudget').textContent = formatCurrency(totalProjectAmount);
            const modernBudgetGapElement = document.getElementById('modern-budgetGap');
            modernBudgetGapElement.textContent = formatCurrency(budgetGap);
            
            if (budgetGap < 0) {
                modernBudgetGapElement.classList.remove('text-green-600');
                modernBudgetGapElement.classList.add('text-red-600');
            } else {
                modernBudgetGapElement.classList.remove('text-red-600');
                modernBudgetGapElement.classList.add('text-green-600');
            }
            
            updateModernProgressBar(totalProjectAmount);
        }
    }
}

// Fonction pour mettre à jour la barre de progression
function updateProgressBar(usedBudget) {
    const initialBudget = parseFloat(currentProject.totalBudget) || 0;
    let percentage = 0;
    
    if (initialBudget > 0) {
        percentage = Math.min(Math.round((usedBudget / initialBudget) * 100), 100);
    }
    
    document.getElementById('budgetPercentage').textContent = percentage + '%';
    document.getElementById('progressBar').style.width = percentage + '%';
    
    // Changer la couleur selon le pourcentage
    const progressBar = document.getElementById('progressBar');
    if (percentage > 90) {
        progressBar.className = 'progressBar-fill bg-red-500';
    } else if (percentage > 75) {
        progressBar.className = 'progressBar-fill bg-yellow-500';
    } else {
        progressBar.className = 'progressBar-fill bg-green-500';
    }
}

// Initialiser le gestionnaire de lignes de dépenses au chargement du document
document.addEventListener('DOMContentLoaded', function() {
    initExpenseLineManager();
});

// Fonction pour supprimer une ligne de dépense
function deleteExpenseLine(categoryIndex, subcategoryIndex, lineIndex) {
    // Vérifier que les indices sont valides
    if (categoryIndex < 0 || subcategoryIndex < 0 || lineIndex < 0) {
        showNotification("Indices invalides pour la suppression", "error");
        return;
    }
    
    // Vérifier que le projet et les catégories existent
    if (!currentProject || !currentProject.categories || 
        !currentProject.categories[categoryIndex] || 
        !currentProject.categories[categoryIndex].subcategories || 
        !currentProject.categories[categoryIndex].subcategories[subcategoryIndex] ||
        !currentProject.categories[categoryIndex].subcategories[subcategoryIndex].lines ||
        !currentProject.categories[categoryIndex].subcategories[subcategoryIndex].lines[lineIndex]) {
        showNotification("Impossible de trouver la ligne à supprimer", "error");
        return;
    }
    
    // Supprimer la ligne
    currentProject.categories[categoryIndex].subcategories[subcategoryIndex].lines.splice(lineIndex, 1);
    
    // Recalculer les montants
    recalculateAllAmounts();
    
    // Sauvegarder le projet
    saveProject();
    
    // Rafraîchir l'affichage
    renderCategories();
    if (isModernInterface) {
        renderModernCategories();
    }
    
    // Afficher une notification de succès
    showNotification("Ligne de dépense supprimée avec succès", "success");
}

// Fonction pour calculer le total des dépenses d'un projet
function calculateTotalUsedBudget() {
    if (!currentProject || !currentProject.categories) return 0;
    
    let totalAmount = 0;
    
    currentProject.categories.forEach(category => {
        if (category.subcategories && category.subcategories.length > 0) {
            category.subcategories.forEach(subcategory => {
                if (subcategory.lines && subcategory.lines.length > 0) {
                    subcategory.lines.forEach(line => {
                        totalAmount += parseFloat(line.amount) || 0;
                    });
                }
            });
        }
    });
    
    return totalAmount;
}