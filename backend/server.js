
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { searchUser, uploadFile, getStatus, handleWebhook } from "./routes.js";
import { initWebSocket } from "./websocket.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.post("/search", searchUser);
app.post("/upload", upload.single("file"), uploadFile);
app.get("/status/:itemId", getStatus);
app.post("/webhook", handleWebhook);

const server = app.listen(process.env.PORT || 5000);
initWebSocket(server);
