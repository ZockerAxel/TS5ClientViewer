//@ts-check
import { getParamBoolean } from "./UrlParamReader.js";

const DEFAULT_CATEGORY_NAME = "default";

class Logger {
    /**@type {Set<string>} */
    #enabledCategories = new Set();
    
    constructor() {
        this.#updateEnabledCategories();
    }
    
    #updateEnabledCategories() {
        this.#enabledCategories.clear();
        if(getParamBoolean("enable_log")) this.#enabledCategories.add(DEFAULT_CATEGORY_NAME);
        if(getParamBoolean("enable_connection_log")) this.#enabledCategories.add("connection"); 
    }
    
    /**
     * Set whether the logger is enabled
     * 
     * @param {boolean} enabled Whether the logger is enabled
     */
    setEnabled(enabled, category = DEFAULT_CATEGORY_NAME) {
        (enabled ? this.#enabledCategories.add : this.#enabledCategories.delete)(category);
    }
    
    /**
     * Gets whether a category is enabled
     * 
     * @param {string} category The log category
     * @returns {boolean} Whether the category is enabled
     */
    isEnabled(category = DEFAULT_CATEGORY_NAME) {
        return this.#enabledCategories.has(category);
    }
    
    /**
     * Gets whether a category is disabled
     * 
     * @param {string} category The log category
     * @returns {boolean} Whether the category is disabled
     */
    isDisabled(category = DEFAULT_CATEGORY_NAME) {
        return !this.isEnabled(category);
    }
    
    /**
     * Logs a message to the console, if the logger is enabled
     * 
     * @param {*} message The message to log (may be any type of object)
     * @param {string} category The log category
     */
    log(message, category = DEFAULT_CATEGORY_NAME) {
        if(this.isDisabled(category)) return;
        
        console.log(message);
    }
    
    /**
     * Logs an error message to the console, if the logger is enabled
     * 
     * @param {*} message The error message to log (may be any type of object)
     * @param {string} category The log category
     */
    error(message, category = DEFAULT_CATEGORY_NAME) {
        if(this.isDisabled(category) && typeof(message) === "object") {
            console.error(JSON.stringify(message));
            return;
        }
        
        console.error(message);
    }
}

export const logger = new Logger();
window["logger"] = logger;