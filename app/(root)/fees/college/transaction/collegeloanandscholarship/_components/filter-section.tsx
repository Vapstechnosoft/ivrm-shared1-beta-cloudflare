'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/extension/field';
import { FeesCustomMultiSelectBox } from '@/components/ui/feesmultiselect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    getCollegeLoanBranches,
    getCollegeLoanInitialData,
    getCollegeLoanSemesters,
    getCollegeLoanStudents
} from '@/server/fees/college/transaction/collegeloanandscholarship';
import type {
    IClgBatch,
    IClgBranch,
    IClgCourse,
    IClgSemester,
    IClgStudentItem
} from '@/types/fees/college/transaction/collegeloanandscholarship';
import { Eye, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface FilterSectionProps {
    onShowStudents: (students: IClgStudentItem[], batchId: number, batchName: string) => void;
    onReset: () => void;
    selectedBatchId: number | null;
    setSelectedBatchId: (id: number | null) => void;
}

export default function CollegeLoanFilterSection({
    onShowStudents,
    onReset,
    selectedBatchId,
    setSelectedBatchId
}: FilterSectionProps) {
    const [batches, setBatches] = useState<IClgBatch[]>([]);
    const [courses, setCourses] = useState<IClgCourse[]>([]);
    const [branches, setBranches] = useState<IClgBranch[]>([]);
    const [semesters, setSemesters] = useState<IClgSemester[]>([]);
    const [students, setStudents] = useState<IClgStudentItem[]>([]);

    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
    const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
    const [selectedSemesterIds, setSelectedSemesterIds] = useState<string[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

    const [loadingInit, setLoadingInit] = useState(false);
    const [loadingBranches, setLoadingBranches] = useState(false);
    const [loadingSemesters, setLoadingSemesters] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Initial load: batches and courses
    useEffect(() => {
        const fetchInitial = async () => {
            setLoadingInit(true);
            try {
                const res = await getCollegeLoanInitialData();
                if (res?.batchList && res.batchList.length > 0) {
                    setBatches(res.batchList);
                    if (!selectedBatchId) {
                        setSelectedBatchId(res.batchList[0].acmB_Id);
                    }
                }
                if (res?.courseList && res.courseList.length > 0) {
                    setCourses(res.courseList);
                }
            } catch (err) {
                console.error('Error fetching initial batch and course data:', err);
            } finally {
                setLoadingInit(false);
            }
        };

        fetchInitial();
    }, [selectedBatchId, setSelectedBatchId]);

    // When Courses change, fetch Branches
    useEffect(() => {
        if (selectedCourseIds.length === 0) {
            setBranches([]);
            setSelectedBranchIds([]);
            setSemesters([]);
            setSelectedSemesterIds([]);
            setStudents([]);
            setSelectedStudentIds([]);
            return;
        }

        const fetchBranches = async () => {
            setLoadingBranches(true);
            try {
                const res = await getCollegeLoanBranches({
                    courselistarray: selectedCourseIds.map((id) => ({ amcO_Id: Number(id) }))
                });
                setBranches(res.branchList || []);
            } catch (err) {
                console.error('Error fetching branches:', err);
            } finally {
                setLoadingBranches(false);
            }
        };

        fetchBranches();
    }, [selectedCourseIds]);

    // When Courses or Branches change, fetch Semesters
    useEffect(() => {
        if (selectedCourseIds.length === 0 || selectedBranchIds.length === 0) {
            setSemesters([]);
            setSelectedSemesterIds([]);
            setStudents([]);
            setSelectedStudentIds([]);
            return;
        }

        const fetchSemesters = async () => {
            setLoadingSemesters(true);
            try {
                const res = await getCollegeLoanSemesters({
                    courselistarray: selectedCourseIds.map((id) => ({ amcO_Id: Number(id) })),
                    branchlistarray: selectedBranchIds.map((id) => ({ amB_Id: Number(id) }))
                });
                setSemesters(res.semesterList || []);
            } catch (err) {
                console.error('Error fetching semesters:', err);
            } finally {
                setLoadingSemesters(false);
            }
        };

        fetchSemesters();
    }, [selectedCourseIds, selectedBranchIds]);

    // When Course, Branch, Semester are selected, fetch Students
    useEffect(() => {
        if (
            !selectedBatchId ||
            selectedCourseIds.length === 0 ||
            selectedBranchIds.length === 0 ||
            selectedSemesterIds.length === 0
        ) {
            setStudents([]);
            setSelectedStudentIds([]);
            return;
        }

        const fetchStudents = async () => {
            setLoadingStudents(true);
            try {
                const res = await getCollegeLoanStudents({
                    acmB_Id: selectedBatchId,
                    courselistarray: selectedCourseIds.map((id) => ({ amcO_Id: Number(id) })),
                    branchlistarray: selectedBranchIds.map((id) => ({ amB_Id: Number(id) })),
                    semesterlistarray: selectedSemesterIds.map((id) => ({ amsE_Id: Number(id) }))
                });
                setStudents(res.studentList || []);
            } catch (err) {
                console.error('Error fetching students:', err);
            } finally {
                setLoadingStudents(false);
            }
        };

        fetchStudents();
    }, [selectedBatchId, selectedCourseIds, selectedBranchIds, selectedSemesterIds]);

    // Validation & Show Handler
    const handleShow = () => {
        if (!selectedBatchId) {
            toast.error('Please select Batch.');
            return;
        }
        if (selectedCourseIds.length === 0) {
            toast.error('Please select at least one Course.');
            return;
        }
        if (selectedBranchIds.length === 0) {
            toast.error('Please select at least one Branch.');
            return;
        }
        if (selectedSemesterIds.length === 0) {
            toast.error('Please select at least one Semester.');
            return;
        }
        if (selectedStudentIds.length === 0) {
            toast.error('Please select at least one Student.');
            return;
        }

        const chosenStudents = students.filter((s) => selectedStudentIds.includes(s.amcsT_Id.toString()));
        if (chosenStudents.length === 0) {
            toast.error('No students found for the selected criteria.');
            return;
        }

        const batchObj = batches.find((b) => b.acmB_Id === selectedBatchId);
        onShowStudents(chosenStudents, selectedBatchId, batchObj?.acmsN_SessionName || '2026-2027');
    };

    // Reset Handler
    const handleCancel = () => {
        setSelectedCourseIds([]);
        setSelectedBranchIds([]);
        setSelectedSemesterIds([]);
        setSelectedStudentIds([]);
        setBranches([]);
        setSemesters([]);
        setStudents([]);
        onReset();
        toast.info('Selections cleared.');
    };

    return (
        <Card className='p-5 shadow-md border bg-white space-y-5 rounded-2xl'>
            <div className='border-b pb-3 flex items-center justify-between'>
                <h3 className='font-bold text-base text-gray-800 uppercase tracking-wide'>
                    COLLEGE LOAN FROM INSTITUTION & SCHOLARSHIP AMOUNT ENTRY
                </h3>
            </div>

            {/* Batch Selection */}
            <div className='flex items-center gap-4 max-w-sm'>
                <Label className='whitespace-nowrap text-xs font-bold text-gray-700 uppercase'>
                    Batch <span className='text-red-500'>*</span>
                </Label>
                <Select
                    value={selectedBatchId?.toString() || ''}
                    onValueChange={(val) => {
                        const id = Number(val);
                        setSelectedBatchId(id);
                        handleCancel();
                    }}
                    disabled={loadingInit}>
                    <SelectTrigger className='w-full bg-gray-50/50 text-xs h-9'>
                        <SelectValue placeholder='Select Batch' />
                    </SelectTrigger>
                    <SelectContent>
                        {batches.map((b) => (
                            <SelectItem key={b.acmB_Id} value={b.acmB_Id.toString()} className='text-xs'>
                                {b.acmsN_SessionName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* 4 Multi-Select Box Columns */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1'>
                {/* 1. Course */}
                <div className='rounded-xl border p-3 bg-gray-50/40 shadow-xs'>
                    <FeesCustomMultiSelectBox
                        label='Course'
                        isRequired={true}
                        isSearchRequired={true}
                        options={courses.map((c) => ({
                            label: c.amcO_CourseName,
                            value: c.amcO_Id.toString()
                        }))}
                        value={selectedCourseIds}
                        onChange={(vals) => setSelectedCourseIds(vals)}
                        disabled={!selectedBatchId}
                        isLoading={loadingInit}
                        height='220px'
                    />
                </div>

                {/* 2. Branch */}
                <div className='rounded-xl border p-3 bg-gray-50/40 shadow-xs'>
                    <FeesCustomMultiSelectBox
                        label='Branch'
                        isRequired={true}
                        isSearchRequired={true}
                        options={branches.map((b) => ({
                            label: b.amB_BranchName,
                            value: b.amB_Id.toString()
                        }))}
                        value={selectedBranchIds}
                        onChange={(vals) => setSelectedBranchIds(vals)}
                        disabled={selectedCourseIds.length === 0}
                        isLoading={loadingBranches}
                        height='220px'
                    />
                </div>

                {/* 3. Semester */}
                <div className='rounded-xl border p-3 bg-gray-50/40 shadow-xs'>
                    <FeesCustomMultiSelectBox
                        label='Semester'
                        isRequired={true}
                        isSearchRequired={true}
                        options={semesters.map((s) => ({
                            label: s.amsE_SEMName,
                            value: s.amsE_Id.toString()
                        }))}
                        value={selectedSemesterIds}
                        onChange={(vals) => setSelectedSemesterIds(vals)}
                        disabled={selectedBranchIds.length === 0}
                        isLoading={loadingSemesters}
                        height='220px'
                    />
                </div>

                {/* 4. Students */}
                <div className='rounded-xl border p-3 bg-gray-50/40 shadow-xs'>
                    <FeesCustomMultiSelectBox
                        label='Students'
                        isRequired={true}
                        isSearchRequired={true}
                        options={students.map((st) => ({
                            label: st.displayName || `${st.studentName} - ${st.amcO_CourseName}-${st.amB_BranchName}-${st.amsE_SEMName}`,
                            value: st.amcsT_Id.toString()
                        }))}
                        value={selectedStudentIds}
                        onChange={(vals) => setSelectedStudentIds(vals)}
                        disabled={selectedSemesterIds.length === 0}
                        isLoading={loadingStudents}
                        height='220px'
                    />
                </div>
            </div>

            {/* Action Buttons: SHOW & CANCEL */}
            <div className='flex items-center justify-center gap-4 pt-3 border-t'>
                <Button
                    type='button'
                    onClick={handleShow}
                    className='px-8 bg-primary text-white hover:bg-primary/90 flex items-center gap-1.5 shadow-sm'>
                    <Eye className='h-4 w-4' /> SHOW
                </Button>
                <Button
                    type='button'
                    variant='outline'
                    onClick={handleCancel}
                    className='px-8 border-rose-300 text-rose-700 hover:bg-rose-50 flex items-center gap-1.5 shadow-sm'>
                    <RotateCcw className='h-4 w-4' /> CANCEL
                </Button>
            </div>
        </Card>
    );
}
