import axios from "axios";

// API URL for fetching bills of lading
const API_URL = "http://zimocr-backend:8080";

// Mock data in case server connection fails
const MOCK_BILLS = [
  {
    billOfLadingNumber: "BOL-2025-0009",
    containerNumber: "ZIMU9594642",
    vessel: "ZIM Integrated Shipping Services 9",
    voyageNumber: "VY4618",
    departureDate: "2025-03-09T08:00:00Z",
    arrivalDate: "2025-03-15T08:00:00Z",
    originPort: "Shanghai, China",
    destinationPort: "Rotterdam, Netherlands",
    status: "In Transit",
    cargoDetails: {
      description: "Automotive Parts",
      weight: 20609,
      quantity: 139,
      volume: 79,
      hazardous: true,
    },
    shipper: {
      name: "Tech Innovators Inc.",
      address: "456 Tech Park, City D, China",
      contact: "info@techinnovators.com",
    },
    consignee: {
      name: "Home Essentials Ltd.",
      address: "654 Residential Road, City G, Netherlands",
      contact: "service@homeessentials.com",
    },
    agent: {
      name: "ZIM",
      services: "Shipping, Documentation",
      address: "Port Office, Shanghai, China",
      contact: "+1234567890",
    },
    shippingTerms: "FOB",
    freightCharges: "Prepaid",
    paymentTerms: "30 days net",
  },
  {
    billOfLadingNumber: "BOL-2025-0010",
    containerNumber: "ZIMU7654321",
    vessel: "ZIM Integrated Shipping Services 10",
    voyageNumber: "VY4620",
    departureDate: "2025-03-10T10:00:00Z",
    arrivalDate: "2025-03-18T14:00:00Z",
    originPort: "Singapore",
    destinationPort: "Los Angeles, USA",
    status: "Awaiting Departure",
    cargoDetails: {
      description: "Electronics",
      weight: 15800,
      quantity: 210,
      volume: 65,
      hazardous: false,
    },
    shipper: {
      name: "Global Electronics Co.",
      address: "789 Industrial Ave, Singapore",
      contact: "shipping@globalelectronics.com",
    },
    consignee: {
      name: "West Coast Distributors",
      address: "123 Harbor Blvd, Los Angeles, USA",
      contact: "receiving@westcoastdist.com",
    },
    agent: {
      name: "ZIM",
      services: "Shipping, Documentation, Customs",
      address: "Marina Bay, Singapore",
      contact: "+6587654321",
    },
    shippingTerms: "CIF",
    freightCharges: "Prepaid",
    paymentTerms: "15 days net",
  },
  {
    billOfLadingNumber: "BOL-2025-0011",
    containerNumber: "ZIMU8523697",
    vessel: "ZIM Integrated Shipping Services 8",
    voyageNumber: "VY4615",
    departureDate: "2025-03-05T09:00:00Z",
    arrivalDate: "2025-03-12T11:00:00Z",
    originPort: "Busan, South Korea",
    destinationPort: "Hamburg, Germany",
    status: "Arrived at Destination Port",
    cargoDetails: {
      description: "Textiles",
      weight: 18200,
      quantity: 320,
      volume: 85,
      hazardous: false,
    },
    shipper: {
      name: "Korea Textiles Ltd.",
      address: "45 Manufacturing District, Busan, South Korea",
      contact: "exports@koreatextiles.com",
    },
    consignee: {
      name: "European Apparel GmbH",
      address: "87 Fashion Street, Hamburg, Germany",
      contact: "imports@euapparel.de",
    },
    agent: {
      name: "ZIM",
      services: "Shipping, Insurance",
      address: "Busan Harbor Complex, South Korea",
      contact: "+8219876543",
    },
    shippingTerms: "FOB",
    freightCharges: "Collect",
    paymentTerms: "60 days net",
  },
  {
    billOfLadingNumber: "BOL-2025-0012",
    containerNumber: "ZIMU2589631",
    vessel: "ZIM Integrated Shipping Services 11",
    voyageNumber: "VY4622",
    departureDate: "2025-03-12T08:30:00Z",
    arrivalDate: "2025-03-25T14:15:00Z",
    originPort: "Mumbai, India",
    destinationPort: "Sydney, Australia",
    status: "In Transit",
    cargoDetails: {
      description: "Pharmaceuticals",
      weight: 12500,
      quantity: 95,
      volume: 48,
      hazardous: true,
    },
    shipper: {
      name: "India Pharma Exports",
      address: "78 Science Park, Mumbai, India",
      contact: "logistics@indiapharma.com",
    },
    consignee: {
      name: "Australian Healthcare Systems",
      address: "42 Medical Drive, Sydney, Australia",
      contact: "supply@aushealthcare.com.au",
    },
    agent: {
      name: "ZIM",
      services: "Temperature-controlled Shipping, Documentation",
      address: "Mumbai Port, India",
      contact: "+9122987654",
    },
    shippingTerms: "CIP",
    freightCharges: "Prepaid",
    paymentTerms: "45 days net",
  },
  {
    billOfLadingNumber: "BOL-2025-0013",
    containerNumber: "ZIMU9632587",
    vessel: "ZIM Integrated Shipping Services 7",
    voyageNumber: "VY4610",
    departureDate: "2025-02-28T11:00:00Z",
    arrivalDate: "2025-03-08T09:00:00Z",
    originPort: "Dubai, UAE",
    destinationPort: "Piraeus, Greece",
    status: "Received by Client",
    cargoDetails: {
      description: "Home Furnishings",
      weight: 23700,
      quantity: 180,
      volume: 105,
      hazardous: false,
    },
    shipper: {
      name: "Dubai Furniture Exports",
      address: "125 Trade Center, Dubai, UAE",
      contact: "shipping@dubaifurniture.ae",
    },
    consignee: {
      name: "Mediterranean Home Goods",
      address: "35 Harbor Street, Piraeus, Greece",
      contact: "orders@medhomegoods.gr",
    },
    agent: {
      name: "ZIM",
      services: "Shipping, Customs",
      address: "Jebel Ali Port, Dubai, UAE",
      contact: "+97145678901",
    },
    shippingTerms: "DAP",
    freightCharges: "Prepaid",
    paymentTerms: "30 days net",
  },
  {
    billOfLadingNumber: "BOL-2025-0014",
    containerNumber: "ZIMU3698521",
    vessel: "ZIM Integrated Shipping Services 12",
    voyageNumber: "VY4625",
    departureDate: "2025-03-15T07:00:00Z",
    arrivalDate: "2025-03-28T16:30:00Z",
    originPort: "Shenzhen, China",
    destinationPort: "Santos, Brazil",
    status: "Awaiting Departure",
    cargoDetails: {
      description: "Consumer Electronics",
      weight: 19800,
      quantity: 250,
      volume: 82,
      hazardous: false,
    },
    shipper: {
      name: "Shenzhen Electronics Manufacturing",
      address: "56 Tech Zone, Shenzhen, China",
      contact: "exports@szelectronics.cn",
    },
    consignee: {
      name: "Brasil Tech Distributors",
      address: "789 Commerce Avenue, Santos, Brazil",
      contact: "imports@brasiltechdist.com.br",
    },
    agent: {
      name: "ZIM",
      services: "Shipping, Insurance, Documentation",
      address: "Shenzhen Port, China",
      contact: "+8675512345678",
    },
    shippingTerms: "CIF",
    freightCharges: "Prepaid",
    paymentTerms: "45 days net",
  },
  {
    billOfLadingNumber: "BOL-2025-0015",
    containerNumber: "ZIMU7539514",
    vessel: "ZIM Integrated Shipping Services 6",
    voyageNumber: "VY4608",
    departureDate: "2025-02-25T09:15:00Z",
    arrivalDate: "2025-03-05T12:00:00Z",
    originPort: "Yokohama, Japan",
    destinationPort: "Vancouver, Canada",
    status: "Received by Client",
    cargoDetails: {
      description: "Automotive Components",
      weight: 21500,
      quantity: 165,
      volume: 88,
      hazardous: false,
    },
    shipper: {
      name: "Japan Auto Parts Corp.",
      address: "34 Industrial District, Yokohama, Japan",
      contact: "logistics@japautoparts.jp",
    },
    consignee: {
      name: "Canadian Vehicle Manufacturing",
      address: "456 Assembly Road, Vancouver, Canada",
      contact: "components@canvehicle.ca",
    },
    agent: {
      name: "ZIM",
      services: "Shipping, Documentation",
      address: "Yokohama Harbor, Japan",
      contact: "+81456789012",
    },
    shippingTerms: "FCA",
    freightCharges: "Prepaid",
    paymentTerms: "30 days net",
  },
  {
    billOfLadingNumber: "BOL-2025-0016",
    containerNumber: "ZIMU8529637",
    vessel: "ZIM Integrated Shipping Services 13",
    voyageNumber: "VY4630",
    departureDate: "2025-03-18T14:00:00Z",
    arrivalDate: "2025-04-02T11:30:00Z",
    originPort: "Antwerp, Belgium",
    destinationPort: "New York, USA",
    status: "Awaiting Departure",
    cargoDetails: {
      description: "Fine Chocolates",
      weight: 12800,
      quantity: 110,
      volume: 55,
      hazardous: false,
    },
    shipper: {
      name: "Belgian Chocolate Exporters",
      address: "87 Confectionery Lane, Antwerp, Belgium",
      contact: "sales@belgiumchocolate.be",
    },
    consignee: {
      name: "American Gourmet Imports",
      address: "120 Luxury Drive, New York, USA",
      contact: "purchasing@americangourmet.com",
    },
    agent: {
      name: "ZIM",
      services: "Temperature-controlled Shipping, Insurance",
      address: "Antwerp Port, Belgium",
      contact: "+3238765432",
    },
    shippingTerms: "DDP",
    freightCharges: "Prepaid",
    paymentTerms: "15 days net",
  },
  {
    billOfLadingNumber: "BOL-2025-0017",
    containerNumber: "ZIMU1472583",
    vessel: "ZIM Integrated Shipping Services 9",
    voyageNumber: "VY4619",
    departureDate: "2025-03-11T10:30:00Z",
    arrivalDate: "2025-03-19T09:45:00Z",
    originPort: "Barcelona, Spain",
    destinationPort: "Casablanca, Morocco",
    status: "In Transit",
    cargoDetails: {
      description: "Machinery Parts",
      weight: 25300,
      quantity: 75,
      volume: 92,
      hazardous: true,
    },
    shipper: {
      name: "Spanish Industrial Equipment",
      address: "23 Manufacturing Zone, Barcelona, Spain",
      contact: "exports@spanishindustrial.es",
    },
    consignee: {
      name: "Morocco Manufacturing Ltd.",
      address: "67 Industrial Park, Casablanca, Morocco",
      contact: "imports@moroccomfg.ma",
    },
    agent: {
      name: "ZIM",
      services: "Shipping, Customs Clearance",
      address: "Barcelona Port, Spain",
      contact: "+34612345678",
    },
    shippingTerms: "CFR",
    freightCharges: "Collect",
    paymentTerms: "60 days net",
  },
  {
    billOfLadingNumber: "BOL-2025-0018",
    containerNumber: "ZIMU6398521",
    vessel: "ZIM Integrated Shipping Services 10",
    voyageNumber: "VY4621",
    departureDate: "2025-03-13T08:00:00Z",
    arrivalDate: "2025-03-28T14:00:00Z",
    originPort: "Felixstowe, UK",
    destinationPort: "Cape Town, South Africa",
    status: "In Transit",
    cargoDetails: {
      description: "Medical Equipment",
      weight: 14700,
      quantity: 85,
      volume: 62,
      hazardous: false,
    },
    shipper: {
      name: "British Medical Supplies",
      address: "45 Science Park, Cambridge, UK",
      contact: "exports@britishmedsupplies.co.uk",
    },
    consignee: {
      name: "South African Healthcare Systems",
      address: "123 Medical Center Rd, Cape Town, South Africa",
      contact: "procurement@sahealthcare.co.za",
    },
    agent: {
      name: "ZIM",
      services: "Shipping, Documentation, Insurance",
      address: "Felixstowe Port, UK",
      contact: "+441234567890",
    },
    shippingTerms: "CIP",
    freightCharges: "Prepaid",
    paymentTerms: "30 days net",

  }, 
];

// Service functions
const dashboardService = {
  // Get all bills of lading
  getBills: async () => {
    try {
      // Try to get data from the server
      const response = await axios.get(`${API_URL}/bills`, { timeout: 5000 });

      // Store in localStorage for offline access
      localStorage.setItem("billsOfLading", JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      console.error("Error fetching bills:", error);

      // Check if we have data in localStorage
      const cachedData = localStorage.getItem("billsOfLading");
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      // If no cached data, use mock data
      localStorage.setItem("billsOfLading", JSON.stringify(MOCK_BILLS));
      return MOCK_BILLS;
    }
  },

  // Get analytics for the dashboard
  getAnalytics: (bills) => {
    if (!bills || !Array.isArray(bills) || bills.length === 0) {
      return null;
    }

    const now = new Date();

    // Overview metrics
    const overview = {
      totalShipments: bills.length,
      inTransit: bills.filter((b) => b.status === "In Transit").length,
      awaitingDeparture: bills.filter((b) => b.status === "Awaiting Departure")
        .length,
      atDestination: bills.filter(
        (b) => b.status === "Arrived at Destination Port"
      ).length,
      received: bills.filter((b) => b.status === "Received by Client").length,
      hazardousCargo: bills.filter(
        (b) => b.cargoDetails && b.cargoDetails.hazardous
      ).length,
      totalWeight: bills.reduce(
        (sum, b) => sum + (b.cargoDetails?.weight || 0),
        0
      ),
      totalVolume: bills.reduce(
        (sum, b) => sum + (b.cargoDetails?.volume || 0),
        0
      ),
      avgTransitTime: calculateAverageTransitDays(bills),
    };

    // Port metrics
    const originPorts = countByProperty(bills, "originPort");
    const destinationPorts = countByProperty(bills, "destinationPort");

    // Vessel metrics
    const vesselPerformance = calculateVesselPerformance(bills);

    // Timeline data
    const timelineData = generateTimelineData(bills);

    // Status distribution
    const statusDistribution = countByProperty(bills, "status");

    return {
      overview,
      originPorts,
      destinationPorts,
      vesselPerformance,
      timelineData,
      statusDistribution,
      bills, // Include the raw data for additional calculations
    };
  },
};

// Helper functions
function calculateAverageTransitDays(bills) {
  const completedShipments = bills.filter(
    (b) =>
      b.status === "Arrived at Destination Port" ||
      b.status === "Received by Client"
  );

  if (completedShipments.length === 0) return 0;

  const totalDays = completedShipments.reduce((sum, bill) => {
    const departureDate = new Date(bill.departureDate);
    const arrivalDate = new Date(bill.arrivalDate);
    const diffTime = Math.abs(arrivalDate - departureDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return sum + diffDays;
  }, 0);

  return (totalDays / completedShipments.length).toFixed(1);
}

function countByProperty(array, property) {
  return array.reduce((acc, item) => {
    const key = item[property];
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key]++;
    return acc;
  }, {});
}

function calculateVesselPerformance(bills) {
  const vesselMap = {};

  bills.forEach((bill) => {
    if (!vesselMap[bill.vessel]) {
      vesselMap[bill.vessel] = {
        totalShipments: 0,
        completed: 0,
        onTime: 0,
        delayed: 0,
      };
    }

    vesselMap[bill.vessel].totalShipments++;

    if (
      bill.status === "Arrived at Destination Port" ||
      bill.status === "Received by Client"
    ) {
      vesselMap[bill.vessel].completed++;

      // Check if shipment was on time (using scheduled arrival date)
      const actualArrival = new Date(bill.arrivalDate);
      const scheduledArrival = new Date(bill.arrivalDate); // In a real system, you would have both scheduled and actual

      if (actualArrival <= scheduledArrival) {
        vesselMap[bill.vessel].onTime++;
      } else {
        vesselMap[bill.vessel].delayed++;
      }
    }
  });

  // Calculate percentages
  Object.keys(vesselMap).forEach((vessel) => {
    const stats = vesselMap[vessel];
    if (stats.completed > 0) {
      stats.onTimePercentage = ((stats.onTime / stats.completed) * 100).toFixed(
        1
      );
    } else {
      stats.onTimePercentage = 0;
    }
  });

  return vesselMap;
}

function generateTimelineData(bills) {
  return bills.map((bill) => {
    const departureDate = new Date(bill.departureDate);
    const arrivalDate = new Date(bill.arrivalDate);

    return {
      id: bill.billOfLadingNumber,
      name: `${bill.originPort} → ${bill.destinationPort}`,
      vessel: bill.vessel,
      start: departureDate,
      end: arrivalDate,
      status: bill.status,
      hazardous: bill.cargoDetails?.hazardous || false,
    };
  });
}

export default dashboardService;
