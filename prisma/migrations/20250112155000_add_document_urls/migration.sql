-- Add document_urls array field
ALTER TABLE "applications" ADD COLUMN "document_urls" TEXT[] DEFAULT '{}';

-- Migrate existing document URLs to the new array field
UPDATE "applications" SET "document_urls" = 
  ARRAY_REMOVE(
    ARRAY[
      CASE WHEN "vessel_registration" IS NOT NULL AND "vessel_registration" != '' THEN "vessel_registration" ELSE NULL END,
      CASE WHEN "insurance_policy" IS NOT NULL AND "insurance_policy" != '' THEN "insurance_policy" ELSE NULL END,
      CASE WHEN "captain_passport_scan" IS NOT NULL AND "captain_passport_scan" != '' THEN "captain_passport_scan" ELSE NULL END
    ], 
    NULL
  )
WHERE "vessel_registration" IS NOT NULL OR "insurance_policy" IS NOT NULL OR "captain_passport_scan" IS NOT NULL;

-- Drop old individual document columns
ALTER TABLE "applications" DROP COLUMN "vessel_registration";
ALTER TABLE "applications" DROP COLUMN "insurance_policy";  
ALTER TABLE "applications" DROP COLUMN "captain_passport_scan";

-- Drop yapimyili table if it exists (seems unused)
DROP TABLE IF EXISTS "yapimyili";