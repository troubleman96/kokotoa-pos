import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Play } from 'lucide-react';

const Demo = () => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 pt-24 pb-16">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4 animate-slide-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                            <Play className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                Demo Video
                            </span>
                        </div>

                        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                            Jinsi ya Kutumia KOKOTOA POS
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Tazama video hii fupi ili ujifunze jinsi ya kutumia mfumo wetu wa POS kwa urahisi
                        </p>
                    </div>

                    {/* Video Container */}
                    <div className="relative w-full animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="relative w-full pb-[56.25%] rounded-2xl overflow-hidden shadow-2xl border border-border">
                            <iframe
                                className="absolute top-0 left-0 w-full h-full"
                                src="https://www.youtube.com/embed/2LvRK4rVXRI?autoplay=1&mute=0&rel=0&modestbranding=1"
                                title="KOKOTOA POS Demo"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                        <div className="card-kokotoa p-6 text-center">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📱</span>
                            </div>
                            <h3 className="font-display font-semibold text-foreground mb-2">
                                Rahisi Kutumia
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Mfumo ulio rahisi na wa kisasa kwa biashara yako
                            </p>
                        </div>

                        <div className="card-kokotoa p-6 text-center">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <h3 className="font-display font-semibold text-foreground mb-2">
                                Haraka & Salama
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Rekodi mauzo na ufuatilie bidhaa kwa haraka
                            </p>
                        </div>

                        <div className="card-kokotoa p-6 text-center">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📊</span>
                            </div>
                            <h3 className="font-display font-semibold text-foreground mb-2">
                                Ripoti Kamili
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Angalia takwimu na ripoti za biashara yako
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Demo;
