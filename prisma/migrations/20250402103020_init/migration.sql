-- CreateEnum
CREATE TYPE "customer_type_enum" AS ENUM ('b2b', 'b2c');

-- CreateEnum
CREATE TYPE "discount_type_enum" AS ENUM ('fixed_amount', 'percentage');

-- CreateEnum
CREATE TYPE "movement_type_enum" AS ENUM ('in', 'out', 'adjustment');

-- CreateEnum
CREATE TYPE "product_type_enum" AS ENUM ('physical', 'digital');

-- CreateEnum
CREATE TYPE "transaction_type_enum" AS ENUM ('credit', 'debit');

-- CreateEnum
CREATE TYPE "user_type_enum" AS ENUM ('customer', 'admin');

-- CreateTable
CREATE TABLE "brands" (
    "brand_id" SERIAL NOT NULL,
    "brand_name" VARCHAR(255),
    "image_url" VARCHAR(255),

    CONSTRAINT "brands_pkey" PRIMARY KEY ("brand_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "category_id" SERIAL NOT NULL,
    "category_name" VARCHAR(255),
    "parent_category_id" INTEGER,
    "image_url" VARCHAR(255),
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "slug" VARCHAR(255),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "tags" (
    "tag_id" SERIAL NOT NULL,
    "tag_name" VARCHAR(255),
    "image_url" VARCHAR(255),

    CONSTRAINT "tags_pkey" PRIMARY KEY ("tag_id")
);

-- CreateTable
CREATE TABLE "products" (
    "product_id" SERIAL NOT NULL,
    "sku" VARCHAR(255),
    "name" VARCHAR(255),
    "description" TEXT,
    "price" DECIMAL(10,2),
    "offer_price" DECIMAL(10,2),
    "offer_expiry" TIMESTAMP(6),
    "weight" DECIMAL(10,2),
    "length" DECIMAL(10,2),
    "width" DECIMAL(10,2),
    "height" DECIMAL(10,2),
    "brand_id" INTEGER,
    "category_id" INTEGER,
    "product_type" "product_type_enum",
    "cost" DECIMAL(10,2),
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "slug" VARCHAR(255),

    CONSTRAINT "products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "product_variations" (
    "variation_id" SERIAL NOT NULL,
    "product_id" INTEGER,
    "variation_name" VARCHAR(255),
    "variation_value" VARCHAR(255),
    "additional_price" DECIMAL(10,2),
    "cost" DECIMAL(10,2),
    "stock_quantity" INTEGER,

    CONSTRAINT "product_variations_pkey" PRIMARY KEY ("variation_id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "image_id" SERIAL NOT NULL,
    "product_id" INTEGER,
    "image_url" VARCHAR(255),
    "is_main" BOOLEAN,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "product_specifications" (
    "specification_id" SERIAL NOT NULL,
    "product_id" INTEGER,
    "specification_name" VARCHAR(255),
    "specification_value" TEXT,

    CONSTRAINT "product_specifications_pkey" PRIMARY KEY ("specification_id")
);

-- CreateTable
CREATE TABLE "product_questions" (
    "question_id" SERIAL NOT NULL,
    "product_id" INTEGER,
    "user_id" INTEGER,
    "question" TEXT,
    "answer" TEXT,
    "question_date" TIMESTAMP(6),

    CONSTRAINT "product_questions_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "product_reviews" (
    "review_id" SERIAL NOT NULL,
    "product_id" INTEGER,
    "user_id" INTEGER,
    "rating" INTEGER,
    "comment" TEXT,
    "review_date" TIMESTAMP(6),

    CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "product_tags" (
    "product_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "product_tags_pkey" PRIMARY KEY ("product_id","tag_id")
);

-- CreateTable
CREATE TABLE "related_products" (
    "product_id" INTEGER NOT NULL,
    "related_product_id" INTEGER NOT NULL,

    CONSTRAINT "related_products_pkey" PRIMARY KEY ("product_id","related_product_id")
);

-- CreateTable
CREATE TABLE "product_variation_combinations" (
    "combination_id" SERIAL NOT NULL,
    "product_id" INTEGER,
    "variation_id_1" INTEGER,
    "variation_id_2" INTEGER,
    "variation_id_3" INTEGER,

    CONSTRAINT "product_variation_combinations_pkey" PRIMARY KEY ("combination_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "full_name" VARCHAR(255),
    "mobile_no" VARCHAR(20),
    "email" VARCHAR(255),
    "password" VARCHAR(255),
    "user_type" "user_type_enum",
    "profile_photo_url" VARCHAR(255),
    "otp" VARCHAR(6),
    "otp_expiry" TIMESTAMP(6),
    "is_verified" BOOLEAN,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "customers" (
    "customer_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "customer_type" "customer_type_enum",
    "profile_photo_url" VARCHAR(255),
    "customer_group_id" INTEGER,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "address_id" SERIAL NOT NULL,
    "full_name" VARCHAR(255),
    "mobile_no" VARCHAR(20),
    "address" TEXT,
    "city" VARCHAR(255),
    "user_id" INTEGER,
    "is_guest_address" BOOLEAN DEFAULT false,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("address_id")
);

-- CreateTable
CREATE TABLE "user_addresses" (
    "user_id" INTEGER NOT NULL,
    "address_id" INTEGER NOT NULL,
    "is_default" BOOLEAN,

    CONSTRAINT "user_addresses_pkey" PRIMARY KEY ("user_id","address_id")
);

-- CreateTable
CREATE TABLE "admin_roles" (
    "role_id" SERIAL NOT NULL,
    "role_name" VARCHAR(255),

    CONSTRAINT "admin_roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "orders" (
    "order_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "guest_id" SERIAL NOT NULL,
    "full_name" VARCHAR(255),
    "mobile_no" VARCHAR(20),
    "email" VARCHAR(255),
    "shipping_address_id" INTEGER,
    "billing_address_id" INTEGER,
    "shipping_method" VARCHAR(255),
    "shipping_charge" DECIMAL(10,2),
    "subtotal" DECIMAL(10,2),
    "coupon_amount" DECIMAL(10,2),
    "discount_amount" DECIMAL(10,2),
    "adjustment_amount" DECIMAL(10,2),
    "total_amount" DECIMAL(10,2),
    "order_date" TIMESTAMP(6),
    "order_status" VARCHAR(255),
    "currency_id" INTEGER,
    "tax_id" INTEGER,
    "customer_group_id" INTEGER,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "order_item_id" SERIAL NOT NULL,
    "order_id" INTEGER,
    "product_id" INTEGER,
    "quantity" INTEGER,
    "item_price" DECIMAL(10,2),
    "item_cost" DECIMAL(10,2),

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("order_item_id")
);

-- CreateTable
CREATE TABLE "order_item_variations" (
    "order_item_variation_id" SERIAL NOT NULL,
    "order_item_id" INTEGER,
    "variation_id" INTEGER,

    CONSTRAINT "order_item_variations_pkey" PRIMARY KEY ("order_item_variation_id")
);

-- CreateTable
CREATE TABLE "order_payments" (
    "payment_id" SERIAL NOT NULL,
    "order_id" INTEGER,
    "payment_method" VARCHAR(255),
    "payment_amount" DECIMAL(10,2),
    "payment_date" TIMESTAMP(6),
    "transaction_id" VARCHAR(255),
    "currency_id" INTEGER,
    "wallet_transaction_id" INTEGER,

    CONSTRAINT "order_payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "order_refunds" (
    "refund_id" SERIAL NOT NULL,
    "order_id" INTEGER,
    "payment_id" INTEGER,
    "refund_amount" DECIMAL(10,2),
    "refund_date" TIMESTAMP(6),
    "refund_reason" TEXT,
    "status" VARCHAR(255),

    CONSTRAINT "order_refunds_pkey" PRIMARY KEY ("refund_id")
);

-- CreateTable
CREATE TABLE "return_requests" (
    "return_request_id" SERIAL NOT NULL,
    "order_id" INTEGER,
    "user_id" INTEGER,
    "return_reason" TEXT,
    "return_date" TIMESTAMP(6),
    "status" VARCHAR(255),
    "notes" TEXT,

    CONSTRAINT "return_requests_pkey" PRIMARY KEY ("return_request_id")
);

-- CreateTable
CREATE TABLE "shipping_methods" (
    "shipping_method_id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "description" TEXT,
    "base_cost" DECIMAL(10,2),
    "is_active" BOOLEAN,

    CONSTRAINT "shipping_methods_pkey" PRIMARY KEY ("shipping_method_id")
);

-- CreateTable
CREATE TABLE "zones" (
    "zone_id" SERIAL NOT NULL,
    "zone_name" VARCHAR(255),
    "description" TEXT,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("zone_id")
);

-- CreateTable
CREATE TABLE "zone_members" (
    "zone_id" INTEGER NOT NULL,
    "country_id" INTEGER NOT NULL,

    CONSTRAINT "zone_members_pkey" PRIMARY KEY ("zone_id","country_id")
);

-- CreateTable
CREATE TABLE "countries" (
    "country_id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "code" VARCHAR(2),

    CONSTRAINT "countries_pkey" PRIMARY KEY ("country_id")
);

-- CreateTable
CREATE TABLE "cities" (
    "city_id" SERIAL NOT NULL,
    "country_id" INTEGER,
    "name" VARCHAR(255),

    CONSTRAINT "cities_pkey" PRIMARY KEY ("city_id")
);

-- CreateTable
CREATE TABLE "purchase_requests" (
    "request_id" SERIAL NOT NULL,
    "product_id" INTEGER,
    "quantity" INTEGER,
    "request_date" TIMESTAMP(6),
    "status" VARCHAR(255),
    "notes" TEXT,

    CONSTRAINT "purchase_requests_pkey" PRIMARY KEY ("request_id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "order_id" SERIAL NOT NULL,
    "request_id" INTEGER,
    "supplier_id" INTEGER,
    "order_date" TIMESTAMP(6),
    "expected_date" TIMESTAMP(6),
    "status" VARCHAR(255),
    "total_amount" DECIMAL(10,2),
    "currency_id" INTEGER,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "inventory_id" SERIAL NOT NULL,
    "product_id" INTEGER,
    "quantity" INTEGER,
    "reorder_level" INTEGER,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("inventory_id")
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "movement_id" SERIAL NOT NULL,
    "inventory_id" INTEGER,
    "movement_type" "movement_type_enum",
    "quantity" INTEGER,
    "movement_date" TIMESTAMP(6),
    "reference_type" VARCHAR(255),
    "reference_id" INTEGER,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("movement_id")
);

-- CreateTable
CREATE TABLE "currencies" (
    "currency_id" SERIAL NOT NULL,
    "code" VARCHAR(3),
    "name" VARCHAR(255),
    "symbol" VARCHAR(10),
    "exchange_rate" DECIMAL(10,4),

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("currency_id")
);

-- CreateTable
CREATE TABLE "customer_groups" (
    "customer_group_id" SERIAL NOT NULL,
    "group_name" VARCHAR(255),
    "discount_percentage" DECIMAL(5,2),

    CONSTRAINT "customer_groups_pkey" PRIMARY KEY ("customer_group_id")
);

-- CreateTable
CREATE TABLE "taxes" (
    "tax_id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "rate" DECIMAL(5,2),
    "is_compound" BOOLEAN,

    CONSTRAINT "taxes_pkey" PRIMARY KEY ("tax_id")
);

-- CreateTable
CREATE TABLE "product_taxes" (
    "product_id" INTEGER NOT NULL,
    "tax_id" INTEGER NOT NULL,

    CONSTRAINT "product_taxes_pkey" PRIMARY KEY ("product_id","tax_id")
);

-- CreateTable
CREATE TABLE "wallet" (
    "wallet_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "balance" DECIMAL(10,2),
    "currency_id" INTEGER,

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("wallet_id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "wallet_transaction_id" SERIAL NOT NULL,
    "wallet_id" INTEGER,
    "transaction_type" "transaction_type_enum",
    "amount" DECIMAL(10,2),
    "transaction_date" TIMESTAMP(6),
    "reference_type" VARCHAR(255),
    "reference_id" INTEGER,
    "notes" TEXT,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("wallet_transaction_id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "coupon_id" SERIAL NOT NULL,
    "code" VARCHAR(255),
    "type" "discount_type_enum",
    "value" DECIMAL(10,2),
    "min_order_amount" DECIMAL(10,2),
    "max_discount_amount" DECIMAL(10,2),
    "start_date" TIMESTAMP(6),
    "end_date" TIMESTAMP(6),
    "is_active" BOOLEAN,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("coupon_id")
);

-- CreateTable
CREATE TABLE "combo_offers" (
    "offer_id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "description" TEXT,
    "discount_type" "discount_type_enum",
    "discount_value" DECIMAL(10,2),
    "start_date" TIMESTAMP(6),
    "end_date" TIMESTAMP(6),
    "is_active" BOOLEAN,

    CONSTRAINT "combo_offers_pkey" PRIMARY KEY ("offer_id")
);

-- CreateTable
CREATE TABLE "combo_offer_products" (
    "offer_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER,

    CONSTRAINT "combo_offer_products_pkey" PRIMARY KEY ("offer_id","product_id")
);

-- CreateTable
CREATE TABLE "vouchers" (
    "voucher_id" SERIAL NOT NULL,
    "code" VARCHAR(255),
    "amount" DECIMAL(10,2),
    "currency_id" INTEGER,
    "expiry_date" TIMESTAMP(6),
    "is_used" BOOLEAN,
    "order_id" INTEGER,

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("voucher_id")
);

-- CreateTable
CREATE TABLE "reward_points" (
    "reward_point_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "points" INTEGER,
    "earned_date" TIMESTAMP(6),
    "expiry_date" TIMESTAMP(6),
    "order_id" INTEGER,
    "is_used" BOOLEAN,

    CONSTRAINT "reward_points_pkey" PRIMARY KEY ("reward_point_id")
);

-- CreateTable
CREATE TABLE "languages" (
    "language_id" SERIAL NOT NULL,
    "code" VARCHAR(5),
    "name" VARCHAR(255),
    "is_rtl" BOOLEAN,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("language_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE UNIQUE INDEX "vouchers_code_key" ON "vouchers"("code");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_category_id_fkey" FOREIGN KEY ("parent_category_id") REFERENCES "categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("brand_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_variations" ADD CONSTRAINT "product_variations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_questions" ADD CONSTRAINT "product_questions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_questions" ADD CONSTRAINT "product_questions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("tag_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "related_products" ADD CONSTRAINT "related_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "related_products" ADD CONSTRAINT "related_products_related_product_id_fkey" FOREIGN KEY ("related_product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_variation_combinations" ADD CONSTRAINT "product_variation_combinations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_variation_combinations" ADD CONSTRAINT "product_variation_combinations_variation_id_1_fkey" FOREIGN KEY ("variation_id_1") REFERENCES "product_variations"("variation_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_variation_combinations" ADD CONSTRAINT "product_variation_combinations_variation_id_2_fkey" FOREIGN KEY ("variation_id_2") REFERENCES "product_variations"("variation_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_variation_combinations" ADD CONSTRAINT "product_variation_combinations_variation_id_3_fkey" FOREIGN KEY ("variation_id_3") REFERENCES "product_variations"("variation_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_customer_group_id_fkey" FOREIGN KEY ("customer_group_id") REFERENCES "customer_groups"("customer_group_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("address_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "admin_roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_billing_address_id_fkey" FOREIGN KEY ("billing_address_id") REFERENCES "addresses"("address_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currencies"("currency_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_group_id_fkey" FOREIGN KEY ("customer_group_id") REFERENCES "customer_groups"("customer_group_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_address_id_fkey" FOREIGN KEY ("shipping_address_id") REFERENCES "addresses"("address_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "taxes"("tax_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_item_variations" ADD CONSTRAINT "order_item_variations_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("order_item_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_item_variations" ADD CONSTRAINT "order_item_variations_variation_id_fkey" FOREIGN KEY ("variation_id") REFERENCES "product_variations"("variation_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_payments" ADD CONSTRAINT "order_payments_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currencies"("currency_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_payments" ADD CONSTRAINT "order_payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_payments" ADD CONSTRAINT "order_payments_wallet_transaction_id_fkey" FOREIGN KEY ("wallet_transaction_id") REFERENCES "wallet_transactions"("wallet_transaction_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_refunds" ADD CONSTRAINT "order_refunds_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_refunds" ADD CONSTRAINT "order_refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "order_payments"("payment_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "zone_members" ADD CONSTRAINT "zone_members_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("country_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "zone_members" ADD CONSTRAINT "zone_members_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("zone_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("country_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currencies"("currency_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "purchase_requests"("request_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventory"("inventory_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_taxes" ADD CONSTRAINT "product_taxes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_taxes" ADD CONSTRAINT "product_taxes_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "taxes"("tax_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currencies"("currency_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("wallet_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "combo_offer_products" ADD CONSTRAINT "combo_offer_products_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "combo_offers"("offer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "combo_offer_products" ADD CONSTRAINT "combo_offer_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currencies"("currency_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reward_points" ADD CONSTRAINT "reward_points_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reward_points" ADD CONSTRAINT "reward_points_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
