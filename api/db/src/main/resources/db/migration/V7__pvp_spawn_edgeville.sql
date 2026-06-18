-- Set PvP spawn and respawn to Edgeville (just outside wilderness ditch, x=3094 z=3493)
UPDATE realms
SET spawn_coord   = '0_48_54_22_37',
    respawn_coord = '0_48_54_22_37'
WHERE name = 'dev';

-- Move all existing characters to the new spawn so they don't load at Lumbridge
UPDATE characters
SET x = 3094, z = 3493, level = 0;
