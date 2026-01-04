-- Lesorce B2B Marketplace - Complete Database Schema
-- Phase 1: Core Tables

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

-- Users table with role-based access
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('buyer', 'vendor', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'suspended', 'rejected')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- BUYER PROFILES
-- ============================================

CREATE TABLE IF NOT EXISTS buyer_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  company_name_ar TEXT,
  tax_id TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  address_ar TEXT,
  city TEXT NOT NULL,
  city_ar TEXT,
  contact_person TEXT NOT NULL,
  contact_person_ar TEXT,
  phone TEXT NOT NULL,
  approved_by INTEGER,
  approved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- ============================================
-- VENDOR PROFILES
-- ============================================

CREATE TABLE IF NOT EXISTS vendor_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  company_name_ar TEXT,
  tax_id TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  address_ar TEXT,
  city TEXT NOT NULL,
  city_ar TEXT,
  contact_person TEXT NOT NULL,
  contact_person_ar TEXT,
  phone TEXT NOT NULL,
  business_license TEXT,
  categories TEXT, -- JSON array of categories
  approved_by INTEGER,
  approved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- ============================================
-- PRODUCT CATALOG
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id INTEGER,
  icon TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  brand TEXT,
  brand_ar TEXT,
  unit TEXT NOT NULL, -- piece, box, kg, liter, etc.
  unit_ar TEXT NOT NULL,
  base_price REAL,
  moq INTEGER DEFAULT 1,
  image_url TEXT,
  specifications TEXT, -- JSON object
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- ============================================
-- RFQ (REQUEST FOR QUOTATION) SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS rfqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rfq_number TEXT UNIQUE NOT NULL,
  buyer_id INTEGER NOT NULL,
  buyer_profile_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT,
  delivery_address TEXT NOT NULL,
  delivery_address_ar TEXT,
  required_delivery_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'submitted', 'vendor_assigned', 'bids_received', 'quotation_sent', 'accepted', 'rejected', 'cancelled')),
  upload_type TEXT CHECK(upload_type IN ('manual', 'excel', 'pdf', 'image')),
  uploaded_file_url TEXT,
  ocr_processed BOOLEAN DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  assigned_to_admin INTEGER,
  submitted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_profile_id) REFERENCES buyer_profiles(id),
  FOREIGN KEY (assigned_to_admin) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS rfq_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rfq_id INTEGER NOT NULL,
  product_id INTEGER,
  item_name TEXT NOT NULL,
  item_name_ar TEXT,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  unit_ar TEXT,
  brand TEXT,
  brand_ar TEXT,
  specifications TEXT, -- JSON object
  extracted_from_ocr BOOLEAN DEFAULT 0,
  line_number INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ============================================
-- VENDOR BIDDING SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS rfq_vendor_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rfq_id INTEGER NOT NULL,
  vendor_id INTEGER NOT NULL,
  vendor_profile_id INTEGER NOT NULL,
  assigned_by INTEGER NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'viewed', 'bid_submitted', 'declined')),
  FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE,
  FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (vendor_profile_id) REFERENCES vendor_profiles(id),
  FOREIGN KEY (assigned_by) REFERENCES users(id),
  UNIQUE(rfq_id, vendor_id)
);

CREATE TABLE IF NOT EXISTS vendor_bids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rfq_id INTEGER NOT NULL,
  rfq_item_id INTEGER NOT NULL,
  vendor_id INTEGER NOT NULL,
  vendor_profile_id INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  currency TEXT DEFAULT 'EGP',
  lead_time_days INTEGER NOT NULL,
  moq INTEGER DEFAULT 1,
  notes TEXT,
  notes_ar TEXT,
  is_selected BOOLEAN DEFAULT 0,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE,
  FOREIGN KEY (rfq_item_id) REFERENCES rfq_items(id) ON DELETE CASCADE,
  FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (vendor_profile_id) REFERENCES vendor_profiles(id)
);

-- ============================================
-- QUOTATIONS (SENT TO BUYERS)
-- ============================================

CREATE TABLE IF NOT EXISTS quotations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quotation_number TEXT UNIQUE NOT NULL,
  rfq_id INTEGER NOT NULL,
  buyer_id INTEGER NOT NULL,
  created_by INTEGER NOT NULL,
  subtotal REAL NOT NULL,
  markup_percentage REAL DEFAULT 7.0,
  markup_amount REAL NOT NULL,
  tax_percentage REAL DEFAULT 0,
  tax_amount REAL DEFAULT 0,
  shipping_cost REAL DEFAULT 0,
  total_amount REAL NOT NULL,
  currency TEXT DEFAULT 'EGP',
  valid_until DATE,
  status TEXT DEFAULT 'sent' CHECK(status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  notes TEXT,
  notes_ar TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rfq_id) REFERENCES rfqs(id),
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS quotation_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quotation_id INTEGER NOT NULL,
  rfq_item_id INTEGER NOT NULL,
  vendor_bid_id INTEGER,
  item_name TEXT NOT NULL,
  item_name_ar TEXT,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  unit_ar TEXT,
  unit_price REAL NOT NULL,
  vendor_cost REAL NOT NULL,
  markup_amount REAL NOT NULL,
  total_price REAL NOT NULL,
  lead_time_days INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
  FOREIGN KEY (rfq_item_id) REFERENCES rfq_items(id),
  FOREIGN KEY (vendor_bid_id) REFERENCES vendor_bids(id)
);

-- ============================================
-- ORDERS & ORDER MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE NOT NULL,
  quotation_id INTEGER NOT NULL,
  buyer_id INTEGER NOT NULL,
  buyer_profile_id INTEGER NOT NULL,
  subtotal REAL NOT NULL,
  tax_amount REAL DEFAULT 0,
  shipping_cost REAL DEFAULT 0,
  total_amount REAL NOT NULL,
  currency TEXT DEFAULT 'EGP',
  payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'held', 'released', 'refunded')),
  order_status TEXT DEFAULT 'pending' CHECK(order_status IN ('pending', 'confirmed', 'processing', 'vendor_po_sent', 'inbound', 'qa_inspection', 'qa_approved', 'qa_rejected', 'ready_for_dispatch', 'shipped', 'delivered', 'cancelled')),
  delivery_address TEXT NOT NULL,
  delivery_address_ar TEXT,
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  notes TEXT,
  notes_ar TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quotation_id) REFERENCES quotations(id),
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (buyer_profile_id) REFERENCES buyer_profiles(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  quotation_item_id INTEGER NOT NULL,
  vendor_bid_id INTEGER,
  item_name TEXT NOT NULL,
  item_name_ar TEXT,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  unit_ar TEXT,
  unit_price REAL NOT NULL,
  total_price REAL NOT NULL,
  vendor_cost REAL NOT NULL,
  vendor_id INTEGER,
  vendor_profile_id INTEGER,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'vendor_confirmed', 'inbound', 'qa_passed', 'qa_failed', 'ready', 'shipped', 'delivered')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (quotation_item_id) REFERENCES quotation_items(id),
  FOREIGN KEY (vendor_bid_id) REFERENCES vendor_bids(id),
  FOREIGN KEY (vendor_id) REFERENCES users(id),
  FOREIGN KEY (vendor_profile_id) REFERENCES vendor_profiles(id)
);

-- ============================================
-- VENDOR PURCHASE ORDERS
-- ============================================

CREATE TABLE IF NOT EXISTS vendor_purchase_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  po_number TEXT UNIQUE NOT NULL,
  order_id INTEGER NOT NULL,
  vendor_id INTEGER NOT NULL,
  vendor_profile_id INTEGER NOT NULL,
  subtotal REAL NOT NULL,
  currency TEXT DEFAULT 'EGP',
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'confirmed', 'shipped', 'received', 'cancelled')),
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  notes TEXT,
  notes_ar TEXT,
  created_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (vendor_id) REFERENCES users(id),
  FOREIGN KEY (vendor_profile_id) REFERENCES vendor_profiles(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS vendor_po_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  po_id INTEGER NOT NULL,
  order_item_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  item_name_ar TEXT,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  unit_ar TEXT,
  unit_price REAL NOT NULL,
  total_price REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (po_id) REFERENCES vendor_purchase_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id)
);

-- ============================================
-- QUALITY ASSURANCE
-- ============================================

CREATE TABLE IF NOT EXISTS qa_inspections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  order_item_id INTEGER,
  inspector_id INTEGER NOT NULL,
  inspection_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'passed', 'failed', 'partial')),
  notes TEXT,
  notes_ar TEXT,
  passed_quantity REAL,
  failed_quantity REAL,
  images TEXT, -- JSON array of image URLs
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (order_item_id) REFERENCES order_items(id),
  FOREIGN KEY (inspector_id) REFERENCES users(id)
);

-- ============================================
-- PAYMENTS & ESCROW
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payment_reference TEXT UNIQUE NOT NULL,
  order_id INTEGER NOT NULL,
  buyer_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'EGP',
  payment_method TEXT CHECK(payment_method IN ('bank_transfer', 'credit_card', 'cash', 'check')),
  payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'received', 'held', 'released', 'refunded')),
  escrow_status TEXT DEFAULT 'held' CHECK(escrow_status IN ('held', 'released_to_vendor', 'refunded_to_buyer')),
  payment_date DATETIME,
  release_date DATETIME,
  released_by INTEGER,
  notes TEXT,
  notes_ar TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (released_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS vendor_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payment_reference TEXT UNIQUE NOT NULL,
  vendor_po_id INTEGER NOT NULL,
  vendor_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'EGP',
  payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'processed', 'completed', 'failed')),
  payment_method TEXT,
  payment_date DATETIME,
  processed_by INTEGER,
  notes TEXT,
  notes_ar TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_po_id) REFERENCES vendor_purchase_orders(id),
  FOREIGN KEY (vendor_id) REFERENCES users(id),
  FOREIGN KEY (processed_by) REFERENCES users(id)
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  title_ar TEXT,
  message TEXT NOT NULL,
  message_ar TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- BUY AGAIN / REORDER TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS reorder_predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  buyer_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  last_order_date DATE NOT NULL,
  average_order_interval_days INTEGER,
  predicted_reorder_date DATE,
  confidence_score REAL,
  is_notified BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  UNIQUE(buyer_id, product_id)
);

-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  old_values TEXT, -- JSON
  new_values TEXT, -- JSON
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE INDEX IF NOT EXISTS idx_buyer_profiles_user_id ON buyer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_buyer_profiles_tax_id ON buyer_profiles(tax_id);

CREATE INDEX IF NOT EXISTS idx_vendor_profiles_user_id ON vendor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_tax_id ON vendor_profiles(tax_id);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

CREATE INDEX IF NOT EXISTS idx_rfqs_buyer_id ON rfqs(buyer_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_rfq_number ON rfqs(rfq_number);

CREATE INDEX IF NOT EXISTS idx_rfq_items_rfq_id ON rfq_items(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_items_product_id ON rfq_items(product_id);

CREATE INDEX IF NOT EXISTS idx_vendor_bids_rfq_id ON vendor_bids(rfq_id);
CREATE INDEX IF NOT EXISTS idx_vendor_bids_vendor_id ON vendor_bids(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_bids_is_selected ON vendor_bids(is_selected);

CREATE INDEX IF NOT EXISTS idx_quotations_rfq_id ON quotations(rfq_id);
CREATE INDEX IF NOT EXISTS idx_quotations_buyer_id ON quotations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);

CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_vendor_id ON order_items(vendor_id);

CREATE INDEX IF NOT EXISTS idx_vendor_pos_vendor_id ON vendor_purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_pos_order_id ON vendor_purchase_orders(order_id);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_buyer_id ON payments(buyer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
