import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PaidMedia() {
  const navigate = useNavigate();
  const [inputType, setInputType] = useState("manual");
  const [url, setUrl] = useState("");
  const [csvContent, setCsvContent] = useState("");
  const [platform, setPlatform] = useState("Facebook");
  const [language, setLanguage] = useState("English UK");
  const [objective, setObjective] = useState("Sales");
  const [lines, setLines] = useState(5);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = (e) => setCsvContent(e.target.result);
      reader.readAsText(file);
    } else {
      alert("Please upload a valid CSV file.");
    }
  };

  const generatePrompt = (input) => {
    if (platform === "Facebook") {
      return `You are a skilled marketing copywriter with expertise in creating compelling ads. You will need to go through the following steps to ensure the exact demands of the input values and provide ${lines} versions of each of the requested outputs.

Input Client:
Please write the ads for ${input} and use the tone of voice of the website and try and use as many of the available characters as listed in the output format

Input Language:
Please write the ads in the correct spelling and grammar of ${language}

Input Key Marketing Objective:
The objective of the ads is to ${objective}

If it is Sales then you will sell the product to the user and should contain as much direct information about the product.
If it is Awareness then you will generate awareness for the product.

------

IMPORTANT: Output ONLY the following fields for each placement and each option, in this exact order, with no extra text, no explanations, and no markdown or special formatting. Use plain text only. DO NOT use asterisks, hashes, or any special characters.

For each placement, output ${lines} options, in this format:

1. Image Facebook Feed
Option 1:
Primary text: [text] ([character count]) 
Headline: [text] ([character count]) 
Option 2:
Primary text: [text] ([character count]) 
Headline: [text] ([character count]) 
...repeat up to Option ${lines}...

2. Facebook Stories
Option 1:
Primary text: [text] ([character count]) 
Headline: [text] ([character count]) 
Option 2:
Primary text: [text] ([character count]) 
Headline: [text] ([character count]) 
...repeat up to Option ${lines}...

3. Facebook Reels
Option 1:
Primary text: [text] ([character count]) 
Headline: [text] ([character count]) 
Option 2:
Primary text: [text] ([character count]) 
Headline: [text] ([character count]) 
...repeat up to Option ${lines}...

4. Facebook Video Feed
Option 1:
Primary text: [text] ([character count]) 
Headline: [text] ([character count]) 
Option 2:
Primary text: [text] ([character count]) 
Headline: [text] ([character count]) 
...repeat up to Option ${lines}...

Do not include any other text, explanations, or formatting. Do not use asterisks, hashes, or markdown. Use only plain text as shown above.
`;
    } else {
      return `You are a skilled marketing copywriter with expertise in creating compelling ads. You will need to go through the following steps to ensure the exact demands of the input values and provide ${lines} versions of each of the requested outputs.

Input Client:
Please write the ads for ${input} and use the tone of voice of the website and try and use as many of the available characters as listed in the output format

Input Language:
Please write the ads in the correct spelling and grammar of ${language}

Input Key Marketing Objective:
The objective of the ads is to ${objective}

If it is Sales then you will sell the product to the user and should contain as much direct information about the product.
If it is Awareness then you will generate awareness for the product.

-------

Output ONLY the following fields for each ad, in this exact order, with no extra text, no explanations, and no markdown or special formatting. Use plain text only.
Each of the headlines contain up to 30 characters, descriptions up to 90 characters, and paths up to 15 characters.

For each ad, output:
Headline (1): [text] ([character count]) 
Headline (2): [text] ([character count])
Description (1): [text] ([character count])
Description (2): [text] ([character count])
Path (1): [text] ([character count])
Path (2): [text] ([character count])

Repeat for each ad. Do not include any other text, explanations, or formatting.

`;
    }
  };

  const handleSubmit = async () => {
    setResult("");
    setLoading(true);

    try {
      const inputs =
        inputType === "csv"
          ? csvContent
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
          : [url];

      if (inputType === "csv") {
        // Batch processing for CSV input
        const prompts = inputs.map(generatePrompt);
        const response = await axios.post("https://llm-backend-82gd.onrender.com/api/generate-copy-batch", { prompts }, { headers: { "Content-Type": "application/json" } });
        const allResults = response.data.responses.map((res, i) => `For input: ${inputs[i]}\n${res}\n`);
        setResult(allResults.join("\n=========================\n\n"));
      } else {
        // Manual input (single request)
        const prompt = generatePrompt(url);
        const response = await axios.post("https://llm-backend-82gd.onrender.com/api/generate-copy", { input_text: prompt }, { headers: { "Content-Type": "application/json" } });
        if (response.data.response) {
          setResult(`For input: ${url}\n${response.data.response}\n`);
        } else {
          setResult(`For input: ${url}\nNo output received.\n`);
        }
      }
    } catch (err) {
      setResult("Error generating content.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadXLSX = async () => {
    if (!result || result.trim() === "") {
      alert("No generated content to export.");
      return;
    }

    try {
      setLoading(true);

      // Choose endpoint based on platform
      const endpoint = platform === "Google Ads" ? "https://llm-backend-82gd.onrender.com/api/export-xlsx-google" : "https://llm-backend-82gd.onrender.com/api/export-xlsx";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ llm_output: result }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        alert("Export failed: " + errorText);
        setLoading(false);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = platform === "Google Ads" ? "GoogleAdsCopyFilled.xlsx" : "AdCopyFilled.xlsx";
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export XLSX. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="p-8 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Paid Media Marketing Copy Generator</h1>
        <div className="text-base mt-1">Instructions</div>
        <div className="text-sm">
          <ul className="mt-1 mb-4">
            <li>
              First select the type of input, if selecting CSV for Bulk upload, please download{" "}
              <a className="font-bold" href="https://docs.google.com/spreadsheets/d/1jt1pljedbNNdzBHes-lONTYTTdZvDSrHdhjWatfP6CE/edit?gid=0#gid=0" target="_blank" rel="noopener noreferrer">
                THIS TEMPLATE
              </a>
            </li>
            <li>To download the template: Click on File, Download and than select Comma-separated values (.csv)</li>
            <li>
              Please note that currently the maximum that can be uploaded at once is <strong>70 lines</strong> on the CSV file. If it is more then 70, please use multiple sheets.
            </li>
          </ul>
        </div>
        <div className="mb-4">
          <label className="font-semibold mr-4">Choose Input Type:</label>
          <select className="p-2 border" value={inputType} onChange={(e) => setInputType(e.target.value)}>
            <option value="manual">Manual Input</option>
            <option value="csv">Upload CSV</option>
          </select>
        </div>
        {inputType === "manual" ? (
          <input className="w-full p-2 border mb-2 mt-2" placeholder="Insert Client URL or keyword" value={url} onChange={(e) => setUrl(e.target.value)} />
        ) : (
          <div className="border-dashed border-2 border-gray-400 p-6 mb-2 text-center mt-2">
            <input type="file" accept=".csv" onChange={handleFileUpload} className="w-full text-center" />
            <p className="mt-2 text-gray-600">Upload a CSV file containing URLs or keywords.</p>
          </div>
        )}
        {/* ...rest of your form controls... */}
        <div className="text-sm mt-1">Select a Language</div>
        <select className="w-full p-2 border mb-2" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option>English UK</option>
          <option>English US</option>
          <option>Italian</option>
          <option>French</option>
        </select>
        <div className="text-sm mt-1">Select the Platform</div>
        <select className="w-full p-2 border mb-2" value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option>Facebook</option>
          <option>Google Ads</option>
        </select>
        <div className="text-sm mt-1">Type of Marketing Objective</div>
        <select className="w-full p-2 border mb-2" value={objective} onChange={(e) => setObjective(e.target.value)}>
          <option>Sales</option>
          <option>Awareness</option>
        </select>
        <div className="text-sm mt-1">Number of Lines</div>
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
            <svg className="animate-spin h-4 w-4 text-blue-600 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            Working on it…
          </div>
        )}
      </div>
      {result && (
        <div className="mt-2 w-full max-w-3xl mx-auto mb-6">
          <pre className="bg-gray-100 p-6 whitespace-pre-wrap w-full">{result}</pre>
          <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded" onClick={handleDownloadXLSX}>
            Download XLSX
          </button>
        </div>
      )}
    </>
  );
}
