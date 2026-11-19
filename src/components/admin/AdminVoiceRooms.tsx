import React, { useEffect, useState } from 'react';
import { Flag, Trash2, ExternalLink } from 'lucide-react';
import { VoiceRoomsPage } from '../../pages/VoiceRoomsPage';
import { deleteReport, watchReports } from '../../services/voiceRooms';
import { loadTurn, saveTurn } from '../../services/voiceP2P';

// تبويب الإدارة: كل الغرف (مع الخاصة وغرف البنات) والبلاغات
export const AdminVoiceRooms: React.FC<{ isAr: boolean; navigate: (r: string) => void }> = ({ isAr, navigate }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [reports, setReports] = useState<any[]>([]);
  useEffect(() => watchReports(setReports), []);
  const [turn, setTurn] = useState({ server: 'relay1.expressturn.com', username: '', credential: '' });
  const [turnMsg, setTurnMsg] = useState('');
  useEffect(() => {
    loadTurn().then((t) => t && setTurn({ server: t.server || 'relay1.expressturn.com', username: t.username || '', credential: t.credential || '' }));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-gray-200 p-5 space-y-3">
        <h3 className="font-bold text-[#0A192F]">{tr('Connection server (TURN) — free', 'خادم الاتصال (TURN) — مجاني')}</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          {tr(
            'Lets voice pass when a network or VPN blocks direct calls. Create a free account at expressturn.com (1 TB/month, no card) and paste the server, username and password here.',
            'يمرّر الصوت حين تمنع الشبكة أو الـ VPN الاتصال المباشر. أنشئي حسابًا مجانيًا في expressturn.com (‏1 تيرابايت شهريًا بلا بطاقة) والصقي هنا اسم الخادم واسم المستخدم وكلمة المرور.'
          )}
        </p>
        <div className="grid sm:grid-cols-3 gap-2">
          <input value={turn.server} onChange={(e) => setTurn({ ...turn, server: e.target.value.trim() })} placeholder="relay1.expressturn.com" className="px-3 py-2 rounded-xl border border-gray-300 text-sm" dir="ltr" />
          <input value={turn.username} onChange={(e) => setTurn({ ...turn, username: e.target.value.trim() })} placeholder="Username" className="px-3 py-2 rounded-xl border border-gray-300 text-sm" dir="ltr" />
          <input value={turn.credential} onChange={(e) => setTurn({ ...turn, credential: e.target.value.trim() })} placeholder="Password" className="px-3 py-2 rounded-xl border border-gray-300 text-sm" dir="ltr" />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              setTurnMsg('');
              try {
                await saveTurn(turn);
                setTurnMsg(tr('Saved ✓', 'تم الحفظ ✓'));
              } catch {
                setTurnMsg(tr('Could not save (publish the latest rules first).', 'تعذر الحفظ (انشري آخر ملف قواعد أولًا).'));
              }
            }}
            className="px-4 py-2 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-xs font-bold"
          >
            {tr('Save', 'حفظ')}
          </button>
          {turnMsg && <span className="text-xs font-bold text-[#0A192F]">{turnMsg}</span>}
        </div>
      </div>
      <div className="bg-white rounded-3xl border border-gray-200 p-5 space-y-3">
        <h3 className="font-bold text-[#0A192F] flex items-center gap-2">
          <Flag className="w-4 h-4 text-red-600" />
          {tr('Reports from rooms', 'البلاغات من الغرف')} ({reports.length})
        </h3>
        {reports.length === 0 ? (
          <p className="text-xs text-gray-500">{tr('No reports.', 'لا توجد بلاغات.')}</p>
        ) : (
          <div className="space-y-2">
            {reports.map((r) => (
              <div key={r.id} className="p-3 rounded-xl bg-red-50/50 border border-red-100 text-sm flex items-start justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-[#0A192F]">
                    {r.reportedName} <span className="text-gray-400 font-normal">← {r.reporterName}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {tr('Room', 'الغرفة')}: {r.roomTitle} • {new Date(r.createdAt).toLocaleString(isAr ? 'ar' : 'en')}
                  </div>
                  {r.reason && <p className="text-xs text-gray-700 whitespace-pre-wrap">{r.reason}</p>}
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => navigate('room/' + r.roomId)} className="p-2 rounded-lg bg-white border border-gray-200" title={tr('Open room', 'فتح الغرفة')}>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteReport(r.id).catch(() => {})} className="p-2 rounded-lg bg-white border border-gray-200 text-red-600" title={tr('Delete', 'حذف')}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <VoiceRoomsPage navigate={navigate} embedded />
    </div>
  );
};
