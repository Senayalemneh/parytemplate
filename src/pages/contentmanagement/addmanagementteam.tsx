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
  Avatar,
  Stack,
  Paper,
  CloseButton,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  getTeamMembers,
  getTeamMemberById,
  deleteTeamMember,
  addTeamMember,
  updateTeamMember,
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

interface TeamMember {
  id: number;
  name: {
    en: string;
    am: string;
  };
  position: {
    en: string;
    am: string;
  };
  department: {
    en: string;
    am: string;
  };
  bio: {
    en: string;
    am: string;
  };
  email: string;
  phone: string;
  avatar: string;
  joinDate: string;
  responsibilities: string[];
  achievements: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const TeamMembersManagement = () => {
  const { t, i18n } = useTranslation();
  const [teamMembersData, setTeamMembersData] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [newResponsibility, setNewResponsibility] = useState("");
  const [newAchievement, setNewAchievement] = useState("");

  const form = useForm({
    initialValues: {
      name_en: "",
      name_am: "",
      position_en: "",
      position_am: "",
      department_en: "",
      department_am: "",
      bio_en: "",
      bio_am: "",
      email: "",
      phone: "",
      joinDate: "",
      responsibilities: [] as string[],
      achievements: [] as string[],
      is_active: true,
      avatarFile: null as File | null,
      avatar_path: "",
    },
    validate: {
      name_en: (value) =>
        value ? null : t("teammembersadmin.validation.nameEnRequired"),
      name_am: (value) =>
        value ? null : t("teammembersadmin.validation.nameAmRequired"),
      position_en: (value) =>
        value ? null : t("teammembersadmin.validation.positionEnRequired"),
      position_am: (value) =>
        value ? null : t("teammembersadmin.validation.positionAmRequired"),
      email: (value) =>
        /^\S+@\S+$/.test(value)
          ? null
          : t("teammembersadmin.validation.invalidEmail"),
      phone: (value) =>
        /^\+?\d{10,15}$/.test(value)
          ? null
          : t("teammembersadmin.validation.invalidPhone"),
      joinDate: (value) =>
        value ? null : t("teammembersadmin.validation.joinDateRequired"),
      avatarFile: (value, values) =>
        !editingId && !value && !values.avatar_path
          ? t("teammembersadmin.validation.avatarRequired")
          : null,
    },
  });

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const response = await getTeamMembers();
      setTeamMembersData(response || []);
      showNotification(
        t("teammembersadmin.notifications.dataLoaded"),
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch team members:", error);
      showNotification(t("teammembersadmin.notifications.loadFailed"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("teammembersadmin.notifications.success")
          : t("teammembersadmin.notifications.error"),
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
    setNewResponsibility("");
    setNewAchievement("");
    form.reset();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);

      if (editingId && (isNaN(editingId) || editingId <= 0)) {
        showNotification(
          t("teammembersadmin.notifications.invalidId"),
          "error"
        );
        return;
      }

      let avatarPath = values.avatar_path;

      if (values.avatarFile) {
        setFileUploading(true);
        try {
          const uploadResponse = await uploadFile(
            values.avatarFile,
            "team-members"
          );
          avatarPath = uploadResponse.file.path;
          showNotification(
            t("teammembersadmin.notifications.avatarUploaded"),
            "success"
          );
        } catch (error) {
          console.error("File upload error:", error);
          showNotification(
            t("teammembersadmin.notifications.avatarUploadFailed"),
            "error"
          );
          return;
        } finally {
          setFileUploading(false);
        }
      } else if (!editingId && !avatarPath) {
        showNotification(
          t("teammembersadmin.notifications.avatarRequired"),
          "error"
        );
        return;
      }

      const payload = {
        name: {
          en: values.name_en,
          am: values.name_am,
        },
        position: {
          en: values.position_en,
          am: values.position_am,
        },
        department: {
          en: values.department_en,
          am: values.department_am,
        },
        bio: {
          en: values.bio_en,
          am: values.bio_am,
        },
        email: values.email,
        phone: values.phone,
        joinDate: values.joinDate,
        responsibilities: values.responsibilities,
        achievements: values.achievements,
        avatar: avatarPath,
        is_active: values.is_active,
      };

      if (editingId) {
        await updateTeamMember(editingId, payload);
        showNotification(
          t("teammembersadmin.notifications.updateSuccess"),
          "success"
        );
      } else {
        await addTeamMember(payload);
        showNotification(
          t("teammembersadmin.notifications.createSuccess"),
          "success"
        );
      }

      resetAndCloseModal();
      fetchTeamMembers();
    } catch (error) {
      console.error("Error saving team member:", error);
      showNotification(
        t(
          editingId
            ? "teammembersadmin.notifications.updateFailed"
            : "teammembersadmin.notifications.createFailed"
        ),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    if (isNaN(id) || id <= 0) {
      showNotification(t("teammembersadmin.notifications.invalidId"), "error");
      return;
    }

    try {
      setLoading(true);
      const item = await getTeamMemberById(id);
      if (!item) {
        showNotification(
          t("teammembersadmin.notifications.memberNotFound"),
          "error"
        );
        return;
      }

      form.setValues({
        name_en: item.name?.en || "",
        name_am: item.name?.am || "",
        position_en: item.position?.en || "",
        position_am: item.position?.am || "",
        department_en: item.department?.en || "",
        department_am: item.department?.am || "",
        bio_en: item.bio?.en || "",
        bio_am: item.bio?.am || "",
        email: item.email || "",
        phone: item.phone || "",
        joinDate: item.joinDate || "",
        responsibilities: item.responsibilities || [],
        achievements: item.achievements || [],
        is_active: item.is_active || true,
        avatar_path: item.avatar || "",
        avatarFile: null,
      });

      setPreviewImage(item.avatar || null);
      setEditingId(item.id);
      openModal();
    } catch (error) {
      console.error("Error loading team member for edit:", error);
      showNotification(
        t("teammembersadmin.notifications.loadEditFailed"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(true);
      await deleteTeamMember(id);
      showNotification(
        t("teammembersadmin.notifications.deleteSuccess"),
        "success"
      );
      fetchTeamMembers();
    } catch (error) {
      console.error("Error deleting team member:", error);
      showNotification(
        t("teammembersadmin.notifications.deleteFailed"),
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
          t("teammembersadmin.notifications.invalidImageType"),
          "error"
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showNotification(
          t("teammembersadmin.notifications.imageSizeLimit"),
          "error"
        );
        return;
      }

      form.setFieldValue("avatarFile", file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setFieldValue("avatarFile", null);
      setPreviewImage(null);
    }
  };

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      form.setFieldValue("responsibilities", [
        ...form.values.responsibilities,
        newResponsibility.trim(),
      ]);
      setNewResponsibility("");
    }
  };

  const removeResponsibility = (index: number) => {
    const updated = [...form.values.responsibilities];
    updated.splice(index, 1);
    form.setFieldValue("responsibilities", updated);
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      form.setFieldValue("achievements", [
        ...form.values.achievements,
        newAchievement.trim(),
      ]);
      setNewAchievement("");
    }
  };

  const removeAchievement = (index: number) => {
    const updated = [...form.values.achievements];
    updated.splice(index, 1);
    form.setFieldValue("achievements", updated);
  };

  const columns: MRT_ColumnDef<TeamMember>[] = [
    {
      accessorKey: "id",
      header: t("teammembersadmin.table.headers.id"),
      size: 80,
    },
    {
      id: "avatar",
      header: t("teammembersadmin.table.headers.avatar"),
      Cell: ({ row }) => (
        <Avatar
          src={`${import.meta.env.VITE_FILE_API}${row.original.avatar}`}
          alt={`${row.original.name[i18n.language as "en" | "am"]} avatar`}
          radius="xl"
          size="md"
        />
      ),
      size: 80,
    },
    {
      accessorFn: (row) => row.name?.am || t("teammembersadmin.table.na"),
      header: t("teammembersadmin.table.headers.nameAm"),
      id: "name_am",
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorFn: (row) => row.name?.en || t("teammembersadmin.table.na"),
      header: t("teammembersadmin.table.headers.nameEn"),
      id: "name_en",
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorFn: (row) =>
        row.position?.[i18n.language as "en" | "am"] ||
        t("teammembersadmin.table.na"),
      header: t("teammembersadmin.table.headers.position"),
      id: "position",
    },
    {
      accessorFn: (row) =>
        row.department?.[i18n.language as "en" | "am"] ||
        t("teammembersadmin.table.na"),
      header: t("teammembersadmin.table.headers.department"),
      id: "department",
    },
    {
      accessorKey: "email",
      header: t("teammembersadmin.table.headers.email"),
    },
    {
      accessorKey: "joinDate",
      header: t("teammembersadmin.table.headers.joinDate"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value
          ? new Date(value).toLocaleDateString()
          : t("teammembersadmin.table.na");
      },
    },
    {
      id: "responsibilities",
      header: t("teammembersadmin.table.headers.responsibilities"),
      Cell: ({ row }) => (
        <Box sx={{ maxWidth: 200 }}>
          {row.original.responsibilities?.slice(0, 2).map((item, index) => (
            <Badge key={index} variant="dot" mr={4} mb={4}>
              {item}
            </Badge>
          ))}
          {row.original.responsibilities?.length > 2 && (
            <Badge variant="light">
              +{row.original.responsibilities.length - 2}{" "}
              {t("teammembersadmin.table.more")}
            </Badge>
          )}
        </Box>
      ),
    },
    {
      accessorKey: "is_active",
      header: t("teammembersadmin.table.headers.status"),
      Cell: ({ cell }) => (
        <Badge
          color={cell.getValue<boolean>() ? "green" : "orange"}
          variant="filled"
        >
          {cell.getValue<boolean>()
            ? t("teammembersadmin.table.active")
            : t("teammembersadmin.table.inactive")}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: t("teammembersadmin.table.headers.createdAt"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value
          ? new Date(value).toLocaleString()
          : t("teammembersadmin.table.na");
      },
    },
    {
      id: "actions",
      header: t("teammembersadmin.table.headers.actions"),
      Cell: ({ row }) => {
        const itemId = row.original.id;
        return (
          <Group spacing="xs">
            <ActionIcon
              color="blue"
              variant="light"
              onClick={() => handleEdit(itemId)}
              title={t("teammembersadmin.actions.edit")}
            >
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon
              color="red"
              variant="light"
              onClick={() => openDeleteConfirm(itemId)}
              title={t("teammembersadmin.actions.delete")}
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
        <Title order={2}>{t("teammembersadmin.title")}</Title>
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
          {t("teammembersadmin.addMember")}
        </Button>
      </Group>
      <Divider my="md" />

      <Box className="h-[calc(100vh-200px)] w-full overflow-auto">
        <MantineReactTable
          columns={columns}
          data={teamMembersData}
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
            ? t("teammembersadmin.editMember")
            : t("teammembersadmin.createMember")
        }
        size="lg"
        overlayProps={{ blur: 3 }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Group grow mb="md">
            <TextInput
              label={t("teammembersadmin.form.nameEn")}
              required
              placeholder={t("teammembersadmin.form.nameEnPlaceholder")}
              {...form.getInputProps("name_en")}
            />
            <TextInput
              label={t("teammembersadmin.form.nameAm")}
              required
              placeholder={t("teammembersadmin.form.nameAmPlaceholder")}
              {...form.getInputProps("name_am")}
            />
          </Group>

          <Group grow mb="md">
            <TextInput
              label={t("teammembersadmin.form.positionEn")}
              required
              placeholder={t("teammembersadmin.form.positionEnPlaceholder")}
              {...form.getInputProps("position_en")}
            />
            <TextInput
              label={t("teammembersadmin.form.positionAm")}
              required
              placeholder={t("teammembersadmin.form.positionAmPlaceholder")}
              {...form.getInputProps("position_am")}
            />
          </Group>

          <Group grow mb="md">
            <TextInput
              label={t("teammembersadmin.form.departmentEn")}
              placeholder={t("teammembersadmin.form.departmentEnPlaceholder")}
              {...form.getInputProps("department_en")}
            />
            <TextInput
              label={t("teammembersadmin.form.departmentAm")}
              placeholder={t("teammembersadmin.form.departmentAmPlaceholder")}
              {...form.getInputProps("department_am")}
            />
          </Group>

          <Group grow mb="md">
            <Textarea
              label={t("teammembersadmin.form.bioEn")}
              placeholder={t("teammembersadmin.form.bioEnPlaceholder")}
              {...form.getInputProps("bio_en")}
            />
            <Textarea
              label={t("teammembersadmin.form.bioAm")}
              placeholder={t("teammembersadmin.form.bioAmPlaceholder")}
              {...form.getInputProps("bio_am")}
            />
          </Group>

          <Group grow mb="md">
            <TextInput
              label={t("teammembersadmin.form.email")}
              required
              placeholder={t("teammembersadmin.form.emailPlaceholder")}
              type="email"
              {...form.getInputProps("email")}
            />
            <TextInput
              label={t("teammembersadmin.form.phone")}
              required
              placeholder={t("teammembersadmin.form.phonePlaceholder")}
              {...form.getInputProps("phone")}
            />
          </Group>

          <TextInput
            label={t("teammembersadmin.form.joinDate")}
            required
            type="date"
            {...form.getInputProps("joinDate")}
            mb="md"
          />

          <Box mb="md">
            <Text size="sm" weight={500} mb={4}>
              {t("teammembersadmin.form.responsibilities")}
            </Text>
            <Group mb="xs">
              <TextInput
                placeholder={t(
                  "teammembersadmin.form.responsibilityPlaceholder"
                )}
                value={newResponsibility}
                onChange={(e) => setNewResponsibility(e.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Button
                onClick={addResponsibility}
                variant="light"
                leftIcon={<IconPlus size={16} />}
              >
                {t("teammembersadmin.add")}
              </Button>
            </Group>
            <Stack spacing="xs">
              {form.values.responsibilities.map((item, index) => (
                <Paper key={index} p="xs" withBorder>
                  <Group position="apart">
                    <Text>{item}</Text>
                    <CloseButton
                      onClick={() => removeResponsibility(index)}
                      size="sm"
                    />
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Box>

          <Box mb="md">
            <Text size="sm" weight={500} mb={4}>
              {t("teammembersadmin.form.achievements")}
            </Text>
            <Group mb="xs">
              <TextInput
                placeholder={t("teammembersadmin.form.achievementPlaceholder")}
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Button
                onClick={addAchievement}
                variant="light"
                leftIcon={<IconPlus size={16} />}
              >
                {t("teammembersadmin.add")}
              </Button>
            </Group>
            <Stack spacing="xs">
              {form.values.achievements.map((item, index) => (
                <Paper key={index} p="xs" withBorder>
                  <Group position="apart">
                    <Text>{item}</Text>
                    <CloseButton
                      onClick={() => removeAchievement(index)}
                      size="sm"
                    />
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Box>

          <FileInput
            label={t("teammembersadmin.form.avatar")}
            placeholder={t("teammembersadmin.form.avatarPlaceholder")}
            accept="image/png,image/jpeg,image/webp"
            icon={<IconUpload size={14} />}
            onChange={handleFileChange}
            mb="md"
            description={t("teammembersadmin.form.avatarDescription")}
            clearable
            required={!editingId}
            {...form.getInputProps("avatarFile")}
          />

          {(previewImage || form.values.avatar_path) && (
            <Box mb="md">
              <Image
                src={
                  previewImage ||
                  `${import.meta.env.VITE_FILE_API}${form.values.avatar_path}`
                }
                height={160}
                fit="contain"
                withPlaceholder
                alt={t("teammembersadmin.form.avatarPreview")}
              />
            </Box>
          )}

          <Switch
            label={t("teammembersadmin.form.active")}
            checked={form.values.is_active}
            onChange={(e) =>
              form.setFieldValue("is_active", e.currentTarget.checked)
            }
            mb="md"
          />

          <Group position="right" mt="xl">
            <Button variant="default" onClick={resetAndCloseModal}>
              {t("teammembersadmin.cancel")}
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              loading={loading || fileUploading}
            >
              {editingId
                ? t("teammembersadmin.updateMember")
                : t("teammembersadmin.createMember")}
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t("teammembersadmin.deleteConfirm.title")}
        centered
      >
        <Box>
          <Text size="sm" mb="md">
            {t("teammembersadmin.deleteConfirm.message")}
          </Text>
          <Group position="right" mt="md">
            <Button
              variant="default"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              {t("teammembersadmin.deleteConfirm.cancel")}
            </Button>
            <Button
              color="red"
              loading={deleteLoading}
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
            >
              {t("teammembersadmin.deleteConfirm.delete")}
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
};

export default TeamMembersManagement;
