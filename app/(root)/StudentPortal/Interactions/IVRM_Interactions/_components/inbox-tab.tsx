'use client';

import { cn } from '@/lib/utils';
import { deleteInteraction, markMessageAsRead } from '@/server/staff-portal/interactions';
import type { IInteractionsInitialData, IMessage } from '@/types/staff-portal/interactions';
import { format } from 'date-fns';
import { Mail, MessageSquare, RefreshCcw, Search, Trash2, User, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ViewReplyModal } from './view-reply-modal-component';

/**
 * InboxTab component for managing the message list and thread view.
 */

interface InboxTabProps {
    data: IInteractionsInitialData;
    onRefresh: () => void;
    roleFlg: string;
}
export const dynamic = 'force-dynamic';
export function InboxTab({ data, onRefresh, roleFlg }: InboxTabProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedIds, setExpandedIds] = useState<number[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<IMessage | null>(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const rawMessages = data.result || data.getinboxmsg || [];
    const readFlags = data.result1 || data.getinboxmsg_readflg || [];

    // Deduplicate messages by ISMINT_Id to ensure parity with backend's logical record count
    const messages = useMemo(() => {
        const unique: any[] = [];
        const seenIds = new Set();
        (rawMessages as any[]).forEach((m) => {
            if (m.ISMINT_Id && !seenIds.has(m.ISMINT_Id)) {
                seenIds.add(m.ISMINT_Id);
                unique.push(m);
            } else if (!m.ISMINT_Id) {
                unique.push(m);
            }
        });
        return unique;
    }, [rawMessages]);

    const isMessageRead = (msg: IMessage) => {
        const flag = readFlags.find((f) => f.ISMINT_Id === msg.ISMINT_Id);
        return flag ? flag.ISTINT_ReadFlg === 1 : msg.ISTINT_ReadFlg === 1;
    };

    const filteredMessages = messages.filter((msg: IMessage) => {
        const matchesSearch =
            (msg.ISMINT_Subject?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (msg.Sender?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (msg.Receiver?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    const toggleExpand = async (msg: IMessage) => {
        const id = msg.ISTINT_Id;
        const isRead = isMessageRead(msg);

        if (expandedIds.includes(id)) {
            setExpandedIds(expandedIds.filter((i) => i !== id));
        } else {
            setExpandedIds([...expandedIds, id]);
            // Mark as seen if unread
            if (!isRead) {
                try {
                    const res = await markMessageAsRead(id);
                    if (res.success) {
                        onRefresh(); // Refresh flags
                    }
                } catch (error) {
                    console.error('Error marking as read:', error);
                }
            }
        }
    };

    const handleDelete = async (msg: IMessage) => {
        if (!confirm('Are you sure you want to delete this interaction?')) return;

        try {
            const res = await deleteInteraction({ ISMINT_Id: msg.ISMINT_Id, ISTINT_Id: msg.ISTINT_Id });
            if (res.success) {
                toast.success(res.message || 'Interaction deleted successfully');
                onRefresh();
            } else {
                toast.error(res.message || 'Failed to delete interaction');
            }
        } catch (error) {
            toast.error('An error occurred during deletion');
        }
    };

    const openReply = async (msg: IMessage) => {
        setSelectedMessage(msg);
        setShowReplyModal(true);

        // Mark as read when opening reply if not already read
        if (!isMessageRead(msg)) {
            try {
                const res = await markMessageAsRead(msg.ISTINT_Id);
                if (res.success) {
                    onRefresh();
                }
            } catch (error) {
                console.error('Error marking as read from reply:', error);
            }
        }
    };

    return (
        <div className='flex flex-col gap-4'>
            {/* Legacy Style Header with Filters */}
            <div className='flex flex-col gap-2 border-b pb-4'>
                <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
                    <div className='flex flex-col gap-0.5'>
                        <div className='flex items-center gap-2'>
                            <h2 className='font-black text-[#1e40af] text-[12px] uppercase tracking-wider'>MESSAGE INBOX</h2>
                            <span className='flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#1e40af] px-1.5 font-black text-[9px] text-white'>
                                {messages.length}
                            </span>
                        </div>
                        <p className='font-black text-[#3b82f6] text-[10px] uppercase tracking-tight'>
                            BLUE COLOUR ON INTERACTION SAYS UNREAD
                        </p>
                    </div>

                    <div className='flex items-center gap-6'>
                        <div className='flex items-center gap-2 font-black text-[10px] text-slate-500 uppercase'>
                            <RefreshCcw
                                className='h-4 w-4 cursor-pointer text-[#1e40af] transition-all duration-700 hover:rotate-180'
                                onClick={onRefresh}
                            />
                            {isMounted ? format(new Date(), 'dd/MM/yyyy hh:mm a') : '   /  /     :   '}
                        </div>
                        <div className='relative'>
                            <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-3.5 w-3.5 text-slate-400' />
                            <input
                                className='h-9 w-[180px] rounded-none border-b bg-transparent pr-3 pl-9 font-bold text-[11px] outline-none transition-all focus:border-[#1e40af]'
                                placeholder='Search messages...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Legacy Style List */}
            <div className='flex flex-col overflow-hidden rounded-none border border-muted/60 bg-white shadow-sm'>
                {filteredMessages.length === 0 ? (
                    <div className='bg-muted/5 p-12 text-center font-bold text-[10px] text-muted-foreground/40 uppercase tracking-widest'>
                        No messages found in your inbox
                    </div>
                ) : (
                    filteredMessages.map((msg: IMessage, index: number) => {
                        const isExpanded = expandedIds.includes(msg.ISTINT_Id);
                        const isRead = isMessageRead(msg);
                        const isComposedByMe = msg.ISMINT_ComposedById === data.userhrmE_Id;

                        return (
                            <div
                                key={`${msg.ISMINT_Id || 'msg'}-${index}`}
                                className={cn(
                                    'group flex cursor-pointer flex-col border-b transition-all last:border-b-0',
                                    isRead ? 'bg-white' : 'bg-blue-50/10'
                                )}>
                                <div
                                    className='relative flex items-center gap-4 px-4 py-2 transition-all hover:bg-slate-50'
                                    onClick={() => toggleExpand(msg)}>
                                    {/* SL NO */}
                                    <div className='flex w-8 shrink-0 items-center justify-center border-slate-100 border-r pr-2 font-black text-[10px] text-slate-400'>
                                        {index + 1}
                                    </div>

                                    {/* Left Status Icon - Smaller */}
                                    <div className='flex h-6 w-6 shrink-0 items-center justify-center'>
                                        {msg.ISMINT_GroupOrIndFlg === 'Group' ? (
                                            <Users className='h-3 w-3 text-blue-600' />
                                        ) : (
                                            <User className='h-3 w-3 text-[#16a34a]' />
                                        )}
                                    </div>

                                    {/* Middle Subject - Larger Text, Bold if Unread */}
                                    <div className='min-w-0 flex-1'>
                                        <h3
                                            className={cn(
                                                'truncate text-[11px] uppercase tracking-normal',
                                                isRead ? 'font-bold text-black' : 'font-black text-[#1e40af]'
                                            )}>
                                            {msg.ISMINT_Subject}
                                        </h3>
                                    </div>

                                    {/* Sender Info - Compact */}
                                    <div className='hidden min-w-[250px] items-center justify-end gap-2 sm:flex'>
                                        <span className='font-bold text-[10px] text-slate-500 uppercase tracking-tight'>
                                            {isComposedByMe ? (
                                                <>
                                                    To:
                                                    <span className={cn('ml-1', isRead ? 'text-black' : 'text-slate-700')}>
                                                        {msg.Receiver}
                                                        {(msg.Classname || (msg as any).ASMCL_ClassName) &&
                                                            ` (${msg.Classname || (msg as any).ASMCL_ClassName}${msg.Sectionname || (msg as any).ASMC_SectionName ? ` - ${msg.Sectionname || (msg as any).ASMC_SectionName}` : ''})`}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    From:
                                                    <span className={cn('ml-1', isRead ? 'text-black' : 'text-slate-700')}>
                                                        {msg.Sender}
                                                        {(msg.Classname || (msg as any).ASMCL_ClassName) &&
                                                            ` (${msg.Classname || (msg as any).ASMCL_ClassName}${msg.Sectionname || (msg as any).ASMC_SectionName ? ` - ${msg.Sectionname || (msg as any).ASMC_SectionName}` : ''})`}
                                                    </span>
                                                </>
                                            )}
                                        </span>
                                    </div>

                                    {/* Right Message Icon - Simple Envelope */}
                                    <div className='flex w-8 shrink-0 items-center justify-center'>
                                        <Mail className={cn('h-3.5 w-3.5 transition-all', isRead ? 'text-slate-300' : 'text-[#1e40af]')} />
                                    </div>
                                </div>

                                {/* Expanded Content logic like screenshot */}
                                {isExpanded && (
                                    <div className='flex items-center justify-between border-slate-50 border-t bg-slate-50/50 px-14 py-3'>
                                        <div className='max-w-2xl px-2 font-bold text-[11px] text-slate-500 italic'>
                                            {msg.ISTINT_Interaction || msg.ISMINT_Interaction}
                                        </div>
                                        <div className='flex items-center gap-3'>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openReply(msg);
                                                }}
                                                className='flex items-center gap-1.5 font-black text-[#1e40af] text-[10px] uppercase tracking-tight hover:underline'>
                                                <MessageSquare className='h-3 w-3' />
                                                View & Reply
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(msg);
                                                }}
                                                className='rounded-sm p-1 px-1.5 text-sky-500 transition-all hover:bg-sky-100'
                                                title='Delete'>
                                                <Trash2 className='h-3.5 w-3.5' />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {showReplyModal && selectedMessage && (
                <ViewReplyModal
                    isOpen={showReplyModal}
                    onClose={() => {
                        setShowReplyModal(false);
                        setSelectedMessage(null);
                        onRefresh();
                    }}
                    message={selectedMessage}
                    roleFlg={roleFlg}
                    userhrmE_Id={data.userhrmE_Id || 0}
                />
            )}
        </div>
    );
}
