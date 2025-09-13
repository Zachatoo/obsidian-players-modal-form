export type Player = {
	/** Name or link */
	name: string;
	/** Whether the player is the winner or on the winning team */
	won?: boolean;
	/** Score, could be a number (34) or a string (Gold) */
	score?: number | string;
	/** Team or faction */
	team?: string;
	/** Player order position (1-based index) */
	position?: number;
	/** Whether this is the first time this player has played this game */
	firstTimePlayer?: boolean;
};

export function isPlayer(obj: unknown): obj is Player {
	if (typeof obj !== "object" || obj === null) return false;
	if (!("name" in obj) || typeof obj.name !== "string") return false;
	if ("score" in obj && !["number", "string"].includes(typeof obj.score))
		return false;
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
