# Players Modal Form

Personal plugin for managing players for a logged play session in my vault. I do not currently have plans to expand this to be usable for other use cases.

<img width="523" height="521" alt="image" src="https://github.com/user-attachments/assets/33c571e5-95af-4979-bada-7fc9288aa5eb" />

## Contributing

### Releasing new releases

-   Update your `manifest.json` with the minimum Obsidian version required for your latest release. This step is only required if you're using newer APIs that are not available in the current minimum Obsidian version you're using.
-   Run `npm version patch`, `npm version minor` or `npm version major`.
    -   The command will bump version in `manifest.json` and `package.json`, and add the entry for the new version to `versions.json`. It will also create a git tag matching the version.
-   Push to git with the `--follow-tags` flag.
