const app = fetch("/data/obs_app.json").then(function(response) {return response.json()});

/**@type {{identifier: string, name: string, description: string}} */
export default await app;