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
import { useEffect, useState, useMemo } from "react";
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
  } | null; // Allow null
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
      // Ensure all categories have proper name structure
      const safeCategories = (response?.data || []).map((category: any) => ({
        ...category,
        name: category.name || { am: "", en: "" } // Provide default if null
      }));
      setCategories(safeCategories);
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
  }, []);

  // Helper function to get localized name with null safety
  const getLocalizedName = (category: NewsCategory) => {
    // Check if name exists and is not null/undefined
    if (!category.name) {
      return t("newscategorymanagement.table.notAvailable");
    }
    
    const currentLang = i18n.language;
    
    // Type-safe access with fallbacks
    if (currentLang === 'am' && category.name.am) {
      return category.name.am;
    }
    
    // Default to English if available
    if (category.name.en) {
      return category.name.en;
    }
    
    // Fallback to Amharic if English not available
    if (category.name.am) {
      return category.name.am;
    }
    
    return t("newscategorymanagement.table.notAvailable");
  };

  // Helper function to format date in current locale
  const formatLocalizedDate = (dateString: string) => {
    if (!dateString) {
      return t("newscategorymanagement.table.notAvailable");
    }
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString(i18n.language);
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return dateString;
    }
  };

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
          am: values.name_am.trim(),
          en: values.name_en.trim(),
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
        name_am: category.name?.am || "",
        name_en: category.name?.en || "",
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

  // Memoize columns to prevent unnecessary re-renders
  const columns = useMemo<MRT_ColumnDef<NewsCategory>[]>(
    () => [
      {
        accessorKey: "id",
        header: t("newscategorymanagement.table.headers.id"),
        size: 80,
      },
      {
        id: "name", // Add unique id for the column
        header: t("newscategorymanagement.table.headers.name"),
        accessorFn: (row) => getLocalizedName(row),
        Cell: ({ cell }) => {
          return (
            <Box sx={{ maxWidth: 200 }}>
              <div className="truncate">{cell.getValue<string>()}</div>
            </Box>
          );
        },
      },
      {
        accessorKey: "slug",
        header: t("newscategorymanagement.table.headers.slug"),
        Cell: ({ cell }) => cell.getValue<string>() || t("newscategorymanagement.table.notAvailable"),
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: t("newscategorymanagement.table.headers.createdAt"),
        Cell: ({ cell }) => formatLocalizedDate(cell.getValue<string>()),
      },
      {
        id: "updated_at",
        accessorKey: "updated_at",
        header: t("newscategorymanagement.table.headers.updatedAt"),
        Cell: ({ cell }) => formatLocalizedDate(cell.getValue<string>()),
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
    ],
    [t, i18n.language] // Recreate columns when language changes
  );

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
          localization={{
            // Localize table controls as well
            actions: t("newscategorymanagement.table.actions.actions", { defaultValue: "Actions" }),
            cancel: t("newscategorymanagement.table.actions.cancel", { defaultValue: "Cancel" }),
            clearFilter: t("newscategorymanagement.table.actions.clearFilter", { defaultValue: "Clear Filter" }),
            clearSearch: t("newscategorymanagement.table.actions.clearSearch", { defaultValue: "Clear Search" }),
            columnActions: t("newscategorymanagement.table.actions.columnActions", { defaultValue: "Column Actions" }),
            edit: t("newscategorymanagement.table.actions.edit", { defaultValue: "Edit" }),
            filterByColumn: t("newscategorymanagement.table.actions.filterByColumn", { defaultValue: "Filter by {column}" }),
            filterMode: t("newscategorymanagement.table.actions.filterMode", { defaultValue: "Filter Mode" }),
            grouping: t("newscategorymanagement.table.actions.grouping", { defaultValue: "Grouping" }),
            hideAll: t("newscategorymanagement.table.actions.hideAll", { defaultValue: "Hide All" }),
            hideColumn: t("newscategorymanagement.table.actions.hideColumn", { defaultValue: "Hide Column" }),
            sortByColumnAsc: t("newscategorymanagement.table.actions.sortByColumnAsc", { defaultValue: "Sort by {column} ascending" }),
            sortByColumnDesc: t("newscategorymanagement.table.actions.sortByColumnDesc", { defaultValue: "Sort by {column} descending" }),
            thenBy: t("newscategorymanagement.table.actions.thenBy", { defaultValue: "Then by" }),
            toggleDensity: t("newscategorymanagement.table.actions.toggleDensity", { defaultValue: "Toggle Density" }),
            toggleFullScreen: t("newscategorymanagement.table.actions.toggleFullScreen", { defaultValue: "Toggle Full Screen" }),
            toggleVisibility: t("newscategorymanagement.table.actions.toggleVisibility", { defaultValue: "Toggle Visibility" }),
            search: t("newscategorymanagement.table.actions.search", { defaultValue: "Search" }),
            showAll: t("newscategorymanagement.table.actions.showAll", { defaultValue: "Show All" }),
            showHideColumns: t("newscategorymanagement.table.actions.showHideColumns", { defaultValue: "Show/Hide Columns" }),
            showHideFilters: t("newscategorymanagement.table.actions.showHideFilters", { defaultValue: "Show/Hide Filters" }),
            showHideSearch: t("newscategorymanagement.table.actions.showHideSearch", { defaultValue: "Show/Hide Search" }),
            noRecordsToDisplay: t("newscategorymanagement.table.actions.noRecordsToDisplay", { defaultValue: "No records to display" }),
            of: t("newscategorymanagement.table.actions.of", { defaultValue: "of" }),
            or: t("newscategorymanagement.table.actions.or", { defaultValue: "or" }),
            rowsPerPage: t("newscategorymanagement.table.actions.rowsPerPage", { defaultValue: "Rows per page" }),
            save: t("newscategorymanagement.table.actions.save", { defaultValue: "Save" }),
            select: t("newscategorymanagement.table.actions.select", { defaultValue: "Select" }),
            selectedCountOfRowCountRowsSelected: t("newscategorymanagement.table.actions.selectedCountOfRowCountRowsSelected", { defaultValue: "{selectedCount} of {rowCount} row(s) selected" }),
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