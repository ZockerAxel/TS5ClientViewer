export default class App {
    #identifier;
    #name;
    #description;
    #version;
    
    /**
     * Creates a new App
     * 
     * @param {string} identifier The App Identifier
     * @param {string} name The App Name
     * @param {string} description The App Description
     * @param {string} version The App Version
     */
    constructor(identifier, name, description, version) {
        this.#identifier = identifier;
        this.#name = name;
        this.#description = description;
        this.#version = version;
    }
}