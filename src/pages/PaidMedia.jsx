const handleDownloadXLSX = async () => {
  let XLSX = window.XLSX;
  if (!XLSX) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
    XLSX = window.XLSX;
  }

  const templateUrl = "https://docs.google.com/spreadsheets/d/1xleMy5Xt4bAXRjni7vQOYX6ILgVWqhom/export?format=xlsx";

  try {
    const response = await fetch(templateUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`);
    }
    console.log("✅ Template fetched successfully:", templateUrl);

    const arrayBuffer = await response.arrayBuffer();
    console.log("✅ Template size (bytes):", arrayBuffer.byteLength);
    if (arrayBuffer.byteLength < 100) {
      alert("Template file is too small or empty.");
      return;
    }

    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    console.log("✅ Workbook loaded. Sheets:", workbook.SheetNames);

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    console.log("✅ Initial sheet range:", sheet["!ref"]);

    if (!sheet || !sheet["!ref"]) {
      alert("Template loaded but contains no usable content.");
      return;
    }

    const blocks = result.split("\n=========================\n\n").filter(Boolean);
    const dataRows = [];

    blocks.forEach((block) => {
      const lines = block.split("\n");
      let currentChannel = "";

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (/^(###|\*\*\d+\.)/.test(line)) {
          currentChannel = line
            .replace(/^###/, "")
            .replace(/^\*\*\d+\./, "")
            .replace(/^\d+\./, "")
            .replace(/\*\*/g, "")
            .trim();
        }

        if (/^[-\*]\s*\*{0,2}Primary text:/.test(line)) {
          const primary = line.replace(/^[-\*]\s*\*{0,2}Primary text:\*{0,2}/, "").trim();
          const nextLine = lines[i + 1]?.trim();

          if (nextLine && /^[-\*]\s*\*{0,2}Headline:/.test(nextLine)) {
            const headline = nextLine.replace(/^[-\*]\s*\*{0,2}Headline:\*{0,2}/, "").trim();

            if (currentChannel && primary && headline) {
              const row = ["", currentChannel, "", primary, "", headline];
              dataRows.push(row);
              console.log("📄 Parsed row:", row);
            }
            i++; // skip headline line
          }
        }
      }
    });

    if (dataRows.length === 0) {
      alert("No rows were parsed. Check LLM output format.");
      console.warn("Empty result. Raw block:\n", result);
      return;
    }

    console.table(dataRows.slice(0, 5));

    // Value-only update for preserving formatting
    const startRow = 9; // Excel row 10 (0-indexed)
    dataRows.forEach((row, i) => {
      const r = startRow + i;
      // Columns: B=1, D=3, F=5
      const channelCellAddr = XLSX.utils.encode_cell({ r, c: 1 });
      const primaryCellAddr = XLSX.utils.encode_cell({ r, c: 3 });
      const headlineCellAddr = XLSX.utils.encode_cell({ r, c: 5 });

      const channelCell = sheet[channelCellAddr];
      const primaryCell = sheet[primaryCellAddr];
      const headlineCell = sheet[headlineCellAddr];

      if (channelCell) channelCell.v = row[1];
      else sheet[channelCellAddr] = { t: "s", v: row[1] };

      if (primaryCell) primaryCell.v = row[3];
      else sheet[primaryCellAddr] = { t: "s", v: row[3] };

      if (headlineCell) headlineCell.v = row[5];
      else sheet[headlineCellAddr] = { t: "s", v: row[5] };
    });

    const endRow = startRow + dataRows.length - 1;
    sheet["!ref"] = XLSX.utils.encode_range({
      s: { c: 1, r: startRow },
      e: { c: 5, r: endRow },
    });

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "AdCopyFilled.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("❌ Failed to export Excel:", err);
    alert("Could not export Excel. See console for details.");
  }
};
