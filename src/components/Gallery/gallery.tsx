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
} from "@mantine/core";
import {
  IconPhoto,
  IconChevronLeft,
  IconChevronRight,
  IconX,
} from "@tabler/icons-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getGalleries } from "../../services/api/main";
import { useTranslation } from "react-i18next";

import Loader from "../../components/common/loader"

interface GalleryItem {
  id: string;
  title: string; // JSON string
  images: string; // JSON string
  description: string; // JSON string
  date?: string;
  category: string; // JSON string
  is_featured?: boolean;
}

interface ParsedGalleryItem {
  id: string;
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
  is_featured?: boolean;
}

const CMS_FILES_BASE_URL =
  `${import.meta.env.VITE_FILE_API}`;

// Helper function to parse JSON fields safely
const parseJsonField = <T,>(field: string): T => {
  try {
    return JSON.parse(field) as T;
  } catch (error) {
    console.error("Error parsing JSON field:", error);
    return {} as T;
  }
};

const formatImageUrl = (imgPath: string): string => {
  if (!imgPath) return "";
  if (imgPath.startsWith("http")) return imgPath;
  return `${CMS_FILES_BASE_URL}${imgPath.replace(/^\/|\/$/g, "")}`;
};

const GalleryComponent = () => {
  const { t, i18n } = useTranslation();
  const [galleryData, setGalleryData] = useState<ParsedGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<ParsedGalleryItem | null>(
    null
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        setLoading(true);
        const response = await getGalleries();

        // Add null check for response
        const data = response || [];

        const normalizedData = data
          .map((item: GalleryItem) => {
            let images: string[] = [];
            try {
              const parsedImages = item.images ? JSON.parse(item.images) : [];
              images = Array.isArray(parsedImages) ? parsedImages : [];
            } catch (e) {
              console.error("Error parsing images:", e);
              images = [];
            }

            return {
              ...item,
              title: parseJsonField<{ en: string; am: string }>(item.title),
              description: parseJsonField<{ en: string; am: string }>(
                item.description
              ),
              category: item.category
                ? parseJsonField<string[]>(item.category)
                : [],
              images: images.map((img) => formatImageUrl(img)),
            };
          })
          .sort((a, b) => {
            // Sort by date in descending order (newest first)
            // If date is not available, we'll put those items at the end
            if (!a.date && !b.date) return 0;
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });

        setGalleryData(normalizedData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch galleries:", err);
        setError(t("galleryimage.errors.loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryData();
  }, [i18n.language, t]);

  const totalPages = Math.ceil(galleryData.length / itemsPerPage);
  const paginatedAlbums = galleryData.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const navigateImage = (direction: "prev" | "next") => {
    if (!selectedAlbum) return;

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
        <Loader  />
      </Center>
    );
  }

  if (error) {
    return (
      <Container size={1400} className="py-16">
        <Notification
          icon={<IconX size={18} />}
          color="red"
          title={t("galleryimage.errors.title")}
        >
          {error}
        </Notification>
      </Container>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="w-full bg-blue-800 py-16">
        <Container size={1400}>
          <div className="text-center text-white" data-aos="fade-down">
            <Badge
              size="xl"
              radius="sm"
              color="blue"
              variant="filled"
              className="mb-6"
            >
              <Group spacing="xs">
                <IconPhoto size={18} />
                <span>{t("galleryimage.hero.badge")}</span>
              </Group>
            </Badge>
            <Title
              order={1}
              className="text-4xl md:text-5xl font-bold mb-4"
              data-aos-delay="100"
            >
              {t("galleryimage.hero.title")}
            </Title>
            <Text
              size="xl"
              className="max-w-3xl mx-auto text-blue-100"
              data-aos-delay="200"
            >
              {t("galleryimage.hero.subtitle")}
            </Text>
          </div>
        </Container>
      </div>

      {/* Gallery Grid Section */}
      <Container size={1400} className="py-16">
        <Grid gutter="xl">
          {paginatedAlbums.map((album, index) => (
            <Grid.Col key={album.id} span={12} md={6} lg={4}>
              <Card
                shadow="md"
                padding="lg"
                className="h-full bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg"
                data-aos="fade-up"
                data-aos-delay={(index % 3) * 100}
              >
                <Card.Section>
                  {album.images && album.images.length > 0 ? (
                    <Image
                      src={album.images[0]}
                      alt={album.title[i18n.language === "am" ? "am" : "en"]}
                      height={450}
                      className="rounded-t-xl object-contain w-full"
                      withPlaceholder
                    />
                  ) : (
                    <div className="h-[200px] flex items-center justify-center bg-gray-100 rounded-t-xl">
                      <IconPhoto size={48} className="text-gray-400" />
                    </div>
                  )}
                </Card.Section>

                <Group position="apart" className="mt-4">
                  <Badge color="blue" variant="light">
                    {(album.category && album.category[0]) ||
                      t("galleryimage.defaultCategory")}
                  </Badge>
                  <Group spacing="xs">
                    <ThemeIcon size="sm" variant="light" color="gray">
                      <IconPhoto size={14} />
                    </ThemeIcon>
                    <Text size="sm" color="dimmed">
                      {album.images?.length || 0} {t("galleryimage.photos")}
                    </Text>
                  </Group>
                </Group>

                <Title
                  order={3}
                  className="text-xl font-bold mt-3 text-blue-800"
                >
                  {album.title[i18n.language === "am" ? "am" : "en"]}
                </Title>

                <Text className="text-gray-600 mt-2">
                  {album.description?.[i18n.language === "am" ? "am" : "en"]
                    ?.length > 100
                    ? `${album.description[
                        i18n.language === "am" ? "am" : "en"
                      ].substring(0, 100)}...`
                    : album.description?.[i18n.language === "am" ? "am" : "en"]}
                </Text>

                <Button
                  className="mt-6 bg-blue-600 hover:bg-blue-700 transition-all"
                  onClick={() => {
                    setSelectedAlbum(album);
                    setSelectedImageIndex(0);
                  }}
                  fullWidth
                  radius="md"
                  disabled={!album.images || album.images.length === 0}
                >
                  {t("galleryimage.buttons.viewAlbum")}
                </Button>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        {/* Pagination */}
        {galleryData.length > 0 && (
          <Group position="center" className="mt-16">
            <Pagination
              page={activePage}
              onChange={setActivePage}
              total={totalPages}
              color="blue"
              radius="md"
              size="md"
              className="shadow-sm"
            />
          </Group>
        )}

        {/* Empty State */}
        {galleryData.length === 0 && !loading && (
          <Card className="text-center py-12">
            <ThemeIcon
              size={60}
              radius={60}
              variant="light"
              color="blue"
              className="mx-auto mb-6"
            >
              <IconPhoto size={30} />
            </ThemeIcon>
            <Title
              order={3}
              className="text-xl font-semibold text-gray-700 mb-2"
            >
              {t("galleryimage.emptyState.title")}
            </Title>
            <Text color="dimmed">{t("galleryimage.emptyState.message")}</Text>
          </Card>
        )}
      </Container>

      {/* Gallery Detail Modal */}
      <Modal
        opened={!!selectedAlbum}
        onClose={() => setSelectedAlbum(null)}
        title={
          <Title order={3} className="text-blue-800">
            {selectedAlbum?.title[i18n.language === "am" ? "am" : "en"]}
          </Title>
        }
        size="xl"
        fullScreen={false}
        radius="lg"
        padding="xl"
        styles={{
          overlay: {
            backdropFilter: "blur(3px)",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          },
        }}
      >
        {selectedAlbum && (
          <div>
            <Group position="apart" className="mb-4">
              <Badge color="blue" size="lg">
                {selectedAlbum.category?.[0] ||
                  t("galleryimage.defaultCategory")}
              </Badge>
              <Group spacing="xs">
                <ThemeIcon size="sm" variant="light" color="gray">
                  <IconPhoto size={14} />
                </ThemeIcon>
                <Text size="sm" color="dimmed">
                  {selectedImageIndex + 1} {t("galleryimage.of")}{" "}
                  {selectedAlbum.images?.length || 0}
                </Text>
              </Group>
            </Group>

            <div className="relative">
              {selectedAlbum.images?.[selectedImageIndex] ? (
                <Image
                  src={selectedAlbum.images[selectedImageIndex]}
                  alt={`${
                    selectedAlbum.title[i18n.language === "am" ? "am" : "en"]
                  } - ${t("galleryimage.image")} ${selectedImageIndex + 1}`}
                  height={500}
                  fit="contain"
                  className="rounded-lg mb-4"
                  withPlaceholder
                />
              ) : (
                <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-lg mb-4">
                  <IconPhoto size={64} className="text-gray-400" />
                </div>
              )}

              {selectedAlbum.images && selectedAlbum.images.length > 1 && (
                <>
                  <Button
                    variant="white"
                    color="blue"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 shadow-md"
                    radius="xl"
                    size="sm"
                    onClick={() => navigateImage("prev")}
                  >
                    <IconChevronLeft size={20} />
                  </Button>
                  <Button
                    variant="white"
                    color="blue"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 shadow-md"
                    radius="xl"
                    size="sm"
                    onClick={() => navigateImage("next")}
                  >
                    <IconChevronRight size={20} />
                  </Button>
                </>
              )}
            </div>

            <Divider className="my-4" />

            <Text className="text-gray-700 text-lg leading-relaxed">
              {
                selectedAlbum.description?.[
                  i18n.language === "am" ? "am" : "en"
                ]
              }
            </Text>

            {selectedAlbum.images && selectedAlbum.images.length > 1 && (
              <div className="mt-6 overflow-x-auto">
                <Group spacing="sm">
                  {selectedAlbum.images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`cursor-pointer border-2 rounded-md transition-all ${
                        selectedImageIndex === idx
                          ? "border-blue-500"
                          : "border-transparent"
                      }`}
                      onClick={() => setSelectedImageIndex(idx)}
                    >
                      <Image
                        src={img}
                        alt={`${t("galleryimage.thumbnail")} ${idx + 1}`}
                        height={80}
                        width={80}
                        className="rounded-sm"
                        withPlaceholder
                      />
                    </div>
                  ))}
                </Group>
              </div>
            )}

            <Space h="xl" />

            <Button
              fullWidth
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setSelectedAlbum(null)}
            >
              {t("galleryimage.buttons.closeGallery")}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GalleryComponent;
