# Steam Screenshot Backup Tool

Downloads all of the public (not private or unlisted) screenshots associated with a Steam profile

This repository is a fork of [Salies' Steam Screenshot Backup Tool](https://github.com/Salies/steam-screenshot-backup-tool).

## Notes:
- Does a complete download of the user's screenshot each run. 

## Changes made:
- 🐛 Fixed bug where last page's worth of screenshots were not downloaded
- ✨ Changed screenshot name to the unique screenshot ID instead of an arbitrary number
- ✨ Folders of screenshots separated by user
- ✨ Incremental downloading of metadata and images
- 🎨 Replaced some recursive logic

## Future work (I am happy to accept PRs for these!):
- Command line flags for downloading user accounts

## Usage
Have **Node v10** or later installed. Using the latest [LTS version](https://nodejs.org/en/download/) is recommended.

```bash
    git clone https://github.com/djbeadle/steam-screenshot-backup-tool; # or download the zip
    cd steam-screenshot-backup-tool;
    npm install;
    npm run start;
```