'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { SearchForm } from './_components/search-form';
import { StudentTable } from '@/app/(root)/College/CollegeAdmission/Standarad/Clgusernamecreation/_components/student-table';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useCollegeUsernameCreationStudentDetails, useSaveCollegeUsernameCreation } from '@/hooks/college/useCollegeUsernameCreation';
import { toast } from 'sonner';

export default function ClgUsernameCreationPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
    const [studentType, setStudentType] = useState('Student');

    const { mutate: fetchStudentDetails } = useCollegeUsernameCreationStudentDetails();
    const { mutate: saveUsernames } = useSaveCollegeUsernameCreation();

    const handleSearch = (data: any) => {
        setStudentType(data.studentType);
        fetchStudentDetails(
            {
                asmayId: parseInt(data.academicYear),
                amcoId: parseInt(data.course),
                ambId: parseInt(data.branch),
                amseId: parseInt(data.semester),
                acmsId: parseInt(data.section),
                studentType: data.studentType
            },
            {
                onSuccess: (res) => {
                    if (res?.studentlist && res.studentlist.length > 0) {
                        setStudents(res.studentlist);
                    } else if (res?.data && res.data.length > 0) {
                        setStudents(res.data);
                    } else {
                        setStudents([]);
                        toast.error('No students found for the selected criteria');
                    }
                    setSelectedStudents([]);
                },
                onError: () => {
                    toast.error('Failed to fetch students');
                    setStudents([]);
                    setSelectedStudents([]);
                }
            }
        );
    };

    const handleClear = () => {
        setStudents([]);
        setSelectedStudents([]);
    };

    const handleSave = () => {
        if (selectedStudents.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        const payload = {
            studenttype: studentType,
            temp_Student: selectedStudents.map(student => ({
                amcsT_Id: student.amcsT_Id || student.id || student.amcst_id || 0,
                studentName: student.studentName || student.studentname || ''
            })),
            amcsT_FatherMobleNo: 0,
            amcsT_MotherMobleNo: 0,
            amcsT_MobileNo: 0
        };

        saveUsernames(payload, {
            onSuccess: (res) => {
                if (res?.success) {
                    toast.success(res?.message || 'Usernames Created Successfully');
                    handleClear();
                } else {
                    toast.error(res?.message || 'Failed to generate usernames');
                }
            },
            onError: () => {
                toast.error('An error occurred while saving');
            }
        });
    };

    return (
        <div className='min-h-screen'>
            <div className='container mx-auto space-y-4 p-1'>
                <CollapsibleSection title='User Name Creation' defaultOpen={true} variant='default' size='lg' className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <SearchForm onSearch={handleSearch} onClear={handleClear} />
                </CollapsibleSection>

                {students.length > 0 && (
                    <CollapsibleSection title='Students List' defaultOpen={true} variant='default' size='lg' className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <StudentTable data={students} studentType={studentType} onSelectionChange={setSelectedStudents} />

                        <div className="flex justify-center space-x-4 mt-6">
                            <Button type="button" onClick={handleSave} className="w-32 bg-primary">
                                <Save className="w-4 h-4 mr-2" /> Save
                            </Button>
                            <Button type="button" onClick={handleClear} variant="destructive" className="w-32">
                                Cancel
                            </Button>
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
