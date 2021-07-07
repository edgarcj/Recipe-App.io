const CACHE_NAME = "v1_RecipeApp",
  urlsToCache = [
    "./",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css",
    "https://use.fontawesome.com/releases/v5.8.1/css/all.css",
    "https://www.themealdb.com/api/json/v1/1/random.php",
    "./script.js",
    "./style.css",
    "./images/recetas_512.png",
    "./images/recetas.png",
  ];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).then(() => self.skipWaiting());
      })
      .catch((err) => console.log("Fallo registro de cache", err))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((cachesNames) => {
        cachesNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        });
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      if (res) {
        return res;
      }
      //Recuperar de la peticion a la url
      return fetch(e.request);
    })
  );
});
