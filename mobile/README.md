# BudgetZen mobile

Application Android/iOS en React Native avec Expo SDK 57 et Expo Router. Node.js 24 recommandé. Le package et son lockfile sont indépendants du frontend Next.js.

## Démarrer

Depuis la racine, démarrer NestJS en autorisant l’accès depuis le réseau local :

```powershell
$env:HOST = '0.0.0.0'
npm run dev:backend
```

Dans un autre terminal :

```powershell
cd mobile
npm ci
Copy-Item .env.example .env
# Remplacer 192.168.1.10 par l'adresse IPv4 du PC dans .env.
npm start
```

Le téléphone et le PC doivent être sur le même réseau, avec le port 3001 accessible. `localhost` désigne le téléphone ; utiliser l’IP du PC pour un appareil physique et `http://10.0.2.2:3001/api/v1` pour l’émulateur Android. Redémarrer Expo après modification de `.env`. L’URL ne contient aucun secret. Utiliser une API HTTPS pour les builds distribués. Expo Go doit supporter SDK 57 ; un development build peut également être utilisé.

## Architecture

```text
src/app/                 Routes et layouts Expo Router uniquement
src/composition/         Assemblage des services et injection des repositories
src/features/
  auth/                  Connexion, inscription, restauration de session
  budget/                Synthèse et création de transactions
  projects/              Consultation des projets
  credits/               Consultation des prêts et emprunts
  business/              Statistiques mensuelles
  settings/              Langue, thème et devise
src/shared/
  api/                   Client HTTP, erreurs, timeout et contrats de stockage
  storage/               Adaptateur SecureStore
  application/           Chargement annulable et rafraîchissement
  ui/                    Composants et états partagés
tests/                   Tests métier et tests du client HTTP
```

Chaque fonctionnalité sépare `domain` (modèles, contrats et validation sans React), `application` (orchestration), `infrastructure` (adaptateurs HTTP) et `presentation` (écrans). Les petits modules utilisent uniquement les couches nécessaires. Les écrans reçoivent les repositories via `useServices()` ; aucune URL ni gestion de JWT dans les écrans. Pour ajouter une opération, compléter le contrat du domaine, son adaptateur puis le cas d’usage et l’écran. NestJS reste l’autorité des règles métier et du stockage.

## Fonctionnalités et limites

- Inscription/connexion avec validation, chargement et session conservée dans SecureStore. Un 401 efface le jeton et ferme les écrans protégés. Déconnexion locale ; aucun endpoint de révocation n’existe dans l’API actuelle.
- Synthèse serveur, solde/revenus/dépenses masqués par défaut et affichables indépendamment ; ajout d’une transaction dans une modale et actualisation après enregistrement.
- Consultation des budgets, projets, crédits et statistiques business. La création/modification de projets, crédits, budgets et transactions business n’est pas encore exposée dans les écrans mobiles.
- Thèmes clair/sombre et FR/EN conservés sur l’appareil. Les messages métier renvoyés par NestJS restent dans la langue du serveur.
- Devise sauvegardée par compte via `/settings`, sans conversion des montants.

Le mobile utilise directement `/api/v1` avec Bearer JWT. Il ne passe pas par les routes BFF de Next.js. Budgets, transactions, projets, crédits et business utilisent les mêmes données serveur que le web. Connectez-vous au même compte et configurez le même serveur NestJS. Une actualisation toutes les 15 secondes en premier plan et au retour dans l’application récupère les changements web. Pas de mode hors ligne ni de refresh token.

## Vérifier

```powershell
npm run check
npx expo-doctor
npm run export
```

`export` compile les bundles Android et iOS dans `dist/`. Cela ne produit pas d’APK/IPA signé et ne remplace pas un test sur appareil. Le projet cible Android/iOS ; aucun stockage de session web n’est configuré.
