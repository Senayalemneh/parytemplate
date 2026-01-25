import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Title, Button, Notification } from "@mantine/core";
import { IconArrowLeft, IconCheck, IconX } from "@tabler/icons-react";

import QuestionnaireForm from "../qa-section/questionnaire-form";
import { createQuestionnaire } from "../../services/api/main";

export default function CreateQuestionnairePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const result = await createQuestionnaire(values);
      setShowSuccess(true);
      setTimeout(() => {
        navigate(`/questionnaires/${result?.data?.data?.id}`);
      }, 1500);
    } catch (error) {
      console.error(t("createquestionnairepage.error"), error);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        leftIcon={<IconArrowLeft size="1rem" />}
        variant="outline"
        mb="md"
        onClick={() => navigate(-1)}
      >
        {t("createquestionnairepage.backButton")}
      </Button>

      <Title order={1} mb="md">
        {t("createquestionnairepage.title")}
      </Title>

      <QuestionnaireForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />

      {showSuccess && (
        <Notification
          icon={<IconCheck size="1.1rem" />}
          color="teal"
          title={t("createquestionnairepage.success")}
          onClose={() => setShowSuccess(false)}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          {t("createquestionnairepage.success")}
        </Notification>
      )}

      {showError && (
        <Notification
          icon={<IconX size="1.1rem" />}
          color="red"
          title={t("createquestionnairepage.error")}
          onClose={() => setShowError(false)}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          {t("createquestionnairepage.error")}
        </Notification>
      )}
    </div>
  );
}
