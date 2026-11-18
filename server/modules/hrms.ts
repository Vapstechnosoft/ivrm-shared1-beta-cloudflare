import type { IUserAccessibleModules } from '@/types';

export const hrmsModule: IUserAccessibleModules = {
    id: 4,
    name: 'HRMS',
    icon: 'Users',
    menu: [
        {
            id: 1,
            name: 'HRMS Config',
            icon: 'Settings',
            sub_menu: [
                {
                    id: 101,
                    name: 'AI ATS',
                    icon: 'BrainCircuit',
                    pages: [
                        {
                            id: 1,
                            name: 'AI Resume checker',
                            icon: 'FileSearch',
                            url: '/hrms/ai-ats/resume-checker',
                            title: 'AI Resume checker',
                            description: 'Upload resumes and job descriptions for AI-powered ATS scoring and skill gap analysis.'
                        }
                    ]
                },
                {
                    id: 1,
                    name: 'Masters',
                    icon: 'Database',
                    pages: [
                        {
                            id: 1,
                            name: 'Earnings & Deductions',
                            icon: 'DollarSign',
                            url: '/hrms/masters/earnings-deductions',
                            title: 'Earnings & Deductions',
                            description: 'Manage Salary Components'
                        },
                        {
                            id: 2,
                            name: 'Bank',
                            icon: 'Building2',
                            url: '/hrms/masters/bank',
                            title: 'Bank Master',
                            description: 'Manage Bank Details'
                        },
                        {
                            id: 3,
                            name: 'Gender',
                            icon: 'Users',
                            url: '/hrms/masters/gender',
                            title: 'Gender Master',
                            description: 'Manage Gender Details'
                        },
                        {
                            id: 4,
                            name: 'Course',
                            icon: 'BookOpen',
                            url: '/hrms/masters/course',
                            title: 'Course Master',
                            description: 'Manage Course Details'
                        },
                        {
                            id: 5,
                            name: 'Marital Status',
                            icon: 'Heart',
                            url: '/hrms/masters/marital-status',
                            title: 'Marital Status Master',
                            description: 'Manage Marital Status'
                        },
                        {
                            id: 6,
                            name: 'Specialization',
                            icon: 'GraduationCap',
                            url: '/hrms/masters/specialization',
                            title: 'Specialization Master',
                            description: 'Manage Specialization Details'
                        },
                        {
                            id: 7,
                            name: 'Employee Type',
                            icon: 'Users',
                            url: '/hrms/masters/employee-type',
                            title: 'Employee Type Master',
                            description: 'Manage Employee Types'
                        },
                        {
                            id: 8,
                            name: 'Group Type',
                            icon: 'Layers',
                            url: '/hrms/masters/group-type',
                            title: 'Group Type Master',
                            description: 'Manage Group Types'
                        },
                        {
                            id: 9,
                            name: 'Department',
                            icon: 'Building2',
                            url: '/hrms/masters/department',
                            title: 'Department Master',
                            description: 'Manage Departments'
                        },
                        {
                            id: 10,
                            name: 'Designation',
                            icon: 'Award',
                            url: '/hrms/masters/designation',
                            title: 'Designation Master',
                            description: 'Manage Designations'
                        },
                        {
                            id: 11,
                            name: 'Grade',
                            icon: 'Trophy',
                            url: '/hrms/masters/grade',
                            title: 'Grade Master',
                            description: 'Manage Grades'
                        },
                        {
                            id: 1288,
                            name: 'Group-Dept-Desig Mapping',
                            icon: 'Network',
                            url: '/hrms/masters/group-dept-dessg-mapping',
                            title: 'Group-Dept-Desig Mapping',
                            description: 'Map Group, Department & Designation'
                        },
                        {
                            id: 13,
                            name: 'Leave Year',
                            icon: 'Calendar',
                            url: '/hrms/masters/leave-year',
                            title: 'Leave Year Master',
                            description: 'Manage Leave Year'
                        },
                        {
                            id: 14,
                            name: 'Professional Tax',
                            icon: 'FileText',
                            url: '/hrms/masters/professional-tax',
                            title: 'Professional Tax Slab',
                            description: 'Manage Professional Tax'
                        },
                        {
                            id: 15,
                            name: 'Loan',
                            icon: 'CreditCard',
                            url: '/hrms/masters/loan',
                            title: 'Loan Master',
                            description: 'Manage Loan Types'
                        },
                        {
                            id: 16,
                            name: 'Payroll Standard',
                            icon: 'Calculator',
                            url: '/hrms/masters/payroll-standard',
                            title: 'Payroll Standard',
                            description: 'Manage Payroll Standards'
                        },
                        {
                            id: 17,
                            name: 'Religion-Category Mapping',
                            icon: 'Link',
                            url: '/hrms/masters/religion-category-mapping',
                            title: 'Religion-Category Mapping',
                            description: 'Map Religion & Category'
                        }
                    ]
                },
                {
                    id: 3,
                    name: 'Transactions',
                    icon: 'FileText',
                    pages: [
                        {
                            id: 4,
                            name: 'Salary Updation',
                            icon: 'Edit',
                            url: '/hrms/transactions/salary-updation',
                            title: 'Salary Updation',
                            description: 'Update Employee Salary'
                        },
                        {
                            id: 5,
                            name: 'Mass Updation',
                            icon: 'RefreshCw',
                            url: '/hrms/transactions/mass-updation',
                            title: 'Mass Updation',
                            description: 'Bulk Update Employee Data'
                        },
                        {
                            id: 7,
                            name: 'Employee Loan',
                            icon: 'CreditCard',
                            url: '/hrms/transactions/employee-loan',
                            title: 'Employee Loan',
                            description: 'Manage Employee Loans'
                        }
                    ]
                },
                {
                    id: 4,
                    name: 'Reports',
                    icon: 'FileText',
                    pages: [
                        {
                            id: 1,
                            name: 'Cumulative Salary Report',
                            icon: 'BarChart3',
                            url: '/hrms/reports/cumulative-salary-report',
                            title: 'Cumulative Salary Report',
                            description: 'Cumulative Salary Analysis'
                        },
                        {
                            id: 4,
                            name: 'Salary Slip',
                            icon: 'Receipt',
                            url: '/hrms/reports/salary-slip',
                            title: 'Salary Slip',
                            description: 'Generate Salary Slips'
                        },
                        {
                            id: 5,
                            name: 'E-PF Contribution Register',
                            icon: 'Coins',
                            url: '/hrms/reports/e-pf-contribution-register',
                            title: 'E-PF Contribution Register',
                            description: 'E-PF Contribution Register Report'
                        },
                        {
                            id: 7,
                            name: 'Employee Strength',
                            icon: 'Users',
                            url: '/hrms/reports/employee-strength',
                            title: 'Employee Strength',
                            description: 'Employee Strength Report'
                        },
                        {
                            id: 8,
                            name: 'ESI Report',
                            icon: 'Shield',
                            url: '/hrms/reports/esi-report',
                            title: 'ESI Report',
                            description: 'ESI Contribution Report'
                        },
                        {
                            id: 13,
                            name: 'PF Challan',
                            icon: 'FileCheck',
                            url: '/hrms/reports/pf-challan',
                            title: 'PF Challan',
                            description: 'Provident Fund Challan'
                        },
                        {
                            id: 14,
                            name: 'Form 10',
                            icon: 'FileType',
                            url: '/hrms/reports/pf-form-10',
                            title: 'Form 10',
                            description: 'Provident Fund Form 10'
                        },
                        {
                            id: 15,
                            name: 'Form 5',
                            icon: 'FileType',
                            url: '/hrms/reports/pf-form-5',
                            title: 'Form 5',
                            description: 'Provident Fund Form 5'
                        },
                        {
                            id: 16,
                            name: 'PF Form6A',
                            icon: 'FileType',
                            url: '/hrms/reports/pf-form6a',
                            title: 'PF Form6A',
                            description: 'Provident Fund Form 6A'
                        },
                        {
                            id: 20,
                            name: 'Department Salary Report',
                            icon: 'Building2',
                            url: '/hrms/reports/department-salary-report',
                            title: 'Department Salary Report',
                            description: 'Department-wise Salary'
                        },
                        {
                            id: 22,
                            name: 'Employee offer letter',
                            icon: 'FileText',
                            url: '/hrms/reports/employee-offer-letter',
                            title: 'Employee offer letter',
                            description: 'Generate Offer Letters'
                        }
                    ]
                }
            ]
        }
    ]
};
