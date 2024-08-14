//@ts-check
import { getParamBoolean } from "./UrlParamReader.js";

class Logger {
    #enabled = false;
    
    constructor() {
        this.#updateEnabled();
    }
    
    #updateEnabled() {
        this.#enabled = getParamBoolean("enable_log");
    }
    
    /**
     * Logs a message to the console, if the logger is enabled
     * 
     * @param {*} message The message to log (may be any type of object)
     */
    log(message) {
        if(!this.#enabled) return;
        
        console.log(message);
    }
    
    /**
     * Logs an error message to the console, if the logger is enabled
     * 
     * @param {*} message The error message to log (may be any type of object)
     */
    error(message) {
        if(!this.#enabled) return;
        
        console.error(message);
    }
}

export const logger = new Logger();