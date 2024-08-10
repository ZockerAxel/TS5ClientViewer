//@ts-check
import interfaceAppObject from "./data_loaders/interface_app_loader.js";
import standaloneAppObject from "./data_loaders/standalone_app_loader.js";
import obsAppObject from "./data_loaders/obs_app_loader.js";

export const APP_VERSION = "indev-0.1";

export default class App {
    #identifier;
    #name;
    #description;
    #interfaceShown = false;
    
    /**
     * Creates a new App
     * 
     * @param {string} identifier The App Identifier
     * @param {string} name The App Name
     * @param {string} description The App Description
     */
    constructor(identifier, name, description) {
        this.#identifier = identifier;
        this.#name = name;
        this.#description = description;
    }
    
    isInterfaceShown() {
        return this.#interfaceShown;
    }
    
    toRemoteAPIApp() {
        return {
            identifier: this.#identifier,
            name: this.#name,
            description: this.#description,
            version: APP_VERSION,
        };
    }
    
    toObject() {
        return {
            identifier: this.#identifier,
            name: this.#name,
            description: this.#description,
            interfaceShown: this.#interfaceShown,
        };
    }
    
    toString() {
        return JSON.stringify(this.toObject());
    }
    
    /**
     * Load an App by it's Environment
     * 
     * @param {import("./environment_checker").EnvironmentType} environment The Environment
     * @param {string | undefined} customIdSuffix Custom Id Suffix to use (e.g. if you use multiple browser sources in OBS)
     * @returns {App} The loaded App
     */
    static load(environment, customIdSuffix = undefined) {
        let app = null;
        switch(environment) {
            case "browser":
                app = this.fromObject(interfaceAppObject);
                app.#interfaceShown = true;
                break;
            case "standalone":
                app = this.fromObject(standaloneAppObject);
                break;
            case "obs":
                app = this.fromObject(obsAppObject);
                break;
        }
        
        if(app) {
            if(customIdSuffix) {
                app.#identifier += customIdSuffix;
                app.#name += ` (${customIdSuffix})`;
            }
            return app;
        }
        
        throw new Error(`Could not load App from environment '${environment}'`);
    }
    
    /**
     * Creates an App from a JS-Object
     * 
     * @param {{identifier: string, name: string, description: string}} object The Input Object
     * @returns {App} The newly created App
     */
    static fromObject(object) {
        return new App(object.identifier, object.name, object.description);
    }
}