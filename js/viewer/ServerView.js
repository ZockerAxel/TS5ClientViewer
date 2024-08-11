//@ts-check
import Server from "../ts/Server.js";
import ChannelView from "./ChannelView.js";

export default class ServerView {
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
        this.#server = server;
    }
    
    getServer() {
        return this.#server;
    }
    
    getElement() {
        return this.#element;
    }
    
    buildTree() {
        this.#rootChannelView = new ChannelView(this, null, this.#server.getRootChannel());
        this.#rootChannelView.buildTree();
    }
    
    createElement() {
        this.#element = document.createElement("div");
        this.#element.classList.add("server");
        
        const rootChannelElement = this.#rootChannelView.createElement();
        this.#element.appendChild(rootChannelElement);
        
        return this.#element;
    }
}