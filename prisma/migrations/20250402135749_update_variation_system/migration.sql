/*
  Warnings:

  - You are about to drop the column `additional_price` on the `product_variations` table. All the data in the column will be lost.
  - You are about to drop the column `cost` on the `product_variations` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `product_variations` table. All the data in the column will be lost.
  - You are about to drop the column `stock_quantity` on the `product_variations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[variation_name,variation_value]` on the table `product_variations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `combination_id` to the `order_item_variations` table without a default value. This is not possible if the table is not empty.
  - Made the column `order_item_id` on table `order_item_variations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `variation_id` on table `order_item_variations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `product_id` on table `product_variation_combinations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `variation_id_1` on table `product_variation_combinations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `variation_name` on table `product_variations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `variation_value` on table `product_variations` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "order_item_variations" DROP CONSTRAINT "order_item_variations_order_item_id_fkey";

-- DropForeignKey
ALTER TABLE "order_item_variations" DROP CONSTRAINT "order_item_variations_variation_id_fkey";

-- DropForeignKey
ALTER TABLE "product_variation_combinations" DROP CONSTRAINT "product_variation_combinations_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_variation_combinations" DROP CONSTRAINT "product_variation_combinations_variation_id_1_fkey";

-- DropForeignKey
ALTER TABLE "product_variation_combinations" DROP CONSTRAINT "product_variation_combinations_variation_id_2_fkey";

-- DropForeignKey
ALTER TABLE "product_variation_combinations" DROP CONSTRAINT "product_variation_combinations_variation_id_3_fkey";

-- DropForeignKey
ALTER TABLE "product_variations" DROP CONSTRAINT "product_variations_product_id_fkey";

-- AlterTable
ALTER TABLE "order_item_variations" ADD COLUMN     "combination_id" INTEGER NOT NULL,
ALTER COLUMN "order_item_id" SET NOT NULL,
ALTER COLUMN "variation_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "product_variation_combinations" ADD COLUMN     "cost" DECIMAL(10,2),
ADD COLUMN     "price" DECIMAL(10,2),
ADD COLUMN     "stock_quantity" INTEGER,
ALTER COLUMN "product_id" SET NOT NULL,
ALTER COLUMN "variation_id_1" SET NOT NULL;

-- AlterTable
ALTER TABLE "product_variations" DROP COLUMN "additional_price",
DROP COLUMN "cost",
DROP COLUMN "product_id",
DROP COLUMN "stock_quantity",
ALTER COLUMN "variation_name" SET NOT NULL,
ALTER COLUMN "variation_value" SET NOT NULL;

-- CreateTable
CREATE TABLE "_ProductVariations" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProductVariations_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProductVariations_B_index" ON "_ProductVariations"("B");

-- CreateIndex
CREATE UNIQUE INDEX "product_variations_variation_name_variation_value_key" ON "product_variations"("variation_name", "variation_value");

-- AddForeignKey
ALTER TABLE "product_variation_combinations" ADD CONSTRAINT "product_variation_combinations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variation_combinations" ADD CONSTRAINT "product_variation_combinations_variation_id_1_fkey" FOREIGN KEY ("variation_id_1") REFERENCES "product_variations"("variation_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variation_combinations" ADD CONSTRAINT "product_variation_combinations_variation_id_2_fkey" FOREIGN KEY ("variation_id_2") REFERENCES "product_variations"("variation_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variation_combinations" ADD CONSTRAINT "product_variation_combinations_variation_id_3_fkey" FOREIGN KEY ("variation_id_3") REFERENCES "product_variations"("variation_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_variations" ADD CONSTRAINT "order_item_variations_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("order_item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_variations" ADD CONSTRAINT "order_item_variations_combination_id_fkey" FOREIGN KEY ("combination_id") REFERENCES "product_variation_combinations"("combination_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_variations" ADD CONSTRAINT "order_item_variations_variation_id_fkey" FOREIGN KEY ("variation_id") REFERENCES "product_variations"("variation_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductVariations" ADD CONSTRAINT "_ProductVariations_A_fkey" FOREIGN KEY ("A") REFERENCES "products"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductVariations" ADD CONSTRAINT "_ProductVariations_B_fkey" FOREIGN KEY ("B") REFERENCES "product_variations"("variation_id") ON DELETE CASCADE ON UPDATE CASCADE;
