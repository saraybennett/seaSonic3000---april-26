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

//set up web socket connection to server
const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const host = window.location.host;
const wsUrl = `${protocol}//${host}`;
console.log("Connecting to WebSocket:", wsUrl);

const ws = new WebSocket(wsUrl);

ws.onmessage = (event) => {
  console.log("Message from server:", event.data);
  try {
    const data = JSON.parse(event.data);

    //using initial data from the server to update the user cursor
    if (data.type === "initialState") {
      console.log("this is the cursor index:" + data.cursorState);

      // Add image load handlers
      myCursorElement.onload = function () {
        console.log("Cursor image loaded successfully!");
      };
      myCursorElement.onerror = function () {
        console.error("Failed to load cursor image:", userCursor);
      };

      document.body.appendChild(myCursorElement);

      //below code not needed for now, leaving in case we need to ref later
      // if (data.state.jellyState) {
      //   jelly.classList.add("jelly-on");
      // } else {
      //   jelly.classList.remove("jelly-on");
      // }
    }
    // Toggle user's cursor audio on click (play/stop & broadcast this via sockets)
    document.addEventListener("click", function (event) {
      //triger a message being sent to the server
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "userClick",
            name: userName,
          }),
        );
      }

      if (userCursorConfig.isPlaying) {
        // Stop the audio
        userCursorConfig.audio.pause();
        userCursorConfig.audio.currentTime = 0; // Reset to beginning
        userCursorConfig.isPlaying = false;
        console.log(`${userCursorConfig.name} audio stopped`);
      } else {
        // Play the audio
        userCursorConfig.audio.play().catch((err) => {
          console.log("Audio play prevented:", err);
        });
        userCursorConfig.isPlaying = true;
        console.log(`${userCursorConfig.name} audio playing`);
      }
    });

    if (data.type === "userData") {
      users[data.id] = data;
      console.log("Received userData:", data);

      // Only draw cursor if position and cursor image data exists
      if (
        data.data.x !== undefined &&
        data.data.y !== undefined &&
        data.data.cursor
      ) {
        var el = getCursorElement(data.data.id, data.data.cursor);
        console.log(el);
        el.style.left = data.data.x + "px";
        el.style.top = data.data.y + "px";
        // console.log("Drew cursor for:", data.id, "at", data.x, data.y);
      }
    }
  } catch (error) {
    console.error("Error parsing message:", error);
  }
};

function showPopup(text) {
  const popupText = document.getElementById("popup_text");
  const popup = document.getElementById("center_popup");

  if (popupText) {
    popupText.textContent = text || "";
  }

  if (popup) {
    popup.style.display = "block";
  }
}

// single event listener for all creatures

document.addEventListener("click", (event) => {
  const id = event.target.id;
  const creature = creatureData[id];

  if (!creature) {
    return;
  }

  const element = event.target;

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

  if (id === "jelly" && ws && ws.readyState === WebSocket.OPEN) {
    console.log("Jelly was clicked!");
    ws.send(
      JSON.stringify({
        type: "userClick",
        name: "jelly",
      }),
    );
  }

  showPopup(creature.text);
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
