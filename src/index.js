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

// Let nav buttons wrap their labels (.nav-cramped) only when the name + buttons
// actually overflow the row. Measured live, so it adapts to any screen width.
function updateNavCramped() {
  // Only relevant on desktop (mobile uses the hamburger menu).
  if (!nameInNav || window.innerWidth <= 920) {
    innerNav.classList.remove("nav-cramped");
    return;
  }
  innerNav.classList.remove("nav-cramped"); // measure with buttons single-line
  if (innerNav.scrollWidth > innerNav.clientWidth) {
    innerNav.classList.add("nav-cramped");
  }
}

window.addEventListener("scroll", () => {
  const handRect = innerHome.getBoundingClientRect();
  const navRect = navEl.getBoundingClientRect();

  const isHomeAboveNav = handRect.bottom < navRect.height;

  if (isHomeAboveNav && !nameInNav) {
    innerNav.classList.remove("centered-div", "right-menu");
    innerNav.classList.add("row-aligned");
    innerNav.prepend(nameDiv);
    nameInNav = true;
    updateNavCramped();
    setNavHeightVar();
  }

  if (!isHomeAboveNav && nameInNav) {
    innerNav.classList.remove("row-aligned");
    innerNav.classList.add("centered-div", "right-menu");
    nameDiv.remove();
    nameInNav = false;
    updateNavCramped();
    setNavHeightVar();
  }
});

// Smooth-scroll nav anchors to the top of their section, clearing the sticky
// nav. Measured at click time so it stays correct as sections resize.
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (event) {
    const target = document.getElementById(this.getAttribute("href").substring(1));
    if (!target) return;
    event.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - navEl.offsetHeight;
    window.scroll({ top, left: 0, behavior: "smooth" });
  });
});

window.addEventListener("resize", updateNavCramped);

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

// The nav grows when the name block slides in, so --nav-height (which parks the
// sticky location panel clear of it) has to be re-measured on that swap too.
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
    const { startY, scrollable } = locationScrollRange();
    // On mobile the track is not pinned, so there is no segment to jump to.
    if (scrollable <= 0) return;
    const index = parseInt(item.getAttribute('data-index'), 10);
    window.scrollTo({ top: startY + scrollable * ((index + 0.5) / locImgCount), behavior: 'smooth' });
  });
});
