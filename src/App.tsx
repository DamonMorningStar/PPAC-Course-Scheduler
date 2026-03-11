/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid, 
  List,
  CheckCircle2,
  Info,
  Languages,
  GripVertical,
  MoreVertical,
  X
} from 'lucide-react';
import { COURSES, DAYS, WEEKS, SLOTS_PER_DAY, SLOT_TIMES, UI_TEXT, Course } from './constants';

// Highly specific deterministic schedule generator based on user constraints
const generateInitialSchedule = () => {
  const schedule: (string | null)[][][] = Array.from({ length: WEEKS }, () =>
    Array.from({ length: DAYS.length }, () => Array(SLOTS_PER_DAY).fill(null))
  );

  const placeCourse = (courseId: string, startWeek: number, endWeek: number, totalSessions: number) => {
    let placed = 0;
    const isEnglish = courseId === 'ae';

    for (let w = startWeek - 1; w < endWeek; w++) {
      const weeksLeft = endWeek - w;
      const sessionsThisWeek = Math.ceil((totalSessions - placed) / weeksLeft);
      
      let weekPlaced = 0;
      for (let d = 0; d < 4 && weekPlaced < sessionsThisWeek && placed < totalSessions; d++) {
        if (schedule[w][d].includes(courseId)) continue;
        const sessionsToday = schedule[w][d].filter(id => id !== null).length;
        if (sessionsToday >= 2) continue;

        if (isEnglish) {
          if (schedule[w][d][0] === null) {
            schedule[w][d][0] = courseId;
            placed++;
            weekPlaced++;
          }
        } else {
          for (let s = 1; s < SLOTS_PER_DAY && weekPlaced < sessionsThisWeek && placed < totalSessions; s++) {
            if (schedule[w][d][s] === null) {
              schedule[w][d][s] = courseId;
              placed++;
              weekPlaced++;
              break;
            }
          }
        }
      }

      if (weekPlaced < sessionsThisWeek && placed < totalSessions) {
        const d = 4;
        if (!schedule[w][d].includes(courseId)) {
          const sessionsToday = schedule[w][d].filter(id => id !== null).length;
          if (sessionsToday < 2) {
            if (isEnglish) {
              if (schedule[w][d][0] === null) {
                schedule[w][d][0] = courseId;
                placed++;
                weekPlaced++;
              }
            } else {
              for (let s = 1; s < SLOTS_PER_DAY && weekPlaced < sessionsThisWeek && placed < totalSessions; s++) {
                if (schedule[w][d][s] === null) {
                  schedule[w][d][s] = courseId;
                  placed++;
                  weekPlaced++;
                  break;
                }
              }
            }
          }
        }
      }
    }
  };

  placeCourse('ae', 1, 9, 32);
  placeCourse('ai', 1, 2, 4);
  placeCourse('ci', 3, 4, 4);
  placeCourse('pcs', 1, 4, 8);
  placeCourse('aw', 1, 8, 8);
  placeCourse('ct', 5, 9, 8);
  placeCourse('awp', 3, 10, 9);

  return schedule;
};

export default function App() {
  const [language, setLanguage] = useState<'en' | 'zh'>('zh');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [schedule, setSchedule] = useState(() => generateInitialSchedule());
  const [draggedItem, setDraggedItem] = useState<{ week: number, day: number, slot: number } | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<{ week: number, day: number, slot: number } | null>(null);

  const t = useCallback((key: keyof typeof UI_TEXT) => UI_TEXT[key][language], [language]);

  const getCourseById = (id: string | null) => {
    if (!id) return null;
    return COURSES.find(c => c.id === id) || null;
  };

  const handleDragStart = (week: number, day: number, slot: number) => {
    setDraggedItem({ week, day, slot });
  };

  const handleDrop = (targetWeek: number, targetDay: number, targetSlot: number) => {
    if (!draggedItem) return;

    const newSchedule = [...schedule.map(w => [...w.map(d => [...d])])];
    const sourceVal = newSchedule[draggedItem.week][draggedItem.day][draggedItem.slot];
    const targetVal = newSchedule[targetWeek][targetDay][targetSlot];

    // Swap
    newSchedule[draggedItem.week][draggedItem.day][draggedItem.slot] = targetVal;
    newSchedule[targetWeek][targetDay][targetSlot] = sourceVal;

    setSchedule(newSchedule);
    setDraggedItem(null);
  };

  const handleCourseChange = (week: number, day: number, slot: number, courseId: string | null) => {
    const newSchedule = [...schedule.map(w => [...w.map(d => [...d])])];
    newSchedule[week][day][slot] = courseId;
    setSchedule(newSchedule);
    setActiveDropdown(null);
  };

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    COURSES.forEach(c => counts[c.id] = 0);
    
    schedule.flat(2).forEach(id => {
      if (id) counts[id] = (counts[id] || 0) + 1;
    });

    return COURSES.map(c => ({
      ...c,
      completedSessions: counts[c.id],
      completedHours: counts[c.id] * 2
    }));
  }, [schedule]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Calendar size={24} />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold tracking-tight">{t('title')}</h1>
              <p className="text-sm text-gray-500 font-medium">{t('subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${language === 'en' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('zh')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${language === 'zh' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
              >
                中文
              </button>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <LayoutGrid size={16} />
                {t('gridView')}
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <List size={16} />
                {t('listView')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Stats */}
          <aside className="lg:col-span-3 space-y-6">
            <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h2 className="text-sm font-serif font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BookOpen size={14} />
                {t('courseLoad')}
              </h2>
              <div className="space-y-4">
                {stats.map((course) => (
                  <div key={course.id} className="group">
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-sm font-semibold text-gray-700 truncate pr-2">{course.name[language]}</span>
                      <span className="text-xs font-mono text-gray-400 whitespace-nowrap">
                        <span className={
                          course.completedHours > course.totalHours 
                            ? 'text-red-600 font-bold' 
                            : course.completedHours < course.totalHours 
                              ? 'text-green-600 font-bold' 
                              : 'text-gray-900 font-bold'
                        }>
                          {course.completedHours}
                        </span>
                        <span className="text-gray-400">/{course.totalHours}{t('hoursSuffix')}</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(course.completedHours / course.totalHours) * 100}%` }}
                        className={`h-full rounded-full ${course.color.split(' ')[0].replace('bg-', 'bg-opacity-100 bg-')}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{t('totalSessions')}</span>
                  <span className="font-bold text-gray-900">73 / 100</span>
                </div>
              </div>
            </section>

            <section className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
              <div className="flex items-start gap-3">
                <Info className="text-blue-500 mt-0.5" size={18} />
                <div>
                  <h3 className="text-sm font-serif font-bold text-blue-900 mb-1">{t('scheduleRules')}</h3>
                  <ul className="text-xs text-blue-700 space-y-1.5 list-disc pl-4">
                    <li>{t('rule1')}</li>
                    <li>{t('rule2')}</li>
                    <li>{t('rule3')}</li>
                    <li>{t('rule4')}</li>
                  </ul>
                </div>
              </div>
            </section>
            
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 flex items-center gap-3 text-gray-500">
              <GripVertical size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{t('dragHint')}</span>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-6">
            {/* Week Navigation */}
            <div className="flex items-center justify-between bg-[#0883c6] p-4 rounded-2xl border border-[#066ba3] shadow-md text-white">
              <button 
                onClick={() => setCurrentWeek(prev => Math.max(0, prev - 1))}
                disabled={currentWeek === 0}
                className="p-2 rounded-xl hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="text-center">
                <h2 className="text-2xl font-serif font-black">
                  {t('week')} {currentWeek + 1} {t('weekSuffix')}
                  {currentWeek === 9 && (
                    <span className="ml-3 text-xs bg-amber-500 text-white px-2 py-1 rounded-md align-middle uppercase tracking-widest">
                      {t('assignmentWeek')}
                    </span>
                  )}
                </h2>
                <p className="text-sm text-white/70 font-medium">{t('progress')}: {((currentWeek + 1) / WEEKS * 100).toFixed(0)}%</p>
              </div>

              <button 
                onClick={() => setCurrentWeek(prev => Math.min(WEEKS - 1, prev + 1))}
                disabled={currentWeek === WEEKS - 1}
                className="p-2 rounded-xl hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Schedule Display */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentWeek + viewMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {DAYS.map((day, dayIdx) => (
                      <div key={day.en} className="flex flex-col gap-4">
                        <div className="text-center py-2 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest font-serif">
                          {day[language]}
                        </div>
                        {SLOT_TIMES.map((timeInfo, slotIdx) => {
                          const courseId = schedule[currentWeek][dayIdx][slotIdx];
                          const course = getCourseById(courseId);
                          const isDropdownOpen = activeDropdown?.week === currentWeek && activeDropdown?.day === dayIdx && activeDropdown?.slot === slotIdx;
                          
                          return (
                            <div 
                              key={slotIdx}
                              draggable={!!course}
                              onDragStart={() => handleDragStart(currentWeek, dayIdx, slotIdx)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => handleDrop(currentWeek, dayIdx, slotIdx)}
                              className={`relative min-h-[110px] p-3 rounded-2xl border-2 flex flex-col justify-between transition-all group ${
                                course 
                                  ? `${course.color} shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing border-transparent` 
                                  : 'bg-white border-dashed border-gray-200 text-gray-300'
                              } ${draggedItem?.day === dayIdx && draggedItem?.slot === slotIdx ? 'opacity-40 scale-95' : ''}`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                  <span className="text-[9px] font-bold uppercase tracking-tighter opacity-60">
                                    {timeInfo.label[language]}
                                  </span>
                                  <span className="text-[8px] font-medium opacity-40">
                                    {timeInfo.time}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {course && <GripVertical size={12} className="opacity-0 group-hover:opacity-40 transition-opacity" />}
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveDropdown(isDropdownOpen ? null : { week: currentWeek, day: dayIdx, slot: slotIdx });
                                    }}
                                    className="p-1 rounded-md hover:bg-black/5 transition-colors relative z-20"
                                  >
                                    <MoreVertical size={12} className="opacity-40" />
                                  </button>
                                  
                                  {/* Dropdown Menu */}
                                  <AnimatePresence>
                                    {isDropdownOpen && (
                                      <motion.div 
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        className="absolute top-8 right-0 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                                      >
                                        <div className="p-2 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select Course</span>
                                          <button onClick={() => setActiveDropdown(null)}><X size={10} className="text-gray-400" /></button>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto py-1">
                                          <button 
                                            onClick={() => handleCourseChange(currentWeek, dayIdx, slotIdx, null)}
                                            className="w-full text-left px-4 py-2 text-[11px] hover:bg-gray-50 text-gray-500 italic"
                                          >
                                            {t('noClass')}
                                          </button>
                                          {COURSES.map(c => (
                                            <button 
                                              key={c.id}
                                              onClick={() => handleCourseChange(currentWeek, dayIdx, slotIdx, c.id)}
                                              className={`w-full text-left px-4 py-2 text-[11px] hover:bg-gray-50 flex items-center gap-2 ${courseId === c.id ? 'font-bold text-blue-600' : 'text-gray-700'}`}
                                            >
                                              <div className={`w-2 h-2 rounded-full ${c.color.split(' ')[0].replace('bg-', 'bg-opacity-100 bg-')}`} />
                                              {c.name[language]}
                                            </button>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                              
                              {course ? (
                                <div className="mt-2">
                                  <h3 className="font-bold text-[13px] leading-tight mb-1">{course.name[language]}</h3>
                                  <div className="flex items-center gap-1 text-[9px] font-medium opacity-70">
                                    <CheckCircle2 size={10} />
                                    2 {t('hoursSuffix')}
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-auto text-[8px] font-bold uppercase tracking-widest opacity-30">
                                  {t('free')}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-6 py-4 text-xs font-serif font-bold text-gray-400 uppercase tracking-wider">{t('day')}</th>
                          {SLOT_TIMES.map(st => (
                            <th key={st.label.en} className="px-6 py-4 text-xs font-serif font-bold text-gray-400 uppercase tracking-wider">
                              {st.label[language]} ({st.time.split(' - ')[0]})
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {DAYS.map((day, dayIdx) => (
                          <tr key={day.en} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-bold text-gray-900">{day[language]}</span>
                            </td>
                            {[0, 1, 2].map(slotIdx => {
                              const courseId = schedule[currentWeek][dayIdx][slotIdx];
                              const course = getCourseById(courseId);
                              return (
                                <td key={slotIdx} className="px-6 py-4">
                                  {course ? (
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold border ${course.color}`}>
                                      <div className={`w-1.5 h-1.5 rounded-full ${course.color.split(' ')[0].replace('bg-', 'bg-opacity-100 bg-')}`} />
                                      {course.name[language]}
                                    </div>
                                  ) : (
                                    <span className="text-[10px] font-medium text-gray-300 italic">{t('noClass')}</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Legend */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-serif font-bold text-gray-400 uppercase tracking-wider mb-4">{t('legend')}</h3>
              <div className="flex flex-wrap gap-3">
                {COURSES.map(course => (
                  <div key={course.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${course.color}`}>
                    {course.name[language]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-serif font-bold text-gray-900">{t('title')}</h3>
            <p className="text-sm text-gray-500">Optimized Course Scheduling Engine v1.1</p>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <div className="text-2xl font-black text-blue-600">146</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('totalHours')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-blue-600">73</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('totalSessions')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-blue-600">10</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('weeks')}</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
