//@ts-check
import App from "../App.js";

export class Handler {
    #apiKey;
    #apiPort;
    #app;
    #api;
    
    /**
     * Creates a new Handler
     * 
     * @param {string | null} apiKey The TS API Key, use null to generate a new one
     * @param {number} apiPort The TeamSpeak Remote App API port
     * @param {App} app The App to use
     */
    constructor(apiKey, apiPort, app) {
        this.#apiKey = apiKey;
        this.#apiPort = apiPort;
        this.#app = app;
    }
    
    /**
     * Connects to the TS5 Client
     * 
     * @returns {Promise<string>} The API Key
     */
    async connect() {
        console.log({message: "[Handler] Connecting ...", apiKey: this.#apiKey});
        
        if(this.#apiKey == null) {
            const apiKey = await this.#connectWithoutAPIKey();
            this.#apiKey = apiKey;
            return apiKey;
        } else {
            const apiKey = await this.#connectWithAPIKey();
            this.#apiKey = apiKey;
            return apiKey;
        }
    }
    
    /**
     * 
     * @returns {Promise<string>} The promise for the API Key
     */
    async #connectWithoutAPIKey() {
        /**@type {(value: any) => void} */
        let resolveFunction;
        /**@type {(value: any) => void} */
        let rejectFunction;
        const promise = new Promise(function(resolve, reject) {
            resolveFunction = resolve;
            rejectFunction = reject;
        });
        
        // @ts-ignore
        this.#api = new TSRemoteAppWrapper.TSApiWrapper({
            api: {
                port: this.#apiPort,
                tsEventDebug: true,
            },
            app: this.#app.toRemoteAPIApp(),
        });
        
        this.#api.on("apiReady", function(/** @type {{ payload: { apiKey: string; }; }} */ data) {
            resolveFunction(data.payload.apiKey);
        });
        
        this.#api.on("apiError", function(data) {
            rejectFunction(data.exception.message);
        });
        
        return promise;
    }
    
    async #connectWithAPIKey() {
        /**@type {(value: any) => void} */
        let resolveFunction;
        /**@type {(value: any) => void} */
        let rejectFunction;
        const promise = new Promise(function(resolve, reject) {
            resolveFunction = resolve;
            rejectFunction = reject;
        });
        
        // @ts-ignore
        this.#api = new TSRemoteAppWrapper.TSApiWrapper({
            api: {
                key: this.#apiKey,
                port: this.#apiPort,
                tsEventDebug: true,
            },
            app: this.#app.toRemoteAPIApp(),
        });
        
        this.#api.on("apiReady", function(/** @type {{ payload: { apiKey: string; }; }} */ data) {
            resolveFunction(data.payload.apiKey);
        });
        
        this.#api.on("apiError", function(data) {
            rejectFunction(data.exception.message);
        });
        
        return promise;
    }
}