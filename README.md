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

`npm run test:hydration` vérifie les modes inscription et connexion de l’accueil : rendu serveur, hydratation dans un DOM simulé, stabilité des SVG et interactions du formulaire. Ce contrôle est inclus dans `npm run check`. La landing page possède une frontière client explicite tout en conservant son HTML rendu côté serveur.

## Stockage et limites actuelles

Le tableau de bord inclut une vue d’ensemble des quatre rubriques : consommation et alertes des budgets, avancement des projets, crédits non soldés et résultat business du mois courant. Les cartes proposent un accès direct aux pages correspondantes. Le résumé des projets lit la sauvegarde locale sans la modifier ; celui du business utilise les statistiques de l’API. L’état des crédits est partagé au niveau de l’espace connecté, pour conserver les données lors du passage entre le tableau de bord et la page Crédits.

Les pages de gestion partagent les composants `PageHeader` et `EmptyState`, ainsi que les classes `workspace`, `workspace-main`, `ui-card`, `ui-primary` et `ui-dialog` définies dans `src/app/globals.css`. Le tableau de bord présente les indicateurs financiers en tête, puis les transactions et le suivi des budgets. Le bouton œil masque le solde disponible pendant la consultation. Le formulaire de transaction s’ouvre dans une modale depuis « Ajouter une transaction » ; après un ajout réussi, la modale se ferme et une confirmation apparaît sur le tableau de bord. Les formulaires restent distincts des cartes pour éviter les conteneurs imbriqués. Les graphiques vides, recherches sans résultat et chargements disposent d’un affichage dédié.

Les budgets et crédits du frontend restent en mémoire et sont réinitialisés au rechargement. Les projets sont sauvegardés dans le navigateur, avec une clé propre à chaque utilisateur (`budgetzen:projects:<id>`). Les nouveaux comptes démarrent avec un budget vide. Les transactions business et la devise du compte sont sauvegardées dans SQLite via l’API NestJS ; les statistiques et graphiques business utilisent les transactions réelles de la période sélectionnée.

Le build utilise `next/font/google` et nécessite l'accès à Google Fonts pour télécharger Inter.

## Backend NestJS

Une API persistante est disponible dans [`backend/`](backend/README.md), avec authentification JWT, isolation par utilisateur et modules métier indépendants de NestJS.

```sh
npm --prefix backend ci
npm --prefix backend run setup
npm run dev:backend
```

API : http://127.0.0.1:3001/api/v1 — Swagger : http://127.0.0.1:3001/api/docs.

Le backend nécessite Node.js 24 ou supérieur. Le frontend utilise l’API pour l’authentification, le business et les préférences du compte. Les budgets personnels, crédits et projets utilisent encore leur état local. La documentation du backend détaille les routes, les règles métier et le stockage SQLite.

## Règles métier et devise

Le sélecteur « Devise du compte » dans la navigation propose les devises ISO 4217 prises en charge par `Intl`. MGA est la valeur initiale. Le choix est enregistré par utilisateur et retrouvé après connexion, y compris depuis un autre navigateur. Les montants, formulaires, alertes et infobulles des graphiques utilisent le même format monétaire.

Le compte utilise une seule devise à la fois. Changer la devise conserve les valeurs numériques existantes ; une confirmation rappelle qu’aucune conversion de change n’est effectuée. Les montants gardent une précision de deux décimales pour toutes les devises, avec stockage/calculs en centièmes. Le mélange de devises par transaction et les taux de change ne sont pas implémentés.

Les règles sont isolées dans `src/shared/domain` et les dossiers `features/*/domain` :

- Les dépenses des budgets et les soldes de crédits/projets sont recalculés depuis les transactions. Les revenus ne consomment pas les budgets.
- Les catégories de budget sont normalisées, avec une seule limite par catégorie. La limite porte sur les dépenses cumulées, comme dans l’API ; aucun renouvellement mensuel automatique n’est effectué.
- Un crédit soldé ne produit plus d’alerte de retard. Les échéances sont évaluées par jour calendaire UTC. Les remboursements excessifs et les modifications sous le montant déjà payé sont refusés.
- Les projets refusent les dépenses au-delà des fonds, avant leur démarrage ou après leur clôture. Les sauvegardes locales incohérentes sont conservées et signalées plutôt qu’écrasées.
- Les statistiques business suivent les mois, trimestres et années calendaires UTC. Les transactions affichées correspondent à la période choisie ; une période vide affiche zéro, sans données fictives.

Les routes Next.js `/api/account/*` transmettent uniquement les opérations business et préférences autorisées. Elles gardent le JWT côté serveur, vérifient l’origine des mutations et affichent les erreurs de validation ou d’indisponibilité dans les formulaires.

## Application mobile

Le dossier [`mobile`](mobile/README.md) contient une application React Native / Expo SDK 57 indépendante, organisée par fonctionnalités avec des contrats de domaine, adaptateurs API et écrans séparés. Elle propose l’authentification, une synthèse budgétaire, l’ajout de transactions et la consultation des projets, crédits et statistiques business. Voir son README pour configurer l’URL de NestJS et lancer l’application sur téléphone.

## Accueil et authentification

Les contrôles de l’accueil et de la navigation permettent de choisir le thème clair/sombre et la langue français/anglais. Le thème suit initialement le système ; la langue initiale est le français. Les choix sont conservés dans ce navigateur (`budgetzen-theme`, `budgetzen-language`) et synchronisés entre les onglets. Les montants, noms de devises et dates affichées suivent la langue choisie. Les textes de l’interface sont centralisés dans `src/features/settings/translations/en.ts` et utilisés avec `useLocale()` ; les données saisies et les identifiants métier conservent leur valeur. Les tests d’hydratation couvrent également les préférences sauvegardées et le changement des deux réglages.

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

Ce test construit les deux applications, les lance sur des ports temporaires avec une base isolée et vérifie l’authentification, la protection des pages, la devise sauvegardée et les opérations/statistiques business à travers les routes Next.js. Il ne modifie pas la base de développement. `NEXT_BUILD_DIR=.next-validation` permet de construire le frontend dans un dossier distinct pendant qu'un serveur de développement utilise `.next`.
