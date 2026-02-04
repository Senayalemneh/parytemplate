import {
  TextInput,
  Textarea,
  Button,
  Switch,
  Group,
  Box,
  Title,
  Divider,
  Modal,
  ActionIcon,
  Badge,
  FileInput,
  Image,
  Text,
  Select,
  SimpleGrid,
  Loader as MantineLoader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  createNews,
  getNews,
  getNewsById,
  deleteNews,
  updateNews,
  uploadFile,
  getNewsCategories,
  getUsers,
} from "../../services/api/main";
import {
  IconPencil,
  IconTrash,
  IconPlus,
  IconCheck,
  IconX,
  IconUpload,
  IconPhoto,
  IconEye,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import i18n from "../../utils/i18n";

interface NewsItem {
  id: number;
  title: {
    am: string;
    en: string;
  };
  slug: string;
  excerpt: string;
  content: {
    am: string;
    en: string;
  };
  category_id: number;
  author_id: string;
  woreda_id: number | null;
  subcity_id: number | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  image_path: string;
  multiple_image_path: string[] | null;
  view_count?: number;
  category: {
    id: number;
    name: {
      am: string;
      en: string;
    };
    slug: string;
    created_at: string;
    updated_at: string;
  };
  author?: {
    id: number;
    name: string;
    email: string;
  };
}

interface SelectItem {
  value: string;
  label: string;
}

// Color variables for consistency
const colors = {
  navyBlue: "#112f77",
  oceanBlue: "#0275b2",
  teal: "#046d74",
  yellow: "#f9db12",
  white: "#ffffff",
  black: "#000000",
};

const CMS_FILES_BASE_URL = `${import.meta.env.VITE_FILE_API}`;

const formatImageUrl = (imgPath: string): string => {
  if (!imgPath) return "";
  if (imgPath.startsWith("http")) return imgPath;
  
  const cleanPath = imgPath.startsWith("/") ? imgPath : `/${imgPath}`;
  const baseUrl = CMS_FILES_BASE_URL.endsWith("/") 
    ? CMS_FILES_BASE_URL.slice(0, -1) 
    : CMS_FILES_BASE_URL;
  
  return `${baseUrl}${cleanPath}`;
};

const parseMultipleImages = (images: string | string[] | null): string[] => {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const NewsManagement = () => {
  const { t } = useTranslation();
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [multiplePreviewImages, setMultiplePreviewImages] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [categories, setCategories] = useState<SelectItem[]>([]);
  const [authors, setAuthors] = useState<SelectItem[]>([]);

  const form = useForm({
    initialValues: {
      titleAm: "",
      titleEn: "",
      content_am: "",
      content_en: "",
      excerpt: "",
      category_id: "",
      author_id: "",
      is_published: true,
      imageFile: null as File | null,
      image_path: "",
      multipleImageFiles: [] as File[],
      multiple_image_path: [] as string[],
    },
    validate: {
      titleAm: (value) =>
        value ? null : t("newsmanagementadmin.form.titleAm.error"),
      titleEn: (value) =>
        value ? null : t("newsmanagementadmin.form.titleEn.error"),
      content_am: (value) =>
        value ? null : t("newsmanagementadmin.form.contentAm.error"),
      content_en: (value) =>
        value ? null : t("newsmanagementadmin.form.contentEn.error"),
      excerpt: (value) =>
        value ? null : t("newsmanagementadmin.form.excerpt.error"),
      category_id: (value) =>
        value ? null : t("newsmanagementadmin.form.category.error"),
    },
  });

  const fetchCategories = async () => {
    try {
      const response = await getNewsCategories();
      if (response.data) {
        const categoryOptions = response.data.map((category: any) => {
          let label = `Category ${category.id}`;
          
          if (typeof category.name === "object" && category.name) {
            // Dynamic localization for category options
            const currentLang = i18n.language as 'am' | 'en';
            label = category.name[currentLang] || category.name.en || category.name.am || `Category ${category.id}`;
          } else if (typeof category.name === "string") {
            try {
              const parsedName = JSON.parse(category.name);
              const currentLang = i18n.language as 'am' | 'en';
              label = parsedName[currentLang] || parsedName.en || parsedName.am || category.name;
            } catch {
              label = category.name;
            }
          }
          
          return {
            value: category.id.toString(),
            label: label,
          };
        });
        setCategories(categoryOptions);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      showNotification(
        t("newsmanagementadmin.notifications.categoriesLoadFailed"),
        "error"
      );
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await getUsers();
      console.log("Authors API Response:", response);
      
      if (response && Array.isArray(response)) {
        const authorOptions = response.map((user: any) => {
          const userId = user.id?.toString() || user.uid || `user_${user.id}`;
          const userName = user.name || user.email || `User ${user.id}`;
          
          return {
            value: userId,
            label: userName,
            // Store additional author info for potential use
            email: user.email,
            role: user.role_id,
          };
        });
        setAuthors(authorOptions);
        console.log("Processed authors:", authorOptions);
      }
    } catch (error) {
      console.error("Failed to fetch authors:", error);
      showNotification(
        t("newsmanagementadmin.notifications.authorsLoadFailed"),
        "error"
      );
    }
  };

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await getNews();
      console.log("News API Response:", response);
      
      let normalizedData: NewsItem[] = [];
      
      if (response?.data && Array.isArray(response.data)) {
        normalizedData = response.data.map((item: any) => ({
          id: item.id,
          title: typeof item.title === 'string' ? JSON.parse(item.title) : (item.title || { am: '', en: '' }),
          slug: item.slug || '',
          excerpt: item.excerpt || '',
          content: typeof item.content === 'string' ? JSON.parse(item.content) : (item.content || { am: '', en: '' }),
          category_id: item.category_id || 0,
          author_id: item.author_id || '',
          woreda_id: item.woreda_id,
          subcity_id: item.subcity_id,
          is_published: item.is_published || false,
          published_at: item.published_at,
          created_at: item.created_at,
          updated_at: item.updated_at,
          image_path: item.image_path || '',
          multiple_image_path: parseMultipleImages(item.multiple_image_path),
          view_count: item.view_count || 0,
          category: item.category || {
            id: item.category_id || 0,
            name: { am: '', en: '' },
            slug: '',
            created_at: '',
            updated_at: ''
          },
          author: item.author
        }));
      }
      
      setNewsData(normalizedData);
      showNotification(
        t("newsmanagementadmin.notifications.loadSuccess"),
        "success"
      );

      await Promise.all([fetchCategories(), fetchAuthors()]);
    } catch (error) {
      console.error("Failed to fetch news:", error);
      showNotification(
        t("newsmanagementadmin.notifications.loadFailed"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Refresh categories when language changes for proper localization
  useEffect(() => {
    if (categories.length > 0) {
      fetchCategories();
    }
  }, [i18n.language]);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("newsmanagementadmin.notifications.successTitle")
          : t("newsmanagementadmin.notifications.errorTitle"),
      message,
      color: type === "success" ? colors.teal : "red",
      icon: type === "success" ? <IconCheck size={18} /> : <IconX size={18} />,
      withBorder: true,
    });
  };

  const resetAndCloseModal = () => {
    closeModal();
    setEditingId(null);
    setPreviewImage(null);
    setMultiplePreviewImages([]);
    form.reset();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      console.log("Form submission started with values:", values);

      if (editingId && (isNaN(editingId) || editingId <= 0)) {
        console.error("Invalid editing ID:", editingId);
        showNotification(t("newsmanagementadmin.errors.invalidId"), "error");
        return;
      }

      // Validate required fields
      if (!values.titleAm || !values.titleEn) {
        showNotification("Title in both languages is required", "error");
        return;
      }

      if (!values.content_am || !values.content_en) {
        showNotification("Content in both languages is required", "error");
        return;
      }

      let image_path = values.image_path;
      let multiple_image_path = values.multiple_image_path;

      // Handle main image upload
      if (values.imageFile) {
        setFileUploading(true);
        try {
          const uploadResponse = await uploadFile(values.imageFile, "news");
          image_path = uploadResponse.file.path;
          showNotification(
            t("newsmanagementadmin.notifications.uploadSuccess"),
            "success"
          );
        } catch (error) {
          console.error("File upload error:", error);
          showNotification(
            t("newsmanagementadmin.notifications.uploadFailed"),
            "error"
          );
          return;
        } finally {
          setFileUploading(false);
        }
      }

      // Handle multiple images upload
      if (values.multipleImageFiles.length > 0) {
        setFileUploading(true);
        try {
          const uploadPromises = values.multipleImageFiles.map(file =>
            uploadFile(file, "news/multiple")
          );
          const uploadResponses = await Promise.all(uploadPromises);
          multiple_image_path = uploadResponses.map(res => res.file.path);
          showNotification(
            t("newsmanagementadmin.notifications.multipleUploadSuccess"),
            "success"
          );
        } catch (error) {
          console.error("Multiple files upload error:", error);
          showNotification(
            t("newsmanagementadmin.notifications.multipleUploadFailed"),
            "error"
          );
          return;
        } finally {
          setFileUploading(false);
        }
      }

      // Create payload matching API structure - UPDATED FOR SCHEMA
      const payload = {
        title: JSON.stringify({
          am: values.titleAm,
          en: values.titleEn,
        }),
        content: JSON.stringify({
          am: values.content_am,
          en: values.content_en,
        }),
        excerpt: values.excerpt,
        category_id: Number(values.category_id),
        author_id: values.author_id || "system",
        is_published: values.is_published,
        image_path: image_path,
        multiple_image_path: multiple_image_path.length > 0 ? JSON.stringify(multiple_image_path) : null,
      };

      console.log("Submitting payload:", payload);

      let response;
      if (editingId) {
        console.log("Updating news with ID:", editingId);
        response = await updateNews(editingId, payload);
        console.log("Update response:", response);
        showNotification(
          t("newsmanagementadmin.notifications.updateSuccess"),
          "success"
        );
      } else {
        console.log("Creating new news");
        response = await createNews(payload);
        console.log("Create response:", response);
        showNotification(
          t("newsmanagementadmin.notifications.createSuccess"),
          "success"
        );
      }

      resetAndCloseModal();
      fetchNews();
    } catch (error: any) {
      console.error("Error saving news:", error);
      console.error("Error details:", error.response?.data);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          if (form.getInputProps(key)) {
            form.setFieldError(key, errors[key][0]);
          }
        });
      } else {
        showNotification(
          error.response?.data?.message || 
          t(`newsmanagementadmin.notifications.${editingId ? "updateFailed" : "createFailed"}`),
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    if (isNaN(id) || id <= 0) {
      console.error("Invalid ID provided:", id);
      showNotification(t("newsmanagementadmin.errors.invalidId"), "error");
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching news for edit with ID:", id);
      
      const response = await getNewsById(id);
      console.log("Edit API Response:", response);

      if (!response?.data) {
        console.error("No data received from API for ID:", id);
        showNotification(t("newsmanagementadmin.errors.notFound"), "error");
        return;
      }

      const item = response.data;
      console.log("Raw item data:", item);

      // Parse the item data with better error handling
      let title = { am: '', en: '' };
      let content = { am: '', en: '' };
      
      try {
        if (typeof item.title === 'string') {
          title = JSON.parse(item.title);
        } else if (item.title && typeof item.title === 'object') {
          title = item.title;
        }
      } catch (e) {
        console.error("Error parsing title:", e, item.title);
        title = { am: item.title || '', en: item.title || '' };
      }

      try {
        if (typeof item.content === 'string') {
          content = JSON.parse(item.content);
        } else if (item.content && typeof item.content === 'object') {
          content = item.content;
        }
      } catch (e) {
        console.error("Error parsing content:", e, item.content);
        content = { am: item.content || '', en: item.content || '' };
      }

      const multipleImages = parseMultipleImages(item.multiple_image_path);
      console.log("Parsed data:", { title, content, multipleImages });

      form.setValues({
        titleAm: title.am || '',
        titleEn: title.en || '',
        content_am: content.am || '',
        content_en: content.en || '',
        excerpt: item.excerpt || '',
        category_id: item.category_id?.toString() || '',
        author_id: item.author_id?.toString() || '',
        is_published: Boolean(item.is_published),
        image_path: item.image_path || '',
        imageFile: null,
        multiple_image_path: multipleImages,
        multipleImageFiles: [],
      });

      console.log("Form values set:", form.values);

      if (item.image_path) {
        setPreviewImage(formatImageUrl(item.image_path));
      }

      setMultiplePreviewImages(multipleImages.map(path => formatImageUrl(path)));

      setEditingId(item.id);
      openModal();
      
      console.log("Edit modal opened for ID:", item.id);
    } catch (error: any) {
      console.error("Error loading news for edit:", error);
      console.error("Error response:", error.response);
      
      let errorMessage = t("newsmanagementadmin.notifications.loadFailed");
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(true);
      await deleteNews(id);
      showNotification(
        t("newsmanagementadmin.notifications.deleteSuccess"),
        "success"
      );
      fetchNews();
    } catch (error: any) {
      console.error("Error deleting news:", error);
      let errorMessage = t("newsmanagementadmin.notifications.deleteFailed");
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showNotification(errorMessage, "error");
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const openDeleteConfirm = (id: number) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (!file.type.startsWith("image/")) {
        showNotification(
          t("newsmanagementadmin.errors.invalidImageType"),
          "error"
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showNotification(
          t("newsmanagementadmin.errors.imageTooLarge"),
          "error"
        );
        return;
      }

      form.setFieldValue("imageFile", file);
      form.setFieldValue("image_path", "");
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setFieldValue("imageFile", null);
      setPreviewImage(null);
    }
  };

  const handleMultipleFilesChange = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (!file.type.startsWith("image/")) {
        showNotification(
          t("newsmanagementadmin.errors.invalidImageType"),
          "error"
        );
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        showNotification(
          t("newsmanagementadmin.errors.imageTooLarge"),
          "error"
        );
        return false;
      }
      return true;
    });

    form.setFieldValue("multipleImageFiles", validFiles);
    form.setFieldValue("multiple_image_path", []);

    const previewUrls = validFiles.map(file => URL.createObjectURL(file));
    setMultiplePreviewImages(previewUrls);
  };

  const removeMultipleImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      const updatedImages = [...form.values.multiple_image_path];
      updatedImages.splice(index, 1);
      form.setFieldValue("multiple_image_path", updatedImages);
    } else {
      const updatedFiles = [...form.values.multipleImageFiles];
      updatedFiles.splice(index, 1);
      form.setFieldValue("multipleImageFiles", updatedFiles);
    }

    const updatedPreviews = [...multiplePreviewImages];
    updatedPreviews.splice(index, 1);
    setMultiplePreviewImages(updatedPreviews);
  };

  const columns: MRT_ColumnDef<NewsItem>[] = [
    {
      accessorKey: "id",
      header: t("newsmanagementadmin.table.headers.id"),
      size: 80,
    },
    {
      accessorFn: (row) => {
        // Dynamic localization based on current language
        const currentLang = i18n.language as 'am' | 'en';
        return row.title?.[currentLang] || row.title?.en || row.title?.am || t("newsmanagementadmin.table.notAvailable");
      },
      header: t("newsmanagementadmin.table.headers.title"),
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorFn: (row) => {
        // Dynamic localization for content preview
        const currentLang = i18n.language as 'am' | 'en';
        const content = row.content?.[currentLang] || row.content?.en || row.content?.am || '';
        return content.substring(0, 100) + (content.length > 100 ? '...' : '');
      },
      header: t("newsmanagementadmin.table.headers.content"),
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">
            {cell.getValue<string>() ||
              t("newsmanagementadmin.table.notAvailable")}
          </div>
        </Box>
      ),
    },
    {
      accessorFn: (row) => {
        if (!row.category) return t("newsmanagementadmin.table.notAvailable");
        
        // Dynamic localization for category names
        const currentLang = i18n.language as 'am' | 'en';
        
        if (typeof row.category.name === "string") {
          try {
            const name = JSON.parse(row.category.name);
            return name?.[currentLang] || name?.en || name?.am || t("newsmanagementadmin.table.notAvailable");
          } catch {
            return row.category.name;
          }
        }
        return (
          row.category.name?.[currentLang] || row.category.name?.en || row.category.name?.am || t("newsmanagementadmin.table.notAvailable")
        );
      },
      header: t("newsmanagementadmin.table.headers.category"),
      id: "category",
    },
    {
      accessorFn: (row) => {
        // Show author name only, never show author_id
        if (row.author && row.author.name) {
          return row.author.name;
        }
        return t("newsmanagementadmin.table.notAvailable");
      },
      header: t("newsmanagementadmin.table.headers.author"),
      id: "author",
      Cell: ({ row }) => {
        const author = row.original.author;
        if (author && author.name) {
          return (
            <Box>
              <Text size="sm" weight={500}>
                {author.name}
              </Text>
              {author.email && (
                <Text size="xs" color="dimmed">
                  {author.email}
                </Text>
              )}
            </Box>
          );
        }
        return (
          <Text size="sm" color="dimmed">
            {t("newsmanagementadmin.table.notAvailable")}
          </Text>
        );
      },
    },
    {
      accessorKey: "is_published",
      header: t("newsmanagementadmin.table.headers.status"),
      Cell: ({ cell }) => (
        <Badge
          color={cell.getValue<boolean>() ? "green" : "orange"}
          variant="filled"
        >
          {cell.getValue<boolean>()
            ? t("newsmanagementadmin.status.published")
            : t("newsmanagementadmin.status.draft")}
        </Badge>
      ),
    },
    {
      accessorKey: "image_path",
      header: t("newsmanagementadmin.table.headers.image"),
      Cell: ({ cell }) => {
        const imageUrl = cell.getValue<string>();
        return imageUrl ? (
          <Image
            src={formatImageUrl(imageUrl)}
            width={60}
            height={40}
            fit="cover"
            withPlaceholder
            placeholder={<IconPhoto size={24} />}
          />
        ) : (
          <Box
            style={{
              width: 60,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconPhoto size={24} />
          </Box>
        );
      },
    },
    {
      accessorKey: "multiple_image_path",
      header: t("newsmanagementadmin.table.headers.multipleImages"),
      Cell: ({ cell }) => {
        const images = cell.getValue<string[] | null>();
        const parsedImages = parseMultipleImages(images);

        if (parsedImages.length === 0) {
          return (
            <Box
              style={{
                width: 60,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconPhoto size={24} />
            </Box>
          );
        }

        return (
          <Group spacing="xs">
            {parsedImages.slice(0, 3).map((img, index) => (
              <Image
                key={index}
                src={formatImageUrl(img)}
                width={60}
                height={40}
                fit="cover"
                withPlaceholder
                placeholder={<IconPhoto size={24} />}
              />
            ))}
            {parsedImages.length > 3 && (
              <Badge>+{parsedImages.length - 3}</Badge>
            )}
          </Group>
        );
      },
    },
    {
      accessorKey: "view_count",
      header: t("newsmanagementadmin.table.headers.views"),
      Cell: ({ cell }) => {
        const count = cell.getValue<number>();
        return (
          <Group spacing={4}>
            <IconEye size={14} />
            <span>{count || 0}</span>
          </Group>
        );
      },
    },
    {
      accessorKey: "published_at",
      header: t("newsmanagementadmin.table.headers.publishedAt"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value
          ? new Date(value).toLocaleString()
          : t("newsmanagementadmin.table.notPublished");
      },
    },
    {
      id: "actions",
      header: t("newsmanagementadmin.table.headers.actions"),
      Cell: ({ row }) => {
        const itemId = row.original.id;
        return (
          <Group spacing="xs">
            <ActionIcon
              sx={{ 
                backgroundColor: colors.oceanBlue,
                color: colors.white,
                "&:hover": {
                  backgroundColor: colors.navyBlue,
                }
              }}
              onClick={() => handleEdit(itemId)}
            >
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon
              sx={{ 
                backgroundColor: "#e53e3e",
                color: colors.white,
                "&:hover": {
                  backgroundColor: "#c53030",
                }
              }}
              onClick={() => openDeleteConfirm(itemId)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        );
      },
    },
  ];

  if (loading && newsData.length === 0) {
    return (
      <Box className="flex items-center justify-center h-screen">
        <MantineLoader size="xl" variant="bars" color={colors.oceanBlue} />
      </Box>
    );
  }

  return (
    <Box p="md" pos="relative">
      <Group position="apart" mb="md">
        <Title order={2} sx={{ color: colors.navyBlue }}>
          {t("newsmanagementadmin.title")}
        </Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={() => {
            form.reset();
            setEditingId(null);
            setPreviewImage(null);
            setMultiplePreviewImages([]);
            openModal();
          }}
          sx={{
            background: `linear-gradient(90deg, ${colors.oceanBlue}, ${colors.teal})`,
            "&:hover": {
              opacity: 0.9,
            },
          }}
        >
          {t("newsmanagementadmin.buttons.addNews")}
        </Button>
      </Group>
      <Divider my="md" />

      <Box className="h-[calc(100vh-200px)] w-full overflow-auto">
        <MantineReactTable
          columns={columns}
          data={newsData}
          state={{ isLoading: loading }}
          enableColumnOrdering
          enablePagination
          enableSorting
          enableColumnFilters
          enableGlobalFilter
          enableStickyHeader
          enableFullScreenToggle={false}
          initialState={{
            density: "xs",
            pagination: { pageSize: 10, pageIndex: 0 },
          }}
          mantineTableContainerProps={{
            sx: {
              maxHeight: "calc(100vh - 210px)",
            },
          }}
        />
      </Box>

      <Modal
        opened={editModalOpen}
        onClose={resetAndCloseModal}
        title={
          editingId
            ? t("newsmanagementadmin.modal.editTitle")
            : t("newsmanagementadmin.modal.createTitle")
        }
        size="lg"
        overlayProps={{ blur: 3 }}
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Group grow mb="md">
            <TextInput
              withAsterisk
              label={t("newsmanagementadmin.form.titleAm.label")}
              placeholder={t("newsmanagementadmin.form.titleAm.placeholder")}
              {...form.getInputProps("titleAm")}
            />
            <TextInput
              withAsterisk
              label={t("newsmanagementadmin.form.titleEn.label")}
              placeholder={t("newsmanagementadmin.form.titleEn.placeholder")}
              {...form.getInputProps("titleEn")}
            />
          </Group>

          <Group grow mb="md">
            <Textarea
              withAsterisk
              label={t("newsmanagementadmin.form.contentAm.label")}
              placeholder={t("newsmanagementadmin.form.contentAm.placeholder")}
              minRows={3}
              {...form.getInputProps("content_am")}
            />
            <Textarea
              withAsterisk
              label={t("newsmanagementadmin.form.contentEn.label")}
              placeholder={t("newsmanagementadmin.form.contentEn.placeholder")}
              minRows={3}
              {...form.getInputProps("content_en")}
            />
          </Group>

          <Textarea
            withAsterisk
            label={t("newsmanagementadmin.form.excerpt.label")}
            placeholder={t("newsmanagementadmin.form.excerpt.placeholder")}
            mb="md"
            {...form.getInputProps("excerpt")}
          />

          <Group grow mb="md">
            <Select
              withAsterisk
              label={t("newsmanagementadmin.form.category.label")}
              placeholder={t("newsmanagementadmin.form.category.placeholder")}
              data={categories}
              searchable
              nothingFound={t("newsmanagementadmin.form.category.noResults")}
              {...form.getInputProps("category_id")}
            />
            <Select
              label={t("newsmanagementadmin.form.author.label")}
              placeholder={t("newsmanagementadmin.form.author.placeholder")}
              data={authors}
              searchable
              nothingFound={t("newsmanagementadmin.form.author.noResults")}
              {...form.getInputProps("author_id")}
            />
          </Group>

          <FileInput
            label={t("newsmanagementadmin.form.image.label")}
            accept="image/png,image/jpeg,image/webp"
            icon={<IconUpload size={14} />}
            onChange={handleFileChange}
            mb="md"
            description={t("newsmanagementadmin.form.image.description")}
            clearable
            required={!editingId}
          />

          {(previewImage || form.values.image_path) && (
            <Box mb="md">
              <Text size="sm" mb="xs">
                {previewImage
                  ? t("newsmanagementadmin.form.image.preview")
                  : t("newsmanagementadmin.form.image.currentImage")}
              </Text>
              <Box pos="relative" sx={{ width: "fit-content" }}>
                <Image
                  src={previewImage || formatImageUrl(form.values.image_path)}
                  height={160}
                  fit="contain"
                  withPlaceholder
                  alt="News Image"
                />
                <ActionIcon
                  sx={{ 
                    backgroundColor: "#e53e3e",
                    color: colors.white,
                    "&:hover": {
                      backgroundColor: "#c53030",
                    }
                  }}
                  size="sm"
                  pos="absolute"
                  top={5}
                  right={5}
                  onClick={() => {
                    if (previewImage) {
                      form.setFieldValue("imageFile", null);
                      setPreviewImage(null);
                    } else {
                      form.setFieldValue("image_path", "");
                    }
                  }}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Box>
            </Box>
          )}

          <FileInput
            label={t("newsmanagementadmin.form.multipleImages.label")}
            accept="image/png,image/jpeg,image/webp"
            icon={<IconUpload size={14} />}
            onChange={handleMultipleFilesChange}
            multiple
            mb="md"
            description={t("newsmanagementadmin.form.multipleImages.description")}
            clearable
          />

          {(multiplePreviewImages.length > 0 || form.values.multiple_image_path.length > 0) && (
            <Box mb="md">
              <Text size="sm" mb="xs">
                {multiplePreviewImages.length > 0
                  ? t("newsmanagementadmin.form.multipleImages.preview")
                  : t("newsmanagementadmin.form.multipleImages.currentImages")}
              </Text>
              <SimpleGrid
                cols={3}
                breakpoints={[
                  { maxWidth: 'sm', cols: 2 },
                  { maxWidth: 'xs', cols: 1 },
                ]}
              >
                {multiplePreviewImages.length > 0 ? (
                  multiplePreviewImages.map((img, index) => (
                    <Box key={index} pos="relative">
                      <Image
                        src={img}
                        width={100}
                        height={80}
                        fit="cover"
                        withPlaceholder
                        alt={`Preview ${index + 1}`}
                      />
                      <ActionIcon
                        sx={{ 
                          backgroundColor: "#e53e3e",
                          color: colors.white,
                          "&:hover": {
                            backgroundColor: "#c53030",
                          }
                        }}
                        size="sm"
                        pos="absolute"
                        top={5}
                        right={5}
                        onClick={() => removeMultipleImage(index, false)}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Box>
                  ))
                ) : (
                  form.values.multiple_image_path.map((path, index) => (
                    <Box key={index} pos="relative">
                      <Image
                        src={formatImageUrl(path)}
                        width={100}
                        height={80}
                        fit="cover"
                        withPlaceholder
                        alt={`Current Image ${index + 1}`}
                      />
                      <ActionIcon
                        sx={{ 
                          backgroundColor: "#e53e3e",
                          color: colors.white,
                          "&:hover": {
                            backgroundColor: "#c53030",
                          }
                        }}
                        size="sm"
                        pos="absolute"
                        top={5}
                        right={5}
                        onClick={() => removeMultipleImage(index, true)}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Box>
                  ))
                )}
              </SimpleGrid>
            </Box>
          )}

          <Switch
            label={t("newsmanagementadmin.form.published.label")}
            checked={form.values.is_published}
            onChange={(e) =>
              form.setFieldValue("is_published", e.currentTarget.checked)
            }
            mb="md"
          />

          <Group position="right" mt="xl">
            <Button 
              variant="default" 
              onClick={resetAndCloseModal}
              sx={{ borderColor: colors.oceanBlue, color: colors.oceanBlue }}
            >
              {t("newsmanagementadmin.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              loading={loading || fileUploading}
              sx={{
                background: `linear-gradient(90deg, ${colors.oceanBlue}, ${colors.teal})`,
                "&:hover": {
                  opacity: 0.9,
                },
              }}
            >
              {editingId
                ? t("newsmanagementadmin.buttons.updateNews")
                : t("newsmanagementadmin.buttons.createNews")}
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t("newsmanagementadmin.modal.deleteTitle")}
        centered
      >
        <Box>
          <Text size="sm" mb="md">
            {t("newsmanagementadmin.modal.deleteConfirmation")}
          </Text>
          <Group position="right" mt="md">
            <Button
              variant="default"
              onClick={() => setDeleteConfirmOpen(false)}
              sx={{ borderColor: colors.oceanBlue, color: colors.oceanBlue }}
            >
              {t("newsmanagementadmin.buttons.cancel")}
            </Button>
            <Button
              sx={{ 
                backgroundColor: "#e53e3e",
                color: colors.white,
                "&:hover": {
                  backgroundColor: "#c53030",
                }
              }}
              loading={deleteLoading}
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
            >
              {t("newsmanagementadmin.buttons.delete")}
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
};

export default NewsManagement;