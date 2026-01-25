import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  Group,
  Title,
  Text,
  Badge,
  Table,
  ActionIcon,
  Modal,
  Loader,
  Center,
} from "@mantine/core";
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconArrowLeft,
} from "@tabler/icons-react";
import {
  getQuestionnaireById,
  deleteQuestionnaire,
  getQuestions,
} from "../../services/api/main";

export default function QuestionnaireDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questionnaire, setQuestionnaire] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionnaireData, questionsData] = await Promise.all([
          getQuestionnaireById(id!),
          getQuestions(id!),
        ]);
        setQuestionnaire(questionnaireData);
        setQuestions(questionsData);
      } catch (error) {
        console.error(t("questionnairedetailpage.error"), error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, t]);

  const handleDeleteQuestion = async () => {
    if (!id || !questionToDelete) return;
    try {
      await deleteQuestionnaire(id, questionToDelete);
      const questionsData = await getQuestions(id);
      setQuestions(questionsData);
      setQuestionToDelete(null);
    } catch (error) {
      console.error(t("questionnairedetailpage.deleteError"), error);
    }
  };

  if (loading)
    return (
      <Center style={{ height: "100%" }}>
        <Loader size="xl" variant="dots" />
      </Center>
    );
  if (!questionnaire) return <div>{t("questionnairedetailpage.notFound")}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Group position="apart" mb="md">
        <Button
          leftIcon={<IconArrowLeft size="1rem" />}
          variant="outline"
          mb="md"
          onClick={() => navigate(-1)}
        >
          {t("questionnairedetailpage.back")}
        </Button>
        <div>
          <Title order={1}>{questionnaire.title}</Title>
          <Text color="dimmed">{questionnaire.description}</Text>
        </div>
        <Group>
          <Button
            leftIcon={<IconEdit size={16} />}
            onClick={() => navigate(`/questionnaires/${id}/edit`)}
          >
            {t("questionnairedetailpage.edit")}
          </Button>
          <Button
            color="red"
            leftIcon={<IconTrash size={16} />}
            onClick={() => setDeleteModalOpen(true)}
          >
            {t("questionnairedetailpage.delete")}
          </Button>
        </Group>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
        <Group position="apart" mb="sm">
          <Badge color={questionnaire.type === "exam" ? "red" : "blue"}>
            {questionnaire.type}
          </Badge>
          <Badge color={questionnaire.is_active ? "green" : "gray"}>
            {questionnaire.is_active
              ? t("questionnairedetailpage.status.active")
              : t("questionnairedetailpage.status.inactive")}
          </Badge>
        </Group>
        <Text mb="sm">
          <strong>{t("questionnairedetailpage.timeLimit")}</strong>{" "}
          {questionnaire.time_limit
            ? `${questionnaire.time_limit} minutes`
            : "None"}
        </Text>
        <Text mb="sm">
          <strong>{t("questionnairedetailpage.available")}</strong>{" "}
          {questionnaire.start_date
            ? new Date(questionnaire.start_date).toLocaleString()
            : t("questionnairedetailpage.immediately")}{" "}
          {t("to")}{" "}
          {questionnaire.end_date
            ? new Date(questionnaire.end_date).toLocaleString()
            : t("questionnairedetailpage.noEndDate")}
        </Text>
      </Card>

      <Group position="apart" mb="md">
        <Title order={2}>{t("questionnairedetailpage.questions")}</Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={() => navigate(`/questionnaires/${id}/questions/new`)}
        >
          {t("questionnairedetailpage.addQuestion")}
        </Button>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Table>
          <thead>
            <tr>
              <th>{t("questionnairedetailpage.question")}</th>
              <th>{t("questionnairedetailpage.type")}</th>
              <th>{t("questionnairedetailpage.points")}</th>
              <th>{t("questionnairedetailpage.required")}</th>
              <th>{t("questionnairedetailpage.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id}>
                <td>{q.question_text}</td>
                <td>
                  <Badge
                    color={
                      q.question_type === "multiple_choice" ? "blue" : "green"
                    }
                  >
                    {q.question_type}
                  </Badge>
                </td>
                <td>{q.points}</td>
                <td>
                  <Badge color={q.is_required ? "red" : "gray"}>
                    {q.is_required
                      ? t("questionnairedetailpage.required")
                      : t("questionnairedetailpage.optional")}
                  </Badge>
                </td>
                <td>
                  <Group spacing="xs">
                    <ActionIcon
                      color="blue"
                      onClick={() =>
                        navigate(`/questionnaires/questions/${q.id}/edit`)
                      }
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      onClick={() => setQuestionToDelete(q.id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {/* Modal for deleting a question */}
      <Modal
        opened={!!questionToDelete}
        onClose={() => setQuestionToDelete(null)}
        title={t("questionnairedetailpage.deleteModal.title")}
      >
        <Text>{t("questionnairedetailpage.deleteModal.content")}</Text>
        <Group position="right" mt="md">
          <Button variant="outline" onClick={() => setQuestionToDelete(null)}>
            {t("questionnairedetailpage.cancel")}
          </Button>
          <Button color="red" onClick={handleDeleteQuestion}>
            {t("questionnairedetailpage.delete")}
          </Button>
        </Group>
      </Modal>
    </div>
  );
}
