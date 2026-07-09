# Seedance 2.0 Generation Prompts — Anthony Bafitos Portfolio

Generate both in **DaVinci AI's Seedance 2.0**, settings: **std mode, 1080p, 16:9, no audio, ~8s duration**.
Before generating, upload Anthony's reference photo as the **identity/face reference** for both clips so the face stays consistent. Wardrobe is locked identically across both: **tailored navy suit, white shirt, no tie**.

---

## Clip 1 — HERO ORBIT (used as the scroll-scrubbed frame sequence)

**Prompt:**
> Cinematic 3D-style product-shoot of a confident man in his mid-30s, standing with arms crossed, chest open, chin level, calm powerful gaze into camera. Tailored navy suit, crisp white shirt, no tie. Pure black void studio background, no floor line visible, subject appears to float in darkness. Dramatic gold rim lighting sculpting the edges of his silhouette — hair, shoulders, jaw, sleeve creases — with a soft cool fill keeping the front of the face readable. Camera performs one slow, smooth, continuous 360-degree orbit around the subject at chest height, constant radius, constant speed, no handheld shake. Subject holds the pose still throughout — only the camera moves. High-end fashion/tech launch commercial aesthetic, shallow atmosphere haze, subtle gold light flares as the rim catches the lens. Ultra-detailed, physically accurate lighting, 24fps cinematic motion blur, no text, no logos.

**Negative prompt:**
> multiple people, changing pose, changing outfit, camera shake, handheld, zoom, cuts, jump cuts, text overlay, watermark, logo, extra limbs, warped hands, floor reflections, colored background, blue lighting, red lighting

**Notes:**
- Duration ~8s, this becomes the frame sequence for the hero scroll-scrub — the smoother and more consistent the orbit speed, the better the scrub will feel.
- Frame count: at 24fps × 8s = 192 frames. See "Swapping In Real Footage" in `README.md` for how to extract and drop these into `assets/frames/hero/`.

---

## Clip 2 — THE NEGOTIATOR (background video for the Three Pillars section)

**Prompt:**
> Cinematic 3D-style scene: the same man in a tailored navy suit and white shirt, no tie, sitting composed and still at an empty dark glass conference table, hands loosely clasped, powerful and unreadable expression. Across from him, an empty leather chair, deliberately vacant, implying the presence of an unseen negotiating partner. A single hard spotlight from directly above cuts through near-total darkness, pooling light on the table and the subject, leaving the rest of the room black. On the glass table between the two seats: a neat stack of paper supplier contracts and a small brass/metal desk globe, both catching the spotlight. No screens, no holograms, no laptops, no glowing UI — analog objects only, tension conveyed through stillness and light, not technology. Camera slowly circles the table at a low, deliberate speed, arcing roughly 180 degrees around the two chairs, keeping the subject and the empty chair both in frame for most of the move. Moody, high-contrast, prestige-drama cinematography, fine film grain, no text, no logos.

**Negative prompt:**
> multiple people, second person visible, screens, monitors, hologram, laptop, phone, glowing UI, bright even lighting, handheld shake, fast camera movement, text overlay, watermark, logo, warped hands, extra limbs

**Notes:**
- This clip plays as a normal looping/scroll-scrubbed `<video>` background behind the Three Pillars section (not a frame sequence) — export directly as `.mp4` (H.264) and drop into `assets/video/negotiator.mp4`.

---

## After generating

1. Download both clips.
2. Clip 1 (Hero Orbit) → extract to an image sequence (see `README.md`) → `assets/frames/hero/frame_0001.jpg` ... `frame_0192.jpg`.
3. Clip 2 (Negotiator) → save directly as `assets/video/negotiator.mp4`.
4. Refresh the site — the procedural placeholder in the hero and the flat gradient behind Three Pillars will automatically be replaced once those files exist and `js/script.js`'s `USE_REAL_HERO_FRAMES` / `USE_REAL_NEGOTIATOR_VIDEO` flags are flipped to `true` (see comments at the top of that file).
