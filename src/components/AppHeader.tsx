import { Menu, Bell, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface AppHeaderProps {
    title: string;
    subtitle?: string;
    onMenuToggle: () => void;
    onNotificationClick: () => void;
    notificationCount?: number;
    headerActions?: React.ReactNode;
}

const AppHeader = ({ title, subtitle, onMenuToggle, onNotificationClick, notificationCount = 0, headerActions }: AppHeaderProps) => {
    const { language, setLanguage } = useLanguage();

    return (
        <header className="bg-card border-b border-border p-4 lg:p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onMenuToggle} className="lg:hidden p-2 text-foreground">
                        <Menu className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="font-display text-xl sm:text-2xl font-black text-foreground tracking-tight leading-none mb-1">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-70">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 relative">
                    {headerActions}

                    {/* Smart Language Toggle */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-10 px-2 sm:px-3 flex items-center gap-1 sm:gap-2 border-primary/10 hover:bg-primary/5 rounded-xl transition-all duration-300"
                        onClick={() => setLanguage(language === 'sw' ? 'en' : 'sw')}
                    >
                        <img
                            src={language === 'sw' ? "https://flagcdn.com/w40/gb.png" : "https://flagcdn.com/w40/tz.png"}
                            alt={language === 'sw' ? "English" : "Swahili"}
                            className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
                        />
                        <span className="font-black text-xs tracking-tighter hidden sm:inline">
                            {language === 'sw' ? 'EN' : 'SW'}
                        </span>
                    </Button>

                    <Button variant="outline" size="icon" className="h-10 w-10 relative transition-all hover:bg-primary/5 border-primary/10 rounded-xl" onClick={onNotificationClick}>
                        <Bell className="w-5 h-5" />
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-card">
                                {notificationCount}
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default AppHeader;
