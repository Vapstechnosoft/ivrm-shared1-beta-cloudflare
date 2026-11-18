'use server';
import { type ApiResponse, api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { IDropdown, IUserAccessibleModules, UserNotification } from '@/types';

// Helper to convert API icon names to Lucide React component names
function mapIcon(icon: string | null): string {
    if (!icon) return 'Settings';
    const clean = icon.trim().toLowerCase();

    // Specific mappings for icons that don't follow the kebab-case → PascalCase rule
    const specialMappings: Record<string, string> = {
        desktop: 'Monitor',
        'soccer-ball-o': 'Trophy',
        comments: 'MessageSquare',
        'credit-card-alt': 'CreditCard',
        envelope: 'Mail',
        'birthday-cake': 'Cake',
        'calendar-plus-o': 'CalendarPlus',
        money: 'BadgeIndianRupee',
        dollar: 'DollarSign',
        rupee: 'IndianRupee',
        book: 'BookOpen',
        calendar: 'Calendar',
        settings: 'Settings',
        cog: 'Settings',
        gear: 'Settings',
        'user-plus': 'UserPlus',
        'badge-indian-rupee': 'BadgeIndianRupee',
        'graduation-cap': 'GraduationCap',
        clock: 'Clock',
        package: 'Package',
        trophy: 'Trophy',
        'message-square': 'MessageSquare',
        users: 'Users',
        'book-open': 'BookOpen',
        'file-text': 'FileText',
        'bar-chart': 'BarChart',
        'calendar-days': 'CalendarDays',
        'shopping-cart': 'ShoppingCart',
        'map-pin': 'MapPin',
        home: 'Home',
        building: 'Building',
        building2: 'Building2',
        layers: 'Layers',
        award: 'Award',
        'user-check': 'UserCheck',
        'user-x': 'UserX',
        'user-cog': 'UserCog',
        shield: 'Shield',
        'log-out': 'LogOut',
        'log-in': 'LogIn',
        'key-round': 'KeyRound',
        'lock-keyhole': 'LockKeyhole',
        'mail-open': 'MailOpen',
        'heart-handshake': 'HeartHandshake',
        images: 'Images',
        megaphone: 'Megaphone',
        search: 'Search',
        'file-pie-chart': 'FilePieChart',
        'user-search': 'UserSearch',
        'arrow-right-left': 'ArrowRightLeft',
        'layout-dashboard': 'LayoutDashboard',
        'user-round-cog': 'UserRoundCog',
        'user-round-plus': 'UserRoundPlus',
        'user-round-check': 'UserRoundCheck',
        'calendar-clock': 'CalendarClock',
        sparkles: 'Sparkles',
        'file-stack': 'FileStack',
        'book-open-text': 'BookOpenText',
        activity: 'Activity',
        percent: 'Percent',
        store: 'Store',
        boxes: 'Boxes',
        ruler: 'Ruler',
        box: 'Box',
        'clipboard-list': 'ClipboardList',
        'package-minus': 'PackageMinus',
        grid: 'Grid',
        wifi: 'Wifi',
        'door-open': 'DoorOpen',
        'list-checks': 'ListChecks',
        sliders: 'Sliders',
        list: 'List',
        'pen-square': 'PenSquare',
        'clipboard-edit': 'ClipboardEdit',
        'calendar-range': 'CalendarRange',
        'file-plus': 'FilePlus',
        'check-circle': 'CheckCircle',
        'file-bar-chart': 'FileBarChart',
        'bar-chart-3': 'BarChart3',
        'bar-chart-horizontal': 'BarChartHorizontal',
        'line-chart': 'LineChart',
        'area-chart': 'AreaChart',
        'pie-chart': 'PieChart',
        cell: 'Cell',
        database: 'Database',
        'hard-drive': 'HardDrive',
        server: 'Server',
        cloud: 'Cloud',
        globe: 'Globe',
        network: 'Network',
        zap: 'Zap',
        bolt: 'Bolt',
        sun: 'Sun',
        moon: 'Moon',
        'cloud-sun': 'CloudSun',
        'cloud-moon': 'CloudMoon',
        'cloud-rain': 'CloudRain',
        'cloud-snow': 'CloudSnow',
        'cloud-lightning': 'CloudLightning',
        'cloud-fog': 'CloudFog',
        umbrella: 'Umbrella',
        thermometer: 'Thermometer',
        droplet: 'Droplet',
        wind: 'Wind',
        compass: 'Compass',
        navigation: 'Navigation',
        anchor: 'Anchor',
        ship: 'Ship',
        truck: 'Truck',
        car: 'Car',
        bike: 'Bike',
        bus: 'Bus',
        train: 'Train',
        plane: 'Plane',
        helicopter: 'Helicopter',
        drone: 'Drone',
        rocket: 'Rocket',
        satellite: 'Satellite',
        space: 'Space',
        astronaut: 'Astronaut',
        alien: 'Alien',
        robot: 'Robot',
        android: 'Android',
        linux: 'Linux',
        windows: 'Windows',
        chrome: 'Chrome',
        firefox: 'Firefox',
        safari: 'Safari',
        edge: 'Edge',
        opera: 'Opera',
        ie: 'IE',
        facebook: 'Facebook',
        twitter: 'Twitter',
        linkedin: 'LinkedIn',
        instagram: 'Instagram',
        youtube: 'Youtube',
        twitch: 'Twitch',
        github: 'Github',
        gitlab: 'Gitlab',
        bitbucket: 'Bitbucket',
        slack: 'Slack',
        discord: 'Discord',
        teams: 'Teams',
        zoom: 'Zoom',
        meet: 'Meet',
        hangouts: 'Hangouts',
        skype: 'Skype',
        whatsapp: 'Whatsapp',
        telegram: 'Telegram',
        signal: 'Signal',
        messenger: 'Messenger',
        snapchat: 'Snapchat',
        tiktok: 'Tiktok',
        pinterest: 'Pinterest',
        reddit: 'Reddit',
        tumblr: 'Tumblr',
        flickr: 'Flickr',
        vimeo: 'Vimeo',
        dribbble: 'Dribbble',
        behance: 'Behance',
        medium: 'Medium',
        wordpress: 'Wordpress',
        joomla: 'Joomla',
        drupal: 'Drupal',
        magento: 'Magento',
        shopify: 'Shopify',
        woocommerce: 'WooCommerce',
        prestashop: 'Prestashop',
        opencart: 'Opencart',
        php: 'PHP',
        python: 'Python',
        java: 'Java',
        javascript: 'JavaScript',
        typescript: 'TypeScript',
        html: 'HTML',
        css: 'CSS',
        sass: 'Sass',
        less: 'Less',
        stylus: 'Stylus',
        postcss: 'PostCSS',
        webpack: 'Webpack',
        gulp: 'Gulp',
        grunt: 'Grunt',
        npm: 'Npm',
        yarn: 'Yarn',
        pnpm: 'Pnpm',
        bun: 'Bun',
        deno: 'Deno',
        node: 'Node',
        express: 'Express',
        nestjs: 'NestJS',
        fastify: 'Fastify',
        koa: 'Koa',
        hapijs: 'HapiJS',
        loopback: 'Loopback',
        sails: 'Sails',
        meteor: 'Meteor',
        ember: 'Ember',
        backbone: 'Backbone',
        angular: 'Angular',
        vue: 'Vue',
        react: 'React',
        svelte: 'Svelte',
        solid: 'Solid',
        qwik: 'Qwik',
        lit: 'Lit',
        stencil: 'Stencil',
        preact: 'Preact',
        inferno: 'Inferno',
        alpine: 'Alpine',
        htmx: 'Htmx',
        hyperscript: 'Hyperscript',
        bootstrap: 'Bootstrap',
        tailwind: 'Tailwind',
        bulma: 'Bulma',
        foundation: 'Foundation',
        material: 'Material',
        ant: 'Ant',
        chakra: 'Chakra',
        mui: 'Mui',
        fluent: 'Fluent',
        radix: 'Radix',
        shadcn: 'Shadcn',
        lucide: 'Lucide',
        feather: 'Feather',
        'font-awesome': 'FontAwesome',
        heroicons: 'Heroicons',
        tabler: 'Tabler',
        phosphor: 'Phosphor',
        remix: 'Remix',
        ionicons: 'Ionicons',
        eva: 'Eva',
        'ant-design': 'AntDesign',
        'material-symbols': 'MaterialSymbols',
        'bootstrap-icons': 'BootstrapIcons',
        boxicons: 'BoxIcons',
        'simple-icons': 'SimpleIcons',
        cryptocurrency: 'Cryptocurrency',
        coin: 'Coin',
        banknote: 'Banknote',
        'credit-card': 'CreditCard',
        wallet: 'Wallet',
        currency: 'Currency',
        'dollar-sign': 'DollarSign',
        euro: 'Euro',
        pound: 'Pound',
        yen: 'Yen',
        ruble: 'Ruble',
        lira: 'Lira',
        peso: 'Peso',
        shekel: 'Shekel',
        franc: 'Franc',
        bitcoin: 'Bitcoin',
        ethereum: 'Ethereum',
        litecoin: 'Litecoin',
        dogecoin: 'Dogecoin',
        tether: 'Tether',
        solana: 'Solana',
        cardano: 'Cardano',
        polkadot: 'Polkadot',
        chainlink: 'Chainlink',
        uniswap: 'Uniswap',
        aave: 'Aave',
        maker: 'Maker',
        compound: 'Compound',
        pancake: 'Pancake',
        cake: 'Cake',
        cookie: 'Cookie',
        bread: 'Bread',
        pizza: 'Pizza',
        burger: 'Burger',
        fries: 'Fries',
        sandwich: 'Sandwich',
        sushi: 'Sushi',
        ramen: 'Ramen',
        noodles: 'Noodles',
        rice: 'Rice',
        curry: 'Curry',
        dumpling: 'Dumpling',
        bao: 'Bao',
        salad: 'Salad',
        fruit: 'Fruit',
        apple: 'Apple',
        banana: 'Banana',
        watermelon: 'Watermelon',
        grapes: 'Grapes',
        strawberry: 'Strawberry',
        blueberry: 'Blueberry',
        raspberry: 'Raspberry',
        blackberry: 'Blackberry',
        cherry: 'Cherry',
        peach: 'Peach',
        pear: 'Pear',
        plum: 'Plum',
        apricot: 'Apricot',
        mango: 'Mango',
        pineapple: 'Pineapple',
        coconut: 'Coconut',
        avocado: 'Avocado',
        tomato: 'Tomato',
        potato: 'Potato',
        carrot: 'Carrot',
        broccoli: 'Broccoli',
        cauliflower: 'Cauliflower',
        cucumber: 'Cucumber',
        onion: 'Onion',
        garlic: 'Garlic',
        chili: 'Chili',
        corn: 'Corn',
        peas: 'Peas',
        beans: 'Beans',
        lentils: 'Lentils',
        chickpea: 'Chickpea',
        tofu: 'Tofu',
        tempeh: 'Tempeh',
        seitan: 'Seitan',
        mushroom: 'Mushroom',
        cheese: 'Cheese',
        milk: 'Milk',
        yogurt: 'Yogurt',
        butter: 'Butter',
        egg: 'Egg',
        meat: 'Meat',
        chicken: 'Chicken',
        turkey: 'Turkey',
        duck: 'Duck',
        goose: 'Goose',
        quail: 'Quail',
        rabbit: 'Rabbit',
        lamb: 'Lamb',
        goat: 'Goat',
        beef: 'Beef',
        pork: 'Pork',
        bacon: 'Bacon',
        ham: 'Ham',
        sausage: 'Sausage',
        hotdog: 'Hotdog',
        kebab: 'Kebab',
        gyro: 'Gyro',
        shawarma: 'Shawarma',
        taco: 'Taco',
        burrito: 'Burrito',
        quesadilla: 'Quesadilla',
        nachos: 'Nachos',
        chips: 'Chips',
        salsa: 'Salsa',
        guacamole: 'Guacamole',
        hummus: 'Hummus',
        baba: 'Baba',
        falafel: 'Falafel',
        pita: 'Pita',
        naan: 'Naan',
        roti: 'Roti',
        chapati: 'Chapati',
        paratha: 'Paratha',
        samosa: 'Samosa',
        pakora: 'Pakora',
        bhaji: 'Bhaji',
        vada: 'Vada',
        idli: 'Idli',
        dosa: 'Dosa',
        sambar: 'Sambar',
        chutney: 'Chutney',
        raita: 'Raita',
        lassi: 'Lassi',
        chai: 'Chai',
        coffee: 'Coffee',
        tea: 'Tea',
        juice: 'Juice',
        smoothie: 'Smoothie',
        milkshake: 'Milkshake',
        soda: 'Soda',
        pop: 'Pop',
        cola: 'Cola',
        pepsi: 'Pepsi',
        coke: 'Coke',
        fanta: 'Fanta',
        sprite: 'Sprite',
        '7up': 'SevenUp',
        mountain: 'Mountain',
        dew: 'Dew',
        dr: 'Dr',
        root: 'Root',
        beer: 'Beer',
        ale: 'Ale',
        stout: 'Stout',
        lager: 'Lager',
        pilsner: 'Pilsner',
        ipa: 'Ipa',
        wine: 'Wine',
        champagne: 'Champagne',
        sparkling: 'Sparkling',
        cider: 'Cider',
        mead: 'Mead',
        sake: 'Sake',
        soju: 'Soju',
        vodka: 'Vodka',
        gin: 'Gin',
        rum: 'Rum',
        whiskey: 'Whiskey',
        bourbon: 'Bourbon',
        scotch: 'Scotch',
        tequila: 'Tequila',
        mezcal: 'Mezcal',
        cognac: 'Cognac',
        brandy: 'Brandy',
        liqueur: 'Liqueur',
        absinthe: 'Absinthe',
        vermouth: 'Vermouth',
        port: 'Port',
        sherry: 'Sherry',
        madeira: 'Madeira',
        marsala: 'Marsala',
        amaro: 'Amaro',
        bitters: 'Bitters',
        syrup: 'Syrup',
        honey: 'Honey',
        maple: 'Maple',
        agave: 'Agave',
        sugar: 'Sugar',
        salt: 'Salt',
        pepper: 'Pepper',
        spice: 'Spice',
        herb: 'Herb',
        oregano: 'Oregano',
        basil: 'Basil',
        thyme: 'Thyme',
        rosemary: 'Rosemary',
        sage: 'Sage',
        mint: 'Mint',
        cilantro: 'Cilantro',
        parsley: 'Parsley',
        dill: 'Dill',
        chive: 'Chive',
        tarragon: 'Tarragon',
        fennel: 'Fennel',
        anise: 'Anise',
        coriander: 'Coriander',
        cumin: 'Cumin',
        turmeric: 'Turmeric',
        ginger: 'Ginger',
        galangal: 'Galangal',
        lemongrass: 'Lemongrass',
        kaffir: 'Kaffir',
        kalamansi: 'Kalamansi'
    };

    if (specialMappings[clean]) {
        return specialMappings[clean];
    }

    // Convert kebab-case to PascalCase (e.g., "user-plus" → "UserPlus")
    return clean
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

export async function getUserAccessibleModules() {
    try {
        const session = await auth();

        const aiEdgeModule = {
            id: 50005,
            name: 'AI Edge',
            icon: 'Sparkles',
            menu: [
                {
                    id: 1,
                    name: 'AI Edge',
                    icon: 'BookOpen',
                    sub_menu: [
                        {
                            id: 1,
                            name: 'AI Tools',
                            icon: 'Database',
                            pages: [
                                {
                                    id: 1,
                                    name: 'Question Paper Generator',
                                    icon: 'FileText',
                                    url: '/iframe/ai-question-paper-generator',
                                    title: 'AI Question Paper Generator',
                                    description: 'Generate question papers from textbooks using AI'
                                },
                                {
                                    id: 2,
                                    name: 'AI Notemaker',
                                    icon: 'FileText',
                                    url: '/iframe/ai-notemaker',
                                    title: 'AI Notemaker',
                                    description: 'Summarize and create structured notes from textbooks using AI'
                                },
                                {
                                    id: 3,
                                    name: 'AI Performance Analysis',
                                    icon: 'BarChart',
                                    url: '/Exam/exam-module/ai-performance-analysis',
                                    title: 'AI Performance Analysis',
                                    description: 'Analyze performance metrics and AI-driven insights'
                                },
                                {
                                    id: 4,
                                    name: 'AI Doubt Resolver',
                                    icon: 'MessageSquare',
                                    url: '/iframe/ai-doubt-resolver',
                                    title: 'AI Doubt Resolver',
                                    description: 'Resolve academic doubts using AI'
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        const superAdminModule = {
            id: 13,
            name: 'Super Admin',
            icon: 'Settings',
            menu: [
                {
                    id: 1,
                    name: 'Super Admin Module',
                    icon: 'Settings',
                    sub_menu: [
                        {
                            id: 1,
                            name: 'Master Trust',
                            icon: 'Settings',
                            pages: [
                                {
                                    id: 1,
                                    name: 'Master Trust',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/masters/trust-master',
                                    title: 'Master Trust',
                                    description: 'Manage Master Trust Details'
                                }
                            ]
                        },
                        {
                            id: 2,
                            name: 'Institution',
                            icon: 'Settings',
                            pages: [
                                {
                                    id: 1,
                                    name: 'Master Institution',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/institution/master-institution',
                                    title: 'Master Institution',
                                    description: 'Manage Master Institution'
                                },
                                {
                                    id: 2,
                                    name: 'Institution Subscription',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/institution/institution-subscription',
                                    title: 'Institution Subscription',
                                    description: 'Manage Institution Subscription'
                                },
                                {
                                    id: 3,
                                    name: 'Auto Mapping',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/institution/auto-mapping',
                                    title: 'Auto Mapping',
                                    description: 'Manage Institution Auto Mapping'
                                }
                            ]
                        },
                        {
                            id: 3,
                            name: 'General Setting',
                            icon: 'Settings',
                            pages: [
                                {
                                    id: 1,
                                    name: 'General Setting Wizard',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/general-setting/wizard',
                                    title: 'General Setting Wizard',
                                    description: 'General Setting Wizard'
                                },
                                {
                                    id: 2,
                                    name: 'Modules',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/general-setting/module',
                                    title: 'Modules',
                                    description: 'Manage Master Modules'
                                },
                                {
                                    id: 7,
                                    name: 'Master Page',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/general-setting/master-page',
                                    title: 'Master Page',
                                    description: 'Manage Master Page'
                                },
                                {
                                    id: 8,
                                    name: 'Page Mapping',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/general-setting/page-mapping',
                                    title: 'Page Mapping',
                                    description: 'Map Pages to Modules'
                                },
                                {
                                    id: 9,
                                    name: 'Master Role',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/general-setting/master-role',
                                    title: 'Master Role',
                                    description: 'Manage Master Role'
                                },
                                {
                                    id: 10,
                                    name: 'Master Role Type',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/general-setting/master-role-type',
                                    title: 'Master Role Type',
                                    description: 'Manage Master Role Type'
                                },
                                {
                                    id: 11,
                                    name: 'Privileges',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/general-setting/privileges',
                                    title: 'Privileges',
                                    description: 'Privileges'
                                },
                                {
                                    id: 3,
                                    name: 'Master Main Menu',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/general-setting/master-main-menu',
                                    title: 'Master Main Menu',
                                    description: 'Manage Master Main Menu'
                                },
                                {
                                    id: 4,
                                    name: 'Master Sub Menu',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/general-setting/master-sub-menu',
                                    title: 'Master Sub Menu',
                                    description: 'Manage Master Sub Menu'
                                },
                                {
                                    id: 5,
                                    name: 'Master Menu Page Mapping',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/general-setting/master-menu-page-mapping',
                                    title: 'Master Menu Page Mapping',
                                    description: 'Manage Master Menu Page Mapping'
                                },
                                {
                                    id: 6,
                                    name: 'Master School Type',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/general-setting/master-school-type',
                                    title: 'Master School Type',
                                    description: 'Manage Master School Type'
                                }
                            ]
                        },
                        {
                            id: 4,
                            name: 'Configuration Setting',
                            icon: 'Settings',
                            pages: [
                                {
                                    id: 1,
                                    name: 'Institution Module Page',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/configuration-setting/institution-module-page',
                                    title: 'Institution Module Page',
                                    description: 'Master Institution Role and Module Mapping'
                                },
                                {
                                    id: 2,
                                    name: 'Master Main Menu INS',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/configuration-setting/master-main-menu-ins',
                                    title: 'Master Main Menu INS',
                                    description: 'Master Main Menu Institution Mapping'
                                },
                                {
                                    id: 3,
                                    name: 'Master Sub Menu INS',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/configuration-setting/master-sub-menu-ins',
                                    title: 'Master Sub Menu INS',
                                    description: 'Master Sub Menu Institution Mapping'
                                },
                                {
                                    id: 4,
                                    name: 'Master Menu Page Mapping Institutionwise',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/configuration-setting/master-menu-page-mapping-institutionwise',
                                    title: 'Master Menu Page Mapping Institutionwise',
                                    description: 'Master Menu Page Mapping Institutionwise'
                                }
                            ]
                        },
                        {
                            id: 5,
                            name: 'Mobile Configuration',
                            icon: 'Settings',
                            pages: [
                                {
                                    id: 1,
                                    name: 'Mobile Master Page',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/configuration-setting/mobilemasterpage',
                                    title: 'Mobile Master Page',
                                    description: 'Mobile Master Page'
                                },
                                {
                                    id: 40011,
                                    name: 'Cumulative Subject',
                                    icon: 'BarChart3',
                                    url: '/StudentPortal/student-dashboard/Exam/CumulativeSubject',
                                    title: 'Cumulative Subject',
                                    description: 'View Cumulative Subject Details'
                                }
                            ]
                        },
                        {
                            id: 6,
                            name: 'User Creation',
                            icon: 'Settings',
                            pages: [
                                {
                                    id: 1,
                                    name: 'Staff User Creation',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/user-creation/staff-user-creation',
                                    title: 'Staff User Creation',
                                    description: 'Staff User Creation'
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        const rawRole = (session?.role || (session as any)?.roleName || (session as any)?.user?.role || '').trim().toUpperCase();
        const roleType = (
            session?.role ||
            session?.role ||
            (session as any)?.user?.roleType ||
            (session as any)?.user?.roletype ||
            (session as any)?.ivrmrT_Role ||
            ''
        )
            .trim()
            .toUpperCase();

        const isSuperAdmin =
            rawRole === 'SUPER ADMIN' || rawRole === 'SUPERADMIN' || roleType === 'SUPER ADMIN' || roleType === 'SUPERADMIN';

        // Super Admin gets ONLY Super Admin and AI Edge (never school operational modules like Fees, Admission, etc.)
        if (isSuperAdmin) {
            return {
                success: true,
                message: 'Data fetched successfully!!',
                data: [superAdminModule as any, aiEdgeModule as any]
            } as any;
        }

        const isAdmin = rawRole === 'ADMIN' || rawRole.includes('ADMIN') || roleType === 'ADMIN' || roleType.includes('ADMIN');

        // Fetch data from backend APIs
        const [mainModulesRes, subModulesRes, pageListRes] = await Promise.all([
            api.get<any>('preadmission', '/configuration/get_main_module_list'),
            api.get<any>('preadmission', '/configuration/get_submodule_list'),
            api.get<any>('preadmission', '/configuration/get_page_list')
        ]);

        // Safe extraction helper to handle raw arrays, wrapped objects, or $values metadata
        const extractArray = (res: any): any[] => {
            if (!res) return [];
            if (Array.isArray(res)) return res;
            if (Array.isArray(res.data)) return res.data;
            if (Array.isArray(res.$values)) return res.$values;
            if (res.data && Array.isArray(res.data.$values)) return res.data.$values;
            if (Array.isArray(res.pageList)) return res.pageList;
            if (res.data && Array.isArray(res.data.pageList)) return res.data.pageList;
            if (Array.isArray(res.moduleList)) return res.moduleList;
            if (res.data && Array.isArray(res.data.moduleList)) return res.data.moduleList;
            if (Array.isArray(res.submoduleList)) return res.submoduleList;
            if (res.data && Array.isArray(res.data.submoduleList)) return res.data.submoduleList;
            if (Array.isArray(res.savedMappings)) return res.savedMappings;
            if (res.data && Array.isArray(res.data.savedMappings)) return res.data.savedMappings;
            if (Array.isArray(res.records)) return res.records;
            if (res.data && Array.isArray(res.data.records)) return res.data.records;
            if (Array.isArray(res.gridDetails)) return res.gridDetails;
            if (res.data && Array.isArray(res.data.gridDetails)) return res.data.gridDetails;
            if (Array.isArray(res.pagesdata)) return res.pagesdata;
            if (res.data && Array.isArray(res.data.pagesdata)) return res.data.pagesdata;

            if (res.data && typeof res.data === 'object') {
                for (const key of Object.keys(res.data)) {
                    if (Array.isArray(res.data[key])) return res.data[key];
                }
            }
            if (typeof res === 'object') {
                for (const key of Object.keys(res)) {
                    if (Array.isArray(res[key])) return res[key];
                }
            }
            return [];
        };

        const pages = extractArray(pageListRes);
        const mainModules = extractArray(mainModulesRes);
        const subModules = extractArray(subModulesRes);

        // Dynamic Title Case helper
        const toTitleCase = (str: string): string => {
            if (!str) return '';
            return str
                .replace(/[_-]+/g, ' ')
                .replace(/\bbaldwin\b\s*/gi, '')
                .trim()
                .split(/\s+/)
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                .join(' ');
        };

        const cleanMenuTitle = (text: string): string => {
            if (!text) return '';
            return text.replace(/\bbaldwin\b\s*/gi, '').trim();
        };

        // Dynamic URL normalizer
        const normalizeUrl = (rawUrl: string, pageName: string): string => {
            if (rawUrl && typeof rawUrl === 'string') {
                let u = rawUrl.trim();
                if (u.startsWith('app.')) u = u.replace(/^app\./, '/');
                if (!u.startsWith('/') && u !== '#' && u !== '' && u !== 'null') u = `/${u}`;
                if (u !== '#' && u !== '' && u !== 'null') return u;
            }
            const slug = (pageName || '')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            return slug ? `/${slug}` : '#';
        };

        const isSuperAdminPage = (nameLower: string, urlLower: string): boolean => {
            return (
                nameLower.includes('configuration setting wizard') ||
                nameLower.includes('master module') ||
                nameLower.includes('master role') ||
                nameLower.includes('master roletype') ||
                nameLower.includes('master role & priviledges') ||
                nameLower.includes('institution module mapping') ||
                nameLower.includes('module page mapping') ||
                nameLower.includes('master school type') ||
                nameLower.includes('master main menu') ||
                nameLower.includes('master sub menu') ||
                nameLower.includes('master menu page mapping') ||
                nameLower.includes('general setting wizard') ||
                nameLower.includes('institution subscription') ||
                nameLower.includes('auto mapping') ||
                nameLower.includes('trust master') ||
                urlLower.includes('consetting') ||
                urlLower.includes('pagemapping') ||
                urlLower.includes('modulepage') ||
                urlLower.includes('masterschooltype') ||
                urlLower.includes('superadmin') ||
                urlLower.includes('super-admin')
            );
        };

        // --------------------------------------------------
        // Composite key: moduleId + menuId
        // --------------------------------------------------
        const getMenuKey = (moduleId: number, menuId: number): string => {
            return `${moduleId}_${menuId}`;
        };

        // Admin-specific module ordering
        const getAdminModuleRank = (rawName: string): number => {
            if (!rawName) return 999;
            const clean = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');

            // 1. Pre configuration
            if (clean === 'preconfiguration' || clean.includes('preconfig')) return 1;

            if (clean === 'sms' || clean.includes('email')) return 1.1;
            // 2. Pre admission
            if (clean === 'preadmission' || clean === 'preadmissions') return 2;
            // 3. Admission
            if (clean === 'admission' || clean === 'admissions') return 3;
            // 4. Fees
            if (clean === 'fees' || clean === 'fee') return 4;
            // 5. Exam
            if (clean === 'exam' || clean === 'exams' || clean === 'examination') return 5;
            // 6. HRMS
            if (clean === 'hrms') return 6;
            // 7. Front office
            if (clean === 'frontoffice') return 7;
            // 8. Leave management
            if (clean === 'leavemanagement' || clean.includes('leave')) return 8;
            // 9. Upload Notice Board (matches Upload Notice Board, Upload, or Notice Board)
            if (clean === 'uploadnoticeboard') return 9;
            if (clean === 'upload') return 9.1;
            if (clean === 'noticeboard') return 9.2;
            // 10. Time table
            if (clean === 'timetable') return 10;
            // 11. Coe
            if (clean === 'coe') return 11;
            // 12. Birthday
            if (clean === 'birthday' || clean === 'birthdays') return 12;
            // 13. Inventory
            if (clean === 'inventory') return 13;

            return 999;
        };

        const sortAdminModules = (a: any, b: any) => {
            const nameA = a.ivrmM_ModuleName || a.name || '';
            const nameB = b.ivrmM_ModuleName || b.name || '';
            const rankA = getAdminModuleRank(nameA);
            const rankB = getAdminModuleRank(nameB);

            if (rankA !== rankB) {
                return rankA - rankB;
            }
            return (a.order || 0) - (b.order || 0);
        };

        // Sort helper
        const sortByOrder = (a: any, b: any) => (a.order || 0) - (b.order || 0);

        if (isAdmin) {
            mainModules.sort(sortAdminModules);
        }

        // Pre-index subModules by composite key (moduleId_parentId) and fallback parentId
        const subByParentKey = new Map<string, any[]>();
        const subByParentId = new Map<number, any[]>();

        subModules.forEach((sub: any) => {
            const moduleId = Number(sub.moduleId ?? sub.ivrmM_Id ?? 0);
            const parentId = Number(sub.parentId ?? sub.ivrmmM_Id ?? 0);

            const compKey = getMenuKey(moduleId, parentId);
            if (!subByParentKey.has(compKey)) {
                subByParentKey.set(compKey, []);
            }
            subByParentKey.get(compKey)!.push(sub);

            if (parentId > 0) {
                if (!subByParentId.has(parentId)) {
                    subByParentId.set(parentId, []);
                }
                subByParentId.get(parentId)!.push(sub);
            }
        });

        // Pre-index pages by composite key (moduleId_menuId) and fallback menuId
        const pagesByMenuKey = new Map<string, any[]>();
        const pagesByMenuId = new Map<number, any[]>();

        pages.forEach((page: any) => {
            const moduleId = Number(page.moduleId ?? page.ivrmM_Id ?? 0);
            const menuId = Number(page.menuId ?? page.ivrmmM_Id ?? 0);
            const rawName = page.ivrmmP_PageName || page.ivrmP_PageDisplayName || page.name || '';
            const cleanedName = toTitleCase(cleanMenuTitle(rawName));
            const rawUrl = page.ivrmP_PageURL || page.url || '';
            const resolvedUrl = normalizeUrl(rawUrl, cleanedName);

            if (isSuperAdminPage(cleanedName.toLowerCase(), (rawUrl || '').toLowerCase())) {
                return;
            }

            const pageItem = {
                id: Number(page.pageId ?? page.ivrmP_Id ?? page.id ?? 0) || Math.floor(Math.random() * 1000000) + 1,
                name: cleanedName,
                title: cleanedName,
                url: resolvedUrl,
                icon: mapIcon(page.ivrmmmI_Icon || page.icon || 'FileText'),
                description: cleanedName,
                order: Number(page.order ?? page.ivrmimP_PageOrder ?? 0)
            };

            const compKey = getMenuKey(moduleId, menuId);
            if (!pagesByMenuKey.has(compKey)) {
                pagesByMenuKey.set(compKey, []);
            }
            pagesByMenuKey.get(compKey)!.push(pageItem);

            if (menuId > 0) {
                if (!pagesByMenuId.has(menuId)) {
                    pagesByMenuId.set(menuId, []);
                }
                pagesByMenuId.get(menuId)!.push(pageItem);
            }
        });

        // Recursive submenu builder
        function buildSubMenu(moduleId: number, menuId: number): any[] {
            const compKey = getMenuKey(moduleId, menuId);
            let children = subByParentKey.get(compKey);
            if (!children || children.length === 0) {
                children = subByParentId.get(menuId) || [];
            }
            children = [...children].sort(sortByOrder);

            const validChildren: any[] = [];
            for (const sub of children) {
                const subModuleId = Number(sub.moduleId ?? sub.ivrmM_Id ?? moduleId);
                const subMenuId = Number(sub.menuId ?? sub.ivrmmM_Id ?? 0);

                const subCompKey = getMenuKey(subModuleId, subMenuId);
                let itemPages = pagesByMenuKey.get(subCompKey);
                if (!itemPages || itemPages.length === 0) {
                    itemPages = pagesByMenuId.get(subMenuId) || [];
                }

                // Check child submenu recursively
                const childSubCompKey = getMenuKey(subModuleId, subMenuId);
                const hasGrandChildren =
                    (subByParentKey.get(childSubCompKey)?.length || 0) > 0 || (subByParentId.get(subMenuId)?.length || 0) > 0;

                let subMenuItems: any[] = [];
                if (hasGrandChildren) {
                    subMenuItems = buildSubMenu(subModuleId, subMenuId);
                }

                if (itemPages.length > 0 || subMenuItems.length > 0) {
                    const subName = toTitleCase(cleanMenuTitle(sub.ivrmM_ModuleName || sub.name || ''));
                    validChildren.push({
                        id: subMenuId,
                        name: subName,
                        icon: mapIcon(sub.ivrmmmI_Icon || sub.icon || 'Settings'),
                        sub_menu: subMenuItems,
                        pages: hasGrandChildren ? [] : [...itemPages].sort(sortByOrder)
                    });
                }
            }
            return validChildren;
        }

        // Build top-level modules strictly from mainModules (the 21 records from /configuration/get_main_module_list)
        const topModules = mainModules
            .filter((m: any) => Number(m.parentId ?? 0) === 0)
            .sort(isAdmin ? sortAdminModules : sortByOrder)
            .map((m: any) => {
                const moduleId = Number(m.moduleId ?? m.ivrmM_Id ?? 0);
                const menuId = Number(m.menuId ?? 0);

                let subMenuStructure = buildSubMenu(moduleId, menuId);

                // If no submenus were found by parentId, check if direct pages exist under this menu
                if (subMenuStructure.length === 0) {
                    const compKey = getMenuKey(moduleId, menuId);
                    let directPages = pagesByMenuKey.get(compKey);
                    if (!directPages || directPages.length === 0) {
                        directPages = pagesByMenuId.get(menuId) || [];
                    }
                    if (directPages.length > 0) {
                        subMenuStructure = [
                            {
                                id: menuId || moduleId,
                                name: 'General',
                                icon: mapIcon(m.ivrmmmI_Icon || 'Settings'),
                                sub_menu: [],
                                pages: [...directPages].sort(sortByOrder)
                            }
                        ];
                    }
                }

                if (subMenuStructure.length === 0) {
                    return null;
                }

                const cleanedModuleName = toTitleCase(cleanMenuTitle(m.ivrmM_ModuleName || m.name || ''));

                return {
                    id: menuId || moduleId,
                    name: cleanedModuleName,
                    icon: mapIcon(m.ivrmmmI_Icon || m.icon || 'Boxes'),
                    menu: [
                        {
                            id: 1,
                            name: cleanedModuleName,
                            icon: mapIcon(m.ivrmmmI_Icon || m.icon || 'Boxes'),
                            sub_menu: subMenuStructure
                        }
                    ]
                };
            })
            .filter((module: any) => module !== null);

        topModules.push(aiEdgeModule as any);

        return {
            success: true,
            message: 'Data fetched successfully!!',
            data: topModules,
            mainModules,
            subModules,
            pages
        } as any;
    } catch (error) {
        console.error('Error fetching user accessible modules:', error);
        return {
            success: false,
            message: 'Failed to fetch modules',
            data: []
        } as ApiResponse<IUserAccessibleModules[]>;
    }
}

// Other functions remain unchanged...
export async function getCommonDropdown(name: string) {
    const url = `/v1/common/common_drop_down_list/${name}`;
    return await api.get<IDropdown[]>('default', url);
}

export async function getUserNotificationList(_priority?: string) {
    // const url = `/v1/user_notification?priority=${priority ?? 'normal'}`;

    // return await api.get<UserNotification[]>('admission', url);

    const response: ApiResponse<UserNotification[]> = {
        success: true,
        message: 'Data fetched successfully!!',
        data: [
            {
                id: 1,
                title: 'New Admission',
                message: 'New Admission added successfully!!',
                link: null,
                created_timestamp: new Date(-1).toISOString(),
                priority: 'normal',
                user_code: 'Admin_001',
                user_name: 'AdminVV'
            }
        ]
    };

    return await response;
}

export async function markReadUserNotification(id: number) {
    const url = `/v1/user_notification/mark_read/${id}`;
    return await api.put<any>('default', url);
}

export async function markAllReadUserNotification() {
    const url = '/v1/user_notification/mark_all_read';
    return await api.put<any>('default', url);
}
