import { useState, useEffect } from "react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  TextInput,
  PasswordInput,
  Select,
  Button,
  Title,
  Text,
  Paper,
  Stack,
  Overlay,
  Loader,
  Alert,
  Badge,
  Tooltip,
  Group,
  Divider,
  Anchor,
  Box,
  Progress,
} from "@mantine/core";
import {
  IconMail,
  IconLock,
  IconUser,
  IconMapPin,
  IconAlertCircle,
  IconCheck,
  IconInfoCircle,
  IconChevronDown,
} from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";
import {
  createUser,
  GetAllWoredas,
  getAllSubcity,
} from "../../services/api/main";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Replace with your actual image path
import signupImage from "../../assets/BoleLogo.png";

const signupSchema = yup.object().shape({


  name: yup.string().required("Name is required").min(2, "Name is too short"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
  woreda_id: yup.string().required("Woreda is required").nullable(),
  subcity_id: yup.string().required("Subcity is required").nullable(),
});

const passwordRequirements = [
  { re: /[0-9]/, label: "Includes number" },
  { re: /[a-z]/, label: "Includes lowercase letter" },
  { re: /[A-Z]/, label: "Includes uppercase letter" },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: "Includes special symbol" },
];

export default function SignUpPage() {
  // const BASE_URL = `${import.meta.env.VITE_FILE_API}`;
   const API_URL =`${import.meta.env.VITE_FILE_API}/api/`
  const { t } = useTranslation();
  const [signupError, setSignupError] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);
  const [success, setSuccess] = useState(false);
  const [woredas, setWoredas] = useState([]);
  const [subcities, setSubcities] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordChecks, setPasswordChecks] = useState(
    passwordRequirements.map(() => false)
  );
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      woreda_id: null,
      subcity_id: null,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setFetchingData(true);
      try {
        const [woredasResponse, subcitiesResponse] = await Promise.all([
          GetAllWoredas(),
          getAllSubcity(),
        ]);

        // Format woredas data
        const formattedWoredas = woredasResponse.map((woreda) => ({
          value: woreda.id.toString(),
          label: woreda.name?.en || `Woreda ${woreda.id}`,
          subcity_id: woreda.subcity_id?.toString(),
        }));

        // Format subcities data
        const formattedSubcities = subcitiesResponse.map((subcity) => {
          let nameObj;
          try {
            nameObj =
              typeof subcity.name === "string"
                ? JSON.parse(subcity.name)
                : subcity.name || {};
          } catch (e) {
            console.error("Error parsing subcity name:", e);
            nameObj = { en: `Subcity ${subcity.id}` };
          }
          return {
            value: subcity.id.toString(),
            label: nameObj.en || `Subcity ${subcity.id}`,
            description: subcity.description,
          };
        });

        setWoredas(formattedWoredas);
        setSubcities(formattedSubcities);
      } catch (err) {
        console.error("Error fetching location data:", err);
        setSignupError(
          err instanceof Error ? err.message : "Failed to fetch location data"
        );
        showNotification({
          title: "Data Loading Error",
          message: "Failed to load location data. Please try again.",
          color: "red",
          icon: <IconAlertCircle size={18} />,
        });
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, []);

  // Filter woredas based on selected subcity
  const filteredWoredas = watch("subcity_id")
    ? woredas.filter((woreda) => woreda.subcity_id === watch("subcity_id"))
    : [];

  useEffect(() => {
    const password = watch("password") || "";
    const checks = passwordRequirements.map((requirement) =>
      requirement.re.test(password)
    );
    setPasswordChecks(checks);

    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  }, [watch("password")]);

  const mutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await fetch(`${API_URL}users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: credentials.name,
          email: credentials.email,
          password: credentials.password,
          role_id: 7,
          woreda_id: parseInt(credentials.woreda_id),
          subcity_id: parseInt(credentials.subcity_id),
          is_self_registered: true
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }

      return response.json();
    },
    onMutate: () => {
      setSignupError(null);
    },
    onError: (error) => {
      console.error("Signup error:", error);
      const errorMessage = error.message || "Failed to sign up. Please try again.";
      setSignupError(errorMessage);
      showNotification({
        title: "Signup Failed",
        message: errorMessage,
        color: "red",
        icon: <IconAlertCircle size={18} />,
      });
    },
    onSuccess: (data) => {
      setSuccess(true);
      showNotification({
        title: "Signup Successful",
        message: "Your account has been created!",
        color: "green",
        icon: <IconCheck size={18} />,
      });
      setTimeout(() => navigate("/auth/login"), 3000);
    },
  });

  const onSubmit = (credentials) => {
    if (!credentials.woreda_id) {
      setError("woreda_id", { type: "manual", message: "Woreda is required" });
      return;
    }

    if (!credentials.subcity_id) {
      setError("subcity_id", { type: "manual", message: "Subcity is required" });
      return;
    }

    mutation.mutate(credentials);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 1:
        return "red";
      case 2:
        return "orange";
      case 3:
        return "yellow";
      case 4:
        return "teal";
      default:
        return "gray";
    }
  };

  // Reset woreda when subcity changes
  const handleSubcityChange = (value) => {
    setValue("subcity_id", value);
    setValue("woreda_id", "");
    clearErrors("woreda_id");
  };

  const handleWoredaChange = (value) => {
    setValue("woreda_id", value);
    clearErrors("woreda_id");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left side with image and overlay text */}
      <div className="hidden lg:block relative w-1/2">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${signupImage})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <Overlay
            gradient="linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.65) 100%)"
            opacity={0.85}
            zIndex={0}
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center h-full p-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Title order={1} className="text-5xl font-bold mb-6">
              {t("signuppage.imageSection.title")}
            </Title>
            <Text className="text-xl mb-8">
              {t("signuppage.imageSection.subtitle")}
            </Text>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-1 bg-blue-400 rounded-full"></div>
              <Text className="text-blue-200">
                {t("signuppage.imageSection.tagline")}
              </Text>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side with signup form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <Badge
              variant="gradient"
              gradient={{ from: "blue", to: "indigo" }}
              size="lg"
              mb="sm"
            >
              {t("signuppage.badge")}
            </Badge>
            <Title order={2} className="text-3xl font-bold text-gray-800 mb-2">
              {t("signuppage.title")}
            </Title>
            <Text className="text-gray-500">{t("signuppage.subtitle")}</Text>
          </motion.div>

          <Paper
            withBorder
            shadow="md"
            p={30}
            radius="lg"
            className="bg-white border-gray-200 relative"
          >
            {mutation.isPending && (
              <Overlay
                color="#fff"
                backgroundOpacity={0.6}
                blur={2}
                center
                radius="lg"
              >
                <Loader size="xl" variant="dots" />
              </Overlay>
            )}

            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6"
                >
                  <Alert
                    icon={<IconCheck size={18} />}
                    title={t("signuppage.successTitle")}
                    color="green"
                  >
                    {t("signuppage.successMessage")}
                  </Alert>
                </motion.div>
              )}

              {signupError && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6"
                >
                  <Alert
                    icon={<IconAlertCircle size={18} />}
                    title={t("signuppage.errorTitle")}
                    color="red"
                  >
                    {signupError}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing="lg">
                {/* Name Field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <TextInput
                    label={
                      <Group spacing={4}>
                        <Text>{t("signuppage.nameLabel")}</Text>
                        <Tooltip
                          label={t("signuppage.nameTooltip")}
                          withArrow
                          position="right"
                        >
                          <IconInfoCircle size={16} color="gray" />
                        </Tooltip>
                      </Group>
                    }
                    placeholder={t("signuppage.nameLabel")}
                    icon={<IconUser size={18} />}
                    {...register("name")}
                    error={errors.name?.message}
                    required
                    radius="md"
                    size="md"
                    variant="filled"
                    disabled={mutation.isPending || fetchingData}
                  />
                </motion.div>

                {/* Email Field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <TextInput
                    label={t("signuppage.emailLabel")}
                    placeholder="your.email@example.com"
                    icon={<IconMail size={18} />}
                    {...register("email")}
                    error={errors.email?.message}
                    required
                    radius="md"
                    size="md"
                    variant="filled"
                    disabled={mutation.isPending || fetchingData}
                  />
                </motion.div>

                {/* Password Field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.2 }}
                >
                  <PasswordInput
                    label={t("signuppage.passwordLabel")}
                    placeholder={t("signuppage.passwordLabel")}
                    icon={<IconLock size={18} />}
                    {...register("password")}
                    error={errors.password?.message}
                    required
                    radius="md"
                    size="md"
                    variant="filled"
                    disabled={mutation.isPending || fetchingData}
                    description={
                      <Box mt={8}>
                        <Progress
                          value={
                            passwordStrength === 0
                              ? 0
                              : passwordStrength * 25 + 10
                          }
                          color={getPasswordStrengthColor()}
                          size={4}
                          mb={8}
                        />
                        <Text size="sm" mb={4}>
                          Password strength:{" "}
                          <Text
                            span
                            weight={600}
                            color={getPasswordStrengthColor()}
                          >
                            {["Weak", "Fair", "Good", "Strong"][
                              passwordStrength - 1
                            ] || "None"}
                          </Text>
                        </Text>
                        <Box>
                          {passwordRequirements.map((requirement, index) => (
                            <Group
                              spacing={5}
                              key={index}
                              noWrap
                              mt={4}
                              align="flex-start"
                            >
                              <IconCheck
                                size={14}
                                color={
                                  passwordChecks[index]
                                    ? "green"
                                    : "gray"
                                }
                                strokeWidth={
                                  passwordChecks[index] ? 3 : 2
                                }
                              />
                              <Text
                                size="xs"
                                color={
                                  passwordChecks[index]
                                    ? "dimmed"
                                    : "gray"
                                }
                              >
                                {requirement.label}
                              </Text>
                            </Group>
                          ))}
                        </Box>
                      </Box>
                    }
                  />
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.3 }}
                >
                  <PasswordInput
                    label={t("signuppage.confirmPasswordLabel")}
                    placeholder={t("signuppage.confirmPasswordLabel")}
                    icon={<IconLock size={18} />}
                    {...register("confirmPassword")}
                    error={errors.confirmPassword?.message}
                    required
                    radius="md"
                    size="md"
                    variant="filled"
                    disabled={mutation.isPending || fetchingData}
                  />
                </motion.div>

                {/* Location Fields */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <Select
                    label={t("signuppage.subcityLabel")}
                    placeholder={t("signuppage.subcityLabel")}
                    data={subcities}
                    icon={<IconMapPin size={18} />}
                    rightSection={<IconChevronDown size={14} />}
                    {...register("subcity_id")}
                    onChange={handleSubcityChange}
                    error={errors.subcity_id?.message}
                    required
                    radius="md"
                    size="md"
                    variant="filled"
                    disabled={mutation.isPending || fetchingData}
                    nothingFound="No subcities found"
                    searchable
                    clearable
                    filter={(value, item) =>
                      item.label.toLowerCase().includes(value.toLowerCase().trim())
                    }
                  />

                  <Select
                    label={t("signuppage.woredaLabel")}
                    placeholder={
                      watch("subcity_id")
                        ? t("signuppage.selectWoreda")
                        : t("signuppage.selectSubcityFirst")
                    }
                    data={filteredWoredas}
                    icon={<IconMapPin size={18} />}
                    rightSection={<IconChevronDown size={14} />}
                    {...register("woreda_id")}
                    onChange={handleWoredaChange}
                    error={errors.woreda_id?.message}
                    required
                    radius="md"
                    size="md"
                    variant="filled"
                    disabled={
                      mutation.isPending || fetchingData || !watch("subcity_id")
                    }
                    nothingFound="No woredas found for selected subcity"
                    searchable
                    filter={(value, item) =>
                      item.label.toLowerCase().includes(value.toLowerCase().trim())
                    }
                  />
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.5 }}
                >
                  <Button
                    fullWidth
                    type="submit"
                    loading={mutation.isPending}
                    size="md"
                    radius="md"
                    className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md"
                    disabled={mutation.isPending || fetchingData}
                    uppercase
                    styles={(theme) => ({
                      root: {
                        height: 44,
                        paddingLeft: 20,
                        paddingRight: 20,
                      },
                    })}
                  >
                    {t("signuppage.submitButton")}
                  </Button>
                </motion.div>
              </Stack>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Divider
                label={t("signuppage.dividerText")}
                labelPosition="center"
                my="lg"
              />
              <Text className="text-center text-sm text-gray-500">
                {t("signuppage.alreadyHaveAccount")}{" "}
                <Anchor href="/auth/login" weight={600}>
                  {t("signuppage.loginLink")}
                </Anchor>
              </Text>
            </motion.div>
          </Paper>
        </div>
      </div>
    </div>
  );
}