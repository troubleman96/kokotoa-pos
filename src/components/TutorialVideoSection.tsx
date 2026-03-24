import { useLanguage } from '@/contexts/LanguageContext';

const TutorialVideoSection = () => {
  const { language } = useLanguage();
  const title =
    language === 'sw' ? 'Video ya Mafunzo ya KOKOTOA' : 'KOKOTOA Tutorial Video';

  return (
    <section className="py-10 lg:py-14 bg-background">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-6 max-w-5xl text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {title}
          </h2>
        </div>
        <div className="mx-auto w-full max-w-5xl">
          <div className="relative w-full pb-[56.25%] rounded-2xl overflow-hidden shadow-2xl border border-border">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/2LvRK4rVXRI?autoplay=1&mute=0&rel=0&modestbranding=1"
              title="KOKOTOA POS Tutorial Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TutorialVideoSection;
