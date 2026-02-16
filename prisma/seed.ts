import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Site Settings
  const settings = [
    { key: 'site_name', value: 'GROUPCONSULT', value_en: 'GROUPCONSULT', value_pt: 'GROUPCONSULT', group: 'general', label: 'שם האתר', type: 'text', order: 1 },
    { key: 'site_description', value: 'שילוב של אסטרטגיה, ניהול והקצאת הון לראייה עסקית שלמה ומדידה', value_en: 'A combination of strategy, management and capital allocation for a complete and measurable business perspective', value_pt: 'Uma combinacao de estrategia, gestao e alocacao de capital para uma perspectiva empresarial completa e mensuravel', group: 'general', label: 'תיאור האתר', type: 'textarea', order: 2 },
    { key: 'hero_title', value: 'אסטרטגיה, ניהול והקצאת הון: ראייה אחת אינטגרטיבית', value_en: 'Strategy, Management & Capital Allocation: One Integrative Vision', value_pt: 'Estrategia, Gestao e Alocacao de Capital: Uma Visao Integrativa', group: 'general', label: 'כותרת ראשית (Hero)', type: 'text', order: 3 },
    { key: 'hero_subtitle', value: 'אנחנו מלווים ארגונים ומנהלים בתהליכי צמיחה, שיפור ביצועים והשקעות הון, תוך דגש על יישום פרקטי ומדיד בשטח.', value_en: 'We partner with organizations and executives through growth, performance improvement and capital investment processes, with a focus on practical, measurable implementation.', value_pt: 'Acompanhamos organizacoes e executivos em processos de crescimento, melhoria de desempenho e investimento de capital, com foco em implementacao pratica e mensuravel.', group: 'general', label: 'תת-כותרת (Hero)', type: 'textarea', order: 4 },
    { key: 'phone', value: '050-1234567', group: 'contact', label: 'טלפון', type: 'phone', order: 1 },
    { key: 'email', value: 'office@groupconsult.co.il', group: 'contact', label: 'דוא״ל', type: 'email', order: 2 },
    { key: 'address', value: 'ישראל | פורטוגל', value_en: 'Israel | Portugal', value_pt: 'Israel | Portugal', group: 'contact', label: 'כתובת / מוקדי פעילות', type: 'text', order: 3 },
    { key: 'meta_title', value: 'קבוצת ייעוץ - אסטרטגיה, ניהול והקצאת הון', value_en: 'Consulting Group - Strategy, Management & Capital Allocation', value_pt: 'Grupo de Consultoria - Estrategia, Gestao e Alocacao de Capital', group: 'seo', label: 'כותרת SEO', type: 'text', order: 1 },
    { key: 'meta_description', value: 'קבוצת ייעוץ המתמחה בייעוץ אסטרטגי, ליווי מנהלים והשקעות נדל״ן', value_en: 'A consulting group specializing in strategic consulting, executive coaching and real estate investment', value_pt: 'Um grupo de consultoria especializado em consultoria estrategica, coaching executivo e investimento imobiliario', group: 'seo', label: 'תיאור SEO', type: 'textarea', order: 2 },
    { key: 'logo_prefix', value: 'GROUP', group: 'branding', label: 'לוגו - חלק ראשון (צבע בהיר)', type: 'text', order: 1 },
    { key: 'logo_suffix', value: 'CONSULT', group: 'branding', label: 'לוגו - חלק שני (צבע כהה)', type: 'text', order: 2 },
    { key: 'logo_url', value: '', group: 'branding', label: 'לוגו תמונה (URL) - אופציונלי, מחליף טקסט', type: 'image', order: 3 },
    { key: 'logo_size', value: '160', group: 'branding', label: 'גודל לוגו ניווט', type: 'range', order: 4 },
    { key: 'footer_logo_prefix', value: '', group: 'branding', label: 'לוגו פוטר - חלק ראשון (צבע בהיר)', type: 'text', order: 5 },
    { key: 'footer_logo_suffix', value: '', group: 'branding', label: 'לוגו פוטר - חלק שני (צבע כהה)', type: 'text', order: 6 },
    { key: 'footer_logo_url', value: '', group: 'branding', label: 'לוגו פוטר תמונה (URL) - אופציונלי', type: 'image', order: 7 },
    { key: 'footer_logo_size', value: '160', group: 'branding', label: 'גודל לוגו פוטר', type: 'range', order: 8 },
    { key: 'favicon_url', value: '', group: 'branding', label: 'Favicon (URL)', type: 'image', order: 9 },
  ];

  for (const s of settings) {
    const { key, ...rest } = s as any;
    await prisma.siteSetting.upsert({
      where: { key },
      update: {
        label: rest.label,
        order: rest.order,
        type: rest.type,
        group: rest.group,
        value_en: rest.value_en || null,
        value_pt: rest.value_pt || null,
      },
      create: s as any,
    });
  }
  console.log(`  ✓ ${settings.length} site settings`);

  // Services
  const services = [
    {
      title: 'ייעוץ אסטרטגי ועסקי',
      title_en: 'Strategic & Business Consulting',
      title_pt: 'Consultoria Estrategica e Empresarial',
      slug: 'strategy',
      shortDescription: 'גיבוש מודלים עסקיים, תכנון אסטרטגי והטמעה בשטח עם מדדי ביצוע (KPIs) ברורים.',
      shortDescription_en: 'Building business models, strategic planning and field implementation with clear KPIs.',
      shortDescription_pt: 'Desenvolvimento de modelos de negocio, planejamento estrategico e implementacao em campo com KPIs claros.',
      fullContent: 'אנחנו עוזרים לארגונים לגשר על הפער בין חזון לבין ביצוע יומיומי. הייעוץ שלנו מתמקד ביצירת ערך בר-קיימא ובניית מודלים עסקיים עמידים.',
      fullContent_en: 'We help organizations bridge the gap between vision and day-to-day execution. Our consulting focuses on creating sustainable value and building resilient business models.',
      fullContent_pt: 'Ajudamos organizacoes a superar a lacuna entre visao e execucao diaria. Nossa consultoria foca na criacao de valor sustentavel e na construcao de modelos de negocio resilientes.',
      icon: 'Briefcase',
      order: 1,
      isActive: true,
    },
    {
      title: 'ליווי ואימון מנהלים',
      title_en: 'Executive Coaching & Training',
      title_pt: 'Coaching e Treinamento Executivo',
      slug: 'coaching',
      shortDescription: 'פיתוח מנהיגות, קבלת החלטות תחת לחץ וניהול קריירה למנהלים בכל הדרגים.',
      shortDescription_en: 'Leadership development, decision-making under pressure and career management for executives at all levels.',
      shortDescription_pt: 'Desenvolvimento de lideranca, tomada de decisao sob pressao e gestao de carreira para executivos em todos os niveis.',
      fullContent: 'מנהיגות אפקטיבית היא המנוע מאחורי כל אסטרטגיה מוצלחת. אנחנו מלווים מנהלים בבניית ביטחון, קבלת החלטות ושיפור אפקטיביות בין-אישית.',
      fullContent_en: 'Effective leadership is the engine behind every successful strategy. We coach executives in building confidence, decision-making and improving interpersonal effectiveness.',
      fullContent_pt: 'A lideranca eficaz e o motor por tras de toda estrategia bem-sucedida. Acompanhamos executivos na construcao de confianca, tomada de decisao e melhoria da eficacia interpessoal.',
      icon: 'Users',
      order: 2,
      isActive: true,
    },
    {
      title: 'ליווי והשקעות נדל״ן',
      title_en: 'Real Estate Guidance & Investment',
      title_pt: 'Orientacao e Investimento Imobiliario',
      slug: 'real-estate',
      shortDescription: 'ייעוץ בהקצאת הון לנכסים מניבים בישראל ובפורטוגל, וניהול נכסים ארוך טווח.',
      shortDescription_en: 'Capital allocation advisory for income-generating properties in Israel and Portugal, and long-term asset management.',
      shortDescription_pt: 'Assessoria em alocacao de capital para imoveis geradores de renda em Israel e Portugal, e gestao de ativos a longo prazo.',
      fullContent: 'כחלק אינטגרלי מפעילות הקבוצה, אנחנו מלווים משקיעים וארגונים בהקצאת הון לנכסים מניבים.',
      fullContent_en: 'As an integral part of the group\'s operations, we guide investors and organizations in allocating capital to income-generating properties.',
      fullContent_pt: 'Como parte integral das operacoes do grupo, orientamos investidores e organizacoes na alocacao de capital em imoveis geradores de renda.',
      icon: 'Building2',
      order: 3,
      isActive: true,
    },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        title_en: s.title_en, title_pt: s.title_pt,
        shortDescription_en: s.shortDescription_en, shortDescription_pt: s.shortDescription_pt,
        fullContent_en: s.fullContent_en, fullContent_pt: s.fullContent_pt,
      },
      create: s,
    });
  }
  console.log(`  ✓ ${services.length} services`);

  // Categories
  const categories = [
    { name: 'כללי', name_en: 'General', name_pt: 'Geral', slug: 'general', description: 'תכנים כלליים', description_en: 'General content', description_pt: 'Conteudo geral', order: 1, isActive: true },
    { name: 'לוגו ומיתוג', name_en: 'Logo & Branding', name_pt: 'Logo e Marca', slug: 'branding', description: 'נכסי מיתוג ולוגו', description_en: 'Branding and logo assets', description_pt: 'Ativos de marca e logo', order: 2, isActive: true },
    { name: 'תמונות אתר', name_en: 'Website Images', name_pt: 'Imagens do Site', slug: 'website-images', description: 'תמונות לשימוש באתר', description_en: 'Images for the website', description_pt: 'Imagens para o site', order: 3, isActive: true },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name_en: c.name_en, name_pt: c.name_pt, description_en: c.description_en, description_pt: c.description_pt },
      create: c,
    });
  }
  console.log(`  ✓ ${categories.length} categories`);

  // Pages
  const pages = [
    {
      title: 'עמוד הבית',
      title_en: 'Home',
      title_pt: 'Inicio',
      slug: 'home',
      content: 'אסטרטגיה, ניהול והקצאת הון: ראייה אחת אינטגרטיבית. אנחנו מלווים ארגונים ומנהלים בתהליכי צמיחה, שיפור ביצועים והשקעות הון, תוך דגש על יישום פרקטי ומדיד בשטח.',
      content_en: 'Strategy, Management & Capital Allocation: One Integrative Vision. We partner with organizations and executives through growth, performance improvement and capital investment processes, with a focus on practical, measurable implementation.',
      content_pt: 'Estrategia, Gestao e Alocacao de Capital: Uma Visao Integrativa. Acompanhamos organizacoes e executivos em processos de crescimento, melhoria de desempenho e investimento de capital, com foco em implementacao pratica e mensuravel.',
      status: 'published',
      metaTitle: 'קבוצת ייעוץ - אסטרטגיה, ניהול והקצאת הון',
      metaTitle_en: 'Consulting Group - Strategy, Management & Capital Allocation',
      metaTitle_pt: 'Grupo de Consultoria - Estrategia, Gestao e Alocacao de Capital',
      metaDescription: 'קבוצת ייעוץ המתמחה בייעוץ אסטרטגי, ליווי מנהלים והשקעות נדל״ן בישראל ובפורטוגל',
      metaDescription_en: 'A consulting group specializing in strategic consulting, executive coaching and real estate investment in Israel and Portugal',
      metaDescription_pt: 'Um grupo de consultoria especializado em consultoria estrategica, coaching executivo e investimento imobiliario em Israel e Portugal',
    },
    {
      title: 'הגישה שלנו',
      title_en: 'Our Approach',
      title_pt: 'Nossa Abordagem',
      slug: 'approach',
      content: 'חשיבה חייבת להוביל לביצוע, ביצוע חייב להיות מדיד. 4 עקרונות הליבה שלנו: ראייה הוליסטית, פרקטיות ויישום, עבודה בשלבים, ניהול סיכונים.',
      content_en: 'Thinking must lead to execution; execution must be measurable. Our 4 core principles: Holistic perspective, Practicality & Implementation, Phased approach, Risk management.',
      content_pt: 'O pensamento deve levar a execucao; a execucao deve ser mensuravel. Nossos 4 principios fundamentais: Perspectiva holistica, Praticidade e implementacao, Abordagem por fases, Gestao de riscos.',
      status: 'published',
      metaTitle: 'הגישה שלנו - קבוצת ייעוץ',
      metaTitle_en: 'Our Approach - Consulting Group',
      metaTitle_pt: 'Nossa Abordagem - Grupo de Consultoria',
      metaDescription: 'הגישה המקצועית של קבוצת הייעוץ - חשיבה הוליסטית, יישום פרקטי וניהול סיכונים',
      metaDescription_en: 'The professional approach of the consulting group - holistic thinking, practical implementation and risk management',
      metaDescription_pt: 'A abordagem profissional do grupo de consultoria - pensamento holistico, implementacao pratica e gestao de riscos',
    },
    {
      title: 'ייעוץ אסטרטגי ועסקי',
      title_en: 'Strategic & Business Consulting',
      title_pt: 'Consultoria Estrategica e Empresarial',
      slug: 'services-strategy',
      content: 'אנחנו עוזרים לארגונים לגשר על הפער בין חזון לבין ביצוע יומיומי.',
      content_en: 'We help organizations bridge the gap between vision and day-to-day execution.',
      content_pt: 'Ajudamos organizacoes a superar a lacuna entre visao e execucao diaria.',
      status: 'published',
      metaTitle: 'ייעוץ אסטרטגי ועסקי - קבוצת ייעוץ',
      metaTitle_en: 'Strategic & Business Consulting - Consulting Group',
      metaTitle_pt: 'Consultoria Estrategica e Empresarial - Grupo de Consultoria',
      metaDescription: 'ייעוץ אסטרטגי ועסקי לארגונים - גיבוש מודלים עסקיים, תכנון אסטרטגי והטמעה בשטח',
      metaDescription_en: 'Strategic & business consulting for organizations - business model development, strategic planning and field implementation',
      metaDescription_pt: 'Consultoria estrategica e empresarial para organizacoes - desenvolvimento de modelos de negocio, planejamento estrategico e implementacao em campo',
    },
    {
      title: 'ליווי ואימון מנהלים',
      title_en: 'Executive Coaching & Training',
      title_pt: 'Coaching e Treinamento Executivo',
      slug: 'services-coaching',
      content: 'מנהיגות אפקטיבית היא המנוע מאחורי כל אסטרטגיה מוצלחת.',
      content_en: 'Effective leadership is the engine behind every successful strategy.',
      content_pt: 'A lideranca eficaz e o motor por tras de toda estrategia bem-sucedida.',
      status: 'published',
      metaTitle: 'ליווי ואימון מנהלים - קבוצת ייעוץ',
      metaTitle_en: 'Executive Coaching & Training - Consulting Group',
      metaTitle_pt: 'Coaching e Treinamento Executivo - Grupo de Consultoria',
      metaDescription: 'ליווי מנהלים ואימון ניהולי - פיתוח מנהיגות, קבלת החלטות וניהול קריירה',
      metaDescription_en: 'Executive coaching and management training - leadership development, decision-making and career management',
      metaDescription_pt: 'Coaching executivo e treinamento gerencial - desenvolvimento de lideranca, tomada de decisao e gestao de carreira',
    },
    {
      title: 'ליווי והשקעות נדל״ן',
      title_en: 'Real Estate Guidance & Investment',
      title_pt: 'Orientacao e Investimento Imobiliario',
      slug: 'services-real-estate',
      content: 'כחלק אינטגרלי מפעילות הקבוצה, אנחנו מלווים משקיעים וארגונים בהקצאת הון לנכסים מניבים.',
      content_en: 'As an integral part of the group\'s operations, we guide investors and organizations in allocating capital to income-generating properties.',
      content_pt: 'Como parte integral das operacoes do grupo, orientamos investidores e organizacoes na alocacao de capital em imoveis geradores de renda.',
      status: 'published',
      metaTitle: 'ליווי והשקעות נדל״ן - קבוצת ייעוץ',
      metaTitle_en: 'Real Estate Guidance & Investment - Consulting Group',
      metaTitle_pt: 'Orientacao e Investimento Imobiliario - Grupo de Consultoria',
      metaDescription: 'ייעוץ והשקעות נדל״ן בישראל ובפורטוגל - הקצאת הון, ניהול נכסים וליווי משקיעים',
      metaDescription_en: 'Real estate consulting and investment in Israel and Portugal - capital allocation, asset management and investor guidance',
      metaDescription_pt: 'Consultoria e investimento imobiliario em Israel e Portugal - alocacao de capital, gestao de ativos e orientacao de investidores',
    },
    {
      title: 'יצירת קשר',
      title_en: 'Contact Us',
      title_pt: 'Contato',
      slug: 'contact',
      content: 'אנחנו מזמינים אתכם לשיחת היכרות ראשונית לבחינת הצרכים שלכם ולבדיקת התאמה לליווי המקצועי שלנו.',
      content_en: 'We invite you to an introductory conversation to explore your needs and assess the fit for our professional guidance.',
      content_pt: 'Convidamos voce para uma conversa inicial para explorar suas necessidades e avaliar a adequacao ao nosso acompanhamento profissional.',
      status: 'published',
      metaTitle: 'יצירת קשר - קבוצת ייעוץ',
      metaTitle_en: 'Contact Us - Consulting Group',
      metaTitle_pt: 'Contato - Grupo de Consultoria',
      metaDescription: 'צרו קשר עם קבוצת הייעוץ לתיאום שיחת היכרות',
      metaDescription_en: 'Contact the consulting group to schedule an introductory conversation',
      metaDescription_pt: 'Entre em contato com o grupo de consultoria para agendar uma conversa inicial',
    },
    {
      title: 'אודות',
      title_en: 'About',
      title_pt: 'Sobre',
      slug: 'about',
      content: 'קבוצת הייעוץ שלנו הוקמה מתוך הבנה שהפרדה בין אסטרטגיה לבין ניהול אנשים והקצאת הון היא מלאכותית.',
      content_en: 'Our consulting group was founded on the understanding that separating strategy from people management and capital allocation is artificial.',
      content_pt: 'Nosso grupo de consultoria foi fundado com a compreensao de que separar estrategia da gestao de pessoas e alocacao de capital e artificial.',
      status: 'published',
      metaTitle: 'אודות - קבוצת ייעוץ',
      metaTitle_en: 'About - Consulting Group',
      metaTitle_pt: 'Sobre - Grupo de Consultoria',
      metaDescription: 'אודות קבוצת הייעוץ - שילוב של אסטרטגיה, ניהול והקצאת הון',
      metaDescription_en: 'About the consulting group - a combination of strategy, management and capital allocation',
      metaDescription_pt: 'Sobre o grupo de consultoria - uma combinacao de estrategia, gestao e alocacao de capital',
    },
    {
      title: 'תנאי שימוש',
      title_en: 'Terms of Use',
      title_pt: 'Termos de Uso',
      slug: 'terms',
      content: 'תנאי שימוש באתר.',
      content_en: 'Website terms of use.',
      content_pt: 'Termos de uso do site.',
      status: 'draft',
    },
  ];

  for (const p of pages) {
    await prisma.page.upsert({
      where: { slug: p.slug },
      update: {
        title_en: p.title_en, title_pt: p.title_pt,
        content_en: p.content_en, content_pt: p.content_pt,
        metaTitle_en: p.metaTitle_en || null, metaTitle_pt: p.metaTitle_pt || null,
        metaDescription_en: p.metaDescription_en || null, metaDescription_pt: p.metaDescription_pt || null,
      },
      create: p,
    });
  }
  console.log(`  ✓ ${pages.length} pages`);

  // Testimonials
  const testimonials = [
    {
      name: 'דני כהן',
      role: 'סמנכ״ל טכנולוגיות',
      role_en: 'VP Technology',
      role_pt: 'VP de Tecnologia',
      company: 'טק סולושנס בע״מ',
      company_en: 'Tech Solutions Ltd.',
      company_pt: 'Tech Solutions Ltda.',
      content: 'הליווי האסטרטגי שקיבלנו עזר לנו לזהות הזדמנויות צמיחה שלא ראינו קודם. תוך חצי שנה הכפלנו את קצב הצמיחה.',
      content_en: 'The strategic guidance we received helped us identify growth opportunities we hadn\'t seen before. Within six months we doubled our growth rate.',
      content_pt: 'A orientacao estrategica que recebemos nos ajudou a identificar oportunidades de crescimento que nao haviamos visto antes. Em seis meses dobramos nossa taxa de crescimento.',
      order: 1,
      isActive: true,
    },
    {
      name: 'שרה לוי',
      role: 'מנכ״לית',
      role_en: 'CEO',
      role_pt: 'CEO',
      company: 'גלובל מדיה',
      company_en: 'Global Media',
      company_pt: 'Global Media',
      content: 'תהליך האימון הניהולי היה מנקודת מפנה בקריירה שלי. קיבלתי כלים מעשיים שמלווים אותי כל יום.',
      content_en: 'The executive coaching process was a turning point in my career. I received practical tools that accompany me every day.',
      content_pt: 'O processo de coaching executivo foi um ponto de virada na minha carreira. Recebi ferramentas praticas que me acompanham todos os dias.',
      order: 2,
      isActive: true,
    },
  ];

  for (const t of testimonials) {
    const existingT = await prisma.testimonial.findFirst({ where: { name: t.name } });
    if (!existingT) {
      await prisma.testimonial.create({ data: t });
    } else {
      await prisma.testimonial.update({
        where: { id: existingT.id },
        data: {
          role_en: t.role_en, role_pt: t.role_pt,
          company_en: t.company_en, company_pt: t.company_pt,
          content_en: t.content_en, content_pt: t.content_pt,
        },
      });
    }
  }
  console.log(`  ✓ ${testimonials.length} testimonials`);

  // FAQ
  const faqs = [
    {
      question: 'כמה זמן נמשך תהליך ייעוץ אסטרטגי?',
      question_en: 'How long does a strategic consulting process take?',
      question_pt: 'Quanto tempo dura um processo de consultoria estrategica?',
      answer: 'תהליך ייעוץ אסטרטגי נמשך בדרך כלל בין 3 ל-6 חודשים, תלוי בהיקף ובמורכבות הארגון.',
      answer_en: 'A strategic consulting process typically takes between 3 and 6 months, depending on the scope and complexity of the organization.',
      answer_pt: 'Um processo de consultoria estrategica geralmente leva de 3 a 6 meses, dependendo do escopo e complexidade da organizacao.',
      order: 1, isActive: true,
    },
    {
      question: 'האם אתם עובדים גם עם חברות קטנות?',
      question_en: 'Do you also work with small companies?',
      question_pt: 'Voces tambem trabalham com pequenas empresas?',
      answer: 'כן, אנחנו מלווים ארגונים מכל הגדלים - מסטארטאפים בשלבים מוקדמים ועד חברות ציבוריות.',
      answer_en: 'Yes, we work with organizations of all sizes - from early-stage startups to public companies.',
      answer_pt: 'Sim, trabalhamos com organizacoes de todos os tamanhos - desde startups em estagios iniciais ate empresas publicas.',
      order: 2, isActive: true,
    },
    {
      question: 'מה ההבדל בין ייעוץ לאימון ניהולי?',
      question_en: 'What is the difference between consulting and executive coaching?',
      question_pt: 'Qual e a diferenca entre consultoria e coaching executivo?',
      answer: 'ייעוץ מתמקד בארגון ובאסטרטגיה, בעוד אימון ניהולי מתמקד בפיתוח אישי של המנהל. לרוב השניים משלימים זה את זה.',
      answer_en: 'Consulting focuses on the organization and strategy, while executive coaching focuses on personal development of the manager. Usually the two complement each other.',
      answer_pt: 'A consultoria foca na organizacao e estrategia, enquanto o coaching executivo foca no desenvolvimento pessoal do gestor. Normalmente, os dois se complementam.',
      order: 3, isActive: true,
    },
  ];

  for (const f of faqs) {
    const existingF = await prisma.fAQ.findFirst({ where: { question: f.question } });
    if (!existingF) {
      await prisma.fAQ.create({ data: f });
    } else {
      await prisma.fAQ.update({
        where: { id: existingF.id },
        data: {
          question_en: f.question_en, question_pt: f.question_pt,
          answer_en: f.answer_en, answer_pt: f.answer_pt,
        },
      });
    }
  }
  console.log(`  ✓ ${faqs.length} FAQs`);

  // Sample contact message
  const existingMsg = await prisma.contactMessage.findFirst();
  if (!existingMsg) {
    await prisma.contactMessage.create({
      data: {
        name: 'ישראל ישראלי',
        email: 'israel@example.com',
        phone: '050-9876543',
        message: 'שלום, מתעניין בליווי אסטרטגי לחברה שלי. אשמח לתאם שיחה.',
      },
    });
    console.log('  ✓ 1 sample contact message');
  }

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
