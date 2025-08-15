export type PlayerProfile = {
  portraitUrl: string | null
}

export const playerProfile: PlayerProfile = {
  portraitUrl: null,
}

export async function loadPlayerProfile(): Promise<void> {
  try {
    const res = await fetch('/api/profile')
    if (!res.ok) throw new Error('bad response')
    const data = await res.json()
    playerProfile.portraitUrl = data?.portraitUrl ?? null
  } catch {
    playerProfile.portraitUrl = null
  }
}
