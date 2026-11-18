'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface StudentHeaderSummaryProps {
    student: any;
}

export const StudentHeaderSummary = ({ student }: StudentHeaderSummaryProps) => {
    if (!student) return null;

    // Helper to get value or dash
    const val = (v: any) => v || '-';

    const InfoRow = ({ label, value }: { label: string; value: any }) => (
        <div className='flex flex-col gap-1 md:flex-row md:items-center md:gap-2'>
            <Label className='w-40 font-semibold text-muted-foreground text-xs md:text-sm'>{label}</Label>
            <span className='font-semibold text-indigo-900 text-sm md:text-base'> : {val(value)}</span>
        </div>
    );

    return (
        <Card className='mb-4 border-none bg-white shadow-sm'>
            <div className='mb-2 border-indigo-100 border-b bg-indigo-50/50 p-2'>
                <h3 className='font-bold text-indigo-800 text-sm uppercase tracking-wide'>Student Details</h3>
            </div>
            <CardContent className='p-4'>
                <div className='flex flex-col gap-6 lg:flex-row'>
                    {/* Left Details */}
                    <div className='grid flex-1 grid-cols-1 gap-x-12 gap-y-3 md:grid-cols-2'>
                        <InfoRow label='Registration No.' value={student.amst_registrationno || student.amsT_RegistrationNo} />
                        <InfoRow label='Admission No.' value={student.admno || student.amsT_AdmNo} />
                        <InfoRow
                            label='Class/Section'
                            value={`${val(student.asmcl_classname || student.asmcL_ClassName)} / ${val(student.asmc_sectionname || student.asmC_SectionName)}`}
                        />
                        <InfoRow
                            label='Joined Year / Class'
                            value={`${val(student.asmay_year || student.asmaY_Year)} / ${val(student.classstudying || student.classStudying)}`}
                        />
                        <InfoRow label='Father Name' value={student.father || student.amsT_FatherName} />
                        <InfoRow label='Category' value={student.imc_castename || student.casteName} />
                        <InfoRow
                            label='DOB'
                            value={
                                student.amst_dob
                                    ? new Date(student.amst_dob).toLocaleDateString()
                                    : student.amsT_Dob
                                      ? new Date(student.amsT_Dob).toLocaleDateString()
                                      : '-'
                            }
                        />
                        <InfoRow label='DOB Words' value={student.amst_dob_words || student.amsT_DOB_Words} />
                    </div>

                    {/* Right Photo */}
                    <div className='flex flex-shrink-0 justify-center lg:justify-end'>
                        <div className='flex h-32 w-24 items-center justify-center overflow-hidden rounded-md border bg-gray-100 shadow-sm'>
                            {student.amst_photoname ? (
                                <img src={student.amst_photoname} alt='Student' className='h-full w-full object-cover' />
                            ) : (
                                <span className='text-gray-400 text-xs'>No Photo</span>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
