'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAcademicYearDropdown } from '@/hooks/admission/preadmission/useMasters';
import {
    useCheckTCDuplication,
    useSaveStudentTC,
    useStudentNameList,
    useStudentSearchFilter,
    // useStudentTCInitialData,
    // useStudentTCList,
    useStudentTCDetails,
    useStudentsByAcademicYear
    // useStudentDetailsOnNameChange
} from '@/hooks/admission/preadmission/useStudentTc';
import { cn } from '@/lib/utils';
import { ensureArray } from '@/lib/utils';
import { Check, ChevronLeft, ChevronRight, ChevronsUpDown, Loader2, Save, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import {
    DueDetailsTab,
    OtherDetailsTab,
    StudentDetailsTab,
    StudentHeaderSummary,
    StudentPersonalDetailsTab,
    TCDetailsTab
} from './_components';
import {
    type IDeletedTC,
    type IGeneratedTC,
    type IStudentSearch,
    deletedTCColumns,
    generatedTCColumns,
    studentSearchColumns
} from './_components/columns';

export interface ITCFormData {
    tc_no: string;
    sts_no: string; // Added field
    reason: string;
    last_class: string;
    app_date: string;
    tc_date: string;
    Promotion_Flag: string;
    Fee_Due_Flag: string;
    Medically_Exam_Flag: string;
    conduct: string;
    working_days: number;
    present_days: number;
    language_stud: string;
    extracurricular: string;
    games_played: string;
    academic_year_join: string;
    subjects_stud: string;
    qual_class: string;
    remarks: string;
    scholarship: string;
    electives_stud: string;
    promotion_date: string;
    last_date_attendance: string; // New field
    left_date: string; // New field

    // New fields for Personal Details
    dob: string;
    dob_words: string;
    bank_ifsc: string;
    birth_place: string;
    birth_cert_no: string;
    caste_cert_no: string;
    age: number;
    gender: string;
    mother_tongue: string;
    nationality: string;
    mobile: string;
    email: string;
    aadhar_no: string;
    blood_group: string;
    bank_ac_no: string;
    bpl_card_no: string;

    // New fields for Other Details
    fee_concession: string;
    last_exam_details: string;
    result: string;
    failed_details: string;
    ncc_cadet: string;

    // UI Refactor existing
    admission_date: string;
    caste: string;
    mediumOfInstruction: string;
    // subjects_stud: string; // Removed duplicate
}

export default function StudentTCApplyPage() {
    // --- State ---
    const [data, setData] = useState<IStudentSearch[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<IStudentSearch | null>(null);
    const [selectedStudentDetails, setSelectedStudentDetails] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<string>('student-details');
    const [openStudentSelect, setOpenStudentSelect] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [tcConfig, setTcConfig] = useState<any>(null);
    const [maxEnabledTabIndex, setMaxEnabledTabIndex] = useState(0);

    const TABS = ['student-details', 'tc-details', 'personal-details', 'other-details', 'due-details'];

    // Search Parameters
    const [asmayId, setAsmayId] = useState<string>('');
    const [studentListId, setStudentListId] = useState<string>('');
    const [searchType, setSearchType] = useState<string>('all');
    const [studentStatus, setStudentStatus] = useState<string>('active');
    const [isTemporaryTC, setIsTemporaryTC] = useState<boolean>(false);
    const [searchOrder, setSearchOrder] = useState<string>('admno_name');

    // Form Data for TC Application
    const [formData, setFormData] = useState<ITCFormData>({
        tc_no: '',
        reason: '',
        last_class: '',
        sts_no: '',
        app_date: new Date().toISOString().split('T')[0],
        tc_date: new Date().toISOString().split('T')[0],
        last_date_attendance: new Date().toISOString().split('T')[0], // New field
        left_date: new Date().toISOString().split('T')[0], // New field
        admission_date: '',
        caste: '',
        mediumOfInstruction: '',
        subjects_stud: '',
        Promotion_Flag: 'qualified',
        Fee_Due_Flag: 'yes',
        Medically_Exam_Flag: 'no',
        conduct: 'Good',
        working_days: 0,
        present_days: 0,
        language_stud: '',
        extracurricular: '',
        games_played: '',
        academic_year_join: '',
        qual_class: '',
        remarks: '',
        scholarship: '',
        electives_stud: '',
        promotion_date: new Date().toISOString().split('T')[0],

        // Initialize Personal Details
        dob: '',
        dob_words: '',
        bank_ifsc: '',
        birth_place: '',
        birth_cert_no: '',
        caste_cert_no: '',
        age: 0,
        gender: '',
        mother_tongue: '',
        nationality: '',
        mobile: '',
        email: '',
        aadhar_no: '',
        blood_group: '',
        bank_ac_no: '',
        bpl_card_no: '',

        // Initialize Other Details
        fee_concession: 'General',
        last_exam_details: '',
        result: '',
        failed_details: '',
        ncc_cadet: 'no'
    });

    const [openPreview, setOpenPreview] = useState(false); // State for preview modal

    // --- Hooks ---
    const { data: academicYears, isLoading: academicYearLoading } = useAcademicYearDropdown();

    // const initialDataMutation = useStudentTCInitialData();
    // const searchMutation = useStudentTCList();
    const detailsMutation = useStudentTCDetails();
    const saveMutation = useSaveStudentTC();
    const duplicateCheckMutation = useCheckTCDuplication();
    const searchFilterMutation = useStudentSearchFilter(); // New hook
    const [searchText, setSearchText] = useState(''); // Search state

    const { data: studentListRaw, isLoading: studentListLoading } = useStudentsByAcademicYear(Number(asmayId));
    const { data: studentNameListRaw, isLoading: studentNameListLoading } = useStudentNameList(Number(asmayId));

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchText.length >= 1 && asmayId) {
                let flag = 'N'; // Default Name
                if (/^\d+$/.test(searchText)) {
                    flag = 'A'; // Adm No if digits
                }

                const solMap: Record<string, string> = {
                    active: 'S',
                    left: 'L',
                    deactive: 'D',
                    temporary: 'T'
                };
                const sol = solMap[studentStatus] || 'S';

                searchFilterMutation.mutate({
                    asmayId: Number(asmayId),
                    amstSol: sol,
                    searchfilter: searchText,
                    flag: flag
                });
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchText, asmayId, studentStatus]);

    // Extract lists from response
    // ... (rest of extraction logic)
    const responseData = studentListRaw?.data || studentListRaw;
    const studentNameData = studentNameListRaw?.data || studentNameListRaw;

    const academicList = responseData?.academicList || [];
    const classList = responseData?.classlistnew || responseData?.classlist || responseData?.classList || [];

    // Search Results handling
    // API returns { success: true, data: [ ...students ] }
    const searchResults = searchFilterMutation.data?.data || [];

    // Consolidated Student List: Use Search Results if searching, else Initial List
    let studentList = [];
    if (searchText.length >= 1) {
        studentList = searchResults;
    } else {
        studentList = [];
    }

    // New lists from backend
    const generatedTCList: IGeneratedTC[] = responseData?.getstudenttcdetails || [];
    const deletedTCList: IDeletedTC[] = responseData?.getdeletedtcdetails || [];

    // --- Initial Data Loading ---
    // Commented out since getStudentTCInitialData is not needed
    // useEffect(() => {
    //     initialDataMutation.mutate({
    //         ASMAY_Id: 0,
    //         ASMCL_Id: 0,
    //         ASMS_Id: 0,
    //         flag: 'S'
    //     }, {
    //         onError: (error) => {
    //             console.error('Initial data load error:', error);
    //             toast.error('Failed to load initial data for TC application');
    //         }
    //     });
    // }, []);

    // --- Handlers ---
    // Search is handled via the Student Name combobox now
    // const handleSearch = () => {
    //     if (!asmayId) {
    //         toast.error('Please select Academic Year');
    //         return;
    //     }

    //     const payload = {
    //         ASMAY_Id: Number(asmayId),
    //         ASMCL_Id: Number(asmclId),
    //         ASMS_Id: Number(asmsId),
    //         Status_flag: studentStatus,
    //         allorindividual: searchType === 'all' ? 'All' : 'Individual',
    //         adm_num_flag: searchOrder
    //     };

    //     searchMutation.mutate(payload, {
    //         onSuccess: (response: any) => {
    //             if (response?.student_name_list && response.student_name_list.length > 0) {
    //                 const transformed = response.student_name_list.map((item: any) => ({
    //                     id: item.amsT_Id,
    //                     admNo: item.amsT_AdmNo,
    //                     studentName: item.studentName,
    //                     class: item.asmcL_ClassName,
    //                     section: item.asmS_SectionName,
    //                     original: item
    //                 }));
    //                 setData(transformed);
    //             } else {
    //                 setData([]);
    //                 toast.info('No students found for given criteria');
    //             }
    //         },
    //         onError: () => {
    //             toast.error('Failed to search students');
    //         }
    //     });
    //     setSelectedStudent(null);
    //     setSelectedStudentDetails(null);
    // };

    const handleSelect = (student: IStudentSearch) => {
        setSelectedStudent(student);
        setActiveTab('student-details');
        setMaxEnabledTabIndex(0);

        const solMap: Record<string, string> = {
            active: 'S',
            left: 'L',
            deactive: 'D',
            temporary: 'T'
        };
        const statusFlag = solMap[studentStatus] || 'S';

        const payload = {
            amstId: student.id,
            asmayId: Number(asmayId),
            statusFlag: statusFlag,
            feetobepaid: 0
        };

        // Reset Blocked Status on new selection
        setIsBlocked(false);

        // Use detailsMutation (getStudentTCDetails POST)
        detailsMutation.mutate(payload, {
            onSuccess: (response: any) => {
                // --- 1. Dues & Configuration Check ---
                // Configuration flags should come from response, not initialDataMutation
                // Default to checking dues (flag = 1) if not present
                const actualData = response.data || response;

                if (
                    actualData?.studentList?.length > 0 ||
                    actualData?.studentListById?.length > 0 ||
                    actualData?.getjoineddetails?.length > 0
                ) {
                    setSelectedStudentDetails(actualData);

                    // --- 1. Dues Check ---
                    const feeDueAmount = actualData.fee_Due_Amnt || 0;
                    const libraryDueCount = actualData.library_Due_Amnt || 0;
                    const pdaDueAmount = actualData.pdA_Due || 0;

                    // Flags - support both transnumconfigsettings, admTransNumSetting and admissioncongigurationList
                    const config = actualData.admTransNumSetting?.[0] || actualData.admissioncongigurationList?.[0] || actualData.transnumconfigsettings?.[0];

                    // IF admC_TCAllowBalanceFlg is 0, it means balance is NOT allowed (paymentTcFlag = 1)
                    // IF it is 1, balance IS allowed (paymentTcFlag = 0)
                    const paymentTcFlag = config?.transnumconfigsettings_Payment_TC_Flag ?? (config?.admC_TCAllowBalanceFlg === 0 ? 1 : 0);
                    const libraryTcFlag =
                        config?.transnumconfigsettings_Library_TC_Flag ?? (config?.asC_LibraryAllowBalanceFlg === 0 ? 1 : 0);

                    let blockMessage = '';

                    if (paymentTcFlag === 1) {
                        if (feeDueAmount > 0) {
                            blockMessage += `Rs ${feeDueAmount}/- Amount is Due in Fee! `;
                        }
                        if (pdaDueAmount > 0) {
                            blockMessage += `Rs ${pdaDueAmount}/- Amount is Due in PDA! `;
                        }
                    }

                    if (libraryTcFlag === 1 && libraryDueCount > 0) {
                        blockMessage += `${libraryDueCount} Books Pending in Library! `;
                    }

                    if (blockMessage) {
                        setIsBlocked(true); // BLOCK THE FORM
                        Swal.fire({
                            title: 'Cannot Generate TC',
                            text: blockMessage + ' Please clear dues first.',
                            icon: 'error',
                            confirmButtonColor: '#d33'
                        });
                    }

                    // Store Config only if present in this request, else rely on the list request config
                    if (config) {
                        setTcConfig(config);
                    }

                    // --- 2. Approval Workflow Check ---
                    // "acertapP_ApprovaReqlFlg"
                    const approvalMaster = actualData.getapprovalmasterdetails?.[0];
                    const allowApproval = approvalMaster?.acertapP_ApprovaReqlFlg;
                    const tcGenerated = actualData.tcgeneratedornot;

                    if (!tcGenerated && allowApproval === true) {
                        const studentApplied = actualData.getstudentapplieddetails?.[0];
                        const approvalResult = actualData.getapprovalresultdetails?.[0];

                        if (studentApplied) {
                            // Check status
                            const status = approvalResult?.ascaP_Status || studentApplied.ascA_Status;
                            if (status !== 'Approved') {
                                setIsBlocked(true);
                                Swal.fire({
                                    title: 'Approval Pending',
                                    text: `Certificate Status is "${status}". TC cannot be generated.`,
                                    icon: 'warning'
                                });
                            }
                        } else {
                            setIsBlocked(true);
                            Swal.fire({
                                title: 'Approval Required',
                                text: 'For Approval Process, First Student Need To Put Request For Certificate From Portal.',
                                icon: 'warning'
                            });
                        }
                    }

                    // --- 3. Populate Form Data ---
                    const studentInfo = actualData.studentList?.[0];
                    const joinedInfo = actualData.getjoineddetails?.[0];
                    const electiveSub = ensureArray(actualData.get_elective_subjects_common)
                        .map((sub: any) => sub.subjectname || sub.ismS_SubjectName)
                        .filter(Boolean)
                        .join(', ');
                    const langSub = ensureArray(actualData.get_elective_subjects_language)
                        .map((sub: any) => sub.subjectname || sub.ismS_SubjectName)
                        .filter(Boolean)
                        .join(', ');
                    const subjects = ensureArray(actualData.get_subjects_common || actualData.get_elective_subjects_common)
                        .map((sub: any) => sub.subjectname || sub.ismS_SubjectName)
                        .filter(Boolean)
                        .join(', ');

                    if (studentInfo) {
                        setFormData((prev: ITCFormData) => ({
                            ...prev,
                            // Map existing fields
                            tc_no: joinedInfo?.astC_TCNO || '',
                            sts_no: studentInfo.stsno || '',
                            reason: joinedInfo?.astC_LeavingReason || '',
                            remarks: joinedInfo?.astC_Remarks || '',
                            conduct: joinedInfo?.astC_Conduct || 'Good',
                            last_class: studentInfo.classstudying || studentInfo.classStudying || studentInfo.asmcl_classname || '',
                            academic_year_join: joinedInfo?.asmaY_Year ? joinedInfo.asmaY_Year.toString() : studentInfo.asmay_year || '',

                            // Dates
                            app_date: joinedInfo?.astC_TCApplicationDate
                                ? new Date(joinedInfo.astC_TCApplicationDate).toISOString().split('T')[0]
                                : new Date().toISOString().split('T')[0],
                            tc_date: joinedInfo?.astC_TCIssueDate
                                ? new Date(joinedInfo.astC_TCIssueDate).toISOString().split('T')[0]
                                : new Date().toISOString().split('T')[0],
                            last_date_attendance: actualData.todateatt
                                ? new Date(actualData.todateatt).toISOString().split('T')[0]
                                : new Date().toISOString().split('T')[0],
                            left_date: joinedInfo?.astC_TCDate
                                ? new Date(joinedInfo.astC_TCDate).toISOString().split('T')[0]
                                : new Date().toISOString().split('T')[0],
                            promotion_date: joinedInfo?.astC_PromotionDate
                                ? new Date(joinedInfo.astC_PromotionDate).toISOString().split('T')[0]
                                : new Date().toISOString().split('T')[0],
                            admission_date: studentInfo.amst_date ? new Date(studentInfo.amst_date).toISOString().split('T')[0] : '',
                            working_days: joinedInfo?.astC_WorkingDays || actualData.studentList1?.[0]?.Classes || actualData.totalworkingdays || 0,
                            present_days: joinedInfo?.astC_AttendedDays || actualData.studentList1?.[0]?.Attendance || actualData.totalpresentdays || 0,

                            // Other Details
                            scholarship: joinedInfo?.astC_Scholarship || '',
                            electives_stud: electiveSub || joinedInfo?.astC_ElectivesStudied || '',
                            language_stud: langSub || joinedInfo?.astC_LanguageStudied || '',
                            extracurricular: joinedInfo?.astC_ExtraActivities || '',
                            subjects_stud: subjects || joinedInfo?.astC_SubjectsStudied || '',
                            games_played: joinedInfo?.astC_ExtraActivities || '', // Mapping extra activities to games played as fallback or check specific field

                            // New UI Fields
                            caste: studentInfo.imc_castename || '',
                            mediumOfInstruction: joinedInfo?.astC_MediumOfINStruction || '',

                            // Flags
                            Promotion_Flag: joinedInfo?.astC_Qual_PromotionFlag || 'qualified',
                            Fee_Due_Flag: joinedInfo?.astC_FeePaid || 'yes',
                            Medically_Exam_Flag: joinedInfo?.astC_MedicallyExam || 'no',
                            qual_class: joinedInfo?.astC_Qual_Class || '',
                            // Personal Details (Mapping from studentInfo)
                            dob: studentInfo.amst_dob ? new Date(studentInfo.amst_dob).toISOString().split('T')[0] : '',
                            dob_words: studentInfo.amst_dob_words || '',
                            bank_ifsc: studentInfo.amst_stubankifsc_code || '',
                            birth_place: studentInfo.amst_birthplace || '',
                            birth_cert_no: studentInfo.amst_birthcertno || '',
                            caste_cert_no: studentInfo.amst_stucastecertino || '',
                            age: studentInfo.pasr_age || 0,
                            gender: studentInfo.amst_sex || '',
                            mother_tongue: studentInfo.amst_mothertongue || '',
                            nationality: studentInfo.amst_nationality || '',
                            mobile: studentInfo.amst_mobileno || '',
                            email: studentInfo.amst_emailid || '',
                            aadhar_no: studentInfo.amst_aadharno || '',
                            blood_group: studentInfo.amst_bloodgroup || '',
                            bank_ac_no: studentInfo.amst_stubankaccno || '',
                            bpl_card_no: studentInfo.amst_bplcardno || '',

                            // Other Details (New sections)
                            fee_concession: joinedInfo?.astC_FeeConcession || 'General',
                            last_exam_details: joinedInfo?.astC_LastExamDetails || '',
                            result: joinedInfo?.astC_Result || '',
                            failed_details: joinedInfo?.astC_FailedDetails || '',
                            ncc_cadet: joinedInfo?.astC_NCC || 'No'
                        }));
                    }
                } else {
                    toast.error('No details found for the selected student.');
                }
            },
            onError: (err) => {
                console.error(err);
                toast.error('Failed to fetch student details');
            }
        });
    };

    const handleReset = () => {
        setAsmayId('');
        setSearchType('all');
        setStudentStatus('active');
        setIsTemporaryTC(false);
        setSearchOrder('admno_name');
        setStudentListId('');
        setData([]);
        setSelectedStudent(null);
        setSelectedStudentDetails(null);
        setActiveTab('student-details');
        setMaxEnabledTabIndex(0);
    };

    // Parsing Qualified Class if it contains text like "Granted to Class X"
    useEffect(() => {
        if (formData.qual_class && formData.qual_class.includes('Granted to Class')) {
            const parsed = formData.qual_class.replace('Granted to Class', '').trim();
            // Check if this parsed class exists in the dropdown options
            // If strictly needed to match ID, we might need more logic, but for now we set the string
            // Assuming the simple string match works for the Select value
            if (parsed !== formData.qual_class) {
                setFormData((prev) => ({ ...prev, qual_class: parsed }));
            }
        }
    }, [formData.qual_class]);

    // Sync TC Config from studentListRaw (getstudenttcdata) or studentNameData
    useEffect(() => {
        const config = responseData?.admTransNumSetting?.[0] || responseData?.admissioncongigurationList?.[0] || responseData?.transnumconfigsettings?.[0]
            || studentNameData?.admTransNumSetting?.[0] || studentNameData?.admissioncongigurationList?.[0] || studentNameData?.transnumconfigsettings?.[0];
        if (config) {
            setTcConfig(config);
        }
    }, [responseData, studentNameData]);

    // Validation for Next Button
    const validateTab = (tabValue: string) => {
        const isAutoTC = tcConfig?.imN_AutoManualFlag?.toLowerCase() === 'auto';

        if (tabValue === 'student-details') {
            if (!formData.last_class) {
            }
            return true;
        }

        if (tabValue === 'tc-details') {
            if (!isAutoTC && !formData.tc_no) {
                toast.error('TC Number is required');
                return false;
            }
            if (!formData.reason) {
                toast.error('Reason for leaving is required');
                return false;
            }
            if (!formData.app_date || !formData.tc_date || !formData.last_date_attendance || !formData.left_date) {
                toast.error('All dates in TC Details are required');
                return false;
            }
            return true;
        }

        if (tabValue === 'personal-details') {
            // No mandatory fields strictly enforced here by user yet
            return true;
        }

        if (tabValue === 'other-details') {
            if (!formData.conduct) {
                toast.error('Conduct / Character is required');
                return false;
            }
            if (formData.Promotion_Flag === 'qualified' && !formData.qual_class) {
                toast.error('Qualified for which class is required');
                return false;
            }
            return true;
        }

        return true;
    };

    const handleNext = () => {
        const currentIndex = TABS.indexOf(activeTab);
        if (currentIndex < TABS.length - 1) {
            if (validateTab(activeTab)) {
                const nextTab = TABS[currentIndex + 1];
                setMaxEnabledTabIndex((prev) => Math.max(prev, currentIndex + 1));
                setActiveTab(nextTab);
            }
        }
    };

    const handlePrevious = () => {
        const currentIndex = TABS.indexOf(activeTab);
        if (currentIndex > 0) {
            setActiveTab(TABS[currentIndex - 1]);
        }
    };

    const handleSave = () => {
        const isAutoTC = tcConfig?.imN_AutoManualFlag?.toLowerCase() === 'auto';

        if (
            (!isAutoTC && !formData.tc_no) ||
            !formData.reason ||
            !formData.app_date ||
            !formData.tc_date ||
            !formData.last_date_attendance ||
            !formData.left_date
        ) {
            toast.error('Please fill all required fields in TC Details tab');
            setActiveTab('tc-details');
            return;
        }

        const payload = {
            amst_Id: selectedStudent?.id,
            asmaY_Id: Number(asmayId),
            asmcL_Id: selectedStudent?.classId,
            asmS_Id: selectedStudent?.sectionId,
            astC_ActiveFlag: studentStatus === 'left' ? 'L' : 'S',
            astC_TemporaryFlag: isTemporaryTC ? 1 : 0,
            astC_TCNO: formData.tc_no,
            astC_LeavingReason: formData.reason,
            astC_TCDate: formData.tc_date,
            astC_LastAttendedDate: formData.last_date_attendance,
            astC_WorkingDays: formData.working_days,
            astC_AttendedDays: formData.present_days,
            astC_PromotionDate: formData.promotion_date,
            astC_MediumOfINStruction: formData.mediumOfInstruction,
            astC_LanguageStudied: formData.language_stud,
            astC_ElectivesStudied: formData.electives_stud,
            astC_Scholarship: formData.scholarship,
            astC_MedicallyExam:
                formData.Medically_Exam_Flag === 'yes'
                    ? 'Fit'
                    : formData.Medically_Exam_Flag === 'no'
                        ? 'Unfit'
                        : formData.Medically_Exam_Flag,
            astC_NCCDetails: formData.ncc_cadet === 'yes' ? 'Yes' : 'No',
            astC_ExtraActivities: formData.extracurricular,
            astC_Conduct: formData.conduct,
            astC_Remarks: formData.remarks,
            astC_FeePaid: formData.Fee_Due_Flag === 'yes' ? 'Yes' : 'No',
            astC_FeeConcession: formData.fee_concession,
            astC_LastExamDetails: formData.last_exam_details,
            astC_Result: formData.result,
            astC_ResultDetails: formData.result,
            astC_Qual_Class: formData.qual_class,
            astC_Qual_PromotionFlag: formData.Promotion_Flag === 'qualified' ? 'Y' : 'N',
            astC_TCApplicationDate: formData.app_date,
            astC_TCIssueDate: formData.tc_date,
            astC_SubjectsStudied: formData.subjects_stud,
            last_Class_Studied: formData.last_class,
            returnval: true,
            email_flag: 'Yes',
            admTransNumSetting: tcConfig || { imN_AutoManualFlag: 'Manual' },
            transnumconfigsettings: tcConfig || { imN_AutoManualFlag: 'Manual' }
        };

        saveMutation.mutate(payload, {
            onSuccess: (response: any) => {
                const actualResponse =
                    response?.success !== undefined || response?.returnval !== undefined ? response : response?.data || response;

                if (actualResponse?.success || actualResponse?.returnval) {
                    Swal.fire({
                        title: 'Success!',
                        text: actualResponse?.message || 'Student TC details saved successfully.',
                        icon: 'success'
                    });
                    handleReset();
                } else {
                    toast.error(actualResponse?.message || 'Failed to save TC details');
                }
            },
            onError: () => {
                toast.error('An error occurred while saving.');
            }
        });
    };

    const handleCheckDuplicateTC = (tcNo: string) => {
        if (!tcNo || !asmayId) return;

        duplicateCheckMutation.mutate(
            {
                asmayId: Number(asmayId),
                tcNo: tcNo
            },
            {
                onSuccess: (response: any) => {
                    if (response?.data?.tcnoduplicate > 0) {
                        Swal.fire({
                            title: 'Duplicate TC Number',
                            text: `The TC Number "${tcNo}" already exists. Please enter a different number.`,
                            icon: 'warning'
                        });
                        setFormData((prev: any) => ({ ...prev, tc_no: '' }));
                    }
                },
                onError: (error: any) => {
                    console.error('Duplicate check error:', error);
                }
            }
        );
    };

    const tableProps = {
        data: data,
        totalItems: data.length,
        isLoading: false, // searchMutation removed
        error: null,
        success: true
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <CollapsibleSection title='STUDENT TC' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                        {/* Left Side Group */}
                        <div className='space-y-6 p-4'>
                            {/* Search Type Radio */}
                            <div className='mb-6 flex justify-center'>
                                <RadioGroup value={searchType} onValueChange={setSearchType} className='flex items-center gap-8'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='all' id='st-all' />
                                        <Label htmlFor='st-all' className='font-medium'>
                                            All
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='individual' id='st-individual' />
                                        <Label htmlFor='st-individual' className='font-medium'>
                                            Individual
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Academic Year */}
                            <div className='grid grid-cols-1 items-center gap-2 md:grid-cols-[140px_1fr] md:gap-4'>
                                <Label
                                    htmlFor='academic-year-select'
                                    className='text-left font-medium text-indigo-900 text-sm md:text-right'>
                                    Academic Year:<span className='text-red-500'>*</span>
                                </Label>
                                <Select value={asmayId} onValueChange={setAsmayId}>
                                    <SelectTrigger id='academic-year-select' className='border-indigo-200'>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYearLoading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading...
                                            </SelectItem>
                                        ) : (
                                            (academicList.length > 0 ? academicList : academicYears?.data || []).map((item: any) => (
                                                <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                    {item.asmaY_Year}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Student Search Combobox */}
                            <div className='grid grid-cols-1 items-center gap-2 md:grid-cols-[140px_1fr] md:gap-4'>
                                <Label className='text-left font-medium text-indigo-900 text-sm md:text-right'>
                                    Student Name:<span className='text-red-500'>*</span>
                                </Label>
                                <Popover open={openStudentSelect} onOpenChange={setOpenStudentSelect}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            role='combobox'
                                            aria-expanded={openStudentSelect}
                                            className='w-full justify-between border-indigo-200'
                                            disabled={!asmayId}>
                                            {selectedStudent
                                                ? `${selectedStudent.studentName} (${selectedStudent.admNo})`
                                                : 'Select or search Student in the list...'}
                                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-[400px] p-0'>
                                        <Command shouldFilter={false}>
                                            <CommandInput
                                                placeholder='Search student...'
                                                value={searchText}
                                                onValueChange={setSearchText}
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    {searchText.length === 0 ? 'Please type to search student...' : 'No student found.'}
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {studentList?.map((student: any, index: number) => {
                                                        const displayName = student.amsT_FirstName || student.studentName;
                                                        const displayAdmNo = student.amsT_AdmNo || '';
                                                        const fullLabel = student.amsT_FirstName
                                                            ? student.amsT_FirstName
                                                            : `${student.studentName} ${displayAdmNo}`;

                                                        return (
                                                            <CommandItem
                                                                key={`${student.amsT_Id}-${index}`}
                                                                value={fullLabel}
                                                                onSelect={() => {
                                                                    const mappedStudent: IStudentSearch = {
                                                                        id: student.amsT_Id,
                                                                        admNo: displayAdmNo,
                                                                        studentName: displayName,
                                                                        class: student.asmcL_ClassName || '',
                                                                        section: student.asmS_SectionName || '',
                                                                        classId: student.asmcL_Id,
                                                                        sectionId: student.asmS_Id
                                                                    };
                                                                    handleSelect(mappedStudent);
                                                                    setOpenStudentSelect(false);
                                                                }}>
                                                                <Check
                                                                    className={cn(
                                                                        'mr-2 h-4 w-4',
                                                                        selectedStudent?.id === student.amsT_Id
                                                                            ? 'opacity-100'
                                                                            : 'opacity-0'
                                                                    )}
                                                                />
                                                                {fullLabel}
                                                            </CommandItem>
                                                        );
                                                    })}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Right Side Group (Student Selection Box) */}
                        <div className='overflow-hidden rounded-md border border-[#2b589f] shadow-sm'>
                            <div className='bg-[#2b589f] px-4 py-2 font-medium text-white'>Student Selection</div>
                            <div className='space-y-4 bg-white p-4'>
                                {/* Student Status Radio */}
                                <div className='space-y-2'>
                                    <RadioGroup
                                        value={studentStatus}
                                        onValueChange={setStudentStatus}
                                        className='flex flex-wrap items-center gap-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='active' id='ss-active' />
                                            <Label htmlFor='ss-active'>Active</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='left' id='ss-left' />
                                            <Label htmlFor='ss-left'>Left</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='deactive' id='ss-deactive' />
                                            <Label htmlFor='ss-deactive'>Deactive</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='temporary' id='ss-temporary' />
                                            <Label htmlFor='ss-temporary'>Temporary Students</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div className='my-2 border-t' />

                                {/* Temporary TC Checkbox */}
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='temp-tc'
                                        checked={isTemporaryTC}
                                        onCheckedChange={(checked) => setIsTemporaryTC(checked as boolean)}
                                    />
                                    <Label htmlFor='temp-tc' className='font-medium'>
                                        Temporary TC
                                    </Label>
                                </div>

                                <div className='my-2 border-t' />

                                {/* Search Order Radio */}
                                <div className='space-y-2'>
                                    <RadioGroup value={searchOrder} onValueChange={setSearchOrder} className='flex items-center gap-6'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='admno_name' id='so-adm' />
                                            <Label htmlFor='so-adm'>Adm. No : Name</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='name_admno' id='so-name' />
                                            <Label htmlFor='so-name'>Name : Adm. No</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='mt-6 flex justify-center gap-4'>
                        {/* Search button removed - now using Student Name combobox */}
                        {/* <Button
                            onClick={handleSearch}
                            disabled={searchMutation.isPending}
                            className='min-w-[120px] bg-indigo-600 px-8 text-white hover:bg-indigo-700'>
                            {searchMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className='mr-2 h-4 w-4' />} Search
                        </Button> */}
                        <Button onClick={handleReset} variant='outline' className='min-w-[120px]'>
                            <XCircle className='mr-2 h-4 w-4' /> Reset
                        </Button>
                    </div>
                </CollapsibleSection>

                {/* Generated TC List */}
                {generatedTCList.length > 0 && !selectedStudent && (
                    <CollapsibleSection title='Generated TC List' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                        <GenericDataTable<IGeneratedTC>
                            data={generatedTCList}
                            totalItems={generatedTCList.length}
                            isLoading={false}
                            columns={generatedTCColumns}
                            success={true}
                            error={null}
                            showViewOptions={false}
                            loadingMessage='Loading Generated TCs...'
                        />
                    </CollapsibleSection>
                )}

                {/* Deleted TC List */}
                {deletedTCList.length > 0 && !selectedStudent && (
                    <CollapsibleSection
                        title='Cancelled / Deleted TC List'
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg'>
                        <GenericDataTable<IDeletedTC>
                            data={deletedTCList}
                            totalItems={deletedTCList.length}
                            isLoading={false}
                            columns={deletedTCColumns}
                            success={true}
                            error={null}
                            showViewOptions={false}
                            loadingMessage='Loading Deleted TCs...'
                        />
                    </CollapsibleSection>
                )}

                {data.length > 0 && !selectedStudent && (
                    <CollapsibleSection title='Search Results' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                        <GenericDataTable<IStudentSearch>
                            {...tableProps}
                            columns={studentSearchColumns(handleSelect)}
                            isLoading={false} // searchMutation removed
                            showViewOptions={false}
                            loadingMessage='Searching...'
                        />
                    </CollapsibleSection>
                )}

                {selectedStudent && (
                    <CollapsibleSection
                        title={`TC Application: ${selectedStudent.studentName} (${selectedStudent.admNo})`}
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='pb-6 shadow-lg'>
                        {selectedStudentDetails && selectedStudentDetails.studentList && (
                            <div className='mb-4'>
                                <StudentHeaderSummary student={selectedStudentDetails.studentList[0]} />
                            </div>
                        )}

                        <Tabs
                            value={activeTab}
                            onValueChange={(val) => {
                                const idx = TABS.indexOf(val);
                                if (idx <= maxEnabledTabIndex) {
                                    setActiveTab(val);
                                }
                            }}
                            className='w-full'>
                            <TabsList className='grid w-full grid-cols-5 bg-muted/30 p-1'>
                                {TABS.map((tab, idx) => (
                                    <TabsTrigger
                                        key={tab}
                                        value={tab}
                                        disabled={idx > maxEnabledTabIndex}
                                        className='data-[state=active]:bg-indigo-600 data-[state=active]:text-white'>
                                        {tab
                                            .split('-')
                                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                            .join(' ')}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            <div className='mt-4 min-h-[400px] rounded-lg border bg-muted/5 p-2'>
                                <TabsContent value='student-details'>
                                    {detailsMutation.isPending ? (
                                        <div className='flex h-60 items-center justify-center'>
                                            <Loader2 className='h-10 w-10 animate-spin text-indigo-600' />
                                        </div>
                                    ) : (
                                        <StudentDetailsTab formData={formData} setFormData={setFormData} disabled={isBlocked} />
                                    )}
                                </TabsContent>
                                <TabsContent value='tc-details'>
                                    <TCDetailsTab
                                        formData={formData}
                                        setFormData={setFormData}
                                        initialData={selectedStudentDetails} // Keep this as is, mapping logic handles it
                                        onCheckDuplicate={handleCheckDuplicateTC}
                                        tcConfig={tcConfig}
                                        disabled={isBlocked}
                                    />
                                </TabsContent>
                                <TabsContent value='personal-details'>
                                    <StudentPersonalDetailsTab formData={formData} setFormData={setFormData} disabled={isBlocked} />
                                </TabsContent>
                                <TabsContent value='other-details'>
                                    <OtherDetailsTab
                                        formData={formData}
                                        setFormData={setFormData}
                                        initialData={{ ...selectedStudentDetails, classlistnew: studentNameData?.classlistnew }}
                                        disabled={isBlocked}
                                    />
                                </TabsContent>
                                <TabsContent value='due-details'>
                                    <DueDetailsTab data={selectedStudentDetails} disabled={isBlocked} />
                                </TabsContent>
                            </div>

                            <div className='mt-6 flex items-center justify-between border-t px-4 pt-4'>
                                <Button
                                    variant='ghost'
                                    className='text-red-600 hover:bg-red-50 hover:text-red-700'
                                    onClick={() => {
                                        setSelectedStudent(null);
                                        setMaxEnabledTabIndex(0);
                                        setActiveTab('student-details');
                                    }}>
                                    <XCircle className='mr-2 h-4 w-4' /> Cancel Selection
                                </Button>
                                <div className='flex gap-4'>
                                    <Button variant='outline' disabled={activeTab === 'student-details'} onClick={handlePrevious}>
                                        <ChevronLeft className='mr-2 h-4 w-4' /> Previous
                                    </Button>

                                    {activeTab !== 'due-details' ? (
                                        <Button
                                            variant='outline'
                                            className='border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                            onClick={handleNext}>
                                            Next <ChevronRight className='ml-2 h-4 w-4' />
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                onClick={handleSave}
                                                disabled={saveMutation.isPending}
                                                className='min-w-[140px] bg-green-600 text-white hover:bg-green-700'>
                                                {saveMutation.isPending ? (
                                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                ) : (
                                                    <Save className='mr-2 h-4 w-4' />
                                                )}{' '}
                                                Save Application
                                            </Button>
                                            <Button variant='secondary' onClick={() => setOpenPreview(true)} className='min-w-[100px]'>
                                                Preview
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Tabs>

                        {/* Preview Modal */}
                        {openPreview && (
                            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
                                <div className='max-h-[80vh] w-[800px] overflow-y-auto rounded-lg bg-white p-6 shadow-xl'>
                                    <div className='mb-4 flex items-center justify-between border-b pb-2'>
                                        <h2 className='font-bold text-xl'>Student TC Details - Preview</h2>
                                        <Button variant='ghost' size='icon' onClick={() => setOpenPreview(false)}>
                                            <XCircle className='h-5 w-5' />
                                        </Button>
                                    </div>
                                    <div className='grid grid-cols-2 gap-4 text-sm'>
                                        {/* Row 1 */}
                                        <div className='font-semibold'>Current Class:</div>
                                        <div>{selectedStudent?.class || formData.last_class}</div>
                                        <div className='font-semibold'>TC No.:</div>
                                        <div>{formData.tc_no}</div>

                                        {/* Row 2 */}
                                        <div className='font-semibold'>Section:</div>
                                        <div>{selectedStudent?.section}</div>
                                        <div className='font-semibold'>TC Application Date:</div>
                                        <div>{formData.app_date}</div>

                                        {/* Row 3 */}
                                        <div className='font-semibold'>Father Name:</div>
                                        <div>{selectedStudentDetails?.studentListById?.[0]?.father || '-'}</div>
                                        <div className='font-semibold'>Leaving Reason:</div>
                                        <div>{formData.reason}</div>

                                        {/* Row 4 */}
                                        <div className='font-semibold'>Category:</div>
                                        <div>{selectedStudentDetails?.studentListById?.[0]?.AMC_Name || '-'}</div>
                                        <div className='font-semibold'>TC Date:</div>
                                        <div>{formData.tc_date}</div>

                                        {/* Row 5 */}
                                        <div className='font-semibold'>Admission Academic Year:</div>
                                        <div>{formData.academic_year_join}</div>
                                        <div className='font-semibold'>Last Date Of Attendance:</div>
                                        <div>{formData.last_date_attendance}</div>

                                        {/* Row 6 */}
                                        <div className='font-semibold'>Registration No.:</div>
                                        <div>{selectedStudentDetails?.studentListById?.[0]?.AMST_RegistrationNo || '-'}</div>
                                        <div className='font-semibold'>No. Of School Days:</div>
                                        <div>{formData.working_days}</div>

                                        {/* Row 7 */}
                                        <div className='font-semibold'>Date Of Admission:</div>
                                        <div>
                                            {selectedStudentDetails?.studentListById?.[0]?.AMST_Date
                                                ? new Date(selectedStudentDetails.studentListById[0].AMST_Date).toLocaleDateString()
                                                : '-'}
                                        </div>
                                        <div className='font-semibold'>No. Of Attended Days:</div>
                                        <div>{formData.present_days}</div>

                                        {/* Row 8 */}
                                        <div className='font-semibold'>Date Of Promotion:</div>
                                        <div>{formData.promotion_date}</div>
                                        <div className='font-semibold'>Qualified for which class:</div>
                                        <div>{formData.qual_class}</div>

                                        {/* Row 9 */}
                                        <div className='font-semibold'>Last Class Studied:</div>
                                        <div>{formData.last_class}</div>
                                        <div className='font-semibold'>Conduct / Character:</div>
                                        <div>{formData.conduct}</div>

                                        {/* Row 10 */}
                                        <div className='font-semibold'>Caste:</div>
                                        <div>{selectedStudentDetails?.studentListById?.[0]?.IMC_CasteName || '-'}</div>
                                        <div className='font-semibold'>Fee Due:</div>
                                        <div>{selectedStudentDetails?.studentListById?.[0]?.feetobepaid || 0}</div>
                                    </div>
                                    <div className='mt-6 flex justify-end'>
                                        <Button onClick={() => setOpenPreview(false)}>Close</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
