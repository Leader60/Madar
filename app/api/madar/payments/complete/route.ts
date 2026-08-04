import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { paymentId, txid } = await req.json();

    if (!paymentId || !txid) {
      return NextResponse.json(
        { error: "paymentId أو txid مفقود" },
        { status: 400 },
      );
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
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ txid }),
      },
    );

    if (!piRes.ok) {
      const errText = await piRes.text();
      console.error("Pi complete failed:", piRes.status, errText);
      return NextResponse.json(
        { error: "فشل إتمام الدفع" },
        { status: piRes.status },
      );
    }

    const data = await piRes.json();
    return NextResponse.json({ ok: true, payment: data });
  } catch (err) {
    console.error("complete route error:", err);
    return NextResponse.json({ error: "خطأ غير متوقع" }, { status: 500 });
  }
}
