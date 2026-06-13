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
    if (isLocationLocked) {
      isLocationLocked = false;
      unlockPageScroll();
    }
    isScrollingToSection = true;
    unlockDirection = 0;
    clearTimeout(scrollingToSectionTimeout);
    scrollingToSectionTimeout = setTimeout(() => { isScrollingToSection = false; }, 3000);
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
  isScrollingToTop = true;
  unlockDirection = 0;
  if (isLocationLocked) {
    isLocationLocked = false;
    unlockPageScroll();
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(() => { isScrollingToTop = false; }, 1500);
});

// Mobile intro highlight handled in scroll listener below

// Location scroll hijacking
let isScrollingToTop = false;
let isScrollingToSection = false;
let scrollingToSectionTimeout = null;
let isLocationLocked = false;
let currentLocationIndex = 0;
let locationLockY = 0;
let unlockDirection = 0; // -1 = exited upward, 1 = exited downward, 0 = never exited
let locationImageCooldown = false;
let locationActivationCooldown = false;
let pendingLocationIndex = -1;
let previousScrollY = window.scrollY;
let locationObserverInstance = null;

function switchLocationTo(index) {
  document.querySelectorAll('.location-item').forEach(i => i.classList.remove('active-location'));
  document.querySelectorAll('.location-img').forEach(i => i.classList.remove('active-img'));
  document.querySelector(`.location-item[data-index="${index}"]`)?.classList.add('active-location');
  document.querySelector(`.location-img[data-index="${index}"]`)?.classList.add('active-img');
  currentLocationIndex = index;
}

function getLocationLockY() {
  const navHeight = navEl.offsetHeight;
  const viewportCenter = navHeight + (window.innerHeight - navHeight) / 2;
  if (window.innerWidth <= 920) {
    const grid = document.querySelector('.location-div .two-col-grid');
    if (!grid) return Infinity;
    const gridDocTop = grid.getBoundingClientRect().top + window.scrollY;
    return gridDocTop + grid.offsetHeight / 2 - viewportCenter;
  }
  const wrapper = document.querySelector('.location-imgs-wrapper');
  if (!wrapper) return Infinity;
  const wrapperDocTop = wrapper.getBoundingClientRect().top + window.scrollY;
  return wrapperDocTop + wrapper.offsetHeight / 2 - viewportCenter;
}

function lockPageScroll() {
  document.documentElement.style.overflow = 'hidden';
}

function unlockPageScroll() {
  document.documentElement.style.overflow = '';
}

const APPROACH_ZONE = 500;
const APPROACH_SPEED_THRESHOLD = 15; // deltaY per event below this skips decay — tune empirically

function activateLock(startIndex) {
  isLocationLocked = true;
  locationLockY = getLocationLockY();
  window.scrollTo(0, locationLockY);
  lockPageScroll();
  const idx = pendingLocationIndex >= 0 ? pendingLocationIndex : startIndex;
  pendingLocationIndex = -1;
  switchLocationTo(idx);
  locationActivationCooldown = true;
  setTimeout(() => { locationActivationCooldown = false; }, 500);
}

function deactivateLock(direction) {
  isLocationLocked = false;
  unlockDirection = direction;
  unlockPageScroll();
  if (window.innerWidth <= 920) {
    const nudge = locationLockY + direction * 120;
    previousScrollY = nudge;
    window.scrollTo(0, nudge);
  }
}

window.addEventListener('scroll', () => {
  if (isScrollingToTop || isScrollingToSection) {
    previousScrollY = window.scrollY;
    return;
  }
  if (isLocationLocked) return;

  const lockY = getLocationLockY();
  const cur = window.scrollY;

  if (cur >= lockY && previousScrollY < lockY && unlockDirection !== 1) {
    unlockDirection = 0;
    activateLock(0);
  } else if (cur <= lockY && previousScrollY > lockY && unlockDirection !== -1) {
    unlockDirection = 0;
    activateLock(2);
  }

  previousScrollY = cur;
});

window.addEventListener('scrollend', () => {
  if (isScrollingToSection) {
    isScrollingToSection = false;
    clearTimeout(scrollingToSectionTimeout);
    previousScrollY = window.scrollY;
  }
});

window.addEventListener('wheel', (e) => {
  if (isScrollingToSection) return;

  if (isLocationLocked) {
    e.preventDefault();
    if (locationImageCooldown || locationActivationCooldown) return;
    const direction = e.deltaY > 0 ? 1 : -1;
    const next = currentLocationIndex + direction;
    if (next < 0 || next >= 3) {
      deactivateLock(direction);
      return;
    }
    locationImageCooldown = true;
    setTimeout(() => { locationImageCooldown = false; }, 500);
    switchLocationTo(next);
    return;
  }

  // Exponential deceleration in the approach zone
  const lockY = getLocationLockY();
  const cur = window.scrollY;
  const approachingDown = e.deltaY > 0 && unlockDirection !== 1 && (lockY - cur) > 0 && (lockY - cur) < APPROACH_ZONE;
  const approachingUp   = e.deltaY < 0 && unlockDirection !== -1 && (cur - lockY) > 0 && (cur - lockY) < APPROACH_ZONE;

  if (approachingDown || approachingUp) {
    e.preventDefault();
    const distance = approachingDown ? lockY - cur : cur - lockY;
    const factor = Math.abs(e.deltaY) >= APPROACH_SPEED_THRESHOLD
      ? Math.exp(-3 * (1 - distance / APPROACH_ZONE))
      : 1;
    const newScrollY = cur + e.deltaY * factor;

    if ((approachingDown && newScrollY >= lockY) || (approachingUp && newScrollY <= lockY)) {
      unlockDirection = 0;
      activateLock(approachingDown ? 0 : 2);
    } else {
      window.scrollTo(0, newScrollY);
    }
  }
}, { passive: false });

// Mobile touch handling for location cycling
let touchStartY = 0;

window.addEventListener('touchstart', (e) => {
  if (!isLocationLocked) return;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (!isLocationLocked) return;
  e.preventDefault();
}, { passive: false });

window.addEventListener('touchend', (e) => {
  if (!isLocationLocked) return;
  if (locationImageCooldown || locationActivationCooldown) return;
  const deltaY = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(deltaY) < 30) return;
  const direction = deltaY > 0 ? 1 : -1;
  const next = currentLocationIndex + direction;
  if (next < 0 || next >= 3) {
    deactivateLock(direction);
    return;
  }
  locationImageCooldown = true;
  setTimeout(() => { locationImageCooldown = false; }, 500);
  switchLocationTo(next);
}, { passive: true });

function setupLocationObserver() {
  if (locationObserverInstance) {
    locationObserverInstance.disconnect();
    locationObserverInstance = null;
  }
  if (window.innerWidth <= 920 && isLocationLocked) {
    isLocationLocked = false;
    unlockPageScroll();
  }
  // Mobile uses click-to-switch; no observer needed
}

window.addEventListener('resize', setupLocationObserver);
window.addEventListener('DOMContentLoaded', setupLocationObserver);
setupLocationObserver();

document.querySelectorAll('.location-item').forEach(item => {
  item.addEventListener('click', () => {
    const index = parseInt(item.getAttribute('data-index'));
    if (window.innerWidth > 920) {
      if (isLocationLocked) {
        switchLocationTo(index);
      } else {
        pendingLocationIndex = index;
        window.scrollTo({ top: getLocationLockY(), behavior: 'smooth' });
      }
    } else {
      switchLocationTo(index);
    }
  });
});
