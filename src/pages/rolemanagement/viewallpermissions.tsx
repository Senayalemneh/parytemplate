import {
  Button,
  Group,
  Box,
  Title,
  Divider,
  Modal,
  Text,
  ScrollArea,
  Stack,
  Badge,
  TextInput,
  ActionIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import { viewAllPermission } from "../../services/api/main";
import { IconPencil, IconTrash, IconSearch } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/loader";

interface Permission {
  id: number;
  name: string;
  key: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const PermissionsViewPage = () => {
  const { t } = useTranslation();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalOpen, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);
  const [currentPermission, setCurrentPermission] = useState<Permission | null>(
    null
  );

  const form = useForm({
    initialValues: {
      name: "",
      key: "",
      description: "",
    },
  });

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await viewAllPermission();
      if (response.success) {
        setPermissions(response.data);
        showNotification(
          t("permissionviewadmin.notifications.loadSuccess"),
          "success"
        );
      } else {
        throw new Error(t("permissionviewadmin.errors.fetchFailed"));
      }
    } catch (error) {
      console.error(t("permissionviewadmin.errors.fetchError"), error);
      showNotification(
        t("permissionviewadmin.notifications.loadFailed"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("permissionviewadmin.notifications.successTitle")
          : t("permissionviewadmin.notifications.errorTitle"),
      message,
      color: type === "success" ? "teal" : "red",
      withBorder: true,
    });
  };

  const handleEditPermission = (permission: Permission) => {
    setCurrentPermission(permission);
    form.setValues({
      name: permission.name,
      key: permission.key,
      description: permission.description,
    });
    openEditModal();
  };

  const handleSavePermission = async () => {
    if (!currentPermission) return;

    try {
      setLoading(true);
      // Here you would call your API to update the permission
      // await updatePermission(currentPermission.id, form.values);
      showNotification(
        t("permissionviewadmin.notifications.updateSuccess"),
        "success"
      );
      closeEditModal();
      fetchPermissions();
    } catch (error) {
      console.error(t("permissionviewadmin.errors.updateError"), error);
      showNotification(
        t("permissionviewadmin.notifications.updateFailed"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredPermissions = permissions.filter(
    (permission) =>
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: MRT_ColumnDef<Permission>[] = [
    {
      accessorKey: "id",
      header: t("permissionviewadmin.table.headers.id"),
      size: 80,
      Cell: ({ cell }) => (
        <Badge color="gray" variant="outline">
          #{cell.getValue<number>()}
        </Badge>
      ),
    },
    {
      accessorKey: "name",
      header: t("permissionviewadmin.table.headers.name"),
      size: 200,
    },
    {
      accessorKey: "key",
      header: t("permissionviewadmin.table.headers.key"),
      Cell: ({ cell }) => (
        <Badge color="blue" variant="light">
          {cell.getValue<string>()}
        </Badge>
      ),
    },
    {
      accessorKey: "description",
      header: t("permissionviewadmin.table.headers.description"),
      size: 300,
    },
    {
      accessorKey: "created_at",
      header: t("permissionviewadmin.table.headers.createdAt"),
      Cell: ({ cell }) =>
        new Date(cell.getValue<string>()).toLocaleDateString(),
    },
    {
      id: "actions",
      header: t("permissionviewadmin.table.headers.actions"),
      Cell: ({ row }) => (
        <Group spacing="xs">
          <ActionIcon
            color="blue"
            variant="light"
            onClick={() => handleEditPermission(row.original)}
            title={t("permissionviewadmin.actions.edit")}
          >
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon
            color="red"
            variant="light"
            title={t("permissionviewadmin.actions.delete")}
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
        <Title order={2}>{t("permissionviewadmin.title")}</Title>
        <TextInput
          placeholder={t("permissionviewadmin.search.placeholder")}
          icon={<IconSearch size={16} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
          style={{ width: 300 }}
        />
      </Group>
      <Divider my="md" />

      <Box className="h-[calc(100vh-200px)] w-full overflow-auto">
        <MantineReactTable
          columns={columns}
          data={filteredPermissions}
          state={{ isLoading: loading }}
          enableColumnOrdering
          enablePagination
          enableSorting
          enableColumnFilters
          enableGlobalFilter={false}
          enableStickyHeader
          enableFullScreenToggle={false}
          initialState={{
            density: "xs",
            pagination: { pageSize: 20, pageIndex: 0 },
          }}
          mantineTableContainerProps={{
            sx: {
              maxHeight: "calc(100vh - 210px)",
            },
          }}
        />
      </Box>

      {currentPermission && (
        <Modal
          opened={editModalOpen}
          onClose={closeEditModal}
          title={`${t("permissionviewadmin.modal.editTitle")} ${
            currentPermission.name
          }`}
          size="md"
          overlayProps={{ blur: 3 }}
        >
          {loading && <Loader />}
          <form onSubmit={form.onSubmit(handleSavePermission)}>
            <Stack>
              <TextInput
                label={t("permissionviewadmin.form.name.label")}
                {...form.getInputProps("name")}
                required
              />
              <TextInput
                label={t("permissionviewadmin.form.key.label")}
                {...form.getInputProps("key")}
                required
              />
              <TextInput
                label={t("permissionviewadmin.form.description.label")}
                {...form.getInputProps("description")}
                required
              />
              <Group position="right" mt="md">
                <Button variant="default" onClick={closeEditModal}>
                  {t("permissionviewadmin.buttons.cancel")}
                </Button>
                <Button type="submit" loading={loading}>
                  {t("permissionviewadmin.buttons.saveChanges")}
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      )}
    </Box>
  );
};

export default PermissionsViewPage;