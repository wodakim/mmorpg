# PLAN.md — Maestria Pixel : Boucle Infinie (Android-first)
**Version** : 1.1 (02 mars 2026)  
**Statut** : PRD + Architecture Technique (Mobile-first)  

> Ce document remplace la v1.0 et devient la **source de vérité** produit/tech.  
> Target principal : **smartphone Android** (Chrome + WebView). Desktop = mode debug uniquement.

---

## 1. Vision & Concept
Maestria Pixel est un **MMORPG pixel-art 2D top-down** jouable en **webview Android**.  
Concept central : **pas de classes de départ** → le joueur devient ce qu’il veut via **Mastery** (métiers/compétences).  
Boucle : explorer → récolter → crafter → combattre → quêtes procédurales → progression infinie.

**Ton** : fun, lisible, tactile, zéro surcharge UI, 100% gratuit.

**Titre officiel** : **Maestria Pixel – Boucle Infinie**

---

## 2. Objectifs Produit (Mobile-first)
- **Jouable en 60 secondes** sur mobile (onboarding simple).
- **Portrait-first** (9:16) ; landscape support optionnel (phase 2).
- **UI pensée pouce** : zones touch ≥ 48dp, pas de hover, pas de combos clavier.
- **Pixel-perfect** : rendu net, upscale entier (integer scaling), pas de blur.
- **Performance Android** : stable 60 FPS sur milieu de gamme, 30 FPS fallback.
- **Réseau instable** : reconnection & resync robustes (anti-déco).
- **Sécurité** : aucune injection (inputs, chat, storage, payloads).

---

## 3. Exigences Mobile / Android (non négociables)

### 3.1 Display & Orientation
- **Orientation par défaut : Portrait**.
- Canvas responsive : s’adapte au viewport + **safe areas** (notch).
- Rendu pixel art :
  - `pixelArt: true`, `roundPixels: true`
  - upscale **entier** (2x/3x/4x…) selon résolution
  - sprites en **multiples de 32px** (tiles 32×32).

### 3.2 Input (tactile)
- **Joystick virtuel** (thumbstick) à gauche.
- **Boutons d’action** à droite :
  - Attack
  - Interact
  - Potion (hotbar 5 slots, swipe ou boutons)
  - Inventory / Stats / Quest
- Gestes optionnels :
  - tap = interact contextuel
  - long-press = action secondaire (plus tard).

### 3.3 UX Android (WebView)
- Gestion **pause/resume** :
  - passage background → arrêt des timers critiques côté client
  - reprise → resync serveur (position/state).
- Gestion clavier virtuel :
  - chat/input → UI qui remonte, pas de zoom de page, pas de layout cassé.
- Audio : respect des politiques mobile (audio unlock après interaction).
- Haptics (optionnel phase 2) : feedback léger sur hit/loot.

### 3.4 Contraintes performance
- Batch/atlases : spritesheets + texture atlases (éviter trop de textures).
- Limiter DOM overlay (UI Phaser prioritaire).
- Pooling entités (slimes, coffres, floating text).
- Tick réseau faible :
  - 10–20 Hz positions
  - interpolation côté client, autorité serveur.

---

## 4. Fonctionnalités Requises (MVP Squelette + Phase 1)

### 4.1 Écrans & Flow (mobile)
1. **Title Screen** (tap to start)
2. **Main Menu**
   - Connexion Guest (pseudo) (mot de passe phase 2)
   - Choix / Création personnage
   - Choix serveur (1 seul au début)
   - Paramètres (audio, qualité, controls)
3. **Création Personnage**
   - 3 couleurs cheveux / 3 couleurs peau / 3 couleurs pantalon
   - preview animé 4 directions (placeholder)
4. **Game Scene**
   - Map large (chunks 32×32) — départ 1 zone + streaming ensuite
   - Déplacement joystick, collision
   - Mastery (minimum : Bucheron, Forgeron, Guerrier, Alchimiste)
   - Inventaire + Équipement + Hotbar 5 slots
   - HP + stamina (mana optionnel)
   - Level + **+5 points** stats par level (STR/VIT/AGI/DEX/INT) avec utilités réelles
   - Quêtes : donneur de quête village + quêtes procédurales cohérentes
   - Combat : slimes, mort joueur (-10% EXP), respawn village
   - Loot : coffre au sol → loot (Gel de Slime)
   - Craft : épée bois, jambières bois, stats procédurales cohérentes
   - Social : chat + bot (ami/groupe/report/blacklist)
   - Game juice : particles, hit flash, floating text, micro camera shake

### 4.2 Système Mastery
- Chaque action incrémente un XP métier.
- Niveau métier débloque :
  - ressources plus rares
  - recettes plus fortes
  - drop tables adaptées
  - bonus passifs.

### 4.3 Cohérence procédurale
- Quêtes générées uniquement avec entités disponibles au niveau/mastery du joueur.
- Items procéduraux :
  - ID unique
  - tier + budget stats
  - garde-fous anti “god roll” incohérent.

---

## 5. Sécurité (OBLIGATOIRE)
- Aucun `eval()`, `new Function()`, `innerHTML` brut.
- Inputs :
  - client : encode/escape + limite longueur + whitelist chars
  - serveur : Zod validate + sanitize + rate limit socket
- Server authoritative :
  - position/distance
  - dégâts
  - craft
  - loot
  - cooldowns
- Anti-cheat minimum :
  - distance max par tick
  - actions cooldown (harvest/attack/potion)
  - ignore client timestamps non fiables
- Chargement assets :
  - **aucun** téléchargement arbitraire depuis URLs utilisateur.

---

## 6. Architecture Technique

### 6.1 Stack
- **Client** : Vite + TypeScript + Phaser 3.x (mobile-first)
- **Serveur** : Node.js + Express + Socket.io + TypeScript
- **DB** :
  - Phase 1A : FileStore JSON (server/data/) pour démarrage immédiat
  - Phase 1B : MongoDB + Mongoose (migration via adapter)
- **Auth** :
  - Phase 1 : Guest + userId stable (uuid) stocké localement
  - Phase 2 : JWT + comptes
- **Packaging Android (optionnel)** :
  - PWA installable OU wrapper Capacitor (phase 2).

### 6.2 Structure dossiers
maestria-pixel/
├── client/
│   ├── src/
│   │   ├── scenes/
│   │   ├── entities/
│   │   ├── ui/
│   │   ├── managers/ (InputTouch, Mastery, Quest, Inventory, Net...)
│   │   ├── utils/
│   │   └── main.ts
│   ├── assets/
│   └── vite.config.ts
├── server/
│   ├── src/
│   │   ├── sockets/
│   │   ├── middleware/
│   │   ├── store/ (IPlayerStore + FileStore + MongoStore)
│   │   └── server.ts
│   └── package.json
├── shared/
├── docs/
│   ├── SECURITY.md
│   └── DECISIONS.md
├── AGENTS.md
├── README.md
└── .env.example

### 6.3 Communication & Reconnect
- Socket.io
- Heartbeat 8s
- Save auto 10s + on disconnect + on events (craft, levelup, death)
- Reconnect :
  - client re-auth (uuid)
  - serveur renvoie state authoritative
  - client resync + interpolation.

---

## 7. Modèles de Données (principaux)

```ts
export interface PlayerState {
  userId: string;
  username: string;
  colors: { hair: number; body: number; pants: number };
  level: number;
  exp: number;
  hp: number;
  maxHp: number;
  stats: { str: number; vit: number; agi: number; dex: number; int: number };
  position: { map: string; x: number; y: number };
  mastery: Record<string, number>;
  inventory: ItemInstance[];
  equipment: Equipment;
  questsActive: QuestInstance[];
  friends: string[];
  blacklist: string[];
  lastSave: string; // ISO
}

export interface ItemInstance {
  instanceId: string;       // unique
  baseId: string;           // "wood_sword"
  name: string;
  tier: number;
  stats: Partial<Record<keyof PlayerState["stats"], number>> & { dmg?: number; armor?: number; };
  qty: number;
}

export interface QuestInstance {
  questId: string;
  title: string;
  progress: number;
  goal: number;
  reward: { exp: number; items?: ItemInstance[] };
}
```

---

## 8. Roadmap
- **Phase 0** : prototype HTML (déjà fait)
- **Phase 1A** : Vite+TS+Phaser + serveur + FileStore + mobile controls + MVP jouable
- **Phase 1B** : migration Mongo (adapter), optimisation perf mobile, map chunks
- **Phase 2** : clans, PvP, auction house, wrapper Android (Capacitor), polish.

---

## 9. Règles Codex (discipline de delivery)
- 1 feature = 1 commit logique.
- Toujours `npm run typecheck` + `npm run dev` test local.
- Documenter décisions dans `docs/DECISIONS.md`.
- Priorité : **sécurité > stabilité mobile > performance > fun > features**.
