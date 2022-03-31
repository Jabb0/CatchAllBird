# CatchAll-Bird
This extension allows the use of CatchAll-Addresses with Thunderbird.

https://addons.thunderbird.net/de/thunderbird/addon/catchall-bird/

It handles incoming messages addressed to all `<prefix>@domain.tld` for a fixed domain.

As such, the features are:
- Automatically move incoming mail to directory denoted by `<prefix>`.
- Automatically create thunderbird identity for `<prefix>` for replying from the correct address.
    - When replying to an email, Thunderbird automatically selects the identity as sender. No more confusing recipients anymore.
    - The settings of each new identity are copied from the default identity of the account.

The postbox has a joint inbox as usual.
On incoming messages for `domain.tld` it:
1. checks if a thunderbird identity with the given `<prefix>` is already present. If not, it creates the identity.
2. checks if a subfolder of the inbox with the name `<prefix>` already exists. If not, it creates the folder
3. moves the message into the inbox subfolder named `<prefix>`.

For security reasons, a prefix can only have the characters `a-z`, `A-Z`, `-`, `.`, `+` and `0-9`. In addition, all dots are replaced with "DOT" in the folder names.

## Install
### Automatic Install (Recommended)
Load the addon from the [Mozilla AddOn Store](https://addons.thunderbird.net/de/thunderbird/addon/catchall-bird/).

### Manual Install
This addon is installed manually by Menu->"Addons and Themes"->Gear Icon->"Install addon from file"->Select the xpi file.

## Setup
1. Go to Menu
2. Addons and Themes
3. Select "CatchAll Bird"
4. Settings
5. Tick the checkbox for the accounts you want to catchallify

By default, CatchAllbird creates new folders and identities automatically. Both creations can be disabled in the addon settings.

## Build
This project uses minification for the final build. Install it with `npm install uglify-js -g`. Building the project needs to have node and npm installed. Any platform with bash support should work. Tested version are node==v17.7.2 and npm==8.5.2.

Build the xpi package using `./build.sh`.