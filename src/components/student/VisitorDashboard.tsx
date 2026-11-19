import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ReferralOffers } from './ReferralOffers';
import { BookOpen, Newspaper, GraduationCap, MessageCircle, LogOut, Gift, Target, Users, BadgePercent, Mic } from 'lucide-react';
import { CommunityFeed } from '../community/CommunityFeed';
import { CompleteProfile } from './CompleteProfile';
import { useAcademySettings } from '../../hooks/useAcademySettings';
import { studentHubService } from '../../services/studentHubService';
import { whatsappWithText } from '../../hooks/useAcademySettings';

interface Props {
  isAr: boolean;
  uid: string;
  name: string;
  whatsapp: string;
  navigate: (route: string) => void;
  onLogout: () => void;
}

// صفحة الحساب المجاني: الكتب والمجلة المفتوحة للمسجّلين، ودعوة للاشتراك
export const VisitorDashboard: React.FC<Props> = ({ isAr, uid, name, whatsapp, navigate, onLogout }) => {
  const { placementTestUrl } = useAcademySettings();
  const { user, updateProfile } = useAuth();
  const [ptLevel, setPtLevel] = useState<string>(((user as any)?.placementLevel as string) || '');
  const [ptSaved, setPtSaved] = useState('');
  const savePlacement = async (lvl: string) => {
    setPtLevel(lvl);
    setPtSaved('');
    try {
      await updateProfile({ placementLevel: lvl, placementAt: new Date().toISOString() } as any);
      setPtSaved(tr('Saved ✓', 'تم الحفظ ✓'));
    } catch {
      setPtSaved(tr('Could not save', 'تعذر الحفظ'));
    }
  };
  const [tab, setTab] = useState<'library' | 'community' | 'offers'>('library');
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentHubService
      .getMembersLibrary()
      .then(setItems)
      .catch((err) => console.error('Error loading members library:', err))
      .finally(() => setLoading(false));
  }, []);

  const mags = items.filter((b) => b.category === 'magazine');
  const books = items.filter((b) => b.category !== 'magazine');
  const title = (b: any) => (isAr ? b.titleAr : b.titleEn) || b.titleAr || b.titleEn;

  const row = (b: any, Icon: any) => (
    <div key={b.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {b.coverUrl ? (
          <img src={b.coverUrl} alt="" className="w-10 h-14 object-cover rounded-md border border-gray-200 shrink-0" />
        ) : (
          <Icon className="w-5 h-5 text-[#AA820A] mt-0.5 shrink-0" />
        )}
        <div>
          <span className="font-bold text-sm text-[#0A192F] block">{title(b)}</span>
          <span className="text-[11px] text-gray-500">{b.issue || (b.level && b.level !== 'All Levels' ? b.level : '')}</span>
          {b.description && <p className="text-xs text-gray-600 mt-1">{b.description}</p>}
        </div>
      </div>
      {b.downloadUrl && (
        <a href={b.downloadUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0A192F] text-[#F3E5AB] whitespace-nowrap">
          {tr('Open', 'فتح')}
        </a>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 px-4" dir={isAr ? 'rtl' : 'ltr'}>
      <CompleteProfile isAr={isAr} />
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-[#0A192F] to-[#102445] text-white rounded-3xl p-6 sm:p-8 border border-[#D4AF37]/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4AF37] text-[#0A192F] text-[11px] font-bold">
              <Gift className="w-3.5 h-3.5" />
              {tr('Free account', 'حساب مجاني')}
            </span>
            <h1 className="font-serif-luxury font-bold text-2xl text-[#F3E5AB]">
              {tr(`Welcome, ${name}`, `أهلًا {بك|بكِ} يا ${name}`)} 🌟
            </h1>
            <p className="text-sm text-gray-300">{tr('Here are the free books and materials for members.', 'هنا الكتب والمواد المجانية المفتوحة {لك|لكِ}.')}</p>
          </div>
          <div className="flex gap-2 self-start">
          <button onClick={() => navigate('avatar-studio')} className="px-3 py-2 rounded-xl bg-[#D4AF37] text-[#0A192F] text-xs font-bold">
            {tr('My avatar', 'الأفاتار الخاص بي')}
          </button>
          <button onClick={onLogout} className="px-3 py-2 rounded-xl border border-white/20 text-xs font-bold flex items-center gap-1.5">
            <LogOut className="w-4 h-4" />
            {tr('Sign out', 'خروج')}
          </button>
          </div>
        </div>

        {/* زر الاشتراك الكبير المضيء */}
        <button
          onClick={() => navigate('register')}
          className="relative w-full rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] shadow-[0_0_35px_rgba(212,175,55,0.65)] animate-pulse hover:animate-none hover:scale-[1.01] transition-transform text-center"
        >
          <span className="flex items-center justify-center gap-3 font-serif-luxury font-bold text-2xl sm:text-3xl">
            <GraduationCap className="w-8 h-8" />
            {tr('To subscribe to the course, tap here', 'للاشتراك في الكورس {اضغط|اضغطي} هنا')}
          </span>
          <span className="block mt-2 text-xs sm:text-sm font-semibold opacity-80">
            {tr('Live small-group classes with a female teacher • monthly payment', 'حصص مباشرة في مجموعات صغيرة مع معلمة • الدفع شهريًا')}
          </span>
        </button>

        {/* الغرف الصوتية المجانية */}
        <button
          onClick={() => navigate('rooms')}
          className="w-full p-5 rounded-3xl bg-white border-2 border-[#D4AF37] flex items-center gap-4 text-start hover:shadow-md transition-shadow"
        >
          <span className="w-12 h-12 rounded-full bg-[#0A192F] text-[#F3E5AB] flex items-center justify-center shrink-0">
            <Mic className="w-6 h-6" />
          </span>
          <span>
            <span className="block font-bold text-[#0A192F] text-base">{tr('Voice rooms — free', 'الغرف الصوتية — مجانًا')}</span>
            <span className="block text-xs text-gray-600">
              {tr('Practise speaking English live with other learners.', '{تدرّب|تدرّبي} على المحادثة بالإنجليزية مباشرة مع متعلمين آخرين.')}
            </span>
          </span>
        </button>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {placementTestUrl ? (
            <a href={placementTestUrl} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-white border border-gray-200 flex items-center gap-3 text-sm font-bold text-[#0A192F] hover:border-[#D4AF37]">
              <Target className="w-6 h-6 text-[#D4AF37]" />
              {tr('Free placement test', '{اختبر|اختبري} {مستواك|مستواكِ} مجانًا')}
            </a>
          ) : null}
          <button onClick={() => setTab('community')} className="p-4 rounded-2xl bg-white border border-gray-200 flex items-center gap-3 text-sm font-bold text-[#0A192F] hover:border-[#D4AF37] text-start">
            <Users className="w-6 h-6 text-[#D4AF37]" />
            {tr('English Zone community', 'مجتمع English Zone')}
          </button>
          <button onClick={() => navigate('blog')} className="p-4 rounded-2xl bg-white border border-gray-200 flex items-center gap-3 text-sm font-bold text-[#0A192F] hover:border-[#D4AF37] text-start">
            <BookOpen className="w-6 h-6 text-[#D4AF37]" />
            {tr('Academy blog', 'مدونة الأكاديمية')}
          </button>
          <button
            onClick={() => {
              setTab('offers');
              setTimeout(() => document.getElementById('ez-visitor-offers')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
            }}
            className="ez-float-glow p-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] border border-[#D4AF37] flex items-center gap-3 text-sm font-bold text-[#0A192F] text-start"
          >
            <BadgePercent className="w-6 h-6 text-[#0A192F]" />
            {tr('🎁 Offers — invite & earn', '🎁 العروض: {ادعُ|ادعي} {واربح|واربحي}')}
          </button>
        </div>

        {/* نتيجة اختبار تحديد المستوى */}
        <div className="bg-white rounded-3xl p-5 border border-[#D4AF37]/40 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-[#0A192F] flex items-center gap-2">
                <Target className="w-5 h-5 text-[#D4AF37]" />
                {tr('Your free placement test', 'اختبار تحديد المستوى المجاني')}
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                {tr('Take the test, then choose your result here so the academy knows your level.', '{ادخل|ادخلي} الاختبار، ثم {اختر|اختاري} {نتيجتك|نتيجتكِ} هنا لتعرف الأكاديمية {مستواك|مستواكِ}.')}
              </p>
            </div>
            {placementTestUrl && (
              <a href={placementTestUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-xs font-bold">
                {tr('Start the test', '{ابدأ|ابدئي} الاختبار')}
              </a>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#0A192F]">{tr('My result:', 'نتيجتي:')}</span>
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => (
              <button
                key={l}
                onClick={() => savePlacement(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${ptLevel === l ? 'bg-[#D4AF37] text-[#0A192F] border-[#D4AF37]' : 'bg-white text-gray-600 border-gray-200'}`}
              >
                {l}
              </button>
            ))}
            {ptSaved && <span className="text-[11px] text-emerald-700">{ptSaved}</span>}
          </div>
        </div>

        <div className={`bg-white rounded-3xl p-5 border border-gray-200 shadow-sm flex-col sm:flex-row sm:items-center justify-between gap-4 ${whatsapp ? 'flex' : 'hidden'}`}>
          <div>
            <h2 className="font-bold text-[#0A192F] flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
              {tr('A question before subscribing?', '{عندك|عندكِ} سؤال قبل الاشتراك؟')}
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              {tr(
                'Live small-group classes, interactive homework and monthly reports.',
                'حصص مباشرة في مجموعات صغيرة، وواجبات تفاعلية، وتقرير شهري بمستواك.'
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {whatsapp && (
              <a
                href={whatsappWithText(whatsapp, isAr ? `مرحبًا English Zone، أنا ${name} ولدي حساب مجاني، أريد معرفة المزيد عن الاشتراك.` : `Hello English Zone, I'm ${name} with a free account. I'd like to know more about enrolling.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                {tr('Ask on WhatsApp', '{اسأل|اسألي} على واتساب')}
              </a>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {(['library', 'community'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-4 py-2 rounded-xl text-xs font-bold ${tab === k ? 'bg-[#0A192F] text-[#F3E5AB]' : 'bg-white border border-gray-200 text-gray-600'}`}
            >
              {k === 'library' ? tr('Books & magazine', 'الكتب والمجلة') : tr('Community', 'المجتمع')}
            </button>
          ))}
        </div>

        {tab === 'offers' && (
          <div id="ez-visitor-offers" className="scroll-mt-4">
            <ReferralOffers uid={uid} isAr={isAr} active={false} onSubscribe={() => navigate('register')} />
          </div>
        )}
        {tab === 'community' && <CommunityFeed uid={uid} name={name} role="student" isAr={isAr} readOnly />}

        <div className={`bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4 ${tab === 'library' ? '' : 'hidden'}`}>
          {loading ? (
            <p className="text-xs text-gray-500 text-center py-6">{tr('Loading...', 'جارٍ التحميل...')}</p>
          ) : items.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">{tr('New free materials are coming soon.', 'مواد مجانية جديدة قريبًا.')}</p>
          ) : (
            <>
              {mags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-bold text-[#0A192F] flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-[#D4AF37]" />
                    {tr('Academy Magazine', 'مجلة الأكاديمية')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{mags.map((b) => row(b, Newspaper))}</div>
                </div>
              )}
              {books.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-bold text-[#0A192F] flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#D4AF37]" />
                    {tr('Library', 'المكتبة')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{books.map((b) => row(b, BookOpen))}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
