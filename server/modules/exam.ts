import type { IUserAccessibleModules } from '@/types';

export const examModule: IUserAccessibleModules = {
    id: 3,
    name: 'Exam',
    icon: 'BookOpen',
    menu: [
        {
            id: 3,
            name: 'Exam Module',
            icon: 'BookOpen',
            sub_menu: [
                {
                    id: 999,
                    name: 'OMR EVALUATION',
                    icon: 'BookOpen',
                    pages: [
                        {
                            id: 300,
                            name: 'OMR Sheet Evaluator',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/omr-evaluation/omr-mark-sheet-evaluation',
                            title: 'OMR Sheet Evaluator',
                            description: 'Evaluate OMR mark sheets'
                        },
                        {
                            id: 1000,
                            name: 'AI MCQ Quiz',
                            icon: 'Trophy',
                            url: '/Exam/exam-module/online-quiz/online-mcq-quiz',
                            title: 'AI MCQ Quiz',
                            description: 'Conduct and manage online MCQ quizzes'
                        }
                    ]
                },
                {
                    id: 9,
                    name: 'Configuration',
                    icon: 'Settings',
                    pages: [
                        {
                            id: 58,
                            name: 'Exam Standard',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/configurations/exam-standard',
                            title: 'Exam Standard',
                            description: 'Manage Exam Standard Details'
                        }
                    ]
                },
                {
                    id: 7,
                    name: 'Masters',
                    icon: 'Settings',
                    pages: [
                        {
                            id: 44,
                            name: 'Master Subject',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/masters/master-subject',
                            title: 'Master Subject',
                            description: 'Manage Master Subject Details'
                        },
                        {
                            id: 45,
                            name: 'Master Sub-Subject',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/masters/master-sub-subject',
                            title: 'Master Sub-Subject',
                            description: 'Manage Master Sub-Subject Details'
                        },
                        {
                            id: 46,
                            name: 'Master Exam',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/masters/exam-master',
                            title: 'Master Exam',
                            description: 'Manage Master Exam Details'
                        },
                        {
                            id: 47,
                            name: 'Master Sub-Exam',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/masters/sub-exam-master',
                            title: 'Master Sub-Exam',
                            description: 'Manage Master Sub-Exam Details'
                        },
                        {
                            id: 48,
                            name: 'Master Exam Paper',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/masters/exam-paper-master',
                            title: 'Master Exam Paper',
                            description: 'Manage Master Exam Paper Details'
                        },
                        {
                            id: 49,
                            name: 'Master Grade',
                            icon: 'Settings',
                            url: '/Exam/exam-module/masters/master-grade',
                            title: 'Master Grade',
                            description: 'Manage Master Grade Details'
                        },
                        {
                            id: 50,
                            name: 'Master Subject Group',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/masters/master-group',
                            title: 'Master Subject Group',
                            description: 'Manage Master Subject Group Details'
                        },
                        {
                            id: 51,
                            name: 'Master Category',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/masters/master-category',
                            title: 'Master Category',
                            description: 'Manage Master Category Details'
                        },
                        {
                            id: 52,
                            name: 'Category Class Mapping',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/masters/category-class-mapping',
                            title: 'Category Class Mapping',
                            description: 'Manage Category Class Mapping Details'
                        },
                        {
                            id: 200,
                            name: 'Co-Scholastic Activities',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/masters/co-scholastic-activities',
                            title: 'Co-Scholastic Activities',
                            description: 'Manage Co-Scholastic Activities Details'
                        },
                        {
                            id: 201,
                            name: 'Co-Scholastic Area',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/masters/co-scholastic-area',
                            title: 'Co-Scholastic Area',
                            description: 'Manage Co-Scholastic Area Details'
                        },
                        {
                            id: 202,
                            name: 'Life Skills',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/masters/life-skills',
                            title: 'Life Skills',
                            description: 'Manage Life Skills Details'
                        },
                        {
                            id: 203,
                            name: 'Life-Skills Area',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/masters/life-skills-area',
                            title: 'Life Skills Area',
                            description: 'Manage Life Skills Area Details'
                        }
                    ]
                },
                {
                    id: 8,
                    name: 'Exam Mapping',
                    icon: 'Settings',
                    pages: [
                        {
                            id: 53,
                            name: 'Exam Subject Wizard',
                            icon: 'CalendarDays',
                            url: '/Exam/exam-module/exam-mapping/exam-subject-wizard',
                            title: 'Exam Subject Wizard',
                            description: 'Manage Exam Subject Wizard Details'
                        },
                        {
                            id: 54,
                            name: 'Exam Login Privilages',
                            icon: 'CalendarDays',
                            url: '/Exam/exam-module/exam-mapping/exam-login-privilages',
                            title: 'Exam Login Privilages',
                            description: 'Manage Exam Login Privilages Details'
                        },
                        {
                            id: 55,
                            name: 'Yearly category Subject Mapping',
                            icon: 'CalendarDays',
                            url: '/Exam/exam-module/exam-mapping/yearly-category-subject-mapping',
                            title: 'Yearly category Subject Mapping',
                            description: 'Manage Yearly category Subject Mapping Details'
                        },
                        {
                            id: 56,
                            name: 'Yearly Category Date Mapping',
                            icon: 'CalendarDays',
                            url: '/Exam/exam-module/exam-mapping/yearly-category-dates-mapping',
                            title: 'Yearly Category Date Mapping',
                            description: 'Manage Yearly Category Date Mapping Details'
                        },
                        {
                            id: 57,
                            name: 'Exam Subject Group Mapping',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/exam-mapping/exam-subject-group-mapping',
                            title: 'Subject Group Mapping',
                            description: 'Manage Exam Subject Group Mapping Details'
                        },
                        {
                            id: 58,
                            name: 'Exam Term And Exam Mapping',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/exam-mapping/exam-term-and-exam-mapping',
                            title: 'Exam Term And Exam Mapping',
                            description: 'Manage Exam Term And Exam Mapping Details'
                        },
                        {
                            id: 59,
                            name: 'Co-Scholastic Activity Area Mapping',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/exam-mapping/co-scholastic-activitiy-area-mapping',
                            title: 'Co-Scholastic Activity Area Mapping',
                            description: 'Manage Co-Scholastic Activity Area Mapping Details'
                        },
                        {
                            id: 60,
                            name: 'Life Skill Area Mapping',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/exam-mapping/lifeskill-area-mapping',
                            title: 'Life Skill Area Mapping',
                            description: 'Manage Life Skill Area Mapping Details'
                        },
                        {
                            id: 61,
                            name: 'Exam Marks Process Condition',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/exam-mapping/exam-marks-process-condition',
                            title: 'Exam Marks Process Condition',
                            description: 'Manage Exam Marks Process Condition Details'
                        },
                        {
                            id: 62,
                            name: 'Hall Ticket Generation',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/exam-mapping/exam-hall-ticket-generation',
                            title: 'Hall Ticket Generation',
                            description: 'Manage Hall Ticket Generation Details'
                        },
                        {
                            id: 63,
                            name: 'Student Subject Mapping',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/exam-mapping/student-subject-mapping',
                            title: 'Student Subject Mapping',
                            description: 'Manage Student Subject Mapping Details'
                        },
                        {
                            id: 64,
                            name: 'Promotion Setting',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/exam-mapping/promotion-setting',
                            title: 'Promotion Setting',
                            description: 'Manage Promotion Setting Details'
                        },
                        {
                            id: 95,
                            name: 'Student Transaction',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/exam-mapping/student-transactioncce',
                            title: 'Student Transaction',
                            description: 'Manage Student Transaction Details'
                        }
                    ]
                },
                {
                    id: 400,
                    name: 'Marks Entry',
                    icon: 'Settings',
                    pages: [
                        {
                            id: 63,
                            name: 'Exam Wise Student Remarks Entry',
                            icon: 'CalendarDays',
                            url: '/Exam/exam-module/marks-entry/exam-wise-student-remarks-entry',
                            title: 'Exam Wise Student Remarks Entry',
                            description: 'Manage Exam Wise Student Remarks Entry Details'
                        },
                        {
                            id: 64,
                            name: 'Promotion Remarks',
                            icon: 'CalendarDays',
                            url: '/Exam/exam-module/marks-entry/exam-promotion-remarks',
                            title: 'PROMOTION REMARKS',
                            description: ''
                        },
                        {
                            id: 65,
                            name: 'Marks Entry',
                            icon: 'CalendarDays',
                            url: '/Exam/exam-module/marks-entry/exam-marks-entry',
                            title: 'Marks Entry',
                            description: 'Manage Marks Entry Details'
                        },
                        {
                            id: 66,
                            name: 'Student Wise Publish Marks',
                            icon: 'CalendarDays',
                            url: '/Exam/exam-module/marks-entry/student-wise-publish-marks',
                            title: 'Student Marks Publish',
                            description: 'Manage Student Marks Publish Details'
                        }
                    ]
                },
                {
                    id: 11,
                    name: 'Marks Calculation',
                    icon: 'BookOpen',
                    pages: [
                        {
                            id: 72,
                            name: 'Exam Marks Calculation',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/calculation/marks-calculation',
                            title: 'Exam Marks Calculation',
                            description: 'Manage Exam Marks Calculation Details'
                        },
                        {
                            id: 93,
                            name: 'Promotion Calculation',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/calculation/promotion-calculation',
                            title: 'Promotion Calculation',
                            description: 'Manage Promotion Calculation Details'
                        }
                    ]
                },
                {
                    id: 10,
                    name: 'Reports',
                    icon: 'Settings',
                    pages: [
                        {
                            id: 70,
                            name: 'Cumulative Report',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/reports/cumulative-report',
                            title: 'Cumulative Report',
                            description: 'Manage Cumulative Report Details'
                        },
                        {
                            id: 71,
                            name: 'Progress Card Report',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/reports/vvehpc_exam-report-card',
                            title: 'Progress Card Report',
                            description: 'Manage Progress Card Report Details'
                        },
                        {
                            id: 65,
                            name: 'Elective Subject Report',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/reports/exam-electives-report',
                            title: 'Elective Subject Report',
                            description: 'Manage Elective Subject Report Details'
                        },
                        {
                            id: 73,
                            name: 'Exam Month End Report',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/reports/exam-month-end-report',
                            title: 'Exam Month End Report',
                            description: 'Manage Exam Month End Report Details'
                        },
                        {
                            id: 74,
                            name: 'Exam Category Report',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/reports/exam-category-report',
                            title: 'Exam Category Report',
                            description: 'Manage Exam Category Report Details'
                        },
                        {
                            id: 77,
                            name: 'Percentagewise Details Report',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/reports/percentagewise-details-report',
                            title: 'Percentagewise Details Report',
                            description: 'Manage Percentagewise Student Details Report'
                        },
                        {
                            id: 78,
                            name: 'Grade Slab Report',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/reports/grade-slab-report',
                            title: 'Grade Slab Report',
                            description: 'View Grade Slab Details'
                        },
                        {
                            id: 79,
                            name: 'Toppers List Report',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/reports/toppers-list-report',
                            title: 'Toppers List Report',
                            description: 'View Toppers List Details'
                        },
                        {
                            id: 80,
                            name: 'Exam Login Privileges Report',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/reports/exam-login-privileges-report',
                            title: 'Exam Login Privileges Report',
                            description: 'View Exam Login Privileges Details'
                        },
                        {
                            id: 81,
                            name: 'Marks Entry Report',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/reports/marks-entry-report',
                            title: 'Marks Entry Report',
                            description: 'View Marks Entry Report Details'
                        },
                        {
                            id: 82,
                            name: 'Tabulation Report',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/reports/promotion-details-report',
                            title: 'Tabulation Report',
                            description: 'View Tabulation Report'
                        },
                        {
                            id: 83,
                            name: 'Juniors Progress Card Report',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/reports/juniors-progress-card-report',
                            title: 'Juniors Progress Card Report',
                            description: 'View Juniors Progress Card Report'
                        },
                        {
                            id: 84,
                            name: 'Report Card VI_VIII',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/reports/Report_Card_VI_VIII',
                            title: 'Report Card VI_VIII',
                            description: 'Report Card VI_VIII'
                        },
                        {
                            id: 85,
                            name: 'Report Card X_XII',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/reports/Report_Card_X_XII',
                            title: 'Report Card X_XII',
                            description: 'Report Card X_XII'
                        },
                        {
                            id: 86,
                            name: 'Report Card XI',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/reports/Report_Card_XI',
                            title: 'Report Card XI',
                            description: 'Report Card XI'
                        },
                        {
                            id: 87,
                            name: 'Report Card_IX',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/reports/Report_Card_IX',
                            title: 'Report Card_IX',
                            description: 'Report Card_IX'
                        },
                        {
                            id: 88,
                            name: 'Report Card_X',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/reports/Report_Card_X',
                            title: 'Report Card_X',
                            description: 'Report Card_X'
                        },
                        {
                            id: 89,
                            name: 'TBSchoolPrimary',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/reports/TBSchoolPrimary',
                            title: 'TBSchoolPrimary',
                            description: 'View TBSchoolPrimary Report'
                        },
                        {
                            id: 90,
                            name: 'HHS Progress Card Preparatory',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/reports/Hutching/HHSReport_Preparatory',
                            title: 'HHS Progress Card Preparatory',
                            description: 'View HHS Progress Card Preparatory Details'
                        },
                        {
                            id: 91,
                            name: 'HHS Progress Card 1st to 4th',
                            icon: 'BookOpen',
                            url: '/Exam/exam-module/reports/Hutching/HHSIIVReport',
                            title: 'HHS Progress Card 1st to 4th',
                            description: 'View HHS Progress Card 1st to 4th Details'
                        }
                    ]
                }
            ]
        }
    ]
};
