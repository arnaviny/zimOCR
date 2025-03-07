# ZimOCR - Automated OCR Processing System

## 📌 Project Overview
ZimOCR is an automated Optical Character Recognition (OCR) processing system designed to extract structured data from Bill of Lading (BOL) documents. The system is fully containerized using Docker and consists of several microservices for handling OCR processing, database management, and frontend interactions.

---

## 📁 Project Structure

```
zimOCR/
├── zimOCR_BACKEND/          # Spring Boot backend service
│   ├── src/main/java/com/zimocr/backend/
│   │   ├── controller/      # REST controllers
│   │   ├── service/         # Business logic
│   │   ├── repository/      # Database repositories
│   │   ├── model/           # Entity definitions
│   ├── src/main/resources/  # Configuration files
│   ├── pom.xml              # Maven dependencies
│   ├── Dockerfile           # Backend container configuration
│
├── zimOCR_FRONTEND/         # React-based frontend (TBD)
│   ├── src/                 # React source code
│   ├── package.json         # Dependencies
│   ├── Dockerfile           # Frontend container configuration
│
├── OCRServesPy/             # Flask-based OCR microservice
│   ├── OCRServesPy.py       # Main OCR processing script
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile           # OCR service container configuration
│
├── zimOCR_PostgresDB/       # PostgreSQL database
│   ├── init.sql             # Database schema initialization
│
├── docker-compose.yml       # Docker Compose configuration
├── README.md                # Project documentation
```

---

## 🛠️ Setup & Installation

### 1️⃣ Prerequisites
Ensure the following are installed on your system:
- Docker & Docker Compose
- Java 17+ (for backend service)
- Node.js & npm (for frontend, if applicable)

### 2️⃣ Clone the Repository
```sh
$ git clone https://github.com/your-repo/zimOCR.git
$ cd zimOCR
```

### 3️⃣ Build & Run the System
To start all services using Docker:
```sh
$ docker-compose up --build
```

To stop the services:
```sh
$ docker-compose down
```

### 4️⃣ Verify Connectivity
Check if the backend service is running:
```sh
$ curl -X GET http://localhost:8080/actuator/health
```

Test OCR service directly:
```sh
$ curl -X POST -H "Content-Type: text/plain" --data-binary "@sample.pdf.b64" http://localhost:8080/api/ocr
```

---

## 📡 Services & API Endpoints

### 🏗️ Backend (Spring Boot) - `zimOCR_BACKEND`
| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| `POST` | `/api/ocr`            | Processes a PDF document using OCR   |
| `GET`  | `/api/documents`      | Retrieves list of BOL short details  |
| `GET`  | `/api/documents/{id}` | Retrieves processed BOL details      |
| `GET`  | `/api/dashbord`       | Retrieves processed dashbord details |

### 🔍 OCR Service (Flask) - `zimOCR_ocr_service`
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/ocr` | Extracts text & structured data from BOL PDF |

### 🗄️ Database (PostgreSQL) - `zimOCR_postgres`
- Stores extracted BOL information
- Accessible within the Docker network as `zimOCR_postgres`

---

## 🚀 Next Steps & TODO List

### 1️⃣ Backend Enhancements
- ✅ Implement base OCR processing (DONE)
- 🔹 Connect backend service to PostgreSQL
- 🔹 Add exception handling & logging
- 🔹 Implement authentication & authorization (JWT-based?)

### 2️⃣ Frontend Development
- 🔹 Develop React-based UI
- 🔹 Connect frontend with backend API
- 🔹 Display extracted data in a user-friendly dashboard

### 3️⃣ Additional API Endpoints
- 🔹 Add endpoint for listing processed documents (`GET /api/documents`)
- 🔹 Implement file upload API (`POST /api/upload`)

### 4️⃣ Deployment Considerations
- 🔹 Optimize container images for production
- 🔹 Set up CI/CD pipeline (GitHub Actions / Jenkins)
- 🔹 Deploy services to AWS/GCP

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE). Feel free to contribute and improve!

## 🤝 Contributing
We welcome contributions! Submit issues, feature requests, or pull requests via GitHub.

For any questions, contact: `amit.bialik22@gmail.com`

---

### 🎯 Happy Coding! 🚀

