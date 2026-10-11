# Backend BudgetZen

API REST NestJS 11 indépendante du frontend. Elle couvre l'authentification et les fonctionnalités actuellement présentes dans l'application. Les données sont persistées dans SQLite et isolées par utilisateur.

## Démarrer

Prérequis : **Node.js 24 ou supérieur**. Le backend utilise `node:sqlite`, sans serveur de base de données ni pilote natif supplémentaire à installer.

Depuis la racine du projet :

```sh
npm --prefix backend ci
npm --prefix backend run setup
npm run dev:backend
```

`setup` crée `backend/.env` avec un secret JWT aléatoire et conserve tout fichier existant. Les migrations sont appliquées automatiquement au démarrage. La base est créée dans `backend/data/budgetzen.sqlite` et ne doit pas être commitée.

- API : http://127.0.0.1:3001/api/v1
- Swagger : http://127.0.0.1:3001/api/docs
- OpenAPI JSON : http://127.0.0.1:3001/api/docs-json
- Santé : http://127.0.0.1:3001/api/v1/health

Le frontend continue à fonctionner avec son état local. Ses providers et hooks ne sont pas encore connectés à cette API. Les configurations TypeScript et ESLint des deux applications sont indépendantes.

## Architecture et dépendances

```text
backend/
  src/
    modules/
      auth/
      budget/
      credits/
      projects/
      business/
        domain/          Modèles, invariants et projections métier
        application/     Cas d'usage et interfaces de dépendances
        presentation/    Contrôleurs HTTP et DTO validés
        *.module.ts      Composition des dépendances NestJS
    infrastructure/
      database/          SQLite, migrations et repositories
      infrastructure.module.ts
    shared/
      domain/            Erreurs métier, monnaie et dates
      application/       Ports de repository, horloge et identifiants
      presentation/      Validation et traduction des erreurs HTTP
    config/              Configuration validée au démarrage
    app.module.ts        Assemblage des modules
    bootstrap.ts         Configuration HTTP commune au serveur et aux tests
    main.ts              Point d'entrée
  test/                  Tests métier et tests HTTP sur une vraie base temporaire
  scripts/setup.mjs      Configuration locale
```

Le domaine et les cas d'usage ne dépendent ni de NestJS ni de SQLite. Les modules injectent les repositories et les services d'infrastructure via des factories ; les cas d'usage utilisent des interfaces. ESLint interdit les imports de NestJS et des couches externes dans `domain/` et `application/`.

`StateRepository<State>` expose une lecture détachée et une mutation atomique. Le stockage utilise un agrégat JSON par utilisateur et fonctionnalité, avec une clé étrangère vers l'utilisateur. Les mutations se font dans une transaction SQLite `BEGIN IMMEDIATE` et sont annulées en cas d'erreur métier. Les migrations sont versionnées dans `schema_migrations` ; pour une évolution du schéma, ajouter une migration numérotée, sans modifier une migration déjà appliquée.

Ce stockage convient à une instance locale et à un volume modéré. Les listes ne sont pas paginées et une mutation réécrit l'agrégat concerné. Pour plusieurs instances ou des historiques volumineux, implémenter les ports avec des tables normalisées et une base serveur, puis ajouter la pagination. Le stockage interne des agrégats doit également être migré si leurs modèles évoluent.

## Authentification

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Alex",
  "email": "alex@example.com",
  "password": "un-mot-de-passe-long"
}
```

La réponse contient `accessToken` et `user`. Envoyer ensuite `Authorization: Bearer <accessToken>` sur les routes métier. Les mots de passe sont hachés avec scrypt et un sel aléatoire. Ils ne sont jamais renvoyés. Les JWT expirent après une heure par défaut ; cette première version ne propose pas encore de refresh token, de réinitialisation de mot de passe ou de révocation par logout.

Les emails sont normalisés en minuscules. Les mots de passe doivent contenir entre 12 et 128 caractères. Le mode démo, activable par configuration, crée un compte distinct sans accès aux données des autres utilisateurs.

## Routes

Toutes les routes ci-dessous sont préfixées par `/api/v1`. Seules `health`, `auth/register`, `auth/login` et `auth/demo` sont publiques.

| Ressource | Routes |
| --- | --- |
| Auth | `POST auth/register`, `POST auth/login`, `POST auth/demo`, `GET auth/me` |
| Budget global | `GET budget/summary` : transactions, budgets, objectifs, catégories personnalisées, totaux et alertes |
| Transactions personnelles | `GET/POST transactions`, `PATCH/DELETE transactions/:id` |
| Budgets | `GET/POST budgets`, `PATCH/DELETE budgets/:id` |
| Épargne | `GET/POST savings-goals`, `PATCH/DELETE savings-goals/:id` |
| Catégories personnalisées | `GET/POST custom-categories`, `PATCH/DELETE custom-categories/:id` |
| Transactions de catégorie | `POST custom-categories/:id/transactions`, `DELETE custom-categories/:id/transactions/:transactionId` |
| Crédits | `GET/POST credits`, `GET/PATCH/DELETE credits/:id` |
| Paiements | `POST credits/:id/payments`, `DELETE credits/:id/payments/:paymentId` |
| Projets | `GET/POST projects`, `GET/PATCH/DELETE projects/:id` |
| Dépenses de projet | `POST projects/:id/expenses`, `DELETE projects/:id/expenses/:expenseId` |
| Business | `GET/POST business/transactions`, `PATCH/DELETE business/transactions/:id` |
| Statistiques | `GET business/analytics?timeRange=month&date=2026-10-11` |

Swagger détaille les champs des requêtes. Les identifiants sont des UUID générés par le serveur. Les créations renvoient `201`, la connexion `200` et les suppressions `204`. Une ressource appartenant à un autre utilisateur est traitée comme introuvable (`404`).

## Contrats et règles métier

- Les dates utilisent ISO 8601. Les montants JSON sont en MGA, avec deux décimales maximum ; le stockage et les calculs utilisent des entiers en centièmes de MGA.
- Les montants doivent être positifs. Les fonds initiaux d'un projet et l'épargne actuelle peuvent être nuls.
- Le serveur refuse les champs inconnus et les valeurs `null`. Les PATCH ne modifient que les champs fournis. `current`, `remainingAmount`, `currentFund`, `spent`, `alerts` et `status` d'un crédit sont calculés : ne pas les envoyer.
- Les budgets portent sur toutes les transactions personnelles enregistrées, sans découpage mensuel dans cette version. Une seule limite est autorisée par catégorie. Les transactions de projet et business restent séparées des transactions personnelles.
- Les catégories personnelles sont `salaire`, `loyer`, `nourriture`, `transport`, `santé`, `loisirs`, `éducation`, `autres`.
- Un paiement ne peut ni dépasser le solde d'un crédit ni précéder sa date de début. Les ?ch?ances sont ?valu?es par jour calendaire UTC. Une modification du montant initial ne peut pas le réduire sous le total déjà payé.
- Une dépense de projet ne peut ni dépasser les fonds disponibles ni précéder la date de début. Un projet achevé doit être rouvert avant une nouvelle dépense. Modifier les fonds conserve les dépenses déjà enregistrées.
- Les statistiques business utilisent les périodes calendaires UTC : mois, trimestre ou année. `date` choisit la période ; à défaut, celle du jour. Les bornes sont inclusives au début et exclusives à la fin. Le changement en pourcentage vaut `null` si la période précédente est nulle et la période courante non nulle.

Les erreurs métier exposent `{ statusCode, code, message }` avec les statuts `400`, `401`, `404` ou `409`. Les erreurs de validation exposent un tableau `message` et un statut `400`.

## Configuration

| Variable | Utilisation |
| --- | --- |
| `PORT` | Port HTTP, `3001` par défaut |
| `HOST` | Interface d'écoute, `127.0.0.1` par défaut |
| `FRONTEND_ORIGIN` | Origine CORS autorisée, `http://localhost:3000` par défaut |
| `DATABASE_PATH` | Chemin SQLite, relatif au dossier de lancement ou absolu |
| `JWT_SECRET` | Secret obligatoire, aléatoire, 32 caractères minimum |
| `JWT_EXPIRES_IN_SECONDS` | Durée du JWT, de 60 à 86400 secondes |
| `SWAGGER_ENABLED` | `true` ou `false` |
| `DEMO_ENABLED` | `true` ou `false`, désactivé si absent |

Les requêtes sont limitées à 120 par minute, par route et par adresse IP ; les routes auth à 10. La limitation utilise la mémoire de l'instance. Helmet configure les en-têtes HTTP. Pour exposer le backend, configurer l'origine réelle, HTTPS via un reverse proxy, les sauvegardes SQLite et désactiver les fonctions démo/Swagger si elles ne sont pas souhaitées.

## Vérification et production

```sh
npm run check:backend
npm run build:backend
npm --prefix backend start
```

Les tests ne touchent pas la base de développement. Ils couvrent les calculs financiers, les périodes business, l'authentification, la validation HTTP, l'isolation entre utilisateurs, les annulations de transactions et la persistance après redémarrage.

Références : [validation NestJS](https://docs.nestjs.com/techniques/validation), [authentification NestJS 11](https://docs.nestjs.com/v11/techniques/authentication).
