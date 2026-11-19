import { useAuth } from '../context/AuthContext';
import { useAcademySettings } from './useAcademySettings';

// اختبار تحديد المستوى من مكافآت التسجيل: الزائرة تُوجَّه للتسجيل المجاني أولًا، والعضوة تفتح الاختبار مباشرة
export const usePlacementLink = (): { href: string; target?: string; rel?: string } => {
  const { isAuthenticated } = useAuth();
  const { placementTestUrl } = useAcademySettings();
  if (isAuthenticated && placementTestUrl) return { href: placementTestUrl, target: '_blank', rel: 'noopener noreferrer' };
  return { href: '#/join-us' };
};
