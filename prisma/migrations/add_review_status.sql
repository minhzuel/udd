-- Add status field to product_reviews table
ALTER TABLE product_reviews ADD COLUMN status VARCHAR(20) DEFAULT 'pending';

-- Update existing reviews to be approved
UPDATE product_reviews SET status = 'approved';

-- Create an index on the status field for better query performance
CREATE INDEX idx_product_reviews_status ON product_reviews(status);
