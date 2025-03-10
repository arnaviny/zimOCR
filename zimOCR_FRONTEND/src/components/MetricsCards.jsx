import React, { useMemo } from "react";
import "./Dashboard.css"; // Make sure to import the existing styles

const MetricsCards = ({ dashboardData }) => {
  // Calculate metrics from dashboard data
  const metrics = useMemo(() => {
    if (!dashboardData) return null;

    const bills = dashboardData.bills || [];

    // Calculate average weight
    const totalWeight = bills.reduce(
      (sum, bill) => sum + (bill.cargoDetails?.weight || 0),
      0
    );
    const avgWeight =
      bills.length > 0 ? (totalWeight / bills.length).toFixed(2) : 0;

    // Calculate shortest and longest routes
    let shortestRoute = { distance: Infinity, route: "N/A" };
    let longestRoute = { distance: 0, route: "N/A" };

    bills.forEach((bill) => {
      // This is a simplified distance calculation
      // In a real app, you'd use proper geospatial calculations
      if (bill.originPort && bill.destinationPort) {
        // For demonstration - just using string length as a proxy for "distance"
        const routeName = `${bill.originPort} → ${bill.destinationPort}`;
        const routeDistance = Math.random() * 10000; // Simulated distance

        if (routeDistance < shortestRoute.distance) {
          shortestRoute = {
            distance: routeDistance,
            route: routeName,
            value: Math.round(routeDistance),
          };
        }

        if (routeDistance > longestRoute.distance) {
          longestRoute = {
            distance: routeDistance,
            route: routeName,
            value: Math.round(routeDistance),
          };
        }
      }
    });

    return {
      totalShipments: bills.length,
      avgWeight,
      totalWeight,
      avgTransitDays: dashboardData.overview?.avgTransitTime || "0",
      hazardousCargo: dashboardData.overview?.hazardousCargo || 0,
      longestRoute,
      shortestRoute,
    };
  }, [dashboardData]);

  if (!metrics) return null;

  return (
    <div className="metrics-dashboard">
      <div className="metrics-container">
        {/* Total Shipments Card */}
        <div className="metric-card total-shipments">
          <div className="metric-header">
            <span className="metric-title">Total Shipments</span>
            <div className="metric-icon total-shipments">
              <i className="fas fa-shipping-fast"></i>
            </div>
          </div>
          <div className="metric-value">{metrics.totalShipments}</div>
          <div className="metric-subtitle">
            Active shipments in transit
            <span className="change-indicator positive">
              <span className="change-icon">↑</span>4.3%
            </span>
          </div>
        </div>

        {/* Average Shipment Weight Card */}
        <div className="metric-card avg-weight">
          <div className="metric-header">
            <span className="metric-title">Avg Shipment Weight</span>
            <div className="metric-icon avg-weight">
              <i className="fas fa-weight-hanging"></i>
            </div>
          </div>
          <div className="metric-value">
            {metrics.avgWeight}
            <span className="metric-unit">kg</span>
          </div>
          <div className="metric-subtitle">
            Per container average
            <span className="change-indicator positive">
              <span className="change-icon">↑</span>2.1%
            </span>
          </div>
        </div>

        {/* Total Weight Card */}
        <div className="metric-card total-weight">
          <div className="metric-header">
            <span className="metric-title">Total Weight</span>
            <div className="metric-icon total-weight">
              <i className="fas fa-balance-scale"></i>
            </div>
          </div>
          <div className="metric-value">
            {metrics.totalWeight.toLocaleString()}
            <span className="metric-unit">kg</span>
          </div>
          <div className="metric-subtitle">All shipments combined</div>
        </div>

        {/* Average Transit Time Card */}
        <div className="metric-card transit-time">
          <div className="metric-header">
            <span className="metric-title">Avg Transit Time</span>
            <div className="metric-icon transit-time">
              <i className="fas fa-clock"></i>
            </div>
          </div>
          <div className="metric-value">
            {metrics.avgTransitDays}
            <span className="metric-unit">days</span>
          </div>
          <div className="metric-subtitle">
            Port to port average
            <span className="change-indicator negative">
              <span className="change-icon">↓</span>1.2%
            </span>
          </div>
        </div>

        {/* Hazardous Cargo Card */}
        <div className="metric-card hazardous">
          <div className="metric-header">
            <span className="metric-title">Hazardous Cargo</span>
            <div className="metric-icon hazardous">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
          </div>
          <div className="metric-value">
            {metrics.hazardousCargo}
            <span className="metric-unit">containers</span>
          </div>
          <div className="metric-subtitle">Special handling required</div>
        </div>

        {/* Longest Route Card */}
        <div className="metric-card longest-route">
          <div className="metric-header">
            <span className="metric-title">Longest Route</span>
            <div className="metric-icon longest-route">
              <i className="fas fa-route"></i>
            </div>
          </div>
          <div className="metric-value">
            {metrics.longestRoute.value}
            <span className="metric-unit">km</span>
          </div>
          <div className="metric-subtitle">{metrics.longestRoute.route}</div>
        </div>

        {/* Shortest Route Card */}
        <div className="metric-card shortest-route">
          <div className="metric-header">
            <span className="metric-title">Shortest Route</span>
            <div className="metric-icon shortest-route">
              <i className="fas fa-compress-arrows-alt"></i>
            </div>
          </div>
          <div className="metric-value">
            {metrics.shortestRoute.value}
            <span className="metric-unit">km</span>
          </div>
          <div className="metric-subtitle">{metrics.shortestRoute.route}</div>
        </div>
      </div>
    </div>
  );
};

export default MetricsCards;
