'use client';

import { Button } from '@/components/ui/button';
import { ChevronRight, Layers, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SubjectGroupForm } from './_components/subject-group-form';
import { SubjectGroupTable } from './_components/subject-group-table';
import { ViewSubjectsModal } from './_components/view-subjects-modal';
import { getGroupDetailsById, getGroupSubjectsView, getInitialDetails, saveSubjectGroup, toggleGroupStatus } from './actions';
import type { ISubjectGroupRecord, ISubjectItem, IViewGroupSubject } from './types';

export default function ClgMasterSubjectGroupPage() {
    // Master Data
    const [subjectList, setSubjectList] = useState<ISubjectItem[]>([]);
    const [groupList, setGroupList] = useState<ISubjectGroupRecord[]>([]);

    // Form Field States
    const [emG_Id, setEmG_Id] = useState<number>(0);
    const [emGS_Id, setEmGS_Id] = useState<number>(0);
    const [groupName, setGroupName] = useState<string>('');
    const [totSubjects, setTotSubjects] = useState<string>('');
    const [maxAplSubjects, setMaxAplSubjects] = useState<string>('');
    const [minAplSubjects, setMinAplSubjects] = useState<string>('');
    const [bestOff, setBestOff] = useState<string>('');

    // Modal View States
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewGroupName, setViewGroupName] = useState('');
    const [viewSubjects, setViewSubjects] = useState<IViewGroupSubject[]>([]);

    // Loading States
    const [isLoadingInitial, setIsLoadingInitial] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    /**
     * Bind Initial Data
     */
    const bindInitialData = useCallback(async () => {
        setIsLoadingInitial(true);
        try {
            const res = await getInitialDetails();
            if (res.success && res.data) {
                const subs = (res.data.subjectlist || []).map((s) => ({
                    ...s,
                    checkedvalue: false
                }));
                setSubjectList(subs);
                setGroupList(res.data.group_list || []);
            } else {
                toast.error(res.message || 'Failed to load initial details');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error loading subject group details');
        } finally {
            setIsLoadingInitial(false);
        }
    }, []);

    useEffect(() => {
        bindInitialData();
    }, [bindInitialData]);

    /**
     * Handle Subject Checkbox Toggle
     */
    const handleToggleSubject = (subjectId: number, checked: boolean) => {
        setSubjectList((prev) => prev.map((s) => (s.ismS_Id === subjectId ? { ...s, checkedvalue: checked } : s)));
    };

    /**
     * Handle Toggle All Subjects
     */
    const handleToggleAllSubjects = (checked: boolean) => {
        setSubjectList((prev) =>
            prev.map((s) => ({
                ...s,
                checkedvalue: checked
            }))
        );
    };

    /**
     * Save / Update Subject Group
     */
    const handleSubmit = async () => {
        if (!groupName.trim() || !totSubjects || !maxAplSubjects || !minAplSubjects || !bestOff) {
            toast.error('Please fill in all required fields.');
            return;
        }

        const selectedSubs = subjectList.filter((s) => s.checkedvalue);
        const numTot = Number(totSubjects);

        if (selectedSubs.length !== numTot) {
            toast.error('Selected Subjects Count Should be Equal to Max.Subjects Field Value !!!');
            return;
        }

        const numMaxApl = Number(maxAplSubjects);
        const numMinApl = Number(minAplSubjects);
        const numBest = Number(bestOff);

        const electiveFlag = numMinApl === numMaxApl && numMaxApl === numTot ? 0 : 1;

        const payload = {
            EMG_Id: emG_Id || 0,
            EMGS_Id: emGS_Id || 0,
            EMG_GroupName: groupName.trim(),
            EMG_TotSubjects: numTot,
            EMG_MaxAplSubjects: numMaxApl,
            EMG_MinAplSubjects: numMinApl,
            EMG_BestOff: numBest,
            EMG_ElectiveFlg: electiveFlag,
            subj_list: selectedSubs
        };

        setIsSaving(true);
        try {
            const res = await saveSubjectGroup(payload);
            if (res.success && res.data) {
                if (res.data.returnval === true) {
                    if (!emG_Id || emG_Id <= 0) {
                        toast.success('Record saved successfully');
                    } else {
                        toast.success('Record updated successfully');
                    }
                    if (res.data.group_list) {
                        setGroupList(res.data.group_list);
                    }
                    handleReset();
                    bindInitialData();
                } else if (res.data.returnduplicatestatus === 'Duplicate') {
                    toast.error('Record already exist');
                } else {
                    toast.error(
                        !emG_Id || emG_Id <= 0
                            ? 'Failed to save, please contact administrator'
                            : 'Failed to update, please contact administrator'
                    );
                }
            } else {
                toast.error(res.message || 'Failed to save subject group');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error saving subject group');
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Edit Subject Group
     */
    const handleEdit = async (group: ISubjectGroupRecord) => {
        handleReset();
        try {
            const res = await getGroupDetailsById(group.emG_Id);
            if (res.success && res.data?.edit_m_group && res.data.edit_m_group.length > 0) {
                const grp = res.data.edit_m_group[0];
                setEmG_Id(grp.emG_Id);
                setGroupName(grp.emG_GroupName || '');
                setTotSubjects(String(grp.emG_TotSubjects || ''));
                setMaxAplSubjects(String(grp.emG_MaxAplSubjects || ''));
                setMinAplSubjects(String(grp.emG_MinAplSubjects || ''));
                setBestOff(String(grp.emG_BestOff || ''));

                const groupSubjects = res.data.edit_m_group_subjects || [];
                const mappedSubjectIds = new Set(groupSubjects.map((s) => s.ismS_Id));

                setSubjectList((prev) =>
                    prev.map((s) => ({
                        ...s,
                        checkedvalue: mappedSubjectIds.has(s.ismS_Id)
                    }))
                );

                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                toast.error(res.message || 'Failed to load group details for edit');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error fetching group details');
        }
    };

    /**
     * View Group Mapped Subjects
     */
    const handleViewSubjects = async (group: ISubjectGroupRecord) => {
        try {
            const res = await getGroupSubjectsView(group.emG_Id);
            if (res.success && res.data) {
                setViewGroupName(group.emG_GroupName);
                setViewSubjects(res.data.view_group_subjects || []);
                setIsViewModalOpen(true);
            } else {
                toast.error(res.message || 'Failed to load mapped subjects');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error fetching group subjects');
        }
    };

    /**
     * Toggle Active / Deactivate Status
     */
    const handleToggleActive = async (group: ISubjectGroupRecord) => {
        const actionLabel = group.emG_ActiveFlag !== false ? 'Deactivate' : 'Activate';
        try {
            const res = await toggleGroupStatus(group);
            if (res.success && res.data) {
                if (res.data.already_cnt === true) {
                    toast.error('You Can Not Deactivate This Record, It Has Dependency');
                } else if (res.data.returnval === true) {
                    toast.success(`Record ${actionLabel}d successfully`);
                    bindInitialData();
                } else {
                    toast.error(`Record ${actionLabel} Failed`);
                }
            } else {
                toast.error(res.message || `Failed to ${actionLabel} record`);
            }
        } catch (error: any) {
            toast.error(error.message || 'Error updating record status');
        }
    };

    /**
     * Reset Form
     */
    const handleReset = () => {
        setEmG_Id(0);
        setEmGS_Id(0);
        setGroupName('');
        setTotSubjects('');
        setMaxAplSubjects('');
        setMinAplSubjects('');
        setBestOff('');
        setSubjectList((prev) =>
            prev.map((s) => ({
                ...s,
                checkedvalue: false
            }))
        );
        toast.info('Form cleared.');
    };

    return (
        <div className='fade-in container mx-auto max-w-7xl animate-in space-y-6 p-4 duration-300 sm:p-6 lg:p-8'>
            {/* Breadcrumb Navigation */}
            <div className='flex flex-col gap-2'>
                <nav aria-label='Breadcrumb' className='flex items-center space-x-1.5 text-muted-foreground text-xs'>
                    <Link href='/Exam' className='transition-colors hover:text-foreground'>
                        Exam
                    </Link>
                    <ChevronRight className='h-3.5 w-3.5 opacity-60' />
                    <Link href='/Exam/exam-module' className='transition-colors hover:text-foreground'>
                        Exam Module
                    </Link>
                    <ChevronRight className='h-3.5 w-3.5 opacity-60' />
                    <Link href='/Exam/exam-module/collage' className='transition-colors hover:text-foreground'>
                        College
                    </Link>
                    <ChevronRight className='h-3.5 w-3.5 opacity-60' />
                    <span className='font-medium text-foreground'>Master Subject Group</span>
                </nav>

                {/* Page Title Header */}
                <div className='flex flex-col justify-between gap-4 border-b pb-3 sm:flex-row sm:items-center'>
                    <div className='flex items-center space-x-3'>
                        <div className='rounded-xl bg-primary p-2.5 text-primary-foreground shadow-sm'>
                            <Layers className='h-6 w-6' />
                        </div>
                        <div>
                            <h1 className='font-bold text-foreground text-xl tracking-tight sm:text-2xl'>Master Subject Group</h1>
                            <p className='text-muted-foreground text-xs sm:text-sm'>
                                Create and maintain college subject groups, elective configurations, and threshold limits
                            </p>
                        </div>
                    </div>

                    <div className='flex items-center gap-2'>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={bindInitialData}
                            disabled={isLoadingInitial || isSaving}
                            className='h-9 text-xs'>
                            <RefreshCw className='mr-1.5 h-3.5 w-3.5' />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            {/* Subject Group Form */}
            <SubjectGroupForm
                groupName={groupName}
                totSubjects={totSubjects}
                maxAplSubjects={maxAplSubjects}
                minAplSubjects={minAplSubjects}
                bestOff={bestOff}
                subjectList={subjectList}
                isEditing={emG_Id > 0}
                isSaving={isSaving}
                onChangeGroupName={setGroupName}
                onChangeTotSubjects={setTotSubjects}
                onChangeMaxAplSubjects={setMaxAplSubjects}
                onChangeMinAplSubjects={setMinAplSubjects}
                onChangeBestOff={setBestOff}
                onToggleSubject={handleToggleSubject}
                onToggleAllSubjects={handleToggleAllSubjects}
                onSubmit={handleSubmit}
                onReset={handleReset}
            />

            {/* Subject Group Details Table */}
            <SubjectGroupTable
                groups={groupList}
                onEdit={handleEdit}
                onViewSubjects={handleViewSubjects}
                onToggleActive={handleToggleActive}
            />

            {/* View Mapped Subjects Modal */}
            <ViewSubjectsModal open={isViewModalOpen} onOpenChange={setIsViewModalOpen} groupName={viewGroupName} subjects={viewSubjects} />
        </div>
    );
}
