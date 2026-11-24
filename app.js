const MEDIA_BASE = "https://media.narradoraudiovisual.com";

// Endpoint discreto de formularios (configura tu endpoint en Formspree/Web3Forms/Cloudflare Worker
// apuntando a elianrene00@gmail.com para que tu correo nunca aparezca en el código cliente)
const COMMENT_ENDPOINT = "https://formspree.io/f/TU_ENDPOINT_AQUI";

const ASSETS = {
  videos: {
    loopInicio: `${MEDIA_BASE}/videos/ui/loop-inicio-4x3.mp4`,
    introLetras: `${MEDIA_BASE}/videos/ui/intro-letras-4x3.mp4`,
    escenaPuerta: `${MEDIA_BASE}/videos/ui/escena-01-puerta-4x3.mp4`,
    escenaPrecipicio: `${MEDIA_BASE}/videos/ui/escena-02-precipicio-4x3.mp4`,
    escenaLinterna: `${MEDIA_BASE}/videos/ui/escena-linterna-4x3.mp4`,
    escenaCuadroLuz: `${MEDIA_BASE}/videos/ui/escena-cuadro-luz-4x3.mp4`,
    transLinternaDer: `${MEDIA_BASE}/videos/ui/trans-linterna-der-4x3.mp4`,
    transLinternaIzq: `${MEDIA_BASE}/videos/ui/trans-linterna-izq-4x3.mp4`
  },
  docs: {
    ingenieria: `${MEDIA_BASE}/docs/doc-ingenieria.pdf`,
    contacto: `${MEDIA_BASE}/docs/doc-contacto.pdf`
  }
};

// 2 proyectos de prueba por sección (escalable añadiendo objetos al array)
const PORTFOLIO_DATA = {
  "art-dept": [
    {
      id: "art-01",
      title: "Proyecto Art Dept 01",
      orientation: "horizontal", // "horizontal" (16:9) | "vertical" (9:16)
      reelUrl: `${MEDIA_BASE}/videos/art-dept/reel-art-01-4x3.mp4`,
      pdfUrl: `${MEDIA_BASE}/docs/doc-art-01.pdf`,
      youtubeId: "dQw4w9WgXcQ"
    },
    {
      id: "art-02",
      title: "Proyecto Art Dept 02",
      orientation: "vertical",
      reelUrl: `${MEDIA_BASE}/videos/art-dept/reel-art-02-4x3.mp4`,
      pdfUrl: `${MEDIA_BASE}/docs/doc-art-02.pdf`,
      youtubeId: "dQw4w9WgXcQ"
    }
  ],
  "filmmaker": [
    {
      id: "film-01",
      title: "Proyecto Filmmaker 01",
      orientation: "horizontal",
      reelUrl: `${MEDIA_BASE}/videos/filmmaker/reel-film-01-4x3.mp4`,
      pdfUrl: `${MEDIA_BASE}/docs/doc-film-01.pdf`,
      youtubeId: "dQw4w9WgXcQ"
    },
    {
      id: "film-02",
      title: "Proyecto Filmmaker 02",
      orientation: "vertical",
      reelUrl: `${MEDIA_BASE}/videos/filmmaker/reel-film-02-4x3.mp4`,
      pdfUrl: `${MEDIA_BASE}/docs/doc-film-02.pdf`,
      youtubeId: "dQw4w9WgXcQ"
    }
  ]
};

const MACRO_ORDER = ["art-dept", "filmmaker", "ingenieria", "contacto"];

const state = {
  currentSection: "inicio",
  projectIndex: {
    "art-dept": 0,
    "filmmaker": 0
  },
  isTransitioning: false
};

// Referencias DOM
const sceneVideo = document.getElementById("scene-video");
const overlays = {
  inicio: document.getElementById("ui-inicio"),
  puerta: document.getElementById("ui-puerta"),
  hub: document.getElementById("ui-hub"),
  gallery: document.getElementById("ui-gallery"),
  pdf: document.getElementById("ui-pdf-section")
};

const externalTopUi = document.getElementById("external-top-ui");
const externalBottomUi = document.getElementById("external-bottom-ui");
const storyBarsEl = document.getElementById("story-bars");
const paintingFrame = document.getElementById("painting-frame");
const projectReel = document.getElementById("project-reel");
const projectTitlePlaque = document.getElementById("project-title-plaque");
const sectionPdfFrame = document.getElementById("section-pdf-frame");
const contactQuickActions = document.getElementById("contact-quick-actions");

const audioIntro = document.getElementById("audio-intro");
const sfxPuerta = document.getElementById("sfx-puerta");
const sfxViento = document.getElementById("sfx-viento");
const sfxLinterna = document.getElementById("sfx-linterna");

function showOnlyOverlay(name) {
  Object.entries(overlays).forEach(([key, el]) => {
    el.classList.toggle("is-active", key === name);
  });
}

function playStageVideo(src, { loop = false, onEnded = null } = {}) {
  sceneVideo.onended = null;
  sceneVideo.loop = loop;
  sceneVideo.src = src;
  sceneVideo.currentTime = 0;
  sceneVideo.play().catch(() => {});
  if (onEnded) {
    sceneVideo.onended = onEnded;
  }
}

function stopAllAudio() {
  [audioIntro, sfxPuerta, sfxViento, sfxLinterna].forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}

/* =========================================================
   FLUJO NARRATIVO INICIAL (INICIO -> LETRAS -> PUERTA -> CAÍDA -> HUB)
   ========================================================= */
function goToInicio() {
  stopAllAudio();
  state.currentSection = "inicio";
  externalTopUi.classList.add("is-hidden");
  externalBottomUi.classList.add("is-hidden");
  showOnlyOverlay("inicio");
  playStageVideo(ASSETS.videos.loopInicio, { loop: true });
}

document.getElementById("btn-entrar").addEventListener("click", () => {
  showOnlyOverlay(null);
  stopAllAudio();

  // Desbloquea sonido e inicia vídeo de letras + música de entrada
  audioIntro.play().catch(() => {});
  playStageVideo(ASSETS.videos.introLetras, {
    loop: false,
    onEnded: () => {
      // Al terminar las letras, arranca automáticamente la Escena 1
      playStageVideo(ASSETS.videos.escenaPuerta, {
        loop: false,
        onEnded: () => {
          showOnlyOverlay("puerta");
        }
      });
    }
  });
});

document.getElementById("btn-abrir-puerta").addEventListener("click", () => {
  showOnlyOverlay(null);
  sfxPuerta.currentTime = 0;
  sfxPuerta.play().catch(() => {});

  sfxViento.currentTime = 0;
  sfxViento.play().catch(() => {});

  playStageVideo(ASSETS.videos.escenaPrecipicio, {
    loop: false,
    onEnded: () => {
      // Cortar viento exactamente al terminar la caída
      sfxViento.pause();
      sfxViento.currentTime = 0;
      showOnlyOverlay("hub");
    }
  });
});

// Botones cardinales tras la caída
document.querySelectorAll("[data-target-section]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-target-section");
    navigateToMacroSection(target, { withLanternIntro: true });
  });
});

/* =========================================================
   NAVEGACIÓN ENTRE MACRO SECCIONES
   ========================================================= */
function updateMacroNavUI(sectionKey) {
  externalTopUi.classList.remove("is-hidden");
  document.querySelectorAll(".macro-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.macro === sectionKey);
  });
}

function renderStoryBars(sectionKey) {
  storyBarsEl.innerHTML = "";
  if (sectionKey === "art-dept" || sectionKey === "filmmaker") {
    const items = PORTFOLIO_DATA[sectionKey];
    const activeIdx = state.projectIndex[sectionKey];
    items.forEach((_, idx) => {
      const seg = document.createElement("div");
      seg.className = "story-bar-segment" + (idx === activeIdx ? " is-active" : "");
      storyBarsEl.appendChild(seg);
    });
  } else {
    const seg = document.createElement("div");
    seg.className = "story-bar-segment is-active";
    storyBarsEl.appendChild(seg);
  }
}

function navigateToMacroSection(sectionKey, { withLanternIntro = false } = {}) {
  if (sectionKey === "inicio") {
    goToInicio();
    return;
  }

  state.currentSection = sectionKey;
  updateMacroNavUI(sectionKey);
  renderStoryBars(sectionKey);

  if (sectionKey === "art-dept" || sectionKey === "filmmaker") {
    externalBottomUi.classList.remove("is-hidden");

    if (withLanternIntro) {
      showOnlyOverlay(null);
      sfxLinterna.currentTime = 0;
      sfxLinterna.play().catch(() => {});

      playStageVideo(ASSETS.videos.escenaLinterna, {
        loop: false,
        onEnded: () => {
          openGalleryScene(sectionKey);
        }
      });
    } else {
      openGalleryScene(sectionKey);
    }
    return;
  }

  // Secciones PDF: Ingeniería y Contact & Me
  externalBottomUi.classList.add("is-hidden");
  showOnlyOverlay("pdf");

  if (sectionKey === "ingenieria") {
    sectionPdfFrame.src = ASSETS.docs.ingenieria;
    contactQuickActions.classList.add("is-hidden");
  } else if (sectionKey === "contacto") {
    sectionPdfFrame.src = ASSETS.docs.contacto;
    contactQuickActions.classList.remove("is-hidden");
  }
}

document.querySelectorAll(".macro-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.macro;
    const needsLantern =
      (target === "art-dept" || target === "filmmaker") &&
      state.currentSection !== target;
    navigateToMacroSection(target, { withLanternIntro: needsLantern });
  });
});

/* =========================================================
   GALERÍA DE PROYECTOS (CUADRO ILUMINADO + BARRIDO LINTERNA)
   ========================================================= */
function openGalleryScene(sectionKey) {
  playStageVideo(ASSETS.videos.escenaCuadroLuz, { loop: true });
  renderCurrentProject(sectionKey);
  showOnlyOverlay("gallery");
}

function renderCurrentProject(sectionKey) {
  const list = PORTFOLIO_DATA[sectionKey];
  const idx = state.projectIndex[sectionKey];
  const project = list[idx];

  // Orientación del marco (16:9 horizontal o 9:16 vertical)
  paintingFrame.classList.toggle("is-horizontal", project.orientation === "horizontal");
  paintingFrame.classList.toggle("is-vertical", project.orientation === "vertical");

  projectTitlePlaque.textContent = project.title;
  projectReel.src = project.reelUrl;
  projectReel.play().catch(() => {});

  renderStoryBars(sectionKey);
}

function stepProject(direction) {
  const sec = state.currentSection;
  if ((sec !== "art-dept" && sec !== "filmmaker") || state.isTransitioning) return;

  state.isTransitioning = true;
  const list = PORTFOLIO_DATA[sec];
  const current = state.projectIndex[sec];

  // Carrusel circular
  const nextIndex = (current + direction + list.length) % list.length;
  state.projectIndex[sec] = nextIndex;

  // Ocultar cuadro brevemente mientras barre la linterna
  showOnlyOverlay(null);
  const sweepVideo =
    direction > 0 ? ASSETS.videos.transLinternaDer : ASSETS.videos.transLinternaIzq;

  playStageVideo(sweepVideo, {
    loop: false,
    onEnded: () => {
      state.isTransitioning = false;
      openGalleryScene(sec);
    }
  });
}

document.getElementById("btn-siguiente-proyecto").addEventListener("click", () => {
  stepProject(1);
});

document.getElementById("btn-ir-atras").addEventListener("click", () => {
  // Vuelve al hub de los 4 botones tras la caída
  externalTopUi.classList.add("is-hidden");
  externalBottomUi.classList.add("is-hidden");
  showOnlyOverlay("hub");
  playStageVideo(ASSETS.videos.escenaPrecipicio, { loop: false });
  sceneVideo.pause();
});

/* =========================================================
   OPCIÓN A: VISTA DEDICADA "SABER MÁS"
   ========================================================= */
const detailView = document.getElementById("project-detail-view");
const detailTitle = document.getElementById("detail-title");
const detailYoutubeWrapper = document.getElementById("detail-youtube-wrapper");
const detailPdfFrame = document.getElementById("detail-pdf-frame");

document.getElementById("btn-saber-mas").addEventListener("click", () => {
  const sec = state.currentSection;
  if (sec !== "art-dept" && sec !== "filmmaker") return;

  const project = PORTFOLIO_DATA[sec][state.projectIndex[sec]];
  detailTitle.textContent = project.title;
  detailPdfFrame.src = project.pdfUrl;
  detailYoutubeWrapper.innerHTML = `
    <iframe
      src="https://www.youtube.com/embed/${project.youtubeId}?rel=0"
      title="${project.title}"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen>
    </iframe>
  `;

  detailView.classList.remove("is-hidden");
  detailView.setAttribute("aria-hidden", "false");
});

document.getElementById("btn-detail-back").addEventListener("click", () => {
  // Descarga el iframe de YouTube al cerrar para liberar recursos
  detailYoutubeWrapper.innerHTML = "";
  detailView.classList.add("is-hidden");
  detailView.setAttribute("aria-hidden", "true");
});

/* =========================================================
   GESTOS TÁCTILES: TAP IZQUIERDA/DERECHA + SWIPE MACRO SECCIONES
   ========================================================= */
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

document.getElementById("app").addEventListener("touchstart", (e) => {
  if (e.target.closest("button, a, input, iframe")) return;
  const touch = e.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchStartTime = Date.now();
}, { passive: true });

document.getElementById("app").addEventListener("touchend", (e) => {
  if (e.target.closest("button, a, input, iframe")) return;
  if (!detailView.classList.contains("is-hidden")) return;

  const touch = e.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;
  const elapsed = Date.now() - touchStartTime;

  // 1. Swipe horizontal claro -> cambiar de macro sección
  if (Math.abs(deltaX) > 65 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
    const currentIdx = MACRO_ORDER.indexOf(state.currentSection);
    if (currentIdx !== -1) {
      const nextIdx =
        deltaX < 0
          ? (currentIdx + 1) % MACRO_ORDER.length
          : (currentIdx - 1 + MACRO_ORDER.length) % MACRO_ORDER.length;
      const target = MACRO_ORDER[nextIdx];
      const needsLantern = target === "art-dept" || target === "filmmaker";
      navigateToMacroSection(target, { withLanternIntro: needsLantern });
    }
    return;
  }

  // 2. Tap rápido en laterales dentro de galería -> retroceder o avanzar proyecto
  if (
    elapsed < 260 &&
    Math.abs(deltaX) < 15 &&
    Math.abs(deltaY) < 15 &&
    (state.currentSection === "art-dept" || state.currentSection === "filmmaker")
  ) {
    const screenW = window.innerWidth;
    if (touch.clientX < screenW * 0.32) {
      stepProject(-1);
    } else if (touch.clientX > screenW * 0.68) {
      stepProject(1);
    }
  }
}, { passive: true });

/* =========================================================
   ENVÍO DISCRETO DE COMENTARIOS + TOAST ESTILO INSTAGRAM
   ========================================================= */
const commentForm = document.getElementById("comment-form");
const commentInput = document.getElementById("comment-input");
const igToast = document.getElementById("ig-toast");
let toastTimer = null;

function showInstagramToast(text = "Comentario enviado") {
  igToast.textContent = text;
  igToast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    igToast.classList.remove("is-visible");
  }, 2400);
}

commentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = commentInput.value.trim();
  if (!message) return;

  const sec = state.currentSection;
  const project =
    sec === "art-dept" || sec === "filmmaker"
      ? PORTFOLIO_DATA[sec][state.projectIndex[sec]].title
      : sec;

  commentInput.value = "";
  showInstagramToast("Comentario enviado");

  try {
    await fetch(COMMENT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        proyecto: project,
        seccion: sec,
        comentario: message
      })
    });
  } catch (_) {
    // Mantiene experiencia silenciosa sin exponer detalles técnicos ni correo
  }
});

// Arranque inicial
goToInicio();
