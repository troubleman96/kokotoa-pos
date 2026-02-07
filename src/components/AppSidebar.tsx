import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import {
    ShoppingCart, Package, BarChart3, Settings, LogOut, X, Home, History, Receipt, Users, Compass
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
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300`}>
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-border space-y-2">
                        <div className="flex items-center justify-between w-full">
                            <Link to="/" className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-transparent">
                                    <img src="/pos-kokotoa_favicon/favicon.svg" alt="KOKOTOA Logo" className="w-full h-full object-contain" />
                                </div>
                                <span className="font-display font-bold text-lg text-foreground">KOKOTOA</span>
                            </Link>
                            <button onClick={onClose} className="lg:hidden text-muted-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-foreground font-semibold truncate max-w-full px-1">
                            {user?.store_name || (language === 'sw' ? 'Msimamizi' : 'Administrator')}
                        </p>
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full ${location.pathname === item.path
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-border">
                        <button
                            onClick={() => {
                                restartOnboarding();
                                onClose();
                            }}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors w-full text-left mb-2"
                        >
                            <Compass className="w-5 h-5" />
                            <span>{language === 'sw' ? 'Mwongozo' : 'Tour Guide'}</span>
                        </button>
                    </div>

                    <div className="p-4 border-t border-border">
                        <div className="flex gap-2">
                            <Button variant={language === 'sw' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('sw')} className={language === 'sw' ? 'flex-1 btn-kokotoa' : 'flex-1'}>🇹🇿 SW</Button>
                            <Button variant={language === 'en' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('en')} className={language === 'en' ? 'flex-1 btn-kokotoa' : 'flex-1'}>🇬🇧 EN</Button>
                        </div>
                    </div>

                    <div className="p-4 border-t border-border">
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full text-left"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>{language === 'sw' ? 'Ondoka' : 'Logout'}</span>
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
