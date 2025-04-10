#!/usr/bin/env python3

# Script pour corriger les déclarations et références à userPreferences dans main.js

import re

input_file = "mapocket/js/main.js"
output_file = "mapocket/js/main.js.fixed2"

with open(input_file, 'r') as f:
    content = f.read()

# 1. Remplacer les déclarations de userPreferences
pattern1 = r'let\s+userPreferences\s*=\s*\{'
replacement1 = r'// userPreferences initialisé globalement\nwindow.userPreferences = window.userPreferences || {'
modified_content = re.sub(pattern1, replacement1, content)

# 2. Remplacer les affectations à userPreferences
pattern2 = r'userPreferences\s*=\s*JSON\.parse\(savedPrefs\)'
replacement2 = r'window.userPreferences = JSON.parse(savedPrefs)'
modified_content = re.sub(pattern2, replacement2, modified_content)

# 3. Remplacer toutes les références à userPreferences par window.userPreferences
# Mais pas celles qui sont déjà window.userPreferences
pattern3 = r'(?<!window\.)userPreferences\.([a-zA-Z0-9_]+)'
replacement3 = r'window.userPreferences.\1'
modified_content = re.sub(pattern3, replacement3, modified_content)

# Écrire le contenu modifié dans un nouveau fichier
with open(output_file, 'w') as f:
    f.write(modified_content)

print(f"Fichier traité. Remplacements effectués.")
print(f"Nouveau fichier enregistré: {output_file}")