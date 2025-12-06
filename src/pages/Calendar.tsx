import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RefreshCw, Download } from 'lucide-react';
import Navigation from '../components/Navigation';
import BackButton from '../components/BackButton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from 'date-fns';

interface DaySchedule {
  date: Date;
  parentId: string;
  parentName: string;
  pickupTime?: string;
  dropoffTime?: string;
  location?: string;
  isHoliday?: boolean;
  holidayName?: string;
  notes?: string;
}

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showGoogleCalendarModal, setShowGoogleCalendarModal] = useState(false);

  // Mock schedule data
  const schedule: DaySchedule[] = generateMockSchedule();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getDaySchedule = (date: Date): DaySchedule | undefined => {
    return schedule.find((s) => isSameDay(s.date, date));
  };

  const handleDayClick = (date: Date) => {
    if (isSameMonth(date, currentMonth)) {
      setSelectedDay(date);
      setShowSwapModal(true);
    }
  };

  const handleSwapRequest = () => {
    // TODO: Implement swap request logic
    alert('Swap request sent!');
    setShowSwapModal(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navigation />

      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <BackButton />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGoogleCalendarModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-zinc-300 text-zinc-700 rounded-md hover:bg-zinc-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Sync with Google</span>
            </button>
              <button
                onClick={() => setView('month')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  view === 'month'
                    ? 'bg-primary-600 text-white'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  view === 'week'
                    ? 'bg-primary-600 text-white'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                Week
              </button>
            </div>
        </div>
      </div>

      {/* Calendar */}
      <main className="container mx-auto px-4 pb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-zinc-800">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-zinc-100 rounded-md transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-4 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-zinc-100 rounded-md transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Weekday Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-semibold text-zinc-600 py-2">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {days.map((day) => {
              const daySchedule = getDaySchedule(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={day.toString()}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-24 p-2 border rounded-lg cursor-pointer transition-colors ${
                    !isCurrentMonth
                      ? 'bg-zinc-50 text-zinc-400'
                      : isCurrentDay
                      ? 'border-primary-500 bg-primary-50'
                      : daySchedule?.isHoliday
                      ? 'border-alert-400 bg-alert-50'
                      : daySchedule?.parentId === 'parent1'
                      ? 'border-secondary-300 bg-secondary-50 hover:bg-secondary-100'
                      : 'border-primary-300 bg-primary-50 hover:bg-primary-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-medium ${isCurrentDay ? 'text-primary-600' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    {daySchedule?.isHoliday && (
                      <CalendarIcon className="w-4 h-4 text-alert-600" />
                    )}
                  </div>
                  {isCurrentMonth && daySchedule && (
                    <div className="text-xs space-y-1">
                      <p className="font-medium text-zinc-700">{daySchedule.parentName}</p>
                      {daySchedule.pickupTime && (
                        <p className="text-zinc-600">📍 {daySchedule.pickupTime}</p>
                      )}
                      {daySchedule.isHoliday && (
                        <p className="text-alert-700 font-medium">{daySchedule.holidayName}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-secondary-200 border border-secondary-300 rounded"></div>
              <span className="text-zinc-600">Parent A</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary-200 border border-primary-300 rounded"></div>
              <span className="text-zinc-600">Parent B</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-alert-200 border border-alert-400 rounded"></div>
              <span className="text-zinc-600">Holiday</span>
            </div>
          </div>
        </div>
      </main>

      {/* Swap Request Modal */}
      <AlertDialog open={showSwapModal} onOpenChange={setShowSwapModal}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-primary-600" />
              <AlertDialogTitle>Request Schedule Swap</AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-2">
                <p className="text-zinc-600">
                  Request to swap custody for{' '}
                  <span className="font-semibold">{selectedDay && format(selectedDay, 'MMMM d, yyyy')}</span>
                </p>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Current Assignment
                  </label>
                  <div className="p-3 bg-zinc-50 rounded-md">
                    <p className="text-zinc-800">{selectedDay && (getDaySchedule(selectedDay)?.parentName || 'Not assigned')}</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-zinc-700 mb-2">
                    Reason (optional)
                  </label>
                  <textarea
                    id="reason"
                    rows={3}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    placeholder="Why do you need this swap?"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSwapRequest}>Send Request</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Google Calendar Sync Modal */}
      <AlertDialog open={showGoogleCalendarModal} onOpenChange={setShowGoogleCalendarModal}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <Download className="w-6 h-6 text-primary-600" />
              <AlertDialogTitle>Sync with Google Calendar</AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-2">
                <p className="text-zinc-600">
                  Keep your custody schedule in sync with Google Calendar. Your schedule will automatically
                  update when changes are made.
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg">
                    <div className="w-5 h-5 rounded-full bg-secondary-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-800">Two-way sync</p>
                      <p className="text-xs text-zinc-600">Changes in either calendar will sync automatically</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg">
                    <div className="w-5 h-5 rounded-full bg-secondary-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-800">Reminders included</p>
                      <p className="text-xs text-zinc-600">Get notifications before pickup/dropoff times</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg">
                    <div className="w-5 h-5 rounded-full bg-secondary-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-800">Private & secure</p>
                      <p className="text-xs text-zinc-600">Only you can see your synced events</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-alert-50 border border-alert-200 rounded-lg">
                  <p className="text-sm text-alert-800">
                    📱 You'll be redirected to Google to authorize calendar access
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // TODO: Implement Google Calendar OAuth flow
                alert('Google Calendar integration coming soon!');
                setShowGoogleCalendarModal(false);
              }}
            >
              Connect Google
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Mock data generator
function generateMockSchedule(): DaySchedule[] {
  const schedule: DaySchedule[] = [];
  const today = new Date();

  // Generate 60 days of schedule
  for (let i = -30; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Alternating weekly schedule
    const weekNumber = Math.floor(i / 7);
    const isParent1Week = weekNumber % 2 === 0;

    // Check for holidays
    const isHoliday = i === 5 || i === 15; // Mock holidays

    schedule.push({
      date,
      parentId: isParent1Week ? 'parent1' : 'parent2',
      parentName: isParent1Week ? 'Parent A' : 'Parent B',
      pickupTime: '5:00 PM',
      dropoffTime: '9:00 AM',
      location: 'School',
      isHoliday,
      holidayName: isHoliday ? (i === 5 ? 'Passover' : 'Hanukkah') : undefined,
    });
  }

  return schedule;
}
