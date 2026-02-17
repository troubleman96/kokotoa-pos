import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Terms = () => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-20">
                <section className="py-12 md:py-20 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <h1 className="font-display text-4xl md:text-5xl font-bold text-center mb-6">
                            {t('nav.terms')}
                        </h1>
                    </div>
                </section>

                <section className="py-12 md:py-20">
                    <div className="container mx-auto px-4 max-w-4xl space-y-8 text-lg card-kokotoa rounded-2xl p-8 md:p-10 pb-16 relative overflow-hidden">
                        <p>
                            Karibu kwenye KOKOTOA. Kwa kutumia mfumo huu, unakubaliana na masharti yafuatayo:
                        </p>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold font-display">1. Matumizi ya Huduma</h2>
                            <p className="text-muted-foreground">
                                KOKOTOA inakupa leseni ya kutumia mfumo wetu kwa ajili ya kusimamia biashara yako.
                                Hairuhusiwi kutumia mfumo huu kwa shughuli zozote zilizo kinyume na sheria za Jamhuri ya Muungano wa Tanzania.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold font-display">2. Malipo na Usajili</h2>
                            <p className="text-muted-foreground">
                                Baadhi ya huduma zetu zinahitaji malipo. Ada za usajili zinalipwa kabla ya kuanza kutumia huduma hizo.
                                Hakuna marejesho ya fedha (refunds) baada ya malipo kufanyika isipokuwa kwa makubaliano maalum.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold font-display">3. Akaunti Yako</h2>
                            <p className="text-muted-foreground">
                                Wewe unawajibika kutunza usalama wa akaunti yako na nenosiri lako. KOKOTOA haitawajibika kwa hasara yoyote
                                itakayotokana na uzembe wa kulinda taarifa zako za kuingia.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold font-display">4. Kusitishwa kwa Huduma</h2>
                            <p className="text-muted-foreground">
                                Tuna haki ya kusitisha au kuzuia upatikanaji wa huduma zetu kwako endapo utakiuka masharti haya
                                au kutumia vibaya mfumo wetu.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold font-display">5. Mabadiliko ya Masharti</h2>
                            <p className="text-muted-foreground">
                                Tunaweza kubadilisha masharti haya wakati wowote. Tutaarifu watumiaji kuhusu mabadiliko makubwa kupitia
                                barua pepe au tangazo kwenye mfumo.
                            </p>
                        </div>

                        <div className="absolute bottom-0 left-0 w-full leading-none">
                            <svg viewBox="0 0 1200 120" className="block w-full h-12 md:h-14" preserveAspectRatio="none" aria-hidden="true">
                                <path
                                    d="M0,48L60,58.7C120,69,240,91,360,90.7C480,91,600,69,720,58.7C840,48,960,48,1080,58.7L1200,69V120H1080C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120H0Z"
                                    className="fill-primary/15"
                                />
                            </svg>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Terms;
