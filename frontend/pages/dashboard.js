import { useEffect, useState } from "react";
import axios from "axios";
import Toast from "../components/Toast";

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
  const [toast,setToast]=useState(null);

  useEffect(()=>{
    const u = JSON.parse(localStorage.getItem("user"));
    if(!u) return;
    setUser(u);
    load(u.itemId);

    const interval = setInterval(()=>{
      load(u.itemId);
    },4000);

    return ()=> clearInterval(interval);
  },[]);

  const load = async (itemId)=>{
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/status/${itemId}`
    );
    setColumns(res.data);
  };

  if(!user) return null;

  // correct completion logic
  const completed = FILE_COLUMNS.filter(c=>{
    const col = columns.find(x=>x.id===c.id);
    if(!col?.value) return false;
    try{
      const parsed = JSON.parse(col.value);
      return parsed.files && parsed.files.length>0;
    }catch{
      return false;
    }
  }).length;

  const total = FILE_COLUMNS.length;
  const percent = Math.round((completed/total)*100);

  return(
    <div className="min-h-screen bg-[#0f172a] p-10 text-gray-200">

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={()=>setToast(null)}
        />
      )}

      {/* HEADER */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-6 mb-6">
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-gray-500">Upload required documents</p>

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

          let done=false;
          if(col?.value){
            try{
              const parsed = JSON.parse(col.value);
              if(parsed.files && parsed.files.length>0){
                done=true;
              }
            }catch{}
          }

          return(
            <DocCard
              key={doc.id}
              doc={doc}
              done={done}
              itemId={user.itemId}
              col={col}
              setToast={setToast}
            />
          );
        })}
      </div>
    </div>
  );
}

function DocCard({ doc, done, itemId, col, setToast }){
  const [uploading,setUploading]=useState(false);

  const upload = async(e)=>{
    const file=e.target.files[0];
    if(!file) return;

    setUploading(true);

    const form=new FormData();
    form.append("file",file);
    form.append("itemId",itemId);
    form.append("columnId",doc.id);

    try{
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/upload`,
        form
      );
      setToast({message:"File uploaded successfully",type:"success"});
    }catch{
      setToast({message:"Upload failed",type:"error"});
    }

    setUploading(false);
  };

  let fileName=null;
  let fileUrl=null;

  if(col?.value){
    try{
      const parsed=JSON.parse(col.value);
      if(parsed.files && parsed.files.length>0){
        fileName=parsed.files[0].name;
        fileUrl=parsed.files[0].asset_url;
      }
    }catch{}
  }

  return(
    <div className={`rounded-2xl p-5 shadow transition ${done?"bg-green-100":"bg-white"}`}>
      <h3 className="font-semibold mb-3">{doc.label}</h3>

      {done ? (
        <div className="space-y-2">
          <p className="text-green-700 font-semibold">Completed</p>

          {fileName && (
            <p className="text-sm text-gray-600 truncate">{fileName}</p>
          )}

          {fileUrl && (
            <a href={fileUrl} target="_blank" className="text-sm text-blue-600 underline">
              View File
            </a>
          )}

          <label className="block mt-2 text-sm text-gray-600 cursor-pointer">
            Replace File
            <input type="file" onChange={upload} className="hidden"/>
          </label>
        </div>
      ):(
        <label className="block text-sm text-gray-600 cursor-pointer">
          {uploading?"Uploading...":"Upload File"}
          <input type="file" onChange={upload} className="hidden"/>
        </label>
      )}
    </div>
  );
}
