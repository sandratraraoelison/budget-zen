# BudgetZen

Application Next.js 14 / React 18 / TypeScript pour gérer un budget, des crédits et des projets. Les montants sont exprimés en MGA.

## Démarrage

```sh
npm ci
npm run dev
```

L'application est accessible sur http://localhost:3000.

## Architecture

```text
src/
  app/                  Routes Next.js, layout, providers et API
  components/           Navigation, chargement et UI partagés
  features/
    auth/context/       État du mode démo
    budget/
      components/       Formulaires, listes, cartes et graphiques
      context/          Adaptateur React du domaine budgétaire
      data/             Fabrique de données démo
      domain/           Reducer, alertes, catégorisation, calculs et tests
      DashboardPage.tsx Écran du tableau de bord
      types.ts          Contrats de la fonctionnalité
    business/           Écran, composants et types business
    credits/            Écran, composants, types et règles de filtrage
    projects/           Écran, composants, types et hook de persistance
  lib/                  Utilitaires partagés
```

Les fichiers `app/**/page.tsx` des écrans métier exposent les écrans de `features/`. L'alias `@/` pointe vers `src/`. Tailwind analyse tous les fichiers de `src/`.

## Règles de maintenance

- Ajouter le code métier dans la fonctionnalité concernée. Réserver `components/` aux éléments partagés.
- Garder le domaine budgétaire indépendant de React. Le reducer applique les mutations et recalcule les alertes à partir du nouvel état.
- Définir les types une seule fois dans leur fonctionnalité. Les catégories de transactions viennent de `budget/domain/categorization.ts`.
- Placer les effets navigateur dans les hooks ou providers clients. `useProjects` valide les données sauvegardées et attend leur lecture avant d'écrire dans `localStorage`.
- Tester les règles métier et les régressions, en particulier les calculs financiers et les transitions d'état.

## Vérification

```sh
npm run check   # ESLint, TypeScript et tests métier
npm run build   # Compilation et génération des routes de production
npm start       # Serveur de production après le build
```

Les tests utilisent le runner natif Node.js via `tsx`. Les données démo du provider et de `POST /api/demo` proviennent de la même fabrique, qui crée un état neuf à chaque appel.

## Stockage et limites actuelles

Les budgets et crédits du frontend restent en mémoire et sont réinitialisés au rechargement. Les projets sont sauvegardés dans le navigateur, avec une clé propre à chaque utilisateur (`budgetzen:projects:<id>`). Les nouveaux comptes démarrent avec un budget vide. Les statistiques et graphiques business affichent encore des données de démonstration ; le sélecteur de période ne les recalcule pas.

Le build utilise `next/font/google` et nécessite l'accès à Google Fonts pour télécharger Inter.

## Backend NestJS

Une API persistante est disponible dans [`backend/`](backend/README.md), avec authentification JWT, isolation par utilisateur et modules métier indépendants de NestJS.

```sh
npm --prefix backend ci
npm --prefix backend run setup
npm run dev:backend
```

API : http://127.0.0.1:3001/api/v1 — Swagger : http://127.0.0.1:3001/api/docs.

Le backend nécessite Node.js 24 ou supérieur. Le frontend utilise l'API pour l'authentification ; les fonctionnalités de gestion utilisent encore leur état local. La documentation du backend détaille les routes, les règles métier et le stockage SQLite.

## Accueil et authentification

Au premier accès, `/` affiche une landing page responsive avec inscription et connexion. `/auth/login` et `/auth/register` ouvrent le même écran dans le mode correspondant. Une session valide redirige l'accueil vers `/dashboard` ; les pages de gestion demandent une connexion. La navigation propose un bouton de déconnexion.

Pour utiliser les formulaires, démarrer le backend et le frontend dans deux terminaux :

```sh
npm run dev:backend
npm run dev
```

La variable serveur `BACKEND_API_URL` permet de changer l'adresse du backend ; sa valeur par défaut est `http://127.0.0.1:3001/api/v1`. Un exemple est disponible dans `.env.example`. Le navigateur appelle les routes Next.js `/api/auth/*`, qui transmettent les requêtes à NestJS. Le jeton JWT reste dans un cookie HttpOnly, avec `SameSite=Lax` et `Secure` en production. Les mutations d'authentification vérifient l'origine de la requête.

La confirmation du mot de passe est vérifiée dans le formulaire. Les conflits d'adresse email, identifiants incorrects, limitations de tentatives et indisponibilités du backend sont affichés dans le formulaire. La session est conservée au rechargement jusqu'à l'expiration du jeton ; une nouvelle connexion est ensuite nécessaire.

```sh
npm run test:auth
```

Ce test construit les deux applications, les lance sur des ports temporaires avec une base isolée et vérifie inscription, connexion, cookie de session, protection des pages, déconnexion et indisponibilité du backend. Il ne modifie pas la base de développement. `NEXT_BUILD_DIR=.next-validation` permet de construire le frontend dans un dossier distinct pendant qu'un serveur de développement utilise `.next`.
