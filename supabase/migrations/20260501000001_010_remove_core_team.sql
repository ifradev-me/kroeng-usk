-- Remove is_core_team: org structure is now determined by position field
-- Must drop dependent view first, then recreate without is_core_team

DROP VIEW IF EXISTS members_with_division;

ALTER TABLE public.members DROP COLUMN IF EXISTS is_core_team;

CREATE OR REPLACE VIEW members_with_division AS
SELECT
    m.*,
    d.name as division_name,
    d.slug as division_slug
FROM members m
LEFT JOIN divisions d ON m.division_id = d.id
ORDER BY m.order_index ASC;
