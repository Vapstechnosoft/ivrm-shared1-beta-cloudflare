import { Card, CardContent } from '@/components/ui/card';
import type { EmployeeProfileDetail } from '@/types/hrms/reports/employee-profile-report';
import { format } from 'date-fns';

interface EmployeeProfileCardProps {
    profile: EmployeeProfileDetail & {
        institutionName?: string;
        institutionAddress?: string;
        institutionPincode?: string;
    };
}

export function EmployeeProfileCard({ profile }: EmployeeProfileCardProps) {
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'dd-MM-yyyy');
        } catch (e) {
            return dateString;
        }
    };

    return (
        <Card className='mb-6 overflow-hidden print:mb-8 print:break-inside-avoid print:border-none print:p-0 print:shadow-none'>
            <CardContent className='p-6 print:p-0'>
                {/* Header removed from here to be displayed once per page */}

                {/* Profile Details */}
                <div className='flex flex-col gap-6 md:flex-row print:flex-row'>
                    {/* Left Data Column */}
                    <div className='flex-1'>
                        <table className='w-full text-sm print:text-xs'>
                            <tbody>
                                <DetailRow label='Employee Code' value={profile.employeeCode} />
                                <DetailRow label='Name of Employee' value={profile.employeeName} className='uppercase' />
                                <DetailRow label='Designation' value={profile.designation} />
                                <DetailRow label='Contact Details' value={profile.contactDetails} />
                                <DetailRow label='Email-Id' value={profile.emailId} />
                                <DetailRow label='Join Date' value={formatDate(profile.joinDate)} />
                                <DetailRow label='Left Date' value={formatDate(profile.leftDate)} />
                                <DetailRow label='Total no. Of Service' value={profile.totalService} />
                                <DetailRow label='Blood Group' value={profile.bloodGroup} />
                                <DetailRow label='Address' value={profile.address} />
                                <DetailRow label='Age' value={profile.age ? `${profile.age}` : 'N/A'} />
                                <DetailRow label='Religion' value={profile.religion} />
                                <DetailRow label='DOB' value={formatDate(profile.dob)} />
                                <DetailRow label='AdharCard Number' value={profile.aadharCardNumber} />
                                <DetailRow label='Father Name' value={profile.fatherName} />
                            </tbody>
                        </table>
                    </div>

                    {/* Right Image Column */}
                    <div className='flex w-full justify-center md:block md:w-48 print:w-40'>
                        {/* Fallback image placeholder or actual photo */}
                        <div
                            className={`h-40 w-32 border-2 ${profile.hrmE_Photo ? 'bg-muted' : 'border-primary'} flex items-center justify-center bg-slate-50 print:border-black`}>
                            {profile.hrmE_Photo ? (
                                <img src={profile.hrmE_Photo} alt='Employee Photo' className='h-full w-full object-cover' />
                            ) : (
                                <span className='text-gray-500 text-xs'>No Photo</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Signature Section */}
                <div className='mt-16 text-right print:mt-24'>
                    <div className='mr-8 inline-block text-center'>
                        <div className='mx-auto mb-2 w-48 border-black border-t'></div>
                        <p className='font-semibold text-sm'>Signature of Nodal Officer</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function DetailRow({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) {
    return (
        <tr className='border-gray-100 border-t border-b last:border-0 print:border-gray-200'>
            <td className='w-1/3 py-2 font-bold text-gray-600 print:w-40 print:text-black'>{label}</td>
            <td className='w-4 px-2 py-2 font-bold text-gray-500 print:text-black'>:</td>
            <td className={`px-8 py-2 font-bold text-gray-900 print:text-black ${className}`}>{value || 'N/A'}</td>
        </tr>
    );
}
