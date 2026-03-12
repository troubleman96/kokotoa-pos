import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
    showReceiptAfterSale: boolean;
    receiptPreferenceConfigured: boolean;
}

interface SettingsContextType {
    settings: Settings;
    updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const defaultSettings: Settings = {
    showReceiptAfterSale: false,
    receiptPreferenceConfigured: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useState<Settings>(() => {
        const saved = localStorage.getItem('kokotoa_settings');
        if (!saved) return defaultSettings;

        try {
            const parsed = JSON.parse(saved) as Partial<Settings>;

            // Legacy settings stored the old auto-open default without tracking user intent.
            // Reset those users to the new off-by-default behavior unless they explicitly reconfigure.
            if (typeof parsed.receiptPreferenceConfigured !== 'boolean') {
                return {
                    ...defaultSettings,
                    ...parsed,
                    showReceiptAfterSale: false,
                    receiptPreferenceConfigured: false,
                };
            }

            return { ...defaultSettings, ...parsed };
        } catch (error) {
            console.error('Failed to parse saved settings:', error);
            return defaultSettings;
        }
    });

    useEffect(() => {
        localStorage.setItem('kokotoa_settings', JSON.stringify(settings));
    }, [settings]);

    const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        setSettings((prev) => ({
            ...prev,
            [key]: value,
            ...(key === 'showReceiptAfterSale' ? { receiptPreferenceConfigured: true } : {}),
        }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSetting }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
