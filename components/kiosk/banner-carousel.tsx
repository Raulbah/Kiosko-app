"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay"; // npm install embla-carousel-autoplay
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

export function BannerCarousel() {
    const plugin = React.useRef(
        Autoplay({ delay: 4000, stopOnInteraction: true })
    );

    // Mock data
    const slides = [
        { id: 1, color: "bg-orange-100", title: "2x1 en Hamburguesas", text: "Solo por hoy" },
        { id: 2, color: "bg-blue-100", title: "Nuevos Productos", text: "Descubre la colección" },
        { id: 3, color: "bg-green-100", title: "Envío Gratis", text: "En compras mayores a $200" },
    ];

    return (
        <div className="w-full py-4 px-4">
            <Carousel
                plugins={[plugin.current]}
                className="w-full max-w-5xl mx-auto"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
            >
                <CarouselContent>
                    {slides.map((slide) => (
                        <CarouselItem key={slide.id}>
                            <div className="p-1">
                                <Card className="border-0 shadow-none">
                                    <CardContent className={`flex aspect-21/9 md:aspect-24/6 items-center justify-center rounded-xl p-6 ${slide.color}`}>
                                        <div className="text-center">
                                            <h2 className="text-2xl md:text-4xl font-bold text-slate-800">{slide.title}</h2>
                                            <p className="text-slate-600 mt-2">{slide.text}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                {/* Ocultamos flechas en móvil para limpieza visual */}
                <CarouselPrevious className="hidden md:flex left-4 cursor-pointer" />
                <CarouselNext className="hidden md:flex right-4 cursor-pointer" />
            </Carousel>
        </div>
    );
}