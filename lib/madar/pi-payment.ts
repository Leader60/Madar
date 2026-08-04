"use client";

// اتصال مباشر بـ Pi SDK (window.Pi) لعملية اشتراك "مدار"، بدون المرور بخادم App Studio.
// يتطلب أن يكون سكربت https://sdk.minepi.com/pi-sdk.js محمّلاً مسبقاً (مضاف بالفعل في app/layout.tsx)
// وأن يكون Pi.init() قد تم استدعاؤه (يحدث في contexts/pi-auth-context.tsx).

export interface MadarPaymentResult {
  ok: boolean;
  paymentId?: string;
  txid?: string;
  error?: string;
}

interface PiPaymentData {
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
}

interface PiPaymentDTO {
  identifier: string;
  transaction?: { txid: string } | null;
}

declare global {
  interface Window {
    Pi?: {
      createPayment: (
        paymentData: PiPaymentData,
        callbacks: {
          onReadyForServerApproval: (paymentId: string) => void;
          onReadyForServerCompletion: (paymentId: string, txid: string) => void;
          onCancel: (paymentId: string) => void;
          onError: (error: Error, payment?: PiPaymentDTO) => void;
        },
      ) => void;
    };
  }
}

export function subscribeToMadar(
  amountInPi: number,
): Promise<MadarPaymentResult> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.Pi) {
      resolve({ ok: false, error: "Pi SDK غير متاح — افتح التطبيق من داخل Pi Browser" });
      return;
    }

    window.Pi.createPayment(
      {
        amount: amountInPi,
        memo: "اشتراك مدار السنوي",
        metadata: { product: "madar_subscription" },
      },
      {
        onReadyForServerApproval: async (paymentId) => {
          try {
            const res = await fetch("/api/madar/payments/approve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId }),
            });
            if (!res.ok) {
              resolve({ ok: false, error: "فشلت الموافقة على الدفع من الخادم" });
            }
          } catch {
            resolve({ ok: false, error: "تعذر الاتصال بالخادم أثناء الموافقة" });
          }
        },

        onReadyForServerCompletion: async (paymentId, txid) => {
          try {
            const res = await fetch("/api/madar/payments/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId, txid }),
            });
            if (res.ok) {
              resolve({ ok: true, paymentId, txid });
            } else {
              resolve({ ok: false, error: "فشل إتمام الدفع من الخادم" });
            }
          } catch {
            resolve({ ok: false, error: "تعذر الاتصال بالخادم أثناء الإتمام" });
          }
        },

        onCancel: () => {
          resolve({ ok: false, error: "تم إلغاء عملية الدفع" });
        },

        onError: (error) => {
          resolve({ ok: false, error: error.message || "حدث خطأ في عملية الدفع" });
        },
      },
    );
  });
}
