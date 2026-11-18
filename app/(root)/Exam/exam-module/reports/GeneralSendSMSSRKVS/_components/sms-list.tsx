'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendGeneralSMSAndEmail } from '@/server/exam/exam-module/reports/GeneralSendSMSSRKVSController';
import { Loader2, Search, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

interface SMSListProps {
    data: any[];
    params: any;
}

export const SMSList = ({ data, params }: SMSListProps) => {
    const [students, setStudents] = useState<any[]>(data);
    const [searchValue, setSearchValue] = useState('');
    const [allSelected, setAllSelected] = useState(false);
    const [sendSms, setSendSms] = useState(false);
    const [sendEmail, setSendEmail] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const filteredStudents = students.filter(
        (s) =>
            s.AMST_Firstname?.toLowerCase().includes(searchValue.toLowerCase()) ||
            s.AMST_AdmNo?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const toggleAll = (checked: boolean) => {
        setAllSelected(checked);
        setStudents(students.map((s) => ({ ...s, selected: checked })));
    };

    const toggleStudent = (id: number, checked: boolean) => {
        const next = students.map((s) => (s.AMST_ID === id ? { ...s, selected: checked } : s));
        setStudents(next);
        setAllSelected(next.every((s) => s.selected));
    };

    const handleSend = async () => {
        const selected = students.filter((s) => s.selected);
        if (selected.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        if (!sendSms && !sendEmail) {
            toast.error('Please select SMS or EMAIL option');
            return;
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to Send ${sendSms ? 'SMS' : ''}${sendSms && sendEmail ? '/' : ''}${sendEmail ? 'EMAIL' : ''}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#075985',
            confirmButtonText: 'Yes, Send it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                setIsSending(true);
                const studentTemp = selected.map((itm) => {
                    let template = '';
                    let templateTwo = '';

                    itm.plannerdetails.forEach((p: any) => {
                        if (template !== '') {
                            template += ',%0a' + p.SMS;
                            templateTwo += ',<br/>' + p.SMS;
                        } else {
                            template += p.SMS;
                            templateTwo += p.SMS;
                        }
                    });

                    // Format based on legacy JS logic
                    const examName = 'Final Exam VIII';
                    const tempMail = `Dear Parent ,%0a Name:${itm.AMST_Firstname}%0a Reg No :${itm.AMST_AdmNo} %0a Exam: ${examName} \n\n${template} \n Thank You SRKVS`;
                    const smsMailText = `Dear Parent ,<br/>Name:   ${itm.AMST_Firstname}<br/>Reg No :  ${itm.AMST_AdmNo}<br/>Exam:   ${examName} <br/>  ${templateTwo}<br/>Thank You SRKVS`;

                    return {
                        AMST_MobileNo: itm.AMST_MobileNo,
                        mes: tempMail,
                        AMST_Id: itm.AMST_ID,
                        AMST_emailId: itm.AMST_emailId,
                        SmsMailText: smsMailText
                    };
                });

                const payload = {
                    studentlistdto: studentTemp,
                    ASMAY_Id: Number(params.ASMAY_Id),
                    ASMCL_Id: Number(params.ASMCL_Id),
                    ASMS_Id: Number(params.ASMS_Id),
                    EME_Id: 1, // Hardcoded as per legacy JS
                    radiotype: 'SRkvs',
                    snd_sms: sendSms,
                    snd_email: sendEmail
                };

                const response = await sendGeneralSMSAndEmail(payload);
                if (response?.success && response.data?.smsStatus === 'sent') {
                    Swal.fire('Success', 'SMS / EMAIL sent successfully!', 'success');
                } else {
                    Swal.fire('Error', 'Failed to send SMS / EMAIL', 'error');
                }
            } catch {
                toast.error('An error occurred while sending');
            } finally {
                setIsSending(false);
            }
        }
    };

    return (
        <div className='space-y-6 rounded-lg border bg-white p-6 shadow-sm'>
            <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                <h4 className='font-bold text-gray-900 uppercase'>Student List</h4>
                <div className='relative w-full max-w-xs'>
                    <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400' />
                    <Input
                        placeholder='Search student...'
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className='pl-10'
                    />
                </div>
            </div>

            <div className='overflow-x-auto rounded-md border'>
                <table className='w-full border-collapse text-sm'>
                    <thead>
                        <tr className='bg-gray-100 font-semibold text-gray-700'>
                            <th className='border p-3 text-center'>Sl No</th>
                            <th className='border p-3 text-center'>
                                <Checkbox checked={allSelected} onCheckedChange={(c) => toggleAll(!!c)} />
                            </th>
                            <th className='border p-3 text-left'>Student Name</th>
                            <th className='border p-3 text-left'>Adm No</th>
                            <th className='border p-3 text-left'>Email Id</th>
                            <th className='border p-3 text-left'>Mobile No</th>
                            {params.GradeWise === false && (
                                <>
                                    <th className='border p-3 text-center'>Total</th>
                                    <th className='border p-3 text-center'>Per(%)</th>
                                </>
                            )}
                            <th className='border p-3 text-left'>SMS Content</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((s, idx) => (
                            <tr key={s.AMST_ID} className='hover:bg-gray-50'>
                                <td className='border p-3 text-center'>{idx + 1}</td>
                                <td className='border p-3 text-center'>
                                    <Checkbox checked={s.selected} onCheckedChange={(c) => toggleStudent(s.AMST_ID, !!c)} />
                                </td>
                                <td className='border p-3 text-left font-medium'>{s.AMST_Firstname}</td>
                                <td className='border p-3 text-left'>{s.AMST_AdmNo}</td>
                                <td className='border p-3 text-left'>{s.AMST_emailId}</td>
                                <td className='border p-3 text-left'>{s.AMST_MobileNo}</td>
                                {params.GradeWise === false && (
                                    <>
                                        <td className='border p-3 text-center'>{s.Total}</td>
                                        <td className='border p-3 text-center'>{s.Percentage}%</td>
                                    </>
                                )}
                                <td className='border p-3 text-left'>
                                    <div className='max-w-xs space-y-1 text-gray-600 text-xs'>
                                        {s.plannerdetails?.map((p: any, pIdx: number) => (
                                            <p key={pIdx}>
                                                {p.SMS}
                                                {pIdx < s.plannerdetails.length - 1 ? ',' : ''}
                                            </p>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className='flex flex-col items-center gap-6 border-t pt-6'>
                <div className='flex items-center gap-8 rounded-lg border border-sky-100 bg-sky-50 px-8 py-3'>
                    <div className='flex items-center space-x-2'>
                        <Checkbox id='snd-sms' checked={sendSms} onCheckedChange={(c) => setSendSms(!!c)} />
                        <Label htmlFor='snd-sms' className='cursor-pointer font-bold text-sky-900'>
                            SMS
                        </Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <Checkbox id='snd-email' checked={sendEmail} onCheckedChange={(c) => setSendEmail(!!c)} />
                        <Label htmlFor='snd-email' className='cursor-pointer font-bold text-sky-900'>
                            EMAIL
                        </Label>
                    </div>
                </div>

                <div className='flex gap-4'>
                    <Button onClick={handleSend} disabled={isSending} size='lg' className='bg-sky-800 px-10 hover:bg-sky-900'>
                        {isSending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Send className='mr-2 h-4 w-4' />}
                        SEND
                    </Button>
                    <Button variant='outline' size='lg' onClick={() => window.location.reload()}>
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};
