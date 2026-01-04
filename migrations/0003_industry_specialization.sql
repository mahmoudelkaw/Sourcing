-- Update categories to focus on stationery and cleaning supplies specialization
-- Phase 10: Industry Specialization - Stationery & Cleaning Supplies

-- Update main categories
UPDATE categories SET 
  name = 'Office Stationery',
  name_ar = 'قرطاسية مكتبية',
  slug = 'office-stationery',
  icon = 'pen'
WHERE id = 1;

UPDATE categories SET 
  name = 'Writing & Drawing',
  name_ar = 'الكتابة والرسم',
  slug = 'writing-drawing',
  parent_id = 1,
  icon = 'pen-fancy'
WHERE id = 3;

UPDATE categories SET 
  name = 'Professional Cleaning',
  name_ar = 'تنظيف احترافي',
  slug = 'professional-cleaning',
  icon = 'spray-can'
WHERE id = 8;

-- Add new specialized subcategories for cleaning
INSERT OR IGNORE INTO categories (id, name, name_ar, slug, parent_id, icon, is_active) VALUES 
(11, 'Surface Cleaners', 'منظفات الأسطح', 'surface-cleaners', 8, 'sparkles', 1),
(12, 'Disinfectants', 'معقمات', 'disinfectants', 8, 'shield-virus', 1),
(13, 'Floor Care', 'العناية بالأرضيات', 'floor-care', 8, 'broom', 1),
(14, 'Paper Products', 'منتجات ورقية', 'paper-hygiene', 8, 'toilet-paper', 1),
(15, 'Cleaning Tools', 'أدوات التنظيف', 'cleaning-tools', 8, 'hand-sparkles', 1);

-- Add new stationery subcategories
INSERT OR IGNORE INTO categories (id, name, name_ar, slug, parent_id, icon, is_active) VALUES 
(16, 'Filing & Organization', 'الملفات والتنظيم', 'filing-organization', 1, 'folder', 1),
(17, 'Desk Accessories', 'إكسسوارات المكتب', 'desk-accessories', 1, 'desktop', 1),
(18, 'Printing Supplies', 'مستلزمات الطباعة', 'printing-supplies', 1, 'print', 1);
