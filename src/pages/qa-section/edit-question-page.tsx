import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Loader, Title, Notification } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { getQuestionById, updateQuestion } from "../../services/api/main";
import QuestionForm from "./question-form";

export default function EditQuestionPage() {
  const { t } = useTranslation();
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const questionData = await getQuestionById(questionId);

        // Transform the data to match the form's expected types
        const transformedData = {
          ...questionData,
          points: Number(questionData.points),
          order: Number(questionData.order),
          options: questionData.options.map((option: any) => ({
            ...option,
            order: Number(option.order),
          })),
        };

        setQuestion(transformedData);
      } catch (error) {
        console.error(t("editquestionpage.error.fetch"), error);
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId, t]);

  const handleSubmit = async (values: any) => {
    if (!questionId) {
      console.error(t("editquestionpage.error.missingId"));
      return;
    }

    setSubmitting(true);
    try {
      // Convert back to strings if your API expects them
      const submissionValues = {
        ...values,
        points: String(values.points),
        order: String(values.order),
        options: values.options.map((option: any) => ({
          ...option,
          order: String(option.order),
        })),
      };

      await updateQuestion(questionId, submissionValues);
      setShowSuccess(true);
      setTimeout(() => navigate(-1), 1500);
    } catch (error) {
      console.error(t("editquestionpage.error.update"), error);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader size="xl" />;
  if (!question) return <div>{t("editquestionpage.notFound")}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Title order={2} mb="xl">
        {t("editquestionpage.title")}
      </Title>

      <QuestionForm
        initialValues={question}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      />

      {showSuccess && (
        <Notification
          icon={<IconCheck size="1.1rem" />}
          color="teal"
          title={t("editquestionpage.success")}
          onClose={() => setShowSuccess(false)}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          {t("editquestionpage.success")}
        </Notification>
      )}

      {showError && (
        <Notification
          icon={<IconX size="1.1rem" />}
          color="red"
          title={t("editquestionpage.error.update")}
          onClose={() => setShowError(false)}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          {t("editquestionpage.error.update")}
        </Notification>
      )}
    </div>
  );
}
