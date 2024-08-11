//@ts-check
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
    
    getClients() {
        return this.#clients;
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
}