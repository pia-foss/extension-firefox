__HEAD__

__v1.1.20__

* Added error messages to import popup if file is invalid

__v1.1.19__

* Added tooltip to remember me checkbox

__v1.1.18__

* Fixed visual bug with popover on extension settings

* Updated Changelog to have consistent phrasing

__v1.1.17__

* Updated NPM build script to include automated packaging

* Added linting adhering to airbnb style guide

__v1.1.16__

* Updated the Bypass list custom rule instructions and placeholder

__v1.1.15__

* Fixed components breaking out of parent styling

__v1.1.14__

* Set Fingerprint Protection off by default

__v1.1.13__

* Added "Log me out on browser close" setting

__v1.1.12__

* Fixed bug where extension automatically attempted to log user in

__v1.1.11__

* Debounced proxy button to avoid crashing browser

__v1.1.10__

* Added try/catch along code base to catch any 'dead object' error that hang the UI

* Updated build scripts to include cross-env and predefine all ENV VARS

__v1.1.9__

* Fixed bug where import rules window wouldn't close on Windows

__v1.1.8__

* Fixed bug where UI Language dropdown icon was no longer visible

* Added debug messages to proxy

__v1.1.7__

* Fixed a bug where credentials were being cleared when the popup was closed in a Private Window
* Fixed a bug where user was unable to logout of extension in a Private Window
* Fixed a bug where localStorage was not being cleared by unchecking "remember me" in Private Window

__v1.1.6__

* Fixed input & checkbox styling on linux

__v1.1.5__

* Fixed bug where some extension settings were not being synced with the browser.

__v1.1.4__

* Routed Latency checks through HTTPS

__v1.1.3__

* Added import/export feature for bypass list

__v1.1.2__

* Updated region translations

* Updated project dependencies

__v1.1.1__

* Updated Region selection/favorite tab design

__v1.1.0__

* Updated region translations

* Removed a line that disables the proxy if there are no credentials in storage

* Added Favorite Region view

__v1.0.13__

* Updated helpdesk links

* Updated translations for new Berlin region.

__v1.0.11__

* Fixed a bug where choosing a popular rule in the bypass list kills the proxy.

__v1.0.10__

* Updated Translations for Washington DC region.

__v1.0.9__

* Regression fix for async debug function.

__v1.0.8__

* Bug fix for translation text overflow on login view

__v1.0.7__

* Added new bypass list page.

__v1.0.6__

* Fixed warning for Firefox ESR.

* Default Fingerprinting Protection to true

__v1.0.5__

* Fixed a FF specific bug where unload is always fired on page refresh.

* Fixed a Bug with Proxy Connection status not pushed to mockApp in Private Browsing Mode.

__v1.0.3__

* Updated Translations for newest features.

* Overhauled extension to work in Private Browsing Mode.

* Added warning disclaimer ion popup window while in private browsing mode.

* Added 'View Debug Log' button to extension section of settings.

__v1.0.0__

* First release.
