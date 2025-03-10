import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import dashboardService from "../services/dashboardService";
import "./BillDetails.css";

const BillDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the document from location state or fetch it
  useEffect(() => {
    const fetchBillData = async () => {
      setLoading(true);

      // First check if the document was passed via location state
      if (location.state && location.state.document) {
        setBillData(location.state.document);
        setLoading(false);
        return;
      }

      try {
        // If not in state, fetch all bills and find the matching one
        const bills = await dashboardService.getBills();
        const foundBill = bills.find((bill) => bill.billOfLadingNumber === id);

        if (foundBill) {
          setBillData(foundBill);
        } else {
          setError("Bill of Lading not found");
        }
      } catch (err) {
        console.error("Error fetching bill details:", err);
        setError("Failed to load bill of lading details");
      } finally {
        setLoading(false);
      }
    };

    fetchBillData();
  }, [id, location.state]);

  // Format date strings to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper to check if an object has actual data (not empty)
  const hasData = (obj) => {
    return obj && Object.keys(obj).length > 0;
  };

  // Loading state
  if (loading) {
    return (
      <div className="bill-details-container">
        <div className="loading-message">
          <h2>Loading Bill of Lading Details...</h2>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !billData) {
    return (
      <div className="bill-details-container">
        <div className="error-message">
          <h2>Bill of Lading Not Found</h2>
          <p>
            {error ||
              "The requested bill of lading details could not be found."}
          </p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Generate dynamic detail items based on all available properties
  const renderDynamicDetailItems = (section, excludeProps = []) => {
    if (!section) return null;

    return Object.entries(section).map(([key, value]) => {
      // Skip excluded properties
      if (excludeProps.includes(key)) return null;

      // Skip nested objects (they'll be handled separately)
      if (typeof value === "object" && value !== null) return null;

      // Format the label for display
      const formattedLabel = key
        .replace(/([A-Z])/g, " $1") // Insert space before capital letters
        .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
        .trim();

      return (
        <div className="detail-item" key={key}>
          <span className="detail-label">{formattedLabel}:</span>
          <span className="detail-value">
            {value === true ? "Yes" : value === false ? "No" : value || "N/A"}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="bill-details-container">
      <div className="bill-details-header">
        
        <h1>Bill of Lading: {billData.billOfLadingNumber}</h1>
        <div className="status-badge">{billData.status || "N/A"}</div>
      </div>

      <div className="bill-details-content">
        {/* Main Shipment Information */}
        <div className="details-section">
          <h2>Shipment Information</h2>
          <div className="details-grid">
            {renderDynamicDetailItems(billData, [
              "originPort",
              "destinationPort",
              "departureDate",
              "arrivalDate",
              "shipper",
              "consignee",
              "agent",
              "cargoDetails",
              "description",
              "status",
              "billOfLadingNumber",
            ])}
          </div>
        </div>

        {/* Route Information */}
        <div className="details-section">
          <h2>Route Information</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Origin Port:</span>
              <span className="detail-value">
                {billData.originPort || "N/A"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Destination Port:</span>
              <span className="detail-value">
                {billData.destinationPort || "N/A"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Departure Date:</span>
              <span className="detail-value">
                {formatDate(billData.departureDate)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Arrival Date:</span>
              <span className="detail-value">
                {formatDate(billData.arrivalDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Cargo Details */}
        {hasData(billData.cargoDetails) && (
          <div className="details-section">
            <h2>Cargo Details</h2>
            <div className="details-grid">
              {renderDynamicDetailItems(billData.cargoDetails)}
            </div>
          </div>
        )}

        {/* Shipper Information */}
        {hasData(billData.shipper) && (
          <div className="details-section">
            <h2>Shipper Information</h2>
            <div className="details-grid">
              {renderDynamicDetailItems(billData.shipper)}
            </div>
          </div>
        )}

        {/* Consignee Information */}
        {hasData(billData.consignee) && (
          <div className="details-section">
            <h2>Consignee Information</h2>
            <div className="details-grid">
              {renderDynamicDetailItems(billData.consignee)}
            </div>
          </div>
        )}

        {/* Agent Information */}
        {hasData(billData.agent) && (
          <div className="details-section">
            <h2>Agent Information</h2>
            <div className="details-grid">
              {renderDynamicDetailItems(billData.agent)}
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="details-section">
          <h2>Additional Information</h2>
          <div className="details-grid">
            {billData.description && (
              <div className="detail-item full-width">
                <span className="detail-label">Description:</span>
                <span className="detail-value">{billData.description}</span>
              </div>
            )}
            {billData.shippingTerms && (
              <div className="detail-item">
                <span className="detail-label">Shipping Terms:</span>
                <span className="detail-value">{billData.shippingTerms}</span>
              </div>
            )}
            {billData.freightCharges && (
              <div className="detail-item">
                <span className="detail-label">Freight Charges:</span>
                <span className="detail-value">{billData.freightCharges}</span>
              </div>
            )}
            {billData.paymentTerms && (
              <div className="detail-item">
                <span className="detail-label">Payment Terms:</span>
                <span className="detail-value">{billData.paymentTerms}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bill-details-actions">
        <button className="btn btn-primary" onClick={() => window.print()}>
          Print Bill of Lading
        </button>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          Back to Documents
        </button>
      </div>
    </div>
  );
};

export default BillDetails;
