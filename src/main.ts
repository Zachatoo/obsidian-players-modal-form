import { MarkdownView, Plugin, TFile } from "obsidian";
import { PlayersModal } from "./PlayersModal";
import { Player } from "./Player";

export default class PlayersModalFormPlugin extends Plugin {
	async onload() {
		this.addCommand({
			id: "open-players-modal",
			name: "Open players modal",
			checkCallback: (checking) => {
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView instanceof MarkdownView && markdownView.file) {
					if (checking) return true;
					new PlayersModal(this.app, markdownView.file).open();
				}
				return false;
			},
		});

		this.registerDomEvent(activeWindow, "click", (evt) => {
			if (!(evt.target instanceof HTMLElement)) return;
			if (
				!evt.target.closest(
					'.metadata-property[data-property-key="players"] .metadata-property-value'
				)
			)
				return;
			const markdownView =
				this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!(markdownView instanceof MarkdownView) || !markdownView.file)
				return;
			new PlayersModal(this.app, markdownView.file).open();
		});
	}

	async openModal(file: TFile | null) {
		if (!file || !(file instanceof TFile)) return;
		return new Promise<Player[] | undefined>((resolve) => {
			new PlayersModal(this.app, file, resolve).open();
		});
	}
}
