"use client";

import { useState, useEffect } from "react";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { PRODUCT_CONFIG } from "@/lib/product-config";
import { PaymentButton } from "./payment-button";
import { IconClose } from "./icons";

interface PaymentPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PaymentPrompt({
  isOpen,
  onClose,
  onSuccess,
}: PaymentPromptProps) {
  const { products } = usePiAuth();
  const [error, setError] = useState<string>("");

  // Find the product
  const product = products?.find(
    (p) => p.id === PRODUCT_CONFIG.PRODUCT_6a52cc8c0533b18091489818
  );

  if (!isOpen) return null;

  const amount = product?.price_in_pi?.toFixed(3) || "1";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <IconClose size={20} />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-navy to-navy/80 text-white px-6 pt-8 pb-6 text-center">
          <h2 className="text-2xl font-bold mb-2">مرحباً بك في مدار</h2>
          <p className="text-gold font-semibold">منصة متابعة الاقتصاد الرقمي</p>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-navy mb-3">مميزات الاشتراك:</h3>
            <ul className="space-y-2 text-sm text-navy">
              <li className="flex gap-2">
                <span className="text-gold">✓</span>
                <span>وصول غير محدود لجميع المقالات والأخبار</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gold">✓</span>
                <span>تحديثات فورية عن أخبار البيتكوين والعملات الرقمية</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gold">✓</span>
                <span>متابعة شاملة لأخبار شبكة باي والاقتصاد الرقمي</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gold">✓</span>
                <span>تنبيهات مخصصة للأخبار المهمة</span>
              </li>
            </ul>
          </div>

          {/* Price and Duration */}
          <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">قيمة الاشتراك السنوي</div>
            <div className="text-3xl font-bold text-navy mb-1">{amount} Pi</div>
            <div className="text-sm text-gold font-semibold">
              اشتراك سنوي غير محدود
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Payment Button */}
          <PaymentButton
            onSuccess={() => {
              onSuccess?.();
              onClose();
            }}
            onError={setError}
            className="w-full py-4 text-base"
            showLabel={true}
          />

          {/* Continue without subscribing */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 border-2 border-navy text-navy font-bold rounded-lg hover:bg-navy/5 transition-colors"
          >
            متابعة بدون اشتراك
          </button>
        </div>

        {/* Footer message */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-600">
          <p>يمكنك الاشتراك في أي وقت للوصول إلى كل المميزات</p>
        </div>
      </div>
    </div>
  );
}
