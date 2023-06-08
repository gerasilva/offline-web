var urls = ['',
            'css/normalize.css',
            'css/skeleton.css',
            'css/offline-language-english-indicator.css',
            'css/offline-theme-default-indicator.css',
            'scripts/offline.min.js',
            'scripts/search.js'];

self.addEventListener("install", function(event){
   console.log("The SW is now installed");
   event.waitUntil(caches.open("myAppCache").then(function(cache){
       return cache.addAll(urls);
   }));
});

self.addEventListener("fetch", function(event){
    console.log("fetch: " + event.request.url);
    event.respondWith(caches.match(event.request)
        .then(function(response){
            
            if(response){
                // The request is in the cache 
                return response;
            }
            else {
                // We need to go to the network
                return fetch(event.request);
            }
            
            /*
            // Even if the response is in the cache, we fetch it
            // and update the cache for future usage
            var fetchPromise = fetch(event.request).then(
                function(networkResponse){
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
            });

            // We use the currently cached version if it's there
            return response || fetchPromise;
            */
        })
    );
});