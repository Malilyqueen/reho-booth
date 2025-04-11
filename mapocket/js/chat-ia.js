// JavaScript for the AI Chat page

document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Chat page initialized');
    
    // Initialize the chat functionality
    initializeChat();
    
    // Initialize topic suggestions
    initializeTopics();
    
    // Initialize chat history
    initializeHistory();
});

function initializeChat() {
    const chatInput = document.querySelector('.chat-input');
    const sendButton = document.querySelector('.chat-send-btn');
    const chatMessages = document.querySelector('.chat-messages');
    
    // Sample AI responses for demonstration purposes
    const aiResponses = {
        "budget": "Pour établir un budget efficace, je vous recommande d'utiliser la règle des 50-30-20 : 50% pour les besoins essentiels, 30% pour les loisirs et plaisirs, et 20% pour l'épargne et le remboursement des dettes. Basé sur vos revenus actuels, cela représenterait environ 1250AED pour les besoins essentiels, 750AED pour les loisirs, et 500AED pour l'épargne.",
        "économiser": "D'après l'analyse de vos dépenses, voici trois domaines où vous pourriez économiser :\n1. Réduire les abonnements inutilisés (40AED/mois)\n2. Optimiser vos courses alimentaires (environ 120AED/mois)\n3. Regrouper vos assurances chez un même fournisseur (économie potentielle de 15-20%)",
        "investir": "Pour un profil comme le vôtre avec un horizon d'investissement de 10+ ans, je recommanderais une répartition équilibrée : 60% en ETF actions mondiales, 30% en obligations, et 10% en liquidités. Cette diversification offre un bon équilibre entre croissance potentielle et protection contre les fluctuations du marché.",
        "immobilier": "Pour votre projet d'achat immobilier avec un budget de 250 000AED, voici les étapes clés :\n1. Épargner pour l'apport (idéalement 10-20%, soit 25 000-50 000AED)\n2. Vérifier votre capacité d'emprunt (environ 4.5 fois vos revenus annuels nets)\n3. Prévoir un budget additionnel pour les frais de notaire (~8-10% du prix d'achat)",
        "crédit": "Basé sur vos revenus et charges actuels, vous pourriez emprunter environ 180 000AED sur 25 ans. Avec le taux moyen actuel de 3.4%, cela représenterait une mensualité d'environ 890AED/mois, soit 33% de vos revenus nets.",
        "retraite": "Pour préparer votre retraite, je vous recommande de commencer à épargner 10-15% de vos revenus mensuels dans un plan d'épargne retraite. À votre âge, avec un placement à 4% de rendement annuel moyen, cela pourrait vous constituer un capital d'environ 320 000AED d'ici 30 ans."
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
            const messageContainer = document.querySelector('.message-container');
            const loadingId = 'loading-' + Date.now();
            const loadingHTML = `
                <div class="message assistant" id="${loadingId}">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <p class="loading-message">
                            <span class="loading-dot">.</span>
                            <span class="loading-dot">.</span>
                            <span class="loading-dot">.</span>
                        </p>
                    </div>
                </div>
            `;
            messageContainer.insertAdjacentHTML('beforeend', loadingHTML);
            scrollToBottom();
            
            // Animations pour les points de chargement
            let dotIndex = 0;
            const loadingInterval = setInterval(() => {
                const dots = document.querySelectorAll(`#${loadingId} .loading-dot`);
                dots.forEach((dot, index) => {
                    if (index === dotIndex % 3) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
                dotIndex++;
            }, 300);
            
            // Appel API à Claude via notre serveur Flask
            fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    budget_context: {
                        type: "général",  // Pourrait être dynamique selon la conversation
                        montant: 1000,
                        postes: ["logement", "nourriture", "loisirs", "épargne"]
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
        const messageContainer = document.querySelector('.message-container');
        const now = new Date();
        const timeString = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
        
        let messageHTML = '';
        
        if (sender === 'user') {
            messageHTML = `
                <div class="message user">
                    <div class="message-content">
                        <p>${message}</p>
                    </div>
                    <div class="message-info">
                        <span class="message-time">${timeString}</span>
                    </div>
                </div>
            `;
        } else {
            // Formatter le message pour préserver les listes et la structure
            let formattedMessage = message;
            
            // Gérer les listes numérotées (1. Item)
            formattedMessage = formattedMessage.replace(/(\d+\.\s+[^\n]+)/g, '<li>$1</li>');
            if (formattedMessage.includes('<li>')) {
                formattedMessage = formattedMessage.replace(/<li>/g, '<ol><li>');
                formattedMessage = formattedMessage.replace(/<\/li>([^<])/g, '</li></ol>$1');
                formattedMessage = formattedMessage.replace(/<\/ol><ol>/g, '');
            }
            
            // Gérer les listes à puces (- Item ou • Item)
            formattedMessage = formattedMessage.replace(/([•\-]\s+[^\n]+)/g, '<li>$1</li>');
            if (formattedMessage.includes('<li>') && !formattedMessage.includes('<ol>')) {
                formattedMessage = formattedMessage.replace(/<li>/g, '<ul><li>');
                formattedMessage = formattedMessage.replace(/<\/li>([^<])/g, '</li></ul>$1');
                formattedMessage = formattedMessage.replace(/<\/ul><ul>/g, '');
            }
            
            // Convertir les sauts de ligne en paragraphes
            const paragraphs = formattedMessage.split('\n\n');
            formattedMessage = paragraphs.map(p => {
                // Ne pas envelopper des listes dans des paragraphes
                if (p.includes('<ul>') || p.includes('<ol>')) {
                    return p;
                }
                // Éviter les paragraphes vides
                if (p.trim() === '') {
                    return '';
                }
                return `<p>${p}</p>`;
            }).join('');
            
            messageHTML = `
                <div class="message assistant">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        ${formattedMessage}
                    </div>
                    <div class="message-info">
                        <span class="message-time">${timeString}</span>
                    </div>
                </div>
            `;
        }
        
        messageContainer.insertAdjacentHTML('beforeend', messageHTML);
        scrollToBottom();
    }
    
    function generateOfflineResponse(message) {
        message = message.toLowerCase();
        
        // Check for keywords in the message
        for (const keyword in aiResponses) {
            if (message.includes(keyword)) {
                return aiResponses[keyword];
            }
        }
        
        // Check if it's about project budget
        if (message.includes('projet') && (message.includes('budget') || message.includes('coût'))) {
            return "Pour votre nouveau projet, je recommande de structurer votre budget comme suit :\n\n1. Identifiez toutes les catégories de dépenses\n2. Ajoutez 15% de marge pour les imprévus\n3. Utilisez notre template de projet dans MaPocket pour suivre les dépenses en temps réel\n4. Configurez des alertes si vous approchez 80% du budget alloué à une catégorie\n\nSouhaitez-vous que je vous aide à créer un projet spécifique ?";
        }
        
        // Default response if no keywords matched
        return "Merci pour votre question. Je peux vous aider à analyser vos finances, créer des budgets personnalisés, et vous donner des conseils d'optimisation. Pourriez-vous préciser votre demande concernant votre budget, vos dépenses ou vos projets financiers ?";
    }
    
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function initializeTopics() {
    const topicButtons = document.querySelectorAll('.topic-btn');
    const chatInput = document.querySelector('.chat-input');
    const sendButton = document.querySelector('.chat-send-btn');
    
    topicButtons.forEach(button => {
        button.addEventListener('click', function() {
            const topic = this.textContent;
            chatInput.value = topic;
            
            // Trigger send button click to send the message
            sendButton.click();
        });
    });
}

function initializeHistory() {
    const historyItems = document.querySelectorAll('.history-list li');
    
    historyItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            historyItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Update chat title and messages
            const title = this.querySelector('.history-title').textContent;
            document.querySelector('.chat-title h3').textContent = title;
            
            // Here you would load the actual chat history
            // For demo purposes, we just clear the current chat
            clearChat();
            
            // Add a welcome message
            addWelcomeMessage();
        });
    });
}

function clearChat() {
    const messageContainer = document.querySelector('.message-container');
    messageContainer.innerHTML = '';
}

function addWelcomeMessage() {
    const messageContainer = document.querySelector('.message-container');
    const welcomeHTML = `
        <div class="message assistant">
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>Bonjour ! Je suis votre assistant financier. Comment puis-je vous aider avec ce sujet aujourd'hui ?</p>
            </div>
            <div class="message-info">
                <span class="message-time">Maintenant</span>
            </div>
        </div>
    `;
    
    messageContainer.insertAdjacentHTML('beforeend', welcomeHTML);
}

// Add CSS class to body when page is loaded
document.body.classList.add('chat-page');