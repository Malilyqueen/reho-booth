#!/bin/bash

# Définir les variables d'environnement pour l'API
export FLASK_APP=api.py
export FLASK_DEBUG=1

# Démarrer le serveur API
python api.py