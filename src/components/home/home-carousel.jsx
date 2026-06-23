import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Link } from "react-router-dom";


/**
 * Carrousel pleine largeur de la page d'accueil avec lecture automatique.
 *
 * @param {{ slides: Array<{ id: string|number, imageUrl: string, title: string, subtitle: string, buttonText: string }> }} props
 */
export function HomeCarousel({ slides }) {
  if (!slides || slides.length === 0) return null;

  return (
    <Carousel
      opts={{ loop: true }}
      plugins={[Autoplay({ delay: 4000 })]}
      className="relative w-full"
    >
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide.id}>
            <div className="relative flex h-[80vh] min-h-[500px] w-full items-center justify-center overflow-hidden">
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/70" />
              <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
                <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white md:text-6xl">
                  {slide.title}
                </h1>
                <p className="mt-4 mb-10 text-xl text-gray-300 md:text-2xl">
                  {slide.subtitle}
                </p>
                <Button asChild size="lg" className="h-12 rounded-lg px-8 text-lg">
                  <Link to="/catalog">{slide.buttonText}</Link>
                </Button>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className="absolute top-1/2 left-4 h-12 w-12 -translate-y-1/2 border-none bg-white/10 text-white hover:bg-white/20 md:left-8" />
      <CarouselNext className="absolute top-1/2 right-4 h-12 w-12 -translate-y-1/2 border-none bg-white/10 text-white hover:bg-white/20 md:right-8" />
    </Carousel>
  )
}