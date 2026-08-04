import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json({ error: "paymentId مفقود" }, { status: 400 });
    }

    const apiKey = process.env.PI_API_KEY;
    if (!apiKey) {
      console.error("PI_API_KEY غير معرّف بمتغيرات البيئة");
      return NextResponse.json(
        { error: "إعدادات الخادم غير مكتملة" },
        { status: 500 },
      );
    }

    const piRes = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!piRes.ok) {
      const errText = await piRes.text();
      console.error("Pi approve failed:", piRes.status, errText);
      return NextResponse.json(
        { error: "فشلت الموافقة على الدفع" },
        { status: piRes.status },
      );
    }

    const data = await piRes.json();
    return NextResponse.json({ ok: true, payment: data });
  } catch (err) {
    console.error("approve route error:", err);
    return NextResponse.json({ error: "خطأ غير متوقع" }, { status: 500 });
  }
}
