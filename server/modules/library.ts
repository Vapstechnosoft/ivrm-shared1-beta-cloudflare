import type { IUserAccessibleModules } from '@/types';

export const libraryModule: IUserAccessibleModules = {
    id: 7,
    name: 'Library',
    icon: 'BookOpen',
    menu: [
        {
            id: 1,
            name: 'Library',
            icon: 'BookOpen',
            sub_menu: [
                {
                    id: 3000,
                    name: 'Masters',
                    icon: 'Database',
                    pages: [
                        {
                            id: 30001,
                            name: 'Master Library',
                            icon: 'BookOpen',
                            url: '/library/masters/masterlibrary',
                            title: 'Master Library',
                            description: 'Manage Master Library Details'
                        },
                        {
                            id: 30002,
                            name: 'Master Vendor',
                            icon: 'BookOpen',
                            url: '/library/masters/libraryvendor',
                            title: 'Master Vendor',
                            description: 'Manage Library Vendor Details'
                        },
                        {
                            id: 30003,
                            name: 'Master Publisher',
                            icon: 'BookOpen',
                            url: '/library/masters/librarypublisher',
                            title: 'Master Publisher',
                            description: 'Manage Library Publisher Details'
                        },
                        {
                            id: 30004,
                            name: 'Master Author',
                            icon: 'BookOpen',
                            url: '/library/masters/masterauthor',
                            title: 'Master Author',
                            description: 'Manage Library Author Details'
                        },
                        {
                            id: 30005,
                            name: 'Master Subject',
                            icon: 'BookOpen',
                            url: '/library/masters/mastersubject',
                            title: 'Master Subject',
                            description: 'Manage Library Subject Details'
                        },
                        {
                            id: 30006,
                            name: 'Master Language',
                            icon: 'BookOpen',
                            url: '/library/masters/masterlanguage',
                            title: 'Master Language',
                            description: 'Manage Library Language Details'
                        },
                        {
                            id: 30007,
                            name: 'Master Accessories',
                            icon: 'Package',
                            url: '/library/masters/accessories-master',
                            title: 'Master Accessories',
                            description: 'Manage Library Accessories Details'
                        },
                        {
                            id: 30008,
                            name: 'Master Class Category',
                            icon: 'BookOpen',
                            url: '/library/masters/master-class-category',
                            title: 'Master Class Category',
                            description: 'Manage Library Class Category Details'
                        },
                        {
                            id: 30009,
                            name: 'Master Book Category',
                            icon: 'BookOpen',
                            url: '/library/masters/mastercategory',
                            title: 'Master Book Category',
                            description: 'Manage Book Category Details'
                        },
                        {
                            id: 30010,
                            name: 'Master Department',
                            icon: 'Building2',
                            url: '/library/masters/department-master',
                            title: 'Master Department',
                            description: 'Manage Library Department Details'
                        },
                        {
                            id: 30011,
                            name: 'Master Rack Details',
                            icon: 'Layout',
                            url: '/library/masters/master-rack-details',
                            title: 'Master Rack Details',
                            description: 'Manage Library Rack Details'
                        },
                        {
                            id: 30012,
                            name: 'Master Time Slab',
                            icon: 'Clock',
                            url: '/library/masters/master-time-slab',
                            title: 'Master Time Slab',
                            description: 'Manage Library Time Slab Details'
                        }
                    ]
                },
                {
                    id: 2,
                    name: 'Transactions',
                    icon: 'FileText',
                    pages: [
                        {
                            id: 30013,
                            name: 'Book Register',
                            icon: 'BookOpen',
                            url: '/library/transactions/book-register',
                            title: 'Book Register',
                            description: 'Register New Books in Library'
                        },
                        {
                            id: 30014,
                            name: 'Book Return',
                            icon: 'BookOpen',
                            url: '/library/transactions/book-return',
                            title: 'Book Return',
                            description: 'Process Book Returns'
                        },

                        {
                            id: 30015,
                            name: 'Circulation Parameter',
                            icon: 'Settings',
                            url: '/library/transactions/circulation-parameter',
                            title: 'Circulation Parameter',
                            description: 'Manage Circulation Parameters'
                        },

                        {
                            id: 30016,
                            name: 'Book Transaction',
                            icon: 'BookOpen',
                            url: '/library/transactions/lib-book-transaction',
                            title: 'Book Transaction',
                            description: 'Manage Book Transactions'
                        },
                        {
                            id: 30017,
                            name: 'Lost Book',
                            icon: 'AlertCircle',
                            url: '/library/transactions/lostbook',
                            title: 'Lost Book',
                            description: 'Manage Lost Book Records'
                        }
                    ]
                },
                {
                    id: 3,
                    name: 'Reports',
                    icon: 'FileText',
                    pages: [
                        {
                            id: 30018,
                            name: 'Available Books Report',
                            icon: 'FileText',
                            url: '/library/reports/available-books-report',
                            title: 'Available Books Report',
                            description: 'View Available Books Report'
                        },
                        {
                            id: 30019,
                            name: 'Book Arrival Report',
                            icon: 'FileText',
                            url: '/library/reports/book-arrival-report',
                            title: 'Book Arrival Report',
                            description: 'View Book Arrival Report'
                        },
                        {
                            id: 30020,
                            name: 'Rack Report',
                            icon: 'FileText',
                            url: '/library/reports/rack-report',
                            title: 'Rack Report',
                            description: 'View Rack-wise Book Report'
                        },
                        {
                            id: 30021,
                            name: 'Book Circulation Report',
                            icon: 'FileText',
                            url: '/library/reports/book-circulation-report',
                            title: 'Book Circulation Report',
                            description: 'View Book Circulation Report'
                        },
                        {
                            id: 30022,
                            name: 'Purchase/Donate/New Arrival Report',
                            icon: 'FileText',
                            url: '/library/reports/purchase-donate-report',
                            title: 'Purchase/Donate/New Arrival Report',
                            description: 'View Purchase, Donation and New Arrival Report'
                        },
                        {
                            id: 30023,
                            name: 'Transaction Count Report',
                            icon: 'FileText',
                            url: '/library/reports/lib-transaction-report',
                            title: 'Transaction Count Report',
                            description: 'View Library Transaction Count Report'
                        },
                        {
                            id: 30024,
                            name: 'Lost Book Report',
                            icon: 'FileText',
                            url: '/library/reports/lib-lost-book-report',
                            title: 'Lost Book Report',
                            description: 'View Lost Book Report'
                        },
                        {
                            id: 30025,
                            name: 'Student Transaction Count Report',
                            icon: 'FileText',
                            url: '/library/reports/clg-transaction-count-report',
                            title: 'Student Transaction Count Report',
                            description: 'View Student-wise Transaction Count Report'
                        },
                        {
                            id: 30026,
                            name: 'Book Register Report',
                            icon: 'FileText',
                            url: '/library/reports/book-register-report',
                            title: 'Book Register Report',
                            description: 'View Book Register Report'
                        },
                        {
                            id: 30027,
                            name: 'Library Month End Report',
                            icon: 'FileText',
                            url: '/library/reports/library-month-end-report',
                            title: 'Library Month End Report',
                            description: 'View Library Month End Report'
                        },
                        {
                            id: 30028,
                            name: 'Import Library Data',
                            icon: 'Upload',
                            url: '/library/reports/importlibrarydata',
                            title: 'Import Library Data',
                            description: 'Import Bulk Library Data'
                        }
                    ]
                }
            ]
        }
    ]
};
