-- Database Schema for Kristallball Military Asset Management

CREATE TABLE bases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) CHECK (role IN ('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER')),
    base_id INT REFERENCES bases(id) ON DELETE SET NULL
);

CREATE TABLE equipment_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL -- WEAPON, VEHICLE, AMMUNITION
);

CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    base_id INT REFERENCES bases(id) ON DELETE CASCADE,
    equipment_type_id INT REFERENCES equipment_types(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    source_base_id INT REFERENCES bases(id) ON DELETE CASCADE,
    destination_base_id INT REFERENCES bases(id) ON DELETE CASCADE,
    equipment_type_id INT REFERENCES equipment_types(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    status VARCHAR(20) DEFAULT 'COMPLETED', -- PENDING, IN_TRANSIT, COMPLETED
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    initiated_by INT REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    base_id INT REFERENCES bases(id) ON DELETE CASCADE,
    equipment_type_id INT REFERENCES equipment_types(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    assigned_to VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expenditures (
    id SERIAL PRIMARY KEY,
    base_id INT REFERENCES bases(id) ON DELETE CASCADE,
    equipment_type_id INT REFERENCES equipment_types(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- PURCHASE, TRANSFER, ASSIGNMENT, EXPENDITURE
    details TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX idx_purchases_base_equip ON purchases(base_id, equipment_type_id);
CREATE INDEX idx_transfers_source_equip ON transfers(source_base_id, equipment_type_id);
CREATE INDEX idx_transfers_dest_equip ON transfers(destination_base_id, equipment_type_id);
CREATE INDEX idx_assignments_base_equip ON assignments(base_id, equipment_type_id);
CREATE INDEX idx_expenditures_base_equip ON expenditures(base_id, equipment_type_id);
