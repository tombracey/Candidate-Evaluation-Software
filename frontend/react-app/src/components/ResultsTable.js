import React from "react";

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
    </>
  );
};

export default ResultsTable;