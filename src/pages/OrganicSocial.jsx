import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SocialMedia() {
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
  const [emoji, setEmoji] = useState("");

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
      let emojiRequirement = "";
      if (emoji === "true") {
        emojiRequirement = `4. You should use ${emoji} emoji's in the beginning of the sentence. But in order to add emoji's, you should look at profile and only use the same types of emojis as the brand is already using.\n`;
      }
      return `You are a skilled marketing copywriter with expertise in creating Facebook and Instagram ads for product and content promotion. You will be given a URL and need to go through the following steps to ensure that the ad closely aligns with the request.

**Brand & Product/Service Context** 
Include the brand name in each headline and try and use as many of the available characters as possible

**Key Marketing Objective** 
The user should be enticed to click through from the ad to the provided URL

**Messaging Requirements** 
1. Hook/Opening Line: Must capture attention quickly 
2. Tone of Voice: Derive the tone of voice from the provided URL and closely align with similar wording
3. Compliance: No exaggerated claims or anything that cannot be found on the provided URL, if pricing is available please include this in the primary text.
${emojiRequirement}


**Output Format** 
Provide the following formats below clearly annotating which ad text is for the placement

1. Image Facebook Feed
Primary text: 50-150 characters 
Headline: 27 characters 

2. Facebook Stories
Primary text: 125 characters 
Headline: 40 characters 

3. Facebook Reels
Primary text: 72 characters 
Headline: 10 characters 

4. Facebook Video Feed
Primary text: 50-150 characters 
Headline: 27 characters 

**Returned format in answer**
Provide a short paragraph on the reason why this ad copy has been selected followed by the output that should be: line 1 being the format, line 2 the headline and line 3 is the  the primary text. To ensure client satisfaction you will provide ${lines} options for each placement.

Input Client:
Please write the ads for ${input} and use the tone of voice of the website and try and use as many of the available characters as listed in the output format

Input Language:
Please write the ads in the correct spelling and grammar of ${language}

Input Key Marketing Objective:
The objective of the ads is to ${objective}`;
    } else {
      return `Nada`;
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

      const allResults = [];

      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const prompt = generatePrompt(input);
        const response = await axios.post("https://llm-backend-82gd.onrender.com/api/generate-copy", { input_text: prompt }, { headers: { "Content-Type": "application/json" } });

        if (response.data.response) {
          allResults.push(`For input: ${input}\n${response.data.response}\n`);
        } else {
          allResults.push(`For input: ${input}\nNo output received.\n`);
        }

        
      }

      setResult(allResults.join("\n=========================\n\n"));
    } catch (err) {
      setResult("Error generating content.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    // Sanitize the result by removing unwanted "###" characters
    const sanitizedResult = result.replace(/###/g, "");

    const blocks = sanitizedResult.split("\n=========================\n\n").filter(Boolean);
    const csvRows = [];

    blocks.forEach((block) => {
      const lines = block.split("\n").filter(Boolean); // Split block into lines
      lines.forEach((line) => {
        const safe = line.replace(/"/g, '""'); // Escape double quotes for CSV
        csvRows.push(`"${safe}"`); // Add each line as a separate row
      });
    });

    // Add BOM to ensure proper encoding
    const csvContent = "\uFEFF" + csvRows.join("\n");
    const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "marketing-copy.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 mx-auto">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Organic Social Media Marketing Copy Generator</h1>

        <div className="mb-4">
          <label className="font-semibold mr-4">Choose Input Type:</label>
          <select className="p-2 border" value={inputType} onChange={(e) => setInputType(e.target.value)}>
            <option value="manual">Manual Input</option>
            <option value="csv">Upload CSV</option>
          </select>
        </div>

        {inputType === "manual" ? (
          <input className="w-full p-2 border mb-2" placeholder="Insert Client URL or keyword" value={url} onChange={(e) => setUrl(e.target.value)} />
        ) : (
          <div className="border-dashed border-2 border-gray-400 p-6 mb-2 text-center">
            <input type="file" accept=".csv" onChange={handleFileUpload} className="w-full text-center" />
            <p className="mt-2 text-gray-600">Upload a CSV file containing URLs or keywords.</p>
          </div>
        )}

        <select className="w-full p-2 border mb-2" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option>English UK</option>
          <option>English US</option>
          <option>Italian</option>
          <option>French</option>
        </select>

        <select className="w-full p-2 border mb-2" value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option>Facebook</option>
          <option>Instagram</option>
          <option>TikTok</option>
        </select>

        <select className="w-full p-2 border mb-2" value={emoji} onChange={(e) => setEmoji(e.target.value)} required>
          <option value="" disabled hidden>
            Add Emojis?
          </option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>

        <select className="w-full p-2 border mb-2" value={objective} onChange={(e) => setObjective(e.target.value)}>
          <option>Sales</option>
          <option>Awareness</option>
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
            <svg className="animate-spin h-4 w-4 text-blue-600 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            Working on it… 
          </div>
        )}
      </div>

      {result && (
        <div className="mt-4 max-w-4xl mx-auto">
          <pre className="bg-gray-100 p-4 whitespace-pre-wrap">{result}</pre>
          <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded" onClick={handleDownloadCSV}>
            Download CSV
          </button>
        </div>
      )}
    </div>
  );
}
