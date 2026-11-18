'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface StudentDetailsTabProps {
    formData: any;
    setFormData: (data: any) => void;
    disabled?: boolean;
}

export const StudentDetailsTab = ({ formData, setFormData, disabled }: StudentDetailsTabProps) => {
    const handleChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <div className='fade-in slide-in-from-bottom-2 animate-in space-y-6 duration-500'>
            <div className='overflow-hidden rounded-md border bg-white shadow-sm'>
                <div className='bg-[#2b589f] px-4 py-2 font-bold text-sm text-white uppercase'>Student Details</div>
                <div className='grid grid-cols-1 gap-x-12 gap-y-4 p-4 lg:grid-cols-2'>
                    {/* Left Column */}
                    <div className='space-y-4'>
                        {/* Date of Admission */}
                        <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                            <Label htmlFor='admission_date' className='text-right font-semibold text-indigo-900'>
                                Date Of Admission:
                            </Label>
                            <Input
                                id='admission_date'
                                type='date'
                                value={formData.admission_date || ''}
                                onChange={(e) => handleChange('admission_date', e.target.value)}
                                className='bg-indigo-50/20'
                                disabled={disabled}
                            />
                        </div>

                        {/* Date of Promotion */}
                        <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                            <Label htmlFor='promotion_date' className='text-right font-semibold text-indigo-900'>
                                Date Of Promotion:
                            </Label>
                            <Input
                                id='promotion_date'
                                type='date'
                                value={formData.promotion_date || ''}
                                onChange={(e) => handleChange('promotion_date', e.target.value)}
                                className='bg-indigo-50/20'
                                disabled={disabled}
                            />
                        </div>

                        {/* Last Class Studied */}
                        <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                            <Label htmlFor='last_class' className='text-right font-semibold text-indigo-900'>
                                Last Class Studied:
                            </Label>
                            <Input
                                id='last_class'
                                value={formData.last_class || ''}
                                onChange={(e) => handleChange('last_class', e.target.value)}
                                className='bg-indigo-50/20'
                                disabled={disabled}
                            />
                        </div>

                        {/* Caste */}
                        <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                            <Label htmlFor='caste' className='text-right font-semibold text-indigo-900'>
                                Caste :
                            </Label>
                            <Input
                                id='caste'
                                value={formData.caste || ''}
                                onChange={(e) => handleChange('caste', e.target.value)}
                                className='bg-indigo-50/20'
                                disabled={disabled}
                            />
                        </div>

                        {/* Medium Of Instruction */}
                        <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                            <Label htmlFor='mediumOfInstruction' className='text-right font-semibold text-indigo-900'>
                                Medium Of Instruction:
                            </Label>
                            <Input
                                id='mediumOfInstruction'
                                value={formData.mediumOfInstruction || ''}
                                onChange={(e) => handleChange('mediumOfInstruction', e.target.value)}
                                className='bg-indigo-50/20'
                                disabled={disabled}
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className='space-y-4'>
                        {/* Languages Studied */}
                        <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                            <Label htmlFor='language_stud' className='text-right font-semibold text-indigo-900'>
                                Languages Studied:
                            </Label>
                            <Input
                                id='language_stud'
                                value={formData.language_stud || ''}
                                onChange={(e) => handleChange('language_stud', e.target.value)}
                                className='bg-indigo-50/20'
                                disabled={disabled}
                            />
                        </div>

                        {/* Elective Studied */}
                        <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                            <Label htmlFor='electives_stud' className='text-right font-semibold text-indigo-900'>
                                Elective Studied:
                            </Label>
                            <Input
                                id='electives_stud'
                                value={formData.electives_stud || ''}
                                onChange={(e) => handleChange('electives_stud', e.target.value)}
                                className='bg-indigo-50/20'
                                disabled={disabled}
                            />
                        </div>

                        {/* Subjects Studied */}
                        <div className='grid grid-cols-[180px_1fr] items-start gap-4'>
                            <Label htmlFor='subjects_stud' className='mt-2 text-right font-semibold text-indigo-900'>
                                Subjects Studied:
                            </Label>
                            <Textarea
                                id='subjects_stud'
                                value={formData.subjects_stud || ''}
                                onChange={(e) => handleChange('subjects_stud', e.target.value)}
                                className='min-h-[80px] bg-indigo-50/20'
                                disabled={disabled}
                            />
                        </div>

                        {/* Scholarship */}
                        <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                            <Label htmlFor='scholarship' className='text-right font-semibold text-indigo-900'>
                                Scholarship:
                            </Label>
                            <Input
                                id='scholarship'
                                value={formData.scholarship || ''}
                                onChange={(e) => handleChange('scholarship', e.target.value)}
                                className='bg-indigo-50/20'
                                disabled={disabled}
                            />
                        </div>

                        {/* Medically Examined */}
                        <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                            <Label htmlFor='Medically_Exam_Flag' className='text-right font-semibold text-indigo-900'>
                                Medically Examined ?:
                            </Label>
                            <Select
                                value={formData.Medically_Exam_Flag || 'no'}
                                onValueChange={(val) => handleChange('Medically_Exam_Flag', val)}
                                disabled={disabled}>
                                <SelectTrigger id='Medically_Exam_Flag' className='bg-indigo-50/20'>
                                    <SelectValue placeholder='Select' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='yes'>Yes</SelectItem>
                                    <SelectItem value='no'>No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
