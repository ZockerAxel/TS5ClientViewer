//@ts-check
import App from "./App.js";
import { getApiKeyLocalStorageKeyByEnvironment, getEnvironment, isLocal } from "./EnvironmentChecker.js";
import Interface from "./interface/Interface.js";
import { logger } from "./Logger.js";
import { registerServiceWorker } from "./ServiceWorkerRegisterer.js";
import Handler from "./ts/Handler.js";
import { getParam, getParamBoolean, getParamFloat, getParamInt } from "./UrlParamReader.js";
import { getOrDefault } from "./Utils.js";
import Viewer from "./viewer/Viewer.js";

const DEFAULT_APP_PORT = 5899;

async function main() {
    registerServiceWorker();
    
    const environment = getEnvironment();
    document.body.classList.add(`environment_${environment}`);
    
    let customIdSuffix = getParam("custom_id");
    if(isLocal()) {
        if(customIdSuffix) {
            customIdSuffix += "-local";
        } else {
            customIdSuffix = "local";
        }
    }
    
    const app = App.load(environment, customIdSuffix);
    
    logger.log({message: "App has been loaded.", app: app.toObject()});
    
    const apiKeyStorageKey = getApiKeyLocalStorageKeyByEnvironment(environment, customIdSuffix);
    
    let apiKey = localStorage.getItem(apiKeyStorageKey);
    const apiPort = getOrDefault(getParamInt("app_port"), DEFAULT_APP_PORT);
    
    const handler = new Handler(apiKey, apiPort, app);
    
    showViewer(app, handler, apiPort);
    
    try {
        apiKey = await handler.connect();
    } catch(err) {
        try {
            apiKey = await handler.connectWithoutAPIKey();
        } catch(err) {
            logger.error("Could not connect with, nor without, API Key.");
        }
    }
    
    if(apiKey) localStorage.setItem(apiKeyStorageKey, apiKey);
}

/**
 * Show the Viewer
 * 
 * @param {App} app The App
 * @param {Handler} handler The Handler
 * @param {number} apiPort The API Port
 */
function showViewer(app, handler, apiPort) {
    const viewerMode = getOrDefault(getParam("mode"), "tree");
    const serverSelectMode = getOrDefault(getParam("server"), "active");
    const serverSelectModeOptions = JSON.parse(getOrDefault(getParam("server_options"), "{}"));
    const scale = getOrDefault(getParamFloat("scale"), 1);
    const alignment = getOrDefault(getParam("align"), "start");
    const localClientColor = !getParamBoolean("disable_local_client_color");
    const hideChannelName = getParamBoolean("hide_channel");
    const hideSilentClients = getParamBoolean("only_talking");
    const hideStatus = getParamBoolean("hide_status");
    const showAvatar = getParamBoolean("show_avatars");
    const showSpacers = getParamBoolean("show_spacers");
    const hideEmptyChannels = getParamBoolean("hide_empty");
    const showQueryClients = getParamBoolean("show_query_clients");
    const followChannel = getParamBoolean("follow_channel");
    const followChannelName = getOrDefault(getParam("follow_channel_name"), "");
    const hideAwayMessage = getParamBoolean("hide_away_message");
    const showSubchannels = getParamBoolean("show_subchannels");
    
    const viewerOptions = {
        mode: viewerMode,
        serverSelectMode: serverSelectMode,
        serverSelectModeOptions: serverSelectModeOptions,
        scale: scale,
        alignment: alignment,
        localClientColorEnabled: localClientColor,
        channelHidden: hideChannelName,
        silentClientsHidden: hideSilentClients,
        statusHidden: hideStatus,
        avatarsShown: showAvatar,
        spacersShown: showSpacers,
        emptyChannelsHidden: hideEmptyChannels,
        queryClientsShown: showQueryClients,
        channelFollowed: followChannel,
        followChannelName: followChannelName,
        awayMessageHidden: hideAwayMessage,
        subChannelsShown: showSubchannels,
    };
    
    const viewer = new Viewer(handler, viewerOptions);
    
    viewer.updateSelectedServer();
    
    if(app.isInterfaceShown()) {
        const ui = new Interface(handler, viewer, {
            customId: getParam("custom_id"),
            appPort: apiPort,
            ...viewerOptions
        });
        
        ui.show();
        
        window["UI"] = ui;
    }
}

main();