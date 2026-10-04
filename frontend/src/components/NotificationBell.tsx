import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, ShieldAlert, AlertTriangle, Info, Check, X, Clock } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import { useNavigate } from 'react-router-dom';

export const NotificationBell = ({ size = 20, className = "" }: { size?: number, className?: string }) => {
  const { 
    notifications, 
    unreadCount, 
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    connectSocket,
    disconnectSocket
  } = useNotificationStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();
    connectSocket();

    return () => {
      // Clean up socket when bell is fully unmounted (logout)
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <ShieldAlert size={16} className="text-red-500" />;
      case 'WARNING': return <AlertTriangle size={16} className="text-amber-500" />;
      case 'SUCCESS': return <CheckCircle2 size={16} className="text-emerald-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    return date.toLocaleDateString('en-IN');
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) markAsRead(notification._id);
    setIsOpen(false);
    
    if (notification.entityType === 'Patrol' && notification.patrolId) {
      navigate(`/patrols/${notification.patrolId}`);
    } else if (notification.entityType === 'Incident' && notification.entityId) {
      // Assuming /incidents handles selecting an incident or /incidents/:id exists
      navigate(`/incidents`);
    } else if (notification.entityType === 'Checkpoint' && notification.siteId) {
      navigate(`/sites/${notification.siteId}`);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`relative p-2 rounded-full hover:bg-surface-hover transition-colors focus:outline-none ${className}`}
        aria-label="Notifications"
      >
        <Bell size={size} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 text-[10px] font-bold text-background flex items-center justify-center rounded-full bg-red-500 border-2 border-surface-sidebar">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200">
          <div 
            ref={sidebarRef}
            className="absolute right-0 top-0 h-full w-full max-w-sm bg-surface-sidebar border-l border-border-subtle shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-main">
              <div>
                <h2 className="text-lg font-bold text-text-main">Notifications</h2>
                <p className="text-sm text-text-secondary">{unreadCount} unread</p>
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button 
                    onClick={() => markAllAsRead()}
                    className="text-xs font-semibold text-emerald-primary hover:text-emerald-hover flex items-center gap-1"
                  >
                    <Check size={14} /> Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-main p-1 rounded-md hover:bg-surface-hover">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto bg-surface-sidebar">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <div className="w-16 h-16 bg-surface-card rounded-full flex items-center justify-center mb-4 text-text-muted border border-border-subtle">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-text-main font-bold mb-1">You're all caught up</h3>
                  <p className="text-text-secondary text-sm">No new notifications.</p>
                </div>
              ) : (
                <div className="divide-y divide-border-subtle">
                  {notifications.map((notif) => (
                    <div 
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 hover:bg-surface-main cursor-pointer transition-colors relative ${!notif.isRead ? 'bg-emerald-primary/5' : ''}`}
                    >
                      {!notif.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-primary"></div>
                      )}
                      <div className="flex gap-3">
                        <div className="shrink-0 mt-0.5">
                          {getSeverityIcon(notif.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm mb-1 ${!notif.isRead ? 'font-bold text-text-main' : 'font-medium text-text-secondary'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-text-secondary mb-2 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-[10px] font-medium text-text-muted flex items-center gap-1 uppercase tracking-wider">
                            <Clock size={10} /> {formatTime(notif.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-border-subtle bg-surface-main text-center">
                <button className="text-sm font-semibold text-text-secondary hover:text-text-main">
                  View all history
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
