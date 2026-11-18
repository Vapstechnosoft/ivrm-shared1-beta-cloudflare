import { Label } from '@/components/ui/label';

interface StudentDetailsProps {
    details: {
        studentName: string;
        admNo: string;
        regNo: string;
        joinedYear: string;
        joinedClass: string;
        leftYear: string;
        leftClass: string;
        leftSection: string;
        tcNo: string;
        tcDate: string;
    };
}

export function StudentDetails({ details }: StudentDetailsProps) {
    return (
        <div className='space-y-4'>
            <div className='grid grid-cols-[140px_1fr] gap-2'>
                <Label className='text-right font-medium'>Student Name :</Label>
                <span className='font-bold'>{details.studentName}</span>
            </div>
            <div className='grid grid-cols-[140px_1fr] gap-2'>
                <Label className='text-right font-medium'>Admission No. :</Label>
                <span className='font-bold'>{details.admNo}</span>
            </div>
            <div className='grid grid-cols-[140px_1fr] gap-2'>
                <Label className='text-right font-medium'>Registration No. :</Label>
                <span className='font-bold'>{details.regNo}</span>
            </div>
            <div className='grid grid-cols-[140px_1fr] gap-2'>
                <Label className='text-right font-medium'>Joined Details :</Label>
                <span className='font-bold'>
                    {details.joinedYear} / {details.joinedClass}
                </span>
            </div>
            <div className='grid grid-cols-[140px_1fr] gap-2'>
                <Label className='text-right font-medium'>TC No. :</Label>
                <span className='font-bold'>{details.tcNo}</span>
            </div>
            <div className='grid grid-cols-[140px_1fr] gap-2'>
                <Label className='text-right font-medium'>TC Date :</Label>
                <span className='font-bold'>{details.tcDate}</span>
            </div>
            <div className='grid grid-cols-[140px_1fr] gap-2'>
                <Label className='text-right font-medium'>Left Details :</Label>
                <span className='font-bold'>
                    {details.leftYear} / {details.leftClass} / {details.leftSection}
                </span>
            </div>
        </div>
    );
}
