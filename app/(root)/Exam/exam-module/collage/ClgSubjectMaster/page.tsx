'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Layers, RefreshCw } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { MasterSubjectTab } from './_components/master-subject-tab';
import { SubjectMapTab } from './_components/subject-map-tab';
import { getClgSubjectMasterDetails } from './actions';
import type {
    IClgBranch,
    IClgCourse,
    IClgIntroYear,
    IClgMasterSubject,
    IClgSubjectDropdownItem,
    IClgSubjectMapping,
    IClgYear
} from './types';

export default function ClgSubjectMasterPage() {
    const [activeTab, setActiveTab] = useState('master-subject');
    const [isLoading, setIsLoading] = useState(true);

    // Initial data lists
    const [subjects, setSubjects] = useState<IClgMasterSubject[]>([]);
    const [orderSubjects, setOrderSubjects] = useState<IClgMasterSubject[]>([]);
    const [courses, setCourses] = useState<IClgCourse[]>([]);
    const [branches, setBranches] = useState<IClgBranch[]>([]);
    const [subDropdownList, setSubDropdownList] = useState<IClgSubjectDropdownItem[]>([]);
    const [academicYears, setAcademicYears] = useState<IClgYear[]>([]);
    const [introYears, setIntroYears] = useState<IClgIntroYear[]>([]);
    const [mappingList, setMappingList] = useState<IClgSubjectMapping[]>([]);

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getClgSubjectMasterDetails(2);

            if (response.success && response.data) {
                const data = response.data;

                // Process subject list
                const rawSubjects: IClgMasterSubject[] = data.subject_m_list || [];
                const processedSubjects = rawSubjects.map((item) => {
                    let flagStr = item.ismS_SubjectFlag;
                    if (item.ismS_PreadmFlag === 0 || item.ismS_PreadmFlag === false) {
                        flagStr = '--';
                    } else if (
                        (item.ismS_SubjectFlag === 1 || item.ismS_SubjectFlag === '1') &&
                        (item.ismS_PreadmFlag === 1 || item.ismS_PreadmFlag === true)
                    ) {
                        flagStr = 'Written';
                    } else if (
                        (item.ismS_SubjectFlag === 0 || item.ismS_SubjectFlag === '0') &&
                        (item.ismS_PreadmFlag === 1 || item.ismS_PreadmFlag === true)
                    ) {
                        flagStr = 'Oral';
                    }

                    return {
                        ...item,
                        ismS_SubjectFlag: flagStr
                    };
                });

                setSubjects(processedSubjects);
                setOrderSubjects(data.subject_m_list_new || rawSubjects);
                setCourses(data.courst_list || []);
                setBranches(data.branch_list || []);
                setSubDropdownList(data.sub_list || []);
                setAcademicYears(data.year_list || []);
                setIntroYears(data.yearOfintro || []);
                setMappingList(data.mappinglistdata || []);
            } else {
                toast.error(response.message || 'Failed to load college subject details');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Error fetching college master subject data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <div className='min-h-screen p-4 sm:p-6 lg:p-8 space-y-6'>
            {/* Page Header */}
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-2 border-b'>
                <div>
                    <h1 className='text-2xl font-bold tracking-tight text-foreground'>
                        College Subject Master
                    </h1>
                    <p className='text-sm text-muted-foreground'>
                        Configure college subjects, assessment rules, branch mappings, and curriculum introduction
                    </p>
                </div>

                <div className='flex items-center gap-2'>
                    <button
                        type='button'
                        onClick={() => loadData()}
                        disabled={isLoading}
                        className='inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-muted transition-colors disabled:opacity-50'>
                        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Main Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full space-y-6'>
                <TabsList className='grid w-full grid-cols-2 max-w-md bg-muted/60 p-1 border shadow-xs'>
                    <TabsTrigger
                        value='master-subject'
                        className='flex items-center gap-2 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm'>
                        <BookOpen className='h-4 w-4' />
                        <span>Master Subject</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value='subject-map'
                        className='flex items-center gap-2 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm'>
                        <Layers className='h-4 w-4' />
                        <span>Subject Map</span>
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: Master Subject */}
                <TabsContent value='master-subject' className='focus-visible:outline-none'>
                    <MasterSubjectTab
                        subjects={subjects}
                        orderSubjects={orderSubjects}
                        onRefresh={loadData}
                        isLoading={isLoading}
                    />
                </TabsContent>

                {/* Tab 2: Subject Map */}
                <TabsContent value='subject-map' className='focus-visible:outline-none'>
                    <SubjectMapTab
                        subList={subDropdownList}
                        courseList={courses}
                        branchList={branches}
                        yearList={academicYears}
                        yearOfIntro={introYears}
                        mappingListData={mappingList}
                        onRefresh={loadData}
                        isLoading={isLoading}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
