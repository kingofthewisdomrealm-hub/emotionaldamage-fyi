const year = document.getElementById("y");
if (year) year.textContent = new Date().getFullYear();

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
