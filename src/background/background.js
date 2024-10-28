/**
 * Copyright (c) 2022, Jabb0 https://github.com/Jabb0
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/ 
 */

import { processInbox, processMessagesInFolder, onNewMailReceived} from "./processing.js";

const MENU_ITEM_ID_PROCESS_FOLDER = "catchallbirdMenuItemProcessFolder"
const MENU_ITEM_ID_PROCESS_INBOX = "catchallbirdMenuItemProcessInbox"

async function welcomeTab() {
    await messenger.tabs.create({
        url: "../popup/popup.html",
        index: 1
    });
}

async function addMenuItemProcessInbox() {
    // Setup menu button for reprocessing inbox
    await messenger.menus.create({
        title: "CatchAll Bird: Process INBOX",
        contexts: [
            "tools_menu"
        ],
        id: MENU_ITEM_ID_PROCESS_INBOX
    });
}

async function addMenuItemProcessFolder() {
    // Setup menu button for processing a specific folder
    await messenger.menus.create({
        title: "CatchAll Bird: Process this folder",
        contexts: [
            "folder_pane"
        ],
        id: MENU_ITEM_ID_PROCESS_FOLDER
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
    if (info.menuItemId == MENU_ITEM_ID_PROCESS_FOLDER) {
        const { selectedFolders } = info;

        if (!!selectedFolders) {
            for (const folder of selectedFolders) {
                processMessagesInFolder(folder);
            }
        }
    }
});

messenger.menus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId == MENU_ITEM_ID_PROCESS_INBOX) {
        await processInbox();
    }
});

document.addEventListener("DOMContentLoaded", load);