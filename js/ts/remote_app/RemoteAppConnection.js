//@ts-check
import { logger } from "../../Logger.js";

const LOG_CATEGORY = "connection";

export default class RemoteAppConnection {
    #config;
    
    /**@type {WebSocket} */
    #webSocket;
    
    #authenticated = false;
    
    /**@type {Map<string, ((data: *) => void)[]>} */
    #eventHandlers = new Map();
    
    /**
     * 
     * @param {{api: {host: string, port: number, key?: string | null}, app: {identifier: string, name: string, description: string, version: string}}} config 
     */
    constructor(config) {
        this.#config = config;
    }
    
    getConfig() {
        return {...this.#config};
    }
    
    isConnecting() {
        return this.#webSocket.readyState === WebSocket.CONNECTING;
    }
    
    isConnected() {
        return this.#webSocket.readyState === WebSocket.OPEN;
    }
    
    isAuthenticated() {
        return this.#authenticated;
    }
    
    /**
     * Adds an Event Listener
     * 
     * @param {string} event The Event to listen to
     * @param {(data: *) => void} callback The Callback function
     */
    addEventListener(event, callback) {
        const handlerList = this.#getHandlerList(event);
        handlerList.push(callback);
    }
    
    /**
     * Adds an Event Listener
     * 
     * @param {(data: *) => void} callback The Callback function
     * @param {boolean} removeMultiple Whether to remove multiple instances of this callback (e.g. if you subscribed to multiple events with the same callback)
     */
    removeEventListener(callback, removeMultiple = false) {
        for(const handlerList of this.#eventHandlers.values()) {
            const index = handlerList.indexOf(callback);
            
            if(index === -1) continue;
            
            handlerList.splice(index, 1);
            
            if(!removeMultiple) break;//Break if not searching for multiple instances
        }
    }
    
    /**
     * Calls an Event
     * 
     * @param {string} event The Event to call
     * @param {*} data The data
     */
    #callEvent(event, data) {
        const handlerList = this.#getHandlerList(event);
        
        for(const callback of handlerList) {
            callback(data);
        }
    }
    
    /**
     * Gets the Handler List for the specified Event
     * 
     * @param {string} event The Event
     * @returns {((data: *) => void)[]}
     */
    #getHandlerList(event) {
        let handlerList = this.#eventHandlers.get(event);
        
        if(handlerList) return handlerList;
        
        handlerList = [];
        
        this.#eventHandlers.set(event, handlerList);
        
        return handlerList;
    }
    
    connect() {
        const self = this;
        
        this.#webSocket = new WebSocket(`ws://${this.#config.api.host}:${this.#config.api.port}`);
        
        this.#webSocket.addEventListener("open", function(event) {
            logger.log({message: "Web Socket opened"}, LOG_CATEGORY);
            
            self.#authenticate();
        });
        
        this.#webSocket.addEventListener("message", function(event) {
            const message = JSON.parse(event.data);
            
            logger.log({message: "Web Socket Message received", payload: message}, LOG_CATEGORY);
            
            if(message.type === "auth") self.#setAuthenticated(message.payload.apiKey);
            
            self.#callEvent(`ts:${message.type}`, message.payload);
        });
        
        this.#webSocket.addEventListener("error", function(event) {
            logger.log({message: "Web Socket Error", event: event}, LOG_CATEGORY);
            
            self.#callEvent(`api:error`, event);
        });
        
        this.#webSocket.addEventListener("close", function(event) {
            self.#authenticated = false;
            
            logger.log({message: "Web Socket disconnected"}, LOG_CATEGORY);
            
            self.#callEvent(`api:disconnect`, event);
        });
    }
    
    disconnect() {
        this.#webSocket.close();
    }
    
    #authenticate() {
        const apiKey = this.#config.api.key ? this.#config.api.key : "";
        
        const payload = {
            type: "auth",
            payload: {
                identifier: this.#config.app.identifier,
                name: this.#config.app.name,
                description: this.#config.app.description,
                version: this.#config.app.version,
                content: {
                    apiKey: apiKey,
                }
            },
        };
        
        this.send(payload, true);
    }
    
    /**
     * Set authenticated
     * 
     * @param {string} apiKey The API Key
     */
    #setAuthenticated(apiKey) {
        this.#config.api.key = apiKey;
        this.#authenticated = true;
        
        this.#callEvent("api:ready", {apiKey: apiKey})
    }
    
    /**
     * Send data to the API
     * 
     * @param {*} data The Data to send
     * @param {boolean} ignoreAuth Whether to ignore auth
     */
    send(data, ignoreAuth = false) {
        if(!this.isConnected()) throw new Error("Tried to send data to API while not connected.");
        if(!ignoreAuth && !this.isAuthenticated()) throw new Error("Tried to send data to API while not authenticated");
        
        this.#webSocket.send(JSON.stringify(data));
    }
    
}