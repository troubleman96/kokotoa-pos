import { Target, Eye, Heart, Users, Award } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const About = () => {
  const { t } = useLanguage();

  const values = [
    { icon: Heart, text: t('about.value1') },
    { icon: Award, text: t('about.value2') },
    { icon: Users, text: t('about.value3') },
  ];

  const team = [
    { name: 'Ditrick Mpangile', role: 'Mwanzilishi & CEO', emoji: '👨🏿‍💼' },
    { name: 'Lugenge Emmanuel', role: 'Mwanzilishi & CTO', emoji: '👩🏿‍💻' },

  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-16 lg:py-24 hero-pattern">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center card-kokotoa rounded-3xl p-8 md:p-12 pb-20 relative overflow-hidden">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 relative z-10">
                {t('about.title')}
              </h1>
              <p className="text-xl text-muted-foreground relative z-10">
                {t('about.subtitle')}
              </p>

              <div className="absolute bottom-0 left-0 w-full leading-none">
                <svg viewBox="0 0 1200 120" className="block w-full h-14 md:h-16" preserveAspectRatio="none" aria-hidden="true">
                  <path
                    d="M0,48L60,58.7C120,69,240,91,360,90.7C480,91,600,69,720,58.7C840,48,960,48,1080,58.7L1200,69V120H1080C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120H0Z"
                    className="fill-primary/15"
                  />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 lg:py-24 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Mission */}
              <div className="card-kokotoa rounded-2xl p-8 lg:p-10 pb-16 relative overflow-hidden">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-primary-foreground" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  {t('about.mission.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.mission.text')}
                </p>

                <div className="absolute bottom-0 left-0 w-full leading-none">
                  <svg viewBox="0 0 1200 120" className="block w-full h-12" preserveAspectRatio="none" aria-hidden="true">
                    <path
                      d="M0,48L60,58.7C120,69,240,91,360,90.7C480,91,600,69,720,58.7C840,48,960,48,1080,58.7L1200,69V120H1080C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120H0Z"
                      className="fill-primary/15"
                    />
                  </svg>
                </div>
              </div>

              {/* Vision */}
              <div className="card-kokotoa rounded-2xl p-8 lg:p-10 pb-16 relative overflow-hidden">
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-secondary-foreground" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  {t('about.vision.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.vision.text')}
                </p>

                <div className="absolute bottom-0 left-0 w-full leading-none">
                  <svg viewBox="0 0 1200 120" className="block w-full h-12" preserveAspectRatio="none" aria-hidden="true">
                    <path
                      d="M0,48L60,58.7C120,69,240,91,360,90.7C480,91,600,69,720,58.7C840,48,960,48,1080,58.7L1200,69V120H1080C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120H0Z"
                      className="fill-primary/15"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
              {t('about.values.title')}
            </h2>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={index} className="card-kokotoa rounded-2xl p-6 pb-14 text-center group hover:border-primary/30 transition-all relative overflow-hidden">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors relative z-10">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-foreground font-medium relative z-10">{value.text}</p>

                    <div className="absolute bottom-0 left-0 w-full leading-none">
                      <svg viewBox="0 0 1200 120" className="block w-full h-11" preserveAspectRatio="none" aria-hidden="true">
                        <path
                          d="M0,48L60,58.7C120,69,240,91,360,90.7C480,91,600,69,720,58.7C840,48,960,48,1080,58.7L1200,69V120H1080C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120H0Z"
                          className="fill-primary/15"
                        />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 lg:py-24 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Timu Yetu
              </h2>
              <p className="text-muted-foreground">
                Watu walioundwa kukusaidia kufanikiwa
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 max-w-4xl mx-auto">
              {team.map((member, index) => (
                <div key={index} className="text-center group">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 text-4xl group-hover:scale-110 transition-transform">
                    {member.emoji}
                  </div>
                  <h3 className="font-display font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: '2020', label: 'Mwaka wa Kuanzishwa' },
                { value: '1,000+', label: 'Wateja' },
                { value: '26', label: 'Mikoa' },
                { value: '5M+', label: 'Miamala' },
              ].map((stat, index) => (
                <div key={index} className="card-kokotoa rounded-2xl p-6 lg:p-8 pb-14 relative overflow-hidden">
                  <div className="font-display text-3xl lg:text-4xl font-bold text-white mb-2 relative z-10">
                    {stat.value}
                  </div>
                  <p className="text-muted-foreground text-sm relative z-10">{stat.label}</p>

                  <div className="absolute bottom-0 left-0 w-full leading-none">
                    <svg viewBox="0 0 1200 120" className="block w-full h-11" preserveAspectRatio="none" aria-hidden="true">
                      <path
                        d="M0,48L60,58.7C120,69,240,91,360,90.7C480,91,600,69,720,58.7C840,48,960,48,1080,58.7L1200,69V120H1080C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120H0Z"
                        className="fill-primary/15"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
