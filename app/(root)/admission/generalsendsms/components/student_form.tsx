 'use client';
import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useSendStudentMessage, useStudentClasses, useStudentList, useStudentSections, type StudentMessageCategory, type StudentType } from '@/hooks/admission/sms/reports/useGeneralSms';
import { useFeeDefaulterReport } from '@/hooks/fees/useReports';
import { Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import StudentFilters from './student_filters';
import StudentCategorySelector from './student_category_selector';
import StudentList from './student_list';

export default function StudentForm() {
    const [studentType, setStudentType] = useState<StudentType>('regular');
    const [asmayId, setAsmayId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState<StudentMessageCategory | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const { data: yearData, isLoading: loadingYears } = useFeeDefaulterReport();
    const { data: classData } = useStudentClasses(asmayId ?? 0);
    const { data: sectionData } = useStudentSections(asmayId ?? 0, classId ?? 0);
    const {
        data: studentData,
        isLoading: loadingStudents,
        error: studentError
    } = useStudentList({ asmayId: asmayId ?? 0, classId: classId ?? 0, sectionId: sectionId ?? 0, studentType });
    const { mutate, isPending } = useSendStudentMessage();

    const years = yearData?.data ?? [];
    const classes = classData?.data ?? [];
    const sections = sectionData?.data ?? [];
    const students = studentData?.data ?? [];

    // Preselect first option in each dropdown (matches the existing screen)
    useEffect(() => {
        if (asmayId === null && years.length > 0) setAsmayId(years[0].asmaY_Id);
    }, [years, asmayId]);
    useEffect(() => {
        if (classId === null && classes.length > 0) setClassId(classes[0].asmcL_Id);
    }, [classes, classId]);
    useEffect(() => {
        if (sectionId === null && sections.length > 0) setSectionId(sections[0].asmS_Id);
    }, [sections, sectionId]);

    // Any filter change invalidates the current selection
    useEffect(() => {
        setSelectedIds(new Set());
    }, [asmayId, classId, sectionId, studentType]);

    const handleAsmayChange = (id: number) => {
        setAsmayId(id);
        setClassId(null);
        setSectionId(null);
    };
    const handleClassChange = (id: number) => {
        setClassId(id);
        setSectionId(null);
    };

    const reset = () => {
        setMessage('');
        setCategory(null);
        setSelectedIds(new Set());
    };

    const handleSend = () => {
        if (!asmayId || !classId || !sectionId) return toast.error('Select academic year, class and section');
        if (!message.trim()) return toast.error('Message is required');
        if (selectedIds.size === 0) return toast.error('Select at least one student');

        mutate(
            {
                asmayId,
                classId,
                sectionId,
                studentType,
                category,
                message: message.trim(),
                studentIds: Array.from(selectedIds)
            },
            { onSuccess: reset }
        );
    };

    return (
        <div className='space-y-6'>
            <StudentFilters
                studentType={studentType}
                onStudentTypeChange={setStudentType}
                years={years}
                classes={classes}
                sections={sections}
                asmayId={asmayId}
                classId={classId}
                sectionId={sectionId}
                onAsmayChange={handleAsmayChange}
                onClassChange={handleClassChange}
                onSectionChange={setSectionId}
                message={message}
                onMessageChange={setMessage}
                loadingYears={loadingYears}
            />

            <StudentCategorySelector value={category} onChange={setCategory} />

            <CollapsibleSection title='Student List' defaultOpen={true} variant='default' size='md'>
                <StudentList
                    students={students}
                    isLoading={loadingStudents}
                    error={studentError}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
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
