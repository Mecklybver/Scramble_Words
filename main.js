let draggedWord = null; 
let audioContext = null; 

function createAudioContext() {
  audioContext = new AudioContext();
}

function getAudioFilePath(correctOrder) {
  // Find the sentence object that matches the correct order
  const sentenceObj = database.sentences.find(
    (sentence) => JSON.stringify(sentence.correctOrder) === JSON.stringify(correctOrder)
  );

  if (sentenceObj) {
    return sentenceObj.audioFilePath;
  }

  return null;
}

function playAudio(filePath) {
  if (!audioContext) {
    createAudioContext();
  }

  const audioSource = audioContext.createBufferSource();

  // Fetch the audio file
  fetch(filePath)
    .then((response) => response.arrayBuffer())
    .then((data) => audioContext.decodeAudioData(data))
    .then((buffer) => {
      // Assign the buffer to the audio source
      audioSource.buffer = buffer;

      // Connect the source to the audio context's destination (speakers)
      audioSource.connect(audioContext.destination);

      // Play the audio
      audioSource.start();
    })
    .catch((error) => console.error("Error loading audio:", error));
}


function getRandomSentence() {
  return database.sentences[
    Math.floor(Math.random() * database.sentences.length)
  ];
}

function displaySentence(sentence) {
  const sentenceContainer = document.getElementById("sentence-container");
  sentenceContainer.innerHTML = "";

  if (typeof sentence === "string") {
    // If sentence is a string, split it into words
    sentence = sentence.split(" ");
  }

  sentence.forEach((word) => {
    const wordElement = document.createElement("span");
    wordElement.textContent = word;
    wordElement.classList.add("word");
    wordElement.setAttribute("draggable", "true");
    sentenceContainer.appendChild(wordElement);
    sentenceContainer.appendChild(document.createTextNode(" ")); // Add space between words
  });
}

function checkOrder(words, correctOrder) {
  return words.every((word, index) => word === correctOrder[index]);
}

function scrambleWords(words) {
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  return words;
}

function startGame() {
  ({ sentence, correctOrder } = getRandomSentence());
  const scrambledSentence = scrambleWords([...correctOrder]);
  displaySentence(scrambledSentence);

  document.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("touchstart", handleTouchStart);
}

function handleMouseDown(event) {
  if (event.target.classList.contains("word")) {
    event.preventDefault();
    draggedWord = event.target;
    event.target.classList.add("dragging");
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }
}

function handleMouseMove(event) {
  if (draggedWord) {
    draggedWord.style.position = "absolute";
    draggedWord.style.left = event.clientX - draggedWord.offsetWidth / 2 + "px";
    draggedWord.style.top = event.clientY - draggedWord.offsetHeight / 2 + "px";
  }
}

function handleMouseUp(event) {
  if (draggedWord) {
    draggedWord.classList.remove("dragging");
    draggedWord.style.position = "";
    draggedWord.style.left = "";
    draggedWord.style.top = "";

    const dropTarget = document.elementFromPoint(event.clientX, event.clientY);
    if (dropTarget && dropTarget.classList.contains("word")) {
      const temp = draggedWord.textContent;
      draggedWord.textContent = dropTarget.textContent;
      dropTarget.textContent = temp;

      const sentenceContainer = document.getElementById("sentence-container");
      const words = Array.from(sentenceContainer.querySelectorAll(".word"));
      if (
        checkOrder(
          words.map((word) => word.textContent),
          correctOrder
        )
      ) {
        console.log("Correct order:", correctOrder);
        document.body.style.backgroundColor = "green";
        playAudio(getAudioFilePath(correctOrder));

        setTimeout(() => {
          ({ sentence, correctOrder } = getRandomSentence());
          const scrambledSentence = scrambleWords([...correctOrder]);
          document.body.style.backgroundColor = "white";

          displaySentence(scrambledSentence);
        }, 4000);
      }
    }

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    draggedWord = null;
  }
}

function handleTouchStart(event) {
  if (event.target.classList.contains("word")) {
    event.preventDefault();
    draggedWord = event.target;
    const touch = event.touches[0];
    draggedWord.classList.add("dragging");
    draggedWord.style.position = "absolute";
    draggedWord.style.left = touch.clientX - draggedWord.offsetWidth / 2 + "px";
    draggedWord.style.top = touch.clientY - draggedWord.offsetHeight / 2 + "px";
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  }
}

function handleTouchMove(event) {
  if (draggedWord) {
    const touch = event.touches[0];
    draggedWord.style.left = touch.clientX - draggedWord.offsetWidth / 2 + "px";
    draggedWord.style.top = touch.clientY - draggedWord.offsetHeight / 2 + "px";
  }
}

function handleTouchEnd(event) {
  event.preventDefault();
  if (draggedWord) {
    draggedWord.classList.remove("dragging");
    draggedWord.style.position = "";
    draggedWord.style.left = "";
    draggedWord.style.top = "";

    const dropTarget = document.elementFromPoint(
      event.changedTouches[0].clientX,
      event.changedTouches[0].clientY
    );
    if (dropTarget && dropTarget.classList.contains("word")) {
      const temp = draggedWord.textContent;
      draggedWord.textContent = dropTarget.textContent;
      dropTarget.textContent = temp;

      const sentenceContainer = document.getElementById("sentence-container");
      const words = Array.from(sentenceContainer.querySelectorAll(".word"));
      if (
        checkOrder(
          words.map((word) => word.textContent),
          correctOrder
        )
      ) {
        console.log("Correct order:", correctOrder);
        document.body.style.backgroundColor = "green";
        playAudio(getAudioFilePath(correctOrder));

        setTimeout(() => {
          ({ sentence, correctOrder } = getRandomSentence());
          const scrambledSentence = scrambleWords([...correctOrder]);
          document.body.style.backgroundColor = "white";

          displaySentence(scrambledSentence);
        }, 4000);
      }
    }

    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
    draggedWord = null;
  }
}

window.addEventListener("load", startGame);
