CREATE TABLE "banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"image_url" text NOT NULL,
	"image_alt" text NOT NULL,
	"link_url" text,
	"active" boolean DEFAULT true NOT NULL,
	"starts_at" date,
	"ends_at" date,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "banners_active_idx" ON "banners" USING btree ("active","sort_order");