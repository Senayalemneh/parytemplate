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
  SegmentedControl,
  Select,
} from "@mantine/core";
import {
  IconCalendar,
  IconClock,
  IconVideo,
  IconArrowRight,
  IconBrandYoutube,
  IconFilter,
} from "@tabler/icons-react";
import { getPostedVideos } from "../../services/api/main";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mantine/hooks";
import { useTranslation } from "react-i18next";

import Loader from "../../components/common/loader"

interface VideoItem {
  id: number;
  title: string;
  description: string;
  thumbnail_image_path: string;
  video_file: string;
  video_url: string | null;
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
  videoCard: {
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: theme.shadows.lg,
    },
  },
  videoContainer: {
    position: "relative",
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
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 2,
    width: 60,
    height: 60,
    borderRadius: "50%",
    backgroundColor: theme.fn.rgba(theme.colors.red[6], 0.9),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translate(-50%, -50%) scale(1.1)",
      backgroundColor: theme.fn.rgba(theme.colors.red[7], 1),
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
  },
  youtubeContainer: {
    position: "relative",
    paddingBottom: "56.25%", // 16:9 aspect ratio
    height: 0,
    overflow: "hidden",
    iframe: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      border: "none",
    },
  },
  videoBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
    backdropFilter: "blur(4px)",
    backgroundColor: theme.fn.rgba(theme.colors.dark[7], 0.7),
  },
  fullWidthVideo: {
    width: "100%",
    height: "auto",
    maxHeight: "80vh",
    borderRadius: theme.radius.lg,
  },
  filterContainer: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[1],
  },
}));

const VideosPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);
  const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.md}px)`);

  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [videoData, setVideoData] = useState<VideoItem[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoItem[]>([]);
  const [activePage, setActivePage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [videoTypeFilter, setVideoTypeFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const itemsPerPage = 9; // Fixed to 9 items per page

  // Gradient colors
  const heroGradient = {
    from: theme.colors.red[7],
    to: theme.colors.red[9],
    deg: 135,
  };
  const cardGradient = {
    from: theme.colors.red[5],
    to: theme.colors.red[7],
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

    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await getPostedVideos();
        // Sort videos by created_at in descending order (newest first)
        const sortedVideos = [...response].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setVideoData(sortedVideos);
        setFilteredVideos(sortedVideos);
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  useEffect(() => {
    // Apply filters whenever videoData or filter values change
    let filtered = [...videoData];

    // Apply video type filter
    if (videoTypeFilter === "youtube") {
      filtered = filtered.filter(
        (video) => video.video_url && getYoutubeId(video.video_url)
      );
    } else if (videoTypeFilter === "uploaded") {
      filtered = filtered.filter((video) => video.video_file);
    }

    // Apply sort order
    if (sortOrder === "newest") {
      filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortOrder === "oldest") {
      filtered.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }

    setFilteredVideos(filtered);
    setActivePage(1); // Reset to first page when filters change
  }, [videoData, videoTypeFilter, sortOrder]);

  const truncateDescription = (text: string, length: number) => {
    if (!text) return "";
    return text.length > length ? `${text.substring(0, length)}...` : text;
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getYoutubeId = (url: string | null): string | null => {
    if (!url) return null;

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return match && match[2].length === 11 ? match[2] : null;
  };

  const handlePageChange = (page: number) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const paginatedVideos = filteredVideos.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  if (loading && videoData.length === 0) {
    return (
      <Center className="h-[60vh]">
        <Loader  />
      </Center>
    );
  }

  return (
    <div className="bg-gradient-to-b from-red-50 to-white min-h-screen">
      {/* Hero Section */}
      <Box className={`${classes.hero} bg-blue-800`} py={rem(50)}>
        <Container size={1400}>
          <div className="text-center text-white" data-aos="fade-down">
            <Title
              order={1}
              className={`text-4xl md:text-5xl font-bold mb-4 tracking-tight ${classes.title}`}
              data-aos-delay="150"
              sx={{
                textShadow: "0 2px 8px rgba(0,0,0,0.15)",
                fontFamily: theme.headings.fontFamily,
              }}
            >
              {t("videos.pageTitle")}
            </Title>
            <Text
              size="xl"
              className="max-w-3xl mx-auto text-red-100"
              data-aos-delay="200"
              sx={{
                fontSize: theme.fontSizes.xl,
                lineHeight: 1.6,
              }}
            >
              {t("videos.pageSubtitle")}
            </Text>
          </div>
        </Container>
      </Box>

      {/* Videos Grid Section */}
      <Container size={1400} py={rem(60)} px={isMobile ? rem(20) : rem(40)}>
        {/* Filters */}
        <Box className={classes.filterContainer} data-aos="fade-up">
          <Group position="apart" spacing="md">
            <SegmentedControl
              value={videoTypeFilter}
              onChange={setVideoTypeFilter}
              data={[
                { label: "All Videos", value: "all" },
                { label: "YouTube", value: "youtube" },
                { label: "Uploaded", value: "uploaded" },
              ]}
              color="red"
              size={isMobile ? "sm" : "md"}
              radius="md"
            />

            <Select
              value={sortOrder}
              onChange={(value) => setSortOrder(value || "newest")}
              data={[
                { value: "newest", label: "Newest First" },
                { value: "oldest", label: "Oldest First" },
              ]}
              icon={<IconFilter size={16} />}
              placeholder="Sort by"
              size={isMobile ? "sm" : "md"}
              radius="md"
              clearable={false}
              sx={{ minWidth: isMobile ? 140 : 180 }}
            />
          </Group>
        </Box>

        {filteredVideos.length > 0 ? (
          <>
            <Grid gutter={isMobile ? 20 : 30}>
              {paginatedVideos.map((video, index) => {
                const isYoutubeVideo =
                  video.video_url && getYoutubeId(video.video_url);
                const thumbnailUrl = isYoutubeVideo
                  ? `https://img.youtube.com/vi/${getYoutubeId(
                      video.video_url
                    )}/hqdefault.jpg`
                  : video.thumbnail_image_path
                  ? `${BASE_IMAGE_URL}${video.thumbnail_image_path}`
                  : video.video_file
                  ? `${BASE_IMAGE_URL}${video.video_file}`
                  : "/video-placeholder.jpg";

                return (
                  <Grid.Col
                    key={video.id}
                    span={12}
                    sm={6}
                    lg={4}
                    data-aos="fade-up"
                    data-aos-delay={(index % 3) * 50}
                  >
                    <Card
                      shadow="sm"
                      p={0}
                      radius="lg"
                      className={classes.videoCard}
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderTop: `3px solid ${theme.colors.red[5]}`,
                        overflow: "hidden",
                      }}
                    >
                      <Card.Section className={classes.videoContainer}>
                        <AspectRatio ratio={16 / 13}>
                          <Image
                            src={thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-contain p-3" // changed from object-fill
                            withPlaceholder
                            placeholder={
                              <div className="w-full h-full bg-gray-200 animate-pulse" />
                            }
                          />
                        </AspectRatio>

                        <Badge
                          className={classes.videoBadge}
                          leftSection={
                            isYoutubeVideo ? (
                              <IconBrandYoutube size={14} />
                            ) : (
                              <IconVideo size={14} />
                            )
                          }
                          color={isYoutubeVideo ? "red" : "blue"}
                          variant="filled"
                          size={isMobile ? "sm" : "md"}
                        >
                          {isYoutubeVideo ? "YouTube" : "Uploaded Video"}
                        </Badge>

                        <div
                          className={classes.playButton}
                          onClick={() => setSelectedVideo(video)}
                        >
                          <IconVideo size={24} color="white" />
                        </div>
                      </Card.Section>

                      <Box
                        p="lg"
                        sx={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
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
                            {formatDate(video.created_at)}
                          </Text>
                        </Group>

                        <Title
                          order={3}
                          className={`text-xl font-bold mb-3 ${classes.title}`}
                          sx={{
                            color: theme.colors.gray[8],
                            fontFamily: theme.headings.fontFamily,
                            lineHeight: 1.3,
                            minHeight: isMobile ? rem(60) : rem(72),
                          }}
                        >
                          {video.title}
                        </Title>

                        <Text
                          className="text-gray-700 mb-4 flex-grow"
                          sx={{ lineHeight: 1.6 }}
                          size={isMobile ? "sm" : "md"}
                        >
                          {truncateDescription(
                            video.description || "",
                            isMobile ? 80 : 120
                          )}
                        </Text>

                        <Button
                          variant="gradient"
                          gradient={cardGradient}
                          onClick={() => setSelectedVideo(video)}
                          fullWidth
                          radius="md"
                          mt="auto"
                          rightIcon={<IconArrowRight size={16} />}
                          size={isMobile ? "sm" : "md"}
                        >
                          {t("videos.watchNow")}
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
                  onChange={handlePageChange}
                  total={totalPages}
                  color="red"
                  radius="md"
                  size={isMobile ? "sm" : "md"}
                  siblings={1}
                  boundaries={1}
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
                theme.fn.rgba(theme.colors.red[0], 0.8),
                theme.fn.rgba(theme.colors.red[1], 0.8)
              ),
              borderColor: theme.colors.red[3],
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
                <IconVideo size={40} />
              </ThemeIcon>
              <Title
                order={3}
                className="text-2xl font-semibold mb-2"
                sx={{ color: theme.colors.red[8] }}
              >
                {t("videos.noVideosTitle")}
              </Title>
              <Text color="dimmed" size="lg">
                {t("videos.noVideosSubtitle")}
              </Text>
            </Box>
          </Paper>
        )}
      </Container>

      {/* Video Detail Modal */}
      <Modal
        opened={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        title={
          <Title
            order={3}
            sx={{
              color: theme.colors.red[8],
              fontFamily: theme.headings.fontFamily,
            }}
          >
            {selectedVideo?.title || t("videos.videoDetails")}
          </Title>
        }
        size={isMobile ? "100%" : "xl"}
        overlayBlur={5}
        overlayOpacity={0.7}
        radius="lg"
        padding="xl"
        centered
        fullScreen={isMobile}
        transition="slide-up"
        transitionDuration={300}
      >
        {selectedVideo && (
          <div className={classes.modalContent}>
            <Group position="apart" mb="md">
              <Badge
                leftSection={
                  selectedVideo.video_url &&
                  getYoutubeId(selectedVideo.video_url) ? (
                    <IconBrandYoutube size={14} />
                  ) : (
                    <IconVideo size={14} />
                  )
                }
                color={
                  selectedVideo.video_url &&
                  getYoutubeId(selectedVideo.video_url)
                    ? "red"
                    : "blue"
                }
                size="lg"
                variant="light"
                sx={{
                  backgroundColor: theme.fn.rgba(
                    selectedVideo.video_url &&
                      getYoutubeId(selectedVideo.video_url)
                      ? theme.colors.red[0]
                      : theme.colors.blue[0],
                    0.9
                  ),
                  color:
                    selectedVideo.video_url &&
                    getYoutubeId(selectedVideo.video_url)
                      ? theme.colors.red[7]
                      : theme.colors.blue[7],
                  fontWeight: 600,
                }}
              >
                {selectedVideo.video_url &&
                getYoutubeId(selectedVideo.video_url)
                  ? "YouTube Video"
                  : "Uploaded Video"}
              </Badge>
              <Group spacing="xs">
                <ThemeIcon size={20} radius="xl" color="gray" variant="light">
                  <IconCalendar size={14} />
                </ThemeIcon>
                <Text size="sm" color="dimmed">
                  {formatDate(selectedVideo.created_at)}
                </Text>
              </Group>
            </Group>

            <Box mb="lg">
              {selectedVideo.video_url &&
              getYoutubeId(selectedVideo.video_url) ? (
                <div className={classes.youtubeContainer}>
                  <iframe
                    src={`https://www.youtube.com/embed/${getYoutubeId(
                      selectedVideo.video_url
                    )}?autoplay=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={selectedVideo.title}
                  />
                </div>
              ) : (
                <video
                  controls
                  autoPlay
                  src={`${BASE_IMAGE_URL}${selectedVideo.video_file}`}
                  className={classes.fullWidthVideo}
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "80vh",
                    borderRadius: theme.radius.lg,
                  }}
                />
              )}
            </Box>

            <Divider
              my="md"
              sx={{
                borderTopColor: theme.colors.red[2],
              }}
            />

            <Text
              className="text-gray-700"
              sx={{
                fontSize: theme.fontSizes.lg,
                lineHeight: 1.7,
              }}
            >
              {selectedVideo.description}
            </Text>

            <Space h="xl" />

            <Button
              variant="gradient"
              gradient={cardGradient}
              fullWidth
              size="md"
              onClick={() => setSelectedVideo(null)}
              rightIcon={
                <IconArrowRight
                  size={16}
                  style={{ transform: "rotate(180deg)" }}
                />
              }
            >
              {t("videos.close")}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VideosPage;
