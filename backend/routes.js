
import fs from "fs";
import FormData from "form-data";
import axios from "axios";
import { mondayClient } from "./monday.js";
import { notifyClients } from "./websocket.js";

const BOARD = process.env.MONDAY_BOARD_ID;
const PORTAL = "pulse_id_mm0wa6sj";

export const searchUser = async (req, res) => {
  const { portalId } = req.body;

  const query = `
  query ($board:[ID!]) {
    boards(ids:$board){
      items_page(limit:500){
        items{
          id
          name
          column_values{id text value}
        }
      }
    }
  }`;

  const data = await mondayClient(query, { board: BOARD });
  const items = data.data.boards[0].items_page.items;

  const item = items.find(i => {
  const col = i.column_values.find(c => c.id === PORTAL);
  if (!col) return false;

  // Try text match
  if (col.text && col.text.trim() === portalId.trim()) return true;

  // Try value JSON match
  try {
    const v = JSON.parse(col.value || "{}");
    if (v.text === portalId) return true;
    if (v.label === portalId) return true;
  } catch {}

  return false;
});

  if (!item) return res.status(404).json({ error: "Not found" });

  res.json({
    itemId: item.id,
    name: item.name,
    columns: item.column_values
  });
};

export const uploadFile = async (req, res) => {
  const { itemId, columnId } = req.body;
  const file = req.file;

  const form = new FormData();
  form.append("query", `
    mutation ($file: File!) {
      add_file_to_column(item_id:${itemId}, column_id:"${columnId}", file:$file){id}
    }
  `);

  form.append("variables[file]", fs.createReadStream(file.path));

  await axios.post("https://api.monday.com/v2/file", form, {
    headers: {
      Authorization: process.env.MONDAY_API_KEY,
      ...form.getHeaders()
    }
  });

  fs.unlinkSync(file.path);

  notifyClients({ type:"uploaded", itemId, columnId });

  res.json({ success:true });
};

export const getStatus = async (req, res) => {
  const { itemId } = req.params;

  const query = `
  query {
    items(ids:${itemId}){
      column_values{id text value}
    }
  }`;

  const data = await mondayClient(query);
  res.json(data.data.items[0].column_values);
};

export const handleWebhook = async (req, res) => {

  // ✅ Monday webhook verification
  if (req.body.challenge) {
    return res.status(200).json({ challenge: req.body.challenge });
  }

  // Normal webhook event
  notifyClients({
    type: "webhook",
    payload: req.body
  });

  res.sendStatus(200);
};
