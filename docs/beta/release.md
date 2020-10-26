## Firefox Beta Release Process:

### Init
- Please start in in the Chrome repo and return when directed to this repo

### Update .env file
- Update RELEASE_DATE
- UPDATE CHANGELOG_START and CHANGELOG_END

### Update Translation files in FF repo
- `grunt oneskyExport` in the FF repo
- Create a commit for these updated translations with the commit message "Update Translations"

### Update VERSION / CHANGELOG and commit
- Update VERSION and CHANGELOG files to latest Beta Version Number
- Update CHANGELOG by clearing out all patch versions
- Create a commit for this change with the commit message `{versionNumber} Beta Release`
  - `git commit` add `--allow-empty` if no files to commit

### Create CRX file, ZIP file, and info.md files
- `npm run beta`

### Merge beta into develop
- `git checkout develop`
- `git pull origin develop`
- `get merge --no-ff beta/{betaReleaseVersion}`

### Return to the Chrome Repo for final instructions
- Build Chrome/Opera Beta distributables
- Master zip containing all files
