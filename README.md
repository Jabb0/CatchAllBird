# CatchAll-Bird
This extension allows the use of CatchAll-Addresses with Thunderbird.

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
Load the Addon from the Mozilla AddOn Store.

### Manual Install
This addon is installed manually by Menu->Addons and Themes->Gear Icon->Install Addon from file->Select the xpi file