# 🏥 ONSSA SM - Système de Gestion

**Office National de Sécurité Sanitaire des Produits Alimentaires - Système de Management**

Un système complet de gestion pour l'Office National de Sécurité Sanitaire des Produits Alimentaires (ONSSA), développé avec Angular et Spring Boot.

## 📋 Table des Matières

- [Description](#description)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [API Documentation](#api-documentation)
- [Structure du Projet](#structure-du-projet)
- [Diagrammes UML](#diagrammes-uml)
- [Contribution](#contribution)
- [Licence](#licence)

## 🎯 Description

ONSSA SM est une application web complète conçue pour la gestion des activités de l'Office National de Sécurité Sanitaire des Produits Alimentaires. Le système permet aux administrateurs et agents de gérer les produits, réclamations, tâches et de générer des rapports de conformité.

## ✨ Fonctionnalités

### 🔐 Authentification et Autorisation
- Connexion sécurisée avec JWT
- Gestion des rôles (Administrateur/Agent)
- Protection des routes par rôle

### 📊 Tableau de Bord
- Statistiques en temps réel
- Vue d'ensemble des activités
- Indicateurs de performance
- Taux de conformité

### 📦 Gestion des Produits
- Inventaire des produits
- Suivi des stocks
- Alertes de stock faible
- Gestion des dates d'expiration

### ⚠️ Gestion des Réclamations
- Création et suivi des réclamations
- Statuts multiples
- Historique des traitements
- Notifications

### ✅ Gestion des Tâches
- Création et assignation de tâches
- Suivi des progrès
- Priorités et échéances
- Rapports de completion

### 📈 Analytics et Rapports
- Statistiques détaillées
- Graphiques interactifs
- Rapports de conformité
- Export de données

### 👥 Gestion des Utilisateurs
- Création et modification de comptes
- Gestion des permissions
- Historique des activités

## 🏗️ Architecture

### Frontend
- **Framework**: Angular 17
- **UI**: Bootstrap 5 + Bootstrap Icons
- **Styling**: CSS personnalisé avec thème moderne
- **State Management**: Services Angular

### Backend
- **Framework**: Spring Boot 3
- **Base de données**: MySQL 8
- **Sécurité**: Spring Security + JWT
- **API**: RESTful

### Base de Données
- **SGBD**: MySQL
- **ORM**: JPA/Hibernate
- **Migration**: Scripts SQL

## 📋 Prérequis

- **Java**: JDK 17 ou supérieur
- **Node.js**: 18.x ou supérieur
- **MySQL**: 8.0 ou supérieur
- **Maven**: 3.6 ou supérieur
- **Angular CLI**: 17.x

## 🚀 Installation

### 1. Cloner le Repository

```bash
git clone https://github.com/votre-username/onssa-sm.git
cd onssa-sm
```

### 2. Configuration de la Base de Données

```bash
# Se connecter à MySQL
mysql -u root -p

# Créer la base de données
CREATE DATABASE onssa_sm;
USE onssa_sm;

# Exécuter le script de création
source backend/database-onssa.sql
```

### 3. Configuration Backend

```bash
cd backend

# Modifier application.properties si nécessaire
# (URL de la base de données, credentials, etc.)

# Installer les dépendances
mvn clean install

# Démarrer le serveur
mvn spring-boot:run
```

Le backend sera accessible sur `http://localhost:8080`

### 4. Configuration Frontend

```bash
cd frontend/gsrv-frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start
```

Le frontend sera accessible sur `http://localhost:4200`

## ⚙️ Configuration

### Variables d'Environnement Backend

Modifiez `backend/src/main/resources/application.properties` :

```properties
# Base de données
spring.datasource.url=jdbc:mysql://localhost:3306/onssa_sm
spring.datasource.username=votre_username
spring.datasource.password=votre_password

# JWT
jwt.secret=votre_secret_jwt
jwt.expiration=86400000

# Serveur
server.port=8080
```

### Configuration Frontend

Modifiez `frontend/gsrv-frontend/src/environments/environment.ts` :

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

## 🎮 Utilisation

### Comptes par Défaut

**Administrateur:**
- Username: `admin`
- Password: `admin123`

**Agent:**
- Username: `agent`
- Password: `agent123`

### Workflow Typique

1. **Connexion** : Utilisez vos identifiants
2. **Tableau de Bord** : Consultez les statistiques
3. **Gestion** : Accédez aux modules selon votre rôle
4. **Rapports** : Générez des rapports de conformité

## 📚 API Documentation

### Endpoints Principaux

#### Authentification
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/logout` - Déconnexion

#### Dashboard
- `GET /api/dashboard` - Données du tableau de bord
- `GET /api/analytics` - Données analytiques

#### Produits
- `GET /api/products` - Liste des produits
- `POST /api/products` - Créer un produit
- `PUT /api/products/{id}` - Modifier un produit
- `DELETE /api/products/{id}` - Supprimer un produit

#### Réclamations
- `GET /api/reclamations` - Liste des réclamations
- `POST /api/reclamations` - Créer une réclamation
- `PUT /api/reclamations/{id}` - Modifier une réclamation

#### Tâches
- `GET /api/tasks` - Liste des tâches
- `POST /api/tasks` - Créer une tâche
- `PUT /api/tasks/{id}` - Modifier une tâche

#### Utilisateurs
- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/{id}` - Modifier un utilisateur

## 📁 Structure du Projet

```
onssa-sm/
├── backend/                          # Application Spring Boot
│   ├── src/main/java/ma/onssa/gsrv/
│   │   ├── controller/              # Contrôleurs REST
│   │   ├── service/                 # Services métier
│   │   ├── repository/              # Repositories JPA
│   │   ├── model/                   # Entités JPA
│   │   ├── config/                  # Configuration
│   │   └── GsrvApplication.java     # Classe principale
│   ├── src/main/resources/
│   │   ├── application.properties   # Configuration
│   │   └── database-onssa.sql      # Script de base de données
│   └── pom.xml                      # Dépendances Maven
├── frontend/gsrv-frontend/          # Application Angular
│   ├── src/app/
│   │   ├── components/             # Composants Angular
│   │   ├── services/               # Services Angular
│   │   ├── guards/                 # Guards d'authentification
│   │   └── app.ts                  # Composant principal
│   ├── src/environments/           # Configuration d'environnement
│   └── package.json                # Dépendances npm
├── use_case_diagram.puml           # Diagramme de cas d'utilisation
├── class_diagram.puml              # Diagramme de classes
├── sequence_diagrams.puml          # Diagrammes de séquence
├── onssa_sm_diagrams.puml          # Tous les diagrammes
├── README_Diagrams.md              # Documentation des diagrammes
└── README.md                      # Ce fichier
```

## 📊 Diagrammes UML

Le projet inclut des diagrammes PlantUML complets :

- **Diagramme de Cas d'Utilisation** : Interactions utilisateur-système
- **Diagramme de Classes** : Structure des entités et relations
- **Diagrammes de Séquence** : Flux d'exécution des principales fonctionnalités

### Visualisation des Diagrammes

1. Installez l'extension PlantUML dans VS Code
2. Ouvrez les fichiers `.puml`
3. Utilisez `Alt+Shift+D` pour prévisualiser

Ou utilisez un éditeur en ligne comme [PlantUML Web Server](http://www.plantuml.com/plantuml/uml/)

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Standards de Code

- **Backend** : Suivez les conventions Java et Spring Boot
- **Frontend** : Suivez les conventions Angular et TypeScript
- **Base de données** : Utilisez des noms en français pour les tables et colonnes

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :

- Créez une issue sur GitHub
- Contactez l'équipe de développement
- Consultez la documentation technique

---

**Développé avec ❤️ pour ONSSA**