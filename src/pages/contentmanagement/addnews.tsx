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
  Stack,
  SimpleGrid,
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
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/loader";

interface NewsItem {
  id: number;
  title_am: string;
  title_en: string;
  slug: string;
  excerpt: string;
  content: string | { am: string; en: string };
  category_id: number;
  author_id: number;
  woreda_id: number | null;
  subcity_id: number | null;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  image_path: string;
  multiple_image_path: string[] | null;
  view_count: number;
  category: {
    id: number;
    name: string | { am: string; en: string };
    slug: string;
    created_at: string;
    updated_at: string;
  };
  author: {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    role_id: number;
    woreda_id: number;
    subcity_id: number;
    created_at: string;
    updated_at: string;
    active_status: number;
    avatar: string;
    dark_mode: number;
    messenger_color: string | null;
  };
}

interface SelectItem {
  value: string;
  label: string;
}

const CMS_FILES_BASE_URL = `${import.meta.env.VITE_FILE_API}`;

const formatImageUrl = (imgPath: string): string => {
  if (!imgPath) return "";
  if (imgPath.startsWith("http")) return imgPath;
  return `${CMS_FILES_BASE_URL}${imgPath.replace(/^\/+/, "")}`;
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
      title_am: "",
      title_en: "",
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
      title_am: (value) =>
        value ? null : t("newsmanagementadmin.form.titleAm.error"),
      title_en: (value) =>
        value ? null : t("newsmanagementadmin.form.titleEn.error"),
      content_am: (value) =>
        value ? null : t("newsmanagementadmin.form.contentAm.error"),
      content_en: (value) =>
        value ? null : t("newsmanagementadmin.form.contentEn.error"),
      excerpt: (value) =>
        value ? null : t("newsmanagementadmin.form.excerpt.error"),
      category_id: (value) =>
        value ? null : t("newsmanagementadmin.form.category.error"),
      author_id: (value) =>
        value ? null : t("newsmanagementadmin.form.author.error"),
      imageFile: (value, values) =>
        !editingId && !value && !values.image_path
          ? t("newsmanagementadmin.form.image.error")
          : null,
    },
  });

  const fetchCategories = async () => {
    try {
      const response = await getNewsCategories();
      if (response.data) {
        const categoryOptions = response.data.map((category: any) => ({
          value: category.id.toString(),
          label:
            typeof category.name === "object"
              ? category.name.en ||
              category.name.am ||
              `Category ${category.id}`
              : category.name || `Category ${category.id}`,
        }));
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
      if (response && Array.isArray(response)) {
        const authorOptions = response.map((user: any) => ({
          value: user.id.toString(),
          label: user.name || user.email || `User ${user.id}`,
        }));
        setAuthors(authorOptions);
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
      const normalizedData = response?.data?.map((item: any) => ({
        ...item,
        multiple_image_path: parseMultipleImages(item.multiple_image_path)
      })) || [];
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

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("newsmanagementadmin.notifications.successTitle")
          : t("newsmanagementadmin.notifications.errorTitle"),
      message,
      color: type === "success" ? "teal" : "red",
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

      if (editingId && (isNaN(editingId) || editingId <= 0)) {
        showNotification(t("newsmanagementadmin.errors.invalidId"), "error");
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

      const payload = {
        title_am: values.title_am,
        title_en: values.title_en,
        content: {
          am: values.content_am,
          en: values.content_en,
        },
        excerpt: values.excerpt,
        category_id: Number(values.category_id),
        author_id: values.author_id,
        is_published: values.is_published,
        image_path: image_path,
        multiple_image_path: multiple_image_path.length > 0 ? multiple_image_path : null,
      };

      if (editingId) {
        await updateNews(editingId, payload);
        showNotification(
          t("newsmanagementadmin.notifications.updateSuccess"),
          "success"
        );
      } else {
        await createNews(payload);
        showNotification(
          t("newsmanagementadmin.notifications.createSuccess"),
          "success"
        );
      }

      resetAndCloseModal();
      fetchNews();
    } catch (error: any) {
      console.error("Error saving news:", error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          if (form.getInputProps(key)) {
            form.setFieldError(key, errors[key][0]);
          }
        });
      } else {
        showNotification(
          t(
            `newsmanagementadmin.notifications.${editingId ? "updateFailed" : "createFailed"
            }`
          ),
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    if (isNaN(id) || id <= 0) {
      showNotification(t("newsmanagementadmin.errors.invalidId"), "error");
      return;
    }

    try {
      setLoading(true);
      const response = await getNewsById(id);

      if (!response?.data) {
        showNotification(t("newsmanagementadmin.errors.notFound"), "error");
        return;
      }

      const item = response.data;

      let titleAm = "";
      let titleEn = "";
      let contentAm = "";
      let contentEn = "";

      if (typeof item.title === "string") {
        try {
          const title = JSON.parse(item.title);
          titleAm = title.am || "";
          titleEn = title.en || "";
        } catch (e) {
          console.error("Error parsing title:", e);
          titleAm = item.title;
        }
      } else {
        titleAm = item.title?.am || "";
        titleEn = item.title?.en || "";
      }

      if (typeof item.content === "string") {
        try {
          const content = JSON.parse(item.content);
          contentAm = content.am || "";
          contentEn = content.en || "";
        } catch (e) {
          console.error("Error parsing content:", e);
          contentAm = item.content;
        }
      } else {
        contentAm = item.content?.am || "";
        contentEn = item.content?.en || "";
      }

      const multipleImages = parseMultipleImages(item.multiple_image_path);

      form.setValues({
        title_am: titleAm,
        title_en: titleEn,
        content_am: contentAm,
        content_en: contentEn,
        excerpt: item.excerpt || "",
        category_id: item.category_id?.toString() || "",
        author_id: item.author_id?.toString() || "",
        is_published: item.is_published,
        image_path: item.image_path || "",
        imageFile: null,
        multiple_image_path: multipleImages,
        multipleImageFiles: [],
      });

      if (item.image_path) {
        setPreviewImage(formatImageUrl(item.image_path));
      }

      setMultiplePreviewImages(multipleImages.map(path => formatImageUrl(path)));

      setEditingId(item.id);
      openModal();
    } catch (error: any) {
      console.error("Error loading news for edit:", error);
      let errorMessage = t("newsmanagementadmin.notifications.updateFailed");
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
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
        try {
          if (typeof row.title === "string") {
            const title = JSON.parse(row.title);
            return title?.am || t("newsmanagementadmin.table.notAvailable");
          }
          return row.title?.am || t("newsmanagementadmin.table.notAvailable");
        } catch {
          return t("newsmanagementadmin.table.notAvailable");
        }
      },
      header: t("newsmanagementadmin.table.headers.titleAm"),
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorFn: (row) => {
        try {
          if (typeof row.title === "string") {
            const title = JSON.parse(row.title);
            return title?.en || t("newsmanagementadmin.table.notAvailable");
          }
          return row.title?.en || t("newsmanagementadmin.table.notAvailable");
        } catch {
          return t("newsmanagementadmin.table.notAvailable");
        }
      },
      header: t("newsmanagementadmin.table.headers.titleEn"),
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorKey: "excerpt",
      header: t("newsmanagementadmin.table.headers.excerpt"),
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
        try {
          if (!row.category) return t("newsmanagementadmin.table.notAvailable");
          if (typeof row.category.name === "string") {
            const name = JSON.parse(row.category.name);
            return name?.en || t("newsmanagementadmin.table.notAvailable");
          }
          return (
            row.category.name?.en || t("newsmanagementadmin.table.notAvailable")
          );
        } catch {
          return t("newsmanagementadmin.table.notAvailable");
        }
      },
      header: t("newsmanagementadmin.table.headers.category"),
      id: "category",
    },
    {
      accessorFn: (row) =>
        row.author?.name || t("newsmanagementadmin.table.notAvailable"),
      header: t("newsmanagementadmin.table.headers.author"),
      id: "author",
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
    },
    {
      accessorKey: "published_at",
      header: t("newsmanagementadmin.table.headers.publishedAt"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value
          ? new Date(value).toLocaleString()
          : t("newsmanagementadmin.table.notAvailable");
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
              color="blue"
              variant="light"
              onClick={() => handleEdit(itemId)}
            >
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon
              color="red"
              variant="light"
              onClick={() => openDeleteConfirm(itemId)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        );
      },
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <Box p="md" pos="relative">
      <Group position="apart" mb="md">
        <Title order={2}>{t("newsmanagementadmin.title")}</Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={() => {
            form.reset();
            setEditingId(null);
            setPreviewImage(null);
            setMultiplePreviewImages([]);
            openModal();
          }}
          variant="gradient"
          gradient={{ from: "indigo", to: "cyan" }}
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
      >
        {loading && <Loader />}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Group grow mb="md">
            <TextInput
              withAsterisk
              label={t("newsmanagementadmin.form.titleAm.label")}
              placeholder={t("newsmanagementadmin.form.titleAm.placeholder")}
              {...form.getInputProps("title_am")}
            />
            <TextInput
              withAsterisk
              label={t("newsmanagementadmin.form.titleEn.label")}
              placeholder={t("newsmanagementadmin.form.titleEn.placeholder")}
              {...form.getInputProps("title_en")}
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
              withAsterisk
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
            placeholder={t("newsmanagementadmin.form.image.placeholder")}
            accept="image/png,image/jpeg,image/webp"
            icon={<IconUpload size={14} />}
            onChange={handleFileChange}
            mb="md"
            description={t("newsmanagementadmin.form.image.description")}
            clearable
            required={!editingId}
            {...form.getInputProps("imageFile")}
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
                  color="red"
                  variant="filled"
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
            placeholder={t("newsmanagementadmin.form.multipleImages.placeholder")}
            accept="image/png,image/jpeg,image/webp"
            icon={<IconUpload size={14} />}
            onChange={handleMultipleFilesChange}
            multiple
            mb="md"
            description={t("newsmanagementadmin.form.multipleImages.description")}
            clearable
            {...form.getInputProps("multipleImageFiles")}
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
                        color="red"
                        variant="filled"
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
                        color="red"
                        variant="filled"
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
            <Button variant="default" onClick={resetAndCloseModal}>
              {t("newsmanagementadmin.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              loading={loading || fileUploading}
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
        {deleteLoading && <Loader />}
        <Box>
          <Text size="sm" mb="md">
            {t("newsmanagementadmin.modal.deleteConfirmation")}
          </Text>
          <Group position="right" mt="md">
            <Button
              variant="default"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              {t("newsmanagementadmin.buttons.cancel")}
            </Button>
            <Button
              color="red"
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