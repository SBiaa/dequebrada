CREATE TABLE "quizzes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"eyebrow" text DEFAULT '' NOT NULL,
	"intro" text DEFAULT '' NOT NULL,
	"cta_label" text DEFAULT 'Começar' NOT NULL,
	"steps" text DEFAULT '[]' NOT NULL,
	"contact_title" text DEFAULT 'Como podemos falar com você?' NOT NULL,
	"ask_email" boolean DEFAULT true NOT NULL,
	"ask_instagram" boolean DEFAULT false NOT NULL,
	"final_title" text DEFAULT 'Recebemos!' NOT NULL,
	"final_text" text DEFAULT 'A gente vai te chamar no WhatsApp em breve.' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quizzes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "email" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "quiz_slug" text DEFAULT 'estudio' NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "quiz_title" text DEFAULT 'Monte sua gravação' NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "instagram" text;