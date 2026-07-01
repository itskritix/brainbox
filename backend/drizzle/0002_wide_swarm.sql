ALTER TABLE "issues" ALTER COLUMN "screenshot_key" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "issues" ALTER COLUMN "region" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "video_key" text;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "video_mime" text;