'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TCDetailsTabProps {
    formData: any;
    setFormData: (data: any) => void;
    initialData: any;
    onCheckDuplicate?: (tcNo: string) => void;
    tcConfig?: any;
    disabled?: boolean;
}

export const TCDetailsTab = ({ formData, setFormData, initialData, onCheckDuplicate, tcConfig, disabled }: TCDetailsTabProps) => {
    const handleChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <div className='fade-in slide-in-from-bottom-2 animate-in space-y-6 duration-500'>
            {/* Section 1: TC Details */}
            <div className='rounded-md border bg-white p-4 shadow-sm'>
                <h3 className='mb-4 pl-1 font-bold text-[#2b589f] text-sm uppercase tracking-wide'>TC Details</h3>

                <div className='grid grid-cols-1 gap-x-12 gap-y-4 md:grid-cols-2'>
                    {/* STS No */}
                    <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                        <Label htmlFor='sts_no' className='text-right font-semibold text-indigo-900'>
                            STS No.:
                        </Label>
                        <Input
                            id='sts_no'
                            value={formData.sts_no || ''}
                            onChange={(e) => handleChange('sts_no', e.target.value)}
                            placeholder='Enter STS No'
                            disabled={disabled}
                        />
                    </div>

                    {/* TC Number */}
                    {tcConfig?.imN_AutoManualFlag?.toLowerCase() !== 'auto' && (
                        <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                            <Label htmlFor='tc_no' className='text-right font-semibold text-indigo-900'>
                                TC Application No.:<span className='text-red-500'>*</span>
                            </Label>
                            <Input
                                id='tc_no'
                                value={formData.tc_no || ''}
                                onChange={(e) => handleChange('tc_no', e.target.value)}
                                onBlur={(e) => onCheckDuplicate && onCheckDuplicate(e.target.value)}
                                placeholder='Enter TC Number'
                                disabled={disabled}
                            />
                        </div>
                    )}

                    {/* TC Application Date */}
                    <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                        <Label htmlFor='app_date' className='text-right font-semibold text-indigo-900'>
                            TC Application Date:<span className='text-red-500'>*</span>
                        </Label>
                        <Input
                            id='app_date'
                            type='date'
                            value={formData.app_date || ''}
                            onChange={(e) => handleChange('app_date', e.target.value)}
                            disabled={disabled}
                        />
                    </div>

                    {/* TC Issue Date */}
                    <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                        <Label htmlFor='tc_date' className='text-right font-semibold text-indigo-900'>
                            TC Issue Date:<span className='text-red-500'>*</span>
                        </Label>
                        <Input
                            id='tc_date'
                            type='date'
                            value={formData.tc_date || ''}
                            onChange={(e) => handleChange('tc_date', e.target.value)}
                            disabled={disabled}
                        />
                    </div>

                    {/* Reason for Leaving */}
                    <div className='col-span-1 grid grid-cols-[180px_1fr] items-start gap-4 md:col-span-2'>
                        <Label htmlFor='reason' className='mt-2 text-right font-semibold text-indigo-900'>
                            Leaving Reason:<span className='text-red-500'>*</span>
                        </Label>
                        <Textarea
                            id='reason'
                            value={formData.reason || ''}
                            onChange={(e) => handleChange('reason', e.target.value)}
                            placeholder='Mention the reason for transition/leaving'
                            disabled={disabled}
                            className='min-h-[60px]'
                        />
                    </div>
                </div>
            </div>

            {/* Section 2: Attendance Details */}
            <div className='overflow-hidden rounded-md border bg-white shadow-sm'>
                <div className='bg-[#2b589f] px-4 py-2 font-bold text-sm text-white uppercase'>Attendance Details</div>
                <div className='grid grid-cols-1 gap-x-12 gap-y-4 p-4 md:grid-cols-2'>
                    {/* Last Date of Attendance */}
                    <div className='grid grid-cols-[220px_1fr] items-center gap-4'>
                        <Label htmlFor='last_date_attendance' className='text-right font-semibold text-indigo-900'>
                            Last Date Of Attendance:<span className='text-red-500'>*</span>
                        </Label>
                        <Input
                            id='last_date_attendance'
                            type='date'
                            value={formData.last_date_attendance || ''}
                            onChange={(e) => handleChange('last_date_attendance', e.target.value)}
                            disabled={disabled}
                        />
                    </div>

                    {/* Left Date */}
                    <div className='grid grid-cols-[220px_1fr] items-center gap-4'>
                        <Label htmlFor='left_date' className='text-right font-semibold text-indigo-900'>
                            Left Date:<span className='text-red-500'>*</span>
                        </Label>
                        <Input
                            id='left_date'
                            type='date'
                            value={formData.left_date || ''}
                            onChange={(e) => handleChange('left_date', e.target.value)}
                            disabled={disabled}
                        />
                    </div>

                    {/* Working Days */}
                    <div className='grid grid-cols-[220px_1fr] items-center gap-4'>
                        <Label htmlFor='working_days' className='text-right font-semibold text-indigo-900'>
                            No. Of School /College Days:<span className='text-red-500'>*</span>
                        </Label>
                        <Input
                            id='working_days'
                            type='number'
                            value={formData.working_days ?? ''}
                            onChange={(e) => handleChange('working_days', e.target.value)}
                            disabled={disabled}
                        />
                    </div>

                    {/* Present Days */}
                    <div className='grid grid-cols-[220px_1fr] items-center gap-4'>
                        <Label htmlFor='present_days' className='text-right font-semibold text-indigo-900'>
                            No. Of Attended Days:<span className='text-red-500'>*</span>
                        </Label>
                        <Input
                            id='present_days'
                            type='number'
                            value={formData.present_days ?? ''}
                            onChange={(e) => handleChange('present_days', e.target.value)}
                            disabled={disabled}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
