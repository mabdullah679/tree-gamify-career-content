export interface CareerNode {
  id: string;
  title: string;
  description: string;
  level: number;
  unlocked: boolean;
  completed: boolean;
  prerequisites?: string[];
  details?: string[];
  certifications?: string[];
}

export const careerData: CareerNode[] = [
  {
    id: '1',
    title: 'The Foundation (Pre-Entry)',
    description: 'Before you touch a wire, you must meet the physical and legal baselines.',
    level: 1,
    unlocked: true,
    completed: false,
    details: [
      'High School Diploma or GED (Focus on Algebra and Physics)',
      'Aptitude for heights (working 60ft+ in the air)',
      'Upper body strength (lifting 50-100 lbs)',
      'Stamina for extreme weather (storms, heat, snow)'
    ],
    certifications: [
      'CDL Class A: Commercial Driver\'s License for bucket and digger derrick trucks',
      'DOT Medical Card: Required to maintain the CDL'
    ]
  },
  {
    id: '2',
    title: 'Groundman / Pre-Apprentice',
    description: 'Pay your dues on the ground while watching the experts above.',
    level: 2,
    unlocked: false,
    completed: false,
    prerequisites: ['1'],
    details: [
      'Rigging & Knots: Learning how to secure loads and tools for lifting',
      'Tool Identification: Knowing every bolt, insulator, and bracket by name',
      'Truck Operations: Setting up outriggers and basic derrick operations'
    ],
    certifications: [
      'OSHA 10/30 (Construction): Safety standards for work sites',
      'CPR & First Aid: Critical for a high-risk environment',
      'Flagging Certification: Managing traffic around the work zone'
    ]
  },
  {
    id: '3',
    title: 'Apprentice Year 1: Basic Skills',
    description: 'Master the fundamentals of climbing and electrical theory.',
    level: 3,
    unlocked: false,
    completed: false,
    prerequisites: ['2'],
    details: [
      'Wood Pole Climbing: Mastering the gaffs (climbing spikes) and fall protection',
      'Electrical Theory: Understanding Volts, Amps, Ohms, and Wattage'
    ]
  },
  {
    id: '4',
    title: 'Apprentice Year 2: Low-Voltage & Secondary',
    description: 'Work on lines that go directly to homes.',
    level: 4,
    unlocked: false,
    completed: false,
    prerequisites: ['3'],
    details: [
      'Secondary Wiring: Working on the lines that go directly to homes',
      'Transformer Basics: Learning how power is stepped down'
    ]
  },
  {
    id: '5',
    title: 'Apprentice Year 3: High-Voltage & Hot Work',
    description: 'Working on energized lines using protective gear.',
    level: 5,
    unlocked: false,
    completed: false,
    prerequisites: ['4'],
    details: [
      'Rubber Gloving: Working on energized lines using protective gear',
      'Hot Sticking: Using insulated poles to work on lines from a distance'
    ]
  },
  {
    id: '6',
    title: 'Apprentice Year 4: Advanced Systems',
    description: 'Understanding industrial power distribution and troubleshooting.',
    level: 6,
    unlocked: false,
    completed: false,
    prerequisites: ['5'],
    details: [
      'Three-Phase Power: Understanding industrial power distribution',
      'Troubleshooting: Identifying why the lights are out using meters and diagrams'
    ]
  },
  {
    id: '7',
    title: 'Journeyman Lineworker',
    description: 'Master of the trade with full competency.',
    level: 7,
    unlocked: false,
    completed: false,
    prerequisites: ['6'],
    details: [
      'Live-Line Maintenance: Working on transmission lines without turning off the power',
      'Underground Distribution: Splicing high-voltage cables and working in vaults',
      'Substation Awareness: Understanding the brain of the grid',
      'Emergency Response: Leading crews during storm restoration'
    ]
  },
  {
    id: '8',
    title: 'Career Specialization & Leadership',
    description: 'Choose your final branch and lead teams.',
    level: 8,
    unlocked: false,
    completed: false,
    prerequisites: ['7'],
    details: [
      'Crew Leader / Foreman: Managing a team and project safety on-site',
      'Troubleshooter: Solo operator who responds to immediate outages',
      'Safety Coordinator: Moving into training and OSHA compliance',
      'Load Dispatcher: Working in a control room to manage the flow of the entire grid'
    ]
  }
];
