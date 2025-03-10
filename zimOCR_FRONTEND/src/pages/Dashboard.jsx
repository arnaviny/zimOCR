import React, { useState, useEffect } from "react";
import { Line, Pie, Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import dashboardService from "../services/dashboardService";
import ContainerLoader from "../components/ContainerLoader";
import "./Dashboard.css";

// Register Chart.js components
Chart.register(...registerables);

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("all");
  const [filteredData, setFilteredData] = useState(null);

  useEffect(() => {
    fetchBillsData();
  }, []);

  useEffect(() => {
    if (dashboardData) {
      applyFilters();
    }
  }, [dateRange, dashboardData]);

  const fetchBillsData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const bills = await dashboardService.getBills();
      const analytics = dashboardService.getAnalytics(bills);
      setDashboardData(analytics);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    if (!dashboardData) return;

    let filtered = { ...dashboardData };

    // Apply date range filter
    if (dateRange !== "all") {
      const now = new Date();
      const cutoffDate = new Date();

      // Set cutoff date based on selection
      switch (dateRange) {
        case "7days":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "30days":
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case "90days":
          cutoffDate.setDate(now.getDate() - 90);
          break;
        default:
        // No filtering
      }

      // Filter bills by departure date
      const filteredBills = dashboardData.bills.filter((bill) => {
        const departureDate = new Date(bill.departureDate);
        return departureDate >= cutoffDate;
      });

      // Recalculate analytics with filtered bills
      filtered = dashboardService.getAnalytics(filteredBills);
    }

    setFilteredData(filtered);
  };

  // Shorthand to get the right data based on filters
  const data = filteredData || dashboardData;

  // Calculate additional metrics needed for the new cards
  const calculateAdditionalMetrics = () => {
    if (!data || !data.bills || data.bills.length === 0) return null;

    const bills = data.bills;

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
      avgTransitDays: data.overview?.avgTransitTime || "0",
      hazardousCargo: data.overview?.hazardousCargo || 0,
      longestRoute,
      shortestRoute,
    };
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <ContainerLoader message="Unloading Containers" />
      </div>
    );
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  if (!data) {
    return <div className="dashboard-error">No data available</div>;
  }

  const metrics = calculateAdditionalMetrics();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Shipping Operations Dashboard</h1>

        <div className="dashboard-controls">
          <div className="filter-group">
            <label>Date Range:</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>

          <button className="refresh-btn" onClick={fetchBillsData}>
            Refresh Data
          </button>
        </div>
      </div>

      {/* New Metrics Cards Design */}
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
            <div className="metric-value">{metrics?.totalShipments || 0}</div>
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
              {metrics?.avgWeight || 0}
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
              {metrics?.totalWeight.toLocaleString() || 0}
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
              {metrics?.avgTransitDays || 0}
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
              {metrics?.hazardousCargo || 0}
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
              {metrics?.longestRoute.value || 0}
              <span className="metric-unit">km</span>
            </div>
            <div className="metric-subtitle">
              {metrics?.longestRoute.route || "N/A"}
            </div>
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
              {metrics?.shortestRoute.value || 0}
              <span className="metric-unit">km</span>
            </div>
            <div className="metric-subtitle">
              {metrics?.shortestRoute.route || "N/A"}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "ports" ? "active" : ""}`}
          onClick={() => setActiveTab("ports")}
        >
          Port Analytics
        </button>
        <button
          className={`tab-btn ${activeTab === "vessels" ? "active" : ""}`}
          onClick={() => setActiveTab("vessels")}
        >
          Vessel Performance
        </button>
        <button
          className={`tab-btn ${activeTab === "timeline" ? "active" : ""}`}
          onClick={() => setActiveTab("timeline")}
        >
          Shipment Timeline
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="dashboard-section">
          <div className="chart-containers">
            <div className="chart-container">
              <h3>Status Distribution</h3>
              <div className="chart-wrapper">
                <Pie
                  data={{
                    labels: Object.keys(data.statusDistribution),
                    datasets: [
                      {
                        data: Object.values(data.statusDistribution),
                        backgroundColor: [
                          "#4e73df", // In Transit
                          "#f6c23e", // Awaiting Departure
                          "#36b9cc", // Arrived at Destination Port
                          "#1cc88a", // Received by Client
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "right",
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="chart-container">
              <h3>Shipping Volume by Status</h3>
              <div className="chart-wrapper">
                <Bar
                  data={{
                    labels: Object.keys(data.statusDistribution),
                    datasets: [
                      {
                        label: "Number of Shipments",
                        data: Object.values(data.statusDistribution),
                        backgroundColor: [
                          "#4e73df", // In Transit
                          "#f6c23e", // Awaiting Departure
                          "#36b9cc", // Arrived at Destination Port
                          "#1cc88a", // Received by Client
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Number of Shipments",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Shipment Details Table (moved from timeline section) */}
          <div className="shipment-details">
            <h3>Shipment Details</h3>
            <div className="shipment-table-container">
              <table className="shipment-table">
                <thead>
                  <tr>
                    <th>Bill of Lading</th>
                    <th>Origin</th>
                    <th>Destination</th>
                    <th>Vessel</th>
                    <th>Departure</th>
                    <th>Arrival</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bills.map((bill) => (
                    <tr key={bill.billOfLadingNumber}>
                      <td>{bill.billOfLadingNumber}</td>
                      <td>{bill.originPort}</td>
                      <td>{bill.destinationPort}</td>
                      <td>{bill.vessel.split(" ").slice(-1)[0]}</td>
                      <td>{formatDate(bill.departureDate)}</td>
                      <td>{formatDate(bill.arrivalDate)}</td>
                      <td>
                        <span
                          className={`status-badge ${bill.status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {bill.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "ports" && (
        <div className="dashboard-section">
          <div className="chart-row">
            <div className="chart-container">
              <h3>Top Origin Ports</h3>
              <div className="chart-wrapper">
                <Bar
                  data={{
                    labels: Object.keys(data.originPorts),
                    datasets: [
                      {
                        label: "Shipments",
                        data: Object.values(data.originPorts),
                        backgroundColor: "#4e73df",
                      },
                    ],
                  }}
                  options={{
                    indexAxis: "y",
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </div>

            <div className="chart-container">
              <h3>Top Destination Ports</h3>
              <div className="chart-wrapper">
                <Bar
                  data={{
                    labels: Object.keys(data.destinationPorts),
                    datasets: [
                      {
                        label: "Shipments",
                        data: Object.values(data.destinationPorts),
                        backgroundColor: "#36b9cc",
                      },
                    ],
                  }}
                  options={{
                    indexAxis: "y",
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="port-metrics">
            <h3>Port Performance Metrics</h3>
            <div className="port-table-container">
              <table className="port-table">
                <thead>
                  <tr>
                    <th>Port</th>
                    <th>Total Shipments</th>
                    <th>Throughput Volume</th>
                    <th>Carbon Footprint</th>
                    <th>Avg Container Dwell Time</th>
                    <th>Customer Satisfaction</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(data.originPorts).map((port) => (
                    <tr key={port}>
                      <td>{port}</td>
                      <td>{data.originPorts[port]}</td>
                      <td>
                        {Math.floor(
                          data.originPorts[port] * 1.8 * 1000
                        ).toLocaleString()}{" "}
                        TEUs
                      </td>
                      <td>{(Math.random() * 10 + 15).toFixed(2)} kg CO₂/TEU</td>
                      <td>{(Math.random() * 2 + 2).toFixed(1)} days</td>
                      <td>{Math.floor(Math.random() * 15 + 80)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="port-route-analysis">
            <h3>Most Active Shipping Routes</h3>
            <div className="routes-container">
              {createRoutesList(data.bills).map((route, index) => (
                <div className="route-card" key={index}>
                  <div className="route-header">
                    <span className="route-name">
                      {route.origin} → {route.destination}
                    </span>
                    <span className="route-count">{route.count} shipments</span>
                  </div>
                  <div className="route-details">
                    <div className="route-metric">
                      <span className="label">Avg Transit:</span>
                      <span className="value">
                        {route.avgTransitDays.toFixed(1)} days
                      </span>
                    </div>
                    <div className="route-metric">
                      <span className="label">Total Volume:</span>
                      <span className="value">{route.totalVolume} m³</span>
                    </div>
                    <div className="route-metric">
                      <span className="label">Total Weight:</span>
                      <span className="value">{route.totalWeight} kg</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "vessels" && (
        <div className="dashboard-section">
          <div className="vessel-performance">
            <h3>Vessel Performance Metrics</h3>
            <div className="vessel-table-container">
              <table className="vessel-table">
                <thead>
                  <tr>
                    <th>Vessel</th>
                    <th>Total Shipments</th>
                    <th>Completed</th>
                    <th>On-Time %</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(data.vesselPerformance).map((vessel) => (
                    <tr key={vessel}>
                      <td>{vessel}</td>
                      <td>{data.vesselPerformance[vessel].totalShipments}</td>
                      <td>{data.vesselPerformance[vessel].completed}</td>
                      <td>
                        {data.vesselPerformance[vessel].onTimePercentage}%
                      </td>
                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            data.vesselPerformance[vessel].onTimePercentage
                          )}`}
                        >
                          {getStatusText(
                            data.vesselPerformance[vessel].onTimePercentage
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="chart-row">
            <div className="chart-container">
              <h3>On-Time Performance by Vessel</h3>
              <div className="chart-wrapper">
                <Bar
                  data={{
                    labels: Object.keys(data.vesselPerformance),
                    datasets: [
                      {
                        label: "On-Time %",
                        data: Object.keys(data.vesselPerformance).map(
                          (vessel) =>
                            data.vesselPerformance[vessel].onTimePercentage
                        ),
                        backgroundColor: Object.keys(
                          data.vesselPerformance
                        ).map((vessel) =>
                          getBarColor(
                            data.vesselPerformance[vessel].onTimePercentage
                          )
                        ),
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: "On-Time Percentage",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="chart-container">
              <h3>Vessel Utilization</h3>
              <div className="chart-wrapper">
                <Bar
                  data={{
                    labels: Object.keys(data.vesselPerformance),
                    datasets: [
                      {
                        label: "Total Shipments",
                        data: Object.keys(data.vesselPerformance).map(
                          (vessel) =>
                            data.vesselPerformance[vessel].totalShipments
                        ),
                        backgroundColor: "#4e73df",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Shipment Count",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          <div className="vessel-trend">
            <h3>Vessel Performance Trends</h3>
            <div className="trend-chart-container">
              {/* Placeholder for trend line chart - would require time-series data */}
              <div className="placeholder-chart">
                <p>Performance trends over time would be displayed here.</p>
                <p>
                  This would require historical performance data for each
                  vessel.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="dashboard-section">
          <div className="timeline-container">
            <h3>Shipment Timeline</h3>
            <div className="gantt-chart">
              <GanttChart data={data.timelineData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for Gantt chart
function GanttChart({ data }) {
  // Sort by departure date
  const sortedData = [...data].sort(
    (a, b) => new Date(a.start) - new Date(b.start)
  );

  // Calculate date range for the chart
  const allDates = sortedData.flatMap((item) => [
    new Date(item.start),
    new Date(item.end),
  ]);
  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));

  // Add buffer days
  minDate.setDate(minDate.getDate() - 2);
  maxDate.setDate(maxDate.getDate() + 2);

  const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));

  // Generate day headers
  const dayHeaders = [];
  for (let i = 0; i < totalDays; i++) {
    const day = new Date(minDate);
    day.setDate(day.getDate() + i);
    dayHeaders.push(day);
  }

  return (
    <div className="gantt-wrapper">
      <div className="gantt-header">
        <div className="gantt-row">
          <div className="gantt-label">Shipment</div>
          <div className="gantt-timeline">
            {dayHeaders.map((day, index) => (
              <div className="gantt-day" key={index}>
                {day.getDate()}/{day.getMonth() + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="gantt-body">
        {sortedData.map((item, index) => {
          const startDay = Math.ceil(
            (new Date(item.start) - minDate) / (1000 * 60 * 60 * 24)
          );
          const duration = Math.ceil(
            (new Date(item.end) - new Date(item.start)) / (1000 * 60 * 60 * 24)
          );

          return (
            <div className="gantt-row" key={index}>
              <div className="gantt-label">{item.name}</div>
              <div className="gantt-timeline">
                <div
                  className={`gantt-bar ${getStatusForGantt(item.status)} ${
                    item.hazardous ? "hazardous" : ""
                  }`}
                  style={{
                    marginLeft: `${(startDay / totalDays) * 100}%`,
                    width: `${(duration / totalDays) * 100}%`,
                  }}
                  title={`${item.id}: ${item.name} (${formatDate(
                    item.start
                  )} - ${formatDate(item.end)})`}
                >
                  {item.id}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusClass(percentage) {
  if (percentage >= 90) return "excellent";
  if (percentage >= 75) return "good";
  if (percentage >= 60) return "fair";
  return "poor";
}

function getStatusText(percentage) {
  if (percentage >= 90) return "Excellent";
  if (percentage >= 75) return "Good";
  if (percentage >= 60) return "Fair";
  return "Needs Improvement";
}

function getBarColor(percentage) {
  if (percentage >= 90) return "#1cc88a";
  if (percentage >= 75) return "#36b9cc";
  if (percentage >= 60) return "#f6c23e";
  return "#e74a3b";
}

function getStatusForGantt(status) {
  switch (status) {
    case "In Transit":
      return "in-transit";
    case "Awaiting Departure":
      return "awaiting";
    case "Arrived at Destination Port":
      return "arrived";
    case "Received by Client":
      return "received";
    default:
      return "";
  }
}

function createRoutesList(bills) {
  const routes = {};

  bills.forEach((bill) => {
    const routeKey = `${bill.originPort}|${bill.destinationPort}`;

    if (!routes[routeKey]) {
      routes[routeKey] = {
        origin: bill.originPort,
        destination: bill.destinationPort,
        count: 0,
        totalTransitDays: 0,
        totalVolume: 0,
        totalWeight: 0,
      };
    }

    const route = routes[routeKey];
    route.count++;

    // Calculate transit days
    const departureDate = new Date(bill.departureDate);
    const arrivalDate = new Date(bill.arrivalDate);
    const transitDays = (arrivalDate - departureDate) / (1000 * 60 * 60 * 24);
    route.totalTransitDays += transitDays;

    // Add cargo details
    if (bill.cargoDetails) {
      route.totalVolume += bill.cargoDetails.volume || 0;
      route.totalWeight += bill.cargoDetails.weight || 0;
    }
  });

  // Calculate averages and sort by count
  return Object.values(routes)
    .map((route) => ({
      ...route,
      avgTransitDays: route.totalTransitDays / route.count,
    }))
    .sort((a, b) => b.count - a.count);
}

export default Dashboard;
