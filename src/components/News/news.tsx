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
  Pagination,
  Group,
  Badge,
  ThemeIcon,
  Divider,
  Space,
  Center,
  Box,
  Paper,
  useMantineTheme,
  AspectRatio,
  rem,
  createStyles,
} from "@mantine/core";
import {
  IconCalendar,
  IconClock,
  IconNews,
  IconArrowRight,
} from "@tabler/icons-react";
import { getAllNews } from "../../services/api/main";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mantine/hooks";
import { useTranslation } from "react-i18next";

import Loader from "../../components/common/loader";

interface NewsItem {
  id: number;
  title: {
    am: string;
    en: string;
  };
  slug: string;
  content: {
    am: string;
    en: string;
  };
  excerpt: string;
  image_path?: string;
  category: {
    id: number;
    name: {
      am: string;
      en: string;
    };
  };
  author: {
    id: number;
    name: string;
  };
  is_published: number;
  created_at: string;
  updated_at: string;
}

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
  newsCard: {
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: theme.shadows.lg,
    },
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
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
  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  readMoreButton: {
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: `${theme.shadows.md} !important`,
    },
  },
  paginationItem: {
    border: `1px solid ${theme.colors.blue[2]}`,
    "&[data-active]": {
      border: "none",
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
      background: theme.fn.linearGradient(
        90,
        theme.colors.blue[5],
        theme.colors.blue[7]
      ),
      transition: "width 0.3s ease",
    },
    "&:hover:after": {
      width: "100%",
    },
  },
  modalContent: {
    "& p": {
      marginBottom: theme.spacing.md,
      lineHeight: 1.7,
    },
    "& img": {
      maxWidth: "100%",
      height: "auto",
      borderRadius: theme.radius.md,
      margin: `${theme.spacing.md}px 0`,
    },
  },
  skeleton: {
    background: theme.colors.gray[2],
    borderRadius: theme.radius.md,
    position: "relative",
    overflow: "hidden",
    "&:after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(90deg, transparent, ${theme.colors.gray[3]}, transparent)`,
      animation: "shimmer 1.5s infinite",
    },
  },
  cardContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  cardTitle: {
    minHeight: rem(72),
    display: "flex",
    alignItems: "center",
    [theme.fn.smallerThan("sm")]: {
      minHeight: rem(60),
    },
  },
  gridCol: {
    display: "flex",
  },
}));

const NewsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);
  const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.md}px)`);

  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [activePage, setActivePage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = isMobile ? 4 : isTablet ? 6 : 9;

  // Gradient colors
  const heroGradient = {
    from: theme.colors.blue[7],
    to: theme.colors.blue[9],
    deg: 135,
  };
  const cardGradient = {
    from: theme.colors.blue[5],
    to: theme.colors.blue[7],
    deg: 45,
  };

  const BASE_IMAGE_URL =
    "https://bole.prosperity.boleprosperityparty.org/CMSFiles/";

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-in-out-cubic",
    });

    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await getAllNews();
        const data = response?.data?.data || [];

        // Parse the JSON strings in the response
        const parsedData = data.map((item: any) => ({
          ...item,
          title:
            typeof item.title === "string"
              ? JSON.parse(item.title)
              : item.title,
          content:
            typeof item.content === "string"
              ? JSON.parse(item.content)
              : { en: "", am: "" },
          category: {
            ...item.category,
            name:
              typeof item.category.name === "string"
                ? JSON.parse(item.category.name)
                : item.category.name,
          },
          image_path: item.image_path ? item.image_path : null,
        }));

        // Sort by date (newest first)
        parsedData.sort(
          (a: NewsItem, b: NewsItem) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setNewsData(parsedData);
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const truncateContent = (text: string, length: number) => {
    if (!text) return "";
    return text.length > length ? `${text.substring(0, length)}...` : text;
  };

  const truncateDescription = (description: string) => {
    return truncateContent(description, isMobile ? 80 : 120);
  };

  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return null;
    return `${BASE_IMAGE_URL}${imagePath}`;
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const totalPages = Math.ceil(newsData.length / itemsPerPage);
  const paginatedNews = newsData.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  if (loading) {
    return (
      <Center className="h-[60vh]">
        <Loader />
      </Center>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* Hero Section */}
      <Box className={`${classes.hero} bg-blue-800`} py={rem(100)}>
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
                <IconNews size={18} />
                <div>{t("news.latestUpdates")}</div>
              </Group>
             
            </Badge>
             <div></div>
            <Title
              order={1}
              className={`text-4xl md:text-5xl font-bold mb-4 tracking-tight ${classes.title}`}
              data-aos-delay="150"
              sx={{
                textShadow: "0 2px 8px rgba(0,0,0,0.15)",
                fontFamily: theme.headings.fontFamily,
              }}
            >
              {t("news.pageTitle")}
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
              {t("news.pageSubtitle")}
            </Text>
          </div>
        </Container>
      </Box>

      {/* News Grid Section */}
      <Container size={1400} py={rem(60)} px={isMobile ? rem(20) : rem(40)}>
        {newsData.length > 0 ? (
          <>
            <Grid gutter={isMobile ? 20 : 30}>
              {paginatedNews.map((news, index) => (
                <Grid.Col
                  key={news.id}
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
                    className={classes.newsCard}
                    sx={{
                      borderTop: `3px solid ${theme.colors.blue[5]}`,
                    }}
                  >
                    <Card.Section className={classes.imageContainer}>
                      <AspectRatio ratio={16 / 9}>
                        <Image
                          src={
                            getImageUrl(news.image_path) ||
                            "/news-placeholder.jpg"
                          }
                          alt={news.title?.[i18n.language] || "News image"}
                          className={classes.cardImage}
                          withPlaceholder
                          placeholder={
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <IconNews
                                size={40}
                                color={theme.colors.gray[5]}
                              />
                            </div>
                          }
                        />
                      </AspectRatio>
                      <div className="absolute bottom-4 left-4 z-10">
                        <Badge
                          color="blue"
                          variant="light"
                          radius="sm"
                          size={isMobile ? "sm" : "md"}
                          sx={{
                            backgroundColor: theme.fn.rgba(
                              theme.colors.blue[0],
                              0.95
                            ),
                            color: theme.colors.blue[7],
                            fontWeight: 600,
                            backdropFilter: "blur(2px)",
                          }}
                        >
                          {news.category?.name?.[i18n.language] ||
                            t("news.generalCategory")}
                        </Badge>
                      </div>
                    </Card.Section>

                    <Box p="lg" className={classes.cardContent}>
                      <Group spacing="xs" mb="sm">
                        <ThemeIcon
                          size={20}
                          radius="xl"
                          color="gray"
                          variant="light"
                        >
                          <IconCalendar size={14} />
                        </ThemeIcon>
                        <Text size="sm" color="dimmed">
                          {formatDate(news.created_at)}
                        </Text>
                      </Group>

                      <Title
                        order={3}
                        className={`${classes.title} ${classes.cardTitle}`}
                        sx={{
                          color: theme.colors.gray[8],
                          fontFamily: theme.headings.fontFamily,
                          lineHeight: 1.3,
                        }}
                      >
                        {news.title?.[i18n.language] || t("news.noTitle")}
                      </Title>

                      <Title order={3} className="text-sm mt-3 text-red-800">
                        {(news.content?.[i18n.language]?.slice(0, 150) ||
                          t("news.noTitle")) +
                          (news.content?.[i18n.language]?.length > 150
                            ? "..."
                            : "")}
                      </Title>

                      <Text
                        className="text-gray-700 mb-4"
                        sx={{ lineHeight: 1.6, flex: 1 }}
                        size={isMobile ? "sm" : "md"}
                      >
                        {truncateDescription(
                          news.excerpt || news.content?.[i18n.language] || ""
                        )}
                      </Text>

                      <Button
                        variant="gradient"
                        gradient={cardGradient}
                        onClick={() => navigate(`/news/${news.id}`)}
                        fullWidth
                        radius="md"
                        rightIcon={<IconArrowRight size={16} />}
                        className={classes.readMoreButton}
                        size={isMobile ? "sm" : "md"}
                      >
                        {t("news.readMore")}
                      </Button>
                    </Box>
                  </Card>
                </Grid.Col>
              ))}
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
              background: theme.fn.linearGradient(
                0,
                theme.fn.rgba(theme.colors.blue[0], 0.8),
                theme.fn.rgba(theme.colors.blue[1], 0.8)
              ),
              borderColor: theme.colors.blue[3],
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
                <IconNews size={40} />
              </ThemeIcon>
              <Title
                order={3}
                className="text-2xl font-semibold mb-2"
                sx={{ color: theme.colors.blue[8] }}
              >
                {t("news.noNewsTitle")}
              </Title>
              <Text color="dimmed" size="lg">
                {t("news.noNewsSubtitle")}
              </Text>
            </Box>
          </Paper>
        )}
      </Container>

      {/* News Detail Modal */}
      <Modal
        opened={!!selectedNews}
        onClose={() => setSelectedNews(null)}
        title={
          <Title
            order={3}
            sx={{
              color: theme.colors.blue[8],
              fontFamily: theme.headings.fontFamily,
            }}
          >
            {selectedNews?.title?.[i18n.language] || t("news.newsDetails")}
          </Title>
        }
        size={isMobile ? "100%" : "lg"}
        overlayBlur={5}
        overlayOpacity={0.7}
        radius="lg"
        padding="xl"
        centered
        fullScreen={isMobile}
        transition="slide-up"
        transitionDuration={300}
      >
        {selectedNews && (
          <div className={classes.modalContent}>
            <Group position="apart" mb="md">
              <Badge
                color="blue"
                size="lg"
                variant="light"
                sx={{
                  backgroundColor: theme.fn.rgba(theme.colors.blue[0], 0.9),
                  color: theme.colors.blue[7],
                  fontWeight: 600,
                }}
              >
                {selectedNews.category?.name?.[i18n.language] ||
                  t("news.generalCategory")}
              </Badge>
              <Group spacing="xs">
                <ThemeIcon size={20} radius="xl" color="gray" variant="light">
                  <IconCalendar size={14} />
                </ThemeIcon>
                <Text size="sm" color="dimmed">
                  {formatDate(selectedNews.created_at)}
                </Text>
              </Group>
            </Group>

            {selectedNews.image_path && (
              <Box
                mb="lg"
                sx={{
                  borderRadius: theme.radius.lg,
                  overflow: "hidden",
                  boxShadow: theme.shadows.sm,
                }}
              >
                <AspectRatio ratio={16 / 9}>
                  <Image
                    src={getImageUrl(selectedNews.image_path)}
                    alt={selectedNews.title?.[i18n.language] || "News image"}
                    className="w-full h-full object-cover"
                    withPlaceholder
                  />
                </AspectRatio>
              </Box>
            )}

            <Divider
              my="md"
              sx={{
                borderTopColor: theme.colors.blue[2],
              }}
            />

            <Text
              className="text-gray-700"
              sx={{
                fontSize: theme.fontSizes.lg,
                lineHeight: 1.7,
              }}
              dangerouslySetInnerHTML={{
                __html:
                  selectedNews.content?.[i18n.language] ||
                  selectedNews.excerpt ||
                  t("news.noContent"),
              }}
            />

            <Space h="xl" />

            <Button
              variant="gradient"
              gradient={cardGradient}
              fullWidth
              size="md"
              onClick={() => setSelectedNews(null)}
              className={classes.readMoreButton}
              rightIcon={
                <IconArrowRight
                  size={16}
                  style={{ transform: "rotate(180deg)" }}
                />
              }
            >
              {t("news.close")}
            </Button>
          </div>
        )}
      </Modal>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default NewsPage;
