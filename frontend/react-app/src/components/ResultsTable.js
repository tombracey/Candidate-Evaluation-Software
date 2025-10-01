import React from "react";

// Function to create CSV file from results
const generateCSV = (data) => {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((row) =>
    Object.values(row)
      .map((value) => `"${value}"`)
      .join(",")
  );

  return [headers, ...rows].join("\n");
};

const ResultsTable = ({ results }) => {
  return (
    <>
      <h2>Results</h2>
      <table className="results-table">
        <thead>
          <tr>
            {Object.keys(results[0]).map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, i) => (
                <td key={i}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <br />
        <button
          className="button-styling"
          onClick={() => {
            const csvContent = generateCSV(results);
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "results.csv");
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          Download Results as CSV
        </button>
      </>
    );
  };

export default ResultsTable;