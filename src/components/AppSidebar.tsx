import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import {
    ShoppingCart, Package, BarChart3, Settings, LogOut, X, Home, History, Receipt, Users, Compass, Languages, CreditCard, BookOpen
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
        { path: '/inventory', icon: Package, label: language === 'sw' ? 'Bidhaa' : 'Inventory' },
        { path: '/stock-history', icon: History, label: language === 'sw' ? 'Logi ya Bidhaa' : 'Stock History' },
        { path: '/sales-history', icon: Receipt, label: language === 'sw' ? 'Miamala' : 'Transactions' },
        { path: '/credit-debts', icon: CreditCard, label: language === 'sw' ? 'Madeni' : 'Credit Debts' },
        { path: '/notebook', icon: BookOpen, label: language === 'sw' ? 'Daftari' : 'Notebook' },
        ...(user?.role === 'OWNER' ? [
            { path: '/reports', icon: BarChart3, label: language === 'sw' ? 'Ripoti' : 'Reports' },
            { path: '/subscription', icon: Package, label: language === 'sw' ? 'Kifurushi' : 'Subscription' },
            { path: '/users', icon: Users, label: language === 'sw' ? 'Wafanyakazi' : 'Staff' },
        ] : []),
        { path: '/settings', icon: Settings, label: language === 'sw' ? 'Mipangilio' : 'Settings' },
    ];

    return (
        <>
            <aside className={`fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none`}>
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Fixed Header */}
                    <div className="p-6 border-b border-border bg-card/50 backdrop-blur-md flex-none relative">
                        <Link to="/dashboard" className="flex flex-col gap-4 group">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-105 shadow-inner">
                                    <img src="/pos-kokotoa_faviconupdate/favicon.svg" alt="KOKOTOA Logo" className="w-8 h-8 object-contain" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-display font-black text-xl tracking-tight text-foreground uppercase">KOKOTOA</span>
                                    <span className="text-[11px] font-bold text-green-600 uppercase tracking-wider mt-[-2px] truncate max-w-[170px]">
                                        {user?.store_name || (language === 'sw' ? 'Duka Langu' : 'My Store')}
                                    </span>
                                </div>
                            </div>
                        </Link>
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors absolute top-6 right-4"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Scrollable Navigation Area */}
                    <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => {
                                        if (window.innerWidth < 1024) onClose();
                                    }}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.01]'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                    {isActive && (
                                        <div className="ml-auto w-1 h-1 rounded-full bg-primary-foreground/50 animate-pulse" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Fixed Footer Block */}
                    <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm flex-none">
                        <div className="grid grid-cols-2 gap-2">
                            {/* Tour Guide Button */}
                            <button
                                onClick={() => {
                                    restartOnboarding();
                                    onClose();
                                }}
                                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300 group border border-border/50 hover:border-primary/20 bg-muted/20"
                            >
                                <Compass className="w-4 h-4 transition-transform group-hover:scale-110" />
                                <span className="font-black text-[10px] uppercase tracking-wider">{language === 'sw' ? 'Onyesha' : 'Tour'}</span>
                            </button>

                            {/* Logout Button */}
                            <button
                                onClick={logout}
                                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300 group border border-border/50 hover:border-destructive/20 bg-muted/20"
                            >
                                <LogOut className="w-4 h-4 transition-transform group-hover:scale-110" />
                                <span className="font-black text-[10px] uppercase tracking-wider">{language === 'sw' ? 'Ondoka' : 'Logout'}</span>
                            </button>
                        </div>
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
