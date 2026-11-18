import type { IUserAccessibleModules } from '@/types';

export const timetableModule: IUserAccessibleModules = {
    id: 6,
    name: 'Time Table',
    icon: 'Clock',
    menu: [
        {
            id: 1,
            name: 'Time Table',
            icon: 'Clock',
            sub_menu: [
                {
                    id: 1,
                    name: 'Masters',
                    icon: 'Clock',
                    pages: [
                        {
                            id: 1,
                            name: 'Master Day',
                            icon: 'Clock',
                            url: '/timetable/masters/masterday',
                            title: 'Master Day',
                            description: 'Manage Master Day Details'
                        },
                        {
                            id: 9,
                            name: 'Master Day Class Wise',
                            icon: 'Clock',
                            url: '/timetable/masters/masterdayclasswise',
                            title: 'Master Day Class Wise',
                            description: 'Manage Master Day Class Wise Details'
                        },
                        {
                            id: 2,
                            name: 'Master Building',
                            icon: 'Clock',
                            url: '/timetable/masters/masterbuilding',
                            title: 'Master Building',
                            description: 'Manage Master Building Details'
                        },
                        {
                            id: 3,
                            name: 'Staff Abbreviation',
                            icon: 'Clock',
                            url: '/timetable/masters/staffabbreviations',
                            title: 'Staff Abbreviation',
                            description: 'Manage Staff Abbreviation Details'
                        },
                        {
                            id: 4,
                            name: 'Subject Abbreviation',
                            icon: 'Clock',
                            url: '/timetable/masters/subjectabbreviations',
                            title: 'Subject Abbreviation',
                            description: 'Manage Subject Abbreviation Details'
                        },
                        {
                            id: 5,
                            name: 'Category Class Mapping',
                            icon: 'Clock',
                            url: '/timetable/masters/categoryclassmapping',
                            title: 'Category Class Mapping',
                            description: 'Manage Category Class Mapping Details'
                        },
                        {
                            id: 6,
                            name: 'Master Category',
                            icon: 'Clock',
                            url: '/timetable/masters/mastercategory',
                            title: 'Master Category',
                            description: 'Manage Master Category Details'
                        },
                        {
                            id: 7,
                            name: 'Master Break Time Settings',
                            icon: 'Clock',
                            url: '/timetable/masters/breaktimesettings',
                            title: 'Master Break Time Settings',
                            description: 'Manage Master Break Time Settings Details'
                        },
                        {
                            id: 8,
                            name: 'Master Period',
                            icon: 'Clock',
                            url: '/timetable/masters/masterperiod',
                            title: 'Master Period',
                            description: 'Manage Master Period Details'
                        },
                        {
                            id: 10,
                            name: 'Period Distribution',
                            icon: 'Clock',
                            url: '/timetable/masters/perioddistribution',
                            title: 'Period Distribution',
                            description: 'Manage Period Distribution Details'
                        },
                        {
                            id: 11,
                            name: 'Period Allocation Master Period',
                            icon: 'Clock',
                            url: '/timetable/masters/periodallocationmasterperiod',
                            title: 'Period Allocation Master Period',
                            description: 'Manage Period Allocation Master Period Details'
                        },
                        {
                            id: 12,
                            name: 'Master Period Class',
                            icon: 'Clock',
                            url: '/timetable/masters/masterperiodclass',
                            title: 'Master Period Class',
                            description: 'Manage Master Period Class Details'
                        },
                        {
                            id: 13,
                            name: 'Period Time Setting',
                            icon: 'Clock',
                            url: '/timetable/masters/periodtimesetting',
                            title: 'Period Time Setting',
                            description: 'Manage Period Time Settings'
                        }
                    ]
                },
                {
                    id: 3,
                    name: 'Constraints',
                    icon: 'Clock',
                    pages: [
                        {
                            id: 1,
                            name: 'Bifurcation Constraints',
                            icon: 'Clock',
                            url: '/timetable/constraints/bifurcationconstraints',
                            title: 'Bifurcation Constraints',
                            description: 'Manage Bifurcation Constraints Details'
                        },
                        {
                            id: 2,
                            name: 'consecutive',
                            icon: 'Clock',
                            url: '/timetable/constraints/consecutive',
                            title: 'Consecutive Constraints',
                            description: 'Manage Consecutive Constraints Details'
                        },
                        {
                            id: 3,
                            name: 'Fixing',
                            icon: 'Clock',
                            url: '/timetable/constraints/fixing',
                            title: 'Fixing Constraints',
                            description: 'Manage Fixing Constraints Details'
                        },
                        {
                            id: 4,
                            name: 'Lab Constraints',
                            icon: 'Clock',
                            url: '/timetable/constraints/labconstraints',
                            title: 'Lab Constraints',
                            description: 'Manage Lab Constraints Details'
                        },
                        {
                            id: 5,
                            name: 'Subject Restrictions',
                            icon: 'Clock',
                            url: '/timetable/constraints/subjectrestriction',
                            title: 'Subject Restrictions',
                            description: 'Manage Subject Restrictions Details'
                        }
                    ]
                },
                {
                    id: 4,
                    name: 'Transactions',
                    icon: 'Clock',
                    pages: [
                        {
                            id: 1,
                            name: 'Class Section Time Table Report',
                            icon: 'Clock',
                            url: '/timetable/transactions/class-section-report/class-section-report',
                            title: 'Class Section Time Table Report',
                            description: 'View and generate class-wise timetable grids'
                        },
                        {
                            id: 2,
                            name: 'Deputation',
                            icon: 'Clock',
                            url: '/timetable/transactions/deputation',
                            title: 'Deputation',
                            description: 'ABSENT STAFF ALLOTMENT DETAILS'
                        },
                        {
                            id: 3,
                            name: 'Manual Period Insertion',
                            icon: 'Clock',
                            url: '/timetable/transactions/manualperiodinsertion',
                            title: 'Manual Period Insertion',
                            description: 'ABSENT STAFF ALLOTMENT DETAILS'
                        },
                        {
                            id: 4,
                            name: 'Staff Period Transfer',
                            icon: 'Clock',
                            url: '/timetable/transactions/staffperiodtransfer',
                            title: 'Staff Period Transfer',
                            description: 'Transfer Staff Periods Between Classes and Sections'
                        },
                        {
                            id: 5,
                            name: 'Staff Replacement Existing To New',
                            icon: 'Clock',
                            url: '/timetable/transactions/staffreplacementexistingtonew',
                            title: 'Staff Replacement Existing To New',
                            description: 'Replacing staff Existing To New'
                        },
                        {
                            id: 6,
                            name: 'Staff Replacement In Their TimeTable',
                            icon: 'Clock',
                            url: '/timetable/transactions/staffreplacementintheirtimetable',
                            title: 'Staff Replacement In Their TimeTable',
                            description: 'Staff Replacement In Their TimeTable'
                        },
                        {
                            id: 7,
                            name: 'Staff Replacement In Unallocated Period',
                            icon: 'Clock',
                            url: '/timetable/transactions/staffreplacementinunallocatedperiod',
                            title: 'Staff Replacement In Unallocated Period',
                            description: 'Staff Replacement In Unallocated Period'
                        },
                        {
                            id: 8,
                            name: 'Time Table Generation',
                            icon: 'Clock',
                            url: '/timetable/transactions/timetablegeneration',
                            title: 'Time Table Generation',
                            description: 'Time Table Generation'
                        },
                        {
                            id: 9,
                            name: 'Deputation New',
                            icon: 'Clock',
                            url: '/timetable/transactions/deputationnew',
                            title: 'Deputation New',
                            description: 'Absent Staff Allotment Details'
                        }
                    ]
                },
                {
                    id: 2,
                    name: 'Reports',
                    icon: 'Clock',
                    pages: [
                        {
                            id: 1,
                            name: 'Consolidated Report',
                            icon: 'Clock',
                            url: '/timetable/reports/consolidated',
                            title: 'Consolidated Report',
                            description: 'TimeTable Consolidated Report'
                        },
                        {
                            id: 2,
                            name: 'Class Wise TimeTable',
                            icon: 'Clock',
                            url: '/timetable/reports/classwisett',
                            title: 'Class Wise TimeTable',
                            description: 'Class Wise TimeTable Report'
                        },
                        {
                            id: 3,
                            name: 'Subject Wise TimeTable',
                            icon: 'Clock',
                            url: '/timetable/reports/subjectwisett',
                            title: 'Subject Wise TimeTable',
                            description: 'Subject Wise TimeTable Report'
                        },
                        {
                            id: 4,
                            name: 'Staff Wise TimeTable',
                            icon: 'Clock',
                            url: '/timetable/reports/staffwisett',
                            title: 'Staff Wise TimeTable',
                            description: 'Staff Wise TimeTable Report'
                        },
                        {
                            id: 5,
                            name: 'Deputation Report',
                            icon: 'Clock',
                            url: '/timetable/reports/deputationreport',
                            title: 'Deputation Report',
                            description: 'Deputation Report'
                        },
                        {
                            id: 6,
                            name: 'Time Table Month End Report',
                            icon: 'Clock',
                            url: '/timetable/reports/ttmonthendreport',
                            title: 'Time Table Month End Report',
                            description: 'Time Table Month End Report'
                        }
                    ]
                }
            ]
        }
    ]
};
