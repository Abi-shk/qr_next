import React, { useState } from "react";
import CSVReader from "react-csv-reader";

const Page = () => {
  const [csvData, setCsvData] = useState([]);

  const handleFileLoad = (data) => {
    if (data.length > 1) {
      const keys = data[0]; // First row as keys
      const valuesArray = data.slice(1); // Remaining rows as values

      // Map values into objects using keys
      const formattedData = valuesArray.map((row) =>
        row.reduce((obj, value, index) => {
          obj[keys[index]] = value;
          return obj;
        }, { validated: false }) // Add 'validated: false' to each object
      );

      setCsvData(formattedData);
    }
  };

  const uploadData = async () => {
    try {
      const response = await fetch("/api/upload_csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(csvData),
      });

      const result = await response.json();
      if (result.success) {
        alert(`Successfully uploaded ${result.insertedCount} records!`);
      } else {
        alert("Failed to upload data");
      }
    } catch (error) {
      console.error("Error uploading CSV data:", error);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F3F4F6", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#2563EB", color: "white", padding: "1.5rem", textAlign: "center", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>Techmaghi</h1>
        <p style={{ fontSize: "1rem", marginTop: "0.5rem" }}>CSV File Upload and Validation</p>
      </header>

      {/* Main content */}
      <main style={{ flexGrow: 1, padding: "1.5rem", display: "flex", justifyContent: "center" }}>
        <div style={{
          backgroundColor: "white",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          borderRadius: "0.5rem",
          padding: "1.5rem",
          maxWidth: "40rem",
          width: "100%",
        }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem", textAlign: "center" }}>Upload CSV File</h2>

          <CSVReader
            cssClass="csv-reader-input"
            label="Select a CSV file"
            onFileLoaded={handleFileLoad}
            onError={(error) => console.error("Error:", error)}
            inputId="csv-input"
            inputStyle={{
              border: "1px solid #D1D5DB",
              borderRadius: "0.375rem",
              padding: "0.75rem 1rem",
              fontSize: "1rem",
              width: "100%",
            }}
          />

          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center" }}>
            <button
              onClick={uploadData}
              style={{
                backgroundColor: "#2563EB",
                color: "white",
                padding: "0.75rem 2rem",
                borderRadius: "0.375rem",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#1D4ED8"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#2563EB"}
            >
              Upload to Database
            </button>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "500" }}>Formatted CSV Data</h3>
            <pre style={{
              marginTop: "1rem",
              backgroundColor: "#F3F4F6",
              padding: "1rem",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word"
            }}>
              {JSON.stringify(csvData, null, 2)}
            </pre>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: "#2D3748", color: "white", padding: "1rem", textAlign: "center" }}>
        <p>&copy; 2025 QR Scanner App. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Page;
