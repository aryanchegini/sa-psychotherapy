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
        document.getElementById("fees-location").getBoundingClientRect().height,
      contact:
        document.getElementById("home").getBoundingClientRect().height +
        document.getElementById("approach").getBoundingClientRect().height +
        document.getElementById("about").getBoundingClientRect().height +
        document.getElementById("fees-location").getBoundingClientRect().height +
        document.getElementById("faq").getBoundingClientRect().height,
    });
  });
}

async function setScrolls() {
  try {
    const divLocations = await calculateDivLocations();
    // Now that divLocations are calculated, use them for scrolling
    // IMPORTANT: This only works if the anchor hrefs match the keys in divLocations exactly (e.g., #fees-location maps to divLocations['fees-location'])
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
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
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
