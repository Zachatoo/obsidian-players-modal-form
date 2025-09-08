export type Player = {
	/** Name or link */
	name: string;
	score?: number;
	/** Team or faction */
	team?: string;
	/** Player order position (1-based index) */
	position?: number;
};

export function isPlayer(obj: unknown): obj is Player {
	if (typeof obj !== "object" || obj === null) return false;
	if (!("name" in obj) || typeof obj.name !== "string") return false;
	if ("score" in obj && typeof obj.score !== "number") return false;
	if ("team" in obj && typeof obj.team !== "string") return false;
	if ("position" in obj && typeof obj.position !== "number") return false;
	return true;
}

export function parsePlayers(input: unknown): Player[] {
	if (!Array.isArray(input)) return [];
	const players: Player[] = [];
	for (const item of input) {
		if (isPlayer(item)) {
			players.push(item);
		}
	}
	return players.length > 0 ? players : [];
}
