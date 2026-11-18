 'use client';
import { Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { IClassOption, ISectionOption, StudentType } from '@/hooks/admission/sms/reports/useGeneralSms';
import type { IFeeAcademicYearDropdownList } from '@/types/fees/reports/reports';

interface Props {
    studentType: StudentType;
    onStudentTypeChange: (v: StudentType) => void;
    years: IFeeAcademicYearDropdownList[];
    classes: IClassOption[];
    sections: ISectionOption[];
    asmayId: number | null;
    classId: number | null;
    sectionId: number | null;
    onAsmayChange: (id: number) => void;
    onClassChange: (id: number) => void;
    onSectionChange: (id: number) => void;
    message: string;
    onMessageChange: (v: string) => void;
    loadingYears: boolean;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className='grid grid-cols-[7rem_1fr] items-start gap-4'>
            <Label className='pt-2'>
                {label} <span className='text-red-500'>*</span>
            </Label>
            {children}
        </div>
    );
}

export default function StudentFilters(p: Props) {
    return (
        <div className='space-y-4 rounded-lg border bg-white p-4 shadow-sm'>
            <RadioGroup
                value={p.studentType}
                onValueChange={(v) => p.onStudentTypeChange(v as StudentType)}
                className='flex items-center justify-center gap-10'>
                <div className='flex items-center gap-2'>
                    <RadioGroupItem id='st-new' value='new' />
                    <Label htmlFor='st-new' className='cursor-pointer'>
                        New Students
                    </Label>
                </div>
                <div className='flex items-center gap-2'>
                    <RadioGroupItem id='st-regular' value='regular' />
                    <Label htmlFor='st-regular' className='cursor-pointer'>
                        Regular
                    </Label>
                </div>
            </RadioGroup>

            <div className='grid gap-x-8 gap-y-4 lg:grid-cols-2'>
                <Field label='Academic Year:'>
                    <Select
                        value={p.asmayId?.toString() ?? ''}
                        onValueChange={(v) => p.onAsmayChange(Number(v))}
                        disabled={p.loadingYears}>
                        <SelectTrigger>
                            <SelectValue placeholder='Select Academic Year' />
                        </SelectTrigger>
                        <SelectContent>
                            {p.years.map((y) => (
                                <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                    {y.asmaY_Year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>

                <Field label='Class:'>
                    <Select
                        value={p.classId?.toString() ?? ''}
                        onValueChange={(v) => p.onClassChange(Number(v))}
                        disabled={p.classes.length === 0}>
                        <SelectTrigger>
                            <SelectValue placeholder='Select Class' />
                        </SelectTrigger>
                        <SelectContent>
                            {p.classes.map((c) => (
                                <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                    {c.asmcL_ClassName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>

                <Field label='Section:'>
                    <Select
                        value={p.sectionId?.toString() ?? ''}
                        onValueChange={(v) => p.onSectionChange(Number(v))}
                        disabled={p.sections.length === 0}>
                        <SelectTrigger>
                            <SelectValue placeholder='Select Section' />
                        </SelectTrigger>
                        <SelectContent>
                            {p.sections.map((s) => (
                                <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>
                                    {s.asmC_SectionName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>

                <Field label='Message :'>
                    <Textarea
                        value={p.message}
                        onChange={(e) => p.onMessageChange(e.target.value)}
                        placeholder='Please write your message here'
                        rows={2}
                    />
                </Field>
            </div>
        </div>
    );
}
