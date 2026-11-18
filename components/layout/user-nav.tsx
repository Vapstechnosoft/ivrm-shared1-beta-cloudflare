'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import SignOut from './sign-out';

export function UserNav({ session: initialSession }: { session: Session | null }) {
    const { data: clientSession } = useSession();
    const session = clientSession || initialSession;

    const rawName = session?.name || session?.username || session?.email || '';
    const isDefaultName = !rawName || rawName.trim().toUpperCase() === 'DEFAULT USER' || rawName.trim().toUpperCase() === 'DEFAULTUSER';
    const displayName = isDefaultName ? (session?.username || session?.email || '') : rawName;
    const initialLetter = displayName?.[0]?.toUpperCase() || 'U';

    const rawDesig = session?.designation || session?.role || '';
    const isActiveUserPlaceholder = !rawDesig || rawDesig.trim().toUpperCase() === 'ACTIVE USER' || rawDesig.trim().toUpperCase() === 'ACTIVEUSER';
    const displayRole = isActiveUserPlaceholder ? (session?.role || 'MEMBER') : rawDesig;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant='ghost'
                    className='group relative flex items-center gap-2 px-1 transition-all duration-300 hover:bg-transparent'>
                    <div className='relative'>
                        <Avatar className='size-9 border-2 border-white shadow-sm ring-2 ring-orange-500/10'>
                            <AvatarImage src={session?.user_image ?? ''} alt={displayName} />
                            <AvatarFallback className="bg-orange-50 text-orange-600 font-bold">{initialLetter}</AvatarFallback>
                        </Avatar>
                        <div className='absolute inset-0 rounded-full bg-orange-500/0 blur-md transition-all duration-500 group-hover:bg-orange-500/10' />
                    </div>
                    <div className="hidden md:flex flex-col items-start text-left gap-0.5">
                        <p className='text-[12px] font-black tracking-tight leading-none text-gray-800 uppercase'>{displayName}</p>
                        <p className="text-[9px] font-bold text-orange-600/80 uppercase tracking-wider">{displayRole}</p>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className='w-64 rounded-2xl border-white/40 bg-white/80 p-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] backdrop-blur-2xl'
                align='end'
                forceMount>
                <div className='group/card relative mb-2 overflow-hidden rounded-xl border border-white/60 bg-white/50 p-4 shadow-[inset_0_1px_10px_rgba(255,255,255,0.7)]'>
                    <div className='absolute top-0 right-0 p-3 opacity-10'>
                        <Avatar className='size-12 rotate-12 grayscale transition-transform duration-500 group-hover/card:rotate-0'>
                            <AvatarImage src={session?.user_image ?? ''} />
                        </Avatar>
                    </div>
                    <div className='flex flex-col space-y-2 relative z-10'>
                        <span className='font-black text-[9px] text-orange-600 uppercase tracking-[0.2em]'>IDENTITY PROFILE</span>
                        <div>
                            <p className='font-bold text-base leading-tight text-gray-900'>{displayName}</p>
                            {session?.email && <p className='text-gray-500 text-[11px] font-medium'>{session?.email}</p>}
                        </div>
                        {displayRole && (
                            <div className="flex items-center gap-2 pt-1">
                                <div className="px-2 py-0.5 rounded-full bg-orange-100 text-[9px] font-black text-orange-600 uppercase tracking-wider">
                                    {displayRole}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <DropdownMenuSeparator className='my-2 bg-gray-100/50' />
                <SignOut />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
