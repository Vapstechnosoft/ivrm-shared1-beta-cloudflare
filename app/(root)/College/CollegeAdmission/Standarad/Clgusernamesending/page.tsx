'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { SearchForm } from './_components/search-form';
import { StudentTable } from '@/app/(root)/College/CollegeAdmission/Standarad/Clgusernamesending/_components/student-table';
import { useState } from 'react';
import { Printer, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useCollegeUsernameCreationStudentUsername, useSendCollegeUsernameCreationSMS } from '@/hooks/college/useCollegeUsernameCreation';
import { toast } from 'sonner';

export default function ClgUsernameSendingPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
    const [studentType, setStudentType] = useState('Student');
    const [sendEmail, setSendEmail] = useState(true);
    const [sendSms, setSendSms] = useState(true);

    const { mutate: fetchStudentUsernames } = useCollegeUsernameCreationStudentUsername();
    const { mutate: sendSMS } = useSendCollegeUsernameCreationSMS();

    const handleSearch = (data: any) => {
        setStudentType(data.studentType);
        fetchStudentUsernames(
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

    const handleSend = () => {
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
            temp_Student_SMS: selectedStudents.map(student => ({
                amcsT_Id: student.amcsT_Id || student.id || student.amcst_id || 0,
                studentName: student.studentName || student.studentname || '',
                username: student.username || student.userName || '',
                password: student.password || student.passWord || '',
                amcsT_emailId: student.emailId || student.amcsT_emailId || '',
                amcsT_MobileNo: student.mobileNo || student.amcsT_MobileNo || 0
            })),
            amcsT_FatherMobleNo: 0,
            amcsT_MotherMobleNo: 0,
            smsFlag: sendSms,
            emailFlag: sendEmail
        };

        sendSMS(payload, {
            onSuccess: (res) => {
                if (res?.success) {
                    toast.success(res?.message || 'Credentials sent successfully');
                    handleClear();
                } else {
                    toast.error(res?.message || 'Failed to send credentials');
                }
            },
            onError: () => {
                toast.error('An error occurred while sending');
            }
        });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className='min-h-screen'>
            <div className='container mx-auto space-y-4 p-1'>
                <CollapsibleSection title='SMS & Email Sending' defaultOpen={true} variant='default' size='lg' className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <SearchForm onSearch={handleSearch} onClear={handleClear} />
                </CollapsibleSection>

                {students.length > 0 && (
                    <CollapsibleSection title='Students List' defaultOpen={true} variant='default' size='lg' className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <StudentTable data={students} onSelectionChange={setSelectedStudents} />

                        <div className="flex items-center justify-center space-x-6 my-6 p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="send-email" checked={sendEmail} onCheckedChange={(checked) => setSendEmail(checked as boolean)} />
                                <label htmlFor="send-email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    EMAIL
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="send-sms" checked={sendSms} onCheckedChange={(checked) => setSendSms(checked as boolean)} />
                                <label htmlFor="send-sms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    SMS
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-center space-x-4">
                            <Button type="button" onClick={handleSend} className="w-32 bg-primary">
                                <Send className="w-4 h-4 mr-2" /> SEND
                            </Button>
                            <Button type="button" onClick={handlePrint} variant="outline" className="w-32">
                                <Printer className="w-4 h-4 mr-2" /> Print
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
