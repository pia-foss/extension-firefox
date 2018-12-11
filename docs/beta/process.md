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

### Create CRX file, ZIP file, and info.md files
- `npm run beta`

### Return to the Chrome Repo for final instructions
- Build Chrome/Opera Beta distributables
- Master zip containing all files


## Beta/Release Git Branching Model
- When all issues leading up to a beta release have been merged into `develop`, create a beta branch
  - Naming scheme: `beta/v{versionNumber}`
- Issues related to the beta after this beta can still be merged into `develop`
- Create a dist from the latest commit in the beta branch to hand over to QA for a Charter Review
- Any issues found during Charter Review of the beta must be merged into the `beta/v{versionNumber}` branch
- Once Charter Review is complete, a new dist should be made from the latest commit in the beta branch
  - If no issues were found, then using the previous dist is fine
- Distribute this dist to the @web team
- Beta periods can be as short as one week to as long as needed to address all issues
- Once the beta period is over, a "release" branch should be made from the beta branch
  - Naming scheme: `release/v{versionNumber}`
  - The beta branch can be ignored from now on, but should not be deleted yet
- Create a new dist from the latest commit of the release branch to send to QA for another Charter Review
- Any issues found during Charter Review of the beta must be merged into the release branch
- Once Charter Review is complete, merge the release branch into `master`
- Create a new public dist from the latest commit in master
- Merge the `master` branch into the `develop` branch
- Delete the beta branch
- Keep the current release branch around until the next release
- Delete the previous release branch
