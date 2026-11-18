'use client';

import { useState, useEffect } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, ChevronRight, Plus, Trash2, Upload, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { onCourseChange, onBranchChange, getCasteByCategory } from '@/server/college/CollegeAdmission/Transactions/clgadmission-form';
import Image from 'next/image';

export function StudentDetailsTab({ initialData, onNext }: { initialData: any, onNext: () => void }) {
    const { control, watch, setValue } = useFormContext();
    const [courses, setCourses] = useState(initialData?.courses || []);
    const [branches, setBranches] = useState(initialData?.branches || []);
    const [semesters, setSemesters] = useState(initialData?.semesters || []);
    const [castes, setCastes] = useState(initialData?.allCaste || []);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const selectedYear = watch('ASMAY_Id');
    const selectedCourse = watch('AMCO_Id');
    const selectedBranch = watch('AMB_Id');
    const selectedCasteCategory = watch('IMCC_Id');
    const hasBpl = watch('has_bpl_card');

    const { fields: mobileFields, append: appendMobile, remove: removeMobile } = useFieldArray({ control, name: "mobilesstd" });
    const { fields: emailFields, append: appendEmail, remove: removeEmail } = useFieldArray({ control, name: "emailsstd" });

    useEffect(() => {
        if (selectedYear && selectedCourse) handleCourseChange(selectedCourse, selectedYear);
    }, [selectedCourse, selectedYear]);

    useEffect(() => {
        if (selectedYear && selectedBranch) handleBranchChange(selectedBranch, selectedYear);
    }, [selectedBranch, selectedYear]);

    useEffect(() => {
        if (selectedCasteCategory) handleCasteCategoryChange(selectedCasteCategory);
    }, [selectedCasteCategory]);

    const handleCourseChange = async (courseId: string, yearId: string) => {
        const res = await onCourseChange(Number(yearId), Number(courseId));
        if (res.success && res.data) {
            setBranches(res.data.branches || []);
            setValue('AMB_Id', '');
            setValue('AMSE_Id', '');
        }
    };

    const handleBranchChange = async (branchId: string, yearId: string) => {
        const res = await onBranchChange(Number(yearId), Number(branchId), 0);
        if (res.success && res.data) {
            setSemesters(res.data.semesters || []);
            setValue('AMSE_Id', '');
        }
    };

    const handleCasteCategoryChange = async (categoryId: string) => {
        const res = await getCasteByCategory(Number(categoryId));
        if (res.success && res.data) {
            setCastes(res.data || []);
            setValue('IMC_Id', '');
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setValue('AMCST_StudentPhoto', e.target.files[0]);
            setPhotoPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="grid gap-8 p-0">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-5 space-y-4">
                        <FormField control={control} name="AMCST_AdmNo" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Admission No: <span className="text-destructive">*</span></FormLabel>
                            <FormControl className="col-span-2"><Input placeholder="Admission No" {...field} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_RegistrationNo" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">RegNo:</FormLabel>
                            <FormControl className="col-span-2"><Input placeholder="Registration No" {...field} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <div className="grid grid-cols-3 items-start gap-4">
                            <FormLabel className="col-span-1 text-right mt-3">Student Name: <span className="text-destructive">*</span></FormLabel>
                            <div className="col-span-2 space-y-2">
                                <FormField control={control} name="AMCST_FirstName" render={({ field }) => (<FormItem><FormControl><Input placeholder="First Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <div className="grid grid-cols-2 gap-2">
                                    <FormField control={control} name="AMCST_MiddleName" render={({ field }) => (<FormItem><FormControl><Input placeholder="Middle Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={control} name="AMCST_LastName" render={({ field }) => (<FormItem><FormControl><Input placeholder="Last Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                            </div>
                        </div>

                        <FormField control={control} name="ASMAY_Id" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Academic Year: <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent>{initialData?.allAcademicYear?.map((y:any)=><SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>{y.asmaY_Year}</SelectItem>)}</SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCO_Id" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Course: <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent>{courses.map((c:any)=><SelectItem key={c.amcO_Id} value={c.amcO_Id.toString()}>{c.courseName}</SelectItem>)}</SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMB_Id" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Branch: <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCourse}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent>{branches.map((b:any)=><SelectItem key={b.amB_Id} value={b.amB_Id.toString()}>{b.branchName}</SelectItem>)}</SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMSE_Id" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Semester: <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedBranch}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent>{semesters.map((s:any)=><SelectItem key={s.amsE_Id} value={s.amsE_Id.toString()}>{s.semesterName}</SelectItem>)}</SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="ACMB_Id" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Batch: <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent><SelectItem value="1">Morning</SelectItem><SelectItem value="2">Evening</SelectItem></SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_Date" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Date of Admission: <span className="text-destructive">*</span></FormLabel>
                            <Popover><PopoverTrigger asChild><FormControl className="col-span-2"><Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "dd-MM-yyyy") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_DOB" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Date Of Birth: <span className="text-destructive">*</span></FormLabel>
                            <Popover><PopoverTrigger asChild><FormControl className="col-span-2"><Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "dd-MM-yyyy") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(d) => d > new Date() || d < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_DOBinwords" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">DOB in Words:</FormLabel>
                            <FormControl className="col-span-2"><Input placeholder="" className="bg-muted/50" readOnly {...field} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="IMCC_Id" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Caste Category: <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent>{initialData?.allCasteCategory?.map((c:any)=><SelectItem key={c.imcC_Id} value={c.imcC_Id.toString()}>{c.imcC_CategoryName}</SelectItem>)}</SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="IMC_Id" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Caste: <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCasteCategory}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent>{castes.map((c:any)=><SelectItem key={c.imC_Id} value={c.imC_Id.toString()}>{c.imC_CasteName}</SelectItem>)}</SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_SubCaste" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Sub Caste:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_BankAccountNo" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Student Bank Account No.:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_BirthPlace" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Student Birth Place:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_BirthCertNo" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Birth Certificate No.:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_CasteCertNo" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Caste Certificate No.:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_BiometricId" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Biometric Id:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_RFCardNo" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">RF Card No.:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_District" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">District:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="ACMS_Id" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Section:</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent>{initialData?.sectionList?.map((s:any)=><SelectItem key={s.acmS_Id} value={s.acmS_Id.toString()}>{s.acmS_SectionName}</SelectItem>)}</SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-5 space-y-4">
                        <FormField control={control} name="AMCST_Age" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Age: <span className="text-destructive">*</span></FormLabel>
                            <FormControl className="col-span-2"><Input className="bg-muted/50" readOnly placeholder="0" {...field} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_Sex" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Gender: <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_MotherTongue" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Mother Tongue:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="IVRMMR_Id" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Religion: <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent>{initialData?.allReligion?.map((r:any)=><SelectItem key={r.ivrmmR_Id} value={r.ivrmmR_Id.toString()}>{r.ivrmmR_Name}</SelectItem>)}</SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_Nationality" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Nationality: <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent>{initialData?.allcountry?.map((c:any)=><SelectItem key={c.ivrmmC_Id} value={c.ivrmmC_Id.toString()}>{c.ivrmmC_CountryName}</SelectItem>)}</SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        {/* Mobile Numbers */}
                        <div className="grid grid-cols-3 items-start gap-4">
                            <FormLabel className="col-span-1 text-right mt-3">Mobile Number: <span className="text-destructive">*</span></FormLabel>
                            <div className="col-span-2 space-y-2">
                                {mobileFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-center">
                                        <Select defaultValue="91">
                                            <SelectTrigger className="w-[80px]"><SelectValue placeholder="91" /></SelectTrigger>
                                            <SelectContent><SelectItem value="91">91</SelectItem></SelectContent>
                                        </Select>
                                        <FormField control={control} name={`mobilesstd.${index}.amcsT_MobileNo`} render={({ field }) => (
                                            <FormItem className="flex-1"><FormControl><Input placeholder="Mobile number" {...field} /></FormControl></FormItem>
                                        )} />
                                        <Button type="button" variant="outline" size="icon" onClick={() => index === 0 ? appendMobile({ acstsmS_CountryCode: '91', amcsT_MobileNo: '' }) : removeMobile(index)}>
                                            {index === 0 ? <Plus className="h-4 w-4" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Email IDs */}
                        <div className="grid grid-cols-3 items-start gap-4">
                            <FormLabel className="col-span-1 text-right mt-3">Email-ID: <span className="text-destructive">*</span></FormLabel>
                            <div className="col-span-2 space-y-2">
                                {emailFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-center">
                                        <div className="w-[40px] flex items-center justify-center border rounded-md h-10 bg-muted/20">@</div>
                                        <FormField control={control} name={`emailsstd.${index}.amcsT_emailId`} render={({ field }) => (
                                            <FormItem className="flex-1"><FormControl><Input placeholder="Email ID" type="email" {...field} /></FormControl></FormItem>
                                        )} />
                                        <Button type="button" variant="outline" size="icon" onClick={() => index === 0 ? appendEmail({ amcsT_emailId: '' }) : removeEmail(index)}>
                                            {index === 0 ? <Plus className="h-4 w-4" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <FormField control={control} name="AMCST_AadharNo" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Aadhaar No.:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_BloodGroup" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Blood Group:</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent><SelectItem value="A+">A+</SelectItem><SelectItem value="A-">A-</SelectItem><SelectItem value="B+">B+</SelectItem><SelectItem value="B-">B-</SelectItem><SelectItem value="O+">O+</SelectItem><SelectItem value="O-">O-</SelectItem><SelectItem value="AB+">AB+</SelectItem><SelectItem value="AB-">AB-</SelectItem></SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCOC_Id" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Student Category: <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent>{initialData?.allStudentCategory?.map((s:any)=><SelectItem key={s.amcoC_Id} value={s.amcoC_Id.toString()}>{s.amcoC_Name}</SelectItem>)}</SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="ACQ_Id" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Quota: <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent>{initialData?.allQuota?.map((q:any)=><SelectItem key={q.acQ_Id} value={q.acQ_Id.toString()}>{q.acQ_QuotaName}</SelectItem>)}</SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="ACQC_Id" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Quota Category: <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent>{initialData?.allQuotaCategory?.map((q:any)=><SelectItem key={q.acqC_Id} value={q.acqC_Id.toString()}>{q.acqC_CategoryName}</SelectItem>)}</SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="ACSS_Id" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Subject Scheme: <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent>{initialData?.allSubjectScheme?.map((s:any)=><SelectItem key={s.acsS_Id} value={s.acsS_Id.toString()}>{s.acsS_SchmeName}</SelectItem>)}</SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="ACST_Id" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Scheme Type: <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent>{initialData?.allSchemeType?.map((s:any)=><SelectItem key={s.acsT_Id} value={s.acsT_Id.toString()}>{s.acsT_SchmeType}</SelectItem>)}</SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <div className="grid grid-cols-3 items-center gap-4">
                            <div className="col-span-1 text-right flex items-center justify-end">
                                <FormField control={control} name="has_bpl_card" render={({ field }) => (
                                    <div className="flex items-center space-x-2">
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} id="bpl" />
                                        <label htmlFor="bpl" className="text-sm">EMIS No./BPL Card No.</label>
                                    </div>
                                )} />
                            </div>
                            <div className="col-span-2">
                                <FormField control={control} name="AMCST_BPLCardNo" render={({ field }) => (
                                    <FormItem><FormControl><Input placeholder="BPL Card No" disabled={!hasBpl} {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        </div>

                        <FormField control={control} name="AMCST_IFSCCode" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Bank IFSC Code:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_TPIN" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Student TPIN:</FormLabel>
                            <FormControl className="col-span-2"><Input className="bg-muted/50" readOnly {...field} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_Village" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Village:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_Taluk" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Taluk:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_UrbanRural" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1 text-right">Urban/Rural:</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Urban">Urban</SelectItem><SelectItem value="Rural">Rural</SelectItem></SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="is_divyangjan" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4">
                                <div className="col-span-2 col-start-2 flex items-center space-x-2">
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} id="divyangjan" />
                                    <label htmlFor="divyangjan" className="text-sm font-medium leading-none">DIVYANGJAN</label>
                                </div>
                            </FormItem>
                        )} />
                    </div>

                    {/* PHOTO COLUMN */}
                    <div className="lg:col-span-2 flex flex-col items-center gap-4">
                        <div className="w-full aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/20 relative overflow-hidden">
                            {photoPreview ? (
                                <Image src={photoPreview} alt="Student Photo" fill className="object-cover" />
                            ) : (
                                <div className="flex flex-col items-center text-muted-foreground p-4 text-center">
                                    <User className="h-12 w-12 mb-2 opacity-20" />
                                    <span className="text-xs">No Photo</span>
                                </div>
                            )}
                        </div>
                        <Button type="button" variant="default" className="w-full relative overflow-hidden bg-[#244b8a] hover:bg-[#1a3869]">
                            Upload Student Photo
                            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handlePhotoChange} />
                        </Button>
                    </div>

                </div>

                <div className="flex justify-center items-center gap-4 pt-8 pb-4">
                    <Button type="button" onClick={onNext} className="bg-[#244b8a] hover:bg-[#1a3869]">
                        SAVE AND PROCEED
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button type="button" variant="destructive" className="bg-[#f04a23] hover:bg-[#d03d1b]" onClick={() => window.location.reload()}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        CLEAR ALL
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
