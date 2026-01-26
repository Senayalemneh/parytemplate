import {
  TextInput,
  Button,
  Group,
  Box,
  Title,
  Divider,
  Modal,
  ActionIcon,
  Badge,
  Text,
  Card,
  Paper,
  Stack,
  Grid,
  Avatar,
  Textarea,
  Select,
  Alert,
  Tabs,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  getAllCompliant,
  deleteCompliant,
  createCompliantResponse,
  getCompliantResponseById,
  changeCompliantStatus,
} from "../../services/api/main";
import {
  IconTrash,
  IconEye,
  IconSearch,
  IconAlertCircle,
  IconUser,
  IconPhone,
  IconBuilding,
  IconMessage,
  IconFileDescription,
  IconCheck,
  IconFile,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/loader";

interface LocalizedField {
  en?: string;
  am?: string;
}

interface ComplaintItem {
  id: number;
  fullName?: string | LocalizedField;
  phone?: string;
  subCity?: string | LocalizedField;
  woreda?: string | LocalizedField;
  houseNumber?: string;
  institution?: string | LocalizedField;
  complaintPlace?: string | LocalizedField;
  complaintDetails?: string | LocalizedField;
  complaintWant?: string | LocalizedField;
  disclaimerAccepted?: boolean | string;
  evidence?: string | Array<{ url?: string; evidence?: string }>;
  created_at?: string;
  status?: "draft" | "pending" | "in_progress" | "resolved" | "rejected";
}

interface ResponseItem {
  id: number;
  complaints_id: number;
  compliant_evaluation: boolean;
  compliant_findings: string;
  general_response: boolean;
  general_response_detail: string;
  compliant_evaluator_person_fullname: string;
  issuer_id: number;
  response_date: string;
}

interface ResponseFormValues {
  complaints_id: number;
  compliant_evaluation: boolean;
  compliant_findings: string;
  general_response: boolean;
  general_response_detail: string;
  compliant_evaluator_person_fullname: string;
  issuer_id: number;
  response_date: string;
}

const cleanJsonString = (str: string): string => {
  if (!str) return str;
  if (str.startsWith('"') && str.endsWith('"')) {
    str = str.slice(1, -1);
  }
  return str.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
};

const parseLocalizedField = (field: any): LocalizedField => {
  if (!field) return { en: "N/A", am: "N/A" };

  if (typeof field === "string") {
    try {
      const cleaned = cleanJsonString(field);
      if (cleaned === "{}") return { en: "N/A", am: "N/A" };
      const parsed = JSON.parse(cleaned);
      if (Object.keys(parsed).length === 0) return { en: "N/A", am: "N/A" };
      return parsed;
    } catch {
      return { en: field, am: field };
    }
  }

  if (typeof field === "object") {
    return field;
  }

  return { en: String(field), am: String(field) };
};

const getFieldValue = (field: any, lang: "en" | "am" = "en"): string => {
  const parsed = parseLocalizedField(field);
  return parsed[lang] || parsed.en || "N/A";
};

const parseEvidence = (evidence: any): Array<{ url?: string; evidence?: string }> => {
  if (!evidence) return [];

  if (typeof evidence === "string") {
    try {
      const cleaned = cleanJsonString(evidence);
      if (cleaned === "[]") return [];
      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) {
        if (typeof parsed === "object" && parsed !== null) {
          return [parsed];
        }
        return [];
      }
      return parsed;
    } catch {
      return [];
    }
  }

  if (Array.isArray(evidence)) {
    return evidence;
  }

  if (typeof evidence === "object" && evidence !== null) {
    return [evidence];
  }

  return [];
};

const cleanUrl = (url: string): string => {
  if (!url) return "";
  let cleaned = url.replace(/\\/g, "/");
  cleaned = cleaned.replace(/([^:]\/)\/+/g, "$1");
  
  // If it's already a full URL, return as is
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return cleaned;
  }
  
  // Handle different URL formats
  if (cleaned.startsWith("/")) {
    cleaned = cleaned.substring(1);
  }
  
  // Construct the full URL with your domain
  return `${import.meta.env.VITE_FILE_API}${cleaned}`;
};

const ViewComplaints = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("active");
  const [allComplaints, setAllComplaints] = useState<ComplaintItem[]>([]);
  const [activeComplaints, setActiveComplaints] = useState<ComplaintItem[]>([]);
  const [resolvedComplaints, setResolvedComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewModalOpen, { open: openViewModal, close: closeViewModal }] =
    useDisclosure(false);
  const [
    responseModalOpen,
    { open: openResponseModal, close: closeResponseModal },
  ] = useDisclosure(false);
  const [
    viewResponseModalOpen,
    { open: openViewResponseModal, close: closeViewResponseModal },
  ] = useDisclosure(false);
  const [selectedComplaint, setSelectedComplaint] =
    useState<ComplaintItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [responseLoading, setResponseLoading] = useState(false);
  const [viewResponseLoading, setViewResponseLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<ResponseItem | null>(null);

  const [responseForm, setResponseForm] = useState<ResponseFormValues>({
    complaints_id: 0,
    compliant_evaluation: true,
    compliant_findings: "",
    general_response: true,
    general_response_detail: "",
    compliant_evaluator_person_fullname: "",
    issuer_id: 2,
    response_date: new Date().toISOString(),
  });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await getAllCompliant();
      const processedComplaints = (response || []).map((complaint) => ({
        ...complaint,
        fullName: parseLocalizedField(complaint.fullName),
        subCity: parseLocalizedField(complaint.subCity),
        woreda: parseLocalizedField(complaint.woreda),
        institution: parseLocalizedField(complaint.institution),
        complaintPlace: parseLocalizedField(complaint.complaintPlace),
        complaintDetails: parseLocalizedField(complaint.complaintDetails),
        complaintWant: parseLocalizedField(complaint.complaintWant),
        evidence: parseEvidence(complaint.evidence),
        disclaimerAccepted:
          complaint.disclaimerAccepted === "1" ||
          complaint.disclaimerAccepted === true,
      }));

      processedComplaints.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });

      setAllComplaints(processedComplaints);

      const active = processedComplaints.filter(
        (complaint) => complaint.status !== "resolved"
      );
      const resolved = processedComplaints.filter(
        (complaint) => complaint.status === "resolved"
      );

      setActiveComplaints(active);
      setResolvedComplaints(resolved);

      showNotification(
        t("viewcompliantadmin.notification.complaintsLoaded") ||
          "Complaints loaded successfully",
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
      showNotification(
        t("viewcompliantadmin.notification.failedLoadComplaints") ||
          "Failed to load complaints",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchResponseById = async (complaintId: number) => {
    setViewResponseLoading(true);
    try {
      const response = await getCompliantResponseById(complaintId);
      setCurrentResponse(response);
      openViewResponseModal();
    } catch (error) {
      console.error("Failed to fetch response:", error);
      showNotification(
        t("viewcompliantadmin.notification.failedLoadResponse") ||
          "Failed to load response",
        "error"
      );
    } finally {
      setViewResponseLoading(false);
    }
  };

  const updateComplaintStatus = async (id: number, status: string) => {
    try {
      await changeCompliantStatus(id, { status });
      showNotification(
        t("viewcompliantadmin.notification.statusUpdated") ||
          "Status updated successfully",
        "success"
      );
      fetchComplaints();
    } catch (error) {
      console.error("Error updating status:", error);
      showNotification(
        t("viewcompliantadmin.notification.failedUpdateStatus") ||
          "Failed to update status",
        "error"
      );
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("viewcompliantadmin.notification.success") || "Success!"
          : t("viewcompliantadmin.notification.error") || "Error!",
      message,
      color: type === "success" ? "teal" : "red",
      withBorder: true,
    });
  };

  const handleView = (complaint: ComplaintItem) => {
    setSelectedComplaint(complaint);
    openViewModal();
  };

  const handleViewResponse = (complaintId: number) => {
    fetchResponseById(complaintId);
  };

  const handleResponse = (complaint: ComplaintItem) => {
    setSelectedComplaint(complaint);
    setResponseForm({
      ...responseForm,
      complaints_id: complaint.id,
    });
    openResponseModal();
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(true);
      await deleteCompliant(id);
      showNotification(
        t("viewcompliantadmin.notification.complaintDeleted") ||
          "Complaint deleted successfully",
        "success"
      );
      fetchComplaints();
    } catch (error) {
      console.error("Error deleting complaint:", error);
      showNotification(
        t("viewcompliantadmin.notification.failedDeleteComplaint") ||
          "Failed to delete complaint",
        "error"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    try {
      setResponseLoading(true);
      await createCompliantResponse(responseForm);

      if (responseForm.complaints_id) {
        await updateComplaintStatus(responseForm.complaints_id, "resolved");
      }

      showNotification(
        t("viewcompliantadmin.notification.responseSubmitted") ||
          "Response submitted successfully",
        "success"
      );
      closeResponseModal();
      fetchComplaints();
    } catch (error) {
      console.error("Error submitting response:", error);
      showNotification(
        t("viewcompliantadmin.notification.failedSubmitResponse") ||
          "Failed to submit response",
        "error"
      );
    } finally {
      setResponseLoading(false);
    }
  };

  const confirmDelete = (id: number) => {
    notifications.show({
      id: id.toString(),
      title: t("viewcompliantadmin.confirmDeletion") || "Confirm Deletion",
      message:
        t("viewcompliantadmin.deleteComplaintConfirm") ||
        "Are you sure you want to delete this complaint?",
      color: "red",
      withBorder: true,
      autoClose: false,
      withCloseButton: false,
      children: (
        <Group position="right" mt="md">
          <Button
            variant="outline"
            color="gray"
            onClick={() => notifications.hide(id.toString())}
          >
            {t("viewcompliantadmin.cancel") || "Cancel"}
          </Button>
          <Button
            color="red"
            loading={deleteLoading}
            onClick={() => {
              notifications.hide(id.toString());
              handleDelete(id);
            }}
          >
            {t("viewcompliantadmin.delete") || "Delete"}
          </Button>
        </Group>
      ),
    });
  };

  const getFilteredComplaints = (complaints: ComplaintItem[]) => {
    return complaints.filter((complaint) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        getFieldValue(complaint.fullName).toLowerCase().includes(searchLower) ||
        (complaint.phone || "").toLowerCase().includes(searchLower) ||
        getFieldValue(complaint.institution)
          .toLowerCase()
          .includes(searchLower) ||
        getFieldValue(complaint.complaintPlace)
          .toLowerCase()
          .includes(searchLower)
      );
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge color="gray">
            {t("viewcompliantadmin.status.draft") || "Draft"}
          </Badge>
        );
      case "pending":
        return (
          <Badge color="yellow">
            {t("viewcompliantadmin.status.pending") || "Pending"}
          </Badge>
        );
      case "in_progress":
        return (
          <Badge color="blue">
            {t("viewcompliantadmin.status.inProgress") || "In Progress"}
          </Badge>
        );
      case "resolved":
        return (
          <Badge color="green">
            {t("viewcompliantadmin.status.resolved") || "Resolved"}
          </Badge>
        );
      case "rejected":
        return (
          <Badge color="red">
            {t("viewcompliantadmin.status.rejected") || "Rejected"}
          </Badge>
        );
      default:
        return (
          <Badge>
            {status || t("viewcompliantadmin.status.unknown") || "Unknown"}
          </Badge>
        );
    }
  };

  const columns: MRT_ColumnDef<ComplaintItem>[] = [
    {
      accessorKey: "id",
      header: t("viewcompliantadmin.columns.id") || "ID",
      size: 60,
    },
    {
      accessorKey: "fullName",
      header: t("viewcompliantadmin.columns.fullName") || "Full Name",
      Cell: ({ cell }) => (
        <Text weight={500}>{getFieldValue(cell.getValue())}</Text>
      ),
    },
    {
      accessorKey: "phone",
      header: t("viewcompliantadmin.columns.phone") || "Phone",
      Cell: ({ cell }) => (
        <Text component="a" href={`tel:${cell.getValue<string>()}`}>
          {cell.getValue<string>() || "N/A"}
        </Text>
      ),
    },
    {
      accessorKey: "institution",
      header: t("viewcompliantadmin.columns.institution") || "Institution",
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <Text
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {getFieldValue(cell.getValue())}
          </Text>
        </Box>
      ),
    },
    {
      accessorKey: "complaintPlace",
      header:
        t("viewcompliantadmin.columns.complaintPlace") || "Complaint Place",
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 150 }}>
          <Text
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {getFieldValue(cell.getValue())}
          </Text>
        </Box>
      ),
    },
    {
      accessorKey: "status",
      header: t("viewcompliantadmin.columns.status") || "Status",
      Cell: ({ cell }) => getStatusBadge(cell.getValue<string>()),
    },
    {
      accessorKey: "created_at",
      header: t("viewcompliantadmin.columns.date") || "Date",
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value ? format(new Date(value), "PPpp") : "N/A";
      },
    },
    {
      id: "actions",
      header: t("viewcompliantadmin.columns.actions") || "Actions",
      Cell: ({ row }) => (
        <Group spacing="xs">
          <ActionIcon
            color="blue"
            variant="light"
            onClick={() => handleView(row.original)}
          >
            <IconEye size={16} />
          </ActionIcon>
          {row.original.status !== "resolved" && (
            <ActionIcon
              color="green"
              variant="light"
              onClick={() => handleResponse(row.original)}
            >
              <IconMessage size={16} />
            </ActionIcon>
          )}
      
        </Group>
      ),
    },
  ];

  return (
    <Box p="md" pos="relative">
      {loading && <Loader />}

      <Card withBorder shadow="sm" mb="md" radius="md">
        <Group position="apart">
          <Title order={2}>
            {t("viewcompliantadmin.title") || "Complaint Management"}
          </Title>
          <TextInput
            placeholder={
              t("viewcompliantadmin.searchPlaceholder") ||
              "Search complaints..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            icon={<IconSearch size={16} />}
            sx={{ width: 300 }}
          />
        </Group>
      </Card>

      <Tabs
        value={activeTab}
        onTabChange={(value) => setActiveTab(value || "active")}
      >
        <Tabs.List>
          <Tabs.Tab value="active" icon={<IconAlertCircle size={14} />}>
            {t("viewcompliantadmin.tabs.active") || "Active Complaints"}
          </Tabs.Tab>
          <Tabs.Tab value="resolved" icon={<IconCheck size={14} />}>
            {t("viewcompliantadmin.tabs.resolved") || "Resolved Complaints"}
          </Tabs.Tab>
        </Tabs.List>

        <Box
          sx={{
            height: "calc(100vh - 210px)",
            width: "100%",
            overflow: "auto",
          }}
          mt="md"
        >
          {activeTab === "active" ? (
            <MantineReactTable
              columns={columns}
              data={getFilteredComplaints(activeComplaints)}
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
                  maxHeight: "calc(100vh - 240px)",
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
                  backgroundColor: "#f8f9fa",
                },
              }}
              mantineTableBodyCellProps={{
                sx: {
                  fontSize: "0.875rem",
                },
              }}
            />
          ) : (
            <MantineReactTable
              columns={columns}
              data={getFilteredComplaints(resolvedComplaints)}
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
                  maxHeight: "calc(100vh - 240px)",
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
                  backgroundColor: "#f8f9fa",
                },
              }}
              mantineTableBodyCellProps={{
                sx: {
                  fontSize: "0.875rem",
                },
              }}
            />
          )}
        </Box>
      </Tabs>

      {/* View Complaint Modal */}
      <Modal
        opened={viewModalOpen}
        onClose={closeViewModal}
        title={
          <Title order={3}>
            {t("viewcompliantadmin.modal.title") || "Complaint Details"}
          </Title>
        }
        size="lg"
        overlayProps={{
          blur: 3,
        }}
      >
        {selectedComplaint && (
          <Stack spacing="md">
            <Paper withBorder p="md" radius="md">
              <Group>
                <Avatar color="blue" radius="xl">
                  <IconUser size={24} />
                </Avatar>
                <div>
                  <Text size="sm" color="dimmed">
                    {t("viewcompliantadmin.modal.complainant") || "Complainant"}
                  </Text>
                  <Title order={4}>
                    {getFieldValue(selectedComplaint.fullName)}
                  </Title>
                </div>
              </Group>
            </Paper>

            <Grid gutter="md">
              <Grid.Col span={6}>
                <Card withBorder p="sm" radius="md">
                  <Group spacing="xs" mb="sm">
                    <IconPhone size={18} color="#4dabf7" />
                    <Text weight={500}>
                      {t("viewcompliantadmin.modal.contactInfo") ||
                        "Contact Information"}
                    </Text>
                  </Group>
                  <Divider mb="sm" />
                  <Stack spacing="xs">
                    <Group position="apart">
                      <Text size="sm" color="dimmed">
                        {t("viewcompliantadmin.modal.phone") || "Phone"}:
                      </Text>
                      <Text weight={500}>
                        <a href={`tel:${selectedComplaint.phone}`}>
                          {selectedComplaint.phone || "N/A"}
                        </a>
                      </Text>
                    </Group>
                    <Group position="apart">
                      <Text size="sm" color="dimmed">
                        {t("viewcompliantadmin.modal.address") || "Address"}:
                      </Text>
                      <Text weight={500}>
                        {getFieldValue(selectedComplaint.subCity)},{" "}
                        {getFieldValue(selectedComplaint.woreda)}
                      </Text>
                    </Group>
                    <Group position="apart">
                      <Text size="sm" color="dimmed">
                        {t("viewcompliantadmin.modal.houseNumber") ||
                          "House Number"}
                        :
                      </Text>
                      <Text weight={500}>
                        {selectedComplaint.houseNumber || "N/A"}
                      </Text>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>

              <Grid.Col span={6}>
                <Card withBorder p="sm" radius="md">
                  <Group spacing="xs" mb="sm">
                    <IconBuilding size={18} color="#4dabf7" />
                    <Text weight={500}>
                      {t("viewcompliantadmin.modal.institutionInfo") ||
                        "Institution Information"}
                    </Text>
                  </Group>
                  <Divider mb="sm" />
                  <Stack spacing="xs">
                    <Group position="apart">
                      <Text size="sm" color="dimmed">
                        {t("viewcompliantadmin.modal.institution") ||
                          "Institution"}
                        :
                      </Text>
                      <Text weight={500}>
                        {getFieldValue(selectedComplaint.institution)}
                      </Text>
                    </Group>
                    <Group position="apart">
                      <Text size="sm" color="dimmed">
                        {t("viewcompliantadmin.modal.complaintPlace") ||
                          "Complaint Place"}
                        :
                      </Text>
                      <Text weight={500}>
                        {getFieldValue(selectedComplaint.complaintPlace)}
                      </Text>
                    </Group>
                    <Group position="apart">
                      <Text size="sm" color="dimmed">
                        {t("viewcompliantadmin.modal.status") || "Status"}:
                      </Text>
                      {getStatusBadge(selectedComplaint.status)}
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>

            <Card withBorder p="sm" radius="md">
              <Group spacing="xs" mb="sm">
                <IconAlertCircle size={18} color="#4dabf7" />
                <Text weight={500}>
                  {t("viewcompliantadmin.modal.complaintDetails") ||
                    "Complaint Details"}
                </Text>
              </Group>
              <Divider mb="sm" />
              <Text>{getFieldValue(selectedComplaint.complaintDetails)}</Text>
            </Card>

            <Card withBorder p="sm" radius="md">
              <Group spacing="xs" mb="sm">
                <IconAlertCircle size={18} color="#4dabf7" />
                <Text weight={500}>
                  {t("viewcompliantadmin.modal.requestedSolution") ||
                    "Requested Solution"}
                </Text>
              </Group>
              <Divider mb="sm" />
              <Text>{getFieldValue(selectedComplaint.complaintWant)}</Text>
            </Card>

            {selectedComplaint.evidence &&
              selectedComplaint.evidence.length > 0 && (
                <Card withBorder p="sm" radius="md">
                  <Group spacing="xs" mb="sm">
                    <IconFile size={18} color="#4dabf7" />
                    <Text weight={500}>
                      {t("viewcompliantadmin.modal.supportingEvidence") ||
                        "Supporting Evidence"}
                    </Text>
                  </Group>
                  <Divider mb="sm" />
                  <Group>
                    {selectedComplaint.evidence.map((evidence, index) => {
                      const evidenceUrl = evidence.url || evidence.evidence;
                      if (!evidenceUrl) return null;

                      const displayUrl = cleanUrl(evidenceUrl);
                      const isPdf = displayUrl.toLowerCase().endsWith(".pdf");
                      const isImage = /\.(jpg|jpeg|png|gif)$/i.test(displayUrl);

                      return (
                        <Button
                          key={index}
                          component="a"
                          href={displayUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="outline"
                          leftIcon={
                            isPdf ? <IconFileDescription size={16} /> : null
                          }
                        >
                          {t("viewcompliantadmin.modal.viewEvidence") ||
                            "View Evidence"}{" "}
                          {index + 1}
                          {isPdf && " (PDF)"}
                          {isImage && " (Image)"}
                        </Button>
                      );
                    })}
                  </Group>
                </Card>
              )}

            <Group position="apart" mt="md">
              <Text size="sm" color="dimmed">
                {t("viewcompliantadmin.modal.submittedOn") || "Submitted on"}:{" "}
                {selectedComplaint.created_at
                  ? format(new Date(selectedComplaint.created_at), "PPpp")
                  : "N/A"}
              </Text>
              <Badge
                color={selectedComplaint.disclaimerAccepted ? "green" : "red"}
              >
                {selectedComplaint.disclaimerAccepted
                  ? t("viewcompliantadmin.modal.disclaimerAccepted") ||
                    "Disclaimer Accepted"
                  : t("viewcompliantadmin.modal.disclaimerNotAccepted") ||
                    "Disclaimer Not Accepted"}
              </Badge>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Response Submission Modal */}
      <Modal
        opened={responseModalOpen}
        onClose={closeResponseModal}
        title={
          <Title order={3}>
            {t("viewcompliantadmin.responseModal.title") || "Submit Response"}
          </Title>
        }
        size="lg"
        overlayProps={{
          blur: 3,
        }}
      >
        {selectedComplaint && (
          <Stack spacing="md">
            <Text>
              {t("viewcompliantadmin.responseModal.complaintId") ||
                "Complaint ID"}
              :{" "}
              <Text weight="bold" component="span">
                {selectedComplaint.id}
              </Text>
            </Text>
            <Text>
              {t("viewcompliantadmin.responseModal.complainant") ||
                "Complainant"}
              :{" "}
              <Text weight="bold" component="span">
                {getFieldValue(selectedComplaint.fullName)}
              </Text>
            </Text>

            <Select
              label={
                t("viewcompliantadmin.responseModal.complaintEvaluation") ||
                "Complaint Evaluation"
              }
              placeholder={
                t("viewcompliantadmin.responseModal.selectEvaluation") ||
                "Select evaluation"
              }
              value={responseForm.compliant_evaluation ? "true" : "false"}
              onChange={(value) =>
                setResponseForm({
                  ...responseForm,
                  compliant_evaluation: value === "true",
                })
              }
              data={[
                {
                  value: "true",
                  label: t("viewcompliantadmin.responseModal.valid") || "Valid",
                },
                {
                  value: "false",
                  label:
                    t("viewcompliantadmin.responseModal.invalid") || "Invalid",
                },
              ]}
            />

            <Textarea
              label={
                t("viewcompliantadmin.responseModal.findings") || "Findings"
              }
              placeholder={
                t("viewcompliantadmin.responseModal.enterFindings") ||
                "Enter your findings"
              }
              value={responseForm.compliant_findings}
              onChange={(e) =>
                setResponseForm({
                  ...responseForm,
                  compliant_findings: e.currentTarget.value,
                })
              }
              minRows={3}
            />

            <Select
              label={
                t("viewcompliantadmin.responseModal.generalResponse") ||
                "General Response"
              }
              placeholder={
                t("viewcompliantadmin.responseModal.selectResponse") ||
                "Select response"
              }
              value={responseForm.general_response ? "true" : "false"}
              onChange={(value) =>
                setResponseForm({
                  ...responseForm,
                  general_response: value === "true",
                })
              }
              data={[
                {
                  value: "true",
                  label:
                    t("viewcompliantadmin.responseModal.positive") ||
                    "Positive",
                },
                {
                  value: "false",
                  label:
                    t("viewcompliantadmin.responseModal.negative") ||
                    "Negative",
                },
              ]}
            />

            <Textarea
              label={
                t("viewcompliantadmin.responseModal.responseDetails") ||
                "Response Details"
              }
              placeholder={
                t("viewcompliantadmin.responseModal.enterDetails") ||
                "Enter response details"
              }
              value={responseForm.general_response_detail}
              onChange={(e) =>
                setResponseForm({
                  ...responseForm,
                  general_response_detail: e.currentTarget.value,
                })
              }
              minRows={3}
            />

            <TextInput
              label={
                t("viewcompliantadmin.responseModal.evaluatorName") ||
                "Evaluator Name"
              }
              placeholder={
                t("viewcompliantadmin.responseModal.enterName") ||
                "Enter evaluator name"
              }
              value={responseForm.compliant_evaluator_person_fullname}
              onChange={(e) =>
                setResponseForm({
                  ...responseForm,
                  compliant_evaluator_person_fullname: e.currentTarget.value,
                })
              }
            />

            <Group position="right" mt="md">
              <Button
                variant="outline"
                onClick={closeResponseModal}
                color="gray"
              >
                {t("viewcompliantadmin.cancel") || "Cancel"}
              </Button>
              <Button
                color="blue"
                loading={responseLoading}
                onClick={handleSubmitResponse}
              >
                {t("viewcompliantadmin.responseModal.submitResponse") ||
                  "Submit Response"}
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* View Response Modal */}
      <Modal
        opened={viewResponseModalOpen}
        onClose={closeViewResponseModal}
        title={
          <Title order={3}>
            {t("viewcompliantadmin.viewResponseModal.title") ||
              "Response Details"}
          </Title>
        }
        size="lg"
        overlayProps={{
          blur: 3,
        }}
      >
        {currentResponse ? (
          <Stack spacing="md">
            <Text>
              {t("viewcompliantadmin.viewResponseModal.complaintId") ||
                "Complaint ID"}
              :{" "}
              <Text weight="bold" component="span">
                {currentResponse.complaints_id}
              </Text>
            </Text>

            <Group position="apart">
              <Text size="sm" color="dimmed">
                {t("viewcompliantadmin.viewResponseModal.evaluation") ||
                  "Evaluation"}
                :
              </Text>
              <Text weight={500}>
                {currentResponse.compliant_evaluation
                  ? t("viewcompliantadmin.viewResponseModal.valid") || "Valid"
                  : t("viewcompliantadmin.viewResponseModal.invalid") ||
                    "Invalid"}
              </Text>
            </Group>

            <Group position="apart">
              <Text size="sm" color="dimmed">
                {t("viewcompliantadmin.viewResponseModal.findings") ||
                  "Findings"}
                :
              </Text>
              <Text weight={500}>
                {currentResponse.compliant_findings || "N/A"}
              </Text>
            </Group>

            <Group position="apart">
              <Text size="sm" color="dimmed">
                {t("viewcompliantadmin.viewResponseModal.responseType") ||
                  "Response Type"}
                :
              </Text>
              <Text weight={500}>
                {currentResponse.general_response
                  ? t("viewcompliantadmin.viewResponseModal.positive") ||
                    "Positive"
                  : t("viewcompliantadmin.viewResponseModal.negative") ||
                    "Negative"}
              </Text>
            </Group>

            <Group position="apart">
              <Text size="sm" color="dimmed">
                {t("viewcompliantadmin.viewResponseModal.responseDetails") ||
                  "Response Details"}
                :
              </Text>
              <Text weight={500}>
                {currentResponse.general_response_detail || "N/A"}
              </Text>
            </Group>

            <Group position="apart">

              <Text size="sm" color="dimmed">
                {t("viewcompliantadmin.viewResponseModal.evaluator") ||
                  "Evaluator"}
                :
              </Text>
              <Text weight={500}>
                {currentResponse.compliant_evaluator_person_fullname}
              </Text>
            </Group>

            <Group position="apart">
              <Text size="sm" color="dimmed">
                {t("viewcompliantadmin.viewResponseModal.responseDate") ||
                  "Response Date"}
                :
              </Text>
              <Text weight={500}>
                {format(new Date(currentResponse.response_date), "PPpp")}
              </Text>
            </Group>
          </Stack>
        ) : (
          <Alert color="yellow" icon={<IconAlertCircle />}>
            {t("viewcompliantadmin.viewResponseModal.noResponse") ||
              "No response found for this complaint"}
          </Alert>
        )}
      </Modal>
    </Box>
  );
};

export default ViewComplaints;
