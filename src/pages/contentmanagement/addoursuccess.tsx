import {
  TextInput,
  Button,
  Group,
  Box,
  Title,
  Divider,
  Modal,
  ActionIcon,
  LoadingOverlay,
  Badge,
  Switch,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  createCounter,
  getCounters,
  getCounterById,
  updateCounter,
  deleteCounter,
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

interface CounterItem {
  id: number;
  en: {
    visitor: string;
    registered: string;
    completed: string;
  };
  am: {
    visitor: string;
    registered: string;
    completed: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CounterManagement = () => {
  const [counters, setCounters] = useState<CounterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const form = useForm({
    initialValues: {
      en_visitor: "",
      en_registered: "",
      en_completed: "",
      am_visitor: "",
      am_registered: "",
      am_completed: "",
      is_active: true,
    },
    validate: {
      en_visitor: (value) => (/^\d+$/.test(value) ? null : "Must be a number"),
      en_registered: (value) =>
        /^\d+$/.test(value) ? null : "Must be a number",
      en_completed: (value) =>
        /^\d+$/.test(value) ? null : "Must be a number",
      am_visitor: (value) => (/^\d+$/.test(value) ? null : "Must be a number"),
      am_registered: (value) =>
        /^\d+$/.test(value) ? null : "Must be a number",
      am_completed: (value) =>
        /^\d+$/.test(value) ? null : "Must be a number",
    },
  });

  const fetchCounters = async () => {
    setLoading(true);
    try {
      const response = await getCounters();
      // Ensure all counters have the required structure
      const safeCounters = (response || []).map((counter) => ({
        ...counter,
        en: counter.en || { visitor: "0", registered: "0", completed: "0" },
        am: counter.am || { visitor: "0", registered: "0", completed: "0" },
        is_active: counter.is_active !== undefined ? counter.is_active : true,
      }));
      setCounters(safeCounters);
      showNotification("Counters loaded successfully", "success");
    } catch (error) {
      console.error("Failed to fetch counters:", error);
      showNotification("Failed to load counters", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounters();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title: type === "success" ? "Success!" : "Error!",
      message,
      color: type === "success" ? "teal" : "red",
      icon: type === "success" ? <IconCheck size={18} /> : <IconX size={18} />,
      withBorder: true,
      styles: (theme) => ({
        root: {
          backgroundColor:
            theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white,
          borderColor:
            type === "success" ? theme.colors.teal[6] : theme.colors.red[6],
        },
        title: {
          color:
            type === "success" ? theme.colors.teal[6] : theme.colors.red[6],
        },
      }),
    });
  };

  const resetAndCloseModal = () => {
    closeModal();
    setEditingId(null);
    form.reset();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const payload = {
        en: {
          visitor: values.en_visitor,
          registered: values.en_registered,
          completed: values.en_completed,
        },
        am: {
          visitor: values.am_visitor,
          registered: values.am_registered,
          completed: values.am_completed,
        },
        is_active: values.is_active,
      };

      if (editingId) {
        await updateCounter(editingId, payload);
        showNotification("Counter updated successfully", "success");
      } else {
        await createCounter(payload);
        showNotification("Counter created successfully", "success");
      }

      resetAndCloseModal();
      fetchCounters();
    } catch (error) {
      console.error("Error saving counter:", error);
      showNotification("Failed to save counter", "error");
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const response = await getCounterById(id);
      const counter = response;

      form.setValues({
        en_visitor: counter.en?.visitor || "",
        en_registered: counter.en?.registered || "",
        en_completed: counter.en?.completed || "",
        am_visitor: counter.am?.visitor || "",
        am_registered: counter.am?.registered || "",
        am_completed: counter.am?.completed || "",
        is_active: counter.is_active !== undefined ? counter.is_active : true,
      });

      setEditingId(id);
      openModal();
    } catch (error) {
      console.error("Error loading counter for edit:", error);
      showNotification("Failed to load counter for editing", "error");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(true);
      await deleteCounter(id);
      showNotification("Counter deleted successfully", "success");
      fetchCounters();
    } catch (error) {
      console.error("Error deleting counter:", error);
      showNotification("Failed to delete counter", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const confirmDelete = (id: number) => {
    notifications.show({
      id: id.toString(),
      title: "Confirm Deletion",
      message: "Are you sure you want to delete this counter?",
      color: "red",
      withBorder: true,
      icon: <IconTrash size={18} />,
      styles: (theme) => ({
        root: {
          backgroundColor:
            theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white,
          borderColor: theme.colors.red[6],
        },
        title: { color: theme.colors.red[6] },
      }),
      autoClose: false,
      withCloseButton: false,
      children: (
        <Group position="right" mt="md">
          <Button
            variant="outline"
            color="gray"
            onClick={() => notifications.hide(id.toString())}
          >
            Cancel
          </Button>
          <Button
            color="red"
            loading={deleteLoading}
            onClick={() => {
              notifications.hide(id.toString());
              handleDelete(id);
            }}
          >
            Delete
          </Button>
        </Group>
      ),
    });
  };

  const columns: MRT_ColumnDef<CounterItem>[] = [
    {
      accessorKey: "id",
      header: "ID",
      size: 80,
    },
    {
      accessorFn: (row) => row.en?.visitor || "0",
      header: "Visitors (EN)",
      id: "en_visitor",
      Cell: ({ cell }) => (
        <Badge color="blue" variant="light">
          {cell.getValue<string>()}
        </Badge>
      ),
    },
    {
      accessorFn: (row) => row.en?.registered || "0",
      header: "Registered (EN)",
      id: "en_registered",
      Cell: ({ cell }) => (
        <Badge color="green" variant="light">
          {cell.getValue<string>()}
        </Badge>
      ),
    },
    {
      accessorFn: (row) => row.en?.completed || "0",
      header: "Completed (EN)",
      id: "en_completed",
      Cell: ({ cell }) => (
        <Badge color="violet" variant="light">
          {cell.getValue<string>()}
        </Badge>
      ),
    },
    {
      accessorFn: (row) => row.am?.visitor || "0",
      header: "Visitors (AM)",
      id: "am_visitor",
      Cell: ({ cell }) => (
        <Badge color="blue" variant="light">
          {cell.getValue<string>()}
        </Badge>
      ),
    },
    {
      accessorFn: (row) => row.am?.registered || "0",
      header: "Registered (AM)",
      id: "am_registered",
      Cell: ({ cell }) => (
        <Badge color="green" variant="light">
          {cell.getValue<string>()}
        </Badge>
      ),
    },
    {
      accessorFn: (row) => row.am?.completed || "0",
      header: "Completed (AM)",
      id: "am_completed",
      Cell: ({ cell }) => (
        <Badge color="violet" variant="light">
          {cell.getValue<string>()}
        </Badge>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      Cell: ({ cell }) => (
        <Badge
          color={cell.getValue<boolean>() ? "teal" : "orange"}
          variant="filled"
        >
          {cell.getValue<boolean>() ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value ? new Date(value).toLocaleString() : "N/A";
      },
    },
    {
      id: "actions",
      header: "Actions",
      Cell: ({ row }) => (
        <Group spacing="xs">
          <ActionIcon
            color="blue"
            variant="light"
            onClick={() => handleEdit(row.original.id)}
          >
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon
            color="red"
            variant="light"
            onClick={() => confirmDelete(row.original.id)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  return (
    <Box p="md" pos="relative">
      <LoadingOverlay visible={loading} overlayBlur={2} />
      <Group position="apart" mb="md">
        <Title
          order={2}
          sx={(theme) => ({
            color: theme.colorScheme === "dark" ? theme.white : theme.black,
          })}
        >
          Counter Management
        </Title>
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
          Add Counter
        </Button>
      </Group>
      <Divider my="md" />

      <Box
        sx={{ height: "calc(100vh - 200px)", width: "100%", overflow: "auto" }}
      >
        <MantineReactTable
          columns={columns}
          data={counters}
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
              "&::-webkit-scrollbar": {
                height: "10px",
                width: "10px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#ced4da",
                borderRadius: "10px",
              },
            },
          }}
          mantineTableHeadCellProps={{
            sx: {
              fontWeight: 600,
              fontSize: "0.875rem",
            },
          }}
          mantineTableBodyCellProps={{
            sx: {
              fontSize: "0.875rem",
            },
          }}
        />
      </Box>

      <Modal
        opened={modalOpened}
        onClose={resetAndCloseModal}
        title={`${editingId ? "Edit" : "Create"} Counter`}
        size="lg"
        overlayProps={{
          blur: 3,
        }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Title order={4} mb="sm">
            English Values
          </Title>
          <Group grow>
            <TextInput
              label="Visitors"
              placeholder="Enter visitor count"
              {...form.getInputProps("en_visitor")}
            />
            <TextInput
              label="Registered"
              placeholder="Enter registered count"
              {...form.getInputProps("en_registered")}
            />
            <TextInput
              label="Completed"
              placeholder="Enter completed count"
              {...form.getInputProps("en_completed")}
            />
          </Group>

          <Title order={4} mt="md" mb="sm">
            Amharic Values
          </Title>
          <Group grow>
            <TextInput
              label="Visitors (እንግዶች)"
              placeholder="Enter visitor count"
              {...form.getInputProps("am_visitor")}
            />
            <TextInput
              label="Registered (ተመዝግበዋል)"
              placeholder="Enter registered count"
              {...form.getInputProps("am_registered")}
            />
            <TextInput
              label="Completed (ተጠናቀቁ)"
              placeholder="Enter completed count"
              {...form.getInputProps("am_completed")}
            />
          </Group>

          <Switch
            label="Active"
            checked={form.values.is_active}
            onChange={(event) =>
              form.setFieldValue("is_active", event.currentTarget.checked)
            }
            mt="md"
          />

          <Group position="right" mt="xl">
            <Button variant="default" onClick={resetAndCloseModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              loading={loading}
            >
              {editingId ? "Update Counter" : "Create Counter"}
            </Button>
          </Group>
        </form>
      </Modal>
    </Box>
  );
};

export default CounterManagement;
