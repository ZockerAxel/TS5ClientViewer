//@ts-check
import Client from "../ts/Client.js";
import ChannelView from "./ChannelView.js";

const CLIENT_STATUSES = [
    "hardware_muted",
    "mic_muted",
    "sound_muted",
    "away",
    "not_talking",
    "talking",
];

export default class ClientView {
    #channelView;
    
    #client;
    /**@type {HTMLDivElement} */
    #element;
    
    /**
     * 
     * @param {ChannelView} channelView The Channel View this Client View is in
     * @param {Client} client The Client
     */
    constructor(channelView, client) {
        this.#channelView = channelView;
        this.#client = client;
    }
    
    getChannelView() {
        return this.#channelView;
    }
    
    getClient() {
        return this.#client;
    }
    
    getElement() {
        return this.#element;
    }
    
    createElement() {
        this.#element = document.createElement("div");
        this.#element.classList.add("client");
        
        for(const status of CLIENT_STATUSES) {
            const statusElement = document.createElement("div");
            statusElement.classList.add("status");
            statusElement.setAttributeNS("ts5viewer", "status", status);
            
            this.#element.appendChild(statusElement);
        }
        
        const clientName = document.createElement("div");
        clientName.classList.add("name");
        clientName.textContent = `${this.#client.getNickname()}`;
        
        this.#element.appendChild(clientName);
        
        const awayMessage = document.createElement("div");
        awayMessage.textContent = `${this.#client.getAwayMessage()}`;
        
        this.#element.appendChild(awayMessage);
        
        return this.#element;
    }
    
    remove() {
        this.#element.remove();
    }
}