import {
  TextInput,
  Textarea,
  Button,
  Group,
  Box,
  Title,
  Divider,
  Modal,
  ActionIcon,
  FileInput,
  Image,
  Text,
  MultiSelect,
  SimpleGrid,
  Chip,
  ChipProps,
  Stack,
  Badge,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  createGallery,
  getGalleries,
  getGalleryById,
  deleteGallery,
  updateGallery,
  uploadFile,
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
import { DateInput } from "@mantine/dates";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/loader";

interface GalleryItem {
  id: number;
  images: string[];
  title: {
    en: string;
    am: string;
  };
  description: {
    en: string;
    am: string;
  };
  category: string[];
  date: string;
  created_at: string;
  updated_at: string;
}

const CMS_FILES_BASE_URL =
  `${import.meta.env.VITE_FILE_API}`;

const parseApiResponse = (data: any[]): GalleryItem[] => {
  return data.map((item) => ({
    ...item,
    title: typeof item.title === "string" ? JSON.parse(item.title) : item.title,
    description:
      typeof item.description === "string"
        ? JSON.parse(item.description)
        : item.description,
    images:
      typeof item.images === "string" ? JSON.parse(item.images) : item.images,
    category:
      typeof item.category === "string"
        ? JSON.parse(item.category)
        : item.category,
  }));
};

const GalleryManagement = () => {
  const { t } = useTranslation();
  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const formatImageUrl = (imgPath: string): string => {
    if (!imgPath) return "";
    if (imgPath.startsWith("http")) return imgPath;
    // Ensure the URL is properly formatted
    if (!imgPath.startsWith(CMS_FILES_BASE_URL)) {
      return `${CMS_FILES_BASE_URL}${imgPath.replace(/^\/+/, "")}`;
    }
    return imgPath;
  };

  const fetchGalleries = async () => {
    setLoading(true);
    try {
      const response = await getGalleries();
      const parsedData = parseApiResponse(response || []);

      // Sort by ID descending (newest first)
      const sortedData = parsedData.sort((a, b) => b.id - a.id);

      setGalleryData(sortedData);

      const allCategories = sortedData.flatMap((item) => item.category || []);
      const uniqueCategories = Array.from(new Set(allCategories));
      setCategories(uniqueCategories);

      showNotification(
        t("gallerymanagementadmin.notifications.loadSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch galleries:", error);
      showNotification(
        t("gallerymanagementadmin.notifications.loadError"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  const form = useForm({
    initialValues: {
      title_en: "",
      title_am: "",
      description_en: "",
      description_am: "",
      images: [] as string[],
      category: [] as string[],
      date: new Date(),
      imageFiles: [] as File[],
    },
    validate: {
      title_en: (value) =>
        value ? null : t("gallerymanagementadmin.formErrors.titleEn"),
      title_am: (value) =>
        value ? null : t("gallerymanagementadmin.formErrors.titleAm"),
      description_en: (value) =>
        value ? null : t("gallerymanagementadmin.formErrors.descriptionEn"),
      description_am: (value) =>
        value ? null : t("gallerymanagementadmin.formErrors.descriptionAm"),
      category: (value) =>
        value.length > 0
          ? null
          : t("gallerymanagementadmin.formErrors.category"),
      date: (value) =>
        value ? null : t("gallerymanagementadmin.formErrors.date"),
      imageFiles: (value, values) =>
        !editingId && value.length === 0 && values.images.length === 0
          ? t("gallerymanagementadmin.formErrors.images")
          : null,
    },
  });

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("gallerymanagementadmin.notifications.success")
          : t("gallerymanagementadmin.notifications.error"),
      message,
      color: type === "success" ? "teal" : "red",
      icon: type === "success" ? <IconCheck size={18} /> : <IconX size={18} />,
      withBorder: true,
    });
  };

  const resetAndCloseModal = () => {
    closeModal();
    setEditingId(null);
    setPreviewImages([]);
    form.reset();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);

      if (editingId && (isNaN(editingId) || editingId <= 0)) {
        showNotification(
          t("gallerymanagementadmin.notifications.invalidId"),
          "error"
        );
        return;
      }

      let images = [...values.images];

      // Upload new images if any
      if (values.imageFiles.length > 0) {
        setFileUploading(true);
        try {
          const uploadPromises = values.imageFiles.map((file) =>
            uploadFile(file, "gallery")
          );
          const uploadResponses = await Promise.all(uploadPromises);
          const newImageUrls = uploadResponses.map((res) => {
            // Ensure the path is properly formatted
            const path = res.file.path;
            return path.startsWith("http")
              ? path
              : `${CMS_FILES_BASE_URL}${path.replace(/^\/+/, "")}`;
          });
          images = [...images, ...newImageUrls];
          showNotification(
            t("gallerymanagementadmin.notifications.uploadSuccess"),
            "success"
          );
        } catch (error) {
          console.error("File upload error:", error);
          showNotification(
            t("gallerymanagementadmin.notifications.uploadError"),
            "error"
          );
          return;
        } finally {
          setFileUploading(false);
        }
      }

      // Prepare payload according to API requirements
      const payload = {
        title: {
          en: values.title_en,
          am: values.title_am,
        },
        description: {
          en: values.description_en,
          am: values.description_am,
        },
        category: values.category,
        date: values.date.toISOString().split("T")[0], // Format as YYYY-MM-DD
        images: images.map((img) => {
          // Ensure all image URLs are properly formatted
          if (!img.startsWith("http")) {
            return `${CMS_FILES_BASE_URL}${img.replace(/^\/+/, "")}`;
          }
          return img;
        }),
      };

      if (editingId) {
        await updateGallery(editingId, payload);
        showNotification(
          t("gallerymanagementadmin.notifications.updateSuccess"),
          "success"
        );
      } else {
        await createGallery(payload);
        showNotification(
          t("gallerymanagementadmin.notifications.createSuccess"),
          "success"
        );
      }

      resetAndCloseModal();
      fetchGalleries();
    } catch (error) {
      console.error("Error saving gallery:", error);
      showNotification(
        t(
          `gallerymanagementadmin.notifications.${
            editingId ? "updateError" : "createError"
          }`
        ),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    if (isNaN(id) || id <= 0) {
      showNotification(
        t("gallerymanagementadmin.notifications.invalidId"),
        "error"
      );
      return;
    }

    try {
      const response = await getGalleryById(id);
      if (!response) {
        showNotification(
          t("gallerymanagementadmin.notifications.notFound"),
          "error"
        );
        return;
      }

      const item = parseApiResponse([response])[0];

      form.setValues({
        title_en: item.title?.en || "",
        title_am: item.title?.am || "",
        description_en: item.description?.en || "",
        description_am: item.description?.am || "",
        category: item.category || [],
        date: new Date(item.date || new Date()),
        images: item.images || [],
        imageFiles: [],
      });

      setPreviewImages((item.images || []).map((img) => formatImageUrl(img)));
      setEditingId(item.id);
      openModal();
    } catch (error) {
      console.error("Error loading gallery for edit:", error);
      showNotification(
        t("gallerymanagementadmin.notifications.loadEditError"),
        "error"
      );
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(true);
      await deleteGallery(id);
      showNotification(
        t("gallerymanagementadmin.notifications.deleteSuccess"),
        "success"
      );
      fetchGalleries();
    } catch (error) {
      console.error("Error deleting gallery:", error);
      showNotification(
        t("gallerymanagementadmin.notifications.deleteError"),
        "error"
      );
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

  const handleFilesChange = (files: File[]) => {
    if (files.length > 10) {
      showNotification(
        t("gallerymanagementadmin.notifications.maxImages"),
        "error"
      );
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        showNotification(
          t("gallerymanagementadmin.notifications.invalidFileType", {
            fileName: file.name,
          }),
          "error"
        );
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        showNotification(
          t("gallerymanagementadmin.notifications.fileSizeError", {
            fileName: file.name,
          }),
          "error"
        );
        return false;
      }
      return true;
    });

    form.setFieldValue("imageFiles", validFiles);

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      const updatedImages = [...form.values.images];
      updatedImages.splice(index, 1);
      form.setFieldValue("images", updatedImages);
    } else {
      const updatedFiles = [...form.values.imageFiles];
      updatedFiles.splice(index, 1);
      form.setFieldValue("imageFiles", updatedFiles);
    }

    const updatedPreviews = [...previewImages];
    updatedPreviews.splice(index, 1);
    setPreviewImages(updatedPreviews);
  };

  const categoryChipProps: ChipProps = {
    variant: "filled",
    size: "sm",
    radius: "xl",
  };

  const columns: MRT_ColumnDef<GalleryItem>[] = [
    {
      accessorKey: "id",
      header: t("gallerymanagementadmin.table.columns.id"),
      size: 80,
    },
    {
      accessorFn: (row) =>
        row.title?.en || t("gallerymanagementadmin.table.na"),
      header: t("gallerymanagementadmin.table.columns.titleEn"),
      id: "title_en",
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorFn: (row) =>
        row.title?.am || t("gallerymanagementadmin.table.na"),
      header: t("gallerymanagementadmin.table.columns.titleAm"),
      id: "title_am",
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorKey: "category",
      header: t("gallerymanagementadmin.table.columns.categories"),
      Cell: ({ cell }) => {
        const categories = cell.getValue<string[]>();
        return (
          <Box sx={{ maxWidth: 200 }}>
            {categories && Array.isArray(categories) ? (
              <Chip.Group>
                <Stack spacing="xs">
                  {categories.map((cat, i) => (
                    <Chip key={i} {...categoryChipProps}>
                      {cat}
                    </Chip>
                  ))}
                </Stack>
              </Chip.Group>
            ) : (
              <Text size="sm" color="dimmed">
                {t("gallerymanagementadmin.table.noCategories")}
              </Text>
            )}
          </Box>
        );
      },
    },
    {
      accessorKey: "date",
      header: t("gallerymanagementadmin.table.columns.date"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value
          ? new Date(value).toLocaleDateString()
          : t("gallerymanagementadmin.table.na");
      },
    },
    {
      accessorKey: "images",
      header: t("gallerymanagementadmin.table.columns.images"),
      Cell: ({ cell }) => {
        const images = cell.getValue<string[]>();
        return (
          <Group spacing="xs">
            {images && Array.isArray(images) ? (
              <>
                {images.slice(0, 3).map((img, i) => (
                  <Image
                    key={i}
                    src={formatImageUrl(img)}
                    width={60}
                    height={40}
                    fit="cover"
                    withPlaceholder
                    placeholder={<IconPhoto size={24} />}
                  />
                ))}
                {images.length > 3 && (
                  <Badge variant="light" color="gray">
                    +{images.length - 3}{" "}
                    {t("gallerymanagementadmin.table.more")}
                  </Badge>
                )}
              </>
            ) : (
              <Text size="sm" color="dimmed">
                {t("gallerymanagementadmin.table.noImages")}
              </Text>
            )}
          </Group>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: t("gallerymanagementadmin.table.columns.createdAt"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value
          ? new Date(value).toLocaleString()
          : t("gallerymanagementadmin.table.na");
      },
    },
    {
      id: "actions",
      header: t("gallerymanagementadmin.table.columns.actions"),
      Cell: ({ row }) => {
        const itemId = row.original.id;
        return (
          <Group spacing="xs">
            <ActionIcon
              color="blue"
              variant="light"
              onClick={() => handleEdit(itemId)}
              title={t("gallerymanagementadmin.table.actions.edit")}
            >
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon
              color="red"
              variant="light"
              onClick={() => openDeleteConfirm(itemId)}
              title={t("gallerymanagementadmin.table.actions.delete")}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        );
      },
    },
  ];

  return (
    <Box p="md" pos="relative">
      {loading && <Loader />}
      <Group position="apart" mb="md">
        <Title order={2}>{t("gallerymanagementadmin.title")}</Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={() => {
            form.reset();
            setEditingId(null);
            setPreviewImages([]);
            openModal();
          }}
          variant="gradient"
          gradient={{ from: "indigo", to: "cyan" }}
        >
          {t("gallerymanagementadmin.addButton")}
        </Button>
      </Group>
      <Divider my="md" />

      <Box className="h-[calc(100vh-200px)] w-full overflow-auto">
        <MantineReactTable
          columns={columns}
          data={galleryData}
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
        title={t(
          `gallerymanagementadmin.modal.${
            editingId ? "editTitle" : "createTitle"
          }`
        )}
        size="xl"
        overlayProps={{ blur: 3 }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Group grow mb="md">
            <TextInput
              label={t("gallerymanagementadmin.form.titleEn")}
              required
              placeholder={t("gallerymanagementadmin.form.titleEnPlaceholder")}
              {...form.getInputProps("title_en")}
            />
            <TextInput
              label={t("gallerymanagementadmin.form.titleAm")}
              required
              placeholder={t("gallerymanagementadmin.form.titleAmPlaceholder")}
              {...form.getInputProps("title_am")}
            />
          </Group>

          <Group grow mb="md">
            <Textarea
              label={t("gallerymanagementadmin.form.descriptionEn")}
              required
              placeholder={t(
                "gallerymanagementadmin.form.descriptionEnPlaceholder"
              )}
              {...form.getInputProps("description_en")}
            />
            <Textarea
              label={t("gallerymanagementadmin.form.descriptionAm")}
              required
              placeholder={t(
                "gallerymanagementadmin.form.descriptionAmPlaceholder"
              )}
              {...form.getInputProps("description_am")}
            />
          </Group>

          <Group grow mb="md">
            <MultiSelect
              label={t("gallerymanagementadmin.form.categories")}
              data={categories}
              placeholder={t(
                "gallerymanagementadmin.form.categoriesPlaceholder"
              )}
              searchable
              creatable
              getCreateLabel={(query) =>
                `+ ${t("gallerymanagementadmin.form.createCategory")} ${query}`
              }
              onCreate={(query) => {
                setCategories((current) => [...current, query]);
                return query;
              }}
              required
              {...form.getInputProps("category")}
            />
            <DateInput
              label={t("gallerymanagementadmin.form.date")}
              required
              valueFormat="YYYY-MM-DD"
              {...form.getInputProps("date")}
            />
          </Group>

          <FileInput
            label={t("gallerymanagementadmin.form.images")}
            placeholder={t("gallerymanagementadmin.form.imagesPlaceholder")}
            accept="image/png,image/jpeg,image/webp"
            icon={<IconUpload size={14} />}
            onChange={handleFilesChange}
            multiple
            mb="md"
            description={t("gallerymanagementadmin.form.imagesDescription")}
            clearable
            required={!editingId}
            {...form.getInputProps("imageFiles")}
          />

          {previewImages.length > 0 && (
            <Box mb="md">
              <Text size="sm" mb="xs">
                {t("gallerymanagementadmin.form.imagePreviews", {
                  count: previewImages.length,
                })}
              </Text>
              <SimpleGrid
                cols={4}
                breakpoints={[
                  { maxWidth: "md", cols: 3 },
                  { maxWidth: "sm", cols: 2 },
                  { maxWidth: "xs", cols: 1 },
                ]}
              >
                {previewImages.map((img, index) => {
                  const isExisting = index < (form.values.images?.length || 0);
                  return (
                    <Box key={index} pos="relative">
                      <Image
                        src={img}
                        height={120}
                        fit="cover"
                        withPlaceholder
                        alt={`${t("gallerymanagementadmin.form.preview")} ${
                          index + 1
                        }`}
                      />
                      <ActionIcon
                        color="red"
                        variant="filled"
                        size="sm"
                        pos="absolute"
                        top={5}
                        right={5}
                        onClick={() => removeImage(index, isExisting)}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                      {isExisting && (
                        <Badge
                          variant="light"
                          color="blue"
                          pos="absolute"
                          bottom={5}
                          left={5}
                        >
                          {t("gallerymanagementadmin.form.existing")}
                        </Badge>
                      )}
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Box>
          )}

          <Group position="right" mt="xl">
            <Button variant="default" onClick={resetAndCloseModal}>
              {t("gallerymanagementadmin.form.cancel")}
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              loading={loading || fileUploading}
            >
              {editingId
                ? t("gallerymanagementadmin.form.updateButton")
                : t("gallerymanagementadmin.form.createButton")}
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t("gallerymanagementadmin.deleteModal.title")}
        centered
      >
        <Box>
          <Text size="sm" mb="md">
            {t("gallerymanagementadmin.deleteModal.message")}
          </Text>
          <Group position="right" mt="md">
            <Button
              variant="default"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              {t("gallerymanagementadmin.deleteModal.cancel")}
            </Button>
            <Button
              color="red"
              loading={deleteLoading}
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
            >
              {t("gallerymanagementadmin.deleteModal.delete")}
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
};

export default GalleryManagement;
