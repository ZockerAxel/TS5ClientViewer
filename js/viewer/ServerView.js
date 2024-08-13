//@ts-check
import Server from "../ts/Server.js";
import ChannelView from "./ChannelView.js";
import View from "./View.js";

export default class ServerView extends View {
    #server;
    /**@type {HTMLDivElement} */
    #element;
    
    /**@type {ChannelView} */
    #rootChannelView;
    
    /**
     * 
     * @param {Server} server The Server
     */
    constructor(server) {
        super();
        
        this.#server = server;
    }
    
    getServer() {
        return this.#server;
    }
    
    getElement() {
        return this.#element;
    }
    
    buildTree() {
        this.#rootChannelView = new ChannelView(null, this.#server.getRootChannel());
        this.#rootChannelView.buildTree();
    }
    
    createElement() {
        this.#element = document.createElement("div");
        this.#element.classList.add("server", "container");
        
        const rootChannelElement = this.#rootChannelView.createElement();
        this.#element.appendChild(rootChannelElement);
        
        return this.#element;
    }
    
    onTreeDisplayed() {
        this.#rootChannelView.onTreeDisplayed();
    }
    
    propagateViewerUpdate() {
        this.#rootChannelView.propagateViewerUpdate();
        this.onViewerUpdate();
    }
}