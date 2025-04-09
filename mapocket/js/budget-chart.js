// budget-chart.js - Gestion des visualisations des budgets
document.addEventListener('DOMContentLoaded', function() {
    // Variables pour les éléments du graphique
    let budgetChart = null;
    const budgetChartCanvas = document.getElementById('budgetChart');
    const avgBudgetUsageElem = document.getElementById('avgBudgetUsage');
    const avgUsageBarElem = document.getElementById('avgUsageBar');
    const topProjectElem = document.getElementById('topProject');
    const topProjectBarElem = document.getElementById('topProjectBar');

    // Couleurs pour le graphique
    const chartColors = [
        '#457b9d', '#1d3557', '#ffc300', '#6f802b', 
        '#e63946', '#a8dadc', '#f1faee', '#fb8500'
    ];

    // Fonction pour initialiser le graphique si le canvas existe
    function initBudgetChart() {
        if (!budgetChartCanvas) return;

        // Récupérer les projets depuis le localStorage
        const projects = getAllProjects();
        if (!projects || projects.length === 0) {
            showEmptyChart();
            return;
        }

        // Préparer les données pour le graphique
        const chartData = prepareChartData(projects);
        
        // Mise à jour des KPIs
        updateBudgetKPIs(projects);
        
        // Créer le graphique en anneau (doughnut chart)
        createDoughnutChart(chartData);
    }

    // Fonction pour récupérer tous les projets
    function getAllProjects() {
        const projectsJson = localStorage.getItem('projects');
        if (!projectsJson) return [];
        try {
            return JSON.parse(projectsJson);
        } catch (e) {
            console.error('Erreur lors du parsing des projets:', e);
            return [];
        }
    }

    // Fonction pour préparer les données du graphique
    function prepareChartData(projects) {
        const data = {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [],
                borderColor: [],
                borderWidth: 1
            }]
        };

        // Convertir les montants des budgets en nombres
        projects.forEach((project, index) => {
            const projectName = project.projectName;
            let budget = 0;
            
            // Extraction du montant numérique du budget
            if (project.totalBudget) {
                // Supprimer la devise et convertir en nombre
                const budgetString = project.totalBudget.toString().replace(/[^\d,. ]/g, '').trim();
                budget = parseFloat(budgetString.replace(/,/g, '.').replace(/ /g, '')) || 0;
            }
            
            if (budget > 0) {
                data.labels.push(projectName);
                data.datasets[0].data.push(budget);
                data.datasets[0].backgroundColor.push(chartColors[index % chartColors.length]);
                data.datasets[0].borderColor.push('#ffffff');
            }
        });

        return data;
    }

    // Fonction pour créer le graphique en anneau
    function createDoughnutChart(chartData) {
        // Détruire le graphique existant s'il y en a un
        if (budgetChart) {
            budgetChart.destroy();
        }

        // Créer un nouveau graphique
        budgetChart = new Chart(budgetChartCanvas, {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            font: {
                                family: 'Poppins',
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${percentage}% (${getUserCurrencySymbol()} ${value.toLocaleString()})`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Fonction pour mettre à jour les KPIs budgétaires
    function updateBudgetKPIs(projects) {
        if (!avgBudgetUsageElem || !avgUsageBarElem || !topProjectElem || !topProjectBarElem) return;
        
        let totalUsage = 0;
        let topUsage = 0;
        let topProjectName = '-';
        
        // Calculer l'utilisation moyenne et trouver le projet le plus avancé
        projects.forEach(project => {
            let usage = 0;
            
            // Si le projet a une propriété realExpenses, calculer l'utilisation
            if (project.realExpenses && project.totalBudget) {
                // Extraction des montants
                const expensesString = typeof project.realExpenses === 'string' ? 
                    project.realExpenses.replace(/[^\d,. ]/g, '').trim() : 
                    String(project.realExpenses);
                
                const budgetString = project.totalBudget.toString().replace(/[^\d,. ]/g, '').trim();
                
                const expenses = parseFloat(expensesString.replace(/,/g, '.').replace(/ /g, '')) || 0;
                const budget = parseFloat(budgetString.replace(/,/g, '.').replace(/ /g, '')) || 0;
                
                if (budget > 0) {
                    usage = (expenses / budget) * 100;
                    totalUsage += usage;
                    
                    // Vérifier si c'est le projet avec la plus haute utilisation
                    if (usage > topUsage) {
                        topUsage = usage;
                        topProjectName = project.projectName;
                    }
                }
            }
        });
        
        // Calculer l'utilisation moyenne
        const avgUsage = projects.length > 0 ? Math.round(totalUsage / projects.length) : 0;
        
        // Mettre à jour l'affichage
        avgBudgetUsageElem.textContent = `${avgUsage}%`;
        avgUsageBarElem.style.width = `${avgUsage}%`;
        
        // Ajuster la couleur de la barre de progression selon le pourcentage
        if (avgUsage < 30) {
            avgUsageBarElem.style.backgroundColor = '#28a745'; // vert
        } else if (avgUsage < 70) {
            avgUsageBarElem.style.backgroundColor = '#ffc107'; // jaune
        } else {
            avgUsageBarElem.style.backgroundColor = '#dc3545'; // rouge
        }
        
        // Mettre à jour l'affichage du projet le plus avancé
        topProjectElem.textContent = topProjectName !== '-' ? 
            `${topProjectName} (${Math.round(topUsage)}%)` : '-';
        topProjectBarElem.style.width = `${topUsage}%`;
        
        // Ajuster la couleur de la barre de progression selon le pourcentage
        if (topUsage < 30) {
            topProjectBarElem.style.backgroundColor = '#28a745';
        } else if (topUsage < 70) {
            topProjectBarElem.style.backgroundColor = '#ffc107';
        } else {
            topProjectBarElem.style.backgroundColor = '#dc3545';
        }
    }

    // Fonction pour afficher un message quand il n'y a pas de projets
    function showEmptyChart() {
        if (avgBudgetUsageElem) avgBudgetUsageElem.textContent = '0%';
        if (avgUsageBarElem) avgUsageBarElem.style.width = '0%';
        if (topProjectElem) topProjectElem.textContent = '-';
        if (topProjectBarElem) topProjectBarElem.style.width = '0%';
        
        // Si on n'a pas de canvas, pas besoin de continuer
        if (!budgetChartCanvas) return;
        
        // Créer un div contenant le message d'absence de données
        const emptyChart = document.createElement('div');
        emptyChart.className = 'chart-placeholder';
        emptyChart.innerHTML = `
            <i class="fas fa-chart-pie"></i>
            <p>Créez des projets pour voir la répartition des budgets</p>
        `;
        
        // Remplacer le canvas par le message
        budgetChartCanvas.parentNode.replaceChild(emptyChart, budgetChartCanvas);
    }

    // Fonction pour obtenir le symbole de devise de l'utilisateur
    function getUserCurrencySymbol() {
        // Récupérer les préférences utilisateur
        const userPrefs = localStorage.getItem('userPreferences');
        if (!userPrefs) return '€'; // Valeur par défaut
        
        try {
            const prefs = JSON.parse(userPrefs);
            const currencyCode = prefs.currency || 'EUR';
            
            // Récupérer les devises
            const currencies = window.currencies || {};
            const currency = currencies[currencyCode] || {};
            
            return currency.symbol || '€';
        } catch (e) {
            console.error('Erreur lors de la récupération du symbole de devise:', e);
            return '€';
        }
    }

    // Initialiser le graphique lors du chargement de la page
    initBudgetChart();
    
    // Réinitialiser le graphique lorsque des événements de stockage sont déclenchés
    window.addEventListener('storageUpdated', function() {
        initBudgetChart();
    });
});