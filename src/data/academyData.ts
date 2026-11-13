import { 
  CEFRLevelInfo, 
  StagePricing, 
  LevelGroupPricing,
  ProgramCategory, 
  CurriculumStage, 
  PlacementQuestion, 
  BlogPost, 
  FAQItem, 
  SocialLinks 
} from '../types';

export const OFFICIAL_CONTACTS: SocialLinks = {
  whatsapp: 'https://wa.me/84326853884',
  email: 'englishzoneabc123@gmail.com',
  youtube: 'https://youtube.com/@englishzonewithamal?si=qhhnT1Ws_grCKc2s',
  instagram: 'https://www.instagram.com/englishzoneabc?vrfl=MWVtaHBxNXQxanBoaQ==',
  discord: 'https://discord.gg/phjyFBRPp',
  facebook: '#', // Editable placeholder as specified
  telegram: '#'  // Editable placeholder as specified
};

export const CEFR_LEVELS_INFO: CEFRLevelInfo[] = [
  {
    code: 'A1',
    nameEn: 'Beginner',
    nameAr: 'مبتدئ أساسي',
    durationMonths: 6,
    descriptionEn: 'Establish foundational communication skills, essential grammar structures, everyday vocabulary, and simple conversational confidence.',
    descriptionAr: 'بناء المهارات الأساسية للتواصل، التراكيب النحوية الأولية، والمفردات اليومية مع اكتساب الثقة في المحادثة البسيطة.',
    targetAudienceEn: 'Complete beginners or learners who want a solid, structured reset of their English fundamentals.',
    targetAudienceAr: 'المبتدئون تماماً أو المتعلمون الراغبون في إعادة تأسيس قوية ومنهجية لأساسيات اللغة الإنجليزية.',
    stages: ['A1.1', 'A1.2', 'A1.3']
  },
  {
    code: 'A2',
    nameEn: 'Elementary',
    nameAr: 'مبتدئ متقدم (أساسي)',
    durationMonths: 6,
    descriptionEn: 'Communicate in routine everyday situations, expand active vocabulary to 1,500+ words, and master past and future tenses.',
    descriptionAr: 'التواصل في المواقف اليومية المعتادة، توسيع الحصيلة اللغوية إلى أكثر من 1500 كلمة، وإتقان أزمنة الماضي والمستقبل.',
    targetAudienceEn: 'Learners who know basic words but struggle to hold complete conversations or construct accurate sentences.',
    targetAudienceAr: 'الطلاب الذين يمتلكون حصيلة بسيطة لكن يواجهون صعوبة في تكوين جُمل دقيقة ومستمرة.',
    stages: ['A2.1', 'A2.2', 'A2.3']
  },
  {
    code: 'B1',
    nameEn: 'Intermediate',
    nameAr: 'متوسط',
    durationMonths: 6,
    descriptionEn: 'Achieve conversational independence. Express personal thoughts, opinions, professional goals, and navigate travel scenarios smoothly.',
    descriptionAr: 'الوصول إلى الاستقلالية في المحادثة. التعبير عن الآراء الشخصية، الطموحات، والتعامل بسلاسة مع مواقف السفر والعمل.',
    targetAudienceEn: 'Learners who understand spoken English well and now want to speak fluently without hesitation.',
    targetAudienceAr: 'المتعلمون الذين يفهمون اللغة جيداً ويريدون الآن الانطلاق في التحدث بطلاقة وسلاسة دون تردد.',
    stages: ['B1.1', 'B1.2', 'B1.3']
  },
  {
    code: 'B2',
    nameEn: 'Upper-Intermediate',
    nameAr: 'فوق المتوسط',
    durationMonths: 6,
    descriptionEn: 'Engage in complex discussions, technical dialogues, persuasive speaking, nuanced reading, and professional workplace communication.',
    descriptionAr: 'المشاركة في النقاشات المعقدة، الحوارات المهنية، التحدث الإقناعي، والقراءة التحليلية في بيئة العمل والدراسة.',
    targetAudienceEn: 'Professionals and university students preparing for international workplaces or English-medium degree studies.',
    targetAudienceAr: 'المحترفون وطلاب الجامعات الراغبون في التميز الأكاديمي والمهني وإتقان التواصل الإنجليزي رفيع المستوى.',
    stages: ['B2.1', 'B2.2', 'B2.3']
  },
  {
    code: 'C1',
    nameEn: 'Advanced',
    nameAr: 'متقدم',
    durationMonths: 6,
    descriptionEn: 'Attain high-level fluency and flexibility for academic, executive, and social contexts. Formulate clear, well-structured arguments.',
    descriptionAr: 'اكتساب طلاقة ومرونة استثنائية في السياقات الأكاديمية والتنفيذية والاجتماعية مع صياغة أطروحات قوية ومنظمة.',
    targetAudienceEn: 'Executives, educators, and advanced scholars aiming for near-native command and top test scores (IELTS 7.5+ / TOEFL 100+).',
    targetAudienceAr: 'التنفيذيون، المعلمون، والباحثون الساعون لإتقان شبيه بالناطقين الأصليين وأعلى درجات الاختبارات الدولية.',
    stages: ['C1.1', 'C1.2', 'C1.3']
  },
  {
    code: 'C2',
    nameEn: 'Proficiency',
    nameAr: 'إتقان تام (مستوى خبير)',
    durationMonths: 6,
    descriptionEn: 'Master spontaneous, precise expression, idiomatic subtlety, complex literature, rhetorical mastery, and effortless comprehension.',
    descriptionAr: 'إتقان التعبير العفوي والدقيق، التعابير الاصطلاحية الدقيقة، البلاغة اللغوية، والفهم التلقائي الفوري لجميع مستويات اللغة.',
    targetAudienceEn: 'Senior international educators, translators, diplomats, and learners seeking absolute linguistic mastery.',
    targetAudienceAr: 'كبار المترجمين، الأكاديميين، الدبلوماسيين، وكل من يسعى لبلوغ قمة الإتقان اللغوي الاحترافي.',
    stages: ['C2.1', 'C2.2', 'C2.3']
  }
];

export const LEVEL_GROUP_PRICING: LevelGroupPricing[] = [
  {
    level: 'A1',
    nameEn: 'Beginner',
    nameAr: 'مبتدئ أساسي',
    durationMonths: 6,
    stagesCount: 3,
    originalPrice: 100,
    offerPrice: 70,
    priceNoteAr: '(أو ما يعادلها من عملة بلدك)'
  },
  {
    level: 'A2',
    nameEn: 'Elementary',
    nameAr: 'مبتدئ متقدم (أساسي)',
    durationMonths: 6,
    stagesCount: 3,
    originalPrice: 110,
    offerPrice: 75,
    priceNoteAr: '(أو ما يعادلها من عملة بلدك)'
  },
  {
    level: 'B1',
    nameEn: 'Intermediate',
    nameAr: 'متوسط',
    durationMonths: 6,
    stagesCount: 3,
    originalPrice: 125,
    offerPrice: 85,
    priceNoteAr: '(أو ما يعادلها من عملة بلدك)'
  },
  {
    level: 'B2',
    nameEn: 'Upper-Intermediate',
    nameAr: 'فوق المتوسط',
    durationMonths: 6,
    stagesCount: 3,
    originalPrice: 135,
    offerPrice: 95,
    priceNoteAr: '(أو ما يعادلها من عملة بلدك)'
  },
  {
    level: 'C1',
    nameEn: 'Advanced',
    nameAr: 'متقدم',
    durationMonths: 6,
    stagesCount: 3,
    originalPrice: 150,
    offerPrice: 105,
    priceNoteAr: '(أو ما يعادلها من عملة بلدك)'
  },
  {
    level: 'C2',
    nameEn: 'Proficiency',
    nameAr: 'إتقان تام (مستوى خبير)',
    durationMonths: 6,
    stagesCount: 3,
    originalPrice: 170,
    offerPrice: 120,
    priceNoteAr: '(أو ما يعادلها من عملة بلدك)'
  }
];

export const STAGE_PRICING_TABLE: StagePricing[] = [
  // A1
  { stage: 'A1.1', level: 'A1', stageNumber: 1, months: 'Months 1–2', individualCurrent: 80, individualOriginal: 100, groupPrice: 70, groupOriginalPrice: 100 },
  { stage: 'A1.2', level: 'A1', stageNumber: 2, months: 'Months 3–4', individualCurrent: 85, individualOriginal: 100, groupPrice: 70, groupOriginalPrice: 100 },
  { stage: 'A1.3', level: 'A1', stageNumber: 3, months: 'Months 5–6', individualCurrent: 90, individualOriginal: 100, groupPrice: 70, groupOriginalPrice: 100 },
  // A2
  { stage: 'A2.1', level: 'A2', stageNumber: 1, months: 'Months 1–2', individualCurrent: 95, individualOriginal: 135, groupPrice: 75, groupOriginalPrice: 110 },
  { stage: 'A2.2', level: 'A2', stageNumber: 2, months: 'Months 3–4', individualCurrent: 100, individualOriginal: 135, groupPrice: 75, groupOriginalPrice: 110 },
  { stage: 'A2.3', level: 'A2', stageNumber: 3, months: 'Months 5–6', individualCurrent: 105, individualOriginal: 135, groupPrice: 75, groupOriginalPrice: 110 },
  // B1
  { stage: 'B1.1', level: 'B1', stageNumber: 1, months: 'Months 1–2', individualCurrent: 120, individualOriginal: 150, groupPrice: 85, groupOriginalPrice: 125 },
  { stage: 'B1.2', level: 'B1', stageNumber: 2, months: 'Months 3–4', individualCurrent: 120, individualOriginal: 150, groupPrice: 85, groupOriginalPrice: 125 },
  { stage: 'B1.3', level: 'B1', stageNumber: 3, months: 'Months 5–6', individualCurrent: 120, individualOriginal: 150, groupPrice: 85, groupOriginalPrice: 125 },
  // B2
  { stage: 'B2.1', level: 'B2', stageNumber: 1, months: 'Months 1–2', individualCurrent: 135, individualOriginal: 180, groupPrice: 95, groupOriginalPrice: 135 },
  { stage: 'B2.2', level: 'B2', stageNumber: 2, months: 'Months 3–4', individualCurrent: 135, individualOriginal: 180, groupPrice: 95, groupOriginalPrice: 135 },
  { stage: 'B2.3', level: 'B2', stageNumber: 3, months: 'Months 5–6', individualCurrent: 135, individualOriginal: 180, groupPrice: 95, groupOriginalPrice: 135 },
  // C1
  { stage: 'C1.1', level: 'C1', stageNumber: 1, months: 'Months 1–2', individualCurrent: 150, individualOriginal: 200, groupPrice: 105, groupOriginalPrice: 150 },
  { stage: 'C1.2', level: 'C1', stageNumber: 2, months: 'Months 3–4', individualCurrent: 150, individualOriginal: 200, groupPrice: 105, groupOriginalPrice: 150 },
  { stage: 'C1.3', level: 'C1', stageNumber: 3, months: 'Months 5–6', individualCurrent: 150, individualOriginal: 200, groupPrice: 105, groupOriginalPrice: 150 },
  // C2
  { stage: 'C2.1', level: 'C2', stageNumber: 1, months: 'Months 1–2', individualCurrent: 165, individualOriginal: 230, groupPrice: 120, groupOriginalPrice: 170 },
  { stage: 'C2.2', level: 'C2', stageNumber: 2, months: 'Months 3–4', individualCurrent: 165, individualOriginal: 230, groupPrice: 120, groupOriginalPrice: 170 },
  { stage: 'C2.3', level: 'C2', stageNumber: 3, months: 'Months 5–6', individualCurrent: 165, individualOriginal: 230, groupPrice: 120, groupOriginalPrice: 170 },
];

export const PROGRAM_CATEGORIES: ProgramCategory[] = [
  {
    id: 'general-english',
    titleEn: 'General English',
    titleAr: 'اللغة الإنجليزية العامة',
    shortDescEn: 'Comprehensive 4-skills English program following international CEFR standards.',
    shortDescAr: 'برنامج شامل لتطوير المهارات الأربع وفق المعايير الأوروبية المعتمدة (CEFR).',
    fullDescEn: 'A balanced, structured pathway covering speaking, listening, reading, writing, and practical grammar to build total linguistic confidence in everyday situations.',
    fullDescAr: 'مسار منهجي متوازن يغطي مهارات التحدث والاستماع والقراءة والكتابة مع القواعد العملية لبناء ثقة لغوية شاملة.',
    objectivesEn: [
      'Master essential grammatical structures with natural usage',
      'Build rich, thematic vocabulary for everyday situations',
      'Develop active listening and natural pronunciation skills',
      'Formulate clear spoken and written expressions with confidence'
    ],
    objectivesAr: [
      'إتقان القواعد النحوية الأساسية وتطبيقها بسلاسة',
      'بناء مخزون غني من المفردات الموضوعية للحياة اليومية',
      'تطوير مهارات الاستماع النشط والنطق الطبيعي السليم',
      'صياغة التعبير الشفهي والكتابي الواضح بكل ثقة'
    ],
    suitableForEn: 'Learners of all ages seeking a solid, systematic foundation.',
    suitableForAr: 'الراغبون في تأسيس شامل ومنهجي بمختلف الأعمار.',
    formatEn: 'Small Group (90 min, 4–6 students)',
    formatAr: 'مجموعات صغيرة (90 دقيقة، 4 إلى 6 طلاب)',
    durationEn: '6 Months per CEFR Level (3 Stages of 2 Months)',
    durationAr: '6 أشهر لكل مستوى (3 مراحل، كل مرحلة شهران)',
    iconName: 'BookOpen',
    badgeEn: 'Most Popular',
    badgeAr: 'الأكثر طلباً'
  },
  {
    id: 'conversation',
    titleEn: 'Conversation Mastery',
    titleAr: 'إتقان المحادثة والطلاقة',
    shortDescEn: 'Intensive speaking-focused classes to eliminate hesitation and speak with natural flow.',
    shortDescAr: 'حصص مكثفة تركز على المحادثة وإزالة التردد لاكتساب طلاقة طبيعية وسريعة.',
    fullDescEn: 'Overcome fear of speaking through real-world dialogues, debate simulations, spontaneous presentations, and real-time pronunciation coaching.',
    fullDescAr: 'تغلب على حاجز الخوف وتحدث بثقة من خلال حوارات واقعية، محاكاة مناظرات، ومتابعة فورية لمخارج الحروف والنبرة الصوتية.',
    objectivesEn: [
      'Break speaking barriers and speak spontaneously without translating in your head',
      'Acquire modern conversational idioms, phrasal verbs, and colloquial expressions',
      'Improve rhythm, intonation, and native-like speech flow',
      'Engage in lively debates, opinions sharing, and storytelling'
    ],
    objectivesAr: [
      'كسر حاجز الخوف والتحدث التلقائي دون ترجمة داخلية',
      'اكتساب التعابير الاصطلاحية والأفعال المركبة الدارجة',
      'تحسين النبرة والإيقاع اللغوي ومخارج الحروف',
      'المشاركة التفاعلية في النقاشات وطرح الآراء والقصص'
    ],
    suitableForEn: 'Students with passive vocabulary who need active speaking practice.',
    suitableForAr: 'من يمتلكون حصيلة لغوية لكنهم يحتاجون لممارسة التحدث الفعلي.',
    formatEn: 'Small Interactive Group (90 min)',
    formatAr: 'مجموعات تفاعلية صغيرة (90 دقيقة)',
    durationEn: 'Flexible monthly modules',
    durationAr: 'وحدات شهرية مرنة',
    iconName: 'MessageSquare',
    badgeEn: 'High Interaction',
    badgeAr: 'تفاعل عالي'
  },
  {
    id: 'kids-english',
    titleEn: 'English for Kids',
    titleAr: 'الإنجليزية للأطفال والناشئة',
    shortDescEn: 'Fun, gamified, engaging English learning tailored for young learners aged 6–14.',
    shortDescAr: 'تعلم ممتع وتفاعلي قائم على اللعب والتحفيز مخصص للأطفال من سن 6 إلى 14 عاماً.',
    fullDescEn: 'Built specifically for children and teenagers with gamified stars, visual storytelling, pronunciation songs, phonics, and the English Zone Stars reward system.',
    fullDescAr: 'صُمم خصيصاً للناشئة باستخدام نظام نجوم English Zone Stars، والقصص المصورة، والألعاب الصوتية لغرس حب اللغة الإنجليزية منذ الصغر.',
    objectivesEn: [
      'Master phonics, reading foundations, and clear pronunciation',
      'Build confidence through interactive games, songs, and visual media',
      'Earn English Zone Stars, collect badges, and customize digital avatars',
      'Learn polite everyday expressions and simple storytelling'
    ],
    objectivesAr: [
      'إتقان الصوتيات وأسس القراءة والنطق السليم للأحرف',
      'تعزيز الثقة من خلال الألعاب التربوية والقصص المشوقة',
      'كسب نجوم English Zone Stars وتخصيص الأفاتار المميز',
      'تعلم أساليب التعبير المهذبة وصياغة الحوارات البسيطة'
    ],
    suitableForEn: 'Children & young teens aged 6–14.',
    suitableForAr: 'الأطفال والفتيان والفتيات من 6 حتى 14 سنة.',
    formatEn: 'Small Interactive Group (90 min)',
    formatAr: 'مجموعات تفاعلية صغيرة (90 دقيقة)',
    durationEn: '6 Months per level',
    durationAr: '6 أشهر لكل مستوى',
    iconName: 'Sparkles',
    badgeEn: 'Kids Favorite',
    badgeAr: 'المفضل للأطفال'
  },
  {
    id: 'business-english',
    titleEn: 'Business & Professional English',
    titleAr: 'الإنجليزية المهنية وإدارة الأعمال',
    shortDescEn: 'Executive communication, email etiquette, negotiation, presentations, and interviews.',
    shortDescAr: 'التواصل التنفيذي، كتابة المراسلات الرسمية، التفاوض، والعروض التقديمية في بيئة الأعمال.',
    fullDescEn: 'Designed for ambitious professionals, corporate leaders, and job seekers. Master business terminology, diplomatic phrasing, pitch delivery, and cross-cultural business meetings.',
    fullDescAr: 'مصمم للمحترفين ورواد الأعمال والباحثين عن وظائف دولية. تعلم مصطلحات التجارة، أساليب الحوار الدبلوماسي، وإدارة الاجتماعات بثقة واقتدار.',
    objectivesEn: [
      'Write polished professional emails, reports, and proposals',
      'Deliver commanding boardroom presentations and product pitches',
      'Lead meetings and negotiations using diplomatic English vocabulary',
      'Ace international job interviews with structured behavioral answers'
    ],
    objectivesAr: [
      'صياغة الرسائل الإلكترونية والتقارير التنفيذية باحترافية',
      'تقديم العروض التقديمية أمام الإدارة والعملاء باقتدار',
      'إدارة الاجتماعات والتفاوض بلغة دبلوماسية دقيقة',
      'اجتياز مقابلات العمل الدولية بأساليب المقابلة الحديثة'
    ],
    suitableForEn: 'Executives, managers, entrepreneurs, and career climbers.',
    suitableForAr: 'المدراء، رواد الأعمال، والموظفون الطامحون للترقية.',
    formatEn: 'Executive Small Group (90 min)',
    formatAr: 'مجموعات مهنية متخصصة (90 دقيقة)',
    durationEn: 'Custom 2 to 6 months tracks',
    durationAr: 'مسارات مخصصة من شهرين إلى 6 أشهر',
    iconName: 'Briefcase',
    badgeEn: 'Executive',
    badgeAr: 'تنفيذي'
  },
  {
    id: 'small-group-courses',
    titleEn: 'Small Group Courses (A1–C2)',
    titleAr: 'دورات المجموعات الصغيرة (A1–C2)',
    shortDescEn: 'Collaborative, lively classes with 4–6 peer learners covering CEFR levels A1 through C2.',
    shortDescAr: 'فصول حيوية تفاعلية تضم 4 إلى 6 طلاب تغطي جميع المستويات من A1 حتى C2 لضمان التفاعل ومشاركة الجميع.',
    fullDescEn: 'Learn in an inspiring international group environment across CEFR levels A1 to C2. 90-minute extended sessions allowing every student ample speaking time, roleplays, and collaborative assignments.',
    fullDescAr: 'تعلم في بيئة جماعية ملهمة ومحفزة تغطي المستويات الأوروبية من A1 إلى C2. حصص ممتدة لمدة 90 دقيقة تمنح كل طالب وقتاً كافياً للمشاركة ولعب الأدوار والمنافسة الودية الإيجابية.',
    objectivesEn: [
      'Experience diverse international accents and communicative styles',
      'Practice dynamic team projects, group debates, and peer reviews',
      'Cost-effective monthly tuition with 90-minute deep-dive lessons',
      'Benefit from peer motivation and collaborative learning dynamics'
    ],
    objectivesAr: [
      'التعرض لمختلف اللهجات وأساليب التواصل الحوارية',
      'ممارسة المشاريع الجماعية والمناظرات والنقد الإيجابي البنّاء',
      'تكلفة اشتراك شهرية ميسرة مع حصة موسعة مدتها 90 دقيقة',
      'الاستفادة من طاقة المجموعة والتحفيز المتبادل بين الزملاء'
    ],
    suitableForEn: 'Learners seeking structured A1–C2 progression with interactive teamwork and discussion.',
    suitableForAr: 'المتعلمون الباحثون عن تدرج منهجي من A1 إلى C2 مع العمل الجماعي والنقاش التفاعلي.',
    formatEn: 'Small Groups of 4–6 students (90 min per lesson)',
    formatAr: 'مجموعات صغيرة من 4 إلى 6 طلاب (90 دقيقة لكل حصة)',
    durationEn: '6 Months per level (2 Months per stage)',
    durationAr: '6 أشهر لكل مستوى (شهران لكل مرحلة)',
    iconName: 'Users',
    badgeEn: 'Best Value',
    badgeAr: 'أفضل قيمة'
  },
  {
    id: 'teacher-training',
    titleEn: 'Teacher Training & TEFL',
    titleAr: 'تأهيل وتدريب معلمي الإنجليزية',
    shortDescEn: 'Advanced pedagogical methodology, lesson planning, and digital classroom mastery.',
    shortDescAr: 'منهجيات تدريس حديثة، تخطيط الدروس، وإدارة الفصول الرقمية باحترافية.',
    fullDescEn: 'A high-level professional certification course for current and aspiring English teachers. Master communicative language teaching (CLT), phonetics instruction, and student engagement.',
    fullDescAr: 'برنامج تدريبي احترافي للمعلمين والمعلمات الراغبين في الارتقاء بمهاراتهم. يغطي أحدث نظريات التدريس، الأنشطة التواصلية، وتوظيف التقنية التعليمية الحديثة.',
    objectivesEn: [
      'Master Communicative Language Teaching (CLT) and Task-Based Learning',
      'Design engaging lesson plans with measurable student outcomes',
      'Learn modern online classroom management and feedback strategies',
      'Receive official English Zone Teacher Diploma with verification ID'
    ],
    objectivesAr: [
      'إتقان أسلوب التدريس التواصلي (CLT) والتعلم القائم على المهام',
      'تصميم خطط دروس تفاعلية ذات أهداف تعليمية قابلة للقياس',
      'إدارة الفصول الافتراضية باحترافية وتطبيق أساليب التقييم البناء',
      'الحصول على شهادة معتمدة من أكاديمية English Zone برمز تحقق رسمي'
    ],
    suitableForEn: 'Aspiring and practicing teachers aiming for international standard accreditation.',
    suitableForAr: 'المعلمون الحاليون والجدد الراغبون في تطوير أدائهم المهني.',
    formatEn: 'Intensive Workshop Series & Practical Practicum (90 min)',
    formatAr: 'ورش تدريبية مكثفة وتطبيق عملي (90 دقيقة)',
    durationEn: '3-Month Comprehensive Program',
    durationAr: 'برنامج شامل لمدة 3 أشهر',
    iconName: 'GraduationCap',
    badgeEn: 'Professional',
    badgeAr: 'احترافي'
  }
];

export const CURRICULUM_PREVIEW: CurriculumStage[] = [
  {
    stageId: 'A1.1',
    level: 'A1',
    stageNameEn: 'Stage A1.1 — Foundations of Everyday Communication',
    stageNameAr: 'المرحلة A1.1 — أساسيات التواصل اليومي',
    monthsEn: 'Months 1–2',
    monthsAr: 'الشهران الأول والثاني',
    units: [
      {
        unitNumber: 1,
        titleEn: 'Hello & Welcome — Introductions & Identity',
        titleAr: 'مرحباً وأهلاً — التعريف بالنفس والهوية',
        grammarEn: 'Verb "to be" (affirmative, negative, questions), Subject pronouns, Possessive adjectives (my, your, his, her).',
        grammarAr: 'فعل الكينونة (to be) بالإثبات والنفي والسؤال، ضمائر الفاعل، وصفات الملكية.',
        vocabularyEn: 'Countries, nationalities, numbers 1–100, common greetings and polite farewells.',
        vocabularyAr: 'الدول والجنسيات، الأرقام 1-100، التحيات اليومية وعبارات الوداع المهذبة.',
        skillsEn: 'Spelling names, introducing yourself and peers, filling simple personal information forms.',
        skillsAr: 'تهجئة الأسماء، التعريف بالنفس والآخرين، ملء استمارات البيانات الشخصية.',
        speakingActivityEn: 'Live simulated international meet-and-greet session with classmates.',
        speakingActivityAr: 'جلسة محاكاة حية للتعارف الدولي بين الزملاء داخل الفصل.'
      },
      {
        unitNumber: 2,
        titleEn: 'My World — Everyday Objects & Surroundings',
        titleAr: 'عالمي المحيط — الأشياء اليومية والأماكن',
        grammarEn: 'Singular & plural nouns, Demonstratives (this, that, these, those), Articles (a, an, the).',
        grammarAr: 'الأسماء المفردة والجمع، أسماء الإشارة، وأدوات التعريف والتنكير.',
        vocabularyEn: 'Classroom items, tech devices, daily essentials, colors, personal possessions.',
        vocabularyAr: 'أدوات الدراسة، الأجهزة التقنية، الاحتياجات اليومية، الألوان، والمقتنيات.',
        skillsEn: 'Describing rooms, asking for and identifying lost objects, basic shopping questions.',
        skillsAr: 'وصف الغرف والأماكن، السؤال عن الأشياء والتعرف عليها، استفسارات الشراء البسيطة.',
        speakingActivityEn: '"Show and Tell": Present your favorite daily item in 2 minutes.',
        speakingActivityAr: 'نشاط "شارك وتحدث": تحدث عن غرضك اليومي المفضل في دقيقتين.'
      },
      {
        unitNumber: 3,
        titleEn: 'Daily Rhythms — Routines & Habits',
        titleAr: 'روتين الحياة — العادات والنشاطات اليومية',
        grammarEn: 'Present Simple with I, you, we, they; Adverbs of frequency (always, often, sometimes, never).',
        grammarAr: 'المضارع البسيط للضمائر الجمع والمفرد، وظروف التكرار (دائماً، غالباً، أحياناً).',
        vocabularyEn: 'Daily activities, telling time, days of the week, morning and evening routines.',
        vocabularyAr: 'الأنشطة اليومية، قراءة الساعة والوقت، أيام الأسبوع، والروتين الصباحي والمسائي.',
        skillsEn: 'Reading an authentic daily schedule, asking partners about daily habits.',
        skillsAr: 'قراءة جدول مواعيد يومي حقيقي، وسؤال الزملاء عن عاداتهم اليومية.',
        speakingActivityEn: 'Pair interview: Discover your partner’s ideal weekend and report to class.',
        speakingActivityAr: 'مقابلة ثنائية: اكتشف جدول نهاية الأسبوع المثالي لزميلك.'
      }
    ]
  },
  {
    stageId: 'A1.2',
    level: 'A1',
    stageNameEn: 'Stage A1.2 — Expanding Social & Family Circles',
    stageNameAr: 'المرحلة A1.2 — توسيع الدائرة الاجتماعية والعائلية',
    monthsEn: 'Months 3–4',
    monthsAr: 'الشهران الثالث والرابع',
    units: [
      {
        unitNumber: 4,
        titleEn: 'Family & Friends — People in Our Lives',
        titleAr: 'العائلة والأصدقاء — المقربون في حياتنا',
        grammarEn: 'Present Simple 3rd person (he, she, it) with -s/-es/-ies endings, Possessive ’s.',
        grammarAr: 'المضارع البسيط للغائب المفرد مع النهايات الصوتية، وإس الملكية.',
        vocabularyEn: 'Family tree relationships, physical appearance adjectives, personality traits.',
        vocabularyAr: 'شجرة العائلة والقرابة، صفات المظهر الخارجي، والسمات الشخصية الإيجابية.',
        skillsEn: 'Describing a family photo, talking about someone else’s life and work.',
        skillsAr: 'وصف صورة عائلية مفصلة، والتحدث عن مهنة وحياة شخص آخر.',
        speakingActivityEn: 'Family tree presentation using visual slides.',
        speakingActivityAr: 'تقديم شجرة العائلة والتحدث عن أفرادها بالإنجليزية.'
      },
      {
        unitNumber: 5,
        titleEn: 'Food, Market & Dining Out',
        titleAr: 'الطعام، التسوق، وطلب الوجبات في المطعم',
        grammarEn: 'Countable vs uncountable nouns, some/any, "Would like" for polite ordering.',
        grammarAr: 'الأسماء المعدودة وغير المعدودة، استخدامات some وany، وأسلوب الطلب المهذب.',
        vocabularyEn: 'Food, beverages, supermarket aisles, restaurant menu vocabulary, prices.',
        vocabularyAr: 'الأطعمة والمشروبات، أقسام المتجر، مفردات قائمة الطعام، والأسعار.',
        skillsEn: 'Reading cafe menus, ordering a meal politely, understanding receipts.',
        skillsAr: 'قراءة قائمة طعام في مطعم، طلب وجبة بأسلوب مهذب، وفهم الفاتورة.',
        speakingActivityEn: 'Interactive restaurant roleplay between waiter and customer.',
        speakingActivityAr: 'لعب أدوار واقعي بين النادل والزبون لطلب طعام واستفسار عن المكونات.'
      }
    ]
  },
  {
    stageId: 'B1.1',
    level: 'B1',
    stageNameEn: 'Stage B1.1 — Independent Communication & Storytelling',
    stageNameAr: 'المرحلة B1.1 — التواصل المستقل وسرد التجارب',
    monthsEn: 'Months 1–2',
    monthsAr: 'الشهران الأول والثاني',
    units: [
      {
        unitNumber: 1,
        titleEn: 'Life Experiences & Memories',
        titleAr: 'تجارب الحياة والذكريات المؤثرة',
        grammarEn: 'Present Perfect vs Past Simple; "Ever", "never", "already", "yet", "just".',
        grammarAr: 'المضارع التام مقارنة بالماضي البسيط، مع الكلمات الدالة والربط الزمني.',
        vocabularyEn: 'Adventure sports, bucket list achievements, travel milestones, emotional descriptors.',
        vocabularyAr: 'رياضات المغامرة، قائمة الإنجازات الحياتية، محطات السفر، وصف المشاعر.',
        skillsEn: 'Narrating life stories, asking detailed follow-up questions without script.',
        skillsAr: 'سرد قصص وتجارب شخصية، وطرح أسئلة تفصيلية عفوية دون نصوص مكتوبة.',
        speakingActivityEn: '"Two Truths and One Lie" about personal travel or adventures.',
        speakingActivityAr: 'لعبة "حقيقتان وكذبة" التفاعلية للتدريب على سرد التجارب وسرعة البديهة.'
      },
      {
        unitNumber: 2,
        titleEn: 'Future Horizons — Plans, Predictions & Goals',
        titleAr: 'آفاق المستقبل — الخطط والتوقعات والأهداف',
        grammarEn: 'Will vs Going to vs Present Continuous for future plans; First Conditional.',
        grammarAr: 'الفروق الدقيقة للتعبير عن المستقبل، والجملة الشرطية الأولى (First Conditional).',
        vocabularyEn: 'Career ambitions, emerging technologies, future lifestyles, weather conditions.',
        vocabularyAr: 'الطموحات المهنية، التقنيات الناشئة، أنماط الحياة المستقبلية، والأحوال الجوية.',
        skillsEn: 'Making conditional promises, predicting technological trends, negotiating plans.',
        skillsAr: 'تقديم وعود مشروطة، توقع اتجاهات التكنولوجيا، والتفاوض حول المواعيد والخطط.',
        speakingActivityEn: 'Pitching a personal project or business idea for 2030.',
        speakingActivityAr: 'عرض فكرة مشروع مستقبلي والتحدث عن مراحله ونتائجه المتوقعة.'
      }
    ]
  },
  {
    stageId: 'B2.1',
    level: 'B2',
    stageNameEn: 'Stage B2.1 — Academic & Workplace Precision',
    stageNameAr: 'المرحلة B2.1 — الدقة الأكاديمية والمهنية',
    monthsEn: 'Months 1–2',
    monthsAr: 'الشهران الأول والثاني',
    units: [
      {
        unitNumber: 1,
        titleEn: 'Global Perspectives & Media Literacy',
        titleAr: 'رؤى عالمية وتحليل المحتوى الإعلامي',
        grammarEn: 'Passive voice in all tenses; Impersonal reporting structures (It is said that...).',
        grammarAr: 'المبني للمجهول في جميع الأزمنة، وتراكيب النقل الإخباري المحايد.',
        vocabularyEn: 'Media terminology, fake news, journalistic ethics, global cultural phenomena.',
        vocabularyAr: 'مصطلحات الإعلام، الأخبار الزائفة، أخلاقيات الصحافة، والظواهر الثقافية العالمية.',
        skillsEn: 'Summarizing opinion articles, identifying media bias, arguing counter-points.',
        skillsAr: 'تلخيص مقالات الرأي، كشف الانحياز الإعلامي، وتفنيد الحجج المضادة بأسلوب أكاديمي.',
        speakingActivityEn: 'Formal Oxford-style debate on digital technology impact on youth.',
        speakingActivityAr: 'مناظرة رسمية بأسلوب أكسفورد حول أثر التكنولوجيا الرقمية على الشباب.'
      }
    ]
  }
];

export const PLACEMENT_TEST_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    level: 'A1',
    questionEn: 'Choose the correct form to complete: "Hello, my name _____ Sarah and I _____ from Canada."',
    questionAr: 'اختر الصيغة الصحيحة للإكمال: "Hello, my name _____ Sarah and I _____ from Canada."',
    options: [
      { textEn: 'is / am', textAr: 'is / am', isCorrect: true },
      { textEn: 'am / is', textAr: 'am / is', isCorrect: false },
      { textEn: 'are / are', textAr: 'are / are', isCorrect: false },
      { textEn: 'is / are', textAr: 'is / are', isCorrect: false }
    ],
    explanationEn: 'Use "is" with singular third-person (name is) and "am" with first-person pronoun "I".',
    explanationAr: 'نستخدم "is" مع الاسم المفرد الغائب (my name is) ونستخدم "am" مع ضمير المتكلم "I am".'
  },
  {
    id: 2,
    level: 'A1',
    questionEn: 'Complete the question: "_____ do you live?" — "I live in London."',
    questionAr: 'أكمل السؤال: "_____ do you live?" — "I live in London."',
    options: [
      { textEn: 'Where', textAr: 'Where (أين)', isCorrect: true },
      { textEn: 'What', textAr: 'What (ماذا)', isCorrect: false },
      { textEn: 'Who', textAr: 'Who (من)', isCorrect: false },
      { textEn: 'When', textAr: 'When (متى)', isCorrect: false }
    ],
    explanationEn: '"Where" asks for a place or location.',
    explanationAr: '"Where" هي أداة الاستفهام المخصصة للسؤال عن الأماكن والمواقع.'
  },
  {
    id: 3,
    level: 'A2',
    questionEn: 'Select the correct sentence for an action that happened yesterday:',
    questionAr: 'اختر الجملة الصحيحة لحدث وقع بالأمس:',
    options: [
      { textEn: 'She bought a new laptop yesterday.', textAr: 'She bought a new laptop yesterday.', isCorrect: true },
      { textEn: 'She buyed a new laptop yesterday.', textAr: 'She buyed a new laptop yesterday.', isCorrect: false },
      { textEn: 'She is buying a new laptop yesterday.', textAr: 'She is buying a new laptop yesterday.', isCorrect: false },
      { textEn: 'She buys a new laptop yesterday.', textAr: 'She buys a new laptop yesterday.', isCorrect: false }
    ],
    explanationEn: '"Buy" is an irregular verb; its simple past form is "bought".',
    explanationAr: 'الفعل "buy" غير قياسي وصيغة الماضي البسيط منه هي "bought".'
  },
  {
    id: 4,
    level: 'A2',
    questionEn: 'Choose the correct comparison: "This modern library is _____ than the old one."',
    questionAr: 'اختر صيغة المقارنة الصحيحة: "This modern library is _____ than the old one."',
    options: [
      { textEn: 'quieter', textAr: 'quieter', isCorrect: true },
      { textEn: 'more quietest', textAr: 'more quietest', isCorrect: false },
      { textEn: 'quietest', textAr: 'quietest', isCorrect: false },
      { textEn: 'as quiet', textAr: 'as quiet', isCorrect: false }
    ],
    explanationEn: 'For comparative statements with two items and the word "than", use "quieter".',
    explanationAr: 'عند المقارنة بين شيئين بوجود كلمة "than" نستخدم صيغة المقارنة "quieter".'
  },
  {
    id: 5,
    level: 'B1',
    questionEn: 'Choose the correct sentence: "I _____ in this city for five years, and I still love it."',
    questionAr: 'اختر الجملة الصحيحة: "I _____ in this city for five years, and I still love it."',
    options: [
      { textEn: 'have lived', textAr: 'have lived', isCorrect: true },
      { textEn: 'lived', textAr: 'lived', isCorrect: false },
      { textEn: 'am live', textAr: 'am live', isCorrect: false },
      { textEn: 'will lived', textAr: 'will lived', isCorrect: false }
    ],
    explanationEn: 'Present Perfect ("have lived") expresses an action that started in the past and continues into the present.',
    explanationAr: 'المضارع التام (have lived) يعبر عن حدث بدأ في الماضي وما زال مستمراً في الحاضر.'
  },
  {
    id: 6,
    level: 'B1',
    questionEn: 'Complete the First Conditional: "If you _____ hard, you _____ the exam."',
    questionAr: 'أكمل الجملة الشرطية: "If you _____ hard, you _____ the exam."',
    options: [
      { textEn: 'study / will pass', textAr: 'study / will pass', isCorrect: true },
      { textEn: 'will study / pass', textAr: 'will study / pass', isCorrect: false },
      { textEn: 'studied / will pass', textAr: 'studied / will pass', isCorrect: false },
      { textEn: 'study / passed', textAr: 'study / passed', isCorrect: false }
    ],
    explanationEn: 'First conditional structure: If + Present Simple, will + base verb.',
    explanationAr: 'قاعدة الشرط الأول: If + مضارع بسيط، ثم will + المصدر في جواب الشرط.'
  },
  {
    id: 7,
    level: 'B1',
    questionEn: 'Which word best fits? "She apologized _____ being late to the morning lecture."',
    questionAr: 'ما هو حرف الجر المناسب؟ "She apologized _____ being late to the morning lecture."',
    options: [
      { textEn: 'for', textAr: 'for', isCorrect: true },
      { textEn: 'about', textAr: 'about', isCorrect: false },
      { textEn: 'to', textAr: 'to', isCorrect: false },
      { textEn: 'with', textAr: 'with', isCorrect: false }
    ],
    explanationEn: 'The correct dependent preposition with "apologize [for doing something]" is "for".',
    explanationAr: 'حرف الجر المصاحب للفعل اعتذر عن فعل شيء هو "apologize for".'
  },
  {
    id: 8,
    level: 'B2',
    questionEn: 'Choose the most natural sentence: "By this time next year, our students _____ their course."',
    questionAr: 'اختر الجملة الأكثر دقة: "By this time next year, our students _____ their course."',
    options: [
      { textEn: 'will have completed', textAr: 'will have completed', isCorrect: true },
      { textEn: 'will complete', textAr: 'will complete', isCorrect: false },
      { textEn: 'have completed', textAr: 'have completed', isCorrect: false },
      { textEn: 'will be completing', textAr: 'will be completing', isCorrect: false }
    ],
    explanationEn: 'Future Perfect ("will have completed") indicates an action that will be finished before a specific future time.',
    explanationAr: 'المستقبل التام (will have completed) يعبر عن حدث سيكتمل بحلول نقطة زمنية محددة في المستقبل.'
  },
  {
    id: 9,
    level: 'B2',
    questionEn: 'Choose the passive equivalent: "The committee has approved the new curriculum."',
    questionAr: 'اختر صيغة المبني للمجهول الصحيحة: "The committee has approved the new curriculum."',
    options: [
      { textEn: 'The new curriculum has been approved by the committee.', textAr: 'The new curriculum has been approved by the committee.', isCorrect: true },
      { textEn: 'The new curriculum was approved by the committee.', textAr: 'The new curriculum was approved by the committee.', isCorrect: false },
      { textEn: 'The new curriculum is approved by the committee.', textAr: 'The new curriculum is approved by the committee.', isCorrect: false },
      { textEn: 'The new curriculum had been approved by the committee.', textAr: 'The new curriculum had been approved by the committee.', isCorrect: false }
    ],
    explanationEn: 'Present Perfect passive is formed with "has/have been + past participle".',
    explanationAr: 'المبني للمجهول في زمن المضارع التام يتكون من has/have been متبوعاً بالتصريف الثالث.'
  },
  {
    id: 10,
    level: 'B2',
    questionEn: 'Select the idiom meaning "to face a difficult situation with courage":',
    questionAr: 'اختر التعبير الاصطلاحي الذي يعني "مواجهة موقف صعب بشجاعة":',
    options: [
      { textEn: 'Bite the bullet', textAr: 'Bite the bullet', isCorrect: true },
      { textEn: 'Spill the beans', textAr: 'Spill the beans', isCorrect: false },
      { textEn: 'Break a leg', textAr: 'Break a leg', isCorrect: false },
      { textEn: 'Beat around the bush', textAr: 'Beat around the bush', isCorrect: false }
    ],
    explanationEn: '"Bite the bullet" means to endure a painful or unavoidable situation bravely.',
    explanationAr: 'المصطلح "Bite the bullet" يعني تحمّل أمر حتمي أو صعب بشجاعة وثبات.'
  },
  {
    id: 11,
    level: 'C1',
    questionEn: 'Select the correct inversion structure: "Seldom _____ such an articulate presentation."',
    questionAr: 'اختر التركيب البلاغي السليم: "Seldom _____ such an articulate presentation."',
    options: [
      { textEn: 'have I witnessed', textAr: 'have I witnessed', isCorrect: true },
      { textEn: 'I have witnessed', textAr: 'I have witnessed', isCorrect: false },
      { textEn: 'I witnessed', textAr: 'I witnessed', isCorrect: false },
      { textEn: 'witnessed I', textAr: 'witnessed I', isCorrect: false }
    ],
    explanationEn: 'Negative adverbs like "seldom" at the start of a clause require question-form auxiliary inversion ("have I witnessed").',
    explanationAr: 'عند بدء الجملة بظرف نفي مثل "seldom" يجب قلب الترتيب النحوي إلى صيغة تشبه السؤال (have I witnessed).'
  },
  {
    id: 12,
    level: 'C1',
    questionEn: 'Which word means "subtly expressive or containing multiple levels of meaning"?',
    questionAr: 'ما الكلمة التي تعني "ذو دلالات ومعانٍ دقيقة متعددة الطبقات"؟',
    options: [
      { textEn: 'Nuanced', textAr: 'Nuanced (دقيق / متعدد الأبعاد)', isCorrect: true },
      { textEn: 'Rudimentary', textAr: 'Rudimentary (بدائي)', isCorrect: false },
      { textEn: 'Superfluous', textAr: 'Superfluous (زائد عن الحاجة)', isCorrect: false },
      { textEn: 'Ambivalent', textAr: 'Ambivalent (متردد)', isCorrect: false }
    ],
    explanationEn: '"Nuanced" means characterized by subtle distinctions, variations, or deep layers of meaning.',
    explanationAr: '"Nuanced" تصف الكلام أو المعنى الدقيق الذي يحمل فروقاً وظلالاً دلالية عميقة.'
  },
  {
    id: 13,
    level: 'C1',
    questionEn: 'Select the correct conditional: "Had we known about the schedule change, we _____ earlier."',
    questionAr: 'اختر التكملة الشرطية الصحيحة: "Had we known about the schedule change, we _____ earlier."',
    options: [
      { textEn: 'would have arrived', textAr: 'would have arrived', isCorrect: true },
      { textEn: 'will arrive', textAr: 'will arrive', isCorrect: false },
      { textEn: 'would arrive', textAr: 'would arrive', isCorrect: false },
      { textEn: 'had arrived', textAr: 'had arrived', isCorrect: false }
    ],
    explanationEn: 'Inverted Third Conditional ("Had we known...") takes "would have + past participle" in the main clause.',
    explanationAr: 'الشرط الثالث المقلوب بلاغياً يأخذ في جواب الشرط صيغة would have متبوعة بالتصريف الثالث.'
  },
  {
    id: 14,
    level: 'C2',
    questionEn: 'Choose the word that best completes this formal sentence: "The keynote speaker spoke with great _____, captivating the diplomatic assembly."',
    questionAr: 'اختر الكلمة الأنسب لإتمام الجملة الرسمية: "The keynote speaker spoke with great _____, captivating the diplomatic assembly."',
    options: [
      { textEn: 'eloquence', textAr: 'eloquence (بلاغة وفصاحة)', isCorrect: true },
      { textEn: 'loquacity', textAr: 'loquacity (ثرثرة)', isCorrect: false },
      { textEn: 'prolixity', textAr: 'prolixity (إطناب ممل)', isCorrect: false },
      { textEn: 'hesitance', textAr: 'hesitance (تردد)', isCorrect: false }
    ],
    explanationEn: '"Eloquence" refers to fluent, forceful, and elegant speaking that inspires and persuades.',
    explanationAr: '"Eloquence" تعني الفصاحة والبلاغة وقوة التأثير في الحديث.'
  },
  {
    id: 15,
    level: 'C2',
    questionEn: 'Which phrase means "an essential condition or prerequisite without which something cannot happen"?',
    questionAr: 'ما هو التعبير الأكاديمي الذي يعني "شرط أساسي لا غنى عنه لتحقق الأمر"؟',
    options: [
      { textEn: 'Sine qua non', textAr: 'Sine qua non', isCorrect: true },
      { textEn: 'Ad hoc', textAr: 'Ad hoc', isCorrect: false },
      { textEn: 'Status quo', textAr: 'Status quo', isCorrect: false },
      { textEn: 'De facto', textAr: 'De facto', isCorrect: false }
    ],
    explanationEn: '"Sine qua non" is a widely recognized academic phrase meaning an indispensable requirement.',
    explanationAr: '"Sine qua non" مصطلح أكاديمي أصيل يعني الشرط الجوهري الأساسي الذي لا غنى عنه.'
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'how-to-think-in-english',
    titleEn: 'How to Stop Translating in Your Head and Think Directly in English',
    titleAr: 'كيف تتوقف عن الترجمة الذهنية وتبدأ التفكير مباشرة بالإنجليزية',
    excerptEn: 'Learn the exact cognitive techniques our students use to eliminate mental translation and achieve spontaneous conversation.',
    excerptAr: 'تعرف على التقنيات العقلية التطبيقية التي يعتمدها طلابنا للتخلص من الترجمة الذهنية والتحدث بعفوية.',
    categoryEn: 'Fluency & Speaking',
    categoryAr: 'الطلاقة والمحادثة',
    readTime: '5 min read',
    publishDate: 'November 2026',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    contentEn: 'Many English learners struggle because they form a sentence in their native language first, search for individual words, and then translate piece by piece. This creates awkward pauses and mental exhaustion. To overcome this, start by labeling objects around you directly in English, talk to yourself in 30-second bursts, and practice describing everyday actions as you perform them. In English Zone classes, our 100% immersive approach trains your brain to connect concepts directly with English words without intermediary translation.',
    contentAr: 'يواجه العديد من متعلمي اللغة الإنجليزية صعوبة ناتجة عن تكوين الجمل في لغتهم الأم أولاً ثم البحث عن المفردات وترجمتها كلمة بكلمة. هذا يولد توقفات محرجة وإرهاقاً ذهنياً مستمراً. للتغلب على ذلك، ابدأ بتسمية الأشياء المحيطة بك مباشرة بالإنجليزية، وتحدث مع نفسك لمدة 30 ثانية يومياً، ومارس وصف أفعالك اليومية أثناء قيامك بها. في فصول English Zone، تدرب منهجيتنا التفاعلية عقلك على ربط المفاهيم مباشرة بالمفردات الإنجليزية دون الحاجة لترجمة وسيطة.'
  },
  {
    id: 'cefr-levels-explained',
    titleEn: 'The CEFR Framework Explained: What Does A1 to C2 Really Mean for You?',
    titleAr: 'دليل مستويات CEFR الأوروبية: ماذا تعني المستويات من A1 إلى C2 لمستقبلك؟',
    excerptEn: 'A clear, breakdown of international English proficiency benchmarks and how long it takes to advance through each stage.',
    excerptAr: 'شرح مفصل ومبسط للمعايير الأوروبية المعتمدة لتحديد مستوى الإنجليزية والوقت اللازم للتنقل بين المراحل.',
    categoryEn: 'Academic Guide',
    categoryAr: 'دليل أكاديمي',
    readTime: '7 min read',
    publishDate: 'October 2026',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    contentEn: 'The Common European Framework of Reference for Languages (CEFR) is the worldwide gold standard for measuring language ability. At English Zone, each of the 6 main levels (A1 through C2) is structured into three distinct 2-month stages (e.g. A1.1, A1.2, A1.3). This gives learners tangible milestones every 8 weeks, ensuring steady progression and measurable results without overwhelming cognitive jumps.',
    contentAr: 'يعد الإطار الأوروبي المشترك للغات (CEFR) المعيار الدولي المعتمد عالمياً لقياس الكفاءة اللغوية. في أكاديمية English Zone، ينقسم كل مستوى من المستويات الستة الرئيسية (من A1 حتى C2) إلى ثلاث مراحل داخلية واضحة مدة كل منها شهران (مثل A1.1 ثم A1.2 ثم A1.3). يمنح هذا التقسيم الطلاب أهدافاً مرحلية محددة كل 8 أسابيع، مما يضمن تقدماً منتظماً وثابتاً ونتائج ملموسة دون أي قفزات مفاجئة.'
  },
  {
    id: 'mastering-business-emails',
    titleEn: '10 Essential Formulas for Professional Workplace English in 2026',
    titleAr: '10 معادلات ذهبية لكتابة المراسلات المهنية بالإنجليزية في عام 2026',
    excerptEn: 'Upgrade your corporate emails from awkward or overly formal to crisp, polite, and persuasive international communication.',
    excerptAr: 'ارتقِ بأسلوب مراسلاتك الوظيفية من الركاكة أو المبالغة إلى الدبلوماسية والوضوح والإقناع.',
    categoryEn: 'Business English',
    categoryAr: 'إنجليزية الأعمال',
    readTime: '6 min read',
    publishDate: 'September 2026',
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
    contentEn: 'Modern international business communication prioritizes clarity, conciseness, and warmth. Learn when to use "I would appreciate your insight on..." versus "Could you please send me...", how to politely follow up without sounding demanding, and how to frame constructive feedback using diplomatic softening language.',
    contentAr: 'يرتكز التواصل المهني الدولي الحديث على الوضوح والإيجاز والكياسة الدبلوماسية. تعلم متى تستخدم التعبيرات الاستشارية الراقية، وكيف تتابع المهام بلطف دون أن تبدو ملحاً، وصياغة الملاحظات البناءة بلغة دبلوماسية راقية تضمن التقدير والتعاون الإيجابي.'
  }
];

export const FAQ_LIST: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'general',
    questionEn: 'Are lessons at English Zone live or pre-recorded videos?',
    questionAr: 'هل الدروس في أكاديمية English Zone حية ومباشرة أم تسجيلات مسبقة؟',
    answerEn: 'All core lessons at English Zone are 100% LIVE interactive online classes with qualified instructors. You interact in real time, practice speaking, receive immediate pronunciation corrections, and collaborate with classmates.',
    answerAr: 'جميع الدروس الأساسية في English Zone هي حصص تفاعلية حية ومباشرة بنسبة 100% مع معلمين معتمدين، حيث تتحدث وتتفاعل صوتياً ومرئياً وتحصل على تصحيح فوري للنطق والأخطاء.'
  },
  {
    id: 'faq-2',
    category: 'format',
    questionEn: 'How are Small Group lessons structured?',
    questionAr: 'كيف يتم تنظيم حصص المجموعات الصغيرة؟',
    answerEn: 'Our A1–C2 group lessons last 90 minutes and feature small, interactive classes limited to 4 to 6 students, ensuring every learner receives generous speaking time, direct instructor guidance, and engaging collaborative activities.',
    answerAr: 'تمتد حصص المجموعات (من A1 حتى C2) لمدة 90 دقيقة كاملة وتضم من 4 إلى 6 طلاب فقط، مما يضمن لكل طالب وقتاً وافراً للتحدث وتصحيحاً مباشراً من المعلم وأنشطة حوارية تفاعلية.'
  },
  {
    id: 'faq-3',
    category: 'programs',
    questionEn: 'How are the CEFR levels and stages organized?',
    questionAr: 'كيف يتم تنظيم مستويات CEFR والمراحل الداخلية؟',
    answerEn: 'The academy provides 6 main levels: A1, A2, B1, B2, C1, and C2. Each main level takes 6 months to complete and is divided into three sequential 2-month stages (e.g. A1.1, A1.2, A1.3). Students enroll in a main level and advance through stages step-by-step.',
    answerAr: 'توفر الأكاديمية 6 مستويات رئيسية: A1 وA2 وB1 وB2 وC1 وC2. كل مستوى رئيسي يستغرق 6 أشهر وينقسم إلى 3 مراحل داخلية مدة كل منها شهران (مثل A1.1 ثم A1.2 ثم A1.3) مع تقييم مرحلي مستمر.'
  },
  {
    id: 'faq-4',
    category: 'pricing',
    questionEn: 'Do I have to pay for the entire 6 months in advance?',
    questionAr: 'هل يلزم دفع رسوم الـ 6 أشهر كاملة مقدماً؟',
    answerEn: 'No! Tuition for our A1–C2 group English program is paid month by month. You are never locked into a mandatory 6-month upfront commitment.',
    answerAr: 'كلا على الإطلاق! يتم سداد اشتراك برنامج اللغة الإنجليزية للمجموعات (A1–C2) شهرياً بشكل ميسر دون أي إلزام بالدفع لـ 6 أشهر مقدماً.'
  },
  {
    id: 'faq-5',
    category: 'tests',
    questionEn: 'How do I know which level to choose during registration?',
    questionAr: 'كيف أعرف المستوى المناسب لي عند التسجيل؟',
    answerEn: 'You can take our free online Placement Test on the website right now! It gives you an instant score and level recommendation. Alternatively, you can choose "Not sure — I need a placement test" during registration, and our academic team will evaluate you.',
    answerAr: 'يمكنك خوض اختبار تحديد المستوى التفاعلي المجاني على الموقع الآن لتحديد مستواك فوراً، أو اختيار خيار "لست متأكداً - أحتاج اختبار تحديد مستوى" في استمارة التسجيل وسيقوم فريقنا الأكاديمي بتقييمك.'
  },
  {
    id: 'faq-6',
    category: 'general',
    questionEn: 'Will I receive a verified certificate after completing a level?',
    questionAr: 'هل أحصل على شهادة معتمدة بعد إتمام المستوى بنجاح؟',
    answerEn: 'Yes. Upon successfully completing all stages of a CEFR level and passing the final assessment, you will receive an official English Zone International Certificate with a unique verification ID that can be verified online anytime.',
    answerAr: 'نعم بالتأكيد. عند إتمام مراحل المستوى واجتياز التقييم الأكاديمي النهائي، تصدر لك شهادة رسمية من أكاديمية English Zone تحمل رقم تحقق فريد يمكن التحقق من صحته عبر الموقع في أي وقت.'
  }
];

export const TESTIMONIALS_LIST = [
  {
    id: 'test-1',
    nameEn: 'Omar K.',
    nameAr: 'عمر ك.',
    roleEn: 'Software Engineer',
    roleAr: 'مهندس برمجيات',
    levelEn: 'Completed Level B2',
    levelAr: 'أتم المستوى B2',
    quoteEn: 'English Zone completely changed how I communicate with our international tech team. In just 4 months, my hesitation completely vanished.',
    quoteAr: 'أكاديمية English Zone غيرت طريقة تواصلي تماماً مع فريقي التقني الدولي. خلال 4 أشهر فقط اختفى التردد وأصبحت أتحدث بسلاسة تامة.',
    rating: 5
  },
  {
    id: 'test-2',
    nameEn: 'Mariam S.',
    nameAr: 'مريم س.',
    roleEn: 'Medical Student',
    roleAr: 'طالبة طب بشري',
    levelEn: 'Level C1 Student',
    levelAr: 'طالبة في المستوى C1',
    quoteEn: 'The interactive C1 group sessions are unmatched. Having 90 focused minutes with a dedicated instructor and peers gave me the exact vocabulary I needed for my medical thesis presentation.',
    quoteAr: 'جلسات المستوى C1 التفاعلية لا تقارن بأي تجربة سابقة. 90 دقيقة كاملة من التفاعل والحوار مع المعلم منحتني الحصيلة الدقيقة التي احتجتها لتقديم بحثي الطبي.',
    rating: 5
  },
  {
    id: 'test-3',
    nameEn: 'Zaid A.',
    nameAr: 'زيد ع.',
    roleEn: 'Marketing Specialist',
    roleAr: 'أخصائي تسويق رقمي',
    levelEn: 'Level B1 Student',
    levelAr: 'طالب في المستوى B1',
    quoteEn: 'The small group format is fun and dynamic. Practicing with peers from different countries makes learning English feel like a friendly social gathering.',
    quoteAr: 'مجموعات الدراسة الصغيرة حيوية جداً وممتعة. التحدث مع زملاء من دول مختلفة جعل تعلم الإنجليزية كأنه جلسة حوارية راقية بين أصدقاء.',
    rating: 5
  }
];
