/**
 * Copyright (c) 2022, Jabb0 https://github.com/Jabb0
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/ 
 */

import { processInbox, processMessagesInFolder, onNewMailReceived} from "./processing.js";

async function welcomeTab() {
    await messenger.tabs.create({
        url: "../popup/popup.html",
        index: 1
    });
 }

 async function addMenuItemProcessInbox() {
    // Setup menu button for reprocessing inbox
    const menu_id = await messenger.menus.create({
        title: "CatchAll Bird: Process INBOX",
        contexts: [
            "tools_menu"
        ],
        id: "catchallbirdMenuItemProcessInbox"
    });
 }

 async function addMenuItemProcessFolder() {
    // Setup menu button for processing a specific folder
    const menu_id = await messenger.menus.create({
        title: "CatchAll Bird: Process this folder",
        contexts: [
            "folder_pane"
        ],
        id: "catchallbirdMenuItemProcessFolder"
    });
 }

async function load() {
    const { 
        catchAllBirdHideWelcomeMessage: hideWelcomeMessage
    } = await messenger.storage.local.get({
        catchAllBirdHideWelcomeMessage: false
    });

    if (!hideWelcomeMessage) {
        await welcomeTab();
    }

    await addMenuItemProcessInbox();
    await addMenuItemProcessFolder();
};

// listener creation has to be on top level to work with manifest v3 
// https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers#register-listeners

// Add a listener for the onNewMailReceived events.
// On each new message decide what to do
// Messages are already filtered by junk classification and message filters
messenger.messages.onNewMailReceived.addListener(onNewMailReceived);

messenger.menus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId == "catchallbirdMenuItemProcessFolder") {
        const { selectedFolders } = info;

        if (!!selectedFolders) {
            for (const folder of selectedFolders) {
                processMessagesInFolder(folder);
            }
        }
    }
});

messenger.menus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId == "catchallbirdMenuItemProcessInbox") {
        await processInbox();
    }
});

document.addEventListener("DOMContentLoaded", load);