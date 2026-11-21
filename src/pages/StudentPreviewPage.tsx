import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { StudentDashboard } from './dashboards/StudentDashboard';
import { useLanguage } from '../context/LanguageContext';

// معاينة الإدارة لصفحة الطالب كما يراها هو (للعرض فقط)
export const StudentPreviewPage: React.FC<{ studentId: string; navigate: (r: string) => void }> = ({ studentId, navigate }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [u, setU] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    getDoc(doc(db, 'users', studentId))
      .then((s) => (s.exists() ? setU({ ...(s.data() as any), id: s.id }) : setErr('not-found')))
      .catch((e) => setErr(e?.code || 'error'));
  }, [studentId]);

  if (err) return <div className="min-h-screen flex items-center justify-center text-sm text-red-600">{isAr ? 'تعذر فتح صفحة الطالب.' : 'Could not open the student page.'} ({err})</div>;
  if (!u) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">{isAr ? 'جارٍ التحميل...' : 'Loading...'}</div>;
  return <StudentDashboard navigate={navigate} previewUser={u} />;
};
