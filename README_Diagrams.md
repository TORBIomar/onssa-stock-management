# 📊 Diagrammes PlantUML - Système ONSSA SM

Ce dossier contient les diagrammes PlantUML complets pour le système ONSSA SM (Office National de Sécurité Sanitaire des Produits Alimentaires - Système de Management).

## 📁 Fichiers Disponibles

### 1. **Diagramme de Cas d'Utilisation** (`use_case_diagram.puml`)
- **Acteurs** : Administrateur, Agent, Système
- **Cas d'utilisation** : 15 cas d'utilisation principaux
- **Fonctionnalités** : Authentification, gestion des produits, réclamations, analytics, etc.

### 2. **Diagramme de Classes** (`class_diagram.puml`)
- **Entités principales** : User, Product, Reclamation, Task, Report
- **Énumérations** : UserRole, ProductCategory, ReclamationStatus, TaskStatus, etc.
- **Relations** : Associations entre les entités avec cardinalités

### 3. **Diagrammes de Séquence** (`sequence_diagrams.puml`)
- **Connexion utilisateur** : Processus d'authentification complet
- **Gestion des produits** : Création, consultation, mise à jour des stocks
- **Gestion des réclamations** : Création et traitement des réclamations
- **Analytics** : Génération des statistiques et métriques

### 4. **Fichier complet** (`onssa_sm_diagrams.puml`)
- Contient tous les diagrammes dans un seul fichier

## 🚀 Comment Utiliser

### Option 1 : PlantUML Online
1. Allez sur [PlantUML Online Editor](http://www.plantuml.com/plantuml/uml/)
2. Copiez le contenu du fichier `.puml` souhaité
3. Collez dans l'éditeur
4. Le diagramme se génère automatiquement

### Option 2 : Extension VS Code
1. Installez l'extension "PlantUML" dans VS Code
2. Ouvrez un fichier `.puml`
3. Utilisez `Alt+Shift+D` pour prévisualiser

### Option 3 : Plugin IntelliJ IDEA
1. Installez le plugin "PlantUML integration"
2. Ouvrez un fichier `.puml`
3. Le diagramme s'affiche automatiquement

## 📋 Description des Diagrammes

### 🔍 **Diagramme de Cas d'Utilisation**
Représente les interactions entre les utilisateurs et le système :

**Acteurs :**
- **Administrateur** : Accès complet au système
- **Agent** : Accès limité aux fonctionnalités opérationnelles
- **Système** : Actions automatiques (surveillance, alertes)

**Cas d'utilisation principaux :**
- Authentification et gestion des utilisateurs
- Gestion des produits et stocks
- Traitement des réclamations
- Génération d'analytics et rapports
- Surveillance de la conformité

### 🏗️ **Diagramme de Classes**
Modèle de données du système avec :

**Entités principales :**
- **User** : Gestion des utilisateurs et rôles
- **Product** : Gestion des produits vétérinaires
- **Reclamation** : Suivi des réclamations
- **Task** : Gestion des tâches
- **Report** : Génération de rapports

**Relations :**
- Un utilisateur peut créer plusieurs réclamations
- Un produit peut être concerné par plusieurs réclamations
- Chaque entité a des énumérations pour ses statuts

### ⏱️ **Diagrammes de Séquence**
Détail des interactions système pour :

**1. Connexion :**
- Authentification JWT
- Validation des identifiants
- Redirection selon le rôle

**2. Gestion Produits :**
- CRUD complet des produits
- Validation des données
- Mise à jour des stocks

**3. Gestion Réclamations :**
- Création de réclamations
- Traitement et mise à jour des statuts
- Validation des produits concernés

**4. Analytics :**
- Calcul des statistiques
- Agrégation des données
- Génération des métriques de performance

## 🎯 **Fonctionnalités Couvertes**

### ✅ **Gestion des Utilisateurs**
- Authentification sécurisée
- Gestion des rôles (ADMIN/AGENT)
- Sessions JWT

### ✅ **Gestion des Produits**
- Catégories : Vaccins, Médicaments, Aliments, Import/Export
- Suivi des stocks et seuils
- Gestion des dates d'expiration

### ✅ **Gestion des Réclamations**
- Statuts : Ouverte, En cours, Traitée, Fermée
- Association avec les produits
- Suivi des quantités observées

### ✅ **Gestion des Tâches**
- Priorités : Basse, Moyenne, Haute, Critique
- Statuts : À faire, En cours, Terminée, Annulée
- Dates d'échéance

### ✅ **Analytics et Rapports**
- Métriques de performance
- Taux de conformité
- Statistiques de stock
- Rapports personnalisables

## 🔧 **Technologies Représentées**

- **Backend** : Spring Boot, JPA/Hibernate
- **Frontend** : Angular
- **Base de données** : MySQL
- **Authentification** : JWT
- **Architecture** : REST API

## 📝 **Notes d'Utilisation**

1. **Langue** : Tous les diagrammes sont en français
2. **Convention** : Utilisation des termes métier vétérinaires
3. **Complétude** : Couvre l'ensemble des fonctionnalités du système
4. **Maintenance** : Mise à jour automatique avec l'évolution du code

## 🎨 **Personnalisation**

Vous pouvez modifier les diagrammes en :
- Changeant les couleurs avec `skinparam`
- Ajoutant de nouvelles entités
- Modifiant les relations
- Personnalisant les styles

## 📞 **Support**

Pour toute question sur les diagrammes ou le système GSRV, n'hésitez pas à consulter la documentation du projet.
