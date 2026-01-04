// TypeScript Type Definitions for Lesorce Platform

export type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  JWT_EXPIRY: string;
  OPENAI_API_KEY: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  APP_NAME: string;
  APP_URL: string;
  MARKUP_PERCENTAGE: string;
}

export type User = {
  id: number;
  email: string;
  password_hash: string;
  role: 'buyer' | 'vendor' | 'admin';
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  created_at: string;
  updated_at: string;
}

export type BuyerProfile = {
  id: number;
  user_id: number;
  company_name: string;
  company_name_ar?: string;
  tax_id: string;
  address: string;
  address_ar?: string;
  city: string;
  city_ar?: string;
  contact_person: string;
  contact_person_ar?: string;
  phone: string;
  approved_by?: number;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export type VendorProfile = {
  id: number;
  user_id: number;
  company_name: string;
  company_name_ar?: string;
  tax_id: string;
  address: string;
  address_ar?: string;
  city: string;
  city_ar?: string;
  contact_person: string;
  contact_person_ar?: string;
  phone: string;
  business_license?: string;
  categories?: string;
  approved_by?: number;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export type Category = {
  id: number;
  name: string;
  name_ar: string;
  slug: string;
  parent_id?: number;
  icon?: string;
  is_active: boolean;
  created_at: string;
}

export type Product = {
  id: number;
  category_id: number;
  sku: string;
  name: string;
  name_ar: string;
  description?: string;
  description_ar?: string;
  brand?: string;
  brand_ar?: string;
  unit: string;
  unit_ar: string;
  base_price?: number;
  moq: number;
  image_url?: string;
  specifications?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type RFQ = {
  id: number;
  rfq_number: string;
  buyer_id: number;
  buyer_profile_id: number;
  title: string;
  title_ar?: string;
  description?: string;
  delivery_address: string;
  delivery_address_ar?: string;
  required_delivery_date?: string;
  status: 'draft' | 'submitted' | 'vendor_assigned' | 'bids_received' | 'quotation_sent' | 'accepted' | 'rejected' | 'cancelled';
  upload_type?: 'manual' | 'excel' | 'pdf' | 'image';
  uploaded_file_url?: string;
  ocr_processed: boolean;
  total_items: number;
  assigned_to_admin?: number;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export type RFQItem = {
  id: number;
  rfq_id: number;
  product_id?: number;
  item_name: string;
  item_name_ar?: string;
  quantity: number;
  unit: string;
  unit_ar?: string;
  brand?: string;
  brand_ar?: string;
  specifications?: string;
  extracted_from_ocr: boolean;
  line_number?: number;
  created_at: string;
}

export type VendorBid = {
  id: number;
  rfq_id: number;
  rfq_item_id: number;
  vendor_id: number;
  vendor_profile_id: number;
  unit_price: number;
  currency: string;
  lead_time_days: number;
  moq: number;
  notes?: string;
  notes_ar?: string;
  is_selected: boolean;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export type Quotation = {
  id: number;
  quotation_number: string;
  rfq_id: number;
  buyer_id: number;
  created_by: number;
  subtotal: number;
  markup_percentage: number;
  markup_amount: number;
  tax_percentage: number;
  tax_amount: number;
  shipping_cost: number;
  total_amount: number;
  currency: string;
  valid_until?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  notes?: string;
  notes_ar?: string;
  created_at: string;
  updated_at: string;
}

export type Order = {
  id: number;
  order_number: string;
  quotation_id: number;
  buyer_id: number;
  buyer_profile_id: number;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  total_amount: number;
  currency: string;
  payment_status: 'pending' | 'paid' | 'held' | 'released' | 'refunded';
  order_status: 'pending' | 'confirmed' | 'processing' | 'vendor_po_sent' | 'inbound' | 'qa_inspection' | 'qa_approved' | 'qa_rejected' | 'ready_for_dispatch' | 'shipped' | 'delivered' | 'cancelled';
  delivery_address: string;
  delivery_address_ar?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  notes?: string;
  notes_ar?: string;
  created_at: string;
  updated_at: string;
}

export type Payment = {
  id: number;
  payment_reference: string;
  order_id: number;
  buyer_id: number;
  amount: number;
  currency: string;
  payment_method?: 'bank_transfer' | 'credit_card' | 'cash' | 'check';
  payment_status: 'pending' | 'received' | 'held' | 'released' | 'refunded';
  escrow_status: 'held' | 'released_to_vendor' | 'refunded_to_buyer';
  payment_date?: string;
  release_date?: string;
  released_by?: number;
  notes?: string;
  notes_ar?: string;
  created_at: string;
  updated_at: string;
}

export type Notification = {
  id: number;
  user_id: number;
  type: string;
  title: string;
  title_ar?: string;
  message: string;
  message_ar?: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

// Request/Response Types
export type AuthRequest = {
  email: string;
  password: string;
}

export type RegisterRequest = {
  email: string;
  password: string;
  role: 'buyer' | 'vendor';
  profile: Partial<BuyerProfile | VendorProfile>;
}

export type JWTPayload = {
  userId: number;
  email: string;
  role: string;
}

export type APIResponse<T = any> = {
  success: boolean;
  message?: string;
  message_ar?: string;
  data?: T;
  error?: string;
  error_ar?: string;
}

// UI/Translation Types
export type Language = 'en' | 'ar';

export type TranslationKey = string;

export type Translations = {
  [key: string]: {
    en: string;
    ar: string;
  };
}
