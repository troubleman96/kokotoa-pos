import { useState, ReactNode } from 'react';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import NotificationPanel from './NotificationPanel';

interface DashboardLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    notificationCount?: number;
    notifications?: Array<{
        id: string;
        type: 'low_stock' | 'sale' | 'system';
        title: string;
        message: string;
        time: string;
        read: boolean;
    }>;
    headerActions?: React.ReactNode;
}

const DashboardLayout = ({
    children,
    title,
    subtitle,
    notificationCount = 0,
    notifications = [],
    headerActions
}: DashboardLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    const handleMarkAsRead = (id: string) => {
        // This would typically update state in a parent component or context
        console.log('Mark as read:', id);
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
        </div>
    );
};

export default DashboardLayout;
