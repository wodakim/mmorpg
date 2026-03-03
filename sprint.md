# Sprint — Title Screen Fidelity Lock

Statut: **OUVERT** (ne sera pas fermé tant que le rendu n'est pas conforme au mockup validé)

## 1) Erreurs commises (sans détour)

1. J'ai pris des libertés visuelles non demandées au lieu d'appliquer ton mockup à l'identique.
2. J'ai produit une composition "inspirée" au lieu d'une implémentation **pixel-perfect** guidée par la référence.
3. Je n'ai pas utilisé ton mockup comme overlay de calibration avant validation.
4. J'ai modifié des proportions/placements (frame, VFX, CTA, textes) sans respecter la hiérarchie visuelle cible.
5. J'ai continué à avancer sans verrouiller des critères de conformité explicites (checklist de comparaison).

## 2) Règles de travail obligatoires pour la suite

- **Aucune liberté artistique**: mockup = source de vérité visuelle.
- Implémentation mobile portrait d'abord (9:16), avec placements calés sur référence.
- Chaque élément est positionné par rapport au mockup (cadre, logo/branding, cercle runique, cristaux/VFX, CTA, hint).
- Validation par capture et comparaison visuelle avant toute annonce "terminé".
- Si un asset manque physiquement dans le repo: je le signale immédiatement et je n'invente pas de substitut final.

## 3) Inventaire cible (noms exacts attendus)

### Référence
- `Mockup_titlescreen.png`

### Background
- `asset_image_background_titlescreen.png`

### Cadre / Interface
- `asset_ornement_corner_up_left.png`
- `asset_ornement_corner_up_right.png`
- `asset_ornement_corner_down_left.png`
- `asset_ornement_corner_down_right.png`
- `asset_ornement_bar_horizontal.png`
- `asset_ornement_bar_vertical.png`
- `asset_ornement_middle_up.png`
- `asset_ornement_middle_down.png`
- `asset_ornement_middle_left.png`
- `asset_ornement_middle_right.png`
- `asset_ornement_decor_up_left.png`
- `asset_ornement_decor_up_right.png`
- `asset_ornement_decor_down_left.png`
- `asset_ornement_decor_down_right.png`
- `asset_ornement_decor_jewel.png`

### Branding
- `asset_branding_logo_sample_v01.png`
- `asset_branding_logobg_sprite_01.png`
- `asset_branding_logobg_sprite_02.png`
- `asset_branding_logobg2_sprite_01.png`

### Entités
- `asset_entity_character_hero_idle_sprite_01.png`
- `asset_entity_character_hero_idle_sprite_02.png`
- `asset_entity_enemy_demon_idle_sprite_01.png`
- `asset_entity_enemy_demon_idle_sprite_02.png`

### CTA
- `asset_btn_start_sample_v01.png`

### VFX
- `asset_effect_blueray_sprite_01.png`
- `asset_effect_blueray_sprite_02.png`
- `asset_effect_purpleray_sprite_01.png`
- `asset_effect_purpleray_sprite_02.png`
- `asset_effect_candleflamme_sprite_01.png`
- `asset_effect_candleflamme_sprite_02.png`
- `asset_effect_candleflamme_sprite_03.png`
- `asset_effect_candleflamme2_sprite_01.png`
- `asset_effect_candleflamme2_sprite_02.png`
- `asset_effect_candleflamme2_sprite_03.png`

## 4) Checklist d'acceptation (obligatoire)

- [ ] Cadre complet identique au mockup (coins + barres + décors + gemmes, sans déformation).
- [ ] Background en place avec profondeur et lisibilité du branding.
- [ ] Branding (logo + sous-titre) placé et dimensionné comme référence.
- [ ] Cercle runique derrière le logo (animation 2 frames rotation conforme).
- [ ] Héros gauche + démon droite (idle 2 frames) aux positions prévues.
- [ ] Cristaux et rayons VFX en respectant couleurs et zones (bleu/magenta).
- [ ] Bouton `Tap to Start` = asset dédié, taille/position conformes.
- [ ] Texte `Touchez l'écran pour continuer` conforme (position, contraste, style).
- [ ] Screenshot mobile portrait de validation généré et joint.
- [ ] Diff final centré sur TitleScreen (pas de dérive hors périmètre).

## 5) Engagement

Je n'annonce plus "fini" tant que cette checklist n'est pas cochée avec preuve visuelle.
