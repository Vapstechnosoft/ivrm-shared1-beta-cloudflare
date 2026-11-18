'use client';

import { useForm, FormProvider, Controller } from 'react-hook-form';
import { GenericSelectField, GenericInputField } from '@/components/ui/form/input-fields';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    useClgyearlycoursemappingData,
    useGetClgyearlycoursemappingBranches,
    useSearchClgyearlycoursemappingData,
} from '@/hooks/college/useClgyearlycoursemapping';
import { Input } from '@/components/ui/input';

interface MappingFormProps {
    onSave: (data: any, semesterList: any[]) => void;
    onClear: () => void;
}

export function MappingForm({ onSave, onClear }: MappingFormProps) {
    const methods = useForm();
    const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = methods;

    const { data: initialResponse, isLoading } = useClgyearlycoursemappingData();
    const initialData = initialResponse?.data || initialResponse;
    const getBranchesMutation = useGetClgyearlycoursemappingBranches();
    const searchDataMutation = useSearchClgyearlycoursemappingData();

    const [accYearList, setAccYearList] = useState<any[]>([]);
    const [courseList, setCourseList] = useState<any[]>([]);
    const [branchList, setBranchList] = useState<any[]>([]);
    const [semesterList, setSemesterList] = useState<any[]>([]);

    const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);
    const [courseEndDate, setCourseEndDate] = useState<Date | null>(null);

    const asmayId = watch('asmayId');
    const amcoId = watch('amcoId');
    const ambId = watch('ambId');
    const acaycNoOfSem = watch('acaycNoOfSem');

    useEffect(() => {
        if (initialData?.accyearlist) {
            setAccYearList(initialData.accyearlist);
        }
        if (initialData?.courselist) {
            setCourseList(initialData.courselist);
        }
    }, [initialData]);

    useEffect(() => {
        if (asmayId) {
            const selectedYear = accYearList.find(y => y.asmaY_Id === Number(asmayId));
            if (selectedYear) {
                setValue('courseStartDate', new Date(selectedYear.asmaY_From_Date));
                setValue('courseEndDate', new Date(selectedYear.asmaY_To_Date));
                setCourseStartDate(new Date(selectedYear.asmaY_From_Date));
                setCourseEndDate(new Date(selectedYear.asmaY_To_Date));
            }
        }
    }, [asmayId, accYearList, setValue]);

    useEffect(() => {
        if (asmayId && amcoId) {
            getBranchesMutation.mutate(
                { ASMAY_Id: asmayId, AMCO_Id: amcoId },
                {
                    onSuccess: (res) => {
                        const responseData = res?.data || res;
                        if (responseData?.branchlist) {
                            setBranchList(responseData.branchlist);
                        }
                        if (responseData?.getcourselist?.length > 0) {
                            const courseData = responseData.getcourselist[0];
                            setValue('courseStartDate', courseData.acayC_From_Date ? new Date(courseData.acayC_From_Date) : null);
                            setValue('courseEndDate', courseData.acayC_To_Date ? new Date(courseData.acayC_To_Date) : null);
                            
                            if (courseData.acayC_NoOfSEM != null) {
                                setValue('acaycNoOfSem', courseData.acayC_NoOfSEM);
                            } else {
                                const selectedCourse = courseList.find(c => c.amcO_Id === Number(amcoId));
                                if (selectedCourse) {
                                    setValue('acaycNoOfSem', selectedCourse.amcO_NoOfSemesters);
                                }
                            }
                        } else {
                            const selectedCourse = courseList.find(c => c.amcO_Id === Number(amcoId));
                            if (selectedCourse) {
                                setValue('acaycNoOfSem', selectedCourse.amcO_NoOfSemesters);
                            }
                        }
                    }
                }
            );
        }
    }, [asmayId, amcoId]);

    useEffect(() => {
        if (asmayId && amcoId && ambId) {
            searchDataMutation.mutate(
                { ASMAY_Id: asmayId, AMCO_Id: amcoId, AMB_Id: ambId, noofsem: acaycNoOfSem },
                {
                    onSuccess: (res) => {
                        const responseData = res?.data || res;
                        if (responseData?.branchlistdate?.length > 0) {
                            const bDate = responseData.branchlistdate[0];
                            setValue('branchPreAdmStartDate', bDate.acaycB_PreAdm_FDate ? new Date(bDate.acaycB_PreAdm_FDate) : null);
                            setValue('branchPreAdmEndDate', bDate.acaycB_PreAdm_TDate ? new Date(bDate.acaycB_PreAdm_TDate) : null);
                            setValue('branchPreAdmCutoffDate', bDate.acayB_ReferenceDate ? new Date(bDate.acayB_ReferenceDate) : null);
                        }
                        
                        // Try both semestert and semesterlistget in case it varies
                        const semesters = responseData?.semestert || responseData?.semesterlistget;
                        if (semesters) {
                            const mappedSemesters = semesters.map((sem: any) => {
                                const found = responseData.semesterlist?.find((s: any) => s.amsE_Id === sem.amsE_Id);
                                return {
                                    ...sem,
                                    xyz: !!found,
                                    acaycbS_SemStartDate: (found && found.acaycbS_SemStartDate) ? new Date(found.acaycbS_SemStartDate) : null,
                                    acaycbS_SemEndDate: (found && found.acaycbS_SemEndDate) ? new Date(found.acaycbS_SemEndDate) : null,
                                    ACAYCBS_SemOrder: found ? found.acaycbS_SemOrder : sem.amsE_SEMOrder
                                };
                            });
                            setSemesterList(mappedSemesters);
                        }
                    }
                }
            );
        }
    }, [asmayId, amcoId, ambId]);

    const handleSemesterToggle = (index: number, checked: boolean) => {
        const updatedList = [...semesterList];
        updatedList[index].xyz = checked;
        updatedList[index].acaycbS_SemStartDate = null;
        updatedList[index].acaycbS_SemEndDate = null;
        setSemesterList(updatedList);
    };

    const handleSemesterDateChange = (index: number, field: string, date: Date | null) => {
        const updatedList = [...semesterList];
        updatedList[index][field] = date;
        setSemesterList(updatedList);
    };

    const onSubmit = (data: any) => {
        onSave(data, semesterList);
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <GenericSelectField
                            name="asmayId"
                            label="Academic Year"
                            required
                            options={accYearList.map(y => ({ label: y.asmaY_Year, value: y.asmaY_Id.toString() }))}
                        />

                        <div className="flex flex-col gap-2">
                            <label className="after:ml-0.5 after:text-red-500 after:content-['*']">Course Start Date</label>
                            <Controller
                                control={control}
                                name="courseStartDate"
                                rules={{ required: 'Course Start Date is required' }}
                                render={({ field }) => (
                                    <DatePicker date={field.value} setDate={field.onChange} placeholder="Enter date" />
                                )}
                            />
                            {errors.courseStartDate && <span className="text-destructive text-xs">{errors.courseStartDate?.message as string}</span>}
                        </div>

                        <GenericSelectField
                            name="ambId"
                            label="Branch"
                            required
                            disabled={!branchList.length}
                            options={branchList.map(b => ({ label: b.amB_BranchName, value: b.amB_Id.toString() }))}
                        />

                        <div className="flex flex-col gap-2">
                            <label className="after:ml-0.5 after:text-red-500 after:content-['*']">Branch PreAdmission Start Date</label>
                            <Controller
                                control={control}
                                name="branchPreAdmStartDate"
                                rules={{ required: 'Start Date is required' }}
                                render={({ field }) => (
                                    <DatePicker date={field.value} setDate={field.onChange} placeholder="Enter date" />
                                )}
                            />
                            {errors.branchPreAdmStartDate && <span className="text-destructive text-xs">{errors.branchPreAdmStartDate?.message as string}</span>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="after:ml-0.5 after:text-red-500 after:content-['*']">Branch PreAdmission Cutoff Date</label>
                            <Controller
                                control={control}
                                name="branchPreAdmCutoffDate"
                                rules={{ required: 'Cutoff Date is required' }}
                                render={({ field }) => (
                                    <DatePicker date={field.value} setDate={field.onChange} placeholder="Enter date" />
                                )}
                            />
                            {errors.branchPreAdmCutoffDate && <span className="text-destructive text-xs">{errors.branchPreAdmCutoffDate?.message as string}</span>}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <GenericSelectField
                            name="amcoId"
                            label="Course"
                            required
                            options={courseList.map(c => ({ label: c.amcO_CourseName, value: c.amcO_Id.toString() }))}
                        />

                        <div className="flex flex-col gap-2">
                            <label className="after:ml-0.5 after:text-red-500 after:content-['*']">Course End Date</label>
                            <Controller
                                control={control}
                                name="courseEndDate"
                                rules={{ required: 'Course End Date is required' }}
                                render={({ field }) => (
                                    <DatePicker date={field.value} setDate={field.onChange} placeholder="Enter date" />
                                )}
                            />
                            {errors.courseEndDate && <span className="text-destructive text-xs">{errors.courseEndDate?.message as string}</span>}
                        </div>

                        <GenericInputField
                            name="acaycNoOfSem"
                            label="No.of Semester"
                            required
                            type="number"
                            placeholder="Enter No.of Semester"
                        />

                        <div className="flex flex-col gap-2">
                            <label className="after:ml-0.5 after:text-red-500 after:content-['*']">Branch PreAdmission End Date</label>
                            <Controller
                                control={control}
                                name="branchPreAdmEndDate"
                                rules={{ required: 'End Date is required' }}
                                render={({ field }) => (
                                    <DatePicker date={field.value} setDate={field.onChange} placeholder="Enter date" />
                                )}
                            />
                            {errors.branchPreAdmEndDate && <span className="text-destructive text-xs">{errors.branchPreAdmEndDate?.message as string}</span>}
                        </div>
                    </div>
                </div>

            {semesterList.length > 0 && (
                <div className="mt-8 border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-4 py-3">SL NO</th>
                                <th className="px-4 py-3">Select</th>
                                <th className="px-4 py-3">Semester Name</th>
                                <th className="px-4 py-3 text-center">From Date</th>
                                <th className="px-4 py-3 text-center">To Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {semesterList.map((sem, index) => (
                                <tr key={sem.amsE_Id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-3">{index + 1}</td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={sem.xyz}
                                            onChange={(e) => handleSemesterToggle(index, e.target.checked)}
                                            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                        />
                                    </td>
                                    <td className="px-4 py-3">{sem.amsE_SEMName}</td>
                                    <td className="px-4 py-3">
                                        <DatePicker
                                            date={sem.acaycbS_SemStartDate}
                                            setDate={(date: Date | undefined) => handleSemesterDateChange(index, 'acaycbS_SemStartDate', date ?? null)}
                                            disabled={!sem.xyz}
                                            placeholder="Enter date"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <DatePicker
                                            date={sem.acaycbS_SemEndDate}
                                            setDate={(date: Date | undefined) => handleSemesterDateChange(index, 'acaycbS_SemEndDate', date ?? null)}
                                            disabled={!sem.xyz}
                                            placeholder="Enter date"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="flex justify-center space-x-4 pt-6">
                <Button type="submit" className="w-32 bg-primary">
                    <Save className="w-4 h-4 mr-2" /> Save
                </Button>
                <Button type="button" onClick={() => { reset(); setSemesterList([]); onClear(); }} variant="destructive" className="w-32">
                    <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
            </div>
            </form>
        </FormProvider>
    );
}
