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
  Badge,
  FileInput,
  Image,
  Text,
  LoadingOverlay,
  Radio,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import Loader from "../../components/common/loader";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  createExhibitions,
  getAllExhibitions,
  deleteExhibitions,
  updateExhibitions,
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
import { useTranslation } from "react-i18next";

interface ExhibitionItem {
  id: number;
  title: string;
  description: string;
  image_path: string | null;
  image_paths: string[] | null;
  view_count: string;
  created_at: string;
  updated_at: string;
}

const ExhibitionManagement = () => {
  const { t } = useTranslation();
  const [exhibitionData, setExhibitionData] = useState<ExhibitionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [previewMainImage, setPreviewMainImage] = useState<string | null>(null);
  const [previewGalleryImages, setPreviewGalleryImages] = useState<string[]>(
    []
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [imageSelection, setImageSelection] = useState<"single" | "multiple">(
    "single"
  );

  const BASE_IMAGE_URL =
    "https://bole.prosperity.boleprosperityparty.org/CMSFiles/";

  const form = useForm({
    initialValues: {
      title: "",
      description: "",
      imageFile: null as File | null,
      image_path: "",
      galleryFiles: [] as File[],
      image_paths: [] as string[],
    },
    validate: {
      title: (value) =>
        value ? null : t("exhibitionmanagement.form.title.error"),
      description: (value) =>
        value ? null : t("exhibitionmanagement.form.description.error"),
      imageFile: (value, values) =>
        imageSelection === "single" &&
        !editingId &&
        !value &&
        !values.image_path
          ? t("exhibitionmanagement.form.image.error")
          : null,
      galleryFiles: (value, values) =>
        imageSelection === "multiple" &&
        !editingId &&
        value.length === 0 &&
        values.image_paths.length === 0
          ? t("exhibitionmanagement.form.galleryImages.error")
          : null,
    },
  });

  const fetchExhibitions = async () => {
    setLoading(true);
    try {
      const response = await getAllExhibitions();
      // Sort by created_at in descending order (newest first)
      const sortedData = response
        ? [...response].sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        : [];
      setExhibitionData(sortedData);
      showNotification(
        t("exhibitionmanagement.notifications.loadSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch exhibitions:", error);
      showNotification(
        t("exhibitionmanagement.notifications.loadFailed"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExhibitions();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("exhibitionmanagement.notifications.success")
          : t("exhibitionmanagement.notifications.error"),
      message,
      color: type === "success" ? "teal" : "red",
      icon: type === "success" ? <IconCheck size={18} /> : <IconX size={18} />,
      withBorder: true,
    });
  };

  const resetForm = () => {
    form.reset();
    setPreviewMainImage(null);
    setPreviewGalleryImages([]);
    setEditingId(null);
    setImageSelection("single");
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);

      // Handle file uploads based on selection type
      let mainImagePath = values.image_path;
      let galleryImagePaths = values.image_paths;

      if (imageSelection === "single" && values.imageFile) {
        setFileUploading(true);
        try {
          const uploadResponse = await uploadFile(
            values.imageFile,
            "exhibitions"
          );
          mainImagePath = uploadResponse.file.path;
          galleryImagePaths = []; // Clear gallery paths when using single image
        } catch (error) {
          console.error("Image upload failed:", error);
          showNotification(
            t("exhibitionmanagement.notifications.uploadFailed"),
            "error"
          );
          return;
        } finally {
          setFileUploading(false);
        }
      } else if (
        imageSelection === "multiple" &&
        values.galleryFiles.length > 0
      ) {
        setFileUploading(true);
        try {
          const uploadPromises = values.galleryFiles.map((file) =>
            uploadFile(file, "exhibitions/gallery")
          );
          const uploadResponses = await Promise.all(uploadPromises);
          galleryImagePaths = uploadResponses.map((res) => res.file.path);
          // Use first gallery image as main image if no main image is set
          if (!mainImagePath && galleryImagePaths.length > 0) {
            mainImagePath = galleryImagePaths[0];
          }
        } catch (error) {
          console.error("Gallery images upload failed:", error);
          showNotification(
            t("exhibitionmanagement.notifications.galleryUploadFailed"),
            "error"
          );
          return;
        } finally {
          setFileUploading(false);
        }
      }

      // Prepare payload according to backend requirements
      const payload = {
        title: values.title,
        description: values.description,
        image: mainImagePath || null,
        images:
          imageSelection === "single"
            ? null
            : galleryImagePaths.length > 0
            ? galleryImagePaths
            : null,
      };

      if (editingId) {
        await updateExhibitions(editingId, payload);
        showNotification(
          t("exhibitionmanagement.notifications.updateSuccess"),
          "success"
        );
      } else {
        await createExhibitions(payload);
        showNotification(
          t("exhibitionmanagement.notifications.createSuccess"),
          "success"
        );
      }

      closeModal();
      resetForm();
      fetchExhibitions();
    } catch (error: any) {
      console.error("Error saving exhibition:", error);
      showNotification(
        t(
          `exhibitionmanagement.notifications.${
            editingId ? "updateFailed" : "createFailed"
          }`
        ),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      setLoading(true);
      const exhibition = exhibitionData.find((item) => item.id === id);

      if (!exhibition) {
        showNotification(
          t("exhibitionmanagement.notifications.notFound"),
          "error"
        );
        return;
      }

      // Determine if we're showing single or multiple images
      const selectionType =
        exhibition.image_paths && exhibition.image_paths.length > 0
          ? "multiple"
          : "single";
      setImageSelection(selectionType);

      form.setValues({
        title: exhibition.title,
        description: exhibition.description,
        image_path: exhibition.image_path || "",
        image_paths: exhibition.image_paths || [],
        imageFile: null,
        galleryFiles: [],
      });

      if (exhibition.image_path) {
        setPreviewMainImage(`${BASE_IMAGE_URL}${exhibition.image_path}`);
      }

      if (exhibition.image_paths && exhibition.image_paths.length > 0) {
        setPreviewGalleryImages(
          exhibition.image_paths.map((img) => `${BASE_IMAGE_URL}${img}`)
        );
      }

      setEditingId(id);
      openModal();
    } catch (error) {
      console.error("Error preparing edit form:", error);
      showNotification(
        t("exhibitionmanagement.notifications.editFailed"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(true);
      await deleteExhibitions(id);

      // Update the UI immediately by filtering out the deleted item
      setExhibitionData((prevData) =>
        prevData.filter((item) => item.id !== id)
      );

      showNotification(
        t("exhibitionmanagement.notifications.deleteSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Error deleting exhibition:", error);
      showNotification(
        t("exhibitionmanagement.notifications.deleteFailed"),
        "error"
      );
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const handleMainImageChange = (file: File | null) => {
    if (file) {
      if (!file.type.startsWith("image/")) {
        showNotification(
          t("exhibitionmanagement.errors.invalidImageType"),
          "error"
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showNotification(
          t("exhibitionmanagement.errors.imageTooLarge"),
          "error"
        );
        return;
      }

      form.setFieldValue("imageFile", file);
      form.setFieldValue("image_path", "");
      form.setFieldValue("galleryFiles", []);
      form.setFieldValue("image_paths", []);
      setPreviewGalleryImages([]);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewMainImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setFieldValue("imageFile", null);
      setPreviewMainImage(null);
    }
  };

  const handleGalleryImagesChange = (files: File[]) => {
    if (files && files.length > 0) {
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          showNotification(
            t("exhibitionmanagement.errors.invalidImageType"),
            "error"
          );
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          showNotification(
            t("exhibitionmanagement.errors.imageTooLarge"),
            "error"
          );
          return;
        }
      }

      form.setFieldValue("galleryFiles", files);
      form.setFieldValue("image_paths", []);
      form.setFieldValue("imageFile", null);
      form.setFieldValue("image_path", "");
      setPreviewMainImage(null);

      const readers = files.map((file) => {
        const reader = new FileReader();
        return new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then((previews) => {
        setPreviewGalleryImages(previews);
      });
    } else {
      form.setFieldValue("galleryFiles", []);
      setPreviewGalleryImages([]);
    }
  };

  const columns: MRT_ColumnDef<ExhibitionItem>[] = [
    {
      accessorKey: "id",
      header: t("exhibitionmanagement.table.headers.id"),
      size: 80,
    },
    {
      accessorKey: "title",
      header: t("exhibitionmanagement.table.headers.title"),
    },
    {
      accessorKey: "description",
      header: t("exhibitionmanagement.table.headers.description"),
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <Text lineClamp={1}>{cell.getValue<string>()}</Text>
        </Box>
      ),
    },
    {
      accessorKey: "image_path",
      header: t("exhibitionmanagement.table.headers.mainImage"),
      Cell: ({ cell }) => {
        const imageUrl = cell.getValue<string>();
        return imageUrl ? (
          <Image
            src={`${BASE_IMAGE_URL}${imageUrl}`}
            width={60}
            height={40}
            fit="cover"
            withPlaceholder
          />
        ) : (
          <IconPhoto size={24} />
        );
      },
    },
    {
      accessorKey: "image_paths",
      header: t("exhibitionmanagement.table.headers.galleryImages"),
      Cell: ({ cell }) => {
        const images = cell.getValue<string[] | null>();
        return images && images.length > 0 ? (
          <Group spacing="xs">
            {images.slice(0, 3).map((img, index) => (
              <Image
                key={index}
                src={`${BASE_IMAGE_URL}${img}`}
                width={40}
                height={30}
                fit="cover"
              />
            ))}
            {images.length > 3 && <Badge>+{images.length - 3}</Badge>}
          </Group>
        ) : (
          <Text size="sm" c="dimmed">
            {t("exhibitionmanagement.table.noImages")}
          </Text>
        );
      },
    },
    {
      accessorKey: "view_count",
      header: t("exhibitionmanagement.table.headers.viewCount"),
    },
    {
      accessorKey: "created_at",
      header: t("exhibitionmanagement.table.headers.createdAt"),
      Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
    },
    {
      id: "actions",
      header: t("exhibitionmanagement.table.headers.actions"),
      Cell: ({ row }) => (
        <Group spacing="xs">
          <ActionIcon
            color="blue"
            onClick={() => handleEdit(row.original.id)}
            title={t("exhibitionmanagement.buttons.edit")}
          >
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon
            color="red"
            onClick={() => {
              setItemToDelete(row.original.id);
              setDeleteConfirmOpen(true);
            }}
            title={t("exhibitionmanagement.buttons.delete")}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  return (
    <Box p="md">
      <Group position="apart" mb="md">
        <Title order={2}>{t("exhibitionmanagement.title")}</Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={() => {
            resetForm();
            openModal();
          }}
        >
          {t("exhibitionmanagement.buttons.addExhibition")}
        </Button>
      </Group>

      <Divider my="md" />

      <Box sx={{ height: "calc(100vh - 180px)", overflow: "auto" }}>
        {loading && <Loader />}
        <MantineReactTable
          columns={columns}
          data={exhibitionData}
          state={{ isLoading: loading }}
          enableColumnOrdering
          enablePagination
          enableSorting
          enableColumnFilters
          enableGlobalFilter
          enableStickyHeader
          initialState={{
            density: "xs",
            pagination: { pageSize: 10 },
            sorting: [{ id: "created_at", desc: true }], // Default sort by created_at descending
          }}
          mantineTableContainerProps={{
            sx: { maxHeight: "calc(100vh - 220px)" },
          }}
        />
      </Box>

      <Modal
        opened={editModalOpen}
        onClose={() => {
          closeModal();
          resetForm();
        }}
        title={
          editingId
            ? t("exhibitionmanagement.modal.editTitle")
            : t("exhibitionmanagement.modal.createTitle")
        }
        size="lg"
      >
        <LoadingOverlay visible={loading || fileUploading} />
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            withAsterisk
            label={t("exhibitionmanagement.form.title.label")}
            placeholder={t("exhibitionmanagement.form.title.placeholder")}
            {...form.getInputProps("title")}
            mb="md"
          />

          <Textarea
            withAsterisk
            label={t("exhibitionmanagement.form.description.label")}
            placeholder={t("exhibitionmanagement.form.description.placeholder")}
            minRows={3}
            {...form.getInputProps("description")}
            mb="md"
          />

          <Radio.Group
            label={t("exhibitionmanagement.form.imageSelection.label")}
            value={imageSelection}
            onChange={(value) => {
              setImageSelection(value as "single" | "multiple");
              // Clear all image fields when switching types
              form.setFieldValue("imageFile", null);
              form.setFieldValue("image_path", "");
              form.setFieldValue("galleryFiles", []);
              form.setFieldValue("image_paths", []);
              setPreviewMainImage(null);
              setPreviewGalleryImages([]);
            }}
            mb="md"
          >
            <Stack>
              <Radio
                value="single"
                label={t("exhibitionmanagement.form.imageSelection.single")}
              />
              <Radio
                value="multiple"
                label={t("exhibitionmanagement.form.imageSelection.multiple")}
              />
            </Stack>
          </Radio.Group>

          {imageSelection === "single" ? (
            <>
              <FileInput
                withAsterisk={!editingId}
                label={t("exhibitionmanagement.form.mainImage.label")}
                placeholder={t(
                  "exhibitionmanagement.form.mainImage.placeholder"
                )}
                accept="image/*"
                icon={<IconUpload size={14} />}
                onChange={handleMainImageChange}
                clearable
                mb="md"
                {...form.getInputProps("imageFile")}
              />

              {previewMainImage && (
                <Box mb="md">
                  <Image
                    src={
                      previewMainImage.startsWith("blob:")
                        ? previewMainImage
                        : `${BASE_IMAGE_URL}${previewMainImage}`
                    }
                    height={160}
                    fit="contain"
                    withPlaceholder
                    alt="Preview"
                  />
                </Box>
              )}

              {editingId && form.values.image_path && !previewMainImage && (
                <Box mb="md">
                  <Text size="sm" mb="xs">
                    {t("exhibitionmanagement.form.currentMainImage")}
                  </Text>
                  <Image
                    src={`${BASE_IMAGE_URL}${form.values.image_path}`}
                    height={160}
                    fit="contain"
                    withPlaceholder
                  />
                </Box>
              )}
            </>
          ) : (
            <>
              <FileInput
                withAsterisk={!editingId}
                label={t("exhibitionmanagement.form.galleryImages.label")}
                placeholder={t(
                  "exhibitionmanagement.form.galleryImages.placeholder"
                )}
                accept="image/*"
                multiple
                icon={<IconUpload size={14} />}
                onChange={handleGalleryImagesChange}
                clearable
                mb="md"
                {...form.getInputProps("galleryFiles")}
              />

              {previewGalleryImages.length > 0 && (
                <Box mb="md">
                  <Group spacing="xs">
                    {previewGalleryImages.map((img, index) => (
                      <Image
                        key={index}
                        src={
                          img.startsWith("blob:")
                            ? img
                            : `${BASE_IMAGE_URL}${img}`
                        }
                        width={80}
                        height={60}
                        fit="cover"
                      />
                    ))}
                  </Group>
                </Box>
              )}

              {editingId &&
                form.values.image_paths.length > 0 &&
                previewGalleryImages.length === 0 && (
                  <Box mb="md">
                    <Text size="sm" mb="xs">
                      {t("exhibitionmanagement.form.currentGalleryImages")}
                    </Text>
                    <Group spacing="xs">
                      {form.values.image_paths.slice(0, 5).map((img, index) => (
                        <Image
                          key={index}
                          src={`${BASE_IMAGE_URL}${img}`}
                          width={80}
                          height={60}
                          fit="cover"
                        />
                      ))}
                      {form.values.image_paths.length > 5 && (
                        <Badge>+{form.values.image_paths.length - 5}</Badge>
                      )}
                    </Group>
                  </Box>
                )}
            </>
          )}

          <Group position="right" mt="xl">
            <Button
              variant="default"
              onClick={() => {
                closeModal();
                resetForm();
              }}
            >
              {t("exhibitionmanagement.buttons.cancel")}
            </Button>
            <Button type="submit">
              {editingId
                ? t("exhibitionmanagement.buttons.update")
                : t("exhibitionmanagement.buttons.create")}
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t("exhibitionmanagement.modal.deleteTitle")}
      >
        <LoadingOverlay visible={deleteLoading} />
        <Text mb="md">
          {t("exhibitionmanagement.modal.deleteConfirmation")}
        </Text>
        <Group position="right">
          <Button variant="default" onClick={() => setDeleteConfirmOpen(false)}>
            {t("exhibitionmanagement.buttons.cancel")}
          </Button>
          <Button
            color="red"
            onClick={() => itemToDelete && handleDelete(itemToDelete)}
          >
            {t("exhibitionmanagement.buttons.delete")}
          </Button>
        </Group>
      </Modal>
    </Box>
  );
};

export default ExhibitionManagement;