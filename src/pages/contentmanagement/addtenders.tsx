import {
  TextInput,
  Textarea,
  Button,
  Group,
  Box,
  Title,
  Divider,
  Modal,
  ActionIcon,
  Badge,
  FileInput,
  Text,
  Table,
  Anchor,
  List,
  Chip,
  Paper,
  Grid,
  Stack,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  createTender,
  getTenders,
  getTenderById,
  deleteTender,
  updateTender,
  uploadFile,
} from "../../services/api/main";
import {
  IconPencil,
  IconTrash,
  IconPlus,
  IconCheck,
  IconX,
  IconFile,
  IconFileTypePdf,
  IconFileTypeDoc,
  IconDownload,
  IconPhone,
  IconMail,
  IconUser,
  IconUpload,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { DatePicker } from "@mantine/dates";
import { format, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/loader";

interface Document {
  name: string;
  url: string;
  type: string;
}

interface ContactPerson {
  name: string;
  position: string;
  phone: string;
  email: string;
}

interface TenderItem {
  id?: number;
  title: string;
  description: string;
  tender_number: string;
  published_date: string;
  closing_date: string;
  opening_date: string;
  category: string;
  budget: string;
  status: "open" | "closed" | "awarded" | "cancelled";
  documents: Document[];
  requirements: string[];
  contact_person: ContactPerson;
  created_at?: string;
  updated_at?: string;
}

const statusColors = {
  open: "green",
  closed: "orange",
  awarded: "blue",
  cancelled: "red",
};

const Tenders = () => {
  const { t } = useTranslation();
  const [tendersData, setTendersData] = useState<TenderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState("");

  const statusOptions = [
    { value: "open", label: "Open" },
    { value: "closed", label: "Closed" },
    { value: "awarded", label: "Awarded" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const form = useForm({
    initialValues: {
      title: "",
      description: "",
      tender_number: "",
      published_date: new Date(),
      closing_date: new Date(),
      opening_date: new Date(),
      category: "",
      budget: "",
      status: "open" as "open" | "closed" | "awarded" | "cancelled",
      contact_name: "",
      contact_position: "",
      contact_phone: "",
      contact_email: "",
      documentFiles: [] as File[],
    },
    validate: {
      title: (value) => (value ? null : "Title is required"),
      description: (value) => (value ? null : "Description is required"),
      tender_number: (value) => (value ? null : "Tender number is required"),
      published_date: (value) => (value ? null : "Published date is required"),
      closing_date: (value) => (value ? null : "Closing date is required"),
      opening_date: (value) => (value ? null : "Opening date is required"),
      category: (value) => (value ? null : "Category is required"),
      budget: (value) => (value ? null : "Budget is required"),
      contact_name: (value) => (value ? null : "Contact name is required"),
      contact_position: (value) =>
        value ? null : "Contact position is required",
      contact_phone: (value) => (value ? null : "Contact phone is required"),
      contact_email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "Invalid email",
    },
  });

  const fetchTenders = async () => {
    setLoading(true);
    try {
      const response = await getTenders();
      setTendersData(response || []);
      showNotification("Tenders loaded successfully", "success");
    } catch (error) {
      console.error("Failed to fetch tenders:", error);
      showNotification("Failed to load tenders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenders();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title: type === "success" ? "Success" : "Error",
      message,
      color: type === "success" ? "teal" : "red",
      icon: type === "success" ? <IconCheck size={18} /> : <IconX size={18} />,
      withBorder: true,
    });
  };

  const resetAndCloseModal = () => {
    closeModal();
    setEditingId(null);
    setDocuments([]);
    setRequirements([]);
    setNewRequirement("");
    form.reset();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      const formatDate = (date: Date) => format(date, "yyyy-MM-dd");

      const uploadedDocuments = [...documents];

      if (values.documentFiles.length > 0) {
        setFileUploading(true);
        try {
          for (const file of values.documentFiles) {
            const uploadResponse = await uploadFile(file, "tenders");
            uploadedDocuments.push({
              name: file.name,
              url: uploadResponse.file.path,
              type: file.type.includes("pdf") ? "pdf" : "doc",
            });
          }
          showNotification("Documents uploaded successfully", "success");
        } catch (error) {
          console.error("File upload error:", error);
          showNotification("Failed to upload documents", "error");
          return;
        } finally {
          setFileUploading(false);
        }
      }

      const payload: TenderItem = {
        title: values.title,
        description: values.description,
        tender_number: values.tender_number,
        published_date: formatDate(values.published_date),
        closing_date: formatDate(values.closing_date),
        opening_date: formatDate(values.opening_date),
        category: values.category,
        budget: values.budget,
        status: values.status,
        documents: uploadedDocuments,
        requirements: requirements,
        contact_person: {
          name: values.contact_name,
          position: values.contact_position,
          phone: values.contact_phone,
          email: values.contact_email,
        },
      };

      if (editingId) {
        await updateTender(editingId, payload);
        showNotification("Tender updated successfully", "success");
      } else {
        await createTender(payload);
        showNotification("Tender created successfully", "success");
      }

      resetAndCloseModal();
      fetchTenders();
    } catch (error) {
      console.error("Error saving tender:", error);
      showNotification(
        editingId ? "Failed to update tender" : "Failed to create tender",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      setLoading(true);
      const item = await getTenderById(id);
      if (!item) {
        showNotification("Tender not found", "error");
        return;
      }

      form.setValues({
        title: item.title,
        description: item.description,
        tender_number: item.tender_number,
        published_date: item.published_date
          ? parseISO(item.published_date)
          : new Date(),
        closing_date: item.closing_date
          ? parseISO(item.closing_date)
          : new Date(),
        opening_date: item.opening_date
          ? parseISO(item.opening_date)
          : new Date(),
        category: item.category,
        budget: item.budget,
        status: item.status,
        contact_name: item.contact_person?.name || "",
        contact_position: item.contact_person?.position || "",
        contact_phone: item.contact_person?.phone || "",
        contact_email: item.contact_person?.email || "",
        documentFiles: [],
      });

      setDocuments(item.documents || []);
      setRequirements(item.requirements || []);
      setEditingId(item.id || null);
      openModal();
    } catch (error) {
      console.error("Error loading tender for edit:", error);
      showNotification("Failed to load tender for edit", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(true);
      await deleteTender(id);

      // Update local state immediately instead of refetching
      setTendersData((prev) => prev.filter((tender) => tender.id !== id));
      showNotification("Tender deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting tender:", error);
      showNotification("Failed to delete tender", "error");
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

  const handleFileChange = (files: File[]) => {
    if (files) {
      form.setFieldValue("documentFiles", Array.from(files));
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    const updatedRequirements = [...requirements];
    updatedRequirements.splice(index, 1);
    setRequirements(updatedRequirements);
  };

  const removeDocument = (index: number) => {
    const updatedDocuments = [...documents];
    updatedDocuments.splice(index, 1);
    setDocuments(updatedDocuments);
  };

  const columns: MRT_ColumnDef<TenderItem>[] = [
    {
      accessorKey: "tender_number",
      header: "Tender Number",
      size: 120,
    },
    {
      accessorKey: "title",
      header: "Title",
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 300 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      Cell: ({ cell }) => (
        <Badge color="blue" variant="light">
          {cell.getValue<string>()}
        </Badge>
      ),
    },
    {
      accessorKey: "budget",
      header: "Budget",
    },
    {
      accessorKey: "published_date",
      header: "Published Date",
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value ? format(parseISO(value), "MMM dd, yyyy") : "N/A";
      },
    },
    {
      accessorKey: "closing_date",
      header: "Closing Date",
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value ? format(parseISO(value), "MMM dd, yyyy") : "N/A";
      },
    },
    {
      accessorKey: "opening_date",
      header: "Opening Date",
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value ? format(parseISO(value), "MMM dd, yyyy") : "N/A";
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      Cell: ({ cell }) => (
        <Badge
          color={statusColors[cell.getValue<keyof typeof statusColors>()]}
          variant="filled"
        >
          {cell.getValue<string>().charAt(0).toUpperCase() +
            cell.getValue<string>().slice(1)}
        </Badge>
      ),
    },
    {
      accessorKey: "documents",
      header: "Documents",
      Cell: ({ cell }) => (
        <Group spacing="xs">
          {cell.getValue<Document[]>()?.map((doc, index) => (
            <ActionIcon
              key={index}
              component="a"
              href={doc.url}
              target="_blank"
              size="sm"
            >
              {doc.type === "pdf" ? (
                <IconFileTypePdf size={16} />
              ) : (
                <IconFileTypeDoc size={16} />
              )}
            </ActionIcon>
          ))}
        </Group>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      Cell: ({ row }) => {
        const itemId = row.original.id;
        return (
          <Group spacing="xs">
            <ActionIcon
              color="blue"
              variant="light"
              onClick={() => handleEdit(itemId!)}
              title="Edit"
            >
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon
              color="red"
              variant="light"
              onClick={() => openDeleteConfirm(itemId!)}
              title="Delete"
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        );
      },
    },
  ];

  const DocumentIcon = ({ type }: { type: string }) => {
    switch (type) {
      case "pdf":
        return <IconFileTypePdf size={16} />;
      case "doc":
        return <IconFileTypeDoc size={16} />;
      default:
        return <IconFile size={16} />;
    }
  };

  return (
    <Box p="md" pos="relative">
      {loading && <Loader />}
      <Group position="apart" mb="md">
        <Title order={2}>Tenders Management</Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={() => {
            form.reset();
            setEditingId(null);
            setDocuments([]);
            setRequirements([]);
            openModal();
          }}
          variant="gradient"
          gradient={{ from: "indigo", to: "cyan" }}
        >
          Add New Tender
        </Button>
      </Group>
      <Divider my="md" />

      <Box className="h-[calc(100vh-200px)] w-full overflow-auto">
        <MantineReactTable
          columns={columns}
          data={tendersData}
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
        title={editingId ? "Edit Tender" : "Create New Tender"}
        size="xl"
        overlayProps={{ blur: 3 }}
      >
        {loading && <Loader />}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Grid gutter="md">
            <Grid.Col span={6}>
              <TextInput
                label="Tender Title"
                required
                placeholder="Enter tender title"
                {...form.getInputProps("title")}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Tender Number"
                required
                placeholder="Enter tender number"
                {...form.getInputProps("tender_number")}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Textarea
                label="Description"
                required
                placeholder="Enter tender description"
                minRows={3}
                {...form.getInputProps("description")}
              />
            </Grid.Col>

            <Grid.Col span={4}>
              <TextInput
                label="Category"
                required
                placeholder="Enter category (e.g. Construction)"
                {...form.getInputProps("category")}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput
                label="Budget"
                required
                placeholder="Enter budget amount"
                {...form.getInputProps("budget")}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <Select
                label="Status"
                required
                data={statusOptions}
                {...form.getInputProps("status")}
              />
            </Grid.Col>

            <Grid.Col span={4}>
              <DatePicker
                label="Published Date"
                required
                placeholder="Select published date"
                {...form.getInputProps("published_date")}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <DatePicker
                label="Closing Date"
                required
                placeholder="Select closing date"
                {...form.getInputProps("closing_date")}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <DatePicker
                label="Opening Date"
                required
                placeholder="Select opening date"
                {...form.getInputProps("opening_date")}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Text size="sm" weight={500} mb="xs">
                Requirements
              </Text>
              <Group spacing="xs" mb="xs">
                {requirements.map((req, index) => (
                  <Chip
                    key={index}
                    checked={false}
                    onDelete={() => removeRequirement(index)}
                  >
                    {req}
                  </Chip>
                ))}
              </Group>
              <Group>
                <TextInput
                  placeholder="Add new requirement"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.currentTarget.value)}
                  style={{ flex: 1 }}
                />
                <Button onClick={addRequirement} variant="outline">
                  Add
                </Button>
              </Group>
            </Grid.Col>

            <Grid.Col span={12}>
              <Text size="sm" weight={500} mb="xs">
                Documents
              </Text>
              {documents.length > 0 && (
                <Paper withBorder p="sm" mb="md">
                  <List spacing="xs">
                    {documents.map((doc, index) => (
                      <List.Item
                        key={index}
                        icon={<DocumentIcon type={doc.type} />}
                      >
                        <Group position="apart">
                          <Anchor href={doc.url} target="_blank">
                            {doc.name}
                          </Anchor>
                          <ActionIcon
                            color="red"
                            size="sm"
                            onClick={() => removeDocument(index)}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      </List.Item>
                    ))}
                  </List>
                </Paper>
              )}
              <FileInput
                label="Upload Documents"
                placeholder="Select documents"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={handleFileChange}
                icon={<IconUpload size={14} />}
                description="PDF or Word documents only"
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Text size="sm" weight={500} mb="xs">
                Contact Person
              </Text>
              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    label="Name"
                    required
                    placeholder="Enter contact name"
                    icon={<IconUser size={16} />}
                    {...form.getInputProps("contact_name")}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Position"
                    required
                    placeholder="Enter contact position"
                    {...form.getInputProps("contact_position")}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Phone"
                    required
                    placeholder="Enter contact phone"
                    icon={<IconPhone size={16} />}
                    {...form.getInputProps("contact_phone")}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Email"
                    required
                    placeholder="Enter contact email"
                    icon={<IconMail size={16} />}
                    {...form.getInputProps("contact_email")}
                  />
                </Grid.Col>
              </Grid>
            </Grid.Col>
          </Grid>

          <Group position="right" mt="xl">
            <Button variant="default" onClick={resetAndCloseModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              loading={loading || fileUploading}
            >
              {editingId ? "Update Tender" : "Create Tender"}
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Deletion"
        centered
      >
        {deleteLoading && <Loader />}
        <Box>
          <Text size="sm" mb="md">
            Are you sure you want to delete this tender? This action cannot be
            undone.
          </Text>
          <Group position="right" mt="md">
            <Button
              variant="default"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="red"
              loading={deleteLoading}
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
            >
              Delete
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
};

export default Tenders;
