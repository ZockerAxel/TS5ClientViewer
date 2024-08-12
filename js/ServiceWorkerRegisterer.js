//@ts-check
export async function registerServiceWorker() {
    console.log("Registering Service Worker ...");
    /**@type {ServiceWorkerRegistration} */
    var reg;
    //Service Worker
    if("serviceWorker" in navigator) {
        try {
            reg = await navigator.serviceWorker.register("/service-worker.js");
        } catch(err) {
            console.log("Error while registering Service Worker: " + err);
        }
    }
}