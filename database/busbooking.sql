-- Bus Booking System Database Schema
-- Compatible with MySQL / MariaDB and SQLite

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'passenger', -- 'passenger', 'owner', 'driver'
  nic VARCHAR(30),
  address TEXT,
  gender VARCHAR(10) DEFAULT 'Male',
  city VARCHAR(50),
  preferred_station VARCHAR(100),
  emergency_contact VARCHAR(20),
  bio TEXT,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bus_stations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(50) NOT NULL,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS buses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT,
  name VARCHAR(100) NOT NULL,
  number VARCHAR(30) NOT NULL UNIQUE,
  type VARCHAR(50) DEFAULT 'Luxury AC Coach',
  route VARCHAR(150) NOT NULL,
  trip_date DATE NOT NULL,
  departure VARCHAR(20) NOT NULL,
  arrival VARCHAR(20) NOT NULL,
  ticket_price VARCHAR(30) NOT NULL,
  rating DECIMAL(2,1) DEFAULT 4.5,
  latitude DECIMAL(9,6) DEFAULT 6.9271,
  longitude DECIMAL(9,6) DEFAULT 79.8612,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS seats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bus_id INT NOT NULL,
  label VARCHAR(10) NOT NULL,
  is_available TINYINT(1) DEFAULT 1,
  FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS route_stops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bus_id INT NOT NULL,
  stop_name VARCHAR(100) NOT NULL,
  stop_order INT NOT NULL,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  bus_id INT NOT NULL,
  seat_id INT NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmed', -- 'confirmed', 'cancelled', 'swapped'
  email_sent TINYINT(1) DEFAULT 1,
  booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (bus_id) REFERENCES buses(id),
  FOREIGN KEY (seat_id) REFERENCES seats(id)
);

CREATE TABLE IF NOT EXISTS seat_swap_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  requester_id INT NOT NULL,
  current_seat_id INT NOT NULL,
  requested_seat_id INT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'declined'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (requester_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS bus_ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bus_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bus_id) REFERENCES buses(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS driver_turns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id INT NOT NULL,
  bus_id INT NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP NULL,
  passenger_count INT DEFAULT 0,
  FOREIGN KEY (driver_id) REFERENCES users(id),
  FOREIGN KEY (bus_id) REFERENCES buses(id)
);

CREATE TABLE IF NOT EXISTS bus_drivers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bus_id INT NOT NULL,
  driver_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Data
INSERT INTO bus_stations (name, city, latitude, longitude, description) VALUES
('Colombo Central Bus Stand', 'Colombo', 6.9344, 79.8533, 'Main long-distance terminal Pettah'),
('Kandy Goodshed Bus Stand', 'Kandy', 7.2906, 80.6337, 'Primary central hill country transport hub'),
('Galle Central Bus Station', 'Galle', 6.0367, 80.2170, 'Southern coastal bus terminal'),
('Negombo Main Bus Stand', 'Negombo', 7.2088, 79.8358, 'Western province commuter hub');

INSERT INTO users (name, phone, email, password_hash, role, city) VALUES
('Nimal Perera', '0771234567', 'owner@example.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'owner', 'Colombo'),
('Kamal Silva', '0719876543', 'driver@example.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'driver', 'Kandy'),
('Sunil Fernando', '0754321987', 'passenger@example.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'passenger', 'Galle');

INSERT INTO buses (owner_id, name, number, type, route, trip_date, departure, arrival, ticket_price, rating, latitude, longitude) VALUES
(1, 'Weerawarna Express', 'WB-1024', 'Luxury AC Coach', 'Colombo to Kandy', '2026-11-12', '06:30 AM', '09:15 AM', 'LKR 1,250', 4.8, 6.9344, 79.8533),
(1, 'Intercity Star', 'IS-7781', 'Semi Luxury', 'Galle to Colombo', '2026-11-12', '07:00 AM', '09:45 AM', 'LKR 980', 4.5, 6.0367, 80.2170),
(1, 'City Shuttle', 'CS-4412', 'Standard Express', 'Negombo to Colombo', '2026-11-12', '08:20 AM', '09:10 AM', 'LKR 650', 4.2, 7.2088, 79.8358);

INSERT INTO seats (bus_id, label, is_available) VALUES
(1, '1A', 1), (1, '1B', 1), (1, '2A', 1), (1, '2B', 1), (1, '3A', 1), (1, '3B', 1), (1, '4A', 1), (1, '4B', 1),
(2, '1A', 1), (2, '1B', 1), (2, '2A', 1), (2, '2B', 1), (2, '3A', 1), (2, '3B', 1),
(3, '1A', 1), (3, '1B', 1), (3, '2A', 1), (3, '2B', 1);

INSERT INTO route_stops (bus_id, stop_name, stop_order, latitude, longitude) VALUES
(1, 'Colombo Fort', 1, 6.9344, 79.8533),
(1, 'Kadawatha Highway Interchange', 2, 7.0016, 79.9542),
(1, 'Peradeniya Junction', 3, 7.2589, 80.5975),
(1, 'Kandy Clock Tower Stand', 4, 7.2906, 80.6337);

INSERT INTO driver_turns (driver_id, bus_id, passenger_count) VALUES
(2, 1, 14);

