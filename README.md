# Steam Screenshot Backup Tool

Downloads all of the public (not private or unlisted) screenshots associated with a Steam profile

This repository is a fork of [Salies' Steam Screenshot Backup Tool](https://github.com/Salies/steam-screenshot-backup-tool).

## Notes:
- Does a complete download of the user's screenshot each run. 

## Changes made:
- 🐛 Fixed bug where last page's worth of screenshots were not downloaded
- ✨ Changed screenshot name to the unique screenshot ID instead of an arbitrary number
- 🎨 Replaced some recursive logic

## Outstanding issues (I am happy to accept PRs to fix these!):
- Program hangs when all downloads finish, user must press `CTRL-c` to safely quit
- Incremental downloads (`data.json` is deleted on startup at the moment)
- Would be nice to be able to download multiple users' screenshots side by side
## Usage
Have **Node v10** or later installed. Using the latest [LTS version](https://nodejs.org/en/download/) is recommended.

```bash
    git clone https://github.com/djbeadle/steam-screenshot-backup-tool; # or download the zip
    cd steam-screenshot-backup-tool;
    npm install;
    npm run start;
```