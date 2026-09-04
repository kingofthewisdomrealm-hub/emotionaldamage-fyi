document.getElementById("y").textContent = new Date().getFullYear();

const modal = document.getElementById("direct");
const openers = document.querySelectorAll("[data-open-direct]");
const closer = document.querySelector("[data-close-direct]");

function openDirect() {
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  const first = modal.querySelector("input[name='name']");
  if (first) first.focus();
}
function closeDirect() {
  modal.hidden = true;
  document.body.style.overflow = "";
}

openers.forEach((el) => el.addEventListener("click", openDirect));
if (closer) closer.addEventListener("click", closeDirect);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeDirect();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.hidden) closeDirect();
});
