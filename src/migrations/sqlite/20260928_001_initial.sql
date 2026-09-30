CREATE TABLE `_blog_posts_v` (
	`id` integer PRIMARY KEY NOT NULL,
	`parent_id` integer,
	`version_slug` text,
	`version_cover_id` integer,
	`version_author` text DEFAULT 'CodeMaster',
	`version_published_at` text,
	`version_updated_at` text,
	`version_created_at` text,
	`version__status` text DEFAULT 'draft',
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`snapshot` integer,
	`published_locale` text,
	`latest` integer,
	`autosave` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `blog_posts`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`version_cover_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `_blog_posts_v_locales` (
	`version_title` text,
	`version_excerpt` text,
	`version_seo_title` text,
	`version_seo_description` text,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `_blog_posts_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_blog_posts_v_rels` (
	`id` integer PRIMARY KEY NOT NULL,
	`order` integer,
	`parent_id` integer NOT NULL,
	`path` text NOT NULL,
	`blog_posts_id` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `_blog_posts_v`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`blog_posts_id`) REFERENCES `blog_posts`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_blog_posts_v_version_sections` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`_locale` text NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`heading` text,
	`body` text,
	`_uuid` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `_blog_posts_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_blog_posts_v_version_tags` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`_uuid` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `_blog_posts_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_faqs_v` (
	`id` integer PRIMARY KEY NOT NULL,
	`parent_id` integer,
	`version_order` numeric DEFAULT 1,
	`version_updated_at` text,
	`version_created_at` text,
	`version__status` text DEFAULT 'draft',
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`snapshot` integer,
	`published_locale` text,
	`latest` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `faqs`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `_faqs_v_locales` (
	`version_question` text,
	`version_answer` text,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `_faqs_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_homepage_v` (
	`id` integer PRIMARY KEY NOT NULL,
	`version_updated_at` text,
	`version_created_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);

CREATE TABLE `_homepage_v_locales` (
	`version_services_kicker` text,
	`version_services_title` text,
	`version_services_description` text,
	`version_projects_kicker` text,
	`version_projects_title` text,
	`version_projects_description` text,
	`version_process_kicker` text,
	`version_process_title` text,
	`version_process_description` text,
	`version_contact_kicker` text,
	`version_contact_title` text,
	`version_contact_description` text,
	`version_about_kicker` text,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `_homepage_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_homepage_v_version_conversation` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`_locale` text NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`side` text NOT NULL,
	`text` text NOT NULL,
	`stage` numeric NOT NULL,
	`_uuid` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `_homepage_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_homepage_v_version_stages` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`_locale` text NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`_uuid` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `_homepage_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_homepage_v_version_trust_items` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`_locale` text NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`description` text,
	`_uuid` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `_homepage_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_industries_v` (
	`id` integer PRIMARY KEY NOT NULL,
	`parent_id` integer,
	`version_updated_at` text,
	`version_created_at` text,
	`version__status` text DEFAULT 'draft',
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`snapshot` integer,
	`published_locale` text,
	`latest` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `industries`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `_industries_v_locales` (
	`version_name` text,
	`version_description` text,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `_industries_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_projects_v` (
	`id` integer PRIMARY KEY NOT NULL,
	`parent_id` integer,
	`version_order` numeric DEFAULT 1,
	`version_slug` text,
	`version_visual_style` text DEFAULT 'dashboard',
	`version_concept` integer DEFAULT true,
	`version_client` text,
	`version_featured` integer DEFAULT true,
	`version_image_id` integer,
	`version_updated_at` text,
	`version_created_at` text,
	`version__status` text DEFAULT 'draft',
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`snapshot` integer,
	`published_locale` text,
	`latest` integer,
	`autosave` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`version_image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `_projects_v_locales` (
	`version_title` text,
	`version_category` text,
	`version_summary` text,
	`version_result` text,
	`version_seo_title` text,
	`version_seo_description` text,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `_projects_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_projects_v_version_sections` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`_locale` text NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`heading` text,
	`body` text,
	`_uuid` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `_projects_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_projects_v_version_technologies` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`_uuid` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `_projects_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_services_v` (
	`id` integer PRIMARY KEY NOT NULL,
	`parent_id` integer,
	`version_order` numeric DEFAULT 1,
	`version_visual_style` text DEFAULT 'dashboard',
	`version_updated_at` text,
	`version_created_at` text,
	`version__status` text DEFAULT 'draft',
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`snapshot` integer,
	`published_locale` text,
	`latest` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `_services_v_locales` (
	`version_title` text,
	`version_description` text,
	`version_short_label` text,
	`version_outcome` text,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `_services_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_site_settings_v` (
	`id` integer PRIMARY KEY NOT NULL,
	`version_brand_name` text DEFAULT 'CodeMaster',
	`version_brand_suffix` text DEFAULT 'Software House',
	`version_founder_name` text DEFAULT 'Piotr Montewka',
	`version_email` text NOT NULL,
	`version_phone` text,
	`version_founder_photo_id` integer,
	`version_updated_at` text,
	`version_created_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`version_founder_photo_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `_site_settings_v_locales` (
	`version_founder_role` text,
	`version_announcement` text,
	`version_hero_eyebrow` text,
	`version_hero_title` text,
	`version_hero_lead` text,
	`version_primary_c_t_a` text,
	`version_secondary_c_t_a` text,
	`version_trust_headline` text,
	`version_trust_copy` text,
	`version_about_copy` text,
	`version_seo_title` text,
	`version_seo_description` text,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `_site_settings_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_technologies_v` (
	`id` integer PRIMARY KEY NOT NULL,
	`parent_id` integer,
	`version_updated_at` text,
	`version_created_at` text,
	`version__status` text DEFAULT 'draft',
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`snapshot` integer,
	`published_locale` text,
	`latest` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `technologies`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `_technologies_v_locales` (
	`version_name` text,
	`version_description` text,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `_technologies_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `_testimonials_v` (
	`id` integer PRIMARY KEY NOT NULL,
	`parent_id` integer,
	`version_name` text,
	`version_company` text,
	`version_avatar_id` integer,
	`version_logo_id` integer,
	`version_video_u_r_l` text,
	`version_featured` integer DEFAULT true,
	`version_updated_at` text,
	`version_created_at` text,
	`version__status` text DEFAULT 'draft',
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`snapshot` integer,
	`published_locale` text,
	`latest` integer, `version_rating` numeric,
	FOREIGN KEY (`parent_id`) REFERENCES `testimonials`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`version_avatar_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`version_logo_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `_testimonials_v_locales` (
	`version_role` text,
	`version_quote` text,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `_testimonials_v`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `blog_posts` (
	`id` integer PRIMARY KEY NOT NULL,
	`slug` text,
	`cover_id` integer,
	`author` text DEFAULT 'CodeMaster',
	`published_at` text,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`_status` text DEFAULT 'draft',
	FOREIGN KEY (`cover_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `blog_posts_locales` (
	`title` text,
	`excerpt` text,
	`seo_title` text,
	`seo_description` text,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `blog_posts`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `blog_posts_rels` (
	`id` integer PRIMARY KEY NOT NULL,
	`order` integer,
	`parent_id` integer NOT NULL,
	`path` text NOT NULL,
	`blog_posts_id` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `blog_posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`blog_posts_id`) REFERENCES `blog_posts`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `blog_posts_sections` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`_locale` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`heading` text,
	`body` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `blog_posts`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `blog_posts_tags` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `blog_posts`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `contact_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`legal_name` text,
	`legal_address` text,
	`hosting_provider` text,
	`privacy_reviewed` integer DEFAULT false,
	`updated_at` text,
	`created_at` text
);

CREATE TABLE `contact_settings_locales` (
	`retention_description` text,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `contact_settings`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `faqs` (
	`id` integer PRIMARY KEY NOT NULL,
	`order` numeric DEFAULT 1,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`_status` text DEFAULT 'draft'
);

CREATE TABLE `faqs_locales` (
	`question` text,
	`answer` text,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `faqs`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `footer` (
	`id` integer PRIMARY KEY NOT NULL,
	`updated_at` text,
	`created_at` text
);

CREATE TABLE `footer_links` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`_locale` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`href` text NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `footer`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `footer_locales` (
	`statement` text,
	`footnote` text,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `footer`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `form_attempts` (
	`id` integer PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`expires_at` text NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);

CREATE TABLE `homepage` (
	`id` integer PRIMARY KEY NOT NULL,
	`updated_at` text,
	`created_at` text
);

CREATE TABLE `homepage_conversation` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`_locale` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`side` text NOT NULL,
	`text` text NOT NULL,
	`stage` numeric NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `homepage`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `homepage_locales` (
	`services_kicker` text,
	`services_title` text,
	`services_description` text,
	`projects_kicker` text,
	`projects_title` text,
	`projects_description` text,
	`process_kicker` text,
	`process_title` text,
	`process_description` text,
	`contact_kicker` text,
	`contact_title` text,
	`contact_description` text,
	`about_kicker` text,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `homepage`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `homepage_stages` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`_locale` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `homepage`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `homepage_trust_items` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`_locale` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`description` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `homepage`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `industries` (
	`id` integer PRIMARY KEY NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`_status` text DEFAULT 'draft'
);

CREATE TABLE `industries_locales` (
	`name` text,
	`description` text,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `industries`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `installation_state` (
	`id` integer PRIMARY KEY NOT NULL,
	`content_initialized_at` text,
	`updated_at` text,
	`created_at` text
);

CREATE TABLE `leads` (
	`id` integer PRIMARY KEY NOT NULL,
	`submission_key` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`company` text,
	`phone` text,
	`topic` text NOT NULL,
	`message` text NOT NULL,
	`timeline` text,
	`budget` text,
	`nda` integer,
	`privacy_accepted` integer DEFAULT false NOT NULL,
	`privacy_version` text DEFAULT '2026-09-29',
	`locale` text DEFAULT 'pl',
	`source` text DEFAULT 'contact',
	`attachment_id` integer,
	`status` text DEFAULT 'new',
	`internal_notes` text,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`attachment_id`) REFERENCES `private_files`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `media` (
	`id` integer PRIMARY KEY NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`url` text,
	`thumbnail_u_r_l` text,
	`filename` text,
	`mime_type` text,
	`filesize` numeric,
	`width` numeric,
	`height` numeric,
	`focal_x` numeric,
	`focal_y` numeric,
	`sizes_thumbnail_url` text,
	`sizes_thumbnail_width` numeric,
	`sizes_thumbnail_height` numeric,
	`sizes_thumbnail_mime_type` text,
	`sizes_thumbnail_filesize` numeric,
	`sizes_thumbnail_filename` text,
	`sizes_large_url` text,
	`sizes_large_width` numeric,
	`sizes_large_height` numeric,
	`sizes_large_mime_type` text,
	`sizes_large_filesize` numeric,
	`sizes_large_filename` text
);

CREATE TABLE `media_locales` (
	`alt` text NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `navigation` (
	`id` integer PRIMARY KEY NOT NULL,
	`updated_at` text,
	`created_at` text
);

CREATE TABLE `navigation_links` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`_locale` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`href` text NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `navigation`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `navigation_locales` (
	`cta` text,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `navigation`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `payload_kv` (
	`id` integer PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`data` text NOT NULL
);

CREATE TABLE `payload_locked_documents` (
	`id` integer PRIMARY KEY NOT NULL,
	`global_slug` text,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);

CREATE TABLE `payload_locked_documents_rels` (
	`id` integer PRIMARY KEY NOT NULL,
	`order` integer,
	`parent_id` integer NOT NULL,
	`path` text NOT NULL,
	`users_id` integer,
	`media_id` integer,
	`services_id` integer,
	`projects_id` integer,
	`testimonials_id` integer,
	`leads_id` integer,
	`private_files_id` integer,
	`form_attempts_id` integer,
	`blog_posts_id` integer,
	`faqs_id` integer,
	`technologies_id` integer,
	`industries_id` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `payload_locked_documents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`services_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`projects_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`testimonials_id`) REFERENCES `testimonials`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`leads_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`private_files_id`) REFERENCES `private_files`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`form_attempts_id`) REFERENCES `form_attempts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`blog_posts_id`) REFERENCES `blog_posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`faqs_id`) REFERENCES `faqs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`technologies_id`) REFERENCES `technologies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`industries_id`) REFERENCES `industries`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `payload_preferences` (
	`id` integer PRIMARY KEY NOT NULL,
	`key` text,
	`value` text,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);

CREATE TABLE `payload_migrations` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`batch` numeric,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);

CREATE TABLE `payload_preferences_rels` (
	`id` integer PRIMARY KEY NOT NULL,
	`order` integer,
	`parent_id` integer NOT NULL,
	`path` text NOT NULL,
	`users_id` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `payload_preferences`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `private_files` (
	`id` integer PRIMARY KEY NOT NULL,
	`submission_key` text NOT NULL,
	`sha256` text NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`url` text,
	`thumbnail_u_r_l` text,
	`filename` text,
	`mime_type` text,
	`filesize` numeric,
	`width` numeric,
	`height` numeric,
	`focal_x` numeric,
	`focal_y` numeric
);

CREATE TABLE `projects` (
	`id` integer PRIMARY KEY NOT NULL,
	`order` numeric DEFAULT 1,
	`slug` text,
	`visual_style` text DEFAULT 'dashboard',
	`concept` integer DEFAULT true,
	`client` text,
	`featured` integer DEFAULT true,
	`image_id` integer,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`_status` text DEFAULT 'draft',
	FOREIGN KEY (`image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `projects_locales` (
	`title` text,
	`category` text,
	`summary` text,
	`result` text,
	`seo_title` text,
	`seo_description` text,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `projects_sections` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`_locale` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`heading` text,
	`body` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `projects_technologies` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `seo` (
	`id` integer PRIMARY KEY NOT NULL,
	`og_image_id` integer,
	`updated_at` text,
	`created_at` text,
	FOREIGN KEY (`og_image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `seo_locales` (
	`title` text,
	`description` text,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `seo`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `services` (
	`id` integer PRIMARY KEY NOT NULL,
	`order` numeric DEFAULT 1,
	`visual_style` text DEFAULT 'dashboard',
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`_status` text DEFAULT 'draft'
);

CREATE TABLE `services_locales` (
	`title` text,
	`description` text,
	`short_label` text,
	`outcome` text,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `site_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`brand_name` text DEFAULT 'CodeMaster',
	`brand_suffix` text DEFAULT 'Software House',
	`founder_name` text DEFAULT 'Piotr Montewka',
	`email` text NOT NULL,
	`phone` text,
	`founder_photo_id` integer,
	`updated_at` text,
	`created_at` text,
	FOREIGN KEY (`founder_photo_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `site_settings_locales` (
	`founder_role` text,
	`announcement` text,
	`hero_eyebrow` text,
	`hero_title` text,
	`hero_lead` text,
	`primary_c_t_a` text,
	`secondary_c_t_a` text,
	`trust_headline` text,
	`trust_copy` text,
	`about_copy` text,
	`seo_title` text,
	`seo_description` text,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `site_settings`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `social_links` (
	`id` integer PRIMARY KEY NOT NULL,
	`updated_at` text,
	`created_at` text
);

CREATE TABLE `social_links_links` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`_locale` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`href` text NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `social_links`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `technologies` (
	`id` integer PRIMARY KEY NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`_status` text DEFAULT 'draft'
);

CREATE TABLE `technologies_locales` (
	`name` text,
	`description` text,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `technologies`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `testimonials` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`company` text,
	`avatar_id` integer,
	`logo_id` integer,
	`video_u_r_l` text,
	`featured` integer DEFAULT true,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`_status` text DEFAULT 'draft', `rating` numeric,
	FOREIGN KEY (`avatar_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`logo_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `testimonials_locales` (
	`role` text,
	`quote` text,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `testimonials`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`email` text NOT NULL,
	`reset_password_token` text,
	`reset_password_expiration` text,
	`salt` text,
	`hash` text,
	`login_attempts` numeric DEFAULT 0,
	`lock_until` text
);

CREATE TABLE `users_sessions` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `_blog_posts_v_autosave_idx` ON `_blog_posts_v` (`autosave`);

CREATE INDEX `_blog_posts_v_created_at_idx` ON `_blog_posts_v` (`created_at`);

CREATE INDEX `_blog_posts_v_latest_idx` ON `_blog_posts_v` (`latest`);

CREATE UNIQUE INDEX `_blog_posts_v_locales_locale_parent_id_unique` ON `_blog_posts_v_locales` (`_locale`,`_parent_id`);

CREATE INDEX `_blog_posts_v_parent_idx` ON `_blog_posts_v` (`parent_id`);

CREATE INDEX `_blog_posts_v_published_locale_idx` ON `_blog_posts_v` (`published_locale`);

CREATE INDEX `_blog_posts_v_rels_blog_posts_id_idx` ON `_blog_posts_v_rels` (`blog_posts_id`);

CREATE INDEX `_blog_posts_v_rels_order_idx` ON `_blog_posts_v_rels` (`order`);

CREATE INDEX `_blog_posts_v_rels_parent_idx` ON `_blog_posts_v_rels` (`parent_id`);

CREATE INDEX `_blog_posts_v_rels_path_idx` ON `_blog_posts_v_rels` (`path`);

CREATE INDEX `_blog_posts_v_snapshot_idx` ON `_blog_posts_v` (`snapshot`);

CREATE INDEX `_blog_posts_v_updated_at_idx` ON `_blog_posts_v` (`updated_at`);

CREATE INDEX `_blog_posts_v_version_sections_locale_idx` ON `_blog_posts_v_version_sections` (`_locale`);

CREATE INDEX `_blog_posts_v_version_sections_order_idx` ON `_blog_posts_v_version_sections` (`_order`);

CREATE INDEX `_blog_posts_v_version_sections_parent_id_idx` ON `_blog_posts_v_version_sections` (`_parent_id`);

CREATE INDEX `_blog_posts_v_version_tags_order_idx` ON `_blog_posts_v_version_tags` (`_order`);

CREATE INDEX `_blog_posts_v_version_tags_parent_id_idx` ON `_blog_posts_v_version_tags` (`_parent_id`);

CREATE INDEX `_blog_posts_v_version_version__status_idx` ON `_blog_posts_v` (`version__status`);

CREATE INDEX `_blog_posts_v_version_version_cover_idx` ON `_blog_posts_v` (`version_cover_id`);

CREATE INDEX `_blog_posts_v_version_version_created_at_idx` ON `_blog_posts_v` (`version_created_at`);

CREATE INDEX `_blog_posts_v_version_version_slug_idx` ON `_blog_posts_v` (`version_slug`);

CREATE INDEX `_blog_posts_v_version_version_updated_at_idx` ON `_blog_posts_v` (`version_updated_at`);

CREATE INDEX `_faqs_v_created_at_idx` ON `_faqs_v` (`created_at`);

CREATE INDEX `_faqs_v_latest_idx` ON `_faqs_v` (`latest`);

CREATE UNIQUE INDEX `_faqs_v_locales_locale_parent_id_unique` ON `_faqs_v_locales` (`_locale`,`_parent_id`);

CREATE INDEX `_faqs_v_parent_idx` ON `_faqs_v` (`parent_id`);

CREATE INDEX `_faqs_v_published_locale_idx` ON `_faqs_v` (`published_locale`);

CREATE INDEX `_faqs_v_snapshot_idx` ON `_faqs_v` (`snapshot`);

CREATE INDEX `_faqs_v_updated_at_idx` ON `_faqs_v` (`updated_at`);

CREATE INDEX `_faqs_v_version_version__status_idx` ON `_faqs_v` (`version__status`);

CREATE INDEX `_faqs_v_version_version_created_at_idx` ON `_faqs_v` (`version_created_at`);

CREATE INDEX `_faqs_v_version_version_updated_at_idx` ON `_faqs_v` (`version_updated_at`);

CREATE INDEX `_homepage_v_created_at_idx` ON `_homepage_v` (`created_at`);

CREATE UNIQUE INDEX `_homepage_v_locales_locale_parent_id_unique` ON `_homepage_v_locales` (`_locale`,`_parent_id`);

CREATE INDEX `_homepage_v_updated_at_idx` ON `_homepage_v` (`updated_at`);

CREATE INDEX `_homepage_v_version_conversation_locale_idx` ON `_homepage_v_version_conversation` (`_locale`);

CREATE INDEX `_homepage_v_version_conversation_order_idx` ON `_homepage_v_version_conversation` (`_order`);

CREATE INDEX `_homepage_v_version_conversation_parent_id_idx` ON `_homepage_v_version_conversation` (`_parent_id`);

CREATE INDEX `_homepage_v_version_stages_locale_idx` ON `_homepage_v_version_stages` (`_locale`);

CREATE INDEX `_homepage_v_version_stages_order_idx` ON `_homepage_v_version_stages` (`_order`);

CREATE INDEX `_homepage_v_version_stages_parent_id_idx` ON `_homepage_v_version_stages` (`_parent_id`);

CREATE INDEX `_homepage_v_version_trust_items_locale_idx` ON `_homepage_v_version_trust_items` (`_locale`);

CREATE INDEX `_homepage_v_version_trust_items_order_idx` ON `_homepage_v_version_trust_items` (`_order`);

CREATE INDEX `_homepage_v_version_trust_items_parent_id_idx` ON `_homepage_v_version_trust_items` (`_parent_id`);

CREATE INDEX `_industries_v_created_at_idx` ON `_industries_v` (`created_at`);

CREATE INDEX `_industries_v_latest_idx` ON `_industries_v` (`latest`);

CREATE UNIQUE INDEX `_industries_v_locales_locale_parent_id_unique` ON `_industries_v_locales` (`_locale`,`_parent_id`);

CREATE INDEX `_industries_v_parent_idx` ON `_industries_v` (`parent_id`);

CREATE INDEX `_industries_v_published_locale_idx` ON `_industries_v` (`published_locale`);

CREATE INDEX `_industries_v_snapshot_idx` ON `_industries_v` (`snapshot`);

CREATE INDEX `_industries_v_updated_at_idx` ON `_industries_v` (`updated_at`);

CREATE INDEX `_industries_v_version_version__status_idx` ON `_industries_v` (`version__status`);

CREATE INDEX `_industries_v_version_version_created_at_idx` ON `_industries_v` (`version_created_at`);

CREATE INDEX `_industries_v_version_version_updated_at_idx` ON `_industries_v` (`version_updated_at`);

CREATE INDEX `_projects_v_autosave_idx` ON `_projects_v` (`autosave`);

CREATE INDEX `_projects_v_created_at_idx` ON `_projects_v` (`created_at`);

CREATE INDEX `_projects_v_latest_idx` ON `_projects_v` (`latest`);

CREATE UNIQUE INDEX `_projects_v_locales_locale_parent_id_unique` ON `_projects_v_locales` (`_locale`,`_parent_id`);

CREATE INDEX `_projects_v_parent_idx` ON `_projects_v` (`parent_id`);

CREATE INDEX `_projects_v_published_locale_idx` ON `_projects_v` (`published_locale`);

CREATE INDEX `_projects_v_snapshot_idx` ON `_projects_v` (`snapshot`);

CREATE INDEX `_projects_v_updated_at_idx` ON `_projects_v` (`updated_at`);

CREATE INDEX `_projects_v_version_sections_locale_idx` ON `_projects_v_version_sections` (`_locale`);

CREATE INDEX `_projects_v_version_sections_order_idx` ON `_projects_v_version_sections` (`_order`);

CREATE INDEX `_projects_v_version_sections_parent_id_idx` ON `_projects_v_version_sections` (`_parent_id`);

CREATE INDEX `_projects_v_version_technologies_order_idx` ON `_projects_v_version_technologies` (`_order`);

CREATE INDEX `_projects_v_version_technologies_parent_id_idx` ON `_projects_v_version_technologies` (`_parent_id`);

CREATE INDEX `_projects_v_version_version__status_idx` ON `_projects_v` (`version__status`);

CREATE INDEX `_projects_v_version_version_created_at_idx` ON `_projects_v` (`version_created_at`);

CREATE INDEX `_projects_v_version_version_image_idx` ON `_projects_v` (`version_image_id`);

CREATE INDEX `_projects_v_version_version_slug_idx` ON `_projects_v` (`version_slug`);

CREATE INDEX `_projects_v_version_version_updated_at_idx` ON `_projects_v` (`version_updated_at`);

CREATE INDEX `_services_v_created_at_idx` ON `_services_v` (`created_at`);

CREATE INDEX `_services_v_latest_idx` ON `_services_v` (`latest`);

CREATE UNIQUE INDEX `_services_v_locales_locale_parent_id_unique` ON `_services_v_locales` (`_locale`,`_parent_id`);

CREATE INDEX `_services_v_parent_idx` ON `_services_v` (`parent_id`);

CREATE INDEX `_services_v_published_locale_idx` ON `_services_v` (`published_locale`);

CREATE INDEX `_services_v_snapshot_idx` ON `_services_v` (`snapshot`);

CREATE INDEX `_services_v_updated_at_idx` ON `_services_v` (`updated_at`);

CREATE INDEX `_services_v_version_version__status_idx` ON `_services_v` (`version__status`);

CREATE INDEX `_services_v_version_version_created_at_idx` ON `_services_v` (`version_created_at`);

CREATE INDEX `_services_v_version_version_updated_at_idx` ON `_services_v` (`version_updated_at`);

CREATE INDEX `_site_settings_v_created_at_idx` ON `_site_settings_v` (`created_at`);

CREATE UNIQUE INDEX `_site_settings_v_locales_locale_parent_id_unique` ON `_site_settings_v_locales` (`_locale`,`_parent_id`);

CREATE INDEX `_site_settings_v_updated_at_idx` ON `_site_settings_v` (`updated_at`);

CREATE INDEX `_site_settings_v_version_version_founder_photo_idx` ON `_site_settings_v` (`version_founder_photo_id`);

CREATE INDEX `_technologies_v_created_at_idx` ON `_technologies_v` (`created_at`);

CREATE INDEX `_technologies_v_latest_idx` ON `_technologies_v` (`latest`);

CREATE UNIQUE INDEX `_technologies_v_locales_locale_parent_id_unique` ON `_technologies_v_locales` (`_locale`,`_parent_id`);

CREATE INDEX `_technologies_v_parent_idx` ON `_technologies_v` (`parent_id`);

CREATE INDEX `_technologies_v_published_locale_idx` ON `_technologies_v` (`published_locale`);

CREATE INDEX `_technologies_v_snapshot_idx` ON `_technologies_v` (`snapshot`);

CREATE INDEX `_technologies_v_updated_at_idx` ON `_technologies_v` (`updated_at`);

CREATE INDEX `_technologies_v_version_version__status_idx` ON `_technologies_v` (`version__status`);

CREATE INDEX `_technologies_v_version_version_created_at_idx` ON `_technologies_v` (`version_created_at`);

CREATE INDEX `_technologies_v_version_version_updated_at_idx` ON `_technologies_v` (`version_updated_at`);

CREATE INDEX `_testimonials_v_created_at_idx` ON `_testimonials_v` (`created_at`);

CREATE INDEX `_testimonials_v_latest_idx` ON `_testimonials_v` (`latest`);

CREATE UNIQUE INDEX `_testimonials_v_locales_locale_parent_id_unique` ON `_testimonials_v_locales` (`_locale`,`_parent_id`);

CREATE INDEX `_testimonials_v_parent_idx` ON `_testimonials_v` (`parent_id`);

CREATE INDEX `_testimonials_v_published_locale_idx` ON `_testimonials_v` (`published_locale`);

CREATE INDEX `_testimonials_v_snapshot_idx` ON `_testimonials_v` (`snapshot`);

CREATE INDEX `_testimonials_v_updated_at_idx` ON `_testimonials_v` (`updated_at`);

CREATE INDEX `_testimonials_v_version_version__status_idx` ON `_testimonials_v` (`version__status`);

CREATE INDEX `_testimonials_v_version_version_avatar_idx` ON `_testimonials_v` (`version_avatar_id`);

CREATE INDEX `_testimonials_v_version_version_created_at_idx` ON `_testimonials_v` (`version_created_at`);

CREATE INDEX `_testimonials_v_version_version_logo_idx` ON `_testimonials_v` (`version_logo_id`);

CREATE INDEX `_testimonials_v_version_version_updated_at_idx` ON `_testimonials_v` (`version_updated_at`);

CREATE INDEX `blog_posts__status_idx` ON `blog_posts` (`_status`);

CREATE INDEX `blog_posts_cover_idx` ON `blog_posts` (`cover_id`);

CREATE INDEX `blog_posts_created_at_idx` ON `blog_posts` (`created_at`);

CREATE UNIQUE INDEX `blog_posts_locales_locale_parent_id_unique` ON `blog_posts_locales` (`_locale`,`_parent_id`);

CREATE INDEX `blog_posts_rels_blog_posts_id_idx` ON `blog_posts_rels` (`blog_posts_id`);

CREATE INDEX `blog_posts_rels_order_idx` ON `blog_posts_rels` (`order`);

CREATE INDEX `blog_posts_rels_parent_idx` ON `blog_posts_rels` (`parent_id`);

CREATE INDEX `blog_posts_rels_path_idx` ON `blog_posts_rels` (`path`);

CREATE INDEX `blog_posts_sections_locale_idx` ON `blog_posts_sections` (`_locale`);

CREATE INDEX `blog_posts_sections_order_idx` ON `blog_posts_sections` (`_order`);

CREATE INDEX `blog_posts_sections_parent_id_idx` ON `blog_posts_sections` (`_parent_id`);

CREATE UNIQUE INDEX `blog_posts_slug_idx` ON `blog_posts` (`slug`);

CREATE INDEX `blog_posts_tags_order_idx` ON `blog_posts_tags` (`_order`);

CREATE INDEX `blog_posts_tags_parent_id_idx` ON `blog_posts_tags` (`_parent_id`);

CREATE INDEX `blog_posts_updated_at_idx` ON `blog_posts` (`updated_at`);

CREATE UNIQUE INDEX `contact_settings_locales_locale_parent_id_unique` ON `contact_settings_locales` (`_locale`,`_parent_id`);

CREATE INDEX `faqs__status_idx` ON `faqs` (`_status`);

CREATE INDEX `faqs_created_at_idx` ON `faqs` (`created_at`);

CREATE UNIQUE INDEX `faqs_locales_locale_parent_id_unique` ON `faqs_locales` (`_locale`,`_parent_id`);

CREATE INDEX `faqs_updated_at_idx` ON `faqs` (`updated_at`);

CREATE INDEX `footer_links_locale_idx` ON `footer_links` (`_locale`);

CREATE INDEX `footer_links_order_idx` ON `footer_links` (`_order`);

CREATE INDEX `footer_links_parent_id_idx` ON `footer_links` (`_parent_id`);

CREATE UNIQUE INDEX `footer_locales_locale_parent_id_unique` ON `footer_locales` (`_locale`,`_parent_id`);

CREATE INDEX `form_attempts_created_at_idx` ON `form_attempts` (`created_at`);

CREATE INDEX `form_attempts_expires_at_idx` ON `form_attempts` (`expires_at`);

CREATE UNIQUE INDEX `form_attempts_key_idx` ON `form_attempts` (`key`);

CREATE INDEX `form_attempts_updated_at_idx` ON `form_attempts` (`updated_at`);

CREATE INDEX `homepage_conversation_locale_idx` ON `homepage_conversation` (`_locale`);

CREATE INDEX `homepage_conversation_order_idx` ON `homepage_conversation` (`_order`);

CREATE INDEX `homepage_conversation_parent_id_idx` ON `homepage_conversation` (`_parent_id`);

CREATE UNIQUE INDEX `homepage_locales_locale_parent_id_unique` ON `homepage_locales` (`_locale`,`_parent_id`);

CREATE INDEX `homepage_stages_locale_idx` ON `homepage_stages` (`_locale`);

CREATE INDEX `homepage_stages_order_idx` ON `homepage_stages` (`_order`);

CREATE INDEX `homepage_stages_parent_id_idx` ON `homepage_stages` (`_parent_id`);

CREATE INDEX `homepage_trust_items_locale_idx` ON `homepage_trust_items` (`_locale`);

CREATE INDEX `homepage_trust_items_order_idx` ON `homepage_trust_items` (`_order`);

CREATE INDEX `homepage_trust_items_parent_id_idx` ON `homepage_trust_items` (`_parent_id`);

CREATE INDEX `industries__status_idx` ON `industries` (`_status`);

CREATE INDEX `industries_created_at_idx` ON `industries` (`created_at`);

CREATE UNIQUE INDEX `industries_locales_locale_parent_id_unique` ON `industries_locales` (`_locale`,`_parent_id`);

CREATE INDEX `industries_updated_at_idx` ON `industries` (`updated_at`);

CREATE INDEX `leads_attachment_idx` ON `leads` (`attachment_id`);

CREATE INDEX `leads_created_at_idx` ON `leads` (`created_at`);

CREATE UNIQUE INDEX `leads_submission_key_idx` ON `leads` (`submission_key`);

CREATE INDEX `leads_updated_at_idx` ON `leads` (`updated_at`);

CREATE INDEX `media_created_at_idx` ON `media` (`created_at`);

CREATE UNIQUE INDEX `media_filename_idx` ON `media` (`filename`);

CREATE UNIQUE INDEX `media_locales_locale_parent_id_unique` ON `media_locales` (`_locale`,`_parent_id`);

CREATE INDEX `media_sizes_large_sizes_large_filename_idx` ON `media` (`sizes_large_filename`);

CREATE INDEX `media_sizes_thumbnail_sizes_thumbnail_filename_idx` ON `media` (`sizes_thumbnail_filename`);

CREATE INDEX `media_updated_at_idx` ON `media` (`updated_at`);

CREATE INDEX `navigation_links_locale_idx` ON `navigation_links` (`_locale`);

CREATE INDEX `navigation_links_order_idx` ON `navigation_links` (`_order`);

CREATE INDEX `navigation_links_parent_id_idx` ON `navigation_links` (`_parent_id`);

CREATE UNIQUE INDEX `navigation_locales_locale_parent_id_unique` ON `navigation_locales` (`_locale`,`_parent_id`);

CREATE UNIQUE INDEX `payload_kv_key_idx` ON `payload_kv` (`key`);

CREATE INDEX `payload_locked_documents_created_at_idx` ON `payload_locked_documents` (`created_at`);

CREATE INDEX `payload_locked_documents_global_slug_idx` ON `payload_locked_documents` (`global_slug`);

CREATE INDEX `payload_locked_documents_rels_blog_posts_id_idx` ON `payload_locked_documents_rels` (`blog_posts_id`);

CREATE INDEX `payload_locked_documents_rels_faqs_id_idx` ON `payload_locked_documents_rels` (`faqs_id`);

CREATE INDEX `payload_locked_documents_rels_form_attempts_id_idx` ON `payload_locked_documents_rels` (`form_attempts_id`);

CREATE INDEX `payload_locked_documents_rels_industries_id_idx` ON `payload_locked_documents_rels` (`industries_id`);

CREATE INDEX `payload_locked_documents_rels_leads_id_idx` ON `payload_locked_documents_rels` (`leads_id`);

CREATE INDEX `payload_locked_documents_rels_media_id_idx` ON `payload_locked_documents_rels` (`media_id`);

CREATE INDEX `payload_locked_documents_rels_order_idx` ON `payload_locked_documents_rels` (`order`);

CREATE INDEX `payload_locked_documents_rels_parent_idx` ON `payload_locked_documents_rels` (`parent_id`);

CREATE INDEX `payload_locked_documents_rels_path_idx` ON `payload_locked_documents_rels` (`path`);

CREATE INDEX `payload_locked_documents_rels_private_files_id_idx` ON `payload_locked_documents_rels` (`private_files_id`);

CREATE INDEX `payload_locked_documents_rels_projects_id_idx` ON `payload_locked_documents_rels` (`projects_id`);

CREATE INDEX `payload_locked_documents_rels_services_id_idx` ON `payload_locked_documents_rels` (`services_id`);

CREATE INDEX `payload_locked_documents_rels_technologies_id_idx` ON `payload_locked_documents_rels` (`technologies_id`);

CREATE INDEX `payload_locked_documents_rels_testimonials_id_idx` ON `payload_locked_documents_rels` (`testimonials_id`);

CREATE INDEX `payload_locked_documents_rels_users_id_idx` ON `payload_locked_documents_rels` (`users_id`);

CREATE INDEX `payload_locked_documents_updated_at_idx` ON `payload_locked_documents` (`updated_at`);

CREATE INDEX `payload_preferences_created_at_idx` ON `payload_preferences` (`created_at`);

CREATE INDEX `payload_preferences_key_idx` ON `payload_preferences` (`key`);

CREATE INDEX `payload_preferences_rels_order_idx` ON `payload_preferences_rels` (`order`);

CREATE INDEX `payload_preferences_rels_parent_idx` ON `payload_preferences_rels` (`parent_id`);

CREATE INDEX `payload_preferences_rels_path_idx` ON `payload_preferences_rels` (`path`);

CREATE INDEX `payload_preferences_rels_users_id_idx` ON `payload_preferences_rels` (`users_id`);

CREATE INDEX `payload_migrations_updated_at_idx` ON `payload_migrations` (`updated_at`);

CREATE INDEX `payload_migrations_created_at_idx` ON `payload_migrations` (`created_at`);

CREATE INDEX `payload_preferences_updated_at_idx` ON `payload_preferences` (`updated_at`);

CREATE INDEX `private_files_created_at_idx` ON `private_files` (`created_at`);

CREATE UNIQUE INDEX `private_files_filename_idx` ON `private_files` (`filename`);

CREATE UNIQUE INDEX `private_files_submission_key_idx` ON `private_files` (`submission_key`);

CREATE INDEX `private_files_updated_at_idx` ON `private_files` (`updated_at`);

CREATE INDEX `projects__status_idx` ON `projects` (`_status`);

CREATE INDEX `projects_created_at_idx` ON `projects` (`created_at`);

CREATE INDEX `projects_image_idx` ON `projects` (`image_id`);

CREATE UNIQUE INDEX `projects_locales_locale_parent_id_unique` ON `projects_locales` (`_locale`,`_parent_id`);

CREATE INDEX `projects_sections_locale_idx` ON `projects_sections` (`_locale`);

CREATE INDEX `projects_sections_order_idx` ON `projects_sections` (`_order`);

CREATE INDEX `projects_sections_parent_id_idx` ON `projects_sections` (`_parent_id`);

CREATE UNIQUE INDEX `projects_slug_idx` ON `projects` (`slug`);

CREATE INDEX `projects_technologies_order_idx` ON `projects_technologies` (`_order`);

CREATE INDEX `projects_technologies_parent_id_idx` ON `projects_technologies` (`_parent_id`);

CREATE INDEX `projects_updated_at_idx` ON `projects` (`updated_at`);

CREATE UNIQUE INDEX `seo_locales_locale_parent_id_unique` ON `seo_locales` (`_locale`,`_parent_id`);

CREATE INDEX `seo_og_image_idx` ON `seo` (`og_image_id`);

CREATE INDEX `services__status_idx` ON `services` (`_status`);

CREATE INDEX `services_created_at_idx` ON `services` (`created_at`);

CREATE UNIQUE INDEX `services_locales_locale_parent_id_unique` ON `services_locales` (`_locale`,`_parent_id`);

CREATE INDEX `services_updated_at_idx` ON `services` (`updated_at`);

CREATE INDEX `site_settings_founder_photo_idx` ON `site_settings` (`founder_photo_id`);

CREATE UNIQUE INDEX `site_settings_locales_locale_parent_id_unique` ON `site_settings_locales` (`_locale`,`_parent_id`);

CREATE INDEX `social_links_links_locale_idx` ON `social_links_links` (`_locale`);

CREATE INDEX `social_links_links_order_idx` ON `social_links_links` (`_order`);

CREATE INDEX `social_links_links_parent_id_idx` ON `social_links_links` (`_parent_id`);

CREATE INDEX `technologies__status_idx` ON `technologies` (`_status`);

CREATE INDEX `technologies_created_at_idx` ON `technologies` (`created_at`);

CREATE UNIQUE INDEX `technologies_locales_locale_parent_id_unique` ON `technologies_locales` (`_locale`,`_parent_id`);

CREATE INDEX `technologies_updated_at_idx` ON `technologies` (`updated_at`);

CREATE INDEX `testimonials__status_idx` ON `testimonials` (`_status`);

CREATE INDEX `testimonials_avatar_idx` ON `testimonials` (`avatar_id`);

CREATE INDEX `testimonials_created_at_idx` ON `testimonials` (`created_at`);

CREATE UNIQUE INDEX `testimonials_locales_locale_parent_id_unique` ON `testimonials_locales` (`_locale`,`_parent_id`);

CREATE INDEX `testimonials_logo_idx` ON `testimonials` (`logo_id`);

CREATE INDEX `testimonials_updated_at_idx` ON `testimonials` (`updated_at`);

CREATE INDEX `users_created_at_idx` ON `users` (`created_at`);

CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);

CREATE INDEX `users_sessions_order_idx` ON `users_sessions` (`_order`);

CREATE INDEX `users_sessions_parent_id_idx` ON `users_sessions` (`_parent_id`);

CREATE INDEX `users_updated_at_idx` ON `users` (`updated_at`);
