import { create } from 'zustand';

type Language = 'en' | 'hi';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'login.welcome': 'Welcome Back',
    'login.title': 'Secure your operations command.',
    'login.subtitle': 'Log in to manage your active patrols, respond to incidents, and access real-time SOC telemetry.',
    'login.signin': 'Sign in',
    'login.email': 'Email Address',
    'login.password': 'Password',
    'login.button': 'Sign in to Dashboard',
    'login.authenticating': 'Authenticating...',
    
    'scanner.title': 'Confirm Checkpoint Scan',
    'scanner.subtitle': 'You are about to record a visit to this checkpoint.',
    'scanner.no_session': 'No assigned duty or active patrol session found.',
    'scanner.not_found': 'Invalid QR code or network error.',
    'scanner.confirm_button': 'Confirm Scan',
    'scanner.cancel': 'Cancel',
    'scanner.success': 'Checkpoint scanned successfully!',
    'scanner.already_scanned': 'Checkpoint already scanned.',
    'scanner.offline': 'Network offline. Scan saved to secure offline queue.',
    'scanner.error': 'Failed to record scan.',
    'scanner.locating': 'Acquiring secure GPS lock...',
    'scanner.enable_gps': 'Location required: Please enable GPS',
    
    'patrol.active': 'Active Patrols',
    'patrol.execute': 'Execute your assigned security routes and record checkpoint scans.',
    'patrol.in_progress': 'IN PROGRESS',
    'patrol.completed': 'COMPLETED',
    'patrol.checkpoints': 'Route Checkpoints',
    'patrol.cleared': 'Cleared',
    'patrol.launch_scanner': 'Launch Scanner',
    'patrol.cancel_scan': 'Cancel Scan',
    'patrol.available_routes': 'Available Routes',
    'patrol.select_route': 'Select a route below to begin your physical patrol.',
    'patrol.start_patrol': 'Start Physical Patrol',
    'patrol.no_routes': 'No Routes Available',

    'dashboard.greeting': 'Hello',
    'dashboard.status_active': 'Duty Status: Active',
    'dashboard.error_loading': 'Failed to load dashboard data',
    'dashboard.continue_patrol': 'Continue Patrol',
    'dashboard.upcoming_duty': 'Assigned Routes',
    'dashboard.stops': 'Stops',
    'dashboard.mins': 'mins',
    'dashboard.view_route': 'View Route',
    'dashboard.view_all': 'View all assignments',
    
    'profile.title': 'Profile & Settings',
    'profile.language': 'Language / भाषा',
    'profile.logout': 'Sign Out',
  },
  hi: {
    'login.welcome': 'वापसी पर स्वागत है',
    'login.title': 'अपने ऑपरेशन्स कमांड को सुरक्षित करें।',
    'login.subtitle': 'अपनी सक्रिय गश्त को प्रबंधित करने, घटनाओं का जवाब देने और रीयल-टाइम SOC टेलीमेट्री तक पहुंचने के लिए लॉग इन करें।',
    'login.signin': 'साइन इन करें',
    'login.email': 'ईमेल पता',
    'login.password': 'पासवर्ड',
    'login.button': 'डैशबोर्ड में साइन इन करें',
    'login.authenticating': 'प्रमाणीकरण हो रहा है...',
    
    'scanner.title': 'चेकपॉइंट स्कैन की पुष्टि करें',
    'scanner.subtitle': 'आप इस चेकपॉइंट पर अपनी उपस्थिति दर्ज करने वाले हैं।',
    'scanner.no_session': 'कोई ड्यूटी या सक्रिय गश्त नहीं मिली।',
    'scanner.not_found': 'अमान्य QR कोड या नेटवर्क त्रुटि।',
    'scanner.confirm_button': 'स्कैन की पुष्टि करें (Confirm Scan)',
    'scanner.cancel': 'रद्द करें (Cancel)',
    'scanner.success': 'चेकपॉइंट सफलतापूर्वक स्कैन किया गया!',
    'scanner.already_scanned': 'चेकपॉइंट पहले ही स्कैन हो चुका है।',
    'scanner.offline': 'नेटवर्क ऑफलाइन है। स्कैन सुरक्षित रूप से सेव किया गया।',
    'scanner.error': 'स्कैन दर्ज करने में विफल।',
    'scanner.locating': 'सुरक्षित GPS स्थान प्राप्त किया जा रहा है...',
    'scanner.enable_gps': 'GPS आवश्यक है: कृपया स्थान (Location) चालू करें',

    'patrol.active': 'सक्रिय गश्त (Active Patrols)',
    'patrol.execute': 'अपने असाइन किए गए सुरक्षा मार्गों को पूरा करें और चेकपॉइंट स्कैन दर्ज करें।',
    'patrol.in_progress': 'प्रगति पर है (IN PROGRESS)',
    'patrol.completed': 'पूरा हुआ (COMPLETED)',
    'patrol.checkpoints': 'मार्ग चेकपॉइंट्स',
    'patrol.cleared': 'पूर्ण (Cleared)',
    'patrol.launch_scanner': 'स्कैनर चालू करें (Launch Scanner)',
    'patrol.cancel_scan': 'स्कैन रद्द करें (Cancel Scan)',
    'patrol.available_routes': 'उपलब्ध मार्ग',
    'patrol.select_route': 'अपनी गश्त शुरू करने के लिए नीचे एक मार्ग चुनें।',
    'patrol.start_patrol': 'गश्त शुरू करें',
    'patrol.no_routes': 'कोई मार्ग उपलब्ध नहीं',

    'dashboard.greeting': 'नमस्ते',
    'dashboard.status_active': 'ड्यूटी स्थिति: सक्रिय',
    'dashboard.error_loading': 'डैशबोर्ड डेटा लोड करने में विफल',
    'dashboard.continue_patrol': 'गश्त जारी रखें',
    'dashboard.upcoming_duty': 'निर्दिष्ट मार्ग (Assigned Routes)',
    'dashboard.stops': 'पड़ाव',
    'dashboard.mins': 'मिनट',
    'dashboard.view_route': 'मार्ग देखें',
    'dashboard.view_all': 'सभी कार्य देखें',
    
    'profile.title': 'प्रोफाइल और सेटिंग्स',
    'profile.language': 'भाषा / Language',
    'profile.logout': 'साइन आउट करें',
  }
};

const getInitialLang = (): Language => {
  const saved = localStorage.getItem('trackSentra_lang');
  if (saved === 'en' || saved === 'hi') return saved;
  return 'en';
};

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: getInitialLang(),
  setLanguage: (lang: Language) => {
    localStorage.setItem('trackSentra_lang', lang);
    set({ language: lang });
  },
  t: (key: string) => {
    const lang = get().language;
    // @ts-ignore
    return translations[lang][key] || key;
  }
}));
