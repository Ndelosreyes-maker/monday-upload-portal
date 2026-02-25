
import WebSocket from "ws";

let wss;

export const initWebSocket = (server) => {
  wss = new WebSocket.Server({ server });
};

export const notifyClients = (msg) => {
  if (!wss) return;
  wss.clients.forEach(c => {
    if (c.readyState === WebSocket.OPEN) {
      c.send(JSON.stringify(msg));
    }
  });
};
