//@ts-check
import { createLengthString } from "../Utils.js";
import Client from "./Client.js";
import Server from "./Server.js";

export default class Channel {
    #server;
    
    #id;
    #name;
    #order;
    
    /**@type {Channel[]} */
    #subChannels = [];
    /**@type {Client[]} */
    #clients = [];
    
    //Callbacks
    /**@type {((newValue: string) => void)[]} */
    #nameUpdateCallbacks = [];
    /**@type {((channel: Channel) => void)[]} */
    #channelAddCallbacks = [];
    /**@type {((channel: Channel) => void)[]} */
    #channelRemoveCallbacks = [];
    /**@type {((client: Client) => void)[]} */
    #clientAddCallbacks = [];
    /**@type {((client: Client) => void)[]} */
    #clientRemoveCallbacks = [];
    
    /**
     * Creates a new Channel, which represents a Channel in the TeamSpeak Server Tree
     * 
     * @param {Server} server The server this channel belongs to
     * @param {number} id Channel ID
     * @param {string} name Channel Name
     * @param {number} order Channel Order
     */
    constructor(server, id, name, order) {
        this.#server = server;
        
        this.#id = id;
        this.#name = name;
        this.#order = order;
    }
    
    getServer() {
        return this.#server;
    }
    
    getParent() {
        const parent = this.#server.getRootChannel().getParentChannel(this);
        
        if(!parent) throw new Error(`Channel '${this.#name}' (ID: ${this.#id}) has no parent`);
        
        return parent;
    }
    
    getId() {
        return this.#id;
    }
    
    /**
     * 
     * @param {string} name The new channel name
     */
    updateName(name) {
        const changed = this.#name === name;
        this.#name = name;
        
        if(changed) {
            for(const callback of this.#nameUpdateCallbacks) {
                callback(name);
            }
        }
    }
    
    /**
     * 
     * @param {(newValue: string) => void} callback The callback function
     */
    onNameChange(callback) {
        this.#nameUpdateCallbacks.push(callback);
    }
    
    getName() {
        return this.#name;
    }
    
    getOrder() {
        return this.#order;
    }
    
    /**
     * Adds a subchannel with this channel as a parent
     * 
     * @param {Channel} channel The Channel that was added
     */
    addSubChannel(channel) {
        this.#subChannels.push(channel);
        
        for(const callback of this.#channelAddCallbacks) {
            callback(channel);
        }
    }
    
    /**
     * 
     * @param {(channel: Channel) => void} callback The callback function
     */
    onSubChannelAdd(callback) {
        this.#channelAddCallbacks.push(callback);
    }
    
    /**
     * Removes a subchannel from this channel
     * 
     * @param {Channel} channel The Channel that was added
     */
    removeSubChannel(channel) {
        const index = this.#subChannels.indexOf(channel);
        if(index === -1) return;
        
        this.#subChannels.splice(index, 1);
        
        for(const callback of this.#channelRemoveCallbacks) {
            callback(channel);
        }
    }
    
    /**
     * 
     * @param {(channel: Channel) => void} callback The callback function
     */
    onSubChannelRemove(callback) {
        this.#channelRemoveCallbacks.push(callback);
    }
    
    getSubChannels() {
        return this.#subChannels;
    }
    
    /**
     * Searches for the Channel by the specified ID in all of this channel's nested subchannels. Checks itself.
     * 
     * @param {number} id The Channel ID
     * @returns {Channel | null} The Channel. Returns null if no channel matching the provided ID was found.
     */
    getChannel(id) {
        if(this.getId() == id) return this;
        
        for(const channel of this.#subChannels) {
            if(channel.getId() === id) return channel;
        }
        
        for(const channel of this.#subChannels) {
            const recursiveChannel = channel.getChannel(id);
            if(recursiveChannel !== null) return recursiveChannel;
        }
        
        return null;
    }
    
    /**
     * Searches for the Channel that is the parent of the specified channel in it's nested subchannels. Checks itself.
     * 
     * @param {Channel} channel The Child Channel
     * @returns {Channel | null} The Parent Channel
     */
    getParentChannel(channel) {
        for(const subChannel of this.#subChannels) {
            if(subChannel == channel) return this;
        }
        
        for(const subChannel of this.#subChannels) {
            const foundParent = subChannel.getParentChannel(channel);
            if(foundParent !== null) return foundParent;
        }
        
        return null;
    }
    
    /**
     * Add a Client to this Channel
     * 
     * @param {Client} client The Client that was added
     */
    addClient(client) {
        this.#clients.push(client);
        
        for(const callback of this.#clientAddCallbacks) {
            callback(client);
        }
    }
    
    /**
     * 
     * @param {(client: Client) => void} callback The callback function
     */
    onClientAdd(callback) {
        this.#clientAddCallbacks.push(callback);
    }
    
    /**
     * Add a Client to this Channel
     * 
     * @param {Client} client The Client that was added
     */
    removeClient(client) {
        const index = this.#clients.indexOf(client);
        if(index === -1) return;
        
        this.#clients.splice(index, 1);
        
        for(const callback of this.#clientRemoveCallbacks) {
            callback(client);
        }
    }
    
    /**
     * 
     * @param {(client: Client) => void} callback The callback function
     */
    onClientRemove(callback) {
        this.#clientRemoveCallbacks.push(callback);
    }
    
    getClients() {
        return this.#clients;
    }
    
    /**
     * Searches for the Channel that is the parent of the specified Client in it's nested subchannels. Checks itself.
     * 
     * @param {Client} client The Client
     * @returns {Channel | null} The Parent Channel
     */
    getClientChannel(client) {
        for(const ownClient of this.#clients) {
            if(ownClient == client) return this;
        }
        
        for(const subChannel of this.#subChannels) {
            const foundParent = subChannel.getClientChannel(client);
            if(foundParent !== null) return foundParent;
        }
        
        return null;
    }
    
    /**
     * Searches for the Client by the specified ID in this Channel and all it's nested subchannels
     * 
     * @param {number} id The Client ID
     * @returns {Client | null} The Client. Returns null if no client matching the provided ID was found.
     */
    getClient(id) {
        for(const client of this.#clients) {
            if(client.getId() === id) return client;
        }
        
        for(const channel of this.#subChannels) {
            const client = channel.getClient(id);
            if(client !== null) return client;
        }
        
        return null;
    }
    
    toTreeString(offset = 0) {
        let text = createLengthString(offset * 2, " ") + this.#name;
        
        for(const client of this.#clients) {
            const clientLine = createLengthString((offset + 1) * 2, " ") + "- " + client.getNickname();
            text += `\n${clientLine}`;
        }
        
        for(const channel of this.#subChannels) {
            const channelText = channel.toTreeString(offset + 1);
            text += `\n${channelText}`;
        }
        
        return text;
    }
}

export class RootChannel extends Channel {
    
    /**
     * 
     * @param {Server} server The Server this Channel belongs to
     * @param {string} name The Server Name
     */
    constructor(server, name) {
        super(server, 0, name, 0);
    }
    
    /**
     * Add a Client to this Channel
     * 
     * @param {Client} client The Client that was added
     */
    addClient(client) {
        throw new Error("Illegal Operation: RootChannel#addClient. Reason: Root Channel can not have Clients!");
    }
}