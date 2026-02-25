import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Home() {
  const [portalId, setPortalId] = useState("");
  const router = useRouter();

  const search = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/search`,
        { portalId }
      );
      localStorage.setItem("user", JSON.stringify(res.data));
      router.push("/dashboard");
    } catch (err) {
      alert("Portal ID not found");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-[420px]">

        <h1 className="text-3xl font-bold text-center mb-6">
          Employee Upload Portal
        </h1>

        <input
          className="w-full border rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Enter Portal ID"
          value={portalId}
          onChange={(e) => setPortalId(e.target.value)}
        />

        <button
          onClick={search}
          className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition"
        >
          Find
        </button>

      </div>
    </div>
  );
}
