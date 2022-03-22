// A wrapper function returning an async iterator for a MessageList. Derived from
// https://webextension-api.thunderbird.net/en/91/how-to/messageLists.html
async function* iterateMessagePages(page) {
    for (let message of page.messages) {
        yield message;
    }

    while (page.id) {
        page = await messenger.messages.continueList(page.id);
        for (let message of page.messages) {
            yield message;
        }
    }
}

const GLOBAL_INBOX_PATH = "/INBOX";

function getPrefixFromMessage(domain, recipients, ccList, bccList) {
    const emailIsFromCatchAll = recipient => recipient.endsWith(domain);

    // Order matters
    // Make sure this message should not be in two <prefix> accounts. If so prefer recipients (TO) over CC and BCC.
    // NOTE: Seems like bccList is always empty for incoming messages.
    const possibleFields = [
        recipients,
        ccList,
        bccList
    ]

    for (const field of possibleFields) {
        const ownAddresses = field.filter(emailIsFromCatchAll);
        if (ownAddresses.length > 0) {
            return prefixFromEmail(ownAddresses[0], domain);
        }
    }
    return null;
}

async function moveMessages(parentFolder, mailMapping) {
    // parentFolder is Object MailFolder
    // mailMapping is from prefix->mail id

    // No need to include nested subfolders.
    // Build mapping from prefix to subfolders
    const subfolders = await messenger.folders.getSubFolders(parentFolder, false);
    const subfolderMapping = new Map(subfolders.map(subfolder => [subfolder.name, subfolder]));

    for (const [prefix, mailIds] of mailMapping) {
        // Make sure the prefix subfolder exists
        if (!subfolderMapping.has(prefix)) {
            subfolderMapping.set(prefix, await messenger.folders.create(parentFolder, prefix));
        }

        await messenger.messages.move(mailIds, subfolderMapping.get(prefix));
    }
}

function prefixFromEmail(email, domain) {
    return email.slice(0, -(domain.length + 1))
}

async function updateIdentities(account, domain, neededPrefixes) {
    // neededPrefixes is iterator on prefixes
    // Check if account has the identities for prefix@domain if not create them
    // New identities will be copies of the main identity.

    // Get available prefixes by the desired domain (as it is possible to have identities for non catch-all domains)
    const availablePrefixes = new Set(account.identities.filter(identity => identity.email.endsWith(domain)).map(identity => prefixFromEmail(identity.email, domain)));

    if (availablePrefixes.length === 0) {
        console.warn(`No prefixes match the domain ${domain}. That ain't right.`)
        return;
    }

    const mainIdentity = account.identities[0];
    delete mainIdentity.accountId;
    delete mainIdentity.id;

    for (const prefix of neededPrefixes) {
        if (!availablePrefixes.has(prefix)) {
            // Create the prefix
            await messenger.identities.create(account.id, {...mainIdentity, email: `${prefix}@${domain}`});
        }
    }
}

async function processMessages(folder, messages) {
    // Get list of accounts to listen to
    const { catchAllBirdAccounts: accounts } = await messenger.storage.local.get({ catchAllBirdAccounts: new Set() });
    const { accountId, path } = folder;

    // Decide if this message is relevant for the tool by accountId and folder
    // only use /INBOX
    if (!accounts.has(accountId) || path !== GLOBAL_INBOX_PATH)
        return;

    const account = await messenger.accounts.get(accountId, true);  // Include mail folders as well
    // Get the existing identities of this account
    const identities = account.identities.map(identity => identity.email);
    // First one is default identity. It is assumed that this has the correct domain.
    if (identities.length === 0) {
        console.warn(`The mail account ${accountId} does not have any identities!`);
        return;
    }
    const domain = identities[0].split("@").pop();

    // Mapping from <prefix> to mail ids to move there
    // In theory this could use pagination. But we never handle that many messages I guess.
    const mailMapping = new Map();

    for await (let message of iterateMessagePages(messages)) {
        // Decide to which subfolder this should be moved
        const { id, recipients, ccList, bccList} = message;

        const prefix = getPrefixFromMessage(domain, recipients, ccList, bccList);

        if (prefix === null) {
            console.warn(`Message ${id} does not have a recipient associated with domain ${domain}. Thus it is not moved. Check if this is a mistake.`);
        } else {
            if (!mailMapping.has(prefix)) {
                mailMapping.set(prefix, []);
            }
            mailMapping.get(prefix).push(id);
        }

    }

    if (mailMapping.size > 0) {
        // Move emails to respective subfolder
        await moveMessages(folder, mailMapping);
        // Create identities associated with subdomains
        await updateIdentities(account, domain, mailMapping.keys());
    }
}

async function load() {
    // Add a listener for the onNewMailReceived events.
    // On each new message decide what to do
    // Messages are through junk classification and message filters
    await messenger.messages.onNewMailReceived.addListener(processMessages);
}

document.addEventListener("DOMContentLoaded", load);