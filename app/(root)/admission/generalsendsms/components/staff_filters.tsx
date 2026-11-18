 'use client';
import { Label } from '@/components/ui/extension/field';
import { Textarea } from '@/components/ui/textarea';
import ChecklistBox from './checklist_box';
import type { IDepartmentOption, IDesignationOption } from '@/hooks/admission/sms/reports/useGeneralSms';

interface Props {
    departments: IDepartmentOption[];
    designations: IDesignationOption[];
    selectedDepartmentIds: Set<number>;
    selectedDesignationIds: Set<number>;
    onDepartmentsChange: (ids: Set<number>) => void;
    onDesignationsChange: (ids: Set<number>) => void;
    message: string;
    onMessageChange: (v: string) => void;
}

export default function StaffFilters(p: Props) {
    return (
        <div className='space-y-4 p-2'>
            <div className='grid gap-8 lg:grid-cols-2'>
                <ChecklistBox
                    id='department'
                    label='Department'
                    required
                    options={p.departments.map((d) => ({ id: d.hrmD_Id, label: d.hrmD_DepartmentName }))}
                    selectedIds={p.selectedDepartmentIds}
                    onChange={p.onDepartmentsChange}
                />
                <ChecklistBox
                    id='designation'
                    label='Designation'
                    required
                    options={p.designations.map((d) => ({ id: d.hrmdeS_Id, label: d.hrmdeS_DesignationName }))}
                    selectedIds={p.selectedDesignationIds}
                    onChange={p.onDesignationsChange}
                />
            </div>

            <div className='grid grid-cols-[7rem_1fr] items-start gap-4'>
                <Label className='pt-2'>
                    Message : <span className='text-red-500'>*</span>
                </Label>
                <Textarea
                    value={p.message}
                    onChange={(e) => p.onMessageChange(e.target.value)}
                    placeholder='Please write your message here'
                    rows={2}
                />
            </div>
        </div>
    );
}
