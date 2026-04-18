DO $$ BEGIN
  ALTER TABLE "mints" ALTER COLUMN "supply" SET DATA TYPE numeric(40, 0);
EXCEPTION WHEN others THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "swaps" ALTER COLUMN "token_amount" SET DATA TYPE numeric(40, 0);
EXCEPTION WHEN others THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "swaps" ALTER COLUMN "pair_amount" SET DATA TYPE numeric(40, 0);
EXCEPTION WHEN others THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "swaps" ALTER COLUMN "market_cap" SET DATA TYPE numeric(40, 0);
EXCEPTION WHEN others THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "swaps" ALTER COLUMN "virtual_token_balance" SET DATA TYPE numeric(40, 0);
EXCEPTION WHEN others THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "swaps" ALTER COLUMN "virtual_pair_balance" SET DATA TYPE numeric(40, 0);
EXCEPTION WHEN others THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "boundingCurve" ALTER COLUMN "minimum_pair_balance" SET DATA TYPE numeric(40, 0);
EXCEPTION WHEN others THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "boundingCurve" ALTER COLUMN "maximum_pair_balance" SET DATA TYPE numeric(40, 0);
EXCEPTION WHEN others THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "boundingCurve" ALTER COLUMN "virtual_token_balance" SET DATA TYPE numeric(40, 0);
EXCEPTION WHEN others THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "boundingCurve" ALTER COLUMN "virtual_pair_balance" SET DATA TYPE numeric(40, 0);
EXCEPTION WHEN others THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "boundingCurve" ADD COLUMN "initial_supply" numeric(40, 0) NOT NULL;
EXCEPTION WHEN duplicate_column THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "boundingCurve" ADD COLUMN "net_active_capital" numeric(40, 0) NOT NULL;
EXCEPTION WHEN duplicate_column THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "boundingCurve" ADD COLUMN "total_contributed" numeric(40, 0) NOT NULL;
EXCEPTION WHEN duplicate_column THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "boundingCurve" ADD COLUMN "total_burned_tokens" numeric(40, 0) NOT NULL;
EXCEPTION WHEN duplicate_column THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "boundingCurve" ADD COLUMN "total_fees_collected" numeric(40, 0) NOT NULL;
EXCEPTION WHEN duplicate_column THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "boundingCurve" ADD COLUMN "bump" integer NOT NULL;
EXCEPTION WHEN duplicate_column THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "boundingCurve" ADD COLUMN "reserve_bump" integer NOT NULL;
EXCEPTION WHEN duplicate_column THEN null; END $$;