import {
	AbstractInputSuggest,
	App,
	prepareFuzzySearch,
	SearchMatches,
	setIcon,
	TFile,
} from "obsidian";

type FileSuggestion = {
	type: "file";
	file: TFile;
	path: string;
	score: number;
	matches: SearchMatches | null;
};
type AliasSuggestion = {
	type: "alias";
	alias: string;
	file: TFile;
	path: string;
	score: number;
	matches: SearchMatches | null;
};
type LinkTextSuggestion = {
	type: "linktext";
	path: string;
	score: number;
	matches: SearchMatches | null;
};
type Suggestion = FileSuggestion | AliasSuggestion | LinkTextSuggestion;

export class PersonInputSuggest extends AbstractInputSuggest<Suggestion> {
	private inputEl: HTMLInputElement;
	private sourcePath: string;
	constructor(app: App, inputEl: HTMLInputElement, sourcePath: string) {
		super(app, inputEl);
		this.inputEl = inputEl;
		this.sourcePath = sourcePath;
	}

	getSuggestions(inputStr: string): Suggestion[] {
		const allSuggestions = this.app.metadataCache.getLinkSuggestions();
		const peopleSuggestions = allSuggestions.filter((s) =>
			s.path.startsWith("People/")
		);
		if (peopleSuggestions.length === 0) return [];
		const suggestions: Suggestion[] = [];
		if (inputStr.trim() === "") {
			for (const suggestion of peopleSuggestions) {
				if (suggestion.file) {
					if (suggestion.alias) {
						suggestions.push({
							type: "alias",
							alias: suggestion.alias,
							file: suggestion.file,
							path: suggestion.path,
							score: suggestion.file.stat.mtime,
							matches: null,
						});
					} else {
						suggestions.push({
							type: "file",
							file: suggestion.file,
							path: suggestion.path,
							score: suggestion.file.stat.mtime,
							matches: null,
						});
					}
				} else {
					suggestions.push({
						type: "linktext",
						path: suggestion.path,
						score: 0,
						matches: null,
					});
				}
			}
		} else {
			const fuzzySearch = prepareFuzzySearch(inputStr);
			for (const suggestion of peopleSuggestions) {
				if (suggestion.file) {
					if (suggestion.alias) {
						const result = fuzzySearch(suggestion.alias);
						if (result) {
							suggestions.push({
								type: "alias",
								alias: suggestion.alias,
								file: suggestion.file,
								path: suggestion.path,
								score: result.score,
								matches: result.matches,
							});
						}
					} else {
						const result = fuzzySearch(suggestion.file.path);
						if (result) {
							suggestions.push({
								type: "file",
								file: suggestion.file,
								path: suggestion.path,
								score: result.score,
								matches: result.matches,
							});
						}
					}
				} else {
					const result = fuzzySearch(suggestion.path);
					if (result) {
						suggestions.push({
							type: "linktext",
							path: suggestion.path,
							score: result.score,
							matches: result.matches,
						});
					}
				}
			}
			suggestions.sort((a, b) => b.score - a.score);
		}
		return suggestions;
	}

	renderSuggestion(suggestion: Suggestion, el: HTMLElement) {
		el.addClass("mod-complex");
		if (suggestion.type === "linktext") {
			el.createDiv({ cls: "suggestion-content" }).setText(
				suggestion.path
			);
			return;
		}
		const title =
			suggestion.type === "alias"
				? suggestion.alias
				: suggestion.file.basename;
		const note =
			suggestion.type === "alias"
				? suggestion.path
				: suggestion.file.parent?.path + "/";
		const content = el.createDiv({ cls: "suggestion-content" });
		content.createDiv({ cls: "suggestion-title" }).setText(title);
		content.createDiv({ cls: "suggestion-note" }).setText(note);
		if (suggestion.type === "alias") {
			const flairEl = el.createDiv({ cls: "suggestion-aux" }).createSpan({
				cls: "suggestion-flair",
				attr: { "aria-label": "Alias" },
			});
			setIcon(flairEl, "lucide-forward");
		}
	}

	selectSuggestion(suggestion: Suggestion) {
		this.setValue(this.getLinkFromSuggestion(suggestion));
		this.inputEl.trigger("input");
		this.close();
	}

	getLinkFromSuggestion(suggestion: Suggestion): string {
		if (suggestion.type === "linktext") {
			return `[[${suggestion.path}]]`;
		}
		return this.app.fileManager.generateMarkdownLink(
			suggestion.file,
			this.sourcePath,
			undefined,
			suggestion.type === "alias" ? suggestion.alias : undefined
		);
	}
}
