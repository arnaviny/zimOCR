import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DocumentCard.css";

const DocumentCard = ({ document }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDelivered, setIsDelivered] = useState(false);
  const navigate = useNavigate();

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDelivered = () => {
    setIsDelivered(!isDelivered);
  };

  const handleViewDetails = () => {
    // Navigate to Bill of Lading details view with the document data
    navigate(`/bill-details/${document.billOfLadingNumber}`, {
      state: { document },
    });
  };

  // Format date strings to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status class based on document status
  const getStatusClass = (status) => {
    if (!status) return "pending";

    const statusLower = status.toLowerCase();
    if (statusLower === "approved") return "approved";
    if (statusLower === "rejected") return "rejected";
    return "pending";
  };

  return (
    <div className={`document-card ${isExpanded ? "expanded" : ""}`}>
      <div className="document-header" onClick={toggleExpand}>
        <h3>Bill of Lading: {document.billOfLadingNumber}</h3>
        <div className="document-status">
          <span
            className={`status-indicator ${getStatusClass(document.status)}`}
          ></span>
          <span>{document.status || "Pending"}</span>
        </div>
      </div>

      <div className="document-content">
        <div className="document-row">
          <div className="document-field">
            <span className="field-label">Container Number:</span>
            <span className="field-value">
              {document.containerNumber || "N/A"}
            </span>
          </div>
          <div className="document-field">
            <span className="field-label">Vessel:</span>
            <span className="field-value">{document.vessel || "N/A"}</span>
          </div>
        </div>

        <div className="document-row">
          <div className="document-field">
            <span className="field-label">Voyage Number:</span>
            <span className="field-value">
              {document.voyageNumber || "N/A"}
            </span>
          </div>
          <div className="document-field">
            <span className="field-label">Route:</span>
            <span className="field-value">
              {document.originPort || "N/A"} →{" "}
              {document.destinationPort || "N/A"}
            </span>
          </div>
        </div>

        {/* Always display departure and arrival dates, and description */}
        <div className="document-row">
          <div className="document-field">
            <span className="field-label">Departure Date:</span>
            <span className="field-value">
              {formatDate(document.departureDate)}
            </span>
          </div>
          <div className="document-field">
            <span className="field-label">Arrival Date:</span>
            <span className="field-value">
              {formatDate(document.arrivalDate)}
            </span>
          </div>
        </div>

        <div className="document-row">
          <div className="document-field full-width">
            <span className="field-label">Description:</span>
            <span className="field-value description">
              {document.description ||
                "SEA Waybill of Lading for Port-to-Port or Combined Transport."}
            </span>
          </div>
        </div>
      </div>

      <div className="document-actions">
        <button
          className={`btn ${isDelivered ? "btn-success" : "btn-primary"}`}
          onClick={handleDelivered}
        >
          {isDelivered ? "✓ Package Delivered" : "Package Delivered"}
        </button>
        <button className="btn btn-outline" onClick={handleViewDetails}>
          View B/L
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;
