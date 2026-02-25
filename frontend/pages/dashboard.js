import { useEffect, useState } from "react";
import axios from "axios";
import useRealtime from "../utils/useRealtime";

const FILE_COLUMNS = [
  { id:"file_mm01pv4x", label:"Resume" },
  { id:"file_mm02syqk", label:"Signed Contract" },
  { id:"file_mm027d47", label:"SSN" },
  { id:"file_mm02dgx5", label:"PETS" },
  { id:"file_mm02vxj1", label:"Statewide" },
  { id:"file_mm02wc6g", label:"I-9" },
  { id:"file_mm02tfs6", label:"Physical" },
  { id:"file_mm02q4hg", label:"Liability Insurance" },
  { id:"file_mm02xndg", label:"Registration" },
  { id:"file_mm02b5af", label:"Direct Deposit" },
  { id:"file_mm02nz2j", label:"W-2/4/9" },
  { id:"file_mm02g17x", label:"Medicaid" },
  { id:"file_mm02cpd1", label:"P & P" },
  { id:"file_mm023e5h", label:"4A NYS" },
  { id:"file_mm028qz9", label:"4B NYS" },
  { id:"file_mm02n1k4", label:"ID" },
  { id:"file_mm025qv4", label:"License" }
];

export default function Dashboard(){
  const [user,setUser]=useState(null);
  const [columns,setColumns]=useState([]);

  useEffect(()=>{
    const u = JSON.parse(localStorage.getItem("user"));
    setUser(u);
    load(u.itemId);
  },[]);

  const load = async (itemId)=>{
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/status/${itemId}`
    );
    setColumns(res.data);
  };

  useRealtime((msg)=>{
    if(msg.itemId===user?.itemId){
      load(user.itemId);
    }
  });

  if(!user) return null;

  const completed = FILE_COLUMNS.filter(c=>{
    const col = columns.find(x=>x.id===c.id);
    return col?.value?.includes("files");
  }).length;

  const total = FILE_COLUMNS.length;
  const percent = Math.round((completed/total)*100);

  return(
    <div className="min-h-screen bg-gray-50 p-10">

      {/* HEADER */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-6 mb-6">
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-gray-500">Upload required documents</p>

        {/* progress */}
        <div className="mt-4">
          <div className="h-3 bg-gray-200 rounded">
            <div
              className="h-3 bg-green-500 rounded"
              style={{width:`${percent}%`}}
            />
          </div>
          <p className="text-sm mt-1">
            {completed}/{total} completed
          </p>
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-5xl mx-auto grid grid-cols-3 gap-5">
        {FILE_COLUMNS.map(doc=>{
          const col = columns.find(c=>c.id===doc.id);
          const done = col?.value?.includes("files");

          return(
            <DocCard
              key={doc.id}
              doc={doc}
              done={done}
              itemId={user.itemId}
            />
          );
        })}
      </div>

    </div>
  );
}

function DocCard({doc,done,itemId}){
  const upload = async(e)=>{
    const file = e.target.files[0];
    if(!file) return;

    const form = new FormData();
    form.append("file",file);
    form.append("itemId",itemId);
    form.append("columnId",doc.id);

    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/upload`,
      form
    );

    alert("Uploaded!");
  };

  return(
    <div className={`rounded-2xl p-5 shadow transition
      ${done?"bg-green-100":"bg-white"}
    `}>
      <h3 className="font-semibold mb-3">{doc.label}</h3>

      {done ? (
        <p className="text-green-700 font-semibold">Completed</p>
      ):(
        <input type="file" onChange={upload}/>
      )}
    </div>
  );
}
