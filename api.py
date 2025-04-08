import os
import sys
import json
from flask import Flask, request, jsonify
from anthropic import Anthropic
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

app = Flask(__name__)

# Initialiser le client Anthropic
# Note: the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024
anthropic_key = os.environ.get('ANTHROPIC_API_KEY')
if not anthropic_key:
    print("ERREUR: La clé API ANTHROPIC_API_KEY n'est pas définie dans les variables d'environnement", file=sys.stderr)
    sys.exit(1)

client = Anthropic(api_key=anthropic_key)

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    API pour discuter avec Claude
    
    Exemple de requête:
    {
        "message": "Comment puis-je économiser sur mon budget d'anniversaire?",
        "budget_context": {
            "type": "anniversaire",
            "montant": 500,
            "postes": ["décoration", "nourriture", "cadeaux"]
        }
    }
    """
    try:
        data = request.json
        message = data.get('message', '')
        budget_context = data.get('budget_context', {})
        
        # Construire le message système avec le contexte
        system_prompt = """
        Tu es un assistant financier personnel intelligent nommé MaPocket Assistant.
        Ton rôle est d'aider les utilisateurs à gérer leurs budgets et finances de manière optimale.
        Tu dois toujours donner des conseils pratiques, bienveillants et personnalisés en français.
        
        Voici quelques consignes importantes:
        - Sois précis et concis dans tes réponses
        - Donne des conseils pratiques et réalistes
        - Adapte tes suggestions au contexte budgétaire de l'utilisateur
        - Évite le jargon financier complexe
        - Sois encourageant et positif
        - N'invente pas d'informations ou de chiffres que l'utilisateur n'a pas fournis
        - Respecte la confidentialité et la sensibilité des informations financières
        """
        
        # Ajouter le contexte du budget s'il est fourni
        if budget_context:
            system_prompt += f"""
            Contexte du budget:
            Type de projet: {budget_context.get('type', 'non spécifié')}
            Montant total: {budget_context.get('montant', 'non spécifié')}€
            Postes de dépenses: {', '.join(budget_context.get('postes', ['non spécifié']))}
            
            Adapte tes réponses à ce contexte budgétaire spécifique.
            """
        
        # Appel à l'API Claude
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1000,
            temperature=0.7,
            system=system_prompt,
            messages=[
                {"role": "user", "content": message}
            ]
        )
        
        # Extraire la réponse de Claude
        assistant_response = response.content[0].text
        
        return jsonify({
            "response": assistant_response,
            "status": "success"
        })
        
    except Exception as e:
        print(f"Erreur lors de l'appel à l'API Claude: {str(e)}", file=sys.stderr)
        return jsonify({
            "response": "Désolé, une erreur est survenue. Veuillez réessayer plus tard.",
            "status": "error",
            "error": str(e)
        }), 500

@app.route('/api/create-project', methods=['POST'])
def create_project():
    """
    API pour générer automatiquement un projet structuré à partir d'un prompt utilisateur
    
    Exemple de requête:
    {
        "prompt": "Je dois organiser un mariage indien avec un budget de 32 000 €"
    }
    
    Exemple de réponse:
    {
        "project": {
            "name": "Mariage indien",
            "type": "Mariage",
            "budget_total": 32000,
            "categories": [
                {"nom": "Lieu", "montant": 9000, "icon": "🏰", "description": "Réservation d'un lieu traditionnel"},
                {"nom": "Traiteur", "montant": 7500, "icon": "🍽️", "description": "Cuisine indienne + boissons"},
                {"nom": "Musique", "montant": 2000, "icon": "🎵", "description": "DJ + cérémonie sangeet"},
                {"nom": "Fleurs & déco", "montant": 2500, "icon": "💐", "description": "Décorations florales traditionnelles"},
                {"nom": "Tenues", "montant": 3000, "icon": "👗", "description": "Tenues mariés + famille"},
                {"nom": "Photographe", "montant": 2000, "icon": "📸", "description": "Photo & vidéo du mariage"},
                {"nom": "Transport", "montant": 1500, "icon": "🚗", "description": "Location de voiture, navette invités"},
                {"nom": "Divers", "montant": 4500, "icon": "🔔", "description": "Cartes, cadeaux invités, imprévus"}
            ]
        },
        "status": "success"
    }
    """
    try:
        data = request.json
        prompt = data.get('prompt', '')
        
        if not prompt:
            return jsonify({
                "error": "Le prompt ne peut pas être vide",
                "status": "error"
            }), 400
        
        # Construire le prompt système pour Claude
        system_prompt = """
        Tu es un assistant financier spécialisé dans la création de projets budgétaires structurés.
        Ta tâche est d'analyser une demande en langage naturel et de générer un projet budgétaire détaillé.
        
        Voici comment procéder:
        1. Identifie le type de projet (Mariage, Anniversaire, Voyage, Rénovation, etc.)
        2. Détermine le budget total mentionné (ou estime-le si non spécifié)
        3. Génère des catégories de dépenses pertinentes pour ce type de projet
        4. Alloue intelligemment le budget entre ces catégories
        5. Fournis une description concise pour chaque catégorie
        6. Associe une icône emoji appropriée à chaque catégorie
        
        Les catégories doivent être cohérentes avec le type de projet et les spécificités mentionnées.
        La somme des montants alloués doit être égale au budget total.
        
        Réponds UNIQUEMENT avec un objet JSON structuré comme suit:
        {
          "name": "Nom du projet",
          "type": "Type de projet",
          "budget_total": budget_total_en_nombre,
          "categories": [
            {
              "nom": "Nom de la catégorie",
              "montant": montant_en_nombre,
              "icon": "emoji",
              "description": "Description concise"
            },
            ...
          ]
        }
        """
        
        # Appel à l'API Claude
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1500,
            temperature=0.2,
            system=system_prompt,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Extraire et parser la réponse JSON de Claude
        assistant_response = response.content[0].text
        project_data = json.loads(assistant_response)
        
        return jsonify({
            "project": project_data,
            "status": "success"
        })
        
    except json.JSONDecodeError as e:
        print(f"Erreur de décodage JSON dans la réponse de Claude: {str(e)}", file=sys.stderr)
        print(f"Réponse reçue: {assistant_response}", file=sys.stderr)
        return jsonify({
            "error": "Erreur lors de l'analyse de la réponse",
            "status": "error",
            "details": str(e)
        }), 500
        
    except Exception as e:
        print(f"Erreur lors de la génération du projet: {str(e)}", file=sys.stderr)
        return jsonify({
            "error": "Une erreur est survenue lors de la génération du projet",
            "status": "error",
            "details": str(e)
        }), 500

@app.route('/api/suggestions', methods=['POST'])
def suggestions():
    """
    API pour obtenir des suggestions budgétaires personnalisées
    
    Exemple de requête:
    {
        "projet": {
            "type": "anniversaire",
            "nom": "Anniversaire de Sophie",
            "date": "2025-07-15",
            "budget_total": 500,
            "categories": [
                {"nom": "Décoration", "montant": 100},
                {"nom": "Nourriture", "montant": 200},
                {"nom": "Animation", "montant": 150},
                {"nom": "Cadeaux", "montant": 50}
            ]
        },
        "historique_projets": [
            {
                "type": "anniversaire",
                "categories": [
                    {"nom": "Décoration", "montant": 80},
                    {"nom": "Nourriture", "montant": 150},
                    {"nom": "Animation", "montant": 100},
                    {"nom": "Cadeaux", "montant": 70},
                    {"nom": "Photographe", "montant": 100}
                ]
            }
        ]
    }
    """
    try:
        data = request.json
        projet = data.get('projet', {})
        historique_projets = data.get('historique_projets', [])
        
        # Construire le prompt pour Claude
        system_prompt = """
        Tu es un assistant financier personnel intelligent nommé MaPocket Assistant, spécialisé dans l'optimisation des budgets.
        Ta mission est d'analyser un projet budgétaire et de fournir des suggestions pertinentes en français.
        
        Tes suggestions doivent inclure:
        1. Détection d'omissions: Identifie les éléments potentiellement oubliés dans le budget en comparant avec des projets similaires
        2. Opportunités d'économies: Suggère des moyens d'optimiser certaines dépenses sans sacrifier la qualité
        3. Alertes de dépassement: Signale les catégories où le budget semble insuffisant par rapport à des projets similaires
        4. Conseils de planification: Propose des recommandations temporelles (quand réserver, acheter, etc.)
        
        Réponds sous forme structurée avec 3-4 suggestions concrètes et pratiques, chacune avec:
        - Un titre concis
        - Une explication claire
        - Une estimation chiffrée quand c'est possible (économie potentielle, montant recommandé)
        """
        
        # Convertir les données du projet en texte pour le prompt
        projet_str = json.dumps(projet, ensure_ascii=False, indent=2)
        historique_str = json.dumps(historique_projets, ensure_ascii=False, indent=2)
        
        user_message = f"""
        Voici les détails du projet à analyser:
        {projet_str}
        
        Voici l'historique des projets similaires pour référence:
        {historique_str}
        
        Analyse ce budget et fournis 3-4 suggestions pertinentes pour l'optimiser, détecter des omissions potentielles, ou améliorer sa planification.
        """
        
        # Appel à l'API Claude
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1500,
            temperature=0.7,
            system=system_prompt,
            messages=[
                {"role": "user", "content": user_message}
            ]
        )
        
        # Extraire la réponse de Claude
        assistant_response = response.content[0].text
        
        return jsonify({
            "suggestions": assistant_response,
            "status": "success"
        })
        
    except Exception as e:
        print(f"Erreur lors de l'appel à l'API Claude pour les suggestions: {str(e)}", file=sys.stderr)
        return jsonify({
            "suggestions": "Désolé, une erreur est survenue lors de la génération des suggestions. Veuillez réessayer plus tard.",
            "status": "error",
            "error": str(e)
        }), 500

if __name__ == '__main__':
    # Démarrer le serveur sur le port 5000
    app.run(host='0.0.0.0', port=5001, debug=True)