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

// Older Safari (roughly 10-13) ignores the options-object form of
// window.scrollTo entirely - and our nav clicks preventDefault first, so a
// dropped call there would leave the links doing nothing at all. Feature-
// detect once and fall back to the two-argument form (an instant jump).
const supportsSmoothScroll = "scrollBehavior" in document.documentElement.style;

function scrollWindowTo(top) {
  if (supportsSmoothScroll) {
    window.scrollTo({ top: top, behavior: "smooth" });
  } else {
    window.scrollTo(0, top);
  }
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
    elt("div", ["subscript-1", "quicksand"], ["Integrative Psychotherapy and Counselling"]),
  ]
);

nameDiv.addEventListener("click", () => {
  scrollWindowTo(0);
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
    scrollWindowTo(top);
  });
});

window.addEventListener("resize", updateNavCramped);

// Scroll to top button logic
const scrollTopBtn = document.getElementById("scrollTopBtn");

scrollTopBtn.addEventListener("click", () => {
  scrollWindowTo(0);
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
  // Written out longhand rather than with ?. - optional chaining is a syntax
  // error on older Safari, which would take the whole file down with it.
  const item = document.querySelector(`.location-item[data-index="${index}"]`);
  const img = document.querySelector(`.location-img[data-index="${index}"]`);
  if (item) item.classList.add('active-location');
  if (img) img.classList.add('active-img');
  currentLocationIndex = index;
}

// The nav grows when the name block slides in, so --nav-height (which parks the
// sticky location panel clear of it) has to be re-measured on that swap too.
function setNavHeightVar() {
  document.documentElement.style.setProperty('--nav-height', navEl.offsetHeight + 'px');
  // The pinned location panel is centred in the space under the nav, and CSS
  // cannot know its content height - it changes with width - so hand it over.
  if (locSticky) {
    document.documentElement.style.setProperty('--loc-sticky-h', locSticky.offsetHeight + 'px');
  }
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
    const index = parseInt(item.getAttribute('data-index'), 10);
    const { startY, scrollable } = locationScrollRange();
    scrollWindowTo(startY + scrollable * ((index + 0.5) / locImgCount));
  });
});

// --- Room notes: scroll-linked reveal (phone layout only) ---
// The band below the panel is the phone copy of the notes - on desktop they sit
// inside the panel and this whole block finds nothing to do.
// These sit directly under the pinned location panel, and the band scrolls
// into view roughly 200px BEFORE the panel unpins. A timed fade therefore ran
// and finished while the panel was still stuck, so by the time you scrolled
// past the last location the notes were already fully formed - which read as
// them appearing instantly. Opacity is driven from scroll position instead:
// the reveal advances only as far as you scroll, so it cannot outrun you.
// Scoped to the band, not to .room-note generally: the desktop copy of these
// notes lives inside the pinned panel and must never be faded out by this.
const roomNotes = document.querySelectorAll('.room-notes .room-note');
const roomNotesWrap = document.querySelector('.room-notes');

if (roomNotes.length && roomNotesWrap) {
  // Hidden state lives behind this class so a JS failure leaves the notes
  // readable rather than permanently at opacity 0.
  roomNotesWrap.classList.add('room-notes-reveal');

  const noMotion = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Measured as a fraction of viewport height, from the note's own top edge.
  // START sits below where the note stands when the panel finally releases
  // (~0.76), so nothing begins until the pin has let go; the span between the
  // two is the scroll distance the fade takes - a little under half a screen.
  const REVEAL_START = 0.92;
  const REVEAL_END = 0.50;
  const STAGGER = 0.06; // second column trails the first

  function updateRoomNotes() {
    const vh = window.innerHeight;

    roomNotes.forEach((note, i) => {
      const top = note.getBoundingClientRect().top / vh;
      const from = REVEAL_START - i * STAGGER;
      const to = REVEAL_END - i * STAGGER;
      let p = (from - top) / (from - to);
      p = Math.min(1, Math.max(0, p));
      // Ease out, so the last stretch settles rather than stopping dead.
      const eased = 1 - Math.pow(1 - p, 3);

      note.style.opacity = eased;
      note.style.transform = noMotion
        ? ''
        : 'translateY(' + ((1 - eased) * 28).toFixed(2) + 'px)';
    });
  }

  let notesTicking = false;
  window.addEventListener('scroll', () => {
    if (notesTicking) return;
    notesTicking = true;
    requestAnimationFrame(() => { updateRoomNotes(); notesTicking = false; });
  }, { passive: true });

  window.addEventListener('resize', updateRoomNotes);
  window.addEventListener('load', updateRoomNotes);
  updateRoomNotes();
}
