import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Ujumbe Umetumwa! ✓",
      description: "Tutakujibu ndani ya masaa 24.",
    });
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Simu',
      value: '+255 692 069 230',
      link: 'tel:+255692069230',
    },
    {
      icon: Mail,
      title: 'Barua Pepe',
      value: 'kokotoapos@gmail.com',
      link: 'mailto:kokotoapos@gmail.com',
    },
    {
      icon: MapPin,
      title: 'Mahali',
      value: 'Dar es Salaam, Tanzania',
      link: '#',
    },
    {
      icon: Clock,
      title: t('contact.hours'),
      value: 'Jumatatu - Ijumaa: 8:00 - 18:00',
      link: '#',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-8 lg:py-12 hero-pattern">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('contact.title')}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t('contact.subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Contact Form Column */}
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Tuma Ujumbe
                  </h2>
                  <p className="text-muted-foreground">
                    Tutakujibu haraka ndani ya masaa 24
                  </p>
                </div>

                <div className="card-kokotoa rounded-2xl p-8 lg:p-10">

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {t('contact.name')} *
                      </label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Jina lako kamili"
                        className="bg-muted/50 border-border h-12"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          {t('contact.email')} *
                        </label>
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="barua@mfano.com"
                          className="bg-muted/50 border-border h-12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          {t('contact.phone')}
                        </label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+255xxxxxxxxx"
                          className="bg-muted/50 border-border h-12"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {t('contact.message')} *
                      </label>
                      <Textarea
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Andika ujumbe wako hapa..."
                        rows={5}
                        className="bg-muted/50 border-border resize-none"
                      />
                    </div>

                    <Button type="submit" className="w-full btn-kokotoa h-14 text-lg">
                      <span className="relative z-10 flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        {t('contact.send')}
                      </span>
                    </Button>
                  </form>
                </div>
              </div>

              {/* Contact Info Column */}
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Mawasiliano Mengine
                  </h2>
                  <p className="text-muted-foreground">
                    Njia nyingine za kutupata
                  </p>
                </div>

                <div className="space-y-4">

                  {contactInfo.map((info, index) => {
                    const Icon = info.icon;
                    return (
                      <a
                        key={index}
                        href={info.link}
                        className="flex items-start gap-4 p-6 card-kokotoa rounded-xl hover:border-primary/30 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground mb-1">{info.title}</h3>
                          <p className="text-muted-foreground">{info.value}</p>
                        </div>
                      </a>
                    );
                  })}

                  {/* WhatsApp CTA */}
                  <a
                    href="https://wa.me/255692069230"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-6 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-green-500 mb-1">WhatsApp</h3>
                      <p className="text-muted-foreground">Wasiliana nasi moja kwa moja</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>


      </main>

      <Footer />
    </div>
  );
};

export default Contact;
