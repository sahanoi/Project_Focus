CREATE TABLE IF NOT EXISTS "community_habits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text,
	"name" text NOT NULL,
	"icon" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"unit" text,
	"daily_target" integer,
	"goal_value" integer,
	"is_featured" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "community_habits_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "guilds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text DEFAULT '⚔️' NOT NULL,
	"banner_color" text DEFAULT '#6366f1' NOT NULL,
	"community_habit_id" uuid,
	"is_public" boolean DEFAULT true NOT NULL,
	"max_members" integer DEFAULT 50 NOT NULL,
	"member_count" integer DEFAULT 1 NOT NULL,
	"owner_id" uuid NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"weekly_xp" integer DEFAULT 0 NOT NULL,
	"ladder_tier" text DEFAULT 'Iron' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "guilds_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_community_habits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"community_habit_id" uuid NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "community_habit_xp" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"community_habit_id" uuid NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL,
	"best_streak" integer DEFAULT 0 NOT NULL,
	"total_completions" integer DEFAULT 0 NOT NULL,
	"last_completed_date" date,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "weekly_leaderboard" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_habit_id" uuid,
	"guild_id" uuid,
	"week_start" date NOT NULL,
	"user_id" uuid NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"completions" integer DEFAULT 0 NOT NULL,
	"rank" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "guild_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guild_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now(),
	"weekly_xp" integer DEFAULT 0 NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "guild_ladder_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guild_id" uuid NOT NULL,
	"season_number" integer NOT NULL,
	"start_rank" text NOT NULL,
	"end_rank" text NOT NULL,
	"xp_earned" integer DEFAULT 0 NOT NULL,
	"season_start" date NOT NULL,
	"season_end" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "social_feed" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"community_habit_id" uuid,
	"guild_id" uuid,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "friendships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"friend_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "habit_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenger_id" uuid NOT NULL,
	"challengee_id" uuid NOT NULL,
	"community_habit_id" uuid NOT NULL,
	"duration_days" integer DEFAULT 7 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"challenger_score" integer DEFAULT 0 NOT NULL,
	"challengee_score" integer DEFAULT 0 NOT NULL,
	"winner_id" uuid,
	"start_date" date,
	"end_date" date,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guilds" ADD CONSTRAINT "guilds_community_habit_id_community_habits_id_fk" FOREIGN KEY ("community_habit_id") REFERENCES "public"."community_habits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guilds" ADD CONSTRAINT "guilds_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_community_habits" ADD CONSTRAINT "user_community_habits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_community_habits" ADD CONSTRAINT "user_community_habits_community_habit_id_community_habits_id_fk" FOREIGN KEY ("community_habit_id") REFERENCES "public"."community_habits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "community_habit_xp" ADD CONSTRAINT "community_habit_xp_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "community_habit_xp" ADD CONSTRAINT "community_habit_xp_community_habit_id_community_habits_id_fk" FOREIGN KEY ("community_habit_id") REFERENCES "public"."community_habits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "weekly_leaderboard" ADD CONSTRAINT "weekly_leaderboard_community_habit_id_community_habits_id_fk" FOREIGN KEY ("community_habit_id") REFERENCES "public"."community_habits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "weekly_leaderboard" ADD CONSTRAINT "weekly_leaderboard_guild_id_guilds_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "weekly_leaderboard" ADD CONSTRAINT "weekly_leaderboard_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guild_members" ADD CONSTRAINT "guild_members_guild_id_guilds_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guild_members" ADD CONSTRAINT "guild_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guild_ladder_history" ADD CONSTRAINT "guild_ladder_history_guild_id_guilds_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "social_feed" ADD CONSTRAINT "social_feed_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "social_feed" ADD CONSTRAINT "social_feed_community_habit_id_community_habits_id_fk" FOREIGN KEY ("community_habit_id") REFERENCES "public"."community_habits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "social_feed" ADD CONSTRAINT "social_feed_guild_id_guilds_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friend_id_users_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habit_challenges" ADD CONSTRAINT "habit_challenges_challenger_id_users_id_fk" FOREIGN KEY ("challenger_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habit_challenges" ADD CONSTRAINT "habit_challenges_challengee_id_users_id_fk" FOREIGN KEY ("challengee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habit_challenges" ADD CONSTRAINT "habit_challenges_community_habit_id_community_habits_id_fk" FOREIGN KEY ("community_habit_id") REFERENCES "public"."community_habits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habit_challenges" ADD CONSTRAINT "habit_challenges_winner_id_users_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_community_habits_user_id_community_habit_id" ON "user_community_habits" USING btree ("user_id","community_habit_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "community_habit_xp_user_id_community_habit_id" ON "community_habit_xp" USING btree ("user_id","community_habit_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "weekly_leaderboard_habit_guild_week_user" ON "weekly_leaderboard" USING btree ("community_habit_id","guild_id","week_start","user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "guild_members_guild_id_user_id" ON "guild_members" USING btree ("guild_id","user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "friendships_user_id_friend_id" ON "friendships" USING btree ("user_id","friend_id");
