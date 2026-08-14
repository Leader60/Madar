import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// يحفظ اشتراك الإشعارات (Web Push) الخاص بمتصفح القارئ في Supabase.
// إن كان مشتركًا مسبقًا بنفس الجهاز/المتصفح (نفس endpoint) يُتجاهل الخطأ بصمت.
export async function savePushSubscription(
  subscription: PushSubscriptionJSON,
): Promise<void> {
  if (
    !subscription.endpoint ||
    !subscription.keys?.p256dh ||
    !subscription.keys?.auth
  ) {
    throw new Error("اشتراك إشعارات غير مكتمل");
  }

  const { error } = await supabase.from("push_subscriptions").insert({
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
  });

  // 23505 = duplicate key (unique على endpoint) — القارئ مشترك مسبقًا، لا مشكلة
  if (error && error.code !== "23505") {
    throw error;
  }
}
