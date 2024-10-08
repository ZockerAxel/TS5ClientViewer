//@ts-check
import Server from "../ts/Server.js";
import Handler from "../ts/Handler.js";
import { viewerDiv, interfaceDiv, hintScreenDiv, mainElement } from "../PreloadedElements.js";
import ServerView from "./ServerView.js";
import ChannelView from "./ChannelView.js";
import { logger } from "../Logger.js";

/**
 * @typedef ViewerMode
 * @type {"tree" | "channel"}
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
    #horizontalAlignment;
    /**@type {string} */
    #verticalAlignment;
    /**@type {boolean} */
    #localClientColorEnabled;
    /**@type {boolean} */
    #channelHidden;
    /**@type {boolean} */
    #silentClientsHidden;
    /**@type {boolean} */
    #statusHidden;
    /**@type {boolean} */
    #avatarsShown;
    /**@type {boolean} */
    #spacersShown;
    /**@type {boolean} */
    #emptyChannelsHidden;
    /**@type {boolean} */
    #queryClientsShown;
    /**@type {boolean} */
    #channelFollowed;
    /**@type {string} */
    #followChannelName;
    /**@type {boolean} */
    #awayMessageHidden;
    /**@type {boolean} */
    #subChannelsShown;
    /**@type {boolean} */
    #localClientHidden;
    
    /**@type {Server} */
    #server;
    
    /**@type {ServerView | ChannelView | null} */
    #currentView = null;
    
    /**
     * 
     * @param {Handler} handler
     * @param {{mode: ViewerMode, serverSelectMode: ServerSelectMode, serverSelectModeOptions: *, scale: number, horizontalAlignment: string, verticalAlignment: string, localClientColorEnabled: boolean, channelHidden: boolean, silentClientsHidden: boolean, statusHidden: boolean, avatarsShown: boolean, spacersShown: boolean, emptyChannelsHidden: boolean, queryClientsShown: boolean, channelFollowed: boolean, followChannelName: string, awayMessageHidden: boolean, subChannelsShown: boolean, localClientHidden: boolean}} options 
     */
    constructor(handler, {mode, serverSelectMode, serverSelectModeOptions, scale, horizontalAlignment, verticalAlignment, localClientColorEnabled, channelHidden, silentClientsHidden, statusHidden, avatarsShown, spacersShown, emptyChannelsHidden, queryClientsShown, channelFollowed, followChannelName, awayMessageHidden, subChannelsShown, localClientHidden}) {
        this.#handler = handler;
        
        this.#mode = mode;
        this.#serverSelectMode = serverSelectMode;
        this.#serverSelectModeOptions = serverSelectModeOptions;
        this.setScale(scale);
        this.setHorizontalAlignment(horizontalAlignment);
        this.setVerticalAlignment(verticalAlignment);
        this.setLocalClientColorEnabled(localClientColorEnabled);
        this.#channelHidden = channelHidden;
        this.setSilentClientsHidden(silentClientsHidden);
        this.setStatusHidden(statusHidden);
        this.setAvatarsShown(avatarsShown);
        this.setSpacersShown(spacersShown);
        this.setEmptyChannelsHidden(emptyChannelsHidden);
        this.setQueryClientsShown(queryClientsShown);
        this.#channelFollowed = channelFollowed;
        this.#followChannelName = followChannelName;
        this.setAwayMessageHidden(awayMessageHidden);
        this.setSubChannelsShown(subChannelsShown);
        this.setLocalClientHidden(localClientHidden);
        
        this.#registerEvents();
        this.#addViewerChangeObserver();
    }
    
    #registerEvents() {
        const self = this;
        
        this.#handler.onActiveServerChange(function(server) {
            if(self.getServerSelectMode() !== "active") return;
            
            self.setServer(server);
        });
        
        this.#handler.onNewServer(function(server) {
            self.updateSelectedServer();
            
            server.onLocalClientMoved(function() {
                if(self.getServer() !== server) return;
                if(self.getMode() !== "channel") return;
                
                self.refreshViewer();
            });
        });
    }
    
    #addViewerChangeObserver() {
        const self = this;
        
        const observer = new MutationObserver(function() {
            self.#currentView?.propagateViewerUpdate();
        });
        
        observer.observe(viewerDiv, {
            childList: true,
            subtree: true,
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
    setHorizontalAlignment(alignment) {
        this.#horizontalAlignment = alignment;
        
        viewerDiv.style.setProperty("--alignment-horizontal", `${alignment}`);
        interfaceDiv.style.setProperty("--alignment-horizontal", `${alignment === "start" ? "end" : "start"}`);
    }
    
    getHorizontalAlignment() {
        return this.#horizontalAlignment;
    }
    
    /**
     * Set a new Alignment
     * 
     * @param {string} alignment Alignment
     */
    setVerticalAlignment(alignment) {
        this.#verticalAlignment = alignment;
        
        const verticalProperty = alignment === "top" ? "column" : "column-reverse";
        
        viewerDiv.style.setProperty("--alignment-vertical", `${verticalProperty}`);
        mainElement.classList.toggle("aligned_to_top", alignment === "top");
    }
    
    getVerticalAlignment() {
        return this.#verticalAlignment;
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
     * @param {boolean} hidden Whether channel name will be hidden
     */
    setChannelHidden(hidden) {
        this.#channelHidden = hidden;
        
        this.refreshViewer();
    }
    
    isChannelHidden() {
        return this.#channelHidden;
    }
    
    /**
     * Sets whether silent clients will be hidden
     * 
     * @param {boolean} hidden Whether silent clients should be hidden
     */
    setSilentClientsHidden(hidden) {
        this.#silentClientsHidden = hidden;
        
        viewerDiv.classList.toggle("hide_silent_clients", hidden);
        
        this.updateViewer();
    }
    
    isSilentClientsHidden() {
        return this.#silentClientsHidden;
    }
    
    /**
     * Sets whether status will be hidden
     * 
     * @param {boolean} hidden Whether silent clients should be hidden
     */
    setStatusHidden(hidden) {
        this.#statusHidden = hidden;
        
        viewerDiv.classList.toggle("hide_status", hidden);
    }
    
    isStatusHidden() {
        return this.#statusHidden;
    }
    
    /**
     * Sets whether avatars will be shown
     * 
     * @param {boolean} shown Whether avatars will be displayed
     */
    setAvatarsShown(shown) {
        this.#avatarsShown = shown;
        
        viewerDiv.classList.toggle("show_avatars", shown);
    }
    
    isAvatarsShown() {
        return this.#avatarsShown;
    }
    
    /**
     * Sets whether spacers will be shown
     * 
     * @param {boolean} shown Whether spacers should be shown
     */
    setSpacersShown(shown) {
        this.#spacersShown = shown;
        
        viewerDiv.classList.toggle("show_spacers", shown);
    }
    
    isSpacersShown() {
        return this.#spacersShown;
    }
    
    /**
     * Sets whether empty channels will be hidden
     * 
     * @param {boolean} hidden Whether empty channels should be hidden
     */
    setEmptyChannelsHidden(hidden) {
        this.#emptyChannelsHidden = hidden;
        
        viewerDiv.classList.toggle("hide_empty_channels", hidden);
    }
    
    isEmptyChannelsHidden() {
        return this.#emptyChannelsHidden;
    }
    
    /**
     * Sets whether query clients will be swown
     * 
     * @param {boolean} shown Whether query clients should be shown
     */
    setQueryClientsShown(shown) {
        this.#queryClientsShown = shown;
        
        viewerDiv.classList.toggle("show_query_clients", shown);
    }
    
    isQueryClientsShown() {
        return this.#queryClientsShown;
    }
    
    /**
     * Sets whether channel will be followed
     * 
     * @param {boolean} channelFollowed Whether channel will be followed
     */
    setChannelFollowed(channelFollowed) {
        this.#channelFollowed = channelFollowed;
        
        this.#currentView?.propagateViewerUpdate();
        
        if(!channelFollowed) {
            document.body.scrollTo({
                behavior: "smooth",
                top: 0,
            });
        }
    }
    
    isChannelFollowed() {
        return this.#channelFollowed;
    }
    
    /**
     * Set the channel to follow
     * 
     * @param {string} name The channel to follow
     */
    setFollowChannelName(name) {
        this.#followChannelName = name;
        
        this.#currentView?.propagateViewerUpdate();
        
        if(name === "") {
            document.body.scrollTo({
                behavior: "smooth",
                top: 0,
            });
        }
    }
    
    getFollowChannelName() {
        return this.isChannelFollowed() ? "" : this.#followChannelName;
    }
    
    isSpecificChannelFollowed() {
        return !this.isChannelFollowed() && this.#followChannelName !== "";
    }
    
    /**
     * Sets whether away message will be hidden
     * 
     * @param {boolean} hidden Whether away message should be hidden
     */
    setAwayMessageHidden(hidden) {
        this.#awayMessageHidden = hidden;
        
        viewerDiv.classList.toggle("hide_away_message", hidden);
    }
    
    isAwayMessageHidden() {
        return this.#awayMessageHidden;
    }
    
    /**
     * Sets whether sub channels will be shown
     * 
     * @param {boolean} shown Whether sub channels should be shown
     */
    setSubChannelsShown(shown) {
        this.#subChannelsShown = shown;
        
        viewerDiv.classList.toggle("show_subchannels", shown);
        
        this.updateViewer();//Update Viewer to make sure status icons are displayed
    }
    
    isSubChannelsShown() {
        return this.#subChannelsShown;
    }
    
    /**
     * Sets whether the local client will be hidden
     * 
     * @param {boolean} hidden Whether the local client should be hidden
     */
    setLocalClientHidden(hidden) {
        this.#localClientHidden = hidden;
        
        viewerDiv.classList.toggle("hide_local_client", hidden);
        
        this.updateViewer();
    }
    
    isLocalClientHidden() {
        return this.#localClientHidden;
    }
    
    refreshViewer() {
        switch(this.#mode) {
            case "tree":
                this.createTree();
                break;
            case "channel":
                this.createOwnChannel();
                break;
        }
    }
    
    updateViewer() {
        this.#currentView?.propagateViewerUpdate();
    }
    
    createTree() {
        logger.log({message: "[Viewer] Creating Tree ..."});
        viewerDiv.textContent = "";//Clear Viewer
        hintScreenDiv.classList.add("hidden");
        
        const server = this.getServer();
        
        const serverView = new ServerView(this, server);
        this.#currentView = serverView;
        
        serverView.buildTree();
        
        const tree = serverView.createElement();
        viewerDiv.appendChild(tree);
        serverView.onTreeDisplayed();
    }
    
    createOwnChannel() {
        logger.log({message: "[Viewer] Creating Own Channel ..."});
        viewerDiv.textContent = "";//Clear Viewer
        hintScreenDiv.classList.add("hidden");
        
        const server = this.getServer();
        const client = server.getLocalClient();
        
        if(client === null) throw new Error("No Local Client found");
        
        const channel = client.getChannel();
        
        if(channel === null) throw new Error("Channel of Local Client not found");;
        
        const channelView = new ChannelView(this, null, channel);
        this.#currentView = channelView;
        
        channelView.buildTree();
        
        const tree = channelView.createElement();
        viewerDiv.appendChild(tree);
        channelView.onTreeDisplayed();
        
        channelView.setChannelNameHidden(this.isChannelHidden());
    }
}