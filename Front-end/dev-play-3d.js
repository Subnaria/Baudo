(() => {
  const box = document.getElementById("dpLogo3d");
  const front = box?.querySelector(".dp-logo");
  if (!box || !front) return;

  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;
  if (hasCoarsePointer || isSmallScreen) return;

  const section = box.closest("section") || document;
  const float = front.parentElement;
  const stage = document.createElement("div");
  stage.className = "dp-stage";

  const LAYERS = 8;
  for (let i = LAYERS; i >= 1; i -= 1) {
    const layer = front.cloneNode();
    layer.className = "dp-layer";
    layer.alt = "";
    layer.setAttribute("aria-hidden", "true");
    layer.removeAttribute("loading");
    layer.style.setProperty("--i", String(i));
    stage.appendChild(layer);
  }

  const back = front.cloneNode();
  back.className = "dp-logo-back";
  back.alt = "";
  back.setAttribute("aria-hidden", "true");
  back.removeAttribute("loading");
  stage.appendChild(back);

  const blur = document.createElement("div");
  blur.className = "dp-blur";
  const zoom = document.createElement("div");
  zoom.className = "dp-zoom";
  const spin = document.createElement("div");
  spin.className = "dp-spin";

  float.appendChild(blur);
  blur.appendChild(zoom);
  zoom.appendChild(spin);
  spin.appendChild(stage);
  stage.appendChild(front);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let spinning = false;

  const playSpin = () => {
    if (spinning || reduceMotion) return;
    spinning = true;

    const duration = 1700;
    const STEPS = 60;
    const R = 34;
    const TURNS = 2;

    const frames = [];
    for (let i = 0; i <= STEPS; i += 1) {
      const t = i / STEPS;
      const angle = t * Math.PI * 2;
      const x = Math.sin(angle) * R;
      const y = (Math.cos(angle) - 1) * R;
      const z = Math.sin(t * Math.PI) * 70;
      const ry = t * 360 * TURNS;
      frames.push({
        transform: `perspective(1100px) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateY(${ry.toFixed(1)}deg)`
      });
    }

    spin.animate(frames, {
      duration,
      easing: "cubic-bezier(.45, 0, .25, 1)"
    });

    const fx = blur.animate(
      [
        { filter: "blur(0px) drop-shadow(0 0 0 rgba(143, 0, 255, 0))" },
        { filter: "blur(2px) drop-shadow(0 6px 16px rgba(143, 0, 255, .32))", offset: 0.5 },
        { filter: "blur(0px) drop-shadow(0 0 0 rgba(143, 0, 255, 0))" }
      ],
      { duration, easing: "ease-in-out" }
    );
    zoom.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.08)", offset: 0.5 },
        { transform: "scale(1)" }
      ],
      { duration, easing: "ease-in-out" }
    );

    fx.finished.then(() => { spinning = false; }).catch(() => { spinning = false; });
  };

  const spinTrigger = section.querySelector(".dp-cta");
  spinTrigger?.addEventListener("pointerenter", playSpin);
  spinTrigger?.addEventListener("focus", playSpin);

  const canTilt = window.matchMedia("(hover: hover)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canTilt) return;

  const MAX = 26;

  window.addEventListener("pointermove", (event) => {
    const normX = Math.max(-1, Math.min(1, (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2)));
    const normY = Math.max(-1, Math.min(1, (event.clientY - window.innerHeight / 2) / (window.innerHeight / 2)));
    stage.classList.remove("is-returning");
    stage.style.setProperty("--ry", `${normX * MAX}deg`);
    stage.style.setProperty("--rx", `${-normY * MAX}deg`);
  });

  window.addEventListener("pointerleave", () => {
    stage.classList.add("is-returning");
    stage.style.setProperty("--rx", "-6deg");
    stage.style.setProperty("--ry", "14deg");
  });
})();