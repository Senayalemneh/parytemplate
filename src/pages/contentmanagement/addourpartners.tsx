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
  Image,
  FileInput,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  createPartner,
  getPartners,
  getPartnerById,
  deletePartner,
  updatePartner,
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

interface Partner {
  id: number;
  name: {
    am: string;
    en: string;
  };
  logo: string;
  category: {
    am: string;
    en: string;
  };
  description: {
    am: string;
    en: string;
  };
  featured: boolean;
  link: string;
  created_at: string;
  updated_at: string;
}

const PartnerManagement = () => {
  const { t } = useTranslation();
  const [partnersData, setPartnersData] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const mockCategories = [
    {
      value: "Governmental",
      label: t("partnermanagementadmin.categories.governmental"),
    },
    {
      value: "Technology",
      label: t("partnermanagementadmin.categories.technology"),
    },
    { value: "Finance", label: t("partnermanagementadmin.categories.finance") },
    {
      value: "Education",
      label: t("partnermanagementadmin.categories.education"),
    },
    {
      value: "Healthcare",
      label: t("partnermanagementadmin.categories.healthcare"),
    },
    { value: "Other", label: t("partnermanagementadmin.categories.other") },
  ];

  const form = useForm({
    initialValues: {
      name_am: "",
      name_en: "",
      logo: "",
      category_am: "",
      category_en: "",
      description_am: "",
      description_en: "",
      featured: false,
      link: "",
      imageFile: null as File | null,
    },
    validate: {
      name_am: (value) =>
        value ? null : t("partnermanagementadmin.errors.name_am"),
      name_en: (value) =>
        value ? null : t("partnermanagementadmin.errors.name_en"),
      category_en: (value) =>
        value ? null : t("partnermanagementadmin.errors.category"),
      link: (value) =>
        value &&
        !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(
          value
        )
          ? t("partnermanagementadmin.errors.invalidUrl")
          : null,
    },
  });

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const response = await getPartners();
      setPartnersData(response || []);
      showNotification(
        t("partnermanagementadmin.notifications.loadSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch partners:", error);
      showNotification(
        t("partnermanagementadmin.notifications.loadError"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [t]);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("partnermanagementadmin.notifications.success")
          : t("partnermanagementadmin.notifications.error"),
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

  const uploadImage = async (file: File) => {
    try {
      setFileUploading(true);
      const uploadResponse = await uploadFile(file, "partners");
      showNotification(
        t("partnermanagementadmin.notifications.uploadSuccess"),
        "success"
      );
      return uploadResponse.file.path;
    } catch (error) {
      console.error("File upload error:", error);
      showNotification(
        t("partnermanagementadmin.notifications.uploadError"),
        "error"
      );
      throw error;
    } finally {
      setFileUploading(false);
    }
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (!file.type.startsWith("image/")) {
        showNotification(
          t("partnermanagementadmin.errors.invalidImageType"),
          "error"
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showNotification(t("partnermanagementadmin.errors.imageSize"), "error");
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

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);

      if (editingId && (isNaN(editingId) || editingId <= 0)) {
        showNotification(t("partnermanagementadmin.errors.invalidId"), "error");
        return;
      }

      let logoPath = values.logo;

      if (values.imageFile) {
        try {
          logoPath = await uploadImage(values.imageFile);
        } catch (error) {
          return;
        }
      } else if (!editingId && !logoPath) {
        showNotification(
          t("partnermanagementadmin.errors.logoRequired"),
          "error"
        );
        return;
      }

      const payload = {
        name: {
          en: values.name_en,
          am: values.name_am,
        },
        category: {
          en: values.category_en,
          am: values.category_am || values.category_en,
        },
        description: {
          en: values.description_en,
          am: values.description_am,
        },
        featured: values.featured,
        link: values.link,
        logo: logoPath,
      };

      if (editingId) {
        await updatePartner(editingId, payload);
        showNotification(
          t("partnermanagementadmin.notifications.updateSuccess"),
          "success"
        );
      } else {
        await createPartner(payload);
        showNotification(
          t("partnermanagementadmin.notifications.createSuccess"),
          "success"
        );
      }

      resetAndCloseModal();
      fetchPartners();
    } catch (error) {
      console.error("Error saving partner:", error);
      showNotification(
        t(
          editingId
            ? "partnermanagementadmin.notifications.updateError"
            : "partnermanagementadmin.notifications.createError"
        ),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    if (isNaN(id) || id <= 0) {
      showNotification(t("partnermanagementadmin.errors.invalidId"), "error");
      return;
    }

    try {
      setLoading(true);
      const item = await getPartnerById(id);
      if (!item) {
        showNotification(t("partnermanagementadmin.errors.notFound"), "error");
        return;
      }

      form.setValues({
        name_am: item.name?.am || "",
        name_en: item.name?.en || "",
        logo: item.logo || "",
        category_am: item.category?.am || "",
        category_en: item.category?.en || "",
        description_am: item.description?.am || "",
        description_en: item.description?.en || "",
        featured: item.featured || false,
        link: item.link || "",
        imageFile: null,
      });

      setPreviewImage(
        item.logo
          ? `https://bole.prosperity.boleprosperityparty.org/CMSFiles/${item.logo}`
          : null
      );
      setEditingId(item.id);
      openModal();
    } catch (error) {
      console.error("Error loading partner for edit:", error);
      showNotification(t("partnermanagementadmin.errors.loadError"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(true);
      await deletePartner(id);
      showNotification(
        t("partnermanagementadmin.notifications.deleteSuccess"),
        "success"
      );
      fetchPartners();
    } catch (error) {
      console.error("Error deleting partner:", error);
      showNotification(
        t("partnermanagementadmin.notifications.deleteError"),
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

  const columns: MRT_ColumnDef<Partner>[] = [
    {
      accessorKey: "id",
      header: t("partnermanagementadmin.table.id"),
      size: 80,
    },
    {
      accessorKey: "logo",
      header: t("partnermanagementadmin.table.logo"),
      Cell: ({ cell }) => (
        <Image
          src={`https://bole.prosperity.boleprosperityparty.org/CMSFiles/${cell.getValue<string>()}`}
          width={60}
          height={40}
          fit="contain"
          withPlaceholder
          placeholder={<IconPhoto size={24} />}
        />
      ),
      size: 100,
    },
    {
      accessorFn: (row) => row.name?.am || t("partnermanagementadmin.table.na"),
      header: t("partnermanagementadmin.table.nameAm"),
      id: "name_am",
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 150 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorFn: (row) => row.name?.en || t("partnermanagementadmin.table.na"),
      header: t("partnermanagementadmin.table.nameEn"),
      id: "name_en",
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 150 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorFn: (row) =>
        row.category?.en || t("partnermanagementadmin.table.na"),
      header: t("partnermanagementadmin.table.category"),
      id: "category",
      Cell: ({ cell }) => (
        <Badge color="blue" variant="light">
          {cell.getValue<string>()}
        </Badge>
      ),
    },
    {
      accessorKey: "link",
      header: t("partnermanagementadmin.table.website"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value ? (
          <Box sx={{ maxWidth: 200 }}>
            <div className="truncate">
              <a href={value} target="_blank" rel="noreferrer">
                {value}
              </a>
            </div>
          </Box>
        ) : (
          t("partnermanagementadmin.table.na")
        );
      },
    },
    {
      accessorKey: "featured",
      header: t("partnermanagementadmin.table.status"),
      Cell: ({ cell }) => (
        <Badge
          color={cell.getValue<boolean>() ? "green" : "orange"}
          variant="filled"
        >
          {cell.getValue<boolean>()
            ? t("partnermanagementadmin.table.featured")
            : t("partnermanagementadmin.table.regular")}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: t("partnermanagementadmin.table.createdAt"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value
          ? new Date(value).toLocaleString()
          : t("partnermanagementadmin.table.na");
      },
    },
    {
      id: "actions",
      header: t("partnermanagementadmin.table.actions"),
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
        <Title order={2}>{t("partnermanagementadmin.title")}</Title>
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
          {t("partnermanagementadmin.addButton")}
        </Button>
      </Group>
      <Divider my="md" />

      <Box className="h-[calc(100vh-200px)] w-full overflow-auto">
        <MantineReactTable
          columns={columns}
          data={partnersData}
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
            ? t("partnermanagementadmin.editTitle")
            : t("partnermanagementadmin.createTitle")
        }
        size="lg"
        overlayProps={{ blur: 3 }}
      >
        {(loading || fileUploading) && <Loader />}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Group grow mb="md">
            <TextInput
              label={t("partnermanagementadmin.form.nameAm")}
              required
              placeholder={t("partnermanagementadmin.form.nameAmPlaceholder")}
              {...form.getInputProps("name_am")}
            />
            <TextInput
              label={t("partnermanagementadmin.form.nameEn")}
              required
              placeholder={t("partnermanagementadmin.form.nameEnPlaceholder")}
              {...form.getInputProps("name_en")}
            />
          </Group>

          <TextInput
            label={t("partnermanagementadmin.form.categoryEn")}
            required
            placeholder={t("partnermanagementadmin.form.categoryPlaceholder")}
            {...form.getInputProps("category_en")}
          />

          <TextInput
            label={t("partnermanagementadmin.form.categoryAm")}
            required
            placeholder={t("partnermanagementadmin.form.categoryAmPlaceholder")}
            {...form.getInputProps("category_am")}
          />

          <Group grow mb="md">
            <Textarea
              label={t("partnermanagementadmin.form.descriptionAm")}
              placeholder={t(
                "partnermanagementadmin.form.descriptionAmPlaceholder"
              )}
              {...form.getInputProps("description_am")}
            />
            <Textarea
              label={t("partnermanagementadmin.form.descriptionEn")}
              placeholder={t(
                "partnermanagementadmin.form.descriptionEnPlaceholder"
              )}
              {...form.getInputProps("description_en")}
            />
          </Group>

          <TextInput
            label={t("partnermanagementadmin.form.website")}
            placeholder={t("partnermanagementadmin.form.websitePlaceholder")}
            {...form.getInputProps("link")}
            mb="md"
          />

          <FileInput
            label={t("partnermanagementadmin.form.logo")}
            placeholder={t("partnermanagementadmin.form.logoPlaceholder")}
            accept="image/png,image/jpeg,image/webp"
            icon={<IconUpload size={14} />}
            onChange={handleFileChange}
            mb="md"
            description={t("partnermanagementadmin.form.logoDescription")}
            clearable
            required={!editingId}
            {...form.getInputProps("imageFile")}
          />

          {(previewImage || form.values.logo) && (
            <Box mb="md">
              <Image
                src={
                  previewImage ||
                  `https://bole.prosperity.boleprosperityparty.org/CMSFiles/${form.values.logo}`
                }
                height={160}
                fit="contain"
                withPlaceholder
                alt={t("partnermanagementadmin.form.preview")}
              />
            </Box>
          )}

          <Switch
            label={t("partnermanagementadmin.form.featured")}
            checked={form.values.featured}
            onChange={(e) =>
              form.setFieldValue("featured", e.currentTarget.checked)
            }
            mb="md"
          />

          <Group position="right" mt="xl">
            <Button variant="default" onClick={resetAndCloseModal}>
              {t("partnermanagementadmin.cancelButton")}
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              loading={loading || fileUploading}
            >
              {editingId
                ? t("partnermanagementadmin.updateButton")
                : t("partnermanagementadmin.createButton")}
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t("partnermanagementadmin.deleteTitle")}
        centered
      >
        {deleteLoading && <Loader />}
        <Box>
          <Text size="sm" mb="md">
            {t("partnermanagementadmin.deleteConfirmation")}
          </Text>
          <Group position="right" mt="md">
            <Button
              variant="default"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              {t("partnermanagementadmin.cancelButton")}
            </Button>
            <Button
              color="red"
              loading={deleteLoading}
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
            >
              {t("partnermanagementadmin.deleteButton")}
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
};

export default PartnerManagement;
