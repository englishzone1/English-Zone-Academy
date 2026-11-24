import React, { useEffect, useState } from 'react';
import { X, Edit3, ImageOff, Trash2, MicOff, Loader2, UserCircle2 } from 'lucide-react';
import { AvatarRenderer } from '../avatar/AvatarRenderer';
import { AvatarStudioPage } from '../../pages/dashboards/AvatarStudioPage';
import { adminUpdateMemberProfile, getMemberPosts, adminStripPostMedia, studentHubService, CommunityPost } from '../../services/studentHubService';

// الإدارة فقط: صفحة العضوة — الاسم والأفاتار والصورة الشخصية ومنشوراتها
export const AdminMemberProfile: React.FC<{ member: any; isAr: boolean; onClose: () => void; onChanged?: (patch: any) => void }> = ({
  member,
  isAr,
  onClose,
  onChanged
}) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [m, setM] = useState<any>(member);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () =>
    getMemberPosts(member.id)
      .then(setPosts)
      .catch((e) => {
        console.error(e);
        setMsg(`${tr('Could not load posts:', 'تعذر تحميل المنشورات:')} ${e?.code || ''}`);
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, [member.id]);

  const run = async (key: string, fn: () => Promise<void>, ok: string) => {
    setBusy(key);
    setMsg('');
    try {
      await fn();
      setMsg(ok);
    } catch (e: any) {
      console.error(e);
      setMsg(`${tr('Failed:', 'تعذر التنفيذ:')} ${e?.code || e?.message || ''}`);
    } finally {
      setBusy('');
    }
  };

  const cfg = m.avatarConfig || {};
  const hasPhoto = !!cfg.photo;

  const removePhoto = () =>
    run(
      'photo',
      async () => {
        if (!window.confirm(tr('Delete this member’s profile photo?', 'حذف الصورة الشخصية لهذه العضوة؟'))) return;
        const next = { ...cfg, photo: '', mode: 'cartoon' };
        await adminUpdateMemberProfile(m.id, { avatarConfig: next });
        setM((x: any) => ({ ...x, avatarConfig: next }));
        onChanged?.({ avatarConfig: next });
        setPosts((ps) => ps.map((p) => ({ ...p, authorAvatar: next })));
      },
      tr('Photo deleted.', 'تم حذف الصورة.')
    );

  if (editing) {
    return (
      <div className="fixed inset-0 z-[60] bg-[#FAF8F5] overflow-y-auto">
        <AvatarStudioPage
          navigate={() => setEditing(false)}
          editUser={m}
          onClose={() => setEditing(false)}
          onSaved={(u) => {
            setM((x: any) => ({ ...x, ...u }));
            onChanged?.(u);
            setPosts((ps) => ps.map((p) => ({ ...p, authorAvatar: u.avatarConfig, ...(u.fullName ? { authorName: u.fullName } : {}) })));
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 overflow-y-auto p-4" onClick={onClose}>
      <div className="max-w-2xl mx-auto my-6 bg-white rounded-3xl p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <AvatarRenderer config={cfg} gender={(m as any).gender} size={72} />
            <div className="min-w-0">
              <h3 className="font-serif-luxury font-bold text-lg text-[#0A192F]">{m.fullName || '—'}</h3>
              <p className="text-[11px] text-gray-500 break-all" dir="ltr">
                {m.email}
                {m.phone ? ` • ${m.phone}` : ''}
              </p>
              <p className="text-[11px] text-gray-500">
                {[m.country, m.age ? `${m.age} ${tr('yrs', 'سنة')}` : '', m.mainLevel].filter(Boolean).join(' • ')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0A192F] text-[#F3E5AB] flex items-center gap-1.5">
            <Edit3 className="w-4 h-4 text-[#D4AF37]" />
            {tr('Edit name, WhatsApp & avatar', 'تعديل الاسم والواتساب والأفاتار')}
          </button>
          {hasPhoto && (
            <button onClick={removePhoto} disabled={busy === 'photo'} className="px-4 py-2 rounded-xl text-xs font-bold border border-red-200 text-red-600 flex items-center gap-1.5 disabled:opacity-50">
              {busy === 'photo' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageOff className="w-4 h-4" />}
              {tr('Delete profile photo', 'حذف الصورة الشخصية')}
            </button>
          )}
        </div>

        {msg && <div className="p-2 rounded-lg bg-[#FAF8F5] text-xs text-[#0A192F]">{msg}</div>}

        <div className="space-y-3">
          <h4 className="font-bold text-sm text-[#0A192F] flex items-center gap-1.5">
            <UserCircle2 className="w-4 h-4 text-[#AA820A]" />
            {tr('Community posts', 'منشوراتها في المجتمع')} ({posts.length})
          </h4>
          {loading ? (
            <div className="text-xs text-gray-500">{tr('Loading...', 'جارٍ التحميل...')}</div>
          ) : posts.length === 0 ? (
            <div className="text-xs text-gray-500 bg-[#FAF8F5] rounded-xl p-4 text-center">{tr('No posts.', 'لا توجد منشورات.')}</div>
          ) : (
            posts.map((p) => (
              <div key={p.id} className="p-3 rounded-2xl border border-gray-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>{p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</span>
                  <span>❤ {p.likes?.length || 0}</span>
                </div>
                {p.text && <p className="text-gray-700 whitespace-pre-line">{p.text}</p>}
                {p.imageDataUrl && <img src={p.imageDataUrl} alt="" className="max-h-48 rounded-xl border border-gray-100" />}
                {p.audioDataUrl && <audio controls src={p.audioDataUrl} className="h-9 max-w-full" />}
                {p.videoUrl && (
                  <a href={p.videoUrl} target="_blank" rel="noopener noreferrer" className="text-[#AA820A] underline break-all" dir="ltr">
                    {p.videoUrl}
                  </a>
                )}
                <div className="flex flex-wrap justify-end gap-2">
                  {busy === p.id && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                  {p.imageDataUrl && (
                    <button
                      onClick={() =>
                        run(p.id, async () => {
                          await adminStripPostMedia(p.id, 'imageDataUrl');
                          setPosts((ps) => ps.map((x) => (x.id === p.id ? { ...x, imageDataUrl: undefined } : x)));
                        }, tr('Image deleted.', 'تم حذف الصورة.'))
                      }
                      className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 font-bold flex items-center gap-1"
                    >
                      <ImageOff className="w-3.5 h-3.5" />
                      {tr('Delete image', 'حذف الصورة')}
                    </button>
                  )}
                  {p.audioDataUrl && (
                    <button
                      onClick={() =>
                        run(p.id, async () => {
                          await adminStripPostMedia(p.id, 'audioDataUrl');
                          setPosts((ps) => ps.map((x) => (x.id === p.id ? { ...x, audioDataUrl: undefined } : x)));
                        }, tr('Audio deleted.', 'تم حذف الصوت.'))
                      }
                      className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 font-bold flex items-center gap-1"
                    >
                      <MicOff className="w-3.5 h-3.5" />
                      {tr('Delete audio', 'حذف الصوت')}
                    </button>
                  )}
                  {p.videoUrl && (
                    <button
                      onClick={() =>
                        run(p.id, async () => {
                          await adminStripPostMedia(p.id, 'videoUrl');
                          setPosts((ps) => ps.map((x) => (x.id === p.id ? { ...x, videoUrl: undefined } : x)));
                        }, tr('Video link deleted.', 'تم حذف رابط الفيديو.'))
                      }
                      className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 font-bold"
                    >
                      {tr('Delete video', 'حذف الفيديو')}
                    </button>
                  )}
                  <button
                    onClick={() =>
                      run(p.id, async () => {
                        if (!window.confirm(tr('Delete this post?', 'حذف هذا المنشور؟'))) return;
                        await studentHubService.deletePost(p.id);
                        setPosts((ps) => ps.filter((x) => x.id !== p.id));
                      }, tr('Post deleted.', 'تم حذف المنشور.'))
                    }
                    className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {tr('Delete post', 'حذف المنشور')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
