// public/sw.js
// خدمة الإشعارات (Web Push) لصحيفة مدار
// هذا الملف يعمل بالخلفية في متصفح القارئ ويستقبل الإشعار ويعرضه،
// حتى لو كان الموقع مغلقًا تمامًا.

self.addEventListener("push", function (event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "مدار", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "مدار - Madar";
  const options = {
    body: data.body || "",
    icon: data.icon || "/Madar_logo.png",
    badge: "/Madar_logo.png",
    dir: "rtl",
    lang: "ar",
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    }),
  );
});
