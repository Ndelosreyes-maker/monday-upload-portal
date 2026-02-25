
import axios from "axios";

export const mondayClient = async (query, variables = {}) => {
  const res = await axios.post(
    "https://api.monday.com/v2",
    { query, variables },
    {
      headers: {
        Authorization: process.env.MONDAY_API_KEY,
        "Content-Type": "application/json"
      }
    }
  );
  return res.data;
};
