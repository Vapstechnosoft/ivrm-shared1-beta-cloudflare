import { StudentProfileUpdateForm } from './_components/StudentProfileUpdateForm';

export const metadata = {
    title: 'NDA Student Profile Update | Admission Portal',
    description: 'Update and manage your student profile details securely. Request updates for photos, contact information, and addresses.'
};

export default function NdaStudentProfileUpdatePage() {
    return (
        <div className='container mx-auto px-4 py-10 sm:px-6 lg:px-8'>
            <div className='mx-auto max-w-7xl'>
                <StudentProfileUpdateForm />
            </div>
        </div>
    );
}
