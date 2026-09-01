import { pool } from "../config/db.js";
const themeSettingsSelectFields = "id, primary_color, secondary_color, accent_color, hero_media_type, hero_media_url, created_at, updated_at";
export const getThemeSettings = async () => {
    const [rows] = await pool.execute(`SELECT ${themeSettingsSelectFields} 
    FROM theme_settings 
    WHERE id = 1 
    LIMIT 1`);
    return rows[0] ?? null;
};
export const updateThemeSettings = async (input) => {
    await pool.execute(`INSERT INTO theme_settings (id, primary_color, secondary_color, accent_color, hero_media_type)
         VALUES (1, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE primary_color = VALUES(primary_color),
         secondary_color = VALUES(secondary_color), accent_color = VALUES(accent_color),
         hero_media_type = VALUES(hero_media_type)`, [
        input.primary_color,
        input.secondary_color,
        input.accent_color,
        input.hero_media_type,
    ]);
    return getThemeSettings();
};
export const updateHeroMedia = async (heroMediaType, heroMediaUrl) => {
    await pool.execute(`UPDATE theme_settings SET hero_media_type = ?, hero_media_url = ?
    WHERE id = 1`, [heroMediaType, heroMediaUrl]);
    return getThemeSettings();
};
//# sourceMappingURL=themeSettingsRepository.js.map