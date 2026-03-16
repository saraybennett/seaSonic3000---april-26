console.log("hi");

//global variables
const plankton1Audio = new Audio("./audio/plankton1.mp3");
plankton1Audio.loop = true;

const seaweed2Audio = new Audio("./audio/seaweed2.mp3");
seaweed2Audio.loop = true;

const eelAudio = new Audio("./audio/eel.mp3");
eelAudio.loop = true;

const angel1Audio = new Audio("./audio/angel1.mp3");
angel1Audio.loop = true;

const jellyAudio = new Audio("./audio/jelly.mp3");
jellyAudio.loop = true;

const urchinAudio = new Audio("./audio/urchin.mp3"); //currently not hearing this, can add with the green seaweed if we want
urchinAudio.loop = true;

const gearsnailAudio = new Audio("./audio/gearsnail.mp3");
gearsnailAudio.loop = true;

const seaweed1Audio = new Audio("./audio/seaweed1.mp3");
seaweed1Audio.loop = true;

const anglerAudio = new Audio("./audio/angler.mp3");
anglerAudio.loop = true;

//refactored code:

const creatureData = {
  plankton1: {
    audio: plankton1Audio,
    isPlaying: false,
  },
  seaweed1: {
    audio: seaweed1Audio,
    isPlaying: false,
  },
  angler: {
    audio: anglerAudio,
    isPlaying: false,
  },
  angel1: {
    audio: angel1Audio,
    isPlaying: false,
  },
  urchin: {
    audio: urchinAudio,
    isPlaying: false,
  },
  eel: {
    audio: eelAudio,
    isPlaying: false,
  },
  jelly: {
    audio: jellyAudio,
    isPlaying: false,
  },
  gearsnail: {
    audio: gearsnailAudio,
    isPlaying: false,
  },

  seaweed2: {
    audio: seaweed2Audio,
    isPlaying: false,
  },
};

// single event listener for all creatures

document.addEventListener("click", (event) => {
  const id = event.target.id;
  const creature = creatureData[id];

  // Check if the clicked element is one of our defined creatures
  if (creature) {
    const element = event.target;

    // toggle audio and animation
    if (creature.isPlaying) {
      creature.audio.pause();
      creature.audio.currentTime = 0;
      creature.isPlaying = false;
      element.classList.remove("playing");
    } else {
      creature.audio.play().catch((err) => console.log("Audio blocked:", err));
      creature.isPlaying = true;
      element.classList.add("playing");
    }

    // show the popup description
    showPopup(creature.text);
  }
});

//stop all audio button

const stopButton = document.getElementById("stop-all");

stopButton.addEventListener("click", () => {
  // Loop through every key in the creatureData object (plankton, seaweed, etc.)
  Object.keys(creatureData).forEach((id) => {
    const creature = creatureData[id];
    const element = document.getElementById(id);

    // Stop the audio and reset state
    creature.audio.pause();
    creature.audio.currentTime = 0;
    creature.isPlaying = false;

    // Remove the animation class from the image if it exists
    if (element) {
      element.classList.remove("playing");
    }
  });

  // Optional: Hide any open popups when stopping all
  // hidePopup();
});
