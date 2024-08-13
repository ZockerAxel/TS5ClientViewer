import { logger } from "./Logger";

//@ts-check
export async function registerServiceWorker() {
    logger.log("Registering Service Worker ...");
    /**@type {ServiceWorkerRegistration} */
    var reg;
    //Service Worker
    if("serviceWorker" in navigator) {
        try {
            reg = await navigator.serviceWorker.register("/service-worker.js");
        } catch(err) {
            logger.log("Error while registering Service Worker: " + err);
        }
    }
}