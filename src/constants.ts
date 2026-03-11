import { Type } from "@google/genai";

export interface Course {
  id: string;
  name: { en: string; zh: string };
  totalHours: number;
  sessionsNeeded: number;
  color: string;
}

export const COURSES: Course[] = [
  { id: 'ae', name: { en: 'Academic English', zh: '学术英语' }, totalHours: 64, sessionsNeeded: 32, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'aw', name: { en: 'Academic Writing', zh: '学术写作' }, totalHours: 16, sessionsNeeded: 8, color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'ai', name: { en: 'Analytics Insight', zh: '分析洞察' }, totalHours: 8, sessionsNeeded: 4, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'ci', name: { en: 'Collaboration Insight', zh: '协作洞察' }, totalHours: 8, sessionsNeeded: 4, color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { id: 'ct', name: { en: 'Critical Thinking', zh: '批判性思维' }, totalHours: 16, sessionsNeeded: 8, color: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'pcs', name: { en: 'Practical Computer Skills', zh: '实用计算机技能' }, totalHours: 16, sessionsNeeded: 8, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { id: 'awp', name: { en: 'Academic Workshop', zh: '学术研讨会' }, totalHours: 18, sessionsNeeded: 9, color: 'bg-amber-100 text-amber-800 border-amber-200' },
];

export const DAYS = [
  { en: 'Monday', zh: '周一' },
  { en: 'Tuesday', zh: '周二' },
  { en: 'Wednesday', zh: '周三' },
  { en: 'Thursday', zh: '周四' },
  { en: 'Friday', zh: '周五' }
];

export const WEEKS = 10;
export const SLOTS_PER_DAY = 3;
export const SLOT_TIMES = [
  { label: { en: 'Morning', zh: '上午' }, time: '09:00 - 11:00' },
  { label: { en: 'Afternoon', zh: '下午' }, time: '14:00 - 16:00' },
  { label: { en: 'Evening', zh: '晚上' }, time: '19:00 - 21:00' }
];

export const UI_TEXT = {
  title: { en: 'PPAC Course Scheduler', zh: 'PPAC 课程表' },
  subtitle: { en: '10-Week Academic Cycle', zh: '10周学术周期' },
  gridView: { en: 'Grid View', zh: '网格视图' },
  listView: { en: 'List View', zh: '列表视图' },
  courseLoad: { en: 'Course Load', zh: '课程负荷' },
  scheduleRules: { en: 'Schedule Rules', zh: '排课规则' },
  rule1: { en: 'Each session is 2 academic hours', zh: '每次课为2个学时' },
  rule2: { en: 'Maximum 2 sessions per day', zh: '每天最多2次课' },
  rule3: { en: 'Monday to Friday only', zh: '仅限周一至周五' },
  rule4: { en: '10-week repeating cycle', zh: '10周循环周期' },
  week: { en: 'Week', zh: '第' },
  weekSuffix: { en: '', zh: '周' },
  progress: { en: 'Cycle Progress', zh: '周期进度' },
  assignmentWeek: { en: 'Assignment Week', zh: '作业周' },
  legend: { en: 'Course Legend', zh: '课程图例' },
  totalHours: { en: 'Total Hours', zh: '总学时' },
  totalSessions: { en: 'Total Sessions', zh: '总课次' },
  weeks: { en: 'Weeks', zh: '周数' },
  free: { en: 'Free', zh: '空闲' },
  noClass: { en: 'No Class', zh: '无课' },
  day: { en: 'Day', zh: '日期' },
  hoursSuffix: { en: 'h', zh: '小时' },
  dragHint: { en: 'Drag to swap sessions', zh: '拖动可交换课程位置' }
};
