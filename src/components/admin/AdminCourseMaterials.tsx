import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2, BookOpen, Headphones, PlayCircle, Link as LinkIcon } from 'lucide-react';
import { studentHubService, CourseMaterials, MaterialLink, MaterialType, isSafeUrl } from '../../services/studentHubService';
import type { DynamicCourseItem } from '../../services/contentManagementService';

interface Props {
  courses: DynamicCourseItem[];
  isAr: boolean;
  onNotice: (message: string) => void;
}

const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white';
const TYPES: { id: MaterialType; ar: string; en: string; icon: any }[] = [
  { id: 'book', ar: 'كتاب PDF', en: 'PDF book', icon: BookOpen },
  { id: 'audio', ar: 'ملفات صوتية', en: 'Audio', icon: Headphones },
  { id: 'video', ar: 'فيديو', en: 'Video', icon: PlayCircle },
  { id: 'other', ar: 'رابط آخر', en: 'Other link', icon: LinkIcon }
];

// روابط المنهج (كتاب، صوت، فيديو على درايف) التي يراها طلاب نفس المستوى في لوحتهم
export const AdminCourseMaterials: React.FC<Props> = ({ courses, isAr, onNotice }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [materials, setMaterials] = useState<Record<string, MaterialLink[]>>({});
  const [drafts, setDrafts] = useState<Record<string, { label: string; url: string; type: MaterialType }>>({});
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    studentHubService
      .getAllMaterials()
      .then((list: CourseMaterials[]) => setMaterials(Object.fromEntries(list.map((m) => [m.courseId, m.links || []]))))
      .catch((err) => console.error(err));
  }, []);

  const save = async (c: DynamicCourseItem, links: MaterialLink[]) => {
    setBusy(c.id);
    try {
      await studentHubService.saveMaterials({
        courseId: c.id,
        courseTitleAr: c.titleAr,
        courseTitleEn: c.titleEn,
        level: c.level,
        links
      });
      setMaterials((prev) => ({ ...prev, [c.id]: links }));
      onNotice(tr('Links saved.', 'تم حفظ الروابط.'));
    } catch (err: any) {
      console.error(err);
      onNotice(`${tr('Save failed:', 'تعذر الحفظ:')} ${err?.code || ''}`);
    } finally {
      setBusy(null);
    }
  };

  const addLink = (c: DynamicCourseItem) => {
    const d = drafts[c.id] || { label: '', url: '', type: 'book' as MaterialType };
    if (!d.label.trim() || !isSafeUrl(d.url)) {
      onNotice(tr('Write a name and a link starting with https://', 'اكتب اسم الرابط ورابطًا يبدأ بـ https://'));
      return;
    }
    const links = [...(materials[c.id] || []), { label: d.label.trim(), url: d.url.trim(), type: d.type }];
    setDrafts((prev) => ({ ...prev, [c.id]: { label: '', url: '', type: d.type } }));
    save(c, links);
  };

  if (courses.length === 0) return null;

  return (
    <div className="space-y-3">
      <div>
        <span className="text-xs font-bold text-gray-700">{tr('Curriculum links for students', 'روابط المناهج للطلاب')}</span>
        <p className="text-[11px] text-gray-500">
          {tr(
            'Students see these links in their dashboard (Curriculum tab) when the course level matches their level. Use Google Drive links shared as "Anyone with the link".',
            'يرى الطلاب هذه الروابط في لوحتهم (تبويب المنهج) إذا كان مستوى المنهج هو مستواهم. استعمل روابط درايف بمشاركة "أي شخص لديه الرابط".'
          )}
        </p>
      </div>
      {courses.map((c) => {
        const links = materials[c.id] || [];
        const d = drafts[c.id] || { label: '', url: '', type: 'book' as MaterialType };
        const setD = (patch: Partial<typeof d>) => setDrafts((prev) => ({ ...prev, [c.id]: { ...d, ...patch } }));
        return (
          <div key={c.id} className="p-4 rounded-xl border border-gray-200 bg-white space-y-3">
            <span className="font-bold text-xs text-[#061638]">
              {(isAr ? c.titleAr : c.titleEn) || c.titleAr} • {c.level}
            </span>
            {links.length > 0 && (
              <div className="space-y-1">
                {links.map((l, i) => {
                  const Icon = TYPES.find((t) => t.id === l.type)?.icon || LinkIcon;
                  return (
                    <div key={i} className="flex items-center justify-between gap-2 text-[11px] px-3 py-1.5 rounded-lg bg-[#FAF8F5]">
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#061638] underline">
                        <Icon className="w-3.5 h-3.5 text-[#AA820A]" />
                        {l.label}
                      </a>
                      <button
                        onClick={() => save(c, links.filter((_, j) => j !== i))}
                        disabled={busy === c.id}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <select value={d.type} onChange={(e) => setD({ type: e.target.value as MaterialType })} className={inputCls}>
                {TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {isAr ? t.ar : t.en}
                  </option>
                ))}
              </select>
              <input value={d.label} onChange={(e) => setD({ label: e.target.value })} placeholder={tr('Name (e.g. Student Book)', 'الاسم (مثل كتاب الطالب)')} className={inputCls} />
              <input value={d.url} dir="ltr" onChange={(e) => setD({ url: e.target.value })} placeholder="https://drive.google.com/..." className={`${inputCls} font-mono`} />
              <button
                onClick={() => addLink(c)}
                disabled={busy === c.id}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-[#061638] text-[#F3E5AB] flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {busy === c.id ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4 text-[#D4AF37]" />}
                <span>{tr('Add link', 'إضافة رابط')}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
