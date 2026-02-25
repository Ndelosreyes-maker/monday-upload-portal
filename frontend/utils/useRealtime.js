
import { useEffect } from "react";

export default function useRealtime(cb){
  useEffect(()=>{
    const ws=new WebSocket(process.env.NEXT_PUBLIC_API_URL.replace("https","wss"));
    ws.onmessage=e=>cb(JSON.parse(e.data));
    return ()=>ws.close();
  },[]);
}
