import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SEO() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("English UK");
  const [emoji, setEmoji] = useState("Sales");
  const [lines, setLines] = useState(5);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Clear the previous result and show loader
    setResult("");
    setLoading(true);

    prompt = `You are an expert in writing metadata and you will be given ${url} . If it is a URL take the brand and do not change the brand in any way and feature it in the meta description. 

Please provide me with ${lines}  page titles in ${language} that don't exceed a maximum length of 60 characters and ${lines} meta descriptions with a maximum length of 165 characters

Write the titles and meta descriptions in a way that will entice the user to click through including the brand in the meta description but not in the title. Please include the number of characters, including spaces, in brackets after each response.
Also, you should ${emoji}  emoji's in the beginning of the sentence

Within your response always start with:
I am just a "robot" so do consider the keywords that you want to target and do not copy paste my suggestions.`;

    try {
      const response = await axios.post(
        "https://llm-backend-82gd.onrender.com/api/generate-copy",
        { input_text: prompt },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.response) {
        setResult(response.data.response);
      } else {
        setResult("No output received from the backend.");
      }
    } catch (err) {
      setResult("Error generating content.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    const lines = result.split("\n").filter((line) => line.trim() !== "");
    const csvContent = "data:text/csv;charset=utf-8," + lines.map((line) => `"${line.replace(/"/g, '""')}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "marketing-copy.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">SEO Marketing Copy Generator</h1>

      <input className="w-full p-2 border mb-2" placeholder="Insert Client URL or keyword" value={url} onChange={(e) => setUrl(e.target.value)} />

      <select className="w-full p-2 border mb-2" value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option>English UK</option>
        <option>English US</option>
        <option>Italian</option>
        <option>French</option>
        <option>German</option>
      </select>

      <select className="w-full p-2 border mb-2" value={emoji} onChange={(e) => setEmoji(e.target.value)}>
        <option>Add</option>
        <option>Not Add</option>
      </select>

      <select className="w-full p-2 border mb-2" value={lines} onChange={(e) => setLines(Number(e.target.value))}>
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={15}>15</option>
      </select>

      <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSubmit} disabled={loading}>
        Generate
      </button>
      <button className="ml-2 bg-gray-500 text-white px-4 py-2 rounded" onClick={() => navigate("/")}>
        ← Back
      </button>

      {loading && (
        <div className="inline-flex items-center gap-2 text-blue-600 font-medium mt-2">
          <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          Working on it…
        </div>
      )}

      {result && (
        <div className="mt-4">
          <pre className="bg-gray-100 p-4 whitespace-pre-wrap">{result}</pre>
          <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded" onClick={handleDownloadCSV}>
            Download CSV
          </button>
        </div>
      )}
    </div>
  );
}
