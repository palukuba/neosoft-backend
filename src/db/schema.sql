-- NEOSOFT.dev Backend Database Schema
-- Base de données SQLite pour Cloudflare D1
-- Création des tables pour toutes les fonctionnalités

-- Table Newsletter : Gestion des abonnés
CREATE TABLE IF NOT EXISTS newsletter (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table Contact : Messages du formulaire de contact
CREATE TABLE IF NOT EXISTS contact (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table Appointments : Rendez-vous avec l'équipe
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date TEXT NOT NULL,
  service TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table Orders : Commandes et devis
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_name TEXT NOT NULL,
  email TEXT NOT NULL,
  service TEXT NOT NULL,
  details TEXT,
  price REAL,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table Articles : Blog et actualités
CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  tags TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table Portfolio : Réalisations et projets
CREATE TABLE IF NOT EXISTS portfolio (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  link TEXT,
  technologies TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter(email);
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact(created_at);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON portfolio(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_featured ON portfolio(featured);
