-- ==============================================================================
-- MIGRACIÓN DE PRISMA A MARIADB + IMPLEMENTACIÓN DE RBAC
-- Este script crea todas las tablas desde cero.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLAS DE RBAC Y MULTI-TENANT (Requerimiento Paso 3)
-- ------------------------------------------------------------------------------

CREATE TABLE negocios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  tipo_negocio VARCHAR(50), -- 'pequeno', 'mediano', 'sucursales'
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  negocio_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (negocio_id) REFERENCES negocios(id)
);

CREATE TABLE permisos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(100) UNIQUE NOT NULL, -- ej: 'ventas.crear'
  descripcion VARCHAR(255)
);

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  negocio_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL, -- ej: 'Vendedor', 'Bodeguero'
  FOREIGN KEY (negocio_id) REFERENCES negocios(id)
);

CREATE TABLE rol_permisos (
  rol_id INT NOT NULL,
  permiso_id INT NOT NULL,
  PRIMARY KEY (rol_id, permiso_id),
  FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE
);

CREATE TABLE usuario_roles (
  usuario_id INT NOT NULL,
  rol_id INT NOT NULL,
  PRIMARY KEY (usuario_id, rol_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE
);


-- ------------------------------------------------------------------------------
-- 2. TABLAS DEL SISTEMA (Migradas desde Prisma)
-- Mantenemos el uso de VARCHAR(36) para UUIDs en las tablas originales
-- ------------------------------------------------------------------------------

-- CONTABILIDAD
CREATE TABLE accounts (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- CATÁLOGOS COMERCIALES
CREATE TABLE contacts (
  id VARCHAR(36) PRIMARY KEY,
  identification VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  address VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(150),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE warehouses (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  address VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(255),
  cost DECIMAL(12, 2) NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  hasIva BOOLEAN DEFAULT TRUE,
  stock INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- INVENTARIOS
CREATE TABLE inventory_transactions (
  id VARCHAR(36) PRIMARY KEY,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  type VARCHAR(20) NOT NULL, -- 'IN', 'OUT'
  quantity INT NOT NULL,
  reference VARCHAR(255),
  productId VARCHAR(36) NOT NULL,
  warehouseId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES products(id),
  FOREIGN KEY (warehouseId) REFERENCES warehouses(id)
);

-- FACTURACIÓN / SRI
CREATE TABLE establishments (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(10) NOT NULL,
  name VARCHAR(150) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE emission_points (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(10) NOT NULL,
  currentSequence INT DEFAULT 1,
  establishmentId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (establishmentId) REFERENCES establishments(id),
  UNIQUE KEY (establishmentId, code)
);

-- CAJA REGISTRADORA (Vinculada ahora a usuarios del nuevo RBAC que usan INT)
CREATE TABLE cash_register_sessions (
  id VARCHAR(36) PRIMARY KEY,
  userId INT NOT NULL,
  emissionPointId VARCHAR(36) NOT NULL,
  status VARCHAR(20) DEFAULT 'OPEN', -- 'OPEN', 'CLOSED'
  openedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  closedAt DATETIME NULL,
  initialBalance DECIMAL(12, 2) DEFAULT 0.00,
  finalBalance DECIMAL(12, 2) NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES usuarios(id),
  FOREIGN KEY (emissionPointId) REFERENCES emission_points(id)
);

-- OPERACIONES: COMPRAS Y VENTAS
CREATE TABLE purchases (
  id VARCHAR(36) PRIMARY KEY,
  purchaseNumber VARCHAR(50) UNIQUE NOT NULL,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  subtotal DECIMAL(12, 2) NOT NULL,
  ivaAmount DECIMAL(12, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  contactId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (contactId) REFERENCES contacts(id)
);

CREATE TABLE purchase_lines (
  id VARCHAR(36) PRIMARY KEY,
  purchaseId VARCHAR(36) NOT NULL,
  productId VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  unitCost DECIMAL(12, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  FOREIGN KEY (purchaseId) REFERENCES purchases(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id)
);

CREATE TABLE invoices (
  id VARCHAR(36) PRIMARY KEY,
  invoiceNumber VARCHAR(50) UNIQUE NOT NULL,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  subtotal DECIMAL(12, 2) NOT NULL,
  ivaAmount DECIMAL(12, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  paymentMethod VARCHAR(50) DEFAULT 'CASH',
  contactId VARCHAR(36) NOT NULL,
  emissionPointId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (contactId) REFERENCES contacts(id),
  FOREIGN KEY (emissionPointId) REFERENCES emission_points(id)
);

CREATE TABLE invoice_lines (
  id VARCHAR(36) PRIMARY KEY,
  invoiceId VARCHAR(36) NOT NULL,
  productId VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  unitPrice DECIMAL(12, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id)
);

-- LIBRO DIARIO
CREATE TABLE journal_entries (
  id VARCHAR(36) PRIMARY KEY,
  date DATETIME NOT NULL,
  description VARCHAR(255) NOT NULL,
  reference VARCHAR(255),
  userId INT NULL, -- Opcional, mapea a la tabla de usuarios en RBAC (INT)
  invoiceId VARCHAR(36) UNIQUE NULL,
  purchaseId VARCHAR(36) UNIQUE NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES usuarios(id),
  FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (purchaseId) REFERENCES purchases(id) ON DELETE CASCADE
);

CREATE TABLE journal_lines (
  id VARCHAR(36) PRIMARY KEY,
  journalEntryId VARCHAR(36) NOT NULL,
  accountId VARCHAR(36) NOT NULL,
  debit DECIMAL(12, 2) DEFAULT 0.00,
  credit DECIMAL(12, 2) DEFAULT 0.00,
  description VARCHAR(255),
  isDeleted BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (journalEntryId) REFERENCES journal_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (accountId) REFERENCES accounts(id)
);
