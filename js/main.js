//@ts-check
import App from "./App.js";
import { getEnvironment } from "./EnvironmentChecker.js";
import { Handler } from "./ts/TSHandler.js";
import { getParam, getParamInt } from "./UrlParamReader.js";
import { getOrDefault } from "./Utils.js";

const DEFAULT_APP_PORT = 5899;

async function main() {
    const environment = getEnvironment();
    const customIdSuffix = getParam("custom_id");
    
    const app = App.load(environment, customIdSuffix);
    
    console.log({message: "App has been loaded.", app: app.toObject()});
    
    let apiKey = localStorage.getItem("ts5viewer.apiKey");
    const apiPort = getOrDefault(getParamInt("app_port"), DEFAULT_APP_PORT);
    
    const handler = new Handler(apiKey, apiPort, app);
    
    apiKey = await handler.connect();
    
    localStorage.setItem("ts5viewer.apiKey", apiKey);
    
    
}

main();