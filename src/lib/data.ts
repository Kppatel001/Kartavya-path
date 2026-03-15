export const districtsOfGujarat = [
  "Ahmedabad (અમદાવાદ)",
  "Amreli (અમરેલી)",
  "Anand (આણંદ)",
  "Aravalli (અરવલ્લી)",
  "Banaskantha (બનાસકાંઠા)",
  "Bharuch (ભરૂચ)",
  "Bhavnagar (ભાવનગર)",
  "Botad (બોટાદ)",
  "Chhota Udepur (છોટા ઉદેપુર)",
  "Dahod (દાહોદ)",
  "Dang (ડાંગ)",
  "Devbhumi Dwarka (દેવભૂમિ દ્વારકા)",
  "Gandhinagar (ગાંધીનગર)",
  "Gir Somnath (ગીર સોમનાથ)",
  "Jamnagar (જામનગર)",
  "Junagadh (જૂનાગઢ)",
  "Kheda (ખેડા)",
  "Kutch (કચ્છ)",
  "Mahisagar (મહીસાગર)",
  "Mehsana (મહેસાણા)",
  "Morbi (મોરબી)",
  "Narmada (નર્મદા)",
  "Navsari (નવસારી)",
  "Panchmahal (પંચમહાલ)",
  "Patan (પાટણ)",
  "Porbandar (પોરબંદર)",
  "Rajkot (રાજકોટ)",
  "Sabarkantha (સાબરકાંઠા)",
  "Surat (સુરત)",
  "Surendranagar (સુરેન્દ્રનગર)",
  "Tapi (તાપી)",
  "Vadodara (વડોદરા)",
  "Valsad (વલસાડ)"
];

export const talukasByDistrict: Record<string, string[]> = {
  "Ahmedabad (અમદાવાદ)": ["Ahmedabad City", "Bavla", "Daskroi", "Detroj-Rampura", "Dhandhuka", "Dholera", "Dholka", "Mandal", "Sanand", "Viramgam"],
  "Amreli (અમરેલી)": ["Amreli", "Babra", "Bagasara", "Dhari", "Jafrabad", "Khambha", "Kunkavav Vadia", "Lathi", "Lilia", "Rajula", "Savarkundla"],
  "Anand (આણંદ)": ["Anand", "Anklav", "Borsad", "Khambhat", "Petlad", "Sojitra", "Tarapur", "Umreth"],
  "Aravalli (અરવલ્લી)": ["Bayad", "Bhiloda", "Dhansura", "Malpur", "Meghraj", "Modasa"],
  "Banaskantha (બનાસકાંઠા)": ["Amirgadh", "Bhabhar", "Danta", "Dantivada", "Deesa", "Deodar", "Dhanera", "Kankrej", "Lakhani", "Palanpur", "Suigam", "Tharad", "Vadgam", "Vav"],
  "Bharuch (ભરૂચ)": ["Bharuch", "Ankleshwar", "Hansot", "Jambusar", "Jhagadia", "Netrang", "Vagra", "Valia", "Amod"],
  "Bhavnagar (ભાવનગર)": ["Bhavnagar", "Gariadhar", "Ghogha", "Jesar", "Mahuva", "Palitana", "Sihor", "Talaja", "Umrala", "Vallabhipur"],
  "Botad (બોટાદ)": ["Botad", "Barvala", "Gadhada", "Ranpur"],
  "Chhota Udepur (છોટા ઉદેપુર)": ["Chhota Udepur", "Bodeli", "Jetpur Pavi", "Kavant", "Nasvadi", "Sankheda"],
  "Dahod (દાહોદ)": ["Dahod", "Devgadh Baria", "Dhanpur", "Fatepura", "Garbada", "Limkheda", "Sanjeli", "Singvad", "Jhalod"],
  "Dang (ડાંગ)": ["Ahwa", "Subir", "Waghai"],
  "Devbhumi Dwarka (દેવભૂમિ દ્વારકા)": ["Bhanvad", "Kalyanpur", "Khambhalia", "Okhamandal (Dwarka)"],
  "Gandhinagar (ગાંધીનગર)": ["Gandhinagar", "Dehgam", "Kalol", "Mansa"],
  "Gir Somnath (ગીર સોમનાથ)": ["Veraval", "Kodinar", "Sutrapada", "Talala", "Una", "Gir-Gadhada"],
  "Jamnagar (જામનગર)": ["Jamnagar", "Dhrol", "Jamjodhpur", "Jodiya", "Kalavad", "Lalpur"],
  "Junagadh (જૂનાગઢ)": ["Junagadh City", "Junagadh Rural", "Bhesan", "Keshod", "Malia", "Manavadar", "Mangrol", "Mendarda", "Vanthali", "Visavadar"],
  "Kheda (ખેડા)": ["Kheda", "Galteshwar", "Kapadvanj", "Kathlal", "Mahudha", "Matar", "Mehmedabad", "Nadiad", "Thasra", "Vaso"],
  "Kutch (કચ્છ)": ["Bhuj", "Abdasa", "Anjar", "Bhachau", "Gandhidham", "Lakhpat", "Mandvi", "Mundra", "Nakhatrana", "Rapar"],
  "Mahisagar (મહીસાગર)": ["Balasinor", "Kadana", "Khanpur", "Lunawada", "Santrampur", "Virpur"],
  "Mehsana (મહેસાણા)": ["Mehsana", "Becharaji", "Kadi", "Kheralu", "Jotana", "Satlasana", "Unjha", "Vadnagar", "Vijapur", "Visnagar"],
  "Morbi (મોરબી)": ["Morbi", "Halvad", "Maliya-Miyana", "Tankara", "Wankaner"],
  "Narmada (નર્મદા)": ["Nandod (Rajpipla)", "Dediapada", "Garudeshwar", "Sagbara", "Tilakwada"],
  "Navsari (નવસારી)": ["Navsari", "Bansda", "Chikhli", "Gandevi", "Jalalpore", "Khergam"],
  "Panchmahal (પંચમહાલ)": ["Godhra", "Ghoghamba", "Halol", "Jambughoda", "Kalol", "Morwa Hadaf", "Shehera"],
  "Patan (પાટણ)": ["Patan", "Chanasma", "Harij", "Radhanpur", "Sami", "Sankheswar", "Santalpur", "Sarasvati", "Sidhpur"],
  "Porbandar (પોરબંદર)": ["Porbandar", "Kutiyana", "Ranavav"],
  "Rajkot (રાજકોટ)": ["Rajkot City", "Rajkot Rural", "Gondal", "Jetpur", "Dhoraji", "Kotda Sangani", "Lodhika", "Paddhari", "Upleta", "Vinchhiya", "Jasdan", "Jamkandorna"],
  "Sabarkantha (સાબરકાંઠા)": ["Himatnagar", "Idar", "Khedbrahma", "Poshina", "Prantij", "Talod", "Vadali", "Vijaynagar"],
  "Surat (સુરત)": ["Surat City", "Choryasi", "Olpad", "Kamrej", "Bardoli", "Mahuva", "Mandvi", "Palsana", "Mangrol", "Umarpada"],
  "Surendranagar (સુરેન્દ્રનગર)": ["Chotila", "Chudha", "Dasada", "Dhrangadhra", "Lakhtar", "Limbdi", "Muli", "Sayla", "Thangadh", "Wadhwan"],
  "Tapi (તાપી)": ["Vyara", "Valod", "Nizar", "Uchchhal", "Songadh", "Dolvan", "Kukarmunda"],
  "Vadodara (વડોદરા)": ["Vadodara City", "Vadodara Rural", "Dabhoi", "Karjan", "Padra", "Savli", "Sinor", "Vaghodia", "Desar"],
  "Valsad (વલસાડ)": ["Valsad", "Dharampur", "Kaprada", "Pardi", "Umbergaon", "Vapi"]
};

export const schoolsByDistrict: Record<string, string[]> = {
  "Ahmedabad (અમદાવાદ)": [
    "Ahmedabad International School",
    "Delhi Public School Ahmedabad",
    "St. Kabir School Ahmedabad",
    "Zydus School for Excellence",
    "Udgam School for Children",
    "Nirma Vidyavihar",
    "Podar International School Ahmedabad",
    "The New Tulip International School"
  ],
  "Vadodara (વડોદરા)": [
    "Navrachana School Vadodara",
    "Bright Day School",
    "Baroda High School"
  ],
  "Rajkot (રાજકોટ)": [
    "SN Kansagra School Rajkot",
    "The Rajkumar College",
    "Saint Mary's School"
  ],
  "Surat (સુરત)": [
    "P.P. Savani School",
    "Gajera International School",
    "S.D. Jain Modern School"
  ]
};

export const educationBoards = [
  "Gujarat Secondary and Higher Secondary Education Board (GSEB)",
  "Central Board of Secondary Education (CBSE) - Gujarat Region"
];

export const classLevels = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"
];

export const subjects = [
  "ગણિત (Mathematics)", 
  "વિજ્ઞાન (Science)", 
  "સામાજિક વિજ્ઞાન (Social Science)", 
  "ગુજરાતી (Gujarati)", 
  "અંગ્રેજી (English)", 
  "હિન્દી (Hindi)", 
  "ભૌતિક વિજ્ઞાન (Physics)", 
  "રસાયણ વિજ્ઞાન (Chemistry)", 
  "જીવ વિજ્ઞાન (Biology)", 
  "ઇતિહાસ (History)", 
  "ભૂગોળ (Geography)", 
  "કમ્પ્યુટર વિજ્ઞાન (Computer Science)"
];

export const languages = [
  "ગુજરાતી (Gujarati)",
  "English",
  "Hindi"
];
