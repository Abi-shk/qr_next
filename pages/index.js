import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Head from 'next/head';


const Home = () => {
  const videoRef = useRef(null);
  const [scanningEnabled, setScanningEnabled] = useState(false);
  const [validatedList, setValidatedList] = useState([]);
  const [searchMobile, setSearchMobile] = useState(""); 
  const [foundStudent, setFoundStudent] = useState(null);

  // Fetch validated users when component loads
  useEffect(() => {
    const fetchValidatedUsers = async () => {
      try {
        const response = await fetch("/api/get_data");
        if (response.ok) {
          const result = await response.json();
          setValidatedList(result.data); // Set validated users
        } else {
          toast.error("Failed to fetch validated users.");
        }
      } catch (error) {
        console.error("Error fetching validated users:", error);
        toast.error("Error fetching validated users.");
      }
    };

    fetchValidatedUsers();
  }, [foundStudent]);

  // QR Scanner
  useEffect(() => {
    let qrScanner;
    if (videoRef.current && scanningEnabled) {
      qrScanner = new QrScanner(
        videoRef.current,
        (result) => handleScan(result.data),
        { highlightScanRegion: true, highlightCodeOutline: true }
      );
      qrScanner.start().catch((err) => console.error("Camera Error:", err));
    }

    return () => qrScanner?.destroy();
  }, [scanningEnabled]);

  const searchByMobile = async () => {
    if (!searchMobile.trim()) {
      console.log("Mobile number input is empty.");
      toast.error("Please enter a mobile number.");
      return;
    }

    try {
      console.log("Searching for mobile:", searchMobile);

      const response = await fetch("/api/search_or_validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: searchMobile }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("API response data:", result);
        setFoundStudent(result.data);
      } else {
        const error = await response.json();
        toast.error(error.message || "No user found.");
      }
    } catch (error) {
      console.error("Error searching by mobile:", error);
      toast.error("Failed to search. Please try again.");
    }
  };

  // Manual validation when the button is clicked
  const validateStudent = async (student) => {
    try {
      const response = await fetch("/api/validate_student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: student.userid }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        setValidatedList((prev) => [...prev, result.data]); // Add validated student to list
      } else {
        const error = await response.json();
        toast.error(error.message || "Validation failed.");
      }
      setSearchMobile("");   // Clear the search input
      setFoundStudent(null);
    } catch (error) {
      console.error("Error validating student:", error);
      toast.error("Failed to validate student.");
    }
  };

  // QR scanning logic update
  const handleScan = async (data) => {
    if (data) {
      setScanningEnabled(false);
      let validated = false;
      let res;

      // Check if this student is already validated
      const existingStudent = validatedList.find(
        (student) => student.userid === data
      );

      if (existingStudent) {
        toast.info(`Student already validated: ${existingStudent.name}`);
        return; // Stop further processing
      }

      try {
        const response = await fetch("/api/post_data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userid: data }),
        });
        res = await response.json();

        if (response.status === 200) {
          validated = true;
        }

        setFoundStudent(res.data);

      } catch (err) {
        console.log(err);
      }

      if (validated) {
        confirmValidation(res.data);
        toast.info(`User validated: ${res.data.name}`);
      } else {
        confirmValidation(res.data);
        toast.error("QR Code not found.");
      }
    } else {
      toast.error("QR Code not found.");
    }
  };

  // Confirm validation by adding to the validated list
  const confirmValidation = (entry) => {
    entry.validated = true;
    setValidatedList((prev) => [...prev, entry]);
    toast.success(`Validated: ${entry.name}`);
  };

  // Function to download CSV of validated students
  const downloadCSV = () => {
    const csvContent = `data:text/csv;charset=utf-8,Name,ID,url,mobile\n${validatedList
      .map((s) => `${s.name},${s.userid},${s.url},${s.email}`)
      .join("\n")}`;
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "students_list.csv";
    link.click();
  };

  return (
    <>
      <Head>
        <title>Techmaghi</title> {/* Set the document title */}
        <link rel="icon" type="image/svg+xml" href="/public/logo.png" />
        <meta name="description" content="Description of your site" />
        {/* You can add other meta tags or link tags here as well */}
      </Head>
      <Header />
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem' }}>
  <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>QR Code Scanner</h1>
  <video ref={videoRef} style={{ width: '100%', maxWidth: '25rem', marginBottom: '1rem', border: '1px solid #ccc' }} />
  <button
    onClick={() => setScanningEnabled((prev) => !prev)}
    style={{
      backgroundColor: '#3B82F6',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
    }}
  >
    {scanningEnabled ? 'Stop Scanning' : 'Start Scanning'}
  </button>
  <ToastContainer />
  <div style={{ marginTop: '1.5rem' }}>
    <input
      type="text"
      placeholder="Enter mobile number"
      value={searchMobile}
      onChange={(e) => setSearchMobile(e.target.value)}
      style={{
        border: '1px solid #ccc',
        padding: '0.5rem 1rem',
        marginRight: '0.5rem',
        borderRadius: '0.375rem',
      }}
    />
    <button
      onClick={searchByMobile}
      style={{
        backgroundColor: '#3B82F6',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
      }}
    >
      Search by Mobile
    </button>
  </div>

  {foundStudent && (
    <div style={{ marginTop: '1rem' }}>
      <p>
        Found: {foundStudent.name} ({foundStudent.id})
      </p>
      <button
        onClick={() => validateStudent(foundStudent)}
        style={{
          backgroundColor: '#10B981',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          marginTop: '0.5rem',
        }}
      >
        Validate
      </button>
    </div>
  )}
  {validatedList.length > 0 && (
    <div style={{ marginTop: '1.5rem' }}>
      <h3>Validated List:</h3>
      <ul>
        {validatedList.map((entry) => (
          <li key={entry.id}>
            {entry.name} ({entry.userid})
          </li>
        ))}
      </ul>
      <button
        onClick={downloadCSV}
        style={{
          backgroundColor: '#10B981',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          marginTop: '0.5rem',
        }}
      >
        Download CSV
      </button>
    </div>
  )}
</main>

      <Footer />
    </>
  );
};

export default Home;
