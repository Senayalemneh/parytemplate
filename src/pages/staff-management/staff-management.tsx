import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { notifications } from "@mantine/notifications";
import {
  Container,
  Image,
  FileInput,
  Title,
  Text,
  Card,
  Grid,
  TextInput,
  Select,
  PasswordInput,
  Button,
  Group,
  Notification,
  Modal,
  ActionIcon,
  Box,
  Badge,
  NumberInput,
  Space,
  Divider,
} from "@mantine/core";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import { useForm, isEmail, isNotEmpty } from "@mantine/form";
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconId,
  IconIdBadge,
  IconUpload,
  IconCheck,
  IconX,
  IconDownload,
} from "@tabler/icons-react";
import UserIDCard from "./components/id-design";
import Loader from "../../components/common/loader";
import { uploadFile, updateAvatar } from "../../services/api/main";
import {
  createUser,
  createStaffUsers,
  getUserAccounts,
  getAllRoles,
  GetAllWoredas,
  getAllSubcity,
  updateStaffUsers,
  deleteStaffUser,
} from "../../services/api/main";
import { format } from "date-fns";

interface Role {
  id: number;
  role_key: string;
  name: {
    en: string;
    am: string;
  };
  description: string;
}

interface Woreda {
  id: number;
  name: {
    en: string;
    am: string;
  };
  subcity_id: number;
  description: string;
  created_at: string;
  updated_at: string;
}

interface Subcity {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface ParsedSubcity {
  id: number;
  name: {
    en: string;
    am: string;
  };
  description: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  woreda_id: number;
  subcity_id: number;
  created_at: string;
  updated_at: string;
  avatar?: string;
}

interface StaffUser {
  id: number;
  user_id: number;
  full_name: string;
  gender: string;
  age: number | string;
  ethnicity: string;
  education_level: string;
  phone_number: string;
  responsibility: string;
  inspection_type: string;
  rank: string;
  type: string;
  created_at: string;
  updated_at: string;
  profile_picture?: string;
  user: User;
}

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [woredas, setWoredas] = useState<Woreda[]>([]);
  const [subcities, setSubcities] = useState<ParsedSubcity[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStaffId, setCurrentStaffId] = useState<number | null>(null);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<number | null>(null);
  const [idModalOpened, setIdModalOpened] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarModalOpened, setAvatarModalOpened] = useState(false);

  const educationLevels = [
    t("userManagement.educationLevels.highSchool"),
    t("userManagement.educationLevels.diploma"),
    t("userManagement.educationLevels.bachelors"),
    t("userManagement.educationLevels.masters"),
    t("userManagement.educationLevels.phd"),
  ];

  const columns = useMemo<MRT_ColumnDef<StaffUser>[]>(
    () => [
      {
        accessorKey: "user.name",
        header: t("userManagement.columns.username"),
        size: 150,
      },
      {
        accessorKey: "user.email",
        header: t("userManagement.columns.email"),
        size: 200,
      },
      {
        accessorFn: (row) =>
          roles.find((r) => r.id === row.user.role_id)?.name.en ||
          t("userManagement.unknown"),
        header: t("userManagement.columns.role"),
        size: 150,
      },
      {
        accessorKey: "full_name",
        header: t("userManagement.columns.fullName"),
        size: 180,
      },
      {
        accessorKey: "gender",
        header: t("userManagement.columns.gender"),
        size: 120,
        Cell: ({ cell }) => (
          <Badge
            color={cell.getValue() === "male" ? "blue" : "pink"}
            variant="filled"
            radius="sm"
            className="font-medium"
          >
            {cell.getValue() === "male"
              ? t("userManagement.genders.male")
              : t("userManagement.genders.female")}
          </Badge>
        ),
      },
      {
        accessorKey: "phone_number",
        header: t("userManagement.columns.phone"),
        size: 150,
      },
      {
        accessorKey: "type",
        header: t("userManagement.columns.type"),
        size: 150,
        Cell: ({ cell }) => {
          const type = cell.getValue() as string;
          return (
            <Badge
              color={
                type === "Permanent"
                  ? "green"
                  : type === "Contract"
                  ? "yellow"
                  : "gray"
              }
              variant="filled"
              radius="sm"
              className="font-medium"
            >
              {type === "Permanent"
                ? t("userManagement.employmentTypes.permanent")
                : type === "Contract"
                ? t("userManagement.employmentTypes.contract")
                : t("userManagement.employmentTypes.temporary")}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: t("userManagement.columns.actions"),
        Cell: ({ row }) => (
          <Group spacing={4} noWrap>
            <ActionIcon
              color="blue"
              onClick={() => {
                console.log("Edit button clicked for:", row.original.id);
                handleEdit(row.original);
              }}
              title={t("userManagement.edit")}
              variant="light"
              size="lg"
              className="hover:bg-blue-100"
            >
              <IconEdit size={18} />
            </ActionIcon>
            <ActionIcon
              color="red"
              onClick={() => handleDeleteClick(row.original.id)}
              title={t("userManagement.delete")}
              variant="light"
              size="lg"
              className="hover:bg-red-100"
            >
              <IconTrash size={18} />
            </ActionIcon>
            <ActionIcon
              color="green"
              onClick={() => handleViewId(row.original)}
              title={t("userManagement.viewId")}
              variant="light"
              size="lg"
              className="hover:bg-green-100"
            >
              <IconId size={18} />
            </ActionIcon>
            <ActionIcon
              color="orange"
              onClick={() => {
                setSelectedUser(row.original);
                setAvatarModalOpened(true);
              }}
              title={t("userManagement.uploadAvatar")}
              variant="light"
              size="lg"
              className="hover:bg-orange-100"
            >
              <IconUpload size={18} />
            </ActionIcon>
          </Group>
        ),
      },
    ],
    [roles, t]
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingData(true);

        const [
          rolesResponse,
          woredasResponse,
          subcitiesResponse,
          usersResponse,
        ] = await Promise.all([
          getAllRoles(),
          GetAllWoredas(),
          getAllSubcity(),
          getUserAccounts(),
        ]);

        setRoles(rolesResponse.data);

        if (!Array.isArray(woredasResponse)) {
          throw new Error(t("userManagement.error.loadData"));
        }
        setWoredas(woredasResponse);

        const parsedSubcities = subcitiesResponse.map((subcity: Subcity) => {
          try {
            const nameString = subcity.name.replace(/\\/g, "");
            return {
              ...subcity,
              name: JSON.parse(nameString),
            };
          } catch (parseError) {
            console.error("Failed to parse subcity name:", subcity.name);
            return {
              ...subcity,
              name: {
                en: `${t("userManagement.subcity")} ${subcity.id}`,
                am: "",
              },
            };
          }
        });
        setSubcities(parsedSubcities);

        setStaffUsers(usersResponse.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("userManagement.error.unknown")
        );
      } finally {
        setLoadingData(false);
      }
    };

    fetchInitialData();
  }, [t]);

  const form = useForm({
    initialValues: {
      user_id: 0,
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role_id: "",
      woreda_id: "",
      subcity_id: "",
      full_name: "",
      gender: "",
      age: 25,
      ethnicity: "",
      education_level: "",
      phone_number: "",
      responsibility: "",
      inspection_type: "",
      rank: "",
      type: "",
      avatar: null as File | null,
      avatarPreview: null as string | null,
    },
    validate: {
      name: (value, values) =>
        isEditing
          ? null
          : isNotEmpty(t("userManagement.validation.nameRequired"))(value),
      email: (value, values) =>
        isEditing
          ? null
          : isEmail(t("userManagement.validation.invalidEmail"))(value),
      password: (value, values) =>
        isEditing
          ? null
          : value.length >= 8
          ? null
          : t("userManagement.validation.passwordLength"),
      password_confirmation: (value, values) =>
        isEditing
          ? null
          : value === values.password
          ? null
          : t("userManagement.validation.passwordsMatch"),
      role_id: (value, values) =>
        isEditing
          ? null
          : isNotEmpty(t("userManagement.validation.roleRequired"))(value),
      woreda_id: (value, values) =>
        isEditing
          ? null
          : isNotEmpty(t("userManagement.validation.woredaRequired"))(value),
      subcity_id: (value, values) =>
        isEditing
          ? null
          : isNotEmpty(t("userManagement.validation.subcityRequired"))(value),
      full_name: isNotEmpty(t("userManagement.validation.fullNameRequired")),
      gender: isNotEmpty(t("userManagement.validation.genderRequired")),
      phone_number: (value) =>
        /^\+?\d{10,15}$/.test(value)
          ? null
          : t("userManagement.validation.invalidPhone"),
      responsibility: isNotEmpty(
        t("userManagement.validation.responsibilityRequired")
      ),
      inspection_type: isNotEmpty(
        t("userManagement.validation.inspectionTypeRequired")
      ),
      type: isNotEmpty(t("userManagement.validation.employmentTypeRequired")),
    },
  });

  const handleAvatarChange = (file: File | null) => {
    if (file) {
      if (!file.type.startsWith("image/")) {
        notifications.show({
          title: t("error"),
          message: t("userManagement.validation.invalidImageType"),
          color: "red",
          icon: <IconX size={18} />,
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        notifications.show({
          title: t("error"),
          message: t("userManagement.validation.imageSizeLimit"),
          color: "red",
          icon: <IconX size={18} />,
        });
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !selectedUser) return;

    setUploadingAvatar(true);
    try {
      const uploadResponse = await uploadFile(avatarFile, "avatars");

      const updateResponse = await updateAvatar(
        selectedUser.user_id.toString(),
        {
          avatar: uploadResponse.file.path,
        }
      );

      notifications.show({
        title: t("success"),
        message: t("userManagement.success.avatarUpdated"),
        color: "green",
        icon: <IconCheck size={18} />,
      });

      const usersResponse = await getUserAccounts();
      if (usersResponse.success) {
        setStaffUsers(usersResponse.data);
      }

      setAvatarModalOpened(false);
      setAvatarPreview(null);
      setAvatarFile(null);
    } catch (error) {
      notifications.show({
        title: t("error"),
        message: t("userManagement.error.avatarUpload"),
        color: "red",
        icon: <IconX size={18} />,
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);

    try {
      if (isEditing && currentStaffId) {
        const response = await updateStaffUsers(currentStaffId, {
          user_id: form.values.user_id,
          id: currentStaffId,
          full_name: values.full_name,
          gender: values.gender,
          age: Number(values.age),
          ethnicity: values.ethnicity,
          education_level: values.education_level,
          phone_number: values.phone_number,
          responsibility: values.responsibility,
          inspection_type: values.inspection_type,
          rank: values.rank,
          type: values.type,
        });

        if (response.error) {
          throw new Error(
            response.message || t("userManagement.error.updateStaff")
          );
        }
        setSuccess(true);
      } else {
        const userResponse = await createUser({
          name: values.name,
          email: values.email,
          password: values.password,
          password_confirmation: values.password_confirmation,
          role_id: parseInt(values.role_id),
          woreda_id: parseInt(values.woreda_id),
          subcity_id: parseInt(values.subcity_id),
        });

        if (userResponse.error) {
          throw new Error(
            userResponse.message || t("userManagement.error.createUser")
          );
        }

        let avatarPath = "";
        if (values.avatar) {
          const uploadResponse = await uploadFile(values.avatar, "avatars");
          avatarPath = uploadResponse.file.path;
          await updateAvatar(userResponse.id.toString(), {
            avatar: avatarPath,
          });
        }

        const staffResponse = await createStaffUsers({
          user_id: userResponse.id,
          full_name: values.full_name,
          gender: values.gender,
          age: Number(values.age),
          ethnicity: values.ethnicity,
          education_level: values.education_level,
          phone_number: values.phone_number,
          responsibility: values.responsibility,
          inspection_type: values.inspection_type,
          rank: values.rank,
          type: values.type,
        });

        if (staffResponse.error) {
          throw new Error(
            staffResponse.message || t("userManagement.error.createStaff")
          );
        }
        setSuccess(true);
      }

      const usersResponse = await getUserAccounts();
      if (usersResponse.success) {
        setStaffUsers(usersResponse.data);
      }

      handleCloseModal();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("userManagement.error.unknown")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (staffUser: StaffUser) => {
    setIsEditing(true);
    setCurrentStaffId(staffUser.id);
    setOpened(true); // Open modal FIRST

    // Then set form values
    setTimeout(() => {
      form.setValues({
        user_id: staffUser.user_id,
        name: staffUser.user.name,
        email: staffUser.user.email,
        password: "",
        password_confirmation: "",
        role_id: staffUser.user.role_id.toString(),
        woreda_id: staffUser.user.woreda_id.toString(),
        subcity_id: staffUser.user.subcity_id.toString(),
        full_name: staffUser.full_name,
        gender: staffUser.gender,
        age: Number(staffUser.age),
        ethnicity: staffUser.ethnicity,
        education_level: staffUser.education_level,
        phone_number: staffUser.phone_number,
        responsibility: staffUser.responsibility,
        inspection_type: staffUser.inspection_type,
        rank: staffUser.rank,
        type: staffUser.type,
      });
    }, 100);
  };

  const handleViewId = (staffUser: StaffUser) => {
    setSelectedUser(staffUser);
    setIdModalOpened(true);
  };

  const handleDeleteClick = (id: number) => {
    setStaffToDelete(id);
    setDeleteModalOpened(true);
  };

  const handleConfirmDelete = async () => {
    if (!staffToDelete) return;

    setLoading(true);
    try {
      const response = await deleteStaffUser(staffToDelete);

      if (response.error) {
        throw new Error(
          response.message || t("userManagement.error.deleteUser")
        );
      }

      const usersResponse = await getUserAccounts();
      if (usersResponse.success) {
        setStaffUsers(usersResponse.data);
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("userManagement.error.deleteUser")
      );
    } finally {
      setLoading(false);
      setDeleteModalOpened(false);
      setStaffToDelete(null);
    }
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentStaffId(null);
    form.reset();
    setOpened(true);
  };

  const handleCloseModal = () => {
    setOpened(false);
    setIsEditing(false);
    setCurrentStaffId(null);
    form.reset();
    setError(null);
  };

  // CSV Export Handler
  const handleDownload = () => {
    try {
      // 1. Prepare CSV header
      const headers = [
        "ID",
        "Username",
        "Email",
        "Role",
        "Full Name",
        "Gender",
        "Phone",
        "Type",
        "Age",
        "Ethnicity",
        "Education Level",
        "Responsibility",
        "Inspection Type",
        "Rank",
        "Subcity",
        "Woreda",
      ];

      // 2. Prepare CSV rows
      const rows = staffUsers.map((user) => {
        const role =
          roles.find((r) => r.id === user.user.role_id)?.name.en || "";
        const subcity =
          subcities.find((s) => s.id === user.user.subcity_id)?.name.en || "";
        const woreda =
          woredas.find((w) => w.id === user.user.woreda_id)?.name.en || "";
        return [
          user.id,
          `"${(user.user.name || "").replace(/"/g, '""')}"`,
          `"${(user.user.email || "").replace(/"/g, '""')}"`,
          `"${role.replace(/"/g, '""')}"`,
          `"${(user.full_name || "").replace(/"/g, '""')}"`,
          user.gender,
          user.phone_number,
          user.type,
          user.age,
          `"${(user.ethnicity || "").replace(/"/g, '""')}"`,
          `"${(user.education_level || "").replace(/"/g, '""')}"`,
          `"${(user.responsibility || "").replace(/"/g, '""')}"`,
          `"${(user.inspection_type || "").replace(/"/g, '""')}"`,
          `"${(user.rank || "").replace(/"/g, '""')}"`,
          `"${subcity.replace(/"/g, '""')}"`,
          `"${woreda.replace(/"/g, '""')}"`,
        ];
      });

      // 3. Create CSV content
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\r\n");

      // 4. Create download with BOM for Excel compatibility
      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `staff_export_${format(
        new Date(),
        "yyyyMMdd_HHmmss"
      )}.csv`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      notifications.show({
        title: t("success") || "Success",
        message:
          t("userManagement.exportSuccess") || "CSV downloaded successfully",
        color: "teal",
      });
    } catch (error) {
      console.error("CSV export error:", error);
      notifications.show({
        title: t("error") || "Error",
        message: t("userManagement.exportError") || "Failed to generate CSV",
        color: "red",
      });
    }
  };

  if (loadingData) {
    return (
      <Container
        size="xl"
        className="py-12 flex justify-center items-center h-64"
      >
        <Loader />
        <Loader />
      </Container>
    );
  }

  return (
    <Box p="md" pos="relative">
      {/* <Loader/> */}

      <Group position="apart" mb="md">
        <Title order={2}>{t("userManagement.title")}</Title>
        <Group>
          <Button
            color="green"
            leftIcon={<IconDownload size={16} />}
            onClick={handleDownload}
            variant="light"
          >
            {t("userManagement.exportCsv") || "Export to CSV"}
          </Button>
          <Button
            leftIcon={<IconPlus size={16} />}
            onClick={handleAddNew}
            variant="gradient"
            gradient={{ from: "indigo", to: "cyan" }}
          >
            {t("userManagement.addNewUser")}
          </Button>
        </Group>
      </Group>
      <Divider my="md" className="border-gray-200" />

      <Box className="h-[calc(100vh-200px)] w-full overflow-auto bg-white rounded-lg shadow-md">
        <MantineReactTable
          columns={columns}
          data={staffUsers}
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
          mantineTableProps={{
            className: "border border-gray-200",
          }}
        />
      </Box>

      {/* Create/Edit User Modal */}
      <Modal
        opened={opened}
        onClose={handleCloseModal}
        title={
          <Text className="text-xl font-semibold text-gray-800">
            {isEditing
              ? t("userManagement.editStaffInfo")
              : t("userManagement.createNewUser")}
          </Text>
        }
        size="lg"
        overlayProps={{ blur: 3 }}
        className="rounded-lg"
      >
        <div className="p-4">
          {error && (
            <Notification
              color="red"
              title={t("error")}
              onClose={() => setError(null)}
              className="mb-6"
              withBorder
            >
              {error}
            </Notification>
          )}

          {success && (
            <Notification
              color="green"
              title={t("success")}
              onClose={() => setSuccess(false)}
              className="mb-6"
              withBorder
            >
              {isEditing
                ? t("userManagement.success.update")
                : t("userManagement.success.create")}
            </Notification>
          )}

          <Text size="lg" className="mb-2 font-semibold text-indigo-600">
            {t("userManagement.accountInfo")}
          </Text>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Grid gutter="md">
              <Grid.Col span={12} md={6}>
                <TextInput
                  label={t("userManagement.columns.username")}
                  placeholder={t("userManagement.placeholders.username")}
                  {...form.getInputProps("name")}
                  required={!isEditing}
                  disabled={isEditing}
                  className="mt-2"
                />
              </Grid.Col>

              <Grid.Col span={12} md={6}>
                <TextInput
                  label={t("userManagement.columns.email")}
                  placeholder={t("userManagement.placeholders.email")}
                  type="email"
                  {...form.getInputProps("email")}
                  required={!isEditing}
                  disabled={isEditing}
                  className="mt-2"
                />
              </Grid.Col>

              {!isEditing && (
                <>
                  <Grid.Col span={12} md={6}>
                    <PasswordInput
                      label={t("userManagement.password")}
                      placeholder={t("userManagement.placeholders.password")}
                      {...form.getInputProps("password")}
                      required
                      className="mt-2"
                    />
                  </Grid.Col>

                  <Grid.Col span={12} md={6}>
                    <PasswordInput
                      label={t("userManagement.confirmPassword")}
                      placeholder={t(
                        "userManagement.placeholders.confirmPassword"
                      )}
                      {...form.getInputProps("password_confirmation")}
                      required
                      className="mt-2"
                    />
                  </Grid.Col>
                </>
              )}

              <Grid.Col span={12} md={4}>
                <Select
                  label={t("userManagement.columns.role")}
                  placeholder={t("userManagement.placeholders.selectRole")}
                  data={roles.map((role) => ({
                    value: role.id.toString(),
                    label: role.name.en,
                    description: role.description,
                  }))}
                  {...form.getInputProps("role_id")}
                  required={!isEditing}
                  disabled={isEditing}
                  className="mt-2"
                />
              </Grid.Col>

              <Grid.Col span={12} md={4}>
                <Select
                  label={t("userManagement.columns.subcity")}
                  placeholder={t("userManagement.placeholders.selectSubcity")}
                  data={subcities.map((subcity) => ({
                    value: subcity.id.toString(),
                    label: subcity.name.en,
                  }))}
                  {...form.getInputProps("subcity_id")}
                  required={!isEditing}
                  disabled={isEditing}
                  className="mt-2"
                />
              </Grid.Col>

              <Grid.Col span={12} md={4}>
                <Select
                  label={t("userManagement.columns.woreda")}
                  placeholder={t("userManagement.placeholders.selectWoreda")}
                  data={woredas.map((woreda) => ({
                    value: woreda.id.toString(),
                    label: woreda.name.en,
                  }))}
                  disabled={!form.values.subcity_id || isEditing}
                  {...form.getInputProps("woreda_id")}
                  required={!isEditing}
                  className="mt-2"
                />
              </Grid.Col>
            </Grid>

            <Divider my="md" className="border-gray-200" />

            <Text size="lg" className="mb-2 font-semibold text-indigo-600">
              {t("userManagement.staffInfo")}
            </Text>

            <Grid gutter="md">
              <Grid.Col span={12}>
                <TextInput
                  label={t("userManagement.columns.fullName")}
                  placeholder={t("userManagement.placeholders.fullName")}
                  {...form.getInputProps("full_name")}
                  required
                  className="mt-2"
                />
              </Grid.Col>

              <Grid.Col span={12} md={6}>
                <Select
                  label={t("userManagement.columns.gender")}
                  placeholder={t("userManagement.placeholders.selectGender")}
                  data={[
                    { value: "male", label: t("userManagement.genders.male") },
                    {
                      value: "female",
                      label: t("userManagement.genders.female"),
                    },
                  ]}
                  {...form.getInputProps("gender")}
                  required
                  className="mt-2"
                />
              </Grid.Col>

              <Grid.Col span={12} md={6}>
                <NumberInput
                  label={t("userManagement.age")}
                  min={18}
                  max={100}
                  {...form.getInputProps("age")}
                  required
                  className="mt-2"
                />
              </Grid.Col>

              <Grid.Col span={12} md={6}>
                <TextInput
                  label={t("userManagement.ethnicity")}
                  placeholder={t("userManagement.placeholders.ethnicity")}
                  {...form.getInputProps("ethnicity")}
                  className="mt-2"
                />
              </Grid.Col>

              <Grid.Col span={12} md={6}>
                <Select
                  label={t("userManagement.educationLevel")}
                  placeholder={t("userManagement.placeholders.selectEducation")}
                  data={educationLevels.map((level) => ({
                    value: level,
                    label: level,
                  }))}
                  {...form.getInputProps("education_level")}
                  className="mt-2"
                />
              </Grid.Col>

              <Grid.Col span={12} md={6}>
                <TextInput
                  label={t("userManagement.columns.phone")}
                  placeholder={t("userManagement.placeholders.phone")}
                  {...form.getInputProps("phone_number")}
                  required
                  className="mt-2"
                />
              </Grid.Col>

              <Grid.Col span={12} md={6}>
                <TextInput
                  label={t("userManagement.responsibility")}
                  placeholder={t("userManagement.placeholders.responsibility")}
                  {...form.getInputProps("responsibility")}
                  required
                  className="mt-2"
                />
              </Grid.Col>

              <Grid.Col span={12} md={6}>
                <TextInput
                  label={t("userManagement.inspectionType")}
                  placeholder={t("userManagement.placeholders.inspectionType")}
                  {...form.getInputProps("inspection_type")}
                  required
                  className="mt-2"
                />
              </Grid.Col>

              <Grid.Col span={12} md={6}>
                <TextInput
                  label={t("userManagement.rank")}
                  placeholder={t("userManagement.placeholders.rank")}
                  {...form.getInputProps("rank")}
                  className="mt-2"
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <Select
                  label={t("userManagement.employmentType")}
                  placeholder={t(
                    "userManagement.placeholders.selectEmployment"
                  )}
                  data={[
                    {
                      value: "Permanent",
                      label: t("userManagement.employmentTypes.permanent"),
                    },
                    {
                      value: "Contract",
                      label: t("userManagement.employmentTypes.contract"),
                    },
                    {
                      value: "Temporary",
                      label: t("userManagement.employmentTypes.temporary"),
                    },
                  ]}
                  {...form.getInputProps("type")}
                  required
                />
              </Grid.Col>
            </Grid>

            <Group position="right" mt="xl">
              <Button
                variant="default"
                onClick={handleCloseModal}
                className="hover:bg-gray-100"
              >
                {t("userManagement.cancel")}
              </Button>
              <Button
                type="submit"
                variant="gradient"
                gradient={{ from: "indigo", to: "cyan" }}
                loading={loading}
                className="hover:shadow-lg transition-shadow"
              >
                {isEditing
                  ? t("userManagement.updateStaff")
                  : t("userManagement.createUser")}
              </Button>
            </Group>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title={t("userManagement.confirmDelete")}
        centered
        className="rounded-lg"
      >
        <Text size="sm" mb="xl" className="text-gray-600">
          {t("userManagement.deleteConfirmation")}
        </Text>
        <Group position="right">
          <Button
            variant="default"
            onClick={() => setDeleteModalOpened(false)}
            className="hover:bg-gray-100"
          >
            {t("userManagement.deleteCancel")}
          </Button>
          <Button
            color="red"
            onClick={handleConfirmDelete}
            loading={loading}
            className="hover:bg-red-600"
          >
            {t("userManagement.deleteConfirm")}
          </Button>
        </Group>
      </Modal>

      {/* ID Card Modal */}
      <Modal
        opened={idModalOpened}
        onClose={() => setIdModalOpened(false)}
        title={
          <div className="flex items-center gap-2">
            <IconIdBadge className="text-indigo-600" size={24} />
            <span className="text-xl font-semibold text-gray-800">
              {t("userManagement.staffIdTitle")}
            </span>
          </div>
        }
        size="auto"
        centered
        className="rounded-lg"
      >
        {selectedUser && (
          <div className="p-4">
            <UserIDCard
              user={selectedUser}
              role={roles.find((r) => r.id === selectedUser.user.role_id)}
              woreda={woredas.find((w) => w.id === selectedUser.user.woreda_id)}
              subcity={subcities.find(
                (s) => s.id === selectedUser.user.subcity_id
              )}
              profile_picture={selectedUser.user?.avatar}
            />
          </div>
        )}
      </Modal>

      {/* Avatar Upload/View Modal */}
      <Modal
        opened={avatarModalOpened}
        onClose={() => {
          setAvatarModalOpened(false);
          setAvatarPreview(null);
          setAvatarFile(null);
        }}
        title={t("userManagement.avatarModalTitle")}
        centered
        className="rounded-lg"
      >
        <div className="p-4">
          {selectedUser?.user?.avatar && !avatarFile ? (
            <div className="flex flex-col items-center">
              <Image
                src={`${import.meta.env.VITE_FILE_API}${selectedUser.user.avatar}`}
                width={250}
                height={250}
                radius="md"
                className="border border-gray-200 mb-4"
              />
              <Text size="sm" color="dimmed" mb="md">
                {t("userManagement.currentAvatar")}
              </Text>
            </div>
          ) : (
            <>
              <FileInput
                label={t("userManagement.chooseImage")}
                accept="image/png,image/jpeg,image/webp"
                icon={<IconUpload size={14} />}
                onChange={handleAvatarChange}
                description={t("userManagement.avatarDescription")}
                clearable
                className="mt-2"
              />

              {avatarPreview && (
                <div className="mt-4">
                  <Text size="sm" weight={500} className="mb-2">
                    {t("userManagement.preview")}
                  </Text>
                  <Image
                    src={avatarPreview}
                    width={200}
                    height={200}
                    radius="md"
                    className="border border-gray-200"
                  />
                </div>
              )}
            </>
          )}

          <Group position="right" mt="md">
            <Button
              variant="default"
              onClick={() => setAvatarModalOpened(false)}
              className="hover:bg-gray-100"
            >
              {t("userManagement.cancel")}
            </Button>
            {avatarFile && (
              <Button
                onClick={handleAvatarUpload}
                loading={uploadingAvatar}
                color="blue"
                className="hover:bg-blue-600"
              >
                {t("userManagement.save")}
              </Button>
            )}
          </Group>
        </div>
      </Modal>
    </Box>
  );
};

export default UserManagement;
