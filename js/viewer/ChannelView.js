//@ts-check
import Channel from "../ts/Channel.js";
import ClientView from "./ClientView.js";
import ServerView from "./ServerView.js";

export default class ChannelView {
    #serverView;
    #parentView;
    
    #channel;
    /**@type {HTMLDivElement} */
    #element;
    
    /**@type {HTMLDivElement} */
    #channelNameElement;
    
    /**@type {HTMLDivElement} */
    #clientContainer;
    /**@type {HTMLDivElement} */
    #channelContainer;
    
    /**@type {ClientView[]} */
    #clientViews = [];
    
    /**@type {ChannelView[]} */
    #channelViews = [];
    
    /**
     * 
     * @param {ServerView} serverView The Server View this Channel View belongs to
     * @param {ChannelView | null} parentView The View of this' Channels parent
     * @param {Channel} channel The Channel
     */
    constructor(serverView, parentView, channel) {
        this.#serverView = serverView;
        this.#parentView = parentView;
        this.#channel = channel;
        
        this.#registerEvents();
    }
    
    #registerEvents() {
        const self = this;
        
        this.#channel.onSubChannelAdd(function(channel) {
            const channelView = new ChannelView(self.#serverView, self, channel);
            channelView.buildTree();
            
            self.#channelViews.push(channelView);
            if(!self.isCreated()) return;
            
            self.#addChannelView(channelView);
            
            channelView.onTreeDisplayed();
            
            self.#updateChannelTree();
        });
        
        this.#channel.onSubChannelRemove(function(channel) {
            for(let i = 0; i < self.#channelViews.length; i++) {
                const channelView = self.#channelViews[i];
                if(channelView.getChannel() !== channel) continue;
                
                channelView.remove();
                self.#channelViews.splice(i, 1);
                break;
            }
        });
        
        this.#channel.onNameChange(function(name) {
            self.#channelNameElement.textContent = name;
        });
        
        this.#channel.onClientAdd(function(client) {
            const clientView = new ClientView(self, client);
            
            self.#clientViews.push(clientView);
            if(!self.isCreated()) return;
            
            self.#addClientView(clientView);
            
            clientView.onTreeDisplayed();
            
            self.#updateClientTree();
        });
        
        this.#channel.onClientRemove(function(client) {
            for(let i = 0; i < self.#clientViews.length; i++) {
                const clientView = self.#clientViews[i];
                if(clientView.getClient() !== client) continue;
                
                clientView.remove();
                self.#clientViews.splice(i, 1);
                break;
            }
        });
        
        this.#channel.onDelete(function() {
            self.remove();
        });
    }
    
    getServerView() {
        return this.#serverView;
    }
    
    getParentView() {
        return this.#parentView;
    }
    
    getChannel() {
        return this.#channel;
    }
    
    getElement() {
        return this.#element;
    }
    
    isCreated() {
        return this.#element !== undefined && this.#element.parentElement !== undefined;
    }
    
    buildTree() {
        for(const client of this.#channel.getClients()) {
            this.#clientViews.push(new ClientView(this, client));
        }
        for(const channel of this.#channel.getSubChannels()) {
            const channelView = new ChannelView(this.#serverView, this, channel);
            channelView.buildTree();
            
            this.#channelViews.push(channelView);
        }
    }
    
    createElement() {
        this.#element = document.createElement("div");
        this.#element.classList.add("channel", "container");
        
        this.#channelNameElement = document.createElement("div");
        this.#channelNameElement.classList.add("name");
        this.#channelNameElement.textContent = `${this.#channel.getDisplayName()}`;
        
        this.#element.appendChild(this.#channelNameElement);
        
        this.#clientContainer = document.createElement("div");
        this.#clientContainer.classList.add("client_list");
        
        for(const clientView of this.#clientViews) {
            this.#addClientView(clientView);
        }
        
        this.#element.appendChild(this.#clientContainer);
        
        this.#channelContainer = document.createElement("div");
        this.#channelContainer.classList.add("channel_list");
        
        for(const channelView of this.#channelViews) {
            this.#addChannelView(channelView);
        }
        
        this.#element.appendChild(this.#channelContainer);
        
        return this.#element;
    }
    
    onTreeDisplayed() {
        for(const clientView of this.#clientViews) {
            clientView.onTreeDisplayed();
        }
        for(const channelView of this.#channelViews) {
            channelView.onTreeDisplayed();
        }
    }
    
    /**
     * 
     * @param {ClientView} clientView The Client View to add
     */
    #addClientView(clientView) {
        const clientElement = clientView.createElement();
        this.#clientContainer.appendChild(clientElement);
    }
    
    #updateClientTree() {
        for(const client of this.#channel.getClients()) {
            for(const clientView of this.#clientViews) {
                if(clientView.getClient() !== client) continue;
                
                this.#clientContainer.appendChild(clientView.getElement());
                break;
            }
        }
    }
    
    /**
     * 
     * @param {ChannelView} channelView The Channel View to add
     */
    #addChannelView(channelView) {
        const channelElement = channelView.createElement();
        this.#channelContainer.appendChild(channelElement);
    }
    
    #updateChannelTree() {
        for(const channel of this.#channel.getSubChannels()) {
            for(const channelView of this.#channelViews) {
                if(channelView.getChannel() !== channel) continue;
                
                this.#channelContainer.appendChild(channelView.getElement());
                break;
            }
        }
    }
    
    remove() {
        this.#element.remove();
    }
}