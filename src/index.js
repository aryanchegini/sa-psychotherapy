function elt(type, classNames, children) {
  let node = document.createElement(type);
  for (let className of classNames) {
    node.classList.add(className);
  }
  for (let child of children) {
    if (typeof child != "string") node.appendChild(child);
    else node.appendChild(document.createTextNode(child));
  }
  return node;
}

const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");

function hideNavbar() {
  mobileNav.classList.remove("mobile-nav-active");
  window.removeEventListener("click", hideNavbar);
}

menuToggle.addEventListener("click", () => {
  mobileNav.classList.add("mobile-nav-active");
  setTimeout(() => {
    window.addEventListener("click", hideNavbar);
  }, 100);
});

let nameDiv = elt(
  "h3",
  ["nav-name"],
  [
    elt("p", [], ["Soraya Chegini-Adams"]),
    elt("div", ["subscript-1", "quicksand"], ["Integrative Psychotherapy and Counselling for Adults"]),
    elt("div", ["subscript-2", "quicksand"], ["UKCP Registered"]),
  ]
);

nameDiv.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

const innerNav = document.getElementById("inner-nav");
const innerHome = document.getElementById("inner-home");
const navEl = document.querySelector("nav");

let nameInNav = false;
const introContentEl = document.querySelector('.intro-content');
const homeInfoEl = document.querySelector('.home-info');

window.addEventListener("scroll", () => {
  const handRect = innerHome.getBoundingClientRect();
  const navRect = navEl.getBoundingClientRect();

  const isHomeAboveNav = handRect.bottom < navRect.height;

  if (isHomeAboveNav && !nameInNav) {
    innerNav.classList.remove("centered-div", "right-menu");
    innerNav.classList.add("row-aligned");
    innerNav.prepend(nameDiv);
    nameInNav = true;
  }

  if (!isHomeAboveNav && nameInNav) {
    innerNav.classList.remove("row-aligned");
    innerNav.classList.add("centered-div", "right-menu");
    nameDiv.remove();
    nameInNav = false;
  }

  // Mobile: highlight paragraph once title starts disappearing behind nav
  if (window.innerWidth <= 920 && introContentEl && homeInfoEl) {
    const titleRect = introContentEl.getBoundingClientRect();
    const titleBehindNav = titleRect.top < navRect.height;
    homeInfoEl.classList.toggle('mobile-reveal', titleBehindNav);
    introContentEl.classList.toggle('mobile-dim', titleBehindNav);
  }
});

// Document offsets for each nav target. Anchor hrefs must match these keys
// exactly (e.g. #fees-location maps to divLocations['fees-location']).
let divLocations = {};

function calculateDivLocations() {
  // adjust hand page height so the intro fills the viewport
  const innerHomeHeight = innerHome.getBoundingClientRect().height;
  const navHeight = navEl.getBoundingClientRect().height;
  if (innerHomeHeight + navHeight < window.innerHeight) {
    const diff = window.innerHeight - (innerHomeHeight + navHeight);
    innerHome.style.height = innerHomeHeight + diff + "px";
  }

  const h = (id) => document.getElementById(id).getBoundingClientRect().height;
  const home = h("home"),
    approach = h("approach"),
    about = h("about"),
    fees = h("fees"),
    location = h("location"),
    faq = h("faq");

  return {
    home: 0,
    approach: home,
    about: home + approach,
    "fees-location": home + approach + about,
    faq: home + approach + about + fees + location,
    contact: home + approach + about + fees + location + faq,
  };
}

function refreshDivLocations() {
  divLocations = calculateDivLocations();
}

// Bind anchor handlers once; only the offset table is recomputed on resize.
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (event) {
    const divName = this.getAttribute("href").substring(1);
    if (!divLocations.hasOwnProperty(divName)) return;
    event.preventDefault();
    window.scroll({
      top: divLocations[divName],
      left: 0,
      behavior: "smooth",
    });
  });
});

window.addEventListener("DOMContentLoaded", refreshDivLocations);
window.addEventListener("load", refreshDivLocations);
window.addEventListener("resize", refreshDivLocations);
refreshDivLocations();

// Scroll to top button logic
const scrollTopBtn = document.getElementById("scrollTopBtn");

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// --- Location section: native sticky scrollytelling ---
// A tall .location-track pins .location-sticky below the nav; the active image
// (and matching list item) is driven by how far we've scrolled through the track.
const locImgs = document.querySelectorAll('.location-img');
const locImgCount = locImgs.length;
const locTrack = document.querySelector('.location-track');
const locSticky = document.querySelector('.location-sticky');
let currentLocationIndex = -1;

document.documentElement.style.setProperty('--loc-count', locImgCount);

function switchLocationTo(index) {
  if (index === currentLocationIndex) return;
  document.querySelectorAll('.location-item').forEach(i => i.classList.remove('active-location'));
  locImgs.forEach(i => i.classList.remove('active-img'));
  document.querySelector(`.location-item[data-index="${index}"]`)?.classList.add('active-location');
  document.querySelector(`.location-img[data-index="${index}"]`)?.classList.add('active-img');
  currentLocationIndex = index;
}

function setNavHeightVar() {
  document.documentElement.style.setProperty('--nav-height', navEl.offsetHeight + 'px');
}

// Scroll range (document coords) over which the track stays pinned.
function locationScrollRange() {
  const trackTop = locTrack.getBoundingClientRect().top + window.scrollY;
  const startY = trackTop - navEl.offsetHeight;
  const scrollable = locTrack.offsetHeight - locSticky.offsetHeight;
  return { startY, scrollable };
}

function updateLocationScroll() {
  if (!locTrack || !locSticky) return;
  const { startY, scrollable } = locationScrollRange();
  const progress = scrollable > 0
    ? Math.min(1, Math.max(0, (window.scrollY - startY) / scrollable))
    : 0;
  const index = Math.min(locImgCount - 1, Math.floor(progress * locImgCount));
  switchLocationTo(index);
}

let locTicking = false;
window.addEventListener('scroll', () => {
  if (locTicking) return;
  locTicking = true;
  requestAnimationFrame(() => { updateLocationScroll(); locTicking = false; });
}, { passive: true });

window.addEventListener('resize', () => { setNavHeightVar(); updateLocationScroll(); });
window.addEventListener('load', () => { setNavHeightVar(); updateLocationScroll(); });
setNavHeightVar();
updateLocationScroll();

// Click a location to jump to the centre of that image's scroll segment.
document.querySelectorAll('.location-item').forEach(item => {
  item.addEventListener('click', () => {
    if (!locTrack || !locSticky) return;
    const index = parseInt(item.getAttribute('data-index'));
    const { startY, scrollable } = locationScrollRange();
    window.scrollTo({ top: startY + scrollable * ((index + 0.5) / locImgCount), behavior: 'smooth' });
  });
});
