//@ts-check
export function registerServiceWorker() {
    /**@type {ServiceWorkerRegistration} */
    var reg;
    //Service Worker
    if("serviceWorker" in navigator) {
        window.addEventListener("load", async() => {
            try {
                reg = await navigator.serviceWorker.register("/service-worker.js");
            } catch(err) {
                console.log("Error while registering Service Worker: " + err);
            }
        });
    }
}