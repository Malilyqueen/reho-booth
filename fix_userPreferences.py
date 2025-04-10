#!/usr/bin/env python3

# Script pour corriger les déclarations de userPreferences dans main.js

import re

input_file = "mapocket/js/main.js"
output_file = "mapocket/js/main.js.fixed"

with open(input_file, 'r') as f:
    content = f.read()

# Remplacer les déclarations de userPreferences
pattern = r'let\s+userPreferences\s*=\s*\{'
replacement = r'// userPreferences initialisé globalement\nwindow.userPreferences = window.userPreferences || {'

modified_content = re.sub(pattern, replacement, content)

# Écrire le contenu modifié dans un nouveau fichier
with open(output_file, 'w') as f:
    f.write(modified_content)

print(f"Fichier traité. Nombre de remplacements: {content.count('let userPreferences =')}")
print(f"Nouveau fichier enregistré: {output_file}")