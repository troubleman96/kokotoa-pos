import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { graphsApi } from '@/services/api';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';

export interface Notification {
    id: string;
    type: 'low_stock' | 'sale' | 'system';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    notificationCount: number;
    refreshNotifications: () => Promise<void>;
    markAsRead: (id: string) => void;
    isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { language } = useLanguage();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const refreshNotifications = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const response = await graphsApi.getDashboard();
            if (response.success && response.data) {
                const data = response.data;
                const newNotifications: Notification[] = [];

                const formatPrice = (price: number) => `TSh ${price.toLocaleString()}`;

                // Low Stock Notification
                if (data.inventory.low_stock_count > 0) {
                    newNotifications.push({
                        id: 'low_stock_1',
                        type: 'low_stock',
                        title: language === 'sw' ? 'Bidhaa Zinakwisha' : 'Low Stock Alert',
                        message: language === 'sw'
                            ? `${data.inventory.low_stock_count} bidhaa zinahitaji kuongezwa`
                            : `${data.inventory.low_stock_count} products need restocking`,
                        time: language === 'sw' ? 'Sasa hivi' : 'Just now',
                        read: false,
                    });
                }

                // Today's Sales Notification
                if (data.today.transactions > 0) {
                    newNotifications.push({
                        id: 'sale_1',
                        type: 'sale',
                        title: language === 'sw' ? 'Mauzo ya Leo' : "Today's Sales",
                        message: language === 'sw'
                            ? `Umefanya mauzo ${data.today.transactions} - ${formatPrice(data.today.sales)}`
                            : `You made ${data.today.transactions} sales - ${formatPrice(data.today.sales)}`,
                        time: language === 'sw' ? 'Muda mfupi uliopita' : 'A moment ago',
                        read: false,
                    });
                }

                setNotifications(newNotifications);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user, language]);

    useEffect(() => {
        if (user) {
            refreshNotifications();
            // Refresh every 5 minutes
            const interval = setInterval(refreshNotifications, 5 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [user, refreshNotifications]);

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const notificationCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            notificationCount,
            refreshNotifications,
            markAsRead,
            isLoading
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
