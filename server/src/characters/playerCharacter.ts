import fs from 'node:fs';
import path from 'node:path';

export interface PlayerCharacter {
  characterId: string;
  playerId: string;
  name: string;
  portraitUrl: string;
  creationParameters: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  level: number;
  experience: number;
  classType: string;
  displayName: string;
  visibility: 'public' | 'private';
}

const DATA_FILE = path.join(process.cwd(), 'data', 'characters', 'playerCharacters.json');

function readAll(): PlayerCharacter[] {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) as PlayerCharacter[];
}

function writeAll(chars: PlayerCharacter[]) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(chars, null, 2));
}

export function createCharacter(data: Omit<PlayerCharacter, 'createdAt' | 'updatedAt'>): PlayerCharacter {
  const now = new Date().toISOString();
  const character: PlayerCharacter = { ...data, createdAt: now, updatedAt: now };
  const chars = readAll();
  const idx = chars.findIndex(c => c.characterId === character.characterId);
  if (idx >= 0) {
    chars[idx] = character;
  } else {
    chars.push(character);
  }
  writeAll(chars);
  return character;
}

export function getCharacter(characterId: string): PlayerCharacter | undefined {
  const chars = readAll();
  return chars.find(c => c.characterId === characterId);
}

export function listCharacters(playerId?: string): PlayerCharacter[] {
  const chars = readAll();
  return playerId ? chars.filter(c => c.playerId === playerId) : chars;
}

export function updateCharacter(characterId: string, updates: Partial<PlayerCharacter>): PlayerCharacter | undefined {
  const chars = readAll();
  const idx = chars.findIndex(c => c.characterId === characterId);
  if (idx === -1) return undefined;
  const now = new Date().toISOString();
  chars[idx] = { ...chars[idx], ...updates, characterId, updatedAt: now };
  writeAll(chars);
  return chars[idx];
}

export function deleteCharacter(characterId: string): boolean {
  const chars = readAll();
  const remaining = chars.filter(c => c.characterId !== characterId);
  if (remaining.length === chars.length) return false;
  writeAll(remaining);
  return true;
}
