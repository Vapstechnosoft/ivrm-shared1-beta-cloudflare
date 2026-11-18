'use client';
import Logo from '@/components/layout/navigation/logo';
import { cn } from '@/lib/utils';
import { Award, BookOpen, Bus, Calendar, LayoutDashboard, Library, LogOut, Settings, UserCircle, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, url: '/school-admin' },
    { title: 'Students', icon: Users, url: '/school-admin/students' },
    { title: 'Teachers', icon: UserCircle, url: '/school-admin/teachers' },
    { title: 'Classes', icon: BookOpen, url: '/school-admin/classes' },
    { title: 'Attendance', icon: Calendar, url: '/school-admin/attendance' },
    { title: 'Exams & Results', icon: Award, url: '/school-admin/exams' },
    { title: 'Fees Management', icon: Wallet, url: '/school-admin/fees' },
    { title: 'Transport', icon: Bus, url: '/school-admin/transport' },
    { title: 'Library', icon: Library, url: '/school-admin/library' },
    { title: 'Settings', icon: Settings, url: '/school-admin/settings' }
];

export function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                'sticky top-0 z-50 flex h-screen flex-col border-slate-200 border-r bg-white transition-all duration-500',
                collapsed ? 'w-20' : 'w-64'
            )}>
            <div className='flex h-20 items-center justify-between border-slate-50 border-b px-6'>
                {!collapsed && <Logo className='h-8 transition-opacity duration-300' />}
                {collapsed && <div className='mx-auto h-8 w-8 rounded-lg bg-indigo-600' />}
            </div>

            <div className='custom-scrollbar flex-1 space-y-2 overflow-y-auto px-4 py-6'>
                {menuItems.map((item) => {
                    const isActive = pathname === item.url;
                    return (
                        <Link
                            key={item.title}
                            href={item.url}
                            className={cn(
                                'group relative flex items-center gap-3 rounded-xl p-3 transition-all',
                                isActive
                                    ? 'bg-indigo-600 font-bold text-white shadow-indigo-100 shadow-lg'
                                    : 'font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            )}>
                            <item.icon
                                size={22}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={cn('shrink-0', isActive ? 'text-white' : 'group-hover:text-indigo-600')}
                            />
                            {!collapsed && <span className='truncate'>{item.title}</span>}
                            {isActive && !collapsed && <div className='absolute right-3 h-1.5 w-1.5 animate-pulse rounded-full bg-white' />}
                            {collapsed && (
                                <div className='pointer-events-none absolute left-full z-50 ml-4 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-white text-xs opacity-0 shadow-xl transition-opacity group-hover:opacity-100'>
                                    {item.title}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>

            <div className='border-slate-100 border-t p-4'>
                {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                <button
                    onClick={onToggle}
                    className='group flex w-full items-center gap-3 rounded-xl p-3 font-bold text-slate-500 transition-all hover:bg-slate-50 hover:text-red-600'>
                    <LogOut size={22} className='shrink-0 transition-transform group-hover:rotate-12' />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
