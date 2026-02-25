import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 1800); // disappear after 1.8s

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className={`px-8 py-4 rounded-2xl shadow-2xl text-white text-lg
        ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
        {message}
      </div>
    </div>
  );
}
