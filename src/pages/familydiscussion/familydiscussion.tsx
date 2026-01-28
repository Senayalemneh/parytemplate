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
  Text,
  Table,
  Flex,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  IconPencil,
  IconTrash,
  IconPlus,
  IconCheck,
  IconX,
  IconDownload,
  IconPrinter,
  IconEye,
  IconFileDownload,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/loader";
import {
  createFamilyDiscussion,
  getFamilyDiscussion,
  getFamilyDiscussionById,
  updatFamilyDiscussion,
  deleteFamilyDiscussion,
  uploadFile,
} from "../../services/api/main";

interface FamilyDiscussionItem {
  id: number;
  recorded_date: string;
  conducted_date: string;
  district: string;
  social_base: string;
  wing: string;
  union_name: string;
  family_name: string;
  total_male_members: string;
  total_female_members: string;
  total_family_members: string;
  attending_male_members: string;
  attending_female_members: string;
  total_attending_members: string;
  absence_reason: string;
  discussion_agenda: string[];
  key_negative_points: string[];
  key_positive_points: string[];
  conclusions_reached: string[];
  differing_opinions: string[];
  summary: string[];
  prepared_by_name: string;
  prepared_by_position: string;
  prepared_by_signature: string;
  prepared_by_date: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

const FamilyDiscussionManagement = () => {
  const { t } = useTranslation();
  const [familyDiscussions, setFamilyDiscussions] = useState<
    FamilyDiscussionItem[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [viewModalOpen, { open: openViewModal, close: closeViewModal }] =
    useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingItem, setViewingItem] = useState<FamilyDiscussionItem | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [customWingInput, setCustomWingInput] = useState(false);
  const [customSocialBaseInput, setCustomSocialBaseInput] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [paginatedData, setPaginatedData] = useState<FamilyDiscussionItem[]>(
    []
  );

  const form = useForm({
    initialValues: {
      recorded_date: new Date().toISOString().split("T")[0],
      conducted_date: "",
      district: "",
      social_base: "",
      custom_social_base: "",
      wing: "",
      custom_wing: "",
      union_name: "",
      family_name: "",
      total_male_members: "",
      total_female_members: "",
      attending_male_members: "",
      attending_female_members: "",
      absence_reason: "",
      discussion_agenda: [] as string[],
      key_negative_points: [] as string[],
      key_positive_points: [] as string[],
      conclusions_reached: [] as string[],
      differing_opinions: [] as string[],
      summary: [] as string[],
      prepared_by_name: "",
      prepared_by_position: "",
      prepared_by_signature: "",
      prepared_by_date: "",
      signatureFile: null as File | null,
      newAgendaItem: "",
      newNegativePoint: "",
      newPositivePoint: "",
      newConclusion: "",
      newOpinion: "",
      newSummaryItem: "",
    },
    validate: {
      conducted_date: (value) =>
        value ? null : t("familyDiscussion.form.conductedDate.error"),
      district: (value) =>
        value ? null : t("familyDiscussion.form.district.error"),
      social_base: (value, values) => {
        if (customSocialBaseInput) {
          return values.custom_social_base
            ? null
            : t("familyDiscussion.form.socialBase.error");
        }
        return value ? null : t("familyDiscussion.form.socialBase.error");
      },
      wing: (value, values) => {
        if (customWingInput) {
          return values.custom_wing
            ? null
            : t("familyDiscussion.form.wing.error");
        }
        return value ? null : t("familyDiscussion.form.wing.error");
      },
      union_name: (value) =>
        value ? null : t("familyDiscussion.form.unionName.error"),
      family_name: (value) =>
        value ? null : t("familyDiscussion.form.familyName.error"),
      total_male_members: (value) =>
        value ? null : t("familyDiscussion.form.totalMaleMembers.error"),
      total_female_members: (value) =>
        value ? null : t("familyDiscussion.form.totalFemaleMembers.error"),
      attending_male_members: (value) =>
        value ? null : t("familyDiscussion.form.attendingMaleMembers.error"),
      attending_female_members: (value) =>
        value ? null : t("familyDiscussion.form.attendingFemaleMembers.error"),
      absence_reason: (value) =>
        value ? null : t("familyDiscussion.form.absenceReason.error"),
      prepared_by_name: (value) =>
        value ? null : t("familyDiscussion.form.preparedByName.error"),
      prepared_by_position: (value) =>
        value ? null : t("familyDiscussion.form.preparedByPosition.error"),
      signatureFile: (value, values) =>
        !editingId && !value && !values.prepared_by_signature
          ? t("familyDiscussion.form.signature.error")
          : null,
      discussion_agenda: (value) =>
        value.length > 0 ? null : t("familyDiscussion.form.agenda.error"),
      key_negative_points: (value) =>
        value.length > 0
          ? null
          : t("familyDiscussion.form.negativePoints.error"),
      key_positive_points: (value) =>
        value.length > 0
          ? null
          : t("familyDiscussion.form.positivePoints.error"),
      conclusions_reached: (value) =>
        value.length > 0 ? null : t("familyDiscussion.form.conclusions.error"),
      differing_opinions: (value) =>
        value.length > 0 ? null : t("familyDiscussion.form.opinions.error"),
      summary: (value) =>
        value.length > 0 ? null : t("familyDiscussion.form.summary.error"),
    },
  });

  const predefinedWings = ["ወጣት ክንፍ", "ሴት ክንፍ"];
  const predefinedSocialBases = [
    "ማህበራዊ መሰረት",
    "መንግስት ሰራተኛ",
    "ትምህረት ቤት",
    "ምሁራን",
    "ከተማ ነዋሪ",
    "አርሷደር",
    "ጥቃቅንና አነስተኛ",
    "ነጋዴ",
    "ባለሃብት",
    "አርብቶ አደር",
    "የቀን ሰራተኛ",
  ];

  const fetchFamilyDiscussions = async () => {
    setLoading(true);
    try {
      const response = await getFamilyDiscussion();
      setFamilyDiscussions(response?.data || []);
      showNotification(
        t("familyDiscussion.notifications.loadSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch family discussions:", error);
      showNotification(t("familyDiscussion.notifications.loadFailed"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyDiscussions();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("familyDiscussion.notifications.successTitle")
          : t("familyDiscussion.notifications.errorTitle"),
      message,
      color: type === "success" ? "teal" : "red",
      icon: type === "success" ? <IconCheck size={18} /> : <IconX size={18} />,
      withBorder: true,
    });
  };

  const resetAndCloseModal = () => {
    closeModal();
    setEditingId(null);
    form.reset();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);

      if (editingId && (isNaN(editingId) || editingId <= 0)) {
        showNotification(t("familyDiscussion.errors.invalidId"), "error");
        return;
      }

      let signature_path = values.prepared_by_signature;

      if (values.signatureFile) {
        setFileUploading(true);
        try {
          const uploadResponse = await uploadFile(
            values.signatureFile,
            "signatures"
          );
          signature_path = uploadResponse.file.path;
          showNotification(
            t("familyDiscussion.notifications.uploadSuccess"),
            "success"
          );
        } catch (error) {
          console.error("Signature upload error:", error);
          showNotification(
            t("familyDiscussion.notifications.uploadFailed"),
            "error"
          );
          return;
        } finally {
          setFileUploading(false);
        }
      } else if (!editingId && !signature_path) {
        showNotification(t("familyDiscussion.form.signature.error"), "error");
        return;
      }

      const payload = {
        recorded_date: new Date().toISOString().split("T")[0],
        conducted_date: values.conducted_date,
        district: values.district,
        social_base: customSocialBaseInput
          ? values.custom_social_base
          : values.social_base,
        wing: customWingInput ? values.custom_wing : values.wing,
        union_name: values.union_name,
        family_name: values.family_name,
        total_male_members: parseInt(values.total_male_members),
        total_female_members: parseInt(values.total_female_members),
        total_family_members: (
          parseInt(values.total_male_members) +
          parseInt(values.total_female_members)
        ),
        attending_male_members: parseInt(values.attending_male_members),
        attending_female_members: parseInt(values.attending_female_members),
        total_attending_members: (
          parseInt(values.attending_male_members) +
          parseInt(values.attending_female_members)
        ),
        absence_reason: values.absence_reason,
        discussion_agenda: values.discussion_agenda,
        key_negative_points: values.key_negative_points,
        key_positive_points: values.key_positive_points,
        conclusions_reached: values.conclusions_reached,
        differing_opinions: values.differing_opinions,
        summary: values.summary,
        prepared_by_name: values.prepared_by_name,
        prepared_by_position: values.prepared_by_position,
        prepared_by_signature: signature_path,
        prepared_by_date: new Date().toISOString().split("T")[0],
      };

      if (editingId) {
        await updatFamilyDiscussion(editingId, payload);
        showNotification(
          t("familyDiscussion.notifications.updateSuccess"),
          "success"
        );
      } else {
        await createFamilyDiscussion(payload);
        showNotification(
          t("familyDiscussion.notifications.createSuccess"),
          "success"
        );
      }

      resetAndCloseModal();
      fetchFamilyDiscussions();
    } catch (error: any) {
      console.error("Error saving family discussion:", error);
      showNotification(
        editingId
          ? t("familyDiscussion.notifications.updateFailed")
          : t("familyDiscussion.notifications.createFailed"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (itemId: number) => {
    const item = familyDiscussions.find((d) => d.id === itemId);
    if (!item) return;

    form.setValues({
      ...item,
      discussion_agenda: item.discussion_agenda || [],
      key_negative_points: item.key_negative_points || [],
      key_positive_points: item.key_positive_points || [],
      conclusions_reached: item.conclusions_reached || [],
      differing_opinions: item.differing_opinions || [],
      summary: item.summary || [],
      newAgendaItem: "",
      newPositivePoint: "",
      newNegativePoint: "",
      newConclusion: "",
      newOpinion: "",
      newSummaryItem: "",
    });
    setEditingId(itemId);
    openModal();
  };

  const handleView = (item: FamilyDiscussionItem) => {
    setViewingItem(item);
    openViewModal();
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(true);
      await deleteFamilyDiscussion(id);
      showNotification(
        t("familyDiscussion.notifications.deleteSuccess"),
        "success"
      );
      fetchFamilyDiscussions();
    } catch (error: any) {
      console.error("Error deleting family discussion:", error);
      showNotification(
        t("familyDiscussion.notifications.deleteFailed"),
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
          t("familyDiscussion.errors.invalidImageType"),
          "error"
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showNotification(t("familyDiscussion.errors.imageTooLarge"), "error");
        return;
      }

      form.setFieldValue("signatureFile", file);
      form.setFieldValue("prepared_by_signature", "");
    } else {
      form.setFieldValue("signatureFile", null);
    }
  };

  const escapeCsvValue = (value: string | number | string[]) => {
    if (Array.isArray(value)) {
      value = value.join("; ");
    }
    const str = String(value || "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const handleDownload = () => {
    try {
      const timestamp = new Date()
        .toLocaleString("en-US", { timeZone: "Africa/Addis_Ababa" })
        .replace(/[\/:,\s]/g, "-");
      const headers = [
        "ID",
        t("familyDiscussion.table.headers.recordedDate"),
        t("familyDiscussion.table.headers.conductedDate"),
        t("familyDiscussion.table.headers.district"),
        t("familyDiscussion.table.headers.socialBase"),
        t("familyDiscussion.table.headers.wing"),
        t("familyDiscussion.table.headers.unionName"),
        t("familyDiscussion.table.headers.familyName"),
        t("familyDiscussion.table.headers.totalMaleMembers"),
        t("familyDiscussion.table.headers.totalFemaleMembers"),
        t("familyDiscussion.table.headers.totalMembers"),
        t("familyDiscussion.table.headers.attendingMaleMembers"),
        t("familyDiscussion.table.headers.attendingFemaleMembers"),
        t("familyDiscussion.table.headers.totalAttendingMembers"),
        t("familyDiscussion.table.headers.absenceReason"),
        t("familyDiscussion.table.headers.discussionAgenda"),
        t("familyDiscussion.table.headers.keyNegativePoints"),
        t("familyDiscussion.table.headers.keyPositivePoints"),
        t("familyDiscussion.table.headers.conclusionsReached"),
        t("familyDiscussion.table.headers.differingOpinions"),
        t("familyDiscussion.table.headers.summary"),
        t("familyDiscussion.table.headers.preparedByName"),
        t("familyDiscussion.table.headers.preparedByPosition"),
        t("familyDiscussion.table.headers.preparedByDate"),
      ];

      const csvContent = [
        headers.map(escapeCsvValue).join(","),
        ...familyDiscussions.map((item) =>
          [
            item.id,
            item.recorded_date,
            item.conducted_date,
            item.district,
            item.social_base,
            item.wing,
            item.union_name,
            item.family_name,
            item.total_male_members,
            item.total_female_members,
            item.total_family_members,
            item.attending_male_members,
            item.attending_female_members,
            item.total_attending_members,
            item.absence_reason,
            item.discussion_agenda,
            item.key_negative_points,
            item.key_positive_points,
            item.conclusions_reached,
            item.differing_opinions,
            item.summary,
            item.prepared_by_name,
            item.prepared_by_position,
            item.prepared_by_date,
          ]
            .map(escapeCsvValue)
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `family_discussions_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification(
        t("familyDiscussion.notifications.csvDownloadSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Error generating CSV:", error);
      showNotification(
        t("familyDiscussion.notifications.csvDownloadFailed"),
        "error"
      );
    }
  };

  const escapeHtml = (str: string) => {
    if (!str) return str;
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const handlePrint = (item?: FamilyDiscussionItem) => {
    const discussion = item || familyDiscussions[0];
    if (!discussion) {
      showNotification(t("familyDiscussion.errors.noData"), "error");
      return;
    }

    const printContent = `
      <html>
        <head>
          <title>${escapeHtml(t("familyDiscussion.title"))}</title>
          <style>
            @page {
              size: A4;
              margin: 1in;
            }
            body {
              font-family: 'Arial', sans-serif;
              color: #333;
              line-height: 1.6;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #0052cc;
              padding-bottom: 10px;
            }
            .header h1 {
              color: #0052cc;
              font-size: 24px;
              margin: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 8px;
              font-size: 14px;
            }
            th {
              background-color: #e6f0ff;
              font-weight: bold;
              color: #0052cc;
              text-align: right;
            }
            .highlight {
              color: #d32f2f;
              font-weight: bold;
            }
            .signature-img {
              max-width: 100px;
              max-height: 100px;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #666;
              margin-top: 20px;
              border-top: 1px solid #ccc;
              padding-top: 10px;
            }
            .text-right {
              text-align: right;
            }
            .text-left {
              text-align: left;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${escapeHtml(t("familyDiscussion.formTitle"))}</h1>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th colspan="6" class="text-right">${escapeHtml(
      t("familyDiscussion.formtype")
    )}</th>
                  <th class="text-left">${escapeHtml(
      new Date(discussion.recorded_date).toLocaleDateString()
    )}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${escapeHtml(
      t("familyDiscussion.form.socialBase.label")
    )}</td>
                  <td class="text-right">${escapeHtml(
      discussion.social_base
    )}</td>
                  <td>${escapeHtml(t("familyDiscussion.form.wing.label"))}</td>
                  <td>${escapeHtml(discussion.wing)}</td>
                  <td>${escapeHtml(
      t("familyDiscussion.form.unionName.label")
    )}</td>
                  <td colspan="2">${escapeHtml(discussion.union_name)}</td>
                </tr>
                <tr>
                  <td>${escapeHtml(
      t("familyDiscussion.form.familyName.label")
    )}</td>
                  <td colspan="6">${escapeHtml(discussion.family_name)}</td>
                </tr>
                <tr>
                  <td>${escapeHtml(
      t("familyDiscussion.form.totalMembers")
    )}</td>
                  <td>${escapeHtml(t("familyDiscussion.form.male"))}</td>
                  <td class="text-right">${escapeHtml(
      discussion.total_male_members
    )}</td>
                  <td>${escapeHtml(t("familyDiscussion.form.female"))}</td>
                  <td class="text-right">${escapeHtml(
      discussion.total_female_members
    )}</td>
                  <td class="text-right highlight">${escapeHtml(
      t("familyDiscussion.form.total")
    )}</td>
                  <td class="text-right highlight">${escapeHtml(
      discussion.total_family_members
    )}</td>
                </tr>
                <tr>
                  <td>${escapeHtml(
      t("familyDiscussion.form.attendingMembers")
    )}</td>
                  <td>${escapeHtml(t("familyDiscussion.form.male"))}</td>
                  <td class="text-right">${escapeHtml(
      discussion.attending_male_members
    )}</td>
                  <td>${escapeHtml(t("familyDiscussion.form.female"))}</td>
                  <td class="text-right">${escapeHtml(
      discussion.attending_female_members
    )}</td>
                  <td class="text-right highlight">${escapeHtml(
      t("familyDiscussion.form.total")
    )}</td>
                  <td class="text-right highlight">${escapeHtml(
      discussion.total_attending_members
    )}</td>
                </tr>
                <tr>
                  <td colspan="7">
                    ${escapeHtml(
      t("familyDiscussion.form.absenceReason.label")
    )}: 
                    ${escapeHtml(discussion.absence_reason)}
                  </td>
                </tr>
                <tr>
                  <td colspan="7">
                    <strong>${escapeHtml(
      t("familyDiscussion.form.sections.familyIssues")
    )}</strong>
                  </td>
                </tr>
                ${discussion.discussion_agenda
        .map(
          (item, index) => `
                  <tr>
                    <td class="text-right">${index + 1}</td>
                    <td colspan="6">${escapeHtml(item)}</td>
                  </tr>
                `
        )
        .join("")}
                <tr>
                  <td colspan="7">
                    <strong>${escapeHtml(
          t("familyDiscussion.form.sections.negativePoints")
        )}</strong>
                  </td>
                </tr>
                ${discussion.key_negative_points
        .map(
          (item, index) => `
                  <tr>
                    <td class="text-right">${index + 1}</td>
                    <td colspan="6">${escapeHtml(item)}</td>
                  </tr>
                `
        )
        .join("")}
                <tr>
                  <td colspan="7">
                    <strong>${escapeHtml(
          t("familyDiscussion.form.sections.positivePoints")
        )}</strong>
                  </td>
                </tr>
                ${discussion.key_positive_points
        .map(
          (item, index) => `
                  <tr>
                    <td class="text-right">${index + 1}</td>
                    <td colspan="6">${escapeHtml(item)}</td>
                  </tr>
                `
        )
        .join("")}
                <tr>
                  <td colspan="7">
                    <strong>${escapeHtml(
          t("familyDiscussion.form.sections.conclusions")
        )}</strong>
                  </td>
                </tr>
                ${discussion.conclusions_reached
        .map(
          (item, index) => `
                  <tr>
                    <td class="text-right">${index + 1}</td>
                    <td colspan="6">${escapeHtml(item)}</td>
                  </tr>
                `
        )
        .join("")}
                <tr>
                  <td colspan="7">
                    <strong>${escapeHtml(
          t("familyDiscussion.form.sections.differingOpinions")
        )}</strong>
                  </td>
                </tr>
                ${discussion.differing_opinions
        .map(
          (item, index) => `
                  <tr>
                    <td class="text-right">${index + 1}</td>
                    <td colspan="6">${escapeHtml(item)}</td>
                  </tr>
                `
        )
        .join("")}
                <tr>
                  <td colspan="7">
                    <strong>${escapeHtml(
          t("familyDiscussion.form.sections.summary")
        )}</strong>
                  </td>
                </tr>
                ${discussion.summary
        .map(
          (item, index) => `
                  <tr>
                    <td class="text-right">${index + 1}</td>
                    <td colspan="6">${escapeHtml(item)}</td>
                  </tr>
                `
        )
        .join("")}
                <tr>
                  <td colspan="3">
                    ${escapeHtml(
          t("familyDiscussion.form.preparedByName.label")
        )}:
                  </td>
                  <td colspan="4">${escapeHtml(
          discussion.prepared_by_name
        )}</td>
                </tr>
                <tr>
                  <td colspan="3">
                    ${escapeHtml(
          t("familyDiscussion.form.preparedByPosition.label")
        )}:
                  </td>
                  <td colspan="4">${escapeHtml(
          discussion.prepared_by_position
        )}</td>
                </tr>
                <tr>
                  <td colspan="3">
                    ${escapeHtml(t("familyDiscussion.form.signature.label"))}:
                  </td>
                  <td colspan="4">
                    ${discussion.prepared_by_signature
        ? `<img src="${import.meta.env.VITE_FILE_API}${encodeURIComponent(
          discussion.prepared_by_signature
        )}" alt="Signature" class="signature-img"/>`
        : "N/A"
      }
                  </td>
                </tr>
                <tr>
                  <td colspan="3">
                    ${escapeHtml(
        t("familyDiscussion.form.preparedByDate.label")
      )}:
                  </td>
                  <td colspan="4">
                    ${escapeHtml(
        new Date(discussion.prepared_by_date).toLocaleDateString()
      )}
                  </td>
                </tr>
              </tbody>
            </table>
  
            <div class="footer">
              Generated on: ${new Date().toLocaleString("en-US", {
        timeZone: "Africa/Addis_Ababa",
      })}
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } else {
      showNotification(t("familyDiscussion.errors.printFailed"), "error");
    }
  };

  const escapeLatex = (str: string) => {
    if (!str) return str;
    return str
      .replace(/&/g, "\\&")
      .replace(/%/g, "\\%")
      .replace(/#/g, "\\#")
      .replace(/_/g, "\\_")
      .replace(/\{/g, "\\{")
      .replace(/\}/g, "\\}")
      .replace(/~/g, "\\textasciitilde{}")
      .replace(/\^/g, "\\textasciicircum{}")
      .replace(/\\/g, "\\textbackslash{}");
  };

  const fetchImageAsBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Failed to fetch image:", error);
      return "";
    }
  };

  const renderListSection = (title: string, items: string[]) => {
    if (!items || items.length === 0) return "";
    return `
\\section*{${escapeLatex(title)}}
\\begin{enumerate}
${items.map((item) => `\\item ${escapeLatex(item)}`).join("\n")}
\\end{enumerate}
    `;
  };

  const handleIndividualDownloadPDF = async (item: FamilyDiscussionItem) => {
    try {
      const currentDate = new Date().toLocaleString("en-US", {
        timeZone: "Africa/Addis_Ababa",
        hour12: true,
      });
      const escapedRecordedDate = escapeLatex(item.recorded_date || "N/A");
      const escapedDistrict = escapeLatex(item.district || "N/A");
      const escapedSocialBase = escapeLatex(item.social_base || "N/A");
      const escapedWing = escapeLatex(item.wing || "N/A");
      const escapedUnionName = escapeLatex(item.union_name || "N/A");
      const escapedFamilyName = escapeLatex(item.family_name || "N/A");
      const escapedTotalMaleMembers = escapeLatex(
        item.total_male_members || "0"
      );
      const escapedTotalFemaleMembers = escapeLatex(
        item.total_female_members || "0"
      );
      const escapedTotalFamilyMembers = escapeLatex(
        item.total_family_members || "0"
      );
      const escapedAttendingMaleMembers = escapeLatex(
        item.attending_male_members || "0"
      );
      const escapedAttendingFemaleMembers = escapeLatex(
        item.attending_female_members || "0"
      );
      const escapedTotalAttendingMembers = escapeLatex(
        item.total_attending_members || "0"
      );
      const escapedAbsenceReason = escapeLatex(item.absence_reason || "N/A");
      const escapedDiscussionAgenda = (item.discussion_agenda || []).map((ag) =>
        escapeLatex(ag)
      );
      const escapedKeyNegativePoints = (item.key_negative_points || []).map(
        (np) => escapeLatex(np)
      );
      const escapedKeyPositivePoints = (item.key_positive_points || []).map(
        (pp) => escapeLatex(pp)
      );
      const escapedConclusionsReached = (item.conclusions_reached || []).map(
        (cr) => escapeLatex(cr)
      );
      const escapedDifferingOpinions = (item.differing_opinions || []).map(
        (opinion) => escapeLatex(opinion)
      );
      const escapedSummary = (item.summary || []).map((s) => escapeLatex(s));
      const escapedPreparedByName = escapeLatex(item.prepared_by_name || "N/A");
      const escapedPreparedByPosition = escapeLatex(
        item.prepared_by_position || "N/A"
      );
      const escapedPreparedByDate = escapeLatex(item.prepared_by_date || "N/A");

      let signatureImage = "N/A";
      if (item.prepared_by_signature) {
        const imageUrl = `${import.meta.env.VITE_FILE_API}${encodeURIComponent(
          item.prepared_by_signature
        )}`;
        const base64Image = await fetchImageAsBase64(imageUrl);
        if (base64Image) {
          const base64Data = base64Image.split(",")[1];
          signatureImage = `\\includegraphics[width=0.3\\textwidth]{data:image/png;base64,${base64Data}}`;
        }
      }

      const discussionAgendaSection = renderListSection(
        t("familyDiscussion.form.sections.familyIssues"),
        escapedDiscussionAgenda
      );
      const negativePointsSection = renderListSection(
        t("familyDiscussion.form.sections.negativePoints"),
        escapedKeyNegativePoints
      );
      const positivePointsSection = renderListSection(
        t("familyDiscussion.form.sections.positivePoints"),
        escapedKeyPositivePoints
      );
      const conclusionsSection = renderListSection(
        t("familyDiscussion.form.sections.conclusions"),
        escapedConclusionsReached
      );
      const differingOpinionsSection = renderListSection(
        t("familyDiscussion.form.sections.differingOpinions"),
        escapedDifferingOpinions
      );
      const summarySection = renderListSection(
        t("familyDiscussion.form.sections.summary"),
        escapedSummary
      );

      const latexContent = `
% Setting up the document for professional output
\\documentclass[a4paper,12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\usepackage{amsmath}
\\usepackage{booktabs}
\\usepackage{graphicx}
\\usepackage{xcolor}
\\usepackage{fancyhdr}
\\usepackage{lastpage}
\\usepackage{polyglossia}
\\setmainlanguage{english}
\\setotherlanguage{amharic}
\\newfontfamily\\amharicfont[Script=Ethiopic]{Noto Serif Ethiopic}
\\geometry{a4paper, margin=1in}

% Defining colors for a professional look
\\definecolor{titlecolor}{RGB}{0, 82, 204}
\\definecolor{headercolor}{RGB}{230, 240, 255}

% Configuring header and footer
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{\\color{titlecolor}\\textbf{${escapeLatex(
        t("familyDiscussion.formTitle")
      )}}}
\\fancyfoot[C]{\\small Generated on: ${currentDate} | Page \\thepage\\ of \\pageref{LastPage}}

% Begin document
\\begin{document}

% Creating a professional title
\\begin{center}
    \\vspace*{1cm}
    \\textcolor{titlecolor}{\\rule{\\linewidth}{2pt}}
    \\vspace{0.5cm}
    \\textbf{\\Huge ${escapeLatex(t("familyDiscussion.formTitle"))}}
    \\vspace{0.5cm}
    \\textcolor{titlecolor}{\\rule{\\linewidth}{2pt}}
    \\vspace{0.5cm}
\\end{center}

% Displaying basic information
\\noindent
\\fbox{
    \\parbox{\\linewidth}{
        \\raggedleft
        \\textbf{${escapeLatex(
        t("familyDiscussion.form.recordedDate.label")
      )}:} ${escapedRecordedDate} \\\\
        \\textbf{${escapeLatex(
        t("familyDiscussion.form.district.label")
      )}:} ${escapedDistrict} \\\\
        \\textbf{${escapeLatex(
        t("familyDiscussion.form.socialBase.label")
      )}:} ${escapedSocialBase} \\\\
        \\textbf{${escapeLatex(
        t("familyDiscussion.form.wing.label")
      )}:} ${escapedWing} \\\\
        \\textbf{${escapeLatex(
        t("familyDiscussion.form.unionName.label")
      )}:} ${escapedUnionName} \\\\
        \\textbf{${escapeLatex(
        t("familyDiscussion.form.familyName.label")
      )}:} ${escapedFamilyName}
    }
}

\\vspace{0.5cm}

% Attendance table
\\begin{center}
\\rowcolors{2}{headercolor}{white}
\\begin{tabular}{lccc}
\\toprule
\\rowcolor{headercolor}
 & \\textbf{${escapeLatex(
        t("familyDiscussion.form.male")
      )}} & \\textbf{${escapeLatex(
        t("familyDiscussion.form.female")
      )}} & \\textbf{${escapeLatex(t("familyDiscussion.form.total"))}} \\\\
\\midrule
${escapeLatex(
        t("familyDiscussion.form.totalMembers")
      )} & ${escapedTotalMaleMembers} & ${escapedTotalFemaleMembers} & \\textbf{\\textcolor{red}{${escapedTotalFamilyMembers}}} \\\\
${escapeLatex(
        t("familyDiscussion.form.attendingMembers")
      )} & ${escapedAttendingMaleMembers} & ${escapedAttendingFemaleMembers} & \\textbf{\\textcolor{red}{${escapedTotalAttendingMembers}}} \\\\
\\bottomrule
\\end{tabular}
\\end{center}

\\vspace{0.5cm}

% Absence reason
\\noindent
\\textbf{\\color{titlecolor}{${escapeLatex(
        t("familyDiscussion.form.absenceReason.label")
      )}:}} ${escapedAbsenceReason}

\\vspace{0.5cm}

% Discussion sections
${discussionAgendaSection}

${negativePointsSection}

${positivePointsSection}

${conclusionsSection}

${differingOpinionsSection}

${summarySection}

\\vspace{1cm}

% Prepared by section
\\noindent
\\fbox{
    \\parbox{\\linewidth}{
        \\raggedleft
        \\textbf{${escapeLatex(
        t("familyDiscussion.form.preparedByName.label")
      )}:} ${escapedPreparedByName} \\\\
        \\textbf{${escapeLatex(
        t("familyDiscussion.form.preparedByPosition.label")
      )}:} ${escapedPreparedByPosition} \\\\
        \\textbf{${escapeLatex(
        t("familyDiscussion.form.signature.label")
      )}:} \\parbox[c]{0.3\\textwidth}{\\vspace{0.5cm}${signatureImage}\\vspace{0.5cm}} \\\\
        \\textbf{${escapeLatex(
        t("familyDiscussion.form.preparedByDate.label")
      )}:} ${escapedPreparedByDate}
    }
}

\\end{document}
      `;

      const timestamp = new Date()
        .toLocaleString("en-US", { timeZone: "Africa/Addis_Ababa" })
        .replace(/[\/:,\s]/g, "-");
      const blob = new Blob([latexContent], { type: "text/x-tex" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `family_discussion_${item.id}_${timestamp}.pdf.tex`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showNotification(
        t("familyDiscussion.notifications.pdfDownloadSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      showNotification(
        t("familyDiscussion.notifications.pdfDownloadFailed"),
        "error"
      );
    }
  };

  const handlePrintIndividual = (item: FamilyDiscussionItem) => {
    handlePrint(item);
  };

  const columns: MRT_ColumnDef<FamilyDiscussionItem>[] = [
    {
      accessorKey: "id",
      header: t("familyDiscussion.table.headers.id"),
      size: 80,
    },
    {
      accessorKey: "recorded_date",
      header: t("familyDiscussion.table.headers.recordedDate"),
      Cell: ({ cell }) =>
        new Date(cell.getValue<string>()).toLocaleDateString(),
    },
    {
      accessorKey: "conducted_date",
      header: t("familyDiscussion.table.headers.conductedDate"),
      Cell: ({ cell }) =>
        new Date(cell.getValue<string>()).toLocaleDateString(),
    },
    {
      accessorKey: "district",
      header: t("familyDiscussion.table.headers.district"),
    },
    {
      accessorKey: "social_base",
      header: t("familyDiscussion.table.headers.socialBase"),
    },
    {
      accessorKey: "wing",
      header: t("familyDiscussion.table.headers.wing"),
    },
    {
      accessorKey: "union_name",
      header: t("familyDiscussion.table.headers.unionName"),
    },
    {
      accessorKey: "family_name",
      header: t("familyDiscussion.table.headers.familyName"),
    },
    {
      accessorKey: "total_male_members",
      header: t("familyDiscussion.table.headers.totalMaleMembers"),
    },
    {
      accessorKey: "total_female_members",
      header: t("familyDiscussion.table.headers.totalFemaleMembers"),
    },
    {
      accessorKey: "total_family_members",
      header: t("familyDiscussion.table.headers.totalMembers"),
    },
    {
      accessorKey: "attending_male_members",
      header: t("familyDiscussion.table.headers.attendingMaleMembers"),
    },
    {
      accessorKey: "attending_female_members",
      header: t("familyDiscussion.table.headers.attendingFemaleMembers"),
    },
    {
      accessorKey: "total_attending_members",
      header: t("familyDiscussion.table.headers.totalAttendingMembers"),
    },
    {
      accessorKey: "absence_reason",
      header: t("familyDiscussion.table.headers.absenceReason"),
    },
    {
      accessorKey: "prepared_by_name",
      header: t("familyDiscussion.table.headers.preparedByName"),
    },
    {
      accessorKey: "prepared_by_position",
      header: t("familyDiscussion.table.headers.preparedByPosition"),
    },
    {
      accessorKey: "prepared_by_date",
      header: t("familyDiscussion.table.headers.preparedByDate"),
      Cell: ({ cell }) =>
        new Date(cell.getValue<string>()).toLocaleDateString(),
    },
    {
      id: "actions",
      header: t("familyDiscussion.table.headers.actions"),
      Cell: ({ row }) => {
        const itemId = row.original.id;
        return (
          <Group spacing="xs">
            <ActionIcon
              color="blue"
              variant="light"
              onClick={() => handleView(row.original)}
            >
              <IconEye size={16} />
            </ActionIcon>
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
            <ActionIcon
              color="green"
              variant="light"
              onClick={() => handleIndividualDownloadPDF(row.original)}
            >
              <IconFileDownload size={16} />
            </ActionIcon>
            <ActionIcon
              color="teal"
              variant="light"
              onClick={() => handlePrintIndividual(row.original)}
            >
              <IconPrinter size={16} />
            </ActionIcon>
          </Group>
        );
      },
    },
  ];

  const fetchPaginatedData = async (page = currentPage, pageSize = perPage) => {
    setLoading(true);
    try {
      // Send request to backend with pagination params
      const response = await getFamilyDiscussion({
        params: { page, per_page: pageSize },
      });
      setPaginatedData(response.data || []);
      setTotalRows(response.total || 0);
      setCurrentPage(response.current_page || 1);
      setPerPage(response.per_page || pageSize);
    } catch (error) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaginatedData(1, perPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When perPage changes, reset to page 1 and refetch
  useEffect(() => {
    fetchPaginatedData(1, perPage);
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPage]);

  return (
    <Box p="md" pos="relative">
      <Group position="apart" mb="md">
        <Title order={2}>{t("familyDiscussion.title")}</Title>
        <Group>
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
            {t("familyDiscussion.buttons.addDiscussion")}
          </Button>
          <Button
            leftIcon={<IconDownload size={16} />}
            onClick={handleDownload}
            variant="outline"
            color="blue"
          >
            {t("familyDiscussion.buttons.download")}
          </Button>
          <Button
            leftIcon={<IconPrinter size={16} />}
            onClick={() => handlePrint()}
            variant="outline"
            color="blue"
          >
            {t("familyDiscussion.buttons.print")}
          </Button>
        </Group>
      </Group>
      <Divider my="md" />

      <Box className="h-[calc(100vh-200px)] w-full overflow-auto">
        <MantineReactTable
          columns={columns}
          data={paginatedData}
          state={{
            isLoading: loading,
            pagination: {
              pageIndex: currentPage - 1,
              pageSize: Number(perPage) || 10,
            },
          }}
          enableColumnOrdering
          enableSorting
          enableColumnFilters
          enableGlobalFilter
          enableStickyHeader
          enableFullScreenToggle={false}
          manualPagination
          rowCount={totalRows}
          paginationDisplayMode="pages"
          mantinePaginationProps={{
            showRowsPerPage: true,
            total: Math.ceil(totalRows / (Number(perPage) || 10)),
            value: currentPage,
          }}
          onPaginationChange={(updater) => {
            let pageIndex, pageSize;
            if (typeof updater === "function") {
              const current = {
                pageIndex: currentPage - 1,
                pageSize: Number(perPage) || 10,
              };
              const next = updater(current);
              pageIndex = next.pageIndex;
              pageSize = next.pageSize;
            } else {
              pageIndex = updater.pageIndex;
              pageSize = updater.pageSize;
            }
            const safePageSize = Number(pageSize) || 10;
            if (perPage !== safePageSize) {
              setPerPage(safePageSize);
              setCurrentPage(1);
              fetchPaginatedData(1, safePageSize);
            } else {
              setCurrentPage(pageIndex + 1);
              fetchPaginatedData(pageIndex + 1, safePageSize);
            }
          }}
          initialState={{
            density: "xs",
            pagination: { pageSize: perPage, pageIndex: currentPage - 1 },
          }}
          mantineTableContainerProps={{
            sx: {
              maxHeight: "calc(100vh - 210px)",
            },
          }}
          mantineTableHeadCellProps={{
            sx: {
              border: "1px solid #ccc",
              backgroundColor: "#e6f0ff",
              fontWeight: "bold",
              textAlign: "right",
              color: "#0052cc",
            },
          }}
          mantineTableBodyCellProps={{
            sx: {
              border: "1px solid #ccc",
              textAlign: "right",
            },
          }}
          mantineTableProps={{
            sx: {
              border: "2px solid #ccc",
              direction: "ltr",
            },
          }}
        />
      </Box>

      <Modal
        opened={editModalOpen}
        onClose={resetAndCloseModal}
        title={
          editingId
            ? t("familyDiscussion.modal.editTitle")
            : t("familyDiscussion.modal.createTitle")
        }
        size="lg"
        overlayProps={{ blur: 3 }}
      >
        {loading && <Loader />}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Box>
            <Text size="lg" weight={700} align="center" mb="md">
              {t("familyDiscussion.formTitle")}
            </Text>
            <Group grow mb="md">
              <TextInput
                withAsterisk
                label={t("familyDiscussion.form.conductedDate.label")}
                type="date"
                {...form.getInputProps("conducted_date")}
              />
            </Group>
            <Group grow mb="md">
              <TextInput
                withAsterisk
                label={t("familyDiscussion.form.district.label")}
                placeholder={t("familyDiscussion.form.district.placeholder")}
                {...form.getInputProps("district")}
              />
              {/* Social Base Field */}
              <Flex gap="sm" align="flex-end">
                <Select
                  withAsterisk
                  label={t("familyDiscussion.form.socialBase.label")}
                  placeholder={t(
                    "familyDiscussion.form.socialBase.placeholder"
                  )}
                  data={predefinedSocialBases.map((base) => ({
                    value: base,
                    label: base,
                  }))}
                  {...form.getInputProps("social_base")}
                  disabled={customSocialBaseInput}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    setCustomSocialBaseInput(!customSocialBaseInput);
                    form.setFieldValue("social_base", "");
                    form.setFieldValue("custom_social_base", "");
                  }}
                >
                  {customSocialBaseInput
                    ? t("familyDiscussion.buttons.selectPredefined")
                    : t("familyDiscussion.buttons.addCustom")}
                </Button>
              </Flex>
            </Group>
            {customSocialBaseInput && (
              <TextInput
                withAsterisk
                label={t("familyDiscussion.form.customSocialBase.label")}
                placeholder={t(
                  "familyDiscussion.form.customSocialBase.placeholder"
                )}
                {...form.getInputProps("custom_social_base")}
                mb="md"
              />
            )}

            {/* Wing Field */}
            <Flex gap="sm" align="flex-end" mb="md">
              <Select
                withAsterisk
                label={t("familyDiscussion.form.wing.label")}
                placeholder={t("familyDiscussion.form.wing.placeholder")}
                data={predefinedWings.map((wing) => ({
                  value: wing,
                  label: wing,
                }))}
                {...form.getInputProps("wing")}
                disabled={customWingInput}
                sx={{ flex: 1 }}
              />
              <Button
                variant="outline"
                onClick={() => {
                  setCustomWingInput(!customWingInput);
                  form.setFieldValue("wing", "");
                  form.setFieldValue("custom_wing", "");
                }}
              >
                {customWingInput
                  ? t("familyDiscussion.buttons.selectPredefined")
                  : t("familyDiscussion.buttons.addCustom")}
              </Button>
            </Flex>
            {customWingInput && (
              <TextInput
                withAsterisk
                label={t("familyDiscussion.form.customWing.label")}
                placeholder={t("familyDiscussion.form.customWing.placeholder")}
                {...form.getInputProps("custom_wing")}
                mb="md"
              />
            )}

            <TextInput
              withAsterisk
              label={t("familyDiscussion.form.unionName.label")}
              placeholder={t("familyDiscussion.form.unionName.placeholder")}
              mb="md"
              {...form.getInputProps("union_name")}
            />

            <TextInput
              withAsterisk
              label={t("familyDiscussion.form.familyName.label")}
              placeholder={t("familyDiscussion.form.familyName.placeholder")}
              mb="md"
              {...form.getInputProps("family_name")}
            />

            <Table withBorder withColumnBorders>
              <thead>
                <tr>
                  <th></th>
                  <th style={{ textAlign: "right" }}>
                    {t("familyDiscussion.form.male")}
                  </th>
                  <th style={{ textAlign: "right" }}>
                    {t("familyDiscussion.form.female")}
                  </th>
                  <th style={{ textAlign: "right" }}>
                    {t("familyDiscussion.form.total")}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{t("familyDiscussion.form.totalMembers")}</td>
                  <td>
                    <TextInput
                      withAsterisk
                      type="number"
                      {...form.getInputProps("total_male_members")}
                    />
                  </td>
                  <td>
                    <TextInput
                      withAsterisk
                      type="number"
                      {...form.getInputProps("total_female_members")}
                    />
                  </td>
                  <td style={{ color: "red", fontWeight: "bold" }}>
                    {(
                      parseInt(form.values.total_male_members || "0") +
                      parseInt(form.values.total_female_members || "0")
                    ).toString()}
                  </td>
                </tr>
                <tr>
                  <td>{t("familyDiscussion.form.attendingMembers")}</td>
                  <td>
                    <TextInput
                      withAsterisk
                      type="number"
                      {...form.getInputProps("attending_male_members")}
                    />
                  </td>
                  <td>
                    <TextInput
                      withAsterisk
                      type="number"
                      {...form.getInputProps("attending_female_members")}
                    />
                  </td>
                  <td style={{ color: "red", fontWeight: "bold" }}>
                    {(
                      parseInt(form.values.attending_male_members || "0") +
                      parseInt(form.values.attending_female_members || "0")
                    ).toString()}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4}>
                    <Textarea
                      withAsterisk
                      label={t("familyDiscussion.form.absenceReason.label")}
                      placeholder={t(
                        "familyDiscussion.form.absenceReason.placeholder"
                      )}
                      {...form.getInputProps("absence_reason")}
                    />
                  </td>
                </tr>
              </tbody>
            </Table>
            <Box mt="md">
              <Text weight={700}>
                {t("familyDiscussion.form.sections.familyIssues")}
              </Text>
              {form.values.discussion_agenda.map((item, index) => (
                <Group key={index} mt="xs">
                  <Text>{index + 1}.</Text>
                  <TextInput
                    value={item}
                    onChange={(e) => {
                      const newAgenda = [...form.values.discussion_agenda];
                      newAgenda[index] = e.target.value;
                      form.setFieldValue("discussion_agenda", newAgenda);
                    }}
                    style={{ flex: 1 }}
                  />
                  <ActionIcon
                    color="red"
                    onClick={() => {
                      const newAgenda = form.values.discussion_agenda.filter(
                        (_, i) => i !== index
                      );
                      form.setFieldValue("discussion_agenda", newAgenda);
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ))}
              <Group mt="xs">
                <TextInput
                  placeholder={t(
                    "familyDiscussion.form.addAgendaItem.placeholder"
                  )}
                  value={form.values.newAgendaItem}
                  onChange={(e) =>
                    form.setFieldValue("newAgendaItem", e.target.value)
                  }
                  style={{ flex: 1 }}
                />
                <Button
                  onClick={() => {
                    if (form.values.newAgendaItem) {
                      form.setFieldValue("discussion_agenda", [
                        ...form.values.discussion_agenda,
                        form.values.newAgendaItem,
                      ]);
                      form.setFieldValue("newAgendaItem", "");
                    }
                  }}
                >
                  {t("familyDiscussion.form.addButton")}
                </Button>
              </Group>
            </Box>
            <Box mt="md">
              <Text weight={700}>
                {t("familyDiscussion.form.sections.positivePoints")}
              </Text>
              {form.values.key_positive_points.map((item, index) => (
                <Group key={index} mt="xs">
                  <Text>{index + 1}.</Text>
                  <TextInput
                    value={item}
                    onChange={(e) => {
                      const newPoints = [...form.values.key_positive_points];
                      newPoints[index] = e.target.value;
                      form.setFieldValue("key_positive_points", newPoints);
                    }}
                    style={{ flex: 1 }}
                  />
                  <ActionIcon
                    color="red"
                    onClick={() => {
                      const newPoints = form.values.key_positive_points.filter(
                        (_, i) => i !== index
                      );
                      form.setFieldValue("key_positive_points", newPoints);
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ))}
              <Group mt="xs">
                <TextInput
                  placeholder={t("familyDiscussion.form.placeholder")}
                  value={form.values.newPositivePoint}
                  onChange={(e) =>
                    form.setFieldValue("newPositivePoint", e.target.value)
                  }
                  style={{ flex: 1 }}
                />
                <Button
                  onClick={() => {
                    if (form.values.newPositivePoint) {
                      form.setFieldValue("key_positive_points", [
                        ...form.values.key_positive_points,
                        form.values.newPositivePoint,
                      ]);
                      form.setFieldValue("newPositivePoint", "");
                    }
                  }}
                >
                  {t("familyDiscussion.form.addButton")}
                </Button>
              </Group>
            </Box>
            <Box mt="md">
              <Text weight={700}>
                {t("familyDiscussion.form.sections.negativePoints")}
              </Text>
              {form.values.key_negative_points.map((item, index) => (
                <Group key={index} mt="xs">
                  <Text>{index + 1}.</Text>
                  <TextInput
                    value={item}
                    onChange={(e) => {
                      const newPoints = [...form.values.key_negative_points];
                      newPoints[index] = e.target.value;
                      form.setFieldValue("key_negative_points", newPoints);
                    }}
                    style={{ flex: 1 }}
                  />
                  <ActionIcon
                    color="red"
                    onClick={() => {
                      const newPoints = form.values.key_negative_points.filter(
                        (_, i) => i !== index
                      );
                      form.setFieldValue("key_negative_points", newPoints);
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ))}
              <Group mt="xs">
                <TextInput
                  placeholder={t(
                    "familyDiscussion.form.addNegativePoint.placeholder"
                  )}
                  value={form.values.newNegativePoint}
                  onChange={(e) =>
                    form.setFieldValue("newNegativePoint", e.target.value)
                  }
                  style={{ flex: 1 }}
                />
                <Button
                  onClick={() => {
                    if (form.values.newNegativePoint) {
                      form.setFieldValue("key_negative_points", [
                        ...form.values.key_negative_points,
                        form.values.newNegativePoint,
                      ]);
                      form.setFieldValue("newNegativePoint", "");
                    }
                  }}
                >
                  {t("familyDiscussion.form.addButton")}
                </Button>
              </Group>
            </Box>
            <Box mt="md">
              <Text weight={700}>
                {t("familyDiscussion.form.sections.conclusions")}
              </Text>
              {form.values.conclusions_reached.map((item, index) => (
                <Group key={index} mt="xs">
                  <Text>{index + 1}.</Text>
                  <TextInput
                    value={item}
                    onChange={(e) => {
                      const newConclusions = [
                        ...form.values.conclusions_reached,
                      ];
                      newConclusions[index] = e.target.value;
                      form.setFieldValue("conclusions_reached", newConclusions);
                    }}
                    style={{ flex: 1 }}
                  />
                  <ActionIcon
                    color="red"
                    onClick={() => {
                      const newConclusions =
                        form.values.conclusions_reached.filter(
                          (_, i) => i !== index
                        );
                      form.setFieldValue("conclusions_reached", newConclusions);
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ))}
              <Group mt="xs">
                <TextInput
                  placeholder={t(
                    "familyDiscussion.form.addConclusion.placeholder"
                  )}
                  value={form.values.newConclusion}
                  onChange={(e) =>
                    form.setFieldValue("newConclusion", e.target.value)
                  }
                  style={{ flex: 1 }}
                />
                <Button
                  onClick={() => {
                    if (form.values.newConclusion) {
                      form.setFieldValue("conclusions_reached", [
                        ...form.values.conclusions_reached,
                        form.values.newConclusion,
                      ]);
                      form.setFieldValue("newConclusion", "");
                    }
                  }}
                >
                  {t("familyDiscussion.form.addButton")}
                </Button>
              </Group>
            </Box>
            <Box mt="md">
              <Text weight={700}>
                {t("familyDiscussion.form.sections.differingOpinions")}
              </Text>
              {form.values.differing_opinions.map((item, index) => (
                <Group key={index} mt="xs">
                  <Text>{index + 1}.</Text>
                  <TextInput
                    value={item}
                    onChange={(e) => {
                      const newOpinions = [...form.values.differing_opinions];
                      newOpinions[index] = e.target.value;
                      form.setFieldValue("differing_opinions", newOpinions);
                    }}
                    style={{ flex: 1 }}
                  />
                  <ActionIcon
                    color="red"
                    onClick={() => {
                      const newOpinions = form.values.differing_opinions.filter(
                        (_, i) => i !== index
                      );
                      form.setFieldValue("differing_opinions", newOpinions);
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ))}
              <Group mt="xs">
                <TextInput
                  placeholder={t(
                    "familyDiscussion.form.addOpinion.placeholder"
                  )}
                  value={form.values.newOpinion}
                  onChange={(e) =>
                    form.setFieldValue("newOpinion", e.target.value)
                  }
                  style={{ flex: 1 }}
                />
                <Button
                  onClick={() => {
                    if (form.values.newOpinion) {
                      form.setFieldValue("differing_opinions", [
                        ...form.values.differing_opinions,
                        form.values.newOpinion,
                      ]);
                      form.setFieldValue("newOpinion", "");
                    }
                  }}
                >
                  {t("familyDiscussion.form.addButton")}
                </Button>
              </Group>
            </Box>
            <Box mt="md">
              <Text weight={700}>
                {t("familyDiscussion.form.sections.summary")}
              </Text>
              {form.values.summary.map((item, index) => (
                <Group key={index} mt="xs">
                  <Text>{index + 1}.</Text>
                  <TextInput
                    value={item}
                    onChange={(e) => {
                      const newSummary = [...form.values.summary];
                      newSummary[index] = e.target.value;
                      form.setFieldValue("summary", newSummary);
                    }}
                    style={{ flex: 1 }}
                  />
                  <ActionIcon
                    color="red"
                    onClick={() => {
                      const newSummary = form.values.summary.filter(
                        (_, i) => i !== index
                      );
                      form.setFieldValue("summary", newSummary);
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ))}
              <Group mt="xs">
                <TextInput
                  placeholder={t(
                    "familyDiscussion.form.addSummaryItem.placeholder"
                  )}
                  value={form.values.newSummaryItem}
                  onChange={(e) =>
                    form.setFieldValue("newSummaryItem", e.target.value)
                  }
                  style={{ flex: 1 }}
                />
                <Button
                  onClick={() => {
                    if (form.values.newSummaryItem) {
                      form.setFieldValue("summary", [
                        ...form.values.summary,
                        form.values.newSummaryItem,
                      ]);
                      form.setFieldValue("newSummaryItem", "");
                    }
                  }}
                >
                  {t("familyDiscussion.form.addButton")}
                </Button>
              </Group>
            </Box>
            <Box mt="md">
              <Group grow mb="md">
                <TextInput
                  withAsterisk
                  label={t("familyDiscussion.form.preparedByName.label")}
                  placeholder={t(
                    "familyDiscussion.form.preparedByName.placeholder"
                  )}
                  {...form.getInputProps("prepared_by_name")}
                />
                <TextInput
                  withAsterisk
                  label={t("familyDiscussion.form.preparedByPosition.label")}
                  placeholder={t(
                    "familyDiscussion.form.preparedByPosition.placeholder"
                  )}
                  {...form.getInputProps("prepared_by_position")}
                />
              </Group>
              <TextInput
                label={t("familyDiscussion.form.preparedByDate.label")}
                value={new Date().toLocaleDateString()}
                disabled
              />
              <TextInput
                label={t("familyDiscussion.form.signature.label")}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e: any) => handleFileChange(e.target.files[0])}
                mb="md"
                required={!editingId}
              />
              {editingId && form.values.prepared_by_signature && (
                <Box mb="md">
                  <Text size="sm" mb="xs">
                    {t("familyDiscussion.form.currentSignature")}
                  </Text>
                  <img
                    src={`${import.meta.env.VITE_FILE_API}${form.values.prepared_by_signature}`}
                    alt="Current Signature"
                    style={{ maxWidth: "100px", maxHeight: "100px" }}
                  />
                </Box>
              )}
            </Box>
          </Box>
          <Group position="right" mt="xl">
            <Button variant="default" onClick={resetAndCloseModal}>
              {t("familyDiscussion.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              loading={loading || fileUploading}
            >
              {editingId
                ? t("familyDiscussion.buttons.updateDiscussion")
                : t("familyDiscussion.buttons.createDiscussion")}
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={viewModalOpen}
        onClose={closeViewModal}
        title={t("familyDiscussion.modal.viewTitle")}
        size="lg"
        overlayProps={{ blur: 3 }}
      >
        {viewingItem && (
          <Box>
            <Text size="lg" weight={700} align="center" mb="md">
              {t("familyDiscussion.formTitle")}
            </Text>
            <Table withBorder withColumnBorders>
              <thead>
                <tr>
                  <th colSpan={6}>{t("familyDiscussion.formtype")}</th>
                  <th style={{ textAlign: "right" }}>
                    {new Date(viewingItem.recorded_date).toLocaleDateString()}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{t("familyDiscussion.form.district.label")}</td>
                  <td>{viewingItem.district}</td>
                  <td>{t("familyDiscussion.form.socialBase.label")}</td>
                  <td>{viewingItem.social_base}</td>
                  <td>{t("familyDiscussion.form.wing.label")}</td>
                  <td colSpan={2}>{viewingItem.wing}</td>
                </tr>
                <tr>
                  <td>{t("familyDiscussion.form.unionName.label")}</td>
                  <td colSpan={2}>{viewingItem.union_name}</td>
                  <td>{t("familyDiscussion.form.familyName.label")}</td>
                  <td colSpan={3}>{viewingItem.family_name}</td>
                </tr>
                <tr>
                  <td>{t("familyDiscussion.form.conductedDate.label")}</td>
                  <td colSpan={6}>
                    {new Date(viewingItem.conducted_date).toLocaleDateString()}
                  </td>
                </tr>
                <tr>
                  <td>{t("familyDiscussion.form.totalMembers")}</td>
                  <td>{t("familyDiscussion.form.male")}</td>
                  <td style={{ textAlign: "right" }}>
                    {viewingItem.total_male_members}
                  </td>
                  <td>{t("familyDiscussion.form.female")}</td>
                  <td style={{ textAlign: "right" }}>
                    {viewingItem.total_female_members}
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      color: "red",
                      fontWeight: "bold",
                    }}
                  >
                    {t("familyDiscussion.form.total")}
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      color: "red",
                      fontWeight: "bold",
                    }}
                  >
                    {viewingItem.total_family_members}
                  </td>
                </tr>
                <tr>
                  <td>{t("familyDiscussion.form.attendingMembers")}</td>
                  <td>{t("familyDiscussion.form.male")}</td>
                  <td style={{ textAlign: "right" }}>
                    {viewingItem.attending_male_members}
                  </td>
                  <td>{t("familyDiscussion.form.female")}</td>
                  <td style={{ textAlign: "right" }}>
                    {viewingItem.attending_female_members}
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      color: "red",
                      fontWeight: "bold",
                    }}
                  >
                    {t("familyDiscussion.form.total")}
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      color: "red",
                      fontWeight: "bold",
                    }}
                  >
                    {viewingItem.total_attending_members}
                  </td>
                </tr>
                <tr>
                  <td colSpan={7}>
                    <Text>
                      {t("familyDiscussion.form.absenceReason.label")}:{" "}
                      {viewingItem.absence_reason || "N/A"}
                    </Text>
                  </td>
                </tr>

                {/* Discussion Agenda */}
                <tr>
                  <td colSpan={7}>
                    <strong>
                      {t("familyDiscussion.form.sections.familyIssues")}
                    </strong>
                  </td>
                </tr>
                {viewingItem.discussion_agenda?.length > 0 ? (
                  viewingItem.discussion_agenda.map((item, index) => (
                    <tr key={index}>
                      <td style={{ textAlign: "right" }}>{index + 1}</td>
                      <td colSpan={6}>{item}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      {t("familyDiscussion.noData")}
                    </td>
                  </tr>
                )}

                {/* Negative Points */}
                <tr>
                  <td colSpan={7}>
                    <strong>
                      {t("familyDiscussion.form.sections.negativePoints")}
                    </strong>
                  </td>
                </tr>
                {viewingItem.key_negative_points?.length > 0 ? (
                  viewingItem.key_negative_points.map((item, index) => (
                    <tr key={index}>
                      <td style={{ textAlign: "right" }}>{index + 1}</td>
                      <td colSpan={6}>{item}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      {t("familyDiscussion.noData")}
                    </td>
                  </tr>
                )}

                {/* Positive Points */}
                <tr>
                  <td colSpan={7}>
                    <strong>
                      {t("familyDiscussion.form.sections.positivePoints")}
                    </strong>
                  </td>
                </tr>
                {viewingItem.key_positive_points?.length > 0 ? (
                  viewingItem.key_positive_points.map((item, index) => (
                    <tr key={index}>
                      <td style={{ textAlign: "right" }}>{index + 1}</td>
                      <td colSpan={6}>{item}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      {t("familyDiscussion.noData")}
                    </td>
                  </tr>
                )}

                {/* Conclusions */}
                <tr>
                  <td colSpan={7}>
                    <strong>
                      {t("familyDiscussion.form.sections.conclusions")}
                    </strong>
                  </td>
                </tr>
                {viewingItem.conclusions_reached?.length > 0 ? (
                  viewingItem.conclusions_reached.map((item, index) => (
                    <tr key={index}>
                      <td style={{ textAlign: "right" }}>{index + 1}</td>
                      <td colSpan={6}>{item}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      {t("familyDiscussion.noData")}
                    </td>
                  </tr>
                )}

                {/* Differing Opinions */}
                <tr>
                  <td colSpan={7}>
                    <strong>
                      {t("familyDiscussion.form.sections.differingOpinions")}
                    </strong>
                  </td>
                </tr>
                {viewingItem.differing_opinions?.length > 0 ? (
                  viewingItem.differing_opinions.map((item, index) => (
                    <tr key={index}>
                      <td style={{ textAlign: "right" }}>{index + 1}</td>
                      <td colSpan={6}>{item}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      {t("familyDiscussion.noData")}
                    </td>
                  </tr>
                )}

                {/* Summary */}
                <tr>
                  <td colSpan={7}>
                    <strong>
                      {t("familyDiscussion.form.sections.summary")}
                    </strong>
                  </td>
                </tr>
                {viewingItem.summary?.length > 0 ? (
                  viewingItem.summary.map((item, index) => (
                    <tr key={index}>
                      <td style={{ textAlign: "right" }}>{index + 1}</td>
                      <td colSpan={6}>{item}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      {t("familyDiscussion.noData")}
                    </td>
                  </tr>
                )}

                {/* Prepared By Section */}
                <tr>
                  <td colSpan={3}>
                    {t("familyDiscussion.form.preparedByName.label")}:
                  </td>
                  <td colSpan={4}>{viewingItem.prepared_by_name}</td>
                </tr>
                <tr>
                  <td colSpan={3}>
                    {t("familyDiscussion.form.preparedByPosition.label")}:
                  </td>
                  <td colSpan={4}>{viewingItem.prepared_by_position}</td>
                </tr>
                <tr>
                  <td colSpan={3}>
                    {t("familyDiscussion.form.signature.label")}:
                  </td>
                  <td colSpan={4}>
                    {viewingItem.prepared_by_signature ? (
                      <img
                        src={`${import.meta.env.VITE_FILE_API}${viewingItem.prepared_by_signature}`}
                        alt="Signature"
                        style={{ maxWidth: "100px", maxHeight: "100px" }}
                      />
                    ) : (
                      "N/A"
                    )}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3}>
                    {t("familyDiscussion.form.preparedByDate.label")}:
                  </td>
                  <td colSpan={4}>
                    {new Date(
                      viewingItem.prepared_by_date
                    ).toLocaleDateString()}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Box>
        )}
        <Group position="right" mt="xl">
          <Button variant="default" onClick={closeViewModal}>
            {t("familyDiscussion.buttons.close")}
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t("familyDiscussion.modal.deleteTitle")}
        centered
      >
        {deleteLoading && <Loader />}
        <Box>
          <Text size="sm" mb="md">
            {t("familyDiscussion.modal.deleteConfirmation")}
          </Text>
          <Group position="right" mt="md">
            <Button
              variant="default"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              {t("familyDiscussion.buttons.cancel")}
            </Button>
            <Button
              color="red"
              loading={deleteLoading}
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
            >
              {t("familyDiscussion.buttons.delete")}
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
};

export default FamilyDiscussionManagement;
