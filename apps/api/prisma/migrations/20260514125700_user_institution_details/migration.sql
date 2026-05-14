-- Add applicant institution details captured during registration.
ALTER TABLE "users"
ADD COLUMN "institutionName" TEXT,
ADD COLUMN "institutionCategory" TEXT;
