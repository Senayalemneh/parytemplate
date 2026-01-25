import {
  TextInput,
  Button,
  Switch,
  Group,
  Box,
  Title,
  Divider,
  Modal,
  ActionIcon,
  PasswordInput,
  Select,
  Text,
  Tabs,
  Badge,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  createUser,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  updateUserStatus,
} from "../../services/api/main";
import {
  GetAllWoredas,
  getAllSubcity,
  getAllRoles,
} from "../../services/api/main";
import {
  IconPencil,
  IconTrash,
  IconPlus,
  IconCheck,
  IconX,
  IconUserCheck,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/loader";

interface UserItem {
  id: number;
  name: string;
  email: string;
  role_id: number;
  woreda_id: number | null;
  subcity_id: number | null;
  role: {
    id: number;
    name: { en: string; am: string };
    key: string;
  };
  woreda: {
    id: number;
    name: { en: string; am: string };
    subcity_id: string;
  } | null;
  subcity: {
    id: number;
    name: { en: string; am: string };
  } | null;
  is_self_registered: string;
  account_status: string;
  created_at: string;
  updated_at: string;
}

interface SelectItem {
  value: string;
  label: string;
}

interface RoleItem {
  id: number;
  name: { en: string; am: string };
  key: string;
}

interface WoredaItem {
  id: number;
  name: { en: string; am: string };
  subcity_id: string;
}

interface SubcityItem {
  id: number;
  name: { en: string; am: string };
}

const UserManagement = () => {
  const { t } = useTranslation();
  const [userData, setUserData] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [roles, setRoles] = useState<SelectItem[]>([]);
  const [woredas, setWoredas] = useState<SelectItem[]>([]);
  const [subcities, setSubcities] = useState<SelectItem[]>([]);
  const [filteredWoredas, setFilteredWoredas] = useState<SelectItem[]>([]);
  const [approveLoading, setApproveLoading] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role_id: "",
      woreda_id: "",
      subcity_id: "",
    },
    validate: {
      name: (value) =>
        value ? null : t("usermanagementadmin.form.name.error"),
      email: (value) =>
        /^\S+@\S+$/.test(value)
          ? null
          : t("usermanagementadmin.form.email.error"),
      password: (value, values) =>
        !editingId && !value
          ? t("usermanagementadmin.form.password.error")
          : null,
      password_confirmation: (value, values) =>
        value !== values.password
          ? t("usermanagementadmin.form.passwordConfirm.error")
          : null,
      role_id: (value) =>
        value ? null : t("usermanagementadmin.form.role.error"),
      woreda_id: (value, values) => {
        const role = roles.find((r) => r.value === values.role_id);
        if (role?.value === "1" && !value) {
          return t("usermanagementadmin.form.woreda.error");
        }
        return null;
      },
      subcity_id: (value, values) => {
        const role = roles.find((r) => r.value === values.role_id);
        if (role?.value === "5" && !value) {
          return t("usermanagementadmin.form.subcity.error");
        }
        return null;
      },
    },
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers();
      setUserData(response || []);
      showNotification(
        t("usermanagementadmin.notifications.loadSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch users:", error);
      showNotification(
        t("usermanagementadmin.notifications.loadFailed"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceData = async () => {
    try {
      const [rolesResponse, woredasResponse, subcitiesResponse] =
        await Promise.all([getAllRoles(), GetAllWoredas(), getAllSubcity()]);

      if (rolesResponse?.success && rolesResponse.data) {
        const roleOptions = rolesResponse.data.map((role: RoleItem) => ({
          value: role.id.toString(),
          label: role.name.en || role.name.am || `Role ${role.id}`,
          key: role.key,
        }));
        setRoles(roleOptions);
      }

      if (woredasResponse && Array.isArray(woredasResponse)) {
        const woredaOptions = woredasResponse.map((woreda: WoredaItem) => ({
          value: woreda.id.toString(),
          label: woreda.name.en || woreda.name.am || `${woreda.name.en}`,
          subcity_id: woreda.subcity_id,
        }));
        setWoredas(woredaOptions);
        setFilteredWoredas(woredaOptions);
      }

      if (subcitiesResponse && Array.isArray(subcitiesResponse)) {
        const subcityOptions = subcitiesResponse.map((subcity: SubcityItem) => {
          let nameObj = { en: "", am: "" };
          try {
            nameObj = JSON.parse(subcity.name);
          } catch (e) {
            console.error("Failed to parse subcity.name:", subcity.name);
          }
          return {
            value: subcity.id.toString(),
            label: nameObj.en || nameObj.am || `Subcity ${subcity.id}`,
          };
        });
        setSubcities(subcityOptions);
      }
    } catch (error) {
      console.error("Failed to fetch reference data:", error);
      showNotification(
        t("usermanagementadmin.notifications.referenceDataLoadFailed"),
        "error"
      );
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchReferenceData();
  }, []);

  useEffect(() => {
    if (form.values.subcity_id) {
      const filtered = woredas.filter(
        (woreda) => woreda.subcity_id === form.values.subcity_id
      );
      setFilteredWoredas(filtered);
      if (!filtered.some((w) => w.value === form.values.woreda_id)) {
        form.setFieldValue("woreda_id", "");
      }
    } else {
      setFilteredWoredas(woredas);
    }
  }, [form.values.subcity_id, woredas]);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("usermanagementadmin.notifications.successTitle")
          : t("usermanagementadmin.notifications.errorTitle"),
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
        showNotification(t("usermanagementadmin.errors.invalidId"), "error");
        return;
      }

      const payload = {
        name: values.name,
        email: values.email,
        ...(values.password && { password: values.password }),
        ...(values.password && {
          password_confirmation: values.password_confirmation,
        }),
        role_id: Number(values.role_id),
        ...(values.woreda_id && { woreda_id: Number(values.woreda_id) }),
        ...(values.subcity_id && { subcity_id: Number(values.subcity_id) }),
      };

      if (editingId) {
        await updateUser(editingId, payload);
        showNotification(
          t("usermanagementadmin.notifications.updateSuccess"),
          "success"
        );
      } else {
        await createUser(payload);
        showNotification(
          t("usermanagementadmin.notifications.createSuccess"),
          "success"
        );
      }

      resetAndCloseModal();
      fetchUsers();
    } catch (error: any) {
      console.error("Error saving user:", error);

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
            `usermanagementadmin.notifications.${
              editingId ? "updateFailed" : "createFailed"
            }`
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
      showNotification(t("usermanagementadmin.errors.invalidId"), "error");
      return;
    }

    try {
      setLoading(true);
      const response = await getUserById(id);

      if (!response) {
        showNotification(t("usermanagementadmin.errors.notFound"), "error");
        return;
      }

      const item = response;

      form.setValues({
        name: item.name,
        email: item.email,
        password: "",
        password_confirmation: "",
        role_id: item.role?.id?.toString() || "",
        woreda_id: item.woreda?.id?.toString() || "",
        subcity_id: item.subcity?.id?.toString() || "",
      });

      setEditingId(item.id);
      openModal();
    } catch (error: any) {
      console.error("Error loading user for edit:", error);
      let errorMessage = t("usermanagementadmin.notifications.updateFailed");
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
      await deleteUser(id);
      showNotification(
        t("usermanagementadmin.notifications.deleteSuccess"),
        "success"
      );
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      let errorMessage = t("usermanagementadmin.notifications.deleteFailed");
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

  const handleApproveUser = async (id: number) => {
    try {
      setApproveLoading(id);
      await updateUserStatus(id, { account_status: "Approved" });
      showNotification(
        t("usermanagementadmin.notifications.approveSuccess"),
        "success"
      );
      fetchUsers();
    } catch (error: any) {
      console.error("Error approving user:", error);
      let errorMessage = t("usermanagementadmin.notifications.approveFailed");
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showNotification(errorMessage, "error");
    } finally {
      setApproveLoading(null);
    }
  };

  const openDeleteConfirm = (id: number) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const filteredData = () => {
    switch (activeTab) {
      case "admin":
        return userData.filter((user) => user.is_self_registered === "0");
      case "self":
        return userData.filter((user) => user.is_self_registered === "1");
      case "pending":
        return userData.filter(
          (user) =>
            user.is_self_registered === "1" && user.account_status === "draft"
        );
      case "approved":
        return userData.filter(
          (user) =>
            user.is_self_registered === "1" &&
            user.account_status === "Approved"
        );
      default:
        return userData;
    }
  };

  const columns: MRT_ColumnDef<UserItem>[] = [
    {
      accessorKey: "id",
      header: t("usermanagementadmin.table.headers.id"),
      size: 80,
    },
    {
      accessorKey: "name",
      header: t("usermanagementadmin.table.headers.name"),
    },
    {
      accessorKey: "email",
      header: t("usermanagementadmin.table.headers.email"),
    },
    {
      accessorFn: (row) =>
        row.role?.name?.en || t("usermanagementadmin.table.notAvailable"),
      header: t("usermanagementadmin.table.headers.role"),
      id: "role",
    },
    {
      accessorFn: (row) =>
        row.woreda?.name?.en || t("usermanagementadmin.table.notAvailable"),
      header: t("usermanagementadmin.table.headers.woreda"),
      id: "woreda",
    },
    {
      accessorFn: (row) =>
        row.subcity?.name?.en || t("usermanagementadmin.table.notAvailable"),
      header: t("usermanagementadmin.table.headers.subcity"),
      id: "subcity",
    },
    {
      accessorKey: "is_self_registered",
      header: t("usermanagementadmin.table.headers.registrationType"),
      Cell: ({ cell }) => (
        <Badge color={cell.getValue() === "1" ? "blue" : "green"}>
          {cell.getValue() === "1" ? "Self Registered" : "Admin Registered"}
        </Badge>
      ),
    },
    {
      accessorKey: "account_status",
      header: t("usermanagementadmin.table.headers.status"),
      Cell: ({ cell, row }) => {
        const status = cell.getValue();
        if (row.original.is_self_registered === "1") {
          return (
            <Badge
              color={
                status === "Approved"
                  ? "green"
                  : status === "draft"
                  ? "orange"
                  : "gray"
              }
            >
              {status === "Approved"
                ? "Approved"
                : status === "draft"
                ? "Pending Approval"
                : status}
            </Badge>
          );
        }
        return <Badge color="green">Admin Created</Badge>;
      },
    },
    {
      accessorKey: "created_at",
      header: t("usermanagementadmin.table.headers.createdAt"),
      Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
    },
    {
      accessorKey: "updated_at",
      header: t("usermanagementadmin.table.headers.updatedAt"),
      Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
    },
    {
      id: "actions",
      header: t("usermanagementadmin.table.headers.actions"),
      Cell: ({ row }) => {
        const itemId = row.original.id;
        const isSelfRegistered = row.original.is_self_registered === "1";
        const isPending = row.original.account_status === "draft";

        return (
          <Group spacing="xs">
            {isSelfRegistered && isPending && (
              <ActionIcon
                color="green"
                variant="light"
                onClick={() => handleApproveUser(itemId)}
                loading={approveLoading === itemId}
              >
                <IconUserCheck size={16} />
              </ActionIcon>
            )}
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
        <Title order={2}>{t("usermanagementadmin.title")}</Title>
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
          {t("usermanagementadmin.buttons.addUser")}
        </Button>
      </Group>
      <Divider my="md" />

      <Tabs value={activeTab} onTabChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="all">{t("usermanagementadmin.All Users")}</Tabs.Tab>
          <Tabs.Tab value="admin">
            {t("usermanagementadmin.Admin Registered")}
          </Tabs.Tab>
          <Tabs.Tab value="self">
            {t("usermanagementadmin.Self Registered")}
          </Tabs.Tab>
          <Tabs.Tab value="pending">
            {t("usermanagementadmin.Pending Approval")}
          </Tabs.Tab>
          <Tabs.Tab value="approved">
            {t("usermanagementadmin.Approved Users")}
          </Tabs.Tab>
        </Tabs.List>

        <Box className="h-[calc(100vh-200px)] w-full overflow-auto">
          <MantineReactTable
            columns={columns}
            data={filteredData()}
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
      </Tabs>

      <Modal
        opened={editModalOpen}
        onClose={resetAndCloseModal}
        title={
          editingId
            ? t("usermanagementadmin.modal.editTitle")
            : t("usermanagementadmin.modal.createTitle")
        }
        size="lg"
        overlayProps={{ blur: 3 }}
      >
        {loading && <Loader />}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Group grow mb="md">
            <TextInput
              withAsterisk
              label={t("usermanagementadmin.form.name.label")}
              placeholder={t("usermanagementadmin.form.name.placeholder")}
              {...form.getInputProps("name")}
            />
            <TextInput
              withAsterisk
              label={t("usermanagementadmin.form.email.label")}
              placeholder={t("usermanagementadmin.form.email.placeholder")}
              {...form.getInputProps("email")}
            />
          </Group>

          <Group grow mb="md">
            <PasswordInput
              label={t("usermanagementadmin.form.password.label")}
              placeholder={t("usermanagementadmin.form.password.placeholder")}
              description={
                editingId
                  ? t("usermanagementadmin.form.password.descriptionEdit")
                  : undefined
              }
              {...form.getInputProps("password")}
            />
            <PasswordInput
              label={t("usermanagementadmin.form.passwordConfirm.label")}
              placeholder={t(
                "usermanagementadmin.form.passwordConfirm.placeholder"
              )}
              {...form.getInputProps("password_confirmation")}
            />
          </Group>

          <Select
            withAsterisk
            label={t("usermanagementadmin.form.role.label")}
            placeholder={t("usermanagementadmin.form.role.placeholder")}
            data={roles}
            searchable
            nothingFound={t("usermanagementadmin.form.role.noResults")}
            mb="md"
            {...form.getInputProps("role_id")}
          />

          <Group grow mb="md">
            <Select
              label={t("usermanagementadmin.form.subcity.label")}
              placeholder={t("usermanagementadmin.form.subcity.placeholder")}
              data={subcities}
              searchable
              nothingFound={t("usermanagementadmin.form.subcity.noResults")}
              clearable
              {...form.getInputProps("subcity_id")}
            />
            <Select
              label={t("usermanagementadmin.form.woreda.label")}
              placeholder={t("usermanagementadmin.form.woreda.placeholder")}
              data={filteredWoredas}
              searchable
              nothingFound={t("usermanagementadmin.form.woreda.noResults")}
              clearable
              {...form.getInputProps("woreda_id")}
            />
          </Group>

          <Group position="right" mt="xl">
            <Button variant="default" onClick={resetAndCloseModal}>
              {t("usermanagementadmin.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              loading={loading}
            >
              {editingId
                ? t("usermanagementadmin.buttons.updateUser")
                : t("usermanagementadmin.buttons.createUser")}
            </Button>
          </Group>
        </form>
      </Modal>
      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t("usermanagementadmin.modal.deleteTitle")}
        centered
      >
        {deleteLoading && <Loader />}
        <Box>
          <Text size="sm" mb="md">
            {t("usermanagementadmin.modal.deleteConfirmation")}
          </Text>
          <Group position="right" mt="md">
            <Button
              variant="default"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              {t("usermanagementadmin.buttons.cancel")}
            </Button>
            <Button
              color="red"
              loading={deleteLoading}
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
            >
              {t("usermanagementadmin.buttons.delete")}
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
};

export default UserManagement;
