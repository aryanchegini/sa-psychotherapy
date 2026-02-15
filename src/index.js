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

function isPartiallyInViewport(element) {
  const rect = element.getBoundingClientRect();
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  const topVisible = rect.top <= windowHeight && rect.bottom >= 0;
  const leftVisible = rect.left <= windowWidth && rect.right >= 0;

  return topVisible && leftVisible;
}

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

let nameDiv = elt(
  "h3",
  ["nav-name"],
  [
    elt("p", [], ["Soraya Chegini-Adams"]),
    elt("div", ["subscript"], ["Psychotherapist"]),
  ]
);
const innerNav = document.getElementById("inner-nav");
const handDiv = document.getElementById("inner-home");

let nameInNav = false;
window.addEventListener("scroll", () => {
  if (!isPartiallyInViewport(handDiv) && !nameInNav) {
    innerNav.classList.remove("centered-div", "right-menu");
    innerNav.classList.add("row-aligned");
    innerNav.prepend(nameDiv);
    nameInNav = true;
  }
  if (isPartiallyInViewport(handDiv) && nameInNav) {
    innerNav.classList.remove("row-aligned");
    innerNav.classList.add("centered-div", "right-menu");
    nameDiv.remove();
    nameInNav = false;
  }
});

function calculateDivLocations() {
  return new Promise((resolve) => {
    // adjust hand page height
    let handHeight = handDiv.getBoundingClientRect().height;
    let navHeight = document.querySelector("nav").getBoundingClientRect().height;
    if (handHeight + navHeight < window.innerHeight) {
      let diff = window.innerHeight - (handHeight + navHeight);
      handDiv.style.height = handHeight + diff + "px";
    }

    let feesHeight = document.querySelector(".session-div").getBoundingClientRect().height;
    if (feesHeight + 100 != window.innerHeight && (window.innerHeight - 100) > 500) {
      let diff = window.innerHeight - (feesHeight + 100);
      document.querySelector(".session-div").style.height = feesHeight + diff + "px";
    }


    resolve({
      home: 0,
      approach: document.getElementById("home").getBoundingClientRect().height,
      about:
        document.getElementById("home").getBoundingClientRect().height +
        document.getElementById("approach").getBoundingClientRect().height,
      fees:
        document.getElementById("home").getBoundingClientRect().height +
        document.getElementById("approach").getBoundingClientRect().height +
        document.getElementById("about").getBoundingClientRect().height,
      contact:
        document.getElementById("home").getBoundingClientRect().height +
        document.getElementById("approach").getBoundingClientRect().height +
        document.getElementById("about").getBoundingClientRect().height +
        document.getElementById("fees").getBoundingClientRect().height,
    });
  });
}

async function setScrolls() {
  try {
    const divLocations = await calculateDivLocations();
    // Now that divLocations are calculated, use them for scrolling
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (event) {
        event.preventDefault();
        let divName = this.getAttribute("href").substring(1);
        window.scroll({
          top: divLocations[divName],
          left: 0,
          behavior: "smooth",
        });
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
