// JavaScript for the AI Suggestions page

document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Suggestions page initialized');
    
    // Initialize tabs
    initializeTabs();
    
    // Initialize AI chat
    initializeAIChat();
});

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
    
    // Handle send button click
    sendButton.addEventListener('click', function() {
        sendMessage();
    });
    
    // Handle enter key press
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
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
            
            // Appel API à Claude via notre serveur Flask
            fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    budget_context: {
                        type: "budget personnel",
                        montant: 2000,
                        postes: ["logement", "nourriture", "loisirs", "transport", "épargne"]
                    }
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

// Add CSS class to body when page is loaded
document.body.classList.add('suggestions-page');