import { getdetailsAllFixing } from '@/server/timetable/constraints/fixing';
import {
    LabConstraintsGrid,
    getAcademicYearDropDownClasswise,
    getCategoryDropDown,
    getClassDropdown,
    getSectionDropDown,
    getSubjectDropDown
} from '@/server/timetable/constraints/labconstraints';
import { extractList } from '../fixing/_components/dayperiod/utils';
import LabConstraints from './_components/lab-constraints';

export const dynamic = 'force-dynamic';

export default async function LabConstraintsPage() {
    let initialData: any = {
        success: true,
        labconstraintslist: [],
        academicYearList: [],
        categoryList: [],
        dayList: [],
        periodList: []
    };

    try {
        const [dropdowns, grid, academicYears, categoryList, classList, SectionList, subjectList] = await Promise.all([
            getdetailsAllFixing(),
            LabConstraintsGrid(),
            getAcademicYearDropDownClasswise(),
            getCategoryDropDown(),
            getClassDropdown(),
            getSectionDropDown(),
            getSubjectDropDown()
        ]);

        const labList = await LabConstraintsGrid();
        console.log('Lab List:', labList);

        initialData = {
            ...dropdowns,
            academicYearList:
                extractList(academicYears, 'academicList') ||
                extractList(academicYears, 'academicYearList') ||
                dropdowns?.academicYearList ||
                [],
            categoryList:
                extractList(categoryList, 'catglist') || extractList(categoryList, 'categoryList') || dropdowns?.categoryList || [],
            classList: extractList(classList, 'classlist') || extractList(classList, 'classList') || dropdowns?.classList || [],
            sectionList: extractList(SectionList, 'sectionlist') || extractList(SectionList, 'sectionList') || dropdowns?.sectionList || [],
            subjectList: extractList(subjectList, 'subjectlist') || extractList(subjectList, 'subjectList') || dropdowns?.subjectList || [],
            labconstraintslist: extractList(grid, 'gridData') || grid?.labconstraintslist || []
        };
    } catch (error: any) {
        console.error('Failed to load lab constraints data:', error);
    }

    return <LabConstraints initialData={initialData} />;
}
