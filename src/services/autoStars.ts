import { groupService } from './groupService';
import { studentHubService } from './studentHubService';

// نجوم تلقائية من الواجبات والاختبارات التفاعلية:
// 90%+ ثلاث نجوم، 70%+ نجمتان، 50%+ نجمة. تُمنح مرة واحدة لكل نتيجة (starsGiven يمنع التكرار).
// تعمل عند فتح الإدارة أو المعلمة للوحة، لأن جهاز الطالبة لا يستطيع منح نفسه النجوم.
export const starsForPercent = (p: number) => (p >= 90 ? 3 : p >= 70 ? 2 : p >= 50 ? 1 : 0);

let running = false;

export const autoAwardHomeworkStars = async (opts: { teacherId?: string; awardedBy: string; asTeacher?: boolean; max?: number }): Promise<number> => {
  if (running) return 0;
  running = true;
  let awarded = 0;
  try {
    const all = await studentHubService.getAllHomeworkResults(opts.teacherId);
    const todo = all.filter((r) => r.starsGiven === undefined && r.total > 0 && ['lesson', 'test', 'exam'].includes(r.kind)).slice(0, opts.max ?? 40);
    for (const r of todo) {
      const stars = starsForPercent(r.percent);
      try {
        if (stars > 0) {
          await groupService.awardStars({
            studentId: r.studentId,
            studentName: r.studentName,
            groupId: r.groupId,
            amount: stars,
            reason: `${r.kind === 'lesson' ? 'واجب' : 'اختبار'}: ${r.title} (${r.score}/${r.total})`,
            awardedBy: opts.awardedBy,
            asTeacher: opts.asTeacher
          });
          awarded++;
        }
        await studentHubService.markHomeworkStars(r.id, stars);
      } catch (err) {
        console.error('Auto stars failed for', r.id, err);
      }
    }
  } catch (err) {
    console.error('Auto stars:', err);
  } finally {
    running = false;
  }
  return awarded;
};
