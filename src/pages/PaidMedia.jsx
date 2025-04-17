import React from "react";
import { useNavigate } from "react-router-dom";

export default function PaidMedia() {
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-xl mx-auto">
      <button className="mb-4 bg-gray-500 text-white px-4 py-2 rounded" onClick={() => navigate("/")}>
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4">Marketing Copy Generator</h1>
      {/* ...rest of your UI */}
    </div>
  );
}
