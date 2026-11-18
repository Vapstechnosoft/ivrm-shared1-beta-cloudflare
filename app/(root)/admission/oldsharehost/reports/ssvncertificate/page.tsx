'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
    getSSVNCertificateInitialDetails,
    getSSVNCertificateReportDetails,
    getSSVNCertificateStudentsByFilter,
    getSSVNCertificateStudentsByStatus,
    getSSVNCertificateStudentsByYear
} from '@/server/admission/oldsharehost/reports/ssvn_certificate';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Check, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export default function SSVNCertificateReport() {
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm({
        defaultValues: {
            radioType: 'study',
            studentStatus: 'S',
            academicYearId: '',
            classId: '',
            sectionId: '',
            studentId: ''
        }
    });

    const radioType = watch('radioType');
    const studentStatus = watch('studentStatus');
    const academicYearId = watch('academicYearId');
    const classId = watch('classId');
    const sectionId = watch('sectionId');

    const [yearList, setYearList] = useState<any[]>([]);
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [studentList, setStudentList] = useState<any[]>([]);

    const [studyCert, setStudyCert] = useState(false);
    const [characterCert, setCharacterCert] = useState(false);

    const [certData, setCertData] = useState<any>({});

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [studentOpen, setStudentOpen] = useState(false);
    const [selectedStudentData, setSelectedStudentData] = useState<any>(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const studyCertRef = useRef<HTMLDivElement>(null);
    const characterCertRef = useRef<HTMLDivElement>(null);

    const { data: initialData, isLoading: initialLoading } = useQuery({
        queryKey: ['ssvnCertificateInitial'],
        queryFn: () => getSSVNCertificateInitialDetails()
    });

    useEffect(() => {
        if (initialData) {
            const payload = (initialData as any).data || initialData;
            setYearList((payload.allAcademicYear as any[]) || []);
            setClassList((payload.allclasslist as any[]) || []);
            setSectionList((payload.allsectionlist as any[]) || []);
        }
    }, [initialData]);

    const { mutate: fetchStudentsByStatus } = useMutation({
        mutationFn: getSSVNCertificateStudentsByStatus,
        onSuccess: (data: any) => {
            const payload = data?.data || data;
            if (payload?.allAcademicYear) {
                setYearList(payload.allAcademicYear as any[]);
            }
            const students = Array.isArray(payload) ? payload : payload?.fillstudlist || payload?.studentlist || [];
            if (students && students.length > 0) {
                setStudentList(students);
            }
        },
        onError: () => {
            console.error('Failed to fetch data for the selected status');
        }
    });

    const { mutate: fetchStudentsByYear } = useMutation({
        mutationFn: getSSVNCertificateStudentsByYear,
        onSuccess: (data: any) => {
            const payload = data?.data || data;
            // Handle case where payload is an array directly or has a fillstudlist array
            const students = Array.isArray(payload) ? payload : payload?.fillstudlist || [];

            if (students && students.length > 0) {
                setStudentList(students);
            } else {
                alert('No Records Found');
                setStudentList([]);
            }
        },
        onError: () => {
            console.error('Failed to fetch students');
        }
    });

    const { mutate: fetchStudentsByFilter } = useMutation({
        mutationFn: getSSVNCertificateStudentsByFilter,
        onSuccess: (data: any) => {
            const payload = data?.data || data;
            const students = Array.isArray(payload) ? payload : payload?.fillstudlist || payload?.studentlist || [];

            if (students && students.length > 0) {
                setStudentList(students);
            } else {
                setStudentList([]);
            }
        },
        onError: () => {
            console.error('Failed to fetch students');
        }
    });

    const { mutate: fetchReportDetails, isPending: isReportLoading } = useMutation({
        mutationFn: getSSVNCertificateReportDetails,
        onSuccess: (data: any) => {
            const payload = data?.data || data;
            if (payload?.studentlist && (payload.studentlist as any[]).length > 0) {
                const student = payload.studentlist[0];
                const student1 = payload.studentlist1 && (payload.studentlist1 as any[]).length > 0 ? payload.studentlist1[0] : {};

                let gender = 'Kumari';
                if (student.AMST_Sex && student.AMST_Sex.toUpperCase() === 'MALE') {
                    gender = 'Kumar';
                } else if (student.amsT_Sex && student.amsT_Sex.toUpperCase() === 'MALE') {
                    gender = 'Kumar';
                }

                const mappedData = {
                    gender,
                    studentname: student.studentnam || student.amsT_FirstName,
                    fathername: student.fathername || student.fatherName,
                    street: student.street,
                    area: student.area,
                    city: student.pincode ? `${student.city}-${student.pincode}` : student.city,
                    joinedyear: student1.joinedyear ? new Date(student1.joinedyear) : null,
                    toyear:
                        payload.academicList1 && (payload.academicList1 as any[]).length > 0
                            ? new Date(payload.academicList1[0].asmaY_To_Date).getFullYear()
                            : student1.leftyear
                              ? new Date(student1.leftyear).getFullYear()
                              : '',
                    joinedclass: student1.joinedclass,
                    classstudying: student.class,
                    section: student.section,
                    admno: student.admno,
                    dob: student.dob ? new Date(student.dob) : null,
                    date: new Date(),
                    admdate: student.joindate ? new Date(student.joindate) : student.admdate ? new Date(student.admdate) : null,
                    logo:
                        payload.masterCompany && payload.masterCompany.length > 0
                            ? payload.masterCompany[0].milogo
                            : student.MI_Logo || '/images/ssvn.PNG'
                };

                setCertData(mappedData);

                if (radioType === 'study') {
                    setStudyCert(true);
                    setCharacterCert(false);
                } else {
                    setCharacterCert(true);
                    setStudyCert(false);
                }
            } else {
                alert('Record not found');
                setStudyCert(false);
                setCharacterCert(false);
            }
        },
        onError: () => {
            console.error('Failed to fetch report details');
        }
    });

    useEffect(() => {
        if (studentStatus) {
            setStudyCert(false);
            setCharacterCert(false);
            setValue('studentId', '');
            setStudentList([]);
            fetchStudentsByStatus({ AMST_SOL: studentStatus });
        }
    }, [studentStatus, setValue, fetchStudentsByStatus]);

    useEffect(() => {
        if (academicYearId && studentStatus && !classId && !sectionId) {
            setStudyCert(false);
            setCharacterCert(false);
            fetchStudentsByStatus({ AMST_SOL: studentStatus });
        }
    }, [academicYearId, studentStatus, classId, sectionId, fetchStudentsByStatus]);

    useEffect(() => {
        if (academicYearId && classId && sectionId && studentStatus && debouncedSearch.length >= 2) {
            setStudyCert(false);
            setCharacterCert(false);
            fetchStudentsByFilter({
                ASMAY_Id: Number(academicYearId),
                ASMCL_Id: Number(classId),
                ASMS_Id: Number(sectionId),
                AMST_SOL: studentStatus,
                searchfilter: debouncedSearch,
                allorindid: 'I'
            });
        } else if (debouncedSearch.length < 2) {
            // Clear student list when search term is too short
            setStudentList([]);
        }
    }, [academicYearId, classId, sectionId, studentStatus, debouncedSearch, fetchStudentsByFilter]);

    const onSubmit = (data: any) => {
        const payload = {
            ASMAY_Id: Number(data.academicYearId) || 0,
            ASMCL_Id: Number(data.classId) || 0,
            ASMS_Id: Number(data.sectionId) || 0,
            AMST_Id: Number(data.studentId) || 0,
            save_flag: 'Report'
        };
        fetchReportDetails(payload);
    };

    const onClear = () => {
        setValue('radioType', 'study');
        setValue('studentStatus', 'S');
        setValue('academicYearId', '');
        setValue('classId', '');
        setValue('sectionId', '');
        setValue('studentId', '');
        setStudyCert(false);
        setCharacterCert(false);
        setCertData({});
        setStudentList([]);
    };

    const onPrint = () => {
        let innerContents = '';
        if (radioType === 'study' && studyCertRef.current) {
            innerContents = studyCertRef.current.innerHTML;
        } else if (radioType === 'character' && characterCertRef.current) {
            innerContents = characterCertRef.current.innerHTML;
        }

        if (!innerContents) return;

        const popupWindow = window.open('', '_blank');
        if (popupWindow) {
            popupWindow.document.open();
            popupWindow.document.write(`
        <html>
          <head>
            <title>Print Certificate</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .table { width: 100%; margin-bottom: 1rem; border-collapse: collapse; }
              .table td { padding: 5px; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .border-bottom { border-bottom: 1px solid #000; text-align: center; }
              .border-bottom-dotted { border-bottom: 1px solid #000; text-align: center; }
              .border-b { border-bottom: 1px solid #000; }
              .border-black { border-color: #000; }
              .margin-top-10 { margin-top: 10px; }
              .margin-top-50 { margin-top: 50px; }
              .margin-top-100 { margin-top: 100px; }
              .img-responsive { max-width: 100%; height: auto; }
              .font-bold { font-weight: bold; }
              .font-semibold { font-weight: 600; }
              .w-full { width: 100%; }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              .items-end { align-items: flex-end; }
              .whitespace-nowrap { white-space: nowrap; }
              .text-lg { font-size: 1.125rem; }
              .text-xl { font-size: 1.25rem; }
              .text-left { text-align: left; }
              .inline-block { display: inline-block; }
              .mr-2 { margin-right: 0.5rem; }
              .mr-10 { margin-right: 2.5rem; }
              .w-48 { width: 12rem; }
              .min-w-\\[150px\\] { min-width: 150px; }
              .w-1\\/2 { width: 50%; }
              .w-1\\/3 { width: 33.333333%; }
              .mb-2 { margin-bottom: 0.5rem; }
              .mb-4 { margin-bottom: 1rem; }
              .mb-6 { margin-bottom: 1.5rem; }
              .mb-8 { margin-bottom: 2rem; }
              .mb-16 { margin-bottom: 4rem; }
              .mt-8 { margin-top: 2rem; }
              .mt-10 { margin-top: 2.5rem; }
              .mt-12 { margin-top: 3rem; }
              .mt-20 { margin-top: 5rem; }
              .pl-2 { padding-left: 0.5rem; }
              .pr-10 { padding-right: 2.5rem; }
              .px-4 { padding-left: 1rem; padding-right: 1rem; }
              .pb-6 { padding-bottom: 1.5rem; }
              .border { border: 1px solid #000; }
              .border-t { border-top: 1px solid #000; }
              .p-4 { padding: 1rem; }
              .p-8 { padding: 2rem; }
              .underline { text-decoration: underline; }
            </style>
          </head>
          <body onload="window.print()" onfocus="window.setTimeout(function() { window.close(); }, 100);">
            ${innerContents}
          </body>
        </html>
      `);
            popupWindow.document.close();
        }
    };

    return (
        <section className='content'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='box box-primary rounded-md bg-white p-6 shadow-md'>
                    <div className='box-header mb-4 flex items-center justify-between border-b pb-4'>
                        <h3 className='box-title font-bold text-xl'>SSVN Certificates</h3>
                    </div>

                    <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <div className='well rounded-md border bg-gray-50 p-4 text-center'>
                            <Controller
                                name='radioType'
                                control={control}
                                rules={{ required: 'Select any one option' }}
                                render={({ field }) => (
                                    <>
                                        <label className='mr-6 inline-flex cursor-pointer items-center'>
                                            <input
                                                {...field}
                                                type='radio'
                                                value='study'
                                                checked={field.value === 'study'}
                                                className='form-radio h-4 w-4 text-blue-600'
                                            />
                                            <span className='ml-2 font-medium'>Study Certificate</span>
                                        </label>
                                        <label className='inline-flex cursor-pointer items-center'>
                                            <input
                                                {...field}
                                                type='radio'
                                                value='character'
                                                checked={field.value === 'character'}
                                                className='form-radio h-4 w-4 text-blue-600'
                                            />
                                            <span className='ml-2 font-medium'>Character Certificate</span>
                                        </label>
                                    </>
                                )}
                            />
                            {errors.radioType && <p className='mt-2 text-red-500 text-sm'>{errors.radioType.message}</p>}
                        </div>

                        <div className='well rounded-md border bg-gray-50 p-4 text-center'>
                            <Controller
                                name='studentStatus'
                                control={control}
                                render={({ field }) => (
                                    <>
                                        <label className='mr-6 inline-flex cursor-pointer items-center'>
                                            <input
                                                {...field}
                                                type='radio'
                                                value='S'
                                                checked={field.value === 'S'}
                                                className='form-radio h-4 w-4 text-blue-600'
                                            />
                                            <span className='ml-2 font-medium'>Studying</span>
                                        </label>
                                        <label className='mr-6 inline-flex cursor-pointer items-center'>
                                            <input
                                                {...field}
                                                type='radio'
                                                value='L'
                                                checked={field.value === 'L'}
                                                className='form-radio h-4 w-4 text-blue-600'
                                            />
                                            <span className='ml-2 font-medium'>Left</span>
                                        </label>
                                        <label className='inline-flex cursor-pointer items-center'>
                                            <input
                                                {...field}
                                                type='radio'
                                                value='D'
                                                checked={field.value === 'D'}
                                                className='form-radio h-4 w-4 text-blue-600'
                                            />
                                            <span className='ml-2 font-medium'>Deactive</span>
                                        </label>
                                    </>
                                )}
                            />
                        </div>
                    </div>

                    <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <div className='form-group flex items-center'>
                            <label className='control-label w-1/3 pr-4 text-right font-semibold'>
                                Academic Year:<strong className='text-red-500'>*</strong>
                            </label>
                            <div className='w-2/3'>
                                <Controller
                                    name='academicYearId'
                                    control={control}
                                    rules={{ required: 'Select Academic Year' }}
                                    render={({ field }) => (
                                        <select {...field} className='form-control w-full rounded-md border p-2'>
                                            <option value=''>--Select--</option>
                                            {yearList.map((option) => (
                                                <option key={option.asmaY_Id} value={option.asmaY_Id}>
                                                    {option.asmaY_Year}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                                {errors.academicYearId && <p className='text-red-500 text-sm'>{errors.academicYearId.message}</p>}
                            </div>
                        </div>
                        <div className='form-group flex items-center'>
                            <label className='control-label w-1/3 pr-4 text-right font-semibold'>
                                Class:<strong className='text-red-500'>*</strong>
                            </label>
                            <div className='w-2/3'>
                                <Controller
                                    name='classId'
                                    control={control}
                                    rules={{ required: 'Select Class' }}
                                    render={({ field }) => (
                                        <select {...field} className='form-control w-full rounded-md border p-2'>
                                            <option value=''>--Select--</option>
                                            {classList.map((option) => (
                                                <option key={option.asmcL_Id} value={option.asmcL_Id}>
                                                    {option.asmcL_ClassName}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                                {errors.classId && <p className='text-red-500 text-sm'>{errors.classId.message}</p>}
                            </div>
                        </div>
                    </div>

                    <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <div className='form-group flex items-center'>
                            <label className='control-label w-1/3 pr-4 text-right font-semibold'>
                                Section:<strong className='text-red-500'>*</strong>
                            </label>
                            <div className='w-2/3'>
                                <Controller
                                    name='sectionId'
                                    control={control}
                                    rules={{ required: 'Select Section' }}
                                    render={({ field }) => (
                                        <select {...field} className='form-control w-full rounded-md border p-2'>
                                            <option value=''>--Select--</option>
                                            {sectionList.map((option) => (
                                                <option key={option.asmS_Id} value={option.asmS_Id}>
                                                    {option.asmC_SectionName}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                                {errors.sectionId && <p className='text-red-500 text-sm'>{errors.sectionId.message}</p>}
                            </div>
                        </div>

                        <div className='form-group flex items-center'>
                            <label className='control-label w-1/3 pr-4 text-right font-semibold'>
                                Student:<strong className='text-red-500'>*</strong>
                            </label>
                            <div className='w-2/3'>
                                <Controller
                                    name='studentId'
                                    control={control}
                                    rules={{ required: 'Select Student' }}
                                    render={({ field }) => (
                                        <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant='outline'
                                                    role='combobox'
                                                    className={cn(
                                                        'h-auto w-full justify-between rounded-md border bg-white p-2 font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}
                                                    disabled={!classId || !sectionId}>
                                                    <span className='truncate pr-2'>
                                                        {field.value && selectedStudentData
                                                            ? `${selectedStudentData.amsT_FirstName} ${selectedStudentData.amsT_MiddleName || ''} ${selectedStudentData.amsT_LastName || ''}`
                                                            : '--Select Student--'}
                                                    </span>
                                                    <div className='flex shrink-0 items-center'>
                                                        {field.value && (
                                                            <X
                                                                className='mr-1 h-4 w-4 cursor-pointer opacity-50 hover:opacity-100'
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    field.onChange('');
                                                                    setSelectedStudentData(null);
                                                                }}
                                                            />
                                                        )}
                                                        <Search className='h-4 w-4 opacity-50' />
                                                    </div>
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-[400px] p-0' align='start'>
                                                <Command shouldFilter={false}>
                                                    <CommandInput
                                                        placeholder='Type to search (min 2 chars)...'
                                                        className='h-9'
                                                        onValueChange={setSearchTerm}
                                                        value={searchTerm}
                                                    />
                                                    <CommandList>
                                                        <CommandEmpty>No student found.</CommandEmpty>
                                                        <CommandGroup className='max-h-64 overflow-y-auto'>
                                                            {studentList.map((s: any) => (
                                                                <CommandItem
                                                                    key={s.amsT_Id}
                                                                    value={s.amsT_Id.toString()}
                                                                    onSelect={() => {
                                                                        field.onChange(s.amsT_Id.toString());
                                                                        setSelectedStudentData(s);
                                                                        setStudentOpen(false);
                                                                        setSearchTerm('');
                                                                    }}>
                                                                    <div className='flex flex-col py-1'>
                                                                        <span className='font-semibold text-indigo-900'>
                                                                            {s.amsT_FirstName} {s.amsT_MiddleName || ''}{' '}
                                                                            {s.amsT_LastName || ''}
                                                                        </span>
                                                                    </div>
                                                                    {field.value === s.amsT_Id.toString() && (
                                                                        <Check className='ml-auto h-4 w-4 text-indigo-600' />
                                                                    )}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                                {errors.studentId && <p className='text-red-500 text-sm'>{errors.studentId.message}</p>}
                            </div>
                        </div>
                    </div>

                    <hr className='my-6 border-gray-200' />

                    <div className='mb-8 space-x-4 text-center'>
                        <button
                            type='submit'
                            className='btn btn-primary rounded-md bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700'
                            disabled={isReportLoading || initialLoading}>
                            <i className='fa fa-file-excel-o mr-2' />
                            Report
                        </button>
                        <button
                            type='button'
                            className='btn btn-warning rounded-md bg-orange-500 px-6 py-2 text-white transition hover:bg-orange-600'
                            onClick={onClear}>
                            <i className='fa fa-times mr-2' />
                            Cancel
                        </button>
                        <button
                            type='button'
                            className='btn btn-primary rounded-md bg-green-600 px-6 py-2 text-white transition hover:bg-green-700'
                            onClick={onPrint}
                            disabled={!studyCert && !characterCert}>
                            <i className='fa fa-print mr-2' />
                            Print
                        </button>
                    </div>

                    {/* Study Certificate UI */}
                    {studyCert && (
                        <div className='box box-body border p-8' ref={studyCertRef}>
                            <div className='SSVNStudyCertificate' id='SSVNStudyCertificate'>
                                <table className='table-bordered margin-top-10 w-full border'>
                                    <tbody>
                                        <tr>
                                            <td className='p-4'>
                                                <div className='baldwin mb-4 text-center'>
                                                    <img
                                                        src={certData.logo || '/images/ssvn.PNG'}
                                                        className='img-responsive mx-auto h-24 object-contain'
                                                        alt='logo'
                                                    />
                                                </div>
                                                <div className='mb-6 flex items-end justify-between'>
                                                    <div className='w-1/2 whitespace-nowrap text-left'>
                                                        <span className='mr-2'>Admission No.</span>
                                                        <span className='inline-block min-w-[150px] border-black border-b px-4 text-center font-semibold'>
                                                            {certData.admno}
                                                        </span>
                                                    </div>
                                                    <div className='w-1/2 text-right'>
                                                        <h3 className='mr-10 font-bold text-lg'>STUDY CERTIFICATE</h3>
                                                    </div>
                                                </div>

                                                <table className='mb-2 table w-full'>
                                                    <tbody>
                                                        <tr>
                                                            <td width='230'>This is to certify that {certData.gender}.</td>
                                                            <td className='border-black border-b text-center font-semibold'>
                                                                {certData.studentname}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <table className='mb-2 table w-full'>
                                                    <tbody>
                                                        <tr>
                                                            <td width='80'>S/O. D/O</td>
                                                            <td className='border-black border-b text-center font-semibold'>
                                                                {certData.fathername}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <table className='mb-2 table w-full'>
                                                    <tbody>
                                                        <tr>
                                                            <td width='80'>Belongs to</td>
                                                            <td className='border-black border-b text-center font-semibold'>
                                                                {certData.street}
                                                            </td>
                                                            <td width='60' className='pl-2'>
                                                                Village
                                                            </td>
                                                            <td className='border-black border-b text-center font-semibold'>
                                                                {certData.area}
                                                            </td>
                                                            <td width='50' className='pl-2'>
                                                                Taluk
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <table className='mb-2 table w-full'>
                                                    <tbody>
                                                        <tr>
                                                            <td className='border-black border-b text-center font-semibold'>
                                                                {certData.city}
                                                            </td>
                                                            <td width='220' className='pl-2'>
                                                                District. He/She has studied from
                                                            </td>
                                                            <td className='border-black border-b text-center font-semibold'>
                                                                {certData.joinedyear?.getFullYear() || ''}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <table className='mb-2 table w-full'>
                                                    <tbody>
                                                        <tr>
                                                            <td width='30'>to</td>
                                                            <td className='border-black border-b text-center font-semibold'>
                                                                {certData.toyear}
                                                            </td>
                                                            <td width='40' className='pl-2'>
                                                                from
                                                            </td>
                                                            <td className='border-black border-b text-center font-semibold'>
                                                                {certData.joinedclass}
                                                            </td>
                                                            <td width='100' className='pl-2'>
                                                                Standard to
                                                            </td>
                                                            <td className='border-black border-b text-center font-semibold'>
                                                                {certData.classstudying} &nbsp; {certData.section}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <table className='mb-2 table w-full'>
                                                    <tbody>
                                                        <tr>
                                                            <td width='150'>Standard and passed</td>
                                                            <td className='border-black border-b text-center font-semibold'>
                                                                {certData.classstudying}
                                                            </td>
                                                            <td width='140' className='pl-2'>
                                                                Standard in the year
                                                            </td>
                                                            <td className='border-black border-b text-center font-semibold'>
                                                                {certData.toyear}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <table className='mb-2 table w-full'>
                                                    <tbody>
                                                        <tr>
                                                            <td width='80'>SATS NO</td>
                                                            <td className='border-black border-b text-center font-semibold'>
                                                                {certData.admno}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <table className='mb-2 table w-full'>
                                                    <tbody>
                                                        <tr>
                                                            <td width='140'>His/Her Date of Birth</td>
                                                            <td className='border-black border-b text-center font-semibold'>
                                                                {certData.dob?.toLocaleDateString('en-GB')}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <table className='mb-2 table w-full'>
                                                    <tbody>
                                                        <tr>
                                                            <td width='190'>His/Her Record No and Date</td>
                                                            <td className='border-black border-b text-center font-semibold'>
                                                                {certData.joinedyear?.toLocaleDateString('en-GB')}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <table className='mb-2 table w-full'>
                                                    <tbody>
                                                        <tr>
                                                            <td width='160'>Date of leaving school</td>
                                                            <td className='border-black border-b text-center font-semibold'>
                                                                {certData.date?.toLocaleDateString('en-GB')}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <table className='margin-top-50 mt-10 table w-full'>
                                                    <tbody>
                                                        <tr>
                                                            <td>This certificate issued according to records of our school.</td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <div className='mt-12 mb-8 flex items-end justify-between'>
                                                    <div className='w-1/2'>
                                                        <table className='mb-2 table w-full'>
                                                            <tbody>
                                                                <tr>
                                                                    <td width='55'>Date :</td>
                                                                    <td className='border-black border-b text-center font-semibold'>
                                                                        {certData.date?.toLocaleDateString('en-GB')}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                        <table className='table w-full'>
                                                            <tbody>
                                                                <tr>
                                                                    <td width='60'>Place :</td>
                                                                    <td className='border-black border-b text-center font-semibold'></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div className='w-1/2 pr-10 pb-6 text-right font-bold'>
                                                        Signature & Seal of the Head Master
                                                    </div>
                                                </div>

                                                <div className='mt-8 mb-4 text-center font-bold'>Signature of AEO/D.D.P.I with Seal</div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='border-t p-4 text-center text-sm'>
                                                Note: If the candidate studied in more than one school, <br />
                                                they have to produce separate Certificate
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Character Certificate UI */}
                    {characterCert && (
                        <div className='box box-body border p-8' ref={characterCertRef}>
                            <div className='SSVNStudyCertificate' id='SSVNCharacterCertificate'>
                                <table className='table-bordered margin-top-10 w-full border'>
                                    <tbody>
                                        <tr>
                                            <td className='p-4'>
                                                <div className='baldwin mb-4 text-center'>
                                                    <img
                                                        src={certData.logo || '/images/ssvn.PNG'}
                                                        className='img-responsive mx-auto h-24 object-contain'
                                                        alt='logo'
                                                    />
                                                </div>
                                                <br />
                                                <h3 className='mb-6 text-center font-bold text-xl underline'>CHARACTER CERTIFICATE</h3>
                                                <br />

                                                <table className='mb-2 table w-full'>
                                                    <tbody>
                                                        <tr>
                                                            <td width='190'>This is to certify that {certData.gender}.</td>
                                                            <td className='border-black border-b text-center font-semibold'>
                                                                {certData.studentname}
                                                            </td>
                                                            <td width='90' className='pl-2'>
                                                                was the
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <table className='mb-2 table w-full'>
                                                    <tbody>
                                                        <tr>
                                                            <td>student of our institution during the year from</td>
                                                            <td
                                                                width='170'
                                                                className='border-black border-b pl-2 text-center font-semibold'>
                                                                {certData.admdate?.getFullYear() || ''}
                                                            </td>
                                                            <td width='60' className='pl-2 text-center'>
                                                                to
                                                            </td>
                                                            <td
                                                                width='170'
                                                                className='border-black border-b pl-2 text-center font-semibold'>
                                                                {certData.toyear}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <table className='mb-8 table w-full'>
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                his/her character and conduct were{' '}
                                                                <i>
                                                                    <b>satisfactory</b>
                                                                </i>{' '}
                                                                during his/her stay in this institution.
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <div className='mt-12 mb-16 flex items-end justify-between'>
                                                    <div className='w-1/2'>
                                                        <table className='mb-2 table w-full'>
                                                            <tbody>
                                                                <tr>
                                                                    <td width='60'>Place :</td>
                                                                    <td className='font-semibold'>Dommasandra</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                        <table className='table w-full'>
                                                            <tbody>
                                                                <tr>
                                                                    <td width='60'>Date :</td>
                                                                    <td className='border-black border-b text-center font-semibold'>
                                                                        {certData.date?.toLocaleDateString('en-GB')}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div className='w-1/2 pr-10 pb-6 text-right font-bold'>Headmaster Signature</div>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </section>
    );
}
