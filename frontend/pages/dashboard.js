import { useEffect, useState } from "react";
import axios from "axios";
import Toast from "../components/Toast";

const EXPIRATION_COLUMN_IDS = {
  "file_mm02tfs6": "date_mm02gj3n",   // Physical
  "file_mm02q4hg": "date_mm02942n",   // Liability
  "file_mm02xndg": "date_mm02ew9z"    // Registration
};

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
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0f172a] p-10 text-gray-200">

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={()=>setToast(null)}
        />
      )}

      {/* HEADER */}
      <div className="max-w-6xl mx-auto bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 mb-8 shadow-xl">
        <h1 className="text-3xl font-semibold tracking-wide">{user.name}</h1>
        <p className="text-gray-400 mt-1">Upload required documents</p>

        <div className="mt-6">
          <div className="h-3 bg-white/10 rounded-full">
            <div
              className="h-3 bg-emerald-500 rounded-full transition-all duration-500"
              style={{width:`${percent}%`}}
            />
          </div>
          <p className="text-sm mt-2 text-gray-400">
            {completed}/{total} completed
          </p>
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              columns={columns}
              setToast={setToast}
            />
          );
        })}
      </div>
    </div>
  );
}

function DocCard({ doc, done, itemId, col, columns, setToast }){
  const [uploading,setUploading]=useState(false);
  const [expirationDate,setExpirationDate]=useState("");

  // load existing expiration date from monday
  useEffect(()=>{
    const expColId = EXPIRATION_COLUMN_IDS[doc.id];
    if(!expColId) return;

    const expCol = columns.find(c=>c.id===expColId);
    if(!expCol?.value) return;

    try{
      const parsed = JSON.parse(expCol.value);
      if(parsed.date){
        setExpirationDate(parsed.date);
      }
    }catch{}
  },[columns]);

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

  const updateDate = async(e)=>{
    const newDate = e.target.value;
    setExpirationDate(newDate);

    try{
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/update-expiration`,
        {
          itemId,
          columnId: EXPIRATION_COLUMN_IDS[doc.id],
          date: newDate
        }
      );

      setToast({
        message:"Expiration updated",
        type:"success"
      });

    }catch{
      setToast({
        message:"Failed to update date",
        type:"error"
      });
    }
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
    <div className={`rounded-2xl p-6 border shadow-lg transition-all duration-300
      ${done
        ? "bg-emerald-900/40 border-emerald-500/30"
        : "bg-white/5 border-white/10 backdrop-blur hover:border-white/30"}
    `}>

      <h3 className="font-semibold text-lg mb-3">{doc.label}</h3>

      {done ? (
        <div className="space-y-2">
          <p className="text-emerald-400 font-medium">Completed</p>

          {fileName && (
            <p className="text-sm text-gray-300 truncate">
              {fileName}
            </p>
          )}

          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              className="text-sm text-blue-400 underline"
            >
              View File
            </a>
          )}

          <label className="mt-3 inline-block bg-white/10 px-4 py-2 rounded-lg cursor-pointer hover:bg-white/20 transition text-sm">
            Replace File
            <input type="file" onChange={upload} className="hidden"/>
          </label>
        </div>
      ):(
        <label className="inline-block bg-blue-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition text-sm">
          {uploading ? "Uploading..." : "Upload File"}
          <input type="file" onChange={upload} className="hidden"/>
        </label>
      )}

      {/* expiration input */}
      {EXPIRATION_COLUMN_IDS[doc.id] && (
        <div className="mt-4">
          <label className="text-xs text-gray-400 block mb-1">
            Expiration Date
          </label>
          <input
            type="date"
            value={expirationDate}
            onChange={updateDate}
            className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white text-sm"
          />
        </div>
      )}

    </div>
  );
}
