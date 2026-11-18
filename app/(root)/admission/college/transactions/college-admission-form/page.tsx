import { getInitialData } from '@/server/college/CollegeAdmission/Transactions/clgadmission-form';
import { AdmissionFormWrapper } from './_components/admission-form-wrapper';

export const dynamic = 'force-dynamic';

export default async function CollegeAdmissionFormPage() {
    const initialData = await getInitialData();

    return (
        <div className='container mx-auto space-y-6 py-6'>
            <div className='flex flex-col gap-2'>
                <h1 className='font-bold text-3xl tracking-tight'>College Student Admission Form</h1>
                <p className='text-muted-foreground'>Fill in the details to enroll a new student.</p>
            </div>

            <AdmissionFormWrapper initialData={initialData?.data || {}} />
        </div>
    );
}
