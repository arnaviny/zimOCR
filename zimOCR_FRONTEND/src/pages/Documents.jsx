import React, { useState, useEffect } from "react";
import axios from "axios";
import DocumentCard from "../components/DocumentCard";
import "./Documents.css";
import ContainerLoader from "../components/ContainerLoader";

// Import dashboard mock data to use when the server is unavailable
import dashboardService from "../services/dashboardService";

function Documents() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    // Fetch documents when component mounts
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch from server
      const response = await axios.get("http://zimocr_backend:8080/api/document", {
        timeout: 5000, // 5 second timeout
      });
      setDocuments(response.data);

      // Save to localStorage for offline access
      localStorage.setItem("documents", JSON.stringify(response.data));

      setUsingMockData(false);
    } catch (err) {
      console.error("Error fetching documents from server:", err);

      // Try to get data from localStorage
      const cachedDocuments = localStorage.getItem("documents");

      if (cachedDocuments) {
        try {
          const parsedDocuments = JSON.parse(cachedDocuments);
          setDocuments(parsedDocuments);
          console.log("Using cached data from localStorage");
        } catch (parseError) {
          console.error("Error parsing cached documents:", parseError);
          // Fall back to dashboard mock data
          useDashboardMockData();
        }
      } else {
        // No cached data, use dashboard mock data
        useDashboardMockData();
      }

      setUsingMockData(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to use dashboard mock data
  const useDashboardMockData = async () => {
    try {
      // Get the bills data from dashboard service
      const bills = await dashboardService.getBills();

      // Convert the bills to document format
      const documentsFromBills = bills.map((bill) => ({
        billOfLadingNumber: bill.billOfLadingNumber,
        containerNumber: bill.containerNumber,
        vessel: bill.vessel,
        voyageNumber: bill.voyageNumber,
        departureDate: bill.departureDate,
        arrivalDate: bill.arrivalDate,
        originPort: bill.originPort,
        destinationPort: bill.destinationPort,
        status: bill.status,
        description: `SEA Waybill of Lading for shipment from ${bill.originPort} to ${bill.destinationPort}.`,
      }));

      setDocuments(documentsFromBills);
      console.log("Using dashboard mock data");

      // Save to localStorage for future use
      localStorage.setItem("documents", JSON.stringify(documentsFromBills));
    } catch (error) {
      console.error("Error using dashboard mock data:", error);
      setError("Failed to load documents. Please try again later.");
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setUploadResult(null);
    setUploadProgress(0);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredDocuments = documents.filter((doc) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      doc.billOfLadingNumber?.toLowerCase().includes(searchTermLower) ||
      doc.containerNumber?.toLowerCase().includes(searchTermLower) ||
      doc.vessel?.toLowerCase().includes(searchTermLower) ||
      doc.originPort?.toLowerCase().includes(searchTermLower) ||
      doc.destinationPort?.toLowerCase().includes(searchTermLower)
    );
  });

  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    setIsUploading(true);
    setUploadResult(null);
    setUploadProgress(0);

    try {
      // Read the file as base64
      const base64String = await readFileAsBase64(selectedFile);

      // Create the request payload
      const payload = {
        filename: selectedFile.name,
        contentType: selectedFile.type,
        data: base64String,
      };

      if (usingMockData) {
        // Simulate upload with mock data
        await simulateUpload(setUploadProgress);

        // Get a random port pair for the mock document
        const portPairs = [
          { origin: "Shanghai, China", destination: "Rotterdam, Netherlands" },
          { origin: "Singapore", destination: "Los Angeles, USA" },
          { origin: "Busan, South Korea", destination: "Hamburg, Germany" },
          { origin: "Mumbai, India", destination: "Sydney, Australia" },
          { origin: "Dubai, UAE", destination: "Piraeus, Greece" },
        ];

        const randomPortPair =
          portPairs[Math.floor(Math.random() * portPairs.length)];

        // Create a mock response with more realistic data
        const mockResponse = {
          billOfLadingNumber: `BOL-2025-${Math.floor(
            1000 + Math.random() * 9000
          )}`,
          containerNumber: `ZIMU${Math.floor(
            1000000 + Math.random() * 9000000
          )}`,
          vessel: "ZIM Integrated Shipping Services",
          voyageNumber: `VY${Math.floor(4000 + Math.random() * 1000)}`,
          departureDate: new Date().toISOString(),
          arrivalDate: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          originPort: randomPortPair.origin,
          destinationPort: randomPortPair.destination,
          status: "In Transit",
          description: `SEA Waybill of Lading for shipment from ${randomPortPair.origin} to ${randomPortPair.destination}.`,
        };

        // Add to documents list
        const updatedDocuments = [mockResponse, ...documents];
        setDocuments(updatedDocuments);

        // Update localStorage
        localStorage.setItem("documents", JSON.stringify(updatedDocuments));

        setUploadResult({
          success: true,
          message: "File uploaded successfully (mock mode)",
          data: mockResponse,
        });
      } else {
        // Try to upload to server
        const response = await axios.post(
          "http://zimocr-backend:8080/upload",
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            },
          }
        );

        setUploadResult({
          success: true,
          message: "File uploaded successfully",
          data: response.data,
        });

        // Refresh the document list
        fetchDocuments();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadResult({
        success: false,
        message: `Error uploading file: ${
          error.response?.data?.message || error.message
        }`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Function to simulate upload progress
  const simulateUpload = async (progressSetter) => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve();
        }
        progressSetter(progress);
      }, 300);
    });
  };

  // Function to read file as base64
  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        // Get the base64 string (remove the data URL prefix)
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="documents">
      <div className="documents-header">
        <h2 className="page-title">Documents</h2>
        <input
          type="text"
          className="search-bar"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {usingMockData && (
        <div className="mock-data-notice">
          <p>
            <strong>Note:</strong> Using{" "}
            {localStorage.getItem("documents") ? "cached" : "dashboard"} data
            because the server is unavailable. Some functionality may be
            limited.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="loading-container">
          <ContainerLoader message="Processing Documents" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="no-documents">
          <p>
            No documents found.{" "}
            {searchTerm ? "Try a different search term or " : ""} Upload a new
            document to get started.
          </p>
        </div>
      ) : (
        <div className="documents-list">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.billOfLadingNumber}
              document={document}
            />
          ))}
        </div>
      )}

      {/* Floating Upload Button */}
      <button className="floating-button" onClick={openModal}>
        +
      </button>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-close" onClick={closeModal}>
              &times;
            </span>
            <h2>Upload Bill of Lading</h2>

            <form onSubmit={handleFileUpload}>
              <div className="file-input-container">
                <input
                  type="file"
                  id="documentFile"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required
                />
                <label htmlFor="documentFile">
                  {selectedFile ? selectedFile.name : "Select PDF file"}
                </label>
              </div>

              {selectedFile && (
                <div className="file-info">
                  <p>
                    <strong>File:</strong> {selectedFile.name}
                  </p>
                  <p>
                    <strong>Size:</strong>{" "}
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                  <p>
                    <strong>Type:</strong> {selectedFile.type}
                  </p>
                </div>
              )}

              {isUploading && (
                <div className="progress-container">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">{uploadProgress}%</div>
                </div>
              )}

              {uploadResult && (
                <div
                  className={`upload-result ${
                    uploadResult.success ? "success" : "error"
                  }`}
                >
                  <p>{uploadResult.message}</p>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUploading || !selectedFile}
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                  disabled={isUploading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documents;
