//@ts-check
import Channel from "./Channel.js";
import Server from "./Server.js";

export default class RootChannel extends Channel {
    
    /**
     * 
     * @param {Server} server The Server this Channel belongs to
     * @param {string} name The Server Name
     */
    constructor(server, name) {
        super(server, 0.1, name, 0);
    }
    
    /**
     * Searches for the Channel by the specified ID in all of this channel's nested subchannels. Does not check itself.
     * 
     * @param {number} id The Channel ID
     * @returns {Channel | null} The Channel. Returns null if no channel matching the provided ID was found.
     */
    getChannel(id) {
        for(const channel of this.getSubChannels()) {
            if(channel.getId() === id) return channel;
        }
        
        for(const channel of this.getSubChannels()) {
            const recursiveChannel = channel.getChannel(id);
            if(recursiveChannel !== null) return recursiveChannel;
        }
        
        return null;
    }
}