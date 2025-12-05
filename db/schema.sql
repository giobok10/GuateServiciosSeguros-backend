SET search_path TO public;

-- Fase C: Diseño de Datos y API
-- Este script SQL crea el esquema de la base de datos para el proyecto GuateServicios.
-- Puedes ejecutarlo directamente en DBeaver en tu base de datos de Neon.

-- 1. Tabla de Usuarios
-- Almacena tanto usuarios finales como técnicos. El rol los diferencia.
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('tech', 'user')), -- Rol: 'tech' o 'user'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Categorías
-- Almacena las categorías de servicios (Plomero, Electricista, etc.).
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 3. Tabla de Técnicos
-- Contiene el perfil público de cada técnico.
CREATE TABLE technicians (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    category_id INT NOT NULL,
    description TEXT,
    photo_url VARCHAR(255),
    whatsapp VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 4. Tabla de Servicios
-- Los servicios que cada técnico ofrece.
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    technician_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2), -- Precio del servicio
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE
);

-- 5. Tabla de Reseñas (Reviews)
-- Reseñas y calificaciones dejadas por los usuarios a los técnicos.
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    technician_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5), -- Rating de 1 a 5
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX idx_technicians_category_id ON technicians(category_id);
CREATE INDEX idx_reviews_technician_id ON reviews(technician_id);

-- Insertar algunas categorías de ejemplo (seeds)
INSERT INTO categories (name) VALUES
('Plomero'),
('Electricista'),
('Albañil'),
('Carpintero'),
('Jardinero'),
('Pintor'),
('Mecánico');

COMMIT;
