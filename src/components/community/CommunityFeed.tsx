import React, { useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle, Image as ImageIcon, Mic, Square, Video, Send, Trash2, X, ShieldCheck } from 'lucide-react';
import {
  studentHubService,
  CommunityPost,
  CommunityComment,
  compressImage,
  blobToDataUrl,
  isSafeUrl,
  MAX_MEDIA_CHARS
} from '../../services/studentHubService';
import { AvatarRenderer } from '../avatar/AvatarRenderer';
import { EnglishZoneEmblem } from '../common/Logo';

interface Props {
  uid: string;
  name: string;
  role: 'student' | 'admin' | 'teacher';
  isAr: boolean;
  avatar?: any;
  // للمسجّلين غير المشتركين: مشاهدة وإعجاب فقط، بلا نشر ولا تعليق
  readOnly?: boolean;
}

const MAX_RECORD_SECONDS = 60;

// يحوّل رابط يوتيوب إلى رابط تضمين؛ غير ذلك يُعرض كرابط
const youtubeEmbed = (url: string): string | null => {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/i);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
};

const driveEmbed = (url: string): string | null => {
  const m = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/i);
  return m ? `https://drive.google.com/file/d/${m[1]}/preview` : null;
};

// مجتمع English Zone: منشورات الطلاب والإدارة، الإعجابات والتعليقات
export const CommunityFeed: React.FC<Props> = ({ uid, name, role, isAr, avatar, readOnly = false }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const isAdmin = role === 'admin';

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // composer
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [audio, setAudio] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const [posting, setPosting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  // comments
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, CommunityComment[]>>({});
  const [commentText, setCommentText] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setPosts(await studentHubService.getPosts());
    } catch (err: any) {
      console.error(err);
      setError(tr('Could not load posts.', 'تعذر تحميل المنشورات.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const pickImage = async (file?: File) => {
    if (!file) return;
    try {
      setImage(await compressImage(file));
    } catch {
      setError(tr('This image is too large.', 'الصورة كبيرة جدًا.'));
    }
  };

  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options: MediaRecorderOptions = { audioBitsPerSecond: 32000 };
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.mimeType = 'audio/webm;codecs=opus';
      }
      const rec = new MediaRecorder(stream, options);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) window.clearInterval(timerRef.current);
        setRecording(false);
        const data = await blobToDataUrl(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }));
        if (data.length > MAX_MEDIA_CHARS) {
          setError(tr('The recording is too long.', 'التسجيل طويل جدًا.'));
        } else {
          setAudio(data);
        }
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_RECORD_SECONDS) rec.state === 'recording' && rec.stop();
          return s + 1;
        });
      }, 1000);
    } catch {
      setError(tr('Microphone access was not allowed.', 'لم يُسمح باستخدام الميكروفون.'));
    }
  };

  const stopRecording = () => {
    const rec = recorderRef.current;
    if (rec && rec.state === 'recording') rec.stop();
  };

  const resetComposer = () => {
    setText('');
    setImage('');
    setAudio('');
    setVideoUrl('');
    setShowVideo(false);
  };

  const submit = async () => {
    if (!text.trim() && !image && !audio && !videoUrl.trim()) return;
    if (videoUrl.trim() && !isSafeUrl(videoUrl)) {
      setError(tr('Video link must start with https://', 'رابط الفيديو يجب أن يبدأ بـ https://'));
      return;
    }
    setPosting(true);
    setError('');
    try {
      await studentHubService.createPost({
        authorId: uid,
        authorName: name,
        authorRole: role,
        authorAvatar: role !== 'admin' && avatar ? avatar : undefined,
        text: text.trim().slice(0, 3000),
        imageDataUrl: image || undefined,
        audioDataUrl: audio || undefined,
        videoUrl: videoUrl.trim() || undefined
      });
      resetComposer();
      await load();
    } catch (err) {
      console.error(err);
      setError(tr('Could not publish the post.', 'تعذر نشر المنشور.'));
    } finally {
      setPosting(false);
    }
  };

  const like = async (p: CommunityPost) => {
    const liked = p.likes.includes(uid);
    setPosts((prev) =>
      prev.map((x) =>
        x.id === p.id ? { ...x, likes: liked ? x.likes.filter((l) => l !== uid) : [...x.likes, uid] } : x
      )
    );
    try {
      await studentHubService.toggleLike(p.id, uid, liked);
    } catch (err) {
      console.error(err);
      await load();
    }
  };

  const removePost = async (p: CommunityPost) => {
    if (!window.confirm(tr('Delete this post?', 'حذف هذا المنشور؟'))) return;
    try {
      await studentHubService.deletePost(p.id);
      setPosts((prev) => prev.filter((x) => x.id !== p.id));
    } catch (err) {
      console.error(err);
      setError(tr('Could not delete.', 'تعذر الحذف.'));
    }
  };

  const toggleComments = async (postId: string) => {
    if (openComments === postId) {
      setOpenComments(null);
      return;
    }
    setOpenComments(postId);
    setCommentText('');
    try {
      const list = await studentHubService.getComments(postId);
      setComments((prev) => ({ ...prev, [postId]: list }));
    } catch (err) {
      console.error(err);
    }
  };

  const sendComment = async (postId: string) => {
    if (!commentText.trim()) return;
    try {
      await studentHubService.addComment(postId, {
        authorId: uid,
        authorName: name,
        authorRole: role,
        authorAvatar: role !== 'admin' && avatar ? avatar : undefined,
        text: commentText
      });
      setCommentText('');
      const list = await studentHubService.getComments(postId);
      setComments((prev) => ({ ...prev, [postId]: list }));
    } catch (err) {
      console.error(err);
      setError(tr('Could not add the comment.', 'تعذر إضافة التعليق.'));
    }
  };

  const removeComment = async (postId: string, c: CommunityComment) => {
    try {
      await studentHubService.deleteComment(postId, c.id);
      setComments((prev) => ({ ...prev, [postId]: (prev[postId] || []).filter((x) => x.id !== c.id) }));
    } catch (err) {
      console.error(err);
    }
  };

  const AuthorBadge = ({ r }: { r: string }) =>
    r === 'teacher' ? (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#D4AF37] text-[#0A192F] text-[10px] font-bold">
        {tr('Teacher', 'معلم')}
      </span>
    ) : r === 'admin' ? (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#0A192F] text-[#F3E5AB] text-[10px] font-bold">
        <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
        {tr('Academy', 'الأكاديمية')}
      </span>
    ) : null;

  const Face = ({ r, cfg, size }: { r: string; cfg?: any; size: number }) =>
    r === 'admin' || (r === 'teacher' && !cfg) ? (
      <EnglishZoneEmblem sizeClass={size > 30 ? 'w-10 h-10' : 'w-7 h-7'} glow={false} />
    ) : (
      <AvatarRenderer config={cfg} size={size} />
    );

  const when = (iso: string) => (iso ? new Date(iso).toLocaleString(isAr ? 'ar' : 'en', { dateStyle: 'medium', timeStyle: 'short' }) : '');

  return (
    <div className="space-y-6">
      {readOnly && (
        <div className="p-3 rounded-2xl bg-[#F3E5AB]/40 border border-[#D4AF37]/40 text-xs text-[#0A192F] font-bold">
          {tr('You can read and like posts. Posting and commenting are for enrolled students.', 'تستطيعين قراءة المنشورات والإعجاب بها. النشر والتعليق للطالبات المشتركات في الكورس.')}
        </div>
      )}
      {/* Composer */}
      <div className={`bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-3 ${readOnly ? 'hidden' : ''}`}>
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={tr('Share something with the English Zone community...', 'شارك شيئًا مع مجتمع English Zone...')}
          className="w-full px-4 py-3 rounded-2xl border border-gray-300 text-sm focus:outline-none focus:border-[#D4AF37]"
        />

        {image && (
          <div className="relative inline-block">
            <img src={image} alt="" className="max-h-48 rounded-xl border border-gray-200" />
            <button onClick={() => setImage('')} className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {audio && (
          <div className="flex items-center gap-2">
            <audio controls src={audio} className="h-10" />
            <button onClick={() => setAudio('')} className="p-1.5 text-gray-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {showVideo && (
          <input
            type="text"
            dir="ltr"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder={tr('YouTube or Google Drive video link', 'رابط فيديو من يوتيوب أو جوجل درايف')}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-mono"
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <label className="p-2 rounded-xl hover:bg-gray-100 cursor-pointer text-gray-600" title={tr('Photo', 'صورة')}>
              <ImageIcon className="w-5 h-5" />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => pickImage(e.target.files?.[0])} />
            </label>
            {recording ? (
              <button onClick={stopRecording} className="px-3 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold flex items-center gap-1.5">
                <Square className="w-4 h-4" />
                <span>
                  {tr('Stop', 'إيقاف')} {seconds}s / {MAX_RECORD_SECONDS}s
                </span>
              </button>
            ) : (
              <button onClick={startRecording} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600" title={tr('Voice recording', 'تسجيل صوتي')}>
                <Mic className="w-5 h-5" />
              </button>
            )}
            <button onClick={() => setShowVideo((v) => !v)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600" title={tr('Video link', 'رابط فيديو')}>
              <Video className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={submit}
            disabled={posting || recording || (!text.trim() && !image && !audio && !videoUrl.trim())}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0A192F] text-[#F3E5AB] hover:bg-[#162B4D] disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-4 h-4 text-[#D4AF37]" />
            <span>{posting ? tr('Publishing...', 'جارٍ النشر...') : tr('Publish', 'نشر')}</span>
          </button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500">{tr('Loading...', 'جارٍ التحميل...')}</div>
      ) : posts.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-500 bg-white rounded-3xl border border-gray-200">
          {tr('No posts yet. Be the first to share!', 'لا توجد منشورات بعد. كن أول من يشارك!')}
        </div>
      ) : (
        posts.map((p) => {
          const liked = p.likes.includes(uid);
          const canDelete = isAdmin || p.authorId === uid;
          const embed = p.videoUrl ? youtubeEmbed(p.videoUrl) || driveEmbed(p.videoUrl) : null;
          return (
            <div key={p.id} className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Face r={p.authorRole} cfg={p.authorAvatar} size={40} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0A192F]">{p.authorName}</span>
                      <AuthorBadge r={p.authorRole} />
                    </div>
                    <span className="text-[11px] text-gray-400">{when(p.createdAt)}</span>
                  </div>
                </div>
                {canDelete && (
                  <button onClick={() => removePost(p)} className="p-1.5 text-gray-400 hover:text-red-600" title={tr('Delete', 'حذف')}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {p.text && <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{p.text}</p>}
              {p.imageDataUrl && <img src={p.imageDataUrl} alt="" className="w-full max-h-[480px] object-contain rounded-2xl bg-gray-50" />}
              {p.audioDataUrl && <audio controls src={p.audioDataUrl} className="w-full" />}
              {p.videoUrl &&
                (embed ? (
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
                    <iframe src={embed} title="video" className="w-full h-full" allow="encrypted-media; picture-in-picture" allowFullScreen />
                  </div>
                ) : (
                  <a href={p.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#AA820A] underline break-all" dir="ltr">
                    {p.videoUrl}
                  </a>
                ))}

              <div className="flex items-center gap-4 pt-2 border-t border-gray-100 text-xs">
                <button onClick={() => like(p)} className={`flex items-center gap-1.5 font-semibold ${liked ? 'text-red-500' : 'text-gray-500'}`}>
                  <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                  <span>{p.likes.length}</span>
                </button>
                <button onClick={() => toggleComments(p.id)} className="flex items-center gap-1.5 font-semibold text-gray-500">
                  <MessageCircle className="w-4 h-4" />
                  <span>{tr('Comments', 'التعليقات')}</span>
                </button>
              </div>

              {openComments === p.id && (
                <div className="space-y-2 pt-1">
                  {(comments[p.id] || []).map((c) => (
                    <div key={c.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-gray-100 text-xs space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Face r={c.authorRole} cfg={c.authorAvatar} size={28} />
                          <span className="font-bold text-[#0A192F]">{c.authorName}</span>
                          <AuthorBadge r={c.authorRole} />
                        </div>
                        {(isAdmin || c.authorId === uid) && (
                          <button onClick={() => removeComment(p.id, c)} className="text-gray-400 hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700 whitespace-pre-line">{c.text}</p>
                    </div>
                  ))}
                  <div className={`flex items-center gap-2 ${readOnly ? 'hidden' : ''}`}>
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendComment(p.id)}
                      placeholder={tr('Write a comment...', 'اكتب تعليقًا...')}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    />
                    <button onClick={() => sendComment(p.id)} className="p-2 rounded-xl bg-[#0A192F] text-[#F3E5AB]">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
