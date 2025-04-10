-- Create user roles
INSERT INTO "UserRole" (id, slug, name, description, "isProtected", "isDefault", "createdAt", "isTrashed")
VALUES 
  (gen_random_uuid(), 'admin', 'Administrator', 'Administrator role with full access', true, false, CURRENT_TIMESTAMP, false),
  (gen_random_uuid(), 'customer', 'Customer', 'Regular customer role', true, true, CURRENT_TIMESTAMP, false);

-- Get admin role ID for reference
DO $$
DECLARE
  admin_role_id uuid;
BEGIN
  SELECT id INTO admin_role_id FROM "UserRole" WHERE slug = 'admin';

  -- Create admin user
  INSERT INTO "User" (id, email, password, name, "roleId", status, "createdAt", "updatedAt", "isTrashed", "isProtected")
  VALUES (
    gen_random_uuid(),
    'admin@example.com',
    '$2a$10$hACwQ5WFX0CJzFZDyJaFMu/hvW/MNC72v.GlKsAJjlSfcjsswxsIO', -- bcrypt hash for 'admin123'
    'Admin User',
    admin_role_id,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    false,
    true
  );

  -- Get admin user ID for reference
  DECLARE
    admin_user_id uuid;
  BEGIN
    SELECT id INTO admin_user_id FROM "User" WHERE email = 'admin@example.com';

    -- Create categories
    INSERT INTO "EcommerceCategory" (id, name, slug, description, "createdByUserId", status, "createdAt", "isTrashed", image)
    VALUES 
      (gen_random_uuid(), 'Electronics', 'electronics', 'Electronic devices and accessories', admin_user_id, 'ACTIVE', CURRENT_TIMESTAMP, false, '/@placeholder.png'),
      (gen_random_uuid(), 'Clothing', 'clothing', 'Apparel and fashion items', admin_user_id, 'ACTIVE', CURRENT_TIMESTAMP, false, '/@placeholder.png'),
      (gen_random_uuid(), 'Home & Kitchen', 'home-kitchen', 'Home goods and kitchen accessories', admin_user_id, 'ACTIVE', CURRENT_TIMESTAMP, false, '/@placeholder.png'),
      (gen_random_uuid(), 'Books', 'books', 'Books and reading materials', admin_user_id, 'ACTIVE', CURRENT_TIMESTAMP, false, '/@placeholder.png');

    -- Create products for Electronics category
    DECLARE
      electronics_id uuid;
    BEGIN
      SELECT id INTO electronics_id FROM "EcommerceCategory" WHERE slug = 'electronics';
      
      INSERT INTO "EcommerceProduct" (id, name, sku, description, price, "stockValue", status, thumbnail, "categoryId", "createdByUserId", "createdAt", "isTrashed")
      VALUES 
        (gen_random_uuid(), 'Smartphone X', 'SMRTX001', 'Latest smartphone with advanced features', 799.99, 50, 'PUBLISHED', 'https://picsum.photos/seed/phone1/400/400', electronics_id, admin_user_id, CURRENT_TIMESTAMP, false),
        (gen_random_uuid(), 'Laptop Pro', 'LPTP001', 'Professional laptop for work and entertainment', 1299.99, 30, 'PUBLISHED', 'https://picsum.photos/seed/laptop1/400/400', electronics_id, admin_user_id, CURRENT_TIMESTAMP, false);
    END;

    -- Create products for Clothing category
    DECLARE
      clothing_id uuid;
    BEGIN
      SELECT id INTO clothing_id FROM "EcommerceCategory" WHERE slug = 'clothing';
      
      INSERT INTO "EcommerceProduct" (id, name, sku, description, price, "stockValue", status, thumbnail, "categoryId", "createdByUserId", "createdAt", "isTrashed")
      VALUES 
        (gen_random_uuid(), 'Classic T-Shirt', 'TSHRT001', 'Comfortable cotton t-shirt', 19.99, 100, 'PUBLISHED', 'https://picsum.photos/seed/tshirt1/400/400', clothing_id, admin_user_id, CURRENT_TIMESTAMP, false),
        (gen_random_uuid(), 'Denim Jeans', 'JEANS001', 'Stylish denim jeans for all occasions', 49.99, 75, 'PUBLISHED', 'https://picsum.photos/seed/jeans1/400/400', clothing_id, admin_user_id, CURRENT_TIMESTAMP, false);
    END;
  END;
END $$; 