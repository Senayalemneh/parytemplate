import React, { useState, useEffect } from "react";
import {
  Title,
  Text,
  Container,
  Button,
  Group,
  Badge,
  ThemeIcon,
  Divider,
  Space,
  ScrollArea,
  Paper,
  Checkbox,
  TextInput,
  Textarea,
  FileInput,
  Grid,
  Modal,
  CopyButton,
  Tooltip,
  ActionIcon,
  clsx,
} from "@mantine/core";
import {
  IconUpload,
  IconInfoCircle,
  IconAlertCircle,
  IconCheck,
  IconCopy,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import AOS from "aos";
import "aos/dist/aos.css";
import { useForm } from "@mantine/form";
import { createCompliant, uploadFile } from "../../services/api/main";
import { showNotification } from "@mantine/notifications";

const ComplaintForm = () => {
  const { t, i18n } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [complaintId, setComplaintId] = useState("");

  const form = useForm({
    initialValues: {
      fullName: "",
      subCity: "",
      woreda: "",
      houseNumber: "",
      phone: "",
      institution: "",
      complaintDetails: "",
      complaintWant: "",
      complaintPlace: "",
    },
    validate: {
      fullName: (value) =>
        value.length < 2 ? t("compliant.validation.nameTooShort") : null,
      phone: (value) =>
        /^\d+$/.test(value) ? null : t("compliant.validation.invalidPhone"),
    },
  });

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    if (!disclaimerAccepted) {
      return form.setFieldError(
        "disclaimer",
        t("compliant.validation.disclaimer")
      );
    }

    setLoading(true);

    try {
      const payload = {
        fullName: {
          en: values.fullName,
          am: values.fullName,
        },
        phone: values.phone,
        subCity: {
          en: values.subCity,
          am: values.subCity,
        },
        woreda: {
          en: values.woreda,
          am: values.woreda,
        },
        houseNumber: values.houseNumber,
        institution: {
          en: values.institution,
          am: values.institution,
        },
        complaintPlace: {
          en: values.complaintPlace,
          am: values.complaintPlace,
        },
        complaintDetails: {
          en: values.complaintDetails,
          am: values.complaintDetails,
        },
        complaintWant: {
          en: values.complaintWant,
          am: values.complaintWant,
        },
        disclaimerAccepted: true,
        evidence: [],
      };

      if (files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          try {
            const response = await uploadFile(file);
            return { url: response.url };
          } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
          }
        });

        payload.evidence = await Promise.all(uploadPromises);
      }

      const response = await createCompliant(payload);
      console.log("the reponse is below ",response)
      setComplaintId(response?.data?.id); // Assuming the API returns the created complaint with an id field

      showNotification({
        title: t("compliant.notification.successTitle"),
        message: t("compliant.notification.success"),
        color: "green",
      });

      setSubmissionSuccess(true);
      form.reset();
      setFiles([]);
      setDisclaimerAccepted(false);
    } catch (error) {
      showNotification({
        title: t("compliant.notification.errorTitle"),
        message: t("compliant.notification.error"),
        color: "red",
      });
      console.error("Error submitting complaint:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeSuccessModal = () => {
    setSubmissionSuccess(false);
    setComplaintId("");
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      {/* Success Modal */}
      <Modal
        opened={submissionSuccess}
        onClose={closeSuccessModal}
        title={t("compliant.compliant.successModal.title")}
        centered
        size="lg"
      >
        <div className="text-center">
          <ThemeIcon
            color="green"
            size="xl"
            radius="xl"
            variant="light"
            className="mb-4 mx-auto"
          >
            <IconCheck size={32} />
          </ThemeIcon>
          <Text size="lg" className="mb-4">
            {t("compliant.compliant.successModal.message")}
          </Text>
          <Paper withBorder p="md" className="mb-6">
            <Group position="center" spacing="xs">
              <Text weight={600}>{t("compliant.compliant.successModal.yourId")}:</Text>
              <Text weight={700} color="blue">
                {complaintId}
              </Text>
              <CopyButton value={complaintId} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip
                    label={copied ? "Copied!" : "Copy"}
                    withArrow
                    position="right"
                  >
                    <ActionIcon color={copied ? "teal" : "gray"} onClick={copy}>
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
          </Paper>
          <Text size="sm" color="dimmed" className="mb-4">
            {t("compliant.compliant.successModal.note")}
          </Text>
          <Button
            onClick={closeSuccessModal}
            color="blue"
            size="md"
            className="mt-4"
          >
            {t("compliant.compliant.successModal.close")}
          </Button>
        </div>
      </Modal>

      {/* Hero Section */}
      <div className="w-full bg-blue-800 py-16">
        <Container size={1400}>
          <div className="text-center text-white" data-aos="fade-down">
            <Badge
              size="xl"
              radius="sm"
              color="blue"
              variant="filled"
              className="mb-6"
            >
              <Group spacing="xs">
                <IconAlertCircle size={18} />
                <span>{t("compliant.title.badge")}</span>
              </Group>
            </Badge>
            <Title
              order={1}
              className="text-4xl md:text-5xl font-bold mb-4"
              data-aos-delay="100"
            >
              {t("compliant.title.main")}
            </Title>
            <Text
              size="xl"
              className="max-w-3xl mx-auto text-blue-100"
              data-aos-delay="200"
            >
              {t("compliant.title.subtitle")}
            </Text>
          </div>
        </Container>
      </div>

      {/* Form Section */}
      <Container size={800} className="py-16" data-aos="fade-up">
        <Paper withBorder shadow="md" p="xl" radius="lg" className="relative">
          <div className="absolute -top-3 -left-3 w-16 h-16 bg-blue-100 rounded-full opacity-30"></div>
          <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-blue-100 rounded-full opacity-30"></div>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Title order={2} className="text-blue-800 mb-8 text-center">
              {t("compliant.form.title")}
            </Title>

            <Grid gutter="xl">
              <Grid.Col span={12} md={6}>
                <TextInput
                  label={t("compliant.form.fullName")}
                  placeholder={t("compliant.form.fullNamePlaceholder")}
                  required
                  {...form.getInputProps("fullName")}
                />
              </Grid.Col>
              <Grid.Col span={12} md={6}>
                <TextInput
                  label={t("compliant.form.phone")}
                  placeholder={t("compliant.form.phonePlaceholder")}
                  required
                  {...form.getInputProps("phone")}
                />
              </Grid.Col>
              <Grid.Col span={12} md={6}>
                <TextInput
                  label={t("compliant.form.subCity")}
                  placeholder={t("compliant.form.subCityPlaceholder")}
                  required
                  {...form.getInputProps("subCity")}
                />
              </Grid.Col>
              <Grid.Col span={12} md={6}>
                <TextInput
                  label={t("compliant.form.woreda")}
                  placeholder={t("compliant.form.woredaPlaceholder")}
                  required
                  {...form.getInputProps("woreda")}
                />
              </Grid.Col>
              <Grid.Col span={12} md={6}>
                <TextInput
                  label={t("compliant.form.houseNumber")}
                  placeholder={t("compliant.form.houseNumberPlaceholder")}
                  required
                  {...form.getInputProps("houseNumber")}
                />
              </Grid.Col>
              <Grid.Col span={12} md={6}>
                <TextInput
                  label={t("compliant.form.institution")}
                  placeholder={t("compliant.form.institutionPlaceholder")}
                  required
                  {...form.getInputProps("institution")}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <TextInput
                  label={t("compliant.form.complaintPlace")}
                  placeholder={t("compliant.form.complaintPlacePlaceholder")}
                  required
                  {...form.getInputProps("complaintPlace")}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label={t("compliant.form.complaintDetails")}
                  placeholder={t("compliant.form.complaintDetailsPlaceholder")}
                  required
                  minRows={4}
                  {...form.getInputProps("complaintDetails")}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label={t("compliant.form.complaintWant")}
                  placeholder={t("compliant.form.complaintWantPlaceholder")}
                  required
                  minRows={4}
                  {...form.getInputProps("complaintWant")}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <FileInput
                  label={t("compliant.form.evidence")}
                  placeholder={t("compliant.form.evidencePlaceholder")}
                  icon={<IconUpload size={14} />}
                  multiple
                  value={files}
                  onChange={setFiles}
                  accept="image/*,.pdf,.doc,.docx"
                />
                {files.length > 0 && (
                  <Text size="sm" color="dimmed" mt="xs">
                    {t("compliant.form.selectedFiles")}:{" "}
                    {files.map((f) => f.name).join(", ")}
                  </Text>
                )}
              </Grid.Col>
            </Grid>

            <Space h="xl" />

            <Paper
              withBorder
              p="md"
              radius="md"
              className="bg-blue-50 border-blue-200"
            >
              <Group spacing="xs" className="mb-2">
                <ThemeIcon color="red" size="sm" radius="xl">
                  <IconInfoCircle size={16} />
                </ThemeIcon>
                <Text weight={600} color="red">
                  {t("compliant.disclaimer.title")}
                </Text>
              </Group>
              <Text size="sm" className="text-blue-900">
                {t("compliant.disclaimer.text")}
              </Text>
            </Paper>

            <Checkbox
              checked={disclaimerAccepted}
              onChange={(e) => setDisclaimerAccepted(e.currentTarget.checked)}
              label={t("compliant.disclaimer.accept")}
              className="my-6"
            />

            <Button
              type="submit"
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 transition-all"
              loading={loading}
              disabled={!disclaimerAccepted}
            >
              {t("compliant.submit")}
            </Button>
          </form>
        </Paper>
      </Container>
    </div>
  );
};

export default ComplaintForm;
