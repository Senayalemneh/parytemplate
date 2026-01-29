import React, { useState, useEffect } from "react";
import {
  Title,
  Text,
  Container,
  Grid,
  Card,
  Image,
  Modal,
  Button,
  Group,
  Badge,
  ThemeIcon,
  Divider,
  Space,
  Center,
  Pagination,
  Notification,
  AspectRatio,
  Box,
  Paper,
  useMantineTheme,
  rem,
  createStyles,
} from "@mantine/core";
import {
  IconPhoto,
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconCalendar,
  IconArrowRight,
} from "@tabler/icons-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getGalleries } from "../../services/api/main";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@mantine/hooks";

import Loader from "../../components/common/loader";

interface GalleryItem {
  id: number;
  title: {
    en: string;
    am: string;
  };
  images: string[];
  description: {
    en: string;
    am: string;
  };
  date?: string;
  category: string[];
  created_at: string;
  updated_at: string;
}

// Get the base URL from environment variable (same as admin)
const CMS_FILES_BASE_URL = `${import.meta.env.VITE_FILE_API}`;

const useStyles = createStyles((theme) => ({
  hero: {
    position: "relative",
    overflow: "hidden",
    "&:before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "url(/pattern.svg)",
      opacity: 0.05,
      pointerEvents: "none",
      backgroundSize: "300px",
    },
  },
  galleryCard: {
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: theme.shadows.lg,
    },
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderTop: `3px solid #0275b2`,
  },
  imageContainer: {
    position: "relative",
    backgroundColor: theme.colors.gray[1],
    "&:after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "40%",
      background:
        "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
    },
  },
  cardTitle: {
    minHeight: rem(60),
    display: "flex",
    alignItems: "center",
    [theme.fn.smallerThan("sm")]: {
      minHeight: rem(50),
    },
    fontSize: "1.1rem",
    fontWeight: 700,
    lineHeight: 1.3,
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  cardDescription: {
    lineHeight: 1.6,
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    fontSize: "0.95rem",
    color: theme.colors.gray[7],
    minHeight: rem(72),
    flex: 1,
  },
  readMoreButton: {
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: `${theme.shadows.md} !important`,
    },
  },
  paginationItem: {
    border: `1px solid #0275b2`,
    "&[data-active]": {
      border: "none",
      backgroundColor: "#112f77",
    },
  },
  title: {
    position: "relative",
    display: "inline-block",
    "&:after": {
      content: '""',
      position: "absolute",
      bottom: -8,
      left: 0,
      width: "50%",
      height: 3,
      background: "linear-gradient(90deg, #0275b2, #046d74)",
      transition: "width 0.3s ease",
    },
    "&:hover:after": {
      width: "100%",
    },
  },
  cardContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  gridCol: {
    display: "flex",
  },
  thumbnailContainer: {
    border: `2px solid transparent`,
    borderRadius: theme.radius.sm,
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: "#0275b2",
      transform: "scale(1.05)",
    },
    "&.selected": {
      borderColor: "#112f77",
      boxShadow: theme.shadows.sm,
    },
  },
}));

// Helper function to format image URLs (same as admin)
const formatImageUrl = (imgPath: string): string => {
  if (!imgPath) return "";
  
  // If it's already a full URL, return as is
  if (imgPath.startsWith("http")) return imgPath;
  
  // If it's a relative path, prepend the base URL
  // Remove any leading slashes from the path
  const cleanPath = imgPath.replace(/^\/+/, "");
  
  // Ensure base URL doesn't have trailing slash
  const baseUrl = CMS_FILES_BASE_URL.replace(/\/+$/, "");
  
  return `${baseUrl}/${cleanPath}`;
};

// Helper function to normalize image URLs for display
const getDisplayImageUrl = (imgPath: string): string => {
  if (!imgPath) return "";
  
  // If it's already a full URL, return as is
  if (imgPath.startsWith("http")) return imgPath;
  
  // If it's a relative path, format it
  return formatImageUrl(imgPath);
};

// Helper function to parse API response (similar to admin)
const parseApiResponse = (data: any[]): GalleryItem[] => {
  return data.map((item) => {
    // Parse stringified fields if needed
    const title = typeof item.title === "string" ? JSON.parse(item.title) : item.title;
    const description = typeof item.description === "string" ? JSON.parse(item.description) : item.description;
    const images = typeof item.images === "string" ? JSON.parse(item.images) : item.images;
    const category = typeof item.category === "string" ? JSON.parse(item.category) : item.category;
    
    // Format image URLs for display
    const formattedImages = Array.isArray(images) 
      ? images.map((img: string) => getDisplayImageUrl(img))
      : [];
    
    return {
      ...item,
      title,
      description,
      images: formattedImages,
      category,
    };
  });
};

const GalleryComponent = () => {
  const { t, i18n } = useTranslation();
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);
  const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.md}px)`);

  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryItem | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = isMobile ? 6 : isTablet ? 9 : 12;

  const cardGradient = {
    from: "#0275b2", // oceanBlue
    to: "#046d74",   // teal
    deg: 45,
  };

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-in-out-cubic",
    });
  }, []);

  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        setLoading(true);
        const response = await getGalleries();

        console.log("API Response:", response); // Debug log

        // Check if response is an array or has a data property
        let data: any[] = [];
        
        if (Array.isArray(response)) {
          // Response is directly an array
          data = response;
        } else if (response && Array.isArray(response.data)) {
          // Response has data property that's an array
          data = response.data;
        } else if (response && Array.isArray(response.galleries)) {
          // Response has galleries property
          data = response.galleries;
        } else {
          console.error("Unexpected response structure:", response);
          setError("Unexpected data format received from server");
          setGalleryData([]);
          return;
        }

        console.log("Raw gallery data:", data); // Debug log

        // Parse and format the data using the same logic as admin
        const parsedData = parseApiResponse(data);

        console.log("Parsed gallery data:", parsedData); // Debug log

        // Normalize the data - ensure all fields exist
        const normalizedData = parsedData.map((item: any) => ({
          id: item.id || 0,
          title: item.title || { en: "No Title", am: "ርዕስ የለም" },
          description: item.description || { en: "No description available", am: "መግለጫ የለም" },
          images: item.images || [],
          category: Array.isArray(item.category) ? item.category : [],
          date: item.date || item.created_at,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
        }));

        // Sort by date in descending order (newest first)
        const sortedData = normalizedData.sort((a, b) => {
          const dateA = a.date || a.created_at;
          const dateB = b.date || b.created_at;
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

        console.log("Sorted gallery data:", sortedData); // Debug log
        console.log("CMS_FILES_BASE_URL:", CMS_FILES_BASE_URL); // Debug log
        console.log("Sample image URLs:", sortedData[0]?.images); // Debug log
        
        setGalleryData(sortedData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch galleries:", err);
        setError(t("galleryimage.errors.loadError") || "Failed to load galleries");
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryData();
  }, [i18n.language, t]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const getLocalizedText = (text: { en: string; am: string } | string | undefined) => {
    if (!text) return "";
    if (typeof text === 'string') return text;
    
    const currentLang = i18n.language as 'en' | 'am';
    const langText = text[currentLang];
    
    // Fallback to English if current language text is empty
    if (!langText || langText.trim() === "") {
      return text.en || text.am || "";
    }
    
    return langText;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    
    let truncated = text.substr(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.7) {
      truncated = truncated.substr(0, lastSpace);
    }
    
    return truncated + '...';
  };

  const totalPages = Math.ceil(galleryData.length / itemsPerPage);
  const paginatedAlbums = galleryData.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const navigateImage = (direction: "prev" | "next") => {
    if (!selectedAlbum || !selectedAlbum.images || selectedAlbum.images.length <= 1) return;

    const newIndex =
      direction === "next"
        ? (selectedImageIndex + 1) % selectedAlbum.images.length
        : (selectedImageIndex - 1 + selectedAlbum.images.length) %
          selectedAlbum.images.length;

    setSelectedImageIndex(newIndex);
  };

  if (loading) {
    return (
      <Center className="h-[60vh]">
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Container size={1400} className="py-16">
        <Notification
          icon={<IconX size={18} />}
          color="red"
          title={t("galleryimage.errors.title") || "Error"}
        >
          {error}
        </Notification>
      </Container>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#112f77]/10 to-white min-h-screen">
      {/* Hero Section */}
      <Box 
        className={classes.hero} 
        py={rem(100)}
        style={{
          background: "linear-gradient(135deg, #112f77 0%, #0275b2 50%, #046d74 100%)"
        }}
      >
        <Container size={1400}>
          <div className="text-center text-white" data-aos="fade-down">
            <Badge
              size="xl"
              radius="sm"
              variant="gradient"
              gradient={cardGradient}
              className="mb-6"
              sx={{ boxShadow: theme.shadows.md }}
              data-aos-delay="100"
            >
              <Group spacing={4}>
                <IconPhoto size={18} />
                <div>{t("galleryimage.hero.badge") || "Gallery"}</div>
              </Group>
            </Badge>
            <Title
              order={1}
              className={`text-4xl md:text-5xl font-bold mb-4 tracking-tight ${classes.title}`}
              data-aos-delay="150"
              sx={{
                textShadow: "0 2px 8px rgba(0,0,0,0.15)",
                fontFamily: theme.headings.fontFamily,
              }}
            >
              {t("galleryimage.hero.title") || "Photo Gallery"}
            </Title>
            <Text
              size="xl"
              className="max-w-3xl mx-auto text-blue-100"
              data-aos-delay="200"
              sx={{
                fontSize: theme.fontSizes.xl,
                lineHeight: 1.6,
              }}
            >
              {t("galleryimage.hero.subtitle") || "Browse through our collection of photos and memories"}
            </Text>
          </div>
        </Container>
      </Box>

      {/* Gallery Grid Section */}
      <Container size={1400} py={rem(60)} px={isMobile ? rem(20) : rem(40)}>
        {galleryData.length > 0 ? (
          <>
            <Grid gutter={isMobile ? 20 : 30}>
              {paginatedAlbums.map((album, index) => {
                const localizedTitle = getLocalizedText(album.title);
                const localizedDescription = getLocalizedText(album.description);
                const truncatedTitle = truncateText(localizedTitle, 80);
                const truncatedDescription = truncateText(localizedDescription, 120);
                const displayDate = album.date || album.created_at;
                
                return (
                  <Grid.Col
                    key={album.id}
                    span={12}
                    sm={6}
                    lg={4}
                    data-aos="fade-up"
                    data-aos-delay={(index % 3) * 50}
                    className={classes.gridCol}
                  >
                    <Card
                      shadow="sm"
                      p={0}
                      radius="lg"
                      className={classes.galleryCard}
                    >
                      <Card.Section className={classes.imageContainer}>
                        <AspectRatio ratio={16 / 9}>
                          {album.images && album.images.length > 0 ? (
                            <Image
                              src={album.images[0]}
                              alt={localizedTitle}
                              className="w-full h-full object-cover"
                              withPlaceholder
                              placeholder={
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <IconPhoto
                                    size={40}
                                    color="#0275b2"
                                  />
                                </div>
                              }
                              onError={(e) => {
                                console.error("Image failed to load:", album.images[0]);
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <IconPhoto
                                size={40}
                                color="#0275b2"
                              />
                            </div>
                          )}
                        </AspectRatio>
                        <div className="absolute bottom-4 left-4 z-10">
                          <Badge
                            color="blue"
                            variant="light"
                            radius="sm"
                            size={isMobile ? "sm" : "md"}
                            sx={{
                              backgroundColor: "rgba(2, 117, 178, 0.15)",
                              color: "#0275b2",
                              fontWeight: 600,
                              backdropFilter: "blur(2px)",
                            }}
                          >
                            {album.category && album.category.length > 0
                              ? album.category[0]
                              : t("galleryimage.defaultCategory") || "General"}
                          </Badge>
                        </div>
                      </Card.Section>

                      <Box p="lg" className={classes.cardContent}>
                        <Group spacing="xs" mb="sm">
                          <ThemeIcon
                            size={20}
                            radius="xl"
                            style={{ 
                              backgroundColor: "#f9db12",
                              color: "#112f77"
                            }}
                          >
                            <IconCalendar size={14} />
                          </ThemeIcon>
                          <Text size="sm" color="dimmed">
                            {formatDate(displayDate)}
                          </Text>
                          <ThemeIcon
                            size={20}
                            radius="xl"
                            style={{ 
                              backgroundColor: "rgba(2, 117, 178, 0.15)",
                              color: "#0275b2"
                            }}
                          >
                            <IconPhoto size={14} />
                          </ThemeIcon>
                          <Text size="sm" color="dimmed">
                            {album.images?.length || 0} {t("galleryimage.photos") || "photos"}
                          </Text>
                        </Group>

                        <Title
                          order={3}
                          className={classes.cardTitle}
                          sx={{
                            color: "#112f77",
                            fontFamily: theme.headings.fontFamily,
                            marginBottom: theme.spacing.sm,
                          }}
                          title={localizedTitle}
                        >
                          {truncatedTitle}
                          {localizedTitle.length > 80 && (
                            <Text component="span" size="xs" color="dimmed" ml={4}>
                              ...more
                            </Text>
                          )}
                        </Title>

                        <Text
                          className={classes.cardDescription}
                          sx={{ 
                            lineHeight: 1.6, 
                            flex: 1, 
                            marginBottom: theme.spacing.md,
                            fontSize: theme.fontSizes.sm,
                          }}
                          title={localizedDescription}
                        >
                          {truncatedDescription}
                          {localizedDescription.length > 120 && (
                            <Text component="span" size="xs" color="dimmed" ml={4}>
                              ...more
                            </Text>
                          )}
                        </Text>

                        <Button
                          variant="gradient"
                          gradient={cardGradient}
                          onClick={() => {
                            setSelectedAlbum(album);
                            setSelectedImageIndex(0);
                          }}
                          fullWidth
                          radius="md"
                          rightIcon={<IconArrowRight size={16} />}
                          className={classes.readMoreButton}
                          size={isMobile ? "sm" : "md"}
                          disabled={!album.images || album.images.length === 0}
                        >
                          {t("galleryimage.buttons.viewAlbum") || "View Album"}
                        </Button>
                      </Box>
                    </Card>
                  </Grid.Col>
                );
              })}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Group position="center" mt={40}>
                <Pagination
                  page={activePage}
                  onChange={setActivePage}
                  total={totalPages}
                  color="blue"
                  radius="md"
                  size={isMobile ? "sm" : "md"}
                  siblings={isMobile ? 0 : 1}
                  boundaries={isMobile ? 0 : 1}
                  classNames={{
                    item: classes.paginationItem,
                  }}
                />
              </Group>
            )}
          </>
        ) : (
          /* Empty State */
          <Paper
            withBorder
            p="xl"
            radius="lg"
            shadow="sm"
            sx={{
              background: "linear-gradient(0deg, rgba(2, 117, 178, 0.1), rgba(17, 47, 119, 0.1))",
              borderColor: "#0275b2",
            }}
            data-aos="fade-up"
          >
            <Box className="text-center">
              <ThemeIcon
                size={80}
                radius={80}
                variant="gradient"
                gradient={cardGradient}
                className="mx-auto mb-6"
                sx={{ boxShadow: theme.shadows.sm }}
              >
                <IconPhoto size={40} />
              </ThemeIcon>
              <Title
                order={3}
                className="text-2xl font-semibold mb-2"
                sx={{ color: "#112f77" }}
              >
                {t("galleryimage.emptyState.title") || "No Galleries Found"}
              </Title>
              <Text color="dimmed" size="lg">
                {t("galleryimage.emptyState.message") || "Check back later for new photo galleries"}
              </Text>
            </Box>
          </Paper>
        )}
      </Container>

      {/* Gallery Detail Modal */}
      <Modal
        opened={!!selectedAlbum}
        onClose={() => setSelectedAlbum(null)}
        title={
          <Title
            order={3}
            sx={{
              color: "#112f77",
              fontFamily: theme.headings.fontFamily,
            }}
          >
            {selectedAlbum ? getLocalizedText(selectedAlbum.title) : ""}
          </Title>
        }
        size="xl"
        fullScreen={false}
        radius="lg"
        padding="xl"
        centered
        overlayBlur={5}
        overlayOpacity={0.7}
        transition="slide-up"
        transitionDuration={300}
      >
        {selectedAlbum && (
          <div>
            <Group position="apart" mb="md">
              <Badge
                color="blue"
                size="lg"
                variant="light"
                sx={{
                  backgroundColor: "rgba(2, 117, 178, 0.15)",
                  color: "#0275b2",
                  fontWeight: 600,
                }}
              >
                {selectedAlbum.category && selectedAlbum.category.length > 0
                  ? selectedAlbum.category[0]
                  : t("galleryimage.defaultCategory") || "General"}
              </Badge>
              <Group spacing="xs">
                <ThemeIcon
                  size={20}
                  radius="xl"
                  style={{ 
                    backgroundColor: "#f9db12",
                    color: "#112f77"
                  }}
                >
                  <IconCalendar size={14} />
                </ThemeIcon>
                <Text size="sm" color="dimmed">
                  {formatDate(selectedAlbum.date || selectedAlbum.created_at)}
                </Text>
              </Group>
            </Group>

            <div className="relative">
              {selectedAlbum.images && selectedAlbum.images[selectedImageIndex] ? (
                <AspectRatio ratio={16 / 9}>
                  <Image
                    src={selectedAlbum.images[selectedImageIndex]}
                    alt={`${getLocalizedText(selectedAlbum.title)} - Image ${selectedImageIndex + 1}`}
                    className="rounded-lg"
                    withPlaceholder
                    onError={(e) => {
                      console.error("Modal image failed to load:", selectedAlbum.images[selectedImageIndex]);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </AspectRatio>
              ) : (
                <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-lg mb-4">
                  <IconPhoto size={64} className="text-gray-400" />
                </div>
              )}

              {selectedAlbum.images && selectedAlbum.images.length > 1 && (
                <>
                  <Button
                    variant="white"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 shadow-md"
                    radius="xl"
                    size="sm"
                    onClick={() => navigateImage("prev")}
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      border: "1px solid #0275b2",
                      color: "#0275b2",
                    }}
                  >
                    <IconChevronLeft size={20} />
                  </Button>
                  <Button
                    variant="white"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 shadow-md"
                    radius="xl"
                    size="sm"
                    onClick={() => navigateImage("next")}
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      border: "1px solid #0275b2",
                      color: "#0275b2",
                    }}
                  >
                    <IconChevronRight size={20} />
                  </Button>
                </>
              )}
            </div>

            {selectedAlbum.images && selectedAlbum.images.length > 1 && (
              <>
                <Divider my="md" sx={{ borderTopColor: "#0275b2" }} />
                <Text size="sm" color="dimmed" align="center" mb="md">
                  {selectedImageIndex + 1} of {selectedAlbum.images.length}
                </Text>
              </>
            )}

            <Divider my="md" sx={{ borderTopColor: "#0275b2" }} />

            <Text
              className="text-gray-700"
              sx={{
                fontSize: theme.fontSizes.lg,
                lineHeight: 1.7,
                whiteSpace: "pre-line",
              }}
            >
              {getLocalizedText(selectedAlbum.description)}
            </Text>

            {selectedAlbum.images && selectedAlbum.images.length > 1 && (
              <div className="mt-6">
                <Text size="sm" color="dimmed" mb="sm">
                  Thumbnails
                </Text>
                <div className="flex overflow-x-auto pb-2 space-x-2">
                  {selectedAlbum.images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`${classes.thumbnailContainer} ${selectedImageIndex === idx ? 'selected' : ''}`}
                      onClick={() => setSelectedImageIndex(idx)}
                      style={{ flex: "0 0 auto" }}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        height={80}
                        width={80}
                        className="rounded-sm"
                        withPlaceholder
                        onError={(e) => {
                          console.error("Thumbnail failed to load:", img);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Space h="xl" />

            <Button
              variant="gradient"
              gradient={cardGradient}
              fullWidth
              size="md"
              onClick={() => setSelectedAlbum(null)}
              className={classes.readMoreButton}
            >
              {t("galleryimage.buttons.closeGallery") || "Close Gallery"}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GalleryComponent;