import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Toast from "../components/Toast";

export default function Home() {
  const [portalId, setPortalId] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const router = useRouter();

  const search = async () => {
    if (!portalId) return;

    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/search`,
        { portalId }
      );

      localStorage.setItem("user", JSON.stringify(res.data));
      router.push("/dashboard");

    } catch (err) {
      setToast({ message: "Portal ID not found", type: "error" });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-60"
        >
          {loading ? "Searching..." : "Find"}
        </button>
      </div>
    </div>
  );
}
