"use client";
import { useState } from "react";
import { subscribeToMadar } from "@/lib/madar/pi-payment";
import { IconCheck } from "./icons";

interface PaymentButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  showLabel?: boolean;
  amount?: number;
}

export function PaymentButton({
  onSuccess,
  onError,
  disabled = false,
  className = "",
  showLabel = true,
  amount = 1,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <button
        disabled
        className={`px-6 py-3 rounded-lg bg-green-500 text-white font-semibold flex items-center gap-2 ${className}`}
      >
        <IconCheck size={20} />
        {showLabel ? "تم الاشتراك لمدة سنة من تاريخه" : ""}
      </button>
    );
  }

  const handlePayment = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await subscribeToMadar(amount);
      if (result.ok) {
        setSuccess(true);
        onSuccess?.();
      } else {
        onError?.(result.error || "حدث خطأ في عملية الدفع");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || loading}
      className={`px-6 py-3 rounded-lg bg-gold text-navy font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
    >
      {loading ? (
        <>
          <span className="inline-block animate-spin rounded-full border-2 border-navy border-t-transparent w-4 h-4" />
          جاري المعالجة...
        </>
      ) : (
        <>
          {showLabel && `الاشتراك مقابل ${amount.toFixed(3)} Pi`}
          {!showLabel && `${amount.toFixed(3)} Pi`}
        </>
      )}
    </button>
  );
}
