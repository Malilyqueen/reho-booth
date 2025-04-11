// Fichier fonctionnel basique pour garantir les fonctionnalités essentielles.
// Aucune fonctionnalité expérimentale ou avancée.
// Juste le minimum pour garantir que les champs sont modifiables.

document.addEventListener('DOMContentLoaded', function() {
    console.log("Initialisation des champs modifiables basiques...");
    
    // Empêcher la soumission du formulaire par Enter
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            return false;
        });
    });
    
    // Rendre tous les champs de montant modifiables
    makeFieldsEditable();
    
    // Initialiser le datepicker sans perturbation
    initBasicDatepicker();
    
    // Initialiser les calculs simples de budget
    initSimpleBudgetCalc();
});

// Fonction pour rendre les champs modifiables
function makeFieldsEditable() {
    // 1. S'assurer que tous les champs input sont bien modifiables
    document.querySelectorAll('input').forEach(input => {
        input.readOnly = false;
        input.setAttribute('autocomplete', 'off');
    });
    
    // 2. S'assurer que les champs contentEditable le sont vraiment
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
        el.addEventListener('focus', function() {
            // Sauvegarde de la valeur originale pour pouvoir restaurer
            this.setAttribute('data-original', this.textContent);
        });
        
        el.addEventListener('blur', function() {
            // Récalculer les totaux si nécessaire
            if (this.classList.contains('expense-line-amount') ||
                this.classList.contains('subcategory-amount') ||
                this.classList.contains('category-amount')) {
                setTimeout(function() {
                    updateTotals();
                }, 100);
            }
        });
    });
    
    // 3. Spécifiquement pour les noms et montants des catégories/sous-catégories
    document.querySelectorAll('.category-name, .subcategory-name, .expense-line-name, .category-amount, .subcategory-amount, .expense-line-amount').forEach(el => {
        // Rendre explicitement éditable
        el.contentEditable = true;
        
        // Ajouter un style pour indiquer clairement qu'ils sont modifiables
        // Seulement si ce n'est pas déjà fait
        if (!el.classList.contains('editable-highlighted')) {
            el.classList.add('editable-highlighted');
            el.style.border = '1px dashed #ccc';
            el.style.padding = '2px 5px';
            el.style.borderRadius = '3px';
            el.style.minWidth = '50px';
            el.style.display = 'inline-block';
            
            // Au survol
            el.addEventListener('mouseover', function() {
                this.style.backgroundColor = '#f9f9f9';
                this.style.cursor = 'pointer';
            });
            
            el.addEventListener('mouseout', function() {
                this.style.backgroundColor = '';
            });
            
            // Au focus
            el.addEventListener('focus', function() {
                this.style.border = '1px solid #4CAF50';
                this.style.boxShadow = '0 0 3px rgba(76, 175, 80, 0.5)';
                this.style.backgroundColor = '#f9f9f9';
            });
            
            el.addEventListener('blur', function() {
                this.style.border = '1px dashed #ccc';
                this.style.boxShadow = 'none';
                this.style.backgroundColor = '';
            });
        }
    });
    
    // 4. Ajouter une légende d'aide si elle n'existe pas déjà
    if (!document.querySelector('.edit-help-notice')) {
        const formContainer = document.querySelector('form') || document.querySelector('.content');
        if (formContainer) {
            const helpNotice = document.createElement('div');
            helpNotice.className = 'edit-help-notice';
            helpNotice.innerHTML = '<i class="fas fa-info-circle"></i> Cliquez sur les champs encadrés pour les modifier.';
            helpNotice.style.backgroundColor = '#e3f2fd';
            helpNotice.style.color = '#0d47a1';
            helpNotice.style.padding = '8px 15px';
            helpNotice.style.borderRadius = '4px';
            helpNotice.style.margin = '15px 0';
            helpNotice.style.fontSize = '14px';
            
            // Insérer au début du formulaire
            formContainer.insertBefore(helpNotice, formContainer.firstChild);
        }
    }
}

// Initialiser le datepicker de manière simple
function initBasicDatepicker() {
    // Utiliser flatpickr pour les dates sans perturber le reste
    if (typeof flatpickr === 'function') {
        flatpickr('#projectDate', {
            dateFormat: 'd/m/Y',
            locale: 'fr',
            allowInput: true
        });

        flatpickr('#projectEndDate', {
            dateFormat: 'd/m/Y',
            locale: 'fr',
            allowInput: true
        });
    }
}

// Calcul simplifiée du budget sans toucher aux champs lors de l'édition
function initSimpleBudgetCalc() {
    // Calculer les totaux au chargement initial
    setTimeout(updateTotals, 500);
    
    // Observer les changements manuels
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('expense-line-amount') ||
            e.target.classList.contains('subcategory-amount') ||
            e.target.classList.contains('category-amount') ||
            e.target.id === 'totalBudget') {
            
            setTimeout(updateTotals, 300);
        }
    });
    
    // Observer les clics sur boutons d'ajout/suppression
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-subcategory-btn') ||
            e.target.classList.contains('add-expense-line-btn') ||
            e.target.classList.contains('delete-category-btn') ||
            e.target.classList.contains('delete-subcategory-btn') ||
            e.target.classList.contains('delete-line-btn')) {
            
            setTimeout(updateTotals, 300);
        }
    });
}

// Fonction pour mettre à jour les totaux selon la logique en cascade
function updateTotals() {
    console.log("Mise à jour des totaux selon la logique en cascade...");
    
    try {
        // Ne pas mettre à jour les champs en cours d'édition
        const activeElement = document.activeElement;
        const currencySymbol = getCurrencyFromPage() || '€';
        
        // 1. Calculer les totaux des sous-catégories (seulement s'il y a des lignes)
        document.querySelectorAll('.subcategory').forEach(subcategory => {
            const lines = subcategory.querySelectorAll('.expense-line');
            const amountEl = subcategory.querySelector('.subcategory-amount');
            
            // Ne rien faire si c'est en cours d'édition
            if (amountEl === activeElement) {
                return;
            }
            
            // Si des lignes existent, calculer automatiquement le total
            if (lines.length > 0) {
                let total = 0;
                lines.forEach(line => {
                    const lineAmountEl = line.querySelector('.expense-line-amount');
                    if (lineAmountEl) {
                        const amount = parseAmount(lineAmountEl.textContent || lineAmountEl.value || '0');
                        total += amount;
                    }
                });
                
                // Mise à jour du montant de la sous-catégorie (en lecture seule)
                if (amountEl) {
                    amountEl.textContent = formatMoney(total, currencySymbol);
                    
                    // Rendre en lecture seule si des lignes existent
                    amountEl.setAttribute('data-has-lines', 'true');
                    amountEl.style.backgroundColor = '#f5f5f5';
                    amountEl.style.fontStyle = 'italic';
                    
                    // Ajouter un indicateur visuel
                    if (!amountEl.getAttribute('title')) {
                        amountEl.setAttribute('title', 'Calculé automatiquement à partir des lignes');
                    }
                }
            } 
            // Sinon, laisser l'utilisateur éditer librement
            else if (amountEl) {
                amountEl.removeAttribute('data-has-lines');
                amountEl.style.backgroundColor = '';
                amountEl.style.fontStyle = 'normal';
                
                // Laisser l'utilisateur modifier le montant
                if (!amountEl.getAttribute('title') || amountEl.getAttribute('title').includes('automatiquement')) {
                    amountEl.setAttribute('title', 'Montant modifiable');
                }
            }
        });
        
        // 2. Calculer les totaux des catégories (seulement s'il y a des sous-catégories)
        document.querySelectorAll('.expense-category').forEach(category => {
            const subcategories = category.querySelectorAll('.subcategory');
            const amountEl = category.querySelector('.category-amount');
            
            // Ne rien faire si c'est en cours d'édition
            if (amountEl === activeElement) {
                return;
            }
            
            // Si des sous-catégories existent, calculer automatiquement le total
            if (subcategories.length > 0) {
                let total = 0;
                subcategories.forEach(subcategory => {
                    const subcatAmountEl = subcategory.querySelector('.subcategory-amount');
                    if (subcatAmountEl) {
                        const amount = parseAmount(subcatAmountEl.textContent || '0');
                        total += amount;
                    }
                });
                
                // Mise à jour du montant de la catégorie (en lecture seule)
                if (amountEl) {
                    amountEl.textContent = formatMoney(total, currencySymbol);
                    
                    // Rendre en lecture seule si des sous-catégories existent
                    amountEl.setAttribute('data-has-subcategories', 'true');
                    amountEl.style.backgroundColor = '#f5f5f5';
                    amountEl.style.fontStyle = 'italic';
                    
                    // Ajouter un indicateur visuel
                    if (!amountEl.getAttribute('title')) {
                        amountEl.setAttribute('title', 'Calculé automatiquement à partir des sous-catégories');
                    }
                }
            } 
            // Sinon, laisser l'utilisateur éditer librement
            else if (amountEl) {
                amountEl.removeAttribute('data-has-subcategories');
                amountEl.style.backgroundColor = '';
                amountEl.style.fontStyle = 'normal';
                
                // Laisser l'utilisateur modifier le montant
                if (!amountEl.getAttribute('title') || amountEl.getAttribute('title').includes('automatiquement')) {
                    amountEl.setAttribute('title', 'Montant modifiable');
                }
            }
        });
        
        // 3. Calculer le total général (toujours automatique)
        const totalBudgetDisplay = document.querySelector('.total-budget-amount');
        if (totalBudgetDisplay && totalBudgetDisplay !== activeElement) {
            let grandTotal = 0;
            document.querySelectorAll('.category-amount').forEach(el => {
                const val = parseAmount(el.textContent || '0');
                grandTotal += val;
            });
            
            // Mise à jour du total global
            totalBudgetDisplay.textContent = formatMoney(grandTotal, currencySymbol);
            
            // Mettre à jour le champ input si présent et pas en focus
            const totalInput = document.getElementById('totalBudget');
            if (totalInput && totalInput !== activeElement) {
                totalInput.value = formatMoney(grandTotal, currencySymbol);
            }
        }
    } catch (err) {
        console.error("Erreur lors de la mise à jour des totaux:", err);
    }
}

// Fonction pour obtenir le symbole de devise de n'importe quel élément de la page
function getCurrencyFromPage() {
    // Essayer avec le budget total
    const totalBudget = document.getElementById('totalBudget');
    if (totalBudget && totalBudget.value) {
        const match = totalBudget.value.match(/^([^\d]+)/);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    
    // Essayer avec un montant de catégorie
    const categoryAmount = document.querySelector('.category-amount');
    if (categoryAmount) {
        const match = categoryAmount.textContent.match(/^([^\d]+)/);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    
    // Essayer avec l'affichage du budget total
    const totalDisplay = document.querySelector('.total-budget-amount');
    if (totalDisplay) {
        const match = totalDisplay.textContent.match(/^([^\d]+)/);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    
    // Valeur par défaut selon les préférences utilisateur
    try {
        const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        if (preferences.currency) {
            const symbols = {
                'EUR': '€',
                'USD': '$',
                'GBP': '£',
                'JPY': '¥',
                'MAD': 'DH',
                'AED': 'AED'
            };
            return symbols[preferences.currency] || preferences.currency;
        }
    } catch (e) {
        console.error("Erreur lors de la récupération des préférences:", e);
    }
    
    // Valeur par défaut
    return '€';
}

// Formater un montant monétaire
function formatMoney(amount, currencySymbol = '€') {
    return `${currencySymbol} ${amount.toFixed(2).replace('.', ',')}`;
}

// Extraire le montant numérique d'une chaîne (ex: "€ 123,45" -> 123.45)
function parseAmount(value) {
    if (!value) return 0;
    
    // Extraire uniquement les chiffres et le séparateur décimal
    const numericValue = value.toString().replace(/[^0-9,\.]/g, '');
    
    // Gérer le format européen (virgule comme séparateur décimal)
    const normalizedValue = numericValue.replace(',', '.');
    
    return parseFloat(normalizedValue) || 0;
}

// Extraire le symbole de devise d'une chaîne (ex: "€ 123,45" -> "€")
function getCurrencySymbol(value) {
    if (!value) return '€';
    
    const match = value.toString().match(/^([^\d]+)/);
    if (match && match[1]) {
        return match[1].trim();
    }
    
    return '€';
}