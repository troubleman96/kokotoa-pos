import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import {
    ShoppingCart, Package, BarChart3, Settings, LogOut, X, Home, History, Receipt, Users, Compass, Languages
} from 'lucide-react';

interface AppSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const AppSidebar = ({ isOpen, onClose }: AppSidebarProps) => {
    const { language, setLanguage } = useLanguage();
    const { user, logout } = useAuth();
    const { restartOnboarding } = useOnboarding();
    const location = useLocation();

    const navItems = [
        { path: '/dashboard', icon: Home, label: language === 'sw' ? 'Dashibodi' : 'Dashboard' },
        { path: '/pos', icon: ShoppingCart, label: language === 'sw' ? 'Mauzo' : 'Sales' },
        { path: '/inventory', icon: Package, label: language === 'sw' ? 'Hesabu' : 'Inventory' },
        { path: '/stock-history', icon: History, label: language === 'sw' ? 'Logi ya Bidhaa' : 'Stock History' },
        { path: '/sales-history', icon: Receipt, label: language === 'sw' ? 'Miamala' : 'Transactions' },
        ...(user?.role === 'OWNER' ? [
            { path: '/reports', icon: BarChart3, label: language === 'sw' ? 'Ripoti' : 'Reports' },
            { path: '/subscription', icon: Package, label: language === 'sw' ? 'Usajili' : 'Subscription' },
            { path: '/users', icon: Users, label: language === 'sw' ? 'Wafanyakazi' : 'Staff' },
        ] : []),
        { path: '/settings', icon: Settings, label: language === 'sw' ? 'Mipangilio' : 'Settings' },
    ];

    return (
        <>
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none`}>
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Fixed Header */}
                    <div className="p-6 border-b border-border bg-card/50 backdrop-blur-md flex-none">
                        <Link to="/dashboard" className="flex items-center gap-3 group">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-105">
                                <img src="/pos-kokotoa_favicon/favicon.svg" alt="KOKOTOA Logo" className="w-8 h-8 object-contain" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-display font-black text-xl tracking-tight text-foreground">KOKOTOA</span>
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-[-2px]">Smart POS</span>
                            </div>
                        </Link>
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors absolute top-6 right-4"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="px-6 py-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">
                            {language === 'sw' ? 'Msimamizi wa Duka' : 'Store Administrator'}
                        </div>
                        <div className="text-sm text-foreground font-black truncate bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">
                            {user?.store_name || (language === 'sw' ? 'Msimamizi' : 'Administrator')}
                        </div>
                    </div>

                    {/* Scrollable Navigation Area */}
                    <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => {
                                        if (window.innerWidth < 1024) onClose();
                                    }}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                    <span className="font-semibold tracking-tight">{item.label}</span>
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground/50 animate-pulse" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Fixed Footer Block */}
                    <div className="p-4 border-t border-border bg-muted/20 backdrop-blur-sm space-y-2 flex-none">
                        {/* Tour Guide Button */}
                        <button
                            onClick={() => {
                                restartOnboarding();
                                onClose();
                            }}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300 w-full text-left group border border-transparent hover:border-primary/20"
                        >
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <Compass className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-sm tracking-tight">{language === 'sw' ? 'Mwongozo' : 'Tour Guide'}</span>
                        </button>

                        {/* Language Toggles */}
                        <div className="flex items-center gap-2 p-1.5 bg-muted/50 rounded-2xl border border-border/50">
                            <button
                                onClick={() => setLanguage('sw')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black transition-all duration-300 ${language === 'sw'
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <img src="https://flagcdn.com/w40/tz.png" className="w-4 h-3 object-cover rounded-sm" alt="TZ" />
                                SW
                            </button>
                            <button
                                onClick={() => setLanguage('en')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black transition-all duration-300 ${language === 'en'
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <img src="https://flagcdn.com/w40/gb.png" className="w-4 h-3 object-cover rounded-sm" alt="EN" />
                                EN
                            </button>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300 w-full text-left group border border-transparent hover:border-destructive/20"
                        >
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                                <LogOut className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-sm tracking-tight">{language === 'sw' ? 'Ondoka' : 'Logout'}</span>
                        </button>
                    </div>
                </div>
            </aside>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
            )}
        </>
    );
};

export default AppSidebar;
