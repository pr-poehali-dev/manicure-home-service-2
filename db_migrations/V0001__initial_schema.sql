
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    role VARCHAR(20) DEFAULT 'user',
    token VARCHAR(255),
    lang VARCHAR(10) DEFAULT 'ru',
    theme VARCHAR(10) DEFAULT 'dark',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON UPDATE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    price DECIMAL(10,2) NOT NULL,
    photos TEXT DEFAULT '[]',
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE service_slots (
    id SERIAL PRIMARY KEY,
    service_id INT REFERENCES services(id) ON UPDATE CASCADE,
    slot_date DATE NOT NULL,
    slot_time VARCHAR(10) NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    service_id INT REFERENCES services(id) ON UPDATE CASCADE,
    slot_id INT REFERENCES service_slots(id) ON UPDATE CASCADE,
    user_id INT REFERENCES users(id) ON UPDATE CASCADE,
    name VARCHAR(255) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    email VARCHAR(255) DEFAULT '',
    age INT,
    comment TEXT DEFAULT '',
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    cover_url TEXT DEFAULT '',
    end_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON UPDATE CASCADE,
    sender_role VARCHAR(20) NOT NULL DEFAULT 'user',
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON UPDATE CASCADE,
    service_id INT REFERENCES services(id) ON UPDATE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, service_id)
);

INSERT INTO users (email, password_hash, name, role) 
VALUES ('admin@moninov.ru', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'Даша', 'admin');

INSERT INTO categories (name, is_default, sort_order) VALUES ('Все товары', TRUE, 0);
