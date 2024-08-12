/**@type {HTMLDivElement} */
export const viewerDiv = document.querySelector("#viewer");
if(!viewerDiv) throw new Error("Viewer not found in Document!");

/**@type {HTMLDivElement} */
export const interfaceDiv = document.querySelector("#interface");
if(!interfaceDiv) throw new Error("Interface not found in Document!");

/**@type {HTMLInputElement} */
export const interfaceUseCustomId = document.querySelector("#use_custom_id");
if(!interfaceUseCustomId) throw new Error("Use Custom ID not found in Document!");

/**@type {HTMLInputElement} */
export const interfaceCustomAppId = document.querySelector("#app_custom_id");
if(!interfaceCustomAppId) throw new Error("Custom App ID not found in Document!");

/**@type {HTMLInputElement} */
export const interfaceAppPort = document.querySelector("#app_port");
if(!interfaceAppPort) throw new Error("App Port not found in Document!");

/**@type {HTMLSelectElement} */
export const interfaceDisplayMode = document.querySelector("#display_mode");
if(!interfaceDisplayMode) throw new Error("Display Mode not found in Document!");

/**@type {HTMLSelectElement} */
export const interfaceViewerMode = document.querySelector("#mode");
if(!interfaceViewerMode) throw new Error("Viwer Mode not found in Document!");

/**@type {HTMLSelectElement} */
export const interfaceServer = document.querySelector("#server");
if(!interfaceServer) throw new Error("Server not found in Document!");

/**@type {HTMLInputElement} */
export const interfaceServerName = document.querySelector("#server_name");
if(!interfaceServerName) throw new Error("Server Name not found in Document!");

/**@type {HTMLSelectElement} */
export const interfaceServerList = document.querySelector("#server_list");
if(!interfaceServerList) throw new Error("Server List not found in Document!");

/**@type {HTMLInputElement} */
export const interfaceAlignment = document.querySelector("#alignment");
if(!interfaceAlignment) throw new Error("Alignment not found in Document!");

/**@type {HTMLInputElement} */
export const interfaceHideChannel = document.querySelector("#hide_channel");
if(!interfaceHideChannel) throw new Error("Hide Channel not found in Document!");

/**@type {HTMLInputElement} */
export const interfaceHideStatus = document.querySelector("#hide_status");
if(!interfaceHideStatus) throw new Error("Hide Status not found in Document!");

/**@type {HTMLInputElement} */
export const interfaceOnlyTalking = document.querySelector("#only_talking");
if(!interfaceOnlyTalking) throw new Error("Only Talking not found in Document!");

/**@type {HTMLInputElement} */
export const interfaceShowAvatars = document.querySelector("#show_avatars");
if(!interfaceShowAvatars) throw new Error("Show Avatars not found in Document!");

/**@type {HTMLInputElement} */
export const interfaceHideEmpty = document.querySelector("#hide_empty");
if(!interfaceHideEmpty) throw new Error("Hide Empty not found in Document!");

/**@type {HTMLInputElement} */
export const interfaceShowSpacers = document.querySelector("#show_spacers");
if(!interfaceShowSpacers) throw new Error("Show Spacers not found in Document!");

/**@type {HTMLInputElement} */
export const interfaceDisableLocalClientColor = document.querySelector("#disable_local_client_color");
if(!interfaceDisableLocalClientColor) throw new Error("Disable Local Client Color not found in Document!");

/**@type {HTMLInputElement} */
export const interfaceShowQueryClients = document.querySelector("#show_query_clients");
if(!interfaceShowQueryClients) throw new Error("Show Query Clients not found in Document!");

/**@type {HTMLInputElement} */
export const interfaceScaleSlider = document.querySelector("#scale_slider");
if(!interfaceScaleSlider) throw new Error("Scale Slider not found in Document!");

/**@type {HTMLInputElement} */
export const interfaceScale = document.querySelector("#scale");
if(!interfaceScale) throw new Error("Scale not found in Document!");