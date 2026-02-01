import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Privacy = () => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-20">
                <section className="py-12 md:py-20 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <h1 className="font-display text-4xl md:text-5xl font-bold text-center mb-6">
                            {t('nav.privacy')}
                        </h1>
                    </div>
                </section>

                <section className="py-12 md:py-20">
                    <div className="container mx-auto px-4 max-w-4xl space-y-8 text-lg">
                        <p>
                            KOKOTOA inaheshimu faragha yako. Sera hii inaelezea jinsi tunavyokusanya, kutumia, na kulinda taarifa zako.
                        </p>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold font-display">1. Taarifa Tunazokusanya</h2>
                            <p className="text-muted-foreground">
                                Tunakusanya taarifa unazotoa wakati wa kujisajili, kama jina, namba ya simu, na taarifa za biashara.
                                Pia tunakusanya data ya matumizi ya mfumo ili kuboresha huduma zetu.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold font-display">2. Matumizi ya Taarifa</h2>
                            <p className="text-muted-foreground">
                                Tunatumia taarifa zako kutoa na kuboresha huduma zetu, kuwasiliana nawe kuhusu akaunti yako,
                                na kutuma taarifa muhimu za biashara. Hatutoi au kuuza taarifa zako kwa watu wengine bila idhini yako.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold font-display">3. Usalama wa Data</h2>
                            <p className="text-muted-foreground">
                                Tunatumia hatua madhubuti za kiusalama kulinda taarifa zako dhidi ya ufikiaji usioidhinishwa,
                                mabadiliko, au uharibifu. Data zote zinasimbwa (encrypted) kwa usalama zaidi.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold font-display">4. Haki Zako</h2>
                            <p className="text-muted-foreground">
                                Una haki ya kuomba nakala ya taarifa zako tunazoshikilia, kurekebisha taarifa zisizo sahihi,
                                au kuomba kufutwa kwa akaunti yako.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold font-display">5. Vidakuzi (Cookies)</h2>
                            <p className="text-muted-foreground">
                                Tunatumia vidakuzi kuboresha uzoefu wako kwenye tovuti yetu.
                                Unaweza kurekebisha mipangilio ya kivinjari chako kukataa vidakuzi ikiwa unapenda.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Privacy;
