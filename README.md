# CatchAll-Bird
This extension allows the use of CatchAll-Addresses with Thunderbird.

https://addons.thunderbird.net/de/thunderbird/addon/catchall-bird/

It handles incoming messages addressed to all `<prefix>@domain.tld` for a fixed domain.

As such the features are:
- Automatically move incoming mail to directory denoted by `<prefix>`.
- Automatically create thunderbird identity for `<prefix>` for replying from the correct address.
    - When replying to a email thunderbird will automatically select the identity as sender. No more confusing recipients anymore.
    - The settings of each new identity are copied from the default identity of the account.

The postbox will have a joint inbox as usual.
On incoming messages for `domain.tld` it will be:
1. checked if a thunderbird identity with the given `<prefix>` is already present. If not it will be created.
2. checked if a subfolder of inbox with name `<prefix>` already exists. If not it will be created.
3. The message will be moved into the inbox subfolder named `<prefix>`.

## Install
### Automatic Install (Recommended)
Load the Addon from the [Mozilla AddOn Store](https://addons.thunderbird.net/de/thunderbird/addon/catchall-bird/).

### Manual Install
This addon is installed manually by Menu->Addons and Themes->Gear Icon->Install Addon from file->Select the xpi file.

## Setup
1. Go to Menu
2. Addons and Themes
3. Select "CatchAll Bird"
4. Settings
5. Tick the checkbox for the accounts you want to catchallify

## Build
This project uses minification for the final build. Install it with `npm install uglify-js -g`. We will need to have node and npm installed. Any platform with bash support should work. Tested version are node==v17.7.2 and npm==8.5.2.

Build the xpi package using `./build.sh`.