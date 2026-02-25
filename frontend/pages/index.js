
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Home(){
  const [id,setId]=useState("");
  const router=useRouter();

  const search=async()=>{
    const res=await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/search`,{portalId:id});
    localStorage.setItem("user",JSON.stringify(res.data));
    router.push("/dashboard");
  };

  return(
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-[400px]">
        <h1 className="text-2xl font-bold mb-4">Upload Portal</h1>
        <input
          className="border p-3 w-full rounded"
          placeholder="Portal ID"
          value={id}
          onChange={e=>setId(e.target.value)}
        />
        <button onClick={search} className="mt-4 w-full bg-black text-white p-3 rounded">
          Find
        </button>
      </div>
    </div>
  );
}
