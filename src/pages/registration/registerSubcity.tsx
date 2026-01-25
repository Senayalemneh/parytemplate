import {
  TextInput,
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
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  createSubcity,
  getAllSubcity,
  getSubcityById,
  deleteSubcity,
  updateSubcity,
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
import Loader from "../../components/common/loader"; // Import your custom loader

interface SubcityItem {
  id: number;
  name: string | { en: string; am: string };
  description: string;
  created_at: string;
  updated_at: string;
}

const SubcityManagement = () => {
  const { t } = useTranslation();
  const [subcityData, setSubcityData] = useState<SubcityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const form = useForm({
    initialValues: {
      name_en: "",
      name_am: "",
      description: "",
    },
    validate: {
      name_en: (value) => (value ? null : t("subcity.errors.nameEnRequired")),
      name_am: (value) => (value ? null : t("subcity.errors.nameAmRequired")),
      description: (value) =>
        value ? null : t("subcity.errors.descriptionRequired"),
    },
  });

  const fetchSubcities = async () => {
    setLoading(true);
    try {
      const response = await getAllSubcity();
      setSubcityData(response || []);
      showNotification(t("subcity.messages.dataLoaded"), "success");
    } catch (error) {
      console.error("Failed to fetch subcities:", error);
      showNotification(t("subcity.errors.failedLoad"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubcities();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title: type === "success" ? t("common.success") : t("common.error"),
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
          en: values.name_en,
          am: values.name_am,
        },
        description: values.description,
      };

      if (editingId !== null) {
        await updateSubcity(editingId, payload);
        showNotification(t("subcity.messages.updateSuccess"), "success");
      } else {
        await createSubcity(payload);
        showNotification(t("subcity.messages.createSuccess"), "success");
      }

      resetAndCloseModal();
      fetchSubcities();
    } catch (error: any) {
      console.error("Error saving subcity:", error);
      if (error.response?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          if (form.getInputProps(key)) {
            form.setFieldError(key, errors[key][0]);
          }
        });
      } else {
        showNotification(
          t(
            editingId
              ? "subcity.errors.updateFailed"
              : "subcity.errors.createFailed",
            {
              error: error.message,
            }
          ),
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      setLoading(true);
      const item = await getSubcityById(id);
      if (!item) {
        showNotification(t("subcity.errors.notFound"), "error");
        return;
      }

      const name =
        typeof item.name === "string" ? JSON.parse(item.name) : item.name;

      form.setValues({
        name_en: name.en || "",
        name_am: name.am || "",
        description: item.description || "",
      });

      setEditingId(id);
      openModal();
    } catch (error: any) {
      console.error("Error loading subcity for edit:", error);
      showNotification(t("subcity.errors.loadForEditFailed"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(true);
      await deleteSubcity(id);
      showNotification(t("subcity.messages.deleteSuccess"), "success");
      fetchSubcities();
    } catch (error: any) {
      console.error("Error deleting subcity:", error);
      showNotification(t("subcity.errors.deleteFailed"), "error");
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

  const parseName = (name: string | { en: string; am: string }) => {
    if (typeof name === "string") {
      try {
        return JSON.parse(name);
      } catch {
        return { en: "", am: "" };
      }
    }
    return name || { en: "", am: "" };
  };

  const columns: MRT_ColumnDef<SubcityItem>[] = [
    {
      accessorKey: "id",
      header: t("subcity.table.headers.id"),
      size: 80,
    },
    {
      accessorFn: (row) => parseName(row.name).am,
      header: t("subcity.table.headers.nameAm"),
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorFn: (row) => parseName(row.name).en,
      header: t("subcity.table.headers.nameEn"),
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorKey: "description",
      header: t("subcity.table.headers.description"),
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 300 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorKey: "created_at",
      header: t("subcity.table.headers.createdAt"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value ? new Date(value).toLocaleString() : "N/A";
      },
    },
    {
      accessorKey: "updated_at",
      header: t("subcity.table.headers.updatedAt"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value ? new Date(value).toLocaleString() : "N/A";
      },
    },
    {
      id: "actions",
      header: t("subcity.table.headers.actions"),
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
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <Box p="md">
      <Group position="apart" mb="md">
        <Title order={2}>{t("subcity.title")}</Title>
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
          {t("subcity.buttons.addSubcity")}
        </Button>
      </Group>
      <Divider my="md" />
      <Box className="h-[calc(100vh-200px)] w-full overflow-auto">
        <MantineReactTable
          columns={columns}
          data={subcityData}
          state={{ isLoading: false }} // Disable MantineReactTable's built-in loading
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
            ? t("subcity.modal.editTitle")
            : t("subcity.modal.createTitle")
        }
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label={t("subcity.form.nameEnLabel")}
            {...form.getInputProps("name_en")}
            required
            mb="sm"
          />
          <TextInput
            label={t("subcity.form.nameAmLabel")}
            {...form.getInputProps("name_am")}
            required
            mb="sm"
          />
          <Textarea
            label={t("subcity.form.descriptionLabel")}
            {...form.getInputProps("description")}
            required
            mb="sm"
          />
          <Group position="right" mt="md">
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              loading={loading} // Show loading state on the button
            >
              {editingId
                ? t("subcity.buttons.saveChanges")
                : t("subcity.buttons.createSubcity")}
            </Button>
            <Button variant="outline" onClick={resetAndCloseModal}>
              {t("subcity.buttons.cancel")}
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t("subcity.modal.deleteTitle")}
        centered
      >
        <Text>{t("subcity.modal.deleteConfirmation")}</Text>
        <Group position="right" mt="md">
          <Button
            color="red"
            onClick={() => itemToDelete && handleDelete(itemToDelete)}
            loading={deleteLoading}
          >
            {t("subcity.buttons.delete")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={deleteLoading}
          >
            {t("subcity.buttons.cancel")}
          </Button>
        </Group>
      </Modal>
    </Box>
  );
};

export default SubcityManagement;
