import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";

const FounderLetterSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div 
            className="text-center mb-8 space-y-4 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">{t.founderLetter.badge}</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-xl md:text-5xl font-bold text-foreground whitespace-nowrap">
                {t.founderLetter.title}
              </h2>
              <ChevronDown 
                className={`w-6 h-6 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              />
            </div>
            <p className="text-lg text-muted-foreground">
              {t.founderLetter.subtitle}
            </p>
          </div>

          {/* Letter Card */}
          {isOpen && (
            <Card className="p-8 md:p-12 bg-card/80 backdrop-blur-xl border-primary/20 shadow-2xl animate-in slide-in-from-top-4 duration-500">
              <div className="prose prose-lg max-w-none">
                <div className="space-y-6 text-foreground/90 leading-relaxed">
                  <p className="text-xl font-medium text-primary whitespace-pre-line">
                    {t.founderLetter.intro}
                  </p>

                  <p className="text-base">{t.founderLetter.paragraph1}</p>
                  <p className="text-base">{t.founderLetter.paragraph2}</p>
                  <p className="text-base">{t.founderLetter.paragraph3}</p>

                  <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg my-8">
                    <p className="text-base font-medium italic whitespace-pre-line">
                      {t.founderLetter.quote}
                    </p>
                  </div>

                  <p className="text-base">{t.founderLetter.paragraph4}</p>
                  <p className="text-base">{t.founderLetter.paragraph5}</p>
                  <p className="text-base">{t.founderLetter.paragraph6}</p>
                  <p className="text-base">{t.founderLetter.closing}</p>

                  <div className="mt-12 pt-8 border-t border-border">
                    <p className="text-right text-foreground/70">
                      {t.founderLetter.date}<br />
                      {t.founderLetter.gratitude}<br />
                      <span className="font-semibold text-primary text-lg">{t.founderLetter.signature}</span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* More columns button */}
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => navigate('/column')}
              className="border-primary/30 hover:bg-primary/5"
            >
              {t.founderLetter.moreColumns}
              <ChevronDown className="w-4 h-4 ml-2 -rotate-90" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderLetterSection;
