import axios from "axios";

const API_URL = "http://zimocr-backend:8080";

const documentService = {
  // Fetch all documents
  getDocuments: async () => {
    try {
      const response = await axios.get(`${API_URL}/documents`);
      return response.data;
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
  },

  // Fetch a single document by ID
  getDocumentById: async (documentId) => {
    try {
      const response = await axios.get(`${API_URL}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching document ${documentId}:`, error);
      throw error;
    }
  },

  // Upload a new document
  uploadDocument: async (documentData) => {
    try {
      const response = await axios.post(`${API_URL}/upload`, documentData, {
        headers: {
          "Content-Type": "application/json",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          return percentCompleted; // You can use this with a progress state in your component
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  },
};

export default documentService;
