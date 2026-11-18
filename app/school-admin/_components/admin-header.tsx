'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ArrowUpRight, Bell, ChevronDown, Menu, Search } from 'lucide-react';

export function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
    return (
        <header className='sticky top-0 z-40 flex h-20 items-center justify-between border-slate-200 border-b bg-white/80 px-6 backdrop-blur-md'>
            <div className='flex flex-1 items-center gap-6'>
                <Button variant='ghost' size='icon' className='text-slate-500' onClick={onMenuClick}>
                    <Menu size={24} />
                </Button>

                <div className='group relative hidden w-full max-w-md items-center md:flex'>
                    <Search className='absolute left-4 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-indigo-600' />
                    <Input
                        placeholder='Search for students, subjects, staff...'
                        className='h-12 rounded-2xl border-none bg-slate-100 pl-12 font-medium transition-all focus-visible:ring-4 focus-visible:ring-indigo-100'
                    />
                </div>
            </div>

            <div className='flex items-center gap-4'>
                <div className='group relative'>
                    <Button variant='ghost' size='icon' className='relative rounded-xl hover:bg-slate-100'>
                        <Bell size={22} className='text-slate-600 transition-colors group-hover:text-indigo-600' />
                        {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
                        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                        <span className='absolute top-2.5 right-2.5 h-2.5 w-2.5 bg-red-500 border-2 border-white rounded-full' />
                    </Button>
                </div>

                <div className='mx-2 hidden h-10 w-[1px] bg-slate-200 sm:block' />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                        <button className='flex items-center gap-3 rounded-2xl p-1 transition-all hover:bg-slate-50'>
                            <Avatar className='h-11 w-11 rounded-xl shadow-sm ring-2 ring-white'>
                                <AvatarImage src='' />
                                <AvatarFallback className='bg-indigo-600 font-black text-white'>AD</AvatarFallback>
                            </Avatar>
                            <div className='hidden pr-2 text-left sm:block'>
                                <p className='font-black text-slate-900 text-sm leading-none'>Admin Jack</p>
                                <p className='mt-1.5 flex items-center gap-1 font-bold text-[11px] text-slate-500 uppercase tracking-widest'>
                                    Principal <ArrowUpRight size={10} className='text-emerald-500' />
                                </p>
                            </div>
                            <ChevronDown size={14} className='mr-1 text-slate-400' />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='mt-2 w-64 rounded-2xl border-slate-200 p-2'>
                        <DropdownMenuLabel className='p-3 font-black text-slate-900'>Workspace</DropdownMenuLabel>
                        <DropdownMenuSeparator className='bg-slate-100' />
                        <DropdownMenuItem className='cursor-pointer rounded-xl p-3 font-bold text-slate-600 hover:text-indigo-600 focus:bg-indigo-50'>
                            Profile Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem className='cursor-pointer rounded-xl p-3 font-bold text-slate-600 hover:text-indigo-600 focus:bg-indigo-50'>
                            School Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className='bg-slate-100' />
                        <DropdownMenuItem
                            // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
                            onSelect={() => (window.location.href = '/school-admin/login')}
                            className='cursor-pointer rounded-xl p-3 font-black text-red-600 hover:text-red-700 focus:bg-red-50'>
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
