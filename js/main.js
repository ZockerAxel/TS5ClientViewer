//@ts-check
import App from "./app.js";
import { getEnvironment } from "./environment_checker.js";
import { getParam } from "./url_param_reader.js";

main();

function main() {
    const apiKey = localStorage.getItem("ts5viewer.apiKey");
    
    const environment = getEnvironment();
    
    const customIdSuffix = getParam("custom_id");
    
    const app = App.load(environment, customIdSuffix);
    
    console.log({message: "App has been loaded.", app: app.toObject()});
    
    
}