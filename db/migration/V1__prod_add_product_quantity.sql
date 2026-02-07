-- up
ALTER TABLE "products"
ADD COLUMN "quantity" integer NOT NULL DEFAULT 1;

-- down
ALTER TABLE "products"
DROP COLUMN "quantity";
