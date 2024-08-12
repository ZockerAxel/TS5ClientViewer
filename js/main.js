//@ts-check
import App from "./App.js";
import { getEnvironment } from "./EnvironmentChecker.js";
import Handler from "./ts/Handler.js";
import { getParam, getParamBoolean, getParamFloat, getParamInt } from "./UrlParamReader.js";
import { getOrDefault } from "./Utils.js";
import Viewer from "./viewer/Viewer.js";

const DEFAULT_APP_PORT = 5899;

async function main() {
    const environment = getEnvironment();
    const customIdSuffix = getParam("custom_id");
    
    const app = App.load(environment, customIdSuffix);
    
    console.log({message: "App has been loaded.", app: app.toObject()});
    
    let apiKey = localStorage.getItem("ts5viewer.apiKey");
    const apiPort = getOrDefault(getParamInt("app_port"), DEFAULT_APP_PORT);
    
    const handler = new Handler(apiKey, apiPort, app);
    
    try {
        apiKey = await handler.connect();
    } catch(err) {
        apiKey = await handler.connectWithoutAPIKey();
    }
    
    localStorage.setItem("ts5viewer.apiKey", apiKey);
    
    const viewerMode = getOrDefault(getParam("mode"), "tree");
    const serverSelectMode = getOrDefault(getParam("server"), "active");
    const serverSelectModeOptions = JSON.parse(getOrDefault(getParam("server_options"), "{}"));
    const scale = getOrDefault(getParamFloat("scale"), 1);
    const alignment = getOrDefault(getParam("align"), "start");
    const localClientColor = !getParamBoolean("disable_local_client_color");
    
    const viewer = new Viewer(handler, {
        mode: viewerMode,
        serverSelectMode: serverSelectMode,
        serverSelectModeOptions: serverSelectModeOptions,
        scale: scale,
        alignment: alignment,
        localClientColorEnabled: localClientColor,
    });
    
    viewer.updateSelectedServer();
}

main();