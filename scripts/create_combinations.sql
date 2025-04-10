-- Create combinations from existing variations
WITH product_variations AS (
  SELECT 
    p.product_id,
    p.price,
    p.main_image,
    v.variation_id,
    v.variation_name,
    v.variation_value
  FROM products p
  CROSS JOIN product_variations v
),
size_variations AS (
  SELECT * FROM product_variations WHERE variation_name = 'Size'
),
color_variations AS (
  SELECT * FROM product_variations WHERE variation_name = 'Color'
),
material_variations AS (
  SELECT * FROM product_variations WHERE variation_name = 'Material'
)
INSERT INTO product_variation_combinations 
(product_id, variation_id_1, variation_id_2, variation_id_3, price, offer_price, offer_expiry, stock_quantity, image_url)
SELECT 
  p.product_id,
  s.variation_id as variation_id_1,
  c.variation_id as variation_id_2,
  m.variation_id as variation_id_3,
  p.price * 
    CASE 
      WHEN s.variation_value = 'Large' THEN 1.2
      WHEN s.variation_value = 'Medium' THEN 1.1
      ELSE 1.0
    END *
    CASE 
      WHEN m.variation_value = 'Silk' THEN 1.3
      WHEN m.variation_value = 'Cotton' THEN 1.1
      ELSE 1.0
    END as price,
  p.price * 
    CASE 
      WHEN s.variation_value = 'Large' THEN 1.1
      WHEN s.variation_value = 'Medium' THEN 1.0
      ELSE 0.9
    END *
    CASE 
      WHEN m.variation_value = 'Silk' THEN 1.2
      WHEN m.variation_value = 'Cotton' THEN 1.0
      ELSE 0.9
    END as offer_price,
  CURRENT_TIMESTAMP + INTERVAL '30 days' as offer_expiry,
  FLOOR(RANDOM() * 100 + 50)::int as stock_quantity,
  p.main_image as image_url
FROM size_variations s
CROSS JOIN color_variations c
CROSS JOIN material_variations m
JOIN products p ON p.product_id = s.product_id
WHERE s.product_id = c.product_id 
AND s.product_id = m.product_id; 