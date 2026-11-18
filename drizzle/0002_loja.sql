CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sku" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"price_cents" integer,
	"variant_label" text,
	"variant_options" text[],
	"image_url" text,
	"image_alt" text,
	"buy_type" text DEFAULT 'whatsapp' NOT NULL,
	"buy_url" text,
	"buy_label" text,
	"available" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE INDEX "products_available_idx" ON "products" USING btree ("available","sort_order");