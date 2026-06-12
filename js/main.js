/* ════════════════════════════════════════════
   LUCAS CANTARELLI — interactions (GSAP + Lenis)
   ════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger, SplitText);

const isTouch = window.matchMedia("(hover: none)").matches;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* with reduced motion: skip intros/reveals, land on final state */
if (reduceMotion) {
  document.getElementById("preloader").style.display = "none";
  gsap.set(".hero__line-inner", { y: 0 });
  gsap.set(".about__img", { clipPath: "inset(0% 0 0 0)" });
  document.querySelectorAll(".stat__num").forEach((el) => (el.textContent = el.dataset.count));
}

/* ══════════ LENIS SMOOTH SCROLL (native scroll under reduced motion) ══════════ */
const lenis = reduceMotion ? null : new Lenis({
  duration: 1.15,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});
if (lenis) {
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* anchor links through lenis */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    closeMenu();
    if (!lenis) return;
    e.preventDefault();
    lenis.scrollTo(a.getAttribute("href"), { offset: 0, duration: 1.4 });
  });
});

/* ══════════ CURSOR ══════════ */
const cursor = document.getElementById("cursor");
const follower = document.getElementById("cursorFollower");
const cursorLabel = document.getElementById("cursorLabel");

if (!isTouch) {
  const xTo = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power3" });
  const yTo = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power3" });
  const fxTo = gsap.quickTo(follower, "x", { duration: 0.45, ease: "power3" });
  const fyTo = gsap.quickTo(follower, "y", { duration: 0.45, ease: "power3" });

  window.addEventListener("mousemove", (e) => {
    xTo(e.clientX); yTo(e.clientY);
    fxTo(e.clientX); fyTo(e.clientY);
  });

  document.querySelectorAll("[data-cursor='hover'], a, button").forEach((el) => {
    el.addEventListener("mouseenter", () => follower.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => follower.classList.remove("is-hover"));
  });
}

/* ══════════ MAGNETIC BUTTONS ══════════ */
if (!isTouch) {
  document.querySelectorAll(".magnetic").forEach((el) => {
    const strength = 0.35;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - r.left - r.width / 2) * strength,
        y: (e.clientY - r.top - r.height / 2) * strength,
        duration: 0.4,
        ease: "power3.out",
      });
    });
    el.addEventListener("mouseleave", () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
    });
  });
}

/* ══════════ MENU OVERLAY ══════════ */
const menu = document.getElementById("menu");
const menuToggle = document.getElementById("menuToggle");
let menuOpen = false;

const menuTl = gsap.timeline({ paused: true });
menuTl
  .set(menu, { visibility: "visible", pointerEvents: "all" })
  .to(".menu__bg", { scaleY: 1, duration: 0.7, ease: "expo.inOut" })
  .to(".menu__text", { y: 0, duration: 0.8, stagger: 0.07, ease: "expo.out" }, "-=0.25")
  .to(".menu__footer", { opacity: 1, duration: 0.5 }, "-=0.4");

function openMenu() {
  menuOpen = true;
  document.body.classList.add("menu-open");
  menu.classList.add("is-open");
  lenis?.stop();
  menuTl.timeScale(1).play();
}
function closeMenu() {
  if (!menuOpen) return;
  menuOpen = false;
  document.body.classList.remove("menu-open");
  lenis?.start();
  menuTl.timeScale(1.6).reverse().then(() => menu.classList.remove("is-open"));
}
menuToggle.addEventListener("click", () => (menuOpen ? closeMenu() : openMenu()));

/* ══════════ PRELOADER ══════════ */
if (!reduceMotion) {
const counter = { val: 0 };
const counterEl = document.getElementById("preloaderCounter");

const loadTl = gsap.timeline({
  onComplete: () => {
    document.getElementById("preloader").style.display = "none";
    heroIntro();
  },
});

loadTl
  .to(".preloader__word", { y: 0, duration: 0.9, stagger: 0.12, ease: "expo.out" }, 0.2)
  .to(counter, {
    val: 100,
    duration: 1.9,
    ease: "power2.inOut",
    onUpdate: () => (counterEl.textContent = Math.round(counter.val)),
  }, 0)
  .to("#preloaderBar", { width: "100%", duration: 1.9, ease: "power2.inOut" }, 0)
  .to(".preloader__counter, .preloader__name, .preloader__bar", {
    yPercent: -30, opacity: 0, duration: 0.5, ease: "power2.in",
  }, "+=0.15")
  .to("#preloader", { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "-=0.1");

/* ══════════ HERO INTRO ══════════ */
function heroIntro() {
  gsap.timeline()
    .to(".hero__line-inner", { y: 0, duration: 1.2, stagger: 0.1, ease: "expo.out" }, 0)
    .from(".hero__eyebrow", { opacity: 0, y: 18, duration: 0.8, ease: "power3.out" }, 0.4)
    .from(".hero__desc, .hero__cta", { opacity: 0, y: 24, duration: 0.8, stagger: 0.1, ease: "power3.out" }, 0.6)
    .from(".hero__scroll-hint, .nav", { opacity: 0, duration: 0.8 }, 0.9);
}

/* hero parallax out on scroll */
gsap.to(".hero__content", {
  yPercent: -12,
  opacity: 0.25,
  ease: "none",
  scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
});

/* ══════════ CONTACT TITLE REVEAL (re-uses hero__line) ══════════ */
document.querySelectorAll(".contact .hero__line-inner").forEach((el) => {
  gsap.to(el, {
    y: 0,
    duration: 1.2,
    ease: "expo.out",
    scrollTrigger: { trigger: el, start: "top 88%" },
  });
});

/* ══════════ SPLIT-TEXT LINE REVEALS ══════════ */
document.querySelectorAll(".anim-lines").forEach((el) => {
  const split = new SplitText(el, { type: "lines", linesClass: "split-line" });
  gsap.set(split.lines, { yPercent: 110, opacity: 0, overflow: "hidden" });
  split.lines.forEach((l) => (l.style.display = "block"));
  gsap.to(split.lines, {
    yPercent: 0,
    opacity: 1,
    duration: 1,
    stagger: 0.09,
    ease: "expo.out",
    scrollTrigger: { trigger: el, start: "top 86%" },
  });
});

/* ══════════ SECTION HEAD LINES ══════════ */
document.querySelectorAll(".section-head__line").forEach((line) => {
  gsap.from(line, {
    scaleX: 0,
    duration: 1.4,
    ease: "expo.out",
    scrollTrigger: { trigger: line, start: "top 90%" },
  });
});
} /* end !reduceMotion */

/* ══════════ MARQUEE (scroll-velocity aware) ══════════ */
if (!reduceMotion) (() => {
  const track = document.querySelector(".marquee__track");
  if (!track) return;
  let xPos = 0;
  let speed = 0.55;
  let boost = 0;

  lenis.on("scroll", ({ velocity }) => {
    boost = gsap.utils.clamp(-8, 8, velocity * 0.4);
  });

  gsap.ticker.add(() => {
    xPos -= speed + boost;
    boost *= 0.92;
    const half = track.scrollWidth / 2;
    if (xPos <= -half) xPos += half;
    if (xPos > 0) xPos -= half;
    track.style.transform = `translateX(${xPos}px)`;
  });
})();

/* ══════════ ABOUT — photo reveal + parallax ══════════ */
if (!reduceMotion) {
gsap.to(".about__img", {
  clipPath: "inset(0% 0 0 0)",
  duration: 1.4,
  ease: "expo.inOut",
  scrollTrigger: { trigger: ".about__img", start: "top 82%" },
});
gsap.fromTo(".about__img img",
  { yPercent: -10 },
  {
    yPercent: 0,
    ease: "none",
    scrollTrigger: { trigger: ".about__img", start: "top bottom", end: "bottom top", scrub: true },
  }
);

/* ══════════ STATS COUNTERS ══════════ */
document.querySelectorAll(".stat__num").forEach((el) => {
  const target = +el.dataset.count;
  const obj = { val: 0 };
  gsap.to(obj, {
    val: target,
    duration: 1.8,
    ease: "power2.out",
    onUpdate: () => (el.textContent = Math.round(obj.val)),
    scrollTrigger: { trigger: el, start: "top 88%" },
  });
});

/* ══════════ PROJECT LIST — stagger in + floating preview ══════════ */
gsap.utils.toArray(".project").forEach((p) => {
  gsap.from(p, {
    opacity: 0,
    y: 60,
    duration: 1,
    ease: "expo.out",
    scrollTrigger: { trigger: p, start: "top 92%" },
  });
});
} /* end !reduceMotion (marquee→projects) */

(() => {
  if (isTouch) return;
  const preview = document.getElementById("workPreview");
  const previewImg = document.getElementById("workPreviewImg");
  const workList = document.getElementById("workList");
  if (!preview || !workList) return;

  const pxTo = gsap.quickTo(preview, "x", { duration: 0.6, ease: "power3" });
  const pyTo = gsap.quickTo(preview, "y", { duration: 0.6, ease: "power3" });

  /* preload screenshots once we approach the section */
  ScrollTrigger.create({
    trigger: "#work",
    start: "top bottom",
    once: true,
    onEnter: () => {
      document.querySelectorAll(".project[data-img]").forEach((p) => {
        const img = new Image();
        img.src = p.dataset.img;
      });
    },
  });

  workList.addEventListener("mousemove", (e) => {
    pxTo(e.clientX + 28);
    pyTo(e.clientY - 140);
  });

  document.querySelectorAll(".project").forEach((p) => {
    p.addEventListener("mouseenter", () => {
      previewImg.src = p.dataset.img || "";
      gsap.to(preview, { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" });
      gsap.fromTo(".work__preview-inner",
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 0.55, ease: "expo.out" });
      cursorLabel.textContent = "VER";
      follower.classList.add("is-label");
    });
    p.addEventListener("mouseleave", () => {
      gsap.to(preview, { opacity: 0, scale: 0.92, duration: 0.35, ease: "power3.out" });
      follower.classList.remove("is-label");
    });
  });
})();

/* ══════════ STACK ROWS ══════════ */
if (!reduceMotion) {
  gsap.utils.toArray(".stack-row").forEach((row) => {
    gsap.from(row, {
      opacity: 0,
      x: -40,
      duration: 0.9,
      ease: "expo.out",
      scrollTrigger: { trigger: row, start: "top 92%" },
    });
  });
}

/* ══════════ RECIFE CLOCK ══════════ */
const timeEl = document.getElementById("localTime");
function tickClock() {
  timeEl.textContent = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Recife",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).format(new Date());
}
tickClock();
setInterval(tickClock, 1000);

/* refresh ScrollTrigger after fonts settle (split positions) */
document.fonts?.ready.then(() => ScrollTrigger.refresh());
