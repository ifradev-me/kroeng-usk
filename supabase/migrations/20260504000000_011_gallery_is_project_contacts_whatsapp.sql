-- Add is_project flag to gallery table
ALTER TABLE gallery ADD COLUMN is_project boolean NOT NULL DEFAULT false;

-- Add whatsapp column to contacts and make email optional
ALTER TABLE contacts ADD COLUMN whatsapp text;
ALTER TABLE contacts ALTER COLUMN email DROP NOT NULL;
