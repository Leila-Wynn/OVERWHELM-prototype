const CACHE_NAME = "overwhelm-v1";

const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];


/* =========================================================
   INSTALL
========================================================= */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(
            caches
                .open(CACHE_NAME)
                .then(
                    cache =>
                        cache.addAll(APP_FILES)
                )
        );

        self.skipWaiting();

    }
);


/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(
            caches
                .keys()
                .then(
                    cacheNames =>
                        Promise.all(
                            cacheNames.map(
                                name => {

                                    if (
                                        name !== CACHE_NAME
                                    ) {

                                        return caches.delete(
                                            name
                                        );

                                    }

                                    return null;

                                }
                            )
                        )
                )
        );

        self.clients.claim();

    }
);


/* =========================================================
   FETCH
========================================================= */

self.addEventListener(
    "fetch",
    event => {

        if (
            event.request.method !== "GET"
        ) {

            return;

        }


        event.respondWith(
            fetch(
                event.request
            )
                .then(
                    response => {

                        const copy =
                            response.clone();

                        caches
                            .open(CACHE_NAME)
                            .then(
                                cache => {

                                    cache.put(
                                        event.request,
                                        copy
                                    );

                                }
                            );

                        return response;

                    }
                )
                .catch(
                    () =>
                        caches.match(
                            event.request
                        )
                )
        );

    }
);