CREATE TABLE "member_contents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"kind" text NOT NULL,
	"youtube_id" text,
	"external_url" text,
	"file_id" uuid,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "member_contents_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "member_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"mime" text NOT NULL,
	"size" integer NOT NULL,
	"data" "bytea" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "member_contents" ADD CONSTRAINT "member_contents_file_id_member_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."member_files"("id") ON DELETE set null ON UPDATE no action;