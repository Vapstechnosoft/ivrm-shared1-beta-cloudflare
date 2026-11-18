'use client';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { forwardRef } from 'react';
import { toast } from 'sonner';

/* Reusable Cells */
const TableCell = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
    <td
        ref={ref}
        className={cn(
            'whitespace-nowrap border-gray-300 border-t border-r border-b p-2 align-middle text-[#0C0A09] text-[14px]',
            className
        )}
        {...props}
    />
));
TableCell.displayName = 'TableCell';

const TableHeaderCell = forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
    <th
        ref={ref}
        className={cn(
            'border border-black-300 bg-[hsl(277_90%_52%)] p-2 text-center align-middle font-medium text-sm text-white',
            className
        )}
        {...props}
    />
));
TableHeaderCell.displayName = 'TableHeaderCell';

/* ================== TYPES ================== */
interface Subject {
    id: number;
    name: string;
}

interface StudentSubjectMapping {
    id: number;
    estsU_ElecetiveFlag?: boolean;
    estsU_ActiveFlg?: boolean;
    estsU_CreatedBy?: number;
    estsU_UpdatedBy?: number;
    createdDate?: string;
    updatedDate?: string;
    name?: string;
    abc?: boolean;
}

interface Student {
    amsT_Id: number;
    amsT_FirstName: string;
    amsT_MiddleName?: string;
    amsT_LastName?: string;
    amsT_AdmNo: string;
    amaY_RollNo: number;
    sub_list: StudentSubjectMapping[];
    sub_list_view: StudentSubjectMapping[];
}

interface Payload {
    estsU_Id: number;
    // mI_Id: number;
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    emcA_Id?: number;
    emG_Id: number;
    emE_Id: number;
    userId: number;
    left_Flag: boolean;
    deactive_Flag: boolean;
    get_list: Array<{
        amsT_Id: number;
        sub_list: StudentSubjectMapping[];
    }>;
    get_Removed_list: Array<{
        amsT_Id: number;
        sub_list: StudentSubjectMapping[];
    }>;
}

interface Props {
    students: Student[];
    subjects: Subject[];
    isloading?: boolean;
    onUpdateMapping: (payload: Payload) => Promise<void>;
    maxApplicableSubjects?: number;
    // Additional props for payload
    estsU_Id: number;
    // mI_Id: number;
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    emcA_Id?: number;
    emG_Id: number;
    emE_Id: number;
    userId: number;
    left_Flag: boolean;
    deactive_Flag: boolean;
}

export interface StudentMappingTableHandle {
    reset: () => void;
}

/* ================== HELPER FUNCTIONS ================== */
const getStudentFullName = (student: { amsT_FirstName?: string; amsT_MiddleName?: string; amsT_LastName?: string }) => {
    const rawParts = [student.amsT_FirstName, student.amsT_MiddleName, student.amsT_LastName]
        .filter(Boolean)
        .map((p) => String(p).trim())
        .filter((p) => p && p !== '0');

    const words: string[] = [];
    for (const part of rawParts) {
        for (const w of part.split(/\s+/)) {
            if (w) words.push(w);
        }
    }

    const uniqueWords = words.filter((w, idx) => idx === 0 || w.toLowerCase() !== words[idx - 1].toLowerCase());
    return uniqueWords.join(' ');
};

/* ================== MAIN COMPONENT ================== */
const StudentSubjectMappingTable = forwardRef<StudentMappingTableHandle, Props>(
    (
        {
            students,
            subjects,
            onUpdateMapping,
            isloading = false,
            estsU_Id,
            asmaY_Id,
            asmcL_Id,
            asmS_Id,
            emcA_Id,
            emG_Id,
            emE_Id,
            userId,
            left_Flag,
            deactive_Flag,
            maxApplicableSubjects = 2
        },
        ref
    ) => {
        const [searchTerm, setSearchTerm] = useState('');
        const [localStudents, setLocalStudents] = useState<Student[]>([]);
        
        // Fully reactive map: key is `${studentId}_${subjectId}` -> boolean
        const [checkedState, setCheckedState] = useState<Record<string, boolean>>({});
        // Initial map to track what was originally checked from the server
        const [initialState, setInitialState] = useState<Record<string, boolean>>({});
        
        const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
        const [disabledStudents, setDisabledStudents] = useState<Set<number>>(new Set());
        const [studentToDelete, setStudentToDelete] = useState<{ id: number; name: string } | null>(null);
        const [showDeleteDialog, setShowDeleteDialog] = useState(false);

        /** Create a single subject mapping object for payload */
        const createSubjectMapping = useCallback(
            (subjectId: number, isActive: boolean): StudentSubjectMapping => {
                const now = new Date().toISOString();
                const subject = subjects.find((s) => s.id === subjectId);

                return {
                    id: subjectId,
                    name: subject?.name || `Subject ${subjectId}`,
                    estsU_ElecetiveFlag: true,
                    estsU_ActiveFlg: isActive,
                    estsU_CreatedBy: userId,
                    estsU_UpdatedBy: userId,
                    createdDate: now,
                    updatedDate: now
                };
            },
            [subjects, userId]
        );

        /** Build payload from checkedState, initialState, and disabledStudents */
        const buildPayload = useCallback(
            (
                currentMap: Record<string, boolean>,
                initMap: Record<string, boolean>,
                disabledSet: Set<number>
            ): Payload => {
                const getListArray: Array<{ amsT_Id: number; sub_list: StudentSubjectMapping[] }> = [];
                const getRemovedListArray: Array<{ amsT_Id: number; sub_list: StudentSubjectMapping[] }> = [];

                for (const student of students) {
                    const studentId = student.amsT_Id;

                    if (disabledSet.has(studentId)) {
                        // All originally mapped subjects go into get_Removed_list
                        const removedSubs: StudentSubjectMapping[] = [];
                        for (const subject of subjects) {
                            if (initMap[`${studentId}_${subject.id}`]) {
                                removedSubs.push(createSubjectMapping(subject.id, false));
                            }
                        }
                        if (removedSubs.length > 0) {
                            getRemovedListArray.push({
                                amsT_Id: studentId,
                                sub_list: removedSubs
                            });
                        }
                        continue;
                    }

                    const activeSubs: StudentSubjectMapping[] = [];
                    const removedSubs: StudentSubjectMapping[] = [];

                    for (const subject of subjects) {
                        const isCurrentlyChecked = Boolean(currentMap[`${studentId}_${subject.id}`]);
                        const wasInitiallyChecked = Boolean(initMap[`${studentId}_${subject.id}`]);

                        if (isCurrentlyChecked) {
                            activeSubs.push(createSubjectMapping(subject.id, true));
                        }

                        if (wasInitiallyChecked && !isCurrentlyChecked) {
                            removedSubs.push(createSubjectMapping(subject.id, false));
                        }
                    }

                    if (activeSubs.length > 0) {
                        getListArray.push({
                            amsT_Id: studentId,
                            sub_list: activeSubs
                        });
                    }

                    if (removedSubs.length > 0) {
                        getRemovedListArray.push({
                            amsT_Id: studentId,
                            sub_list: removedSubs
                        });
                    }
                }

                return {
                    estsU_Id,
                    asmaY_Id,
                    asmcL_Id,
                    asmS_Id,
                    emcA_Id,
                    emG_Id,
                    emE_Id,
                    userId,
                    left_Flag,
                    deactive_Flag,
                    get_list: getListArray,
                    get_Removed_list: getRemovedListArray
                };
            },
            [
                students,
                subjects,
                createSubjectMapping,
                estsU_Id,
                asmaY_Id,
                asmcL_Id,
                asmS_Id,
                emcA_Id,
                emG_Id,
                emE_Id,
                userId,
                left_Flag,
                deactive_Flag
            ]
        );

        // Initialize local state from props
        const initializeState = useCallback(() => {
            if (students && students.length > 0) {
                setLocalStudents(students);

                const initMap: Record<string, boolean> = {};
                const curMap: Record<string, boolean> = {};
                const initialSelected = new Set<number>();

                students.forEach((student) => {
                    let hasChecked = false;
                    (student.sub_list || []).forEach((sub) => {
                        const isChecked = !!sub.abc;
                        initMap[`${student.amsT_Id}_${sub.id}`] = isChecked;
                        curMap[`${student.amsT_Id}_${sub.id}`] = isChecked;
                        if (isChecked) hasChecked = true;
                    });
                    if (hasChecked) {
                        initialSelected.add(student.amsT_Id);
                    }
                });

                setInitialState(initMap);
                setCheckedState(curMap);
                setSelectedStudents(initialSelected);
                const disabled = new Set<number>();
                setDisabledStudents(disabled);

                if (onUpdateMapping) {
                    onUpdateMapping(buildPayload(curMap, initMap, disabled));
                }
            } else {
                setLocalStudents([]);
                setCheckedState({});
                setInitialState({});
                setSelectedStudents(new Set());
                setDisabledStudents(new Set());
            }
        }, [students, buildPayload, onUpdateMapping]);

        useEffect(() => {
            initializeState();
        }, [initializeState]);

        useImperativeHandle(ref, () => ({
            reset: () => {
                initializeState();
                toast.info('Grid selection reset');
            }
        }));

        /** 🔍 SEARCH FILTER */
        const normalize = (value: string) =>
            value
                .trim()
                .replace(/\s+/g, ' ')
                .toLowerCase();

        const filteredStudents = useMemo(() => {
            const query = normalize(searchTerm);
            if (!query) return localStudents;

            return localStudents.filter((s) => {
                const fullName = normalize(getStudentFullName(s));
                const admNo = normalize(s.amsT_AdmNo || '');
                const rollNo = String(s.amaY_RollNo || '');

                return fullName.includes(query) || admNo.includes(query) || rollNo.includes(query);
            });
        }, [localStudents, searchTerm]);

        /** Get current checked state for a student-subject */
        const getCurrentCheckedState = useCallback(
            (studentId: number, subjectId: number): boolean => {
                if (disabledStudents.has(studentId)) return false;
                return Boolean(checkedState[`${studentId}_${subjectId}`]);
            },
            [checkedState, disabledStudents]
        );

        /** Handle individual checkbox change */
        const handleIndividualChange = useCallback(
            (studentId: number, subjectId: number, checked: boolean) => {
                if (disabledStudents.has(studentId)) return;

                const next = { ...checkedState, [`${studentId}_${subjectId}`]: checked };
                setCheckedState(next);

                // Auto-update row selection if at least one subject is checked
                setSelectedStudents((prev) => {
                    const newSet = new Set(prev);
                    const hasAny = subjects.some((s) => (s.id === subjectId ? checked : Boolean(next[`${studentId}_${s.id}`])));
                    if (hasAny) {
                        newSet.add(studentId);
                    } else {
                        newSet.delete(studentId);
                    }
                    return newSet;
                });

                if (onUpdateMapping) {
                    onUpdateMapping(buildPayload(next, initialState, disabledStudents));
                }
            },
            [checkedState, disabledStudents, subjects, onUpdateMapping, buildPayload, initialState]
        );

        /** Handle student row selection checkbox change */
        const handleStudentSelectionChange = useCallback(
            (studentId: number, checked: boolean) => {
                if (disabledStudents.has(studentId)) return;

                const next = { ...checkedState };
                subjects.forEach((s) => {
                    next[`${studentId}_${s.id}`] = checked;
                });

                setCheckedState(next);

                setSelectedStudents((prev) => {
                    const newSet = new Set(prev);
                    if (checked) {
                        newSet.add(studentId);
                    } else {
                        newSet.delete(studentId);
                    }
                    return newSet;
                });

                if (onUpdateMapping) {
                    onUpdateMapping(buildPayload(next, initialState, disabledStudents));
                }
            },
            [checkedState, disabledStudents, subjects, onUpdateMapping, buildPayload, initialState]
        );

        /** Toggle all students for a specific subject column */
        const toggleSubjectAll = useCallback(
            (subjectId: number, checked: boolean) => {
                const next = { ...checkedState };

                filteredStudents.forEach((student) => {
                    if (!disabledStudents.has(student.amsT_Id)) {
                        next[`${student.amsT_Id}_${subjectId}`] = checked;
                    }
                });

                setCheckedState(next);

                // Update selectedStudents
                setSelectedStudents((prev) => {
                    const newSet = new Set(prev);
                    filteredStudents.forEach((student) => {
                        if (!disabledStudents.has(student.amsT_Id)) {
                            const hasAny = subjects.some((s) =>
                                s.id === subjectId ? checked : Boolean(next[`${student.amsT_Id}_${s.id}`])
                            );
                            if (hasAny) {
                                newSet.add(student.amsT_Id);
                            } else {
                                newSet.delete(student.amsT_Id);
                            }
                        }
                    });
                    return newSet;
                });

                if (onUpdateMapping) {
                    onUpdateMapping(buildPayload(next, initialState, disabledStudents));
                }
            },
            [checkedState, filteredStudents, disabledStudents, subjects, onUpdateMapping, buildPayload, initialState]
        );

        /** Check if all filtered active students have a specific subject checked */
        const isSubjectAllChecked = useCallback(
            (subjectId: number): boolean => {
                const activeStudents = filteredStudents.filter((s) => !disabledStudents.has(s.amsT_Id));
                if (activeStudents.length === 0) return false;
                return activeStudents.every((s) => Boolean(checkedState[`${s.amsT_Id}_${subjectId}`]));
            },
            [filteredStudents, disabledStudents, checkedState]
        );

        /** Select or Deselect all students and all subjects */
        const handleSelectAllStudents = useCallback(
            (checked: boolean) => {
                const next = { ...checkedState };
                const newSelected = new Set(selectedStudents);

                filteredStudents.forEach((student) => {
                    if (!disabledStudents.has(student.amsT_Id)) {
                        subjects.forEach((s) => {
                            next[`${student.amsT_Id}_${s.id}`] = checked;
                        });
                        if (checked) {
                            newSelected.add(student.amsT_Id);
                        } else {
                            newSelected.delete(student.amsT_Id);
                        }
                    }
                });

                setCheckedState(next);
                setSelectedStudents(newSelected);

                if (onUpdateMapping) {
                    onUpdateMapping(buildPayload(next, initialState, disabledStudents));
                }
            },
            [checkedState, selectedStudents, filteredStudents, disabledStudents, subjects, onUpdateMapping, buildPayload, initialState]
        );

        /** Check if all filtered students are selected */
        const isAllStudentsSelected = useMemo(() => {
            const activeStudents = filteredStudents.filter((student) => !disabledStudents.has(student.amsT_Id));
            if (activeStudents.length === 0) return false;
            return activeStudents.every((student) => selectedStudents.has(student.amsT_Id));
        }, [filteredStudents, selectedStudents, disabledStudents]);

        /** Handle delete student confirmation */
        const handleDeleteStudent = useCallback((student: Student) => {
            const fullName = getStudentFullName(student);
            setStudentToDelete({ id: student.amsT_Id, name: fullName });
            setShowDeleteDialog(true);
        }, []);

        /** Confirm delete student */
        const confirmDeleteStudent = useCallback(() => {
            if (studentToDelete) {
                const newDisabled = new Set(disabledStudents);
                newDisabled.add(studentToDelete.id);
                setDisabledStudents(newDisabled);

                setSelectedStudents((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(studentToDelete.id);
                    return newSet;
                });

                const next = { ...checkedState };
                subjects.forEach((s) => {
                    delete next[`${studentToDelete.id}_${s.id}`];
                });
                setCheckedState(next);

                if (onUpdateMapping) {
                    onUpdateMapping(buildPayload(next, initialState, newDisabled));
                }

                toast.success(`Student ${studentToDelete.name} has been removed`);
                setShowDeleteDialog(false);
                setStudentToDelete(null);
            }
        }, [studentToDelete, disabledStudents, checkedState, subjects, onUpdateMapping, buildPayload, initialState]);

        /** Check if delete icon should be shown for student */
        const shouldShowDeleteIcon = useCallback(
            (student: Student) => {
                return !disabledStudents.has(student.amsT_Id) && (student.sub_list || []).some((s) => s.abc);
            },
            [disabledStudents]
        );

        if (isloading) {
            return (
                <div className='flex items-center justify-center p-8'>
                    <div className='text-center'>
                        <div className='mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-[hsl(277_90%_52%)] border-b-2'>
                            Loading student-subject mappings...
                        </div>
                    </div>
                </div>
            );
        }

        if (!subjects || subjects.length === 0) {
            return <div className='p-8 text-center text-gray-500'>No subjects available</div>;
        }

        if (!localStudents || localStudents.length === 0) {
            return <div className='p-8 text-center text-gray-500'>No students available</div>;
        }

        return (
            <div className='space-y-4'>
                {/* 🔎 SEARCH AND ACTIONS */}
                <div className='flex items-center justify-between border-b bg-gray-50 p-3'>
                    <div>
                        <span className='font-medium text-gray-700'>
                            Total Students: {localStudents.length} | Filtered: {filteredStudents.length}
                        </span>
                    </div>

                    <div className='flex items-center gap-3'>
                        <Input
                            placeholder='Search student by name, admission no, or roll no...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='w-80'
                        />
                    </div>
                </div>

                <div className='overflow-x-auto rounded border bg-white shadow-sm'>
                    <table className='min-w-full border-collapse border border-gray-300'>
                        <thead>
                            <tr>
                                <TableHeaderCell rowSpan={2}>Sl No</TableHeaderCell>
                                <TableHeaderCell rowSpan={2}>
                                    <div className='flex items-center justify-center gap-2'>
                                        <Checkbox
                                            checked={isAllStudentsSelected}
                                            onCheckedChange={(c) => handleSelectAllStudents(!!c)}
                                            className='h-5 w-5 border-white bg-white data-[state=checked]:bg-white data-[state=checked]:text-primary data-[state=unchecked]:bg-white'
                                        />
                                    </div>
                                </TableHeaderCell>
                                <TableHeaderCell rowSpan={2}>Student Details</TableHeaderCell>

                                {subjects.map((sub) => (
                                    <TableHeaderCell key={`subject-header-${sub.id}`}>
                                        <div className='flex flex-col items-center px-2'>
                                            <span className='mb-2 font-semibold text-sm'>{sub.name}</span>
                                            {/* TOGGLE ALL Column for this Subject */}
                                            <Checkbox
                                                checked={isSubjectAllChecked(sub.id)}
                                                onCheckedChange={(c) => toggleSubjectAll(sub.id, !!c)}
                                                className='h-5 w-5 border-white bg-white data-[state=checked]:bg-white data-[state=checked]:text-primary data-[state=unchecked]:bg-white'
                                            />
                                        </div>
                                    </TableHeaderCell>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <TableCell colSpan={subjects.length + 3} className='py-8 text-center text-gray-500'>
                                        No students found matching your search criteria
                                    </TableCell>
                                </tr>
                            ) : (
                                filteredStudents.map((student, index) => {
                                    const isDisabled = disabledStudents.has(student.amsT_Id);
                                    const isSelected = selectedStudents.has(student.amsT_Id);
                                    const showDelete = shouldShowDeleteIcon(student);

                                    return (
                                        <tr
                                            key={`student-${student.amsT_Id}`}
                                            className={cn(
                                                'bg-white transition-colors duration-200 hover:bg-gray-50',
                                                isDisabled && 'bg-gray-100 opacity-50'
                                            )}>
                                            <TableCell className='text-center font-medium'>{index + 1}</TableCell>
                                            <TableCell className='text-center'>
                                                <div className='flex items-center justify-center gap-2'>
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={(c) => handleStudentSelectionChange(student.amsT_Id, !!c)}
                                                        disabled={isDisabled}
                                                        className='h-5 w-5'
                                                    />
                                                    {showDelete && (
                                                        <button
                                                            type='button'
                                                            onClick={() => handleDeleteStudent(student)}
                                                            disabled={isDisabled}
                                                            className='text-red-500 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50'
                                                            title='Remove student mappings'
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className={cn(isDisabled && 'opacity-50')}>
                                                <div className='font-semibold text-gray-800'>
                                                    {getStudentFullName(student)}
                                                </div>
                                                <div className='space-y-0.5 text-gray-600 text-xs'>
                                                    <div>Admission No: {student.amsT_AdmNo}</div>
                                                    <div>Roll No: {student.amaY_RollNo}</div>
                                                    <div className='text-[10px] text-gray-400'>ID: {student.amsT_Id}</div>
                                                </div>
                                            </TableCell>

                                            {subjects.map((subject) => (
                                                <TableCell
                                                    key={`student-${student.amsT_Id}-subject-${subject.id}`}
                                                    className={cn('text-center', isDisabled && 'opacity-50')}>
                                                    <div className='flex justify-center'>
                                                        <Checkbox
                                                            checked={getCurrentCheckedState(student.amsT_Id, subject.id)}
                                                            onCheckedChange={(checked) =>
                                                                handleIndividualChange(student.amsT_Id, subject.id, !!checked)
                                                            }
                                                            disabled={isDisabled}
                                                        />
                                                    </div>
                                                </TableCell>
                                            ))}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>Do You Want To Remove This Record</AlertDialogDescription>
                        </AlertDialogHeader>
                        {studentToDelete && (
                            <div className='py-4'>
                                <div className='font-medium text-gray-800'>{studentToDelete.name}</div>
                                <div className='mt-2 text-gray-600 text-sm'>
                                    This action will disable the student row and you won't be able to access it anymore.
                                </div>
                            </div>
                        )}
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDeleteStudent} className='bg-red-500 text-white hover:bg-red-600'>
                                Yes, Remove it!
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        );
    }
);

StudentSubjectMappingTable.displayName = 'StudentSubjectMappingTable';

export default StudentSubjectMappingTable;
