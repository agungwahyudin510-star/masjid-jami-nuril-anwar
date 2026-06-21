// public/sw.js
self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Waktu Sholat";
  const options = {
    body: data.body || "Telah masuk waktu sholat",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    vibrate: [200, 100, 200],
    tag: "azan-notif",
    renotify: true,
    data: { url: data.url || "/jadwal-sholat" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || "/jadwal-sholat")
  );
});

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());