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

let nameInNav = false;
window.addEventListener("scroll", () => {
  const handRect = innerHome.getBoundingClientRect();
  const navRect = document.querySelector("nav").getBoundingClientRect();
  
  // Check if the bottom of the Home section has scrolled up past the nav bar
  // This means the Home section is no longer fully visible "under" the nav
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
});

function calculateDivLocations() {
  return new Promise((resolve) => {
    // adjust hand page height
    let innerHomeHeight = innerHome.getBoundingClientRect().height;
    let navHeight = document.querySelector("nav").getBoundingClientRect().height;
    if (innerHomeHeight + navHeight < window.innerHeight) {
      let diff = window.innerHeight - (innerHomeHeight + navHeight);
      innerHome.style.height = innerHomeHeight + diff + "px";
    }

    resolve({
      home: 0,
      approach: document.getElementById("home").getBoundingClientRect().height,
      about:
        document.getElementById("home").getBoundingClientRect().height +
        document.getElementById("approach").getBoundingClientRect().height,
      "fees-location":
        document.getElementById("home").getBoundingClientRect().height +
        document.getElementById("approach").getBoundingClientRect().height +
        document.getElementById("about").getBoundingClientRect().height,
      faq:
        document.getElementById("home").getBoundingClientRect().height +
        document.getElementById("approach").getBoundingClientRect().height +
        document.getElementById("about").getBoundingClientRect().height +
        document.getElementById("fees").getBoundingClientRect().height+
        document.getElementById("location").getBoundingClientRect().height,
      contact:
        document.getElementById("home").getBoundingClientRect().height +
        document.getElementById("approach").getBoundingClientRect().height +
        document.getElementById("about").getBoundingClientRect().height +
        document.getElementById("fees").getBoundingClientRect().height +
        document.getElementById("location").getBoundingClientRect().height +
        document.getElementById("faq").getBoundingClientRect().height,
    });
  });
}

async function setScrolls() {
  try {
    const divLocations = await calculateDivLocations();
    // Now that divLocations are calculated, use them for scrolling
    // IMPORTANT: This only works if the anchor hrefs match the keys in divLocations exactly (e.g., #fees maps to divLocations['fees'])
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (event) {
        let divName = this.getAttribute("href").substring(1);
        
        // Only override if we have a calculated location for this section
        if (divLocations.hasOwnProperty(divName)) {
          event.preventDefault();
          window.scroll({
            top: divLocations[divName],
            left: 0,
            behavior: "smooth",
          });
        }
      });
    });
  } catch (error) {
    console.error(error);
  }
}

window.addEventListener("DOMContentLoaded", setScrolls);

window.addEventListener("load", setScrolls);

window.addEventListener('resize', setScrolls);

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

// Intro text reveal logic for mobile
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 1
};

const observer = new IntersectionObserver((entries) => {
  // Only apply on mobile/tablet (matching existing CSS breakpoint)
  if (window.innerWidth > 920) return;

  entries.forEach(entry => {
    const homeInfo = entry.target;
    const introContent = document.querySelector('.intro-content');
    
    if (!homeInfo || !introContent) return;

    if (entry.isIntersecting) {
      homeInfo.classList.add('mobile-reveal');
      introContent.classList.add('mobile-dim');
    } else {
      homeInfo.classList.remove('mobile-reveal');
      introContent.classList.remove('mobile-dim');
    }
  });
}, observerOptions);

const homeInfoText = document.querySelector('.home-info');
if (homeInfoText) observer.observe(homeInfoText);

// Location scroll hijacking
let isScrollingToTop = false;
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
  const wrapper = document.querySelector('.location-imgs-wrapper');
  if (!wrapper) return Infinity;
  const navHeight = document.querySelector('nav').offsetHeight;
  const wrapperDocTop = wrapper.getBoundingClientRect().top + window.scrollY;
  const viewportCenter = navHeight + (window.innerHeight - navHeight) / 2;
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
}

window.addEventListener('scroll', () => {
  if (window.innerWidth <= 920 || isScrollingToTop) {
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

window.addEventListener('wheel', (e) => {
  if (window.innerWidth <= 920) return;

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

function setupLocationObserver() {
  if (locationObserverInstance) {
    locationObserverInstance.disconnect();
    locationObserverInstance = null;
  }
  if (window.innerWidth <= 920 && isLocationLocked) {
    isLocationLocked = false;
    unlockPageScroll();
  }
  if (window.innerWidth > 920) return;

  locationObserverInstance = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        switchLocationTo(parseInt(entry.target.getAttribute('data-index')));
      }
    });
  }, { root: null, rootMargin: '-40% 0px -40% 0px', threshold: 0 });

  document.querySelectorAll('.location-img').forEach(img => locationObserverInstance.observe(img));
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
      const targetImg = document.querySelector(`.location-img[data-index="${index}"]`);
      if (targetImg) {
        window.scrollTo({ top: targetImg.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
      }
    }
  });
});
