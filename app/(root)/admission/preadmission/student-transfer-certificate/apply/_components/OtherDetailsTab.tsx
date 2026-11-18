'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ensureArray } from '@/lib/utils';

interface OtherDetailsTabProps {
    formData: any;
    setFormData: (data: any) => void;
    initialData?: any;
    disabled?: boolean;
}

export const OtherDetailsTab = ({ formData, setFormData, initialData, disabled }: OtherDetailsTabProps) => {
    const handleChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <div className='fade-in slide-in-from-bottom-2 animate-in space-y-8 duration-500'>
            {/* 1. Fee Related Details */}
            <div className='overflow-hidden rounded-md border bg-white shadow-sm'>
                <div className='bg-[#2b589f] px-4 py-2 font-bold text-sm text-white uppercase'>Fee Related Details</div>
                <div className='grid grid-cols-1 gap-x-12 gap-y-4 p-4 md:grid-cols-2'>
                    <div className='grid grid-cols-[220px_1fr] items-center gap-4'>
                        <Label className='text-right font-semibold text-indigo-900'>
                            Whether Students Paid all fees? :<span className='text-red-500'>*</span>
                        </Label>
                        <RadioGroup
                            value={formData.Fee_Due_Flag || 'yes'}
                            onValueChange={(val) => handleChange('Fee_Due_Flag', val)}
                            className='flex gap-4'
                            disabled={disabled}>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='yes' id='fee-yes' />
                                <Label htmlFor='fee-yes'>Yes</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='no' id='fee-no' />
                                <Label htmlFor='fee-no'>No</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className='grid grid-cols-[220px_1fr] items-center gap-4'>
                        <Label htmlFor='fee_concession' className='text-right font-semibold text-indigo-900'>
                            Fees Concession (if any specifiy nature, period):
                        </Label>
                        <Input
                            id='fee_concession'
                            value={formData.fee_concession || ''}
                            onChange={(e) => handleChange('fee_concession', e.target.value)}
                            disabled={disabled}
                        />
                    </div>
                </div>
            </div>

            {/* 2. Exam Related Details */}
            <div className='overflow-hidden rounded-md border bg-white shadow-sm'>
                <div className='bg-[#2b589f] px-4 py-2 font-bold text-sm text-white uppercase'>Exam Related Details</div>
                <div className='grid grid-cols-1 gap-x-12 gap-y-4 p-4 md:grid-cols-2'>
                    <div className='grid grid-cols-[220px_1fr] items-center gap-4'>
                        <Label htmlFor='last_exam_details' className='text-right font-semibold text-indigo-900'>
                            Last Exam Details :
                        </Label>
                        <Input
                            id='last_exam_details'
                            value={formData.last_exam_details || ''}
                            onChange={(e) => handleChange('last_exam_details', e.target.value)}
                            disabled={disabled}
                        />
                    </div>

                    <div className='grid grid-cols-[220px_1fr] items-center gap-4'>
                        <Label htmlFor='result' className='text-right font-semibold text-indigo-900'>
                            Results:
                        </Label>
                        <Input
                            id='result'
                            value={formData.result || ''}
                            onChange={(e) => handleChange('result', e.target.value)}
                            disabled={disabled}
                        />
                    </div>

                    <div className='grid grid-cols-[220px_1fr] items-center gap-4'>
                        <Label htmlFor='failed_details' className='text-right font-semibold text-indigo-900'>
                            Whether failed(give details):
                        </Label>
                        <Input
                            id='failed_details'
                            value={formData.failed_details || ''}
                            onChange={(e) => handleChange('failed_details', e.target.value)}
                            disabled={disabled}
                        />
                    </div>

                    <div className='grid grid-cols-[220px_1fr] items-center gap-4'>
                        <Label className='text-right font-semibold text-indigo-900'>Whether qualified for promotion? :</Label>
                        <RadioGroup
                            value={formData.Promotion_Flag || 'qualified'}
                            onValueChange={(val) => handleChange('Promotion_Flag', val)}
                            className='flex gap-4'
                            disabled={disabled}>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='qualified' id='promo-yes' />
                                <Label htmlFor='promo-yes'>Yes</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='notqualified' id='promo-no' />
                                <Label htmlFor='promo-no'>No</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {formData.Promotion_Flag === 'qualified' && (
                        <div className='grid grid-cols-[220px_1fr] items-center gap-4'>
                            <Label htmlFor='qual_class' className='text-right font-semibold text-indigo-900'>
                                Qualified for which class : <span className='text-red-500'>*</span>
                            </Label>
                            <Select
                                value={formData.qual_class || ''}
                                onValueChange={(val) => handleChange('qual_class', val)}
                                disabled={disabled}>
                                <SelectTrigger id='qual_class' className='border-indigo-200'>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {ensureArray(
                                        initialData?.qualifiedclass || initialData?.qualified_class || initialData?.classlistnew
                                    ).map((cls: any) => {
                                        const id = cls.imqC_Id || cls.asmcL_Id;
                                        const name = cls.imqC_ExamName || cls.asmcL_ClassName;
                                        return (
                                            <SelectItem key={id} value={name}>
                                                {name}
                                            </SelectItem>
                                        );
                                    })}
                                    {ensureArray(initialData?.qualifiedclass || initialData?.qualified_class || initialData?.classlistnew)
                                        .length === 0 && (
                                        <SelectItem value='none' disabled>
                                            No classes found
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Miscellaneous Details */}
            <div className='overflow-hidden rounded-md border bg-white shadow-sm'>
                <div className='bg-[#2b589f] px-4 py-2 font-bold text-sm text-white uppercase'>Miscellaneous Details</div>
                <div className='grid grid-cols-1 gap-x-12 gap-y-4 p-4 md:grid-cols-2'>
                    <div className='grid grid-cols-[220px_1fr] items-center gap-4'>
                        <Label className='text-right font-semibold text-indigo-900'>Whether NCC cadet/boy/scout/girl?:</Label>
                        <RadioGroup
                            value={formData.ncc_cadet || 'no'}
                            onValueChange={(val) => handleChange('ncc_cadet', val)}
                            className='flex gap-4'
                            disabled={disabled}>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='yes' id='ncc-yes' />
                                <Label htmlFor='ncc-yes'>Yes</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='no' id='ncc-no' />
                                <Label htmlFor='ncc-no'>No</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className='grid grid-cols-[220px_1fr] items-center gap-4'>
                        <Label htmlFor='extracurricular' className='text-right font-semibold text-indigo-900'>
                            Extra curricular activities:
                        </Label>
                        <Input
                            id='extracurricular'
                            value={formData.extracurricular || ''}
                            onChange={(e) => handleChange('extracurricular', e.target.value)}
                            disabled={disabled}
                        />
                    </div>
                </div>
            </div>

            {/* 4. Remarks */}
            <div className='overflow-hidden rounded-md border bg-white shadow-sm'>
                <div className='bg-[#2b589f] px-4 py-2 font-bold text-sm text-white uppercase'>Remarks</div>
                <div className='grid grid-cols-1 gap-4 p-4'>
                    <div className='grid grid-cols-[220px_1fr] items-center gap-4'>
                        <Label htmlFor='conduct' className='text-right font-semibold text-indigo-900'>
                            Conduct / Character:<span className='text-red-500'>*</span>
                        </Label>
                        <Input
                            id='conduct'
                            value={formData.conduct || ''}
                            onChange={(e) => handleChange('conduct', e.target.value)}
                            placeholder='e.g. good'
                            disabled={disabled}
                        />
                    </div>

                    <div className='grid grid-cols-[220px_1fr] items-start gap-4'>
                        <Label htmlFor='remarks' className='mt-2 text-right font-semibold text-indigo-900'>
                            Remarks:
                        </Label>
                        <Textarea
                            id='remarks'
                            value={formData.remarks || ''}
                            onChange={(e) => handleChange('remarks', e.target.value)}
                            disabled={disabled}
                            className='min-h-[80px]'
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
