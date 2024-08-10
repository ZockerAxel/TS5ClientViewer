//@ts-check
import App from "./app.js";
import { getEnvironment } from "./environment_checker.js";
import { Handler } from "./ts_handler.js";
import { getParam, getParamInt } from "./url_param_reader.js";
import { getOrDefault } from "./utils.js";

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