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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  createCarousel,
  getCarousels,
  getCarouselById,
  deleteCarousel,
  updateCarousel,
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
import Loader from "../../components/common/loader";

interface CarouselItem {
  id: number;
  imgURL: string;
  title: {
    am: string;
    en: string;
  };
  description: {
    am: string;
    en: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CarouselManagement = () => {
  const { t } = useTranslation();
  const [carouselData, setCarouselData] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const fetchCarousels = async () => {
    setLoading(true);
    try {
      const response = await getCarousels();
      setCarouselData(response || []);
      showNotification(
        t("carouselmanagement.notifications.loadSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch carousels:", error);
      showNotification(
        t("carouselmanagement.notifications.loadError"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarousels();
  }, []);

  const form = useForm({
    initialValues: {
      title_am: "",
      title_en: "",
      description_am: "",
      description_en: "",
      imgURL: "",
      is_active: true,
      imageFile: null as File | null,
    },
    validate: {
      title_am: (value) =>
        value ? null : t("carouselmanagement.validation.titleAmRequired"),
      title_en: (value) =>
        value ? null : t("carouselmanagement.validation.titleEnRequired"),
      description_am: (value) =>
        value ? null : t("carouselmanagement.validation.descAmRequired"),
      description_en: (value) =>
        value ? null : t("carouselmanagement.validation.descEnRequired"),
      imageFile: (value, values) =>
        !editingId && !value && !values.imgURL
          ? t("carouselmanagement.validation.imageRequired")
          : null,
    },
  });

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("carouselmanagement.notifications.success")
          : t("carouselmanagement.notifications.error"),
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
          t("carouselmanagement.notifications.invalidId"),
          "error"
        );
        return;
      }

      let imgURL = values.imgURL;

      if (values.imageFile) {
        setFileUploading(true);
        try {
          const uploadResponse = await uploadFile(values.imageFile, "carousel");
          imgURL = uploadResponse.file.path;
          showNotification(
            t("carouselmanagement.notifications.uploadSuccess"),
            "success"
          );
        } catch (error) {
          console.error("File upload error:", error);
          showNotification(
            t("carouselmanagement.notifications.uploadError"),
            "error"
          );
          return;
        } finally {
          setFileUploading(false);
        }
      } else if (!editingId && !imgURL) {
        showNotification(
          t("carouselmanagement.notifications.imageRequired"),
          "error"
        );
        return;
      }

      const payload = {
        imgURL,
        title: {
          en: values.title_en,
          am: values.title_am,
        },
        description: {
          en: values.description_en,
          am: values.description_am,
        },
        is_active: values.is_active,
      };

      if (editingId) {
        await updateCarousel(editingId, payload);
        showNotification(
          t("carouselmanagement.notifications.updateSuccess"),
          "success"
        );
      } else {
        await createCarousel(payload);
        showNotification(
          t("carouselmanagement.notifications.createSuccess"),
          "success"
        );
      }

      resetAndCloseModal();
      fetchCarousels();
    } catch (error) {
      console.error("Error saving carousel:", error);
      showNotification(
        t(
          editingId ? "notifications.updateError" : "notifications.createError"
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
        t("carouselmanagement.notifications.invalidId"),
        "error"
      );
      return;
    }

    try {
      const item = await getCarouselById(id);
      if (!item) {
        showNotification(
          t("carouselmanagement.notifications.itemNotFound"),
          "error"
        );
        return;
      }

      form.setValues({
        title_am: item.title?.am || "",
        title_en: item.title?.en || "",
        description_am: item.description?.am || "",
        description_en: item.description?.en || "",
        imgURL: item.imgURL || "",
        is_active: item.is_active || true,
        imageFile: null,
      });

      setPreviewImage(item.imgURL || null);
      setEditingId(item.id);
      openModal();
    } catch (error) {
      console.error("Error loading carousel for edit:", error);
      showNotification(
        t("carouselmanagement.notifications.loadEditError"),
        "error"
      );
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(true);
      await deleteCarousel(id);
      showNotification(
        t("carouselmanagement.notifications.deleteSuccess"),
        "success"
      );
      fetchCarousels();
    } catch (error) {
      console.error("Error deleting carousel:", error);
      showNotification(
        t("carouselmanagement.notifications.deleteError"),
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
          t("carouselmanagement.notifications.invalidImageType"),
          "error"
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showNotification(
          t("carouselmanagement.notifications.imageSizeLimit"),
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

  const columns: MRT_ColumnDef<CarouselItem>[] = [
    {
      accessorKey: "id",
      header: t("carouselmanagement.table.columns.id"),
      size: 80,
    },
    {
      accessorFn: (row) => row.title?.am || t("table.na"),
      header: t("carouselmanagement.table.columns.titleAm"),
      id: "title_am",
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorFn: (row) => row.title?.en || t("table.na"),
      header: t("carouselmanagement.table.columns.titleEn"),
      id: "title_en",
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorFn: (row) => row.description?.en || t("table.na"),
      header: t("carouselmanagement.table.columns.description"),
      id: "description",
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 300 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorKey: "imgURL",
      header: t("carouselmanagement.table.columns.image"),
      Cell: ({ cell }) => (
        <Image
          src={`https://bole.prosperity.boleprosperityparty.org/CMSFiles/${cell.getValue<string>()}`}
          width={60}
          height={40}
          fit="cover"
          withPlaceholder
          placeholder={<IconPhoto size={24} />}
        />
      ),
    },
    {
      accessorKey: "is_active",
      header: t("carouselmanagement.table.columns.status"),
      Cell: ({ cell }) => (
        <Badge
          color={cell.getValue<boolean>() ? "green" : "orange"}
          variant="filled"
        >
          {cell.getValue<boolean>() ? t("status.active") : t("status.inactive")}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: t("carouselmanagement.table.columns.createdAt"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value ? new Date(value).toLocaleString() : t("table.na");
      },
    },
    {
      id: "actions",
      header: t("carouselmanagement.table.columns.actions"),
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

  return (
    <Box p="md" pos="relative">
      {loading && <Loader />}
      <Group position="apart" mb="md">
        <Title order={2}>{t("carouselmanagement.title")}</Title>
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
          {t("carouselmanagement.addButton")}
        </Button>
      </Group>
      <Divider my="md" />

      <Box className="h-[calc(100vh-200px)] w-full overflow-auto">
        <MantineReactTable
          columns={columns}
          data={carouselData}
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
            ? t("carouselmanagement.modal.editTitle")
            : t("carouselmanagement.modal.createTitle")
        }
        size="lg"
        overlayProps={{ blur: 3 }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Group grow mb="md">
            <TextInput
              label={t("carouselmanagement.form.titleAm")}
              required
              placeholder={t("carouselmanagement.form.titleAmPlaceholder")}
              {...form.getInputProps("title_am")}
            />
            <TextInput
              label={t("carouselmanagement.form.titleEn")}
              required
              placeholder={t("carouselmanagement.form.titleEnPlaceholder")}
              {...form.getInputProps("title_en")}
            />
          </Group>

          <Group grow mb="md">
            <Textarea
              label={t("carouselmanagement.form.descAm")}
              required
              placeholder={t("carouselmanagement.form.descAmPlaceholder")}
              {...form.getInputProps("description_am")}
            />
            <Textarea
              label={t("carouselmanagement.form.descEn")}
              required
              placeholder={t("carouselmanagement.form.descEnPlaceholder")}
              {...form.getInputProps("description_en")}
            />
          </Group>

          <FileInput
            label={t("carouselmanagement.form.imageLabel")}
            placeholder={t("carouselmanagement.form.imagePlaceholder")}
            accept="image/png,image/jpeg,image/webp"
            icon={<IconUpload size={14} />}
            onChange={handleFileChange}
            mb="md"
            description={t("carouselmanagement.form.imageDescription")}
            clearable
            required={!editingId}
            {...form.getInputProps("imageFile")}
          />

          {(previewImage || form.values.imgURL) && (
            <Box mb="md">
              <Image
                src={
                  previewImage ||
                  `https://bole.prosperity.boleprosperityparty.org/CMSFiles/${form.values.imgURL}`
                }
                height={160}
                fit="contain"
                withPlaceholder
                alt={t("carouselmanagement.form.imagePreviewAlt")}
              />
            </Box>
          )}

          <Switch
            label={t("carouselmanagement.form.activeLabel")}
            checked={form.values.is_active}
            onChange={(e) =>
              form.setFieldValue("is_active", e.currentTarget.checked)
            }
            mb="md"
          />

          <Group position="right" mt="xl">
            <Button variant="default" onClick={resetAndCloseModal}>
              {t("carouselmanagement.form.cancelButton")}
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              loading={loading || fileUploading}
            >
              {editingId
                ? t("carouselmanagement.form.updateButton")
                : t("carouselmanagement.form.createButton")}
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t("carouselmanagement.deleteModal.title")}
        centered
      >
        <Box>
          <Text size="sm" mb="md">
            {t("carouselmanagement.deleteModal.message")}
          </Text>
          <Group position="right" mt="md">
            <Button
              variant="default"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              {t("carouselmanagement.deleteModal.cancelButton")}
            </Button>
            <Button
              color="red"
              loading={deleteLoading}
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
            >
              {t("carouselmanagement.deleteModal.deleteButton")}
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
};

export default CarouselManagement;
