import {
  TextInput,
  Group,
  Box,
  Title,
  Modal,
  ActionIcon,
  Text,
  Card,
  Stack,
  Tooltip,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import { getAllContact } from "../../services/api/main";
import {
  IconEye,
  IconMail,
  IconUser,
  IconCalendar,
  IconMessage,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/loader";

interface ContactItem {
  id: number;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  updated_at: string;
}

const ViewContacts = () => {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewModalOpen, { open: openViewModal, close: closeViewModal }] =
    useDisclosure(false);
  const [selectedContact, setSelectedContact] = useState<ContactItem | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await getAllContact();
      setContacts(response || []);
      showNotification(
        t("viewcontactadmin.notifications.loadSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      showNotification(t("viewcontactadmin.notifications.loadError"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("viewcontactadmin.notifications.success")
          : t("viewcontactadmin.notifications.error"),
      message,
      color: type === "success" ? "teal" : "red",
      withBorder: true,
    });
  };

  const handleView = (contact: ContactItem) => {
    setSelectedContact(contact);
    openViewModal();
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      (contact.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (contact.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (contact.subject?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const columns: MRT_ColumnDef<ContactItem>[] = [
    {
      accessorKey: "id",
      header: t("viewcontactadmin.table.columns.id"),
      size: 80,
    },
    {
      accessorKey: "full_name",
      header: t("viewcontactadmin.table.columns.fullName"),
      Cell: ({ cell }) => <Text weight={500}>{cell.getValue<string>() || "N/A"}</Text>,
    },
    {
      accessorKey: "email",
      header: t("viewcontactadmin.table.columns.email"),
      Cell: ({ cell }) => {
        const email = cell.getValue<string>();
        return email ? (
          <Text component="a" href={`mailto:${email}`}>
            {email}
          </Text>
        ) : (
          <Text>N/A</Text>
        );
      },
    },
    {
      accessorKey: "subject",
      header: t("viewcontactadmin.table.columns.subject"),
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <Text
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {cell.getValue<string>() || "N/A"}
          </Text>
        </Box>
      ),
    },
    {
      accessorKey: "message",
      header: t("viewcontactadmin.table.columns.message"),
      Cell: ({ cell }) => {
        const message = cell.getValue<string>() || "N/A";
        return (
          <Tooltip label={message} withArrow withinPortal>
            <Box sx={{ maxWidth: 200 }}>
              <Text
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {message}
              </Text>
            </Box>
          </Tooltip>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: t("viewcontactadmin.table.columns.date"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value ? new Date(value).toLocaleString() : "N/A";
      },
    },
    {
      id: "actions",
      header: t("viewcontactadmin.table.columns.actions"),
      Cell: ({ row }) => (
        <Group spacing="xs">
          <ActionIcon
            color="blue"
            variant="light"
            onClick={() => handleView(row.original)}
            title={t("viewcontactadmin.table.actions.view")}
          >
            <IconEye size={16} />
          </ActionIcon>
    
        </Group>
      ),
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <Box p="md" pos="relative">
      <Card withBorder shadow="sm" mb="md">
        <Group position="apart">
          <Title order={2}>{t("viewcontactadmin.title")}</Title>
          <TextInput
            placeholder={t("viewcontactadmin.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            sx={{ width: 300 }}
          />
        </Group>
      </Card>

      <Box
        sx={{ height: "calc(100vh - 180px)", width: "100%", overflow: "auto" }}
      >
        <MantineReactTable
          columns={columns}
          data={filteredContacts}
          state={{ isLoading: loading }}
          enablePagination
          enableSorting
          enableColumnFilters={false}
          enableGlobalFilter={false}
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
        opened={viewModalOpen}
        onClose={closeViewModal}
        title={
          <Text size="xl" weight={600}>
            {t("viewcontactadmin.modal.title")}
          </Text>
        }
        size="lg"
        overlayProps={{
          blur: 3,
        }}
      >
        {selectedContact && (
          <Stack spacing="md">
            <Card withBorder p="md">
              <Group>
                <IconUser size={20} />
                <Text weight={600}>
                  {t("viewcontactadmin.modal.full_name")}:
                </Text>
                <Text>{selectedContact.full_name || "N/A"}</Text>
              </Group>
            </Card>

            <Card withBorder p="md">
              <Group>
                <IconMail size={20} />
                <Text weight={600}>{t("viewcontactadmin.modal.email")}:</Text>
                {selectedContact.email ? (
                  <Text component="a" href={`mailto:${selectedContact.email}`}>
                    {selectedContact.email}
                  </Text>
                ) : (
                  <Text>N/A</Text>
                )}
              </Group>
            </Card>

            <Card withBorder p="md">
              <Group>
                <IconMessage size={20} />
                <Text weight={600}>{t("viewcontactadmin.modal.subject")}:</Text>
                <Text>{selectedContact.subject || "N/A"}</Text>
              </Group>
            </Card>

            <Card withBorder p="md">
              <Group>
                <IconCalendar size={20} />
                <Text weight={600}>{t("viewcontactadmin.modal.date")}:</Text>
                <Text>
                  {selectedContact.created_at ? new Date(selectedContact.created_at).toLocaleString() : "N/A"}
                </Text>
              </Group>
            </Card>

            <Card withBorder p="md">
              <Group mb="sm">
                <IconMessage size={20} />
                <Text weight={600} size="lg">
                  {t("viewcontactadmin.modal.message")}:
                </Text>
              </Group>
              <Card withBorder p="md" bg="gray.0">
                <Text style={{ whiteSpace: "pre-wrap" }}>
                  {selectedContact.message || "N/A"}
                </Text>
              </Card>
            </Card>
          </Stack>
        )}
      </Modal>
    </Box>
  );
};

export default ViewContacts;