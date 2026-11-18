'use client';

import { PolygonBanner } from '@/components/ui/extension/polygon-banner';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterOEExam } from '@/hooks/naac/lp-online-exam/useMasters';
import type { IMasterOEExam } from '@/types/naac/lp-online-exam/masters';
import { Plus, X, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import AddMasterOEExamForm from './_components/add-form';
import { masterOEExamColumns } from './_components/columns';
import MapQuestionsForm from './_components/map-questions';
import ToggleMasterOEExamForm from './_components/toggle-form';
import UpdateMasterOEExamForm from './_components/update-form';

export default function MasterOEExamPage() {
    return (
        <FormProvider<IMasterOEExam>>
            <MasterOEExamContent />
        </FormProvider>
    );
}

function MasterOEExamContent() {
    const { data: examList, isLoading, error, initialData } = useMasterOEExam();
    const { openAddForm } = useFormContext<IMasterOEExam>();
    
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [mappingExam, setMappingExam] = useState<IMasterOEExam | null>(null);

    const handleOpenMap = (exam: IMasterOEExam) => {
        setMappingExam(exam);
        setIsMapOpen(true);
    };

    const handleCloseMap = () => {
        setIsMapOpen(false);
        setMappingExam(null);
    };

    const years = useMemo(() => {
        const raw = initialData?.getyear;
        if (Array.isArray(raw)) return raw;
        if (raw?.$values && Array.isArray(raw.$values)) return raw.$values;
        return [];
    }, [initialData]);

    const classes = useMemo(() => {
        const raw = initialData?.getclass;
        if (Array.isArray(raw)) return raw;
        if (raw?.$values && Array.isArray(raw.$values)) return raw.$values;
        return [];
    }, [initialData]);

    const sections = useMemo(() => {
        const raw = initialData?.getsections || initialData?.getsection || initialData?.sections || initialData?.sectionList || initialData?.getSectionList;
        if (Array.isArray(raw)) return raw;
        if (raw?.$values && Array.isArray(raw.$values)) return raw.$values;
        return [];
    }, [initialData]);

    const subjects = useMemo(() => {
        const raw = initialData?.getsubjects;
        if (Array.isArray(raw)) return raw;
        if (raw?.$values && Array.isArray(raw.$values)) return raw.$values;
        return [];
    }, [initialData]);

    const exams = useMemo(() => {
        const raw = initialData?.getexams || initialData?.getexam || initialData?.masterExamList || initialData?.exams || initialData?.getExams || initialData?.getMasterExams;
        if (Array.isArray(raw)) return raw;
        if (raw?.$values && Array.isArray(raw.$values)) return raw.$values;
        return [];
    }, [initialData]);

    const topics = useMemo(() => {
        const raw = initialData?.gettopic || initialData?.getTopic || initialData?.topicList || initialData?.topic_list || initialData?.topics || initialData?.gettopiclist || initialData?.getTopicList || initialData?.getTopics || initialData?.getmastertopic;
        if (Array.isArray(raw)) return raw;
        if (raw?.$values && Array.isArray(raw.$values)) return raw.$values;
        return [];
    }, [initialData]);

    const mappedExamList = useMemo(() => {
        if (!examList || !Array.isArray(examList)) return [];
        return examList.map((exam: any) => {
            const yearObj = years.find((y: any) => String(y.asmaY_Id ?? y.ASMAY_Id ?? y.id ?? '') === String(exam.asmaY_Id ?? exam.ASMAY_Id ?? ''));
            const classObj = classes.find((c: any) => String(c.asmcL_Id ?? c.ASMCL_Id ?? c.id ?? '') === String(exam.asmcL_Id ?? exam.ASMCL_Id ?? ''));
            const sectionObj = sections.find((sec: any) => String(sec.asmS_Id ?? sec.ASMS_Id ?? sec.id ?? '') === String(exam.asmS_Id ?? exam.ASMS_Id ?? ''));
            const subjectObj = subjects.find((s: any) => String(s.ismS_Id ?? s.ISMS_Id ?? s.id ?? '') === String(exam.ismS_Id ?? exam.ISMS_Id ?? ''));
            const examObj = exams.find((e: any) => String(e.emE_Id ?? e.EME_Id ?? e.id ?? '') === String(exam.emE_Id ?? exam.EME_Id ?? ''));

            return {
                ...exam,
                asmaY_Year: yearObj ? (yearObj.asmaY_Year || yearObj.ASMAY_Year || yearObj.year) : (exam.asmaY_Year || exam.ASMAY_Year || exam.yearName || '-'),
                asmcL_ClassName: classObj ? (classObj.asmcL_ClassName || classObj.ASMCL_ClassName || classObj.className) : (exam.asmcL_ClassName || exam.ASMCL_ClassName || exam.className || '-'),
                asmC_SectionName: sectionObj ? (sectionObj.asmC_SectionName || sectionObj.ASMC_SectionName || sectionObj.sectionName) : (exam.asmC_SectionName || exam.ASMC_SectionName || exam.sectionName || '-'),
                ismS_SubjectName: subjectObj ? (subjectObj.ismS_SubjectName || subjectObj.ISMS_SubjectName || subjectObj.subjectName) : (exam.ismS_SubjectName || exam.ISMS_SubjectName || exam.subjectName || '-'),
                emE_ExamName: examObj ? (examObj.emE_ExamName || examObj.EME_ExamName || examObj.examName) : (exam.emE_ExamName || exam.EME_ExamName || exam.lpmoeeX_ExamName || '-')
            };
        });
    }, [examList, years, classes, sections, subjects, exams]);

    const columns = useMemo(() => masterOEExamColumns(handleOpenMap), []);

    const tableProps = useDataTableProps(mappedExamList);

    return (
        <div className='min-h-screen'>
            {/* Polygon Banner matching Master Question Bank design */}
            <PolygonBanner 
                title="EXAM QUESTION PAPER CREATION" 
                description="Configure online exam question papers, header sections, duration, and question mappings"
                breadcrumb={
                    <div className='flex flex-wrap items-center gap-2 text-sm text-white/80'>
                        <span className='font-medium'>Exam</span>
                        <ChevronRight className='h-4 w-4' />
                        <span>Online Exam</span>
                        <ChevronRight className='h-4 w-4' />
                        <span className='font-medium'>Masters</span>
                        <ChevronRight className='h-4 w-4' />
                        <span className='font-bold text-white'>Exam Question Mapping</span>
                    </div>
                }
            />

            <div className='container space-y-4 p-4'>
                {/* Header Action Button */}
                <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-end mt-2'>
                    <Button
                        type='button'
                        size='sm'
                        onClick={openAddForm}
                        className='w-fit shadow-xs transition-all duration-200 hover:scale-105 gap-1.5 bg-orange-600 hover:bg-orange-700 text-white h-8 text-xs font-semibold px-3.5'>
                        <Plus className='h-3.5 w-3.5' />
                        Create Question Paper
                    </Button>
                </div>

                {/* Exam Data Table */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IMasterOEExam>
                        columns={columns}
                        {...tableProps}
                        isLoading={isLoading}
                        error={error}
                        loadingMessage='Loading exam question papers...'
                        noDataTitle='No Exam Question Papers Found'
                        noDataDescription='Get started by creating your first exam question paper'
                        errorTitle='Error Loading Exam Question Papers'
                    />
                </CollapsibleSection>

                {/* Form Sections */}
                <FormSections years={years} classes={classes} sections={sections} subjects={subjects} exams={exams} topics={topics} />
                
                <MapQuestionsForm 
                    isOpen={isMapOpen} 
                    onClose={handleCloseMap} 
                    exam={mappingExam} 
                />
            </div>
        </div>
    );
}

function FormSections({
    years,
    classes,
    sections,
    subjects,
    exams,
    topics
}: {
    years: any[];
    classes: any[];
    sections: any[];
    subjects: any[];
    exams: any[];
    topics: any[];
}) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        addFormRef,
        editFormRef
    } = useFormContext<IMasterOEExam>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='EXAM QUESTION PAPER CREATION'
                        description='Fill in the exam details and section breakdown below'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        rightElement={
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='h-8 gap-1.5 px-3 text-destructive text-xs hover:bg-destructive/10 hover:text-destructive'>
                                <X className='h-4 w-4' /> Close
                            </Button>
                        }>
                        <AddMasterOEExamForm
                            years={years}
                            classes={classes}
                            sections={sections}
                            subjects={subjects}
                            exams={exams}
                            topics={topics}
                            onSuccess={closeAddForm}
                            onCancel={closeAddForm}
                        />
                    </CollapsibleSection>
                </div>
            )}

            {/* Update Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Update Exam Question Paper'
                        description='Edit the exam details and section breakdown below'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        rightElement={
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='h-8 gap-1.5 px-3 text-destructive text-xs hover:bg-destructive/10 hover:text-destructive'>
                                <X className='h-4 w-4' /> Close
                            </Button>
                        }>
                        <UpdateMasterOEExamForm
                            rowData={selectedRow}
                            years={years}
                            classes={classes}
                            sections={sections}
                            subjects={subjects}
                            exams={exams}
                            topics={topics}
                            onSuccess={closeEditForm}
                            onCancel={closeEditForm}
                        />
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Status Dialog */}
            {isToggleFormOpen && selectedRow && <ToggleMasterOEExamForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}

