// Builds a progress file for the Master Website Build Checklist (websitBuildChecklist/website-build-checklist.html).
// The checklist keys each item by stage id + a djb2 hash of its text, so this script reads the
// stage definitions straight from the checklist HTML and computes the same keys.
//
// Run: npm run checklist  ->  writes websitBuildChecklist/roni-segev-plumber-checklist.json
// Import it in the checklist page. The project id stays the same, so a new import updates the project.
//
// Status per item: 'done' (verified), 'na' (not relevant to this demo), or left out (open).
// Items are matched by a unique substring of their text; the script fails if a match is missing or ambiguous.

import { readFileSync, writeFileSync } from 'node:fs';

const CHECKLIST = new URL('../../websitBuildChecklist/website-build-checklist.html', import.meta.url);
const OUT_FILE = new URL('../../websitBuildChecklist/roni-segev-plumber-checklist.json', import.meta.url);

const html = readFileSync(CHECKLIST, 'utf8');
const start = html.indexOf('var STAGES = [');
const end = html.indexOf('];', html.indexOf('id: "post30"'));
const STAGES = new Function(`return ${html.slice(start + 'var STAGES = '.length, end + 1)};`)();

const hash = (str) => {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h.toString(36);
};

const DONE = 'done';
const NA = 'na';

const statuses = {
  scope: [
    ['היקף העבודה (Scope) הוגדר', DONE],
    ["רשימת עמודים ופיצ'רים ראשונית אושרה", DONE],
    ['תקציב ואבני דרך', NA],
    ['תהליך בקשות שינוי', NA],
    ['איש קשר מקבל החלטות', DONE],
    ['רשימת חומרים נדרשים נמסרה', NA],
    ['תאריך יעד למסירת חומרים', NA],
    ['סוכם עם הלקוח שעיכוב', NA],
    ['זכויות שימוש בתמונות', DONE],
    ['סוכם שחשבונות הדומיין', NA],
  ],
  client: [
    ['שם העסק והתחום הוגדרו', DONE],
    ['קהל יעד הוגדר', DONE],
    ['שירותים/מוצרים מרכזיים הוגדרו', DONE],
    ['מטרת האתר הוגדרה', DONE],
    ['אזורי פעילות הוגדרו', DONE],
    ['שפות האתר הוגדרו', DONE],
    ['דומיין ואתר קיים נבדקו', DONE],
    ['הוגדר אם זה אתר חדש', DONE],
    ['חובות רגולטוריות זוהו', DONE],
    ['Google Business Profile נבדק', DONE],
  ],
  research: [
    ['שירותים/מוצרים מרכזיים מופו', DONE],
    ['שאלות נפוצות והתנגדויות', DONE],
  ],
  arch: [
    ['Homepage מוגדרת', DONE],
    ['עמוד לכל שירות/מוצר משמעותי', DONE],
    ['About ו-Contact הוגדרו', DONE],
    ['Blog/Knowledge Center', NA],
    ['Landing pages מוצדקות', NA],
    ['עמודי פרטיות, תנאי שימוש, נגישות', DONE],
    ['הוחלט על מבנה URL עקבי', DONE],
    ['URL לכל עמוד הוגדר', DONE],
    ['Primary topic ו-Intent לכל עמוד', DONE],
    ['מבנה שפות ו-hreflang', NA],
    ['Internal linking ראשוני תוכנן', DONE],
    ['CTA לכל עמוד מרכזי הוגדר', DONE],
    ['רשימת העמודים הוזנה לטבלת', DONE],
    ['פרטי העסק (שם, טלפון, מייל, כתובת, שעות) מרוכזים', DONE],
  ],
  build: [
    ['העיצוב כולל נגישות מובנית', DONE],
    ['CMS, תבנית ותוספים הותקנו', DONE],
    ['הותקנו רק תוספים הכרחיים', DONE],
    ['שפת הדף (lang)', DONE],
    ['טקסט מעורב עברית/אנגלית', DONE],
    ['פונטים עבריים נבחרו', DONE],
    ['פריסה רספונסיבית נבנתה', DONE],
  ],
  content: [
    ['המידע החשוב מופיע מוקדם', DONE],
    ['FAQ נוסף רק כשיש ערך', DONE],
    ['כל עמוד שירות/מוצר מציין במפורש', DONE],
    ['לכל התמונות והתכנים יש זכויות שימוש', DONE],
    ['תאריך פרסום/עדכון מוצג', DONE],
    ['עמודי ערים או אזורים', DONE],
  ],
  onpage: [
    ['Title ייחודי', DONE],
    ['Meta description ייחודי', DONE],
    ['H1 ברור', DONE],
    ['H2/H3 בהיררכיה', DONE],
    ['URL נקי', DONE],
    ['Alt מתאים לתמונות', DONE],
    ['Internal links קיימים', DONE],
    ['Anchor text ברור', DONE],
    ['Canonical מוגדר', DONE],
    ['Open Graph ותמונת שיתוף', DONE],
    ['Schema מתאים נבחר', DONE],
    ['Organization/LocalBusiness', DONE],
    ['Schema תואם למידע', DONE],
  ],
  tech: [
    ['robots.txt הוגדר', DONE],
    ['XML sitemap נוצר', DONE],
    ['אין Broken links', DONE],
    ['אין עמודים לא רצויים לאינדוקס', DONE],
    ['hreflang הוגדר', NA],
    ['תמונות בפורמט WebP/AVIF', DONE],
    ['פונטים: נטענים רק המשקלים', DONE],
    ['CSS/JS נבדקו', DONE],
    ['Lazy loading לתמונות', DONE],
    ['Favicon קיים', DONE],
    ['אין עמודים יתומים', DONE],
    ['סט אייקונים מלא', DONE],
    ['פונטים מתארחים מקומית', DONE],
  ],
  a11y: [
    ['מצב Focus נראה בבירור', DONE],
    ['ניגודיות צבעים לפי WCAG AA', DONE],
    ['תמונות דקורטיביות מוגדרות עם Alt ריק', DONE],
    ['לכל שדה בטופס יש תווית', DONE],
    ['לקישורים ולכפתורים יש טקסט מובן', DONE],
    ['בדיקה אוטומטית (Lighthouse / axe)', DONE],
    ['הנגישות לא נשענת על תוסף', DONE],
  ],
  security: [
    ['CMS, תבנית ותוספים מעודכנים', NA],
    ['תוספים ותבניות שלא בשימוש הוסרו', NA],
    ['אימות דו-שלבי (2FA)', NA],
    ['סיסמאות חזקות וייחודיות', NA],
    ['ניסיונות התחברות מוגבלים', NA],
    ['הגנה מספאם בטפסים', DONE],
  ],
  legal: [
    ['מדיניות הפרטיות תואמת את המידע שהאתר אוסף', DONE],
    ['הטפסים אוספים רק מידע נחוץ', DONE],
    ['הסכמה לדיוור בתיבה נפרדת', NA],
    ['באנר עוגיות ו-Consent Mode', DONE],
    ['מחיר המוצג לצרכן הוא המחיר הכולל', DONE],
  ],
  conversion: [
    ['מטרת האתר ברורה מיד', DONE],
    ['CTA ברור', DONE],
    ['הודעת הצלחה נבדקה', DONE],
    ['פרמטרי UTM ומקור הפנייה', DONE],
    ['כשל בשליחת טופס מוצג למשתמש', DONE],
    ['דף תודה בכתובת נפרדת', DONE],
    ['סקריפטים של מדידה ופרסום נטענים רק אחרי הסכמת', DONE],
  ],
  google: [
    ['Sitemap מוכן לשליחה', DONE],
    ['Google Business Profile מעודכן', NA],
    ['מידע העסק עקבי וברור', DONE],
    ['שירותים/מוצרים מוגדרים מפורשות', DONE],
    ['אין מידע סותר בין עמודים', DONE],
    ['הוחלט אילו סורקי AI לאפשר', DONE],
  ],
};

// ---------------------------------------------------------------------------
// Stage tracking and notes
// ---------------------------------------------------------------------------

const track = {
  scope: 'in-progress', client: 'in-progress', research: 'in-progress', arch: 'in-progress',
  build: 'in-progress', content: 'in-progress', onpage: 'in-progress', tech: 'in-progress',
  a11y: 'in-progress', security: 'in-progress', legal: 'in-progress', conversion: 'in-progress',
  google: 'in-progress', gate: 'not-started', automation: 'not-started', handover: 'not-started',
  post72: 'not-started', post14: 'not-started', post30: 'not-started',
};

const notes = {
  scope: 'אתר דמו לתיק עבודות, חבילת "אתר מורחב" (עמודי שירות ואזור נפרדים, גלריה). לכן תקציב, חוזה, חומרים ובעלות לקוח סומנו לא רלוונטי. פתוח: הערכת שעות, לוחות זמנים וגישת Cloudflare.',
  client: 'אינסטלטור יחיד, חיפה והקריות, זמין 24/7, עברית בלבד. כל הפרטים בדיוניים (טלפון דמה 050-000-0000, רישיון 12345). אין Google Business Profile (דמו). פתוח: מתחרים, פרטי קשר אמיתיים אצל לקוח אמיתי.',
  research: 'שירותים ושאלות לקוח מופו לפי האפיון. לא בוצע מחקר מילות מפתח, נפחי חיפוש או מתחרים: מילת המפתח לכל עמוד נקבעה לפי האפיון (שירות + עיר) ורשומה בשדה keyword בקונפיג.',
  arch: '27 עמודים: בית, אודות, מרכז שירותים + 8 עמודי שירות, מרכז אזורים + 5 עמודי עיר (חיפה, אתא, ביאליק, מוצקין, ים), גלריה, המלצות, מחירון, חירום 24/7, FAQ, צור קשר, תודה, פרטיות, נגישות, 404. כל הנתונים המשתנים ב-src/config/site.config.ts. פתוח: אישור מבנה.',
  build: 'Astro 7 סטטי, ללא CMS. פונטים Rubik ו-Assistant (OFL) מתארחים מקומית. עיצוב: כחול כהה + כתום בטיחות, רקע שרטוט (blueprint). פיצ\'רים: פס חירום דביק, סרגל התקשרות במובייל, בוחר תקלות עם הנחיות, כרטיס זמינות חי, השוואת לפני/אחרי נגררת, מפת מסלולים עם זמני הגעה. תמונות סטוק מ-Pexels (CREDITS.md). פתוח: אישור עיצוב, Staging, Git, SMTP.',
  content: 'כל התוכן דמו: המלצות, מחירים, רישיון ונתונים בדיוניים, ומסומן בפוטר. תוכן ייחודי לכל עיר (טופוגרפיה בכרמל, אוויר ים בקריית ים, שורשים בקריית ביאליק). פתוח: הגהה אנושית, אישור לקוח, ומקור לטענה על בדיקת מז"ח שנתית.',
  onpage: 'נבדק אוטומטית (npm run audit): title ו-description ייחודיים, H1 אחד, canonical, JSON-LD תקין (Plumber, Service, FAQPage, BreadcrumbList, Person, ItemList). פתוח: Rich Results Test על אתר חי.',
  tech: 'Lighthouse נייד (6 עמודים): ביצועים 94-99, נגישות 100, Best Practices 100. SEO 69 בגלל noindex מכוון במצב דמו. LCP 1.7-2.9 שניות, CLS עד 0.04. 0 קישורים שבורים ו-0 יתומים, ללא גלילה אופקית ב-360 ו-1280 פיקסלים בכל העמודים. פתוח: HTTPS, 404 אמיתי על Cloudflare, Safari/Android, Core Web Vitals מנתוני שטח.',
  a11y: 'Lighthouse נגישות 100 ב-6 עמודים, אחרי תיקון ניגודיות ירוק הוואטסאפ ושם נגיש ללוגו. Skip link, Focus, reduced-motion, סליידר לפני/אחרי נגיש במקלדת, מפה עם חלופה טקסטואלית. פתוח: ניווט מקלדת ידני מלא, קורא מסך, זום 200%.',
  security: 'אתר סטטי ללא ממשק ניהול. Honeypot בטופס, public/_headers עם HSTS ו-nosniff. פתוח: אימות הכותרות, גיבוי ו-SSL אחרי העלאה ל-Cloudflare.',
  legal: 'פרטיות ונגישות קיימים ומבוססים על הקונפיג. אין עמוד תנאי שימוש (לא נדרש לאתר תדמית בלי מכירה). מחירים כוללים מע"מ. פתוח: בדיקה משפטית.',
  conversion: 'טופס במצב דמו (form.destinations ריק): ולידציה, UTM, הודעת כשל ודף תודה. אירועים: generate_lead, phone_click, whatsapp_click. פתוח: יעדים אמיתיים (מייל + גיליון), GA4, בדיקת טלפון ווואטסאפ עם מספר אמיתי.',
  google: 'robots.txt מאפשר GPTBot, PerplexityBot ו-Google-Extended. sitemap-index.xml נוצר אוטומטית. במצב דמו כל העמודים noindex.',
};

const pages = [
  ['דף הבית', '/'],
  ['אודות רוני', '/about/'],
  ['שירותים (ריכוז)', '/services/'],
  ['איתור ותיקון נזילות', '/services/leak-detection/'],
  ['פתיחת סתימות', '/services/drain-cleaning/'],
  ['דודי שמש וחשמל', '/services/water-heaters/'],
  ['אינסטלציה לשיפוץ אמבטיה ומטבח', '/services/renovation-plumbing/'],
  ['החלפת צנרת ועבודות צנרת כלליות', '/services/pipe-replacement/'],
  ['צילום קווי ביוב', '/services/sewer-camera/'],
  ['ברזים, אסלות וכלים סניטריים', '/services/fixtures-installation/'],
  ['התקנה ובדיקת מז"ח', '/services/backflow-preventer/'],
  ['אזורי שירות (ריכוז)', '/areas/'],
  ['אינסטלטור בחיפה', '/areas/haifa/'],
  ['אינסטלטור בקריית אתא', '/areas/kiryat-ata/'],
  ['אינסטלטור בקריית ביאליק', '/areas/kiryat-bialik/'],
  ['אינסטלטור בקריית מוצקין', '/areas/kiryat-motzkin/'],
  ['אינסטלטור בקריית ים', '/areas/kiryat-yam/'],
  ['גלריית עבודות (לפני/אחרי)', '/gallery/'],
  ['המלצות לקוחות', '/reviews/'],
  ['מחירון', '/prices/'],
  ['חירום 24/7', '/emergency/'],
  ['שאלות נפוצות', '/faq/'],
  ['צור קשר', '/contact/'],
  ['דף תודה', '/thank-you/'],
  ['מדיניות פרטיות', '/privacy/'],
  ['הצהרת נגישות', '/accessibility/'],
  ['עמוד 404', '/404'],
].map(([name, url]) => ({ name, url, content: true, design: true, seo: true, approval: false }));

// ---------------------------------------------------------------------------
// Build the file
// ---------------------------------------------------------------------------

const items = {};
const errors = [];
for (const [stageId, list] of Object.entries(statuses)) {
  const stage = STAGES.find((s) => s.id === stageId);
  if (!stage) { errors.push(`unknown stage ${stageId}`); continue; }
  const texts = stage.items.map((it) => (typeof it === 'string' ? it : it.t));
  for (const [needle, status] of list) {
    const hits = texts.filter((t) => t.includes(needle));
    if (hits.length !== 1) { errors.push(`${stageId}: "${needle}" matched ${hits.length} items`); continue; }
    items[`${stageId}.${hash(hits[0])}`] = status;
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const data = {
  client: 'דמו לתיק עבודות: רוני שגב, אינסטלטור (חיפה והקריות)',
  siteName: 'רוני שגב - אינסטלטור',
  domain: 'אין דומיין (דמו). יעד: Cloudflare Pages',
  owner: 'ציון',
  profile: 'corporate',
  projectKind: 'new',
  env: 'פיתוח מקומי, http://localhost:4321',
  platform: 'Astro 7, אתר סטטי, ללא CMS. כל הנתונים המשתנים ב-src/config/site.config.ts',
  languages: 'עברית (RTL)',
  projectStatus: 'in-progress',
  docVersion: '3.0',
  startDate: '2026-09-26',
  updatedDate: today,
  // Demo project: dates are illustrative
  dueDate: '2026-10-10',
  materialsDate: '',
};
for (const [stage, status] of Object.entries(track)) data[`track.${stage}.status`] = status;
for (const [stage, note] of Object.entries(notes)) data[`stageNotes.${stage}`] = note;

const out = {
  format: 'websiteBuildChecklist',
  version: 3,
  projects: [{
    id: 'p-roni-segev-plumber',
    name: data.siteName,
    state: { version: 3, savedAt: new Date().toISOString(), data, items, waiting: {}, pages },
  }],
};
writeFileSync(OUT_FILE, JSON.stringify(out, null, 2));

const counts = Object.values(items).reduce((a, s) => ((a[s] = (a[s] || 0) + 1), a), {});
console.log(`checklist written: ${counts.done || 0} done, ${counts.na || 0} n/a, ${pages.length} pages`);
