// JavaScript for the AI Suggestions page

document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Suggestions page initialized');
    
    // Initialize tabs
    initializeTabs();
    
    // Initialize AI chat
    initializeAIChat();
    
    // Load user projects for personalized suggestions
    loadUserProjects();
});

// Objet global pour stocker les projets de l'utilisateur
let userProjects = [];

/**
 * Initialise les onglets de catégories
 */
function initializeTabs() {
    const categoryTabs = document.querySelectorAll('.category-tab');
    const categoryContents = document.querySelectorAll('.category-content');
    
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            categoryTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all content sections
            categoryContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // Show the selected content section
            const category = this.getAttribute('data-category');
            document.getElementById(`${category}-content`).classList.add('active');
        });
    });
}

/**
 * Charge les projets de l'utilisateur depuis le localStorage
 */
function loadUserProjects() {
    try {
        // Récupérer les projets du localStorage
        const savedProjects = localStorage.getItem('savedProjects');
        if (savedProjects) {
            userProjects = JSON.parse(savedProjects);
            console.log('Projets chargés:', userProjects.length);
            
            // Afficher les suggestions pour les projets
            displayProjectSuggestions();
        } else {
            console.log('Aucun projet trouvé dans le localStorage');
            // Afficher un message de suggestion pour créer un projet
            displayNoProjectsMessage();
        }
    } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
    }
}

/**
 * Affiche un message lorsqu'aucun projet n'est disponible
 */
function displayNoProjectsMessage() {
    const projectsContent = document.getElementById('projects-content');
    
    // Vérifier si l'élément existe
    if (projectsContent) {
        projectsContent.innerHTML = `
            <h3>Optimisation de vos projets</h3>
            <div class="no-projects-message">
                <div class="message-icon">
                    <i class="fas fa-folder-plus"></i>
                </div>
                <div class="message-text">
                    <h4>Vous n'avez pas encore de projets</h4>
                    <p>Créez votre premier projet pour recevoir des suggestions personnalisées d'optimisation.</p>
                    <a href="nouveau-projet.html" class="btn btn-primary">
                        <i class="fas fa-folder-plus"></i> Créer un projet
                    </a>
                    <span class="or-separator">ou</span>
                    <a href="assistant-projet.html" class="btn btn-secondary">
                        <i class="fas fa-magic"></i> Créer avec l'IA
                    </a>
                </div>
            </div>
        `;
    }
}

/**
 * Affiche les suggestions pour les projets de l'utilisateur
 */
function displayProjectSuggestions() {
    const projectsContent = document.getElementById('projects-content');
    
    // Vérifier si l'élément existe et qu'il y a des projets
    if (projectsContent && userProjects.length > 0) {
        // Vider le contenu actuel
        projectsContent.innerHTML = `<h3>Optimisation de vos projets</h3>`;
        
        // Identifier les 2 projets les plus récents
        const recentProjects = [...userProjects]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 2);
        
        // Pour chaque projet récent, demander des suggestions à l'API
        recentProjects.forEach(project => {
            // Ajouter une carte de projet avec indicateur de chargement
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.id = `project-card-${project.id}`;
            
            projectCard.innerHTML = `
                <div class="project-header">
                    <h4>${project.projectName}</h4>
                    <span class="project-date">${formatDate(project.projectDate)}</span>
                </div>
                <div class="suggestion-list" id="suggestions-${project.id}">
                    <div class="loading-suggestions">
                        <div class="loading-spinner"></div>
                        <p>Analyse du projet en cours...</p>
                    </div>
                </div>
            `;
            
            projectsContent.appendChild(projectCard);
            
            // Récupérer les suggestions pour ce projet
            getSuggestionsForProject(project);
        });
        
        // Ajouter un bouton pour d'autres suggestions
        if (userProjects.length > 2) {
            const moreProjects = document.createElement('div');
            moreProjects.className = 'more-projects';
            moreProjects.innerHTML = `
                <button class="btn btn-outline">
                    <i class="fas fa-plus-circle"></i> Voir les suggestions pour ${userProjects.length - 2} autre(s) projet(s)
                </button>
            `;
            projectsContent.appendChild(moreProjects);
        }
    }
}

/**
 * Récupère les suggestions pour un projet via l'API
 */
function getSuggestionsForProject(project) {
    // Préparer le contexte pour l'API
    const projectData = {
        type: project.template || 'général',
        nom: project.projectName,
        date: project.projectDate,
        budget_total: parseFloat(project.totalBudget.replace(/[^\d,.-]/g, '').replace(',', '.')),
        categories: project.categories.map(cat => ({
            nom: cat.name,
            montant: parseFloat(cat.amount.replace(/[^\d,.-]/g, '').replace(',', '.'))
        }))
    };
    
    // Récupérer les projets similaires pour historique
    const similarProjects = userProjects
        .filter(p => p.id !== project.id && p.template === project.template)
        .map(p => ({
            type: p.template,
            categories: p.categories.map(cat => ({
                nom: cat.name,
                montant: parseFloat(cat.amount.replace(/[^\d,.-]/g, '').replace(',', '.'))
            }))
        }));
    
    // Appel à l'API pour obtenir des suggestions
    fetch('/api/suggestions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            projet: projectData,
            historique_projets: similarProjects
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Afficher les suggestions
            displaySuggestions(project.id, data.suggestions);
        } else {
            // Afficher un message d'erreur
            displayErrorSuggestions(project.id, data.error || 'Une erreur est survenue lors de l\'analyse du projet.');
        }
    })
    .catch(error => {
        console.error('Erreur lors de la récupération des suggestions:', error);
        // Afficher un message d'erreur
        displayErrorSuggestions(project.id, 'Impossible de se connecter au service de suggestions.');
    });
}

/**
 * Affiche les suggestions pour un projet
 */
function displaySuggestions(projectId, suggestionsText) {
    const suggestionsContainer = document.getElementById(`suggestions-${projectId}`);
    
    if (suggestionsContainer) {
        // Vider le contenu actuel
        suggestionsContainer.innerHTML = '';
        
        // Traiter le texte des suggestions
        const sections = suggestionsText.split('\n\n');
        
        // Parcourir chaque section (suggestion)
        sections.forEach(section => {
            if (section.trim()) {
                const lines = section.split('\n');
                let title = '';
                let content = '';
                
                // Extraire le titre (première ligne)
                if (lines.length > 0) {
                    title = lines[0].replace(/^\d+\.\s+/, '').trim();
                    
                    // Extraire le contenu (reste des lignes)
                    if (lines.length > 1) {
                        content = lines.slice(1).join('\n');
                    }
                }
                
                if (title) {
                    // Créer l'élément de suggestion
                    const suggestionItem = document.createElement('div');
                    suggestionItem.className = 'suggestion-item';
                    
                    // Déterminer l'icône en fonction du contenu
                    let iconClass = 'fas fa-lightbulb';
                    if (title.toLowerCase().includes('économie') || title.toLowerCase().includes('budget')) {
                        iconClass = 'fas fa-percentage';
                    } else if (title.toLowerCase().includes('photographe') || title.toLowerCase().includes('photo')) {
                        iconClass = 'fas fa-camera';
                    } else if (title.toLowerCase().includes('planification') || title.toLowerCase().includes('date')) {
                        iconClass = 'fas fa-calendar-alt';
                    } else if (title.toLowerCase().includes('oubli') || title.toLowerCase().includes('manque')) {
                        iconClass = 'fas fa-exclamation-circle';
                    }
                    
                    // Structure HTML de la suggestion
                    suggestionItem.innerHTML = `
                        <div class="suggestion-icon">
                            <i class="${iconClass}"></i>
                        </div>
                        <div class="suggestion-text">
                            <h5>${title}</h5>
                            <p>${formatSuggestionContent(content)}</p>
                        </div>
                    `;
                    
                    suggestionsContainer.appendChild(suggestionItem);
                }
            }
        });
        
        // Si aucune suggestion n'a été ajoutée
        if (suggestionsContainer.children.length === 0) {
            suggestionsContainer.innerHTML = `
                <div class="no-suggestions">
                    <i class="fas fa-check-circle"></i>
                    <p>Votre projet semble bien optimisé ! Aucune suggestion particulière à proposer.</p>
                </div>
            `;
        }
    }
}

/**
 * Formate le contenu d'une suggestion avec des listes et des mises en forme
 */
function formatSuggestionContent(content) {
    // Remplacer les listes
    content = content.replace(/- /g, '• ');
    content = content.replace(/\* /g, '• ');
    
    // Mettre en gras les montants
    content = content.replace(/(\d+[€\$])/g, '<strong>$1</strong>');
    
    // Remplacer les sauts de ligne par des balises <br>
    content = content.replace(/\n/g, '<br>');
    
    return content;
}

/**
 * Affiche un message d'erreur pour les suggestions
 */
function displayErrorSuggestions(projectId, errorMessage) {
    const suggestionsContainer = document.getElementById(`suggestions-${projectId}`);
    
    if (suggestionsContainer) {
        suggestionsContainer.innerHTML = `
            <div class="error-suggestions">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${errorMessage}</p>
                <button class="btn btn-retry">
                    <i class="fas fa-sync"></i> Réessayer
                </button>
            </div>
        `;
        
        // Ajouter un événement pour réessayer
        const retryButton = suggestionsContainer.querySelector('.btn-retry');
        if (retryButton) {
            retryButton.addEventListener('click', function() {
                // Réafficher le chargement
                suggestionsContainer.innerHTML = `
                    <div class="loading-suggestions">
                        <div class="loading-spinner"></div>
                        <p>Analyse du projet en cours...</p>
                    </div>
                `;
                
                // Récupérer le projet
                const project = userProjects.find(p => p.id === projectId);
                if (project) {
                    // Réessayer d'obtenir des suggestions
                    getSuggestionsForProject(project);
                }
            });
        }
    }
}

/**
 * Initialise le chat IA
 */
function initializeAIChat() {
    const chatInput = document.getElementById('ai-question-input');
    const sendButton = document.querySelector('.send-btn');
    const chatMessages = document.querySelector('.chat-messages');
    
    // Sample AI responses for demonstration purposes (utilisé en mode hors ligne)
    const aiResponses = {
        "budget": "D'après l'analyse de vos dépenses actuelles, vous pourriez optimiser votre budget en réduisant les dépenses non essentielles de 15%. Cela représenterait une économie mensuelle d'environ 120€.",
        "économiser": "Pour économiser efficacement, je vous recommande la règle des 50-30-20 : 50% pour les besoins essentiels, 30% pour les envies, et 20% pour l'épargne. Basé sur vos revenus, vous pourriez épargner environ 300€ par mois.",
        "investir": "Selon votre profil et vos objectifs à long terme, des investissements à faible risque comme les fonds indiciels pourraient vous permettre de faire fructifier votre épargne avec un rendement moyen de 4-6% annuel.",
        "dépenses": "Vos principales catégories de dépenses ce mois-ci sont : Alimentation (32%), Logement (28%), Transport (15%), Loisirs (12%) et Autres (13%). Votre poste 'Loisirs' a augmenté de 20% par rapport au mois dernier.",
        "projet": "Pour votre projet de rénovation, je recommande d'ajouter une marge de sécurité de 15% au budget initial. Basé sur des projets similaires, prévoyez également 10% supplémentaires pour les imprévus.",
        "conseils": "Voici 3 conseils personnalisés : 1) Regroupez vos achats en ligne pour économiser sur les frais de livraison, 2) Envisagez de renégocier votre contrat téléphonique qui semble surévalué, 3) Activez l'épargne automatique pour atteindre plus facilement vos objectifs."
    };
    
    // Nettoyer les messages initiaux de démonstration
    if (chatMessages) {
        // Conserver uniquement le premier message d'accueil
        const welcomeMessage = chatMessages.querySelector('.message.assistant');
        if (welcomeMessage) {
            // Remplacer le contenu des messages
            chatMessages.innerHTML = '';
            const newWelcome = welcomeMessage.cloneNode(true);
            
            // Mettre à jour le contenu du message pour qu'il soit personnalisé
            const messageContent = newWelcome.querySelector('p');
            if (messageContent) {
                messageContent.textContent = userProjects.length > 0 
                    ? `Bonjour ! Je suis votre assistant budgétaire intelligent. J'ai analysé vos ${userProjects.length} projets. Comment puis-je vous aider aujourd'hui ?`
                    : "Bonjour ! Je suis votre assistant budgétaire intelligent. Comment puis-je vous aider aujourd'hui ?";
            }
            
            chatMessages.appendChild(newWelcome);
        }
    }
    
    // Handle send button click
    if (sendButton) {
        sendButton.addEventListener('click', function() {
            sendMessage();
        });
    }
    
    // Handle enter key press
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    function sendMessage() {
        const message = chatInput.value.trim();
        
        if (message) {
            // Add user message to chat
            addMessage(message, 'user');
            
            // Clear input
            chatInput.value = '';
            
            // Afficher un indicateur de chargement
            const loadingId = 'loading-' + Date.now();
            const loadingElement = document.createElement('div');
            loadingElement.classList.add('message', 'assistant');
            loadingElement.id = loadingId;
            
            const loadingContent = document.createElement('p');
            loadingContent.classList.add('loading-message');
            
            for (let i = 0; i < 3; i++) {
                const dot = document.createElement('span');
                dot.classList.add('loading-dot');
                dot.textContent = '.';
                loadingContent.appendChild(dot);
            }
            
            loadingElement.appendChild(loadingContent);
            chatMessages.appendChild(loadingElement);
            
            // Animations pour les points de chargement
            let dotIndex = 0;
            const loadingInterval = setInterval(() => {
                const dots = loadingElement.querySelectorAll('.loading-dot');
                dots.forEach((dot, index) => {
                    if (index === dotIndex % 3) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
                dotIndex++;
            }, 300);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Préparer le contexte budgétaire en fonction des projets
            let budgetContext = {
                type: "budget personnel",
                montant: 2000,
                postes: ["logement", "nourriture", "loisirs", "transport", "épargne"]
            };
            
            // Si l'utilisateur a des projets, utiliser le projet le plus récent comme contexte
            if (userProjects.length > 0) {
                const recentProject = [...userProjects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                
                if (recentProject) {
                    budgetContext = {
                        type: recentProject.template || 'général',
                        montant: parseFloat(recentProject.totalBudget.replace(/[^\d,.-]/g, '').replace(',', '.')),
                        postes: recentProject.categories.map(cat => cat.name)
                    };
                }
            }
            
            // Appel API à Claude via notre serveur Flask
            fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    budget_context: budgetContext
                }),
            })
            .then(response => response.json())
            .then(data => {
                // Supprimer l'indicateur de chargement
                clearInterval(loadingInterval);
                const loadingElement = document.getElementById(loadingId);
                if (loadingElement) {
                    loadingElement.remove();
                }
                
                // Ajouter la réponse de l'API
                if (data.status === 'success') {
                    addMessage(data.response, 'assistant');
                } else {
                    addMessage("Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer.", 'assistant');
                    console.error('Erreur API:', data.error);
                }
            })
            .catch(error => {
                // Supprimer l'indicateur de chargement
                clearInterval(loadingInterval);
                const loadingElement = document.getElementById(loadingId);
                if (loadingElement) {
                    loadingElement.remove();
                }
                
                // Fallback au mode hors ligne si l'API n'est pas disponible
                console.error('Erreur:', error);
                const offlineResponse = generateOfflineResponse(message);
                addMessage(offlineResponse, 'assistant');
                addMessage("Note: Je fonctionne actuellement en mode hors ligne avec des réponses limitées.", 'assistant');
            });
        }
    }
    
    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        
        // Pour les messages de l'assistant, on peut traiter le formatage
        if (sender === 'assistant') {
            // Traiter les sauts de ligne et listes
            const lines = message.split('\n');
            let inList = false;
            let listElement = null;
            
            lines.forEach(line => {
                line = line.trim();
                if (!line) return;
                
                // Détection des listes (numérotées ou à puces)
                const isListItem = /^(\d+[\.\)]\s+|\-\s+|\•\s+)/.test(line);
                
                if (isListItem) {
                    // Commencer une nouvelle liste si nécessaire
                    if (!inList) {
                        inList = true;
                        listElement = document.createElement(/^\d+/.test(line) ? 'ol' : 'ul');
                        messageElement.appendChild(listElement);
                    }
                    
                    // Ajouter l'élément de liste
                    const listItem = document.createElement('li');
                    listItem.textContent = line.replace(/^(\d+[\.\)]\s+|\-\s+|\•\s+)/, '');
                    listElement.appendChild(listItem);
                } else {
                    // Sortir du mode liste si on n'est plus dans une liste
                    inList = false;
                    
                    // Ajouter un paragraphe normal
                    const paragraph = document.createElement('p');
                    paragraph.textContent = line;
                    messageElement.appendChild(paragraph);
                }
            });
        } else {
            // Pour les messages utilisateur, juste un paragraphe simple
            const paragraph = document.createElement('p');
            paragraph.textContent = message;
            messageElement.appendChild(paragraph);
        }
        
        chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function generateOfflineResponse(message) {
        message = message.toLowerCase();
        
        // Check for keywords in the message
        for (const keyword in aiResponses) {
            if (message.includes(keyword)) {
                return aiResponses[keyword];
            }
        }
        
        // Default response if no keywords matched
        return "Je vous remercie pour votre question. Basé sur l'analyse de vos données financières, je peux vous proposer des suggestions personnalisées. Pourriez-vous préciser votre demande concernant votre budget, vos dépenses ou vos projets ?";
    }
}

/**
 * Formate une date au format français
 */
function formatDate(dateStr) {
    if (!dateStr) return 'Non définie';
    
    // Si c'est déjà au format français (JJ/MM/YYYY), on le retourne tel quel
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        return dateStr;
    }
    
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            return dateStr; // Si la date est invalide, on retourne la chaîne originale
        }
        
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch (error) {
        console.error('Erreur lors du formatage de la date:', error);
        return dateStr;
    }
}

// Add CSS class to body when page is loaded
document.body.classList.add('suggestions-page');