import type { IUserAccessibleModules } from '@/types';

export const admissionModule: IUserAccessibleModules = {
    id: 1,
    name: 'Admission',
    icon: 'UserRoundPlus',
    menu: [
        {
            id: 1,
            name: 'Preadmission',
            icon: 'UserCog',
            sub_menu: [
                {
                    id: 1,
                    name: 'Masters',
                    icon: 'Settings',
                    pages: [
                        {
                            id: 1,
                            name: 'Master Class',
                            icon: 'Settings',
                            url: '/admission/preadmission/masters/class',
                            title: 'Master Class',
                            description: 'Manage Master Class Details'
                        },
                        {
                            id: 2,
                            name: 'Master Category',
                            icon: 'Settings',
                            url: '/admission/preadmission/masters/category',
                            title: 'Master Category',
                            description: 'Manage Master Category Details'
                        },
                        {
                            id: 3,
                            name: 'Master Section',
                            icon: 'Settings',
                            url: '/admission/preadmission/masters/section',
                            title: 'Master Section',
                            description: 'Manage Master Section Details'
                        },
                        {
                            id: 4,
                            name: 'Master Class Category',
                            icon: 'Settings',
                            url: '/admission/preadmission/masters/class-category',
                            title: 'Master Class Category',
                            description: 'Manage Master Class Category Details'
                        },
                        {
                            id: 5,
                            name: 'Master Religion',
                            icon: 'Settings',
                            url: '/admission/preadmission/masters/religion',
                            title: 'Master Religion',
                            description: 'Manage Master Religion Details'
                        },
                        {
                            id: 6,
                            name: 'Master Caste Category',
                            icon: 'Settings',
                            url: '/admission/preadmission/masters/caste-category',
                            title: 'Master Caste Category',
                            description: 'Manage Master Caste Category Details'
                        },
                        {
                            id: 7,
                            name: 'Master Caste',
                            icon: 'Settings',
                            url: '/admission/preadmission/masters/caste',
                            title: 'Master Caste',
                            description: 'Manage Master Caste Details'
                        },
                        {
                            id: 8,
                            name: 'Master Document',
                            icon: 'Settings',
                            url: '/admission/preadmission/masters/document',
                            title: 'Master Document',
                            description: 'Manage Master Document Details'
                        },
                        {
                            id: 9,
                            name: 'Master Reference',
                            icon: 'Settings',
                            url: '/admission/preadmission/masters/reference',
                            title: 'Master Reference',
                            description: 'Manage Master Reference Details'
                        },
                        {
                            id: 10,
                            name: 'Master Source',
                            icon: 'Settings',
                            url: '/admission/preadmission/masters/source',
                            title: 'Master Source',
                            description: 'Manage Master Source Details'
                        },
                        {
                            id: 11,
                            name: 'Master Religion Caste Category',
                            icon: 'Settings',
                            url: '/admission/preadmission/masters/religion-caste-category',
                            title: 'Master Religion Caste Category',
                            description: 'Manage Master Religion Caste Category Details'
                        },
                        {
                            id: 1290,
                            name: 'Master Class Teacher',
                            icon: 'Settings',
                            url: '/admission/preadmission/masters/class-teacher',
                            title: 'Master Class Teacher',
                            description: 'Manage Master Class Teacher Details'
                        },
                        {
                            id: 13,
                            name: 'Master Class Held',
                            icon: 'Settings',
                            url: '/admission/preadmission/masters/class-held',
                            title: 'Master Class Held',
                            description: 'Manage Master Class Held '
                        },
                        {
                            id: 88,
                            name: 'Active Deactive Students',
                            icon: 'Settings',
                            url: '/admission/preadmission/masters/active-deactive-students',
                            title: 'Active Deactive Students',
                            description: 'Active Deactive Students'
                        }
                    ]
                },
                {
                    id: 2,
                    name: 'Transactions',
                    icon: 'Settings',
                    pages: [
                        {
                            id: 1211,
                            name: 'Preadmission Form',
                            icon: 'Settings',
                            url: '/admission/preadmission/transactions/application-form',
                            title: 'Preadmission Form',
                            description: 'Apply for Preadmission'
                        },
                        {
                            id: 13,
                            name: 'Transfer Application Status',
                            icon: 'Settings',
                            url: '/admission/preadmission/transactions/transfer-application-status',
                            title: 'Transfer Application Status',
                            description: 'Manage Transfer Application Status Details'
                        },
                        {
                            id: 14,
                            name: 'Transfer Admission Status',
                            icon: 'Settings',
                            url: '/admission/preadmission/transactions/transfer-admission-status',
                            title: 'Transfer Admission Status',
                            description: 'Manage Transfer Admission Status Details'
                        },
                        {
                            id: 15,
                            name: 'Transfer to Admission',
                            icon: 'Settings',
                            url: '/admission/preadmission/transactions/export-preadmission-to-admission',
                            title: 'Transfer to Admission',
                            description: 'Transfer confirmed preadmission applications to admission'
                        },
                        {
                            id: 16,
                            name: 'Document View',
                            icon: 'Settings',
                            url: '/admission/preadmission/transactions/document-view',
                            title: 'Document View',
                            description: ' Document View'
                        }
                    ]
                },
                {
                    id: 3,
                    name: 'Configuration',
                    icon: 'Settings',
                    pages: [
                        {
                            id: 17,
                            name: 'Master Academic Year',
                            icon: 'Settings',
                            url: '/admission/preadmission/configuration/academic-year',
                            title: 'Master Academic Year ',
                            description: 'Master Academic Year '
                        },
                        {
                            id: 18,
                            name: 'Master Configuration',
                            icon: 'Settings',
                            url: '/admission/preadmission/configuration/master-configuration',
                            title: 'Master Configuration',
                            description: 'Master Configuration'
                        },
                        {
                            id: 19,
                            name: 'Registration Numbering',
                            icon: 'Settings',
                            url: '/admission/preadmission/configuration/registration-numbering',
                            title: 'Registration Numbering',
                            description: 'Registration Numbering'
                        },
                        {
                            id: 20,
                            name: 'Pre-Registration Numbering',
                            icon: 'Settings',
                            url: '/admission/preadmission/configuration/pre-registration-numbering',
                            title: 'Pre-Registration Numbering',
                            description: 'Pre-Registration Numbering'
                        }
                    ]
                },

                {
                    id: 4,
                    name: 'Section Allotment',
                    icon: 'Settings',
                    pages: [
                        {
                            id: 21,
                            name: 'New Section',
                            icon: 'Settings',
                            url: '/admission/preadmission/section/new-section',
                            title: 'New Section ',
                            description: 'New Section'
                        },
                        {
                            id: 22,
                            name: 'Change Section',
                            icon: 'Settings',
                            url: '/admission/preadmission/section/change-section',
                            title: 'Change Section',
                            description: 'Change Section'
                        },
                        {
                            id: 23,
                            name: 'Delete Student Section',
                            icon: 'Settings',
                            url: '/admission/preadmission/section/delete-student-section',
                            title: 'Delete Student Section',
                            description: 'Delete Student Section'
                        },
                        {
                            id: 24,
                            name: 'Promotion Section',
                            icon: 'Settings',
                            url: '/admission/preadmission/section/promotion-section',
                            title: 'Promotion Section',
                            description: 'Promotion Section'
                        },
                        {
                            id: 25,
                            name: 'Year Loss Section',
                            icon: 'Settings',
                            url: '/admission/preadmission/section/year-loss-section',
                            title: 'Year Loss Section',
                            description: 'Year Loss Section'
                        },
                        {
                            id: 26,
                            name: 'Update Roll Number',
                            icon: 'Settings',
                            url: '/admission/preadmission/section/update-roll-number',
                            title: 'Update Roll Number',
                            description: 'Update Roll Number'
                        },
                        {
                            id: 27,
                            name: 'Change Class',
                            icon: 'Settings',
                            url: '/admission/preadmission/section/change-class',
                            title: 'Change Class',
                            description: 'Change Class'
                        }
                    ]
                },

                {
                    id: 5,
                    name: 'Reports',
                    icon: 'Settings',
                    pages: [
                        {
                            id: 1,
                            name: 'student Count Report',
                            icon: 'Settings',
                            url: '/admission/preadmission/reports/student-count-report',
                            title: 'student Count Report',
                            description: 'student Count Report'
                        },
                        {
                            id: 2,
                            name: 'Registration Report',
                            icon: 'Settings',
                            url: '/admission/preadmission/reports/registration-report',
                            title: 'Registration Report',
                            description: 'Registration Report'
                        },
                        {
                            id: 3,
                            name: 'EMAIL SMS Report',
                            icon: 'Settings',
                            url: '/admission/preadmission/reports/email-sms',
                            title: 'EMAIL SMS Report',
                            description: 'EMAIL SMS Report'
                        },
                        {
                            id: 4,
                            name: 'PreAdmission Month End Report',
                            icon: 'Settings',
                            url: '/admission/preadmission/reports/preadmission-month-end-report',
                            title: 'PreAdmission Month End Report',
                            description: 'PreAdmission Month End Report'
                        }
                    ]
                },
                {
                    id: 6,
                    name: 'Attendance Entry',
                    icon: 'Settings',
                    pages: [
                        {
                            id: 1,
                            name: 'Entry Type',
                            icon: 'Settings',
                            url: '/admission/preadmission/attendance-entry/attendance_entry_type',
                            title: 'Attendance Entry Type',
                            description: 'Manage attendance entry types'
                        },
                        {
                            id: 2,
                            name: 'Login Privileges',
                            icon: 'Settings',
                            url: '/admission/preadmission/attendance-entry/login-privileges',
                            title: 'Login Privileges',
                            description: 'Manage attendance login privileges'
                        },
                        {
                            id: 3,
                            name: 'Student Attendance',
                            icon: 'Settings',
                            url: '/admission/preadmission/attendance-entry/student-attendance',
                            title: 'Student Attendance',
                            description: 'Enter student attendance'
                        }
                    ]
                },
                {
                    id: 7,
                    name: 'Student TC',
                    icon: 'Settings',
                    pages: [
                        {
                            id: 1,
                            name: 'Apply TC',
                            icon: 'Settings',
                            url: '/admission/preadmission/student-transfer-certificate/apply',
                            title: 'Apply TC',
                            description: 'Apply for Student Transfer Certificate'
                        },
                        {
                            id: 2,
                            name: 'Cancel TC',
                            icon: 'Settings',
                            url: '/admission/preadmission/student-transfer-certificate/cancel',
                            title: 'Cancel TC',
                            description: 'Cancel Student Transfer Certificate'
                        }
                    ]
                }
            ]
        },
        {
            id: 2,
            name: 'Admission',
            icon: 'UserCog',
            sub_menu: [
                {
                    id: 1,
                    name: 'Application',
                    icon: 'Settings',
                    pages: [
                        {
                            id: 1,
                            name: 'Admission Form',
                            icon: 'Settings',
                            url: '/admission/preadmission/admission-form',
                            title: 'Admission Form',
                            description: 'Apply For Admission'
                        }
                    ]
                },
                {
                    id: 2,
                    name: 'Reports',
                    icon: 'Settings',
                    pages: [
                        {
                            id: 1,
                            name: 'Class Teacher Report',
                            icon: 'Settings',
                            url: '/admission/preadmission/reports/class-teacher-report',
                            title: 'Class Teacher Report',
                            description: 'Class Teacher Report'
                        },
                        {
                            id: 2,
                            name: 'Student Yearly Attendance Report',
                            icon: 'Settings',
                            url: '/admission/preadmission/reports/students-yearly-attendence-report',
                            title: 'Student Yearly Attendance Report',
                            description: 'Student Yearly Attendance Report'
                        },
                        {
                            id: 3,
                            name: 'Student TC Report',
                            icon: 'Settings',
                            url: '/admission/preadmission/reports/student-tc-report',
                            title: 'Student TC Report',
                            description: 'Student TC Report'
                        },
                        {
                            id: 4,
                            name: 'class-wise student details',
                            icon: 'Settings',
                            url: '/admission/preadmission/reports/class-wise-student-details',
                            title: 'class-wise student details',
                            description: 'class-wise student details'
                        },

                        {
                            id: 5,
                            name: 'Total Strength Report',
                            icon: 'Settings',
                            url: '/admission/preadmission/reports/total-strength',
                            title: 'Total Strength Report',
                            description: 'Total Strength Report'
                        },
                        {
                            id: 6,
                            name: 'Admission Register Report',
                            icon: 'Settings',
                            url: '/admission/preadmission/reports/admission-register',
                            title: 'Admission Register Report',
                            description: 'Admission Register Report '
                        },
                        {
                            id: 7,
                            name: 'Attendance Absentees Report',
                            icon: 'Settings',
                            url: '/admission/preadmission/reports/attendance-absent-sms',
                            title: 'Attendance Absentees Report',
                            description: 'Attendance Absentees Report'
                        },
                        {
                            id: 8,
                            name: 'Student Search',
                            icon: 'Settings',
                            url: '/admission/preadmission/reports/student-search',
                            title: 'Student Search',
                            description: 'Student Search'
                        },
                        {
                            id: 9,
                            name: 'Month End Report',
                            icon: 'Settings',
                            url: '/admission/preadmission/reports/month-end-report',
                            title: 'Month End Report',
                            description: 'Month End Report'
                        },

                        {
                            id: 10,
                            name: 'Study Certificate Report',
                            icon: 'Settings',
                            url: '/admission/preadmission/reports/study-certificate-report',
                            title: 'Study Certificate Report',
                            description: 'Study Certificate Report'
                        },
                        {
                            id: 11,
                            name: 'Date Of Birth Report',
                            icon: 'Settings',
                            url: '/admission/preadmission/reports/date-of-birth-report',
                            title: 'Date Of Birth Report',
                            description: 'Date Of Birth Report'
                        },
                        {
                            id: 12,
                            name: 'Overall Daily Attendance Report',
                            icon: 'Settings',
                            url: '/admission/preadmission/reports/overall-daily-attendance-report',
                            title: 'Overall Daily Attendance Report',
                            description: 'Overall Daily Attendance Report'
                        },
                        {
                            id: 13,
                            name: 'Student Attendance Report',
                            icon: 'Settings',
                            url: '/admission/preadmission/reports/student-attendance-report',
                            title: 'Student Attendance Report',
                            description: 'Student Attendance Report'
                        }
                    ]
                }
            ]
        }
    ]
};
