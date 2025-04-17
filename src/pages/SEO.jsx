import React from "react";
import { useNavigate } from "react-router-dom";

export default function SEO() {
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">SEO Copy Generator</h1>
      <p className="text-gray-700 mb-4">SEO page coming soon.</p>
      <button className="mt-2 bg-gray-500 text-white px-4 py-2 rounded" onClick={() => navigate("/")}>
        ← Back
      </button>
    </div>
  );
}
