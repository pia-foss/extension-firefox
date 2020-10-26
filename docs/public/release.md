## Chrome/Opera Public Release Process:

### Update Translation files in FF repo (If needed)
- `grunt oneskyExport` in the FF repo
- Create a commit for these updated translations with the commit message "Update Translations"

###  Update VERSION / CHANGELOG and commit
- Update VERSION and CHANGELOG files to latest Public Version Number
- Update CHANGELOG by clearing out all patch versions since last release version
- Create a commit for this change with the commit message `{versionNumber} Public Release`

###  Create CRX file, ZIP file, and info.md files
- `npm run public` This will generate the extension but will need to be uploaded to the Firefox store manually

### Notify Web team to update the client portal
- Message template:
  - `Chrome/Opera v{versionNumber} and Firefox v{FirefoxVersionNumber} Extension have been released publicly.`
- Clean up any files that aren't needed anymore
