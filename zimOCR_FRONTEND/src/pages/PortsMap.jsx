import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  Polyline,
} from "@react-google-maps/api";
import dashboardService from "../services/dashboardService";
import "./PortsMap.css";

// Hardcode the API key to avoid environment variable issues
// const GOOGLE_MAPS_API_KEY = 

// Exact Aubergine style from Google Maps Styling Wizard
const mapStyles = [
  {
    elementType: "geometry",
    stylers: [{ color: "#1d2c4d" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#8ec3b9" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1a3646" }],
  },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b6878" }],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64779e" }],
  },
  {
    featureType: "administrative.province",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b6878" }],
  },
  {
    featureType: "landscape.man_made",
    elementType: "geometry.stroke",
    stylers: [{ color: "#334e87" }],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#023e58" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#283d6a" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6f9ba5" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1d2c4d" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [{ color: "#023e58" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3C7680" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#304a7d" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#98a5be" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1d2c4d" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#2c6675" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#255763" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#b0d5ce" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#023e58" }],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [{ color: "#98a5be" }],
  },
  {
    featureType: "transit",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1d2c4d" }],
  },
  {
    featureType: "transit.line",
    elementType: "geometry.fill",
    stylers: [{ color: "#283d6a" }],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [{ color: "#3a4762" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1626" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4e6d70" }],
  },
];

// Custom marker SVGs to complement the aubergine theme
const normalMarkerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
  <g fill="none" fill-rule="evenodd">
    <path fill="#5e8ca8" d="M18,0 C26.4,0 33,6.6 33,15 C33,23.4 24.75,31.5 18,36 C11.25,31.5 3,23.4 3,15 C3,6.6 9.6,0 18,0 Z"/>
    <circle cx="18" cy="15" r="7.5" fill="#1d2c4d"/>
    <path fill="#8ec3b9" d="M18,9 L21,14 L26,15 L22,19 L23,24 L18,21.5 L13,24 L14,19 L10,15 L15,14 Z" transform="scale(0.7) translate(8.6, 7)"/>
  </g>
</svg>
`;

const activeMarkerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 36 36">
  <g fill="none" fill-rule="evenodd">
    <path fill="#ff9e80" d="M18,0 C26.4,0 33,6.6 33,15 C33,23.4 24.75,31.5 18,36 C11.25,31.5 3,23.4 3,15 C3,6.6 9.6,0 18,0 Z"/>
    <circle cx="18" cy="15" r="7.5" fill="#1d2c4d"/>
    <path fill="#ffffff" d="M18,9 L21,14 L26,15 L22,19 L23,24 L18,21.5 L13,24 L14,19 L10,15 L15,14 Z" transform="scale(0.7) translate(8.6, 7)"/>
  </g>
</svg>
`;

// Function to convert SVG to URL
const svgToDataUrl = (svg) => {
  const encodedSvg = encodeURIComponent(svg);
  return `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
};

// Container style for the map
const containerStyle = {
  width: "100%",
  height: "100%",
};

// Default center position
const defaultCenter = {
  lat: 20,
  lng: 0,
};

// Mapping of port names to coordinates
const portCoordinates = {
  "Shanghai, China": { lat: 31.2304, lng: 121.4737 },
  Singapore: { lat: 1.2649, lng: 103.826 },
  "Rotterdam, Netherlands": { lat: 51.903, lng: 4.4932 },
  "Los Angeles, USA": { lat: 33.736, lng: -118.2614 },
  "Dubai, UAE": { lat: 25.0159, lng: 55.0678 },
  "Busan, South Korea": { lat: 35.101, lng: 129.0403 },
  "Hamburg, Germany": { lat: 53.5511, lng: 9.9937 },
  "Haifa, Israel": { lat: 32.8191, lng: 34.9983 },
  "Mumbai, India": { lat: 19.076, lng: 72.8777 },
  "Sydney, Australia": { lat: -33.8688, lng: 151.2093 },
  "Piraeus, Greece": { lat: 37.9475, lng: 23.6378 },
  "Santos, Brazil": { lat: -23.9682, lng: -46.3005 },
  "Vancouver, Canada": { lat: 49.2827, lng: -123.1207 },
  "Yokohama, Japan": { lat: 35.4437, lng: 139.638 },
  "Antwerp, Belgium": { lat: 51.2194, lng: 4.4025 },
  "New York, USA": { lat: 40.7128, lng: -74.006 },
  "Casablanca, Morocco": { lat: 33.5731, lng: -7.5898 },
  "Cape Town, South Africa": { lat: -33.9249, lng: 18.4241 },
  "Felixstowe, UK": { lat: 51.9626, lng: 1.3491 },
  "Barcelona, Spain": { lat: 41.3851, lng: 2.1734 },
};

// Major shipping waypoints to create realistic water routes
const shippingWaypoints = {
  // Mediterranean Sea waypoints
  med_west: { lat: 36.0, lng: -5.6 }, // Gibraltar Strait
  med_central: { lat: 37.8, lng: 12.0 }, // Sicily Channel
  med_east: { lat: 34.8, lng: 32.0 }, // East Mediterranean
  suez_north: { lat: 31.2, lng: 32.3 }, // Suez Canal north

  // Red Sea & Gulf of Aden
  suez_south: { lat: 30.0, lng: 32.6 }, // Suez Canal south
  red_sea: { lat: 20.0, lng: 38.0 }, // Red Sea
  gulf_aden: { lat: 12.6, lng: 47.0 }, // Gulf of Aden

  // Indian Ocean waypoints
  arabian_sea: { lat: 14.0, lng: 64.0 }, // Arabian Sea
  mumbai_approach: { lat: 18.0, lng: 71.0 }, // Mumbai sea approach
  indian_ocean_central: { lat: 0.0, lng: 75.0 }, // Central Indian Ocean
  bay_of_bengal: { lat: 12.0, lng: 87.0 }, // Bay of Bengal

  // South China & East China Sea
  malacca_west: { lat: 5.5, lng: 98.0 }, // Malacca Strait west
  malacca_east: { lat: 1.3, lng: 104.0 }, // Singapore/Malacca east
  south_china_sea: { lat: 10.0, lng: 114.0 }, // South China Sea
  hong_kong_approach: { lat: 22.0, lng: 114.5 }, // Hong Kong approach
  taiwan_strait: { lat: 24.0, lng: 119.0 }, // Taiwan Strait
  east_china_sea: { lat: 30.0, lng: 125.0 }, // East China Sea
  yellow_sea: { lat: 35.0, lng: 123.0 }, // Yellow Sea
  korea_strait: { lat: 34.0, lng: 129.0 }, // Korea Strait

  // Pacific Ocean waypoints
  pacific_west: { lat: 35.0, lng: 140.0 }, // West Pacific
  pacific_central_north: { lat: 35.0, lng: -175.0 }, // North Pacific
  pacific_us_approach: { lat: 34.0, lng: -124.0 }, // US West Coast approach
  pacific_central_south: { lat: 0.0, lng: -140.0 }, // South Pacific
  panama_west: { lat: 8.0, lng: -82.0 }, // Panama Canal west

  // Atlantic Ocean waypoints
  panama_east: { lat: 9.0, lng: -80.0 }, // Panama Canal east
  caribbean: { lat: 20.0, lng: -75.0 }, // Caribbean Sea
  gulf_mexico: { lat: 25.0, lng: -90.0 }, // Gulf of Mexico
  atlantic_south: { lat: -10.0, lng: -30.0 }, // South Atlantic
  atlantic_central: { lat: 30.0, lng: -45.0 }, // Central Atlantic
  atlantic_north: { lat: 45.0, lng: -30.0 }, // North Atlantic
  english_channel: { lat: 50.0, lng: -2.0 }, // English Channel
  north_sea: { lat: 55.0, lng: 2.0 }, // North Sea

  // Cape routes
  cape_good_hope: { lat: -35.0, lng: 20.0 }, // Cape of Good Hope
  cape_horn: { lat: -56.0, lng: -67.0 }, // Cape Horn
};

// Function to get coordinates for a port name, with fallbacks
const getPortCoordinates = (portName) => {
  if (!portName) return null;

  // Direct match
  if (portCoordinates[portName]) {
    return portCoordinates[portName];
  }

  // Try to find a partial match
  const portKey = Object.keys(portCoordinates).find(
    (key) => portName.includes(key) || key.includes(portName)
  );

  if (portKey) {
    return portCoordinates[portKey];
  }

  // Default fallback coordinates for unknown ports
  return { lat: 0, lng: 0 };
};

// Generate waypoints for shipping routes between two ports
const generateShippingPath = (originCoords, destCoords) => {
  const path = [originCoords];

  // Simple region detection
  const originLat = originCoords.lat;
  const originLng = originCoords.lng;
  const destLat = destCoords.lat;
  const destLng = destCoords.lng;

  // Determine origin region
  let originRegion = "";
  if (originLng > 100) {
    originRegion = "asia_east";
  } else if (originLng > 40) {
    originRegion = "asia_south";
  } else if (originLng > -10) {
    originRegion = "europe";
  } else if (originLng > -80) {
    originRegion = "americas_east";
  } else {
    originRegion = "americas_west";
  }

  // Determine destination region
  let destRegion = "";
  if (destLng > 100) {
    destRegion = "asia_east";
  } else if (destLng > 40) {
    destRegion = "asia_south";
  } else if (destLng > -10) {
    destRegion = "europe";
  } else if (destLng > -80) {
    destRegion = "americas_east";
  } else {
    destRegion = "americas_west";
  }

  // Select appropriate waypoints based on origin and destination regions

  // Asia East to Europe route (via Suez)
  if (originRegion === "asia_east" && destRegion === "europe") {
    path.push(shippingWaypoints.east_china_sea);
    path.push(shippingWaypoints.south_china_sea);
    path.push(shippingWaypoints.malacca_east);
    path.push(shippingWaypoints.indian_ocean_central);
    path.push(shippingWaypoints.gulf_aden);
    path.push(shippingWaypoints.red_sea);
    path.push(shippingWaypoints.suez_north);
    path.push(shippingWaypoints.med_east);
    path.push(shippingWaypoints.med_central);

    // If going to Northern Europe
    if (destLat > 45) {
      path.push(shippingWaypoints.med_west);
      path.push(shippingWaypoints.english_channel);
      path.push(shippingWaypoints.north_sea);
    }
  }

  // Europe to Asia East (via Suez)
  else if (originRegion === "europe" && destRegion === "asia_east") {
    // If coming from Northern Europe
    if (originLat > 45) {
      path.push(shippingWaypoints.north_sea);
      path.push(shippingWaypoints.english_channel);
      path.push(shippingWaypoints.med_west);
    }

    path.push(shippingWaypoints.med_central);
    path.push(shippingWaypoints.med_east);
    path.push(shippingWaypoints.suez_north);
    path.push(shippingWaypoints.red_sea);
    path.push(shippingWaypoints.gulf_aden);
    path.push(shippingWaypoints.indian_ocean_central);
    path.push(shippingWaypoints.malacca_east);
    path.push(shippingWaypoints.south_china_sea);
    path.push(shippingWaypoints.east_china_sea);
  }

  // Asia East to Americas East (via Panama)
  else if (originRegion === "asia_east" && destRegion === "americas_east") {
    path.push(shippingWaypoints.pacific_west);
    path.push(shippingWaypoints.pacific_central_north);
    path.push(shippingWaypoints.pacific_us_approach);
    path.push(shippingWaypoints.panama_west);
    path.push(shippingWaypoints.panama_east);
    path.push(shippingWaypoints.caribbean);
  }

  // Americas East to Asia East (via Panama)
  else if (originRegion === "americas_east" && destRegion === "asia_east") {
    path.push(shippingWaypoints.caribbean);
    path.push(shippingWaypoints.panama_east);
    path.push(shippingWaypoints.panama_west);
    path.push(shippingWaypoints.pacific_us_approach);
    path.push(shippingWaypoints.pacific_central_north);
    path.push(shippingWaypoints.pacific_west);
  }

  // Asia East to Americas West (Trans-Pacific)
  else if (originRegion === "asia_east" && destRegion === "americas_west") {
    path.push(shippingWaypoints.pacific_west);
    path.push(shippingWaypoints.pacific_central_north);
    path.push(shippingWaypoints.pacific_us_approach);
  }

  // Americas West to Asia East (Trans-Pacific)
  else if (originRegion === "americas_west" && destRegion === "asia_east") {
    path.push(shippingWaypoints.pacific_us_approach);
    path.push(shippingWaypoints.pacific_central_north);
    path.push(shippingWaypoints.pacific_west);
  }

  // Europe to Americas East (Trans-Atlantic)
  else if (originRegion === "europe" && destRegion === "americas_east") {
    // If coming from Northern Europe
    if (originLat > 45) {
      path.push(shippingWaypoints.north_sea);
      path.push(shippingWaypoints.english_channel);
    }
    path.push(shippingWaypoints.atlantic_north);
  }

  // Americas East to Europe (Trans-Atlantic)
  else if (originRegion === "americas_east" && destRegion === "europe") {
    path.push(shippingWaypoints.atlantic_north);
    // If going to Northern Europe
    if (destLat > 45) {
      path.push(shippingWaypoints.english_channel);
      path.push(shippingWaypoints.north_sea);
    }
  }

  // Asia South to Europe (via Suez)
  else if (originRegion === "asia_south" && destRegion === "europe") {
    path.push(shippingWaypoints.arabian_sea);
    path.push(shippingWaypoints.gulf_aden);
    path.push(shippingWaypoints.red_sea);
    path.push(shippingWaypoints.suez_north);
    path.push(shippingWaypoints.med_east);
    path.push(shippingWaypoints.med_central);

    // If going to Northern Europe
    if (destLat > 45) {
      path.push(shippingWaypoints.med_west);
      path.push(shippingWaypoints.english_channel);
      path.push(shippingWaypoints.north_sea);
    }
  }

  // Default fallback - add a midpoint to make the route slightly curved
  else {
    const midLat = (originLat + destLat) / 2;
    const midLng = (originLng + destLng) / 2;

    // Add slight curve to the route by adjusting the midpoint
    // This makes the route follow ocean contours better

    // If crossing Pacific
    if (Math.abs(originLng - destLng) > 180) {
      // If crossing Pacific East to West
      if (originLng < destLng) {
        path.push({ lat: midLat - 10, lng: originLng - 40 });
        path.push({ lat: midLat - 5, lng: destLng + 40 });
      }
      // If crossing Pacific West to East
      else {
        path.push({ lat: midLat - 10, lng: originLng + 40 });
        path.push({ lat: midLat - 5, lng: destLng - 40 });
      }
    }
    // If crossing Atlantic
    else if (
      (originLng < -30 && destLng > -10) ||
      (destLng < -30 && originLng > -10)
    ) {
      path.push({ lat: midLat, lng: midLng + 5 });
    }
    // If in Indian Ocean
    else if (
      (originLng > 50 && originLng < 100) ||
      (destLng > 50 && destLng < 100)
    ) {
      path.push({ lat: midLat - 5, lng: midLng });
    }
    // Generic curved path
    else {
      path.push({ lat: midLat, lng: midLng });
    }
  }

  // Add destination to path
  path.push(destCoords);

  return path;
};

function PortsMap() {
  const [selectedPort, setSelectedPort] = useState(null);
  const [infoWindowPort, setInfoWindowPort] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [apiKeyError, setApiKeyError] = useState(false);
  const [billsData, setBillsData] = useState([]);
  const [ports, setPorts] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Check if the API key is available
  useEffect(() => {
    if (
      !GOOGLE_MAPS_API_KEY ||
      GOOGLE_MAPS_API_KEY === "undefined" ||
      GOOGLE_MAPS_API_KEY === ""
    ) {
      console.error("Google Maps API key is missing or invalid");
      setApiKeyError(true);
    }
  }, []);

  // Load data from localStorage or fetch from dashboardService
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to get data from localStorage first
        const cachedData = localStorage.getItem("billsOfLading");
        let bills = [];

        if (cachedData) {
          // Use cached data if available
          bills = JSON.parse(cachedData);
          console.log("Using bills data from localStorage");
        } else {
          // Fetch data from dashboardService if not in localStorage
          bills = await dashboardService.getBills();
          console.log("Fetched bills from dashboardService");
        }

        setBillsData(bills);

        // Generate ports and routes from bills
        const portsMap = new Map();
        const routesArray = [];

        bills.forEach((bill) => {
          // Add origin port if it has coordinates
          const originCoords = getPortCoordinates(bill.originPort);
          if (originCoords) {
            if (!portsMap.has(bill.originPort)) {
              portsMap.set(bill.originPort, {
                id: portsMap.size + 1,
                name: bill.originPort,
                location: bill.originPort,
                coordinates: originCoords,
                containers: [],
                shipments: [],
              });
            }
            // Add shipment to port's shipments
            const originPort = portsMap.get(bill.originPort);
            originPort.shipments.push(bill);
            originPort.containers.push(bill.containerNumber);
          }

          // Add destination port if it has coordinates
          const destCoords = getPortCoordinates(bill.destinationPort);
          if (destCoords) {
            if (!portsMap.has(bill.destinationPort)) {
              portsMap.set(bill.destinationPort, {
                id: portsMap.size + 1,
                name: bill.destinationPort,
                location: bill.destinationPort,
                coordinates: destCoords,
                containers: [],
                shipments: [],
              });
            }
            // Add shipment to port's shipments
            const destPort = portsMap.get(bill.destinationPort);
            destPort.shipments.push(bill);
            destPort.containers.push(bill.containerNumber);
          }

          // Create route if both ports have coordinates
          if (originCoords && destCoords) {
            // Generate shipping path through water routes
            const path = generateShippingPath(originCoords, destCoords);

            routesArray.push({
              id: routesArray.length + 1,
              origin: bill.originPort,
              originCoords: originCoords,
              destination: bill.destinationPort,
              destinationCoords: destCoords,
              path: path, // The water route path
              bill: bill,
              status: bill.status,
              containerNumber: bill.containerNumber,
            });
          }
        });

        // Convert Map to array
        setPorts(Array.from(portsMap.values()));
        setRoutes(routesArray);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    fetchData();
  }, []);

  // Load the Google Maps JavaScript API
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || "",
    // Add these options to help troubleshoot errors
    language: "en",
    region: "US",
  });

  const handlePortSelect = (port) => {
    setSelectedPort(port);
    setInfoWindowPort(port);
    setSelectedRoute(null);

    // Center map on selected port if map reference exists
    if (mapRef) {
      mapRef.panTo(port.coordinates);
      mapRef.setZoom(6);
    }
  };

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    setSelectedPort(null);
    setInfoWindowPort(null);

    // Center map to show the route
    if (mapRef) {
      // Calculate bounds to show the entire route
      const bounds = new window.google.maps.LatLngBounds();

      // Add all path points to bounds
      route.path.forEach((point) => {
        bounds.extend(point);
      });

      mapRef.fitBounds(bounds);
    }
  };

  const onLoad = (map) => {
    setMapRef(map);

    // Set the styles explicitly after the map loads
    if (map) {
      map.setOptions({ styles: mapStyles });
    }
  };

  const onUnmount = () => {
    setMapRef(null);
  };

  // Get status color for route lines
  const getRouteColor = (status) => {
    if (!status) return "#4e73df"; // Default blue

    const statusLower = status.toLowerCase();
    if (statusLower.includes("transit")) return "#4e73df"; // Blue
    if (statusLower.includes("awaiting")) return "#f6c23e"; // Yellow
    if (statusLower.includes("arrived")) return "#36b9cc"; // Cyan
    if (statusLower.includes("received") || statusLower.includes("delivered"))
      return "#1cc88a"; // Green

    return "#4e73df"; // Default blue
  };

  // Calculate the midpoint of a route for placing the info window
  const getRouteMidpoint = (path) => {
    if (!path || path.length === 0) return null;

    // Choose a point somewhere in the middle of the path
    const midIndex = Math.floor(path.length / 2);
    return path[midIndex];
  };

  // Handle API key error
  if (apiKeyError) {
    return (
      <div className="ports-map">
        <h2 className="page-title">Global Ports Map</h2>
        <div className="map-error">
          <h3>Google Maps API Key Error</h3>
          <p>
            There's an issue with the Google Maps API key. Please check your
            environment variables.
          </p>
          <p>
            Current API key:{" "}
            {GOOGLE_MAPS_API_KEY
              ? `${GOOGLE_MAPS_API_KEY.substring(0, 5)}...`
              : "Not found"}
          </p>
          <p>
            Make sure the key is defined in your code or environment variables
            correctly.
          </p>
        </div>

        {/* Port and routes list */}
        <div className="map-details">
          <div className="ports-list">
            <h3>ZIM Global Ports</h3>
            <ul>
              {ports.map((port) => (
                <li
                  key={port.id}
                  className={
                    selectedPort && selectedPort.id === port.id ? "active" : ""
                  }
                  onClick={() => setSelectedPort(port)}
                >
                  <span className="port-name">{port.name}</span>
                  <span className="port-location">
                    {port.shipments.length} shipments
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="port-details">
            <h3>Active Shipping Routes</h3>
            <div className="routes-list">
              {routes.map((route) => (
                <div
                  key={route.id}
                  className={`route-item ${
                    selectedRoute && selectedRoute.id === route.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() => setSelectedRoute(route)}
                >
                  <div className="route-header">
                    <span className="route-name">
                      {route.origin} → {route.destination}
                    </span>
                    <span
                      className={`route-status ${route.status
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {route.status}
                    </span>
                  </div>
                  <div className="route-details">
                    <span className="container">
                      Container: {route.containerNumber}
                    </span>
                    <span className="bill">
                      Bill: {route.bill.billOfLadingNumber}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle loading and error states
  if (loadError)
    return (
      <div className="ports-map">
        <h2 className="page-title">Global Ports Map</h2>
        <div className="map-error">
          <h3>Error Loading Google Maps</h3>
          <p>There was an error loading Google Maps: {loadError.message}</p>
        </div>
        {/* Port list would be here */}
      </div>
    );

  if (!isLoaded)
    return (
      <div className="ports-map">
        <h2 className="page-title">Global Ports Map</h2>
        <div className="map-loading">Loading maps...</div>
      </div>
    );

  // Map options with Aubergine theme
  const mapOptions = {
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    styles: mapStyles,
    zoomControl: true,
    zoomControlOptions: {
      position: window.google.maps.ControlPosition.RIGHT_TOP,
    },
    mapTypeId: "roadmap",
  };

  return (
    <div className="ports-map">
      <h2 className="page-title">Global Ports & Shipping Routes</h2>

      <div className="map-container">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={selectedPort ? selectedPort.coordinates : defaultCenter}
          zoom={selectedPort ? 6 : 2}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
        >
          {/* Render port markers */}
          {ports.map((port) => (
            <Marker
              key={port.id}
              position={port.coordinates}
              onClick={() => handlePortSelect(port)}
              icon={{
                url:
                  selectedPort && selectedPort.id === port.id
                    ? svgToDataUrl(activeMarkerSvg)
                    : svgToDataUrl(normalMarkerSvg),
                scaledSize: new window.google.maps.Size(
                  selectedPort && selectedPort.id === port.id ? 42 : 36,
                  selectedPort && selectedPort.id === port.id ? 42 : 36
                ),
                anchor: new window.google.maps.Point(18, 36),
              }}
            />
          ))}

          {/* Render route lines */}
          {routes.map((route) => (
            <Polyline
              key={route.id}
              path={route.path}
              options={{
                strokeColor: getRouteColor(route.status),
                strokeOpacity:
                  selectedRoute && selectedRoute.id === route.id ? 1.0 : 0.6,
                strokeWeight:
                  selectedRoute && selectedRoute.id === route.id ? 4 : 2,
                geodesic: true,
              }}
              onClick={() => handleRouteSelect(route)}
            />
          ))}

          {/* InfoWindow for selected port */}
          {infoWindowPort && (
            <InfoWindow
              position={infoWindowPort.coordinates}
              onCloseClick={() => setInfoWindowPort(null)}
              options={{
                pixelOffset: new window.google.maps.Size(0, -30),
                disableAutoPan: false,
              }}
            >
              <div className="info-window-content">
                <h3>{infoWindowPort.name}</h3>
                <div className="info-window-details">
                  <p className="location">
                    <i className="location-icon">📍</i>{" "}
                    {infoWindowPort.location}
                  </p>
                  <div className="container-stats">
                    <div className="stat">
                      <span className="stat-value">
                        {infoWindowPort.containers.length}
                      </span>
                      <span className="stat-label">Containers</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">
                        {infoWindowPort.shipments.length}
                      </span>
                      <span className="stat-label">Shipments</span>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary info-window-btn"
                    onClick={() => handlePortSelect(infoWindowPort)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}

          {/* InfoWindow for selected route */}
          {selectedRoute && (
            <InfoWindow
              position={getRouteMidpoint(selectedRoute.path)}
              onCloseClick={() => setSelectedRoute(null)}
              options={{
                pixelOffset: new window.google.maps.Size(0, 0),
                disableAutoPan: false,
              }}
            >
              <div className="info-window-content">
                <h3>Shipment Route</h3>
                <div className="info-window-details">
                  <p className="route-path">
                    <i className="route-icon">🚢</i> {selectedRoute.origin} →{" "}
                    {selectedRoute.destination}
                  </p>
                  <div className="route-info">
                    <p>Container: {selectedRoute.containerNumber}</p>
                    <p>Bill: {selectedRoute.bill.billOfLadingNumber}</p>
                    <p>Status: {selectedRoute.status}</p>
                    <p>Vessel: {selectedRoute.bill.vessel}</p>
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      <div className="map-details">
        <div className="ports-list">
          <h3>ZIM Global Ports</h3>
          <ul>
            {ports.map((port) => (
              <li
                key={port.id}
                className={
                  selectedPort && selectedPort.id === port.id ? "active" : ""
                }
                onClick={() => handlePortSelect(port)}
              >
                <span className="port-name">{port.name}</span>
                <span className="port-location">
                  {port.shipments.length} shipments
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="port-details">
          {selectedPort ? (
            <>
              <h3>{selectedPort.name}</h3>
              <p>
                <strong>Location:</strong> {selectedPort.location}
              </p>
              <p>
                <strong>Coordinates:</strong>{" "}
                {selectedPort.coordinates.lat.toFixed(4)},{" "}
                {selectedPort.coordinates.lng.toFixed(4)}
              </p>

              <div className="port-containers">
                <h4>Shipments at this Port</h4>
                {selectedPort.shipments.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Bill of Lading</th>
                        <th>Container ID</th>
                        <th>Status</th>
                        <th>Route</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPort.shipments.map((shipment) => (
                        <tr key={shipment.billOfLadingNumber}>
                          <td>{shipment.billOfLadingNumber}</td>
                          <td>{shipment.containerNumber}</td>
                          <td>{shipment.status}</td>
                          <td>
                            {shipment.originPort === selectedPort.name ? (
                              <span>→ {shipment.destinationPort}</span>
                            ) : (
                              <span>{shipment.originPort} →</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No containers currently at this port.</p>
                )}
              </div>
            </>
          ) : selectedRoute ? (
            <>
              <h3>Route Details</h3>
              <p>
                <strong>Origin:</strong> {selectedRoute.origin}
              </p>
              <p>
                <strong>Destination:</strong> {selectedRoute.destination}
              </p>
              <p>
                <strong>Container:</strong> {selectedRoute.containerNumber}
              </p>
              <p>
                <strong>Bill of Lading:</strong>{" "}
                {selectedRoute.bill.billOfLadingNumber}
              </p>
              <p>
                <strong>Status:</strong> {selectedRoute.status}
              </p>

              {/* Show other details from the bill */}
              <div className="bill-details">
                <h4>Shipment Details</h4>
                <p>
                  <strong>Vessel:</strong> {selectedRoute.bill.vessel}
                </p>
                <p>
                  <strong>Voyage:</strong> {selectedRoute.bill.voyageNumber}
                </p>
                <p>
                  <strong>Departure:</strong>{" "}
                  {new Date(
                    selectedRoute.bill.departureDate
                  ).toLocaleDateString()}
                </p>
                <p>
                  <strong>Arrival:</strong>{" "}
                  {new Date(
                    selectedRoute.bill.arrivalDate
                  ).toLocaleDateString()}
                </p>
              </div>
            </>
          ) : (
            <p className="select-prompt">
              Select a port or route to view details
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PortsMap;
