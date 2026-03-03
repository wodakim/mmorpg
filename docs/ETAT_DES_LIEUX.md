# État des lieux constructif — Maestria Pixel (MVP)

_Date : 2026-03-02_

## 1) Lecture rapide du projet

Le socle MMORPG Android-first est **déjà solide pour un MVP jouable** :
- Monorepo clair (`client/`, `server/`, `shared/`).
- Flux invité complet (Title → Menu → Création perso → Game).
- Boucle gameplay minimum active (déplacement, attaque, récolte, craft, potion, stats, quêtes starter, social stub).
- Serveur majoritairement autoritaire avec validation Zod des événements Socket.

En l’état, le projet est **cohérent avec la roadmap Phase 1A**, mais il reste des points à renforcer pour la robustesse mobile et la montée en charge.

---

## 2) Évaluation par priorités produit (ordre contractuel)

## Sécurité — **7.5/10**

### Points forts
- Validation Zod des payloads Socket côté serveur avant traitement.
- Sanitation username/chat et règles de format centralisées dans `shared`.
- Rate limit Socket branché au niveau connexion.
- Autorité serveur sur déplacement/combat/craft/loot/cooldowns.
- Pas d’usage de `eval`, `new Function` ni `innerHTML` brut dans le code inspecté.

### Risques / dette
- Les événements non authentifiés sont silencieusement ignorés : bon pour la sécurité, mais faible observabilité anti-abus (peu de télémétrie de tentatives invalides).
- Auth guest utile pour MVP, mais usurpation de `userId` reste possible à ce stade (risque accepté mais à suivre).
- Pas de séparation de rôles/permissions au-delà du modèle guest.

### Recommandations concrètes
1. Ajouter une **journalisation sécurité structurée** sur payloads invalides / rate-limit triggers / actions refusées.
2. Introduire des **counters anti-abus** (par IP/socket/user) exportables pour monitoring.
3. Préparer la couche auth Phase 2 (refresh token / device binding léger) sans casser le flux guest.

---

## Stabilité mobile (Android Chrome/WebView) — **8/10**

### Points forts
- Rendu portrait-first, résolution interne 288x512, safe-areas CSS.
- Contrôles tactiles dédiés (joystick gauche + actions droite).
- Requête de resync sur reprise de visibilité.
- Déverrouillage audio sur première interaction utilisateur.
- UI sans hover et majorité des contrôles >= 48px de hauteur.

### Risques / dette
- Plusieurs boutons "small" descendent à 40px : potentiellement sous le seuil 48dp sur certains terminaux.
- Pas de gestion explicite de `visualViewport` pour clavier virtuel (layout stable en pratique, mais non instrumenté).
- Le support pause/resume client est principalement basé sur `visibilitychange`, pas de stratégie plus fine d’arrêt/reprise locale des boucles UI.

### Recommandations concrètes
1. Uniformiser les cibles tactiles critiques à **>= 48px réels** (incluant boutons secondaires).
2. Ajouter une **stratégie clavier mobile explicite** (tests `visualViewport`, repositionnement des overlays d’input).
3. Documenter un plan test Android (Chrome + WebView) avec cas: app background, retour, clavier ouvert, rotation forcée.

---

## Performance — **7/10**

### Points forts
- Monde simple, primitives Phaser légères, peu de textures externes.
- Tick serveur fixe et envoi d’état centralisé.
- Interpolation client sur le joueur local pour fluidifier le rendu.
- Sauvegardes périodiques et critiques déjà en place.

### Risques / dette
- Broadcast d’état global à tous les clients (scalabilité limitée si population monte).
- Pas de partitionnement spatial/chunking réseau côté serveur.
- Overlays DOM + scène Phaser peuvent devenir coûteux si la densité UI augmente.

### Recommandations concrètes
1. Introduire un **interest management** basique (rayon de pertinence) avant toute hausse de contenu.
2. Ajouter une mesure FPS/tick côté client + serveur (profiling léger activable).
3. Préparer un pooling plus strict pour entités transitoires (dégâts flottants, effets).

---

## Gameplay feel — **7.5/10**

### Points forts
- Boucle de base gratifiante (récolte/craft/attaque/loot) déjà perceptible.
- Feedbacks toast + évolution stats + maîtrise donnent un début de progression.
- Quêtes starter cohérentes avec les entités réellement présentes.

### Risques / dette
- Sensation de combat encore "placeholder" (peu d’effets d’impact/hit-stop/haptique).
- Équilibrage progression (EXP, coût craft, puissance potion, cadence) encore non outillé.
- Peu de variété ennemis/objectifs pour soutenir la boucle infinie promise.

### Recommandations concrètes
1. Ajouter un **pack juice minimal** (impact visuel léger, feedback sonore, variation de slime).
2. Mettre en place un **tableau d’équilibrage** (JSON) pour tuning rapide sans toucher au code.
3. Définir un mini-objectif session 3 min / 10 min pour valider la rétention minute-1.

---

## Feature breadth — **6.5/10**

### Points forts
- Le MVP couvre déjà un spectre large: social stub, quêtes, craft, équipement, stats, persistance.

### Risques / dette
- Largeur fonctionnelle > profondeur actuelle : risque de dilution de qualité si on ajoute vite de nouvelles features.
- Certaines briques roadmap (streaming map, mastery plus riche, migration DB) restent à initier.

### Recommandations concrètes
1. Passer en mode **durcissement vertical**: stabiliser l’existant avant d’élargir.
2. Prioriser 1–2 systèmes différenciants (ex: mastery + quêtes procédurales de meilleure qualité).
3. Garder le desktop strictement debug et valider chaque ajout sur Android en premier.

---

## 3) Score global & lecture stratégique

**Score global actuel : 7.3/10 (MVP jouable, base technique saine, durcissement recommandé).**

Le projet est bien orienté pour la Phase 1A. La meilleure stratégie maintenant:
- **ne pas élargir trop vite**,
- **renforcer sécurité observable + stabilité mobile + perf réseau**,
- puis seulement accélérer le contenu gameplay.

---

## 4) Plan d’action recommandé (2 sprints)

### Sprint A — Durcissement (priorité haute)
1. Télémétrie sécurité + métriques rate limit.
2. Normalisation touch targets à 48dp mini.
3. Scénarios QA Android (background/resume/clavier/reconnect).
4. Instrumentation perf minimale (FPS, latence event-loop, taille payload état).

### Sprint B — Qualité de boucle
1. Juice combat/interact léger mais systématique.
2. Balancing data-driven (EXP/craft/drops).
3. Premières optimisations réseau (diffs/zone de pertinence).

---

## 5) Conclusion

Le jeu est **fonctionnel et conforme à l’esprit du plan Android-first** pour un MVP initial. Le prochain gain de valeur vient moins de nouvelles features que de la **fiabilité mobile et de la robustesse runtime**. Une fois ce socle consolidé, la montée en contenu sera bien plus sûre et rentable.


---

## 6) Roadmap de validation physique (APK Android Studio)

Objectif: valider **sur device réel** que l'UI devient lisible, non polluante, et que tous les boutons ont un comportement explicite (feature active ou popup "en construction").

### Sprint 0.5 — Hotfix UX écran (immédiat)
- Réduire la pollution visuelle: chat replié par défaut, panneaux scrollables, popups centrées.
- Uniformiser touch targets (>=48px) y compris boutons secondaires.
- Ajouter des confirmations explicites sur la création perso (placement couleurs / jonction placeholders).
- Brancher les actions non prêtes vers popup "en construction" au lieu d'un bouton silencieux.

**Validation APK (Android Studio)**
1. Build debug APK.
2. Tester sur au moins 3 tailles d'écran (petit, moyen, grand).
3. Vérifier: aucun bouton hors écran, aucun chevauchement bloquant, navigation possible au pouce.

### Sprint 1 — Adaptation multi-écrans robuste
- Créer une matrice responsive (360x640, 390x844, 412x915, tablette portrait).
- Introduire des presets UI (compact/normal) déclenchés selon hauteur utile.
- Limiter la hauteur des overlays et systématiser le scroll interne.
- Vérifier clavier virtuel (chat/input) sans saut de layout ni zoom navigateur.

**Validation APK (Android Studio)**
- Campagne instrumentée sur émulateurs + 1 téléphone réel.
- Capture vidéo de chaque flow: Title, Menu, CharCreate, Game, Chat, Panels.

### Sprint 2 — Stabilisation gameplay mobile
- Ajuster positionnement joystick/boutons pour éviter conflit avec overlays.
- Tester les zones de contact et erreurs tactiles (mis-taps) en sessions de 10 minutes.
- Ajouter tests de reprise (background/foreground) avec resync systématique.

**Validation APK (Android Studio)**
- Session QA longue (3x10 minutes) avec reconnect forcé.
- Checklist d'acceptance signée: jouable à une main, lisible, sans saturation UI.

### Sprint 3 — Pré-release APK interne
- Geler UI mobile.
- Corriger les derniers bugs de collision UI / input.
- Générer APK interne de validation équipe.

**Validation APK (Android Studio)**
- Smoke tests finaux + rapport de régression.
- Go/No-Go vers phase contenu.

---

## 7) Transparence / limites

Je peux préparer le code, les checklists et la roadmap dans ce repo, mais je ne peux **pas** valider physiquement moi-même l'expérience tactile réelle sur ton téléphone ni signer une QA device à ta place. Cette validation doit être faite côté Android Studio + appareil réel.
