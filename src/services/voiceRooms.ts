// بيانات الغرف الصوتية في Firestore
// voice_rooms/{roomId}            الغرفة
// voice_rooms/{roomId}/members/{uid}  المشاركون (الدور والحالة والمسارات المنشورة)
// voice_rooms/{roomId}/chat/{id}  الدردشة الكتابية داخل الغرفة
// voice_reports/{id}              البلاغات (تقرؤها الإدارة فقط)
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export type RoomPrivacy = 'public' | 'approval' | 'private';
export type MemberRole = 'owner' | 'speaker' | 'listener';
export type MemberStatus = 'in' | 'pending' | 'left' | 'kicked';

export interface VoiceRoom {
  id: string;
  title: string;
  topic: string;
  level: string;
  ownerId: string;
  ownerName: string;
  privacy: RoomPrivacy;
  girlsOnly: boolean;
  maxSpeakers: number;
  status: 'open' | 'closed';
  createdAt: number;
  lastActiveAt: number;
  liveCount: number;
}

export interface RoomMember {
  uid: string;
  name: string;
  photo: string;
  gender: string;
  role: MemberRole;
  status: MemberStatus;
  hand: boolean;
  muted: boolean;
  canScreen: boolean;
  pub: string | null; // جلسة نشر الصوت
  screen: string | null; // جلسة نشر الشاشة
  joinedAt: number;
  seenAt: number;
}

export interface ChatMsg {
  id: string;
  uid: string;
  name: string;
  text: string;
  createdAt: number;
}

export const ACTIVE_MS = 7 * 60 * 1000; // الغرفة/العضو «نشط» إن ظهر خلال 7 دقائق
export const HEARTBEAT_MS = 3 * 60 * 1000;

const roomsCol = collection(db, 'voice_rooms');
const toRoom = (d: any): VoiceRoom => ({ id: d.id, ...(d.data() as any) });

/** الغرف المفتوحة: المختلطة للجميع، وغرف البنات للمشتركات فقط */
export function watchRooms(uid: string, isFemale: boolean, isAdmin: boolean, cb: (rooms: VoiceRoom[]) => void, onError?: (e: any) => void) {
  const parts: Record<string, VoiceRoom[]> = {};
  const emit = () => {
    const all = Object.values(parts).flat();
    const seen = new Set<string>();
    cb(all.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true))));
  };
  const unsubs: (() => void)[] = [];
  const listen = (key: string, q: any) =>
    unsubs.push(
      onSnapshot(
        q,
        (snap: any) => {
          parts[key] = snap.docs.map(toRoom);
          emit();
        },
        onError
      )
    );
  if (isAdmin) {
    listen('all', query(roomsCol, limit(200)));
  } else {
    listen('mixed', query(roomsCol, where('girlsOnly', '==', false), where('status', '==', 'open'), limit(100)));
    if (isFemale) listen('girls', query(roomsCol, where('girlsOnly', '==', true), where('status', '==', 'open'), limit(100)));
    // غرفي (ومنها المغلقة)
    listen(
      'mine',
      isFemale
        ? query(roomsCol, where('ownerId', '==', uid), limit(50))
        : query(roomsCol, where('ownerId', '==', uid), where('girlsOnly', '==', false), limit(50))
    );
  }
  return () => unsubs.forEach((u) => u());
}

export async function createRoom(data: Omit<VoiceRoom, 'id' | 'createdAt' | 'lastActiveAt' | 'liveCount' | 'status'>) {
  const now = Date.now();
  const ref = await addDoc(roomsCol, { ...data, status: 'open', createdAt: now, lastActiveAt: now, liveCount: 0 });
  return ref.id;
}

export function watchRoom(roomId: string, cb: (r: VoiceRoom | null) => void, onError?: (e: any) => void) {
  return onSnapshot(doc(db, 'voice_rooms', roomId), (d) => cb(d.exists() ? toRoom(d) : null), onError);
}

export const updateRoom = (roomId: string, data: Partial<VoiceRoom>) => updateDoc(doc(db, 'voice_rooms', roomId), data as any);
export const deleteRoom = async (roomId: string) => {
  // حذف الدردشة والمشاركين أولًا (الإدارة أو صاحبة الغرفة)
  for (const sub of ['chat', 'signals', 'members']) {
    try {
      const snap = await getDocs(collection(db, 'voice_rooms', roomId, sub));
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    } catch {
      /* ignore */
    }
  }
  await deleteDoc(doc(db, 'voice_rooms', roomId));
};

const memberRef = (roomId: string, uid: string) => doc(db, 'voice_rooms', roomId, 'members', uid);

export async function getMyMember(roomId: string, uid: string): Promise<RoomMember | null> {
  const d = await getDoc(memberRef(roomId, uid));
  return d.exists() ? (d.data() as RoomMember) : null;
}

export function watchMyMember(roomId: string, uid: string, cb: (m: RoomMember | null) => void, onError?: (e: any) => void) {
  return onSnapshot(memberRef(roomId, uid), (d) => cb(d.exists() ? (d.data() as RoomMember) : null), onError);
}

export function watchMembers(roomId: string, cb: (m: RoomMember[]) => void, onError?: (e: any) => void) {
  return onSnapshot(collection(db, 'voice_rooms', roomId, 'members'), (s) => cb(s.docs.map((d) => d.data() as RoomMember)), onError);
}

export async function joinRoom(
  room: VoiceRoom,
  me: { uid: string; name: string; photo: string; gender: string },
  isAdmin: boolean
): Promise<MemberStatus> {
  const existing = await getMyMember(room.id, me.uid).catch(() => null);
  const isOwner = room.ownerId === me.uid;
  const now = Date.now();
  if (existing) {
    if (existing.status === 'kicked') return 'kicked';
    if (existing.status === 'in' || existing.status === 'pending') {
      await updateDoc(memberRef(room.id, me.uid), { seenAt: now, name: me.name });
      return existing.status;
    }
    const status: MemberStatus = isOwner || isAdmin || room.privacy === 'public' ? 'in' : 'pending';
    await updateDoc(memberRef(room.id, me.uid), { status, seenAt: now, joinedAt: now, hand: false, muted: true, pub: null, screen: null, name: me.name });
    return status;
  }
  const status: MemberStatus = isOwner || isAdmin || room.privacy === 'public' ? 'in' : 'pending';
  const m: RoomMember = {
    uid: me.uid,
    name: me.name.slice(0, 60),
    photo: (me.photo || '').slice(0, 500),
    gender: me.gender || '',
    role: isOwner ? 'owner' : 'listener',
    status,
    hand: false,
    muted: true,
    canScreen: isOwner,
    pub: null,
    screen: null,
    joinedAt: now,
    seenAt: now,
  };
  await setDoc(memberRef(room.id, me.uid), m);
  return status;
}

export const updateMember = (roomId: string, uid: string, data: Partial<RoomMember>) => updateDoc(memberRef(roomId, uid), data as any);
export const removeMember = (roomId: string, uid: string) => deleteDoc(memberRef(roomId, uid));

export function watchChat(roomId: string, cb: (m: ChatMsg[]) => void) {
  return onSnapshot(
    query(collection(db, 'voice_rooms', roomId, 'chat'), orderBy('createdAt', 'desc'), limit(60)),
    (s) => cb(s.docs.map((d) => ({ id: d.id, ...(d.data() as any) })).reverse()),
    () => cb([])
  );
}

export const sendChat = (roomId: string, uid: string, name: string, text: string) =>
  addDoc(collection(db, 'voice_rooms', roomId, 'chat'), { uid, name: name.slice(0, 60), text: text.slice(0, 500), createdAt: Date.now() });

export const deleteChat = (roomId: string, id: string) => deleteDoc(doc(db, 'voice_rooms', roomId, 'chat', id));

export const reportUser = (r: {
  roomId: string;
  roomTitle: string;
  reportedUid: string;
  reportedName: string;
  reporterUid: string;
  reporterName: string;
  reason: string;
}) => addDoc(collection(db, 'voice_reports'), { ...r, reason: r.reason.slice(0, 500), createdAt: Date.now() });

export function watchReports(cb: (r: any[]) => void) {
  return onSnapshot(
    query(collection(db, 'voice_reports'), orderBy('createdAt', 'desc'), limit(100)),
    (s) => cb(s.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))),
    () => cb([])
  );
}
export const deleteReport = (id: string) => deleteDoc(doc(db, 'voice_reports', id));

export const roomLink = (roomId: string) => `${window.location.origin}/#/room/${roomId}`;
