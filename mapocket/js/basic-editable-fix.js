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
    
    // Configurer le système de calcul en cascade intelligent
    setupCascadeEvents();
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

// Fonction pour mettre à jour les totaux selon la logique en cascade précise
function updateTotals() {
    console.log("Mise à jour des totaux selon la logique en cascade...");
    
    try {
        // Ne pas mettre à jour les champs en cours d'édition
        const activeElement = document.activeElement;
        const currencySymbol = getCurrencyFromPage() || '€';
        
        // 1. Calculer les totaux des sous-catégories (SEULEMENT si des lignes existent)
        document.querySelectorAll('.subcategory').forEach(subcategory => {
            const lines = subcategory.querySelectorAll('.expense-line');
            const amountEl = subcategory.querySelector('.subcategory-amount');
            
            // Ne pas calculer si en cours d'édition ou si l'élément n'existe pas
            if (!amountEl || amountEl === activeElement) {
                return;
            }
            
            // LOGIQUE PRÉCISE: 
            // Si des lignes existent ET qu'il s'agit de vraies lignes avec du contenu (pas vides),
            // alors calculer automatiquement et rendre le champ non modifiable
            let hasRealLines = false;
            let validLines = [];
            
            // Vérifier si nous avons des lignes réelles (pas vides ou par défaut)
            if (lines.length > 0) {
                lines.forEach(line => {
                    const nameEl = line.querySelector('.expense-line-name');
                    const amountLineEl = line.querySelector('.expense-line-amount');
                    
                    // Une ligne est considérée comme réelle si elle a un nom et un montant non vides
                    if (nameEl && amountLineEl) {
                        const name = nameEl.textContent.trim();
                        const amount = parseAmount(amountLineEl.textContent || amountLineEl.value || '0');
                        
                        // Vérifier que le nom existe et n'est pas par défaut, et que le montant n'est pas 0
                        if (name && name !== '' && name !== 'Ligne' && name !== 'default' && amount > 0) {
                            hasRealLines = true;
                            validLines.push({name, amount});
                        }
                    }
                });
            }
            
            // Si nous avons de vraies lignes avec du contenu, calculer automatiquement
            if (hasRealLines && validLines.length > 0) {
                let total = 0;
                validLines.forEach(line => {
                    total += line.amount;
                });
                
                // Mise à jour du montant de la sous-catégorie (en lecture seule)
                amountEl.textContent = formatMoney(total, currencySymbol);
                
                // Indiquer clairement que ce champ est calculé automatiquement
                amountEl.setAttribute('data-has-lines', 'true');
                amountEl.setAttribute('data-calculated', 'true');
                amountEl.contentEditable = 'false'; // Explicitement non modifiable
                amountEl.style.backgroundColor = '#f5f5f5';
                amountEl.style.fontStyle = 'italic';
                amountEl.style.cursor = 'not-allowed';
                amountEl.style.border = '1px dashed #ccc';
                
                // Ajouter info-bulle
                amountEl.setAttribute('title', 'Montant calculé automatiquement à partir des lignes');
                
                // Ajouter un indicateur visuel
                if (!amountEl.querySelector('.auto-indicator')) {
                    const indicator = document.createElement('small');
                    indicator.className = 'auto-indicator';
                    indicator.textContent = ' 🔄';
                    indicator.style.fontSize = '80%';
                    indicator.style.color = '#6c757d';
                    indicator.title = 'Calculé automatiquement';
                    amountEl.appendChild(indicator);
                }
            } 
            // LOGIQUE PRÉCISE: Si AUCUNE ligne réelle n'existe, laisser l'utilisateur saisir librement
            else {
                amountEl.removeAttribute('data-has-lines');
                amountEl.removeAttribute('data-calculated');
                amountEl.contentEditable = 'true'; // Explicitement modifiable
                amountEl.style.backgroundColor = '';
                amountEl.style.fontStyle = 'normal';
                amountEl.style.cursor = 'text';
                amountEl.style.border = '1px dashed #ccc';
                
                // Supprimer l'indicateur automatique s'il existe
                const indicator = amountEl.querySelector('.auto-indicator');
                if (indicator) {
                    indicator.remove();
                }
                
                // Info-bulle
                amountEl.setAttribute('title', 'Montant modifiable directement');
            }
        });
        
        // 2. Calculer les totaux des catégories (SEULEMENT si des sous-catégories existent)
        document.querySelectorAll('.expense-category').forEach(category => {
            const subcategories = category.querySelectorAll('.subcategory');
            const amountEl = category.querySelector('.category-amount');
            
            // Ne pas calculer si en cours d'édition ou si l'élément n'existe pas
            if (!amountEl || amountEl === activeElement) {
                return;
            }
            
            // LOGIQUE PRÉCISE: Si des sous-catégories existent ET ont des montants valides,
            // alors on calcule automatiquement
            let hasRealSubcategories = false;
            let validSubcats = [];
            
            // Vérifier si nous avons des sous-catégories réelles (pas vides)
            if (subcategories.length > 0) {
                subcategories.forEach(subcategory => {
                    const nameEl = subcategory.querySelector('.subcategory-name');
                    const subcatAmountEl = subcategory.querySelector('.subcategory-amount');
                    
                    if (nameEl && subcatAmountEl) {
                        const name = nameEl.textContent.trim();
                        const amount = parseAmount(subcatAmountEl.textContent || subcatAmountEl.value || '0');
                        
                        // Une sous-catégorie est considérée comme réelle si elle a un nom non vide 
                        // et un montant non nul
                        if (name && name !== '' && amount > 0) {
                            hasRealSubcategories = true;
                            validSubcats.push({name, amount});
                        }
                    }
                });
            }
            
            // Si nous avons de vraies sous-catégories, calculer automatiquement
            if (hasRealSubcategories && validSubcats.length > 0) {
                let total = 0;
                validSubcats.forEach(subcat => {
                    total += subcat.amount;
                });
                
                // Mise à jour du montant de la catégorie (en lecture seule)
                amountEl.textContent = formatMoney(total, currencySymbol);
                
                // Indiquer clairement que ce champ est calculé automatiquement
                amountEl.setAttribute('data-has-subcategories', 'true');
                amountEl.setAttribute('data-calculated', 'true');
                amountEl.contentEditable = 'false'; // Explicitement non modifiable
                amountEl.style.backgroundColor = '#f5f5f5';
                amountEl.style.fontStyle = 'italic';
                amountEl.style.cursor = 'not-allowed';
                amountEl.style.border = '1px dashed #ccc';
                
                // Ajouter info-bulle
                amountEl.setAttribute('title', 'Montant calculé automatiquement à partir des sous-catégories');
                
                // Ajouter un indicateur visuel
                if (!amountEl.querySelector('.auto-indicator')) {
                    const indicator = document.createElement('small');
                    indicator.className = 'auto-indicator';
                    indicator.textContent = ' 🔄';
                    indicator.style.fontSize = '80%';
                    indicator.style.color = '#6c757d';
                    indicator.title = 'Calculé automatiquement';
                    amountEl.appendChild(indicator);
                }
            } 
            // LOGIQUE PRÉCISE: Si AUCUNE sous-catégorie réelle n'existe, 
            // laisser l'utilisateur saisir librement
            else {
                amountEl.removeAttribute('data-has-subcategories');
                amountEl.removeAttribute('data-calculated');
                amountEl.contentEditable = 'true'; // Explicitement modifiable
                amountEl.style.backgroundColor = '';
                amountEl.style.fontStyle = 'normal';
                amountEl.style.cursor = 'text';
                amountEl.style.border = '1px dashed #ccc';
                
                // Supprimer l'indicateur automatique s'il existe
                const indicator = amountEl.querySelector('.auto-indicator');
                if (indicator) {
                    indicator.remove();
                }
                
                // Info-bulle
                amountEl.setAttribute('title', 'Montant modifiable directement');
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
            
            // Indiquer clairement que le budget total est calculé
            if (!totalBudgetDisplay.querySelector('.auto-indicator')) {
                const indicator = document.createElement('small');
                indicator.className = 'auto-indicator';
                indicator.textContent = ' 🔄';
                indicator.style.fontSize = '80%';
                indicator.style.color = '#6c757d';
                indicator.title = 'Calculé automatiquement';
                totalBudgetDisplay.appendChild(indicator);
            }
        }
    } catch (err) {
        console.error("Erreur lors de la mise à jour des totaux:", err);
    }
}

// Configurer les événements pour surveiller les modifications et actualiser les totaux
function setupCascadeEvents() {
    console.log("Configuration des événements pour la cascade des calculs");

    // 1. Observer les suppressions d'éléments
    document.addEventListener('click', function(e) {
        // Attraper les clics sur les boutons de suppression
        if (e.target.classList.contains('delete-category-btn') || 
            e.target.classList.contains('delete-subcategory-btn') || 
            e.target.classList.contains('delete-line-btn')) {
            
            console.log("Suppression détectée, mise à jour des totaux...");
            setTimeout(updateTotals, 300); // Laisser le temps au DOM de se mettre à jour
        }
    });

    // 2. Observer les ajouts d'éléments
    document.addEventListener('click', function(e) {
        // Attraper les clics sur les boutons d'ajout
        if (e.target.classList.contains('add-category-btn') || 
            e.target.classList.contains('add-subcategory-btn') || 
            e.target.classList.contains('add-expense-line-btn')) {
            
            console.log("Ajout détecté, mise à jour des totaux...");
            setTimeout(updateTotals, 300); // Laisser le temps au DOM de se mettre à jour
        }
    });

    // 3. Observer les modifications de valeurs
    document.addEventListener('input', function(e) {
        // Vérifier si l'élément modifié est un montant
        if (e.target.classList.contains('expense-line-amount') || 
            e.target.classList.contains('subcategory-amount') || 
            e.target.classList.contains('category-amount') ||
            e.target.id === 'totalBudget') {
            
            console.log("Modification de montant détectée, mise à jour des totaux...");
            setTimeout(updateTotals, 300);
        }
    });

    // 4. Observer la fin de modification (pour s'assurer que les totaux sont mis à jour)
    document.addEventListener('blur', function(e) {
        // Vérifier si l'élément qui perd le focus est un montant
        if (e.target.classList.contains('expense-line-amount') || 
            e.target.classList.contains('subcategory-amount') || 
            e.target.classList.contains('category-amount') ||
            e.target.id === 'totalBudget') {
            
            console.log("Fin d'édition d'un montant, mise à jour des totaux...");
            setTimeout(updateTotals, 300);
        }
    });

    // Exécuter une première fois
    setTimeout(updateTotals, 500);
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