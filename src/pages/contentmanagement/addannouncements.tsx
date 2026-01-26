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
  Select,
  Badge,
  FileInput,
  Image,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  deleteAnnouncement,
  updateAnnouncement,
  uploadFile,
} from "../../services/api/main";
import {
  IconPencil,
  IconTrash,
  IconPlus,
  IconCheck,
  IconX,
  IconPin,
  IconUpload,
  IconPhoto,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { DatePicker } from "@mantine/dates";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/loader";

interface AnnouncementItem {
  id: number;
  title: {
    am: string;
    en: string;
  };
  content: {
    am: string;
    en: string;
  };
  date: string;
  category: {
    am: string;
    en: string;
  };
  image: string;
  author: {
    am: string;
    en: string;
  };
  isPinned: boolean;
  created_at: string;
  updated_at: string;
}

const mockCategories = [
  { value: "HR", label: "HR" },
  { value: "General", label: "General" },
  { value: "IT", label: "IT" },
  { value: "Finance", label: "Finance" },
];

const Announcements = () => {
  const { t } = useTranslation();
  const [announcementsData, setAnnouncementsData] = useState<
    AnnouncementItem[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const form = useForm({
    initialValues: {
      title_en: "",
      title_am: "",
      content_en: "",
      content_am: "",
      date: new Date(),
      category_en: "",
      category_am: "",
      author_en: "",
      author_am: "",
      isPinned: false,
      image_path: "",
      imageFile: null as File | null,
    },
    validate: {
      title_en: (value) =>
        value ? null : t("announcementadmin.validation.title_en"),
      title_am: (value) =>
        value ? null : t("announcementadmin.validation.title_am"),
      content_en: (value) =>
        value ? null : t("announcementadmin.validation.content_en"),
      content_am: (value) =>
        value ? null : t("announcementadmin.validation.content_am"),
      date: (value) => (value ? null : t("announcementadmin.validation.date")),
      category_en: (value) =>
        value ? null : t("announcementadmin.validation.category"),
      category_am: (value) =>
        value ? null : t("announcementadmin.validation.category"),
      author_en: (value) =>
        value ? null : t("announcementadmin.validation.author_en"),
      author_am: (value) =>
        value ? null : t("announcementadmin.validation.author_am"),
      imageFile: (value, values) =>
        !editingId && !value && !values.image_path
          ? t("announcementadmin.validation.image")
          : null,
    },
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await getAnnouncements();
      setAnnouncementsData(response || []);
      showNotification(
        t("announcementadmin.notification.load_success"),
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      showNotification(t("announcementadmin.notification.load_error"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("announcementadmin.notification.success")
          : t("announcementadmin.notification.error"),
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
    form.reset();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);

      if (editingId && (isNaN(editingId) || editingId <= 0)) {
        showNotification(
          t("announcementadmin.notification.invalid_id"),
          "error"
        );
        return;
      }

      let imagePath = values.image_path;

      if (values.imageFile) {
        setFileUploading(true);
        try {
          const uploadResponse = await uploadFile(
            values.imageFile,
            "announcements"
          );
          imagePath = uploadResponse.file.path;
          showNotification(
            t("announcementadmin.notification.image_success"),
            "success"
          );
        } catch (error) {
          console.error("File upload error:", error);
          showNotification(
            t("announcementadmin.notification.image_error"),
            "error"
          );
          return;
        } finally {
          setFileUploading(false);
        }
      } else if (!editingId && !imagePath) {
        showNotification(
          t("announcementadmin.notification.image_required"),
          "error"
        );
        return;
      }

      const payload = {
        title: {
          en: values.title_en,
          am: values.title_am,
        },
        content: {
          en: values.content_en,
          am: values.content_am,
        },
        date: format(values.date, "yyyy-MM-dd"),
        category: {
          en: values.category_en,
          am: values.category_am,
        },
        author: {
          en: values.author_en,
          am: values.author_am,
        },
        isPinned: values.isPinned,
        image: imagePath,
      };

      if (editingId) {
        await updateAnnouncement(editingId, payload);
        showNotification(
          t("announcementadmin.notification.update_success"),
          "success"
        );
      } else {
        await createAnnouncement(payload);
        showNotification(
          t("announcementadmin.notification.create_success"),
          "success"
        );
      }

      resetAndCloseModal();
      fetchAnnouncements();
    } catch (error) {
      console.error("Error saving announcement:", error);
      showNotification(
        t(
          `announcementadmin.notification.${
            editingId ? "update_error" : "create_error"
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
      showNotification(t("announcementadmin.notification.invalid_id"), "error");
      return;
    }

    try {
      setLoading(true);
      const item = await getAnnouncementById(id);
      if (!item) {
        showNotification(
          t("announcementadmin.notification.not_found"),
          "error"
        );
        return;
      }

      form.setValues({
        title_en: item.title?.en || "",
        title_am: item.title?.am || "",
        content_en: item.content?.en || "",
        content_am: item.content?.am || "",
        date: item.date ? new Date(item.date) : new Date(),
        category_en: item.category?.en || "",
        category_am: item.category?.am || "",
        author_en: item.author?.en || "",
        author_am: item.author?.am || "",
        isPinned: item.isPinned || false,
        image_path: item.image || "",
        imageFile: null,
      });

      setPreviewImage(
        item.image
          ? `${import.meta.env.VITE_FILE_API}${item.image}`
          : null
      );
      setEditingId(item.id);
      openModal();
    } catch (error) {
      console.error("Error loading announcement for edit:", error);
      showNotification(
        t("announcementadmin.notification.load_edit_error"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(true);
      await deleteAnnouncement(id);
      showNotification(
        t("announcementadmin.notification.delete_success"),
        "success"
      );
      fetchAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      showNotification(
        t("announcementadmin.notification.delete_error"),
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

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (!file.type.startsWith("image/")) {
        showNotification(
          t("announcementadmin.notification.invalid_image_type"),
          "error"
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showNotification(
          t("announcementadmin.notification.image_size"),
          "error"
        );
        return;
      }

      form.setFieldValue("imageFile", file);
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

  const columns: MRT_ColumnDef<AnnouncementItem>[] = [
    {
      accessorKey: "id",
      header: t("announcementadmin.table.headers.id"),
      size: 80,
    },
    {
      accessorFn: (row) => row.title?.am || t("announcementadmin.table.na"),
      header: t("announcementadmin.table.headers.title_am"),
      id: "title_am",
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorFn: (row) => row.title?.en || t("announcementadmin.table.na"),
      header: t("announcementadmin.table.headers.title_en"),
      id: "title_en",
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorFn: (row) => row.category?.en || t("announcementadmin.table.na"),
      header: t("announcementadmin.table.headers.category"),
      id: "category",
      Cell: ({ cell }) => (
        <Badge color="blue" variant="light">
          {cell.getValue<string>()}
        </Badge>
      ),
    },
    {
      accessorKey: "date",
      header: t("announcementadmin.table.headers.date"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value
          ? new Date(value).toLocaleDateString()
          : t("announcementadmin.table.na");
      },
    },
    {
      accessorKey: "isPinned",
      header: t("announcementadmin.table.headers.pinned"),
      Cell: ({ cell }) => (
        <Badge
          color={cell.getValue<boolean>() ? "yellow" : "gray"}
          variant="filled"
          leftSection={cell.getValue<boolean>() ? <IconPin size={12} /> : null}
        >
          {cell.getValue<boolean>()
            ? t("announcementadmin.table.pinned")
            : t("announcementadmin.table.normal")}
        </Badge>
      ),
    },
    {
      accessorKey: "image",
      header: t("announcementadmin.table.headers.image"),
      Cell: ({ cell }) => (
        <Image
          src={`${import.meta.env.VITE_FILE_API}${cell.getValue<string>()}`}
          width={60}
          height={60}
          fit="cover"
          withPlaceholder
          placeholder={<IconPhoto size={24} />}
        />
      ),
    },
    {
      id: "actions",
      header: t("announcementadmin.table.headers.actions"),
      Cell: ({ row }) => {
        const itemId = row.original.id;
        return (
          <Group spacing="xs">
            <ActionIcon
              color="blue"
              variant="light"
              onClick={() => handleEdit(itemId)}
              title={t("announcementadmin.actions.edit")}
            >
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon
              color="red"
              variant="light"
              onClick={() => openDeleteConfirm(itemId)}
              title={t("announcementadmin.actions.delete")}
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
        <Title order={2}>{t("announcementadmin.title")}</Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={() => {
            form.reset();
            setEditingId(null);
            setPreviewImage(null);
            openModal();
          }}
          variant="gradient"
          gradient={{ from: "indigo", to: "cyan" }}
        >
          {t("announcementadmin.add_button")}
        </Button>
      </Group>
      <Divider my="md" />

      <Box className="h-[calc(100vh-200px)] w-full overflow-auto">
        <MantineReactTable
          columns={columns}
          data={announcementsData}
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
          `announcementadmin.modal.${editingId ? "edit_title" : "create_title"}`
        )}
        size="lg"
        overlayProps={{ blur: 3 }}
      >
        {(loading || fileUploading) && <Loader />}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Group grow mb="md">
            <TextInput
              label={t("announcementadmin.form.title_am")}
              required
              placeholder={t("announcementadmin.form.placeholder.title_am")}
              {...form.getInputProps("title_am")}
            />
            <TextInput
              label={t("announcementadmin.form.title_en")}
              required
              placeholder={t("announcementadmin.form.placeholder.title_en")}
              {...form.getInputProps("title_en")}
            />
          </Group>

          <Group grow mb="md">
            <Textarea
              label={t("announcementadmin.form.content_am")}
              required
              placeholder={t("announcementadmin.form.placeholder.content_am")}
              {...form.getInputProps("content_am")}
            />
            <Textarea
              label={t("announcementadmin.form.content_en")}
              required
              placeholder={t("announcementadmin.form.placeholder.content_en")}
              {...form.getInputProps("content_en")}
            />
          </Group>

          <Group grow mb="md">
            <TextInput
              label={t("announcementadmin.form.author_am")}
              required
              placeholder={t("announcementadmin.form.placeholder.author_am")}
              {...form.getInputProps("author_am")}
            />
            <TextInput
              label={t("announcementadmin.form.author_en")}
              required
              placeholder={t("announcementadmin.form.placeholder.author_en")}
              {...form.getInputProps("author_en")}
            />
          </Group>

          <Group grow mb="md">
            <Select
              label={t("announcementadmin.form.category_en")}
              required
              placeholder={t("announcementadmin.form.placeholder.category")}
              data={mockCategories}
              {...form.getInputProps("category_en")}
            />
            <Select
              label={t("announcementadmin.form.category_am")}
              required
              placeholder={t("announcementadmin.form.placeholder.category")}
              data={mockCategories}
              {...form.getInputProps("category_am")}
            />
          </Group>

          <Group grow mb="md">
            <DatePicker
              label={t("announcementadmin.form.date")}
              required
              placeholder={t("announcementadmin.form.placeholder.date")}
              {...form.getInputProps("date")}
            />
            <Switch
              label={t("announcementadmin.form.pin_label")}
              checked={form.values.isPinned}
              onChange={(e) =>
                form.setFieldValue("isPinned", e.currentTarget.checked)
              }
              thumbIcon={
                form.values.isPinned ? (
                  <IconPin size={12} color="yellow" stroke={3} />
                ) : undefined
              }
            />
          </Group>

          <FileInput
            label={t("announcementadmin.form.image_label")}
            placeholder={t("announcementadmin.form.placeholder.image")}
            accept="image/png,image/jpeg,image/webp"
            icon={<IconUpload size={14} />}
            onChange={handleFileChange}
            mb="md"
            description={t("announcementadmin.form.image_description")}
            clearable
            required={!editingId}
            {...form.getInputProps("imageFile")}
          />

          {(previewImage || form.values.image_path) && (
            <Box mb="md">
              <Image
                src={
                  previewImage ||
                  `${import.meta.env.VITE_FILE_API}${form.values.image_path}`
                }
                height={160}
                fit="contain"
                withPlaceholder
                alt={t("announcementadmin.form.image_alt")}
              />
            </Box>
          )}

          <Group position="right" mt="xl">
            <Button variant="default" onClick={resetAndCloseModal}>
              {t("announcementadmin.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              disabled={loading || fileUploading}
            >
              {t(
                `announcementadmin.buttons.${editingId ? "update" : "create"}`
              )}
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t("announcementadmin.delete_modal.title")}
        centered
      >
        {deleteLoading && <Loader />}
        <Box>
          <Text size="sm" mb="md">
            {t("announcementadmin.delete_modal.message")}
          </Text>
          <Group position="right" mt="md">
            <Button
              variant="default"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              {t("announcementadmin.buttons.cancel")}
            </Button>
            <Button
              color="red"
              loading={deleteLoading}
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
            >
              {t("announcementadmin.buttons.delete")}
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
};

export default Announcements;
