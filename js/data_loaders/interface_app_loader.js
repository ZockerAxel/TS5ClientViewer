const app = fetch("/data/interface_app.json").then(function(response) {return response.json()});

/**@type {{identifier: string, name: string, description: string, version: string}} */
export default await app;