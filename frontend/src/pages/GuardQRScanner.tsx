import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { api } from '../lib/axios';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Shield, AlertTriangle, CheckCircle2, Navigation, MapPin } from 'lucide-react';

export const GuardQRScanner = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t, language, setLanguage } = useLanguageStore();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [checkpoint, setCheckpoint] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [locationStatus, setLocationStatus] = useState('');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'GUARD') {
      // If a non-guard opens a guard checkpoint URL, redirect them to their dashboard
      navigate('/dashboard', { replace: true });
      return;
    }
    
    const initialize = async () => {
      try {
        setLoading(true);
        // 1. Fetch active session
        const sessionsRes = await api.get('/patrols/sessions');
        const active = sessionsRes.data.find((s: any) => s.status === 'in_progress');
        
        if (!active) {
          setError(t('scanner.no_session'));
          setLoading(false);
          return;
        }
        setActiveSession(active);

        // 2. Lookup Checkpoint by token
        const lookupRes = await api.get(`/checkpoints/lookup/${token}`);
        setCheckpoint(lookupRes.data.checkpoint);
        
      } catch (err: any) {
        setError(t('scanner.not_found'));
      } finally {
        setLoading(false);
      }
    };
    
    initialize();
  }, [token, user, language]); // language in dep array so error messages can theoretically update (though they won't automatically on existing error state without a wrapper, but it's fine)

  const handleConfirm = () => {
    setConfirming(true);
    setLocationStatus(t('scanner.locating'));
    setError('');

    if (!navigator.geolocation) {
      setError(t('scanner.enable_gps'));
      setLocationStatus('');
      setConfirming(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocationStatus('');
        await submitScan(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
      },
      (geoError) => {
        setLocationStatus('');
        setError(`${t('scanner.enable_gps')} (${geoError.message})`);
        submitScan(); // Still try to submit, backend will validate GPS requirements
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const submitScan = async (latitude?: number, longitude?: number, accuracy?: number) => {
    if (!activeSession) return;
    try {
      if (!navigator.onLine) {
        throw new Error('Network offline');
      }

      await api.post(`/patrols/sessions/${activeSession._id}/scans`, {
        qrPayload: token,
        latitude,
        longitude,
        accuracy
      });
      setMessage(t('scanner.success'));
      setTimeout(() => navigate('/patrols'), 2000);
    } catch (err: any) {
      setConfirming(false);
      if (!navigator.onLine || err.message === 'Network Error' || err.message === 'Network offline') {
        const newItem = {
          sessionId: activeSession._id,
          qrPayload: token,
          latitude,
          longitude,
          accuracy,
          timestamp: new Date().toISOString()
        };
        const saved = localStorage.getItem('trackSentra_offlineQueue');
        const queue = saved ? JSON.parse(saved) : [];
        const newQueue = [...queue, newItem];
        localStorage.setItem('trackSentra_offlineQueue', JSON.stringify(newQueue));
        
        setMessage(t('scanner.offline'));
        setTimeout(() => navigate('/patrols'), 2000);
      } else {
        setError(err.userMessage || t('scanner.error'));
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-primary"></div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto w-full p-4 space-y-6">
      
      {/* Language Switch */}
      <div className="flex justify-end gap-2 mb-4">
        <button 
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded text-sm font-bold ${language === 'en' ? 'bg-emerald-primary text-background' : 'bg-surface-card text-text-secondary border border-border-subtle'}`}
        >
          EN
        </button>
        <button 
          onClick={() => setLanguage('hi')}
          className={`px-3 py-1 rounded text-sm font-bold ${language === 'hi' ? 'bg-emerald-primary text-background' : 'bg-surface-card text-text-secondary border border-border-subtle'}`}
        >
          HI
        </button>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-primary/20 text-emerald-primary mb-4 border border-emerald-primary/30 shadow-lg">
          <Shield size={32} />
        </div>
        <h1 className="text-2xl font-bold text-text-main">{t('scanner.title')}</h1>
        <p className="text-text-secondary mt-2">{t('scanner.subtitle')}</p>
      </div>

      {error && (
        <div className="p-4 bg-danger/10 text-danger border border-danger/30 rounded-lg flex items-center gap-3">
          <AlertTriangle size={24} className="shrink-0" />
          <p className="font-semibold text-lg">{error}</p>
        </div>
      )}

      {message && (
        <div className="p-4 bg-emerald-primary/10 text-emerald-primary border border-emerald-primary/30 rounded-lg flex items-center gap-3">
          <CheckCircle2 size={24} className="shrink-0" />
          <p className="font-semibold text-lg">{message}</p>
        </div>
      )}

      {locationStatus && (
        <div className="p-4 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg flex items-center gap-3 animate-pulse">
          <Navigation size={24} className="animate-bounce shrink-0" /> 
          <p className="font-semibold text-lg">{locationStatus}</p>
        </div>
      )}

      {checkpoint && !error && !message && (
        <Card className="bg-surface-card border-2 border-emerald-primary shadow-xl overflow-hidden">
          <div className="p-6 bg-surface-main text-center border-b border-border-subtle">
            <h2 className="text-3xl font-extrabold text-emerald-primary mb-2">{checkpoint.name}</h2>
            <div className="flex items-center justify-center gap-2 text-text-secondary">
              <MapPin size={18} /> {checkpoint.location || 'Assigned Site'}
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <Button 
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full h-16 text-xl font-bold bg-emerald-primary hover:bg-emerald-hover text-background shadow-lg shadow-emerald-primary/25 rounded-xl flex items-center justify-center gap-3 transition-all"
            >
              {confirming ? (
                <div className="w-6 h-6 border-4 border-background border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <CheckCircle2 size={28} />
              )}
              {t('scanner.confirm_button')}
            </Button>
            
            <Button 
              onClick={() => navigate('/patrols')}
              variant="outline"
              disabled={confirming}
              className="w-full h-14 text-lg font-bold border-2 border-border-subtle text-text-secondary hover:text-text-main rounded-xl"
            >
              {t('scanner.cancel')}
            </Button>
          </div>
        </Card>
      )}

      {(!checkpoint || error) && (
        <Button 
          onClick={() => navigate('/patrols')}
          className="w-full h-14 text-lg font-bold bg-surface-main border-2 border-border-subtle text-text-main hover:bg-surface-hover rounded-xl"
        >
          Return to Dashboard
        </Button>
      )}
    </div>
  );
};
