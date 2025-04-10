import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find duplicate SKUs within the same product
  const duplicates = await prisma.$queryRaw`
    SELECT product_id, sku, COUNT(*) as count, array_agg(variation_id) as variation_ids
    FROM product_variations
    GROUP BY product_id, sku
    HAVING COUNT(*) > 1
  `;

  console.log('Found duplicate SKUs:', duplicates);

  // Fix duplicate SKUs by appending a suffix
  for (const duplicate of duplicates as any[]) {
    const { product_id, sku, variation_ids } = duplicate;
    
    // Keep the first variation's SKU as is, update others
    for (let i = 1; i < variation_ids.length; i++) {
      const newSku = `${sku}-${i}`;
      await prisma.productVariation.update({
        where: { id: variation_ids[i] },
        data: { sku: newSku }
      });
      console.log(`Updated variation ${variation_ids[i]} SKU from ${sku} to ${newSku}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 