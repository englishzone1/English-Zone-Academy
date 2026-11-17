import React, { useEffect, useState } from 'react';
import { UserMinus, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { groupService, TeacherAccount, StudyGroup } from '../../services/groupService';

interface Props {
  onNotice: (message: string) => void;
}

// المعلمون: لهم صلاحيات محدودة على طلاب مجموعاتهم فقط
export const AdminTeachersManager: React.FC<Props> = ({ onNotice }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [teachers, setTeachers] = useState<TeacherAccount[]>([]);
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [t, g] = await Promise.all([groupService.getTeachers(), groupService.getGroups()]);
      setTeachers(t);
      setGroups(g);
    } catch (err: any) {
      onNotice(`${tr('Could not load teachers:', 'تعذر تحميل المعلمين:')} ${err?.code || ''}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (t: TeacherAccount) => {
    if (!window.confirm(tr(`Remove teacher access for ${t.fullName}?`, `إلغاء صلاحية المعلم ${t.fullName}؟ سيعود حسابه حساب طالب.`))) return;
    try {
      await groupService.removeTeacher(t.id);
      onNotice(tr('Teacher access removed.', 'تم إلغاء صلاحية المعلم.'));
      await load();
      groupService.syncAllMembers().catch(() => undefined);
    } catch (err: any) {
      onNotice(`${tr('Failed:', 'تعذر:')} ${err?.code || ''}`);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
      <div>
        <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F]">{tr('Teachers', 'المعلمون')}</h2>
        <p className="text-xs text-gray-500">
          {tr(
            'Teachers see only the students of their groups: they give stars and ratings, record grades, homework and attendance, and reply to their students’ messages.',
            'يرى المعلم طلاب مجموعاته فقط: يمنحهم النجوم والتقييمات، ويسجل الدرجات والواجبات والحضور، ويرد على رسائلهم.'
          )}
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#D4AF37]/40 text-xs text-gray-700 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-[#0A192F]">
          <Info className="w-4 h-4 text-[#AA820A]" />
          {tr('How to add a teacher', 'طريقة إضافة معلم')}
        </div>
        <ol className="list-decimal ps-5 space-y-1">
          <li>{tr('The teacher creates an account on the site (email or Google).', 'ينشئ المعلم حسابًا في الموقع بالبريد أو بجوجل.')}</li>
          <li>{tr('Open the Students tab, find the account, press Manage, then "Make this account a teacher".', 'افتح تبويب الطلاب، وابحث عن حسابه، واضغط إدارة، ثم "تعيين هذا الحساب كمعلم".')}</li>
          <li>{tr('In Stars Ledger > Manage groups, choose this teacher for their groups.', 'من سجل النجوم ثم إدارة المجموعات، اختر هذا المعلم لمجموعاته.')}</li>
        </ol>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500">{tr('Loading...', 'جارٍ التحميل...')}</div>
      ) : teachers.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-500 bg-[#FAF8F5] rounded-2xl">{tr('No teachers yet.', 'لا يوجد معلمون بعد.')}</div>
      ) : (
        <div className="space-y-3">
          {teachers.map((t) => {
            const own = groups.filter((g) => g.teacherId === t.id);
            return (
              <div key={t.id} className="p-4 rounded-xl border border-gray-200 bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-sm text-[#0A192F] block">{t.fullName || '—'}</span>
                  <span className="text-[11px] text-gray-500 break-all">{t.email}</span>
                  <div className="text-[11px] text-gray-600 mt-1">
                    {own.length ? own.map((g) => g.name).join('، ') : tr('No groups assigned yet', 'لم تُسند له مجموعات بعد')}
                  </div>
                </div>
                <button onClick={() => remove(t)} className="px-3 py-2 rounded-lg text-xs font-bold border border-red-200 text-red-700 bg-white flex items-center gap-1.5 self-start">
                  <UserMinus className="w-4 h-4" />
                  {tr('Remove teacher access', 'إلغاء صلاحية المعلم')}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
