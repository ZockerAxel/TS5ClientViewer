//@ts-check
/**
 * Preloads an Element
 * 
 * @param {string} query The Query
 * @param {{new (): T}} requiredClass The required Class
 * @returns {T} The Element
 * @template T The required Class Type
 */
function preload(query, requiredClass) {
    const element = document.querySelector(query);
    if(!element) throw new Error(`'${query}' not found in Document.`);
    if(!(element instanceof requiredClass)) throw new Error(`'${query}' Element did not match required class '${requiredClass.prototype}'`); 
    
    return element;
}

//Main
export const mainElement = preload("main", HTMLElement);

//Viewer
export const viewerDiv = preload("#viewer", HTMLDivElement);

//Hint Screen
export const hintScreenDiv = preload("#hint_screen", HTMLDivElement);

//Interface
export const interfaceDiv = preload("#interface", HTMLDivElement);
export const interfaceUseCustomId = preload("#use_custom_id", HTMLInputElement);
export const interfaceCustomAppId = preload("#app_custom_id", HTMLInputElement);
export const interfaceAppPort = preload("#app_port", HTMLInputElement);
export const interfaceDisplayMode = preload("#display_mode", HTMLSelectElement);
export const interfaceViewerMode = preload("#mode", HTMLSelectElement);
export const interfaceServer = preload("#server", HTMLSelectElement);
export const interfaceServerName = preload("#server_name", HTMLInputElement);
export const interfaceServerList = preload("#server_list", HTMLSelectElement);
export const interfaceAlignment = preload("#alignment", HTMLSelectElement);
export const interfaceHideChannel = preload("#hide_channel", HTMLInputElement);
export const interfaceShowSubchannels = preload("#show_subchannels", HTMLInputElement);
export const interfaceFollowChannel = preload("#follow_channel", HTMLInputElement);
export const interfaceFollowSpecificChannel = preload("#follow_specific_channel", HTMLInputElement);
export const interfaceFollowChannelName = preload("#follow_channel_name", HTMLInputElement);
export const interfaceHideStatus = preload("#hide_status", HTMLInputElement);
export const interfaceHideAwayMessage = preload("#hide_away_message", HTMLInputElement);
export const interfaceOnlyTalking = preload("#only_talking", HTMLInputElement);
export const interfaceShowAvatars = preload("#show_avatars", HTMLInputElement);
export const interfaceHideEmpty = preload("#hide_empty", HTMLInputElement);
export const interfaceShowSpacers = preload("#show_spacers", HTMLInputElement);
export const interfaceHideLocalClient = preload("#hide_local_client", HTMLInputElement);
export const interfaceDisableLocalClientColor = preload("#disable_local_client_color", HTMLInputElement);
export const interfaceShowQueryClients = preload("#show_query_clients", HTMLInputElement);
export const interfaceScaleSlider = preload("#scale_slider", HTMLInputElement);
export const interfaceScale = preload("#scale", HTMLInputElement);
export const interfaceGeneratedUrl = preload("#interface_generated_url", HTMLOutputElement);