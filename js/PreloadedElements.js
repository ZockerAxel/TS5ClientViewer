/**@type {HTMLDivElement} */
export const viewerDiv = document.querySelector("#viewer");
if(!viewerDiv) throw new Error("Viewer not found in Document!");

/**@type {HTMLDivElement} */
export const interfaceDiv = document.querySelector("#interface");
if(!interfaceDiv) throw new Error("Interface not found in Document!");

/**@type {HTMLDivElement} */
export const interfaceServerList = document.querySelector("#server_list");
if(!interfaceServerList) throw new Error("Server List not found in Document!");