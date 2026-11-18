'use client';

import { cn } from '@/lib/utils';
import { markMessageAsRead } from '@/server/staff-portal/interactions';
import type { IInteractionsInitialData, IMessage } from '@/types/staff-portal/interactions';
import { format } from 'date-fns';
import { Calendar, Mail, RefreshCw, Send, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ViewReplyModal } from './view-reply-modal';

interface InboxTabProps {
    data: IInteractionsInitialData;
    onRefresh: () => void;
    roleFlg: string;
}
export const dynamic = 'force-dynamic';
export function InboxTab({ data, onRefresh, roleFlg }: InboxTabProps) {
    const [searchFrom, setSearchFrom] = useState('');
    const [searchClass, setSearchClass] = useState('');
    const [searchSection, setSearchSection] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<IMessage | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Apply read flags and metadata to all messages without grouping
    const processedMessages = useMemo(() => {
        const rawMsgs = data.getinboxmsg || data.result || [];
        const readFlags = data.getinboxmsg_readflg || data.result1 || [];

        return rawMsgs.map((curr: IMessage) => {
            const flag = readFlags.find((f) => f.ISMINT_Id === curr.ISMINT_Id);
            const admNo = curr.AMST_AdmNo || (curr as any).AMST_AdmissionNo || (curr as any).amst_admno;

            return {
                ...curr,
                ISTINT_ReadFlg: flag ? flag.ISTINT_ReadFlg : 0,
                AMST_AdmNo: admNo
            };
        });
    }, [data]);

    const filteredMessages = processedMessages.filter((msg) => {
        const matchFrom = (msg.Sender || '').toLowerCase().includes(searchFrom.toLowerCase());
        const matchClass = (msg.Classname || '').toLowerCase().includes(searchClass.toLowerCase());
        const matchSection = (msg.Sectionname || '').toLowerCase().includes(searchSection.toLowerCase());
        return matchFrom && matchClass && matchSection;
    });

    const handleViewMessage = async (msg: IMessage) => {
        setSelectedMessage(msg);
        setIsViewModalOpen(true);

        if (msg.ISTINT_ReadFlg === 0) {
            try {
                await markMessageAsRead(msg.ISTINT_Id);
            } catch (error) {
                console.error('Failed to mark message as read:', error);
            }
        }
    };

    return (
        <div className='flex flex-col gap-6'>
            {/* Legacy Style Header with Count Badge and Yellow Border */}
            <div className='flex flex-col justify-between gap-4 border-[#fbbf24] border-b-2 pb-3 md:flex-row md:items-center'>
                <div className='flex flex-col gap-0.5'>
                    <div className='flex items-center gap-2'>
                        <h2 className='font-black text-[#1e40af] text-[14px] uppercase tracking-wider'>MESSAGE INBOX</h2>
                        <span className='flex h-6 min-w-[24px] items-center justify-center rounded-sm bg-[#1e40af] px-1.5 font-black text-[10px] text-white shadow-sm'>
                            {filteredMessages.length}
                        </span>
                    </div>
                    <p className='mt-0.5 font-black text-[#2563eb] text-[10px] uppercase tracking-tight'>
                        BLUE COLOUR ON INTERACTION SAYS UNREAD
                    </p>
                </div>

                <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-2 font-black text-[10px] text-slate-500 uppercase'>
                        <Calendar className='h-3.5 w-3.5 text-slate-400' />
                        {format(new Date(), 'MM/dd/yyyy hh:mm a')}
                        <button
                            onClick={onRefresh}
                            className='ml-2 rounded-sm border border-slate-200 bg-white p-1 px-1.5 transition-all hover:bg-slate-100'
                            title='Refresh'>
                            <RefreshCw className='h-3 w-3 text-slate-600' />
                        </button>
                    </div>
                </div>
            </div>

            {/* Triple Search Filters - Matches Legacy Layout */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div className='relative'>
                    <input
                        className='h-10 w-full rounded-none border border-slate-300 bg-white px-3 font-bold text-[11px] transition-all placeholder:text-slate-400 focus:border-blue-500 focus:outline-none'
                        placeholder='Search by From Username...'
                        value={searchFrom}
                        onChange={(e) => setSearchFrom(e.target.value)}
                    />
                </div>
                <div className='relative'>
                    <input
                        className='h-10 w-full rounded-none border border-slate-300 bg-white px-3 font-bold text-[11px] transition-all placeholder:text-slate-400 focus:border-blue-500 focus:outline-none'
                        placeholder='Search by Classname...'
                        value={searchClass}
                        onChange={(e) => setSearchClass(e.target.value)}
                    />
                </div>
                <div className='relative'>
                    <input
                        className='h-10 w-full rounded-none border border-slate-300 bg-white px-3 font-bold text-[11px] transition-all placeholder:text-slate-400 focus:border-blue-500 focus:outline-none'
                        placeholder='Search by Sectionname...'
                        value={searchSection}
                        onChange={(e) => setSearchSection(e.target.value)}
                    />
                </div>
            </div>

            {/* Legacy List Items */}
            <div className='flex flex-col gap-3'>
                {filteredMessages.length === 0 ? (
                    <div className='border border-slate-200 border-dashed bg-slate-50/50 p-20 text-center font-black text-[11px] text-slate-300 uppercase tracking-[0.2em]'>
                        NO MESSAGES FOUND IN YOUR INBOX
                    </div>
                ) : (
                    filteredMessages.map((msg, index) => {
                        const isRead = msg.ISTINT_ReadFlg === 1;
                        const isComposedByMe =
                            msg.ISMINT_ComposedById === (data as any).userhrmE_Id || msg.ISMINT_ComposedById === (data as any).userAMST_Id;

                        return (
                            <div
                                key={`${msg.ISMINT_Id}-${msg.ISTINT_Id}`}
                                onClick={() => handleViewMessage(msg)}
                                className={cn(
                                    'relative flex cursor-pointer items-center border bg-white p-4 shadow-sm transition-all hover:shadow-md',
                                    !isRead ? 'border-l-4 border-l-blue-600' : 'border-slate-200'
                                )}>
                                {/* Sl No */}
                                <div className='w-10 shrink-0 font-bold text-[11px] text-slate-400'>{index + 1}</div>

                                {/* User Icon */}
                                <div className='mx-4 shrink-0'>
                                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-slate-50'>
                                        <User className='h-4 w-4 text-green-600' />
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className='min-w-0 flex-1 pr-4'>
                                    <h3 className={cn('truncate font-black text-[12px]', !isRead ? 'text-[#1e40af]' : 'text-slate-600')}>
                                        {msg.ISMINT_Subject}
                                    </h3>
                                </div>

                                {/* Metadata and Status Icon */}
                                <div className='flex items-center gap-12'>
                                    <div className='hidden items-center gap-2 font-black text-[10px] text-slate-600 uppercase tracking-tighter lg:flex'>
                                        <span>{isComposedByMe ? `To:${msg.Receiver}` : `From:${msg.Sender}`}</span>
                                        {msg.Classname && (
                                            <span>
                                                Class: <span className='text-slate-900'>{msg.Classname}</span>
                                            </span>
                                        )}
                                        {msg.Sectionname && (
                                            <span>
                                                Section: <span className='text-slate-900'>{msg.Sectionname}</span>
                                            </span>
                                        )}
                                        {msg.AMST_AdmNo && (
                                            <span>
                                                ADM NO: <span className='text-slate-900'>{msg.AMST_AdmNo}</span>
                                            </span>
                                        )}
                                    </div>

                                    <div className='shrink-0 p-2'>
                                        {isComposedByMe ? (
                                            <Send className='h-5 w-5 text-blue-400' />
                                        ) : (
                                            <Mail
                                                className={cn(
                                                    'h-5 w-5 transition-transform hover:scale-110',
                                                    !isRead ? 'text-[#1e40af]' : 'text-slate-300'
                                                )}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {isViewModalOpen && selectedMessage && (
                <ViewReplyModal
                    isOpen={isViewModalOpen}
                    onClose={() => {
                        setIsViewModalOpen(false);
                        setSelectedMessage(null);
                        onRefresh();
                    }}
                    message={selectedMessage}
                    roleFlg={roleFlg}
                    interactionsData={data}
                />
            )}
        </div>
    );
}
