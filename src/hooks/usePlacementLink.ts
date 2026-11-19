import { useAuth } from '../context/AuthContext';

// أزرار الاختبار العامة لا تفتح الاختبار مباشرة: الزائرة ← التسجيل المجاني، والعضوة ← صفحتها (فيها الاختبار وحفظ النتيجة)
export const usePlacementLink = (): { href: string; target?: string; rel?: string; loggedIn: boolean; label: (isAr: boolean) => string } => {
  const { isAuthenticated } = useAuth();
  return {
    href: isAuthenticated ? '#/portal' : '#/join-us',
    loggedIn: isAuthenticated,
    label: (isAr: boolean) =>
      isAuthenticated
        ? isAr ? '{اختبر|اختبري} {مستواك|مستواكِ} من {حسابك|حسابكِ}' : 'Test your level from your account'
        : isAr ? '{سجّل|سجّلي} مجانًا {واختبر|واختبري} {مستواك|مستواكِ}' : 'Sign up free & test your level'
  };
};
