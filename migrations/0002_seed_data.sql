-- Seed Data for Development and Testing

-- ============================================
-- SEED: Admin User
-- ============================================
-- Password: admin123 (bcrypt hash)
INSERT OR IGNORE INTO users (id, email, password_hash, role, status) VALUES 
(1, 'admin@sourssing.com', '$2a$10$rN8lZ3KGd4kF.HxV2pL8g.YQPDxVkJqZJ7yXKx9vKJxY8fZ0K0K0K', 'admin', 'active');

-- ============================================
-- SEED: Categories (Bilingual)
-- ============================================
INSERT OR IGNORE INTO categories (id, name, name_ar, slug, parent_id, icon, is_active) VALUES 
(1, 'Office Supplies', 'مستلزمات مكتبية', 'office-supplies', NULL, 'briefcase', 1),
(2, 'Paper Products', 'منتجات ورقية', 'paper-products', 1, 'file-text', 1),
(3, 'Writing Instruments', 'أدوات الكتابة', 'writing-instruments', 1, 'edit', 1),
(4, 'Electronics', 'إلكترونيات', 'electronics', NULL, 'cpu', 1),
(5, 'Computers & Accessories', 'أجهزة كمبيوتر وملحقاتها', 'computers-accessories', 4, 'monitor', 1),
(6, 'Furniture', 'أثاث', 'furniture', NULL, 'home', 1),
(7, 'Office Furniture', 'أثاث مكتبي', 'office-furniture', 6, 'inbox', 1),
(8, 'Cleaning Supplies', 'مستلزمات التنظيف', 'cleaning-supplies', NULL, 'droplet', 1),
(9, 'Pantry & Kitchen', 'مخزن ومطبخ', 'pantry-kitchen', NULL, 'coffee', 1),
(10, 'Safety Equipment', 'معدات السلامة', 'safety-equipment', NULL, 'shield', 1);

-- ============================================
-- SEED: Products (Top 50 Most Requested Items in Egypt)
-- ============================================
INSERT OR IGNORE INTO products (sku, category_id, name, name_ar, description, description_ar, brand, brand_ar, unit, unit_ar, base_price, moq, is_active) VALUES 
-- Paper Products
('PAPER-A4-80GSM', 2, 'A4 Copy Paper 80gsm', 'ورق طباعة A4 وزن 80 جرام', 'Premium quality white copy paper', 'ورق طباعة أبيض عالي الجودة', 'Double A', 'دبل إيه', 'ream', 'رزمة', 150.00, 10, 1),
('PAPER-A4-70GSM', 2, 'A4 Copy Paper 70gsm', 'ورق طباعة A4 وزن 70 جرام', 'Standard white copy paper', 'ورق طباعة أبيض قياسي', 'IK Plus', 'آي كيه بلس', 'ream', 'رزمة', 120.00, 10, 1),
('PAPER-A3-80GSM', 2, 'A3 Copy Paper 80gsm', 'ورق طباعة A3 وزن 80 جرام', 'Large format copy paper', 'ورق طباعة مقاس كبير', 'Double A', 'دبل إيه', 'ream', 'رزمة', 280.00, 5, 1),

-- Writing Instruments
('PEN-BLUE-BALL', 3, 'Blue Ballpoint Pen', 'قلم حبر أزرق', 'Smooth writing ballpoint pen', 'قلم حبر ناعم للكتابة', 'BIC', 'بيك', 'piece', 'قطعة', 3.50, 100, 1),
('PEN-BLACK-BALL', 3, 'Black Ballpoint Pen', 'قلم حبر أسود', 'Smooth writing ballpoint pen', 'قلم حبر ناعم للكتابة', 'BIC', 'بيك', 'piece', 'قطعة', 3.50, 100, 1),
('PENCIL-HB', 3, 'HB Pencil', 'قلم رصاص HB', 'Standard graphite pencil', 'قلم رصاص جرافيت قياسي', 'Faber-Castell', 'فابر كاستل', 'piece', 'قطعة', 2.50, 100, 1),
('MARKER-PERM-BLACK', 3, 'Black Permanent Marker', 'قلم تحديد دائم أسود', 'Waterproof permanent marker', 'قلم تحديد دائم ضد الماء', 'Sharpie', 'شاربي', 'piece', 'قطعة', 15.00, 50, 1),
('HIGHLIGHTER-YELLOW', 3, 'Yellow Highlighter', 'قلم تحديد أصفر', 'Fluorescent highlighter pen', 'قلم تحديد فلوريسنت', 'Stabilo', 'ستابيلو', 'piece', 'قطعة', 12.00, 50, 1),

-- Office Supplies
('STAPLER-SMALL', 1, 'Small Stapler', 'دباسة صغيرة', 'Desktop stapler for 20 sheets', 'دباسة مكتب لـ 20 ورقة', 'Deli', 'ديلي', 'piece', 'قطعة', 45.00, 10, 1),
('STAPLES-24-6', 1, 'Staples 24/6', 'دبابيس 24/6', 'Standard staples box 1000pcs', 'علبة دبابيس قياسية 1000 قطعة', 'Deli', 'ديلي', 'box', 'علبة', 8.00, 50, 1),
('PAPERCLIPS-50MM', 1, 'Paper Clips 50mm', 'مشابك ورق 50 ملم', 'Metal paper clips box 100pcs', 'مشابك ورق معدنية علبة 100 قطعة', 'Generic', 'عام', 'box', 'علبة', 12.00, 20, 1),
('BINDER-CLIPS-19MM', 1, 'Binder Clips 19mm', 'مشابك حديد 19 ملم', 'Black binder clips box 12pcs', 'مشابك حديد سوداء علبة 12 قطعة', 'Deli', 'ديلي', 'box', 'علبة', 15.00, 20, 1),
('FOLDER-PLASTIC', 1, 'Plastic File Folder', 'ملف بلاستيك', 'A4 transparent plastic folder', 'ملف بلاستيك شفاف A4', 'Faber-Castell', 'فابر كاستل', 'piece', 'قطعة', 8.00, 50, 1),
('NOTEBOOK-A4-100', 1, 'A4 Notebook 100 Sheets', 'دفتر A4 100 ورقة', 'Spiral bound notebook', 'دفتر سلك حلزوني', 'Nile', 'النيل', 'piece', 'قطعة', 35.00, 20, 1),
('STICKY-NOTES-3X3', 1, 'Sticky Notes 3x3 inch', 'ملاحظات لاصقة 3×3 بوصة', 'Yellow sticky notes pad 100 sheets', 'ورق ملاحظات لاصق أصفر 100 ورقة', 'Post-it', 'بوست-إت', 'pad', 'دفترة', 25.00, 20, 1),
('ENVELOPE-A4', 1, 'A4 Envelope', 'مظروف A4', 'White paper envelope', 'مظروف ورقي أبيض', 'Generic', 'عام', 'piece', 'قطعة', 2.50, 100, 1),
('CALCULATOR-BASIC', 1, 'Basic Calculator', 'آلة حاسبة أساسية', '12-digit desktop calculator', 'آلة حاسبة مكتبية 12 رقم', 'Casio', 'كاسيو', 'piece', 'قطعة', 120.00, 5, 1),
('SCISSORS-OFFICE', 1, 'Office Scissors 7 inch', 'مقص مكتب 7 بوصة', 'Stainless steel scissors', 'مقص ستانلس ستيل', 'Fiskars', 'فيسكارس', 'piece', 'قطعة', 55.00, 10, 1),
('TAPE-CLEAR', 1, 'Clear Scotch Tape', 'شريط لاصق شفاف', 'Transparent adhesive tape 18mm', 'شريط لاصق شفاف 18 ملم', '3M', '3 إم', 'roll', 'رول', 15.00, 20, 1),
('GLUE-STICK', 1, 'Glue Stick 21g', 'صمغ عصا 21 جرام', 'Non-toxic glue stick', 'صمغ عصا غير سام', 'Pritt', 'بريت', 'piece', 'قطعة', 12.00, 20, 1),
('CORRECTION-TAPE', 1, 'Correction Tape', 'شريط تصحيح', 'White correction tape 5mm', 'شريط تصحيح أبيض 5 ملم', 'Deli', 'ديلي', 'piece', 'قطعة', 18.00, 20, 1),

-- Electronics & IT
('USB-FLASH-32GB', 5, 'USB Flash Drive 32GB', 'فلاشة 32 جيجا', 'USB 3.0 flash drive', 'فلاشة يو إس بي 3.0', 'SanDisk', 'ساندسك', 'piece', 'قطعة', 180.00, 10, 1),
('USB-FLASH-64GB', 5, 'USB Flash Drive 64GB', 'فلاشة 64 جيجا', 'USB 3.0 flash drive', 'فلاشة يو إس بي 3.0', 'SanDisk', 'ساندسك', 'piece', 'قطعة', 320.00, 10, 1),
('MOUSE-WIRELESS', 5, 'Wireless Mouse', 'ماوس لاسلكي', '2.4GHz wireless optical mouse', 'ماوس ضوئي لاسلكي', 'Logitech', 'لوجيتك', 'piece', 'قطعة', 280.00, 5, 1),
('KEYBOARD-USB', 5, 'USB Keyboard', 'كيبورد يو إس بي', 'Standard wired keyboard', 'كيبورد سلكي قياسي', 'Logitech', 'لوجيتك', 'piece', 'قطعة', 350.00, 5, 1),
('HDMI-CABLE-2M', 5, 'HDMI Cable 2 meters', 'كابل HDMI 2 متر', 'High speed HDMI cable', 'كابل HDMI عالي السرعة', 'Belkin', 'بيلكن', 'piece', 'قطعة', 120.00, 10, 1),
('ETHERNET-CABLE-5M', 5, 'Ethernet Cable 5 meters', 'كابل إنترنت 5 متر', 'Cat6 network cable', 'كابل شبكة Cat6', 'D-Link', 'دي-لينك', 'piece', 'قطعة', 85.00, 10, 1),
('POWER-STRIP-6OUT', 5, 'Power Strip 6 Outlets', 'وصلة كهرباء 6 مخرج', 'Surge protected power strip', 'وصلة كهرباء محمية', 'APC', 'أي بي سي', 'piece', 'قطعة', 250.00, 5, 1),
('LAPTOP-BAG-15', 5, 'Laptop Bag 15 inch', 'شنطة لابتوب 15 بوصة', 'Padded laptop carrying case', 'حقيبة لابتوب مبطنة', 'Targus', 'تارجوس', 'piece', 'قطعة', 450.00, 5, 1),

-- Furniture
('CHAIR-OFFICE-MESH', 7, 'Office Chair Mesh Back', 'كرسي مكتب شبكي', 'Ergonomic mesh office chair', 'كرسي مكتب شبكي مريح', 'Office Star', 'أوفيس ستار', 'piece', 'قطعة', 2500.00, 1, 1),
('DESK-120X60', 7, 'Office Desk 120x60cm', 'مكتب مكتبي 120×60 سم', 'Modern office desk with drawers', 'مكتب مكتبي حديث بأدراج', 'IKEA', 'إيكيا', 'piece', 'قطعة', 3500.00, 1, 1),
('FILING-CABINET-4D', 7, 'Filing Cabinet 4 Drawer', 'خزانة ملفات 4 أدراج', 'Metal filing cabinet', 'خزانة ملفات معدنية', 'Generic', 'عام', 'piece', 'قطعة', 2800.00, 1, 1),
('BOOKSHELF-5TIER', 7, 'Bookshelf 5 Tier', 'رف كتب 5 طبقات', 'Wooden bookshelf', 'رف كتب خشبي', 'Generic', 'عام', 'piece', 'قطعة', 1500.00, 1, 1),
('WHITEBOARD-90X120', 7, 'Whiteboard 90x120cm', 'سبورة بيضاء 90×120 سم', 'Magnetic dry erase whiteboard', 'سبورة بيضاء مغناطيسية', 'Generic', 'عام', 'piece', 'قطعة', 850.00, 1, 1),

-- Cleaning Supplies
('DETERGENT-LIQUID-5L', 8, 'Liquid Detergent 5 Liters', 'منظف سائل 5 لتر', 'Multi-purpose liquid detergent', 'منظف سائل متعدد الأغراض', 'Tide', 'تايد', 'bottle', 'زجاجة', 180.00, 4, 1),
('DISINFECTANT-SPRAY', 8, 'Disinfectant Spray 500ml', 'بخاخ معقم 500 مل', 'Antibacterial surface spray', 'بخاخ معقم للأسطح', 'Dettol', 'ديتول', 'bottle', 'زجاجة', 85.00, 12, 1),
('FLOOR-CLEANER-4L', 8, 'Floor Cleaner 4 Liters', 'منظف أرضيات 4 لتر', 'Concentrated floor cleaner', 'منظف أرضيات مركز', 'Flash', 'فلاش', 'bottle', 'زجاجة', 120.00, 4, 1),
('PAPER-TOWELS-2PLY', 8, 'Paper Towels 2-Ply Roll', 'مناشف ورقية طبقتين', 'Absorbent paper towels', 'مناشف ورقية ماصة', 'Regina', 'ريجينا', 'roll', 'رول', 25.00, 24, 1),
('TOILET-PAPER-4ROLL', 8, 'Toilet Paper 4 Roll Pack', 'ورق تواليت 4 رول', 'Soft toilet tissue 3-ply', 'ورق تواليت ناعم 3 طبقات', 'Fine', 'فاين', 'pack', 'عبوة', 45.00, 10, 1),
('GARBAGE-BAGS-50L', 8, 'Garbage Bags 50 Liters', 'أكياس قمامة 50 لتر', 'Heavy duty trash bags pack 20', 'أكياس قمامة قوية عبوة 20', 'Fino', 'فينو', 'pack', 'عبوة', 35.00, 10, 1),
('SPONGE-SCRUB', 8, 'Scrubbing Sponge', 'إسفنجة تنظيف', 'Kitchen scrub sponge', 'إسفنجة تنظيف مطبخ', 'Scotch-Brite', 'سكوتش-برايت', 'piece', 'قطعة', 8.00, 50, 1),
('MOP-MICROFIBER', 8, 'Microfiber Mop', 'ممسحة ميكروفايبر', 'Flat microfiber floor mop', 'ممسحة أرضيات ميكروفايبر', 'Vileda', 'فيليدا', 'piece', 'قطعة', 180.00, 5, 1),
('BROOM-PLASTIC', 8, 'Plastic Broom', 'مكنسة بلاستيك', 'Heavy duty floor broom', 'مكنسة أرضيات قوية', 'Generic', 'عام', 'piece', 'قطعة', 45.00, 10, 1),

-- Pantry & Kitchen
('WATER-BOTTLE-15L', 9, 'Water Bottle 15 Liters', 'جالون ماء 15 لتر', 'Purified drinking water', 'مياه شرب نقية', 'Nestlé', 'نستله', 'bottle', 'جالون', 18.00, 10, 1),
('COFFEE-ARABICA-500G', 9, 'Arabica Coffee 500g', 'قهوة عربية 500 جرام', 'Premium arabica coffee beans', 'حبوب قهوة عربية فاخرة', 'Lavazza', 'لافازا', 'pack', 'عبوة', 280.00, 6, 1),
('TEA-BAGS-100PCS', 9, 'Tea Bags 100 pieces', 'أكياس شاي 100 قطعة', 'Black tea bags', 'أكياس شاي أسود', 'Lipton', 'ليبتون', 'box', 'علبة', 85.00, 12, 1),
('SUGAR-WHITE-1KG', 9, 'White Sugar 1kg', 'سكر أبيض 1 كيلو', 'Refined white sugar', 'سكر أبيض مكرر', 'Generic', 'عام', 'pack', 'عبوة', 28.00, 20, 1),
('INSTANT-NOODLES', 9, 'Instant Noodles Cup', 'نودلز فورية', 'Quick meal noodles', 'نودلز وجبة سريعة', 'Indomie', 'إندومي', 'piece', 'قطعة', 8.50, 48, 1),
('PAPER-CUPS-50PCS', 9, 'Paper Cups 50 pieces', 'أكواب ورقية 50 قطعة', 'Disposable paper cups 200ml', 'أكواب ورقية يمكن التخلص منها', 'Generic', 'عام', 'pack', 'عبوة', 35.00, 10, 1),
('PLASTIC-SPOONS-50', 9, 'Plastic Spoons 50pcs', 'معالق بلاستيك 50 قطعة', 'Disposable plastic spoons', 'معالق بلاستيك يمكن التخلص منها', 'Generic', 'عام', 'pack', 'عبوة', 18.00, 20, 1);

-- ============================================
-- SEED: Test Buyer User
-- ============================================
-- Password: buyer123
INSERT OR IGNORE INTO users (id, email, password_hash, role, status) VALUES 
(2, 'buyer@company.com', '$2a$10$rN8lZ3KGd4kF.HxV2pL8g.YQPDxVkJqZJ7yXKx9vKJxY8fZ0K0K0K', 'buyer', 'active');

INSERT OR IGNORE INTO buyer_profiles (user_id, company_name, company_name_ar, tax_id, address, address_ar, city, city_ar, contact_person, contact_person_ar, phone, approved_by, approved_at) VALUES 
(2, 'ABC Trading Company', 'شركة ABC للتجارة', '123-456-789', '123 Main Street, Nasr City', '123 شارع رئيسي، مدينة نصر', 'Cairo', 'القاهرة', 'Ahmed Hassan', 'أحمد حسن', '+201234567890', 1, datetime('now'));

-- ============================================
-- SEED: Test Vendor User
-- ============================================
-- Password: vendor123
INSERT OR IGNORE INTO users (id, email, password_hash, role, status) VALUES 
(3, 'vendor@supplier.com', '$2a$10$rN8lZ3KGd4kF.HxV2pL8g.YQPDxVkJqZJ7yXKx9vKJxY8fZ0K0K0K', 'vendor', 'active');

INSERT OR IGNORE INTO vendor_profiles (user_id, company_name, company_name_ar, tax_id, address, address_ar, city, city_ar, contact_person, contact_person_ar, phone, categories, approved_by, approved_at) VALUES 
(3, 'XYZ Supplies Ltd', 'شركة XYZ للتوريدات المحدودة', '987-654-321', '456 Industrial Zone, 10th of Ramadan', '456 المنطقة الصناعية، العاشر من رمضان', '10th of Ramadan City', 'مدينة العاشر من رمضان', 'Mohamed Ali', 'محمد علي', '+201098765432', '["office-supplies", "electronics"]', 1, datetime('now'));
