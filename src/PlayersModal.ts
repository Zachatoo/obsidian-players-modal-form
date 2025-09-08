import { App, ButtonComponent, Modal, Setting, TFile } from "obsidian";
import { parsePlayers, Player } from "./Player";
import { PersonInputSuggest } from "./PersonInputSuggest";

export class PlayersModal extends Modal {
	private file: TFile;
	private players: Player[] = [];
	constructor(app: App, file: TFile) {
		super(app);
		this.file = file;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.addClass("players-modal");
		contentEl.setText("Players");

		const frontmatter =
			this.app.metadataCache.getFileCache(this.file)?.frontmatter ?? {};
		this.players = parsePlayers(frontmatter.players);
		if (this.players.length === 0) {
			this.players.push({ name: "" });
		}

		this.buildForm();
	}

	buildForm() {
		const { contentEl } = this;
		contentEl.empty();

		this.players.forEach((player, index) => {
			const playerDiv = contentEl.createDiv({ cls: "player-entry" });

			const heading = new Setting(playerDiv)
				.setName(`Player ${index + 1}`)
				.setHeading();
			if (this.players.length > 1) {
				heading.addButton((btn) => {
					btn.setTooltip("Remove")
						.setIcon("trash")
						.onClick(() => {
							this.players.splice(index, 1);
							this.buildForm();
						});
				});
			}

			new Setting(playerDiv)
				.setName("Name")
				.setDesc("Enter player name, supports plain text or a link.")
				.addText((text) => {
					text.setValue(player.name);
					new PersonInputSuggest(
						this.app,
						text.inputEl,
						this.file.path
					);
					text.onChange((value) => {
						player.name = value;
					});
				});

			new Setting(playerDiv)
				.setName("Score")
				.setDesc("Enter player score.")
				.addText((text) => {
					text.inputEl.type = "number";
					text.setValue(player.score?.toString() ?? "");
					text.onChange((value) => {
						player.score = parseInt(value);
					});
				});

			new Setting(playerDiv)
				.setName("Team")
				.setDesc("Enter team or faction name.")
				.addText((text) => {
					text.setValue(player.team ?? "");
					text.onChange((value) => {
						player.team = value;
					});
				});

			new Setting(playerDiv)
				.setName("Position")
				.setDesc("Enter player order position.")
				.addText((text) => {
					text.inputEl.type = "number";
					text.setValue(player.position?.toString() ?? "");
					text.onChange((value) => {
						player.position = parseInt(value);
					});
				});

			new Setting(playerDiv).addButton((btn) =>
				btn
					.setButtonText("Add player below")
					.setCta()
					.onClick(() => {
						this.players.splice(index + 1, 0, { name: "" });
						this.buildForm();
					})
			);
		});

		const buttonContainer = this.contentEl.createDiv(
			"modal-button-container"
		);
		new ButtonComponent(buttonContainer)
			.setButtonText("Save")
			.setCta()
			.onClick(() => this.save());
		new ButtonComponent(buttonContainer)
			.setButtonText("Cancel")
			.onClick(() => this.close());
	}

	async save() {
		const cleanPlayers = this.players
			.map((player) => {
				Object.entries(player).forEach(([key, value]) => {
					if (value === undefined || value === null || value === "") {
						delete player[key as keyof Player];
					}
				});
				return player;
			})
			.filter((player) => Object.keys(player).length > 0);
		await this.app.fileManager.processFrontMatter(
			this.file,
			(frontmatter) => {
				frontmatter.players = cleanPlayers;
			}
		);
		this.close();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
