'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, PartyPopper, ThumbsUp } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { SUPER_ADMIN_WIZARD_STEPS, type WizardStep, findWizardStep } from './wizard-steps'

export function WizardNavigationBanner() {
    const pathname = usePathname();
    const router = useRouter();
    const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);

    const { step, index, prevStep, nextStep, totalSteps } = findWizardStep(pathname);

    // If current path is not part of the wizard, do not render
    if (!step || index === -1) {
        return null;
    }

    const progressPercentage = Math.round(((index + 1) / totalSteps) * 100);

    const handlePrevious = () => {
        if (prevStep) {
            router.push(prevStep.url);
        }
    };

    const handleNext = () => {
        if (nextStep) {
            router.push(nextStep.url);
        }
    };

    const handleStepSelect = (targetUrl: string) => {
        router.push(targetUrl);
    };

    // Group steps for the dropdown
    const groupedSteps = SUPER_ADMIN_WIZARD_STEPS.reduce(
        (acc, item) => {
            if (!acc[item.group]) {
                acc[item.group] = [];
            }
            acc[item.group].push(item);
            return acc;
        },
        {} as Record<string, WizardStep[]>
    );

    return (
        <div className='container mx-auto px-4 pt-4 pb-2 sm:px-6'>
            <div className='relative overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 p-3.5 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/95'>
                {/* Thin progress bar line at top edge */}
                <div className='absolute inset-x-0 top-0 h-1 bg-slate-100 dark:bg-slate-800'>
                    <div
                        className='h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500 transition-all duration-300'
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>

                <div className='flex flex-wrap items-center justify-between gap-3 pt-0.5'>
                    {/* Left: Previous Button */}
                    <div className='flex items-center gap-2'>
                        <Button
                            type='button'
                            variant='default'
                            onClick={handlePrevious}
                            disabled={!prevStep}
                            className={cn(
                                'h-10 rounded-lg px-5 font-bold text-white text-xs uppercase tracking-wider shadow-sm transition-all',
                                prevStep
                                    ? 'bg-[#1e40af] hover:bg-[#1d4ed8] hover:shadow-md active:scale-95 dark:bg-blue-600 dark:hover:bg-blue-500'
                                    : 'cursor-not-allowed bg-slate-300 text-slate-500 opacity-60 dark:bg-slate-800 dark:text-slate-600'
                            )}
                            title={prevStep ? `Go to Previous: ${prevStep.title}` : 'No previous step'}>
                            <ChevronLeft className='mr-1.5 h-4 w-4' />
                            PREVIOUS
                        </Button>

                        {prevStep && <span className='hidden text-slate-500 text-xs lg:inline-block'>&larr; {prevStep.title}</span>}
                    </div>

                    {/* Middle: Step Progress & Step Jump Dropdown */}
                    <div className='flex items-center gap-2'>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type='button'
                                    className='group flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 font-semibold text-slate-700 text-xs transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800'>
                                    <Badge
                                        variant='secondary'
                                        className='bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/60 dark:text-blue-300'>
                                        Step {index + 1} of {totalSteps}
                                    </Badge>
                                    <span className='max-w-[150px] truncate sm:max-w-[240px] md:max-w-[320px]'>{step.title}</span>
                                    <ChevronDown className='h-3.5 w-3.5 text-slate-400 transition-transform group-hover:text-slate-600 dark:group-hover:text-slate-200' />
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align='center' className='max-h-[70vh] w-80 overflow-y-auto p-1.5 text-xs shadow-xl'>
                                <DropdownMenuLabel className='flex items-center justify-between font-bold text-slate-700 dark:text-slate-200'>
                                    <span>Wizard Steps Navigation</span>
                                    <span className='font-normal text-[10px] text-slate-500'>{progressPercentage}% Completed</span>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                {Object.entries(groupedSteps).map(([groupName, stepsInGroup]) => (
                                    <div key={groupName} className='py-1'>
                                        <div className='px-2 py-1 font-bold text-[11px] text-slate-500 uppercase tracking-wider dark:text-slate-400'>
                                            {groupName}
                                        </div>
                                        {stepsInGroup.map((item) => {
                                            const isCurrent = item.id === step.id;
                                            const isPassed = item.id < step.id;

                                            return (
                                                <DropdownMenuItem
                                                    key={item.id}
                                                    onClick={() => handleStepSelect(item.url)}
                                                    className={cn(
                                                        'flex cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors',
                                                        isCurrent
                                                            ? 'bg-blue-50 font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                                            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                                                    )}>
                                                    <div className='flex items-center gap-2'>
                                                        <span
                                                            className={cn(
                                                                'flex h-5 w-5 items-center justify-center rounded-full font-bold text-[10px]',
                                                                isCurrent
                                                                    ? 'bg-blue-600 text-white'
                                                                    : isPassed
                                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                                                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                                            )}>
                                                            {item.id}
                                                        </span>
                                                        <span className='truncate'>{item.title}</span>
                                                    </div>
                                                    {isPassed && (
                                                        <CheckCircle2 className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                                                    )}
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    </div>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Right: Next and Finish Buttons */}
                    <div className='flex items-center gap-2.5'>
                        {nextStep && <span className='hidden text-slate-500 text-xs lg:inline-block'>{nextStep.title} &rarr;</span>}

                        <Button
                            type='button'
                            variant='default'
                            onClick={handleNext}
                            disabled={!nextStep}
                            className={cn(
                                'h-10 rounded-lg px-5 font-bold text-white text-xs uppercase tracking-wider shadow-sm transition-all',
                                nextStep
                                    ? 'bg-[#1e40af] hover:bg-[#1d4ed8] hover:shadow-md active:scale-95 dark:bg-blue-600 dark:hover:bg-blue-500'
                                    : 'cursor-not-allowed bg-slate-300 text-slate-500 opacity-60 dark:bg-slate-800 dark:text-slate-600'
                            )}
                            title={nextStep ? `Go to Next: ${nextStep.title}` : 'No next step'}>
                            NEXT
                            <ChevronRight className='ml-1.5 h-4 w-4' />
                        </Button>

                        <Button
                            type='button'
                            onClick={() => setIsFinishDialogOpen(true)}
                            className='h-10 rounded-lg bg-[#ea580c] px-5 font-bold text-white text-xs uppercase tracking-wider shadow-sm transition-all hover:bg-[#c2410c] hover:shadow-md active:scale-95 dark:bg-orange-600 dark:hover:bg-orange-500'
                            title='Complete Configuration Wizard'>
                            FINISH
                            <ThumbsUp className='ml-1.5 h-4 w-4' />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Finish Confirmation Dialog */}
            <Dialog open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
                <DialogContent className='sm:max-w-md'>
                    <DialogHeader className='flex flex-col items-center text-center'>
                        <div className='mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-600 shadow-inner dark:bg-orange-950 dark:text-orange-400'>
                            <PartyPopper className='h-8 w-8 animate-bounce' />
                        </div>
                        <DialogTitle className='font-bold text-slate-900 text-xl dark:text-slate-100'>Configuration Wizard</DialogTitle>
                        <DialogDescription className='mt-2 text-slate-600 text-sm dark:text-slate-400'>
                            You have navigated through the Configuration & Setup Wizard steps. Are you ready to finalize your settings?
                        </DialogDescription>
                    </DialogHeader>

                    <div className='my-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/60'>
                        <div className='flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300'>
                            <span>Current Step:</span>
                            <span className='font-bold text-blue-600 dark:text-blue-400'>{step.title}</span>
                        </div>
                        <div className='mt-2 flex items-center justify-between text-slate-500'>
                            <span>Progress:</span>
                            <span>
                                {progressPercentage}% ({index + 1} of {totalSteps} steps)
                            </span>
                        </div>
                    </div>

                    <DialogFooter className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
                        <Button type='button' variant='outline' onClick={() => setIsFinishDialogOpen(false)}>
                            Continue Configuring
                        </Button>
                        <Button
                            type='button'
                            className='bg-[#ea580c] text-white hover:bg-[#c2410c]'
                            onClick={() => {
                                setIsFinishDialogOpen(false);
                                router.push('/SuperAdmin/super-admin-module/user-creation/staff-user-creation');
                            }}>
                            Go to Final Step
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
