"use client";

import { useState, type ReactNode } from "react";
import { useMadar } from "@/contexts/madar-context";
import { Card, SectionTitle, Button, inputClass, cx } from "./ui";
import { IconMail, IconShield, IconDoc, IconInfo, IconSend } from "./icons";

function PageShell({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <div className="mb-4 flex items-center gap-3 text-navy">
        <span className="rounded-lg bg-navy p-2 text-gold">{icon}</span>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function AboutView() {
  return (
    <PageShell title="من نحن" icon={<IconInfo size={22} />}>
      <Card className="p-4 leading-loose text-foreground/90">
        <p className="mb-4">
          «مدار» منصة إعلامية عربية متخصصة، تهدف إلى رفع الوعي المجتمعي بالعملات
          الرقمية المعروفة عالميًا، وتطورات شبكة باي، والاقتصاد الرقمي العالمي،
          عبر محتوى موثوق ومبسّط يخاطب القارئ العربي.
        </p>
        <p className="mb-4">
          نسعى لأن نكون مرجعًا موثوقًا للأخبار والتحليلات في مجال الأصول الرقمية
          والتقنيات المالية الحديثة، بعيدًا عن الترويج والمضاربة، وقريبًا من
          المعرفة والتوعية المسؤولة.
        </p>
        <div className="my-4 h-px bg-border" />
        <h2 className="mb-2 text-lg font-bold text-navy">فريق التحرير</h2>
        <p className="mb-4">
          يضم فريق مدار نخبة من المحللين الاقتصاديين والصحفيين المتخصصين في
          تقنيات البلوك تشين والاقتصاد اللامركزي، يعملون على تقديم تغطية دقيقة
          ومتوازنة لأبرز التطورات في القطاع.
        </p>
        <h2 className="mb-2 text-lg font-bold text-navy">تركيزنا التحريري</h2>
        <ul className="list-inside list-disc space-y-1">
          <li>أخبار وتحليلات العملات المشفرة العالمية.</li>
          <li>تطورات شبكة باي ومنظومتها التطبيقية.</li>
          <li>اتجاهات الاقتصاد الرقمي والتقنيات المالية.</li>
          <li>التشريعات والسياسات النقدية المتعلقة بالأصول الرقمية.</li>
        </ul>
      </Card>
    </PageShell>
  );
}

export function ContactView() {
  const { pushToast } = useMadar();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const valid =
    name.trim().length > 1 &&
    /^\S+@\S+\.\S+$/.test(email.trim()) &&
    message.trim().length > 3;

  const submit = async () => {
    if (!valid) {
      pushToast("يرجى تعبئة جميع الحقول بشكل صحيح");
      return;
    }

    setSending(true);

    try {
      const response = await fetch("https://formspree.io/f/meajezpe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      if (response.ok) {
        setName("");
        setEmail("");
        setMessage("");
        pushToast("تم إرسال رسالتك، شكرًا لتواصلك");
      } else {
        pushToast("تعذر إرسال الرسالة، حاول مرة أخرى");
      }
    } catch {
      pushToast("تعذر إرسال الرسالة، تحقق من الاتصال بالإنترنت");
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell title="اتصل بنا" icon={<IconMail size={22} />}>
      <Card className="mb-4 p-4">
        <p className="mb-4 leading-relaxed text-foreground/85">
          يسعدنا تواصلكم مع فريق مدار لأي استفسار أو اقتراح أو ملاحظة تحريرية.
        </p>
        <div className="flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="الاسم"
            maxLength={60}
            className={inputClass}
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="البريد الإلكتروني"
            type="email"
            dir="ltr"
            maxLength={80}
            className={cx(inputClass, "text-right")}
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="نص الرسالة"
            rows={4}
            maxLength={800}
            className={cx(inputClass, "resize-none")}
          />
          <Button variant="gold" onClick={submit} disabled={!valid || sending}>
            {sending ? "جارٍ الإرسال..." : "إرسال الرسالة"}
            <IconSend size={16} />
          </Button>
        </div>
      </Card>

      <Card className="mb-4 p-4">
        
          href="https://wa.me/965609886551"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 font-bold text-white transition hover:opacity-90"
        >
          {"تواصل عبر واتساب"}
        </a>
      </Card>
        <a
      <Card className="p-4 text-sm leading-relaxed text-foreground/85">
        <h2 className="mb-2 text-base font-bold text-navy">معلومات التواصل</h2>
        <p dir="ltr" className="text-right">
          البريد: madar.text@gmail.com
        </p>
        <p>ساعات العمل: من الأحد إلى الخميس، ٩ صباحًا حتى ٥ مساءً</p>
      </Card>
    </PageShell>
  );
}

export function PrivacyView() {
  return (
    <PageShell title="الخصوصية والأمان" icon={<IconShield size={22} />}>
      <Card className="space-y-4 p-4 leading-loose text-foreground/90">
        <p>
          تحرص منصة «مدار» على حماية خصوصية مستخدميها، وتوضح هذه السياسة كيفية
          جمع البيانات واستخدامها وحماية حقوق المستخدم.
        </p>
        <div>
          <h2 className="mb-1 text-lg font-bold text-navy">جمع البيانات</h2>
          <p>
            نجمع الحد الأدنى من البيانات اللازمة لتقديم الخدمة، مثل الاسم المعروض
            والتعليقات التي يختار المستخدم نشرها. لا نطلب بيانات حساسة غير
            ضرورية.
          </p>
        </div>
        <div>
          <h2 className="mb-1 text-lg font-bold text-navy">استخدام البيانات</h2>
          <p>
            تُستخدم البيانات حصريًا لتحسين تجربة القراءة، وحفظ تفاعلاتك مثل
            الإعجابات والتعليقات، ولا تُشارك مع أطراف ثالثة لأغراض تسويقية.
          </p>
        </div>
        <div>
          <h2 className="mb-1 text-lg font-bold text-navy">حفظ التفاعلات</h2>
          <p>
            تُحفظ تفاعلاتك بشكل آمن ومرتبط بحسابك، لتبقى متاحة لك عند العودة إلى
            المنصة من أي جهاز.
          </p>
        </div>
        <div>
          <h2 className="mb-1 text-lg font-bold text-navy">حقوق المستخدم</h2>
          <p>
            يحق للمستخدم الاطلاع على بياناته وطلب تعديلها أو حذفها في أي وقت، عبر
            التواصل مع فريق الدعم.
          </p>
        </div>
      </Card>
    </PageShell>
  );
}

export function TermsView() {
  return (
    <PageShell title="شروط الاستخدام" icon={<IconDoc size={22} />}>
      <Card className="space-y-4 p-4 leading-loose text-foreground/90">
        <p>
          باستخدامك منصة «مدار»، فإنك توافق على الشروط والأحكام التالية التي تنظم
          استخدام المحتوى والخدمات.
        </p>
        <div>
          <h2 className="mb-1 text-lg font-bold text-navy">طبيعة المحتوى</h2>
          <p>
            يُقدَّم محتوى المنصة لأغراض التوعية والمعرفة فقط، ولا يُعد بأي حال
            نصيحة استثمارية أو مالية. تظل قرارات الاستثمار مسؤولية المستخدم وحده.
          </p>
        </div>
        <div>
          <h2 className="mb-1 text-lg font-bold text-navy">التعليقات والمساهمات</h2>
          <p>
            يتحمل المستخدم مسؤولية ما ينشره من تعليقات، ويلتزم بعدم نشر محتوى
            مخالف للقوانين أو مسيء للآخرين. تحتفظ المنصة بحق إزالة أي محتوى مخالف.
          </p>
        </div>
        <div>
          <h2 className="mb-1 text-lg font-bold text-navy">الملكية الفكرية</h2>
          <p>
            جميع الحقوق محفوظة لمنصة مدار، ولا يجوز إعادة نشر المحتوى دون إذن
            مسبق مع الإشارة إلى المصدر.
          </p>
        </div>
        <div>
          <h2 className="mb-1 text-lg font-bold text-navy">تعديل الشروط</h2>
          <p>
            تحتفظ المنصة بحق تعديل هذه الشروط في أي وقت، ويُعد استمرار استخدامك
            للمنصة موافقةً على التعديلات.
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
