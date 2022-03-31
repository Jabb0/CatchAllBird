/**
 * Copyright (c) 2022, Jabb0 https://github.com/Jabb0
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/ 
 */
import { DEFAULT_OPTIONS } from "../common/common.js";

async function renderAccountSettings() {
    const availableAccounts = await messenger.accounts.list();

    const table = document.getElementById("main-table");

    const { catchAllBirdAccounts } = await messenger.storage.local.get({ catchAllBirdAccounts: new Set() });

    // For each account add the option to add it to handling by checkbox
    // Some master class html right there
    for (const { id, name, identities } of availableAccounts) {
        if (identities.length === 0)
            continue;
        const domain = identities[0].email.split("@").pop();

        const row = table.insertRow();
        const cellId = row.insertCell(0);
        const cellName = row.insertCell(1);
        const cellDomain = row.insertCell(2);
        const cellCheckbox = row.insertCell(3);

        cellId.textContent = id;
        cellName.textContent = name;
        cellDomain.textContent = domain;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = catchAllBirdAccounts.has(id);
        cellCheckbox.appendChild(checkbox);

        checkbox.addEventListener("change", async () => {
            // Add the accountId to the list of desired ids
            const { catchAllBirdAccounts } = await messenger.storage.local.get({ catchAllBirdAccounts: new Set() });
            if (checkbox.checked) {
                catchAllBirdAccounts.add(id);
            } else {
                catchAllBirdAccounts.delete(id);
            }
            await messenger.storage.local.set({ catchAllBirdAccounts });
        });
    }
}

async function renderGeneralSettings() {
    const { 
        catchAllBirdOptions: options 
    } = await messenger.storage.local.get({
       catchAllBirdOptions: { ...DEFAULT_OPTIONS }
    });

    const checkboxFolderCreation = document.getElementById("ckbxfoldercreation");
    const checkboxIdentityCreation = document.getElementById("ckbxidentitycreation");

    checkboxFolderCreation.checked = options.isAutomaticFolderCreationEnabled;
    checkboxIdentityCreation.checked = options.isAutomaticIdentityCreationEnabled;

    checkboxFolderCreation.addEventListener("change", async () => {
        // Add the accountId to the list of desired ids
        const { 
            catchAllBirdOptions
        } = await messenger.storage.local.get({
            catchAllBirdOptions: { ...DEFAULT_OPTIONS }
        });
        catchAllBirdOptions.isAutomaticFolderCreationEnabled = checkboxFolderCreation.checked;
        await messenger.storage.local.set({ catchAllBirdOptions });
    });

    checkboxIdentityCreation.addEventListener("change", async () => {
        // Add the accountId to the list of desired ids
        const { 
            catchAllBirdOptions
        } = await messenger.storage.local.get({
            catchAllBirdOptions: { ...DEFAULT_OPTIONS }
        });
        catchAllBirdOptions.isAutomaticIdentityCreationEnabled = checkboxIdentityCreation.checked;
        await messenger.storage.local.set({ catchAllBirdOptions });
    });
}

async function load() {
    await renderAccountSettings();
    await renderGeneralSettings();
}

document.addEventListener("DOMContentLoaded", load);