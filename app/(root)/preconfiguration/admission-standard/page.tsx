import AdmissionStandardForm from './_components/admission-standard-form';

export const metadata = {
    title: 'Admission Standard | Preconfiguration',
    description: 'Configure admission standards and settings'
};

export default function AdmissionStandardPage() {
    return (
        <div className='container mx-auto py-6'>
            <AdmissionStandardForm />
        </div>
    );
}
