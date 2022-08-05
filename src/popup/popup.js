window.addEventListener("load", onLoad);
 
async function noShowCheckBoxClicked(event) {
    await messenger.storage.local.set({ catchAllBirdHideWelcomeMessage: this.checked });
}

async function onLoad() {
   document.getElementById("checkbox_noshow").addEventListener("change", noShowCheckBoxClicked);
}