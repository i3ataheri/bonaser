/* =========================================
   أبو ناصر — main.js
   مدرّن، سبک، با پشتیبانی از reduced-motion
========================================= */
"use strict";

/* --------------------------------------- *
   REVEAL
   - مرورگرهای جدید: CSS Scroll-Driven (view timeline)
   - بقیه: IntersectionObserver به‌عنوان fallback
---------------------------------------- */
const supportsViewTimeline =
  typeof CSS !== "undefined" && CSS.supports?.("animation-timeline", "view()");

if (!supportsViewTimeline) {
  const reveals = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12 }
  );
  reveals.forEach((el) => io.observe(el));
}

/* --------------------------------------- *
   PARALLAX — rAF + lerp (نرم و سبک)
   فقط برای Pointer های دقیق (موش/ترکپد)
---------------------------------------- */
const prefersReducedMotion =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isFinePointer = window.matchMedia("(pointer: fine)").matches;

const visual = document.querySelector(".visual");

if (visual && isFinePointer && !prefersReducedMotion) {
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  let rafId = null;
  let ticking = false;

  const onPointerMove = (e) => {
    target.x = e.clientX / window.innerWidth - 0.5;
    target.y = e.clientY / window.innerHeight - 0.5;
    if (!ticking) {
      ticking = true;
      loop();
    }
  };

  const loop = () => {
    current.x += (target.x - current.x) * 0.08;
    current.y += (target.y - current.y) * 0.08;
    visual.style.translate = `${current.x * 18}px ${current.y * 18}px`;

    if (Math.abs(target.x - current.x) > 0.0004 || Math.abs(target.y - current.y) > 0.0004) {
      rafId = requestAnimationFrame(loop);
    } else {
      ticking = false;
      rafId = null;
    }
  };

  document.addEventListener("pointermove", onPointerMove, { passive: true });
}

/* --------------------------------------- *
   MICRO PRESS — افکت لمسی روی تعاملی‌ها
---------------------------------------- */
const pressables = document.querySelectorAll(".btn, .nav-cta, .dock-btn, .sig-btn, .fc");

for (const el of pressables) {
  el.addEventListener("pointerdown", () => el.classList.add("is-down"));
  for (const ev of ["pointerup", "pointercancel", "pointerleave", "blur"]) {
    el.addEventListener(ev, () => el.classList.remove("is-down"));
  }
}

/* --------------------------------------- *
   SMOOTH SCROLL — هنگام اسکرول، انیمیشن‌های
   محیطی pause می‌شوند تا هیچ لرزشی نباشد
---------------------------------------- */
const rootEl = document.documentElement;
let scrollTimer = null;

const resumeAnimations = () => rootEl.classList.remove("is-scrolling");

window.addEventListener(
  "scroll",
  () => {
    rootEl.classList.add("is-scrolling");
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(resumeAnimations, 160);
  },
  { passive: true }
);