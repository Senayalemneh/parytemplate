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
    color: "#112f77", // Navy blue
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
      color: "#112f77", // Navy blue
    },
    "& h3": {
      fontSize: "1.5rem",
      fontWeight: 600,
      margin: `${theme.spacing.xl}px 0 ${theme.spacing.md}px 0`,
      color: "#112f77", // Navy blue
    },
    "& blockquote": {
      borderLeft: `4px solid #0275b2`, // Ocean blue
      paddingLeft: theme.spacing.md,
      fontStyle: "italic",
      color: theme.colors.gray[7],
      margin: `${theme.spacing.xl}px 0`,
      backgroundColor: "#f9db1210", // Yellow with transparency
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
    borderLeft: `3px solid #0275b2`, // Ocean blue
    paddingLeft: theme.spacing.md,
    transition: "all 0.2s ease",
    "&:hover": {
      borderLeftColor: "#046d74", // Teal
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
  category_id?: number;
  category?: {
    id: number;
    name: {
      am: string;
      en: string;
    };
  };
  author_id?: string;
  author?: {
    id: number;
    name: string;
    avatar?: string;
  };
  is_published: number | boolean;
  created_at: string;
  updated_at: string;
  view_count?: number;
  tags?: string[];
  messages?: Comment[];
  woreda_id?: number | null;
  subcity_id?: number | null;
  published_at?: string | null;
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

  // Color variables for consistency
  const colors = {
    navyBlue: "#112f77",
    oceanBlue: "#0275b2",
    teal: "#046d74",
    yellow: "#f9db12",
    white: "#ffffff",
  };

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
    setCurrentUrl(window.location.href);

    const user = localStorage.getItem("currentUser");
    if (user) {
      try {
        setCurrentUser(JSON.parse(user));
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
      }
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

        const detailedResponse = await getNewsById(id);
        console.log("Detailed news response:", detailedResponse); // Debug log
        
        // Check if response has data or is the data itself
        const detailedData = detailedResponse?.data || detailedResponse;
        
        if (!detailedData) {
          setError(t("newsdetail.error.notFound"));
          return;
        }

        // Parse the response data
        const parsedItem = {
          id: detailedData.id,
          title: typeof detailedData.title === 'string' 
            ? JSON.parse(detailedData.title) 
            : (detailedData.title || { am: '', en: '' }),
          slug: detailedData.slug || '',
          content: typeof detailedData.content === 'string'
            ? JSON.parse(detailedData.content)
            : (detailedData.content || { am: '', en: '' }),
          excerpt: detailedData.excerpt || '',
          image_path: detailedData.image_path || null,
          multiple_image_path: detailedData.multiple_image_path 
            ? (typeof detailedData.multiple_image_path === 'string'
              ? JSON.parse(detailedData.multiple_image_path)
              : detailedData.multiple_image_path)
            : [],
          category_id: detailedData.category_id,
          category: detailedData.category || null,
          author_id: detailedData.author_id,
          author: detailedData.author || null,
          is_published: detailedData.is_published || false,
          created_at: detailedData.created_at,
          updated_at: detailedData.updated_at,
          view_count: detailedData.view_count || 0,
          tags: detailedData.tags || [],
          messages: detailedData.messages || [],
          woreda_id: detailedData.woreda_id,
          subcity_id: detailedData.subcity_id,
          published_at: detailedData.published_at,
        };

        setNewsItem(parsedItem);

        // Fetch related news (all news except current)
        try {
          const allNewsResponse = await getAllNews();
          const allNewsData = allNewsResponse?.data || [];
          
          const relatedNewsItems = allNewsData
            .filter((item: any) => item.id !== parseInt(id))
            .slice(0, 6)
            .map((item: any) => ({
              id: item.id,
              title: typeof item.title === 'string' ? JSON.parse(item.title) : item.title,
              slug: item.slug || '',
              content: typeof item.content === 'string' ? JSON.parse(item.content) : item.content,
              excerpt: item.excerpt || '',
              image_path: item.image_path || null,
              category: item.category || null,
              created_at: item.created_at,
              view_count: item.view_count || 0,
            }));
          
          setRelatedNews(relatedNewsItems);
        } catch (error) {
          console.error("Failed to fetch related news:", error);
          setRelatedNews([]);
        }

        // Fetch comments
        await fetchComments();
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
      const sortedComments = (response?.data || []).sort(
        (a: Comment, b: Comment) =>
          new Date(b.timestamp || b.created_at || '').getTime() -
          new Date(a.timestamp || a.created_at || '').getTime()
      );
      setComments(sortedComments);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !id) return;

    try {
      setCommentLoading(true);
      const payload = {
        username: currentUser?.name || "Anonymous",
        email: currentUser?.email || "no-email@example.com",
        message: commentText,
        user_id: currentUser?.id || null,
        timestamp: new Date().toISOString(),
      };

      await createNewsComment(parseInt(id as string), payload);
      await fetchComments(); // Refresh comments
      setCommentText("");
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

  const getLocalizedContent = (content: { am: string; en: string } | string) => {
    if (typeof content === 'string') return content;
    if (!content) return '';
    return i18n.language === "am" ? content.am : content.en;
  };

  const getCategoryName = () => {
    if (newsItem?.category?.name) {
      return getLocalizedContent(newsItem.category.name);
    }
    return t("newsdetail.category.default");
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
            background: `linear-gradient(0deg, rgba(2, 117, 178, 0.1), rgba(17, 47, 119, 0.1))`,
            borderColor: "#0275b2",
          }}
        >
          <Box className="text-center">
            <ThemeIcon
              size={80}
              radius={80}
              variant="gradient"
              gradient={{ from: "#0275b2", to: "#046d74", deg: 45 }}
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
              {error}
            </Title>
            <Button
              variant="outline"
              color="blue"
              onClick={() => navigate("/news")}
              mt="md"
              sx={{ borderColor: "#0275b2", color: "#0275b2" }}
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
          onClick={() => navigate(-1)}
          mb="xl"
          sx={{ 
            color: "#0275b2",
            "&:hover": {
              backgroundColor: "#0275b210",
            }
          }}
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
                    {t("newsdetail.imageCredit")}
                  </Text>
                </Box>
              )}

              {newsItem.multiple_image_path && newsItem.multiple_image_path.length > 0 && (
                <Box className={classes.multipleImagesContainer}>
                  <Title order={3} mb="md" sx={{ color: "#112f77" }}>
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
                size="lg"
                radius="sm"
                variant="filled"
                leftSection={<IconTags size={14} />}
                sx={{
                  background: "linear-gradient(90deg, #0275b2, #046d74)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontWeight: 700,
                  marginBottom: theme.spacing.md,
                }}
              >
                {getCategoryName()}
              </Badge>

              <Title order={1} className={classes.title}>
                {getLocalizedContent(newsItem.title) ||
                  t("newsdetail.title.default")}
              </Title>

              <Group position="apart" mb="xl">
                <Group spacing="md">
                  <Avatar
                    radius="xl"
                    size="md"
                    sx={{ 
                      backgroundColor: "#0275b2",
                      color: colors.white
                    }}
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
                      sx={{ borderColor: "#0275b2", color: "#0275b2" }}
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
                      sx={{ borderColor: "#046d74", color: "#046d74" }}
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
                    <IconTags size={18} color="#0275b2" />
                    {newsItem.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        radius="sm"
                        sx={{ borderColor: "#0275b2", color: "#0275b2" }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </Group>
                </Box>
              )}

              <Divider my="xl" />

              <Box mt="xl">
                <Title order={3} mb="md" sx={{ color: "#112f77" }}>
                  {t("newsdetail.comments.title")} ({comments.length})
                </Title>

                {currentUser ? (
                  <Paper
                    p="lg"
                    radius="md"
                    withBorder
                    mb="xl"
                    className={classes.commentInput}
                    sx={{ borderColor: "#0275b2" }}
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
                        sx={{
                          background: "linear-gradient(90deg, #0275b2, #046d74)",
                          "&:hover": {
                            opacity: 0.9,
                          },
                        }}
                      >
                        {t("newsdetail.comments.post")}
                      </Button>
                    </Group>
                  </Paper>
                ) : (
                  <Paper 
                    p="lg" 
                    radius="md" 
                    withBorder 
                    mb="xl"
                    sx={{ borderColor: "#f9db12" }}
                  >
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
                            sx={{ 
                              backgroundColor: "#0275b2",
                              color: colors.white
                            }}
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
                                sx={{ color: "#0275b2" }}
                                onClick={() => handleEditComment(comment)}
                              >
                                <IconEdit size={16} />
                              </ActionIcon>
                              <ActionIcon
                                sx={{ color: "#e53e3e" }}
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
                              sx={{ borderColor: "#0275b2", color: "#0275b2" }}
                            >
                              {t("newsdetail.comments.cancel")}
                            </Button>
                            <Button
                              size="xs"
                              onClick={handleUpdateComment}
                              loading={commentLoading}
                              sx={{
                                background: "linear-gradient(90deg, #0275b2, #046d74)",
                                "&:hover": {
                                  opacity: 0.9,
                                },
                              }}
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
                  <Paper p="lg" radius="md" withBorder sx={{ borderColor: "#0275b2" }}>
                    <Group position="center">
                      <IconMessageCircle
                        size={40}
                        color="#0275b2"
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
                    color: "#112f77",
                    "&:after": {
                      content: '""',
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "60px",
                      height: "4px",
                      backgroundColor: "#0275b2",
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
                        sx={{ borderColor: "#0275b2" }}
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
                          <Badge 
                            variant="light" 
                            mb="sm"
                            sx={{ 
                              backgroundColor: "#0275b215",
                              color: "#0275b2"
                            }}
                          >
                            {getLocalizedContent(news.category?.name || { am: '', en: '' })}
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
              sx={{ borderColor: "#0275b2" }}
            >
              <Title order={3} mb="md" sx={{ color: "#112f77" }}>
                {t("newsdetail.author.about")}
              </Title>
              <Group spacing="md" noWrap align="flex-start">
                <Avatar
                  sx={{ 
                    backgroundColor: "#0275b2",
                    color: colors.white
                  }}
                  radius="xl"
                  size="lg"
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
                background: `linear-gradient(135deg, ${colors.navyBlue} 0%, ${colors.oceanBlue} 100%)`,
                color: colors.white,
              }}
              className={classes.sidebarCard}
            >
              <Title order={3} mb="sm" color={colors.white}>
                {t("newsdetail.newsletter.title")}
              </Title>
              <Text size="sm" mb="md" sx={{ color: `${colors.white}CC` }}>
                {t("newsdetail.newsletter.description")}
              </Text>
              <Box>
                <TextInput
                  type="email"
                  placeholder={t("newsdetail.newsletter.placeholder")}
                  mb="sm"
                  styles={{
                    input: {
                      backgroundColor: colors.white,
                    },
                  }}
                />
                <Button
                  fullWidth
                  sx={{
                    backgroundColor: colors.yellow,
                    color: colors.navyBlue,
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: `${colors.yellow}DD`,
                    },
                  }}
                >
                  {t("newsdetail.newsletter.button")}
                </Button>
              </Box>
              <Text size="xs" mt="sm" sx={{ color: `${colors.white}AA` }}>
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