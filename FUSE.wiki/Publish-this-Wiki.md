# Publish this Wiki

These pages live under `/wiki` in the repository. To publish them as the GitHub Wiki, use one of the options below.

## Option A: GitHub Web UI (manual)

1. Open https://github.com/eugenioduarte/Fuse/wiki
2. Create pages with the same titles (e.g., `Home`, `Getting Started`, etc.).
3. Copy markdown from the repository `/wiki/*.md` into the wiki pages.
4. Use the side navigation and `[[Page Name]]` links to cross-link pages.

## Option B: Git (recommended for bulk updates)

```bash
# Clone the wiki repository (separate git repo)
git clone https://github.com/eugenioduarte/Fuse.wiki.git
cd Fuse.wiki

# Copy generated pages from the app repo
# Adjust the path to your local checkout root
cp -f ../Fuse/wiki/*.md .

# Commit and push
git add -A
git commit -m "docs(wiki): sync wiki pages from app repo"
git push
```

Notes:

- The wiki uses page titles derived from filenames. Keep names concise.
- Links like `[[Getting Started]]` will resolve automatically in the wiki.
- Update these files in `/wiki` and repeat this process to maintain the wiki.
