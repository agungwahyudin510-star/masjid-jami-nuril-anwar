// app/api/push/route.ts
import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL ?? "mailto:admin@masjid.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
  process.env.VAPID_PRIVATE_KEY ?? ""
);

// Simpan subscription di memory (untuk production pakai database)
const subscriptions: webpush.PushSubscription[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Simpan subscription baru
    if (body.type === "subscribe") {
      const sub = body.subscription;
      const exists = subscriptions.find(s => s.endpoint === sub.endpoint);
      if (!exists) subscriptions.push(sub);
      return NextResponse.json({ message: "Subscribed", total: subscriptions.length });
    }

    // Kirim notif manual (dari admin)
    if (body.type === "send") {
      const payload = JSON.stringify({
        title: body.title || "🕌 Waktu Sholat",
        body: body.body || "Telah masuk waktu sholat",
        url: "/jadwal-sholat",
      });

      const results = await Promise.allSettled(
        subscriptions.map(sub => webpush.sendNotification(sub, payload))
      );

      const success = results.filter(r => r.status === "fulfilled").length;
      return NextResponse.json({ sent: success, total: subscriptions.length });
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (err) {
    console.error("Push error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ total: subscriptions.length });
}