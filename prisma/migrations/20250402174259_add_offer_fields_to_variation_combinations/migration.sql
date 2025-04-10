-- AlterTable
ALTER TABLE "product_variation_combinations" ADD COLUMN     "offer_expiry" TIMESTAMP(6),
ADD COLUMN     "offer_price" DECIMAL(10,2);
