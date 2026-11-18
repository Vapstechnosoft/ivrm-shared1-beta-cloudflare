'use client';

import { Button } from '@/components/ui/button';
import { GenericSelectField } from '@/components/ui/form/input-fields';
import { Search, X } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { useCollegeUsernameCreation, useCollegeUsernameCreationOnYearChange, useCollegeUsernameCreationOnCourseChange, useCollegeUsernameCreationOnBranchChange, useCollegeUsernameCreationOnSemChange } from '@/hooks/college/useCollegeUsernameCreation';
import { useEffect, useState } from 'react';

interface SearchFormProps {
    onSearch: (data: any) => void;
    onClear: () => void;
}

export function SearchForm({ onSearch, onClear }: SearchFormProps) {
    const { data: initialData, isLoading } = useCollegeUsernameCreation();
    const { mutate: fetchOnYearChange } = useCollegeUsernameCreationOnYearChange();
    const { mutate: fetchOnCourseChange } = useCollegeUsernameCreationOnCourseChange();
    const { mutate: fetchOnBranchChange } = useCollegeUsernameCreationOnBranchChange();
    const { mutate: fetchOnSemChange } = useCollegeUsernameCreationOnSemChange();

    const [dropdownData, setDropdownData] = useState<any>({
        courselist: [],
        branchlist: [],
        semesterlist: [],
        sectionlist: []
    });
    
    const methods = useForm({
        defaultValues: {
            academicYear: '',
            course: '',
            branch: '',
            semester: '',
            studentType: '',
            section: ''
        }
    });

    const { handleSubmit, watch, reset } = methods;
    const studentType = watch('studentType');
    const academicYear = watch('academicYear');
    const course = watch('course');
    const branch = watch('branch');
    const semester = watch('semester');

    useEffect(() => {
        if (academicYear) {
            fetchOnYearChange(parseInt(academicYear), {
                onSuccess: (res) => {
                    setDropdownData((prev: any) => ({
                        ...prev,
                        courselist: res?.data || res?.courselist || [],
                        branchlist: res?.branchlist || [],
                        semesterlist: res?.semesterlist || [],
                        sectionlist: res?.sectionlist || []
                    }));
                }
            });
        } else {
            setDropdownData((prev: any) => ({
                ...prev,
                courselist: [],
                branchlist: [],
                semesterlist: [],
                sectionlist: []
            }));
        }
    }, [academicYear, fetchOnYearChange]);

    useEffect(() => {
        if (academicYear && course && course !== '0') {
            fetchOnCourseChange({ asmayId: parseInt(academicYear), amcoId: parseInt(course) }, {
                onSuccess: (res) => {
                    setDropdownData((prev: any) => ({
                        ...prev,
                        branchlist: res?.data || res?.branchlist || [],
                        semesterlist: res?.semesterlist || [],
                        sectionlist: res?.sectionlist || []
                    }));
                }
            });
        } else {
            setDropdownData((prev: any) => ({
                ...prev,
                branchlist: [],
                semesterlist: [],
                sectionlist: []
            }));
        }
    }, [academicYear, course, fetchOnCourseChange]);

    useEffect(() => {
        if (academicYear && course && course !== '0' && branch && branch !== '0') {
            fetchOnBranchChange({ asmayId: parseInt(academicYear), amcoId: parseInt(course), ambId: parseInt(branch) }, {
                onSuccess: (res) => {
                    setDropdownData((prev: any) => ({
                        ...prev,
                        semesterlist: res?.data || res?.semesterlist || [],
                        sectionlist: res?.sectionlist || []
                    }));
                }
            });
        } else {
            setDropdownData((prev: any) => ({
                ...prev,
                semesterlist: [],
                sectionlist: []
            }));
        }
    }, [academicYear, course, branch, fetchOnBranchChange]);

    useEffect(() => {
        if (academicYear && course && course !== '0' && branch && branch !== '0' && semester && semester !== '0') {
            fetchOnSemChange({ asmayId: parseInt(academicYear), amcoId: parseInt(course), ambId: parseInt(branch), amseId: parseInt(semester) }, {
                onSuccess: (res) => {
                    setDropdownData((prev: any) => ({
                        ...prev,
                        sectionlist: res?.data || res?.sectionlist || []
                    }));
                }
            });
        } else {
            setDropdownData((prev: any) => ({
                ...prev,
                sectionlist: []
            }));
        }
    }, [academicYear, course, branch, semester, fetchOnSemChange]);

    const onSubmit = (data: any) => {
        onSearch(data);
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                    <GenericSelectField
                        name="academicYear"
                        label="Academic Year"
                        options={initialData?.data?.map((item: any) => ({
                            label: item.asmaY_Year,
                            value: item.asmaY_Id.toString()
                        })) || initialData?.yearlist?.map((item: any) => ({
                            label: item.asmaY_Year,
                            value: item.asmaY_Id.toString()
                        })) || []}
                        required
                    />
                    <GenericSelectField
                        name="course"
                        label="Course"
                        options={[{ label: 'All', value: '0' }, ...(dropdownData.courselist?.map((item: any) => ({
                            label: item.amcO_CourseName,
                            value: item.amcO_Id.toString()
                        })) || [])]}
                        required
                    />
                    <GenericSelectField
                        name="branch"
                        label="Branch"
                        options={[{ label: 'All', value: '0' }, ...(dropdownData.branchlist?.map((item: any) => ({
                            label: item.amB_BranchName,
                            value: item.amB_Id.toString()
                        })) || [])]}
                        required
                    />
                    <GenericSelectField
                        name="semester"
                        label="Semester"
                        options={[{ label: 'All', value: '0' }, ...(dropdownData.semesterlist?.map((item: any) => ({
                            label: item.amsE_SEMName,
                            value: item.amsE_Id.toString()
                        })) || [])]}
                        required
                    />
                    <GenericSelectField
                        name="studentType"
                        label="Student Type"
                        options={[
                            { label: 'Student', value: 'Student' },
                            { label: 'Alumni', value: 'Alumni' }
                        ]}
                        required
                    />
                    <GenericSelectField
                        name="section"
                        label="Section"
                        options={[{ label: 'All', value: '0' }, ...(dropdownData.sectionlist?.map((item: any) => ({
                            label: item.acmS_SectionName,
                            value: item.acmS_Id.toString()
                        })) || [])]}
                        required
                        disabled={studentType === 'Alumni'}
                    />
                </div>
                <div className="flex justify-center space-x-4 border-t pt-4">
                    <Button type="submit" className="w-32 bg-primary">
                        <Search className="w-4 h-4 mr-2" /> Search
                    </Button>
                    <Button type="button" variant="destructive" onClick={() => { reset(); onClear(); }} className="w-32">
                        <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}
