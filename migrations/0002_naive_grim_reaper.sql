DROP INDEX `customer_lat_idx`;--> statement-breakpoint
DROP INDEX `customer_lng_idx`;--> statement-breakpoint
ALTER TABLE `sherlock_customers` ADD `lon` text;--> statement-breakpoint
CREATE INDEX `customer_city_idx` ON `sherlock_customers` (`city`);--> statement-breakpoint
ALTER TABLE `sherlock_customers` DROP COLUMN `lng`;