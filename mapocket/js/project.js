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
                const categoryName = row.cells[0].textContent;
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
        case 'Anniversary':
            categories = [
                { name: 'Restaurant', amount: '€ 200' },
                { name: 'Gifts', amount: '€ 150' },
                { name: 'Activities', amount: '€ 100' },
                { name: 'Transportation', amount: '€ 50' }
            ];
            break;
        case 'Birthday':
            categories = [
                { name: 'Catering', amount: '€ 200' },
                { name: 'Decorations', amount: '€ 100' },
                { name: 'Entertainment', amount: '€ 100' },
                { name: 'Gifts', amount: '€ 100' }
            ];
            break;
        case 'Household':
            categories = [
                { name: 'Rent/Mortgage', amount: '€ 800' },
                { name: 'Utilities', amount: '€ 200' },
                { name: 'Groceries', amount: '€ 300' },
                { name: 'Maintenance', amount: '€ 100' }
            ];
            break;
        case 'Business':
            categories = [
                { name: 'Equipment', amount: '€ 500' },
                { name: 'Marketing', amount: '€ 300' },
                { name: 'Services', amount: '€ 400' },
                { name: 'Administration', amount: '€ 200' }
            ];
            break;
        case 'Other':
            categories = [
                { name: 'Category 1', amount: '€ 100' },
                { name: 'Category 2', amount: '€ 100' },
                { name: 'Category 3', amount: '€ 100' }
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
                <td>${category.name}</td>
                <td><input type="text" class="form-control" placeholder="Enter description"></td>
                <td><input type="text" class="form-control amount-input" value="${amountValue}" data-category="${category.name.toLowerCase()}"></td>
            </tr>
        `;
    });
    
    // Add total row
    tableContent += `
        <tr class="total-row">
            <td colspan="2" class="text-right">Total:</td>
            <td>€ ${total}</td>
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
        case 'Anniversary':
            advice = 'Consider booking your restaurant reservation at least two weeks in advance.';
            break;
        case 'Birthday':
            advice = 'Consider booking your entertainment at least two weeks in advance.';
            break;
        case 'Household':
            advice = 'Set aside 10% of your total budget for unexpected expenses.';
            break;
        case 'Business':
            advice = 'Remember to keep all receipts for tax deduction purposes.';
            break;
        case 'Other':
            advice = 'Create a detailed timeline to help manage your expenses effectively.';
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
    }
    
    // Mettre à jour le champ de budget total
    const totalBudget = document.getElementById('totalBudget');
    if (totalBudget) {
        totalBudget.value = `€ ${total}`;
    }
}