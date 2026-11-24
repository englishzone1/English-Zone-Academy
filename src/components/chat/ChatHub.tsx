import React, { useEffect, useState } from 'react';
import { Users, UserRound } from 'lucide-react';
import { ChatThread } from './ChatThread';
import { groupService, StudyGroup, TeacherAccount } from '../../services/groupService';
import { groupThread, staffThread, chatService, ChatRole } from '../../services/chatService';

interface Props {
  me: { uid: string; name: string; role: ChatRole };
  isAr: boolean;
  initial?: string; // threadId to open first
}

// المحادثات: الإدارة ترى شات كل المجموعات والمحادثة الخاصة مع كل معلم،
// والمعلم يرى شات مجموعاته ومحادثته الخاصة مع الإدارة فقط
export const ChatHub: React.FC<Props> = ({ me, isAr, initial }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const admin = me.role === 'admin';
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [teachers, setTeachers] = useState<TeacherAccount[]>([]);
  const [active, setActive] = useState<string>(initial || '');

  useEffect(() => {
    (async () => {
      const g = admin ? await groupService.getGroups() : await groupService.getTeacherGroups(me.uid);
      setGroups(g);
      if (admin) {
        const t = await groupService.getTeachers().catch(() => []);
        setTeachers(t);
        // حذف رسائل المجموعات التي مضى عليها أسبوع
        g.forEach((x) => chatService.cleanup(groupThread(x.id)).catch(() => undefined));
      }
      if (!initial) setActive(admin ? (g[0] ? groupThread(g[0].id) : '') : staffThread(me.uid));
    })().catch((e) => console.error(e));
  }, [me.uid, admin]);

  const items: { id: string; label: string; icon: any }[] = [
    ...(!admin ? [{ id: staffThread(me.uid), label: tr('Private chat with the administration', 'محادثة خاصة مع الإدارة'), icon: UserRound }] : []),
    ...groups.map((g) => ({ id: groupThread(g.id), label: `${tr('Group chat', 'شات المجموعة')}: ${g.name}`, icon: Users })),
    ...(admin ? teachers.map((t) => ({ id: staffThread(t.id), label: `${tr('Private', 'خاصة')}: ${t.fullName || t.email}`, icon: UserRound })) : [])
  ];
  const cur = items.find((i) => i.id === active);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-200 shadow-sm p-3 space-y-1.5 max-h-[70vh] overflow-y-auto">
        {items.length === 0 && <p className="text-xs text-gray-400 p-4 text-center">{tr('No chats yet.', 'لا توجد محادثات بعد.')}</p>}
        {items.map((i) => (
          <button
            key={i.id}
            onClick={() => setActive(i.id)}
            className={`w-full text-start px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              active === i.id ? 'bg-[#061638] text-[#F3E5AB]' : 'bg-[#FAF8F5] text-[#061638] hover:bg-[#F3E5AB]/40'
            }`}
          >
            <i.icon className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
            <span className="truncate">{i.label}</span>
          </button>
        ))}
      </div>
      <div className="lg:col-span-8">
        {active ? (
          <ChatThread threadId={active} me={me} isAr={isAr} title={cur?.label} canDelete={admin} />
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center text-xs text-gray-400">{tr('Choose a chat.', 'يُرجى اختيار محادثة.')}</div>
        )}
      </div>
    </div>
  );
};
