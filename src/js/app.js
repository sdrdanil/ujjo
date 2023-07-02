import { isWebp } from './modules/service.js';
import { throttle } from './modules/functional.js';

isWebp();

function getClearValue(str) {
  return +str.trim().slice(0, -2);
}

const body = document.body;

// Menu
const overlay = document.querySelector('.overlay');
const header = document.querySelector('.header');
const btnToggleMenu = document.querySelector('#toggle-menu');
const headerNavs = header.querySelectorAll('nav');
const documentTabs = [...document.querySelectorAll('a, input, button')].filter(
  (elem) => !elem.closest('header'),
);

function toggleMenu() {
  // !reverse logic!
  if (header.classList.contains('header--active')) {
    headerNavs.forEach((elem) =>
      elem.addEventListener(
        'transitionend',
        () => {
          elem.classList.remove('header__nav--show');
        },
        { once: true },
      )
    );
    documentTabs.forEach((elem) => elem.setAttribute('tabindex', '0'));
  } else {
    headerNavs.forEach((elem) => elem.classList.add('header__nav--show'));
    documentTabs.forEach((elem) => elem.setAttribute('tabindex', '-1'));
  }

  body.classList.toggle('scroll-off');
  overlay.classList.toggle('overlay--active');
  setTimeout(() => header.classList.toggle('header--active'), 10);
}

function updateHeaderHeight() {
  document
    .querySelector(':root')
    .style.setProperty('--header-height', `${header.clientHeight}px`);
}

btnToggleMenu.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);
window.addEventListener('load', updateHeaderHeight);
window.addEventListener('resize', updateHeaderHeight);

// Header slide
const bodyPaddingTop = getClearValue(
  getComputedStyle(document.documentElement).getPropertyValue(
    '--body-padding-y',
  ),
);

let lastScrollY = 0;

window.addEventListener('scroll', (event) => {
  if (window.scrollY < bodyPaddingTop + header.clientHeight) {
    header.classList.remove('header--scrolling--show');
    header.classList.remove('header--scrolling--hidden');
  }
  if (window.scrollY < bodyPaddingTop) {
    const offsetTop = bodyPaddingTop - window.scrollY;
    header.style.top = `${offsetTop}px`;
    return;
  }
  header.style.top = 0;
  const delta = window.scrollY - lastScrollY;
  const minDelta = 40;
  if (Math.abs(delta) < minDelta) return;
  lastScrollY = window.scrollY;
  if (delta < 0) {
    header.classList.remove('header--scrolling--hidden');
    header.classList.add('header--scrolling--show');
  } else {
    header.classList.remove('header--scrolling--show');
    header.classList.add('header--scrolling--hidden');
  }
});

btnToggleMenu.addEventListener('focus', () => {
  header.classList.remove('header--scrolling--hidden');
  header.classList.add('header--scrolling--show');
});

// Running line
function updateRunningLines() {
  const blockName = '.running-line';
  const wrapperName = `${blockName}__wrapper`;
  const itemName = `${blockName}__item`;
  const copiedItemName = `${itemName}--copied`;

  function getWidth(elem) {
    return elem.getBoundingClientRect().width;
  }

  function getArrayWidths(items) {
    return items.map((item) => getWidth(item));
  }

  function calculateLineLength(items, gap) {
    return items.reduce((result, item) => result + item + gap, 0);
  }

  document.querySelectorAll(`${blockName}`).forEach((rootElem) => {
    const wrapperElem = rootElem.querySelector(wrapperName);
    const visibleWidth = getWidth(rootElem);
    const baseItems = [...wrapperElem.children].filter(
      (item) => !item.classList.contains(copiedItemName),
    );
    const baseItemsWidths = getArrayWidths(baseItems);
    const gap = getClearValue(
      getComputedStyle(wrapperElem).getPropertyValue('gap'),
    );
    const baseLength = calculateLineLength(baseItemsWidths, gap);
    const currentLength = calculateLineLength(
      getArrayWidths([...wrapperElem.children]),
      gap,
    );
    rootElem.style.setProperty('--length', baseLength);

    if (currentLength >= 2 * visibleWidth) return;

    let resultLength = currentLength;
    while (resultLength < 2 * visibleWidth) {
      wrapperElem.append(
        ...baseItems.map((item) => {
          const newItem = item.cloneNode(true);
          newItem.classList.add(copiedItemName);
          return newItem;
        }),
      );
      resultLength += baseLength + gap;
    }
  });
}

window.addEventListener('load', updateRunningLines);
window.addEventListener('resize', updateRunningLines);

// Text wheel
const storyBlockText = document.querySelector('.story__block--text');
const textWrapper = storyBlockText.querySelector('.story__text-wrapper');
const buttonWheelUp = document.querySelector('.story__wheel-button--up');
const buttonWheelDown = document.querySelector('.story__wheel-button--down');
const wheelScrollSizeBig = 30;
const wheelScrollSizeSmall = 5;
const wheelInterval = 50;

function checkWheelTop() {
  return textWrapper.scrollTop > 0;
}

function checkWheelBottom() {
  return (
    textWrapper.scrollTop + textWrapper.clientHeight + 1 <
    textWrapper.scrollHeight
  );
}

function updateWheel() {
  if (!checkWheelTop() && !checkWheelBottom()) {
    textWrapper.classList.add('story__text-wrapper--centered');
  } else {
    textWrapper.classList.remove('story__text-wrapper--centered');
  }
  if (checkWheelTop()) {
    buttonWheelUp.classList.add('story__wheel-button--show');
  } else {
    buttonWheelUp.classList.remove('story__wheel-button--show');
  }
  if (checkWheelBottom()) {
    buttonWheelDown.classList.add('story__wheel-button--show');
  } else {
    buttonWheelDown.classList.remove('story__wheel-button--show');
  }
}

function storyTextWheel(event) {
  if (!checkWheelTop() && !checkWheelBottom()) return;
  event.preventDefault();
  if (event.deltaY < 0) {
    textWrapper.scrollTop -= wheelScrollSizeBig;
    updateWheel();
  } else {
    textWrapper.scrollTop += wheelScrollSizeBig;
    updateWheel();
  }
}

function pointerWheelButton(vector) {
  return (event) => {
    const intervalId = setInterval(() => {
      textWrapper.scrollTop += wheelScrollSizeSmall * vector;
      updateWheel();
    }, wheelInterval);
    window.addEventListener('pointerup', () => clearInterval(intervalId), {
      once: true,
    });
  };
}

function keyWheelButton(vector) {
  return (event) => {
    if (event.code != 'Space') return;
    if (event.repeat) return;
    const intervalId = setInterval(() => {
      textWrapper.scrollTop += wheelScrollSizeSmall * vector;
      updateWheel();
    }, wheelInterval);
    window.addEventListener('keyup', () => clearInterval(intervalId), {
      once: true,
    });
  };
}

window.addEventListener('load', updateWheel);
window.addEventListener('resize', updateWheel);
buttonWheelUp.addEventListener('pointerdown', pointerWheelButton(-1));
buttonWheelUp.addEventListener('keydown', keyWheelButton(-1));
buttonWheelUp.addEventListener('blur', () => {
  if (!checkWheelTop()) {
    buttonWheelDown.focus();
  }
});
buttonWheelDown.addEventListener('pointerdown', pointerWheelButton(+1));
buttonWheelDown.addEventListener('keydown', keyWheelButton(+1));
buttonWheelDown.addEventListener('blur', () => {
  if (!checkWheelBottom()) {
    buttonWheelUp.focus();
  }
});
textWrapper.addEventListener('mousewheel', storyTextWheel);

let lastTouchY;
textWrapper.addEventListener('touchstart', (event) => {
  lastTouchY = event.targetTouches[0].clientY;
});
textWrapper.addEventListener('touchmove', (event) => {
  event.preventDefault();
  const currentTouchY = event.targetTouches[0].clientY;
  textWrapper.scrollTop += -(currentTouchY - lastTouchY) * 1;
  lastTouchY = currentTouchY;
  updateWheel();
});

// Footer
const footer = document.querySelector('.footer');
const footerBox = footer.querySelector('.footer__box');
const throttleMs = getClearValue(
  getComputedStyle(document.documentElement).getPropertyValue('--throttle-ms'),
);
let mouseIsTracked = false;

function determineValuesFooter() {
  const footerRect = footer.getBoundingClientRect();
  footer.style.setProperty(
    '--footer-top',
    `${footerRect.top + window.scrollY}px`,
  );
  footer.style.setProperty('--footer-height', `${footerRect.height}px`);
  footer.style.setProperty(
    '--footer-box-height',
    `${footerBox.offsetHeight}px`,
  );
}

function updateMouse(event) {
  if (!mouseIsTracked) return;
  document.documentElement.style.setProperty('--x', `${event.pageX}px`);
  document.documentElement.style.setProperty('--y', `${event.pageY}px`);
}

function setOriginValue() {
  document.documentElement.style.setProperty('--x', `50vw`);
  document.documentElement.style.setProperty(
    '--y',
    `${footer.offsetTop + 170}px`,
  );
}

const observer = new IntersectionObserver(([footerEntry]) => {
  if (footerEntry.isIntersecting) {
    mouseIsTracked = true;
  } else {
    mouseIsTracked = false;
    setOriginValue();
  }
});
observer.observe(footer);

window.addEventListener('load', setOriginValue);
window.addEventListener('resize', setOriginValue);
window.addEventListener('load', determineValuesFooter);
window.addEventListener('resize', determineValuesFooter);
window.addEventListener('mousemove', throttle(updateMouse, throttleMs));
