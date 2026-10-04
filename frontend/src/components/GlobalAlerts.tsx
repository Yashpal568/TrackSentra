import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { AlertTriangle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const GlobalAlerts = () => {
  const { user } = useAuthStore();
  const [alert, setAlert] = useState<any>(null);

  useEffect(() => {
    if (!user || user.role === 'GUARD') return;

    const eventSource = new EventSource('http://localhost:5000/api/patrols/live/events', {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'INCIDENT_REPORTED') {
          setAlert(data.incident);
          
          // Browser notification
          if (Notification.permission === 'granted') {
            new Notification(`New Incident: ${data.incident.title}`, {
              body: data.incident.description,
            });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new Notification(`New Incident: ${data.incident.title}`, {
                  body: data.incident.description,
                });
              }
            });
          }
        }
      } catch (e) {
        console.error('Error parsing SSE for global alerts', e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [user]);

  if (!alert) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-bounce">
      <div className="bg-red-600 text-white p-4 rounded-lg shadow-2xl max-w-sm flex gap-4 items-start border-2 border-red-800">
        <AlertTriangle className="shrink-0" />
        <div className="flex-1">
          <h4 className="font-bold">New {alert.severity} Incident Reported</h4>
          <p className="text-sm mt-1">{alert.title}</p>
          <div className="mt-3 flex gap-2">
            <Link to="/incidents" onClick={() => setAlert(null)} className="text-sm font-bold underline bg-red-800 px-2 py-1 rounded">View Incident</Link>
          </div>
        </div>
        <button onClick={() => setAlert(null)} className="text-red-200 hover:text-white">
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
