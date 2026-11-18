'use client';
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    CreditCard,
    Eye,
    FileText,
    HeartPulse,
    History,
    Info,
    LayoutDashboard,
    Loader2,
    MapPin,
    MessageSquare,
    Plus,
    Save,
    School,
    Search,
    ShieldAlert,
    Trash2,
    Trophy,
    Upload,
    User,
    Users,
    Wallet
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

import {
    useSophiaRegistrationXICaste,
    useSophiaRegistrationXIClassChange,
    useSophiaRegistrationXIClassMaxMinAge,
    useSophiaRegistrationXIDelete,
    useSophiaRegistrationXIDistricts,
    useSophiaRegistrationXIInitialData,
    useSophiaRegistrationXISave,
    useSophiaRegistrationXIStates,
    useSophiaRegistrationXIStreams,
    useSophiaRegistrationXISubjects,
    useSophiaRegistrationXIToggleStatus
} from '@/hooks/admission/preadmission/transactions/useSophiaRegistrationXI';
import { useAdmissionFormDetails } from '@/hooks/admission/admissionForm';
import { useActivePreadmissionDetails, useReligionDropdown } from '@/hooks/admission/preadmission/useTransactions';
import { useAcademicYearDropdown, useMasterCasteCategory, useMasterCasteCategoryDropdown, useMasterReligion } from '@/hooks/admission/preadmission/useMasters';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export default function SophiaRegistrationXI() {
    /* -------------------- Styles -------------------- */
    const legacyStyles = `
        .img-style { width: 110px; height: 100px; border: 1px solid #ddd; float: right; }
        .table-particulars { margin-bottom: 0 !important; }
        .table-main { margin-top: 0 !important; }
        .table-particulars th { border-bottom: 0 !important; }
        .table-main thead th { border-top: 0 !important; }
        .icon-disabled { pointer-events: none; opacity: 0.5; cursor: default; }
        .office-use-box { width: 400px; margin: auto; border: 1px solid #000; padding: 10px; }
        .info-row1 { margin-bottom: 8px; }
        .row-container1 { display: inline-flex; align-items: flex-start; width: 100%; }
        .info-label1 { display: inline-block; width: 350px; text-align: left; vertical-align: top; font-weight: 600; }
        .info-value1 { display: inline-block; text-align: left; word-break: break-word; max-width: calc(100% - 350px); }
        .inlineTable1 { display: inline-block; float: left; width: 30% !important; padding-top: 15px !important; }
        .inlineTable2 { display: inline-block; float: left; width: 48% !important; padding-top: 10px !important; }
        .inlineTable3 { display: inline-block; float: right; width: 21% !important; }
        .abcd { opacity: 1 !important; }
        .razorpaybtn {
            height: 37px; color: rgba(255,255,255,0.87); background-color: rgb(63,81,181);
            box-shadow: 0 2px 5px 0 rgba(0,0,0,.26); text-decoration: none; border-radius: 3px;
            box-sizing: border-box; outline: 0; border: 0; display: inline-block;
            align-items: center; padding: 0 6px; margin: 6px 8px; line-height: 36px;
            min-height: 30px; min-width: 88px; text-align: center; text-transform: uppercase;
            font-weight: 500; font-size: 14px; cursor: pointer;
        }
        .roundedCorner {
            width: 350px; height: 200px; border-radius: 25px;
            box-shadow: 0 0 4px 5px rgba(148, 139, 139, 0.6);
        }
        .children-table-container { display: flex; justify-content: flex-start; width: 100%; padding-left: 32%; }
        .children-table { width: 60%; border-collapse: collapse; border: 1px solid #ccc; font-family: Arial, sans-serif; font-size: 14px; }
        .children-table th, .children-table td { border: 1px solid #ccc; padding: 6px 10px; text-align: center; }
        .children-table th { background-color: #f7f7f7; font-weight: normal; }
    `;

    /* -------------------- State -------------------- */
    const [activeTab, setActiveTab] = useState('entry');
    const [view, setView] = useState<'form' | 'payment'>('form');

    const [reg, setReg] = useState<any>({
        ASMAY_Id: 0,
        PASR_FirstName: '',
        PASR_MiddleName: '',
        PASR_LastName: '',
        PASR_MobileNo: '',
        PASR_emailId: '',
        PASR_DOB: null,
        PASR_Sex: 'Male',
        ASMCL_Id: 575, // Default Class XI
        PASR_Nationality: 0,
        Religion_Id: 0,
        IMCC_Id: 0,
        Caste_Id: 0,
        PASR_BloodGroup: '',
        PASR_MotherTongue: '',
        PASTCBAF_HallTicket: '',
        PASTCBAF_SATSNo: '',
        PASTCBAF_PENNo: '',
        PASTCBAF_BoardExam: '',
        PASTCBAF_BoardPassYear: '',
        PASTCBAF_ExistingSchool: 'NO',
        PASTCBAF_FatherExStudentFlg: '0',
        ASMST_Id: 0,
        ASMCE_Id: 0,

        // Residential Address
        PASR_ConStreet: '',
        PASR_ConArea: '',
        PASR_ConCountry: 0,
        PASR_ConState: 0,
        PASR_ConCity: '',
        PASR_ConPincode: '',

        // Permanent Address
        PASR_PerStreet: '',
        PASR_PerArea: '',
        PASR_PerCountry: 0,
        PASR_PerState: 0,
        PASR_PerCity: '',
        PASR_PerPincode: '',
        chkbox_address: 0,

        // Father's Details
        PASR_FatherName: '',
        PASR_FatherSurname: '',
        PASR_FatherMobleNo: '',
        PASR_FatheremailId: '',
        PASR_FatherReligion: 0,
        PASA_FatherMotherTongue: '',
        PASR_FatherEducation: '',
        PASA_FatherInstitution: '',
        PASR_FatherOccupation: '',
        PASA_FatherBusiness: '',
        PASA_FatherCompany: '',
        PASR_FatherOfficeAddr: '',
        PASR_FatherDesignation: '',
        PASR_FatherMonIncome: '',
        PASR_FatherPhoto: '',

        // Mother's Details
        PASR_MotherName: '',
        PASR_MotherSurname: '',
        PASR_MotherMobleNo: '',
        PASR_MotheremailId: '',
        PASR_MotherReligion: 0,
        PASA_MotherMotherTongue: '',
        PASR_MotherEducation: '',
        PASA_MotherInstitution: '',
        PASR_MotherOccupation: '',
        PASA_MotherBusiness: '',
        PASA_MotherCompany: '',
        PASR_MotherOfficeAddr: '',
        PASR_MotherDesignation: '',
        PASR_MotherMonIncome: '',
        PASR_MotherPhoto: '',

        PASR_Student_Pic_Path: '',

        // Other Details
        PASTCBAF_ExtraActivities: '',
        PASTCBAF_SchoolCompetitions: '',
        PASTCBAF_CareerGoal: '',
        PASTCBAF_CompetitiveEntanceExams: '',
        PASTCBAF_PursueClasses: '',

        // Subject Selection
        Compulsory: '',
        Option1: '',
        Option2: '',
        Option3: '',
        Option4: '',
        Option5: ''
    });

    const [siblings, setSiblings] = useState<any[]>([
        {
            pasrS_SiblingsName: '',
            pasrS_SiblingsClass: '',
            pasrS_SchoolName: '',
            pasrS_Gender: 'Female'
        }
    ]);

    const [prevSchools, setPrevSchools] = useState<any[]>([
        {
            pasrpS_PrvSchoolName: '',
            pasrpS_Address: '',
            pasrPS_TcNo: ''
        }
    ]);

    const [counts, setCounts] = useState({
        regisrertotal: 0,
        notappform: 0,
        appform: 0,
        duplicate: 0,
        pay: 0,
        notpay: 0,
        transferstu: 0
    });

    const [paymentMode, setPaymentMode] = useState<number>(1); // 1: Online, 2: Offline
    const [selectedGateway, setSelectedGateway] = useState<string>('');
    const [marksMatrix, setMarksMatrix] = useState<any>({});
    const [selectedElectives, setSelectedElectives] = useState<any>({});
    const [documentList, setDocumentList] = useState<any[]>([]);
    const [studentSearch, setStudentSearch] = useState('');

    /* -------------------- Constants -------------------- */
    const exams = [
        { id: 1, name: 'IX Standard' },
        { id: 2, name: 'X First Term Exam' },
        { id: 3, name: 'X First Pre-board' },
        { id: 4, name: 'Board Results' }
    ];

    const subjects = [
        { id: 1, name: 'English', desc: 'English' },
        { id: 2, name: 'Mathematics', desc: 'Mathematics / EVS' },
        { id: 3, name: 'Science', desc: 'Physics / Chemistry / Biology' },
        { id: 4, name: 'Social Studies', desc: 'History / Civics / Geography' },
        { id: 5, name: 'II Language', desc: 'Hindi / Kannada / French' },
        { id: 6, name: 'Sixth Subject', desc: 'Economics / Comp Sci / Art / etc.' }
    ];

    /* -------------------- Hooks -------------------- */
    const { data: initialData, isLoading: isInitialLoading, isError: isInitialError } = useSophiaRegistrationXIInitialData(0, 0);
    const { data: admissionDetails } = useAdmissionFormDetails();
    const { data: activePreadmission } = useActivePreadmissionDetails();
    const { data: academicYearDropdown } = useAcademicYearDropdown();
    const { data: religionDropdownData } = useReligionDropdown();
    const { data: masterReligionData } = useMasterReligion();
    const { data: casteCategoryDropdownData } = useMasterCasteCategoryDropdown();
    const { data: masterCasteCategoryData } = useMasterCasteCategory();

    const academicYears = useMemo(() => {
        const payload = initialData?.data as any;
        const years = Array.isArray(payload) ? payload : payload?.academicdrp ?? payload?.Items;
        if (!Array.isArray(years)) return [];

        return years.map((year: any) => ({
            ...year,
            asmaY_Id: year.asmaY_Id ?? year.ASMAY_Id,
            asmaY_Year: year.asmaY_Year ?? year.ASMAY_Year
        }));
    }, [initialData]);
    const casteMutation = useSophiaRegistrationXICaste();
    const classChangeMutation = useSophiaRegistrationXIClassChange();
    const streamsMutation = useSophiaRegistrationXIStreams();
    const subjectsMutation = useSophiaRegistrationXISubjects();
    const statesMutation = useSophiaRegistrationXIStates();
    const districtsMutation = useSophiaRegistrationXIDistricts();
    const saveMutation = useSophiaRegistrationXISave();
    const deleteMutation = useSophiaRegistrationXIDelete();
    const toggleStatusMutation = useSophiaRegistrationXIToggleStatus();
    const classMaxMinAgeMutation = useSophiaRegistrationXIClassMaxMinAge();

    /* -------------------- Memo -------------------- */
    const religions = useMemo(() => {
        const raw =
            (religionDropdownData as any)?.data ||
            (Array.isArray(religionDropdownData) ? religionDropdownData : null) ||
            (masterReligionData as any)?.data ||
            (Array.isArray(masterReligionData) ? masterReligionData : null) ||
            (admissionDetails as any)?.religions ||
            (admissionDetails as any)?.allReligion ||
            (admissionDetails as any)?.allReligionList ||
            (admissionDetails as any)?.AllReligion ||
            (initialData?.data as any)?.religiondrp ||
            (initialData as any)?.religiondrp ||
            [];
        return Array.isArray(raw) ? raw : [];
    }, [religionDropdownData, masterReligionData, admissionDetails, initialData]);

    const casteCategories = useMemo(() => {
        const raw =
            (casteCategoryDropdownData as any)?.data ||
            (Array.isArray(casteCategoryDropdownData) ? casteCategoryDropdownData : null) ||
            (masterCasteCategoryData as any)?.data ||
            (Array.isArray(masterCasteCategoryData) ? masterCasteCategoryData : null) ||
            (admissionDetails as any)?.casteCategoryes ||
            (admissionDetails as any)?.allCasteCategory ||
            (admissionDetails as any)?.vpre_allCasteCategory ||
            (admissionDetails as any)?.allCasteCategoryList ||
            (admissionDetails as any)?.AllCasteCategory ||
            (initialData?.data as any)?.castecategorydrp ||
            (initialData as any)?.castecategorydrp ||
            (initialData?.data as any)?.arrlist9 ||
            [];
        return Array.isArray(raw) ? raw : [];
    }, [casteCategoryDropdownData, masterCasteCategoryData, admissionDetails, initialData]);

    const allCastes = useMemo(() => {
        return (
            (casteMutation.data as any)?.data?.allCaste ||
            (admissionDetails as any)?.castes ||
            (admissionDetails as any)?.allCaste ||
            (admissionDetails as any)?.allCasteList ||
            []
        );
    }, [casteMutation.data, admissionDetails]);

    const castesForCategory = useMemo(() => {
        if (!reg.IMCC_Id) return allCastes;
        const filtered = allCastes.filter((c: any) => Number(c.imcC_Id || c.imCC_Id) === Number(reg.IMCC_Id));
        return filtered.length > 0 ? filtered : allCastes;
    }, [allCastes, reg.IMCC_Id]);

    const isRomanCatholic = useMemo(() => {
        const religionId = Number(reg.Religion_Id);
        const religion = religions.find((r: any) => Number(r.ivrmmR_Id || r.IVRMMR_Id || r.religion_Id) === religionId);
        const name = (religion?.ivrmmR_ReligionName || religion?.ivrmmR_Name || '').toLowerCase();
        return name.includes('roman catholic');
    }, [reg.Religion_Id, religions]);

    const activeAcademicYear = useMemo(() => {
        if (activePreadmission?.data?.asmaY_Year) return activePreadmission.data.asmaY_Year;
        if (academicYears && academicYears.length > 0) {
            const found = academicYears.find((y: any) => Number(y.asmaY_Id) === Number(reg.ASMAY_Id)) || academicYears[0];
            if (found?.asmaY_Year) return found.asmaY_Year;
        }
        const pData = (initialData as any)?.data || initialData;
        const academic = pData?.academicdrp || pData?.allAcademicYear;
        if (academic && Array.isArray(academic) && academic.length > 0) {
            const found = academic.find((y: any) => (y.asmaY_Id || y.ASMAY_Id) === reg.ASMAY_Id) || academic[0];
            return found?.asmaY_Year || found?.ASMAY_Year || '';
        }
        const dropdownList = (academicYearDropdown as any)?.data || (Array.isArray(academicYearDropdown) ? academicYearDropdown : null);
        if (dropdownList && Array.isArray(dropdownList) && dropdownList.length > 0) {
            const found = dropdownList.find((y: any) => (y.asmaY_Id || y.ASMAY_Id) === reg.ASMAY_Id) || dropdownList[0];
            return found?.asmaY_Year || found?.ASMAY_Year || '';
        }
        return (admissionDetails as any)?.allAcademicYear?.[0]?.asmaY_Year || '';
    }, [activePreadmission, academicYears, initialData, reg.ASMAY_Id, academicYearDropdown, admissionDetails]);

    /* -------------------- Effects -------------------- */
    useEffect(() => {
        if (initialData) {
            const pData = (initialData as any)?.data || initialData;
            const docs = pData?.documentList || pData?.DocumentList;
            if (docs && Array.isArray(docs)) {
                setDocumentList(docs.map((d: any) => ({ ...d, document_Path: '' })));
            }
            if (academicYears.length > 0) {
                const activeYear =
                    academicYears.find((y: any) => Number(y.asmaY_Id) === Number(pData.asmaY_Id ?? pData.ASMAY_Id)) || academicYears[0];
                if (activeYear?.asmaY_Id) {
                    setReg((prev: any) => ({ ...prev, ASMAY_Id: activeYear.asmaY_Id }));
                }
            } else if (pData?.academicdrp?.length > 0) {
                const activeYear = pData.academicdrp.find((y: any) => y.asmaY_Id === pData.asmaY_Id) || pData.academicdrp[0];
                const yearId = activeYear?.asmaY_Id || activeYear?.ASMAY_Id;
                if (yearId) {
                    setReg((prev: any) => ({ ...prev, ASMAY_Id: yearId }));
                }
            }

            // Set counts
            setCounts({
                regisrertotal: pData?.regisrertotal || 0,
                notappform: pData?.notappform || 0,
                appform: pData?.appform || 0,
                duplicate: pData?.duplicate || 0,
                pay: pData?.pay || 0,
                notpay: pData?.notpay || 0,
                transferstu: pData?.transferstu || 0
            });
        }
    }, [initialData, academicYears]);

    useEffect(() => {
        const yearId =
            activePreadmission?.data?.asmaY_Id ||
            (academicYearDropdown as any)?.data?.[0]?.asmaY_Id;
        if (yearId && (!reg.ASMAY_Id || reg.ASMAY_Id === 0)) {
            setReg((prev: any) => ({ ...prev, ASMAY_Id: yearId }));
        }
    }, [activePreadmission, academicYearDropdown, reg.ASMAY_Id]);

    /* -------------------- Handlers -------------------- */
    const handleInputChange = (field: string, value: any) => {
        setReg((prev: any) => ({ ...prev, [field]: value }));
    };

    const address_copy = (checked: boolean) => {
        const val = checked ? 1 : 0;
        setReg((prev: any) => {
            const update: any = { ...prev, chkbox_address: val };
            if (checked) {
                update.PASR_PerStreet = prev.PASR_ConStreet;
                update.PASR_PerArea = prev.PASR_ConArea;
                update.PASR_PerCountry = prev.PASR_ConCountry;
                update.PASR_PerState = prev.PASR_ConState;
                update.PASR_PerCity = prev.PASR_ConCity;
                update.PASR_PerPincode = prev.PASR_ConPincode;
            } else {
                update.PASR_PerStreet = '';
                update.PASR_PerArea = '';
                update.PASR_PerCountry = 0;
                update.PASR_PerState = 0;
                update.PASR_PerCity = '';
                update.PASR_PerPincode = '';
            }
            return update;
        });
    };

    const handleReligionChange = async (val: string) => {
        const id = Number(val);
        handleInputChange('Religion_Id', id);
    };

    const handleClassChange = async (val: string) => {
        const id = Number(val);
        handleInputChange('ASMCL_Id', id);
        try {
            await classMaxMinAgeMutation.mutateAsync({ ASMAY_Id: reg.ASMAY_Id, ASMCL_Id: id });
            await streamsMutation.mutateAsync(id);
        } catch (e) {
            toast.error('Failed to load class details');
        }
    };

    const handleStreamChange = async (val: string) => {
        const id = Number(val);
        handleInputChange('ASMST_Id', id);
        try {
            await subjectsMutation.mutateAsync({ ASMAY_Id: reg.ASMAY_Id, ASMCL_Id: reg.ASMCL_Id, ASMST_Id: id });
        } catch (e) {
            toast.error('Failed to load subjects');
        }
    };

    const handleCountryChange = async (type: 'per' | 'con' | 'father' | 'mother', countryId: string) => {
        const id = Number(countryId);
        const fieldName = type === 'con' ? 'PASR_ConCountry' : type === 'per' ? 'PASR_PerCountry' : '';
        if (fieldName) {
            setReg((prev: any) => ({ ...prev, [fieldName]: id }));
            try {
                await statesMutation.mutateAsync(id);
            } catch (e) {
                toast.error('Failed to load states');
            }
        }
    };

    const handleCasteCategoryChange = async (val: string) => {
        const id = Number(val);
        handleInputChange('IMCC_Id', id);
        try {
            await casteMutation.mutateAsync(id);
        } catch (e) {
            toast.error('Failed to load castes');
        }
    };

    const handleAddSibling = () => {
        if (siblings.length < 5) {
            setSiblings((prev: any[]) => [
                ...prev,
                { pasrS_SiblingsName: '', pasrS_SiblingsClass: '', pasrS_SchoolName: '', pasrS_Gender: 'Female' }
            ]);
        }
    };

    const handleRemoveSibling = (index: number) => {
        if (siblings.length > 1) {
            const newList = [...siblings];
            newList.splice(index, 1);
            setSiblings(newList);
        }
    };

    const handleSiblingChange = (index: number, field: string, value: any) => {
        const newList = [...siblings];
        newList[index][field] = value;
        setSiblings(newList);
    };

    const handleAddSchool = () => {
        if (prevSchools.length < 5) {
            setPrevSchools((prev: any[]) => [...prev, { pasrpS_PrvSchoolName: '', pasrpS_Address: '', pasrPS_TcNo: '' }]);
        }
    };

    const handleRemoveSchool = (index: number) => {
        if (prevSchools.length > 1) {
            const newList = [...prevSchools];
            newList.splice(index, 1);
            setPrevSchools(newList);
        }
    };

    const handleSchoolChange = (index: number, field: string, value: any) => {
        const newList = [...prevSchools];
        newList[index][field] = value;
        setPrevSchools(newList);
    };

    const handleMarksChange = (examId: number, subId: number, value: string) => {
        const mark = Number.parseFloat(value);
        if (value !== '' && (isNaN(mark) || mark < 0 || mark > 100)) {
            return;
        }
        setMarksMatrix((prev: any) => ({
            ...prev,
            [examId]: {
                ...(prev[examId] || {}),
                [subId]: value
            }
        }));
    };

    const calculateTotalMarks = (examId: number) => {
        const examMarks = marksMatrix[examId] || {};
        let total = 0;
        let hasValue = false;
        Object.values(examMarks).forEach((v: any) => {
            const m = Number.parseFloat(v);
            if (!isNaN(m)) {
                total += m;
                hasValue = true;
            }
        });
        return hasValue ? total : '';
    };

    const calculatePercentage = (examId: number) => {
        const total = calculateTotalMarks(examId);
        if (total === '') return '';
        const max = subjects.length * 100;
        return ((Number(total) / max) * 100).toFixed(2);
    };

    const handleSave = async () => {
        const payload = {
            ...reg,
            siblings: siblings.filter((s) => s.pasrS_SiblingsName),
            prevSchools: prevSchools.filter((s) => s.pasrpS_PrvSchoolName),
            marksMatrix: marksMatrix,
            selectedElectives: selectedElectives,
            documents: documentList.filter((d) => d.document_Path)
        };

        try {
            const res: any = await saveMutation.mutateAsync(payload);
            if (res?.data?.returnval === true) {
                Swal.fire('Saved!', 'Registration submitted successfully.', 'success');
                // Potential reset logic
            } else {
                toast.error(res?.data?.message || 'Failed to save registration');
            }
        } catch (e) {
            toast.error('Internal server error');
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await deleteMutation.mutateAsync(id);
                Swal.fire('Deleted!', 'Record has been deleted.', 'success');
            } catch (e) {
                toast.error('Failed to delete');
            }
        }
    };

    /* -------------------- UI -------------------- */
    const registrationList = useMemo(() => {
        const list = (initialData?.data as any)?.registrationList || [];
        return list.filter((r: any) => r.asmcL_Id === 575); // Filter for XI as per legacy
    }, [initialData]);

    const filteredList = useMemo(() => {
        if (!studentSearch) return registrationList;
        return registrationList.filter(
            (r: any) =>
                r.pasR_FirstName?.toLowerCase().includes(studentSearch.toLowerCase()) ||
                r.pasR_RegistrationNo?.toLowerCase().includes(studentSearch.toLowerCase())
        );
    }, [registrationList, studentSearch]);

    return (
        <div className='min-h-screen space-y-6 bg-slate-50/50 p-6'>
            <style dangerouslySetInnerHTML={{ __html: legacyStyles }} />

            <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                    <h1 className='flex items-center gap-2 font-bold text-2xl text-slate-800 tracking-tight'>
                        <Users className='h-7 w-7 text-indigo-600' />
                        Sophia Registration (Class XI)
                    </h1>
                    <p className='text-slate-500 text-sm'>
                        Manage student registrations and academic records for higher secondary admission.
                    </p>
                </div>
                <div className='flex items-center gap-3'>
                    <Badge variant='outline' className='border-indigo-200 bg-indigo-50 px-3 py-1 font-medium text-indigo-700 text-sm'>
                        Academic Year:{' '}
                        {(() => {
                            if (isInitialLoading) return 'Loading...';
                            if (isInitialError) return 'Failed to load';
                            if (activeAcademicYear) return activeAcademicYear;
                            if (academicYears.length === 0) return 'No academic year available';
                            return (
                                academicYears.find((y: any) => Number(y.asmaY_Id) === Number(reg.ASMAY_Id))?.asmaY_Year ||
                                academicYears[0]?.asmaY_Year ||
                                'No academic year available'
                            );
                        })()}
                    </Badge>
                </div>
            </div>

            <div className='flex flex-wrap items-center gap-2'>
                <Badge
                    variant='outline'
                    className='flex items-center gap-2 rounded-full border-none bg-indigo-600 px-4 py-2 font-bold text-[10px] text-white'>
                    REGISTERED <span className='rounded-full bg-white px-2 py-0.5 text-indigo-600'>{counts.regisrertotal}</span>
                </Badge>
                <Badge
                    variant='outline'
                    className='flex items-center gap-2 rounded-full border-none bg-indigo-600 px-4 py-2 font-bold text-[10px] text-white'>
                    APPLICATION NOT FILLED <span className='rounded-full bg-white px-2 py-0.5 text-indigo-600'>{counts.notappform}</span>
                </Badge>
                <Badge
                    variant='outline'
                    className='flex items-center gap-2 rounded-full border-none bg-indigo-600 px-4 py-2 font-bold text-[10px] text-white'>
                    APPLICATION FILLED{' '}
                    <span className='rounded-full bg-white px-2 py-0.5 text-indigo-600'>
                        {counts.appform - counts.duplicate}+{counts.duplicate}
                    </span>
                </Badge>
                <Badge
                    variant='outline'
                    className='flex items-center gap-2 rounded-full border-none bg-indigo-600 px-4 py-2 font-bold text-[10px] text-white'>
                    PAYMENT DONE <span className='rounded-full bg-white px-2 py-0.5 text-indigo-600'>{counts.pay}</span>
                </Badge>
                <Badge
                    variant='outline'
                    className='flex items-center gap-2 rounded-full border-none bg-indigo-600 px-4 py-2 font-bold text-[10px] text-white'>
                    PAYMENT NOT DONE <span className='rounded-full bg-white px-2 py-0.5 text-indigo-600'>{counts.notpay}</span>
                </Badge>
                <Badge
                    variant='outline'
                    className='flex items-center gap-2 rounded-full border-none bg-indigo-600 px-4 py-2 font-bold text-[10px] text-white'>
                    TRANSFER STUDENT <span className='rounded-full bg-white px-2 py-0.5 text-indigo-600'>{counts.transferstu}</span>
                </Badge>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
                <TabsList className='grid h-12 w-full grid-cols-2 bg-slate-200/50 p-1 lg:w-[400px]'>
                    <TabsTrigger
                        value='entry'
                        className='rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm'>
                        <FileText className='mr-2 h-4 w-4' />
                        Registration Form
                    </TabsTrigger>
                    <TabsTrigger
                        value='list'
                        className='rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm'>
                        <Search className='mr-2 h-4 w-4' />
                        View Registrations
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='entry' className='fade-in slide-in-from-bottom-2 animate-in space-y-6 duration-300'>
                    {view === 'payment' ? (
                        <div className='flex justify-center'>
                            <Card className='w-full max-w-2xl overflow-hidden rounded-2xl border-none shadow-2xl'>
                                <CardHeader className='bg-indigo-600 p-8 text-center text-white'>
                                    <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20'>
                                        <Wallet className='h-8 w-8' />
                                    </div>
                                    <CardTitle className='font-bold text-2xl'>REGISTRATION FEES PAYMENT</CardTitle>
                                    <CardDescription className='text-indigo-100'>
                                        Complete your registration by making the payment.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='space-y-6 p-8'>
                                    <div className='grid grid-cols-1 gap-4 rounded-xl border border-slate-100 bg-slate-50 p-6'>
                                        <div className='flex items-center justify-between border-slate-200 border-b pb-3'>
                                            <span className='font-medium text-slate-500'>Name of the Child</span>
                                            <span className='font-bold text-slate-800'>{reg.PASR_FirstName}</span>
                                        </div>
                                        <div className='flex items-center justify-between border-slate-200 border-b pb-3'>
                                            <span className='font-medium text-slate-500'>Mobile</span>
                                            <span className='font-bold text-slate-800'>{reg.PASR_MobileNo}</span>
                                        </div>
                                        <div className='flex items-center justify-between pb-1'>
                                            <span className='font-medium text-slate-500'>Email ID</span>
                                            <span className='font-bold text-slate-800'>{reg.PASR_emailId}</span>
                                        </div>
                                    </div>

                                    <RadioGroup
                                        value={paymentMode.toString()}
                                        onValueChange={(v) => setPaymentMode(Number(v))}
                                        className='flex justify-center gap-8 rounded-xl bg-indigo-50/50 p-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='1' id='online' />
                                            <Label htmlFor='online' className='cursor-pointer font-bold text-indigo-700'>
                                                ONLINE PAYMENT
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='2' id='offline' />
                                            <Label htmlFor='offline' className='cursor-pointer font-bold text-indigo-700'>
                                                OFFLINE PAYMENT
                                            </Label>
                                        </div>
                                    </RadioGroup>

                                    {paymentMode === 1 && (
                                        <div className='space-y-4 text-center'>
                                            <h4 className='font-bold text-slate-700'>Select Payment Gateway</h4>
                                            <div className='flex justify-center gap-4'>
                                                <div
                                                    className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${selectedGateway === 'RAZORPAY' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-100 hover:border-indigo-200'}`}
                                                    onClick={() => setSelectedGateway('RAZORPAY')}>
                                                    <img
                                                        src='https://razorpay.com/assets/razorpay-glyph.svg'
                                                        alt='Razorpay'
                                                        className='h-12 w-32 object-contain'
                                                    />
                                                    <p className='mt-2 font-bold text-slate-500 text-xs uppercase'>Razorpay</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className='flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4'>
                                        <Info className='h-5 w-5 shrink-0 text-amber-600' />
                                        <p className='font-medium text-amber-800 text-sm leading-relaxed'>
                                            <strong>Note:</strong> For faster and smoother payment processing, please prefer using the UPI
                                            mode of payment.
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className='flex gap-4 border-t bg-slate-50 p-8'>
                                    <Button variant='outline' className='h-12 flex-1 rounded-xl' onClick={() => setView('form')}>
                                        <ArrowLeft className='mr-2 h-4 w-4' /> BACK
                                    </Button>
                                    <Button className='h-12 flex-1 rounded-xl bg-indigo-600 shadow-indigo-100 shadow-lg hover:bg-indigo-700'>
                                        <CreditCard className='mr-2 h-4 w-4' /> CLICK HERE TO PAY NOW
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 gap-8'>
                            {/* Section 1: Personal Information */}
                            <CollapsibleSection
                                title='Application Form - Personal Information'
                                icon={<User className='h-5 w-5 text-indigo-600' />}
                                defaultOpen={true}>
                                <div className='grid grid-cols-1 gap-8 p-6 lg:grid-cols-12'>
                                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-9 lg:grid-cols-3'>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                First Name <span className='text-red-500'>*</span>
                                            </Label>
                                            <Input
                                                placeholder='First Name'
                                                value={reg.PASR_FirstName}
                                                onChange={(e) => handleInputChange('PASR_FirstName', e.target.value)}
                                                className='h-10 text-uppercase'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>Middle Name</Label>
                                            <Input
                                                placeholder='Middle Name'
                                                value={reg.PASR_MiddleName}
                                                onChange={(e) => handleInputChange('PASR_MiddleName', e.target.value)}
                                                className='h-10 text-uppercase'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>Last Name</Label>
                                            <Input
                                                placeholder='Last Name'
                                                value={reg.PASR_LastName}
                                                onChange={(e) => handleInputChange('PASR_LastName', e.target.value)}
                                                className='h-10 text-uppercase'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Mobile No <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='relative'>
                                                <LayoutDashboard className='absolute top-2.5 left-3 h-4 w-4 text-slate-400' />
                                                <Input
                                                    placeholder='Mobile No'
                                                    maxLength={10}
                                                    value={reg.PASR_MobileNo}
                                                    onChange={(e) => handleInputChange('PASR_MobileNo', e.target.value)}
                                                    className='h-10 pl-10'
                                                />
                                            </div>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Hall Ticket No <span className='text-red-500'>*</span>
                                            </Label>
                                            <Input
                                                placeholder='Hall Ticket No'
                                                value={reg.PASTCBAF_HallTicket}
                                                onChange={(e) => handleInputChange('PASTCBAF_HallTicket', e.target.value)}
                                                className='h-10 text-uppercase'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>SATS No</Label>
                                            <Input
                                                placeholder='SATS No'
                                                value={reg.PASTCBAF_SATSNo}
                                                onChange={(e) => handleInputChange('PASTCBAF_SATSNo', e.target.value)}
                                                className='h-10 text-uppercase'
                                                maxLength={9}
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>PEN No</Label>
                                            <Input
                                                placeholder='PEN No'
                                                value={reg.PASTCBAF_PENNo}
                                                onChange={(e) => handleInputChange('PASTCBAF_PENNo', e.target.value)}
                                                className='h-10 text-uppercase'
                                                maxLength={11}
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Board Exam <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select
                                                value={reg.PASTCBAF_BoardExam}
                                                onValueChange={(v) => handleInputChange('PASTCBAF_BoardExam', v)}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue placeholder='Select' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='ICSE'>ICSE</SelectItem>
                                                    <SelectItem value='CBSE'>CBSE</SelectItem>
                                                    <SelectItem value='IB'>IB</SelectItem>
                                                    <SelectItem value='IGCSE'>IGCSE</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Board Passing Year <span className='text-red-500'>*</span>
                                            </Label>
                                            <Input
                                                placeholder='Passing Year'
                                                value={reg.PASTCBAF_BoardPassYear}
                                                onChange={(e) => handleInputChange('PASTCBAF_BoardPassYear', e.target.value)}
                                                className='h-10'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Religion <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select
                                                value={reg.Religion_Id && reg.Religion_Id !== 0 ? reg.Religion_Id.toString() : ''}
                                                onValueChange={(v) => handleInputChange('Religion_Id', Number(v))}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue placeholder='Select Religion' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {religions.map((r: any) => {
                                                        const id = r.ivrmmR_Id ?? r.IVRMMR_Id ?? r.religion_Id ?? r.religionId;
                                                        const name = r.ivrmmR_ReligionName || r.ivrmmR_Name || r.IVRMMR_Name || r.religionName;
                                                        if (id === undefined || id === null) return null;
                                                        return (
                                                            <SelectItem key={id.toString()} value={id.toString()}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Caste Category <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select
                                                value={reg.IMCC_Id && reg.IMCC_Id !== 0 ? reg.IMCC_Id.toString() : ''}
                                                onValueChange={handleCasteCategoryChange}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue placeholder='Select Category' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {casteCategories.map((c: any) => {
                                                        const id = c.imcC_Id ?? c.imCC_Id ?? c.IMCC_Id ?? c.imc_id;
                                                        const name = c.imcC_CategoryName || c.imCC_CategoryName || c.IMCC_CategoryName || c.imC_CategoryName;
                                                        if (id === undefined || id === null) return null;
                                                        return (
                                                            <SelectItem key={id.toString()} value={id.toString()}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Caste <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select
                                                value={reg.Caste_Id?.toString()}
                                                onValueChange={(v) => handleInputChange('Caste_Id', Number(v))}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue placeholder='Select Caste' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {castesForCategory.map((c: any) => (
                                                        <SelectItem key={c.imC_Id} value={c.imC_Id.toString()}>
                                                            {c.imC_CasteName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Gender <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select value={reg.PASR_Sex} onValueChange={(v) => handleInputChange('PASR_Sex', v)}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='Male'>Male</SelectItem>
                                                    <SelectItem value='Female'>Female</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Date of Birth <span className='text-red-500'>*</span>
                                            </Label>
                                            <Input
                                                type='date'
                                                value={reg.PASR_DOB ? new Date(reg.PASR_DOB).toISOString().split('T')[0] : ''}
                                                onChange={(e) => handleInputChange('PASR_DOB', e.target.value)}
                                                className='h-10'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Applying For <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select value={reg.ASMCL_Id?.toString()} onValueChange={handleClassChange}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(initialData?.data as any)?.arrlist5?.map((c: any) => (
                                                        <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>
                                                            {c.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Email ID <span className='text-red-500'>*</span>
                                            </Label>
                                            <Input
                                                type='email'
                                                placeholder='Email ID'
                                                value={reg.PASR_emailId}
                                                onChange={(e) => handleInputChange('PASR_emailId', e.target.value)}
                                                className='h-10'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Nationality <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select
                                                value={reg.PASR_Nationality?.toString()}
                                                onValueChange={(v) => handleInputChange('PASR_Nationality', Number(v))}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue placeholder='Select' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(initialData?.data as any)?.arrlist?.map((c: any) => (
                                                        <SelectItem key={c.ivrmmC_Id} value={c.ivrmmC_Id.toString()}>
                                                            {c.ivrmmC_CountryName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Mother Tongue <span className='text-red-500'>*</span>
                                            </Label>
                                            <Input
                                                placeholder='Mother Tongue'
                                                value={reg.PASR_MotherTongue}
                                                onChange={(e) => handleInputChange('PASR_MotherTongue', e.target.value)}
                                                className='h-10 text-uppercase'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Blood Group <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select
                                                value={reg.PASR_BloodGroup}
                                                onValueChange={(v) => handleInputChange('PASR_BloodGroup', v)}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue placeholder='Select' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Not Available'].map((g) => (
                                                        <SelectItem key={g} value={g}>
                                                            {g}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Existing Student? <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select
                                                value={reg.PASTCBAF_ExistingSchool}
                                                onValueChange={(v) => handleInputChange('PASTCBAF_ExistingSchool', v)}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='YES'>YES</SelectItem>
                                                    <SelectItem value='NO'>NO</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Parent is Alumnus? <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select
                                                value={reg.PASTCBAF_FatherExStudentFlg}
                                                onValueChange={(v) => handleInputChange('PASTCBAF_FatherExStudentFlg', v)}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='1'>YES</SelectItem>
                                                    <SelectItem value='0'>NO</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Stream <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select value={reg.ASMST_Id?.toString()} onValueChange={handleStreamChange}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue placeholder='Select Stream' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(initialData?.data as any)?.syllabuslist?.map((s: any) => (
                                                        <SelectItem key={s.asmsT_Id} value={s.asmsT_Id.toString()}>
                                                            {s.asmsT_StreamName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Student Photo */}
                                    <div className='flex flex-col items-center justify-start space-y-4 lg:col-span-3'>
                                        <div className='group relative flex h-48 w-48 items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-200 border-dashed bg-slate-50'>
                                            {reg.PASR_Student_Pic_Path ? (
                                                <img src={reg.PASR_Student_Pic_Path} alt='Student' className='h-full w-full object-cover' />
                                            ) : (
                                                <div className='space-y-2 p-4 text-center'>
                                                    <User className='mx-auto h-12 w-12 text-slate-300' />
                                                    <p className='font-bold text-[10px] text-slate-400 uppercase'>Upload Photo</p>
                                                </div>
                                            )}
                                            <div className='absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
                                                <Button size='sm' variant='secondary' className='h-8 w-8 rounded-full p-0'>
                                                    <Upload className='h-4 w-4' />
                                                </Button>
                                            </div>
                                        </div>
                                        <Label className='font-black text-[10px] text-indigo-600 uppercase tracking-widest'>
                                            Student Profile Picture <span className='text-red-500'>*</span>
                                        </Label>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            className='w-full border-indigo-200 text-indigo-600 hover:bg-indigo-50'>
                                            Capture Image
                                        </Button>
                                    </div>
                                </div>
                            </CollapsibleSection>

                            {/* Section 2: Addresses */}
                            <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                                <CollapsibleSection
                                    title='Residential Address'
                                    icon={<MapPin className='h-5 w-5 text-indigo-600' />}
                                    variant='outline'>
                                    <div className='space-y-6 p-6'>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Street <span className='text-red-500'>*</span>
                                            </Label>
                                            <Input
                                                value={reg.PASR_ConStreet}
                                                onChange={(e) => handleInputChange('PASR_ConStreet', e.target.value)}
                                                className='text-uppercase'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Area <span className='text-red-500'>*</span>
                                            </Label>
                                            <Input
                                                value={reg.PASR_ConArea}
                                                onChange={(e) => handleInputChange('PASR_ConArea', e.target.value)}
                                                className='text-uppercase'
                                            />
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                    Country <span className='text-red-500'>*</span>
                                                </Label>
                                                <Select
                                                    value={reg.PASR_ConCountry?.toString()}
                                                    onValueChange={(v) => handleCountryChange('con', v)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(initialData?.data as any)?.arrlist?.map((c: any) => (
                                                            <SelectItem key={c.ivrmmC_Id} value={c.ivrmmC_Id.toString()}>
                                                                {c.ivrmmC_CountryName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                    State <span className='text-red-500'>*</span>
                                                </Label>
                                                <Select
                                                    value={reg.PASR_ConState?.toString()}
                                                    onValueChange={(v) => handleInputChange('PASR_ConState', Number(v))}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(statesMutation.data as any)?.data?.arrStatelist2?.map((s: any) => (
                                                            <SelectItem key={s.ivrmmS_Id} value={s.ivrmmS_Id.toString()}>
                                                                {s.ivrmmS_Name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                    City <span className='text-red-500'>*</span>
                                                </Label>
                                                <Input
                                                    value={reg.PASR_ConCity}
                                                    onChange={(e) => handleInputChange('PASR_ConCity', e.target.value)}
                                                    className='text-uppercase'
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                    Pincode <span className='text-red-500'>*</span>
                                                </Label>
                                                <Input
                                                    value={reg.PASR_ConPincode}
                                                    onChange={(e) => handleInputChange('PASR_ConPincode', e.target.value)}
                                                    maxLength={6}
                                                />
                                            </div>
                                        </div>
                                        <div className='flex items-center space-x-2 pt-2'>
                                            <Checkbox
                                                id='addr_copy'
                                                checked={reg.chkbox_address === 1}
                                                onCheckedChange={(c) => address_copy(!!c)}
                                            />
                                            <Label
                                                htmlFor='addr_copy'
                                                className='cursor-pointer font-bold text-indigo-600 text-xs uppercase tracking-tight'>
                                                Permanent Address Same As Residential Address
                                            </Label>
                                        </div>
                                    </div>
                                </CollapsibleSection>

                                <CollapsibleSection
                                    title='Permanent Address'
                                    icon={<History className='h-5 w-5 text-indigo-600' />}
                                    variant='outline'>
                                    <div className='space-y-6 p-6'>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Street <span className='text-red-500'>*</span>
                                            </Label>
                                            <Input
                                                value={reg.PASR_PerStreet}
                                                onChange={(e) => handleInputChange('PASR_PerStreet', e.target.value)}
                                                className='text-uppercase'
                                                disabled={reg.chkbox_address === 1}
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                Area <span className='text-red-500'>*</span>
                                            </Label>
                                            <Input
                                                value={reg.PASR_PerArea}
                                                onChange={(e) => handleInputChange('PASR_PerArea', e.target.value)}
                                                className='text-uppercase'
                                                disabled={reg.chkbox_address === 1}
                                            />
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                    Country <span className='text-red-500'>*</span>
                                                </Label>
                                                <Select
                                                    value={reg.PASR_PerCountry?.toString()}
                                                    onValueChange={(v) => handleCountryChange('per', v)}
                                                    disabled={reg.chkbox_address === 1}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(initialData?.data as any)?.arrlist?.map((c: any) => (
                                                            <SelectItem key={c.ivrmmC_Id} value={c.ivrmmC_Id.toString()}>
                                                                {c.ivrmmC_CountryName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                    State <span className='text-red-500'>*</span>
                                                </Label>
                                                <Select
                                                    value={reg.PASR_PerState?.toString()}
                                                    onValueChange={(v) => handleInputChange('PASR_PerState', Number(v))}
                                                    disabled={reg.chkbox_address === 1}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(statesMutation.data as any)?.data?.arrStatelist?.map((s: any) => (
                                                            <SelectItem key={s.ivrmmS_Id} value={s.ivrmmS_Id.toString()}>
                                                                {s.ivrmmS_Name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                    City <span className='text-red-500'>*</span>
                                                </Label>
                                                <Input
                                                    value={reg.PASR_PerCity}
                                                    onChange={(e) => handleInputChange('PASR_PerCity', e.target.value)}
                                                    className='text-uppercase'
                                                    disabled={reg.chkbox_address === 1}
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                    Pincode <span className='text-red-500'>*</span>
                                                </Label>
                                                <Input
                                                    value={reg.PASR_PerPincode}
                                                    onChange={(e) => handleInputChange('PASR_PerPincode', e.target.value)}
                                                    maxLength={6}
                                                    disabled={reg.chkbox_address === 1}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>

                            {/* Section 3: Parents Details */}
                            <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                                <CollapsibleSection
                                    title="FATHER'S DETAILS"
                                    icon={<Users className='h-5 w-5 text-indigo-600' />}
                                    variant='outline'>
                                    <div className='space-y-4 p-6'>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Father Name *</Label>
                                                <Input
                                                    value={reg.PASR_FatherName}
                                                    onChange={(e) => handleInputChange('PASR_FatherName', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Surname *</Label>
                                                <Input
                                                    value={reg.PASR_FatherSurname}
                                                    onChange={(e) => handleInputChange('PASR_FatherSurname', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Mobile *</Label>
                                                <Input
                                                    value={reg.PASR_FatherMobleNo}
                                                    onChange={(e) => handleInputChange('PASR_FatherMobleNo', e.target.value)}
                                                    className='h-9'
                                                    maxLength={10}
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Email *</Label>
                                                <Input
                                                    value={reg.PASR_FatheremailId}
                                                    onChange={(e) => handleInputChange('PASR_FatheremailId', e.target.value)}
                                                    className='h-9'
                                                />
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Religion *</Label>
                                                <Select
                                                    value={reg.PASR_FatherReligion?.toString()}
                                                    onValueChange={(v) => handleInputChange('PASR_FatherReligion', Number(v))}>
                                                    <SelectTrigger className='h-9'>
                                                        <SelectValue placeholder='Select' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {religions.map((r: any) => {
                                                            const id = r.ivrmmR_Id ?? r.IVRMMR_Id ?? r.religion_Id ?? r.religionId;
                                                            const name = r.ivrmmR_ReligionName || r.ivrmmR_Name || r.IVRMMR_Name || r.religionName;
                                                            if (id === undefined || id === null) return null;
                                                            return (
                                                                <SelectItem key={id.toString()} value={id.toString()}>
                                                                    {name}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Mother Tongue *</Label>
                                                <Input
                                                    value={reg.PASA_FatherMotherTongue}
                                                    onChange={(e) => handleInputChange('PASA_FatherMotherTongue', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Qualification *</Label>
                                                <Input
                                                    value={reg.PASR_FatherEducation}
                                                    onChange={(e) => handleInputChange('PASR_FatherEducation', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>
                                                    Institution Attended *
                                                </Label>
                                                <Input
                                                    value={reg.PASA_FatherInstitution}
                                                    onChange={(e) => handleInputChange('PASA_FatherInstitution', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Service *</Label>
                                                <Input
                                                    value={reg.PASR_FatherOccupation}
                                                    onChange={(e) => handleInputChange('PASR_FatherOccupation', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Business *</Label>
                                                <Input
                                                    value={reg.PASA_FatherBusiness}
                                                    onChange={(e) => handleInputChange('PASA_FatherBusiness', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-[10px] text-slate-500 uppercase'>Company Name *</Label>
                                            <Input
                                                value={reg.PASA_FatherCompany}
                                                onChange={(e) => handleInputChange('PASA_FatherCompany', e.target.value)}
                                                className='h-9 text-uppercase'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-[10px] text-slate-500 uppercase'>Address *</Label>
                                            <Textarea
                                                value={reg.PASR_FatherOfficeAddr}
                                                onChange={(e) => handleInputChange('PASR_FatherOfficeAddr', e.target.value)}
                                                className='min-h-[60px] text-uppercase'
                                            />
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Designation *</Label>
                                                <Input
                                                    value={reg.PASR_FatherDesignation}
                                                    onChange={(e) => handleInputChange('PASR_FatherDesignation', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Monthly Income *</Label>
                                                <Input
                                                    value={reg.PASR_FatherMonIncome}
                                                    onChange={(e) => handleInputChange('PASR_FatherMonIncome', e.target.value)}
                                                    className='h-9'
                                                />
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-4 rounded-xl border-2 border-dashed bg-slate-50/50 p-4'>
                                            <div className='flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white'>
                                                {reg.PASR_FatherPhoto ? (
                                                    <img src={reg.PASR_FatherPhoto} className='h-full w-full object-cover' />
                                                ) : (
                                                    <User className='h-8 w-8 text-slate-200' />
                                                )}
                                            </div>
                                            <div className='flex-1 space-y-2'>
                                                <Label className='font-black text-[10px] text-indigo-600 uppercase'>Father Photo *</Label>
                                                <Button variant='outline' size='sm' className='h-8 w-full border-dashed text-xs'>
                                                    CHOOSE FILE
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>

                                <CollapsibleSection
                                    title="MOTHER'S DETAILS"
                                    icon={<HeartPulse className='h-5 w-5 text-indigo-600' />}
                                    variant='outline'>
                                    <div className='space-y-4 p-6'>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Mother Name *</Label>
                                                <Input
                                                    value={reg.PASR_MotherName}
                                                    onChange={(e) => handleInputChange('PASR_MotherName', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Surname *</Label>
                                                <Input
                                                    value={reg.PASR_MotherSurname}
                                                    onChange={(e) => handleInputChange('PASR_MotherSurname', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Mobile *</Label>
                                                <Input
                                                    value={reg.PASR_MotherMobleNo}
                                                    onChange={(e) => handleInputChange('PASR_MotherMobleNo', e.target.value)}
                                                    className='h-9'
                                                    maxLength={10}
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Email *</Label>
                                                <Input
                                                    value={reg.PASR_MotheremailId}
                                                    onChange={(e) => handleInputChange('PASR_MotheremailId', e.target.value)}
                                                    className='h-9'
                                                />
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Religion *</Label>
                                                <Select
                                                    value={reg.PASR_MotherReligion?.toString()}
                                                    onValueChange={(v) => handleInputChange('PASR_MotherReligion', Number(v))}>
                                                    <SelectTrigger className='h-9'>
                                                        <SelectValue placeholder='Select' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {religions.map((r: any) => {
                                                            const id = r.ivrmmR_Id ?? r.IVRMMR_Id ?? r.religion_Id ?? r.religionId;
                                                            const name = r.ivrmmR_ReligionName || r.ivrmmR_Name || r.IVRMMR_Name || r.religionName;
                                                            if (id === undefined || id === null) return null;
                                                            return (
                                                                <SelectItem key={id.toString()} value={id.toString()}>
                                                                    {name}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Mother Tongue *</Label>
                                                <Input
                                                    value={reg.PASA_MotherMotherTongue}
                                                    onChange={(e) => handleInputChange('PASA_MotherMotherTongue', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Qualification *</Label>
                                                <Input
                                                    value={reg.PASR_MotherEducation}
                                                    onChange={(e) => handleInputChange('PASR_MotherEducation', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>
                                                    Institution Attended *
                                                </Label>
                                                <Input
                                                    value={reg.PASA_MotherInstitution}
                                                    onChange={(e) => handleInputChange('PASA_MotherInstitution', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Service *</Label>
                                                <Input
                                                    value={reg.PASR_MotherOccupation}
                                                    onChange={(e) => handleInputChange('PASR_MotherOccupation', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Business *</Label>
                                                <Input
                                                    value={reg.PASA_MotherBusiness}
                                                    onChange={(e) => handleInputChange('PASA_MotherBusiness', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-[10px] text-slate-500 uppercase'>Company Name *</Label>
                                            <Input
                                                value={reg.PASA_MotherCompany}
                                                onChange={(e) => handleInputChange('PASA_MotherCompany', e.target.value)}
                                                className='h-9 text-uppercase'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-[10px] text-slate-500 uppercase'>Address *</Label>
                                            <Textarea
                                                value={reg.PASR_MotherOfficeAddr}
                                                onChange={(e) => handleInputChange('PASR_MotherOfficeAddr', e.target.value)}
                                                className='min-h-[60px] text-uppercase'
                                            />
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Designation *</Label>
                                                <Input
                                                    value={reg.PASR_MotherDesignation}
                                                    onChange={(e) => handleInputChange('PASR_MotherDesignation', e.target.value)}
                                                    className='h-9 text-uppercase'
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-[10px] text-slate-500 uppercase'>Monthly Income *</Label>
                                                <Input
                                                    value={reg.PASR_MotherMonIncome}
                                                    onChange={(e) => handleInputChange('PASR_MotherMonIncome', e.target.value)}
                                                    className='h-9'
                                                />
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-4 rounded-xl border-2 border-dashed bg-slate-50/50 p-4'>
                                            <div className='flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white'>
                                                {reg.PASR_MotherPhoto ? (
                                                    <img src={reg.PASR_MotherPhoto} className='h-full w-full object-cover' />
                                                ) : (
                                                    <User className='h-8 w-8 text-slate-200' />
                                                )}
                                            </div>
                                            <div className='flex-1 space-y-2'>
                                                <Label className='font-black text-[10px] text-indigo-600 uppercase'>Mother Photo *</Label>
                                                <Button variant='outline' size='sm' className='h-8 w-full border-dashed text-xs'>
                                                    CHOOSE FILE
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>

                            {/* Section 4: Siblings and Previous School */}
                            <CollapsibleSection
                                title='Sibling Details'
                                icon={<Users className='h-5 w-5 text-indigo-600' />}
                                variant='outline'>
                                <div className='space-y-4 p-6'>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className='bg-slate-50'>
                                                <TableHead className='w-12'>SL</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Class</TableHead>
                                                <TableHead>School Name</TableHead>
                                                <TableHead className='w-32'>Gender</TableHead>
                                                <TableHead className='w-20'>Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {siblings.map((s, idx) => (
                                                <TableRow key={idx} className='group'>
                                                    <TableCell className='font-bold text-slate-400'>{idx + 1}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={s.pasrS_SiblingsName}
                                                            onChange={(e) => handleSiblingChange(idx, 'pasrS_SiblingsName', e.target.value)}
                                                            className='h-9 text-uppercase'
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={s.pasrS_SiblingsClass}
                                                            onChange={(e) =>
                                                                handleSiblingChange(idx, 'pasrS_SiblingsClass', e.target.value)
                                                            }
                                                            className='h-9 text-uppercase'
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={s.pasrS_SchoolName}
                                                            onChange={(e) => handleSiblingChange(idx, 'pasrS_SchoolName', e.target.value)}
                                                            className='h-9 text-uppercase'
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={s.pasrS_Gender}
                                                            onValueChange={(v) => handleSiblingChange(idx, 'pasrS_Gender', v)}>
                                                            <SelectTrigger className='h-9'>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value='Male'>Male</SelectItem>
                                                                <SelectItem value='Female'>Female</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className='flex gap-1'>
                                                        {idx === siblings.length - 1 && siblings.length < 5 && (
                                                            <Button
                                                                size='icon'
                                                                variant='ghost'
                                                                className='h-8 w-8 text-indigo-600 hover:bg-indigo-50'
                                                                onClick={handleAddSibling}>
                                                                <Plus className='h-4 w-4' />
                                                            </Button>
                                                        )}
                                                        {siblings.length > 1 && (
                                                            <Button
                                                                size='icon'
                                                                variant='ghost'
                                                                className='h-8 w-8 text-red-500 hover:bg-red-50'
                                                                onClick={() => handleRemoveSibling(idx)}>
                                                                <Trash2 className='h-4 w-4' />
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CollapsibleSection>

                            {reg.PASTCBAF_ExistingSchool !== 'YES' && (
                                <CollapsibleSection
                                    title='Last Attended School'
                                    icon={<School className='h-5 w-5 text-indigo-600' />}
                                    variant='outline'>
                                    <div className='space-y-4 p-6'>
                                        <Table>
                                            <TableHeader>
                                                <TableRow className='bg-slate-50'>
                                                    <TableHead className='w-12'>SL</TableHead>
                                                    <TableHead>School Name</TableHead>
                                                    <TableHead>Address</TableHead>
                                                    <TableHead className='w-48'>Phone No / TC No</TableHead>
                                                    <TableHead className='w-20'>Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {prevSchools.map((s, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className='font-bold text-slate-400'>{idx + 1}</TableCell>
                                                        <TableCell>
                                                            <Input
                                                                value={s.pasrpS_PrvSchoolName}
                                                                onChange={(e) =>
                                                                    handleSchoolChange(idx, 'pasrpS_PrvSchoolName', e.target.value)
                                                                }
                                                                className='h-9 text-uppercase'
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                value={s.pasrpS_Address}
                                                                onChange={(e) => handleSchoolChange(idx, 'pasrpS_Address', e.target.value)}
                                                                className='h-9 text-uppercase'
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                value={s.pasrPS_TcNo}
                                                                onChange={(e) => handleSchoolChange(idx, 'pasrPS_TcNo', e.target.value)}
                                                                className='h-9 text-uppercase'
                                                            />
                                                        </TableCell>
                                                        <TableCell className='flex gap-1'>
                                                            {idx === prevSchools.length - 1 && prevSchools.length < 5 && (
                                                                <Button
                                                                    size='icon'
                                                                    variant='ghost'
                                                                    className='h-8 w-8 text-indigo-600 hover:bg-indigo-50'
                                                                    onClick={handleAddSchool}>
                                                                    <Plus className='h-4 w-4' />
                                                                </Button>
                                                            )}
                                                            {prevSchools.length > 1 && (
                                                                <Button
                                                                    size='icon'
                                                                    variant='ghost'
                                                                    className='h-8 w-8 text-red-500 hover:bg-red-50'
                                                                    onClick={() => handleRemoveSchool(idx)}>
                                                                    <Trash2 className='h-4 w-4' />
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CollapsibleSection>
                            )}

                            {/* Section 5: Other Details */}
                            <CollapsibleSection
                                title='Other Details'
                                icon={<MessageSquare className='h-5 w-5 text-indigo-600' />}
                                variant='outline'>
                                <div className='space-y-6 p-6'>
                                    <div className='space-y-2'>
                                        <Label className='font-black text-slate-500 text-xs uppercase'>
                                            Extra-Curricular Activities (IX & X) <span className='text-red-500'>*</span>
                                        </Label>
                                        <Textarea
                                            placeholder='List activities...'
                                            value={reg.PASTCBAF_ExtraActivities}
                                            onChange={(e) => handleInputChange('PASTCBAF_ExtraActivities', e.target.value)}
                                            className='min-h-[80px] text-uppercase'
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label className='font-black text-slate-500 text-xs uppercase'>
                                            Inter-School Competitions Won (IX & X) <span className='text-red-500'>*</span>
                                        </Label>
                                        <Textarea
                                            placeholder='List competitions...'
                                            value={reg.PASTCBAF_SchoolCompetitions}
                                            onChange={(e) => handleInputChange('PASTCBAF_SchoolCompetitions', e.target.value)}
                                            className='min-h-[80px] text-uppercase'
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label className='font-black text-slate-500 text-xs uppercase'>
                                            Career Goal & Motivation <span className='text-red-500'>*</span>
                                        </Label>
                                        <Textarea
                                            placeholder='Your goal...'
                                            value={reg.PASTCBAF_CareerGoal}
                                            onChange={(e) => handleInputChange('PASTCBAF_CareerGoal', e.target.value)}
                                            className='min-h-[80px] text-uppercase'
                                        />
                                    </div>
                                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                        <div className='space-y-2'>
                                            <Label className='font-black text-slate-500 text-xs uppercase'>
                                                Expected Competitive Exams (XII) <span className='text-red-500'>*</span>
                                            </Label>
                                            <Textarea
                                                placeholder='JEE, NEET, etc...'
                                                value={reg.PASTCBAF_CompetitiveEntanceExams}
                                                onChange={(e) => handleInputChange('PASTCBAF_CompetitiveEntanceExams', e.target.value)}
                                                className='min-h-[80px] text-uppercase'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-black text-slate-500 text-xs uppercase'>
                                                Reason for pursuing XI & XII at Sophia <span className='text-red-500'>*</span>
                                            </Label>
                                            <Textarea
                                                placeholder='Why Sophia?'
                                                value={reg.PASTCBAF_PursueClasses}
                                                onChange={(e) => handleInputChange('PASTCBAF_PursueClasses', e.target.value)}
                                                className='min-h-[80px] text-uppercase'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleSection>

                            {/* Section 6: Marks Details */}
                            <CollapsibleSection
                                title='Academic Marks Details'
                                icon={<Trophy className='h-5 w-5 text-indigo-600' />}
                                variant='outline'>
                                <div className='overflow-x-auto p-6'>
                                    <Table className='border'>
                                        <TableHeader>
                                            <TableRow className='bg-indigo-600 hover:bg-indigo-600'>
                                                <TableHead className='w-12 font-bold text-white'>SL</TableHead>
                                                <TableHead className='min-w-[200px] font-bold text-white'>Exams \ Subjects</TableHead>
                                                {subjects.map((s) => (
                                                    <TableHead key={s.id} className='text-center font-bold text-white'>
                                                        <div className='underline'>{s.name}</div>
                                                        <div className='font-normal text-[10px] opacity-80'>{s.desc}</div>
                                                    </TableHead>
                                                ))}
                                                <TableHead className='w-32 text-center font-bold text-white'>Total</TableHead>
                                                <TableHead className='w-32 text-center font-bold text-white'>Percentage</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {exams.map((exam, eIdx) => (
                                                <TableRow key={exam.id} className='hover:bg-indigo-50/50'>
                                                    <TableCell className='font-medium text-slate-400'>{eIdx + 1}</TableCell>
                                                    <TableCell className='font-bold text-slate-700'>
                                                        {exam.name} {exam.id !== 4 && <span className='text-red-500'>*</span>}
                                                    </TableCell>
                                                    {subjects.map((sub) => (
                                                        <TableCell key={sub.id} className='p-1'>
                                                            <Input
                                                                type='number'
                                                                value={marksMatrix[exam.id]?.[sub.id] || ''}
                                                                onChange={(e) => handleMarksChange(exam.id, sub.id, e.target.value)}
                                                                className='h-10 bg-slate-50/50 text-center font-bold focus:bg-white'
                                                            />
                                                        </TableCell>
                                                    ))}
                                                    <TableCell className='bg-indigo-50/30 text-center font-black text-indigo-600'>
                                                        {calculateTotalMarks(exam.id)}
                                                    </TableCell>
                                                    <TableCell className='bg-indigo-50/50 text-center font-black text-indigo-700'>
                                                        {calculatePercentage(exam.id)}
                                                        {calculatePercentage(exam.id) ? '%' : ''}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CollapsibleSection>

                            {/* Section 7: Subject Selection */}
                            <CollapsibleSection
                                title='Subject Selection'
                                icon={<BookOpen className='h-5 w-5 text-indigo-600' />}
                                variant='outline'>
                                <div className='grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3'>
                                    {['Compulsory', 'Option1', 'Option2', 'Option3', 'Option4', 'Option5'].map((field, idx) => (
                                        <div key={field} className='space-y-2'>
                                            <Label className='font-bold text-slate-500 text-xs uppercase'>
                                                {field === 'Option5'
                                                    ? 'Interdisciplinary Subject'
                                                    : field === 'Compulsory'
                                                        ? 'Compulsory Subject'
                                                        : `Option ${idx}`}{' '}
                                                <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select value={reg[field]} onValueChange={(v) => handleInputChange(field, v)}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue placeholder='--Select--' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(initialData?.data as any)?.syllabuslist?.map((s: any) => (
                                                        <SelectItem key={s.asmsT_Id} value={s.asmsT_StreamName}>
                                                            {s.asmsT_StreamName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ))}
                                </div>
                            </CollapsibleSection>

                            {/* Section 8: Document Uploads */}
                            <CollapsibleSection
                                title='Document Upload Details'
                                icon={<Upload className='h-5 w-5 text-indigo-600' />}
                                variant='outline'>
                                <div className='p-6'>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className='bg-slate-50'>
                                                <TableHead className='w-12'>SL</TableHead>
                                                <TableHead>Document Name</TableHead>
                                                <TableHead className='w-64'>Choose File</TableHead>
                                                <TableHead className='w-32'>Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {documentList.map((doc, idx) => {
                                                const isRequired =
                                                    doc.amsmD_FLAG ||
                                                    (isRomanCatholic && doc.amsmD_DocumentName.toLowerCase().includes('baptism'));
                                                return (
                                                    <TableRow key={idx}>
                                                        <TableCell className='font-bold text-slate-400'>{idx + 1}</TableCell>
                                                        <TableCell className='font-bold text-slate-700'>
                                                            {doc.amsmD_DocumentName} {isRequired && <span className='text-red-500'>*</span>}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className='flex items-center gap-2'>
                                                                <Button
                                                                    variant='outline'
                                                                    size='sm'
                                                                    className='h-8 border-indigo-200 border-dashed text-indigo-600'>
                                                                    <Upload className='mr-2 h-3 w-3' /> Choose File
                                                                </Button>
                                                                {doc.document_Path && <CheckCircle2 className='h-4 w-4 text-emerald-500' />}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {doc.document_Path && (
                                                                <Button variant='ghost' size='sm' className='font-bold text-indigo-600'>
                                                                    VIEW
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CollapsibleSection>

                            {/* Footer Actions */}
                            <div className='sticky right-0 bottom-6 left-0 z-10 flex justify-center'>
                                <Card className='flex gap-4 rounded-full border border-slate-200/50 border-none bg-white/90 px-8 py-4 shadow-2xl backdrop-blur-md'>
                                    <Button
                                        onClick={handleSave}
                                        disabled={saveMutation.isPending}
                                        className='h-12 rounded-full bg-indigo-600 px-12 shadow-indigo-100 shadow-lg transition-all hover:bg-indigo-700 active:scale-95'>
                                        {saveMutation.isPending ? (
                                            <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                                        ) : (
                                            <Save className='mr-2 h-5 w-5' />
                                        )}
                                        SAVE REGISTRATION
                                    </Button>
                                    <Button
                                        variant='outline'
                                        className='h-12 rounded-full border-slate-200 px-12 hover:bg-slate-100'
                                        onClick={() => setView('payment')}>
                                        PROCEED TO PAYMENT
                                    </Button>
                                    <Button
                                        variant='ghost'
                                        className='h-12 rounded-full px-8 text-slate-500 hover:bg-slate-100'
                                        onClick={() => window.location.reload()}>
                                        CANCEL
                                    </Button>
                                </Card>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value='list' className='fade-in slide-in-from-bottom-2 animate-in duration-300'>
                    <Card className='overflow-hidden rounded-2xl border-none shadow-xl'>
                        <CardHeader className='border-b bg-slate-50/50 p-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <CardTitle className='flex items-center gap-2 font-bold text-lg text-slate-800'>
                                        <Search className='h-5 w-5 text-indigo-600' />
                                        Existing Registrations (Class XI)
                                    </CardTitle>
                                    <CardDescription>
                                        View and manage all student applications for the current academic year.
                                    </CardDescription>
                                </div>
                                <div className='relative w-96'>
                                    <Search className='absolute top-2.5 left-3 h-4 w-4 text-slate-400' />
                                    <Input
                                        placeholder='Search by name, registration no or mobile...'
                                        value={studentSearch}
                                        onChange={(e) => setStudentSearch(e.target.value)}
                                        className='h-10 rounded-full border-slate-200 bg-white pl-10 focus:ring-2 focus:ring-indigo-100'
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className='p-0'>
                            <DataTable
                                totalItems={filteredList.length}
                                columns={[
                                    { header: 'SL', cell: ({ row }: any) => row.index + 1 },
                                    {
                                        header: 'Reg No',
                                        accessorKey: 'pasR_RegistrationNo',
                                        cell: ({ row }: any) => (
                                            <span className='font-bold text-indigo-600'>{row.original.pasR_RegistrationNo}</span>
                                        )
                                    },
                                    {
                                        header: 'Student Name',
                                        accessorKey: 'pasR_FirstName',
                                        cell: ({ row }: any) => (
                                            <div className='font-medium'>
                                                {row.original.pasR_FirstName} {row.original.pasR_MiddleName || ''}{' '}
                                                {row.original.pasR_LastName || ''}
                                            </div>
                                        )
                                    },
                                    { header: 'Mobile', accessorKey: 'pasR_MobileNo' },
                                    {
                                        header: 'Gender',
                                        accessorKey: 'pasR_Sex',
                                        cell: ({ row }: any) => (
                                            <Badge
                                                variant='outline'
                                                className={
                                                    row.original.pasR_Sex === 'Male'
                                                        ? 'border-blue-100 bg-blue-50 text-blue-600'
                                                        : 'border-pink-100 bg-pink-50 text-pink-600'
                                                }>
                                                {row.original.pasR_Sex}
                                            </Badge>
                                        )
                                    },
                                    {
                                        header: 'Date',
                                        accessorKey: 'pasR_Date',
                                        cell: ({ row }: any) =>
                                            row.original.pasR_Date
                                                ? new Date(row.original.pasR_Date).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })
                                                : '-'
                                    },
                                    {
                                        header: 'Status',
                                        accessorKey: 'pasR_ActiveFlag',
                                        cell: ({ row }: any) => (
                                            <Badge
                                                variant={row.original.pasR_ActiveFlag ? 'success' : 'destructive'}
                                                className='rounded-full px-4'>
                                                {row.original.pasR_ActiveFlag ? 'Active' : 'Deactivated'}
                                            </Badge>
                                        )
                                    },
                                    {
                                        header: 'Actions',
                                        id: 'actions',
                                        cell: ({ row }: any) => (
                                            <div className='flex gap-1'>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8 rounded-full text-indigo-600 hover:bg-indigo-50'
                                                    title='View Details'>
                                                    <Eye className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    onClick={() => handleDelete(row.original.pasR_Id || row.original.pasr_id)}
                                                    className='h-8 w-8 rounded-full text-red-500 hover:bg-red-50'
                                                    title='Delete'>
                                                    <Trash2 className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    onClick={() =>
                                                        toggleStatusMutation.mutate(row.original.pasR_Id || row.original.pasr_id)
                                                    }
                                                    className='h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100'
                                                    title='Toggle Status'>
                                                    <ShieldAlert className='h-4 w-4' />
                                                </Button>
                                            </div>
                                        )
                                    }
                                ]}
                                data={filteredList}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
