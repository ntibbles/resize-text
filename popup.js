import { toggleZoom } from "./resize-text.js";

let textPort = 0;
let value = {};

document.addEventListener('DOMContentLoaded', init);
chrome.runtime.onConnect.addListener(function(port) {
    textPort = port;
});

function getTabId() {
    return new Promise(resolve => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            resolve(tabs[0].id);
        });
    })
}

async function init() {
    document.getElementById("textZoom").addEventListener('input', zoomChange);
    value = document.getElementById("zoomValue");
    loadScript();
    restoreSlider();
}

async function loadScript() {
    const id = await getTabId();
    chrome.scripting.executeScript({
        target: { tabId: id },
        function: toggleZoom
    });
}

function restoreSlider() {
    chrome.storage.sync.get().then(result => {
        const slider = document.getElementById('textZoom');
        const zoomValue = document.getElementById('zoomValue');
        const value = result['resizeTextSlider']?.slider || 1;
        slider.value = value || 1;
        zoomValue.textContent = `${Math.round(value * 100)}%`;
    });
}

function zoomChange(event) {
    let store = {};
    let percent = Number(event.target.value);
    value.textContent = `${Math.round(percent * 100)}%`;
    textPort.postMessage({zoomLevel: percent});
    store['resizeTextSlider'] = { slider: percent };
    chrome.storage.sync.set( store );
}