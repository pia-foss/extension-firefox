__HEAD__

__v.2.4.3__ (26.11.2020)

* Added translations and layout changes for onboarding and just in time

__v.2.4.1__ (17.11.2020)

* Just in time added (rating system)
* Latency rewrite

__v.2.3.2__ (12.11.2020)

* Hotfix for mace

__v.2.3.1__ (5.11.2020)

* Changed port for smart location

__v.2.3.0__ (29.10.2020)

* Added new background image for onboarding tab.
* Added onboarding screen for new users.
* New extra features tab was added.
* Extra features are now all disabled when user connects.
* Rearranged tiles.
* Ip tile is default true.
* Fingerprint protection onboarding screen is no more when users first connect.
* No more warnings for new users.
* Latency tab as default.

__v2.2.7__ (15.09.2020)

* Translations and css changes for some of them.

__v2.2.6__ (11.09.2020)

* Fixed proxyIp to update on smartlocation changes and if users connect or disconnect from proxy.

__v2.2.5__ (10.09.2020)

* Fixed smart location not grabbing correct proxy
* Fixed quickconnect UI not working
* Remember me now clears when false

__v2.2.4__ (24.08.2020)

* Fixed icon when installing extension

__v2.2.3__ (14.08.2020)

* Fixed incognito mode not working
* Smartlocation on incognito working

__v2.2.2__

* Changelog updated
* Fixed extension not working in incognito
* Fix for region tooltip

__v2.2.1__

* Logout fixes
* Always on feature now to firefox to
* Added more functionality to always on to use all options for extension

__v2.2.0__

* Smart location feature added

__v2.1.4__

* Fixed issue with private mode
* Minor improvements

__v2.1.3.1__

* Fixed issue with removed proxy API calls

__v2.1.2__

* Fix Netflix Rule breaking proxy connections

__v2.1.1__

* Fix bypassing Private Browsing Warning on install

__v2.1.0__

* Add warning page to handle changes in proxy permission in Firefox Beta
* Fix exclusions for https-upgrade
* Add unit tests for https-upgrade
* Fix translated region name spacing on region list
* Fix Issue with Logout not redirecting back to Login page
* Fix Issue with displaying Uncontrollable or Upgrade pages
* Fix failing tests
* Add unit tests for https-upgrade
* Improve latency error handling
* Improve latency test results
* Fix translation capitalization
* Decouple security, tracking, privacy settings from proxy
* Fix navigational keybindings
* Update https-upgrade to PIA source
* Add unit test framework
* Add badge to icon
* Add build name to settings page
* Prevent button text in Debug Log from creating horizontal scrollbars
* Prevent text in Debug Log from creating horizontal scrollbars
* Add Bypass Rules Tile
* Adjust CSS to remove green dots from arrows on settings page
* Fix Tile ordering on startup
* Disallow selection of Tile text
* Fix Setting text not updating on language change
* Refactor React code to use the context API for global data
* Migrate to Webpack
* Fix auto region in private browsing
* Add React Router, Remove Renderer Class
* Add https upgrade feature
* Enhanced QA functionality

__v2.0.4__

* Revert latency frequency
* Convert latency test to use ips rather than domains

__v2.0.3__

* Extend latency test frequency to once a day

__v2.0.2__

* 2.0.2 Release
* Update Remember Me tooltip wording
* Add no-op to setAccount if account parameter is undefined
* Add maxlength to bypass rule input field (32779)
* Add maxlength to login input fields (253 chars)
* Backport CSS fixes for text breakout on DebugLog Page
* Fix Typo on Fingerprint Protection disclaimer page
* Beta Release
* Componentize Drawer Handle
* Add Checkmark on Export button after Bypasslist export completion
* Fix tile ordering on authenticated view on theme change
* Adjust spacing for new Translations
* Update Translations
* Removed LogoutOnClose setting
* Added new tests for settings & tiles, improved test core
* Fixed bug where enabling extension in incognito would sometimes log user out
* Translated "view changelog"
* Added homepage to extension page
* Added setting to filter Facebook fbclid query parameters
* Refactored user to remove unnecessary properties
* Add Token Based Authentication
* Add Quick Settings Tile
* Add Subscription Tile
* Add Quick Connect Tile
* Convert current region component to Quick Region Tile
* Add Tiles system to main view
* Add Auto Region
* Add Region Latency refresh button when no regions found
* Move Region latency polling to a timer based system
* Add Region search by name feature
* Remove Region Grid View
* Update view components to met new design spec

__v1.3.1__

* 1.3.1 Release
* Fixed extension breaking on startup with proxy enabled

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
