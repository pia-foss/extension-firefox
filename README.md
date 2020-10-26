[![PIA logo][pia-image]][pia-url]

README v0.3 / 15 January 2019

# Private Internet Access
Private Internet Access is the world's leading consumer VPN service. At Private Internet Access we believe in unfettered access for all, and as a firm supporter of the open source ecosystem we have made the decision to open source our VPN clients. For more information about the PIA service, please visit our website [privateinternetaccess.com](https://privateinternetaccess.com).


# Firefox Web Extension
This repo contains all the code needed to build and run the Private Internet Access Firefox Web Extension. This extension allows a user to access our network of proxies across the world from their web browser. Users can choose a proxy server location and connect to it directly from the extension. Additional privacy and security features include Tracking Protection, Fingerprint Protection, blocking ip discovery through WebRTC, and can automatically block ads and tracking through PIA MACE™.

Please be advised that connecting to a proxy through our extension only protects traffic from that particular browser and not on applications that may be installed on the operating system itself.


## About
This client allows a user to sign-in to their PIA account and choose a particular proxy server to route all their browser traffic through. The client itself is has additional features such as:
 - Block WebRTC IP Detection
 - Disable Network Prediction
 - Tracking Protection
 - Fingerprint Protection
 - Disable Website Referrer
 - Disable Hyperlink Auditing
 - Remove UTM Parameters
 - PIA MACE™ (block ads, trackers, and malicious content)
 - Allow direct connections for whitelisted sites
 - Upgrade requests to HTTPS when supported


## Usage
Please start by ensuring that all the requirements in the [Installation](#installation) section of this README is installed. For more information, please refer to that section.

Building the client is as simple as running the build command:

  `yarn run dev`

The unpacked extension can be installed from the following url in firefox [about:debugging](about:debugging)


## Installation
#### Requirements
 - Git (latest)
 - NodeJS 10.15.1 or greater
 - Firefox Browser (support for v57 and above)
 - API Keys

**Git**
Please use these instructions to install Git on your computer if it is not already installed: [Installing Git](https://gist.github.com/derhuerst/1b15ff4652a867391f03)

**NodeJS**
We recommend installing NodeJS via [nvm](https://github.com/creationix/nvm) on MacOS and Linux. On Windows, you can simply use the node installer found [here](https://nodejs.org/en/).

**API Keys**
API keys can be aqcuired by signing up with mozilla as a developer. Currently, the only means to do so is to post a question in the online forums for Mozilla. After doing so you can create a developer account and create your API keys. You can create your API keys here: https://addons.mozilla.org/en-US/developers/addon/api/key/

#### Download Codebase
Using the PowerShell/Terminal:

    `git clone https://github.com/pia-foss/extension-firefox.git`

or use a graphical interface like [Git Desktop](https://desktop.github.com/) to download this repository into a directory of your choosing.


#### Setup
The extension uses NodeJS and yarn to build itself. yarn comes packaged with every NodeJS installation.

To install all dependencies the extension needs to build run the following command in PowerShell/Terminal:

    `yarn install`

#### Building
To build the extension, start by locating the `.env` file inside the root directory of the extension you are building. You will need to open the file inside of a text editor. At the bottom you will find where to insert your API keys. Before running the commands to build the extension, first be sure that node and yarn are updated to the latest version. Afterwords, run the command below in PowerShell/Terminal at the project root. When the build is finished `./builds/firefox-<build>` will have been created, and it can be loaded as a temporary add-on in Firefox (if using option 1 below).

  **option 1: (a build that makes debugging easier)**

    `yarn run dev`

  **option 2: (a production build, that targets the webstore)**  
  This requires that the **FIREFOX_KEY** and **FIREFOX_SECRET** environment variables are declared in a .env file at the root of the project. [Link to obtaining web-ext credentials](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Getting_started_with_web-ext#Signing_your_extension_for_distribution).

    `yarn run public`


#### Loading Extension

  * Enter "about:debugging" into Firefox's address bar.
  * Tick "Enable add-on debugging" if it isn't already.
  * Click "Load Temporary Add-on", and choose the path to the manifest file in the build directory.

  Optionally, `web-ext run` from the `./build/debug` directory can be used in development.

#### Testing

**Requirements**

- yarn

**Running Tests**

Simply run the yarn command

    `yarn test`

## Translations

**Ensure that a `config/oneskyauthfile.json` exist before uploading translations. This file should contain the public and secret keys for your 1sky account**
**Ensure that the ONESKY_PROJECT_ID environment variable is set**

The extension supports all locales found in `src/_locales`. The translations are
translated by the 1sky service. `src/_locales/en/messages.json` can be uploaded to 1sky
using the following yarn task:

    `yarn run translation:import`

Translations for all locales can be downloaded with the following task:

    `yarn run translation:export`

## Deployment

#### Deploying to the Firefox Add-on Store

**These instructions are still in flux.**

**Ensure that you've created a web-ext api key and secret beforehand**

At the root of the project, run the following command

`yarn run public`

This should create a new `.xpi` file in `builds/firefox-public` that can be uploaded to the add-on store via the addons website. This is a manual process for now until an automated procedure can be established.


## Contributing
By contributing to this project you are agreeing to the terms stated in the Contributor License Agreement (CLA) [here](/CLA.rst). For more details please see  [CONTRIBUTING.md](/.github/CONTRIBUTING.md). Issues and Pull Requests should use these templates: [ISSUES](/.github/ISSUE_TEMPLATE.md) and [PULL REQUESTS](/.github/PULL_REQUEST_TEMPLATE.md)


## Authors
 - Robert Gleeson
 - Edward Kim
 - Brad Pfannmuller
 - Amir Malik
 - Manish Jethani
 - Pericles
 - Brennan Conner
 - Bogdan Pitaroiu
 - Stefan Nedelcu

## License
This project is licensed under the [MIT (Expat) license](https://choosealicense.com/licenses/mit/), which can be found [here](/LICENSE).

<!-- Markdown link & img dfn's -->
[pia-image]: https://www.privateinternetaccess.com/assets/PIALogo2x-0d1e1094ac909ea4c93df06e2da3db4ee8a73d8b2770f0f7d768a8603c62a82f.png
[pia-url]: https://www.privateinternetaccess.com/
[wiki]: https://en.wikipedia.org/wiki/Private_Internet_Access
