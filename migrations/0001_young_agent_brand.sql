CREATE TABLE `sherlock_customers` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`cpf_cnpj` text NOT NULL,
	`phone` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`status` text NOT NULL,
	`address` text,
	`zip_code` text,
	`city` text,
	`state` text,
	`lat` text,
	`lng` text,
	`note` text,
	`user_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `sherlock_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sherlock_customers_cpf_cnpj_unique` ON `sherlock_customers` (`cpf_cnpj`);--> statement-breakpoint
CREATE INDEX `customer_userId_idx` ON `sherlock_customers` (`user_id`);--> statement-breakpoint
CREATE INDEX `customer_status_idx` ON `sherlock_customers` (`status`);--> statement-breakpoint
CREATE INDEX `customer_lat_idx` ON `sherlock_customers` (`lat`);--> statement-breakpoint
CREATE INDEX `customer_lng_idx` ON `sherlock_customers` (`lng`);--> statement-breakpoint
CREATE INDEX `customer_note_idx` ON `sherlock_customers` (`note`);--> statement-breakpoint
CREATE INDEX `customer_name_idx` ON `sherlock_customers` (`name`);