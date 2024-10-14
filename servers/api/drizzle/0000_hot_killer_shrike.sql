CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"avatar" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mints" (
	"id" text PRIMARY KEY NOT NULL,
	"uri" text NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"supply" bigint NOT NULL,
	"decimals" integer NOT NULL,
	"metadata" json,
	"creator" text NOT NULL,
	"signature" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "swaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_amount" bigint NOT NULL,
	"pair_amount" bigint NOT NULL,
	"market_cap" bigint NOT NULL,
	"virtual_token_balance" bigint NOT NULL,
	"virtual_pair_balance" bigint NOT NULL,
	"trade_direction" integer NOT NULL,
	"mint" text NOT NULL,
	"payer" text NOT NULL,
	"signature" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "signature_trade_direction" UNIQUE("signature","trade_direction")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "boundingCurve" (
	"id" text PRIMARY KEY NOT NULL,
	"migrated" boolean NOT NULL,
	"tradeable" boolean NOT NULL,
	"initial_price" numeric NOT NULL,
	"liquidity_percentage" numeric NOT NULL,
	"minimum_pair_balance" bigint NOT NULL,
	"maximum_pair_balance" bigint NOT NULL,
	"virtual_token_balance" bigint NOT NULL,
	"virtual_pair_balance" bigint NOT NULL,
	"mint" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mints" ADD CONSTRAINT "mints_creator_users_id_fk" FOREIGN KEY ("creator") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "swaps" ADD CONSTRAINT "swaps_mint_mints_id_fk" FOREIGN KEY ("mint") REFERENCES "public"."mints"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "swaps" ADD CONSTRAINT "swaps_payer_users_id_fk" FOREIGN KEY ("payer") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "boundingCurve" ADD CONSTRAINT "boundingCurve_mint_mints_id_fk" FOREIGN KEY ("mint") REFERENCES "public"."mints"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
