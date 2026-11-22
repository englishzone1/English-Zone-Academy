import React, { useEffect, useState } from 'react';
import { UserMinus, Info, MessageSquare, Users, UserPlus, X } from 'lucide-react';
import { collection, getDocs, query, where, updateDoc, doc, deleteField } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { staffThread } from '../../services/chatService';
import { TeacherProfileEditor } from '../teacher/TeacherProfileEditor';
import { useLanguage } from '../../context/LanguageContext';
import { groupService, TeacherAccount, StudyGroup } from '../../services/groupService';

interface Props {
  onNotice: (message: string) => void;
  onOpenChat?: (threadId: string) => void;
}

interface StudentLite {
  id: string;
  fullName: string;
  email: string;
  teacherId?: string;
  teacherManual?: boolean;
  groupId?: string;
}

// المعلمون: لهم صلاحيات محدودة على طلاب مجموعاتهم فقط
export const AdminTeachersManager: React.FC<Props> = ({ onNotice, onOpenChat }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [teachers, setTeachers] = useState<TeacherAccount[]>([]);
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentLite[]>([]);
  const [pick, setPick] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [t, g, us] = await Promise.all([
        groupService.getTeachers(),
        groupService.getGroups(),
        getDocs(query(collection(db, 'users'), where('role', '==', 'student')))
      ]);
      setTeachers(t);
      setGroups(g);
      setStudents(
        us.docs
          .map((d) => ({ ...(d.data() as any), id: d.id } as StudentLite))
          .sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''))
      );
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

  const act = async (fn: () => Promise<void>, okAr: string, okEn: string) => {
    setBusy(true);
    try {
      await fn();
      onNotice(tr(okEn, okAr));
      await load();
    } catch (err: any) {
      onNotice(`${tr('Failed:', 'تعذر:')} ${err?.code || err?.message || ''}`);
    } finally {
      setBusy(false);
    }
  };

  // إسناد مجموعة للمعلم أو إزالتها: يرى المعلم طلاب مجموعاته فقط
  const toggleGroup = (t: TeacherAccount, g: StudyGroup) => {
    const mine = g.teacherId === t.id;
    act(
      async () => {
        await groupService.saveGroup({ ...g, teacherId: mine ? '' : t.id, teacherName: mine ? '' : t.fullName || '' });
        await groupService.syncAllMembers();
      },
      mine ? 'أُزيلت المجموعة من المعلم.' : 'أُسندت المجموعة للمعلم.',
      mine ? 'Group removed from the teacher.' : 'Group assigned to the teacher.'
    );
  };

  // إسناد طالب بعينه للمعلم (خارج المجموعة)
  const addStudent = (t: TeacherAccount) => {
    const sid = pick[t.id];
    if (!sid) return;
    act(
      async () => {
        await updateDoc(doc(db, 'users', sid), {
          teacherId: t.id,
          teacherManual: true,
          assignedTeacherName: t.fullName || deleteField(),
          assignedTeacherEmail: t.email || deleteField(),
          updatedAt: new Date().toISOString()
        });
        await groupService.syncMember(sid).catch(() => undefined);
        setPick((p) => ({ ...p, [t.id]: '' }));
      },
      'أُسند الطالب للمعلم.',
      'Student assigned to the teacher.'
    );
  };

  const removeStudent = (s: StudentLite) =>
    act(
      async () => {
        await updateDoc(doc(db, 'users', s.id), {
          teacherId: deleteField(),
          teacherManual: deleteField(),
          assignedTeacherName: deleteField(),
          assignedTeacherEmail: deleteField(),
          updatedAt: new Date().toISOString()
        });
        // يعود للطالب معلم مجموعته إن وُجد
        await groupService.syncMember(s.id).catch(() => undefined);
      },
      'أُزيل الطالب من المعلم.',
      'Student removed from the teacher.'
    );

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
          <li>{tr('Below, under the teacher, tick their groups or add individual students. The teacher sees only those.', 'من هنا تحت اسم المعلم: اختاري مجموعاته أو أضيفي له طلابًا بعينهم، ولا يرى إلا من أُسند إليه.')}</li>
        </ol>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500">{tr('Loading...', 'جارٍ التحميل...')}</div>
      ) : teachers.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-500 bg-[#FAF8F5] rounded-2xl">{tr('No teachers yet.', 'لا يوجد معلمون بعد.')}</div>
      ) : (
        <div className="space-y-3">
          {teachers.map((t) => {
            const direct = students.filter((x) => x.teacherId === t.id && x.teacherManual);
            const viaGroups = students.filter((x) => x.teacherId === t.id && !x.teacherManual).length;
            const options = students.filter((x) => x.teacherId !== t.id);
            return (
              <div key={t.id} className="p-4 rounded-2xl border border-gray-200 bg-[#FAF8F5] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-sm text-[#0A192F] block">{t.fullName || '—'}</span>
                    <span className="text-[11px] text-gray-500 break-all">{t.email}</span>
                    <span className="text-[11px] text-gray-600 block mt-0.5">
                      {tr('Students seen by this teacher:', 'عدد الطلاب الذين يراهم:')} {direct.length + viaGroups}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 self-start">
                    <button
                      onClick={() => setEditing(editing === t.id ? null : t.id)}
                      className="px-3 py-2 rounded-lg text-xs font-bold bg-[#D4AF37] text-[#0A192F]"
                    >
                      {editing === t.id ? tr('Close editing', 'إغلاق التعديل') : tr('Edit data & photo', 'تعديل البيانات والصورة')}
                    </button>
                    {onOpenChat && (
                      <button onClick={() => onOpenChat(staffThread(t.id))} className="px-3 py-2 rounded-lg text-xs font-bold bg-[#0A192F] text-[#F3E5AB] flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4" />
                        {tr('Private chat', 'محادثة خاصة')}
                      </button>
                    )}
                    <button onClick={() => remove(t)} className="px-3 py-2 rounded-lg text-xs font-bold border border-red-200 text-red-700 bg-white flex items-center gap-1.5">
                      <UserMinus className="w-4 h-4" />
                      {tr('Remove teacher access', 'إلغاء صلاحية المعلم')}
                    </button>
                  </div>
                </div>

                {editing === t.id && (
                  <div className="p-4 rounded-2xl bg-white border border-[#D4AF37]/40">
                    <TeacherProfileEditor teacherId={t.id} isAr={isAr} mode="admin" onNotice={onNotice} onSaved={load} />
                  </div>
                )}

                <div>
                  <div className="text-xs font-bold text-[#0A192F] mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#AA820A]" />
                    {tr('Groups', 'المجموعات')}
                  </div>
                  {groups.length === 0 ? (
                    <p className="text-[11px] text-gray-400">{tr('No groups yet (create them in Stars Ledger > Manage groups).', 'لا توجد مجموعات بعد (تُنشأ من سجل النجوم ← إدارة المجموعات).')}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {groups.map((g) => {
                        const mine = g.teacherId === t.id;
                        const other = !mine && g.teacherId ? teachers.find((x) => x.id === g.teacherId)?.fullName : '';
                        return (
                          <button
                            key={g.id}
                            disabled={busy}
                            onClick={() => toggleGroup(t, g)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all disabled:opacity-50 ${
                              mine ? 'bg-[#0A192F] text-[#F3E5AB] border-[#0A192F]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#D4AF37]'
                            }`}
                            title={other ? tr(`Currently with ${other}`, `حاليًا مع ${other}`) : ''}
                          >
                            {mine ? '✓ ' : ''}
                            {g.name}
                            {other ? <span className="opacity-60"> ({other})</span> : null}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold text-[#0A192F] mb-2 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-[#AA820A]" />
                    {tr('Individual students', 'طلاب مُسندون مباشرة')}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {direct.length === 0 && <span className="text-[11px] text-gray-400">{tr('None yet.', 'لا يوجد بعد.')}</span>}
                    {direct.map((x) => (
                      <span key={x.id} className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-white border border-[#D4AF37]/50 text-[#0A192F] flex items-center gap-1.5">
                        {x.fullName || x.email}
                        <button onClick={() => removeStudent(x)} disabled={busy} className="text-gray-400 hover:text-red-600" title={tr('Remove', 'إزالة')}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={pick[t.id] || ''}
                      onChange={(e) => setPick((p) => ({ ...p, [t.id]: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                    >
                      <option value="">{tr('Choose a student…', 'اختيار طالب…')}</option>
                      {options.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.fullName || x.email}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => addStudent(t)} disabled={busy || !pick[t.id]} className="px-4 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] text-[#0A192F] disabled:opacity-50">
                      {tr('Add', 'إضافة')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
