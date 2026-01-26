import React, { useEffect, useState } from "react";
import {
  Title,
  Text,
  Container,
  Card,
  Image,
  Badge,
  Group,
  Button,
  Box,
  useMantineTheme,
  Avatar,
  Modal,
} from "@mantine/core";
import {
  IconStar,
  IconExternalLink,
  IconBusinessplan,
  IconUsers,
  IconInfoCircle,
} from "@tabler/icons-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { useMediaQuery } from "@mantine/hooks";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import AOS from "aos";
import "aos/dist/aos.css";
import { getPartners } from "../../services/api/main";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/loader"; // Import the custom loader

interface Partner {
  id: number;
  name: {
    am: string;
    en: string;
  };
  logo: string;
  category: {
    am: string;
    en: string;
  };
  description: {
    am: string;
    en: string;
  };
  featured: number;
  link: string;
  created_at: string;
  updated_at: string;
}

const MAX_DESCRIPTION_LENGTH = 100;
const FEATURED_SLIDES_PER_VIEW = { base: 1, sm: 2, md: 3, lg: 3 };
const REGULAR_SLIDES_PER_VIEW = { base: 2, sm: 3, md: 4, lg: 5 };

const PartnersSection = () => {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const { t, i18n } = useTranslation();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPartners();
      const transformedPartners = response.map((partner: Partner) => ({
        ...partner,
        featured: partner.featured === 1,
      }));
      setPartners(transformedPartners);
    } catch (err) {
      setError(t("ourpartner.error"));
      console.error("Error fetching partners:", err);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (logoPath: string) => {
    if (!logoPath) return null;
    if (logoPath.startsWith("http")) return logoPath;
    return `${import.meta.env.VITE_FILE_API}${logoPath}`;
  };

  const truncateDescription = (text: string) => {
    if (!text) return t("ourpartner.no_description");
    if (text.length <= MAX_DESCRIPTION_LENGTH) return text;
    return `${text.substring(0, MAX_DESCRIPTION_LENGTH)}...`;
  };

  const showFullDescription = (description: string) => {
    setSelectedDescription(description || t("ourpartner.no_description"));
    setOpened(true);
  };

  const getLocalizedContent = (content: { am: string; en: string }) => {
    return i18n.language === "am" ? content.am : content.en;
  };

  const featuredPartners = partners.filter((partner) => partner.featured);
  const regularPartners = partners.filter((partner) => !partner.featured);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Box className="bg-gradient-to-b from-blue-50 to-white py-16">
        <Container size="xl" className="text-center" py={60}>
          <Avatar color="red" radius="xl" size={80} className="mx-auto mb-4">
            <IconInfoCircle size={40} />
          </Avatar>
          <Text color="red" size="xl" weight={500} mb="md">
            {error}
          </Text>
          <Button
            onClick={fetchPartners}
            variant="light"
            color="blue"
            size="md"
            radius="xl"
          >
            {t("ourpartner.retry")}
          </Button>
        </Container>
      </Box>
    );
  }

  if (partners.length === 0 && !loading) {
    return (
      <Box className="bg-gradient-to-b from-blue-50 to-white py-16">
        <Container size="xl" className="text-center" py={60}>
          <Avatar color="gray" radius="xl" size={80} className="mx-auto mb-4">
            <IconBusinessplan size={40} />
          </Avatar>
          <Text size="xl" weight={500} color="dimmed">
            {t("ourpartner.no_partners")}
          </Text>
        </Container>
      </Box>
    );
  }

  return (
    <Box className="bg-gradient-to-b from-blue-50 to-white py-16" id="partners">
      <Container size="xl">
        {/* Description Modal */}
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title={t("ourpartner.description_title")}
          size="lg"
          centered
        >
          <Text size="sm" sx={{ lineHeight: 1.6 }}>
            {selectedDescription}
          </Text>
        </Modal>

        {/* Header */}
        <div
          className="text-center mb-16 w-full  bg-blue-800 py-16"
          data-aos="fade-down"
        >
          <Badge
            size="lg"
            radius="xl"
            color="blue"
            variant="light"
            className="mb-6"
            px={15}
            py={5}
          >
            <Group spacing="xs" noWrap>
              <IconBusinessplan size={18} />
              <span>{t("ourpartner.strategic_partnerships")}</span>
            </Group>
          </Badge>
          <Title
            order={2}
            className="text-3xl md:text-4xl font-bold mb-4 text-white"
            sx={{
              color: theme.colors.dark[7],
              lineHeight: 1.3,
            }}
          >
            {t("ourpartner.title")}
          </Title>
          <Text
            size="xl"
            className="max-w-3xl mx-auto text-white "
            color="dimmed"
            sx={{ lineHeight: 1.6 }}
          >
            {t("ourpartner.subtitle")}
          </Text>
        </div>

        {/* Featured Partners Carousel */}
        {featuredPartners.length > 0 && (
          <Box mb={60} data-aos="fade-up">
            <Title
              order={3}
              className="text-xl mb-6 flex items-center"
              sx={{ color: theme.colors.blue[7] }}
            >
              <IconStar
                size={24}
                className="mr-2"
                fill={theme.colors.yellow[5]}
                color={theme.colors.yellow[5]}
              />
              {t("ourpartner.premier_partners")}
            </Title>

            <Swiper
              slidesPerView={FEATURED_SLIDES_PER_VIEW.base}
              breakpoints={{
                640: { slidesPerView: FEATURED_SLIDES_PER_VIEW.sm },
                768: { slidesPerView: FEATURED_SLIDES_PER_VIEW.md },
                1024: { slidesPerView: FEATURED_SLIDES_PER_VIEW.lg },
              }}
              spaceBetween={30}
              loop={true}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              navigation={!isMobile}
              pagination={{ clickable: true }}
              modules={[Autoplay, Navigation, Pagination]}
              className="featured-partners-swiper"
            >
              {featuredPartners.map((partner) => (
                <SwiperSlide key={`featured-${partner.id}`}>
                  <Card
                    shadow="md"
                    padding="lg"
                    radius="lg"
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      border: `1px solid ${theme.colors.blue[1]}`,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: theme.colors.blue[3],
                        transform: "translateY(-5px)",
                        boxShadow: theme.shadows.md,
                      },
                    }}
                  >
                    <Card.Section sx={{ position: "relative" }}>
                      <Box
                        sx={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          zIndex: 10,
                        }}
                      >
                        <Badge color="yellow" variant="filled" radius="sm">
                          {t("ourpartner.featured")}
                        </Badge>
                      </Box>
                      <Box
                        sx={{
                          height: 180,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: theme.white,
                          padding: theme.spacing.md,
                        }}
                      >
                        <Image
                          src={getImageUrl(partner.logo)}
                          alt={getLocalizedContent(partner.name)}
                          height={120}
                          fit="contain"
                          withPlaceholder
                          sx={{
                            maxWidth: "80%",
                            objectFit: "contain",
                            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                          }}
                        />
                      </Box>
                    </Card.Section>

                    <Group position="apart" mt="md">
                      <Badge
                        color="blue"
                        variant="light"
                        sx={{ textTransform: "uppercase" }}
                      >
                        {getLocalizedContent(partner.category) ||
                          t("ourpartner.no_category")}
                      </Badge>
                    </Group>

                    <Title
                      order={4}
                      mt="xs"
                      sx={{
                        fontSize: theme.fontSizes.lg,
                        fontWeight: 600,
                        lineHeight: 1.4,
                      }}
                    >
                      {getLocalizedContent(partner.name) ||
                        t("ourpartner.partner")}
                    </Title>

                    <Text
                      mt="sm"
                      mb="md"
                      size="sm"
                      color="dimmed"
                      sx={{
                        flexGrow: 1,
                        lineHeight: 1.6,
                      }}
                    >
                      {truncateDescription(
                        getLocalizedContent(partner.description)
                      )}
                      {getLocalizedContent(partner.description) &&
                        getLocalizedContent(partner.description).length >
                          MAX_DESCRIPTION_LENGTH && (
                          <Text
                            component="span"
                            color="blue"
                            sx={{ cursor: "pointer" }}
                            ml={4}
                            onClick={() =>
                              showFullDescription(
                                getLocalizedContent(partner.description)
                              )
                            }
                          >
                            {t("ourpartner.more")}
                          </Text>
                        )}
                    </Text>

                    {partner.link && (
                      <Button
                        component="a"
                        href={partner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="light"
                        color="blue"
                        fullWidth
                        radius="md"
                        rightIcon={<IconExternalLink size={16} />}
                        mt="auto"
                        sx={{
                          fontWeight: 500,
                          letterSpacing: 0.5,
                        }}
                      >
                        {t("ourpartner.visit_partner")}
                      </Button>
                    )}
                  </Card>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        )}

        {/* All Partners Carousel */}
        {regularPartners.length > 0 && (
          <Box data-aos="fade-up" data-aos-delay="100">
            <Title
              order={3}
              className="text-xl mb-6"
              sx={{ color: theme.colors.blue[7] }}
            >
              {t("ourpartner.trusted_network")}
            </Title>

            <Swiper
              slidesPerView={REGULAR_SLIDES_PER_VIEW.base}
              breakpoints={{
                640: { slidesPerView: REGULAR_SLIDES_PER_VIEW.sm },
                768: { slidesPerView: REGULAR_SLIDES_PER_VIEW.md },
                1024: { slidesPerView: REGULAR_SLIDES_PER_VIEW.lg },
              }}
              spaceBetween={20}
              loop={true}
              autoplay={{ delay: 2500, disableOnInteraction: false }}
              navigation={!isMobile}
              pagination={{ clickable: true }}
              modules={[Autoplay, Navigation, Pagination]}
              className="regular-partners-swiper"
            >
              {regularPartners.map((partner) => (
                <SwiperSlide key={`regular-${partner.id}`}>
                  <Card
                    shadow="sm"
                    padding="lg"
                    radius="lg"
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      border: `1px solid ${theme.colors.gray[2]}`,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: theme.colors.blue[2],
                        transform: "translateY(-3px)",
                        boxShadow: theme.shadows.sm,
                      },
                    }}
                  >
                    <Card.Section
                      sx={{
                        width: "100%",
                        padding: theme.spacing.md,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: 120,
                      }}
                    >
                      <Image
                        src={getImageUrl(partner.logo)}
                        alt={getLocalizedContent(partner.name)}
                        height={80}
                        fit="contain"
                        withPlaceholder
                        sx={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Card.Section>

                    <Box sx={{ textAlign: "center", width: "100%" }}>
                      <Badge
                        color="blue"
                        variant="light"
                        size="sm"
                        radius="sm"
                        mb="sm"
                        sx={{ textTransform: "uppercase" }}
                      >
                        {getLocalizedContent(partner.category) ||
                          t("ourpartner.no_category")}
                      </Badge>

                      <Title
                        order={4}
                        sx={{
                          fontSize: theme.fontSizes.md,
                          fontWeight: 600,
                          marginBottom: theme.spacing.xs,
                        }}
                      >
                        {getLocalizedContent(partner.name) ||
                          t("ourpartner.partner")}
                      </Title>
                    </Box>

                    {partner.link && (
                      <Button
                        component="a"
                        href={partner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="subtle"
                        color="blue"
                        fullWidth
                        radius="md"
                        size="sm"
                        rightIcon={<IconExternalLink size={14} />}
                        mt="auto"
                        sx={{
                          fontWeight: 500,
                          fontSize: theme.fontSizes.sm,
                        }}
                      >
                        {t("ourpartner.learn_more")}
                      </Button>
                    )}
                  </Card>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        )}

        {/* Partnership CTA */}
        <Card
          mt={60}
          padding="lg"
          radius="lg"
          sx={{
            background: `linear-gradient(135deg, ${theme.colors.blue[6]} 0%, ${theme.colors.blue[8]} 100%)`,
            border: "none",
            boxShadow: theme.shadows.lg,
            overflow: "hidden",
            position: "relative",
            "&:before": {
              content: '""',
              position: "absolute",
              top: -50,
              right: -50,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
            },
          }}
          data-aos="zoom-in"
        >
          <Group
            position="apart"
            noWrap
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Box sx={{ maxWidth: "70%" }}>
              <Title order={3} className="text-white" mb="sm">
                {t("ourpartner.become_partner")}
              </Title>
              <Text className="text-blue-100" sx={{ lineHeight: 1.6 }}>
                {t("ourpartner.cta_text")}
              </Text>
            </Box>
            <Button
              variant="white"
              color="blue"
              size="lg"
              radius="xl"
              rightIcon={<IconUsers size={18} />}
              sx={{
                fontWeight: 600,
                letterSpacing: 0.5,
                boxShadow: theme.shadows.sm,
                "&:hover": {
                  transform: "translateY(-2px)",
                },
              }}
            >
              {t("ourpartner.partnership_inquiry")}
            </Button>
          </Group>
        </Card>
      </Container>

      {/* Swiper CSS Overrides */}
      <style jsx global>{`
        .featured-partners-swiper,
        .regular-partners-swiper {
          padding: 10px 5px 40px;
        }

        .featured-partners-swiper .swiper-slide {
          height: auto;
        }

        .swiper-button-next,
        .swiper-button-prev {
          color: ${theme.colors.blue[6]} !important;
          background: rgba(255, 255, 255, 0.9) !important;
          width: 40px !important;
          height: 40px !important;
          border-radius: 50% !important;
          box-shadow: ${theme.shadows.sm} !important;
          transition: all 0.3s ease !important;
        }

        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: white !important;
          transform: scale(1.1) !important;
        }

        .swiper-button-next::after,
        .swiper-button-prev::after {
          font-size: 1.2rem !important;
          font-weight: bold !important;
        }

        .swiper-pagination-bullet {
          background: ${theme.colors.gray[4]} !important;
          opacity: 1 !important;
        }

        .swiper-pagination-bullet-active {
          background: ${theme.colors.blue[6]} !important;
          width: 20px !important;
          border-radius: 10px !important;
        }
      `}</style>
    </Box>
  );
};

export default PartnersSection;
