//set up server
import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

//additional setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static("public"));
const server = createServer(app);
const wss = new WebSocketServer({ server });

//serve public folder

app.use("/", express.static("public"));

//define other routes

app.get("/home", (req, res) => {
  res.send(path.join("hello"));
});

const clients = new Set(); //a js storage object, similiar to array, but will prevent duplicate data
const users = {}; //object to hold user data

//set up cursor info
let cursors = [
  { id: null },
  { id: null },
  { id: null },
  { id: null },
  { id: null },
  { id: null },
  { id: null },
  { id: null },
  { id: null },
  { id: null },
]; // and so on

//determine what needs to be kept here - initial values for jellyfish motor off/on, distance for the eel and the angler
const serverState = {
  //is jellyfish on?
  jellyOn: false,
  anglerOn: false,
  servoAngle: 90, //initial angle for the servo motor - this is the one that controls the jellyfish movement

  // Example 2 state - REMOVE if we don't need
  //   brightness: 128,
  //   pulseRate: 50,
  //   servoAngle: 90,

  //angler distance
  anglerDistance: 122,
};

//helpter function for brodcasting data to clients
function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

//set up web socket !

wss.on("connection", (ws, req) => {
  //ws is the connected client

  console.log("New client connected");
  clients.add(ws); //add the connected client to the clients set
  console.log("thse are the clients:" + clients);

  //add unique ids to each client
  ws.id = randomUUID(); // Assign unique id
  console.log(`Client connected with ID: ${ws.id}`);

  //assign a cursor index value to the new user
  let cursorIndex = null;

  for (let i = 0; i < cursors.length; i++) {
    if (cursors[i].id == null) {
      //assign a cursor to that user
      cursors[i].id = ws.id;
      cursorIndex = i;
      console.log(cursorIndex);
      break;
    }
  }

  // Send current state to newly connected client - send the cursorIndex - # inside the cursor array
  //do it within the initial state message on client side - 251, add the cursor value there
  ws.send(
    JSON.stringify({
      type: "initialState",
      state: serverState,
      cursorState: cursorIndex,
    }),
  );

  //add these event listeners to the client
  ws.on("message", (incomingData) => {
    try {
      const data = JSON.parse(incomingData); //incomingData string as json
      console.log("Received:", data); //peek at the incoming data

      //server handling of the drawing cursor data
      if (data.type === "userData") {
        data.id = ws.id;

        // Store user data
        users[ws.id] = data;

        console.log(data);

        //broadcast the cursor data to all clients
        broadcast({
          type: "userData",
          data,
        });
      }

      //server handling of click information from clientside

      if (data.type === "userClick") {
        console.log(data.name + " was clicked");
        broadcast({ type: "soundTrigger", who: data.name });
        //based on the data.name - do something here! this would be where you pass along the data to the arduino to turn on the light/motor

        //this is for the angler, pulled from the jellyOn example
        if (data.name === "angler") {
          console.log("angler clicked");
          serverState.anglerOn = !serverState.anglerOn; //toggle the led state
          console.log("Angler toggled to:", serverState.anglerOn);
          //figure out what we want/need to broadcast here to the client/arduino - this is working for the most part but seems a bit glitchy
          broadcast({ type: "anglerState", value: serverState.anglerOn });
        }
        if (data.name === "jelly") {
          console.log("jelly clicked");
          serverState.jellyOn = !serverState.jellyOn; //toggle the jelly state
          console.log("Jelly toggled to:", serverState.jellyOn);
          // send a servo command to Arduino when jelly is clicked
          serverState.servoAngle = serverState.jellyOn ? 120 : 90;
          broadcast({ type: "servo", value: serverState.servoAngle });
          // keep the jellyState broadcast if other clients or UI depend on it
          broadcast({ type: "jellyState", value: serverState.jellyOn });
        }
      }
      // server handling of jellypress information - has the jelly been clicked?
      // if (data.type === "jelly") {
      //   serverState.jellyOn = !serverState.jellyOn; //toggle the led state
      //   console.log("Jelly toggled to:", serverState.jellyOn);
      //   broadcast({ type: "jellyState", value: serverState.jellyOn });
      // }

      //handle angler data - THIS IS NOT WORKING, NEED TO TROUBLESHOOT - SB 11.30
      if (data.type === "brightness_angler") {
        serverState.anglerDistance = data.value;
        broadcast({ type: "angler", value: data.value });
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  ws.on("close", () => {
    //handle client leaving & know which id they have
    console.log("Client disconnected");
    //on disconnects
    for (let i = 0; i < cursors.length; i++) {
      if (cursors[i].id == ws.id) {
        cursors[i].id = null;
        console.log("Freed up cursor index:" + i);
      }
    }
    broadcast({ type: "removeImg", value: ws.id });
    clients.delete(ws);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

//'port' variable allows for deployment
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
