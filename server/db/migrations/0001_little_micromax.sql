DROP INDEX "favorites_user_menu_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "favorites_user_menu_unique_idx" ON "favorites" USING btree ("user_id","menu_item_id");