import React, { useEffect, useState } from 'react';
import { Flag, Trash2, ExternalLink } from 'lucide-react';
import { VoiceRoomsPage } from '../../pages/VoiceRoomsPage';
import { deleteReport, watchReports } from '../../services/voiceRooms';

// تبويب الإدارة: كل الغرف (مع الخاصة وغرف البنات) والبلاغات
export const AdminVoiceRooms: React.FC<{ isAr: boolean; navigate: (r: string) => void }> = ({ isAr, navigate }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [reports, setReports] = useState<any[]>([]);
  useEffect(() => watchReports(setReports), []);

  return (
    <div className="space-y-6">
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
