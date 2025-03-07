CREATE TABLE bill_of_lading (
    id SERIAL PRIMARY KEY,
    bill_of_lading_number VARCHAR(255) UNIQUE NOT NULL,
    container_number VARCHAR(255),
    vessel VARCHAR(255),
    voyage_number VARCHAR(255),


    departure_date DATE,
    arrival_date DATE,


    origin_port VARCHAR(255),
    destination_port VARCHAR(255),

    description TEXT,
    weight_kg INTEGER,
    quantity INTEGER,
    volume_m3 INTEGER,
    hazardous BOOLEAN,

    shipper_name VARCHAR(255),
    shipper_address VARCHAR(255),
    shipper_contact VARCHAR(255),

    consignee_name VARCHAR(255),
    consignee_address VARCHAR(255),
    consignee_contact VARCHAR(255),

    agent_name VARCHAR(255),
    agent_address VARCHAR(255),
    agent_contact VARCHAR(255),

    incoterms VARCHAR(255),
    freight_charges VARCHAR(255),
    payment_terms VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
