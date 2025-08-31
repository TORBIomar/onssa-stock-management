# GSRV System - Gestion des Stocks et Réclamations Vétérinaires

Un système complet de gestion des stocks et des réclamations pour l'ONSSA (Office National de Sécurité Sanitaire des Produits Alimentaires).

## 🚀 Fonctionnalités principales

### 1. Gestion des Utilisateurs
- ✅ Ajouter / modifier / supprimer un utilisateur
- ✅ Attribution des rôles (Admin, Agent ONSSA, Vétérinaire)
- ✅ Authentification sécurisée avec JWT
- ✅ Gestion des accès et permissions

### 2. Gestion du Stock
- ✅ Ajouter un produit (vaccin, médicament, aliment animal, etc.)
- ✅ Modifier / supprimer un produit
- ✅ Consultation de la liste des produits en stock
- ✅ Alertes automatiques pour stock critique
- ✅ Recherche et filtrage avancés
- ✅ Gestion des dates de péremption

### 3. Gestion des Réclamations
- ✅ Créer une réclamation pour produit manquant/insuffisant
- ✅ Consultation de l'historique des réclamations
- ✅ Suivi du statut (En attente, En cours, Traitée, Rejetée)
- ✅ Traitement des réclamations par les administrateurs

### 4. Tableau de Bord et Alertes
- ✅ Vue d'ensemble en temps réel
- ✅ Statistiques détaillées
- ✅ Alertes automatiques pour stock critique
- ✅ Notifications pour produits périmés
- ✅ Suivi des réclamations en attente

## 🏗️ Architecture

### Backend (Spring Boot)
- **Java 17** avec Spring Boot 3.x
- **Base de données** : H2 (développement) / MySQL/PostgreSQL (production)
- **Sécurité** : JWT + Spring Security
- **API REST** avec validation des données
- **Gestion des erreurs** globale

### Frontend (Angular)
- **Angular 17** avec composants standalone
- **Bootstrap 5** pour l'interface utilisateur
- **Routing** avec guards d'authentification
- **Services** pour la communication avec l'API
- **Responsive design** pour tous les appareils

## 🛠️ Installation et Configuration

### Prérequis
- Java 17+
- Node.js 18+
- Maven 3.6+

### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Le serveur démarre sur `http://localhost:8081`

### Frontend
```bash
cd frontend/gsrv-frontend
npm install
npm start
```

L'application démarre sur `http://localhost:4200`

## 🔐 Rôles et Permissions

### Administrateur (ADMIN)
- Gestion complète des utilisateurs
- Gestion complète des produits
- Traitement de toutes les réclamations
- Accès à toutes les statistiques

### Agent ONSSA (AGENT)
- Consultation des stocks
- Création de réclamations
- Suivi de ses réclamations
- Accès aux statistiques de base

### Vétérinaire (VETERINAIRE)
- Consultation des stocks
- Création de réclamations
- Suivi de ses réclamations
- Accès aux statistiques de base

## 📊 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/register` - Création de compte

### Utilisateurs
- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/{id}` - Modifier un utilisateur
- `DELETE /api/users/{id}` - Supprimer un utilisateur
- `PATCH /api/users/{id}/toggle-status` - Activer/Désactiver

### Produits
- `GET /api/products` - Liste des produits
- `POST /api/products` - Créer un produit
- `PUT /api/products/{id}` - Modifier un produit
- `DELETE /api/products/{id}` - Supprimer un produit

### Réclamations
- `GET /api/reclamations` - Liste des réclamations
- `POST /api/reclamations` - Créer une réclamation
- `PATCH /api/reclamations/{id}/status` - Mettre à jour le statut

### Dashboard
- `GET /api/dashboard` - Données du tableau de bord

## 🎯 Cas d'usage

### Pour un Administrateur
1. Se connecter avec ses identifiants
2. Accéder au tableau de bord pour voir l'état global
3. Gérer les utilisateurs (créer, modifier, désactiver)
4. Surveiller les stocks et traiter les alertes
5. Traiter les réclamations en attente

### Pour un Agent/Vétérinaire
1. Se connecter avec ses identifiants
2. Consulter les stocks disponibles
3. Créer une réclamation si un produit est manquant
4. Suivre le statut de ses réclamations

## 🔧 Configuration

### Base de données
Modifiez `application.properties` pour configurer votre base de données :

```properties
# H2 (développement)
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver

# MySQL (production)
# spring.datasource.url=jdbc:mysql://localhost:3306/gsrv
# spring.datasource.username=gsrv_user
# spring.datasource.password=gsrv_pass
```

### Sécurité JWT
```properties
jwt.secret=votre_secret_jwt_tres_long_et_complexe
jwt.expiration=86400000
```

## 🚨 Alertes et Notifications

Le système génère automatiquement des alertes pour :
- **Stock critique** : Quantité ≤ seuil minimum
- **Produits périmés** : Date de péremption dépassée
- **Réclamations en attente** : Réclamations non traitées

## 📱 Interface utilisateur

- **Design responsive** adapté à tous les écrans
- **Navigation intuitive** avec menu contextuel
- **Tableaux interactifs** avec tri et filtrage
- **Formulaires validés** avec messages d'erreur
- **Notifications visuelles** pour les actions importantes

## 🔒 Sécurité

- **Authentification JWT** sécurisée
- **Validation des données** côté serveur
- **Gestion des rôles** et permissions
- **Protection CSRF** activée
- **Headers de sécurité** configurés

## 🧪 Tests

### Backend
```bash
cd backend
mvn test
```

### Frontend
```bash
cd frontend/gsrv-frontend
npm test
```

## 📈 Évolutions futures

- [ ] Notifications en temps réel (WebSocket)
- [ ] Export des données (PDF, Excel)
- [ ] API mobile dédiée
- [ ] Intégration avec d'autres systèmes ONSSA
- [ ] Tableau de bord avancé avec graphiques
- [ ] Gestion des fournisseurs et commandes

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est développé pour l'ONSSA et est propriétaire.

## 📞 Support

Pour toute question ou problème :
- Créez une issue sur le repository
- Contactez l'équipe de développement ONSSA

---

**Développé avec ❤️ pour l'ONSSA**
