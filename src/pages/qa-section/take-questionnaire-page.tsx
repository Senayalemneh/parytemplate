import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  Title,
  Text,
  Button,
  Stack,
  Radio,
  Checkbox,
  Textarea,
  Group,
  Badge,
  Loader,
  Progress,
  Center,
  Container,
  Space,
  Alert,
  ThemeIcon,
  Box,
  createStyles,
  rem,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClipboardOff,
  IconFlame,
  IconMoodEmpty,
} from "@tabler/icons-react";
import {
  getQuestionnaireById,
  getQuestions,
  submitAnswer,
} from "../../services/api/main";

const useStyles = createStyles((theme) => ({
  card: {
    position: "relative",
    overflow: "visible",
    padding: theme.spacing.xl,
    paddingTop: `calc(${theme.spacing.xl} * 1.5 + ${rem(10)})`,
    border: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
    transition: "box-shadow 300ms ease, transform 300ms ease",
    boxShadow: theme.shadows.sm,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
  },

  questionBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    transform: "translateY(-50%)",
    boxShadow: theme.shadows.sm,
  },

  progressLabel: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    lineHeight: 1,
    fontSize: theme.fontSizes.sm,
  },

  emptyState: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    borderRadius: theme.radius.md,
    padding: theme.spacing.xl,
    textAlign: "center",
    boxShadow: theme.shadows.xs,
  },

  optionCard: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    border: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[3]
    }`,
    transition: "all 200ms ease",
    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
      transform: "translateX(5px)",
    },
  },
}));

export default function TakeQuestionnairePage() {
  const { t } = useTranslation();
  const { classes } = useStyles();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questionnaire, setQuestionnaire] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [questionnaireData, questionsData] = await Promise.all([
          getQuestionnaireById(id!),
          getQuestions(id!),
        ]);
        setQuestionnaire(questionnaireData);
        setQuestions(questionsData.sort((a, b) => a.order - b.order));
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(t("takequestionnairepage.error.message"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, t]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmitAnswer = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    setSubmitting(true);

    try {
      const user = localStorage.getItem("currentUser");
      const parsedUser = JSON.parse(user || "{}");

      const answerPayload = {
        user_id: parsedUser?.id,
        answer_text:
          currentQuestion.question_type === "open_ended"
            ? answers[currentQuestion.id]
            : undefined,
        selected_options:
          currentQuestion.question_type === "multiple_choice"
            ? Array.isArray(answers[currentQuestion.id])
              ? answers[currentQuestion.id]
              : answers[currentQuestion.id]
              ? [answers[currentQuestion.id]]
              : []
            : undefined,
      };

      await submitAnswer(id!, currentQuestion.id, answerPayload);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate(`/questionnaires/${id}/results`);
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      setError(t("takequestionnairepage.error.submit"));
    } finally {
      setSubmitting(false);
    }
  };

  const progressValue =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  if (loading) {
    return (
      <Center style={{ height: "60vh" }}>
        <Stack align="center">
          <Loader size="xl" variant="dots" />
          <Text color="dimmed">{t("takequestionnairepage.loading")}</Text>
        </Stack>
      </Center>
    );
  }

  if (error) {
    return (
      <Container size="sm" py="xl">
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title={t("takequestionnairepage.error.title")}
          color="red"
          variant="outline"
        >
          {error}
        </Alert>
        <Space h="md" />
        <Button
          leftIcon={<IconChevronLeft size="1rem" />}
          onClick={() => navigate(-1)}
        >
          {t("takequestionnairepage.navigation.goBack")}
        </Button>
      </Container>
    );
  }

  if (!questionnaire) {
    return (
      <Container size="sm" py="xl">
        <div className={classes.emptyState}>
          <ThemeIcon
            size="xl"
            radius="xl"
            variant="gradient"
            gradient={{ from: "red", to: "orange", deg: 45 }}
            mb="md"
          >
            <IconClipboardOff size={28} />
          </ThemeIcon>
          <Title order={3} mb="sm">
            {t("takequestionnairepage.notFound.title")}
          </Title>
          <Text color="dimmed" mb="md">
            {t("takequestionnairepage.notFound.message")}
          </Text>
          <Button
            leftIcon={<IconChevronLeft size="1rem" />}
            onClick={() => navigate(-1)}
          >
            {t("takequestionnairepage.notFound.button")}
          </Button>
        </div>
      </Container>
    );
  }

  if (questions.length === 0) {
    return (
      <Container size="sm" py="xl">
        <div className={classes.emptyState}>
          <ThemeIcon
            size="xl"
            radius="xl"
            variant="gradient"
            gradient={{ from: "blue", to: "cyan", deg: 45 }}
            mb="md"
          >
            <IconMoodEmpty size={28} />
          </ThemeIcon>
          <Title order={3} mb="sm">
            {t("takequestionnairepage.noQuestions.title")}
          </Title>
          <Text color="dimmed" mb="md">
            {t("takequestionnairepage.noQuestions.message")}
          </Text>
          <Group position="center">
            <Button
              leftIcon={<IconChevronLeft size="1rem" />}
              onClick={() => navigate(-1)}
            >
              {t("takequestionnairepage.navigation.goBack")}
            </Button>
            <Button
              rightIcon={<IconFlame size="1rem" />}
              variant="light"
              onClick={() => navigate("/questionnaires")}
            >
              {t("takequestionnairepage.noQuestions.button")}
            </Button>
          </Group>
        </div>
      </Container>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const hasAnswer =
    answers[currentQuestion.id] !== undefined &&
    answers[currentQuestion.id] !== "" &&
    answers[currentQuestion.id] !== null;

  return (
    <Container size="md" py="xl">
      <Box mb="xl">
        <Group position="apart" mb="sm">
          <Title order={2} weight={600}>
            {questionnaire.title}
          </Title>
          <Badge
            variant="gradient"
            gradient={{ from: "teal", to: "blue", deg: 60 }}
            size="lg"
          >
            {t("takequestionnairepage.badges.questionCount", {
              count: questions.length,
            })}
          </Badge>
        </Group>
        <Text color="dimmed" mb="md">
          {questionnaire.description}
        </Text>

        <Progress
          value={progressValue}
          label={`${Math.round(progressValue)}%`}
          size="lg"
          radius="xl"
          striped
          animate
          mt="md"
          mb="xl"
          styles={{
            label: {
              position: "absolute",
              top: rem(-22),
              right: 0,
              color: "inherit",
            },
          }}
        />
      </Box>

      <Card className={classes.card} shadow="md" radius="lg" withBorder>
        <Badge
          className={classes.questionBadge}
          variant="gradient"
          gradient={{ from: "orange", to: "red" }}
          size="lg"
        >
          {t("takequestionnairepage.question.title", {
            number: currentQuestionIndex + 1,
          })}
        </Badge>

        <Group position="apart" mb="xl">
          <Box>
            <Badge
              color={currentQuestion.is_required ? "red" : "blue"}
              variant="light"
              mr="sm"
            >
              {currentQuestion.is_required
                ? t("takequestionnairepage.question.required")
                : t("takequestionnairepage.question.optional")}
            </Badge>
            <Badge color="teal" variant="light">
              {t("takequestionnairepage.question.points", {
                points: currentQuestion.points,
              })}
            </Badge>
          </Box>
        </Group>

        <Text size="xl" weight={500} mb="xl">
          {currentQuestion.question_text}
        </Text>

        {currentQuestion.question_type === "multiple_choice" ? (
          <Stack spacing="md" mb="xl">
            {currentQuestion.options?.map((option) => (
              <Card
                key={option.id}
                className={classes.optionCard}
                onClick={() => {
                  if (
                    currentQuestion.options?.filter((o) => o.is_correct)
                      .length > 1
                  ) {
                    const newValue = answers[currentQuestion.id]?.includes(
                      option.id
                    )
                      ? answers[currentQuestion.id].filter(
                          (id: string) => id !== option.id
                        )
                      : [...(answers[currentQuestion.id] || []), option.id];
                    handleAnswerChange(currentQuestion.id, newValue);
                  } else {
                    handleAnswerChange(currentQuestion.id, option.id);
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                {currentQuestion.options?.filter((o) => o.is_correct).length >
                1 ? (
                  <Checkbox
                    size="md"
                    label={option.option_text}
                    checked={
                      answers[currentQuestion.id]?.includes(option.id) || false
                    }
                    onChange={(e) => {
                      const newValue = e.currentTarget.checked
                        ? [...(answers[currentQuestion.id] || []), option.id]
                        : (answers[currentQuestion.id] || []).filter(
                            (id: string) => id !== option.id
                          );
                      handleAnswerChange(currentQuestion.id, newValue);
                    }}
                  />
                ) : (
                  <Radio
                    size="md"
                    label={option.option_text}
                    checked={answers[currentQuestion.id] === option.id}
                    onChange={() =>
                      handleAnswerChange(currentQuestion.id, option.id)
                    }
                  />
                )}
              </Card>
            ))}
          </Stack>
        ) : (
          <Textarea
            placeholder={t("takequestionnairepage.question.answerPlaceholder")}
            minRows={4}
            maxRows={8}
            autosize
            value={answers[currentQuestion.id] || ""}
            onChange={(e) =>
              handleAnswerChange(currentQuestion.id, e.currentTarget.value)
            }
            mb="xl"
          />
        )}

        <Group position="apart" mt="xl">
          <Button
            variant="default"
            leftIcon={<IconChevronLeft size="1rem" />}
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
          >
            {t("takequestionnairepage.navigation.previous")}
          </Button>

          <Button
            rightIcon={
              currentQuestionIndex < questions.length - 1 ? (
                <IconChevronRight size="1rem" />
              ) : (
                <IconCheck size="1rem" />
              )
            }
            onClick={handleSubmitAnswer}
            loading={submitting}
            disabled={currentQuestion.is_required && !hasAnswer}
            variant="gradient"
            gradient={{ from: "indigo", to: "cyan" }}
          >
            {currentQuestionIndex < questions.length - 1
              ? t("takequestionnairepage.navigation.next")
              : t("takequestionnairepage.navigation.complete")}
          </Button>
        </Group>
      </Card>

      <Group position="center" mt="xl">
        <Text color="dimmed" size="sm">
          {t("takequestionnairepage.question.count", {
            current: currentQuestionIndex + 1,
            total: questions.length,
          })}
        </Text>
      </Group>
    </Container>
  );
}
