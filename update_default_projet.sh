#!/bin/bash

# Fichier à modifier
FILE="mapocket/nouveau-projet.html"

# Remplacer les montants en euros hardcodés dans le HTML
sed -i 's/<span class="category-amount">€ 300<\/span>/<span class="category-amount" id="cat1-amount">€ 300<\/span>/' "$FILE"
sed -i 's/<span class="category-amount">€ 200<\/span>/<span class="category-amount" id="cat2-amount">€ 200<\/span>/' "$FILE"

# Ajouter un script à la fin du fichier pour mettre à jour ces montants
sed -i '/<script src="js\/project.js"><\/script>/a \
    <script>\
        document.addEventListener("DOMContentLoaded", function() {\
            // Charger les préférences utilisateur pour obtenir la devise\
            let userPreferences = {\
                currency: "EUR", // Devise par défaut\
            };\
            \
            try {\
                const savedPrefs = localStorage.getItem("userPreferences");\
                if (savedPrefs) {\
                    userPreferences = JSON.parse(savedPrefs);\
                }\
            } catch (error) {\
                console.error("Erreur lors du chargement des préférences:", error);\
            }\
            \
            // Obtenir le symbole de la devise\
            let currencySymbol = "€"; // Symbole par défaut (Euro)\
            \
            // Si AVAILABLE_CURRENCIES est défini, utiliser le symbole correspondant\
            if (typeof AVAILABLE_CURRENCIES !== "undefined") {\
                const currency = AVAILABLE_CURRENCIES.find(c => c.code === userPreferences.currency);\
                if (currency) {\
                    currencySymbol = currency.symbol;\
                }\
            }\
            \
            // Mettre à jour les montants affichés avec le bon symbole\
            const amounts = document.querySelectorAll(".category-amount");\
            amounts.forEach(amount => {\
                const value = amount.textContent.replace("€", "").trim();\
                amount.textContent = `${currencySymbol} ${value}`;\
            });\
        });\
    </script>' "$FILE"

echo "Update completed: Added currency symbol update script to nouveau-projet.html"
