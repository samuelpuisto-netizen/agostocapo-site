const bootScreen = document.getElementById("boot-screen");
const startButton = document.getElementById("press-start");
const crtScreen = document.querySelector(".crt-screen");
const pageBody = document.body;
const bootStaticVideo = document.querySelector(".boot-static-video");
const searchParams = new URLSearchParams(window.location.search);
const skipBootScreen =
  searchParams.get("mobile-preview") === "1" ||
  pageBody?.classList.contains("mobile-preview-mode");

const ensureTransitionOverlay = () => {
  if (!crtScreen) {
    return null;
  }

  let overlay = crtScreen.querySelector(".crt-transition");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "crt-transition hidden";
    crtScreen.appendChild(overlay);
  }

  return overlay;
};

const playTransitionOverlay = () => {
  const overlay = ensureTransitionOverlay();

  if (!overlay) {
    return;
  }

  overlay.classList.remove("hidden");
  overlay.classList.remove("playing");
  void overlay.offsetWidth;
  overlay.classList.add("playing");

  window.setTimeout(() => {
    overlay.classList.add("hidden");
    overlay.classList.remove("playing");
  }, 920);
};

if (bootScreen && startButton) {
  let booting = false;

  if (pageBody) {
    pageBody.classList.add("boot-active");
  }

  const dismissBoot = () => {
    if (booting || bootScreen.classList.contains("hidden")) {
      return;
    }

    booting = true;
    bootScreen.classList.add("starting");

    window.setTimeout(() => {
      bootScreen.classList.add("hidden");
      bootScreen.classList.remove("starting");
      pageBody?.classList.remove("boot-active");
    }, 920);

    try {
      sessionStorage.setItem("agosto_capo_boot_seen", "1");
    } catch (_error) {
      // Ignore storage failures and keep the simple fallback behavior.
    }
  };

  try {
    if (skipBootScreen || sessionStorage.getItem("agosto_capo_boot_seen") === "1") {
      bootScreen.classList.add("hidden");
      pageBody?.classList.remove("boot-active");
    }
  } catch (_error) {
    // Ignore storage failures and show the boot screen normally.
  }

  startButton.addEventListener("click", dismissBoot);
  bootScreen.addEventListener("click", dismissBoot);
}

if (bootStaticVideo) {
  const bootStaticLoopStart = Number(bootStaticVideo.dataset.loopStart);
  const bootStaticLoopEnd = Number(bootStaticVideo.dataset.loopEnd);
  const hasCustomLoop = Number.isFinite(bootStaticLoopStart) && Number.isFinite(bootStaticLoopEnd);

  const seekBootStatic = () => {
    if (!hasCustomLoop) {
      return;
    }

    try {
      bootStaticVideo.currentTime = bootStaticLoopStart;
    } catch (_error) {
      // Ignore seek timing issues and keep normal playback as fallback.
    }
  };

  if (hasCustomLoop && bootStaticVideo.readyState >= 1) {
    seekBootStatic();
  } else if (hasCustomLoop) {
    bootStaticVideo.addEventListener("loadedmetadata", seekBootStatic, { once: true });
  }

  bootStaticVideo.addEventListener("timeupdate", () => {
    if (hasCustomLoop && bootStaticVideo.currentTime >= bootStaticLoopEnd) {
      seekBootStatic();

      try {
        void bootStaticVideo.play();
      } catch (_error) {
        // Ignore autoplay/playback hiccups and keep the video usable.
      }
    }
  });
}

try {
  if (sessionStorage.getItem("agosto_capo_page_transition") === "1") {
    sessionStorage.removeItem("agosto_capo_page_transition");
    playTransitionOverlay();
  }
} catch (_error) {
  // Ignore storage failures and just skip cross-page transition playback.
}

document.querySelectorAll('a[href$=".html"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.target === "_blank"
    ) {
      return;
    }

    const href = link.getAttribute("href");

    if (!href) {
      return;
    }

    event.preventDefault();

    try {
      sessionStorage.setItem("agosto_capo_page_transition", "1");
    } catch (_error) {
      // Ignore storage failures and continue with the visual transition only.
    }

    playTransitionOverlay();

    window.setTimeout(() => {
      window.location.href = href;
    }, 430);
  });
});

const tvScreen = document.querySelector(".static-panel");
const beatToggle = document.getElementById("beat-toggle");
const beatStatus = document.getElementById("beat-status");
const backgroundBeat = document.getElementById("background-beat");

if (beatToggle && beatStatus && backgroundBeat) {
  backgroundBeat.volume = 0.45;
  backgroundBeat.preload = "auto";

  const syncBeatUi = () => {
    const playing = !backgroundBeat.paused;
    beatToggle.textContent = playing ? "Pause Beat" : "Play Beat";
    beatStatus.textContent = playing ? "Audio: on" : "Audio: stop";
  };

  const toggleBeat = async () => {
    try {
      if (backgroundBeat.paused) {
        backgroundBeat.load();
        await backgroundBeat.play();
      } else {
        backgroundBeat.pause();
      }
    } catch (_error) {
      beatStatus.textContent = "Audio: blocked";
    }

    syncBeatUi();
  };

  const beatEventName = window.PointerEvent ? "pointerup" : "click";
  beatToggle.addEventListener(beatEventName, (event) => {
    event.preventDefault();
    void toggleBeat();
  });

  backgroundBeat.addEventListener("play", syncBeatUi);
  backgroundBeat.addEventListener("pause", syncBeatUi);
  backgroundBeat.addEventListener("ended", syncBeatUi);
  backgroundBeat.addEventListener("canplay", syncBeatUi);
  syncBeatUi();
}

if (tvScreen && !tvScreen.querySelector(".screen-logo")) {
  const ghostLayer = document.createElement("div");
  ghostLayer.className = "tv-ghost";
  tvScreen.appendChild(ghostLayer);

  const screenLogo = document.createElement("div");
  screenLogo.className = "screen-logo";
  screenLogo.innerHTML = "AGOSTO<br>CAPO";
  tvScreen.appendChild(screenLogo);
}

if (tvScreen) {
  const dvdBadge = document.createElement("div");
  dvdBadge.className = "dvd-badge";
  dvdBadge.innerHTML = `
    <span class="dvd-spin" aria-hidden="true">
      <span class="dvd-mark">DVD</span>
    </span>
  `;
  tvScreen.appendChild(dvdBadge);

  const palettes = [
    { fill: "#ffffff", shadow: "#2b54ff", chip: "#2b54ff" },
    { fill: "#fff06a", shadow: "#ff4d00", chip: "#ff4d00" },
    { fill: "#7affc1", shadow: "#008a5c", chip: "#008a5c" },
    { fill: "#ff90d8", shadow: "#b1006e", chip: "#b1006e" },
    { fill: "#ff9a7a", shadow: "#a62b00", chip: "#a62b00" },
    { fill: "#9fe0ff", shadow: "#0052a3", chip: "#0052a3" },
  ];
  let paletteIndex = 0;

  const applyPalette = () => {
    const palette = palettes[paletteIndex];
    dvdBadge.style.setProperty("--dvd-fill", palette.fill);
    dvdBadge.style.setProperty("--dvd-shadow", palette.shadow);
    dvdBadge.style.setProperty("--dvd-chip", palette.chip);
  };

  const cyclePalette = () => {
    paletteIndex = (paletteIndex + 1) % palettes.length;
    applyPalette();
  };

  applyPalette();

  let x = 18;
  let y = 18;
  let vx = 1.85;
  let vy = 1.42;

  const animateDvd = () => {
    const screenRect = tvScreen.getBoundingClientRect();
    const badgeRect = dvdBadge.getBoundingClientRect();
    const minOffset = 10;
    const maxX = Math.max(minOffset, screenRect.width - badgeRect.width - minOffset);
    const maxY = Math.max(minOffset, screenRect.height - badgeRect.height - minOffset);
    let bounced = false;

    x += vx;
    y += vy;

    if (x <= minOffset || x >= maxX) {
      vx *= -1;
      x = Math.min(Math.max(minOffset, x), maxX);
      bounced = true;
    }

    if (y <= minOffset || y >= maxY) {
      vy *= -1;
      y = Math.min(Math.max(minOffset, y), maxY);
      bounced = true;
    }

    if (bounced) {
      cyclePalette();
    }

    dvdBadge.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(animateDvd);
  };

  requestAnimationFrame(animateDvd);
}
