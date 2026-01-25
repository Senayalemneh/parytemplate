import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { getCarousels } from "../../services/api/main";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Loader from "../common/loader";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@mantine/hooks";
import { Box, Text, Button } from "@mantine/core";

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
  created_at: string;
  updated_at: string;
}

const HomePageCarousel: React.FC = () => {
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language;
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

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

  const handleImageLoad = () => {
    setImagesLoaded((prev) => prev + 1);
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    e.currentTarget.src = "/fallback-image.jpg";
    setImagesLoaded((prev) => prev + 1);
  };

  useEffect(() => {
    if (carouselItems.length > 0 && imagesLoaded === carouselItems.length) {
      setLoading(false);
    }
  }, [imagesLoaded, carouselItems.length]);

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

  if (loading) {
    return (
      <Box className="relative h-[50vh] sm:h-[60vh] md:h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900">
        <Loader />
      </Box>
    );
  }

  if (carouselItems.length === 0) {
    return (
      <Box
        className={`relative ${
          isMobile ? "h-[50vh]" : "h-[60vh]"
        } flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900`}
      >
        <Text size="lg" className="text-white font-semibold animate-pulse">
          {t("carousel.no_items")}
        </Text>
      </Box>
    );
  }

  return (
    <Box
      className={`relative ${
        isMobile ? "h-[50vh]" : isTablet ? "h-[60vh]" : "h-[85vh]"
      } overflow-hidden group shadow-2xl bg-gray-900/60 backdrop-blur-md rounded-xl`}
      role="region"
      aria-label={t("carousel.label")}
    >
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        loop={carouselItems.length > 1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        pagination={{
          clickable: true,
          bulletClass: `swiper-pagination-bullet ${
            isMobile ? "w-2 h-2" : "w-3 h-3"
          } bg-white/80 hover:bg-white transition-all duration-300`,
          bulletActiveClass:
            "swiper-pagination-bullet-active bg-gradient-to-r from-indigo-500 to-purple-500 scale-125",
        }}
        className="h-full w-full rounded-xl"
      >
        {carouselItems.map((item, index) => (
          <SwiperSlide key={item.id} className="relative h-full w-full">
            <Box className="absolute inset-0 z-10 flex items-end justify-center bg-gradient-to-t from-black/85 via-black/50 to-transparent transition-all duration-700">
              <Box
                className={`text-center text-white px-4 sm:px-6 py-8 transform transition-all duration-1000 ease-out ${
                  isMobile
                    ? "max-w-full scale-100"
                    : "max-w-3xl scale-95 group-hover:scale-100"
                }`}
              >
                <Text
                  component="h2"
                  className={`font-extrabold tracking-tight animate-slide-up ${
                    isMobile
                      ? "text-2xl"
                      : isTablet
                      ? "text-3xl"
                      : "text-4xl md:text-5xl"
                  } mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300 drop-shadow-xl`}
                >
                  {getLocalizedContent(item, "title")}
                </Text>
                <Text
                  className={`font-medium animate-slide-up-delayed ${
                    isMobile
                      ? "text-sm"
                      : isTablet
                      ? "text-base"
                      : "text-lg md:text-xl"
                  } mb-6 text-gray-100/90 drop-shadow-lg`}
                  lineClamp={isMobile ? 2 : 3}
                >
                  {getLocalizedContent(item, "description")}
                </Text>
              </Box>
            </Box>
            <img
              src={`https://bole.prosperity.boleprosperityparty.org/CMSFiles/${item.imgURL}`}
              alt={getLocalizedContent(item, "title")}
              className="w-full h-full object-contain sm:object-fill object-center transform scale-100 transition-transform duration-1200 ease-in-out group-hover:scale-105"
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading={index === 0 ? "eager" : "lazy"}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation buttons */}
      <button
        className={`swiper-button-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-indigo-700 to-purple-700 text-white p-3 sm:p-4 rounded-full shadow-xl hover:scale-110 transition-all duration-300 ${
          isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        aria-label={t("carousel.prev")}
      >
        <FaChevronLeft size={isMobile ? 20 : 28} />
      </button>
      <button
        className={`swiper-button-next absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-indigo-700 to-purple-700 text-white p-3 sm:p-4 rounded-full shadow-xl hover:scale-110 transition-all duration-300 ${
          isMobile
            ? "opacity-100"
            : "opacity-0 group-hover:opacity interpolation-quart-inout"
        }`}
        aria-label={t("carousel.next")}
      >
        <FaChevronRight size={isMobile ? 20 : 28} />
      </button>

      {/* Custom Pagination Styling */}
      <style jsx>{`
        .swiper-pagination {
          bottom: 20px !important;
          padding: 0 16px;
          display: flex;
          justify-content: center;
          gap: 8px;
        }
        .swiper-pagination-bullet {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          margin: 0 6px !important;
          opacity: 0.8;
        }
        .swiper-pagination-bullet-active {
          transform: scale(1.3);
          opacity: 1;
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up-delayed {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .animate-slide-up-delayed {
          animation: slide-up-delayed 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </Box>
  );
};

export default HomePageCarousel;
