import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export type CharacterParams = Record<string, string | undefined>;

export interface CharacterPreset {
    id: string;
    name?: string;
    portraitUrl?: string;
    params: CharacterParams;
    [key: string]: any;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRESET_DIR = path.resolve(__dirname, '../../../assets/characters/presets');

function loadPresetLibrary(): CharacterPreset[] {
    try {
        const files = fs.readdirSync(PRESET_DIR).filter(f => f.endsWith('.json'));
        return files.map(file => {
            const raw = fs.readFileSync(path.join(PRESET_DIR, file), 'utf-8');
            return JSON.parse(raw) as CharacterPreset;
        });
    } catch {
        return [];
    }
}

const PRESETS: CharacterPreset[] = loadPresetLibrary();

export function findClosestPreset(params: CharacterParams): CharacterPreset | null {
    let best: CharacterPreset | null = null;
    let bestScore = -1;
    for (const preset of PRESETS) {
        let score = 0;
        for (const key of Object.keys(params)) {
            if (params[key] !== undefined && preset.params?.[key] === params[key]) {
                score += 1;
            }
        }
        if (score > bestScore) {
            best = preset;
            bestScore = score;
        }
    }
    return best;
}

export function customizePreset(preset: CharacterPreset, params: CharacterParams): CharacterPreset {
    return {
        ...preset,
        params: {
            ...preset.params,
            ...params,
        },
    };
}

export function getFallbackCharacter(params: CharacterParams): CharacterPreset {
    const match = findClosestPreset(params);
    if (match) {
        return customizePreset(match, params);
    }
    return {
        id: 'fallback',
        params,
    };
}

export default getFallbackCharacter;
