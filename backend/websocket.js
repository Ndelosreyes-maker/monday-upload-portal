import { WebSocketServer } from "ws";

let wss;

export const initWebSocket = (server) => {
  wss = new WebSocketServer({ server });

  wss.on("connection", () => {
    console.log("WebSocket connected");
  });
};

export const notifyClients = (msg) => {
  if (!wss) return;

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(msg));
    }
  });
};
