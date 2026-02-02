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
  Center,
  Box,
  Paper,
  useMantineTheme,
  Breadcrumbs,
  Anchor,
  Avatar,
  createStyles,
  Textarea,
  ActionIcon,
  SimpleGrid,
  Modal,
  Stack,
  Progress,
  CopyButton,
  Tooltip,
  Divider,
  Flex,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCalendar,
  IconClock,
  IconNews,
  IconBookmark,
  IconEye,
  IconMessageCircle,
  IconTags,
  IconSend,
  IconTrash,
  IconEdit,
  IconHeart,
  IconHeartFilled,
  IconCopy,
  IconChevronRight,
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconBrandWhatsapp,
  IconBookmarkFilled,
  IconPrinter,
  IconCalendarEvent,
  IconCheck,
  IconShare,
  IconArrowUp,
  IconExternalLink,
  IconUser,
  IconDotsVertical,
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
import { FacebookShareButton, TwitterShareButton, LinkedinShareButton, WhatsappShareButton } from "react-share";
import { convertToEthiopian, formatEthiopianDate, getCurrentEthiopianDate } from "../../utils/ethiopianCalendar";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { enUS as enLocale } from "date-fns/locale";

const useStyles = createStyles((theme) => ({
  heroSection: {
    background: `linear-gradient(145deg, 
      ${theme.colors.blue[8]} 0%, 
      ${theme.colors.indigo[7]} 30%, 
      ${theme.colors.violet[6]} 70%, 
      ${theme.colors.grape[5]} 100%)`,
    padding: "80px 0 60px",
    position: "relative",
    overflow: "hidden",
    '&::before': {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
    },
  },

  title: {
    fontSize: "3.5rem",
    lineHeight: 1.1,
    fontWeight: 900,
    marginBottom: theme.spacing.md,
    background: `linear-gradient(90deg, ${theme.white} 30%, ${theme.colors.cyan[3]} 100%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "0 4px 12px rgba(0,0,0,0.2)",
    fontFamily: '"Poppins", sans-serif',
    [theme.fn.smallerThan("lg")]: {
      fontSize: "2.8rem",
    },
    [theme.fn.smallerThan("md")]: {
      fontSize: "2.2rem",
    },
    [theme.fn.smallerThan("sm")]: {
      fontSize: "1.8rem",
    },
  },

  contentWrapper: {
    fontSize: "1.125rem",
    lineHeight: 1.8,
    color: theme.colors.gray[8],
    fontFamily: '"Inter", sans-serif',
    
    '& p': {
      marginBottom: theme.spacing.xl,
      fontSize: "1.125rem",
      position: 'relative',
      '&::first-letter': {
        fontSize: '3.2rem',
        fontWeight: 700,
        float: 'left',
        lineHeight: 1,
        marginRight: theme.spacing.xs,
        marginTop: '4px',
        color: theme.colors.blue[7],
        fontFamily: '"Poppins", sans-serif',
      },
    },
    
    '& h2': {
      fontSize: '2rem',
      fontWeight: 800,
      margin: '48px 0 24px',
      color: theme.colors.blue[9],
      position: 'relative',
      paddingBottom: '12px',
      fontFamily: '"Poppins", sans-serif',
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '60px',
        height: '4px',
        background: `linear-gradient(90deg, ${theme.colors.blue[5]}, ${theme.colors.cyan[5]})`,
        borderRadius: '2px',
      },
    },
    
    '& h3': {
      fontSize: '1.5rem',
      fontWeight: 700,
      margin: '36px 0 16px',
      color: theme.colors.indigo[9],
      fontFamily: '"Poppins", sans-serif',
    },
    
    '& blockquote': {
      borderLeft: `4px solid ${theme.colors.blue[5]}`,
      padding: '28px 36px',
      fontStyle: 'italic',
      color: theme.colors.gray[7],
      margin: '48px 0',
      background: 'linear-gradient(90deg, rgba(2, 117, 178, 0.05) 0%, rgba(17, 47, 119, 0.02) 100%)',
      borderRadius: theme.radius.lg,
      fontSize: '1.25rem',
      fontFamily: '"Merriweather", serif',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '"❝"',
        fontSize: '5rem',
        color: theme.colors.blue[2],
        position: 'absolute',
        top: '-20px',
        left: '10px',
        opacity: 0.3,
      },
    },
    
    '& img': {
      maxWidth: '100%',
      height: 'auto',
      borderRadius: theme.radius.xl,
      margin: '32px 0',
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      border: '3px solid white',
      transition: 'all 0.3s ease',
      cursor: 'zoom-in',
      '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
      },
    },
    
    '& ul, & ol': {
      margin: '28px 0',
      paddingLeft: '32px',
      '& li': {
        marginBottom: '12px',
        fontSize: '1.125rem',
        position: 'relative',
        paddingLeft: '12px',
        '&::before': {
          content: '"▸"',
          color: theme.colors.blue[5],
          fontWeight: 'bold',
          position: 'absolute',
          left: '-12px',
        },
      },
    },
    
    '& a': {
      color: theme.colors.blue[6],
      textDecoration: 'none',
      fontWeight: 600,
      position: 'relative',
      paddingBottom: '2px',
      transition: 'all 0.2s ease',
      borderBottom: `2px solid ${theme.colors.blue[2]}`,
      '&:hover': {
        color: theme.colors.blue[8],
        borderBottomColor: theme.colors.blue[6],
      },
    },
  },

  featuredImage: {
    borderRadius: theme.radius.xl,
    overflow: "hidden",
    boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
    marginBottom: theme.spacing.xl,
    position: "relative",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    border: `4px solid ${theme.white}`,
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: '0 35px 70px rgba(0,0,0,0.25)',
      '& .imageHoverOverlay': {
        opacity: 1,
      },
    },
  },

  imageHoverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },

  floatingActions: {
    position: "fixed",
    right: "32px",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 100,
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '20px 16px',
    borderRadius: '24px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    [theme.fn.smallerThan("lg")]: {
      right: "24px",
    },
    [theme.fn.smallerThan("md")]: {
      position: "fixed",
      bottom: "24px",
      top: "auto",
      left: "24px",
      right: "24px",
      flexDirection: "row",
      justifyContent: "space-around",
      transform: "none",
      padding: '16px',
    },
  },

  actionButton: {
    width: "52px",
    height: "52px",
    borderRadius: "16px",
    background: theme.white,
    color: theme.colors.blue[9],
    border: `1px solid ${theme.colors.gray[2]}`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(135deg, ${theme.colors.blue[6]}, ${theme.colors.cyan[5]})`,
      opacity: 0,
      transition: 'opacity 0.3s ease',
    },
    "&:hover": {
      transform: "translateY(-4px) scale(1.05)",
      boxShadow: '0 8px 24px rgba(2, 117, 178, 0.2)',
      color: theme.white,
      borderColor: theme.colors.blue[5],
      '&::before': {
        opacity: 1,
      },
      '& svg': {
        transform: 'scale(1.1)',
      },
    },
    '& svg': {
      position: 'relative',
      zIndex: 1,
      transition: 'transform 0.3s ease',
    },
  },

  authorCard: {
    background: `linear-gradient(135deg, ${theme.colors.blue[0]}, ${theme.colors.cyan[0]})`,
    border: `1px solid ${theme.colors.blue[2]}`,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    transition: "all 0.3s ease",
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(45deg, transparent 60%, rgba(2, 117, 178, 0.05))`,
    },
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: '0 20px 40px rgba(2, 117, 178, 0.1)',
      borderColor: theme.colors.blue[4],
    },
  },

  commentCard: {
    background: theme.white,
    border: `1px solid ${theme.colors.gray[2]}`,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    transition: "all 0.3s ease",
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '4px',
      height: '100%',
      background: `linear-gradient(to bottom, ${theme.colors.blue[5]}, ${theme.colors.cyan[5]})`,
    },
    "&:hover": {
      transform: "translateY(-2px)",
      borderColor: theme.colors.blue[3],
      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    },
  },

  relatedNewsCard: {
    height: "100%",
    background: theme.white,
    border: `1px solid ${theme.colors.gray[2]}`,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: `linear-gradient(90deg, ${theme.colors.blue[5]}, ${theme.colors.cyan[5]})`,
      transform: 'scaleX(0)',
      transformOrigin: 'left',
      transition: 'transform 0.3s ease',
    },
    "&:hover": {
      transform: "translateY(-8px)",
      borderColor: theme.colors.blue[3],
      boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
      '&::after': {
        transform: 'scaleX(1)',
      },
      '& .imageContainer img': {
        transform: 'scale(1.1)',
      },
    },
  },

  imageContainer: {
    overflow: 'hidden',
    '& img': {
      transition: 'transform 0.6s ease',
    },
  },

  readProgress: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    zIndex: 1000,
    borderRadius: 0,
    background: `linear-gradient(90deg, 
      ${theme.colors.blue[5]}, 
      ${theme.colors.cyan[5]}, 
      ${theme.colors.violet[5]})`,
    backgroundSize: '200% 100%',
    animation: 'progressAnimation 2s linear infinite',
    '@keyframes progressAnimation': {
      '0%': { backgroundPosition: '200% 0' },
      '100%': { backgroundPosition: '-200% 0' },
    },
  },

  calendarCard: {
    background: `linear-gradient(135deg, ${theme.white}, ${theme.colors.blue[0]})`,
    border: `1px solid ${theme.colors.blue[2]}`,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: -50,
      right: -50,
      width: '100px',
      height: '100px',
      background: `radial-gradient(circle, ${theme.colors.blue[1]} 0%, transparent 70%)`,
      opacity: 0.5,
    },
  },

  shareButton: {
    borderRadius: theme.radius.md,
    padding: "10px 20px",
    fontSize: theme.fontSizes.sm,
    fontWeight: 600,
    transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255,255,255,0.1)',
      transform: 'translateX(-100%)',
      transition: 'transform 0.3s ease',
    },
    "&:hover": {
      transform: "translateY(-3px)",
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      '&::before': {
        transform: 'translateX(0)',
      },
    },
  },

  tagBadge: {
    background: `linear-gradient(135deg, ${theme.colors.blue[6]}, ${theme.colors.cyan[5]})`,
    color: theme.white,
    fontWeight: 600,
    padding: '8px 16px',
    borderRadius: '20px',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(2, 117, 178, 0.3)',
    },
  },

  metaBadge: {
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)',
    color: theme.white,
    border: '1px solid rgba(255,255,255,0.2)',
    fontWeight: 600,
  },

  sectionTitle: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: theme.colors.blue[9],
    marginBottom: theme.spacing.lg,
    position: 'relative',
    display: 'inline-block',
    fontFamily: '"Poppins", sans-serif',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: '-8px',
      left: 0,
      width: '40px',
      height: '3px',
      background: `linear-gradient(90deg, ${theme.colors.blue[5]}, ${theme.colors.cyan[5]})`,
      borderRadius: '2px',
    },
  },

  detailSection: {
    background: `linear-gradient(135deg, ${theme.colors.gray[0]}, ${theme.white})`,
    border: `1px solid ${theme.colors.gray[2]}`,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },

  commentAuthorName: {
    fontWeight: 700,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.blue[9],
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '&::before': {
      content: '"👤"',
      fontSize: '0.9em',
    },
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
    bio?: string;
    role?: string;
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
  read_time?: string;
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
  likes?: number;
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageModalOpened, { open: openImageModal, close: closeImageModal }] = useDisclosure(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [readProgress, setReadProgress] = useState(0);
  const [showActions, setShowActions] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const BASE_IMAGE_URL = `${import.meta.env.VITE_FILE_API}`;

  const colors = {
    primary: theme.colors.blue[9],
    secondary: theme.colors.cyan[7],
    accent: theme.colors.yellow[5],
    background: theme.white,
    text: theme.colors.gray[9],
    muted: theme.colors.gray[6],
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
        const parsedUser = JSON.parse(user);
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
      }
    }

    const bookmarks = JSON.parse(localStorage.getItem("bookmarkedArticles") || "[]");
    if (id && bookmarks.includes(parseInt(id))) {
      setBookmarked(true);
    }

    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setReadProgress(scrolled);
      setShowScrollTop(winScroll > 300);
      
      if (winScroll > 300) {
        setShowActions(true);
      } else {
        setShowActions(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [id]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        if (!id) {
          setError(t("newsdetail.error.missingId"));
          return;
        }

        const detailedResponse = await getNewsById(id);
        const detailedData = detailedResponse?.data || detailedResponse;
        
        if (!detailedData) {
          setError(t("newsdetail.error.notFound"));
          return;
        }

        const parsedItem: NewsItem = {
          id: detailedData.id,
          title: (() => {
            try {
              if (typeof detailedData.title === 'string') {
                return JSON.parse(detailedData.title);
              }
              return detailedData.title || { am: '', en: '' };
            } catch (e) {
              return { am: detailedData.title || '', en: detailedData.title || '' };
            }
          })(),
          slug: detailedData.slug || '',
          content: (() => {
            try {
              if (typeof detailedData.content === 'string') {
                return JSON.parse(detailedData.content);
              }
              return detailedData.content || { am: '', en: '' };
            } catch (e) {
              return { am: detailedData.content || '', en: detailedData.content || '' };
            }
          })(),
          excerpt: detailedData.excerpt || '',
          image_path: detailedData.image_path || null,
          multiple_image_path: (() => {
            try {
              if (detailedData.multiple_image_path) {
                if (typeof detailedData.multiple_image_path === 'string') {
                  return JSON.parse(detailedData.multiple_image_path);
                }
                return detailedData.multiple_image_path;
              }
              return [];
            } catch (e) {
              return [];
            }
          })(),
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
          read_time: detailedData.read_time || "5 min",
        };

        setNewsItem(parsedItem);
        setLikes(Math.floor(Math.random() * 500) + 100);

        try {
          const allNewsResponse = await getAllNews();
          const allNewsData = allNewsResponse?.data || allNewsResponse || [];
          
          const relatedNewsItems = allNewsData
            .filter((item: any) => item.id !== parseInt(id))
            .slice(0, 3)
            .map((item: any) => {
              try {
                return {
                  id: item.id,
                  title: typeof item.title === 'string' ? JSON.parse(item.title) : (item.title || { am: '', en: '' }),
                  slug: item.slug || '',
                  content: typeof item.content === 'string' ? JSON.parse(item.content) : (item.content || { am: '', en: '' }),
                  excerpt: item.excerpt || '',
                  image_path: item.image_path || null,
                  category: item.category || null,
                  created_at: item.created_at,
                  view_count: item.view_count || 0,
                  read_time: item.read_time || "5 min",
                };
              } catch (e) {
                return {
                  id: item.id,
                  title: { am: item.title || '', en: item.title || '' },
                  slug: item.slug || '',
                  content: { am: item.content || '', en: item.content || '' },
                  excerpt: item.excerpt || '',
                  image_path: item.image_path || null,
                  category: item.category || null,
                  created_at: item.created_at,
                  view_count: item.view_count || 0,
                  read_time: item.read_time || "5 min",
                };
              }
            });
          
          setRelatedNews(relatedNewsItems);
        } catch (error) {
          console.error("Failed to fetch related news:", error);
          setRelatedNews([]);
        }

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
        username: currentUser?.name || "Anonymous User",
        email: currentUser?.email || "anonymous@example.com",
        message: commentText,
        user_id: currentUser?.id || null,
        timestamp: new Date().toISOString(),
        likes: 0,
      };

      await createNewsComment(parseInt(id as string), payload);
      await fetchComments();
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

  const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarkedArticles") || "[]");
    if (bookmarked) {
      const newBookmarks = bookmarks.filter((articleId: number) => articleId !== parseInt(id as string));
      localStorage.setItem("bookmarkedArticles", JSON.stringify(newBookmarks));
    } else {
      bookmarks.push(parseInt(id as string));
      localStorage.setItem("bookmarkedArticles", JSON.stringify(bookmarks));
    }
    setBookmarked(!bookmarked);
  };

  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    
    if (i18n.language === "am") {
      return formatEthiopianDate(convertToEthiopian(date), i18n.language);
    }
    
    return format(date, "MMMM do, yyyy", { locale: enLocale });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = parseISO(dateString);
    
    return formatDistanceToNow(date, { 
      addSuffix: true,
      locale: enLocale 
    });
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
      <Center className="h-screen">
        <Loader />
      </Center>
    );
  }

  if (error || !newsItem) {
    return (
      <Container size={1400} className="py-20">
        <Paper
          className={classes.detailSection}
          data-aos="fade-up"
        >
          <Box className="text-center">
            <ThemeIcon
              size={100}
              radius={100}
              variant="gradient"
              gradient={{ from: colors.primary, to: colors.secondary }}
              className="mx-auto mb-6"
            >
              <IconNews size={48} />
            </ThemeIcon>
            <Title
              order={2}
              className="mb-4"
              sx={{ color: colors.primary }}
            >
              {error || t("newsdetail.error.notFound")}
            </Title>
            <Text color={colors.muted} mb="xl">
              {t("newsdetail.error.description")}
            </Text>
            <Button
              variant="gradient"
              gradient={{ from: colors.primary, to: colors.secondary }}
              onClick={() => navigate("/news")}
              size="lg"
              radius="xl"
              leftIcon={<IconArrowUp size={20} />}
            >
              {t("newsdetail.actions.backToNews")}
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  const shareTitle = getLocalizedContent(newsItem.title);
  const shareUrl = currentUrl;

  return (
    <Box className="min-h-screen" sx={{ background: colors.background }}>
      {/* Reading Progress Bar */}
      <Progress
        value={readProgress}
        className={classes.readProgress}
        size={4}
      />

      {/* Hero Section */}
      <Box className={classes.heroSection}>
        <Container size={1400}>
          <Breadcrumbs
            separator={<IconChevronRight size={20} color="rgba(255,255,255,0.7)" />}
            mb="xl"
            sx={{
              '& .mantine-Anchor-root': {
                color: 'rgba(255,255,255,0.9) !important',
                fontWeight: 500,
                fontSize: theme.fontSizes.md,
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: `${theme.white} !important`,
                  transform: 'translateX(2px)',
                },
              },
            }}
          >
            <Anchor href="/" onClick={(e: React.MouseEvent) => { e.preventDefault(); navigate("/"); }}>
              {t("newsdetail.breadcrumbs.home")}
            </Anchor>
            <Anchor href="/news" onClick={(e: React.MouseEvent) => { e.preventDefault(); navigate("/news"); }}>
              {t("newsdetail.breadcrumbs.news")}
            </Anchor>
            <Text color="rgba(255,255,255,0.7)" truncate>
              {shareTitle}
            </Text>
          </Breadcrumbs>

          <Grid gutter={60} align="center">
            <Grid.Col span={12} lg={8}>
              <Badge
                size="xl"
                radius="xl"
                variant="filled"
                leftSection={<IconTags size={18} />}
                className={classes.metaBadge}
                mb="lg"
                data-aos="fade-up"
              >
                {getCategoryName()}
              </Badge>

              <Title order={1} className={classes.title} data-aos="fade-up" data-aos-delay="100">
                {shareTitle}
              </Title>

              <Group spacing="xl" mb="xl" data-aos="fade-up" data-aos-delay="200">
                <Group spacing="xs">
                  <ThemeIcon size={32} radius="md" variant="light" color="blue">
                    <IconCalendar size={18} />
                  </ThemeIcon>
                  <Box>
                    <Text size="sm" color="rgba(255,255,255,0.7)">
                      {t('newsdetail.published')}
                    </Text>
                    <Text color="white" weight={600}>
                      {formatDate(newsItem.created_at)}
                    </Text>
                  </Box>
                </Group>
                
                <Group spacing="xs">
                  <ThemeIcon size={32} radius="md" variant="light" color="red">
                    <IconEye size={18} />
                  </ThemeIcon>
                  <Box>
                    <Text size="sm" color="rgba(255,255,255,0.7)">
                      {t('newsdetail.views')}
                    </Text>
                    <Text color="white" weight={600}>
                      {(newsItem.view_count || 0).toLocaleString()}
                    </Text>
                  </Box>
                </Group>
              </Group>
            </Grid.Col>

            <Grid.Col span={12} lg={4}>
              <Paper className={classes.calendarCard} data-aos="fade-left">
                <Group mb="md">
                  <ThemeIcon 
                    size={40} 
                    radius="md" 
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'cyan' }}
                  >
                    <IconCalendarEvent size={22} />
                  </ThemeIcon>
                  <Box>
                    <Text weight={800} size="lg" color={colors.primary}>
                      {i18n.language === "am" ? "የኢትዮጵያ ካሌንዳር" : "Ethiopian Calendar"}
                    </Text>
                    <Text size="sm" color={colors.muted}>
                      {t('newsdetail.calendar.subtitle')}
                    </Text>
                  </Box>
                </Group>

                <Stack spacing="md">
                  <Box p="lg" sx={{ 
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                    borderRadius: theme.radius.lg,
                    color: theme.white,
                    textAlign: 'center'
                  }}>
                    <Text size="sm" weight={600} mb="xs">
                      {i18n.language === "am" ? "ዛሬ" : "Today"}
                    </Text>
                    <Text size="xl" weight={800}>
                      {formatEthiopianDate(getCurrentEthiopianDate(), i18n.language)}
                    </Text>
                  </Box>
                  
                  <Box p="lg" sx={{ 
                    background: theme.colors.gray[1],
                    borderRadius: theme.radius.lg,
                    textAlign: 'center'
                  }}>
                    <Text size="sm" weight={600} mb="xs" color={colors.primary}>
                      {i18n.language === "am" ? "የዜና ቀን" : "News Date"}
                    </Text>
                    <Text size="lg" weight={700} color={colors.text}>
                      {formatEthiopianDate(convertToEthiopian(new Date(newsItem.created_at)), i18n.language)}
                    </Text>
                  </Box>
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* Floating Actions */}
      <Box 
        className={classes.floatingActions} 
        style={{ 
          opacity: showActions ? 1 : 0,
          transform: showActions ? 'translateY(-50%)' : 'translateY(-50%) translateX(100px)',
          transition: "all 0.3s ease" 
        }}
      >
        <Tooltip label={t('newsdetail.actions.like')} position="left" withArrow>
          <ActionIcon className={classes.actionButton} onClick={handleLike}>
            {liked ? <IconHeartFilled size={22} /> : <IconHeart size={22} />}
            <Text 
              size="xs" 
              weight={900} 
              sx={{ 
                position: 'absolute',
                bottom: 2,
                right: 2,
                fontSize: '10px',
                color: liked ? theme.white : theme.colors.blue[9],
                zIndex: 2,
              }}
            >
              {likes > 999 ? `${(likes/1000).toFixed(1)}k` : likes}
            </Text>
          </ActionIcon>
        </Tooltip>
        
        <Tooltip label={bookmarked ? t('newsdetail.actions.removeBookmark') : t('newsdetail.actions.bookmark')} position="left" withArrow>
          <ActionIcon className={classes.actionButton} onClick={handleBookmark}>
            {bookmarked ? <IconBookmarkFilled size={22} /> : <IconBookmark size={22} />}
          </ActionIcon>
        </Tooltip>
        
        <Tooltip label={t('newsdetail.actions.share')} position="left" withArrow>
          <CopyButton value={currentUrl}>
            {({ copied, copy }) => (
              <ActionIcon className={classes.actionButton} onClick={copy}>
                {copied ? <IconCheck size={22} /> : <IconShare size={22} />}
              </ActionIcon>
            )}
          </CopyButton>
        </Tooltip>
        
        <Tooltip label={t('newsdetail.actions.print')} position="left" withArrow>
          <ActionIcon className={classes.actionButton} onClick={handlePrint}>
            <IconPrinter size={22} />
          </ActionIcon>
        </Tooltip>
        
        <Tooltip label={t('newsdetail.actions.scrollToTop')} position="left" withArrow>
          <ActionIcon 
            className={classes.actionButton} 
            onClick={scrollToTop}
            sx={{
              background: `linear-gradient(135deg, ${theme.colors.green[6]}, ${theme.colors.teal[6]})`,
              color: theme.white,
              '&::before': {
                background: `linear-gradient(135deg, ${theme.colors.teal[6]}, ${theme.colors.green[6]})`,
              },
            }}
          >
            <IconArrowUp size={22} />
          </ActionIcon>
        </Tooltip>
      </Box>

      {/* Main Content */}
      <Container size={1400} py={60}>
        <Grid gutter={60}>
          {/* Article Content */}
          <Grid.Col span={12} lg={8}>
            {/* Featured Image */}
            {newsItem.image_path && (
              <Box 
                className={classes.featuredImage}
                onClick={() => {
                  setSelectedImage(newsItem.image_path || null);
                  openImageModal();
                }}
                data-aos="fade-up"
                style={{ cursor: "zoom-in" }}
              >
                <Image
                  src={`${BASE_IMAGE_URL}${newsItem.image_path}`}
                  alt={shareTitle}
                  height={500}
                  fit="cover"
                  withPlaceholder
                />
                <Box className={classes.imageHoverOverlay}>
                  <Badge 
                    size="lg" 
                    variant="filled" 
                    color="blue"
                    leftSection={<IconExternalLink size={14} />}
                  >
                    Click to view full size
                  </Badge>
                </Box>
              </Box>
            )}

            {/* Multiple Images Gallery */}
            {newsItem.multiple_image_path && newsItem.multiple_image_path.length > 0 && (
              <Box mb="xl" data-aos="fade-up">
                <Title order={3} className={classes.sectionTitle}>
                  {i18n.language === "am" ? "ተጨማሪ ፎቶዎች" : t("newsdetail.gallery")}
                </Title>
                <SimpleGrid
                  cols={3}
                  breakpoints={[
                    { maxWidth: 'md', cols: 2 },
                    { maxWidth: 'sm', cols: 1 },
                  ]}
                  spacing="lg"
                >
                  {newsItem.multiple_image_path.map((image, index) => (
                    <Card
                      key={index}
                      p={0}
                      radius="lg"
                      withBorder
                      style={{ cursor: "zoom-in", overflow: "hidden" }}
                      onClick={() => {
                        setSelectedImage(image);
                        openImageModal();
                      }}
                      sx={{
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows.lg,
                        },
                      }}
                    >
                      <Image
                        src={`${BASE_IMAGE_URL}${image}`}
                        alt={`${shareTitle} - ${index + 1}`}
                        height={180}
                        fit="cover"
                      />
                    </Card>
                  ))}
                </SimpleGrid>
              </Box>
            )}

            {/* Article Body */}
            <Box data-aos="fade-up" data-aos-delay="200">
              <Box className={classes.contentWrapper}>
                {(() => {
                  const content = getLocalizedContent(newsItem.content);
                  if (content && content.trim()) {
                    return (
                      <div dangerouslySetInnerHTML={{ 
                        __html: content 
                      }} />
                    );
                  } else {
                    return (
                      <Box>
                        <Text size="lg" mb="md" color={colors.text}>
                          {newsItem.excerpt || t("newsdetail.content.unavailable")}
                        </Text>
                        {!newsItem.excerpt && (
                          <Text size="sm" color={colors.muted} style={{ fontStyle: 'italic' }}>
                            {t("newsdetail.content.noContentAvailable")}
                          </Text>
                        )}
                      </Box>
                    );
                  }
                })()}
              </Box>

              {/* Tags */}
              {newsItem.tags && newsItem.tags.length > 0 && (
                <Box mt="xl" data-aos="fade-up">
                  <Group spacing="xs" align="center" mb="sm">
                    <IconTags size={20} color={colors.primary} />
                    <Text weight={600} color={colors.primary}>
                      {t("newsdetail.tags.title")}:
                    </Text>
                  </Group>
                  <Group spacing="sm">
                    {newsItem.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        className={classes.tagBadge}
                        size="lg"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </Group>
                </Box>
              )}

              {/* Share Buttons */}
              <Paper mt="xl" p="lg" radius="lg" withBorder data-aos="fade-up">
                <Flex align="center" gap="sm" mb="md">
                  <ThemeIcon size={36} radius="md" variant="light" color="blue">
                    <IconShare size={20} />
                  </ThemeIcon>
                  <Box>
                    <Text weight={700} size="lg" color={colors.primary}>
                      {t("newsdetail.share.title")}
                    </Text>
                    <Text size="sm" color={colors.muted}>
                      {t("newsdetail.share.description")}
                    </Text>
                  </Box>
                </Flex>
                <Group spacing="sm">
                  <FacebookShareButton url={shareUrl}>
                    <Button
                      leftIcon={<IconBrandFacebook size={18} />}
                      className={classes.shareButton}
                      sx={{ background: "#1877F2", color: theme.white }}
                    >
                      Facebook
                    </Button>
                  </FacebookShareButton>
                  <TwitterShareButton url={shareUrl} title={shareTitle}>
                    <Button
                      leftIcon={<IconBrandTwitter size={18} />}
                      className={classes.shareButton}
                      sx={{ background: "#1DA1F2", color: theme.white }}
                    >
                      Twitter
                    </Button>
                  </TwitterShareButton>
                  <LinkedinShareButton url={shareUrl} title={shareTitle}>
                    <Button
                      leftIcon={<IconBrandLinkedin size={18} />}
                      className={classes.shareButton}
                      sx={{ background: "#0077B5", color: theme.white }}
                    >
                      LinkedIn
                    </Button>
                  </LinkedinShareButton>
                  <WhatsappShareButton url={shareUrl} title={shareTitle}>
                    <Button
                      leftIcon={<IconBrandWhatsapp size={18} />}
                      className={classes.shareButton}
                      sx={{ background: "#25D366", color: theme.white }}
                    >
                      WhatsApp
                    </Button>
                  </WhatsappShareButton>
                </Group>
              </Paper>
            </Box>

            {/* Article Details Section */}
            <Paper className={classes.detailSection} mt="xl" data-aos="fade-up">
              <Title order={3} className={classes.sectionTitle} mb="xl">
                Article Details
              </Title>
              <SimpleGrid cols={2} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
                <Box>
                  <Text weight={600} color={colors.muted} size="sm" mb="xs">
                    Article ID
                  </Text>
                  <Text weight={700} color={colors.primary}>
                    #{newsItem.id}
                  </Text>
                </Box>
                <Box>
                  <Text weight={600} color={colors.muted} size="sm" mb="xs">
                    Published Date
                  </Text>
                  <Text weight={700} color={colors.text}>
                    {formatDate(newsItem.created_at)}
                  </Text>
                </Box>
                <Box>
                  <Text weight={600} color={colors.muted} size="sm" mb="xs">
                    Last Updated
                  </Text>
                  <Text weight={700} color={colors.text}>
                    {formatDate(newsItem.updated_at)}
                  </Text>
                </Box>
                <Box>
                  <Text weight={600} color={colors.muted} size="sm" mb="xs">
                    Status
                  </Text>
                  <Badge 
                    color={newsItem.is_published ? "green" : "orange"}
                    variant="filled"
                    size="lg"
                  >
                    {newsItem.is_published ? "Published" : "Draft"}
                  </Badge>
                </Box>
                {newsItem.category && (
                  <Box>
                    <Text weight={600} color={colors.muted} size="sm" mb="xs">
                      Category
                    </Text>
                    <Badge 
                      color="blue"
                      variant="light"
                      size="lg"
                    >
                      {getCategoryName()}
                    </Badge>
                  </Box>
                )}
                <Box>
                  <Text weight={600} color={colors.muted} size="sm" mb="xs">
                    Total Views
                  </Text>
                  <Group spacing="xs">
                    <IconEye size={16} color={colors.primary} />
                    <Text weight={700} color={colors.text}>
                      {(newsItem.view_count || 0).toLocaleString()}
                    </Text>
                  </Group>
                </Box>
              </SimpleGrid>
            </Paper>

            {/* Author Card */}
            <Paper className={classes.authorCard} mt="xl" data-aos="fade-up">
              <Group spacing="lg" noWrap align="flex-start">
                <Avatar
                  size={90}
                  radius="lg"
                  src={newsItem.author?.avatar ? `${BASE_IMAGE_URL}${newsItem.author.avatar}` : undefined}
                  sx={{ 
                    border: `3px solid ${theme.colors.blue[3]}`,
                    boxShadow: '0 8px 24px rgba(2, 117, 178, 0.2)',
                  }}
                >
                  {newsItem.author?.name?.charAt(0) || "A"}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Group position="apart" align="flex-start" mb="xs">
                    <Box>
                      <Title order={4} mb={4} color={colors.primary}>
                        {newsItem.author?.name || t("newsdetail.author.anonymous")}
                      </Title>
                      {newsItem.author?.role && (
                        <Badge 
                          variant="gradient"
                          gradient={{ from: 'blue', to: 'cyan' }}
                          mb="sm"
                          size="lg"
                        >
                          {newsItem.author.role}
                        </Badge>
                      )}
                    </Box>
                    <ActionIcon variant="subtle" color="gray">
                      <IconDotsVertical size={20} />
                    </ActionIcon>
                  </Group>
                  <Text color={colors.muted} size="sm" lineClamp={3}>
                    {newsItem.author?.bio || t("newsdetail.author.bioPlaceholder")}
                  </Text>
                </Box>
              </Group>
            </Paper>
          </Grid.Col>

          {/* Sidebar */}
          <Grid.Col span={12} lg={4}>
            {/* Related News */}
            <Box mb="xl" data-aos="fade-left">
              <Title order={3} className={classes.sectionTitle}>
                {t("newsdetail.relatedNews")}
              </Title>
              <Stack spacing="md">
                {relatedNews.map((news, index) => (
                  <Card
                    key={news.id}
                    className={classes.relatedNewsCard}
                    onClick={() => navigate(`/news/${news.id}`)}
                    data-aos="fade-left"
                    data-aos-delay={index * 100}
                  >
                    <Card.Section className={classes.imageContainer}>
                      <Image
                        src={news.image_path ? `${BASE_IMAGE_URL}${news.image_path}` : "/news-placeholder.jpg"}
                        height={160}
                        alt={getLocalizedContent(news.title)}
                        fit="cover"
                      />
                    </Card.Section>
                    <Box p="md">
                      <Badge 
                        variant="light" 
                        color="blue" 
                        mb="sm"
                        size="sm"
                      >
                        {getLocalizedContent(news.category?.name || { am: '', en: '' })}
                      </Badge>
                      <Title order={4} size="h5" lineClamp={2} mb="xs" color={colors.primary}>
                        {getLocalizedContent(news.title)}
                      </Title>
                      <Group spacing="xs" mt="sm">
                        <IconCalendar size={12} color={colors.muted} />
                        <Text size="xs" color={colors.muted}>
                          {formatTimeAgo(news.created_at)}
                        </Text>
                        <IconEye size={12} color={colors.muted} />
                        <Text size="xs" color={colors.muted}>
                          {news.view_count?.toLocaleString()}
                        </Text>
                      </Group>
                    </Box>
                  </Card>
                ))}
              </Stack>
            </Box>

            {/* Comments Section */}
            <Box data-aos="fade-left" data-aos-delay="200">
              <Flex align="center" gap="sm" mb="md">
                <ThemeIcon size={40} radius="md" variant="light" color="blue">
                  <IconMessageCircle size={22} />
                </ThemeIcon>
                <Box>
                  <Title order={3} color={colors.primary}>
                    {t("newsdetail.comments.title")}
                  </Title>
                  <Text size="sm" color={colors.muted}>
                    {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                  </Text>
                </Box>
              </Flex>

              {currentUser ? (
                <Paper p="lg" radius="lg" withBorder mb="md">
                  <Textarea
                    placeholder={t("newsdetail.comments.placeholder")}
                    value={commentText}
                    onChange={(e) => setCommentText(e.currentTarget.value)}
                    minRows={4}
                    maxRows={8}
                    mb="sm"
                    sx={{
                      textarea: {
                        fontSize: theme.fontSizes.sm,
                        '&::placeholder': {
                          color: theme.colors.gray[5],
                        },
                      },
                    }}
                  />
                  <Group position="apart">
                    <Text size="xs" color={colors.muted}>
                      {t('newsdetail.comments.characters', { count: commentText.length })}
                    </Text>
                    <Button
                      leftIcon={<IconSend size={16} />}
                      onClick={handleCommentSubmit}
                      loading={commentLoading}
                      disabled={!commentText.trim()}
                      variant="gradient"
                      gradient={{ from: colors.primary, to: colors.secondary }}
                      radius="xl"
                    >
                      {t("newsdetail.comments.post")}
                    </Button>
                  </Group>
                </Paper>
              ) : (
                <Paper p="lg" radius="lg" withBorder mb="md" sx={{ 
                  borderColor: colors.accent,
                  background: `linear-gradient(135deg, ${theme.colors.yellow[0]}, ${theme.colors.orange[0]})`,
                }}>
                  <Group spacing="sm">
                    <ThemeIcon size={40} radius="md" variant="light" color="orange">
                      <IconUser size={22} />
                    </ThemeIcon>
                    <Box sx={{ flex: 1 }}>
                      <Text weight={600} color={theme.colors.gray[8]}>
                        {t("newsdetail.comments.loginPrompt")}
                      </Text>
                      <Text size="sm" color={theme.colors.gray[6]}>
                        Join the discussion by logging in
                      </Text>
                    </Box>
                  </Group>
                </Paper>
              )}

              {commentsLoading ? (
                <Center py="xl">
                  <Loader />
                </Center>
              ) : comments.length > 0 ? (
                <Stack spacing="md">
                  {comments.map((comment) => (
                    <Paper key={comment.id} className={classes.commentCard}>
                      <Group position="apart" mb="xs">
                        <Group spacing="xs">
                          <Avatar
                            size={42}
                            radius="xl"
                            sx={{ 
                              background: colors.primary,
                              color: theme.white,
                              fontWeight: 700,
                              border: `2px solid ${theme.colors.blue[2]}`,
                            }}
                          >
                            {comment.username?.charAt(0) || "U"}
                          </Avatar>
                          <Box>
                            <Text className={classes.commentAuthorName}>
                              {comment.username}
                            </Text>
                            <Text size="xs" color={colors.muted}>
                              {formatTimeAgo(comment.timestamp || comment.created_at || "")}
                            </Text>
                          </Box>
                        </Group>
                        {currentUser && (currentUser.id === comment.user_id || currentUser.roleId === 3) && (
                          <Group spacing={4}>
                            <ActionIcon
                              size="sm"
                              color={colors.primary}
                              variant="subtle"
                              onClick={() => handleEditComment(comment)}
                            >
                              <IconEdit size={14} />
                            </ActionIcon>
                            <ActionIcon
                              size="sm"
                              color="red"
                              variant="subtle"
                              onClick={() => comment.id && handleDeleteComment(comment.id)}
                            >
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Group>
                        )}
                      </Group>

                      {editingCommentId === comment.id ? (
                        <Box mt="sm">
                          <Textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.currentTarget.value)}
                            minRows={3}
                            mb="sm"
                            size="sm"
                          />
                          <Group position="right">
                            <Button
                              variant="subtle"
                              size="xs"
                              onClick={() => setEditingCommentId(null)}
                              color={colors.muted}
                            >
                              {t("newsdetail.comments.cancel")}
                            </Button>
                            <Button
                              size="xs"
                              onClick={handleUpdateComment}
                              loading={commentLoading}
                              variant="gradient"
                              gradient={{ from: colors.primary, to: colors.secondary }}
                            >
                              {t("newsdetail.comments.update")}
                            </Button>
                          </Group>
                        </Box>
                      ) : (
                        <Text size="sm" mt="sm" color={colors.text}>
                          {comment.message}
                        </Text>
                      )}
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Paper p="xl" radius="lg" withBorder sx={{ 
                  borderStyle: 'dashed', 
                  borderColor: colors.muted,
                  background: theme.colors.gray[0],
                }}>
                  <Stack align="center" spacing="sm">
                    <IconMessageCircle
                      size={48}
                      color={colors.muted}
                    />
                    <Box textAlign="center">
                      <Text weight={600} color={colors.muted} mb={4}>
                        {t("newsdetail.comments.empty")}
                      </Text>
                      <Text size="sm" color={colors.muted}>
                        {t("newsdetail.comments.beFirst")}
                      </Text>
                    </Box>
                  </Stack>
                </Paper>
              )}
            </Box>
          </Grid.Col>
        </Grid>
      </Container>

      {/* Image Modal */}
      <Modal
        opened={imageModalOpened}
        onClose={closeImageModal}
        size="xl"
        centered
        padding={0}
        withCloseButton
        styles={{
          content: {
            background: 'rgba(0,0,0,0.95)',
            borderRadius: theme.radius.md,
          },
          close: {
            color: theme.white,
            background: 'rgba(255,255,255,0.1)',
            '&:hover': {
              background: 'rgba(255,255,255,0.2)',
            },
          },
        }}
      >
        {selectedImage && (
          <Image
            src={`${BASE_IMAGE_URL}${selectedImage}`}
            alt={shareTitle}
            fit="contain"
            sx={{
              maxHeight: '80vh',
              width: '100%',
            }}
          />
        )}
      </Modal>
    </Box>
  );
};

export default DetailedNews;