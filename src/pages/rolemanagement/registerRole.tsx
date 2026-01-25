import {
  TextInput,
  Button,
  Group,
  Box,
  Title,
  Divider,
  Modal,
  ActionIcon,
  Text,
  Textarea,
  Badge,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  createRoles,
  GetAllRoles,
  getRolesById,
  UpdateRoles,
  DeleteRoles,
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

interface RoleItem {
  id: number;
  role_key: string;
  name: {
    en: string;
    am: string;
  };
  description: string;
  created_at: string;
  updated_at: string;
}

const RoleManagement = () => {
  const { t } = useTranslation();
  const [roleData, setRoleData] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const form = useForm({
    initialValues: {
      role_key: "",
      name_en: "",
      name_am: "",
      description: "",
    },
    validate: {
      role_key: (value) =>
        value ? null : t("rolemanagementadmin.formErrors.roleKey"),
      name_en: (value) =>
        value ? null : t("rolemanagementadmin.formErrors.nameEn"),
      name_am: (value) =>
        value ? null : t("rolemanagementadmin.formErrors.nameAm"),
      description: (value) => (value ? null : t("formErrors.description")),
    },
  });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await GetAllRoles();
      setRoleData(response?.data || []);
      showNotification(
        t("rolemanagementadmin.notifications.loadSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      showNotification(
        t("rolemanagementadmin.notifications.loadError"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("rolemanagementadmin.notifications.success")
          : t("rolemanagementadmin.notifications.error"),
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

      if (editingId && (isNaN(editingId) || editingId <= 0)) {
        showNotification(
          t("rolemanagementadmin.notifications.invalidId"),
          "error"
        );
        return;
      }

      const payload = {
        role_key: values.role_key,
        name: {
          en: values.name_en,
          am: values.name_am,
        },
        description: values.description,
      };

      if (editingId) {
        await UpdateRoles({ id: editingId, ...payload });
        showNotification(
          t("rolemanagementadmin.notifications.updateSuccess"),
          "success"
        );
      } else {
        await createRoles(payload);
        showNotification(
          t("rolemanagementadmin.notifications.createSuccess"),
          "success"
        );
      }

      resetAndCloseModal();
      fetchRoles();
    } catch (error: any) {
      console.error("Error saving role:", error);

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
            editingId
              ? "rolemanagementadmin.notifications.updateError"
              : "rolemanagementadmin.notifications.createError",
            { error: error.message }
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
      showNotification(
        t("rolemanagementadmin.notifications.invalidId"),
        "error"
      );
      return;
    }

    try {
      setLoading(true);
      const response = await getRolesById(id);

      if (!response?.data) {
        showNotification(
          t("rolemanagementadmin.notifications.roleNotFound"),
          "error"
        );
        return;
      }

      const item = response.data;

      form.setValues({
        role_key: item.role_key || "",
        name_en: item.name?.en || "",
        name_am: item.name?.am || "",
        description: item.description || "",
      });

      setEditingId(item.id);
      openModal();
    } catch (error: any) {
      console.error("Error loading role for edit:", error);
      let errorMessage = t("rolemanagementadmin.notifications.loadEditError");
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
      await DeleteRoles(id);
      showNotification(
        t("rolemanagementadmin.notifications.deleteSuccess"),
        "success"
      );
      fetchRoles();
    } catch (error: any) {
      console.error("Error deleting role:", error);
      let errorMessage = t("rolemanagementadmin.notifications.deleteError");
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

  const columns: MRT_ColumnDef<RoleItem>[] = [
    {
      accessorKey: "id",
      header: t("rolemanagementadmin.table.headers.id"),
      size: 80,
    },
    {
      accessorKey: "role_key",
      header: t("rolemanagementadmin.table.headers.roleKey"),
      Cell: ({ cell }) => (
        <Badge color="blue" variant="light">
          {cell.getValue<string>()}
        </Badge>
      ),
    },
    {
      accessorFn: (row) =>
        row.name?.en || t("rolemanagementadmin.table.notAvailable"),
      header: t("rolemanagementadmin.table.headers.nameEn"),
    },
    {
      accessorFn: (row) =>
        row.name?.am || t("rolemanagementadmin.table.notAvailable"),
      header: t("rolemanagementadmin.table.headers.nameAm"),
    },
    {
      accessorKey: "description",
      header: t("rolemanagementadmin.table.headers.description"),
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorKey: "created_at",
      header: t("rolemanagementadmin.table.headers.createdAt"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value
          ? new Date(value).toLocaleString()
          : t("rolemanagementadmin.table.notAvailable");
      },
    },
    {
      accessorKey: "updated_at",
      header: t("rolemanagementadmin.table.headers.updatedAt"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value
          ? new Date(value).toLocaleString()
          : t("rolemanagementadmin.table.notAvailable");
      },
    },
    {
      id: "actions",
      header: t("rolemanagementadmin.table.headers.actions"),
      Cell: ({ row }) => {
        const itemId = row.original.id;
        return (
          <Group spacing="xs">
            <ActionIcon
              color="blue"
              variant="light"
              onClick={() => handleEdit(itemId)}
              title={t("rolemanagementadmin.table.actions.edit")}
            >
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon
              color="red"
              variant="light"
              onClick={() => openDeleteConfirm(itemId)}
              title={t("rolemanagementadmin.table.actions.delete")}
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
        <Title order={2}>{t("rolemanagementadmin.title")}</Title>
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
          {t("rolemanagementadmin.addRoleButton")}
        </Button>
      </Group>
      <Divider my="md" />

      <Box className="h-[calc(100vh-200px)] w-full overflow-auto">
        <MantineReactTable
          columns={columns}
          data={roleData}
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
          editingId
            ? "rolemanagementadmin.modal.editTitle"
            : "rolemanagementadmin.modal.createTitle"
        )}
        size="lg"
        overlayProps={{ blur: 3 }}
      >
        {loading && <Loader />}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            withAsterisk
            label={t("rolemanagementadmin.formLabels.roleKey")}
            placeholder={t("rolemanagementadmin.formPlaceholders.roleKey")}
            mb="md"
            {...form.getInputProps("role_key")}
          />

          <Group grow mb="md">
            <TextInput
              withAsterisk
              label={t("rolemanagementadmin.formLabels.nameEn")}
              placeholder={t("rolemanagementadmin.formPlaceholders.nameEn")}
              {...form.getInputProps("name_en")}
            />
            <TextInput
              withAsterisk
              label={t("rolemanagementadmin.formLabels.nameAm")}
              placeholder={t("rolemanagementadmin.formPlaceholders.nameAm")}
              {...form.getInputProps("name_am")}
            />
          </Group>

          <Textarea
            withAsterisk
            label={t("rolemanagementadmin.formLabels.description")}
            placeholder={t("rolemanagementadmin.formPlaceholders.description")}
            minRows={3}
            mb="md"
            {...form.getInputProps("description")}
          />

          <Group position="right" mt="xl">
            <Button variant="default" onClick={resetAndCloseModal}>
              {t("rolemanagementadmin.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              loading={loading}
            >
              {editingId
                ? t("rolemanagementadmin.buttons.update")
                : t("rolemanagementadmin.buttons.create")}
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t("rolemanagementadmin.deleteModal.title")}
        centered
      >
        {deleteLoading && <Loader />}
        <Box>
          <Text size="sm" mb="md">
            {t("rolemanagementadmin.deleteModal.message")}
          </Text>
          <Group position="right" mt="md">
            <Button
              variant="default"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              {t("rolemanagementadmin.buttons.cancel")}
            </Button>
            <Button
              color="red"
              loading={deleteLoading}
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
            >
              {t("rolemanagementadmin.buttons.delete")}
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
};

export default RoleManagement;
