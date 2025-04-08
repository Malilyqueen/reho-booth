#!/bin/bash

# Script pour ajouter le fichier CSS mobile-fixes.css à toutes les pages HTML

# Aller dans le répertoire mapocket
cd mapocket

# Pour chaque fichier HTML
for file in *.html; do
  echo "Traitement de $file..."
  
  # Vérifie si le fichier contient déjà mobile-fixes.css
  if grep -q "mobile-fixes.css" "$file"; then
    echo "$file contient déjà mobile-fixes.css, ignoré."
  else
    # Ajoute mobile-fixes.css après style.css
    sed -i 's|<link rel="stylesheet" href="css/style.css">|<link rel="stylesheet" href="css/style.css">\n    <link rel="stylesheet" href="css/mobile-fixes.css">|' "$file"
    echo "$file mis à jour avec succès."
  fi
done

echo "Terminé!"