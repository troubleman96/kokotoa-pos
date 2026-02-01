import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
    title: string;
    subtitle?: string;
    onMenuToggle: () => void;
    onNotificationClick: () => void;
    notificationCount?: number;
    headerActions?: React.ReactNode;
}

const AppHeader = ({ title, subtitle, onMenuToggle, onNotificationClick, notificationCount = 0, headerActions }: AppHeaderProps) => {
    return (
        <header className="bg-card border-b border-border p-4 lg:p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onMenuToggle} className="lg:hidden p-2 text-foreground">
                        <Menu className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="font-display text-2xl font-bold text-foreground">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-sm text-muted-foreground">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 relative">
                    {headerActions}
                    <Button variant="outline" size="icon" className="relative transition-all hover:bg-primary/5 border-primary/10" onClick={onNotificationClick}>
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
