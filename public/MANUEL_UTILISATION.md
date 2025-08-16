# Manuel d'Utilisation - Application de Gestion de Matériel Médical

## Table des Matières
1. [Introduction](#introduction)
2. [Connexion à l'Application](#connexion-à-lapplication)
3. [Navigation](#navigation)
4. [Gestion du Matériel](#gestion-du-matériel)
5. [Gestion des Demandes](#gestion-des-demandes)
6. [FAQ et Dépannage](#faq-et-dépannage)

---

## Introduction

L'Application de Gestion de Matériel Médical est conçue pour faciliter la gestion des équipements médicaux en location et la soumission de demandes par le personnel de maisons de retraite. Elle permet aux infirmières et ergothérapeutes de gérer leur matériel et de créer des demandes de livraison, reprise ou dépannage.

### Utilisateurs concernés
- **Personnel médical** : Infirmières, ergothérapeutes

---

## Connexion à l'Application

### Accès initial
1. Ouvrez votre navigateur web
2. Accédez à l'URL de l'application (fournie par votre administrateur)
3. Vous serez automatiquement redirigé vers la page de connexion

### Page de connexion
- **Identifiant** : Saisissez votre nom d'utilisateur (identifiant)
- **Mot de passe** : Entrez le mot de passe fourni par votre administrateur
- Cliquez sur "Se connecter"

**Note** : L'email sert uniquement pour la confirmation d'envoi des demandes de location, pas pour la connexion.

### Compte de test
- **Utilisateur** : `user` / `user123`

---

## Navigation

### Menu principal
Une fois connecté, vous accédez au menu principal avec les sections suivantes :

#### 1. **Matériel** (Page d'accueil)
- Affichage et gestion de votre matériel médical
- Ajout, modification et suppression d'équipements

#### 2. **Demandes**
- Création et suivi de vos demandes
- Gestion du panier de demandes

#### 3. **Aide**
- Accès à ce manuel d'utilisation
- Documentation complète de l'application

### Interface utilisateur
- **En-tête** : Navigation principale et informations de connexion
- **Contenu principal** : Zone de travail selon la section sélectionnée

---

## Gestion du Matériel

### Vue d'ensemble
La page "Matériel" affiche tous vos équipements médicaux sous forme de tableau avec options de filtrage et d'export.

### Fonctions de recherche et filtrage

#### Barre de recherche
- Recherche par **référence**, **résident**, ou **secteur**
- Saisie libre avec recherche en temps réel

#### Filtres disponibles
1. **Type de matériel** : Dropdown avec tous les types disponibles
2. **Date de livraison** : Filtre les équipements livrés à partir d'une date
3. **Date de reprise** : Filtre les équipements avec reprise jusqu'à une date
4. **En stock seulement** : Checkbox pour n'afficher que le matériel disponible

### Ajouter un équipement

1. **Cliquez sur "Ajouter"** dans la barre d'outils
2. **Remplissez le formulaire** :
   - **Type de matériel** : Sélectionnez dans la liste déroulante
   - **Référence** : Code ou numéro de série (optionnel)
   - **Secteur** : Zone géographique ou service
   - **Chambre** : Numéro ou nom de la chambre
   - **Résident** : Nom du résident concerné
   - **Poids** : Poids en kilogrammes (optionnel)
   - **Date de livraison** : Date de mise en service
   - **Date de reprise** : Date prévue de retour (optionnel)

3. **Validez** en cliquant sur "Enregistrer"

### Modifier un équipement

1. **Cliquez sur "Modifier"** dans la ligne de l'équipement
2. **Modifiez les champs** nécessaires dans le formulaire
3. **Sauvegardez** les modifications

### Supprimer un équipement

1. **Cliquez sur "Supprimer"** dans la ligne de l'équipement
2. **Confirmez** la suppression dans la boîte de dialogue

### Export et impression

#### Impression
- **Bouton "Imprimer"** : Lance l'impression du tableau complet
- Format optimisé pour l'impression avec masquage des éléments d'interface

#### Export CSV
- **Bouton "Exporter CSV"** : Télécharge un fichier Excel/CSV
- Nom du fichier : `equipments_YYYY-MM-DD.csv`
- Colonnes incluses : Type, Référence, Secteur, Chambre, Résident, Poids, Dates

---

## Gestion des Demandes

### Vue d'ensemble
La page "Demandes" se divise en deux parties :
- **Liste des demandes** (gauche) : Historique et suivi
- **Panier** (droite) : Création de nouvelles demandes

### Types de demandes

#### 1. **DELIVERY** (Livraison)
- Demande de livraison d'un nouvel équipement
- Nécessite la sélection d'un équipement existant

#### 2. **PICKUP** (Reprise)
- Demande de récupération d'un équipement
- Utilisé quand l'équipement n'est plus nécessaire

#### 3. **REPAIR** (Dépannage)
- Signalement d'un dysfonctionnement
- Demande d'intervention technique

### Créer une demande

#### Utilisation du panier
1. **Cliquez sur "Ajouter un élément"** dans le panier
2. **Sélectionnez le type** de demande (Livraison/Reprise/Dépannage)
3. **Choisissez l'équipement** concerné (si applicable)
4. **Ajoutez une description** détaillée
5. **Cliquez sur "Ajouter au panier"**

#### Finaliser la demande
1. **Vérifiez** les éléments dans le panier
2. **Ajoutez des notes** générales (optionnel)
3. **Cliquez sur "Soumettre la demande"**

### Statuts des demandes

| Statut | Description |
|--------|-------------|
| **PENDING** | En attente de traitement |
| **ACKNOWLEDGED** | Prise en compte par l'équipe |
| **IN_PREPARATION** | En cours de préparation |
| **COMPLETED** | Demande terminée |

### Suivi des demandes

#### Vue liste
- **Date de création** : Horodatage de la demande
- **Statut actuel** : Badge coloré selon l'état
- **Nombre d'éléments** : Compteur des items de la demande
- **Notes** : Commentaires associés

#### Actions disponibles
- **Voir les détails** : Affichage complet des éléments
- **Supprimer** : Annulation de la demande

---

## FAQ et Dépannage

### Questions fréquentes

#### **Q : Je ne peux pas me connecter**
**R :** Vérifiez votre identifiant (nom d'utilisateur) et mot de passe. Contactez votre administrateur pour réinitialiser si nécessaire.

#### **Q : Je ne vois pas mes équipements**
**R :** Vérifiez les filtres actifs, notamment "En stock seulement". Supprimez les filtres pour voir tous vos équipements.

#### **Q : Ma demande n'apparaît pas**
**R :** Actualisez la page. Les demandes apparaissent immédiatement après soumission.

#### **Q : Je ne peux pas ajouter d'équipement**
**R :** Vérifiez que tous les champs obligatoires sont remplis et qu'un type de matériel est sélectionné.

### Problèmes techniques

#### **Chargement lent**
- Vérifiez votre connexion internet
- Actualisez la page (F5)
- Videz le cache du navigateur

#### **Erreurs de sauvegarde**
- Vérifiez les champs obligatoires
- Essayez de recharger la page
- Contactez l'administrateur si le problème persiste

#### **Export CSV ne fonctionne pas**
- Vérifiez que votre navigateur autorise les téléchargements
- Essayez avec un autre navigateur
- Vérifiez l'espace disque disponible

### Support technique

#### **Contact administrateur**
- Email de support (configuré dans les paramètres)
- Numéro de téléphone (selon organisation)

#### **Informations à fournir en cas de problème**
- Description précise du problème
- Étapes pour reproduire l'erreur
- Navigateur utilisé (Chrome, Firefox, Safari, etc.)
- Capture d'écran si applicable

---

## Notes importantes

### Sécurité
- **Déconnectez-vous** toujours après utilisation
- **Ne partagez jamais** vos identifiants
- **Signalez** tout comportement suspect

### Données
- Les données sont **automatiquement sauvegardées**
- Les **exports CSV** sont horodatés
- L'**historique** des demandes est conservé

### Performance
- Utilisez les **filtres** pour améliorer les performances
- **Limitez** le nombre d'éléments affichés si nécessaire
- **Actualisez** régulièrement pour les dernières données

---

*Ce manuel est mis à jour régulièrement. Version : 1.0 - Date : 2025*