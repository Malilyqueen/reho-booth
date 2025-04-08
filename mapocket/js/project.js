// JavaScript for the New Project page

document.addEventListener('DOMContentLoaded', function() {
    console.log('New Project page initialized');
    
    // Initialize the form elements
    initializeProjectForm();
});

function initializeProjectForm() {
    // Date picker initialization (in a full implementation, this would use a date picker library)
    const dateInput = document.getElementById('projectDate');
    if (dateInput) {
        dateInput.addEventListener('click', function() {
            console.log('Date picker clicked');
            // In a full implementation, this would open a date picker
        });
    }
    
    // Template buttons
    const templateButtons = document.querySelectorAll('.template-btn');
    templateButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            templateButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update the project type in heading
            const projectType = this.textContent.trim();
            document.querySelector('.project-type').textContent = projectType;
            
            // Update expense categories based on selected template
            updateExpenseCategories(projectType);
        });
    });
    
    // Initialiser le bouton d'ajout de catégorie
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', addNewCategory);
    }
    
    // Initialiser les boutons de suppression de catégorie
    initializeDeleteButtons();
    
    // Handle form submission
    const projectForm = document.getElementById('newProjectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect form data
            const formData = {
                projectName: document.getElementById('projectName').value,
                projectDate: document.getElementById('projectDate').value,
                totalBudget: document.getElementById('totalBudget').value,
                template: document.querySelector('.template-btn.active').textContent.trim(),
                categories: []
            };
            
            // Collect categories and amounts
            const categoryRows = document.querySelectorAll('.expense-table tbody tr:not(.total-row)');
            categoryRows.forEach(row => {
                const categoryNameInput = row.querySelector('.category-name-input');
                const categoryName = categoryNameInput ? categoryNameInput.value : 'Catégorie';
                
                const description = row.querySelector('input[placeholder="Enter description"]') ? 
                    row.querySelector('input[placeholder="Enter description"]').value : '';
                
                const amountInput = row.querySelector('.amount-input');
                const amount = amountInput ? '€ ' + amountInput.value : '€ 0';
                
                formData.categories.push({
                    category: categoryName,
                    description: description,
                    amount: amount
                });
            });
            
            console.log('Form submitted:', formData);
            
            // In a real application, this would save the data and redirect to the dashboard
            alert('Projet créé avec succès!');
            // Then redirect to dashboard
            window.location.href = 'index.html';
        });
    }
    
    // Initialize budget calculation
    initializeBudgetCalculation();
}

function updateExpenseCategories(templateType) {
    let categories = [];
    
    // Define categories based on template type
    switch (templateType) {
        // 🎉 Événementiels
        case 'Anniversaire':
            categories = [
                { name: 'Traiteur', amount: '€ 200' },
                { name: 'Décorations', amount: '€ 100' },
                { name: 'Animation', amount: '€ 100' },
                { name: 'Cadeaux', amount: '€ 100' },
                { name: 'Location salle', amount: '€ 150' }
            ];
            break;
        case 'Mariage':
            categories = [
                { name: 'Traiteur', amount: '€ 3000' },
                { name: 'Location salle', amount: '€ 1500' },
                { name: 'Tenues', amount: '€ 2000' },
                { name: 'Photographe', amount: '€ 1000' },
                { name: 'Décoration', amount: '€ 800' },
                { name: 'Animation/DJ', amount: '€ 800' },
                { name: 'Alliances', amount: '€ 600' }
            ];
            break;
        case 'Baby shower':
            categories = [
                { name: 'Décorations', amount: '€ 150' },
                { name: 'Nourriture', amount: '€ 200' },
                { name: 'Boissons', amount: '€ 100' },
                { name: 'Cadeaux', amount: '€ 150' },
                { name: 'Jeux & animations', amount: '€ 50' }
            ];
            break;
        case 'Fête d\'entreprise':
            categories = [
                { name: 'Location espace', amount: '€ 1000' },
                { name: 'Traiteur', amount: '€ 1500' },
                { name: 'Boissons', amount: '€ 500' },
                { name: 'Animation', amount: '€ 800' },
                { name: 'Décoration', amount: '€ 300' },
                { name: 'Transport', amount: '€ 400' }
            ];
            break;
        case 'Célébration religieuse':
            categories = [
                { name: 'Lieu de culte', amount: '€ 200' },
                { name: 'Tenue', amount: '€ 150' },
                { name: 'Réception', amount: '€ 500' },
                { name: 'Souvenirs', amount: '€ 150' },
                { name: 'Décoration', amount: '€ 100' }
            ];
            break;
            
        // 🏠 Vie personnelle
        case 'Budget mensuel':
            categories = [
                { name: 'Loyer/Crédit', amount: '€ 800' },
                { name: 'Charges', amount: '€ 150' },
                { name: 'Courses alimentaires', amount: '€ 400' },
                { name: 'Transport', amount: '€ 100' },
                { name: 'Loisirs', amount: '€ 150' },
                { name: 'Épargne', amount: '€ 200' }
            ];
            break;
        case 'Déménagement':
            categories = [
                { name: 'Location camion', amount: '€ 150' },
                { name: 'Cartons et matériel', amount: '€ 100' },
                { name: 'Société de déménagement', amount: '€ 800' },
                { name: 'Frais administratifs', amount: '€ 50' },
                { name: 'Ménage', amount: '€ 100' },
                { name: 'Petits travaux', amount: '€ 200' }
            ];
            break;
        case 'Rentrée scolaire':
            categories = [
                { name: 'Fournitures', amount: '€ 100' },
                { name: 'Vêtements', amount: '€ 150' },
                { name: 'Équipement sportif', amount: '€ 80' },
                { name: 'Manuels', amount: '€ 50' },
                { name: 'Inscription activités', amount: '€ 200' }
            ];
            break;
        case 'Fêtes de fin d\'année':
            categories = [
                { name: 'Cadeaux', amount: '€ 300' },
                { name: 'Repas', amount: '€ 200' },
                { name: 'Décorations', amount: '€ 100' },
                { name: 'Déplacements', amount: '€ 150' },
                { name: 'Tenue', amount: '€ 100' }
            ];
            break;
        case 'Vacances':
            categories = [
                { name: 'Transport', amount: '€ 400' },
                { name: 'Hébergement', amount: '€ 600' },
                { name: 'Restauration', amount: '€ 400' },
                { name: 'Activités', amount: '€ 300' },
                { name: 'Souvenirs', amount: '€ 100' }
            ];
            break;
            
        // 💼 Projets professionnels
        case 'Lancement de produit':
            categories = [
                { name: 'Développement', amount: '€ 2000' },
                { name: 'Marketing', amount: '€ 1500' },
                { name: 'Design', amount: '€ 1000' },
                { name: 'Communication', amount: '€ 1000' },
                { name: 'Événement de lancement', amount: '€ 1500' }
            ];
            break;
        case 'Création de site web':
            categories = [
                { name: 'Design', amount: '€ 500' },
                { name: 'Développement', amount: '€ 1000' },
                { name: 'Contenu', amount: '€ 300' },
                { name: 'Hébergement', amount: '€ 100' },
                { name: 'SEO', amount: '€ 400' }
            ];
            break;
        case 'Campagne marketing':
            categories = [
                { name: 'Publicité en ligne', amount: '€ 1000' },
                { name: 'Réseaux sociaux', amount: '€ 500' },
                { name: 'Contenus', amount: '€ 700' },
                { name: 'Graphisme', amount: '€ 400' },
                { name: 'Analyse & mesure', amount: '€ 300' }
            ];
            break;
        case 'Formation professionnelle':
            categories = [
                { name: 'Frais de formation', amount: '€ 1500' },
                { name: 'Matériel pédagogique', amount: '€ 200' },
                { name: 'Transport', amount: '€ 200' },
                { name: 'Hébergement', amount: '€ 300' },
                { name: 'Certification', amount: '€ 250' }
            ];
            break;
        case 'Lancement d\'entreprise':
            categories = [
                { name: 'Frais juridiques', amount: '€ 800' },
                { name: 'Équipement', amount: '€ 2000' },
                { name: 'Marketing initial', amount: '€ 1500' },
                { name: 'Local', amount: '€ 1000' },
                { name: 'Site web', amount: '€ 800' },
                { name: 'Stocks initiaux', amount: '€ 2000' }
            ];
            break;
            
        // 💰 Objectifs financiers
        case 'Épargne mensuelle':
            categories = [
                { name: 'Épargne sécurité', amount: '€ 200' },
                { name: 'Épargne projets', amount: '€ 300' },
                { name: 'Épargne retraite', amount: '€ 150' },
                { name: 'Investissements', amount: '€ 250' }
            ];
            break;
        case 'Remboursement de dettes':
            categories = [
                { name: 'Crédit immobilier', amount: '€ 700' },
                { name: 'Crédit auto', amount: '€ 300' },
                { name: 'Crédit conso', amount: '€ 200' },
                { name: 'Découvert', amount: '€ 100' }
            ];
            break;
        case 'Projet "Gros achat"':
            categories = [
                { name: 'Achat principal', amount: '€ 2000' },
                { name: 'Accessoires', amount: '€ 300' },
                { name: 'Livraison/Installation', amount: '€ 150' },
                { name: 'Garantie/Assurance', amount: '€ 100' }
            ];
            break;
            
        // 🤝 Collectifs & communautaires
        case 'Cagnotte / tontine':
            categories = [
                { name: 'Contributions mensuelles', amount: '€ 1000' },
                { name: 'Intérêts', amount: '€ 50' },
                { name: 'Frais de gestion', amount: '€ 20' }
            ];
            break;
        case 'Association caritative':
            categories = [
                { name: 'Collecte de fonds', amount: '€ 1000' },
                { name: 'Dépenses opérationnelles', amount: '€ 500' },
                { name: 'Communication', amount: '€ 200' },
                { name: 'Matériel', amount: '€ 300' }
            ];
            break;
        case 'Budget réunion / AG':
            categories = [
                { name: 'Location salle', amount: '€ 300' },
                { name: 'Restauration', amount: '€ 200' },
                { name: 'Matériel audiovisuel', amount: '€ 150' },
                { name: 'Documents', amount: '€ 50' }
            ];
            break;
        case 'Fonds commun':
            categories = [
                { name: 'Loyer & charges', amount: '€ 800' },
                { name: 'Courses', amount: '€ 400' },
                { name: 'Internet & TV', amount: '€ 50' },
                { name: 'Électricité/Eau', amount: '€ 150' },
                { name: 'Réparations', amount: '€ 100' }
            ];
            break;
            
        // Personnalisé
        case 'Personnalisé':
            categories = [
                { name: 'Catégorie 1', amount: '€ 100' },
                { name: 'Catégorie 2', amount: '€ 100' },
                { name: 'Catégorie 3', amount: '€ 100' }
            ];
            break;
    }
    
    // Update the table with new categories
    const tableBody = document.querySelector('.expense-table tbody');
    let tableContent = '';
    
    let total = 0;
    
    // Parse amounts and calculate total
    categories.forEach(category => {
        const amount = parseInt(category.amount.replace('€', '').trim());
        total += amount;
        
        // Extraire la valeur numérique sans le symbole €
        const amountValue = category.amount.replace('€', '').trim();
        
        tableContent += `
            <tr>
                <td><input type="text" class="form-control category-name-input" value="${category.name}" placeholder="Nom de la catégorie"></td>
                <td><input type="text" class="form-control" placeholder="Enter description"></td>
                <td><input type="text" class="form-control amount-input" value="${amountValue}" data-category="${category.name.toLowerCase()}"></td>
                <td class="action-cell">
                    <button type="button" class="delete-category-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    // Add total row
    tableContent += `
        <tr class="total-row">
            <td colspan="3" class="text-right">Total:</td>
            <td class="total-cell">€ ${total}</td>
        </tr>
    `;
    
    // Update the table content
    tableBody.innerHTML = tableContent;
    
    // Update the total budget input
    document.getElementById('totalBudget').value = `€ ${total}`;
    
    // Update AI advice based on template
    updateAIAdvice(templateType);
}

function updateAIAdvice(templateType) {
    let advice = '';
    
    // Define advice based on template type
    switch (templateType) {
        // 🎉 Événementiels
        case 'Anniversaire':
            advice = 'Pensez à réserver l\'animation au moins deux semaines à l\'avance.';
            break;
        case 'Mariage':
            advice = 'Prévoyez 5-10% de budget supplémentaire pour les imprévus de dernière minute.';
            break;
        case 'Baby shower':
            advice = 'Pensez à des animations adaptées pour tous les invités, pas uniquement centrées sur bébé.';
            break;
        case 'Fête d\'entreprise':
            advice = 'Vérifiez les restrictions alimentaires de vos invités avant de finaliser le menu.';
            break;
        case 'Célébration religieuse':
            advice = 'Confirmez les exigences spécifiques du lieu de culte bien à l\'avance.';
            break;
            
        // 🏠 Vie personnelle
        case 'Budget mensuel':
            advice = 'Réservez 10% de votre budget pour les dépenses imprévues.';
            break;
        case 'Déménagement':
            advice = 'Demandez plusieurs devis pour la société de déménagement pour comparer les prix.';
            break;
        case 'Rentrée scolaire':
            advice = 'Établissez une liste précise avant les achats pour éviter les dépenses superflues.';
            break;
        case 'Fêtes de fin d\'année':
            advice = 'Commencez vos achats de cadeaux tôt pour éviter le stress et les ruptures de stock.';
            break;
        case 'Vacances':
            advice = 'Réservez transport et hébergement en avance pour bénéficier des meilleurs tarifs.';
            break;
            
        // 💼 Projets professionnels
        case 'Lancement de produit':
            advice = 'Prévoyez un budget de contingence d\'au moins 15% pour les imprévus.';
            break;
        case 'Création de site web':
            advice = 'N\'oubliez pas d\'inclure les coûts de maintenance annuels dans votre budget.';
            break;
        case 'Campagne marketing':
            advice = 'Testez votre campagne sur un petit segment avant le déploiement complet.';
            break;
        case 'Formation professionnelle':
            advice = 'Vérifiez les possibilités de prise en charge par votre entreprise ou un organisme.';
            break;
        case 'Lancement d\'entreprise':
            advice = 'Prévoyez suffisamment de trésorerie pour couvrir 6 mois de fonctionnement sans revenus.';
            break;
            
        // 💰 Objectifs financiers
        case 'Épargne mensuelle':
            advice = 'Automatisez vos virements d\'épargne dès réception de votre salaire.';
            break;
        case 'Remboursement de dettes':
            advice = 'Commencez par rembourser les dettes aux taux d\'intérêt les plus élevés.';
            break;
        case 'Projet "Gros achat"':
            advice = 'Comparez plusieurs modèles et vendeurs pour obtenir le meilleur rapport qualité-prix.';
            break;
            
        // 🤝 Collectifs & communautaires
        case 'Cagnotte / tontine':
            advice = 'Établissez des règles claires dès le départ pour éviter les malentendus.';
            break;
        case 'Association caritative':
            advice = 'Recherchez des partenariats pour réduire vos coûts opérationnels.';
            break;
        case 'Budget réunion / AG':
            advice = 'Pensez à des alternatives numériques pour réduire les coûts de documentation.';
            break;
        case 'Fonds commun':
            advice = 'Utilisez une application de partage de dépenses pour faciliter la gestion.';
            break;
            
        // Personnalisé
        case 'Personnalisé':
            advice = 'Établissez un calendrier détaillé pour gérer efficacement vos dépenses.';
            break;
    }
    
    // Update the advice text
    const adviceElement = document.querySelector('.ai-advice p');
    if (adviceElement) {
        adviceElement.textContent = advice;
    }
}

function initializeBudgetCalculation() {
    console.log('Budget calculation initialized');
    
    // Ajouter des gestionnaires d'événements pour les champs de montant
    document.addEventListener('input', function(e) {
        if (e.target && e.target.classList.contains('amount-input')) {
            updateTotalBudget();
        }
    });
    
    // Mise à jour initiale
    updateTotalBudget();
}

// Fonction pour initialiser les boutons de suppression de catégorie
function initializeDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.delete-category-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Trouver la ligne parente (tr) et la supprimer
            const row = this.closest('tr');
            if (row) {
                row.remove();
                
                // Mettre à jour le total après la suppression
                updateTotalBudget();
            }
        });
    });
}

// Fonction pour ajouter une nouvelle catégorie
function addNewCategory() {
    // Trouver le tableau
    const tableBody = document.querySelector('.expense-table tbody');
    
    // Trouver la ligne du total
    const totalRow = document.querySelector('.total-row');
    
    if (tableBody && totalRow) {
        // Créer une nouvelle ligne avant la ligne du total
        const newRow = document.createElement('tr');
        
        // ID unique pour cette nouvelle catégorie
        const uniqueId = 'category-' + Date.now();
        
        // Contenu de la nouvelle ligne
        newRow.innerHTML = `
            <td>
                <input type="text" class="form-control category-name-input" placeholder="Nom de la catégorie" value="Nouvelle catégorie">
            </td>
            <td>
                <input type="text" class="form-control" placeholder="Enter description">
            </td>
            <td>
                <input type="text" class="form-control amount-input" value="0" data-category="${uniqueId}">
            </td>
            <td class="action-cell">
                <button type="button" class="delete-category-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        // Insérer avant la ligne du total
        tableBody.insertBefore(newRow, totalRow);
        
        // Initialiser le bouton de suppression pour cette nouvelle catégorie
        const deleteButton = newRow.querySelector('.delete-category-btn');
        deleteButton.addEventListener('click', function() {
            newRow.remove();
            updateTotalBudget();
        });
        
        // Mettre à jour le total
        updateTotalBudget();
        
        // Focus sur le champ du nom de la catégorie pour une modification immédiate
        const nameInput = newRow.querySelector('input[placeholder="Nom de la catégorie"]');
        if (nameInput) {
            nameInput.focus();
            nameInput.select();
        }
    }
}

function updateTotalBudget() {
    let total = 0;
    const amountInputs = document.querySelectorAll('.amount-input');
    
    // Calculer le total à partir de tous les champs de montant
    amountInputs.forEach(input => {
        const value = input.value.trim();
        // Extraire seulement les chiffres
        const amount = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
        total += amount;
    });
    
    // Mettre à jour l'affichage du total
    const totalElement = document.querySelector('.total-row td:last-child');
    if (totalElement) {
        totalElement.textContent = `€ ${total}`;
        totalElement.className = 'total-cell';
    }
    
    // Mettre à jour le champ de budget total
    const totalBudget = document.getElementById('totalBudget');
    if (totalBudget) {
        totalBudget.value = `€ ${total}`;
    }
}