 'use client';
import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useSendStaffMessage, useStaffDepartments, useStaffDesignations, useStaffList } from '@/hooks/admission/sms/reports/useGeneralSms';
import { Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import StaffFilters from './staff_filters';
import StaffList from './staff_list';

export default function StaffForm() {
    const [departmentIds, setDepartmentIds] = useState<Set<number>>(new Set());
    const [designationIds, setDesignationIds] = useState<Set<number>>(new Set());
    const [staffIds, setStaffIds] = useState<Set<number>>(new Set());
    const [message, setMessage] = useState('');

    const { data: deptData } = useStaffDepartments();
    const departments = deptData?.data ?? [];

    const deptIdArray = useMemo(() => Array.from(departmentIds).sort((a, b) => a - b), [departmentIds]);
    const { data: desigData } = useStaffDesignations(deptIdArray);
    const designations = desigData?.data ?? [];

    const desigIdArray = useMemo(() => Array.from(designationIds).sort((a, b) => a - b), [designationIds]);
    const {
        data: staffData,
        isLoading: loadingStaff,
        error: staffError
    } = useStaffList({ departmentIds: deptIdArray, designationIds: desigIdArray });
    const staff = staffData?.data ?? [];

    const { mutate, isPending } = useSendStaffMessage();

    // Everything starts selected (matches the existing screen)
    useEffect(() => {
        if (departments.length > 0) setDepartmentIds(new Set(departments.map((d:any) => d.hrmD_Id)));
    }, [deptData]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setDesignationIds(new Set(designations.map((d:any) => d.hrmdeS_Id)));
    }, [desigData]); // eslint-disable-line react-hooks/exhaustive-deps

    // Filter change invalidates the staff selection
    useEffect(() => {
        setStaffIds(new Set());
    }, [staffData]);

    const reset = () => {
        setMessage('');
        setStaffIds(new Set());
    };

    const handleSend = () => {
        if (departmentIds.size === 0) return toast.error('Select at least one department');
        if (designationIds.size === 0) return toast.error('Select at least one designation');
        if (!message.trim()) return toast.error('Message is required');
        if (staffIds.size === 0) return toast.error('Select at least one staff member');

        mutate(
            {
                departmentIds: deptIdArray,
                designationIds: desigIdArray,
                message: message.trim(),
                staffIds: Array.from(staffIds)
            },
            { onSuccess: reset }
        );
    };

    return (
        <div className='space-y-6'>
            <StaffFilters
                departments={departments}
                designations={designations}
                selectedDepartmentIds={departmentIds}
                selectedDesignationIds={designationIds}
                onDepartmentsChange={setDepartmentIds}
                onDesignationsChange={setDesignationIds}
                message={message}
                onMessageChange={setMessage}
            />

            <CollapsibleSection title='Staff List' defaultOpen={true} variant='default' size='md'>
                <StaffList
                    staff={staff}
                    isLoading={loadingStaff}
                    error={staffError}
                    selectedIds={staffIds}
                    onSelectionChange={setStaffIds}
                />
            </CollapsibleSection>

            <div className='flex items-center justify-center gap-3 border-t pt-6'>
                <Button type='button' onClick={handleSend} disabled={isPending} className='gap-2'>
                    <Send className='h-4 w-4' />
                    {isPending ? 'Sending...' : 'Send'}
                </Button>
                <Button type='button' variant='outline' onClick={reset} disabled={isPending}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}
