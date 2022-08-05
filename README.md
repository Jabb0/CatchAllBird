# CatchAll-Bird
This extension allows the use of CatchAll-Addresses with Thunderbird.

https://addons.thunderbird.net/de/thunderbird/addon/catchall-bird/

## Important Limitation: Please Note
It came to my attention that there is an issue with thunderbird when multiple email accounts are present (or maybe even were present). Thanks to @alex9099 at issue [6](https://github.com/Jabb0/CatchAllBird/issues/6).
This should not affect you if you have only used the catch-all account in your thunderbird installation and no second account.

Due to limitations in thunderbirds AddOn API all new identities will use the default SMTP server for outgoing mails. 
But for Thunderbird this is a global default server instead of the one for the mail account (usually the SMTP server of the first email account created in the installation). This means that identities created by this AddOn might not use the correct outgoing SMTP server.
They will use the default SMTP server at the time of sending the email. 

It is not possible to see or change the SMTP server via the interface the AddOn can access. Even though the main identity of a mail account is copied the server is not preserved.

Until this is fixed by the thunderbird team the only mitigation is to set the default SMTP server to the server of your catch-all address.
Change the default SMTP server via Account-Settings -> Outgoing Server (SMTP) -> <Your catch-all SMTP Server> -> Set Default.

If this does not work for you please disable the AddOn for the conflicting email accounts and go to Account-Settings -> <Your Account> -> Manage Identities and delete the identities created by the AddOn.
Sorry for the inconvenience.

# Description
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

For security reasons, a prefix can only have the characters `a-z`, `A-Z`, `-`, `.`, `+`, `_` and `0-9`. In addition, all dots are replaced with "DOT" in the folder names.

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