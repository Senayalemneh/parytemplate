import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Title, Loader, Center, Notification } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import QuestionnaireForm from "../qa-section/questionnaire-form";
import {
  getQuestionnaireById,
  updateQuestionnaire,
} from "../../services/api/main";

export default function EditQuestionnairePage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        if (!id) return;
        const data = await getQuestionnaireById(id);
        setQuestionnaire(data);
      } catch (error) {
        console.error(t("editquestionnairepage.error.fetch"), error);
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionnaire();
  }, [id, t]);

  const handleSubmit = async (values: any) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await updateQuestionnaire(id, values); // Pass id and values separately
      setShowSuccess(true);
      setTimeout(() => navigate(`/questionnaires/${id}`), 1500);
    } catch (error) {
      console.error(t("editquestionnairepage.error.update"), error);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <Center style={{ height: "100%" }}>
        <Loader size="xl" variant="dots" />
      </Center>
    );

  if (!questionnaire) return <div>{t("editquestionnairepage.notFound")}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Title order={1} mb="md">
        {t("editquestionnairepage.title")}
      </Title>

      <QuestionnaireForm
        initialValues={questionnaire}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {showSuccess && (
        <Notification
          icon={<IconCheck size="1.1rem" />}
          color="teal"
          title={t("editquestionnairepage.success")}
          onClose={() => setShowSuccess(false)}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          {t("editquestionnairepage.success.message")}
        </Notification>
      )}

      {showError && (
        <Notification
          icon={<IconX size="1.1rem" />}
          color="red"
          title={t("editquestionnairepage.error.title")}
          onClose={() => setShowError(false)}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          {t("editquestionnairepage.error.message")}
        </Notification>
      )}
    </div>
  );
}
