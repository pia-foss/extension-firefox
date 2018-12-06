__HEAD__

__v1.3.0__

* 1.3.0 Release
* Update Changelog to follow version releases
* Update Translations
* Fixed region sort styling
* Fixed import tab not rendering in private window
* Fix proxy using invalid callback API
* Fix unhandled rejection in bypasslist
* Updated beta & release scripts
* Disabled links when extension offline
* Fixed disabled settings being displayed as checked
* Removed links when setting disabled
* Fixed proxy init
* Ensured fingerprint disclaimer is shown upon first opening extension
* Added missing flags
* Remove download dialog from Bypass Export
* Updated bypasslist import to use tab
* Improved proxy authentication
* Fixed i18n util only replacing first dash in locale
* Fixed spelling mistake in import window
* Added instructional message to import window
* Fixed bypasslist export in private browsing
* Improved http error handling
* Converted proxy to chrome setting
* Fixed authentication dialog presented after changing regions
* Moved remember me tooltip to avoid hiding submit button
* Adopted more reasonable defaults for requests
* Hid debug button when debug mode is off
* Autofocus username input on login screen
* Android support
* Refactored to use native fetch API
* Full Offline support for regions
* Improved general test reliability
* Fixed issue where connfail page wouldn't redirect on refresh
* Added Offline Warning Banner
* Better offline startup support
* Created UI tests

__v1.2.0__

* Updated Translations
* Fixed translation for hyperlink auditing setting
* Fixed style break out in the region selection area
* Updated Error handling to open close popup windows
* Fixed issue where user couldn't import bypass file after changing contents
* Fixed a styling issue with Changelog producing a horizontal scroll
* Fixed a styling issue with "Remember me" tooltip misplaced during login error
* Fixed import window intermittently invisible
* Fixed settings not being initialized properly
* Fixed sign up link on login view
* Fixed Account Settings link on logged in view
* Fixed regression on build info while viewing settings in PB Mode
* Fixed a bug where the proxy disconnects when opening extension in PB Mode
* Added a disclaimer on initial installation warning about the Fingerprint Protection setting
* Added error messages to import popup if file is invalid
* Added tooltip to remember me checkbox
* Fixed visual bug with popover on extension settings
* Updated Changelog to have consistent phrasing
* Updated NPM build script to include automated packaging
* Added linting adhering to airbnb style guide
* Updated the Bypass list custom rule instructions and placeholder
* Fixed components breaking out of parent styling
* Set Fingerprint Protection off by default
* Added "Log me out on browser close" setting
* Fixed bug where extension automatically attempted to log user in
* Debounced proxy button to avoid crashing browser
* Added try/catch along code base to catch any 'dead object' error that hang the UI
* Updated build scripts to include cross-env and predefine all ENV VARS
* Fixed bug where import rules window wouldn't close on Windows
* Fixed bug where UI Language dropdown icon was no longer visible
* Added debug messages to proxy
* Fixed a bug where credentials were being cleared when the popup was closed in a Private Window
* Fixed a bug where user was unable to logout of extension in a Private Window
* Fixed a bug where localStorage was not being cleared by unchecking "remember me" in Private Window
* Fixed input & checkbox styling on linux
* Fixed bug where some extension settings were not being synced with the browser.
* Routed Latency checks through HTTPS
* Added import/export feature for bypass list
* Updated region translations
* Updated project dependencies
* Updated Region selection/favorite tab design

__v1.1.0__

* Updated region translations
* Removed a line that disables the proxy if there are no credentials in storage
* Added Favorite Region view

__v1.0.13__

* Updated helpdesk links
* Updated translations for new Berlin region.

__v1.0.11__

* Fixed a bug where choosing a popular rule in the bypass list kills the proxy
* Updated Translations for Washington DC region.
* Regression fix for async debug function.
* Bug fix for translation text overflow on login view
* Added new bypass list page.
* Fixed warning for Firefox ESR.
* Default Fingerprinting Protection to true
* Fixed a FF specific bug where unload is always fired on page refresh.
* Fixed a Bug with Proxy Connection status not pushed to mockApp in Private Browsing Mode.

__v1.0.3__

* Updated Translations for newest features.
* Overhauled extension to work in Private Browsing Mode.
* Added warning disclaimer ion popup window while in private browsing mode.
* Added 'View Debug Log' button to extension section of settings.

__v1.0.0__

* First release.
