//@ts-check
import Client from "../ts/Client.js";
import ChannelView from "./ChannelView.js";

const CLIENT_STATUSES = [
    "hardware_muted",
    "mic_muted",
    "sound_muted",
    "away",
    "away_and_sound_muted",
    "not_talking",
    "talking",
];

export default class ClientView {
    #channelView;
    
    #client;
    /**@type {HTMLDivElement} */
    #element;
    
    /**@type {HTMLDivElement} */
    #nicknameElement;
    
    /**@type {string} */
    #currentStatus;
    
    /**@type {Map<string, HTMLDivElement>} */
    #statusElements = new Map();
    
    /**@type {HTMLDivElement} */
    #awayMessageElement;
    
    /**
     * 
     * @param {ChannelView} channelView The Channel View this Client View is in
     * @param {Client} client The Client
     */
    constructor(channelView, client) {
        this.#channelView = channelView;
        this.#client = client;
        
        this.#registerEvents();
    }
    
    #registerEvents() {
        const self = this;
        
        this.#client.onStatusChanged(function() {
            self.updateStatus();
        });
        
        this.#client.onAwayChange(function(newValue, message) {
            self.#awayMessageElement.textContent = message;
            self.#awayMessageElement.classList.toggle("hidden", !newValue || message.length === 0);
        });
        
        this.#client.onNicknameChange(function(newValue) {
            self.#nicknameElement.textContent = newValue;
        });
        
        this.#client.onAvatarUrlChange(function(newValue) {
            self.#element.classList.toggle("has_avatar", newValue !== null);
            self.#element.style.setProperty("--avatar", `url("${newValue}")`);
        });
    }
    
    updateStatus() {
        this.#currentStatus = this.#getStatus();
        
        for(const status of CLIENT_STATUSES) {
            const statusElement = this.#statusElements.get(status);
            
            if(!statusElement) continue;
            
            statusElement.classList.toggle("hidden", status !== this.#currentStatus);
        }
        
        this.#awayMessageElement.classList.toggle("hidden", !this.#client.isAway() || this.#client.getAwayMessage().length === 0);
    }
    
    #getStatus() {
        if(this.#client.isAway()) {
            return this.#client.isSoundMuted() ? "away_and_sound_muted" : "away";
        }
        if(this.#client.isSoundMuted()) {
            return "sound_muted";
        }
        if(this.#client.isHardwareMuted()) {
            return "hardware_muted";
        }
        if(this.#client.isMuted()) {
            return "mic_muted";
        }
        if(this.#client.isTalking()) {
            return "talking";
        }
        
        return "not_talking";
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
        this.#element.classList.toggle("regular_client", this.#client.getType() === 0);
        this.#element.classList.toggle("has_avatar", this.#client.getAvatarUrl() !== null);
        this.#element.style.setProperty("--avatar", `url("${this.#client.getAvatarUrl()}")`);
        if(this.#client.isLocalClient()) this.#element.classList.add("self");
        
        for(const status of CLIENT_STATUSES) {
            const statusElement = document.createElement("div");
            statusElement.classList.add("status");
            statusElement.setAttribute("status", status);
            
            this.#statusElements.set(status, statusElement);
            
            this.#element.appendChild(statusElement);
        }
        
        this.#nicknameElement = document.createElement("div");
        this.#nicknameElement.classList.add("name");
        this.#nicknameElement.textContent = `${this.#client.getNickname()}`;
        
        this.#element.appendChild(this.#nicknameElement);
        
        this.#awayMessageElement = document.createElement("div");
        this.#awayMessageElement.classList.add("away_message");
        this.#awayMessageElement.textContent = `${this.#client.getAwayMessage()}`;
        
        this.#element.appendChild(this.#awayMessageElement);
        
        this.#element.style.setProperty("--height", `${this.#element.clientHeight}`);
        
        this.updateStatus();
        
        return this.#element;
    }
    
    onTreeDisplayed() {
        this.#element.style.setProperty("--height", `${this.#element.clientHeight}px`);
    }
    
    remove() {
        this.#element.remove();
    }
}