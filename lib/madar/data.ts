// Madar — Arabic crypto & digital economy news platform
// Data types, article content, and persistence helpers.

export type RouteName =
  | "home"
  | "archive"
  | "article"
  | "about"
  | "contact"
  | "privacy"
  | "terms";

export interface AuthorInfo {
  name: string;
  bio: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string; // ISO date
  thumbHue: number; // for generated art
  sideImageWidth: number; // px, configurable per article
  sideImageHeight: number; // px, configurable per article
  body: string[]; // paragraphs
  author: AuthorInfo;
  baseLikes: number;
}

export interface Comment {
  id: string;
  articleId: string;
  name: string;
  text: string;
  createdAt: number;
}

export interface Toast {
  id: number;
  message: string;
}

// ---- persistence keys ----
export const KEYS = {
  profile: "madar.profile",
  likes: "madar.likes",
  comments: "madar.comments",
} as const;

export const COMMENTS_CAP = 120;
export const LIKED_CAP = 200;

export const ARTICLE_IDS_SET = () => new Set(ARTICLES.map((a) => a.id));

// ---- helpers ----
export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function clampNum(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === "number" && Number.isFinite(v) ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function cleanStr(v: unknown, max = 600): string {
  if (typeof v !== "string") return "";
  // strip control chars and angle brackets to keep loaded state safe as text
  return v
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[<>]/g, "")
    .slice(0, max)
    .trim();
}

const AR_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export function toArabicNum(input: number | string): string {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(input).replace(/[0-9]/g, (d) => map[Number(d)]);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${toArabicNum(d.getDate())} ${AR_MONTHS[d.getMonth()]} ${toArabicNum(
    d.getFullYear(),
  )}`;
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "الآن";
  if (min < 60) return `منذ ${toArabicNum(min)} دقيقة`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `منذ ${toArabicNum(hr)} ساعة`;
  const day = Math.floor(hr / 24);
  return `منذ ${toArabicNum(day)} يوم`;
}

// ---- news ticker headlines (global Arabic economic feed) ----
export const TICKER_HEADLINES: string[] = [
  "بيتكوين يتجاوز حاجزًا سعريًا جديدًا مع تدفق السيولة المؤسسية",
  "شبكة باي تعلن عن تطورات في منظومتها التطبيقية العالمية",
  "الاقتصاد الرقمي يسجل نموًا متسارعًا في أسواق الشرق الأوسط",
  "إيثريوم يشهد ارتفاعًا في نشاط العقود الذكية هذا الأسبوع",
  "البنوك المركزية تدرس إطلاق عملات رقمية سيادية جديدة",
  "ارتفاع حجم التداول اليومي في أسواق العملات المشفرة",
  "تقارير: تبني المؤسسات للأصول الرقمية يواصل الصعود",
  "مطورو شبكة باي يوسّعون قاعدة التطبيقات اللامركزية",
];

// footer ticker links
export const FOOTER_LINKS: { label: string; route: RouteName }[] = [
  { label: "شروط الاستخدام", route: "terms" },
  { label: "سياسات الخصوصية", route: "privacy" },
];

// ---- articles content ----
export const ARTICLES: Article[] = [
  {
    id: "btc-institutional",
    title: "البيتكوين والتبني المؤسسي: كيف تعيد الشركات الكبرى تشكيل السوق",
    excerpt:
      "تتزايد وتيرة دخول المؤسسات المالية الكبرى إلى سوق البيتكوين، ما يعيد رسم ملامح الاقتصاد الرقمي العالمي ويمنح العملة الأولى زخمًا غير مسبوق.",
    category: "عملات مشفرة",
    publishedAt: "2026-07-08",
    thumbHue: 40,
    sideImageWidth: 300,
    sideImageHeight: 200,
    baseLikes: 214,
    author: {
      name: "أحمد المنصور",
      bio: "محلل اقتصادي متخصص في الأسواق الرقمية والعملات المشفرة، له عشرات المقالات والدراسات المنشورة حول تأثير التقنيات المالية الحديثة. يشارك بانتظام في المؤتمرات الاقتصادية الإقليمية والدولية، ويقدّم قراءات تحليلية لاتجاهات السوق.",
    },
    body: [
      "شهدت السنوات الأخيرة تحولًا جوهريًا في نظرة المؤسسات المالية الكبرى إلى البيتكوين. فبعد أن كان يُنظر إليه كأصل عالي المخاطرة، بات اليوم جزءًا من محافظ استثمارية لكبرى الصناديق والشركات المدرجة.",
      "هذا التبني المؤسسي لا يقتصر على شراء العملة فحسب، بل يمتد إلى بناء بنية تحتية كاملة من خدمات الحفظ والتداول والمشتقات المالية، ما يمنح السوق نضجًا وعمقًا أكبر.",
      "يرى المحللون أن دخول رؤوس الأموال المؤسسية يقلل من حدة التقلبات على المدى الطويل، ويعزز الثقة لدى المستثمرين الأفراد، وإن كان يطرح في الوقت نفسه تساؤلات حول مركزية الملكية.",
      "ومع تطور الأطر التنظيمية في مختلف الدول، يتوقع الخبراء أن يستمر هذا الاتجاه في التوسع، ليصبح البيتكوين ركيزة أساسية في منظومة الأصول الرقمية العالمية خلال السنوات المقبلة.",
    ],
  },
  {
    id: "pi-network-growth",
    title: "شبكة باي: من التعدين عبر الهاتف إلى منظومة اقتصادية متكاملة",
    excerpt:
      "تواصل شبكة باي توسيع منظومتها التطبيقية عالميًا، مستهدفة تحويل ملايين المستخدمين إلى فاعلين في اقتصاد رقمي لامركزي جديد.",
    category: "شبكة باي",
    publishedAt: "2026-07-06",
    thumbHue: 150,
    sideImageWidth: 280,
    sideImageHeight: 220,
    baseLikes: 342,
    author: {
      name: "ليلى الحسيني",
      bio: "صحفية متخصصة في تقنيات البلوك تشين والاقتصاد اللامركزي، تغطي تطورات المشاريع الناشئة في المنطقة العربية منذ سنوات. تكتب تقارير ميدانية وتحليلية، وتهتم بأثر التقنية على المجتمعات الناشئة.",
    },
    body: [
      "انطلقت شبكة باي من فكرة بسيطة: إتاحة المشاركة في العملات الرقمية لأي شخص يملك هاتفًا ذكيًا، دون الحاجة إلى أجهزة تعدين مكلفة أو استهلاك طاقة مرتفع.",
      "ومع مرور الوقت، تحولت الشبكة إلى منظومة أوسع تضم آلاف التطبيقات والخدمات التي يبنيها المطورون حول العالم، مستفيدين من قاعدة مستخدمين ضخمة.",
      "يمثل هذا التوسع اختبارًا حقيقيًا لقدرة الشبكة على تحويل النشاط المجتمعي إلى قيمة اقتصادية ملموسة، عبر تطبيقات للتجارة والخدمات والمحتوى.",
      "ويؤكد المتابعون أن نجاح أي منظومة لامركزية يعتمد على مدى فائدة تطبيقاتها الواقعية، وهو ما تسعى الشبكة إلى ترسيخه عبر تشجيع المطورين والمبدعين.",
    ],
  },
  {
    id: "digital-economy-mena",
    title: "الاقتصاد الرقمي في المنطقة العربية: فرص التحول والتحديات",
    excerpt:
      "تتسارع خطوات التحول الرقمي في اقتصادات المنطقة، مدفوعة باستثمارات في البنية التحتية والتقنيات المالية الحديثة.",
    category: "اقتصاد رقمي",
    publishedAt: "2026-07-03",
    thumbHue: 230,
    sideImageWidth: 320,
    sideImageHeight: 180,
    baseLikes: 128,
    author: {
      name: "سامر عبد الله",
      bio: "باحث في الاقتصاد الرقمي والتقنيات المالية، يعمل على دراسات حول التحول الرقمي في الأسواق الناشئة. نشر عددًا من الأوراق البحثية، ويقدّم استشارات لجهات حكومية وخاصة.",
    },
    body: [
      "يشهد الاقتصاد الرقمي في المنطقة العربية نموًا متسارعًا، مدعومًا بارتفاع نسبة انتشار الإنترنت والهواتف الذكية بين السكان.",
      "وتتجه العديد من الحكومات نحو تبني استراتيجيات رقمية شاملة تشمل المدفوعات الإلكترونية والخدمات الحكومية الرقمية والاقتصاد القائم على البيانات.",
      "غير أن هذا التحول يواجه تحديات تتعلق بالبنية التشريعية والأمن السيبراني والفجوة الرقمية بين الفئات المختلفة.",
      "ويرى الخبراء أن معالجة هذه التحديات عبر شراكات بين القطاعين العام والخاص كفيلة بتحويل المنطقة إلى مركز إقليمي واعد في الاقتصاد الرقمي.",
    ],
  },
  {
    id: "cbdc-central-banks",
    title: "العملات الرقمية السيادية: هل تعيد البنوك المركزية رسم مستقبل النقد؟",
    excerpt:
      "تتسابق البنوك المركزية حول العالم لإطلاق عملاتها الرقمية، في تحول قد يعيد تعريف مفهوم النقود والمدفوعات.",
    category: "سياسات نقدية",
    publishedAt: "2026-06-29",
    thumbHue: 300,
    sideImageWidth: 300,
    sideImageHeight: 210,
    baseLikes: 96,
    author: {
      name: "نور الدين قاسم",
      bio: "كاتب اقتصادي مهتم بالسياسات النقدية وأنظمة الدفع الحديثة، له مساهمات صحفية متعددة في تحليل قرارات البنوك المركزية وأثرها على الأسواق.",
    },
    body: [
      "تعمل عشرات البنوك المركزية حول العالم على تطوير نماذج لعملات رقمية سيادية، تسعى من خلالها إلى تحديث أنظمة الدفع وتعزيز الشمول المالي.",
      "وتتيح هذه العملات إمكانية إجراء المعاملات بشكل فوري وبتكلفة منخفضة، مع الحفاظ على إشراف الجهات النقدية الرسمية.",
      "لكن هذا التوجه يثير نقاشات حول الخصوصية وحماية بيانات المستخدمين، إضافة إلى تأثيره المحتمل على دور البنوك التجارية التقليدية.",
      "ويبقى التوازن بين الابتكار والرقابة التحدي الأبرز الذي سيحدد ملامح مستقبل النقد الرقمي السيادي.",
    ],
  },
  {
    id: "ethereum-smart-contracts",
    title: "العقود الذكية: البنية التحتية الخفية للاقتصاد اللامركزي",
    excerpt:
      "تتيح العقود الذكية أتمتة الاتفاقات المالية دون وسطاء، وتشكل حجر الأساس في نمو التطبيقات اللامركزية.",
    category: "تقنيات",
    publishedAt: "2026-06-25",
    thumbHue: 200,
    sideImageWidth: 290,
    sideImageHeight: 200,
    baseLikes: 174,
    author: {
      name: "ريم الخطيب",
      bio: "مهندسة برمجيات وكاتبة تقنية متخصصة في تقنيات البلوك تشين والعقود الذكية، تسعى إلى تبسيط المفاهيم المعقدة للقارئ العربي عبر مقالات تعليمية وتحليلية.",
    },
    body: [
      "تُعد العقود الذكية برامج تعمل على شبكات البلوك تشين، وتنفذ بنودها تلقائيًا عند تحقق شروط محددة مسبقًا، دون الحاجة إلى طرف وسيط.",
      "وقد فتحت هذه التقنية الباب أمام موجة من التطبيقات اللامركزية في مجالات التمويل والتأمين وإدارة الأصول الرقمية.",
      "ورغم قوتها، تظل العقود الذكية عرضة للأخطاء البرمجية التي قد تُكلّف المستخدمين خسائر كبيرة، ما يبرز أهمية التدقيق الأمني.",
      "ومع تطور أدوات التطوير والتحقق، يتوقع أن تصبح العقود الذكية أكثر أمانًا وانتشارًا في البنية التحتية للاقتصاد الرقمي.",
    ],
  },
  {
    id: "crypto-regulation",
    title: "تنظيم الأصول الرقمية: نحو إطار عالمي متوازن",
    excerpt:
      "تتجه الدول لوضع أطر تنظيمية للأصول الرقمية توازن بين حماية المستثمرين وتشجيع الابتكار المالي.",
    category: "تشريعات",
    publishedAt: "2026-06-20",
    thumbHue: 20,
    sideImageWidth: 300,
    sideImageHeight: 190,
    baseLikes: 83,
    author: {
      name: "خالد التميمي",
      bio: "مستشار قانوني متخصص في تشريعات التقنية المالية والأصول الرقمية، يقدّم قراءات تحليلية للتطورات التنظيمية عالميًا وأثرها على السوق العربي.",
    },
    body: [
      "مع اتساع سوق الأصول الرقمية، بات التنظيم ضرورة ملحّة لحماية المستثمرين ومكافحة الأنشطة غير المشروعة.",
      "وتتباين المقاربات التنظيمية بين الدول، بين من يتبنى انفتاحًا حذرًا ومن يفرض قيودًا صارمة على التداول والإصدار.",
      "ويشدد الخبراء على أهمية التنسيق الدولي لتفادي التفاوت التنظيمي الذي قد يدفع النشاط نحو أسواق أقل رقابة.",
      "ويظل الهدف الأمثل هو صياغة إطار متوازن يحمي المستخدم دون أن يخنق روح الابتكار التي يقوم عليها هذا القطاع.",
    ],
  },
];

export const ARTICLE_MAP: Record<string, Article> = ARTICLES.reduce(
  (acc, a) => {
    acc[a.id] = a;
    return acc;
  },
  {} as Record<string, Article>,
);

export function articlesByDate(): Article[] {
  return [...ARTICLES].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

// ---- state shapes ----
export interface ProfileState {
  displayName: string;
}

export interface LikesState {
  // articleId -> extra like count contributed by this user (0 or 1)
  liked: string[];
}

export interface CommentsState {
  items: Comment[];
}

export const DEFAULT_PROFILE: ProfileState = { displayName: "" };
export const DEFAULT_LIKES: LikesState = { liked: [] };
export const DEFAULT_COMMENTS: CommentsState = { items: [] };

// ---- sanitizers (loaded state is untrusted) ----
export function sanitizeProfile(blob: unknown): ProfileState {
  const b = (blob ?? {}) as Record<string, unknown>;
  return { displayName: cleanStr(b.displayName, 40) };
}

export function sanitizeLikes(blob: unknown): LikesState {
  const b = (blob ?? {}) as Record<string, unknown>;
  const set = ARTICLE_IDS_SET();
  const arr = Array.isArray(b.liked) ? b.liked : [];
  const liked = arr
    .filter((x): x is string => typeof x === "string" && set.has(x))
    .slice(0, LIKED_CAP);
  return { liked: Array.from(new Set(liked)) };
}

export function sanitizeComments(blob: unknown): CommentsState {
  const b = (blob ?? {}) as Record<string, unknown>;
  const set = ARTICLE_IDS_SET();
  const arr = Array.isArray(b.items) ? b.items : [];
  const items: Comment[] = [];
  for (const raw of arr) {
    if (typeof raw !== "object" || raw === null) continue;
    const r = raw as Record<string, unknown>;
    const articleId = cleanStr(r.articleId, 64);
    if (!set.has(articleId)) continue;
    const text = cleanStr(r.text, 500);
    if (!text) continue;
    items.push({
      id: cleanStr(r.id, 40) || uid(),
      articleId,
      name: cleanStr(r.name, 40) || "زائر",
      text,
      createdAt: clampNum(r.createdAt, 0, Date.now() + 60000, Date.now()),
    });
    if (items.length >= COMMENTS_CAP) break;
  }
  return { items };
}

export function likesToBlob(s: LikesState): Record<string, unknown> {
  return { liked: s.liked.slice(0, LIKED_CAP) };
}

export function commentsToBlob(s: CommentsState): Record<string, unknown> {
  return {
    items: s.items.slice(-COMMENTS_CAP).map((c) => ({
      id: c.id,
      articleId: c.articleId,
      name: c.name,
      text: c.text,
      createdAt: c.createdAt,
    })),
  };
}

export function profileToBlob(s: ProfileState): Record<string, unknown> {
  return { displayName: s.displayName };
}
