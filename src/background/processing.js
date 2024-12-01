/**
 * Copyright (c) 2022, Jabb0 https://github.com/Jabb0
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/ 
 */


import { DEFAULT_OPTIONS } from "../common/common.js";
import { getPrefixFromMessage, prefixFromEmail } from "./utils.js";

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
const DOT_SUBSTITUTION = "DOT";

export async function moveMessages(parentFolder, mailMapping) {
   // parentFolder is Object MailFolder
   // mailMapping is from prefix->mail id

   // No need to include nested subfolders.
   // Build mapping from prefix to subfolders
   const subfolders = await messenger.folders.getSubFolders(parentFolder.id, false);
   const subfolderMapping = new Map(subfolders.map(subfolder => [subfolder.name, subfolder]));

   // Some mail server seem to thread . as separator between folders. Naming a folder with a dot will cause the creation of a subfolder and the move to fail.
   // So we will replace for folder names all . with DOT

   for (const [prefix, mailIds] of mailMapping) {
       const dotReplacedPrefix = prefix.replaceAll(".", DOT_SUBSTITUTION);
       // Make sure the prefix subfolder exists
       if (!subfolderMapping.has(dotReplacedPrefix)) {
           subfolderMapping.set(dotReplacedPrefix, await messenger.folders.create(parentFolder.id, dotReplacedPrefix));
       }

       await messenger.messages.move(mailIds, subfolderMapping.get(dotReplacedPrefix).id);
   }
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
   delete mainIdentity.encryptionCapabilities //Setting the encryptionCapabilities property of a MailIdentity is not supported.

   for (const prefix of neededPrefixes) {
       if (!availablePrefixes.has(prefix)) {
           // Create the prefix
           await messenger.identities.create(account.id, {...mainIdentity, email: `${prefix}@${domain}`});
       }
   }
}

async function processMessages(folder, messages) {
   // Get list of accounts to listen to
   const { 
       catchAllBirdAccounts: accounts,
       catchAllBirdOptions: options 
   } = await messenger.storage.local.get({ 
       catchAllBirdAccounts: new Set(),
       catchAllBirdOptions: { ...DEFAULT_OPTIONS }
   });

   const { accountId } = folder;

   // Decide if this message should be processed by accountId and folder
   if (!accounts.has(accountId))
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
   // In theory this could use pagination. But we never handle that many messages yet.
   const mailMapping = new Map();

   for await (let message of iterateMessagePages(messages)) {
       // Decide to which subfolder this should be moved
       const { id, recipients, ccList, bccList} = message;

       const prefix = getPrefixFromMessage(domain, recipients, ccList, bccList);

       if (prefix === null) {
           console.warn(`Message ${id} does not have a recipient associated with domain ${domain}. Thus it is not processed. Check if this is a mistake.`, message);
       } else {
           if (!mailMapping.has(prefix)) {
               mailMapping.set(prefix, []);
           }
           mailMapping.get(prefix).push(id);
       }

   }

   if (mailMapping.size > 0) {
       // Move emails to respective subfolder
       if (options.isAutomaticFolderCreationEnabled) {
           const inboxFolder = await getInboxForAccount(accountId);
           await moveMessages(inboxFolder, mailMapping);
       }
       // Create identities associated with subdomains
       if (options.isAutomaticIdentityCreationEnabled) {
           await updateIdentities(account, domain, mailMapping.keys());
       }
   }
}

async function getInboxForAccount(accountId) {
   const account = await messenger.accounts.get(accountId, true);
   const inboxFolder = account.rootFolder.subFolders.filter(folder => folder.path == GLOBAL_INBOX_PATH)[0] || null;
   return inboxFolder;
}

export async function processInbox() {
   // Get inbox folder of all accounts to listen for
   const { catchAllBirdAccounts: accounts } = await messenger.storage.local.get({ catchAllBirdAccounts: new Set() });

   for (const accountId of accounts) {
       
       const inboxFolder = await getInboxForAccount(accountId);
       if (inboxFolder === null) {
           console.warn(`Account ${account} does not have inbox folder with path ${GLOBAL_INBOX_PATH}`);
       } else {
           await processMessagesInFolder(inboxFolder);
       }
   }
}

export async function processMessagesInFolder(folder) {
   const allMessages = await messenger.messages.list(folder.id);
   await processMessages(folder, allMessages);
}

export async function onNewMailReceived(folder, messages) {

   // Only use new mail in the inbox folder
   if (folder.path !== GLOBAL_INBOX_PATH) {
       return;
   }

   await processMessages(folder, messages);
}

