/* eslint-disable no-undef */
import "obsidian";

declare module "obsidian" {
	interface MetadataCache {
		getLinkSuggestions: () => {
			path: string;
			file?: TFile;
			alias?: string;
		}[];
	}
}
