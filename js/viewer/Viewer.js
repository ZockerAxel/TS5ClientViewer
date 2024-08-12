//@ts-check
import Server from "../ts/Server.js";
import Handler from "../ts/Handler.js";
import { viewerDiv, interfaceDiv } from "../PreloadedElements.js";
import ServerView from "./ServerView.js";
import ChannelView from "./ChannelView.js";

/**
 * @typedef ViewerMode
 * @type {"tree" | "channel" | "talking"}
 */

/**
 * @typedef ServerSelectMode
 * @type {"active" | "by_name"}
 */

export default class Viewer {
    #handler;
    
    #mode;
    #serverSelectMode;
    /**@type {*} */
    #serverSelectModeOptions;
    /**@type {number} */
    #scale;
    /**@type {string} */
    #alignment;
    /**@type {boolean} */
    #localClientColorEnabled;
    /**@type {boolean} */
    #channelHidden;
    
    /**@type {Server} */
    #server;
    
    /**
     * 
     * @param {Handler} handler
     * @param {{mode: ViewerMode, serverSelectMode: ServerSelectMode, serverSelectModeOptions: *, scale: number, alignment: string, localClientColorEnabled: boolean, channelHidden: boolean}} options 
     */
    constructor(handler, {mode, serverSelectMode, serverSelectModeOptions, scale, alignment, localClientColorEnabled, channelHidden}) {
        this.#handler = handler;
        
        this.#mode = mode;
        this.#serverSelectMode = serverSelectMode;
        this.#serverSelectModeOptions = serverSelectModeOptions;
        this.setScale(scale);
        this.setAlignment(alignment);
        this.setLocalClientColorEnabled(localClientColorEnabled);
        this.#channelHidden = channelHidden;
        
        this.#registerEvents();
    }
    
    #registerEvents() {
        const self = this;
        
        this.#handler.onActiveServerChange(function(server) {
            if(self.getServerSelectMode() !== "active") return;
            
            self.setServer(server);
        });
        
        this.#handler.onNewServer(function(server) {
            server.onLocalClientMoved(function(channel) {
                if(self.getServer() !== server) return;
                if(self.getMode() !== "channel" && self.getMode() !== "talking") return;
                
                self.refreshViewer();
            });
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
            this.refreshViewer();
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
        
        this.refreshViewer();
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
    
    /**
     * Set a new Scale
     * 
     * @param {number} scale Scale
     */
    setScale(scale) {
        this.#scale = scale;
        
        viewerDiv.style.setProperty("--scale", `${scale}`);
    }
    
    getScale() {
        return this.#scale;
    }
    
    /**
     * Set a new Alignment
     * 
     * @param {string} alignment Alignment
     */
    setAlignment(alignment) {
        this.#alignment = alignment;
        
        viewerDiv.style.setProperty("--alignment", `${alignment}`);
    }
    
    getAlignment() {
        return this.#alignment;
    }
    
    /**
     * Sets whether local client color is enabled
     * 
     * @param {boolean} enabled Whether the local client has a different color
     */
    setLocalClientColorEnabled(enabled) {
        this.#localClientColorEnabled = enabled;
        
        if(enabled) {
            viewerDiv.style.removeProperty("--local-client-text-color");
        } else {
            viewerDiv.style.setProperty("--local-client-text-color", "var(--client-text-color)");
        }
    }
    
    isLocalClientColorEnabled() {
        return this.#localClientColorEnabled;
    }
    
    /**
     * Sets whether the channel is hidden (not applicable for mode "tree")
     * 
     * @param {boolean} hidden 
     */
    setChannelHidden(hidden) {
        this.#channelHidden = hidden;
        
        this.refreshViewer();
    }
    
    isChannelHidden() {
        return this.#channelHidden;
    }
    
    refreshViewer() {
        switch(this.#mode) {
            case "tree":
                this.createTree();
                break;
            case "channel":
                this.createOwnChannel();
                break;
            case "talking":
                this.createTalking();
                break;
        }
    }
    
    createTree() {
        console.log({message: "[Viewer] Creating new Tree ..."});
        viewerDiv.textContent = "";//Clear Viewer
        
        const server = this.getServer();
        
        const serverView = new ServerView(server);
        
        serverView.buildTree();
        
        const tree = serverView.createElement();
        viewerDiv.appendChild(tree);
        serverView.onTreeDisplayed();
    }
    
    createOwnChannel() {
        console.log({message: "[Viewer] Creating Own Channel ..."});
        viewerDiv.textContent = "";//Clear Viewer
        
        const server = this.getServer();
        const client = server.getLocalClient();
        
        if(client === null) throw new Error("No Local Client found");
        
        const channel = client.getChannel();
        
        if(channel === null) throw new Error("Channel of Local Client not found");;
        
        const channelView = new ChannelView(null, channel);
        
        channelView.buildClientTree();
        
        const tree = channelView.createElement();
        viewerDiv.appendChild(tree);
        channelView.onTreeDisplayed();
        
        channelView.setChannelNameHidden(this.isChannelHidden());
    }
    
    createTalking() {
        console.log({message: "[Viewer] Creating Talking ..."});
        viewerDiv.textContent = "";//Clear Viewer
        
        
    }
}