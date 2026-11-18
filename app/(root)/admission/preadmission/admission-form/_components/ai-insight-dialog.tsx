'use client';

import { AdaptiveBody, AdaptiveDialog } from '@/components/ui/extension/adaptive-dialog';
import { Sparkles } from 'lucide-react';

export default function AiInsightDialog({
    isOpen,
    onClose,
    insight,
    seatStatus
}: {
    isOpen: boolean;
    onClose: () => void;
    insight: string;
    seatStatus?: string;
}) {
    return (
        <div className='flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4'>
            <AdaptiveDialog
                title="Seat Availability Insight"
                isOpen={isOpen}
                onClose={onClose}
                size='md'
                showCloseButton={true}
                isTitleRequired={false}
                className='max-h-[95vh] overflow-scroll'>
                <AdaptiveBody className='max-h-none overflow-visible p-0'>
                    <div className='flex flex-col items-center space-y-4 text-center pb-6'>
                        <div className='relative mt-4'>
                            <div className='absolute inset-0 animate-pulse rounded-full bg-purple-400 opacity-30 blur-2xl' />
                            <div className='zoom-in-50 relative animate-in rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 p-4 shadow-xl duration-500'>
                                <Sparkles className='zoom-in-0 h-16 w-16 animate-in text-white delay-200 duration-700' />
                            </div>
                        </div>

                        <div className='fade-in slide-in-from-bottom-4 animate-in space-y-4 delay-300 duration-500 mt-6'>
                            <h2 className='font-bold text-2xl text-purple-900 md:text-3xl'>
                                AI Seat Availability
                            </h2>
                            <div className='rounded-xl border border-purple-100 bg-purple-50/50 p-6 shadow-sm max-w-md mx-auto flex flex-col space-y-4'>
                                {seatStatus && (
                                    <div className='flex flex-col text-left'>
                                        <span className='text-xs font-bold text-purple-400 uppercase tracking-wider mb-1'>Seat Status</span>
                                        <span className='font-semibold text-purple-900'>{seatStatus}</span>
                                    </div>
                                )}
                                <div className='flex flex-col text-left'>
                                    <span className='text-xs font-bold text-purple-400 uppercase tracking-wider mb-1'>Insight</span>
                                    <p className='text-slate-700 text-sm md:text-base leading-relaxed'>
                                        {insight}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </AdaptiveBody>
            </AdaptiveDialog>
        </div>
    );
}
