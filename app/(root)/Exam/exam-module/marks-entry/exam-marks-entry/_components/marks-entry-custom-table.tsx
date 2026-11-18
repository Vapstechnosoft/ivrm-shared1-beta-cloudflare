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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { GetExamMarksEntryOnSearch, addOrUpdateStudentMarks } from '@/server/exam/exam-module/marks-entry/exam-marks-entry';
import { Loader2, RotateCcw, Save } from 'lucide-react';
import React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

/* ============================================
   Types
   ============================================ */
export interface SubSubjectData {
    emsS_Id: number;
    emsS_SubSubjectName: string;
    eycessS_MaxMarks: number;
    eycessS_MinMarks?: number;
    eycessS_MarksEntryMax: number;
}

export interface SubExamData {
    emsE_Id: number;
    emsE_SubExamName: string;
    eycessE_MaxMarks: number;
    eycessE_MinMarks?: number;
    eycessE_MarksEntryMax: number;
}

export interface StudentMarksEntry {
    amsT_Id: number;
    amsT_FirstName: string;
    amsT_AdmNo: string;
    amsT_RegistrationNo: string;
    amaY_RollNo: number;
    ismS_Id: number;
    ismS_SubjectName: string;
    eyceS_MaxMarks: number;
    eyceS_MinMarks: number;
    eyceS_MarksEntryMax: number;
    estM_Marks?: number;
    estM_Grade?: string;
    estM_Flg?: string;
    estM_Id?: number;
    estmanssH_AnswerSheet?: string | null;
    estmanssH_FileLocation?: string | null;
    selected?: boolean;
    ESTM_Marks?: string | number;
    ESTMSS_Marks?: { [key: number]: string } | { [key: number]: { [key: number]: string } } | { [key: string]: any };
    papertype?: string;
    papertypeid?: number;
    estM_Flg_new?: string;
    estM_Grade_new?: string;
    estM_Marks_new?: number;
}

interface Configuration {
    exmConfig_RegnoColumnDisplay: boolean;
    exmConfig_AdmnoColumnDisplay: boolean;
    exmConfig_RollnoColumnDisplay: boolean;
    exmConfig_Recordsearchtype: 'Name' | 'AdmNo' | 'RollNo' | 'RegNo';
}

interface SavedMarksEntry {
    estmsS_Id?: number;
    AMST_Id: number;
    ISMS_Id: number;
    EMSS_Id?: number;
    EMSE_Id?: number;
    ESTM_MarksGradeFlg: string;
    ESTM_ID: number;
    ESTM_Marks?: number;
    ESTM_Grade?: string | null;
    ESTM_Flg?: string | null;
    ESTMSS_Marks?: number;
    ESTMSS_Grade?: string | null;
    ESTMSS_Flg?: string | null;
    estmsS_ActiveFlg?: boolean;
}

interface SubjectMeta {
    subjectId: number;
    subjectName: string;
    subsubFlag: boolean;
    subexamFlag: boolean;
    maxMarks: number;
    minMarks: number;
    marksEntryMax: number;
    marksGradeEntryFlg: 'M' | 'G';
    subsubData: Array<{
        subsubId: number;
        subsubName: string;
        maxMarks: number;
        minMarks?: number;
        marksEntryMax: number;
    }>;
    subexamData: Array<{
        subexamId: number;
        subexamName: string;
        maxMarks: number;
        minMarks?: number;
        marksEntryMax: number;
    }>;
    saved_sub_subjectOrExam_list: SavedMarksEntry[];
    saved_sub_subject_list: SavedMarksEntry[];
}

interface MarksCustomTableProps {
    ASMAY_Id: number | null;
    ASMCL_Id: number | null;
    ASMS_Id: number | null;
    EME_Id: number | null;
    ISMS_Id: number | null;
    onSave?: (data: any) => Promise<void>;
    onClose: () => void;
    userPrivileges?: any;
}

/* ============================================
   Helper Functions
   ============================================ */
export function getNonEmptyArray(...arrs: any[]): any[] {
    for (const arr of arrs) {
        if (Array.isArray(arr) && arr.length > 0) {
            return arr;
        }
    }
    return [];
}

export function validateMarksOrGrade(
    val: string | number | undefined,
    max: number,
    marksGradeEntryFlg: 'M' | 'G',
    gradeDetails: (string | { emgD_Name?: string; EMGD_Name?: string })[] = [],
    papertypeid?: number,
    papertypeGradeDetails?: Array<{ empatY_Id?: number; emgD_Name?: string; EMGD_Name?: string }>
): string {
    const strVal = val === undefined || val === null ? '' : String(val).trim();
    if (!strVal) {
        return marksGradeEntryFlg === 'G' ? 'Enter Obtained Grade' : 'Enter Obtained Marks';
    }

    const validFlags = ['AB', 'L', 'M', 'OD'];
    const upper = strVal.toUpperCase();

    if (validFlags.includes(upper)) {
        return '';
    }

    if (marksGradeEntryFlg === 'G') {
        let isValid = false;
        if (papertypeid && papertypeGradeDetails && papertypeGradeDetails.length > 0) {
            isValid = papertypeGradeDetails.some((g) => {
                const name = (g.emgD_Name || g.EMGD_Name || '').toUpperCase();
                return name === upper;
            });
        }
        if (!isValid && gradeDetails && gradeDetails.length > 0) {
            isValid = gradeDetails.some((g) => {
                const name = (typeof g === 'string' ? g : g.emgD_Name || g.EMGD_Name || '').toUpperCase();
                return name === upper;
            });
        }
        if (!isValid) {
            return 'Entered Grade cant be out of master setting...!';
        }
        return '';
    }

    // Marks mode ('M')
    if (/[a-zA-Z]/.test(strVal)) {
        return 'Entered value cant be out of master setting...!';
    }

    if (!/^\d*\.?\d*$/.test(strVal)) {
        return 'Only numbers and decimal point allowed';
    }

    const num = Number.parseFloat(strVal);
    if (Number.isNaN(num)) {
        return 'Enter Obtained Marks';
    }

    if (num < 0) {
        return 'Entered marks cant be in negative values...!';
    }

    if (num > max) {
        return `Entered marks cant exceed ${max}`;
    }

    return '';
}

/* ============================================
   Table Cell Components
   ============================================ */
interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
    children?: React.ReactNode;
}

const TableCell = ({ className, children, ...props }: TableCellProps) => {
    const isCheckbox = React.isValidElement(children) && (children.type as any)?.displayName === 'Checkbox';

    return (
        <td
            className={`whitespace-nowrap p-2 align-middle text-[#0C0A09] text-[14px] ${isCheckbox ? 'pr-0' : ''} ${className || ''}`}
            {...props}>
            {isCheckbox ? <Checkbox {...(children as any).props} /> : children}
        </td>
    );
};

const TableHeaderCell = ({ className, children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className={`whitespace-nowrap bg-[#7C3AED] p-2 text-center align-middle text-white ${className || ''}`} {...props}>
        {children}
    </th>
);

/* ============================================
   MarksInputCell with Validation and Arrow Navigation
   ============================================ */
interface MarksInputCellProps {
    value: number | '' | string | undefined;
    max: number;
    min?: number;
    onChange: (v: number | '' | string) => void;
    placeholder?: string;
    marksGradeEntryFlg: 'M' | 'G';
    gradeDetails: (string | { emgD_Name?: string; EMGD_Name?: string })[];
    papertypeid?: number;
    papertypeGradeDetails?: Array<{ empatY_Id?: number; emgD_Name?: string; EMGD_Name?: string }>;
    onArrow?: (direction: 'left' | 'right' | 'up' | 'down') => void;
    disabled?: boolean;
}

const MarksInputCell = React.forwardRef<HTMLInputElement, MarksInputCellProps>(
    (
        {
            value,
            max,
            min: _min,
            onChange,
            placeholder,
            marksGradeEntryFlg,
            gradeDetails,
            papertypeid,
            papertypeGradeDetails,
            onArrow,
            disabled = false
        },
        ref
    ) => {
        const [local, setLocal] = useState<string>(value === '' || value === undefined ? '' : String(value));
        const [error, setError] = useState<string>('');

        useEffect(() => {
            const strVal = value === '' || value === undefined ? '' : String(value);
            setLocal(strVal);

            if (disabled) {
                setError('');
            } else {
                const err = validateMarksOrGrade(strVal, max, marksGradeEntryFlg, gradeDetails, papertypeid, papertypeGradeDetails);
                setError(err);
            }
        }, [value, disabled, max, marksGradeEntryFlg, gradeDetails, papertypeid, papertypeGradeDetails]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (disabled) return;
            const raw = e.target.value;
            setLocal(raw);

            const err = validateMarksOrGrade(raw, max, marksGradeEntryFlg, gradeDetails, papertypeid, papertypeGradeDetails);
            setError(err);

            if (raw.trim() === '') {
                onChange('');
                return;
            }

            if (marksGradeEntryFlg === 'G') {
                onChange(raw.trim().toUpperCase());
            } else {
                const flag = raw.trim().toUpperCase();
                if (['AB', 'L', 'M', 'OD'].includes(flag)) {
                    onChange(flag);
                } else {
                    onChange(raw.trim());
                }
            }
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (!onArrow) return;

            switch (e.key) {
                case 'ArrowRight':
                    onArrow('right');
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    onArrow('left');
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    onArrow('down');
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    onArrow('up');
                    e.preventDefault();
                    break;
                default:
                    break;
            }
        };

        return (
            <div className='flex flex-col items-start'>
                <Input
                    ref={ref}
                    disabled={disabled}
                    readOnly={disabled}
                    tabIndex={disabled ? -1 : 0}
                    className={`w-[120px] rounded border px-2 py-1 text-sm ${
                        disabled
                            ? 'pointer-events-none cursor-not-allowed bg-gray-100 opacity-60'
                            : error
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-300 bg-white'
                    }`}
                    placeholder={placeholder}
                    value={local}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    style={{
                        fontSize: '14px'
                    }}
                />
                {!disabled && error ? <div className='mt-[2px] text-[11px] text-red-600 leading-none'>{error}</div> : null}
            </div>
        );
    }
);

MarksInputCell.displayName = 'MarksInputCell';

/* ============================================
   Main Component
   ============================================ */
export function MarksCustomTable({ ASMAY_Id, ASMCL_Id, ASMS_Id, EME_Id, ISMS_Id, onSave, onClose, userPrivileges }: MarksCustomTableProps) {
    // State
    const [isLoading, setIsLoading] = useState(false);
    const [isStudentsGridOpen, setIsStudentsGridOpen] = useState(false);
    const [students, setStudents] = useState<StudentMarksEntry[]>([]);
    const [subjectMeta, setSubjectMeta] = useState<SubjectMeta | null>(null);
    const [config, setConfig] = useState<Configuration | null>(null);
    const [marksDeleteFlag, setMarksDeleteFlag] = useState(false);
    const [lastDateEntryFlag, setLastDateEntryFlag] = useState(true);
    const [lastDateExamFlag, setLastDateExamFlag] = useState(true);
    const [tempSubsMarksList, setTempSubsMarksList] = useState<SavedMarksEntry[]>([]);
    const [allSelected, setAllSelected] = useState(false);
    const [gradeDetails, setGradeDetails] = useState<string[]>([]);
    const [paperTypeGradeDetails, setPaperTypeGradeDetails] = useState<any[]>([]);
    const [subSubjectGradeDetails, setSubSubjectGradeDetails] = useState<any[]>([]);
    const [subExamGradeDetails, setSubExamGradeDetails] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [showInfoDialog, setShowInfoDialog] = useState(false);
    const [tempSubSubjsExams, setTempSubSubjsExams] = useState<any[]>([]);
    const [subjectSubsubjectsDetails, setSubjectSubsubjectsDetails] = useState<any[]>([]);
    const [_subjectSubexamsDetails, setSubjectSubexamsDetails] = useState<any[]>([]);

    // Ref for input navigation
    const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

    const handleSearch = useCallback(async () => {
        if (!ASMS_Id || !ASMCL_Id || !ASMAY_Id || !EME_Id || !ISMS_Id) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await GetExamMarksEntryOnSearch({
                ASMS_Id: ASMS_Id,
                ASMCL_Id: ASMCL_Id,
                ASMAY_Id: ASMAY_Id,
                EME_Id: EME_Id,
                ISMS_Id: ISMS_Id
            });
            const data = Array.isArray(response.data) ? response.data[0] : response.data;
            console.info('Api data for Marks Entry Search ', data);
            if (data === null) {
                toast.error('This Subject Is Not Mapped With Students');
                setIsStudentsGridOpen(false);
                setIsLoading(false);
                return;
            }

            if (data.eyceS_SubSubjectFlg && (!data.subject_subsubjects || data.subject_subsubjects.length === 0)) {
                setShowInfoDialog(true);
                return;
            }

            if (!data.studentList || data.studentList.length === 0) {
                toast.error('This Subject Is Not Mapped With Students');
                setIsStudentsGridOpen(false);
                setIsLoading(false);
                return;
            }

            // Set configuration
            if (data.configuration && data.configuration.length > 0) {
                setConfig(data.configuration[0]);
            }

            // Set flags
            setMarksDeleteFlag(data.marksdeleteflag);
            setLastDateEntryFlag(data.lastDateEntryFlag);
            setLastDateExamFlag(data.lastDateExamFlag);

            // Set grade details
            setGradeDetails(data.grade_details || []);
            setPaperTypeGradeDetails(data.get_papertype_grade_details || []);
            setSubSubjectGradeDetails(data.subsubject_gradedetails || []);
            setSubExamGradeDetails(data.subexam_gradedetails || []);

            // Process student list
            let processedStudents = data.studentList.map((student: StudentMarksEntry) => ({
                ...student,
                selected: false,
                ESTM_Marks: '',
                ESTMSS_Marks: {}
            }));

            // Add paper type info if available
            if (data.get_student_wise_papertype_list) {
                processedStudents = processedStudents.map((student: StudentMarksEntry) => {
                    const paperType = data.get_student_wise_papertype_list!.find((pt: any) => pt.amsT_Id === student.amsT_Id);
                    return {
                        ...student,
                        papertype: paperType?.empatY_PaperTypeName,
                        papertypeid: paperType?.empatY_Id
                    };
                });
            }

            const subjectData = data.subject_details?.[0] || {};

            const subsubFlag = Boolean(
                data.eyceS_SubSubjectFlg ||
                    (data as any).EYCES_SubSubjectFlg ||
                    subjectData?.eyceS_SubSubjectFlg ||
                    (subjectData as any)?.EYCES_SubSubjectFlg ||
                    (data.subject_subsubjects && data.subject_subsubjects.length > 0)
            );

            const subexamFlag = Boolean(
                data.eyceS_SubExamFlg ||
                    (data as any).EYCES_SubExamFlg ||
                    subjectData?.eyceS_SubExamFlg ||
                    (subjectData as any)?.EYCES_SubExamFlg ||
                    (data.subject_subexams && data.subject_subexams.length > 0)
            );

            const marksGradeEntryFlg = (data.eyceS_MarksGradeEntryFlg ||
                (data as any).EYCES_MarksGradeEntryFlg ||
                subjectData?.eyceS_MarksGradeEntryFlg ||
                (subjectData as any)?.EYCES_MarksGradeEntryFlg ||
                'M') as 'M' | 'G';

            const newSubjectMeta: SubjectMeta = {
                subjectId: subjectData.ismS_Id || processedStudents[0]?.ismS_Id || 0,
                subjectName: processedStudents[0]?.ismS_SubjectName || subjectData.ismS_SubjectName || '',
                subsubFlag,
                subexamFlag,
                maxMarks: subjectData.eyceS_MaxMarks || 0,
                minMarks: subjectData.eyceS_MinMarks || 0,
                marksEntryMax: subjectData.eyceS_MarksEntryMax || subjectData.eyceS_MaxMarks || 0,
                marksGradeEntryFlg,
                subsubData: (data.subject_subsubjects || []).map((ss: any) => ({
                    subsubId: ss.emsS_Id ?? ss.EMSS_Id,
                    subsubName: ss.emsS_SubSubjectName ?? ss.EMSS_SubSubjectName,
                    maxMarks: ss.eycessS_MaxMarks ?? ss.EYCESSS_MaxMarks ?? 0,
                    minMarks: ss.eycessS_MinMarks ?? ss.EYCESSS_MinMarks ?? 0,
                    marksEntryMax: ss.eycessS_MarksEntryMax ?? ss.EYCESSS_MarksEntryMax ?? ss.eycessS_MaxMarks ?? 0
                })),
                subexamData: (data.subject_subexams || []).map((se: any) => ({
                    subexamId: se.emsE_Id ?? se.EMSE_Id ?? se.emsS_Id ?? se.EMSS_Id,
                    subexamName: se.emsE_SubExamName ?? se.EMSE_SubExamName ?? se.emsS_SubExamName,
                    maxMarks: se.eycessE_MaxMarks ?? se.EYCESSE_MaxMarks ?? 0,
                    minMarks: se.eycessE_MinMarks ?? se.EYCESSE_MinMarks ?? 0,
                    marksEntryMax: se.eycessE_MarksEntryMax ?? se.EYCESSE_MarksEntryMax ?? se.eycessE_MaxMarks ?? 0
                })),
                saved_sub_subjectOrExam_list: data.saved_sub_subjectOrExam_list || [],
                saved_sub_subject_list: data.saved_sub_subject_list || []
            };

            setSubjectMeta(newSubjectMeta);

            // Process both sub-subject and sub-exam maps exactly like AngularJS
            const tempSubSubjsExamsList: any[] = [];
            let subjectSubsubjectsDetailsList: any[] = [];
            let subjectSubexamsDetailsList: any[] = [];

            if (subsubFlag && subexamFlag) {
                if (data.subsubjectlist && data.subject_subsubjects) {
                    data.subsubjectlist.forEach((ddd: any) => {
                        const temp: any[] = [];
                        data.subject_subsubjects.forEach((dd: any) => {
                            const dddId = ddd.emsS_Id ?? ddd.EMSS_Id;
                            const ddId = dd.emsS_Id ?? dd.EMSS_Id;
                            if (dddId === ddId) {
                                temp.push(dd);
                                tempSubSubjsExamsList.push(dd);
                            }
                        });
                        subjectSubsubjectsDetailsList.push({ subsubject: ddd, subexamlist: temp });
                    });
                } else if (data.subject_subsubjects) {
                    subjectSubsubjectsDetailsList = data.subject_subsubjects;
                }
            } else if (subsubFlag) {
                subjectSubsubjectsDetailsList = data.subject_subsubjects || [];
            } else if (subexamFlag) {
                subjectSubexamsDetailsList = data.subject_subexams || [];
            }

            setTempSubSubjsExams(tempSubSubjsExamsList);
            setSubjectSubsubjectsDetails(subjectSubsubjectsDetailsList);
            setSubjectSubexamsDetails(subjectSubexamsDetailsList);

            // Clear existing temp marks list
            setTempSubsMarksList([]);

            // Extract saved lists with getNonEmptyArray
            const savedStudentList = getNonEmptyArray(data.saved_studentList, data.savedstudentList);
            const ssList = getNonEmptyArray(data.saved_sub_subject_list, data.saved_ss_list, data.saved_sub_subjectOrExam_list);
            const seList = getNonEmptyArray(data.saved_sub_subject_exam_list, data.saved_sub_subjectOrExam_list, data.saved_se_list);
            const ssseList = getNonEmptyArray(data.saved_sub_subject_exam_list, data.saved_ssse_list, data.saved_sub_subjectOrExam_list);

            const savedListForLookup = savedStudentList.length > 0 ? savedStudentList : processedStudents;

            if (!subsubFlag && !subexamFlag) {
                // Simple subject case
                processedStudents = mapMarksSimple(processedStudents, savedListForLookup, data.answer_sheet, newSubjectMeta);
            } else if (subsubFlag && !subexamFlag) {
                // Sub-subject case
                if (ssList.length > 0) {
                    processedStudents = mapMarksSS(processedStudents, ssList, savedListForLookup, newSubjectMeta);
                }
            } else if (subexamFlag && !subsubFlag) {
                // Sub-exam case
                if (seList.length > 0) {
                    processedStudents = mapMarksSE(processedStudents, seList, savedListForLookup, newSubjectMeta);
                }
            } else if (subsubFlag && subexamFlag) {
                // Sub-subject and sub-exam both case
                if (ssseList.length > 0) {
                    processedStudents = mapMarksSSSE(processedStudents, ssseList, savedListForLookup, newSubjectMeta);
                }
            }

            const allAreSelected = processedStudents.length > 0 && processedStudents.every((s: StudentMarksEntry) => s.selected);
            setAllSelected(allAreSelected);

            setStudents(processedStudents);
            setIsStudentsGridOpen(true);
            toast.info('Data loaded successfully');
        } catch (error: any) {
            console.error('Search error:', error);
            toast.error(error?.message || 'Failed to fetch data');
            setIsStudentsGridOpen(false);
        } finally {
            setIsLoading(false);
        }
    }, [ASMAY_Id, ASMCL_Id, ASMS_Id, EME_Id, ISMS_Id]);

    const isFirstLoad = useRef(true);

    /* Close page only on parameter change (not first load) */
    useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false; // skip first render
            return;
        }

        onClose?.(); // close on subsequent param changes
    }, [ASMAY_Id, ASMCL_Id, ASMS_Id, EME_Id, ISMS_Id, onClose]);

    /* Run search whenever parameters change */
    useEffect(() => {
        handleSearch();
    }, [handleSearch]);

    /* ============================================
       Mapping Functions
       ============================================ */
    const mapMarksSimple = (
        students: StudentMarksEntry[],
        savedStudents: any[],
        answerSheets?: any[],
        subjectMeta?: SubjectMeta
    ): StudentMarksEntry[] => {
        const updatedTempMarks: SavedMarksEntry[] = [];
        const result = students.map((student) => {
            const saved = savedStudents.find((s: any) => {
                const sAmstId = s.amsT_Id ?? s.AMST_Id;
                return sAmstId && Number(sAmstId) === Number(student.amsT_Id);
            });

            if (!saved) return student;

            const estmMarks = saved.estM_Marks ?? saved.ESTM_Marks;
            const estmGrade = saved.estM_Grade ?? saved.ESTM_Grade;
            const estmFlg = saved.estM_Flg ?? saved.ESTM_Flg;
            const estmId = saved.estM_Id ?? saved.ESTM_ID ?? saved.ESTM_Id ?? student.estM_Id ?? 0;

            const hasSavedData =
                (estmFlg && estmFlg.trim() !== '') ||
                (estmMarks !== undefined && estmMarks !== null && String(estmMarks).trim() !== '') ||
                (estmGrade && estmGrade.trim() !== '');

            if (!hasSavedData) return student;

            let marksValue = '';
            if (subjectMeta?.marksGradeEntryFlg === 'M') {
                if (estmFlg && estmFlg.trim() !== '') {
                    marksValue = estmFlg.trim();
                } else if (estmMarks !== undefined && estmMarks !== null) {
                    marksValue = String(estmMarks);
                }
            } else if (subjectMeta?.marksGradeEntryFlg === 'G') {
                if (estmFlg && estmFlg.trim() !== '') {
                    marksValue = estmFlg.trim();
                } else if (estmGrade) {
                    marksValue = estmGrade.trim();
                }
            }

            // Add answer sheet info
            let fileLocation = student.estmanssH_FileLocation;
            if (answerSheets && Array.isArray(answerSheets)) {
                const answerSheet = answerSheets.find((as: any) => {
                    const asEstmId = as.estM_Id ?? as.ESTM_Id;
                    return asEstmId && Number(asEstmId) === Number(estmId);
                });
                if (answerSheet) {
                    fileLocation = answerSheet.estmanssH_FileLocation ?? answerSheet.ESTMANSSH_FileLocation;
                }
            }

            updatedTempMarks.push({
                AMST_Id: student.amsT_Id,
                ISMS_Id: student.ismS_Id,
                ESTM_ID: estmId,
                ESTM_MarksGradeFlg: subjectMeta?.marksGradeEntryFlg ?? 'M',
                ESTM_Marks: typeof estmMarks === 'number' ? estmMarks : Number(marksValue) || 0,
                ESTM_Grade: estmGrade || (subjectMeta?.marksGradeEntryFlg === 'G' ? marksValue : ''),
                ESTM_Flg: estmFlg || (['AB', 'L', 'M', 'OD'].includes(marksValue.toUpperCase()) ? marksValue.toUpperCase() : '')
            });

            return {
                ...student,
                selected: true,
                estM_Id: estmId,
                ESTM_Marks: marksValue,
                estM_Marks: typeof estmMarks === 'number' ? estmMarks : Number(marksValue) || 0,
                estM_Marks_new: typeof estmMarks === 'number' ? estmMarks : Number(marksValue) || 0,
                estM_Grade: estmGrade || '',
                estM_Grade_new: estmGrade || '',
                estM_Flg: estmFlg || '',
                estM_Flg_new: estmFlg || '',
                estmanssH_FileLocation: fileLocation
            };
        });

        if (updatedTempMarks.length > 0) {
            setTempSubsMarksList((prev) => {
                const combined = [...prev];
                for (const item of updatedTempMarks) {
                    const idx = combined.findIndex((p) => p.AMST_Id === item.AMST_Id && p.ISMS_Id === item.ISMS_Id);
                    if (idx >= 0) {
                        combined[idx] = item;
                    } else {
                        combined.push(item);
                    }
                }
                return combined;
            });
        }

        return result;
    };

    const mapMarksSS = (
        students: StudentMarksEntry[],
        savedSSList: any[],
        savedStudentList: any[],
        subjectMeta: SubjectMeta
    ): StudentMarksEntry[] => {
        const updatedStudents = [...students];
        const updatedTempMarks: SavedMarksEntry[] = [];

        students.forEach((student, studentIndex) => {
            const savedStudent = savedStudentList.find((s: any) => {
                const amstId = s.amsT_Id ?? s.AMST_Id;
                return amstId && Number(amstId) === Number(student.amsT_Id);
            });

            const savedEstmId = savedStudent?.estM_Id ?? savedStudent?.ESTM_Id ?? student.estM_Id;

            const studentSSMarks = savedSSList.filter((ss: any) => {
                const ssAmstId = ss.amsT_Id ?? ss.AMST_Id;
                if (ssAmstId && Number(ssAmstId) === Number(student.amsT_Id)) {
                    return true;
                }
                const ssEstmId = ss.estM_Id ?? ss.ESTM_Id;
                if (savedEstmId && ssEstmId && Number(ssEstmId) === Number(savedEstmId)) {
                    return true;
                }
                return false;
            });

            if (studentSSMarks.length > 0) {
                const estmssMarks: { [key: string]: string; [key: number]: string } = {};
                let studentEstmId = savedEstmId || 0;

                studentSSMarks.forEach((ssMark: any) => {
                    const subSubId = ssMark.emsS_Id ?? ssMark.EMSS_Id ?? ssMark.emss_id;
                    if (!subSubId) return;

                    const markEstmId = ssMark.estM_Id ?? ssMark.ESTM_Id;
                    if (markEstmId && !studentEstmId) {
                        studentEstmId = markEstmId;
                    }

                    const flagVal = (ssMark.estmsS_Flg ?? ssMark.ESTMSS_Flg ?? ssMark.estm_flg ?? ssMark.ESTM_Flg ?? '').trim();
                    const marksNum = ssMark.estmsS_Marks ?? ssMark.ESTMSS_Marks ?? ssMark.estm_marks ?? ssMark.ESTM_Marks;
                    const gradeVal = (ssMark.estmsS_Grade ?? ssMark.ESTMSS_Grade ?? ssMark.estm_grade ?? ssMark.ESTM_Grade ?? '').trim();

                    let markValue = '';
                    if (subjectMeta.marksGradeEntryFlg === 'M') {
                        if (flagVal !== '') {
                            markValue = flagVal;
                        } else if (marksNum !== undefined && marksNum !== null && String(marksNum).trim() !== '') {
                            markValue = String(marksNum);
                        }
                    } else if (subjectMeta.marksGradeEntryFlg === 'G') {
                        if (flagVal !== '') {
                            markValue = flagVal;
                        } else if (gradeVal !== '') {
                            markValue = gradeVal;
                        }
                    }

                    estmssMarks[subSubId] = markValue;
                    estmssMarks[String(subSubId)] = markValue;

                    updatedTempMarks.push({
                        estmsS_Id: ssMark.estmsS_Id ?? ssMark.ESTMSS_Id ?? 0,
                        AMST_Id: student.amsT_Id,
                        ISMS_Id: student.ismS_Id,
                        EMSS_Id: subSubId,
                        ESTM_ID: studentEstmId,
                        ESTM_MarksGradeFlg: subjectMeta.marksGradeEntryFlg,
                        ESTMSS_Marks: typeof marksNum === 'number' ? marksNum : Number(markValue) || 0,
                        ESTMSS_Grade: gradeVal || (subjectMeta.marksGradeEntryFlg === 'G' ? markValue : ''),
                        ESTMSS_Flg: flagVal || (['AB', 'L', 'M', 'OD'].includes(markValue.toUpperCase()) ? markValue.toUpperCase() : '')
                    });
                });

                updatedStudents[studentIndex] = {
                    ...student,
                    selected: true,
                    estM_Id: studentEstmId,
                    ESTMSS_Marks: estmssMarks
                };

                const totalMarks = calculateTotalMarksForStudent(updatedStudents[studentIndex], subjectMeta);
                updatedStudents[studentIndex].ESTM_Marks = totalMarks.toString();
                updatedStudents[studentIndex].estM_Marks_new = totalMarks;
            }
        });

        if (updatedTempMarks.length > 0) {
            setTempSubsMarksList((prev) => {
                const combined = [...prev];
                for (const item of updatedTempMarks) {
                    const idx = combined.findIndex((p) => p.AMST_Id === item.AMST_Id && p.EMSS_Id === item.EMSS_Id);
                    if (idx >= 0) {
                        combined[idx] = item;
                    } else {
                        combined.push(item);
                    }
                }
                return combined;
            });
        }

        return updatedStudents;
    };

    const mapMarksSE = (
        students: StudentMarksEntry[],
        savedSEList: any[],
        savedStudentList: any[],
        subjectMeta: SubjectMeta
    ): StudentMarksEntry[] => {
        const updatedStudents = [...students];
        const updatedTempMarks: SavedMarksEntry[] = [];

        students.forEach((student, studentIndex) => {
            const savedStudent = savedStudentList.find((s: any) => {
                const amstId = s.amsT_Id ?? s.AMST_Id;
                return amstId && Number(amstId) === Number(student.amsT_Id);
            });

            const savedEstmId = savedStudent?.estM_Id ?? savedStudent?.ESTM_Id ?? student.estM_Id;

            const studentSEMarks = savedSEList.filter((se: any) => {
                const seAmstId = se.amsT_Id ?? se.AMST_Id;
                if (seAmstId && Number(seAmstId) === Number(student.amsT_Id)) {
                    return true;
                }
                const seEstmId = se.estM_Id ?? se.ESTM_Id;
                if (savedEstmId && seEstmId && Number(seEstmId) === Number(savedEstmId)) {
                    return true;
                }
                return false;
            });

            if (studentSEMarks.length > 0) {
                const estmssMarks: { [key: string]: string; [key: number]: string } = {};
                let studentEstmId = savedEstmId || 0;

                studentSEMarks.forEach((seMark: any) => {
                    const subExamId = seMark.emsE_Id ?? seMark.EMSE_Id ?? seMark.emse_id ?? seMark.emsS_Id ?? seMark.EMSS_Id;
                    if (!subExamId) return;

                    const markEstmId = seMark.estM_Id ?? seMark.ESTM_Id;
                    if (markEstmId && !studentEstmId) {
                        studentEstmId = markEstmId;
                    }

                    const flagVal = (
                        seMark.estmsE_Flg ??
                        seMark.ESTMSE_Flg ??
                        seMark.estmsS_Flg ??
                        seMark.ESTMSS_Flg ??
                        seMark.estm_flg ??
                        seMark.ESTM_Flg ??
                        ''
                    ).trim();
                    const marksNum =
                        seMark.estmsE_Marks ??
                        seMark.ESTMSE_Marks ??
                        seMark.estmsS_Marks ??
                        seMark.ESTMSS_Marks ??
                        seMark.estm_marks ??
                        seMark.ESTM_Marks ??
                        seMark.marks ??
                        seMark.Marks;
                    const gradeVal = (
                        seMark.estmsE_Grade ??
                        seMark.ESTMSE_Grade ??
                        seMark.estmsS_Grade ??
                        seMark.ESTMSS_Grade ??
                        seMark.estm_grade ??
                        seMark.ESTM_Grade ??
                        ''
                    ).trim();

                    let markValue = '';
                    if (subjectMeta.marksGradeEntryFlg === 'M') {
                        if (flagVal !== '') {
                            markValue = flagVal;
                        } else if (marksNum !== undefined && marksNum !== null && String(marksNum).trim() !== '') {
                            markValue = String(marksNum);
                        }
                    } else if (subjectMeta.marksGradeEntryFlg === 'G') {
                        if (flagVal !== '') {
                            markValue = flagVal;
                        } else if (gradeVal !== '') {
                            markValue = gradeVal;
                        }
                    }

                    estmssMarks[subExamId] = markValue;
                    estmssMarks[String(subExamId)] = markValue;

                    updatedTempMarks.push({
                        estmsS_Id: seMark.estmsS_Id ?? seMark.ESTMSS_Id ?? seMark.estmsE_Id ?? seMark.ESTMSE_Id ?? 0,
                        AMST_Id: student.amsT_Id,
                        ISMS_Id: student.ismS_Id,
                        EMSE_Id: subExamId,
                        ESTM_ID: studentEstmId,
                        ESTM_MarksGradeFlg: subjectMeta.marksGradeEntryFlg,
                        ESTMSS_Marks: typeof marksNum === 'number' ? marksNum : Number(markValue) || 0,
                        ESTMSS_Grade: gradeVal || (subjectMeta.marksGradeEntryFlg === 'G' ? markValue : ''),
                        ESTMSS_Flg: flagVal || (['AB', 'L', 'M', 'OD'].includes(markValue.toUpperCase()) ? markValue.toUpperCase() : '')
                    });
                });

                updatedStudents[studentIndex] = {
                    ...student,
                    selected: true,
                    estM_Id: studentEstmId,
                    ESTMSS_Marks: estmssMarks
                };

                const totalMarks = calculateTotalMarksForStudent(updatedStudents[studentIndex], subjectMeta);
                updatedStudents[studentIndex].ESTM_Marks = totalMarks.toString();
                updatedStudents[studentIndex].estM_Marks_new = totalMarks;
            }
        });

        if (updatedTempMarks.length > 0) {
            setTempSubsMarksList((prev) => {
                const combined = [...prev];
                for (const item of updatedTempMarks) {
                    const idx = combined.findIndex((p) => p.AMST_Id === item.AMST_Id && p.EMSE_Id === item.EMSE_Id);
                    if (idx >= 0) {
                        combined[idx] = item;
                    } else {
                        combined.push(item);
                    }
                }
                return combined;
            });
        }

        return updatedStudents;
    };

    const mapMarksSSSE = (
        students: StudentMarksEntry[],
        savedSSSEList: any[],
        savedStudentList: any[],
        subjectMeta: SubjectMeta
    ): StudentMarksEntry[] => {
        const updatedStudents = [...students];
        const updatedTempMarks: SavedMarksEntry[] = [];

        students.forEach((student, studentIndex) => {
            const savedStudent = savedStudentList.find((s: any) => {
                const amstId = s.amsT_Id ?? s.AMST_Id;
                return amstId && Number(amstId) === Number(student.amsT_Id);
            });

            const savedEstmId = savedStudent?.estM_Id ?? savedStudent?.ESTM_Id ?? student.estM_Id;

            const studentSSSEMarks = savedSSSEList.filter((ssse: any) => {
                const ssseAmstId = ssse.amsT_Id ?? ssse.AMST_Id;
                if (ssseAmstId && Number(ssseAmstId) === Number(student.amsT_Id)) {
                    return true;
                }
                const ssseEstmId = ssse.estM_Id ?? ssse.ESTM_Id;
                if (savedEstmId && ssseEstmId && Number(ssseEstmId) === Number(savedEstmId)) {
                    return true;
                }
                if (student.estM_Id && ssseEstmId && Number(ssseEstmId) === Number(student.estM_Id)) {
                    return true;
                }
                return false;
            });

            if (studentSSSEMarks.length > 0) {
                const estmssMarks: { [key: string]: string } = {};
                let studentEstmId = savedEstmId || 0;

                studentSSSEMarks.forEach((ssseMark: any) => {
                    const ssId = ssseMark.emsS_Id ?? ssseMark.EMSS_Id ?? ssseMark.emss_id;
                    const seId = ssseMark.emsE_Id ?? ssseMark.EMSE_Id ?? ssseMark.emse_id ?? ssseMark.emsS_Id ?? ssseMark.EMSS_Id;
                    if (!ssId || !seId) return;

                    const markEstmId = ssseMark.estM_Id ?? ssseMark.ESTM_Id;
                    if (markEstmId && !studentEstmId) {
                        studentEstmId = markEstmId;
                    }

                    const flagVal = (
                        ssseMark.estmsE_Flg ??
                        ssseMark.ESTMSE_Flg ??
                        ssseMark.estmsS_Flg ??
                        ssseMark.ESTMSS_Flg ??
                        ssseMark.estmssse_Flg ??
                        ssseMark.ESTMSSSE_Flg ??
                        ssseMark.estm_flg ??
                        ssseMark.ESTM_Flg ??
                        ''
                    ).trim();
                    const marksNum =
                        ssseMark.estmsE_Marks ??
                        ssseMark.ESTMSE_Marks ??
                        ssseMark.estmsS_Marks ??
                        ssseMark.ESTMSS_Marks ??
                        ssseMark.estmssse_Marks ??
                        ssseMark.ESTMSSSE_Marks ??
                        ssseMark.estm_marks ??
                        ssseMark.ESTM_Marks ??
                        ssseMark.marks ??
                        ssseMark.Marks;
                    const gradeVal = (
                        ssseMark.estmsE_Grade ??
                        ssseMark.ESTMSE_Grade ??
                        ssseMark.estmsS_Grade ??
                        ssseMark.ESTMSS_Grade ??
                        ssseMark.estmssse_Grade ??
                        ssseMark.ESTMSSSE_Grade ??
                        ssseMark.estm_grade ??
                        ssseMark.ESTM_Grade ??
                        ''
                    ).trim();

                    let markValue = '';
                    if (subjectMeta.marksGradeEntryFlg === 'M') {
                        if (flagVal !== '') {
                            markValue = flagVal;
                        } else if (marksNum !== undefined && marksNum !== null && String(marksNum).trim() !== '') {
                            markValue = String(marksNum);
                        }
                    } else if (subjectMeta.marksGradeEntryFlg === 'G') {
                        if (flagVal !== '') {
                            markValue = flagVal;
                        } else if (gradeVal !== '') {
                            markValue = gradeVal;
                        }
                    }

                    const key = `${ssId}_${seId}`;
                    estmssMarks[key] = markValue;

                    updatedTempMarks.push({
                        estmsS_Id: ssseMark.estmsS_Id ?? ssseMark.ESTMSS_Id ?? ssseMark.estmssse_Id ?? 0,
                        AMST_Id: student.amsT_Id,
                        ISMS_Id: student.ismS_Id,
                        EMSS_Id: ssId,
                        EMSE_Id: seId,
                        ESTM_ID: studentEstmId,
                        ESTM_MarksGradeFlg: subjectMeta.marksGradeEntryFlg,
                        ESTMSS_Marks: typeof marksNum === 'number' ? marksNum : Number(markValue) || 0,
                        ESTMSS_Grade: gradeVal || (subjectMeta.marksGradeEntryFlg === 'G' ? markValue : ''),
                        ESTMSS_Flg: flagVal || (['AB', 'L', 'M', 'OD'].includes(markValue.toUpperCase()) ? markValue.toUpperCase() : '')
                    });
                });

                updatedStudents[studentIndex] = {
                    ...student,
                    selected: true,
                    estM_Id: studentEstmId,
                    ESTMSS_Marks: estmssMarks
                };

                const totalMarks = calculateTotalMarksForStudent(updatedStudents[studentIndex], subjectMeta);
                updatedStudents[studentIndex].ESTM_Marks = totalMarks.toString();
                updatedStudents[studentIndex].estM_Marks_new = totalMarks;
            }
        });

        if (updatedTempMarks.length > 0) {
            setTempSubsMarksList((prev) => {
                const combined = [...prev];
                for (const item of updatedTempMarks) {
                    const idx = combined.findIndex(
                        (p) => p.AMST_Id === item.AMST_Id && p.EMSS_Id === item.EMSS_Id && p.EMSE_Id === item.EMSE_Id
                    );
                    if (idx >= 0) {
                        combined[idx] = item;
                    } else {
                        combined.push(item);
                    }
                }
                return combined;
            });
        }

        return updatedStudents;
    };

    /* ============================================
       Calculate Total Marks for Student
       ============================================ */
    const calculateTotalMarksForStudent = (student: StudentMarksEntry, subjectMeta: SubjectMeta): number => {
        if (!subjectMeta || !student.ESTMSS_Marks || typeof student.ESTMSS_Marks !== 'object') return 0;

        let total = 0;

        if (subjectMeta.subsubFlag && subjectMeta.subexamFlag) {
            Object.entries(student.ESTMSS_Marks).forEach(([key, markValue]) => {
                if (key.includes('_')) {
                    if (typeof markValue === 'string' && !Number.isNaN(Number.parseFloat(markValue))) {
                        total += Number.parseFloat(markValue);
                    }
                }
            });
        } else if (subjectMeta.subsubFlag) {
            subjectMeta.subsubData.forEach((ss) => {
                const val = (student.ESTMSS_Marks as any)?.[ss.subsubId] ?? (student.ESTMSS_Marks as any)?.[String(ss.subsubId)];
                if (typeof val === 'string' && !Number.isNaN(Number.parseFloat(val))) {
                    total += Number.parseFloat(val);
                }
            });
        } else if (subjectMeta.subexamFlag) {
            subjectMeta.subexamData.forEach((se) => {
                const val = (student.ESTMSS_Marks as any)?.[se.subexamId] ?? (student.ESTMSS_Marks as any)?.[String(se.subexamId)];
                if (typeof val === 'string' && !Number.isNaN(Number.parseFloat(val))) {
                    total += Number.parseFloat(val);
                }
            });
        }

        return total;
    };

    /* ============================================
       Update Functions
       ============================================ */
    const updateSimpleMark = (studentId: number, newMark: number | '' | string) => {
        setStudents((prev) =>
            prev.map((student) => {
                if (student.amsT_Id === studentId) {
                    return {
                        ...student,
                        ESTM_Marks: newMark
                    };
                }
                return student;
            })
        );

        updateTempMarksListSimple(studentId, newMark);
    };

    const updateSubSubjectMark = (studentId: number, subSubjectId: number, newMark: number | '' | string) => {
        setStudents((prev) =>
            prev.map((student) => {
                if (student.amsT_Id === studentId) {
                    const updatedMarks = { ...((student.ESTMSS_Marks as any) || {}) };
                    updatedMarks[subSubjectId] = newMark.toString();
                    updatedMarks[String(subSubjectId)] = newMark.toString();

                    const updatedStudent = {
                        ...student,
                        ESTMSS_Marks: updatedMarks
                    };

                    const total = subjectMeta ? calculateTotalMarksForStudent(updatedStudent, subjectMeta) : 0;

                    return {
                        ...updatedStudent,
                        ESTM_Marks: total.toString(),
                        estM_Marks_new: total
                    };
                }
                return student;
            })
        );

        updateTempMarksListSubSubject(studentId, subSubjectId, newMark);
    };

    const updateSubExamMark = (studentId: number, subExamId: number, newMark: number | '' | string) => {
        setStudents((prev) =>
            prev.map((student) => {
                if (student.amsT_Id === studentId) {
                    const updatedMarks = { ...((student.ESTMSS_Marks as any) || {}) };
                    updatedMarks[subExamId] = newMark.toString();
                    updatedMarks[String(subExamId)] = newMark.toString();

                    const updatedStudent = {
                        ...student,
                        ESTMSS_Marks: updatedMarks
                    };

                    const total = subjectMeta ? calculateTotalMarksForStudent(updatedStudent, subjectMeta) : 0;

                    return {
                        ...updatedStudent,
                        ESTM_Marks: total.toString(),
                        estM_Marks_new: total
                    };
                }
                return student;
            })
        );

        updateTempMarksListSubExam(studentId, subExamId, newMark);
    };

    const updateSubSubjectSubExamMark = (studentId: number, subSubjectId: number, subExamId: number, newMark: number | '' | string) => {
        setStudents((prev) =>
            prev.map((student) => {
                if (student.amsT_Id === studentId) {
                    const updatedMarks = { ...((student.ESTMSS_Marks as any) || {}) };
                    const key = `${subSubjectId}_${subExamId}`;
                    updatedMarks[key] = newMark.toString();

                    const updatedStudent = {
                        ...student,
                        ESTMSS_Marks: updatedMarks
                    };

                    const total = subjectMeta ? calculateTotalMarksForStudent(updatedStudent, subjectMeta) : 0;

                    return {
                        ...updatedStudent,
                        ESTM_Marks: total.toString(),
                        estM_Marks_new: total
                    };
                }
                return student;
            })
        );

        updateTempMarksListSubSubjectSubExam(studentId, subSubjectId, subExamId, newMark);
    };

    const updateTempMarksListSimple = (studentId: number, value: number | '' | string) => {
        const student = students.find((s) => s.amsT_Id === studentId);
        if (!student || !subjectMeta) return;

        if (value === '') {
            setTempSubsMarksList((prev) => prev.filter((item) => !(item.AMST_Id === studentId && item.ISMS_Id === student.ismS_Id)));
            return;
        }

        const newEntry: SavedMarksEntry = {
            AMST_Id: studentId,
            ISMS_Id: student.ismS_Id,
            ESTM_ID: student.estM_Id ?? 0,
            ESTM_MarksGradeFlg: subjectMeta.marksGradeEntryFlg,
            ESTM_Marks: 0,
            ESTM_Grade: '',
            ESTM_Flg: ''
        };

        if (subjectMeta.marksGradeEntryFlg === 'M') {
            if (typeof value === 'string' && ['AB', 'L', 'M', 'OD'].includes(value.toUpperCase())) {
                newEntry.ESTM_Flg = value.toUpperCase();
                newEntry.ESTM_Marks = 0;
            } else {
                const numValue = Number.parseFloat(value as string);
                if (!Number.isNaN(numValue)) {
                    newEntry.ESTM_Marks = numValue;
                    newEntry.ESTM_Flg = '';
                }
            }
        } else {
            if (typeof value === 'string' && ['AB', 'L', 'M', 'OD'].includes(value.toUpperCase())) {
                newEntry.ESTM_Flg = value.toUpperCase();
                newEntry.ESTM_Grade = '';
            } else {
                newEntry.ESTM_Grade = value.toString();
                newEntry.ESTM_Flg = '';
            }
        }

        setTempSubsMarksList((prev) => {
            const existingIndex = prev.findIndex((item) => item.AMST_Id === studentId && item.ISMS_Id === student.ismS_Id);

            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = newEntry;
                return updated;
            }
            return [...prev, newEntry];
        });
    };

    const updateTempMarksListSubSubject = (studentId: number, subSubjectId: number, value: number | '' | string) => {
        const student = students.find((s) => s.amsT_Id === studentId);
        if (!student || !subjectMeta) return;

        if (value === '') {
            setTempSubsMarksList((prev) => prev.filter((item) => !(item.AMST_Id === studentId && item.EMSS_Id === subSubjectId)));
            return;
        }

        const newEntry: SavedMarksEntry = {
            AMST_Id: studentId,
            ISMS_Id: student.ismS_Id,
            EMSS_Id: subSubjectId,
            ESTM_ID: student.estM_Id ?? 0,
            ESTM_MarksGradeFlg: subjectMeta.marksGradeEntryFlg,
            ESTMSS_Marks: 0,
            ESTMSS_Grade: '',
            ESTMSS_Flg: ''
        };

        if (subjectMeta.marksGradeEntryFlg === 'M') {
            if (typeof value === 'string' && ['AB', 'L', 'M', 'OD'].includes(value.toUpperCase())) {
                newEntry.ESTMSS_Flg = value.toUpperCase();
                newEntry.ESTMSS_Marks = 0;
            } else {
                const numValue = Number.parseFloat(value as string);
                if (!Number.isNaN(numValue)) {
                    newEntry.ESTMSS_Marks = numValue;
                    newEntry.ESTMSS_Flg = '';
                }
            }
        } else {
            if (typeof value === 'string' && ['AB', 'L', 'M', 'OD'].includes(value.toUpperCase())) {
                newEntry.ESTMSS_Flg = value.toUpperCase();
                newEntry.ESTMSS_Grade = '';
            } else {
                newEntry.ESTMSS_Grade = value.toString();
                newEntry.ESTMSS_Flg = '';
            }
        }

        setTempSubsMarksList((prev) => {
            const existingIndex = prev.findIndex((item) => item.AMST_Id === studentId && item.EMSS_Id === subSubjectId);

            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = newEntry;
                return updated;
            }
            return [...prev, newEntry];
        });
    };

    const updateTempMarksListSubExam = (studentId: number, subExamId: number, value: number | '' | string) => {
        const student = students.find((s) => s.amsT_Id === studentId);
        if (!student || !subjectMeta) return;

        if (value === '') {
            setTempSubsMarksList((prev) => prev.filter((item) => !(item.AMST_Id === studentId && item.EMSE_Id === subExamId)));
            return;
        }

        const newEntry: SavedMarksEntry = {
            AMST_Id: studentId,
            ISMS_Id: student.ismS_Id,
            EMSE_Id: subExamId,
            ESTM_ID: student.estM_Id ?? 0,
            ESTM_MarksGradeFlg: subjectMeta.marksGradeEntryFlg,
            ESTMSS_Marks: 0,
            ESTMSS_Grade: '',
            ESTMSS_Flg: ''
        };

        if (subjectMeta.marksGradeEntryFlg === 'M') {
            if (typeof value === 'string' && ['AB', 'L', 'M', 'OD'].includes(value.toUpperCase())) {
                newEntry.ESTMSS_Flg = value.toUpperCase();
                newEntry.ESTMSS_Marks = 0;
            } else {
                const numValue = Number.parseFloat(value as string);
                if (!Number.isNaN(numValue)) {
                    newEntry.ESTMSS_Marks = numValue;
                    newEntry.ESTMSS_Flg = '';
                }
            }
        } else {
            if (typeof value === 'string' && ['AB', 'L', 'M', 'OD'].includes(value.toUpperCase())) {
                newEntry.ESTMSS_Flg = value.toUpperCase();
                newEntry.ESTMSS_Grade = '';
            } else {
                newEntry.ESTMSS_Grade = value.toString();
                newEntry.ESTMSS_Flg = '';
            }
        }

        setTempSubsMarksList((prev) => {
            const existingIndex = prev.findIndex((item) => item.AMST_Id === studentId && item.EMSE_Id === subExamId);

            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = newEntry;
                return updated;
            }
            return [...prev, newEntry];
        });
    };

    const updateTempMarksListSubSubjectSubExam = (
        studentId: number,
        subSubjectId: number,
        subExamId: number,
        value: number | '' | string
    ) => {
        const student = students.find((s) => s.amsT_Id === studentId);
        if (!student || !subjectMeta) return;

        if (value === '') {
            setTempSubsMarksList((prev) =>
                prev.filter((item) => !(item.AMST_Id === studentId && item.EMSS_Id === subSubjectId && item.EMSE_Id === subExamId))
            );
            return;
        }

        const newEntry: SavedMarksEntry = {
            AMST_Id: studentId,
            ISMS_Id: student.ismS_Id,
            EMSS_Id: subSubjectId,
            EMSE_Id: subExamId,
            ESTM_ID: student.estM_Id ?? 0,
            ESTM_MarksGradeFlg: subjectMeta.marksGradeEntryFlg,
            ESTMSS_Marks: 0,
            ESTMSS_Grade: '',
            ESTMSS_Flg: ''
        };

        if (subjectMeta.marksGradeEntryFlg === 'M') {
            if (typeof value === 'string' && ['AB', 'L', 'M', 'OD'].includes(value.toUpperCase())) {
                newEntry.ESTMSS_Flg = value.toUpperCase();
                newEntry.ESTMSS_Marks = 0;
            } else {
                const numValue = Number.parseFloat(value as string);
                if (!Number.isNaN(numValue)) {
                    newEntry.ESTMSS_Marks = numValue;
                    newEntry.ESTMSS_Flg = '';
                }
            }
        } else {
            if (typeof value === 'string' && ['AB', 'L', 'M', 'OD'].includes(value.toUpperCase())) {
                newEntry.ESTMSS_Flg = value.toUpperCase();
                newEntry.ESTMSS_Grade = '';
            } else {
                newEntry.ESTMSS_Grade = value.toString();
                newEntry.ESTMSS_Flg = '';
            }
        }

        setTempSubsMarksList((prev) => {
            const existingIndex = prev.findIndex(
                (item) => item.AMST_Id === studentId && item.EMSS_Id === subSubjectId && item.EMSE_Id === subExamId
            );

            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = newEntry;
                return updated;
            }
            return [...prev, newEntry];
        });
    };

    /* ============================================
       Arrow Navigation Functions
       ============================================ */
    const handleArrowNavigation = (rowIndex: number, colIndex: number, direction: 'left' | 'right' | 'up' | 'down') => {
        let nextRow = rowIndex;
        let nextCol = colIndex;

        if (direction === 'left') {
            nextCol = Math.max(0, colIndex - 1);
        } else if (direction === 'right') {
            nextCol = Math.min(getMaxColumnIndex(), colIndex + 1);
        } else if (direction === 'up') {
            nextRow = Math.max(0, rowIndex - 1);
        } else if (direction === 'down') {
            nextRow = Math.min(students.length - 1, rowIndex + 1);
        }

        inputRefs.current[nextRow]?.[nextCol]?.focus();
    };

    const getMaxColumnIndex = () => {
        if (!subjectMeta) return 0;

        if (subjectMeta.subsubFlag && subjectMeta.subexamFlag) {
            return tempSubSubjsExams.length - 1;
        }
        if (subjectMeta.subsubFlag) {
            return subjectMeta.subsubData.length - 1;
        }
        if (subjectMeta.subexamFlag) {
            return subjectMeta.subexamData.length - 1;
        }
        return 0;
    };

    /* ============================================
       Selection Functions
       ============================================ */
    const toggleAllSelection = () => {
        const newAllSelected = !allSelected;
        setAllSelected(newAllSelected);
        setStudents((prev) =>
            prev.map((student) => ({
                ...student,
                selected: newAllSelected
            }))
        );
    };

    const toggleStudentSelection = (studentId: number) => {
        setStudents((prev) => {
            const updated = prev.map((student) => (student.amsT_Id === studentId ? { ...student, selected: !student.selected } : student));

            const isAllSelected = updated.length > 0 && updated.every((s) => s.selected === true);
            setAllSelected(isAllSelected);

            return updated;
        });
    };

    /* ============================================
       Validation Before Save
       ============================================ */
    const validateSelectedStudents = (): boolean => {
        if (!subjectMeta) return false;
        const selectedStudents = students.filter((s) => s.selected);
        if (selectedStudents.length === 0) {
            toast.info('Select Students For Saving Marks...');
            return false;
        }

        for (const student of selectedStudents) {
            if (subjectMeta.subsubFlag && subjectMeta.subexamFlag) {
                for (const se of tempSubSubjsExams) {
                    const key = `${se.emsS_Id}_${se.emsE_Id}`;
                    const val = (student.ESTMSS_Marks as { [key: string]: string })?.[key] ?? '';
                    const err = validateMarksOrGrade(
                        val,
                        se.eycessE_MaxMarks,
                        subjectMeta.marksGradeEntryFlg,
                        subExamGradeDetails.map((g: any) => g.emgD_Name || g.EMGD_Name || g),
                        student.papertypeid,
                        paperTypeGradeDetails
                    );
                    if (err) {
                        toast.error(`${student.amsT_FirstName}: ${err} (${se.emsE_SubExamName || 'Sub-Exam'})`);
                        return false;
                    }
                }
            } else if (subjectMeta.subsubFlag) {
                for (const subsub of subjectMeta.subsubData) {
                    const val =
                        (student.ESTMSS_Marks as any)?.[subsub.subsubId] ?? (student.ESTMSS_Marks as any)?.[String(subsub.subsubId)] ?? '';
                    const err = validateMarksOrGrade(
                        val,
                        subsub.maxMarks,
                        subjectMeta.marksGradeEntryFlg,
                        subSubjectGradeDetails.map((g: any) => g.emgD_Name || g.EMGD_Name || g),
                        student.papertypeid,
                        paperTypeGradeDetails
                    );
                    if (err) {
                        toast.error(`${student.amsT_FirstName}: ${err} (${subsub.subsubName || 'Sub-Subject'})`);
                        return false;
                    }
                }
            } else if (subjectMeta.subexamFlag) {
                for (const subexam of subjectMeta.subexamData) {
                    const val =
                        (student.ESTMSS_Marks as any)?.[subexam.subexamId] ??
                        (student.ESTMSS_Marks as any)?.[String(subexam.subexamId)] ??
                        '';
                    const err = validateMarksOrGrade(
                        val,
                        subexam.maxMarks,
                        subjectMeta.marksGradeEntryFlg,
                        subExamGradeDetails.map((g: any) => g.emgD_Name || g.EMGD_Name || g),
                        student.papertypeid,
                        paperTypeGradeDetails
                    );
                    if (err) {
                        toast.error(`${student.amsT_FirstName}: ${err} (${subexam.subexamName || 'Sub-Exam'})`);
                        return false;
                    }
                }
            } else {
                const val = student.ESTM_Marks !== undefined && student.ESTM_Marks !== null ? String(student.ESTM_Marks) : '';
                const max = subjectMeta.marksEntryMax || subjectMeta.maxMarks;
                const err = validateMarksOrGrade(
                    val,
                    max,
                    subjectMeta.marksGradeEntryFlg,
                    gradeDetails,
                    student.papertypeid,
                    paperTypeGradeDetails
                );
                if (err) {
                    toast.error(`${student.amsT_FirstName}: ${err}`);
                    return false;
                }
            }
        }
        return true;
    };

    /* ============================================
       Save Functions
       ============================================ */
    const handleSave = async (verifyflg?: string) => {
        if (!subjectMeta) {
            toast.info('No subject data available');
            return;
        }

        const selectedStudents = students.filter((s) => s.selected);
        if (selectedStudents.length === 0) {
            toast.info('Select Students For Saving Marks...');
            return;
        }

        if (!validateSelectedStudents()) {
            return;
        }

        setIsSubmitting(true);

        const currentTimestamp = new Date().toISOString();

        // Prepare main_save_list based on scenario
        const mainSaveList = selectedStudents.map((student) => {
            let totalMarks = 0;
            let mainFlag = '';
            let mainGrade = '';

            if (subjectMeta.subsubFlag || subjectMeta.subexamFlag) {
                const studentSubMarks = tempSubsMarksList.filter((t) => t.AMST_Id === student.amsT_Id);

                studentSubMarks.forEach((mark) => {
                    if (mark.ESTMSS_Marks) {
                        totalMarks += mark.ESTMSS_Marks;
                    }
                    if (mark.ESTMSS_Flg && ['AB', 'L', 'M', 'OD'].includes(mark.ESTMSS_Flg)) {
                        mainFlag = mark.ESTMSS_Flg;
                    }
                    if (mark.ESTMSS_Grade) {
                        mainGrade = mark.ESTMSS_Grade;
                    }
                });
            } else {
                const tempMark = tempSubsMarksList.find((t) => t.AMST_Id === student.amsT_Id && t.ISMS_Id === student.ismS_Id);
                if (tempMark) {
                    totalMarks = tempMark.ESTM_Marks || 0;
                    mainFlag = tempMark.ESTM_Flg || '';
                    mainGrade = tempMark.ESTM_Grade || '';
                } else {
                    totalMarks = student.estM_Marks_new || student.estM_Marks || 0;
                    mainFlag = student.estM_Flg_new || student.estM_Flg || '';
                    mainGrade = student.estM_Grade_new || student.estM_Grade || '';
                }
            }

            return {
                amsT_Id: student.amsT_Id,
                AMST_Id: student.amsT_Id,
                amsT_FirstName: student.amsT_FirstName,
                AMST_FirstName: student.amsT_FirstName,
                amsT_AdmNo: student.amsT_AdmNo,
                AMST_AdmNo: student.amsT_AdmNo,
                amsT_RegistrationNo: student.amsT_RegistrationNo || '',
                AMST_RegistrationNo: student.amsT_RegistrationNo || '',
                amaY_RollNo: student.amaY_RollNo,
                AMAY_RollNo: student.amaY_RollNo,
                ismS_Id: student.ismS_Id,
                ISMS_Id: student.ismS_Id,
                ismS_SubjectName: student.ismS_SubjectName,
                ISMS_SubjectName: student.ismS_SubjectName,
                eyceS_MaxMarks: student.eyceS_MaxMarks,
                EYCES_MaxMarks: student.eyceS_MaxMarks,
                eyceS_MinMarks: student.eyceS_MinMarks,
                EYCES_MinMarks: student.eyceS_MinMarks,
                eyceS_MarksEntryMax: student.eyceS_MarksEntryMax,
                EYCES_MarksEntryMax: student.eyceS_MarksEntryMax,
                estM_Marks: totalMarks,
                ESTM_Marks: totalMarks,
                estM_Grade: mainGrade || '',
                ESTM_Grade: mainGrade || '',
                estM_Flg: mainFlag || '',
                ESTM_Flg: mainFlag || '',
                estM_Id: student.estM_Id || 0,
                ESTM_Id: student.estM_Id || 0,
                param: '',
                amsT_Sex: '',
                estmanssH_Id: 0,
                estmanssH_AnswerSheet: student.estmanssH_AnswerSheet || '',
                ESTMANSSH_AnswerSheet: student.estmanssH_AnswerSheet || '',
                estmanssH_FileLocation: student.estmanssH_FileLocation || '',
                ESTMANSSH_FileLocation: student.estmanssH_FileLocation || ''
            };
        });

        // Prepare temp_subs_marks_list based on scenario
        let tempSubsMarksListFormatted: any[] = [];

        if (subjectMeta.subsubFlag || subjectMeta.subexamFlag) {
            const selectedStudentIds = selectedStudents.map((s) => s.amsT_Id);
            const selectedSubMarks = tempSubsMarksList.filter(
                (mark) => selectedStudentIds.includes(mark.AMST_Id) && (mark.EMSS_Id !== undefined || mark.EMSE_Id !== undefined)
            );

            tempSubsMarksListFormatted = selectedSubMarks.map((mark) => ({
                estmsS_Id: mark.estmsS_Id || 0,
                ESTMSS_Id: mark.estmsS_Id || 0,
                amsT_Id: mark.AMST_Id,
                AMST_Id: mark.AMST_Id,
                emsS_Id: mark.EMSS_Id || 0,
                EMSS_Id: mark.EMSS_Id || 0,
                ismS_Id: mark.ISMS_Id,
                ISMS_Id: mark.ISMS_Id,
                emsE_Id: mark.EMSE_Id || 0,
                EMSE_Id: mark.EMSE_Id || 0,
                estmsS_Marks: mark.ESTMSS_Marks || 0,
                ESTMSS_Marks: mark.ESTMSS_Marks || 0,
                estmsS_MarksGradeFlg: subjectMeta.marksGradeEntryFlg,
                ESTMSS_MarksGradeFlg: subjectMeta.marksGradeEntryFlg,
                estmsS_Grade: mark.ESTMSS_Grade || '',
                ESTMSS_Grade: mark.ESTMSS_Grade || '',
                estmsS_Flg: mark.ESTMSS_Flg || '',
                ESTMSS_Flg: mark.ESTMSS_Flg || '',
                estmsS_ActiveFlg: true,
                ESTMSS_ActiveFlg: true,
                iP4: ''
            }));
        }

        // Build the complete payload
        const saveData: any = {
            createdDate: currentTimestamp,
            updatedDate: currentTimestamp,
            emsS_Id: 0,
            asmaY_Id: ASMAY_Id!,
            asmcL_Id: ASMCL_Id!,
            asmS_Id: ASMS_Id!,
            emE_Id: EME_Id!,
            ismS_Id: ISMS_Id!,
            subject_details: [
                {
                    createdDate: currentTimestamp,
                    updatedDate: currentTimestamp,
                    eyceS_Id: 0,
                    eycE_Id: 0,
                    ismS_Id: ISMS_Id!,
                    emgR_Id: 0,
                    eyceS_MarksEntryMax: selectedStudents[0]?.eyceS_MarksEntryMax || 0,
                    eyceS_MaxMarks: selectedStudents[0]?.eyceS_MaxMarks || 0,
                    eyceS_MinMarks: selectedStudents[0]?.eyceS_MinMarks || 0,
                    eyceS_SubExamFlg: subjectMeta.subexamFlag,
                    eyceS_SubSubjectFlg: subjectMeta.subsubFlag,
                    eyceS_MarksGradeEntryFlg: subjectMeta.marksGradeEntryFlg,
                    eyceS_MarksDisplayFlg: true,
                    eyceS_GradeDisplayFlg: true,
                    eyceS_AplResultFlg: true,
                    eyceS_ActiveFlg: true,
                    eyceS_SubjectOrder: 0
                }
            ],
            eyceS_MarksGradeEntryFlg: subjectMeta.marksGradeEntryFlg,
            EYCES_MarksGradeEntryFlg: subjectMeta.marksGradeEntryFlg,
            eyceS_SubSubjectFlg: subjectMeta.subsubFlag,
            EYCES_SubSubjectFlg: subjectMeta.subsubFlag,
            subject_subsubjects: subjectMeta.subsubFlag
                ? subjectMeta.subsubData.map((ss) => ({
                      eycessS_Id: 0,
                      eyceS_Id: 0,
                      emsS_Id: ss.subsubId,
                      emgR_Id: 0,
                      eycessS_MaxMarks: ss.maxMarks,
                      eycessS_MinMarks: ss.minMarks || 0,
                      eycessS_MarksEntryMax: ss.marksEntryMax,
                      eycessS_ExemptedFlg: false,
                      eycessS_ExemptedPer: '',
                      eycessS_ActiveFlg: true,
                      eycessS_SubSubjectOrder: 0,
                      emsS_SubSubjectName: ss.subsubName,
                      emsS_SubSubjectCode: ''
                  }))
                : [],
            eyceS_SubExamFlg: subjectMeta.subexamFlag,
            EYCES_SubExamFlg: subjectMeta.subexamFlag,
            subject_subexams: subjectMeta.subexamFlag
                ? subjectMeta.subexamData.map((se) => ({
                      eycessE_Id: 0,
                      eyceS_Id: 0,
                      emsE_Id: se.subexamId,
                      emgR_Id: 0,
                      eycessE_MaxMarks: se.maxMarks,
                      eycessE_MinMarks: se.minMarks || 0,
                      eycessE_MarksEntryMax: se.marksEntryMax,
                      eycessE_ExemptedFlg: false,
                      eycessE_ExemptedPer: '',
                      eycessE_ActiveFlg: true,
                      eycessE_SubExamOrder: 0,
                      emsE_SubExamName: se.subexamName,
                      emsE_SubExamCode: ''
                  }))
                : [],
            emgR_Id: 0,
            grade_details: gradeDetails,
            amaY_RollNo: 0,
            iP4: '',
            studentList: [],
            get_student_wise_papertype_list: [],
            subsubject_gradedetails: subSubjectGradeDetails,
            subexam_gradedetails: subExamGradeDetails,
            main_save_list: mainSaveList,
            Main_save_list: mainSaveList,
            temp_subs_marks_list: tempSubsMarksListFormatted,
            Temp_subs_marks_list: tempSubsMarksListFormatted,
            saved_studentList: [],
            marksdeleteflag: marksDeleteFlag,
            saved_sub_subject_exam_list: [],
            saved_sub_subject_list: [],
            saved_sub_subjectOrExam_list: [],
            configuration: config ? [config] : [],
            subsubjectlist: subjectMeta.subsubFlag
                ? subjectMeta.subsubData.map((ss) => ({
                      emsS_Id: ss.subsubId,
                      emsS_SubSubjectName: ss.subsubName,
                      emsS_SubSubjectOrder: 0
                  }))
                : [],
            subexamlist: subjectMeta.subexamFlag
                ? subjectMeta.subexamData.map((se) => ({
                      emsE_Id: se.subexamId,
                      emsE_SubExamName: se.subexamName,
                      emsE_SubExamOrder: 0
                  }))
                : [],
            savedMarksCount: mainSaveList.length,
            lastDateEntry: 1000,
            lastDateEntryFlag: lastDateEntryFlag,
            lastDateExam: 2000,
            lastDateExamFlag: lastDateExamFlag,
            marksEntryStateDate: currentTimestamp,
            pagename: 'School',
            Pagename: 'School',
            ivrmmaP_AddFlg: true,
            IVRMMAP_AddFlg: true,
            ivrmmaP_UpdateFlg: true,
            get_papertype_grade_details: paperTypeGradeDetails,
            answer_sheet: []
        };

        if (verifyflg) {
            saveData.orderflag = verifyflg;
            saveData.Orderflag = verifyflg;
            saveData.orderFlag = verifyflg;
        }

        try {
            const response = await addOrUpdateStudentMarks(saveData);

            if (response.success || response.returnval === true) {
                toast.success(response.message || 'Marks saved successfully');
                setTempSubsMarksList([]);
                await handleSearch();

                if (onSave) {
                    await onSave(saveData);
                }
            } else {
                toast.error(response.message || 'Failed to save data');
            }
        } catch (error: any) {
            console.error('Error saving marks:', error);
            toast.error(error.message || 'Failed to save data');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveVerify = () => {
        if (!validateSelectedStudents()) {
            return;
        }
        toast.custom((t) => (
            <div className='rounded-lg border bg-white p-4 shadow-lg'>
                <h3 className='mb-2 font-semibold text-lg'>Are You Sure?</h3>
                <p className='mb-4'>
                    Once verified, the marks will be frozen and cannot be updated. Do you want to proceed with verification?
                </p>
                <div className='flex justify-end gap-2'>
                    <Button variant='outline' onClick={() => toast.dismiss(t)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            handleSave('V');
                            toast.dismiss(t);
                        }}>
                        Yes, Verify It!
                    </Button>
                </div>
            </div>
        ));
    };

    const handleSaveMarks = () => {
        if (!validateSelectedStudents()) {
            return;
        }
        if (marksDeleteFlag) {
            setShowConfirmPopup(true);
        } else {
            handleSave('');
        }
    };

    /* ============================================
       Render Table
       ============================================ */
    const renderTable = () => {
        if (!subjectMeta || students.length === 0) {
            return null;
        }

        // Initialize input refs array
        if (!inputRefs.current.length) {
            inputRefs.current = Array(students.length)
                .fill(null)
                .map(() => []);
        }

        let totalColumns = 3; // Checkbox, SL NO, Student Name
        if (!config || config.exmConfig_RegnoColumnDisplay) totalColumns++;
        if (!config || config.exmConfig_AdmnoColumnDisplay) totalColumns++;
        if (!config || config.exmConfig_RollnoColumnDisplay) totalColumns++;

        if (subjectMeta.subsubFlag && subjectMeta.subexamFlag) {
            totalColumns += tempSubSubjsExams.length;
        } else if (subjectMeta.subsubFlag) {
            totalColumns += subjectMeta.subsubData.length;
        } else if (subjectMeta.subexamFlag) {
            totalColumns += subjectMeta.subexamData.length;
        } else {
            totalColumns += 1; // Simple marks
        }

        return (
            <div className='mt-4 overflow-x-auto rounded border bg-white shadow-sm'>
                <table className='min-w-full table-fixed border-collapse border border-gray-300 [&_td]:border [&_td]:border-gray-300 [&_th]:border'>
                    <thead>
                        <tr>
                            <TableHeaderCell rowSpan={subjectMeta.subsubFlag && subjectMeta.subexamFlag ? 3 : 2}>
                                <div className='flex items-center justify-center'>
                                    <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={toggleAllSelection}
                                        className='border-violet-600 data-[state=checked]:bg-white data-[state=unchecked]:bg-white data-[state=checked]:text-violet-600'
                                    />
                                </div>
                            </TableHeaderCell>
                            <TableHeaderCell rowSpan={subjectMeta.subsubFlag && subjectMeta.subexamFlag ? 3 : 2}>SL NO</TableHeaderCell>
                            <TableHeaderCell rowSpan={subjectMeta.subsubFlag && subjectMeta.subexamFlag ? 3 : 2} className='text-left'>
                                Student Name
                            </TableHeaderCell>

                            {(!config || config.exmConfig_RegnoColumnDisplay) && (
                                <TableHeaderCell rowSpan={subjectMeta.subsubFlag && subjectMeta.subexamFlag ? 3 : 2}>
                                    Reg No
                                </TableHeaderCell>
                            )}

                            {(!config || config.exmConfig_AdmnoColumnDisplay) && (
                                <TableHeaderCell rowSpan={subjectMeta.subsubFlag && subjectMeta.subexamFlag ? 3 : 2}>
                                    Admission No
                                </TableHeaderCell>
                            )}

                            {(!config || config.exmConfig_RollnoColumnDisplay) && (
                                <TableHeaderCell rowSpan={subjectMeta.subsubFlag && subjectMeta.subexamFlag ? 3 : 2}>
                                    Roll No
                                </TableHeaderCell>
                            )}

                            {subjectMeta.subsubFlag && subjectMeta.subexamFlag ? (
                                <TableHeaderCell colSpan={tempSubSubjsExams.length}>
                                    <div className='font-semibold'>{`${subjectMeta.subjectName} (M-${subjectMeta.maxMarks})`}</div>
                                    <div className='text-[12px]'>{`(ME-${subjectMeta.minMarks})`}</div>
                                </TableHeaderCell>
                            ) : subjectMeta.subsubFlag ? (
                                <TableHeaderCell colSpan={subjectMeta.subsubData.length}>
                                    <div className='font-semibold'>{`${subjectMeta.subjectName} (M-${subjectMeta.maxMarks})`}</div>
                                    <div className='text-[12px]'>{`(ME-${subjectMeta.minMarks})`}</div>
                                </TableHeaderCell>
                            ) : subjectMeta.subexamFlag ? (
                                <TableHeaderCell colSpan={subjectMeta.subexamData.length}>
                                    <div className='font-semibold'>{`${subjectMeta.subjectName} (M-${subjectMeta.maxMarks})`}</div>
                                    <div className='text-[12px]'>{`(ME-${subjectMeta.minMarks})`}</div>
                                </TableHeaderCell>
                            ) : (
                                <TableHeaderCell rowSpan={2}>
                                    <div className='font-semibold'>{`${subjectMeta.subjectName} (M-${subjectMeta.maxMarks})`}</div>
                                    <div className='text-[12px]'>{`(ME-${subjectMeta.minMarks})`}</div>
                                </TableHeaderCell>
                            )}
                        </tr>

                        {(subjectMeta.subsubFlag || subjectMeta.subexamFlag) && (
                            <tr>
                                {subjectMeta.subsubFlag && subjectMeta.subexamFlag
                                    ? subjectSubsubjectsDetails.map((ss: any, idx: number) => (
                                          <TableHeaderCell key={idx} colSpan={ss.subexamlist?.length || 1}>
                                              <div className='font-semibold text-sm'>
                                                  {ss.subsubject?.emsS_SubSubjectName ?? ss.subsubject?.EMSS_SubSubjectName}
                                              </div>
                                          </TableHeaderCell>
                                      ))
                                    : subjectMeta.subsubFlag
                                      ? subjectMeta.subsubData.map((ss) => (
                                            <TableHeaderCell key={ss.subsubId}>
                                                <div className='font-semibold text-sm'>{ss.subsubName}</div>
                                                <div className='text-[11px]'>{`(M-${ss.maxMarks}) (ME-${ss.marksEntryMax})`}</div>
                                            </TableHeaderCell>
                                        ))
                                      : subjectMeta.subexamFlag
                                        ? subjectMeta.subexamData.map((se) => (
                                              <TableHeaderCell key={se.subexamId}>
                                                  <div className='font-semibold text-sm'>{se.subexamName}</div>
                                                  <div className='text-[11px]'>{`(M-${se.maxMarks}) (ME-${se.marksEntryMax})`}</div>
                                              </TableHeaderCell>
                                          ))
                                        : null}
                            </tr>
                        )}

                        {subjectMeta.subsubFlag && subjectMeta.subexamFlag && (
                            <tr>
                                {tempSubSubjsExams.map((se: any, idx: number) => (
                                    <TableHeaderCell key={idx}>
                                        <div className='font-semibold text-xs'>
                                            {se.emsE_SubExamName ?? se.EMSE_SubExamName ?? se.emsS_SubExamName ?? se.EMSS_SubExamName}
                                        </div>
                                        <div className='text-[10px]'>{`(M-${se.eycessE_MaxMarks ?? se.EYCESSE_MaxMarks ?? se.maxMarks ?? 0}) (ME-${se.eycessE_MarksEntryMax ?? se.EYCESSE_MarksEntryMax ?? se.marksEntryMax ?? se.eycessE_MaxMarks ?? 0})`}</div>
                                    </TableHeaderCell>
                                ))}
                            </tr>
                        )}
                    </thead>

                    <tbody>
                        {students.length === 0 ? (
                            <tr>
                                <TableCell colSpan={totalColumns} className='py-8 text-center text-gray-500 text-sm'>
                                    No Records Found
                                </TableCell>
                            </tr>
                        ) : (
                            students.map((student, rowIndex) => {
                                return (
                                    <tr key={student.amsT_Id} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <TableCell className='pr-2 text-center'>
                                            <Checkbox
                                                checked={student.selected || false}
                                                onCheckedChange={() => toggleStudentSelection(student.amsT_Id)}
                                                className='rounded accent-[#7C3AED]'
                                            />
                                        </TableCell>
                                        <TableCell className='text-center'>{rowIndex + 1}</TableCell>
                                        <TableCell className='font-center'>{student.amsT_FirstName}</TableCell>

                                        {(!config || config.exmConfig_RegnoColumnDisplay) && (
                                            <TableCell className='text-center'>{student.amsT_RegistrationNo}</TableCell>
                                        )}

                                        {(!config || config.exmConfig_AdmnoColumnDisplay) && (
                                            <TableCell className='text-center'>{student.amsT_AdmNo}</TableCell>
                                        )}

                                        {(!config || config.exmConfig_RollnoColumnDisplay) && (
                                            <TableCell className='text-center'>{student.amaY_RollNo}</TableCell>
                                        )}

                                        {subjectMeta.subsubFlag && subjectMeta.subexamFlag ? (
                                            tempSubSubjsExams.map((se: any, colIndex: number) => {
                                                const seEmsSId = se.emsS_Id ?? se.EMSS_Id ?? se.emss_id;
                                                const seEmsEId = se.emsE_Id ?? se.EMSE_Id ?? se.emse_id ?? se.emsS_Id ?? se.EMSS_Id;
                                                const key = `${seEmsSId}_${seEmsEId}`;
                                                const val =
                                                    (student.ESTMSS_Marks as any)?.[key] ??
                                                    (student.ESTMSS_Marks as any)?.[`${se.emsS_Id}_${se.emsE_Id}`] ??
                                                    '';
                                                return (
                                                    <TableCell key={colIndex} className='text-center'>
                                                        <div className='flex justify-center'>
                                                            <MarksInputCell
                                                                value={val}
                                                                max={se.eycessE_MaxMarks ?? se.EYCESSE_MaxMarks ?? se.maxMarks ?? 0}
                                                                min={se.eycessE_MinMarks ?? se.EYCESSE_MinMarks ?? se.minMarks ?? 0}
                                                                disabled={!student.selected}
                                                                onChange={(v) =>
                                                                    updateSubSubjectSubExamMark(student.amsT_Id, seEmsSId, seEmsEId, v)
                                                                }
                                                                placeholder={
                                                                    subjectMeta.marksGradeEntryFlg === 'M'
                                                                        ? 'Enter Marks...'
                                                                        : 'Enter Grade...'
                                                                }
                                                                marksGradeEntryFlg={subjectMeta.marksGradeEntryFlg}
                                                                gradeDetails={subExamGradeDetails.map(
                                                                    (g: any) => g.emgD_Name || g.EMGD_Name || g
                                                                )}
                                                                papertypeid={student.papertypeid}
                                                                papertypeGradeDetails={paperTypeGradeDetails}
                                                                onArrow={(dir) => handleArrowNavigation(rowIndex, colIndex, dir)}
                                                                ref={(el) => {
                                                                    if (!inputRefs.current[rowIndex]) {
                                                                        inputRefs.current[rowIndex] = [];
                                                                    }
                                                                    inputRefs.current[rowIndex][colIndex] = el;
                                                                }}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                );
                                            })
                                        ) : subjectMeta.subsubFlag ? (
                                            <>
                                                {subjectMeta.subsubData.map((subsub, colIndex) => {
                                                    const val =
                                                        (student.ESTMSS_Marks as any)?.[subsub.subsubId] ??
                                                        (student.ESTMSS_Marks as any)?.[String(subsub.subsubId)] ??
                                                        '';
                                                    return (
                                                        <TableCell key={subsub.subsubId} className='text-center'>
                                                            <div className='flex justify-center'>
                                                                <MarksInputCell
                                                                    value={val}
                                                                    max={subsub.maxMarks}
                                                                    min={subsub.minMarks}
                                                                    disabled={!student.selected}
                                                                    onChange={(v) =>
                                                                        updateSubSubjectMark(student.amsT_Id, subsub.subsubId, v)
                                                                    }
                                                                    placeholder={
                                                                        subjectMeta.marksGradeEntryFlg === 'M'
                                                                            ? 'Enter Marks...'
                                                                            : 'Enter Grade...'
                                                                    }
                                                                    marksGradeEntryFlg={subjectMeta.marksGradeEntryFlg}
                                                                    gradeDetails={subSubjectGradeDetails.map(
                                                                        (g: any) => g.emgD_Name || g.EMGD_Name || g
                                                                    )}
                                                                    papertypeid={student.papertypeid}
                                                                    papertypeGradeDetails={paperTypeGradeDetails}
                                                                    onArrow={(dir) => handleArrowNavigation(rowIndex, colIndex, dir)}
                                                                    ref={(el) => {
                                                                        if (!inputRefs.current[rowIndex]) {
                                                                            inputRefs.current[rowIndex] = [];
                                                                        }
                                                                        inputRefs.current[rowIndex][colIndex] = el;
                                                                    }}
                                                                />
                                                            </div>
                                                        </TableCell>
                                                    );
                                                })}
                                            </>
                                        ) : subjectMeta.subexamFlag ? (
                                            <>
                                                {subjectMeta.subexamData.map((subexam, colIndex) => {
                                                    const val =
                                                        (student.ESTMSS_Marks as any)?.[subexam.subexamId] ??
                                                        (student.ESTMSS_Marks as any)?.[String(subexam.subexamId)] ??
                                                        '';
                                                    return (
                                                        <TableCell key={subexam.subexamId} className='text-center'>
                                                            <div className='flex justify-center'>
                                                                <MarksInputCell
                                                                    value={val}
                                                                    max={subexam.maxMarks}
                                                                    min={subexam.minMarks}
                                                                    disabled={!student.selected}
                                                                    onChange={(v) =>
                                                                        updateSubExamMark(student.amsT_Id, subexam.subexamId, v)
                                                                    }
                                                                    placeholder={
                                                                        subjectMeta.marksGradeEntryFlg === 'M'
                                                                            ? 'Enter Marks...'
                                                                            : 'Enter Grade...'
                                                                    }
                                                                    marksGradeEntryFlg={subjectMeta.marksGradeEntryFlg}
                                                                    gradeDetails={subExamGradeDetails.map(
                                                                        (g: any) => g.emgD_Name || g.EMGD_Name || g
                                                                    )}
                                                                    papertypeid={student.papertypeid}
                                                                    papertypeGradeDetails={paperTypeGradeDetails}
                                                                    onArrow={(dir) => handleArrowNavigation(rowIndex, colIndex, dir)}
                                                                    ref={(el) => {
                                                                        if (!inputRefs.current[rowIndex]) {
                                                                            inputRefs.current[rowIndex] = [];
                                                                        }
                                                                        inputRefs.current[rowIndex][colIndex] = el;
                                                                    }}
                                                                />
                                                            </div>
                                                        </TableCell>
                                                    );
                                                })}
                                            </>
                                        ) : (
                                            <TableCell className='text-center'>
                                                <div className='flex justify-center'>
                                                    <MarksInputCell
                                                        value={
                                                            student.ESTM_Marks !== undefined && student.ESTM_Marks !== null
                                                                ? String(student.ESTM_Marks)
                                                                : ''
                                                        }
                                                        max={subjectMeta.marksEntryMax || subjectMeta.maxMarks}
                                                        min={subjectMeta.minMarks}
                                                        disabled={!student.selected}
                                                        onChange={(v) => updateSimpleMark(student.amsT_Id, v)}
                                                        placeholder={
                                                            subjectMeta.marksGradeEntryFlg === 'M' ? 'Enter Marks...' : 'Enter Grade...'
                                                        }
                                                        marksGradeEntryFlg={subjectMeta.marksGradeEntryFlg}
                                                        gradeDetails={gradeDetails}
                                                        papertypeid={student.papertypeid}
                                                        papertypeGradeDetails={paperTypeGradeDetails}
                                                        onArrow={(dir) => handleArrowNavigation(rowIndex, 0, dir)}
                                                        ref={(el) => {
                                                            if (!inputRefs.current[rowIndex]) {
                                                                inputRefs.current[rowIndex] = [];
                                                            }
                                                            inputRefs.current[rowIndex][0] = el;
                                                        }}
                                                    />
                                                </div>
                                            </TableCell>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    /* ============================================
       Render
       ============================================ */
    return (
        <div className='space-y-4'>
            {/* Loader */}
            {isLoading && (
                <div className='flex items-center justify-center py-8'>
                    <Loader2 className='h-8 w-8 animate-spin text-[#7C3AED]' />
                    <span className='ml-2'>Loading data...</span>
                </div>
            )}

            {/* Students Grid */}
            {isStudentsGridOpen && !isLoading && (
                <div className='space-y-4'>
                    {renderTable()}

                    {/* Action Buttons */}
                    {students.length > 0 && (
                        <div className='flex justify-end gap-2'>
                            <Button
                                variant='outline'
                                onClick={() => {
                                    setStudents((prev) =>
                                        prev.map((s) => ({
                                            ...s,
                                            selected: false,
                                            ESTM_Marks: '',
                                            ESTMSS_Marks: {}
                                        }))
                                    );
                                    setAllSelected(false);
                                    setTempSubsMarksList([]);
                                }}>
                                <RotateCcw className='mr-2 h-4 w-4' />
                                Clear
                            </Button>

                            {userPrivileges?.canVerify && (
                                <Button onClick={handleSaveVerify} className='bg-green-600 text-white hover:bg-green-700'>
                                    <Save className='mr-2 h-4 w-4' />
                                    Verify & Save
                                </Button>
                            )}

                            <Button onClick={handleSaveMarks} className='bg-[#7C3AED] text-white hover:bg-[#6D28D9]'>
                                <Save className='mr-2 h-4 w-4' />
                                {isSubmitting ? 'Saving...' : 'Save Marks'}
                            </Button>
                        </div>
                    )}
                    <AlertDialog open={showConfirmPopup} onOpenChange={setShowConfirmPopup}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Marks are already calculated. If you update the marks, you will need to recalculate them again. Do you
                                    want to continue?
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        handleSave('');
                                        setShowConfirmPopup(false);
                                    }}>
                                    Yes, Update It!
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Information</AlertDialogTitle>
                                <AlertDialogDescription>
                                    For this user, sub-subject is not mapped for the selected subject. Kindly contact the administrator.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <AlertDialogAction onClick={() => setShowInfoDialog(false)}>OK</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}

            {/* No data message */}
            {!isLoading && !isStudentsGridOpen && (
                <div className='py-8 text-center text-gray-500'>No data available. Please check the selected parameters.</div>
            )}
        </div>
    );
}
