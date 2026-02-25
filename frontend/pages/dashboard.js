
import { useEffect,useState } from "react";
import axios from "axios";
import useRealtime from "../utils/useRealtime";

export default function Dashboard(){
  const [user,setUser]=useState(null);
  const [cols,setCols]=useState([]);

  useEffect(()=>{
    const u=JSON.parse(localStorage.getItem("user"));
    setUser(u);
    load(u.itemId);
  },[]);

  const load=async(id)=>{
    const res=await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/status/${id}`);
    setCols(res.data);
  };

  useRealtime((msg)=>{
    if(msg.itemId===user?.itemId) load(user.itemId);
  });

  if(!user) return null;

  return(
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">{user.name}</h1>

      <div className="grid grid-cols-3 gap-6">
        {cols.map(c=>(
          <DocCard key={c.id} col={c} itemId={user.itemId}/>
        ))}
      </div>
    </div>
  );
}

function DocCard({col,itemId}){
  const upload=async(e)=>{
    const file=e.target.files[0];
    const form=new FormData();
    form.append("file",file);
    form.append("itemId",itemId);
    form.append("columnId",col.id);
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`,form);
  };

  const hasFile=col.value && col.value.includes("files");

  return(
    <div className={`p-6 rounded-2xl shadow ${hasFile?"bg-green-100":"bg-white"}`}>
      <h3 className="font-bold">{col.id}</h3>

      {!hasFile && (
        <input type="file" onChange={upload}/>
      )}

      {hasFile && <p className="text-green-700">Completed</p>}
    </div>
  );
}
