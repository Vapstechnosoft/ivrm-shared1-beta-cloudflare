interface UniversalLogoProps {
    logoUrl?: string;
    className?: string;
    size?: number;
}

export function UniversalLogo({ logoUrl, className = '', size = 130 }: UniversalLogoProps) {
    if (logoUrl) {
        return (
            <img
                src={logoUrl}
                alt='Universal School of Administration Logo'
                className={`object-contain ${className}`}
                style={{ maxHeight: `${size}px`, maxWidth: `${size}px` }}
            />
        );
    }

    // High fidelity SVG recreating the Universal institutions sun logo from the reference
    return (
        <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
            <svg
                viewBox='0 0 200 200'
                width={size}
                height={size}
                className='overflow-visible drop-shadow-sm'
                xmlns='http://www.w3.org/2000/svg'>
                {/* Sun Rays */}
                <g transform='translate(100, 100)'>
                    {Array.from({ length: 28 }).map((_, i) => {
                        const angle = (i * 360) / 28;
                        const isLong = i % 2 === 0;
                        return (
                            <path
                                key={i}
                                d={isLong ? 'M -4,-65 Q 0,-92 0,-95 Q 0,-92 4,-65 Z' : 'M -3,-65 Q 0,-84 0,-86 Q 0,-84 3,-65 Z'}
                                fill={i % 2 === 0 ? '#f97316' : '#ea580c'}
                                transform={`rotate(${angle})`}
                            />
                        );
                    })}
                </g>

                {/* Outer Ring */}
                <circle cx='100' cy='100' r='64' fill='#ffffff' stroke='#f97316' strokeWidth='2' />
                <circle cx='100' cy='100' r='60' fill='#ffffff' stroke='#ea580c' strokeWidth='1.5' strokeDasharray='2 2' />

                {/* Inner Blue Circle */}
                <circle cx='98' cy='95' r='42' fill='#38bdf8' />

                {/* Right Starburst detail on blue circle */}
                <g stroke='#0284c7' strokeWidth='1' opacity='0.7'>
                    <line x1='98' y1='95' x2='132' y2='82' />
                    <line x1='98' y1='95' x2='136' y2='92' />
                    <line x1='98' y1='95' x2='134' y2='102' />
                    <line x1='98' y1='95' x2='128' y2='112' />
                    <line x1='98' y1='95' x2='120' y2='120' />
                    <circle cx='133' cy='82' r='2' fill='#0284c7' />
                    <circle cx='137' cy='92' r='2' fill='#0284c7' />
                    <circle cx='135' cy='102' r='2' fill='#0284c7' />
                    <circle cx='129' cy='112' r='2' fill='#0284c7' />
                    <circle cx='121' cy='120' r='1.5' fill='#0284c7' />
                </g>

                {/* Stylized 'uc' in Center */}
                <text
                    x='86'
                    y='106'
                    fontFamily="'Brush Script MT', cursive, sans-serif"
                    fontSize='38'
                    fontStyle='italic'
                    fontWeight='bold'
                    fill='#0369a1'
                    textAnchor='middle'>
                    uc
                </text>

                {/* Banner Path for "A ray of hope for success" */}
                <path id='arcPath' d='M 48 140 A 55 55 0 0 0 148 140' fill='none' />
                <text fill='#0284c7' fontSize='9.5' fontStyle='italic' fontWeight='600' letterSpacing='0.3'>
                    <textPath href='#arcPath' startOffset='50%' textAnchor='middle'>
                        A ray of hope for success
                    </textPath>
                </text>
            </svg>
        </div>
    );
}
