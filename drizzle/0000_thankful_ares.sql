CREATE TABLE `asset` (
	`id` text PRIMARY KEY NOT NULL,
	`symbol` text NOT NULL,
	`name` text NOT NULL,
	`category_id` text NOT NULL,
	`currency_id` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`category_id`) REFERENCES `asset_category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`currency_id`) REFERENCES `currency`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `asset_category` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `asset_inventory` (
	`id` text PRIMARY KEY NOT NULL,
	`portfolio_id` text NOT NULL,
	`asset_id` text NOT NULL,
	`quantity` real DEFAULT 0 NOT NULL,
	`average_buy_price` real DEFAULT 0,
	`total_fees` real DEFAULT 0,
	`updated_at` integer,
	FOREIGN KEY (`portfolio_id`) REFERENCES `portfolio`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`asset_id`) REFERENCES `asset`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `asset_price_history` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`date` integer NOT NULL,
	`open` real,
	`high` real,
	`low` real,
	`close` real NOT NULL,
	`volume` integer,
	FOREIGN KEY (`asset_id`) REFERENCES `asset`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `currency` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`symbol` text NOT NULL,
	`is_real_world` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exchange_pair` (
	`id` text PRIMARY KEY NOT NULL,
	`from_currency_id` text NOT NULL,
	`to_currency_id` text NOT NULL,
	`symbol` text NOT NULL,
	`name` text,
	FOREIGN KEY (`from_currency_id`) REFERENCES `currency`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_currency_id`) REFERENCES `currency`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exchange_pair_symbol_unique` ON `exchange_pair` (`symbol`);--> statement-breakpoint
CREATE TABLE `exchange_rate_history` (
	`id` text PRIMARY KEY NOT NULL,
	`pair_id` text NOT NULL,
	`rate` real NOT NULL,
	`date` integer NOT NULL,
	FOREIGN KEY (`pair_id`) REFERENCES `exchange_pair`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `portfolio` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `portfolio_currency` (
	`id` text PRIMARY KEY NOT NULL,
	`portfolio_id` text NOT NULL,
	`currency_id` text NOT NULL,
	`amount` real DEFAULT 0 NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`portfolio_id`) REFERENCES `portfolio`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`currency_id`) REFERENCES `currency`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `predictionMarket` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`result` text DEFAULT 'null',
	`title` text NOT NULL,
	`yes_pool` real NOT NULL,
	`no_pool` real NOT NULL,
	`currency_id` text NOT NULL,
	`text` text,
	`decider_id` text,
	`asset_id` text,
	`target_price` real,
	`direction` text,
	`end_date` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`currency_id`) REFERENCES `currency`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`decider_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`asset_id`) REFERENCES `asset`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "yesPoolPositive" CHECK("predictionMarket"."yes_pool" > 0),
	CONSTRAINT "noPoolPositive" CHECK("predictionMarket"."no_pool" > 0)
);
--> statement-breakpoint
CREATE TABLE `prediction_market_share` (
	`id` text PRIMARY KEY NOT NULL,
	`portfolio_id` text NOT NULL,
	`prediction_market_id` text NOT NULL,
	`amount` real NOT NULL,
	`currency_id` text NOT NULL,
	`choice` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`portfolio_id`) REFERENCES `portfolio`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`prediction_market_id`) REFERENCES `predictionMarket`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`currency_id`) REFERENCES `currency`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "amountPositive" CHECK("prediction_market_share"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE `transaction` (
	`id` text PRIMARY KEY NOT NULL,
	`portfolio_id` text NOT NULL,
	`asset_id` text,
	`type` text NOT NULL,
	`amount` real,
	`price_per_unit` real,
	`total_value` real,
	`fee` real DEFAULT 0,
	`conversion_rate` real,
	`from_currency_id` text NOT NULL,
	`to_currency_id` text NOT NULL,
	`executed_at` integer NOT NULL,
	`prediction_market_share_id` text,
	`notes` text,
	FOREIGN KEY (`portfolio_id`) REFERENCES `portfolio`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`asset_id`) REFERENCES `asset`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`from_currency_id`) REFERENCES `currency`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_currency_id`) REFERENCES `currency`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`prediction_market_share_id`) REFERENCES `prediction_market_share`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`external_id` text,
	`email` text NOT NULL,
	`username` text,
	`display_name` text,
	`avatar_url` text,
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