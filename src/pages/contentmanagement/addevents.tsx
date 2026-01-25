import { useTranslation } from "react-i18next";
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
  Select,
  Badge,
  FileInput,
  Image,
  Text,
  Chip,
  MultiSelect,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  createEvent,
  getEvents,
  getEventById,
  deleteEvent,
  updateEvent,
  uploadFile,
} from "../../services/api/main";
import {
  IconPencil,
  IconTrash,
  IconPlus,
  IconCheck,
  IconX,
  IconStar,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconLink,
  IconUser,
  IconMail,
  IconUpload,
  IconPhoto,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { DatePicker } from "@mantine/dates";
import { format } from "date-fns";
import Loader from "../../components/common/loader";

interface EventItem {
  id: number;
  title: {
    en: string;
    am: string;
  };
  description: {
    en: string;
    am: string;
  };
  date: string;
  time: {
    en: string;
    am: string;
  };
  location: {
    en: string;
    am: string;
  };
  category: {
    en: string;
    am: string;
  };
  image: string;
  organizer: {
    name: string;
    contact: string;
  };
  isFeatured: boolean;
  registrationRequired: boolean;
  registrationLink: string;
  attendees: number;
  tags: string[];
  created_at?: string;
  updated_at?: string;
}

const mockCategories = [
  { value: "Technology", label: "Technology" },
  { value: "Business", label: "Business" },
  { value: "Education", label: "Education" },
  { value: "Health", label: "Health" },
];

const mockTags = [
  { value: "conference", label: "Conference" },
  { value: "workshop", label: "Workshop" },
  { value: "seminar", label: "Seminar" },
  { value: "networking", label: "Networking" },
  { value: "exhibition", label: "Exhibition" },
];

const Events = () => {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const form = useForm({
    initialValues: {
      title_en: "",
      title_am: "",
      description_en: "",
      description_am: "",
      date: new Date(),
      time_en: "",
      time_am: "",
      location_en: "",
      location_am: "",
      category_en: "",
      category_am: "",
      image_path: "",
      organizer_name: "",
      organizer_contact: "",
      isFeatured: false,
      registrationRequired: false,
      registrationLink: "",
      attendees: 0,
      tags: [] as string[],
      imageFile: null as File | null,
    },
    validate: {
      title_en: (value) => (value ? null : t("eventsadmin.validation.titleEn")),
      title_am: (value) => (value ? null : t("eventsadmin.validation.titleAm")),
      description_en: (value) => (value ? null : t("eventsadmin.validation.descriptionEn")),
      description_am: (value) => (value ? null : t("eventsadmin.validation.descriptionAm")),
      date: (value) => (value ? null : t("eventsadmin.validation.date")),
      time_en: (value) => (value ? null : t("eventsadmin.validation.timeEn")),
      time_am: (value) => (value ? null : t("eventsadmin.validation.timeAm")),
      location_en: (value) => (value ? null : t("eventsadmin.validation.locationEn")),
      location_am: (value) => (value ? null : t("eventsadmin.validation.locationAm")),
      category_en: (value) => (value ? null : t("eventsadmin.validation.category")),
      category_am: (value) => (value ? null : t("eventsadmin.validation.category")),
      organizer_name: (value) => (value ? null : t("eventsadmin.validation.organizerName")),
      organizer_contact: (value) =>
        value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? null
          : t("eventsadmin.validation.organizerContact"),
      imageFile: (value, values) =>
        !editingId && !value && !values.image_path
          ? t("veventsadmin.alidation.image")
          : null,
    },
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await getEvents();
      setEvents(response || []);
      showNotification(t("eventsadmin.notifications.loadSuccess"), "success");
    } catch (error) {
      console.error("Failed to fetch events:", error);
      showNotification(t("eventsadmin.notifications.loadError"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("eventsadmin.notifications.success")
          : t("eventsadmin.notifications.error"),
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

      if (editingId && (isNaN(editingId) || editingId <= 0)) {
        showNotification(t("eventsadmin.notifications.invalidId"), "error");
        return;
      }

      let imagePath = values.image_path;

      if (values.imageFile) {
        setFileUploading(true);
        try {
          const uploadResponse = await uploadFile(values.imageFile, "events");
          imagePath = uploadResponse.file.path;
          showNotification(t("eventsadmin.notifications.uploadSuccess"), "success");
        } catch (error) {
          console.error("File upload error:", error);
          showNotification(t("eventsadmin.notifications.uploadError"), "error");
          return;
        } finally {
          setFileUploading(false);
        }
      } else if (!editingId && !imagePath) {
        showNotification(t("eventsadmin.validation.image"), "error");
        return;
      }

      const payload = {
        title: {
          en: values.title_en,
          am: values.title_am,
        },
        description: {
          en: values.description_en,
          am: values.description_am,
        },
        date: format(values.date, "yyyy-MM-dd"),
        time: {
          en: values.time_en,
          am: values.time_am,
        },
        location: {
          en: values.location_en,
          am: values.location_am,
        },
        category: {
          en: values.category_en,
          am: values.category_am,
        },
        image: imagePath,
        organizer: {
          name: values.organizer_name,
          contact: values.organizer_contact,
        },
        isFeatured: values.isFeatured,
        registrationRequired: values.registrationRequired,
        registrationLink: values.registrationLink,
        attendees: values.attendees,
        tags: values.tags,
      };

      if (editingId) {
        await updateEvent(editingId, payload);
        showNotification(t("eventsadmin.notifications.updateSuccess"), "success");
      } else {
        await createEvent(payload);
        showNotification(t("eventsadmin.notifications.createSuccess"), "success");
      }

      resetAndCloseModal();
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      showNotification(
        t(
          editingId ? "eventsadmin.notifications.updateError" : "eventsadmin.notifications.createError"
        ),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    if (isNaN(id) || id <= 0) {
      showNotification(t("eventsadmin.notifications.invalidId"), "error");
      return;
    }

    try {
      setLoading(true);
      const item = await getEventById(id);
      if (!item) {
        showNotification(t("eventsadmin.notifications.notFound"), "error");
        return;
      }

      form.setValues({
        title_en: item.title?.en || "",
        title_am: item.title?.am || "",
        description_en: item.description?.en || "",
        description_am: item.description?.am || "",
        date: item.date ? new Date(item.date) : new Date(),
        time_en: item.time?.en || "",
        time_am: item.time?.am || "",
        location_en: item.location?.en || "",
        location_am: item.location?.am || "",
        category_en: item.category?.en || "",
        category_am: item.category?.am || "",
        image_path: item.image || "",
        organizer_name: item.organizer?.name || "",
        organizer_contact: item.organizer?.contact || "",
        isFeatured: item.isFeatured || false,
        registrationRequired: item.registrationRequired || false,
        registrationLink: item.registrationLink || "",
        attendees: item.attendees || 0,
        tags: item.tags || [],
        imageFile: null,
      });

      setPreviewImage(
        item.image
          ? `https://bole.prosperity.boleprosperityparty.org/CMSFiles/${item.image}`
          : null
      );
      setEditingId(item.id);
      openModal();
    } catch (error) {
      console.error("Error loading event for edit:", error);
      showNotification(t("eventsadmin.notifications.loadEditError"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(true);
      await deleteEvent(id);
      showNotification(t("eventsadmin.notifications.deleteSuccess"), "success");
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      showNotification(t("eventsadmin.notifications.deleteError"), "error");
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
        showNotification(t("eventsadmin.validation.invalidImageType"), "error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showNotification(t("eventsadmin.validation.imageSize"), "error");
        return;
      }

      form.setFieldValue("imageFile", file);
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

  const FeaturedBadge = (props: ChipProps) => (
    <Chip
      variant="filled"
      size="sm"
      checked={false}
      icon={<IconStar size={14} />}
      styles={{
        iconWrapper: {
          display: "flex",
          alignItems: "center",
        },
      }}
      {...props}
    >
      {t("eventsadmin.featured")}
    </Chip>
  );

  const columns: MRT_ColumnDef<EventItem>[] = [
    {
      accessorKey: "id",
      header: t("eventsadmin.columns.id"),
      size: 80,
    },
    {
      accessorFn: (row) => row.title?.[i18n.language] || "N/A",
      header: t("eventsadmin.columns.title"),
      id: "title",
      Cell: ({ cell, row }) => (
        <Box sx={{ maxWidth: 200 }}>
          <Group spacing="xs" noWrap>
            {row.original.isFeatured && <FeaturedBadge />}
            <div className="truncate">{cell.getValue<string>()}</div>
          </Group>
        </Box>
      ),
    },
    {
      accessorFn: (row) => row.category?.[i18n.language] || "N/A",
      header: t("eventsadmin.columns.category"),
      id: "category",
      Cell: ({ cell }) => (
        <Badge color="blue" variant="light">
          {cell.getValue<string>()}
        </Badge>
      ),
    },
    {
      accessorKey: "date",
      header: t("eventsadmin.columns.date"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value ? (
          <Group spacing={4} noWrap>
            <IconCalendar size={16} />
            {new Date(value).toLocaleDateString()}
          </Group>
        ) : (
          "N/A"
        );
      },
    },
    {
      accessorFn: (row) => row.time?.[i18n.language] || "N/A",
      header: t("eventsadmin.columns.time"),
      id: "time",
      Cell: ({ cell }) => (
        <Group spacing={4} noWrap>
          <IconClock size={16} />
          {cell.getValue<string>()}
        </Group>
      ),
    },
    {
      accessorFn: (row) => row.location?.[i18n.language] || "N/A",
      header: t("eventsadmin.columns.location"),
      id: "location",
      Cell: ({ cell }) => (
        <Group spacing={4} noWrap>
          <IconMapPin size={16} />
          <div className="truncate" style={{ maxWidth: 150 }}>
            {cell.getValue<string>()}
          </div>
        </Group>
      ),
    },
    {
      accessorFn: (row) => row.organizer?.name || "N/A",
      header: t("eventsadmin.columns.organizer"),
      id: "organizer",
      Cell: ({ cell }) => (
        <Group spacing={4} noWrap>
          <IconUser size={16} />
          {cell.getValue<string>()}
        </Group>
      ),
    },
    {
      accessorKey: "attendees",
      header: t("eventsadmin.columns.attendees"),
      Cell: ({ cell }) => (
        <Badge variant="outline" color="green">
          {cell.getValue<number>()}
        </Badge>
      ),
    },
    {
      accessorKey: "image",
      header: t("eventsadmin.columns.image"),
      Cell: ({ cell }) => (
        <Image
          src={`https://bole.prosperity.boleprosperityparty.org/CMSFiles/${cell.getValue<string>()}`}
          width={60}
          height={60}
          fit="cover"
          withPlaceholder
          placeholder={<IconPhoto size={24} />}
        />
      ),
    },
    {
      id: "actions",
      header: t("eventsadmin.columns.actions"),
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
        <Title order={2}>{t("eventsadmin.title")}</Title>
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
          {t("eventsadmin.addEvent")}
        </Button>
      </Group>
      <Divider my="md" />

      <Box className="h-[calc(100vh-200px)] w-full overflow-auto">
        <MantineReactTable
          columns={columns}
          data={events}
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
        title={t(editingId ? "eventsadmin.editTitle" : "eventsadmin.createTitle")}
        size="lg"
        overlayProps={{ blur: 3 }}
      >
        {loading && <Loader />}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Group grow mb="md">
            <TextInput
              label={t("eventsadmin.eventsadmin.form.titleEn")}
              required
              placeholder={t("eventsadmin.form.titleEnPlaceholder")}
              {...form.getInputProps("title_en")}
            />
            <TextInput
              label={t("eventsadmin.form.titleAm")}
              required
              placeholder={t("eventsadmin.form.titleAmPlaceholder")}
              {...form.getInputProps("title_am")}
            />
          </Group>

          <Group grow mb="md">
            <Textarea
              label={t("eventsadmin.form.descriptionEn")}
              required
              placeholder={t("eventsadmin.form.descriptionEnPlaceholder")}
              {...form.getInputProps("description_en")}
            />
            <Textarea
              label={t("eventsadmin.form.descriptionAm")}
              required
              placeholder={t("eventsadmin.form.descriptionAmPlaceholder")}
              {...form.getInputProps("description_am")}
            />
          </Group>

          <Group grow mb="md">
            <DatePicker
              label={t("eventsadmin.form.date")}
              required
              placeholder={t("eventsadmin.form.datePlaceholder")}
              {...form.getInputProps("date")}
            />
            <Select
              label={t("eventsadmin.form.categoryEn")}
              required
              placeholder={t("eventsadmin.form.categoryPlaceholder")}
              data={mockCategories}
              {...form.getInputProps("category_en")}
            />
          </Group>

          <Group grow mb="md">
            <Select
              label={t("eventsadmin.form.categoryAm")}
              required
              placeholder={t("eventsadmin.form.categoryPlaceholder")}
              data={mockCategories}
              {...form.getInputProps("category_am")}
            />
            <TextInput
              label={t("eventsadmin.form.timeEn")}
              required
              placeholder={t("eventsadmin.form.timeEnPlaceholder")}
              {...form.getInputProps("time_en")}
            />
          </Group>

          <Group grow mb="md">
            <TextInput
              label={t("eventsadmin.form.timeAm")}
              required
              placeholder={t("eventsadmin.form.timeAmPlaceholder")}
              {...form.getInputProps("time_am")}
            />
            <TextInput
              label={t("eventsadmin.form.locationEn")}
              required
              placeholder={t("eventsadmin.form.locationEnPlaceholder")}
              {...form.getInputProps("location_en")}
            />
          </Group>

          <Group grow mb="md">
            <TextInput
              label={t("eventsadmin.form.locationAm")}
              required
              placeholder={t("eventsadmin.form.locationAmPlaceholder")}
              {...form.getInputProps("location_am")}
            />
            <TextInput
              label={t("eventsadmin.form.organizerName")}
              required
              placeholder={t("eventsadmin.form.organizerNamePlaceholder")}
              icon={<IconUser size={16} />}
              {...form.getInputProps("organizer_name")}
            />
          </Group>

          <Group grow mb="md">
            <TextInput
              label={t("eventsadmin.form.organizerContact")}
              required
              placeholder={t("eventsadmin.form.organizerContactPlaceholder")}
              icon={<IconMail size={16} />}
              {...form.getInputProps("organizer_contact")}
            />
            <TextInput
              label={t("eventsadmin.form.registrationLink")}
              placeholder={t("eventsadmin.form.registrationLinkPlaceholder")}
              icon={<IconLink size={16} />}
              {...form.getInputProps("registrationLink")}
            />
          </Group>

          <Group grow mb="md">
            <TextInput
              label={t("eventsadmin.form.attendees")}
              type="number"
              placeholder={t("eventsadmin.form.attendeesPlaceholder")}
              {...form.getInputProps("attendees")}
            />
            <MultiSelect
              label={t("eventsadmin.form.tags")}
              data={mockTags}
              placeholder={t("eventsadmin.form.tagsPlaceholder")}
              searchable
              creatable
              {...form.getInputProps("tags")}
            />
          </Group>

          <Group mb="md">
            <Switch
              label={t("eventsadmin.form.featuredEvent")}
              checked={form.values.isFeatured}
              onChange={(e) =>
                form.setFieldValue("isFeatured", e.currentTarget.checked)
              }
              thumbIcon={
                form.values.isFeatured ? (
                  <IconStar size={12} color="yellow" stroke={3} />
                ) : undefined
              }
            />
            <Switch
              label={t("eventsadmin.form.registrationRequired")}
              checked={form.values.registrationRequired}
              onChange={(e) =>
                form.setFieldValue(
                  "registrationRequired",
                  e.currentTarget.checked
                )
              }
            />
          </Group>

          <FileInput
            label={t("eventsadmin.form.image")}
            placeholder={t("eventsadmin.form.imagePlaceholder")}
            accept="image/png,image/jpeg,image/webp"
            icon={<IconUpload size={14} />}
            onChange={handleFileChange}
            mb="md"
            description={t("eventsadmin.form.imageDescription")}
            clearable
            required={!editingId}
            {...form.getInputProps("imageFile")}
          />

          {(previewImage || form.values.image_path) && (
            <Box mb="md">
              <Image
                src={
                  previewImage ||
                  `https://bole.prosperity.boleprosperityparty.org/CMSFiles/${form.values.image_path}`
                }
                height={160}
                fit="contain"
                withPlaceholder
                alt="Preview"
              />
            </Box>
          )}

          <Group position="right" mt="xl">
            <Button variant="default" onClick={resetAndCloseModal}>
              {t("eventsadmin.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              loading={loading || fileUploading}
            >
              {t(editingId ? "eventsadmin.buttons.update" : "eventsadmin.buttons.create")}
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t("eventsadmin.deleteModal.title")}
        centered
      >
        {deleteLoading && <Loader />}
        <Box>
          <Text size="sm" mb="md">
            {t("eventsadmin.deleteModal.message")}
          </Text>
          <Group position="right" mt="md">
            <Button
              variant="default"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              {t("eventsadmin.buttons.cancel")}
            </Button>
            <Button
              color="red"
              loading={deleteLoading}
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
            >
              {t("eventsadmin.buttons.delete")}
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
};

export default Events;