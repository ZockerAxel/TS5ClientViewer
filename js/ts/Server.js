//@ts-check
import Channel from "./Channel.js";
import Client from "./Client.js";
import RootChannel from "./RootChannel.js";

export default class Server {
    #id;
    #localClient;
    
    #rootChannel;
    
    /**
     * 
     * @param {number} id Connection ID
     * @param {Client} localClient The Local Client
     * @param {RootChannel} rootChannel The Root Channel (does not really exists, acts as the parent for all channels without a parent)
     */
    constructor(id, localClient, rootChannel) {
        this.#id = id;
        this.#localClient = localClient;
        this.#rootChannel = rootChannel;
    }
    
    getId() {
        return this.#id;
    }
    
    getLocalClient() {
        return this.#localClient;
    }
    
    getRootChannel() {
        return this.#rootChannel;
    }
    
    /**
     * Searches for the Channel by the specified ID
     * 
     * @param {number} id The Channel ID
     * @returns {Channel | null} The Channel. Returns null if no channel matching the provided ID was found.
     */
    getChannel(id) {
        return this.#rootChannel.getChannel(id);
    }
    
    /**
     * Searches for the Client by the specified ID in this Channel and all it's nested subchannels
     * 
     * @param {number} id The Client ID
     * @returns {Client | null} The Client. Returns null if no client matching the provided ID was found.
     */
    getClient(id) {
        return this.#rootChannel.getClient(id);
    }
}