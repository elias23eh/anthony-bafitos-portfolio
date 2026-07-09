/* ============================================================
   Anthony Bafitos — Portfolio
   ------------------------------------------------------------
   Both clips are scroll-scrubbed as canvas frame sequences (not
   <video> elements) — a <video> nested in a `position: sticky`
   container is unreliable in Chromium: seeking works but the
   compositor often doesn't repaint the video's texture during
   scroll, so it visually freezes even though currentTime is
   changing correctly underneath. Canvas always force-repaints,
   so both clips use the same frame-sequence approach as a result.

   Once you've generated a clip (see SEEDANCE_PROMPTS.md), extract
   frames with:
     ffmpeg -i clip.mp4 -vf fps=24 assets/frames/<name>/frame_%04d.jpg
   then set the matching USE_REAL_*_FRAMES flag and frame count below.
   ============================================================ */
const USE_REAL_HERO_FRAMES = true;
const HERO_FRAME_COUNT = 145;
const HERO_FRAME_PATH = (i) => `assets/frames/hero/frame_${String(i).padStart(4, "0")}.jpg`;

const USE_REAL_NEGOTIATOR_FRAMES = true;
const NEGOTIATOR_FRAME_COUNT = 145;
const NEGOTIATOR_FRAME_PATH = (i) => `assets/frames/negotiator/frame_${String(i).padStart(4, "0")}.jpg`;

/* ---------------- mobile viewport-height fix (iOS/Android address bar) ---------------- */
function setVhVar() {
  document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
}
setVhVar();
window.addEventListener("resize", setVhVar);
window.addEventListener("orientationchange", setVhVar);

/* ---------------- Lenis smooth scroll ---------------- */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lenis = new Lenis({
  duration: prefersReducedMotion ? 0 : 1.15,
  easing: (t) => Math.min(1, 1 - Math.pow(2, -10 * t)),
  smoothWheel: !prefersReducedMotion, // fall back to native scroll when reduced motion is requested
  smoothTouch: false, // native touch scroll on mobile — smoother than simulated
});
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
lenis.stop(); // re-enabled once the loader finishes

/* ---------------- loading screen ---------------- */
const loaderEl = document.getElementById("loader");
const loaderRouteLine = document.getElementById("loaderRouteLine");
const loaderPct = document.getElementById("loaderPct");
const loaderNodes = [
  document.getElementById("loaderNode0"),
  document.getElementById("loaderNode1"),
  document.getElementById("loaderNode2"),
];
const routeLength = loaderRouteLine.getTotalLength();
loaderRouteLine.style.strokeDasharray = String(routeLength);
loaderRouteLine.style.strokeDashoffset = String(routeLength);

const assetLoader = {
  total: (USE_REAL_HERO_FRAMES ? HERO_FRAME_COUNT : 0) + (USE_REAL_NEGOTIATOR_FRAMES ? NEGOTIATOR_FRAME_COUNT : 0),
  loaded: 0,
};

function setLoaderProgress(pct) {
  const clamped = clamp(pct, 0, 1);
  loaderRouteLine.style.strokeDashoffset = String(routeLength * (1 - clamped));
  loaderPct.textContent = Math.round(clamped * 100) + "%";
  loaderNodes.forEach((node, i) => {
    node.classList.toggle("lit", clamped >= i / (loaderNodes.length - 1) - 0.02);
  });
}

function onAssetLoaded() {
  assetLoader.loaded++;
  setLoaderProgress(assetLoader.loaded / assetLoader.total);
  if (assetLoader.loaded >= assetLoader.total) finishLoading();
}

function finishLoading() {
  setTimeout(() => {
    document.documentElement.classList.remove("is-loading");
    loaderEl.classList.add("loader-exit");
    lenis.start();
    onScroll(); // paint the real first frame now that assets are loaded —
                // the canvas otherwise only repaints on a scroll event,
                // which hasn't fired yet if the user hasn't scrolled
    setTimeout(() => loaderEl.remove(), 850);
  }, 350); // brief hold at 100% before wiping away
}

if (assetLoader.total === 0) {
  // nothing real to load (placeholder mode) — run a short simulated load
  const start = performance.now();
  const duration = 1000;
  function fakeTick(now) {
    const t = clamp((now - start) / duration, 0, 1);
    setLoaderProgress(t);
    if (t < 1) requestAnimationFrame(fakeTick);
    else finishLoading();
  }
  requestAnimationFrame(fakeTick);
}

/* ---------------- progress rail ---------------- */
const progressFill = document.getElementById("progressFill");
function updateProgressRail() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressFill.style.width = pct + "%";
}

/* ---------------- helpers ---------------- */
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function sectionProgress(el) {
  const rect = el.getBoundingClientRect();
  const total = rect.height - window.innerHeight;
  if (total <= 0) return rect.top <= 0 ? 1 : 0;
  return clamp(-rect.top / total, 0, 1);
}

/* ================================================================
   HERO — letter-by-letter title + canvas orbit scrub
   ================================================================ */
const heroSection = document.getElementById("hero");
const heroTitle = document.getElementById("heroTitle");
const heroCopy = document.querySelector(".hero-copy");
const canvas = document.getElementById("heroCanvas");
const ctx = canvas.getContext("2d");

// split title into per-letter spans
heroTitle.querySelectorAll(".line").forEach((line) => {
  const text = line.textContent;
  line.textContent = "";
  [...text].forEach((ch, i) => {
    const span = document.createElement("span");
    span.className = "char";
    span.style.transitionDelay = `${i * 28}ms`;
    span.style.transition = "transform .7s cubic-bezier(.16,.9,.3,1), opacity .7s ease";
    span.textContent = ch === " " ? " " : ch;
    line.appendChild(span);
  });
});
const chars = heroTitle.querySelectorAll(".char");

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", () => setTimeout(resizeCanvas, 100));

/* ---- generic frame-sequence loader (used by both clips) ---- */
function loadFrameSequence(pathFn, count, onEachLoaded) {
  const state = { frames: [], loaded: false };
  let loadedCount = 0;
  for (let i = 1; i <= count; i++) {
    const img = new Image();
    img.src = pathFn(i);
    img.onload = () => {
      loadedCount++;
      if (loadedCount === count) state.loaded = true;
      if (onEachLoaded) onEachLoaded();
    };
    state.frames.push(img);
  }
  return state;
}

function drawCover(targetCtx, img, w, h) {
  targetCtx.clearRect(0, 0, w, h);
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale, dh = img.height * scale;
  targetCtx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

/* ---- real frame sequence loader (used once footage exists) ---- */
const heroSeq = USE_REAL_HERO_FRAMES ? loadFrameSequence(HERO_FRAME_PATH, HERO_FRAME_COUNT, onAssetLoaded) : null;

/* ---- procedural placeholder orbit (stand-in for real footage) ---- */
function drawPlaceholderOrbit(progress) {
  const w = window.innerWidth, h = window.innerHeight;
  ctx.clearRect(0, 0, w, h);

  // background
  const bg = ctx.createRadialGradient(w / 2, h * 0.42, h * 0.05, w / 2, h * 0.42, h * 0.75);
  bg.addColorStop(0, "#16161c");
  bg.addColorStop(1, "#07070a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const angle = progress * Math.PI * 2;
  const cx = w / 2;
  const cy = h * 0.56;
  const bodyW = Math.min(w * 0.22, 260);
  const bodyH = bodyW * 1.9;

  ctx.save();
  ctx.translate(cx, cy);

  // subtle horizontal drift to sell the orbit
  const drift = Math.sin(angle) * bodyW * 0.18;
  ctx.translate(drift, 0);
  const squash = 0.86 + 0.14 * Math.abs(Math.cos(angle));
  ctx.scale(squash, 1);

  // silhouette body
  ctx.beginPath();
  ctx.ellipse(0, 0, bodyW / 2, bodyH / 2, 0, 0, Math.PI * 2);
  const bodyGrad = ctx.createLinearGradient(-bodyW / 2, 0, bodyW / 2, 0);
  bodyGrad.addColorStop(0, "#0b0b0e");
  bodyGrad.addColorStop(0.5, "#141418");
  bodyGrad.addColorStop(1, "#0b0b0e");
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // head
  ctx.beginPath();
  ctx.ellipse(0, -bodyH / 2 - bodyW * 0.22, bodyW * 0.24, bodyW * 0.28, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#101014";
  ctx.fill();

  ctx.restore();

  // gold rim light sweeping around the silhouette
  const rimX = cx + Math.cos(angle) * (bodyW * 0.62) + drift;
  const rimGrad = ctx.createRadialGradient(rimX, cy, 4, rimX, cy, bodyW * 1.1);
  rimGrad.addColorStop(0, "rgba(232,200,118,0.55)");
  rimGrad.addColorStop(1, "rgba(232,200,118,0)");
  ctx.fillStyle = rimGrad;
  ctx.beginPath();
  ctx.ellipse(rimX, cy, bodyW * 1.1, bodyH * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();

  // floor glow
  const floorGrad = ctx.createRadialGradient(cx, cy + bodyH / 2, 4, cx, cy + bodyH / 2, bodyW * 1.4);
  floorGrad.addColorStop(0, "rgba(201,162,75,0.18)");
  floorGrad.addColorStop(1, "rgba(201,162,75,0)");
  ctx.fillStyle = floorGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy + bodyH / 2, bodyW * 1.4, bodyW * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawHeroFrame(progress) {
  if (USE_REAL_HERO_FRAMES && heroSeq.loaded) {
    const idx = clamp(Math.round(progress * (HERO_FRAME_COUNT - 1)), 0, HERO_FRAME_COUNT - 1);
    drawCover(ctx, heroSeq.frames[idx], window.innerWidth, window.innerHeight);
  } else {
    drawPlaceholderOrbit(progress);
  }
}

let heroEntered = false;
function updateHero() {
  const progress = sectionProgress(heroSection);

  // canvas orbit scrub — driven by full hero scroll range
  drawHeroFrame(progress);

  // letter reveal across first ~22% of hero scroll
  const revealT = clamp(progress / 0.22, 0, 1);
  chars.forEach((el) => {
    if (revealT > 0.02) {
      el.style.opacity = "1";
      el.style.transform = "translateY(0) rotate(0deg)";
    } else {
      el.style.opacity = "0";
      el.style.transform = "translateY(60%) rotate(4deg)";
    }
  });

  if (!heroEntered) {
    heroEntered = true;
    setTimeout(() => heroCopy.classList.add("in"), 250);
  }

  // fade copy out as we approach end of hero
  const fadeOut = clamp((progress - 0.7) / 0.3, 0, 1);
  heroCopy.style.opacity = String(1 - fadeOut);
}

/* ================================================================
   STATS — count up on enter
   ================================================================ */
const stats = document.querySelectorAll(".stat");
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateStat(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);
stats.forEach((s) => statObserver.observe(s));

function animateStat(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || "";
  const numEl = el.querySelector(".stat-num");
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const t = clamp((now - start) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    numEl.textContent = Math.round(eased * target) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ================================================================
   THREE PILLARS — video scrub + staged reveal
   ================================================================ */
const pillarsSection = document.getElementById("pillars");
const pillarsCanvas = document.getElementById("pillarsCanvas");
const pillarsCtx = pillarsCanvas.getContext("2d");
const pillarEls = document.querySelectorAll(".pillar");

const negotiatorSeq = USE_REAL_NEGOTIATOR_FRAMES
  ? loadFrameSequence(NEGOTIATOR_FRAME_PATH, NEGOTIATOR_FRAME_COUNT, onAssetLoaded)
  : null;

if (USE_REAL_NEGOTIATOR_FRAMES) {
  document.querySelector(".pillars-fallback").style.display = "none";
}

function resizePillarsCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  pillarsCanvas.width = window.innerWidth * dpr;
  pillarsCanvas.height = window.innerHeight * dpr;
  pillarsCanvas.style.width = window.innerWidth + "px";
  pillarsCanvas.style.height = window.innerHeight + "px";
  pillarsCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizePillarsCanvas();
window.addEventListener("resize", resizePillarsCanvas);
window.addEventListener("orientationchange", () => setTimeout(resizePillarsCanvas, 100));

function updatePillars() {
  const progress = sectionProgress(pillarsSection);

  if (USE_REAL_NEGOTIATOR_FRAMES && negotiatorSeq.loaded) {
    const idx = clamp(Math.round(progress * (NEGOTIATOR_FRAME_COUNT - 1)), 0, NEGOTIATOR_FRAME_COUNT - 1);
    drawCover(pillarsCtx, negotiatorSeq.frames[idx], window.innerWidth, window.innerHeight);
  }

  const stage = clamp(Math.floor(progress * 3), 0, 2);
  pillarEls.forEach((p, i) => {
    p.classList.toggle("active", i === stage);
  });
}

/* ================================================================
   main scroll loop
   ================================================================ */
function onScroll() {
  updateProgressRail();
  updateHero();
  updatePillars();
}
window.addEventListener("scroll", onScroll, { passive: true });
lenis.on("scroll", onScroll);
onScroll();

/* footer year */
document.getElementById("year").textContent = new Date().getFullYear();

/* ================================================================
   CREDENTIAL — certificate lightbox
   ================================================================ */
const credentialFrame = document.getElementById("credentialFrame");
const lightbox = document.getElementById("lightbox");
const lightboxClose = document.getElementById("lightboxClose");

function openLightbox() {
  lightbox.classList.add("open");
  lenis.stop();
}
function closeLightbox() {
  lightbox.classList.remove("open");
  lenis.start();
}
credentialFrame.addEventListener("click", openLightbox);
lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
});
