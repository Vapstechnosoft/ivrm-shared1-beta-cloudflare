'use client';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Book, BookOpen, ChevronRight, Clock, MapPin, X } from 'lucide-react';
import type React from 'react';

// --- Stat Card ---
export interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    secondaryIcon?: React.ReactNode;
}

export const DashboardStatCard: React.FC<StatCardProps> = ({ title, value, icon, color, secondaryIcon }) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={cn(
                'relative overflow-hidden rounded-3xl p-6 shadow-xl transition-all duration-300',
                'border border-white/20 bg-white backdrop-blur-xl',
                'group cursor-default'
            )}>
            <div className={cn('-right-4 -top-4 absolute h-24 w-24 rounded-full opacity-10', color)} />

            <div className='relative z-10 flex items-center justify-between'>
                <div className='flex flex-col space-y-2'>
                    <span className='font-medium text-slate-500 text-sm uppercase tracking-wider'>{title}</span>
                    <h3 className='font-bold text-3xl text-slate-900'>{value}</h3>
                </div>
                <div className={cn('flex items-center justify-center rounded-2xl p-4 text-white shadow-lg', color)}>{icon}</div>
            </div>

            {secondaryIcon && (
                <div className='-bottom-4 -right-2 group-hover:-rotate-12 absolute z-0 transform opacity-[0.08] transition-all duration-500 group-hover:scale-110 group-hover:opacity-20'>
                    {secondaryIcon}
                </div>
            )}
        </motion.div>
    );
};

// --- Announcement Item ---
export interface AnnouncementProps {
    title: string;
    date: string;
    status: 'New' | 'Released' | 'Completed' | 'Due';
    icon: React.ReactNode;
    color: string;
}

export const AnnouncementItem: React.FC<AnnouncementProps> = ({ title, date, status, icon, color }) => {
    const statusColors = {
        New: 'bg-indigo-500 text-white',
        Released: 'bg-orange-500 text-white',
        Completed: 'bg-teal-500 text-white',
        Due: 'bg-rose-500 text-white'
    };

    return (
        <div className='group flex items-center gap-4 rounded-2xl p-3 transition-colors hover:bg-slate-50'>
            <div className={cn('rounded-xl p-3 text-white', color)}>{icon}</div>
            <div className='flex-1'>
                <h4 className='font-semibold text-slate-800 transition-colors group-hover:text-indigo-600'>{title}</h4>
                <p className='text-slate-400 text-xs'>{date}</p>
            </div>
            <span className={cn('rounded-full px-3 py-1 font-bold text-[10px] uppercase', statusColors[status])}>{status}</span>
        </div>
    );
};

// --- Action Header ---
export const SectionHeader: React.FC<{ title: string; onActionClick?: () => void; actionLabel?: string }> = ({
    title,
    onActionClick,
    actionLabel = 'View All'
}) => {
    return (
        <div className='mb-4 flex items-center justify-between'>
            <h3 className='font-bold text-slate-800 text-xl'>{title}</h3>
            {onActionClick && (
                <button
                    onClick={onActionClick}
                    className='flex items-center gap-1 rounded-lg border border-slate-100 px-3 py-1.5 font-semibold text-slate-400 text-xs transition-colors hover:border-slate-200 hover:text-slate-600'>
                    {actionLabel} <ChevronRight className='h-3 w-3' />
                </button>
            )}
        </div>
    );
};

// --- Pending Application Table ---
export const ApplicationsTable: React.FC<{ data: any[] }> = ({ data }) => {
    return (
        <div className='overflow-x-auto'>
            <table className='w-full border-separate border-spacing-y-3 text-left'>
                <thead>
                    <tr className='font-bold text-slate-400 text-xs uppercase tracking-wider'>
                        <th className='px-4 py-2'>Student Name</th>
                        <th className='px-4 py-2'>Applied Class</th>
                        <th className='px-4 py-2'>Status</th>
                        <th className='px-4 py-2'>Applied Date</th>
                    </tr>
                </thead>
                <tbody className='font-medium text-sm'>
                    {data.map((item, idx) => (
                        <tr key={idx} className='group rounded-2xl transition-colors hover:bg-slate-50/50'>
                            <td className='bg-white px-4 py-3 first:rounded-l-2xl group-hover:bg-slate-50/50'>
                                <div>
                                    <div className='font-bold text-slate-800'>{item.name}</div>
                                    <div className='text-[10px] text-slate-400'>{item.id}</div>
                                </div>
                            </td>
                            <td className='bg-white px-4 py-3 text-slate-600 group-hover:bg-slate-50/50'>{item.class}</td>
                            <td className='bg-white px-4 py-3 group-hover:bg-slate-50/50'>
                                <span className='rounded-lg bg-orange-500 px-3 py-1 font-bold text-[10px] text-white'>{item.status}</span>
                            </td>
                            <td className='bg-white px-4 py-3 text-slate-400 text-xs last:rounded-r-2xl group-hover:bg-slate-50/50'>
                                {item.date}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- Reservation History Modal ---
export const ReservationHistoryModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const history = [
        { id: 1, title: 'Principles of Physics', author: 'Resnick Halliday', date: 'April 20, 2024', status: 'Approved', type: 'Hardcopy' },
        { id: 2, title: 'Introduction to Algorithms', author: 'Cormen et al.', date: 'April 15, 2024', status: 'Waiting', type: 'E-Book' },
        {
            id: 3,
            title: 'Modern Organic Chemistry',
            author: 'Maitland Jones',
            date: 'April 10, 2024',
            status: 'Rejected',
            type: 'Hardcopy'
        },
        { id: 4, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', date: 'March 25, 2024', status: 'Completed', type: 'Hardcopy' }
    ];

    const statusColors: any = {
        Approved: 'bg-teal-100 text-teal-600',
        Waiting: 'bg-orange-100 text-orange-600',
        Rejected: 'bg-rose-100 text-rose-600',
        Completed: 'bg-slate-100 text-slate-600'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className='fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm'
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className='-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-[101] w-full max-w-lg overflow-hidden rounded-[32px] bg-white shadow-2xl'>
                        <div className='space-y-6 p-8'>
                            <div className='flex items-center justify-between'>
                                <div className='space-y-1'>
                                    <h3 className='font-black text-2xl text-slate-800 tracking-tight'>Reservation History</h3>
                                    <p className='font-medium text-slate-400 text-sm'>Track your book requests and status</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors hover:text-slate-800'>
                                    <X className='h-5 w-5' />
                                </button>
                            </div>

                            <div className='custom-scrollbar max-h-[400px] space-y-4 overflow-y-auto pr-2'>
                                {history.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        whileHover={{ x: 5 }}
                                        className='group flex items-center gap-4 rounded-2xl border border-slate-50 p-4 transition-all hover:bg-slate-50'>
                                        <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500'>
                                            <Book className='h-6 w-6' />
                                        </div>
                                        <div className='min-w-0 flex-1'>
                                            <div className='flex items-center justify-between gap-2'>
                                                <h4 className='truncate font-bold text-slate-800'>{item.title}</h4>
                                                <span
                                                    className={cn(
                                                        'rounded px-2 py-0.5 font-black text-[10px] uppercase tracking-wider',
                                                        statusColors[item.status]
                                                    )}>
                                                    {item.status}
                                                </span>
                                            </div>
                                            <div className='mt-1 flex items-center gap-3'>
                                                <div className='flex items-center gap-1 font-bold text-[10px] text-slate-400'>
                                                    <Clock className='h-3 w-3' />
                                                    {item.date}
                                                </div>
                                                <div className='flex items-center gap-1 font-bold text-[10px] text-slate-400'>
                                                    <MapPin className='h-3 w-3' />
                                                    {item.type}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <button
                                onClick={onClose}
                                className='w-full rounded-2xl bg-indigo-600 py-4 font-black text-white shadow-indigo-100 shadow-lg transition-colors hover:bg-indigo-700'>
                                Done
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
// --- Recent Results Table ---
export const RecentResultsTable: React.FC<{ data: any[] }> = ({ data }) => {
    return (
        <div className='overflow-x-auto'>
            <table className='w-full border-separate border-spacing-y-2 text-left'>
                <thead>
                    <tr className='px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest'>
                        <th className='pb-2'>Subject</th>
                        <th className='pb-2'>Exam</th>
                        <th className='pb-2'>Marks</th>
                        <th className='pb-2'>Grade</th>
                    </tr>
                </thead>
                <tbody className='font-medium text-sm'>
                    {data.map((item, idx) => (
                        <tr key={idx} className='group transition-colors hover:bg-slate-50'>
                            <td className='py-3 font-bold text-slate-800'>{item.subject}</td>
                            <td className='py-3 text-slate-500 text-xs'>{item.exam}</td>
                            <td className='py-3'>
                                <span className='font-black text-slate-800'>{item.marks}</span>
                                <span className='text-[10px] text-slate-400'> / {item.total}</span>
                            </td>
                            <td className='py-3'>
                                <span
                                    className={cn(
                                        'rounded px-2 py-0.5 font-black text-[10px]',
                                        item.grade === 'A+' ? 'bg-teal-100 text-teal-600' : 'bg-indigo-100 text-indigo-600'
                                    )}>
                                    {item.grade}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- Library Status Item ---
export const LibraryStatus: React.FC<{ title: string; dueDate: string; isOverdue?: boolean }> = ({ title, dueDate, isOverdue }) => {
    return (
        <div className='group flex items-center gap-3 rounded-2xl border border-slate-50 bg-white p-3 transition-all hover:border-indigo-100'>
            <div
                className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl',
                    isOverdue ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
                )}>
                <BookOpen className='h-5 w-5' />
            </div>
            <div className='flex-1'>
                <div className='line-clamp-1 font-bold text-slate-800 text-sm'>{title}</div>
                <div className={cn('font-medium text-[10px]', isOverdue ? 'text-rose-500' : 'text-slate-400')}>
                    {isOverdue ? 'Overdue' : 'Due'}: {dueDate}
                </div>
            </div>
        </div>
    );
};

// --- Timetable Row ---
export const TimetableRow: React.FC<{ time: string; subject: string; teacher: string; icon: React.ReactNode; color: string }> = ({
    time,
    subject,
    teacher,
    icon,
    color
}) => {
    return (
        <div className='group flex items-center gap-4 rounded-2xl border border-slate-50 bg-white p-4 transition-all hover:border-indigo-100 hover:shadow-md'>
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg', color)}>{icon}</div>
            <div className='flex-1'>
                <div className='font-bold text-slate-400 text-xs uppercase tracking-wider'>{time}</div>
                <div className='font-bold text-slate-800 transition-colors group-hover:text-indigo-600'>{subject}</div>
                <div className='text-slate-500 text-xs'>{teacher}</div>
            </div>
            <div className='h-2 w-2 rounded-full bg-slate-200 group-hover:bg-indigo-400' />
        </div>
    );
};

// --- Assignment Item ---
export const AssignmentItem: React.FC<{ subject: string; task: string; dueDate: string; progress: number; color: string }> = ({
    subject,
    task,
    dueDate,
    progress,
    color
}) => {
    return (
        <div className='group space-y-3 rounded-2xl border border-transparent bg-slate-50/50 p-4 transition-all hover:border-slate-100 hover:bg-white hover:shadow-sm'>
            <div className='flex items-start justify-between'>
                <div>
                    <span
                        className={cn(
                            'mb-1 inline-block rounded-md px-2 py-0.5 font-black text-[10px] text-white uppercase tracking-widest',
                            color
                        )}>
                        {subject}
                    </span>
                    <h4 className='line-clamp-1 font-bold text-slate-800'>{task}</h4>
                </div>
                <div className='font-bold text-[10px] text-slate-400'>Due: {dueDate}</div>
            </div>
            <div className='space-y-1'>
                <div className='flex justify-between font-bold text-[10px] text-slate-500 uppercase'>
                    <span>Progress</span>
                    <span>{progress}%</span>
                </div>
                <div className='h-1.5 w-full overflow-hidden rounded-full bg-slate-200'>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className={cn('h-full rounded-full', color)} />
                </div>
            </div>
        </div>
    );
};

// --- Event Card ---
export const EventCard: React.FC<{ dateRange: string; title: string; isNew?: boolean }> = ({ dateRange, title, isNew }) => {
    return (
        <div className='group relative flex cursor-default flex-col gap-2 rounded-2xl border border-slate-50 bg-white p-4 transition-colors hover:bg-indigo-50/50'>
            <div className='font-bold text-indigo-500 text-xs'>{dateRange}</div>
            <div className='line-clamp-1 font-bold text-slate-800 group-hover:text-indigo-700'>{title}</div>
            {isNew && (
                <span className='absolute top-4 right-4 rounded bg-orange-500 px-2 py-0.5 font-bold text-[8px] text-white uppercase italic'>
                    New
                </span>
            )}
        </div>
    );
};
