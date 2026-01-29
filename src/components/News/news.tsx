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
  image_path?: string;
  category: {
    id: number;
    name: {
      am: string;
      en: string;
    };
  };
  author_id?: string;
  category_id: number;
  woreda_id?: number;
  subcity_id?: number;
  is_published: boolean;
  published_at?: string;
  messages?: any;
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
  cardTitle: {
    minHeight: rem(72),
    [theme.fn.smallerThan("sm")]: {
      minHeight: rem(60),
    },
    fontSize: "1.1rem",
    fontWeight: 700,
    lineHeight: 1.3,
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
  },
  cardContentText: {
    lineHeight: 1.6,
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 4,
    WebkitBoxOrient: "vertical",
    fontSize: "0.95rem",
    color: theme.colors.gray[7],
    minHeight: rem(100),
    flex: 1,
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

  const cardGradient = {
    from: "#0275b2",
    to: "#046d74",
    deg: 45,
  };

  const BASE_IMAGE_URL =
    `${import.meta.env.VITE_FILE_API}`;

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
        const data = response?.data || [];

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
              : item.content,
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

  const cleanText = (text: string): string => {
    if (!text) return "";

    // Remove HTML tags if they exist
    let cleaned = text.replace(/<[^>]*>/g, ' ');

    // Replace common HTML entities
    cleaned = cleaned
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // Replace newlines and multiple spaces
    cleaned = cleaned
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return cleaned;
  };

  const truncateText = (text: string, maxLength: number): string => {
    const cleanedText = cleanText(text);

    if (cleanedText.length <= maxLength) return cleanedText;

    // Find the last space before maxLength to avoid cutting words
    let truncated = cleanedText.substr(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > maxLength * 0.7 && lastSpace > 0) {
      truncated = truncated.substr(0, lastSpace);
    }

    return truncated + '...';
  };

  const getTruncatedTitle = (title: string): string => {
    return truncateText(title, 100);
  };

  const getTruncatedContent = (content: string): string => {
    return truncateText(content, 200);
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
    <div className="bg-gradient-to-b from-[#112f77]/10 to-white min-h-screen">
      {/* Hero Section */}
      <Box
        className={`${classes.hero}`}
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
                <IconNews size={18} />
                <div>{t("news.latestUpdates")}</div>
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
              {paginatedNews.map((news, index) => {
                const localizedTitle = news.title?.[i18n.language as keyof typeof news.title] || news.title?.en || t("news.noTitle");
                const localizedContent = news.content?.[i18n.language as keyof typeof news.content] || news.content?.en || news.content?.am || "";

                // Get truncated title and content
                const truncatedTitle = getTruncatedTitle(localizedTitle);
                const truncatedContent = getTruncatedContent(localizedContent);

                return (
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
                        borderTop: `3px solid #0275b2`,
                      }}
                    >
                      <Card.Section className={classes.imageContainer}>
                        <AspectRatio ratio={16 / 9}>
                          <Image
                            src={
                              getImageUrl(news.image_path) ||
                              "/news-placeholder.jpg"
                            }
                            alt={localizedTitle}
                            className={classes.cardImage}
                            withPlaceholder
                            placeholder={
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <IconNews
                                  size={40}
                                  color="#0275b2"
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
                              backgroundColor: "rgba(2, 117, 178, 0.15)",
                              color: "#0275b2",
                              fontWeight: 600,
                              backdropFilter: "blur(2px)",
                            }}
                          >
                            {news.category?.name?.[i18n.language as keyof typeof news.category.name] ||
                              news.category?.name?.en ||
                              t("news.generalCategory")}
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
                            {formatDate(news.created_at)}
                          </Text>
                        </Group>

                        {/* Title */}
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
                        </Title>

                        {/* Content below title */}
                        <Text
                          className={classes.cardContentText}
                          sx={{
                            lineHeight: 1.6,
                            flex: 1,
                            marginBottom: theme.spacing.md,
                            fontSize: theme.fontSizes.sm,
                          }}
                          title={cleanText(localizedContent)}
                        >
                          {truncatedContent}
                          {cleanText(localizedContent).length > 200 && (
                            <Text component="span" size="xs" color="dimmed" ml={4}>
                              ...more
                            </Text>
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
                );
              })}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Group position="center" mt={40}>
                <Pagination
                  value={activePage}
                  onChange={setActivePage}
                  total={totalPages}
                  color="blue"
                  radius="md"
                  size={isMobile ? "sm" : "md"}
                  siblings={isMobile ? 0 : 1}
                  boundaries={isMobile ? 0 : 1}
                  classNames={{
                    control: classes.paginationItem,
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
                <IconNews size={40} />
              </ThemeIcon>
              <Title
                order={3}
                className="text-2xl font-semibold mb-2"
                sx={{ color: "#112f77" }}
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
              color: "#112f77",
              fontFamily: theme.headings.fontFamily,
            }}
          >
            {selectedNews?.title?.[i18n.language as keyof typeof selectedNews.title] || selectedNews?.title?.en || t("news.newsDetails")}
          </Title>
        }
        size={isMobile ? "100%" : "lg"}
        overlayProps={{ opacity: 0.7, blur: 5 }}
        radius="lg"
        padding="xl"
        centered
        fullScreen={isMobile}
        transitionProps={{ transition: "slide-up", duration: 300 }}
      >
        {selectedNews && (
          <div className={classes.modalContent}>
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
                {selectedNews.category?.name?.[i18n.language as keyof typeof selectedNews.category.name] ||
                  selectedNews.category?.name?.en ||
                  t("news.generalCategory")}
              </Badge>
              <Group spacing="xs">
                <ThemeIcon size={20} radius="xl" style={{
                  backgroundColor: "#f9db12",
                  color: "#112f77"
                }}>
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
                    alt={selectedNews.title?.[i18n.language as keyof typeof selectedNews.title] || selectedNews.title?.en || "News image"}
                    className="w-full h-full object-cover"
                    withPlaceholder
                  />
                </AspectRatio>
              </Box>
            )}

            <Divider
              my="md"
              sx={{
                borderTopColor: "#0275b2",
              }}
            />

            <Text
              className="text-gray-700"
              sx={{
                fontSize: theme.fontSizes.lg,
                lineHeight: 1.7,
                whiteSpace: "pre-line",
              }}
              dangerouslySetInnerHTML={{
                __html:
                  selectedNews.content?.[i18n.language as keyof typeof selectedNews.content]?.replace(/\n/g, '<br/>') ||
                  selectedNews.content?.en?.replace(/\n/g, '<br/>') ||
                  selectedNews.content?.am?.replace(/\n/g, '<br/>') ||
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

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `
      }} />
    </div>
  );
};

export default NewsPage;