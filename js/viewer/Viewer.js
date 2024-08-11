//@ts-check
import Server from "../ts/Server.js";
import Handler from "../ts/TSHandler.js";
import { viewerDiv, interfaceDiv } from "../PreloadedElements.js";
import ServerView from "./ServerView.js";

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
     * @param {{mode?: ViewerMode, serverSelectMode?: ServerSelectMode, serverSelectModeOptions?: *}} options 
     */
    constructor(handler, {mode = "tree", serverSelectMode = "active", serverSelectModeOptions = {}} = {}) {
        this.#handler = handler;
        
        this.#mode = mode;
        this.#serverSelectMode = serverSelectMode;
        
        this.#registerEvents();
    }
    
    #registerEvents() {
        const self = this;
        
        this.#handler.onActiveServerChange(function(server) {
            if(self.getServerSelectMode() !== "active") return;
            
            self.setServer(server);
        });
    }
    
    updateSelectedServer() {
        switch(this.#serverSelectMode) {
            case "active":
                this.#selectActiveServer();
                break;
            case "by_name":
                this.#selectServerByName();
                break;
        }
    }
    
    #selectActiveServer() {
        this.setServer(this.#handler.getActiveServer());
    }
    
    #selectServerByName() {
        const server = this.#handler.getServerByName(this.#serverSelectModeOptions.name);
        
        if(server === null) return;
        
        this.setServer(server);
    }
    
    /**
     * Sets the server. Updates the tree as necessary
     * 
     * @param {Server} server The new Server
     */
    setServer(server) {
        const changed = this.#server !== server;
        this.#server = server;
        
        if(changed) {
            this.createTree();
        }
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
    
    /**
     * Set the Server Select Mode
     * 
     * @param {ServerSelectMode} mode The Mode to use
     * @param {*} options The Options
     */
    setServerSelectMode(mode, options = {}) {
        this.#serverSelectMode = mode;
        this.#serverSelectModeOptions = options;
    }
    
    getServerSelectMode() {
        return this.#serverSelectMode;
    }
    
    getServerSelectModeOptions() {
        return this.#serverSelectModeOptions;
    }
    
    createTree() {
        viewerDiv.textContent = "";//Clear Viewer
        
        const server = this.getServer();
        
        const serverView = new ServerView(server);
        
        serverView.buildTree();
        
        const tree = serverView.createElement();
        viewerDiv.appendChild(tree);
        serverView.onTreeDisplayed();
    }
}