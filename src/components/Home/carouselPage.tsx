'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { getCarousels } from "../../services/api/main";
import Loader from "../common/loader";
import { useTranslation } from "react-i18next";

interface CarouselItem {
  id: number;
  imgURL: string;
  title: {
    en: string;
    am: string;
  };
  description: {
    en: string;
    am: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function HomePageCarousel() {
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language;

  // Color variables
  const colors = {
    oceanBlue: "#0275b2",
    navyBlue: "#112f77",
    teal: "#046d74",
    yellow: "#f9db12",
    white: "#ffffff",
    black: "#000000",
  };

  useEffect(() => {
    const fetchCarouselData = async () => {
      try {
        setLoading(true);
        const data = await getCarousels();
        setCarouselItems(data || []);
      } catch (error) {
        console.error("Failed to fetch carousel data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselData();
  }, []);

  useEffect(() => {
    if (!isAutoPlay || carouselItems.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % carouselItems.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isAutoPlay, carouselItems.length]);

  const getLocalizedContent = (
    item: CarouselItem,
    field: "title" | "description"
  ) => {
    if (
      item[field] &&
      item[field][currentLanguage as keyof (typeof item)[field]]
    ) {
      return item[field][currentLanguage as keyof (typeof item)[field]];
    }
    return item[field].en;
  };

  const getPrevIndex = () => (activeIndex - 1 + carouselItems.length) % carouselItems.length;
  const getNextIndex = () => (activeIndex + 1) % carouselItems.length;

  const handlePrev = () => {
    setActiveIndex(getPrevIndex());
    setIsAutoPlay(false);
  };

  const handleNext = () => {
    setActiveIndex(getNextIndex());
    setIsAutoPlay(false);
  };

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
    setIsAutoPlay(false);
  };

  if (loading) {
    return (
      <div className="relative w-full min-h-screen bg-gradient-to-br from-[#112f77] via-[#0275b2] to-[#046d74] flex items-center justify-center">
        <div className="relative">
          <Loader />
          <div className="mt-4 text-white text-lg animate-pulse text-center">
            Loading Distinguished Leaders...
          </div>
        </div>
      </div>
    );
  }

  if (carouselItems.length === 0) {
    return (
      <div className="relative w-full min-h-screen bg-gradient-to-br from-[#112f77] via-[#0275b2] to-[#046d74] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto text-[#f9db12] mb-4 flex items-center justify-center">
            <ChevronLeft className="w-10 h-10" />
            <ChevronRight className="w-10 h-10" />
          </div>
          <div className="text-2xl text-white font-semibold">
            {t("carousel.no_items")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-[#112f77] via-[#0275b2] to-[#046d74] overflow-hidden">
      {/* Main Carousel Container - Full Width */}
      <div className="w-full h-screen relative">
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#112f77]/20 via-[#0275b2]/10 to-[#046d74]/20" />

        {/* Slides Container - Full Width */}
        <div className="relative w-full h-full flex items-center justify-center px-4 md:px-8 lg:px-16">
          
          {/* Left Slide (Previous) - Full Width */}
          <div
            className="absolute left-0 w-[30%] h-[70%] rounded-r-xl overflow-hidden transition-all duration-500 ease-out transform opacity-70 scale-90 hover:opacity-85 hover:scale-95 group"
            style={{ zIndex: 10 }}
          >
            <div className="relative w-full h-full">
              <img
                src={`${import.meta.env.VITE_FILE_API}${carouselItems[getPrevIndex()].imgURL}`}
                alt={getLocalizedContent(carouselItems[getPrevIndex()], "title")}
                className="w-full h-full object-fill brightness-90 group-hover:brightness-95 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/70 via-transparent to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white text-lg font-semibold opacity-90">
                  {getLocalizedContent(carouselItems[getPrevIndex()], "title")}
                </h3>
              </div>
            </div>
          </div>

          {/* Center Slide (Active) - Full Width */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-[45%] h-[85%] rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-out transform group"
            style={{ zIndex: 50 }}
          >
            <div className="relative w-full h-full">
              <img
                src={`${import.meta.env.VITE_FILE_API}${carouselItems[activeIndex].imgURL}`}
                alt={getLocalizedContent(carouselItems[activeIndex], "title")}
                className="w-full h-full object-fill transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Gradient overlay with your color scheme */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#112f77]/90 via-[#0275b2]/40 to-transparent flex flex-col justify-end p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg leading-tight">
                  {getLocalizedContent(carouselItems[activeIndex], "title")}
                </h2>
                <p className="text-base md:text-lg text-white mb-6 leading-relaxed max-w-md">
                  {getLocalizedContent(carouselItems[activeIndex], "description")}
                </p>
                <div className="flex items-center gap-2 text-sm text-white font-medium">
                  <div className="w-2 h-2 bg-[#f9db12] rounded-full animate-pulse" />
                  <span>Currently Viewing</span>
                </div>
              </div>

              {/* Border with your color scheme */}
              <div className="absolute inset-0 rounded-3xl border-4 border-[#f9db12]/50 shadow-[0_0_60px_rgba(249,219,18,0.4)] pointer-events-none" />
            </div>
          </div>

          {/* Right Slide (Next) - Full Width */}
          <div
            className="absolute right-0 w-[30%] h-[70%] rounded-l-xl overflow-hidden transition-all duration-500 ease-out transform opacity-70 scale-90 hover:opacity-85 hover:scale-95 group"
            style={{ zIndex: 10 }}
          >
            <div className="relative w-full h-full">
              <img
                src={`${import.meta.env.VITE_FILE_API}${carouselItems[getNextIndex()].imgURL}`}
                alt={getLocalizedContent(carouselItems[getNextIndex()], "title")}
                className="w-full h-full object-fill brightness-90 group-hover:brightness-95 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-[#000000]/70 via-transparent to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white text-lg font-semibold opacity-90">
                  {getLocalizedContent(carouselItems[getNextIndex()], "title")}
                </h3>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 
              bg-gradient-to-r from-[#f9db12] to-[#0275b2] text-white p-4
              rounded-full shadow-2xl hover:scale-110 transition-all duration-300 
              backdrop-blur-md opacity-90 hover:opacity-100
              border-2 border-white"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 
              bg-gradient-to-r from-[#046d74] to-[#112f77] text-white p-4
              rounded-full shadow-2xl hover:scale-110 transition-all duration-300 
              backdrop-blur-md opacity-90 hover:opacity-100
              border-2 border-white"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom Controls - Centered and full width */}
        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center justify-center space-y-6">
          {/* Dots Indicator */}
          <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            {carouselItems.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? 'w-10 h-2 bg-gradient-to-r from-[#f9db12] via-[#0275b2] to-[#046d74] shadow-lg'
                    : 'w-2 h-2 bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Auto-play toggle */}
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="bg-white/20 backdrop-blur-sm text-[#112f77] px-4 py-2 rounded-full 
              hover:bg-white/30 transition-all duration-300 flex items-center gap-2
              border border-[#f9db12]"
            aria-label={isAutoPlay ? "Pause auto-play" : "Start auto-play"}
          >
            {isAutoPlay ? (
              <>
                <Pause className="w-4 h-4" />
                <span className="text-sm font-medium">Pause Auto-play</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span className="text-sm font-medium">Play Auto-play</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Custom styles */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
        
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        
        /* Smooth transitions for carousel */
        .swiper-slide {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(2, 117, 178, 0.1);
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #f9db12, #0275b2);
          border-radius: 4px;
        }
        
        /* Selection style */
        ::selection {
          background: rgba(249, 219, 18, 0.5);
          color: #112f77;
        }
      `}</style>
    </div>
  );
}