import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Clock, Mail, AlertCircle, Inbox, Info, CheckCircle2 } from 'lucide-react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications';

// --- UTILS ---
function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: notifications } = useNotifications();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  // --- CLICK OUTSIDE HANDLER ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- LOGIC HELPERS ---
  const handleNotificationClick = (id: string, isRead: boolean) => {
    if (!isRead) markAsRead(id);
  };

  const getNotificationStyles = (type: string, is_read: boolean) => {
    switch(type) {
      case 'ALERT': 
        return { icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-600', bg: 'bg-red-50' };
      case 'EMAIL': 
        return { icon: <Mail className="h-4 w-4" />, color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'SUCCESS': 
        return { icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50' };
      default: 
        return { icon: <Info className="h-4 w-4" />, color: 'text-primary-600', bg: 'bg-primary-50' };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* TRIGGER BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 relative rounded-xl transition-all duration-200 group ${isOpen ? 'bg-slate-100 text-primary-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
      >
        <Bell className={`h-6 w-6 transition-transform ${unreadCount > 0 ? 'group-hover:rotate-12' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 ring-2 ring-white text-[10px] font-black text-white shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN PANEL */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 z-50 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          
          {/* HEADER */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">Activity Feed</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                {unreadCount} Unread Notifications
              </p>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead()}
                disabled={isMarkingAll}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isMarkingAll ? '...' : <><Check className="h-3 w-3" /> Mark all read</>}
              </button>
            )}
          </div>

          {/* LIST AREA */}
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {!notifications || notifications.length === 0 ? (
              <div className="py-16 text-center px-6">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Inbox className="h-8 w-8 text-slate-200" />
                </div>
                <p className="text-sm font-bold text-slate-900">Quiet for now</p>
                <p className="text-xs text-slate-400 mt-1">We'll notify you when something important happens.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {notifications.map((notification) => {
                  const styles = getNotificationStyles(notification.type, notification.is_read);
                  return (
                    <li 
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id, notification.is_read)}
                      className={`group p-4 transition-all cursor-pointer relative ${!notification.is_read ? 'bg-primary-50/30 hover:bg-primary-50/50' : 'hover:bg-slate-50'}`}
                    >
                      <div className="flex gap-4">
                        {/* Icon Wrapper */}
                        <div className={`flex-shrink-0 h-10 w-10 rounded-xl ${styles.bg} ${styles.color} flex items-center justify-center shadow-sm transition-transform group-hover:scale-105`}>
                          {styles.icon}
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            {/* Reduced unread text weight slightly for less visual clutter */}
                            <p className={`text-sm leading-tight ${!notification.is_read ? 'font-semibold text-slate-900' : 'font-medium text-slate-600'}`}>
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <span className="h-2 w-2 rounded-full bg-primary-500 mt-1 shadow-[0_0_8px_rgba(59,130,246,0.5)] flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-3 mt-2.5">
                            <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                              <Clock className="h-3 w-3 mr-1" />
                              {timeAgo(notification.created_at)}
                            </div>
                            {notification.type && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                                {notification.type}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* FOOTER */}
          <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-center">
            {/* Fixed the tiny footer text to be a usable link size */}
            <button className="text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors">
              View All Archives
            </button>
          </div>
        </div>
      )}
    </div>
  );
}