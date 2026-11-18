import type { IUserAccessibleModules } from '@/types';

export const iframeModule: IUserAccessibleModules = {
    id: 5,
    name: 'IFrame',
    icon: 'Users',
    menu: [
        {
            id: 1,
            name: 'IFrame',
            icon: 'BookOpen',
            sub_menu: [
                {
                    id: 1,
                    name: 'IFrame',
                    icon: 'Database',
                    pages: [
                        {
                            id: 1,
                            name: 'AI Assignment',
                            icon: 'BookOpen',
                            url: '/iframe/ai-assignment',
                            title: 'IFrame',
                            description: 'Manage AI Assignment Details'
                        },
                        {
                            id: 2,
                            name: 'Question Generator',
                            icon: 'BookOpen',
                            url: '/iframe/question-generator',
                            title: 'IFrame',
                            description: 'Manage Question Generator Details'
                        }
                    ]
                }
            ]
        }
    ]
};
