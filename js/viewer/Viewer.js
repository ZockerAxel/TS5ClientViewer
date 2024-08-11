//@ts-check
import Server from "../ts/Server.js";
import Handler from "../ts/TSHandler.js";

/**
 * @typedef ViewerMode
 * @type {"tree" | "used_channels" | "own_channel" | "talking"}
 */

/**
 * @typedef ServerSelectMode
 * @type {"active" | "by_name"}
 */

export default class Viewer {
    #handler;
    
    #mode;
    #serverSelectMode;
    #serverSelectModeOptions;
    
    /**@type {Server} */
    #server;
    
    
    /**
     * 
     * @param {Handler} handler
     * @param {{mode?: ViewerMode, serverSelectMode?: ServerSelectMode}} options 
     */
    constructor(handler, {mode = "tree", serverSelectMode = "active"} = {}) {
        this.#handler = handler;
        
        this.#mode = mode;
        this.#serverSelectMode = serverSelectMode;
    }
    
    updateSelectedServer() {
        switch(this.#serverSelectMode) {
            case "active":
                this.#selectActiveServer();
                return;
            case "by_name":
                this.#selectServerByName();
                return;
        }
    }
    
    #selectActiveServer() {
        this.#server = this.#handler.getActiveServer();
    }
    
    #selectServerByName() {
        const server = this.#handler.getServerByName(this.#serverSelectModeOptions.name);
        
        if(server === null) return;
        
        this.#server = server;
    }
    
    getServer() {
        return this.#server;
    }
    
    /**
     * Set the Viewer to another mode
     * 
     * @param {ViewerMode} mode The new mode
     */
    setMode(mode) {
        this.#mode = mode;
    }
    
    getMode() {
        return this.#mode;
    }
    
    createTree() {
        
    }
}