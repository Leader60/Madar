"use client";

import { useState } from "react";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { PRODUCT_CONFIG } from "@/lib/product-config";
import { IconCheck } from "./icons";

interface PaymentButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  showLabel?: boolean;
}

export function PaymentButton({
  onSuccess,
  onError,
  disabled = false,
  className = "",
  showLabel = true,
}: PaymentButtonProps) {
  const { sdk, products, restoredPurchases } = usePiAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Find the product from the products array
  const product = products?.find(
    (p) => p.id === PRODUCT_CONFIG.PRODUCT_6a52cc8c0533b18091489818
  );

  if (!product) {
    return (
      <button
        disabled
        className={`px-6 py-3 rounded-lg bg-gray-300 text-gray-600 font-semibold cursor-not-allowed ${className}`}
      >
        المنتج غير متاح
      </button>
    );
  }

  // Check if user has already purchased
  const hasPurchased =
    restoredPurchases?.purchases?.some(
      (p) => p.productId === product.slug
    ) ?? false;

  if (hasPurchased && success) {
    return (
      <button
        disabled
        className={`px-6 py-3 rounded-lg bg-green-500 text-white font-semibold flex items-center gap-2 ${className}`}
      >
        <IconCheck size={20} />
        {showLabel ? "تم الاشتراك" : ""}
      </button>
    );
  }

  const handlePayment = async () => {
    if (!sdk || loading) return;

    setLoading(true);
    try {
      const result = await sdk.makePurchase(product.slug);

      if (result.ok) {
        setSuccess(true);
        onSuccess?.();
      } else {
        const errorMessage =
          result.error?.code === "purchase_cancelled"
            ? "تم إلغاء عملية الشراء"
            : result.error?.code === "product_not_found"
              ? "المنتج غير موجود"
              : "حدث خطأ في عملية الدفع";
        onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "حدث خطأ في عملية الدفع";
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const amount = product.price_in_pi?.toFixed(3) || "0.05";

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
          {showLabel && `الاشتراك مقابل ${amount} Pi`}
          {!showLabel && `${amount} Pi`}
        </>
      )}
    </button>
  );
}
