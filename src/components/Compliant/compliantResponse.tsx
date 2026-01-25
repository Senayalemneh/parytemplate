import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  Text,
  Title,
  Divider,
  Group,
  Stack,
  Badge,
  Avatar,
  Image,
  Accordion,
  Paper,
  Alert,
  Button,
  ActionIcon,
  Tooltip,
  ThemeIcon,
  Container,
  Grid,
  Modal,
  Pagination,
  Select,
  Input,
  Space,
  useMantineTheme,
} from "@mantine/core";
import {
  IconCalendar,
  IconPhone,
  IconHome,
  IconCheck,
  IconX,
  IconSearch,
  IconAlertCircle,
  IconHourglass,
  IconInfoCircle,
  IconCopy,
  IconLanguage,
} from "@tabler/icons-react";
import Loader from "../../components/common/loader";
import { getCompliantResponseById } from "../../services/api/main";
import { CopyButton } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

interface ComplaintResponse {
  id: number;
  complaints_id: number;
  subcity: { en: string; am: string };
  woreda: { en: string; am: string };
  houseno: number;
  phone_number: string;
  compliant_date: string;
  compliant_institution_name: { en: string; am: string };
  compliant_detail: { en: string; am: string };
  compliant_evaluation: boolean;
  compliant_findings: string;
  general_response: boolean;
  general_response_detail: string;
  compliant_evaluator_person_fullname: string;
  issuer_id: number;
  response_date: string;
  created_at: string;
  updated_at: string;
  complaint: {
    id: number;
    fullName: { en: string; am: string };
    phone: string;
    subCity: { en: string; am: string };
    woreda: { en: string; am: string };
    houseNumber: string;
    institution: { en: string; am: string };
    complaintPlace: { en: string; am: string };
    complaintDetails: { en: string; am: string };
    complaintWant: { en: string; am: string };
    disclaimerAccepted: number;
    evidence: { url: string }[];
    created_at: string;
    updated_at: string;
  };
}

const ComplaintResponseViewer = () => {
  const { t, i18n } = useTranslation();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);

  const [id, setId] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [complaint, setComplaint] = useState<ComplaintResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [opened, setOpened] = useState(false);
  const [activePage, setActivePage] = useState(1);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const fetchComplaintResponse = async () => {
    if (!id || !phoneNumber) return;

    try {
      setLoading(true);
      setError(null);
      setNotFound(false);
      const response = await getCompliantResponseById(id, phoneNumber);

      if (response && response.id) {
        setComplaint(response);
      } else {
        setNotFound(true);
        setComplaint(null);
      }
    } catch (err) {
      setError(
        t("compliantresponsepage.searchError", {
          defaultValue:
            "Failed to fetch complaint response. Please check the ID and phone number and try again.",
        })
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const resetSearch = () => {
    setId("");
    setPhoneNumber("");
    setComplaint(null);
    setError(null);
    setNotFound(false);
  };

  const getLocalizedValue = (obj: { en: string; am: string }) => {
    return obj[i18n.language as "en" | "am"] || obj.en;
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">


      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-blue-700 to-blue-900 py-16 shadow-lg">
        <Container size={1400}>
          <div className="text-center text-white">
            <Badge
              size="xl"
              radius="sm"
              color="blue"
              variant="filled"
              className="mb-6"
            >
              <Group spacing="xs">
                <IconInfoCircle size={18} />
                <span>{t("compliantresponsepage.systemBadge")}</span>
              </Group>
            </Badge>
            <Title order={1} className="text-4xl md:text-5xl font-bold mb-4">
              {t("compliantresponsepage.title")}
            </Title>
            <Text size="xl" className="max-w-3xl mx-auto text-blue-100">
              {t("compliantresponsepage.subtitle")}
            </Text>
          </div>
        </Container>
      </div>

      <Container size={1400} className="py-16 relative">
        <Grid gutter="xl">
          {/* Search Panel */}
          <Grid.Col span={12} md={4}>
            <Paper
              withBorder
              p="md"
              className="bg-white rounded-lg shadow-lg border border-gray-200 sticky top-4"
            >
              <Title order={3} className="mb-4 text-blue-800">
                {t("compliantresponsepage.searchTitle")}
              </Title>
              <Stack spacing="md">
                <div>
                  <Text size="sm" className="mb-1 text-gray-700">
                    {t("compliantresponsepage.complaintId")}
                  </Text>
                  <Input
                    value={id}
                    onChange={(e) => setId(e.currentTarget.value)}
                    placeholder={t(
                      "compliantresponsepage.complaintIdPlaceholder"
                    )}
                    disabled={loading}
                    radius="md"
                  />
                </div>
                <div>
                  <Text size="sm" className="mb-1 text-gray-700">
                    {t("compliantresponsepage.phoneNumber")}
                  </Text>
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.currentTarget.value)}
                    placeholder={t(
                      "compliantresponsepage.phoneNumberPlaceholder"
                    )}
                    disabled={loading}
                    radius="md"
                  />
                </div>
                <Button
                  leftIcon={<IconSearch size={16} />}
                  onClick={fetchComplaintResponse}
                  loading={loading}
                  disabled={!id || !phoneNumber || loading}
                  fullWidth
                  radius="md"
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white transition duration-200 shadow-md"
                >
                  {t("compliantresponsepage.searchButton")}
                </Button>

                {complaint && (
                  <Button
                    variant="outline"
                    onClick={resetSearch}
                    fullWidth
                    radius="md"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    {t("compliantresponsepage.clearSearch")}
                  </Button>
                )}

                <Button
                  variant="subtle"
                  onClick={() => setOpened(true)}
                  fullWidth
                  radius="md"
                  className="text-blue-600 hover:text-blue-800"
                  leftIcon={<IconInfoCircle size={16} />}
                >
                  {t("compliantresponsepage.findIdHelp")}
                </Button>
              </Stack>

              {error && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title={t("error")}
                  color="red"
                  className="mt-4"
                  variant="filled"
                  radius="md"
                >
                  {error}
                </Alert>
              )}
            </Paper>
          </Grid.Col>

          {/* Results Panel */}
          <Grid.Col span={12} md={8}>
            {loading ? (
              <Paper
                withBorder
                p="xl"
                className="text-center bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center"
                style={{ minHeight: "300px" }}
                radius="md"
              >
                <Loader size="xl" variant="dots" />
              </Paper>
            ) : notFound ? (
              <Paper
                withBorder
                p="xl"
                className="text-center bg-white rounded-lg shadow-lg border border-gray-200"
                style={{ minHeight: "400px" }}
                radius="md"
              >
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <IconHourglass size={48} className="text-blue-600" />
                  </div>

                  <Title order={2} className="text-blue-800 mb-4">
                    {t("compliantresponsepage.underReviewTitle")}
                  </Title>

                  <Text className="text-gray-600 max-w-md mb-6">
                    {t("compliantresponsepage.underReviewText")}
                  </Text>

                  <div className="w-full max-w-sm bg-blue-50 rounded-lg p-4 mb-6">
                    <Group position="center" spacing="xs">
                      <IconInfoCircle size={20} className="text-blue-600" />
                      <Text weight={600} className="text-blue-800">
                        {t("compliantresponsepage.complaintId")}: {id}
                      </Text>
                      <CopyButton value={id}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? t("copied") : t("copy")}>
                            <ActionIcon
                              color={copied ? "teal" : "gray"}
                              onClick={copy}
                            >
                              {copied ? (
                                <IconCheck size={16} />
                              ) : (
                                <IconCopy size={16} />
                              )}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                    </Group>
                  </div>

                  <Text size="sm" color="dimmed" className="mb-6">
                    {t("compliantresponsepage.checkBack")}
                  </Text>

                  <Button
                    onClick={resetSearch}
                    variant="outline"
                    color="blue"
                    size="md"
                    leftIcon={<IconSearch size={16} />}
                    radius="md"
                  >
                    {t("compliantresponsepage.searchAgain")}
                  </Button>
                </div>
              </Paper>
            ) : complaint ? (
              <div className="space-y-6">
                {/* Response Summary Card */}
                <Card
                  withBorder
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  className="bg-white border border-gray-200"
                >
                  <Group position="apart" mb="md">
                    <div>
                      <Title order={3} className="text-blue-800">
                        {t("compliantresponsepage.responseTitle", {
                          id: complaint.complaints_id,
                        })}
                      </Title>
                      <Text size="sm" color="dimmed">
                        {t("compliantresponsepage.issuedOn", {
                          date: formatDate(complaint.response_date),
                        })}
                      </Text>
                    </div>
                    <Badge
                      color={complaint.compliant_evaluation ? "green" : "red"}
                      size="lg"
                      radius="sm"
                    >
                      {complaint.compliant_evaluation
                        ? t("compliantresponsepage.valid")
                        : t("compliantresponsepage.invalid")}
                    </Badge>
                  </Group>

                  <Divider my="sm" className="border-gray-200" />

                  <Grid>
                    <Grid.Col span={12} md={4}>
                      <Text size="sm" color="dimmed">
                        {t("compliantresponsepage.institution")}
                      </Text>
                      <Text weight={500} className="text-blue-700">
                        {getLocalizedValue(
                          complaint.compliant_institution_name
                        )}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={12} md={4}>
                      <Text size="sm" color="dimmed">
                        {t("compliantresponsepage.complaintType")}
                      </Text>
                      <Text weight={500} className="text-blue-700">
                        {getLocalizedValue(complaint.compliant_detail)}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={12} md={4}>
                      <Text size="sm" color="dimmed">
                        {t("compliantresponsepage.evaluator")}
                      </Text>
                      <Text weight={500} className="text-blue-700">
                        {complaint.compliant_evaluator_person_fullname}
                      </Text>
                    </Grid.Col>
                  </Grid>
                </Card>

                {/* Complainant Details */}
                <Card
                  withBorder
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  className="bg-white border border-gray-200"
                >
                  <Title order={4} mb="md" className="text-blue-800">
                    {t("compliantresponsepage.complainantInfo")}
                  </Title>
                  <Group position="apart">
                    <Group>
                      <Avatar size="lg" color="blue" radius="xl">
                        {getLocalizedValue(complaint.complaint.fullName).charAt(
                          0
                        )}
                      </Avatar>
                      <div>
                        <Text weight={500} className="text-blue-700">
                          {getLocalizedValue(complaint.complaint.fullName)}
                        </Text>
                        <Text size="sm" color="dimmed">
                          {t("compliantresponsepage.complainant")}
                        </Text>
                      </div>
                    </Group>
                    <Group spacing="xs">
                      <IconPhone size={18} className="text-blue-600" />
                      <Text className="text-blue-700">
                        {complaint.complaint.phone}
                      </Text>
                    </Group>
                  </Group>

                  <Divider my="md" className="border-gray-200" />

                  <Grid>
                    <Grid.Col span={12} md={6}>
                      <Text size="sm" color="dimmed">
                        {t("compliantresponsepage.address")}
                      </Text>
                      <Text className="text-blue-700">
                        {getLocalizedValue(complaint.complaint.subCity)},{" "}
                        {getLocalizedValue(complaint.complaint.woreda)},{" "}
                        {t("compliantresponsepage.houseNumber")}{" "}
                        {complaint.complaint.houseNumber}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={12} md={6}>
                      <Text size="sm" color="dimmed">
                        {t("compliantresponsepage.complaintLocation")}
                      </Text>
                      <Text className="text-blue-700">
                        {getLocalizedValue(complaint.complaint.complaintPlace)}
                      </Text>
                    </Grid.Col>
                  </Grid>
                </Card>

                {/* Details Accordion */}
                <Accordion
                  variant="filled"
                  radius="md"
                  className="bg-white shadow-sm"
                >
                  <Accordion.Item value="complaint-details">
                    <Accordion.Control>
                      <Text weight={500} className="text-blue-800">
                        {t("compliantresponsepage.complaintDetails")}
                      </Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack spacing="md">
                        <div>
                          <Text size="sm" color="dimmed">
                            {t("compliantresponsepage.description")}
                          </Text>
                          <Text className="text-blue-700">
                            {getLocalizedValue(
                              complaint.complaint.complaintDetails
                            )}
                          </Text>
                        </div>
                        <div>
                          <Text size="sm" color="dimmed">
                            {t("compliantresponsepage.desiredResolution")}
                          </Text>
                          <Text className="text-blue-700">
                            {getLocalizedValue(
                              complaint.complaint.complaintWant
                            )}
                          </Text>
                        </div>
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>

                  <Accordion.Item value="evidence">
                    <Accordion.Control>
                      <Text weight={500} className="text-blue-800">
                        {t("compliantresponsepage.evidence")}
                      </Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      {complaint.complaint.evidence.length > 0 &&
                      complaint.complaint.evidence[0].url ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {complaint.complaint.evidence.map((item, index) => (
                            <div
                              key={index}
                              className="border border-gray-200 rounded-md overflow-hidden shadow-sm"
                            >
                              <Image
                                src={item.url}
                                alt={`${t("compliantresponsepage.evidence")} ${
                                  index + 1
                                }`}
                                height={200}
                                fit="cover"
                                withPlaceholder
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Text color="dimmed">
                          {t("compliantresponsepage.noEvidence")}
                        </Text>
                      )}
                    </Accordion.Panel>
                  </Accordion.Item>

                  <Accordion.Item value="official-response">
                    <Accordion.Control>
                      <Text weight={500} className="text-blue-800">
                        {t("compliantresponsepage.officialResponse")}
                      </Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack spacing="md">
                        <div>
                          <Text size="sm" color="dimmed">
                            {t("compliantresponsepage.findings")}
                          </Text>
                          <Text className="text-blue-700">
                            {complaint.compliant_findings}
                          </Text>
                        </div>

                        <div>
                          <Text size="sm" color="dimmed">
                            {t("compliantresponsepage.responseDetails")}
                          </Text>
                          <Text className="text-blue-700">
                            {complaint.general_response_detail}
                          </Text>
                        </div>

                        <div>
                          <Text size="sm" color="dimmed">
                            {t("compliantresponsepage.status")}
                          </Text>
                          {complaint.general_response ? (
                            <Badge color="green" variant="filled" size="lg">
                              {t("compliantresponsepage.resolved")}
                            </Badge>
                          ) : (
                            <Badge color="yellow" variant="filled" size="lg">
                              {t("compliantresponsepage.pending")}
                            </Badge>
                          )}
                        </div>
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>

                {/* Timeline */}
                <Card
                  withBorder
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  className="bg-white border border-gray-200"
                >
                  <Title order={4} mb="md" className="text-blue-800">
                    {t("compliantresponsepage.timelineTitle")}
                  </Title>
                  <div className="relative pl-6 border-l-2 border-blue-200 space-y-6">
                    <div className="relative">
                      <div className="absolute -left-7 top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white"></div>
                      <div className="pl-4">
                        <Text weight={500} className="text-blue-800">
                          {t("compliantresponsepage.submitted")}
                        </Text>
                        <Text size="sm" color="dimmed">
                          {formatDate(complaint.complaint.created_at)}
                        </Text>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-7 top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white"></div>
                      <div className="pl-4">
                        <Text weight={500} className="text-blue-800">
                          {t("compliantresponsepage.evaluationCompleted")}
                        </Text>
                        <Text size="sm" color="dimmed">
                          {formatDate(complaint.updated_at)}
                        </Text>
                        <Text size="sm" mt={4} className="text-blue-700">
                          {t("compliantresponsepage.status")}:{" "}
                          {complaint.compliant_evaluation
                            ? t("compliantresponsepage.valid")
                            : t("compliantresponsepage.invalid")}
                        </Text>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-7 top-1 w-4 h-4 rounded-full bg-green-500 border-4 border-white"></div>
                      <div className="pl-4">
                        <Text weight={500} className="text-blue-800">
                          {t("compliantresponsepage.responseProvided")}
                        </Text>
                        <Text size="sm" color="dimmed">
                          {formatDate(complaint.response_date)}
                        </Text>
                        <Text size="sm" mt={4} className="text-blue-700">
                          {t("compliantresponsepage.outcome", {
                            status: complaint.general_response
                              ? t("compliantresponsepage.resolved")
                              : t("compliantresponsepage.pending"),
                          })}
                        </Text>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Paper
                withBorder
                p="xl"
                className="text-center bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center"
                style={{ minHeight: "300px" }}
                radius="md"
              >
                <div>
                  <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <IconSearch size={40} className="text-blue-400" />
                  </div>
                  <Title order={4} className="text-blue-800 mb-2">
                    {t("compliantresponsepage.noComplaintTitle")}
                  </Title>
                  <Text color="dimmed">
                    {t("compliantresponsepage.noComplaintText")}
                  </Text>
                </div>
              </Paper>
            )}
          </Grid.Col>
        </Grid>
      </Container>

      {/* Help Modal */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t("compliantresponsepage.helpModalTitle")}
        size="lg"
        radius="md"
      >
        <Stack spacing="md">
          <Text>{t("compliantresponsepage.helpModalText")}</Text>

          <div className="space-y-4">
            <div className="flex items-start">
              <ThemeIcon
                size={24}
                radius="xl"
                color="blue"
                className="mr-3 mt-1"
              >
                1
              </ThemeIcon>
              <div>
                <Text weight={600} className="mb-1">
                  {t("compliantresponsepage.emailConfirmation")}
                </Text>
                <Text size="sm" color="dimmed">
                  {t("compliantresponsepage.emailConfirmationText")}
                </Text>
              </div>
            </div>

            <div className="flex items-start">
              <ThemeIcon
                size={24}
                radius="xl"
                color="blue"
                className="mr-3 mt-1"
              >
                2
              </ThemeIcon>
              <div>
                <Text weight={600} className="mb-1">
                  {t("compliantresponsepage.smsNotification")}
                </Text>
                <Text size="sm" color="dimmed">
                  {t("compliantresponsepage.smsNotificationText")}
                </Text>
              </div>
            </div>

            <div className="flex items-start">
              <ThemeIcon
                size={24}
                radius="xl"
                color="blue"
                className="mr-3 mt-1"
              >
                3
              </ThemeIcon>
              <div>
                <Text weight={600} className="mb-1">
                  {t("compliantresponsepage.submissionReceipt")}
                </Text>
                <Text size="sm" color="dimmed">
                  {t("compliantresponsepage.submissionReceiptText")}
                </Text>
              </div>
            </div>
          </div>

          <Alert
            icon={<IconInfoCircle size={18} />}
            color="blue"
            variant="light"
            radius="md"
          >
            {t("compliantresponsepage.contactSupport")}
          </Alert>
        </Stack>
      </Modal>
    </div>
  );
};

export default ComplaintResponseViewer;
