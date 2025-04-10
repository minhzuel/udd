-- First, let's add some sample variations for each product
INSERT INTO product_variations (name, value, product_id) VALUES
-- Product 1 variations
('Color', 'Red', 1),
('Size', 'Large', 1),
('Color', 'Blue', 1),
('Size', 'Medium', 1),

-- Product 2 variations
('Color', 'Black', 2),
('Size', 'Small', 2),
('Color', 'White', 2),
('Size', 'Medium', 2),

-- Product 3 variations
('Color', 'Green', 3),
('Size', 'Large', 3),
('Color', 'Yellow', 3),
('Size', 'Small', 3),

-- Product 4 variations
('Color', 'Purple', 4),
('Size', 'Medium', 4),
('Color', 'Pink', 4),
('Size', 'Large', 4);

-- Now, let's add combinations with offer prices
INSERT INTO product_variation_combinations 
(product_id, variation_id_1, variation_id_2, price, offer_price, offer_expiry, stock_quantity, image_url) 
SELECT 
    p.product_id,
    v1.id as variation_id_1,
    v2.id as variation_id_2,
    p.price * 1.1 as price, -- 10% higher than product price
    p.price * 0.9 as offer_price, -- 10% lower than product price
    CURRENT_TIMESTAMP + INTERVAL '30 days' as offer_expiry,
    FLOOR(RANDOM() * 100 + 50)::int as stock_quantity,
    p.main_image as image_url
FROM products p
CROSS JOIN product_variations v1
CROSS JOIN product_variations v2
WHERE v1.product_id = p.id 
AND v2.product_id = p.id
AND v1.name = 'Color'
AND v2.name = 'Size'
AND v1.id < v2.id
LIMIT 2; 