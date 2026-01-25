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
  Select,
  Badge,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  createNewsorgStructureSubcity,
  getorgStructureSubcity,
  getorgStructureById,
  deleteorgStructureSubcity,
  updatorgStructureSubcity,
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

interface OrgMember {
  id: number;
  name: string;
  title: string;
  image: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
  children?: OrgMember[];
}

interface SelectItem {
  value: string;
  label: string;
}

const OrganizationalStructure = () => {
  const { t } = useTranslation();
  const [orgData, setOrgData] = useState<OrgMember[]>([]);
  const [flatOrgData, setFlatOrgData] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [parents, setParents] = useState<SelectItem[]>([]);

  const form = useForm({
    initialValues: {
      name: "",
      title: "",
      parent_id: null as number | null,
      imageFile: null as File | null,
      image: "",
    },
    validate: {
      name: (value) =>
        value ? null : t("orgstructureadmin.form.errors.required"),
      title: (value) =>
        value ? null : t("orgstructureadmin.form.errors.required"),
      imageFile: (value, values) =>
        !editingId && !value && !values.image
          ? t("orgstructureadmin.form.errors.imageRequired")
          : null,
    },
  });

  const flattenAllMembers = (members: OrgMember[]): OrgMember[] => {
    return members.reduce((acc: OrgMember[], member: OrgMember) => {
      acc.push({
        id: member.id,
        name: member.name,
        title: member.title,
        image: member.image,
        parent_id: member.parent_id,
        created_at: member.created_at,
        updated_at: member.updated_at,
      });

      if (member.children && member.children.length > 0) {
        acc.push(...flattenAllMembers(member.children));
      }

      return acc;
    }, []);
  };

  const getValidParents = async (currentId?: number): Promise<SelectItem[]> => {
    try {
      const response = await getorgStructureSubcity();
      const allMembers = flattenAllMembers(response || []);

      const options: SelectItem[] = [
        { value: "", label: t("orgstructureadmin.misc.topLevel") },
      ];

      allMembers.forEach((member) => {
        if (!currentId || member.id !== currentId) {
          options.push({
            value: member.id.toString(),
            label: `${member.name} (${member.title})`,
          });
        }
      });

      return options;
    } catch (error) {
      console.error("Failed to fetch valid parents:", error);
      return [{ value: "", label: t("orgstructureadmin.misc.topLevel") }];
    }
  };

  const getMemberNameById = (id: number | null): string => {
    if (!id) return t("orgstructureadmin.misc.topLevel");
    const member = flatOrgData.find((m) => m.id === id);
    return member ? `${member.name} (${member.title})` : `ID: ${id}`;
  };

  const fetchOrgStructure = async () => {
    setLoading(true);
    try {
      const response = await getorgStructureSubcity();
      const allMembers = flattenAllMembers(response || []);

      setOrgData(response || []);
      setFlatOrgData(allMembers);

      const parentOptions = await getValidParents(editingId || undefined);
      setParents(parentOptions);

      showNotification(
        t("orgstructureadmin.notifications.success.load"),
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch organizational structure:", error);
      showNotification(
        t("orgstructureadmin.notifications.error.load"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgStructure();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("orgstructureadmin.notifications.success.title")
          : t("orgstructureadmin.notifications.error.title"),
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

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);

      let image = values.image;

      if (values.imageFile) {
        setFileUploading(true);
        try {
          const uploadResponse = await uploadFile(
            values.imageFile,
            "org-structure"
          );
          image = uploadResponse.file.path;
          showNotification(
            t("orgstructureadmin.notifications.success.upload"),
            "success"
          );
        } catch (error) {
          console.error("File upload error:", error);
          showNotification(
            t("orgstructureadmin.notifications.error.upload"),
            "error"
          );
          return;
        } finally {
          setFileUploading(false);
        }
      } else if (!editingId && !image) {
        showNotification(
          t("orgstructureadmin.form.errors.imageRequired"),
          "error"
        );
        return;
      }

      const payload = {
        name: values.name,
        title: values.title,
        parent_id: values.parent_id,
        image: image,
      };

      if (editingId) {
        await updatorgStructureSubcity({ id: editingId, ...payload });
        showNotification(
          t("orgstructureadmin.notifications.success.update"),
          "success"
        );
      } else {
        await createNewsorgStructureSubcity(payload);
        showNotification(
          t("orgstructureadmin.notifications.success.create"),
          "success"
        );
      }

      resetAndCloseModal();
      fetchOrgStructure();
    } catch (error: any) {
      console.error("Error saving member:", error);

      if (error.response?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          if (form.getInputProps(key)) {
            form.setFieldError(key, errors[key][0]);
          }
        });
      } else {
        showNotification(
          `${
            editingId
              ? t("orgstructureadmin.notifications.error.update")
              : t("notifications.error.create")
          }: ${error.message}`,
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
      const item = await getorgStructureById(id);
      if (!item) {
        showNotification(
          t("orgstructureadmin.notifications.error.notFound"),
          "error"
        );
        return;
      }

      const parentOptions = await getValidParents(id);
      setParents(parentOptions);

      form.setValues({
        name: item.name || "",
        title: item.title || "",
        parent_id: item.parent_id,
        image: item.image || "",
        imageFile: null,
      });

      if (item.image) {
        const imageUrl = item.image.startsWith("http")
          ? item.image
          : `https://bole.prosperity.boleprosperityparty.org/CMSFiles/${item.image}`;
        setPreviewImage(imageUrl);
      }

      setEditingId(item.id);
      openModal();
    } catch (error: any) {
      console.error("Error loading member for edit:", error);
      showNotification(
        error.response?.message ||
          t("orgstructureadmin.notifications.error.load"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(true);
      await deleteorgStructureSubcity(id);
      showNotification(
        t("orgstructureadmin.notifications.success.delete"),
        "success"
      );
      fetchOrgStructure();
    } catch (error: any) {
      console.error("Error deleting member:", error);
      showNotification(
        error.response?.message ||
          t("orgstructureadmin.notifications.error.delete"),
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
          t("orgstructureadmin.form.errors.invalidImage"),
          "error"
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showNotification(t("orgstructureadmin.form.errors.imageSize"), "error");
        return;
      }

      form.setFieldValue("imageFile", file);
      form.setFieldValue("image", "");
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

  const columns: MRT_ColumnDef<OrgMember>[] = [
    {
      accessorKey: "id",
      header: t("orgstructureadmin.columns.id"),
      size: 80,
    },
    {
      accessorKey: "name",
      header: t("orgstructureadmin.columns.name"),
    },
    {
      accessorKey: "title",
      header: t("orgstructureadmin.columns.title"),
      Cell: ({ cell }) => (
        <Badge variant="light" color="blue">
          {cell.getValue<string>()}
        </Badge>
      ),
    },
    {
      accessorKey: "parent_id",
      header: t("orgstructureadmin.columns.parent_id"),
      Cell: ({ row }) => {
        const parentId = row.original.parent_id;
        return <Text>{getMemberNameById(parentId)}</Text>;
      },
    },
    {
      accessorKey: "image",
      header: t("orgstructureadmin.columns.image"),
      Cell: ({ cell }) => {
        const imageUrl = cell.getValue<string>();
        return imageUrl ? (
          <Image
            src={
              imageUrl.startsWith("http")
                ? imageUrl
                : `https://bole.prosperity.boleprosperityparty.org/CMSFiles/${imageUrl}`
            }
            width={60}
            height={60}
            fit="cover"
            radius="md"
            withPlaceholder
            placeholder={<IconPhoto size={24} />}
          />
        ) : (
          <Box
            style={{
              width: 60,
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconPhoto size={24} />
          </Box>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: t("orgstructureadmin.columns.created_at"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value
          ? new Date(value).toLocaleDateString()
          : t("orgstructureadmin.misc.noImage");
      },
    },
    {
      id: "actions",
      header: t("orgstructureadmin.columns.actions"),
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
        <Title order={2}>{t("orgstructureadmin.title")}</Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={async () => {
            form.reset();
            setEditingId(null);
            setPreviewImage(null);
            const parentOptions = await getValidParents();
            setParents(parentOptions);
            openModal();
          }}
          variant="gradient"
          gradient={{ from: "indigo", to: "cyan" }}
        >
          {t("orgstructureadmin.buttons.addMember")}
        </Button>
      </Group>
      <Divider my="md" />

      <Box className="h-[calc(100vh-200px)] w-full overflow-auto">
        <MantineReactTable
          columns={columns}
          data={flatOrgData}
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
            ? t("orgstructureadmin.modals.editTitle")
            : t("orgstructureadmin.modals.addTitle")
        }
        size="lg"
        overlayProps={{ blur: 3 }}
      >
        {(loading || fileUploading) && <Loader />}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Group grow mb="md">
            <TextInput
              withAsterisk
              label={t("orgstructureadmin.form.labels.name")}
              placeholder={t("orgstructureadmin.form.placeholders.name")}
              {...form.getInputProps("name")}
              error={form.errors.name}
            />
            <TextInput
              withAsterisk
              label={t("orgstructureadmin.form.labels.title")}
              placeholder={t("orgstructureadmin.form.placeholders.title")}
              {...form.getInputProps("title")}
              error={form.errors.title}
            />
          </Group>

          <Select
            label={t("orgstructureadmin.form.labels.parent")}
            placeholder={t("orgstructureadmin.form.placeholders.parent")}
            data={parents}
            value={form.values.parent_id?.toString() || ""}
            onChange={(value) =>
              form.setFieldValue("parent_id", value ? parseInt(value) : null)
            }
            mb="md"
            searchable
            clearable
          />

          <FileInput
            label={t("orgstructureadmin.form.labels.image")}
            placeholder={t("orgstructureadmin.form.placeholders.image")}
            accept="image/png,image/jpeg,image/webp"
            icon={<IconUpload size={14} />}
            onChange={handleFileChange}
            mb="md"
            description={t("orgstructureadmin.form.descriptions.image")}
            clearable
            required={!editingId}
            {...form.getInputProps("imageFile")}
            error={form.errors.imageFile}
          />

          {previewImage && (
            <Box mb="md">
              <Image
                src={previewImage}
                height={160}
                width={160}
                fit="cover"
                radius="md"
                withPlaceholder
                alt="Preview"
              />
            </Box>
          )}

          {editingId && form.values.image && !previewImage && (
            <Box mb="md">
              <Text size="sm" mb="xs">
                {t("orgstructureadmin.misc.currentImage")}
              </Text>
              <Image
                src={
                  form.values.image.startsWith("http")
                    ? form.values.image
                    : `https://bole.prosperity.boleprosperityparty.org/CMSFiles/${form.values.image}`
                }
                height={160}
                width={160}
                fit="cover"
                radius="md"
                withPlaceholder
                alt="Current Profile Image"
              />
            </Box>
          )}

          <Group position="right" mt="xl">
            <Button variant="default" onClick={resetAndCloseModal}>
              {t("orgstructureadmin.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              disabled={loading || fileUploading}
            >
              {editingId
                ? t("orgstructureadmin.buttons.updateMember")
                : t("orgstructureadmin.buttons.addMember")}
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t("orgstructureadmin.modals.deleteTitle")}
        centered
      >
        {deleteLoading && <Loader />}
        <Box>
          <Text size="sm" mb="md">
            {t("orgstructureadmin.modals.deleteMessage")}
          </Text>
          <Group position="right" mt="md">
            <Button
              variant="default"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              {t("orgstructureadmin.buttons.cancel")}
            </Button>
            <Button
              color="red"
              loading={deleteLoading}
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
            >
              {t("orgstructureadmin.buttons.delete")}
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
};

export default OrganizationalStructure;
