import { X, Bell, AlertTriangle, TrendingUp, Package } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

interface Notification {
    id: string;
    type: 'low_stock' | 'sale' | 'system';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onMarkAsRead?: (id: string) => void;
}

const NotificationPanel = ({ isOpen, onClose, notifications, onMarkAsRead }: NotificationPanelProps) => {
    const { language } = useLanguage();

    const getIcon = (type: string) => {
        switch (type) {
            case 'low_stock':
                return <AlertTriangle className="w-5 h-5 text-destructive" />;
            case 'sale':
                return <TrendingUp className="w-5 h-5 text-primary" />;
            default:
                return <Bell className="w-5 h-5 text-muted-foreground" />;
        }
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            {/* Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-full md:w-1/2 bg-card border-l border-border z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 lg:p-6 border-b border-border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Bell className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="font-display font-semibold text-lg text-foreground">
                                        {language === 'sw' ? 'Arifa' : 'Notifications'}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {notifications.length} {language === 'sw' ? 'arifa' : 'notifications'}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3">
                        {notifications.length === 0 ? (
                            <div className="text-center py-12">
                                <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    {language === 'sw' ? 'Hakuna Arifa' : 'No Notifications'}
                                </h3>
                                <p className="text-muted-foreground">
                                    {language === 'sw' ? 'Utapokea arifa hapa' : "You'll receive notifications here"}
                                </p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 rounded-xl border transition-colors cursor-pointer ${notification.read
                                            ? 'bg-muted/30 border-border/50'
                                            : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                                        }`}
                                    onClick={() => onMarkAsRead?.(notification.id)}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h4 className="font-semibold text-foreground text-sm">
                                                    {notification.title}
                                                </h4>
                                                {!notification.read && (
                                                    <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {notification.message}
                                            </p>
                                            <span className="text-xs text-muted-foreground">
                                                {notification.time}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default NotificationPanel;
