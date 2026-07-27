// Minimal CSV helpers shared by the growth tools. Handles quoted fields,
// embedded commas, escaped quotes ("") and CRLF — which is all a spreadsheet
// export ever produces. No dependencies on purpose: this has to run on a
// laptop with nothing installed.

export function parseCsv(text) {
  const rows = [];
  let field = "";
  let row = [];
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }

  // Trailing field / row when the file doesn't end in a newline.
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

// Parses into objects keyed by the header row, values trimmed.
export function parseCsvObjects(text) {
  const rows = parseCsv(text);
  if (rows.length === 0) return { header: [], records: [] };

  const header = rows[0].map((h) => h.trim());
  const records = rows.slice(1).map((cells) => {
    const record = {};
    header.forEach((key, idx) => {
      record[key] = (cells[idx] ?? "").trim();
    });
    return record;
  });

  return { header, records };
}

// Quotes only when needed, so the file stays readable in a plain editor.
export function toCsvLine(values) {
  return values
    .map((value) => {
      const str = String(value ?? "");
      return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    })
    .join(",");
}
