import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function HomeCarousel({ slides }) {
  if (!slides || slides.length === 0) return null;

  return (
    // opts={{ loop: true }} permet au carrousel de tourner en boucle
    <Carousel opts={{ loop: true }} className="w-full relative">
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide.id}>
            {/* Conteneur de la Slide avec une hauteur fixe (ex: 600px ou 80vh) */}
            <div className="relative h-[80vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
              
              {/* Image de fond */}
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Filtre sombre pour que le texte soit lisible (overlay) */}
              <div className="absolute inset-0 bg-slate-900/70" />

              {/* Contenu du texte centré */}
              <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
                  {slide.title}
                </h1>
                <p className="mt-4 text-xl md:text-2xl text-gray-300 mb-10">
                  {slide.subtitle}
                </p>
                <Button size="lg" className="px-8 h-12 text-lg rounded-lg">
                  {slide.buttonText}
                </Button>
              </div>
              
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      
      {/* Boutons de navigation (placés à l'intérieur de l'image) */}
      <CarouselPrevious className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 border-none text-white h-12 w-12" />
      <CarouselNext className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 border-none text-white h-12 w-12" />
    </Carousel>
  );
}