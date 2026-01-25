import {
  TextInput,
  Button,
  Group,
  Box,
  Title,
  Divider,
  Modal,
  ActionIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  createNewsCategory,
  getNewsCategories,
  getNewsCategoryById,
  deleteNewsCategory,
  updateNewsCategory,
} from "../../services/api/main";
import {
  IconPencil,
  IconTrash,
  IconPlus,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/loader";

interface NewsCategory {
  id: number;
  name: {
    am: string;
    en: string;
  };
  slug: string;
  created_at: string;
  updated_at: string;
}

const NewsCategoryManagement = () => {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [
    deleteConfirmOpen,
    { open: openDeleteConfirm, close: closeDeleteConfirm },
  ] = useDisclosure(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const form = useForm({
    initialValues: {
      name_am: "",
      name_en: "",
    },
    validate: {
      name_am: (value) =>
        value ? null : t("newscategorymanagement.form.errors.amRequired"),
      name_en: (value) =>
        value ? null : t("newscategorymanagement.form.errors.enRequired"),
    },
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await getNewsCategories();
      setCategories(response?.data || []);
      showNotification(
        t("newscategorymanagement.notifications.loadSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      showNotification(
        t("newscategorymanagement.notifications.loadError"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [i18n.language]);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("newscategorymanagement.notifications.success")
          : t("newscategorymanagement.notifications.error"),
      message,
      color: type === "success" ? "teal" : "red",
      icon: type === "success" ? <IconCheck size={18} /> : <IconX size={18} />,
      withBorder: true,
    });
  };

  const resetAndCloseModal = () => {
    closeModal();
    setEditingId(null);
    form.reset();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      const payload = {
        name: {
          am: values.name_am,
          en: values.name_en,
        },
      };
      if (editingId) {
        await updateNewsCategory(editingId, payload);
        showNotification(
          t("newscategorymanagement.notifications.updateSuccess"),
          "success"
        );
      } else {
        await createNewsCategory(payload);
        showNotification(
          t("newscategorymanagement.notifications.createSuccess"),
          "success"
        );
      }
      resetAndCloseModal();
      fetchCategories();
    } catch (error: any) {
      console.error("Error saving category:", error);
      showNotification(
        t("newscategorymanagement.notifications.updateError"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      setLoading(true);
      const response = await getNewsCategoryById(id);
      if (!response?.data) {
        showNotification(
          t("newscategorymanagement.notifications.notFound"),
          "error"
        );
        return;
      }
      const category = response.data;
      form.setValues({
        name_am: category.name.am || "",
        name_en: category.name.en || "",
      });
      setEditingId(category.id);
      openModal();
    } catch (error: any) {
      console.error("Error loading category for edit:", error);
      showNotification(
        t("newscategorymanagement.notifications.editError"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeleteLoading(true);
      await deleteNewsCategory(itemToDelete);
      showNotification(
        t("newscategorymanagement.notifications.deleteSuccess"),
        "success"
      );
      fetchCategories();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      showNotification(
        error.response?.data?.message ||
          t("newscategorymanagement.notifications.deleteError"),
        "error"
      );
    } finally {
      setDeleteLoading(false);
      closeDeleteConfirm();
      setItemToDelete(null);
    }
  };

  const confirmDelete = (id: number) => {
    setItemToDelete(id);
    openDeleteConfirm();
  };

  const columns: MRT_ColumnDef<NewsCategory>[] = [
    {
      accessorKey: "id",
      header: t("newscategorymanagement.table.headers.id"),
      size: 80,
    },
    {
      accessorKey: "name.am",
      header: t("newscategorymanagement.table.headers.nameAm"),
    },
    {
      accessorKey: "name.en",
      header: t("newscategorymanagement.table.headers.nameEn"),
    },
    {
      accessorKey: "slug",
      header: t("newscategorymanagement.table.headers.slug"),
    },
    {
      accessorKey: "created_at",
      header: t("newscategorymanagement.table.headers.createdAt"),
      Cell: ({ cell }) =>
        new Date(cell.getValue<string>()).toLocaleString(i18n.language),
    },
    {
      accessorKey: "updated_at",
      header: t("newscategorymanagement.table.headers.updatedAt"),
      Cell: ({ cell }) =>
        new Date(cell.getValue<string>()).toLocaleString(i18n.language),
    },
    {
      id: "actions",
      header: t("newscategorymanagement.table.headers.actions"),
      Cell: ({ row }) => (
        <Group spacing="xs">
          <ActionIcon
            color="blue"
            variant="light"
            onClick={() => handleEdit(row.original.id)}
            title={t("newscategorymanagement.table.actions.edit")}
          >
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon
            color="red"
            variant="light"
            onClick={() => confirmDelete(row.original.id)}
            title={t("newscategorymanagement.table.actions.delete")}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  return (
    <Box p="md" pos="relative">
      {loading && <Loader />}
      <Group position="apart" mb="md">
        <Title order={2}>{t("newscategorymanagement.title")}</Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={() => {
            form.reset();
            setEditingId(null);
            openModal();
          }}
          variant="gradient"
          gradient={{ from: "indigo", to: "cyan" }}
        >
          {t("newscategorymanagement.addButton")}
        </Button>
      </Group>
      <Divider my="md" />
      <Box className="h-[calc(100vh-200px)] w-full overflow-auto">
        <MantineReactTable
          columns={columns}
          data={categories}
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

      {/* Edit/Create Modal */}
      <Modal
        opened={editModalOpen}
        onClose={resetAndCloseModal}
        title={
          editingId
            ? t("newscategorymanagement.modal.editTitle")
            : t("newscategorymanagement.modal.createTitle")
        }
        size="md"
        overlayProps={{ blur: 3 }}
      >
        {loading && <Loader />}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Group grow mb="md">
            <TextInput
              withAsterisk
              label={t("newscategorymanagement.form.labels.nameAm")}
              placeholder={t("newscategorymanagement.form.placeholders.nameAm")}
              {...form.getInputProps("name_am")}
            />
            <TextInput
              withAsterisk
              label={t("newscategorymanagement.form.labels.nameEn")}
              placeholder={t("newscategorymanagement.form.placeholders.nameEn")}
              {...form.getInputProps("name_en")}
            />
          </Group>
          <Group position="right" mt="xl">
            <Button variant="default" onClick={resetAndCloseModal}>
              {t("newscategorymanagement.form.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              disabled={loading}
            >
              {editingId
                ? t("newscategorymanagement.form.buttons.update")
                : t("newscategorymanagement.form.buttons.create")}
            </Button>
          </Group>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteConfirmOpen}
        onClose={closeDeleteConfirm}
        title={t("newscategorymanagement.deleteModal.title")}
        centered
      >
        {deleteLoading && <Loader />}
        <Box>
          <Box size="sm" mb="md">
            {t("newscategorymanagement.deleteModal.message")}
          </Box>
          <Group position="right" mt="md">
            <Button variant="default" onClick={closeDeleteConfirm}>
              {t("newscategorymanagement.deleteModal.buttons.cancel")}
            </Button>
            <Button color="red" loading={deleteLoading} onClick={handleDelete}>
              {t("newscategorymanagement.deleteModal.buttons.delete")}
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
};

export default NewsCategoryManagement;
