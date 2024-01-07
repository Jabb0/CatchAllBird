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
    });
 
    await messenger.menus.onClicked.addListener(async (info, tab) => {
        if (info.menuItemId == menu_id) {
            await processInbox();
        }
    });
 }
 
 
 async function addMenuItemProcessFolder() {
    // Setup menu button for processing a specific folder
    const menu_id = await messenger.menus.create({
        title: "CatchAll Bird: Process this folder",
        contexts: [
            "folder_pane"
        ],
    });
 
    await messenger.menus.onClicked.addListener(async (info, tab) => {
        if (info.menuItemId == menu_id) {
            const { selectedFolder } = info;
 
            if (!!selectedFolder) {
                processMessagesInFolder(selectedFolder);
            }
        }
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

    // Add a listener for the onNewMailReceived events.
    // On each new message decide what to do
    // Messages are already filtered by junk classification and message filters
    await messenger.messages.onNewMailReceived.addListener(onNewMailReceived);
}

document.addEventListener("DOMContentLoaded", load);