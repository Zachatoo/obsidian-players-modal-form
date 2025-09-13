import { App, ButtonComponent, Modal, Setting, TFile } from "obsidian";
import { parsePlayers, Player } from "./Player";
import { PersonInputSuggest } from "./PersonInputSuggest";

export class PlayersModal extends Modal {
	private file: TFile;
	private players: Player[] = [];
	private cb?: (data?: Player[]) => void;
	private isSaved = false;

	constructor(app: App, file: TFile, cb?: (data?: Player[]) => void) {
		super(app);
		this.file = file;
		if (cb instanceof Function) this.cb = cb;
		this.scope.register(["Mod"], "N", (evt) => {
			this.addPlayer();
		});
		this.scope.register(["Mod"], "S", (evt) => {
			this.save();
		});
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
				.setName("Won")
				.setDesc(
					"Whether the player is the winner or on the winning team."
				)
				.addToggle((toggle) => {
					toggle.setValue(player.won ?? false);
					toggle.onChange((value) => {
						player.won = value;
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

			new Setting(playerDiv)
				.setName("First time player")
				.setDesc(
					"Whether this is the first time this player has played this game."
				)
				.addToggle((toggle) => {
					toggle.setValue(player.firstTimePlayer ?? false);
					toggle.onChange((value) => {
						player.firstTimePlayer = value;
					});
				});

			new Setting(playerDiv).addButton((btn) =>
				btn
					.setButtonText("Add player below")
					.setCta()
					.onClick(() => {
						this.addPlayer(index + 1);
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

	private addPlayer(index?: number) {
		if (index === undefined) index = this.players.length;
		this.players.splice(index, 0, { name: "" });
		this.buildForm();

		const playerEntries = this.contentEl.querySelectorAll(".player-entry");
		const newPlayerEntry = playerEntries[index];
		if (newPlayerEntry) {
			const nameInput =
				newPlayerEntry.querySelector('input[type="text"]');
			if (nameInput instanceof HTMLInputElement) {
				nameInput.focus();
			}
		}
	}

	async save() {
		const cleanPlayers = this.players
			.map((player) => {
				Object.entries(player).forEach(([key, value]) => {
					if (
						value === undefined ||
						value === null ||
						value === "" ||
						value === false
					) {
						delete player[key as keyof Player];
					}
				});
				return player;
			})
			.filter((player) => Object.keys(player).length > 0);
		if (this.cb instanceof Function) {
			this.cb(cleanPlayers);
			this.isSaved = true;
		} else {
			await this.app.fileManager.processFrontMatter(
				this.file,
				(frontmatter) => {
					frontmatter.players = cleanPlayers;
				}
			);
			this.isSaved = true;
		}
		this.close();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
		if (!this.isSaved && this.cb instanceof Function) {
			this.cb();
		}
	}
}
