import {
  Button,
  Group,
  Box,
  Title,
  Divider,
  Modal,
  Text,
  Badge,
  ScrollArea,
  Table,
  Checkbox,
  Input,
  Tabs,
  Paper,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  AssignRole,
  GetAllAssignedRole,
  RemoveSinglePermission,
  viewAllPermission,
  GetAllRoles,
  RemoveMultiplePermissions,
  removePermissions,
} from "../../services/api/main";
import {
  IconCheck,
  IconX,
  IconSearch,
  IconListCheck,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { useDebouncedValue } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/loader";

interface Permission {
  id: number;
  name: string | { en: string; am: string };
  key: string | { en: string; am: string };
  description: string | { en: string; am: string };
  created_at: string;
  updated_at: string;
}

interface Role {
  id: number;
  name: string | { en: string; am: string };
  role_key: string | { en: string; am: string };
}

const getLocalizedValue = (
  value: string | { en: string; am: string },
  language: string
): string => {
  if (typeof value === "string") return value;
  return value[language as keyof typeof value] || value.en;
};

const RolePermissionAssignment = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const [roles, setRoles] = useState<Role[]>([]);
  const [assignedPermissions, setAssignedPermissions] = useState<Permission[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [assignModalOpen, { open: openAssignModal, close: closeAssignModal }] =
    useDisclosure(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await GetAllRoles();
      if (response.success) {
        setRoles(response.data || []);
      } else {
        throw new Error(
          response.message || t("rolepermissionassignment.errors.fetchRoles")
        );
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      showNotification(
        t("rolepermissionassignment.notifications.failedLoadRoles"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPermissions = async () => {
    try {
      const response = await viewAllPermission();
      if (response.success) {
        setAllPermissions(response.data || []);
      } else {
        throw new Error(
          response.message ||
            t("rolepermissionassignment.errors.fetchPermissions")
        );
      }
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      showNotification(
        t("rolepermissionassignment.notifications.failedLoadPermissions"),
        "error"
      );
    }
  };

  const fetchAssignedPermissions = async (roleId: number) => {
    setModalLoading(true);
    try {
      const response = await GetAllAssignedRole(roleId);
      if (response.success) {
        setAssignedPermissions(response.data?.permissions || []);
        setSelectedPermissions(
          response.data?.permissions?.map((p: Permission) => p.id) || []
        );
      } else {
        throw new Error(
          response.message ||
            t("rolepermissionassignment.errors.fetchAssignedPermissions")
        );
      }
    } catch (error) {
      console.error("Failed to fetch assigned permissions:", error);
      showNotification(
        t(
          "rolepermissionassignment.notifications.failedLoadAssignedPermissions"
        ),
        "error"
      );
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchAllPermissions();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("rolepermissionassignment.notifications.success")
          : t("rolepermissionassignment.notifications.error"),
      message,
      color: type === "success" ? "teal" : "red",
      icon: type === "success" ? <IconCheck size={18} /> : <IconX size={18} />,
      withBorder: true,
    });
  };

  const handleAssignPermissions = async (role: Role) => {
    setCurrentRole(role);
    setSearchTerm("");
    await fetchAssignedPermissions(role.id);
    openAssignModal();
  };

  const handleSavePermissions = async () => {
    if (!currentRole) return;

    try {
      setLoading(true);

      const permissionsToRemove = assignedPermissions
        .map((p) => p.id)
        .filter((id) => !selectedPermissions.includes(id));

      if (permissionsToRemove.length > 0) {
        await removePermissions(currentRole.id, {
          permission_ids: permissionsToRemove,
        });
      }

      if (selectedPermissions.length > 0) {
        const response = await AssignRole(currentRole.id, {
          permissions: selectedPermissions,
        });
        if (!response.success) {
          throw new Error(
            response.message ||
              t("rolepermissionassignment.errors.assignPermissions")
          );
        }
      }

      await fetchAssignedPermissions(currentRole.id);

      showNotification(
        t("rolepermissionassignment.notifications.permissionsUpdated"),
        "success"
      );
    } catch (error) {
      console.error("Error updating permissions:", error);
      showNotification(
        t("rolepermissionassignment.notifications.failedUpdatePermissions"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const toggleAllPermissions = () => {
    if (selectedPermissions.length === filteredPermissions.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(filteredPermissions.map((p) => p.id));
    }
  };

  const filteredPermissions = allPermissions.filter((permission) => {
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    const name = getLocalizedValue(
      permission.name,
      currentLanguage
    ).toLowerCase();
    const key = getLocalizedValue(
      permission.key,
      currentLanguage
    ).toLowerCase();
    const description = getLocalizedValue(
      permission.description,
      currentLanguage
    ).toLowerCase();

    return (
      name.includes(searchLower) ||
      key.includes(searchLower) ||
      description.includes(searchLower)
    );
  });

  const columns: MRT_ColumnDef<Role>[] = [
    {
      accessorKey: "id",
      header: t("rolepermissionassignment.table.headers.id"),
      size: 80,
    },
    {
      accessorKey: "name",
      header: t("rolepermissionassignment.table.headers.roleName"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string | { en: string; am: string }>();
        return getLocalizedValue(value, currentLanguage);
      },
    },
    {
      accessorKey: "role_key",
      header: t("rolepermissionassignment.table.headers.roleKey"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string | { en: string; am: string }>();
        return (
          <Badge color="blue" variant="light">
            {getLocalizedValue(value, currentLanguage)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: t("rolepermissionassignment.table.headers.actions"),
      Cell: ({ row }) => {
        const role = row.original;
        return (
          <Button
            variant="outline"
            size="xs"
            onClick={() => handleAssignPermissions(role)}
          >
            {t("rolepermissionassignment.buttons.managePermissions")}
          </Button>
        );
      },
    },
  ];

  return (
    <Box p="md" pos="relative">
      {loading && <Loader />}
      <Group position="apart" mb="md">
        <Title order={2}>{t("rolepermissionassignment.title")}</Title>
      </Group>
      <Divider my="md" />

      <Box className="h-[calc(100vh-200px)] w-full overflow-auto">
        <MantineReactTable
          columns={columns}
          data={roles}
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
        opened={assignModalOpen}
        onClose={closeAssignModal}
        title={
          currentRole
            ? t("rolepermissionassignment.modal.titleWithRole", {
                roleName: getLocalizedValue(currentRole.name, currentLanguage),
              })
            : t("rolepermissionassignment.modal.title")
        }
        size="xl"
        overlayProps={{ blur: 3 }}
      >
        {modalLoading && <Loader />}
        <Box>
          {currentRole && (
            <Group mb="md" spacing="xs">
              <Text weight={500}>
                {t("rolepermissionassignment.modal.roleLabel")}:
              </Text>
              <Badge variant="outline" size="lg">
                {getLocalizedValue(currentRole.name, currentLanguage)}
              </Badge>
              <Text weight={500}>
                {t("rolepermissionassignment.modal.keyLabel")}:
              </Text>
              <Badge color="blue" size="lg">
                {getLocalizedValue(currentRole.role_key, currentLanguage)}
              </Badge>
              <Text weight={500}>
                {t("rolepermissionassignment.modal.idLabel")}:
              </Text>
              <Badge color="teal" size="lg">
                {currentRole.id}
              </Badge>
            </Group>
          )}

          <Tabs defaultValue="all">
            <Tabs.List>
              <Tabs.Tab value="all" icon={<IconListCheck size={14} />}>
                {t("rolepermissionassignment.tabs.allPermissions")}
              </Tabs.Tab>
              <Tabs.Tab value="assigned" icon={<IconCheck size={14} />}>
                {`${t("rolepermissionassignment.tabs.assigned")} (${
                  assignedPermissions.length
                })`}
              </Tabs.Tab>
              <Tabs.Tab value="selected" icon={<IconListCheck size={14} />}>
                {`${t("rolepermissionassignment.tabs.selected")} (${
                  selectedPermissions.length
                })`}
              </Tabs.Tab>
            </Tabs.List>

            <Box mt="md">
              <Input
                placeholder={t("rolepermissionassignment.search.placeholder")}
                icon={<IconSearch size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
                mb="md"
              />

              <Group position="apart" mb="md">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={toggleAllPermissions}
                  disabled={filteredPermissions.length === 0}
                >
                  {selectedPermissions.length === filteredPermissions.length
                    ? t("rolepermissionassignment.buttons.deselectAll")
                    : t("rolepermissionassignment.buttons.selectAllFiltered")}
                </Button>
                <Text size="sm">
                  {t("rolepermissionassignment.showing")}:{" "}
                  <Badge color="blue">{filteredPermissions.length}</Badge>{" "}
                  {t("rolepermissionassignment.of")}{" "}
                  <Badge variant="outline">{allPermissions.length}</Badge>{" "}
                  {t("rolepermissionassignment.permissions")}
                </Text>
              </Group>

              <Tabs.Panel value="all" pt="xs">
                <PermissionTable
                  permissions={filteredPermissions}
                  assignedPermissions={assignedPermissions}
                  selectedPermissions={selectedPermissions}
                  togglePermission={togglePermission}
                  currentLanguage={currentLanguage}
                />
              </Tabs.Panel>

              <Tabs.Panel value="assigned" pt="xs">
                <PermissionTable
                  permissions={assignedPermissions}
                  assignedPermissions={assignedPermissions}
                  selectedPermissions={selectedPermissions}
                  togglePermission={togglePermission}
                  emptyMessage={t(
                    "rolepermissionassignment.messages.noAssignedPermissions"
                  )}
                  currentLanguage={currentLanguage}
                />
              </Tabs.Panel>

              <Tabs.Panel value="selected" pt="xs">
                <PermissionTable
                  permissions={allPermissions.filter((p) =>
                    selectedPermissions.includes(p.id)
                  )}
                  assignedPermissions={assignedPermissions}
                  selectedPermissions={selectedPermissions}
                  togglePermission={togglePermission}
                  emptyMessage={t(
                    "rolepermissionassignment.messages.noSelectedPermissions"
                  )}
                  currentLanguage={currentLanguage}
                />
              </Tabs.Panel>
            </Box>
          </Tabs>

          <Group position="right" mt="xl">
            <Button variant="default" onClick={closeAssignModal}>
              {t("rolepermissionassignment.buttons.cancel")}
            </Button>
            <Button
              onClick={handleSavePermissions}
              loading={loading}
              disabled={selectedPermissions.length === 0}
            >
              {t("rolepermissionassignment.buttons.savePermissions")}
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
};

interface PermissionTableProps {
  permissions: Permission[];
  assignedPermissions: Permission[];
  selectedPermissions: number[];
  togglePermission: (id: number) => void;
  emptyMessage?: string;
  currentLanguage: string;
}

const PermissionTable = ({
  permissions,
  assignedPermissions,
  selectedPermissions,
  togglePermission,
  emptyMessage = "No permissions found",
  currentLanguage,
}: PermissionTableProps) => {
  const { t } = useTranslation();

  if (permissions.length === 0) {
    return (
      <Paper withBorder p="md" ta="center">
        <Text color="dimmed">{emptyMessage}</Text>
      </Paper>
    );
  }

  return (
    <ScrollArea style={{ height: 400 }}>
      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th style={{ width: 50 }}>
              {t("rolepermissionassignment.table.headers.select")}
            </th>
            <th>{t("rolepermissionassignment.table.headers.permission")}</th>
            <th>{t("rolepermissionassignment.table.headers.key")}</th>
            <th>{t("rolepermissionassignment.table.headers.description")}</th>
            <th>{t("rolepermissionassignment.table.headers.status")}</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((permission) => (
            <tr key={permission.id}>
              <td>
                <Checkbox
                  checked={selectedPermissions.includes(permission.id)}
                  onChange={() => togglePermission(permission.id)}
                />
              </td>
              <td>
                <Text weight={500}>
                  {getLocalizedValue(permission.name, currentLanguage)}
                </Text>
              </td>
              <td>
                <Badge variant="light">
                  {getLocalizedValue(permission.key, currentLanguage)}
                </Badge>
              </td>
              <td>
                <Text size="sm" color="dimmed">
                  {getLocalizedValue(permission.description, currentLanguage)}
                </Text>
              </td>
              <td>
                {assignedPermissions.some((p) => p.id === permission.id) ? (
                  <Badge color="green">
                    {t("rolepermissionassignment.status.assigned")}
                  </Badge>
                ) : (
                  <Badge color="gray">
                    {t("rolepermissionassignment.status.notAssigned")}
                  </Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </ScrollArea>
  );
};

export default RolePermissionAssignment;
