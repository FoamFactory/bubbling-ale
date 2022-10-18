let containerSqpx = -1;
let containerWidth = -1;
let containerHeight = -1;
let numBubbles = 0;

function createBubble(parent) {
  if (containerWidth < 0) {
    containerWidth = parent.getBoundingClientRect().width;
  }

  if (containerHeight < 0) {
    containerHeight = parent.getBoundingClientRect().height;
  }

  let speed = getRandomBubbleSpeed();
  let size = getRandomBubbleSize();
  let leftPos = getRandomBubbleLeftPosition(containerWidth);
  let bubbleElement = document.createElement('div');
  bubbleElement.setAttribute('class', 'bubble');
  bubbleElement.style.height = `${size}px`;
  bubbleElement.style.width = `${size}px`;
  bubbleElement.style.position = 'absolute';
  bubbleElement.style.border = '1px solid rgba(255, 255, 255, 0.3)';
  bubbleElement.style.borderRadius = '50%';
  bubbleElement.style.left = `${leftPos}px`;
  bubbleElement.style.bottom = '0px';
  bubbleElement.style.zIndex = '1';
  bubbleElement.style.transition = `transform ${speed}s`;
  bubbleElement.style.transform = `translateY(0px)`;
  bubbleElement.addEventListener("transitionend", bubbleEnded);

  parent.appendChild(bubbleElement);
  numBubbles++;

  return {
    element: bubbleElement,
    position: 0,
    speed: getRandomBubbleSpeed(),
    maxPosition: Math.floor(parent.getBoundingClientRect().height + 10),
    updateStarted: false
  }
}

function bubbleEnded(event) {
  let bubbleElement = event.srcElement;
  bubbleElement.parentNode.removeChild(bubbleElement);
  numBubbles--;
}

function getMaxBubblesForContainer(container) {
  // We want a distribution of about 0.005 bubbles/sqpx
  if (containerSqpx < 0) {
    containerSqpx = container.getBoundingClientRect().width
    * container.getBoundingClientRect().height;
  }

  let maxNum = Math.floor(0.005 * containerSqpx);
  return maxNum;
}

// Will return a random speed, in px/second, between 10 and 50
function getRandomBubbleSpeed() {
  return Math.floor((Math.random() * 40) + 10);
}

// Will return a random size, in px, between 4px and 15px
function getRandomBubbleSize() {
  return Math.floor(Math.random() * 11 + 4);
}

function getRandomBubbleLeftPosition(width) {
  // the left position must be between 1 and the max container width - 1
  return Math.floor((Math.random() * (width - 1) + 1));
}

function carbonate(element) {
  let bubbles;
  if (window.bubbler) {
    bubbles = window.bubbler.bubbles;
  } else {
    bubbles = [];
    window.bubbler = {};
  }

  bubbles.push(createBubble(element));

  window.bubbler.bubbles = bubbles;

  if (!window.bubbler.carbonatedElements) {
    window.bubbler.carbonatedElements = [];
  }

  window.bubbler.carbonatedElements.push(element);

  window.requestAnimationFrame(updateBubblePositions);
}

function updateBubblePositions(timestamp) {
  if (window.bubbler.lastUpdateTime) {
    let elapsed = timestamp - window.bubbler.lastUpdateTime;
    let bubbles = window.bubbler.bubbles;
    let updatedBubbles = [];

    for (let bubbleIdx in bubbles) {
      let bubble = bubbles[bubbleIdx];
      if (!bubble.updateStarted) {
        let maxPosition = bubble.maxPosition;
        bubble.element.style.transform = `translateY(-${maxPosition}px)`;
        bubble.updateStarted = true;
      }

      bubble.position = bubble.position + ((bubble.speed / 1000.0) * elapsed);

      updatedBubbles.push(bubble);
    }

    // Randomly create between 1 and 5 bubbles PER carbonated element, depending
    // on bubbleChance
    let carbonatedParents = window.bubbler.carbonatedElements;
    for (let carbonatedContainerIdx in carbonatedParents) {
      let carbonationContainer = carbonatedParents[carbonatedContainerIdx];

      // There is a sliding scale determining how many bubbles will be created.
      let bubbleChance;
      if (numBubbles < 20) {
        // if there are less than 20 bubbles in the view, there is a 100% chance
        // that bubbles will be created
        bubbleChance = 1.0;
      } else if (numBubbles >= getMaxBubblesForContainer(carbonationContainer)) {
        // if there are >= our max distribution of bubbles in the view, there
        // is a 0% chance of new bubble creation.
        bubbleChance = 0.0;
      } else {
        // there is a 50% chance of bubble creation
        bubbleChance = 0.5;
      }

      let numBubblesToCreate = Math.floor(bubbleChance * (Math.random() * 5 + 1));
      for (let i = 0; i < numBubblesToCreate; i++) {
        updatedBubbles.push(createBubble(carbonationContainer));
      }
    }

    window.bubbler.bubbles = updatedBubbles;
  }

  window.bubbler.lastUpdateTime = timestamp;
  window.requestAnimationFrame(updateBubblePositions);
}
