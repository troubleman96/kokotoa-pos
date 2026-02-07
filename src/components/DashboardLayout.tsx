import { useState, ReactNode } from 'react';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import NotificationPanel from './NotificationPanel';
import TourWelcome from './onboarding/TourWelcome';
import { useNotifications } from '@/contexts/NotificationContext';

interface DashboardLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    headerActions?: React.ReactNode;
}

const DashboardLayout = ({
    children,
    title,
    subtitle,
    headerActions
}: DashboardLayoutProps) => {
    const { notifications, notificationCount, markAsRead } = useNotifications();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    const handleMarkAsRead = (id: string) => {
        markAsRead(id);
    };

    return (
        <div className="min-h-screen bg-background flex">
            <AppSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col">
                <AppHeader
                    title={title}
                    subtitle={subtitle}
                    onMenuToggle={() => setIsSidebarOpen(true)}
                    onNotificationClick={() => setIsNotificationOpen(true)}
                    notificationCount={notificationCount}
                    headerActions={headerActions}
                />

                <main className="flex-1 p-4 lg:p-6 overflow-auto">
                    {children}
                </main>
            </div>

            <NotificationPanel
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
            />

            <TourWelcome />
        </div>
    );
};

export default DashboardLayout;
