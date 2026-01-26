import React, { useState, useEffect } from "react";
import {
  Title,
  Text,
  Container,
  Grid,
  Card,
  Image,
  Button,
  Group,
  Badge,
  ThemeIcon,
  Divider,
  Space,
  Center,
  Box,
  Paper,
  useMantineTheme,
  Breadcrumbs,
  Anchor,
  Avatar,
  createStyles,
  TextInput,
  Textarea,
  ActionIcon,
  SimpleGrid,
  Modal,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCalendar,
  IconClock,
  IconNews,
  IconArrowLeft,
  IconShare,
  IconBookmark,
  IconEye,
  IconMessageCircle,
  IconTags,
  IconSend,
  IconTrash,
  IconEdit,
} from "@tabler/icons-react";
import Loader from "../../components/common/loader";
import { useParams, useNavigate } from "react-router-dom";
import {
  getNewsById,
  getAllNews,
  createNewsComment,
  getNewsComments,
  updateNewsComment,
  deleteNewsComment,
} from "../../services/api/main";
import AOS from "aos";
import "aos/dist/aos.css";
import { useTranslation } from "react-i18next";
import { FacebookShareButton, TwitterShareButton } from "react-share";

const useStyles = createStyles((theme) => ({
  featuredImage: {
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    boxShadow: theme.shadows.xl,
    border: `1px solid ${theme.colors.gray[2]}`,
    marginBottom: theme.spacing.xl,
    position: "relative",
    transition: "transform 0.3s ease",
    "&:hover": {
      transform: "scale(1.005)",
    },
  },
  multipleImagesContainer: {
    marginTop: theme.spacing.xl,
  },
  multipleImageItem: {
    borderRadius: theme.radius.md,
    overflow: "hidden",
    boxShadow: theme.shadows.sm,
    border: `1px solid ${theme.colors.gray[2]}`,
    transition: "transform 0.3s ease",
    "&:hover": {
      transform: "scale(1.02)",
    },
  },
  title: {
    fontSize: "2.5rem",
    lineHeight: 1.2,
    fontWeight: 800,
    marginBottom: theme.spacing.md,
    color: theme.colors.gray[9],
    [theme.fn.smallerThan("sm")]: {
      fontSize: "1.8rem",
    },
  },
  content: {
    fontSize: "1.1rem",
    lineHeight: 1.8,
    "& p": {
      marginBottom: theme.spacing.xl,
    },
    "& h2": {
      fontSize: "1.8rem",
      fontWeight: 700,
      margin: `${theme.spacing.xl}px 0 ${theme.spacing.md}px 0`,
      color: theme.colors.gray[9],
    },
    "& h3": {
      fontSize: "1.5rem",
      fontWeight: 600,
      margin: `${theme.spacing.xl}px 0 ${theme.spacing.md}px 0`,
      color: theme.colors.gray[9],
    },
    "& blockquote": {
      borderLeft: `4px solid ${theme.colors.blue[5]}`,
      paddingLeft: theme.spacing.md,
      fontStyle: "italic",
      color: theme.colors.gray[7],
      margin: `${theme.spacing.xl}px 0`,
      backgroundColor: theme.colors.gray[0],
      padding: theme.spacing.md,
      borderRadius: theme.radius.sm,
    },
    "& img": {
      maxWidth: "100%",
      height: "auto",
      borderRadius: theme.radius.md,
      margin: `${theme.spacing.xl}px 0`,
    },
  },
  sidebarCard: {
    position: "sticky",
    top: 20,
    transition: "box-shadow 0.3s ease",
    "&:hover": {
      boxShadow: theme.shadows.md,
    },
  },
  relatedNewsCard: {
    transition: "transform 0.3s ease",
    "&:hover": {
      transform: "translateY(-5px)",
      cursor: "pointer",
    },
  },
  commentBox: {
    borderLeft: `3px solid ${theme.colors.blue[5]}`,
    paddingLeft: theme.spacing.md,
    transition: "all 0.2s ease",
    "&:hover": {
      borderLeftColor: theme.colors.blue[7],
    },
  },
  commentActions: {
    [theme.fn.smallerThan("sm")]: {
      opacity: 1,
    },
  },
  commentInput: {
    textarea: {
      minHeight: 100,
    },
  },
  modalImage: {
    maxHeight: "80vh",
    width: "100%",
    objectFit: "contain",
  },
}));

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
  multiple_image_path?: string[];
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
    avatar?: string;
  };
  is_published: number;
  created_at: string;
  updated_at: string;
  view_count?: number;
  tags?: string[];
  messages?: Comment[];
}

interface Comment {
  id?: number;
  username: string;
  email: string;
  message: string;
  created_at?: string;
  updated_at?: string;
  timestamp?: string;
  user_id?: number | null;
  user?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

const DetailedNews: React.FC = () => {
  const { t, i18n } = useTranslation();
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [currentUrl, setCurrentUrl] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const BASE_IMAGE_URL =
    `${import.meta.env.VITE_FILE_API}`;

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
    setCurrentUrl(window.location.href);

    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        if (!id) {
          setError(t("newsdetail.error.missingId"));
          return;
        }

        const allNewsResponse = await getAllNews();
        const allNewsData =
          allNewsResponse?.data?.data || allNewsResponse?.data || [];

        if (!Array.isArray(allNewsData)) {
          console.error("Unexpected news data format:", allNewsData);
          setError(t("newsdetail.error.invalidFormat"));
          return;
        }

        const parsedAllNews = allNewsData.map((item: any) => ({
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
          image_path: item.image_path || null,
          multiple_image_path: item.multiple_image_path 
            ? JSON.parse(item.multiple_image_path)
            : [],
          view_count: item.view_count || 0,
          tags: item.tags || [],
          messages: item.messages || [],
        }));

        const newsWithImage = parsedAllNews.find(
          (item: NewsItem) => item.id === parseInt(id)
        );

        if (!newsWithImage) {
          setError(t("newsdetail.error.notFound"));
          return;
        }

        const detailedResponse = await getNewsById(id);
        const detailedData = detailedResponse?.data || null;

        if (!detailedData) {
          setError(t("newsdetail.error.notFound"));
          return;
        }

        const combinedItem = {
          ...detailedData,
          title:
            typeof detailedData.title === "string"
              ? JSON.parse(detailedData.title)
              : detailedData.title,
          content:
            typeof detailedData.content === "string"
              ? JSON.parse(detailedData.content)
              : { en: "", am: "" },
          category: {
            ...detailedData.category,
            name:
              typeof detailedData.category.name === "string"
                ? JSON.parse(detailedData.category.name)
                : detailedData.category.name,
          },
          image_path: newsWithImage.image_path,
          multiple_image_path: newsWithImage.multiple_image_path,
          view_count: detailedData.view_count || 0,
          tags: newsWithImage.tags || [],
          messages: detailedData.messages || [],
        };

        setNewsItem(combinedItem);
        setRelatedNews(
          parsedAllNews.filter((item) => item.id !== parseInt(id)).slice(0, 6)
        );

        if (combinedItem.messages && combinedItem.messages.length > 0) {
          const validMessages = combinedItem.messages.filter(
            (msg: any) => msg.message && msg.username
          );
          const sortedComments = [...validMessages].sort(
            (a, b) =>
              new Date(b.timestamp || b.created_at).getTime() -
              new Date(a.timestamp || a.created_at).getTime()
          );
          setComments(sortedComments);
        } else {
          await fetchComments();
        }
      } catch (err) {
        console.error("Failed to fetch news:", err);
        setError(t("newsdetail.error.failedToLoad"));
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id, t]);

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await getNewsComments(parseInt(id as string));
      const sortedComments = (response.data || []).sort(
        (a: Comment, b: Comment) =>
          new Date(b.timestamp || b.created_at).getTime() -
          new Date(a.timestamp || a.created_at).getTime()
      );
      setComments(sortedComments);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !currentUser || !id) return;

    try {
      setCommentLoading(true);
      const payload = {
        username: currentUser.name || "Anonymous",
        email: currentUser.email || "no-email@example.com",
        message: commentText,
        user_id: currentUser.id || null,
        timestamp: new Date().toISOString(),
      };

      const response = await createNewsComment(parseInt(id as string), payload);

      if (response.success) {
        const updatedNewsResponse = await getNewsById(id);
        const updatedNews = updatedNewsResponse?.data;

        if (updatedNews && updatedNews.messages) {
          const newComment = updatedNews.messages.find(
            (msg: any) =>
              msg.message === commentText && msg.username === payload.username
          );

          if (newComment) {
            setComments([newComment, ...comments]);
            setCommentText("");
          }
        }
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id || null);
    setEditCommentText(comment.message);
  };

  const handleUpdateComment = async () => {
    if (!editingCommentId || !editCommentText.trim() || !id) return;

    try {
      setCommentLoading(true);
      const payload = {
        message: editCommentText,
      };

      await updateNewsComment(
        parseInt(id as string),
        editingCommentId,
        payload
      );

      await fetchComments();
      setEditingCommentId(null);
      setEditCommentText("");
    } catch (error) {
      console.error("Failed to update comment:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!id || !commentId) return;

    try {
      setCommentLoading(true);
      await deleteNewsComment(parseInt(id as string), commentId);
      setComments(comments.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error("Failed to delete comment:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(
      i18n.language === "am" ? "am-ET" : "en-US",
      options
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return t("newsdetail.time.justNow");
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} ${t(
        "newsdetail.time.minutesAgo"
      )}`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} ${t(
        "newsdetail.time.hoursAgo"
      )}`;
    return `${Math.floor(diffInSeconds / 86400)} ${t(
      "newsdetail.time.daysAgo"
    )}`;
  };

  const getLocalizedContent = (content: { am: string; en: string }) => {
    return i18n.language === "am" ? content.am : content.en;
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
      <Container size={1400} className="py-20">
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
        >
          <Box className="text-center">
            <ThemeIcon
              size={80}
              radius={80}
              variant="gradient"
              gradient={{ from: "red", to: "orange", deg: 45 }}
              className="mx-auto mb-6"
              sx={{ boxShadow: theme.shadows.sm }}
            >
              <IconNews size={40} />
            </ThemeIcon>
            <Title
              order={3}
              className="text-2xl font-semibold mb-2"
              sx={{ color: theme.colors.red[8] }}
            >
              {error}
            </Title>
            <Button
              variant="outline"
              color="red"
              onClick={() => navigate("/news")}
              mt="md"
            >
              {t("newsdetail.actions.backToNews")}
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  if (!newsItem) {
    return null;
  }

  return (
    <div className="bg-gray-50">
      <Container size={1400} className="pt-8">
        <Breadcrumbs mb="lg" separator="→">
          <Anchor href="/" color="blue">
            {t("newsdetail.breadcrumbs.home")}
          </Anchor>
          <Anchor href="/news" color="blue">
            {t("newsdetail.breadcrumbs.news")}
          </Anchor>
          <Text color="dimmed" truncate>
            {getLocalizedContent(newsItem.title) ||
              t("newsdetail.breadcrumbs.details")}
          </Text>
        </Breadcrumbs>
      </Container>

      <Container size={1400} className="py-8">
        <Button
          leftIcon={<IconArrowLeft size={16} />}
          variant="subtle"
          color="blue"
          onClick={() => navigate(-1)}
          mb="xl"
        >
          {t("newsdetail.actions.back")}
        </Button>

        <Grid gutter={40}>
          <Grid.Col span={12} lg={8}>
            <article>
              {newsItem.image_path && (
                <Box 
                  className={classes.featuredImage}
                  onClick={() => {
                    setSelectedImage(newsItem.image_path || null);
                    open();
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <Image
                    src={`${BASE_IMAGE_URL}${newsItem.image_path}`}
                    alt={
                      getLocalizedContent(newsItem.title) ||
                      t("newsdetail.imageAlt")
                    }
                    height={620}
                    fit="fill"
                    withPlaceholder
                  />
                  <Text
                    size="xs"
                    color="dimmed"
                    align="right"
                    mt="xs"
                    sx={{ fontStyle: "italic" }}
                  >
                    {t("newsdetail.imageCredit")}:{" "}
                    {newsItem.image_path.split("/").pop()}
                  </Text>
                </Box>
              )}

              {newsItem.multiple_image_path && newsItem.multiple_image_path.length > 0 && (
                <Box className={classes.multipleImagesContainer}>
                  <Title order={3} mb="md">
                    {t("newsdetail.moreImages")}
                  </Title>
                  <SimpleGrid
                    cols={3}
                    breakpoints={[
                      { maxWidth: 'md', cols: 2 },
                      { maxWidth: 'sm', cols: 1 },
                    ]}
                  >
                    {newsItem.multiple_image_path.map((image, index) => (
                      <Box 
                        key={index} 
                        className={classes.multipleImageItem}
                        onClick={() => {
                          setSelectedImage(image);
                          open();
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <Image
                          src={`${BASE_IMAGE_URL}${image}`}
                          alt={`${getLocalizedContent(newsItem.title)} - ${t("newsdetail.image")} ${index + 1}`}
                          height={200}
                          fit="fill"
                          withPlaceholder
                        />
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              )}

              <Badge
                color="blue"
                size="lg"
                radius="sm"
                variant="filled"
                leftSection={<IconTags size={14} />}
                sx={{
                  backgroundColor: theme.colors.blue[7],
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontWeight: 700,
                  marginBottom: theme.spacing.md,
                }}
              >
                {getLocalizedContent(newsItem.category.name) ||
                  t("newsdetail.category.default")}
              </Badge>

              <Title order={1} className={classes.title}>
                {getLocalizedContent(newsItem.title) ||
                  t("newsdetail.title.default")}
              </Title>

              <Group position="apart" mb="xl">
                <Group spacing="md">
                  <Avatar
                    src={
                      newsItem.author?.avatar
                        ? `${BASE_IMAGE_URL}${newsItem.author.avatar}`
                        : null
                    }
                    alt={newsItem.author?.name}
                    radius="xl"
                    size="md"
                    color="blue"
                  >
                    {newsItem.author?.name?.charAt(0) || "A"}
                  </Avatar>
                  <Box>
                    <Text weight={600}>
                      {newsItem.author?.name ||
                        t("newsdetail.author.anonymous")}
                    </Text>
                    <Group spacing={8} mt={4}>
                      <Text size="sm" color="dimmed">
                        <IconCalendar size={14} style={{ marginRight: 4 }} />
                        {formatDate(newsItem.created_at)}
                      </Text>
                      <Text size="sm" color="dimmed">
                        <IconEye size={14} style={{ marginRight: 4 }} />
                        {newsItem.view_count?.toLocaleString() || "0"}{" "}
                        {t("newsdetail.views")}
                      </Text>
                    </Group>
                  </Box>
                </Group>

                <Group spacing="xs">
                  <FacebookShareButton
                    url={currentUrl}
                    quote={getLocalizedContent(newsItem.title)}
                  >
                    <Button
                      variant="default"
                      size="xs"
                      leftIcon={<IconShare size={14} />}
                    >
                      {t("newsdetail.share.facebook")}
                    </Button>
                  </FacebookShareButton>
                  <TwitterShareButton
                    url={currentUrl}
                    title={getLocalizedContent(newsItem.title)}
                  >
                    <Button
                      variant="default"
                      size="xs"
                      leftIcon={<IconShare size={14} />}
                    >
                      {t("newsdetail.share.twitter")}
                    </Button>
                  </TwitterShareButton>
                </Group>
              </Group>

              <Box
                className={classes.content}
                dangerouslySetInnerHTML={{
                  __html:
                    getLocalizedContent(newsItem.content) ||
                    newsItem.excerpt ||
                    t("newsdetail.content.unavailable"),
                }}
              />

              {newsItem.tags && newsItem.tags.length > 0 && (
                <Box mt="xl">
                  <Group spacing="xs">
                    <IconTags size={18} color={theme.colors.gray[6]} />
                    {newsItem.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" radius="sm">
                        {tag}
                      </Badge>
                    ))}
                  </Group>
                </Box>
              )}

              <Divider my="xl" />

              <Box mt="xl">
                <Title order={3} mb="md">
                  {t("newsdetail.comments.title")} ({comments.length})
                </Title>

                {currentUser ? (
                  <Paper
                    p="lg"
                    radius="md"
                    withBorder
                    mb="xl"
                    className={classes.commentInput}
                  >
                    <Textarea
                      placeholder={t("newsdetail.comments.placeholder")}
                      value={commentText}
                      onChange={(e) => setCommentText(e.currentTarget.value)}
                      minRows={3}
                      maxRows={6}
                      mb="sm"
                    />
                    <Group position="right">
                      <Button
                        leftIcon={<IconSend size={16} />}
                        onClick={handleCommentSubmit}
                        loading={commentLoading}
                        disabled={!commentText.trim()}
                      >
                        {t("newsdetail.comments.post")}
                      </Button>
                    </Group>
                  </Paper>
                ) : (
                  <Paper p="lg" radius="md" withBorder mb="xl">
                    <Text align="center" color="dimmed">
                      {t("newsdetail.comments.loginPrompt")}
                    </Text>
                  </Paper>
                )}

                {commentsLoading ? (
                  <Center py="xl">
                    <Loader size="sm" />
                  </Center>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <Paper
                      key={comment.id || comment.timestamp}
                      withBorder
                      p="lg"
                      radius="md"
                      mb="md"
                      className={classes.commentBox}
                    >
                      <Group position="apart" mb="xs">
                        <Group spacing="xs">
                          <Avatar
                            radius="xl"
                            size="md"
                            color="blue"
                            src={
                              comment.user?.avatar
                                ? `${BASE_IMAGE_URL}${comment.user.avatar}`
                                : null
                            }
                          >
                            {comment.username?.charAt(0) || "U"}
                          </Avatar>
                          <Box>
                            <Text weight={600}>{comment.username}</Text>
                            <Text size="sm" color="dimmed">
                              {formatTimeAgo(
                                comment.timestamp || comment.created_at || ""
                              )}
                              {comment.timestamp !== comment.created_at &&
                                ` • ${t("newsdetail.comments.edited")}`}
                            </Text>
                          </Box>
                        </Group>
                        {currentUser &&
                          (currentUser.id === comment.user_id ||
                            currentUser.roleId === 3) && (
                            <Group
                              spacing={4}
                              className={classes.commentActions}
                            >
                              <ActionIcon
                                color="blue"
                                onClick={() => handleEditComment(comment)}
                              >
                                <IconEdit size={16} />
                              </ActionIcon>
                              <ActionIcon
                                color="red"
                                onClick={() =>
                                  comment.id && handleDeleteComment(comment.id)
                                }
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Group>
                          )}
                      </Group>

                      {editingCommentId === comment.id ? (
                        <Box mt="sm">
                          <Textarea
                            value={editCommentText}
                            onChange={(e) =>
                              setEditCommentText(e.currentTarget.value)
                            }
                            minRows={2}
                            mb="sm"
                          />
                          <Group position="right">
                            <Button
                              variant="default"
                              size="xs"
                              onClick={() => setEditingCommentId(null)}
                            >
                              {t("newsdetail.comments.cancel")}
                            </Button>
                            <Button
                              size="xs"
                              onClick={handleUpdateComment}
                              loading={commentLoading}
                            >
                              {t("newsdetail.comments.update")}
                            </Button>
                          </Group>
                        </Box>
                      ) : (
                        <Text size="sm" mt="sm">
                          {comment.message}
                        </Text>
                      )}
                    </Paper>
                  ))
                ) : (
                  <Paper p="lg" radius="md" withBorder>
                    <Group position="center">
                      <IconMessageCircle
                        size={40}
                        color={theme.colors.gray[5]}
                      />
                      <Text color="dimmed">
                        {t("newsdetail.comments.empty")}
                      </Text>
                    </Group>
                  </Paper>
                )}
              </Box>

              <Box mt="xl" pt="xl">
                <Title
                  order={2}
                  mb="xl"
                  sx={{
                    position: "relative",
                    paddingBottom: theme.spacing.sm,
                    "&:after": {
                      content: '""',
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "60px",
                      height: "4px",
                      backgroundColor: theme.colors.blue[6],
                    },
                  }}
                >
                  {t("newsdetail.relatedNews")}
                </Title>

                <Grid gutter="xl">
                  {relatedNews.map((news) => (
                    <Grid.Col key={news.id} span={12} sm={6} md={4}>
                      <Card
                        withBorder
                        radius="md"
                        className={classes.relatedNewsCard}
                        onClick={() => navigate(`/news/${news.id}`)}
                      >
                        <Card.Section>
                          <Image
                            src={
                              news.image_path
                                ? `${BASE_IMAGE_URL}${news.image_path}`
                                : "/news-placeholder.jpg"
                            }
                            alt={
                              getLocalizedContent(news.title) ||
                              t("newsdetail.imageAlt")
                            }
                            height={220}
                            fit="fill"
                          />
                        </Card.Section>
                        <Box mt="md">
                          <Badge color="blue" variant="light" mb="sm">
                            {getLocalizedContent(news.category.name)}
                          </Badge>
                          <Title order={3} size="h5" weight={600} lineClamp={2}>
                            {getLocalizedContent(news.title) ||
                              t("newsdetail.title.default")}
                          </Title>
                          <Group spacing="xs" mt="sm">
                            <Text size="xs" color="dimmed">
                              {formatTimeAgo(news.created_at)}
                            </Text>
                          </Group>
                        </Box>
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              </Box>
            </article>
          </Grid.Col>

          <Grid.Col span={12} lg={4}>
            <Paper
              withBorder
              p="lg"
              radius="md"
              mb="xl"
              className={classes.sidebarCard}
            >
              <Title order={3} mb="md">
                {t("newsdetail.author.about")}
              </Title>
              <Group spacing="md" noWrap align="flex-start">
                <Avatar
                  src={
                    newsItem.author?.avatar
                      ? `${BASE_IMAGE_URL}${newsItem.author.avatar}`
                      : null
                  }
                  alt={newsItem.author?.name}
                  radius="xl"
                  size="lg"
                  color="blue"
                >
                  {newsItem.author?.name?.charAt(0) || "A"}
                </Avatar>
                <Box>
                  <Text weight={600} size="lg">
                    {newsItem.author?.name || t("newsdetail.author.anonymous")}
                  </Text>
                  <Text size="sm" color="dimmed" mb="sm">
                    {newsItem.author?.email || ""}
                  </Text>
                  <Text size="sm">{t("newsdetail.author.bio")}</Text>
                </Box>
              </Group>
            </Paper>

            <Paper
              withBorder
              p="lg"
              radius="md"
              sx={{
                background: `linear-gradient(135deg, ${theme.colors.blue[7]} 0%, ${theme.colors.blue[5]} 100%)`,
                color: theme.white,
              }}
              className={classes.sidebarCard}
            >
              <Title order={3} mb="sm" color={theme.white}>
                {t("newsdetail.newsletter.title")}
              </Title>
              <Text size="sm" mb="md" color={theme.colors.blue[1]}>
                {t("newsdetail.newsletter.description")}
              </Text>
              <Box>
                <TextInput
                  type="email"
                  placeholder={t("newsdetail.newsletter.placeholder")}
                  mb="sm"
                  styles={{
                    input: {
                      backgroundColor: theme.white,
                    },
                  }}
                />
                <Button
                  fullWidth
                  color="white"
                  variant="filled"
                  sx={{
                    color: theme.colors.blue[7],
                    fontWeight: 600,
                  }}
                >
                  {t("newsdetail.newsletter.button")}
                </Button>
              </Box>
              <Text size="xs" mt="sm" color={theme.colors.blue[2]}>
                {t("newsdetail.newsletter.privacy")}
              </Text>
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>

      <Modal
        opened={opened}
        onClose={close}
        size="xl"
        centered
        padding={0}
        withCloseButton={false}
      >
        {selectedImage && (
          <Image
            src={`${BASE_IMAGE_URL}${selectedImage}`}
            alt={getLocalizedContent(newsItem.title) || t("newsdetail.imageAlt")}
            fit="contain"
            className={classes.modalImage}
          />
        )}
      </Modal>
    </div>
  );
};

export default DetailedNews;