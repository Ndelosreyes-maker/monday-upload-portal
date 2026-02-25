import { useEffect } from "react";

export default function useRealtime(cb){
  useEffect(()=>{
    const ws = new WebSocket(
      process.env.NEXT_PUBLIC_API_URL.replace("https","wss")
    );

    ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      cb(msg);
    };

    return () => ws.close();
  },[]);
}
