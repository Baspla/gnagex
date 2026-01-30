CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`external_id` text,
	`email` text NOT NULL,
	`username` text,
	`display_name` text,
	`given_name` text,
	`family_name` text,
	`active` integer DEFAULT true,
	`groups` text DEFAULT '[]',
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_external_id_unique` ON `user` (`external_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);