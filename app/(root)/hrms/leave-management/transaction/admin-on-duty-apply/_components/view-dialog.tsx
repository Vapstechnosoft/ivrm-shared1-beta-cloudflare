'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useLeaveDetailsById } from '@/hooks/hrms/leave-management/useAdminOnDutyApply';
import { format } from 'date-fns';
import { AlertCircle, Calendar, Clock, Download, FileText, Info, Loader2, User } from 'lucide-react';

interface ViewLeaveDetailsDialogProps {
    leaveId: number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ViewLeaveDetailsDialog({ leaveId, open, onOpenChange }: ViewLeaveDetailsDialogProps) {
    const { data, isLoading } = useLeaveDetailsById(leaveId);

    const leaveApp = data?.leaveApplication?.[0];
    const leaveDetails = data?.leaveApplicationDetails?.[0];

    const getStatusStyles = (status: string) => {
        if (status === 'Applied' || status === 'Requested') return 'bg-blue-100 text-blue-700 border-blue-200';
        if (status === 'Approved') return 'bg-green-100 text-green-700 border-green-200';
        if (status === 'Rejected') return 'bg-red-100 text-red-700 border-red-200';
        return 'bg-muted text-muted-foreground';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-lg overflow-hidden border-none p-0 shadow-2xl'>
                <DialogHeader className='bg-primary/5 p-6 pb-4'>
                    <div className='flex items-center gap-3'>
                        <div className='rounded-lg bg-primary/10 p-2 text-primary'>
                            <FileText className='h-5 w-5' />
                        </div>
                        <div>
                            <DialogTitle className='text-xl'>Application Details</DialogTitle>
                            <DialogDescription className='text-xs'>Comprehensive overview of the On Duty request.</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className='p-6'>
                    {isLoading ? (
                        <div className='flex flex-col items-center justify-center gap-3 py-12'>
                            <Loader2 className='h-10 w-10 animate-spin text-primary opacity-50' />
                            <p className='font-medium text-muted-foreground text-sm'>Fetching details...</p>
                        </div>
                    ) : leaveApp ? (
                        <div className='space-y-6'>
                            {/* Header Info */}
                            <div className='flex items-center justify-between rounded-xl border bg-muted/30 p-4'>
                                <div className='flex flex-col'>
                                    <span className='font-bold text-[10px] text-muted-foreground uppercase tracking-wider'>
                                        Application ID
                                    </span>
                                    <span className='font-bold font-mono text-primary'>{leaveApp.hrelaP_ApplicationID}</span>
                                </div>
                                <Badge className={getStatusStyles(leaveApp.hrelaP_ApplicationStatus)}>
                                    {leaveApp.hrelaP_ApplicationStatus}
                                </Badge>
                            </div>

                            <div className='grid grid-cols-2 gap-x-8 gap-y-6'>
                                <DetailItem
                                    icon={<User className='h-4 w-4 text-blue-500' />}
                                    label='Employee ID'
                                    value={leaveApp.hrmE_Id}
                                />
                                <DetailItem
                                    icon={<Calendar className='h-4 w-4 text-orange-500' />}
                                    label='Applied Date'
                                    value={
                                        leaveApp.hrelaP_ApplicationDate
                                            ? format(new Date(leaveApp.hrelaP_ApplicationDate), 'dd MMM yyyy')
                                            : '-'
                                    }
                                />
                                <DetailItem
                                    icon={<Calendar className='h-4 w-4 text-purple-500' />}
                                    label='From Date'
                                    value={leaveApp.hrelaP_FromDate ? format(new Date(leaveApp.hrelaP_FromDate), 'dd MMM yyyy') : '-'}
                                />
                                <DetailItem
                                    icon={<Calendar className='h-4 w-4 text-purple-500' />}
                                    label='To Date'
                                    value={leaveApp.hrelaP_ToDate ? format(new Date(leaveApp.hrelaP_ToDate), 'dd MMM yyyy') : '-'}
                                />
                                <DetailItem
                                    icon={<Clock className='h-4 w-4 text-green-500' />}
                                    label='Timings'
                                    value={leaveDetails ? `${leaveDetails.hrelapD_InTime} - ${leaveDetails.hrelapD_OutTime}` : 'Full Day'}
                                />
                                <DetailItem
                                    icon={<Info className='h-4 w-4 text-yellow-600' />}
                                    label='Total Duration'
                                    value={`${leaveApp.hrelaP_TotalDays || 1} ${Number(leaveApp.hrelaP_TotalDays) === 1 ? 'Day' : 'Days'}`}
                                />
                            </div>

                            <Separator />

                            <div className='space-y-2'>
                                <span className='block font-bold text-[10px] text-muted-foreground uppercase tracking-wider'>
                                    Reason for On Duty
                                </span>
                                <div className='rounded-lg border border-orange-100 bg-orange-50/50 p-4 text-slate-700 text-sm italic leading-relaxed'>
                                    "{leaveApp.hrelaP_LeaveReason}"
                                </div>
                            </div>

                            {leaveApp.hrelaP_SupportingDocument && (
                                <div className='flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3'>
                                    <div className='flex items-center gap-3'>
                                        <div className='rounded bg-white p-2 shadow-sm'>
                                            <FileText className='h-4 w-4 text-primary' />
                                        </div>
                                        <div className='flex flex-col'>
                                            <span className='font-bold text-xs'>Supporting Document</span>
                                            <span className='text-[10px] text-muted-foreground'>Click to view attachment</span>
                                        </div>
                                    </div>
                                    <Button variant='ghost' size='sm' className='gap-2 font-bold text-primary' asChild>
                                        <a href={leaveApp.hrelaP_SupportingDocument} target='_blank' rel='noopener noreferrer'>
                                            <Download className='h-3.5 w-3.5' /> VIEW
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className='py-12 text-center'>
                            <AlertCircle className='mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-20' />
                            <p className='font-medium text-muted-foreground'>Application details not found.</p>
                        </div>
                    )}
                </div>

                <div className='flex justify-end gap-3 p-6 pt-0'>
                    <Button variant='outline' onClick={() => onOpenChange(false)} className='h-10 px-8'>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) {
    return (
        <div className='flex gap-3'>
            <div className='mt-0.5 flex-shrink-0'>{icon}</div>
            <div className='flex flex-col'>
                <span className='font-bold text-[10px] text-muted-foreground uppercase tracking-wider'>{label}</span>
                <span className='max-w-[150px] truncate font-semibold text-sm'>{value}</span>
            </div>
        </div>
    );
}
