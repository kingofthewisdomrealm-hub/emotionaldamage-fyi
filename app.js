const year = document.getElementById("y");
if (year) year.textContent = new Date().getFullYear();

const nav = document.querySelector(".nav");
function onScroll() {
  if (!nav) return;
  nav.classList.toggle("scrolled", window.scrollY > 24);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

(function heroVideo() {
  const bg = document.getElementById("hero-video");
  if (!bg) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    bg.remove();
    return;
  }
  try {
    const url = new URL(bg.src);
    url.searchParams.set("origin", location.origin);
    url.searchParams.set("enablejsapi", "1");
    bg.src = url.toString();
  } catch (_) {}
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
  window.onYouTubeIframeAPIReady = function () {
    const player = new window.YT.Player("hero-video", {
      events: {
        onReady(e) {
          e.target.mute();
          e.target.playVideo();
        },
        onStateChange(e) {
          if (e.data === window.YT.PlayerState.PLAYING) {
            const el = document.getElementById("hero-video");
            if (el) el.classList.add("is-on");
          }
          if (e.data === window.YT.PlayerState.ENDED) e.target.playVideo();
        },
      },
    });
    function kick() {
      try {
        player.mute();
        player.playVideo();
      } catch (_) {}
    }
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) kick();
    });
    ["click", "touchstart", "scroll"].forEach((ev) => {
      document.addEventListener(ev, kick, { once: true, passive: true });
    });
  };
})();

const modal = document.getElementById("direct");
const form = document.getElementById("order-form");
const openers = document.querySelectorAll("[data-open-direct]");
const closer = document.querySelector("[data-close-direct]");

function openDirect() {
  if (!modal) return;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  const first = modal.querySelector("input[name='name']");
  if (first) first.focus();
}

function closeDirect() {
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = "";
}

openers.forEach((el) => el.addEventListener("click", openDirect));
if (closer) closer.addEventListener("click", closeDirect);
if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeDirect();
  });
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal && !modal.hidden) closeDirect();
});

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button[type='submit']");
    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      note: form.note ? form.note.value.trim() : "",
    };
    if (!payload.name || !payload.email) return;
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Opening checkout…";
    }
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Pay $20 — signed copy";
      }
      alert(err.message || "Checkout is not live yet. Email hello@rulerofwisdom.com.");
    }
  });
}
