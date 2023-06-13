
const version = 'v3';
const staticCacheName = 'myAppCache' + version;

var urls = ['/',
            '/css/normalize.css',
            '/css/skeleton.css',
            '/css/offline-language-english-indicator.css',
            '/css/offline-theme-default-indicator.css',
            '/images/favicon.ico',
            '/images/Wikipedia-logo.png',
            '/scripts/offline.min.js',
            '/scripts/search.js'];

self.addEventListener("install", installEvent => {
    console.log("The SW is now installed");

    installEvent.waitUntil(
        caches.open(staticCacheName).then(staticCache => {
            return staticCache.addAll(urls);
        })
    );
});

self.addEventListener('activate', activateEvent => {
    console.log("The SW is being activated");
    
    activateEvent.waitUntil(
        caches.keys().then(cacheNames =>{
            //Loop through the cacheNames array
            return Promise.all(
                cacheNames.map( cacheName => {
                    if(cacheName != staticCacheName){
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(()=>{
            return clients.claim();
        })
    );
});

self.addEventListener("fetch", fetchEvent => {
    const request = fetchEvent.request;    
    console.log("fetch: " + request.url + " (" + request.headers.get("Accept") + ")");
    if(request.headers.get("Accept").includes('text/html')){
        fetchEvent.respondWith(
            // Fetch the page from the network
            fetch(request).then(responseFromFetch =>{
                // Put a copy in the cache
                const copy = responseFromFetch.clone();
                fetchEvent.waitUntil(
                    caches.open(staticCacheName).then(pagesCache => {
                        return pagesCache.put(request, copy);
                    })
                );
                return responseFromFetch;
            }).catch(error => {
                // Otherwise look in the cache
                var cachedResponse = caches.match(request);
                if(cachedResponse){
                    return cachedResponse;
                }
                else{
                    // Otherwise look the fallback page
                    return new Response("Oops! Something went wrong.")
                }
            })
        );
    }
    else {
        fetchEvent.respondWith(
            // Fetch the resource from the cache
            caches.match(request).then(responseFromCache => {
                if(responseFromCache){
                    fetchEvent.waitUntil(
                        fetch(request).then(responseFromFetch => {
                            // Update the cache
                            caches.open(staticCacheName).then(staticCache => {
                                return staticCache.put(request, responseFromFetch);
                            });
                        })
                    );
                    return responseFromCache;
                }
                else {
                    // Fetch the resource from the network
                    return fetch(request);
                }
            })
        );
    }
});

self.addEventListener('message', messageEvent =>{
    console.log(messageEvent.data);
});
