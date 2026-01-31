ALTER TABLE `predictionMarket` RENAME TO `prediction_market`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_prediction_market` (
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
	CONSTRAINT "yesPoolPositive" CHECK("__new_prediction_market"."yes_pool" > 0),
	CONSTRAINT "noPoolPositive" CHECK("__new_prediction_market"."no_pool" > 0)
);
--> statement-breakpoint
INSERT INTO `__new_prediction_market`("id", "type", "status", "result", "title", "yes_pool", "no_pool", "currency_id", "text", "decider_id", "asset_id", "target_price", "direction", "end_date", "created_at", "updated_at") SELECT "id", "type", "status", "result", "title", "yes_pool", "no_pool", "currency_id", "text", "decider_id", "asset_id", "target_price", "direction", "end_date", "created_at", "updated_at" FROM `prediction_market`;--> statement-breakpoint
DROP TABLE `prediction_market`;--> statement-breakpoint
ALTER TABLE `__new_prediction_market` RENAME TO `prediction_market`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_prediction_market_share` (
	`id` text PRIMARY KEY NOT NULL,
	`portfolio_id` text NOT NULL,
	`prediction_market_id` text NOT NULL,
	`amount` real NOT NULL,
	`currency_id` text NOT NULL,
	`choice` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`portfolio_id`) REFERENCES `portfolio`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`prediction_market_id`) REFERENCES `prediction_market`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`currency_id`) REFERENCES `currency`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "amountPositive" CHECK("__new_prediction_market_share"."amount" > 0)
);
--> statement-breakpoint
INSERT INTO `__new_prediction_market_share`("id", "portfolio_id", "prediction_market_id", "amount", "currency_id", "choice", "created_at") SELECT "id", "portfolio_id", "prediction_market_id", "amount", "currency_id", "choice", "created_at" FROM `prediction_market_share`;--> statement-breakpoint
DROP TABLE `prediction_market_share`;--> statement-breakpoint
ALTER TABLE `__new_prediction_market_share` RENAME TO `prediction_market_share`;