import { getSubjectRestrictionDetails } from '@/server/timetable/constraints/subjectrestriction';
import SubjectRestriction from './_components/subject-restriction';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function SubjectRestrictionPage(props: { searchParams: SearchParams }) {
    const searchParams = await props.searchParams;
    let initialData = null;
    try {
        initialData = await getSubjectRestrictionDetails();
    } catch (error: any) {
        initialData = {
            success: false,
            message: error?.message || 'Failed to load details',
            // Define empty lists for each tab if needed to prevent crashes
            dayperiodlist: [],
            daystafflist: [],
            daysubjectlist: [],
            periodstafflist: [],
            periodsubjectlist: []
        };
    }

    return <SubjectRestriction initialData={initialData} searchParams={searchParams} />;
}
