import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className={`px-8 py-4 rounded-2xl shadow-2xl text-white text-lg
        ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
        {message}
      </div>
    </div>
  );
}
