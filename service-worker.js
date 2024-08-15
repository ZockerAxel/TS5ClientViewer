const pageDomain = "ts5viewer.endercentral.eu";
const cacheVersion = 6;
const beta = pageDomain !== location.hostname;
const currentCacheKey = `v${cacheVersion}${beta ? "-beta" : ""}`;

//Resources pre-cached
const precacheResources = [
    //Html & CSS
    "/",
    "/style.css",
    
    //Manifest
    "/manifest.json",
    
    //JS Files
    "/js/App.js",
    "/js/EnvironmentChecker.js",
    "/js/Main.js",
    "/js/PreloadedElements.js",
    "/js/UrlParamReader.js",
    "/js/Utils.js",
    
    "/js/data_loaders/InterfaceAppLoader.js",
    "/js/data_loaders/ObsAppLoader.js",
    "/js/data_loaders/StandaloneAppLoader.js",
    
    "/js/interface/Interface.js",
    
    "/js/ts/Channel.js",
    "/js/ts/Client.js",
    "/js/ts/Handler.js",
    "/js/ts/Server.js",
    
    "/js/viewer/ChannelView.js",
    "/js/viewer/ClientView.js",
    "/js/viewer/ServerView.js",
    "/js/viewer/Viewer.js",
    
    "/libs/ts5-remote-apps-wrapper.min.js",
    
    //Data
    "/data/interface_app.json",
    "/data/standalone_app.json",
    "/data/obs_app.json",
    
    //Resources
    //  Fonts
    "/resources/font/roboto/font-family.css",
    "/resources/font/roboto/Roboto-Regular.ttf",
    //  Images
    "/resources/img/audio_input.svg",
    "/resources/img/client_status/audio_input_muted_hardware.svg",
    "/resources/img/client_status/audio_input_muted.svg",
    "/resources/img/client_status/audio_output_muted.svg",
    "/resources/img/client_status/away_and_sound_muted.svg",
    "/resources/img/client_status/away.svg",
];

//Resources that are fetched first and if the fetch fails, are then loaded from cache
const fetchFirstResources = [
];

//Event Listeners

self.addEventListener("install", function(event) {
    event.waitUntil(addPrecacheResources());
});

self.addEventListener("activate", function(event) {
    event.waitUntil(deleteOldCaches());
});

self.addEventListener("fetch", function(event) {
    const options = {
        request: event.request,
    };
    
    if(event.request.method !== "GET") {
        event.respondWith(fetchOnly(options));
        return;
    }
    
    if(location.hostname !== pageDomain && !event.request.url.includes("/resources/")) {
        worker.log("Detected Page on alternative Domain, fetching first ...");
        event.respondWith(fromFetchFirst(options));
        return;
    }
    
    for(const fetchFirstRessource of fetchFirstResources) {
        if(event.request.url.endsWith(fetchFirstRessource)) {
            event.respondWith(fromFetchFirst(options));
            return;
        }
    }
    event.respondWith(fromCacheFirst(options));
});








//Utilty Functions

async function addPrecacheResources() {
    worker.log("Adding Precache Resources ...");
    const cache = await caches.open(currentCacheKey);
    worker.log("Cache '" + currentCacheKey + "' opened");
    for(const resource of precacheResources) {
        try {
            const request  = new Request(resource, {
                cache: "no-store",
            });
            
            const cached = await caches.match(request);
            if(cached) {
                continue;//Do not try to re-cache already cached things
            }
            
            worker.log("Caching '" + resource + "' ...");
            await cache.add(request);
        } catch(err) {
            worker.log(`Could not cache '${resource}'.`);
        }
    }
    worker.log("Files cached!");
}

async function fromCacheFirst({request}) {
    try {
        const cached = await caches.match(request);
        if(cached) {
            return cached;
        }
        
        const fetchResponse = await fetch(request, {
            cache: "no-store",
        });
        addToCache(request, fetchResponse.clone());
        return fetchResponse;
    } catch(error) {
        return new Response("Network Error", {
            status: 408,
            headers: {"Content-Type": "text/plain"},
        });
    }
}

async function fromFetchFirst({request}) {
    try {
        const fetchResponse = await fetch(request, {
            cache: "no-store",
        });
        addToCache(request, fetchResponse.clone());
        return fetchResponse;
    } catch(error) {
        const cached = await caches.match(request);
        if(cached) {
            return cached;
        }
        
        return new Response("Network Error", {
            status: 408,
            headers: {"Content-Type": "text/plain"},
        });
    }
}

async function fetchOnly({request}) {
    return await fetch(request, {
        cache: "no-store",
    });
}

async function addToCache(request, response) {
    const cache = await caches.open(currentCacheKey);
    cache.put(request, response);
}

async function deleteOldCaches() {
    worker.log("Deleting Old Caches ...");
    const keys = await caches.keys();
    const cachesToDelete = keys.filter(function(key) {
        return key !== currentCacheKey;
    });
    await Promise.all(cachesToDelete.map(deleteCache));
}

async function deleteCache(key) {
    worker.log("Deleting Cache '" + key + "'");
    await caches.delete(key);
}

const worker = {
    log: function(data) {
        console.log("[Service Worker]", data);
    }
};