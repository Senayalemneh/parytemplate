import React, { useEffect, useState } from "react";
import {
  Container,
  Title,
  Card,
  SimpleGrid,
  Text,
  Badge,
  Loader,
  Stack,
  Box,
  Grid,
  Group,
  useMantineTheme,
  Divider,
  Button,
  Modal,
  TextInput,
  Select,
  Notification,
  Image,
  ActionIcon,
} from "@mantine/core";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import logo from "../../assets/BoleLogo.png";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  getAllExhibitions,
  verifyVisitor,
  registerVisitor,
} from "../../services/api/main";
import {
  IconCheck,
  IconX,
  IconPhoto,
  IconLogout,
  IconArrowLeft,
  IconUserPlus,
} from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

interface Exhibition {
  id: number;
  title: string;
  description: string;
  image_path: string | null;
  image_paths: string[] | null;
  view_count: string;
  created_at: string;
}

interface VisitorData {
  full_name: string;
  phone_number: string;
  exhibition_id: string;
  timestamp: number;
  visitor_id?: number;
  exhibition?: Exhibition;
}

const subCities = [
  { value: "Addis Ketema", label: "Addis Ketema" },
  { value: "Akaky Kaliti", label: "Akaky Kaliti" },
  { value: "Arada", label: "Arada" },
  { value: "Bole", label: "Bole" },
  { value: "Gullele", label: "Gullele" },
  { value: "Kirkos", label: "Kirkos" },
  { value: "Kolfe Keranio", label: "Kolfe Keranio" },
  { value: "Lideta", label: "Lideta" },
  { value: "Nifas Silk-Lafto", label: "Nifas Silk-Lafto" },
  { value: "Yeka", label: "Yeka" },
  { value: "Lemi Kura", label: "Lemi Kura" },
];

const woredas = Array.from({ length: 20 }, (_, i) => ({
  value: (i + 1).toString().padStart(2, "0"),
  label: (i + 1).toString().padStart(2, "0"),
}));

const genders = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

export default function ExhibitionsPage() {
  const { t } = useTranslation();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessGranted, setAccessGranted] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [currentExhibition, setCurrentExhibition] = useState<Exhibition | null>(
    null
  );
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null);
  const theme = useMantineTheme();

  const checkLocalStorageExpiry = () => {
    const verifiedVisitor = localStorage.getItem("verifiedVisitor");
    if (!verifiedVisitor) return false;

    const visitorData = JSON.parse(verifiedVisitor);
    if (!visitorData.timestamp) return false;

    const now = new Date().getTime();
    const thirtyMinutes = 30 * 60 * 1000;
    return now - visitorData.timestamp < thirtyMinutes;
  };

  const registrationForm = useForm({
    initialValues: {
      full_name: "",
      gender: "Male",
      phone_number: "",
      sub_city: "",
      woreda: "",
      exhibition_id: "",
    },
    validate: {
      full_name: (value) =>
        value.trim().length < 2
          ? t("exhibitioncontrol.form.name_too_short")
          : null,
      phone_number: (value) =>
        /^[0-9]{10}$/.test(value)
          ? null
          : t("exhibitioncontrol.form.invalid_phone"),
      sub_city: (value) =>
        value ? null : t("exhibitioncontrol.form.select_sub_city"),
      woreda: (value) =>
        value ? null : t("exhibitioncontrol.form.select_woreda"),
      exhibition_id: (value) =>
        value ? null : t("exhibitioncontrol.form.select_exhibition"),
    },
  });

  const verificationForm = useForm({
    initialValues: {
      full_name: "",
      phone_number: "",
      exhibition_id: "",
    },
    validate: {
      full_name: (value) =>
        value.trim().length < 2
          ? t("exhibitioncontrol.form.name_too_short")
          : null,
      phone_number: (value) =>
        /^[0-9]{10}$/.test(value)
          ? null
          : t("exhibitioncontrol.form.invalid_phone"),
      exhibition_id: (value) =>
        value ? null : t("exhibitioncontrol.form.select_exhibition"),
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("verifiedVisitor");
    setAccessGranted(false);
    setVisitorData(null);
    setCurrentExhibition(null);
    setShowVerification(true);
  };

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const data = await getAllExhibitions();
        const sortedExhibitions = [...data].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setExhibitions(sortedExhibitions);

        const verifiedVisitor = localStorage.getItem("verifiedVisitor");
        if (verifiedVisitor && checkLocalStorageExpiry()) {
          const visitorData = JSON.parse(verifiedVisitor);
          setVisitorData(visitorData);
          setAccessGranted(true);

          const exhibition = sortedExhibitions.find(
            (ex) => ex.id.toString() === visitorData.exhibition_id
          );

          setCurrentExhibition(visitorData.exhibition || exhibition || null);
        } else if (sortedExhibitions.length > 0) {
          registrationForm.setFieldValue(
            "exhibition_id",
            sortedExhibitions[0].id.toString()
          );
          verificationForm.setFieldValue(
            "exhibition_id",
            sortedExhibitions[0].id.toString()
          );
        }
      } catch (err) {
        setError(t("exhibitioncontrol.error.load_exhibitions"));
      } finally {
        setLoading(false);
      }
    };

    const verifiedVisitor = localStorage.getItem("verifiedVisitor");
    if (verifiedVisitor && checkLocalStorageExpiry()) {
      const visitorData = JSON.parse(verifiedVisitor);
      setVisitorData(visitorData);
      setAccessGranted(true);

      if (visitorData.exhibition) {
        setCurrentExhibition(visitorData.exhibition);
      }
    }

    fetchExhibitions();
  }, []);

  const handleVerifyVisitor = async (values: typeof verificationForm.values) => {
    try {
      const payload = {
        full_name: values.full_name,
        phone_number: values.phone_number,
        exhibition_id: parseInt(values.exhibition_id),
      };
      const response = await verifyVisitor(payload);
      
      // Fixed: response contains visitor data directly, not nested under 'visitor'
      if (response && response.id) {
        const visitorData = {
          full_name: values.full_name,
          phone_number: values.phone_number,
          exhibition_id: values.exhibition_id,
          timestamp: new Date().getTime(),
          visitor_id: response.id, // Changed from response.visitor.id
          exhibition: response.exhibition, // Changed from response.exhibition
        };
        localStorage.setItem("verifiedVisitor", JSON.stringify(visitorData));
        setVisitorData(visitorData);
        setCurrentExhibition(response.exhibition);
        setAccessGranted(true);
        setShowVerification(false);
        setVerificationError(null);
      } else {
        setVerificationError(t("exhibitioncontrol.error.visitor_not_found"));
      }
    } catch (err) {
      setVerificationError(t("exhibitioncontrol.error.verify_failed"));
    }
  };

  const handleRegisterVisitor = async (values: typeof registrationForm.values) => {
    try {
      const payload = {
        full_name: values.full_name,
        gender: values.gender,
        phone_number: values.phone_number,
        sub_city: values.sub_city,
        woreda: values.woreda,
        exhibition_id: parseInt(values.exhibition_id),
      };
      const response = await registerVisitor(payload);
      setRegistrationSuccess(true);
      registrationForm.reset();
      const registeredExhibition = exhibitions.find(
        (ex) => ex.id.toString() === values.exhibition_id
      );
      const visitorData = {
        full_name: values.full_name,
        phone_number: values.phone_number,
        exhibition_id: values.exhibition_id,
        timestamp: new Date().getTime(),
        visitor_id: response.id, // Changed from response.visitor.id
        exhibition: response.exhibition || registeredExhibition || null, // Changed to response.exhibition
      };
      localStorage.setItem("verifiedVisitor", JSON.stringify(visitorData));
      setVisitorData(visitorData);
      setCurrentExhibition(response.exhibition || registeredExhibition || null);
      setTimeout(() => {
        setShowRegistration(false);
        setAccessGranted(true);
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          t("exhibitioncontrol.error.register_failed")
      );
    }
  };

  const handleViewDetails = (exhibitionId: number) => {
    console.log(`User viewed exhibition with ID: ${exhibitionId}`);
  };

  const handleImageViewed = (exhibitionId: number, imagePath: string) => {
    setSelectedImage(
      `${import.meta.env.VITE_FILE_API}${imagePath}`
    );
    setShowImageModal(true);
    console.log(
      `User viewed image ${imagePath} from exhibition ${exhibitionId}`
    );
  };

  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-blue-100 opacity-20"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, Math.random() * 100 - 50],
                x: [0, Math.random() * 100 - 50],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 py-12">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-12"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-500 rounded-2xl blur-md opacity-20 animate-pulse"></div>
              <Card
                padding="lg"
                className="relative bg-white bg-opacity-90 backdrop-blur-sm border border-blue-200 border-opacity-50 rounded-2xl shadow-xl"
              >
                <Image
                  src={logo || "https://via.placeholder.com/40"}
                  alt="Logo"
                  width={400}
                  height={400}
                  fit="contain"
                  className="transition-all duration-500 hover:scale-105"
                />
              </Card>
            </div>
          </motion.div>

          {/* Welcome Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-600">
                እንኳን ደህና መጡ!
              </span>
            </h1>
            <div className="space-y-4 max-w-3xl mx-auto">
              <p className="text-xl md:text-2xl text-gray-600 font-medium">
                ቦሌ ክፍለ ከተማ ብልጽግና ፓርቲ ቅርንጫፍ ጽ/ቤት
              </p>
              <p className="text-xl md:text-2xl text-gray-600 font-medium">
                የፎቶ አውደ ርእይ
              </p>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="max-w-2xl mx-auto text-center mb-16"
          >
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              ወደ ፎቶ አውደርእዩ ለመግባት አዲስ ይመዝገቡ የሚለውን ይጫኑ ከዚህ በፊት የተመዘገቡ ተጠቃሚ ከሆኑ የተመለሰ ጎብኝ የሚለዉን ይጫኑ
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="flex flex-col sm:flex-row justify-center gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Button
                size="xl"
                onClick={() => setShowVerification(true)}
                variant="gradient"
                gradient={{ from: "blue", to: "cyan" }}
                className="h-16 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
                rightIcon={<IconArrowLeft size={24} />}
              >
                <span className="text-lg font-semibold">
                  {t("exhibitioncontrol.button.returning_visitor")}
                </span>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Button
                size="xl"
                onClick={() => setShowRegistration(true)}
                variant="gradient"
                gradient={{ from: "teal", to: "green" }}
                className="h-16 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
                rightIcon={<IconUserPlus size={24} />}
              >
                <span className="text-lg font-semibold">
                  {t("exhibitioncontrol.button.register_new")}
                </span>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Verification Modal */}
        <Modal
          opened={showVerification}
          onClose={() => {
            setShowVerification(false);
            setVerificationError(null);
          }}
          title={
            <div className="text-xl font-bold text-blue-600">
              {t("exhibitioncontrol.title.verify_visitor")}
            </div>
          }
          size="lg"
          overlayProps={{
            blur: 8,
            opacity: 0.7,
            color: theme.colorScheme === "dark" ? theme.colors.dark[9] : theme.colors.gray[2],
          }}
          transitionProps={{
            transition: "slide-down",
            duration: 300,
          }}
          className="rounded-2xl overflow-hidden shadow-2xl"
          centered
        >
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-teal-500"></div>
            <form
              onSubmit={verificationForm.onSubmit(handleVerifyVisitor)}
              className="space-y-6 p-6"
            >
              <TextInput
                label={
                  <span className="text-gray-700 font-medium">
                    {t("exhibitioncontrol.form.full_name")}
                  </span>
                }
                placeholder={t("exhibitioncontrol.form.placeholder_name")}
                {...verificationForm.getInputProps("full_name")}
                size="lg"
                variant="filled"
                radius="md"
                className="mt-4"
                required
              />

              <TextInput
                label={
                  <span className="text-gray-700 font-medium">
                    {t("exhibitioncontrol.form.phone_number")}
                  </span>
                }
                placeholder={t("exhibitioncontrol.form.placeholder_phone")}
                {...verificationForm.getInputProps("phone_number")}
                size="lg"
                variant="filled"
                radius="md"
                required
              />

              <Select
                label={
                  <span className="text-gray-700 font-medium">
                    {t("exhibitioncontrol.form.exhibition")}
                  </span>
                }
                placeholder={t("exhibitioncontrol.form.placeholder_exhibition")}
                data={exhibitions.map((ex) => ({
                  value: ex.id.toString(),
                  label: ex.title,
                }))}
                {...verificationForm.getInputProps("exhibition_id")}
                size="lg"
                variant="filled"
                radius="md"
                required
              />

              {verificationError && (
                <Notification
                  icon={<IconX size="1.1rem" />}
                  color="red"
                  onClose={() => setVerificationError(null)}
                  className="mt-4"
                  withBorder
                >
                  {verificationError}
                  <Button
                    variant="subtle"
                    size="xs"
                    mt="sm"
                    onClick={() => {
                      setShowVerification(false);
                      setShowRegistration(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {t("exhibitioncontrol.button.register_instead")}
                  </Button>
                </Notification>
              )}

              <Button
                type="submit"
                fullWidth
                size="xl"
                className="mt-6 h-14 rounded-lg"
                variant="gradient"
                gradient={{ from: "blue", to: "cyan" }}
                rightIcon={<IconCheck size={24} />}
              >
                <span className="font-semibold">
                  {t("exhibitioncontrol.button.verify")}
                </span>
              </Button>
            </form>
          </div>
        </Modal>

        {/* Registration Modal */}
        <Modal
          opened={showRegistration}
          onClose={() => setShowRegistration(false)}
          title={
            <div className="text-xl font-bold text-teal-600">
              {t("exhibitioncontrol.title.register_visitor")}
            </div>
          }
          size="lg"
          overlayProps={{
            blur: 8,
            opacity: 0.7,
            color: theme.colorScheme === "dark" ? theme.colors.dark[9] : theme.colors.gray[2],
          }}
          transitionProps={{
            transition: "slide-up",
            duration: 300,
          }}
          className="rounded-2xl overflow-hidden shadow-2xl"
          centered
        >
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-green-500"></div>
            <form
              onSubmit={registrationForm.onSubmit(handleRegisterVisitor)}
              className="space-y-6 p-6"
            >
              <TextInput
                label={
                  <span className="text-gray-700 font-medium">
                    {t("exhibitioncontrol.form.full_name")}
                  </span>
                }
                placeholder={t("exhibitioncontrol.form.placeholder_name")}
                {...registrationForm.getInputProps("full_name")}
                size="lg"
                variant="filled"
                radius="md"
                className="mt-4"
                required
              />

              <Select
                label={
                  <span className="text-gray-700 font-medium">
                    {t("exhibitioncontrol.form.gender")}
                  </span>
                }
                placeholder={t("exhibitioncontrol.form.placeholder_gender")}
                data={genders}
                {...registrationForm.getInputProps("gender")}
                size="lg"
                variant="filled"
                radius="md"
                required
              />

              <TextInput
                label={
                  <span className="text-gray-700 font-medium">
                    {t("exhibitioncontrol.form.phone_number")}
                  </span>
                }
                placeholder={t("exhibitioncontrol.form.placeholder_phone")}
                {...registrationForm.getInputProps("phone_number")}
                size="lg"
                variant="filled"
                radius="md"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label={
                    <span className="text-gray-700 font-medium">
                      {t("exhibitioncontrol.form.sub_city")}
                    </span>
                  }
                  placeholder={t("exhibitioncontrol.form.placeholder_sub_city")}
                  data={subCities}
                  {...registrationForm.getInputProps("sub_city")}
                  size="lg"
                  variant="filled"
                  radius="md"
                  required
                />
                <Select
                  label={
                    <span className="text-gray-700 font-medium">
                      {t("exhibitioncontrol.form.woreda")}
                    </span>
                  }
                  placeholder={t("exhibitioncontrol.form.placeholder_woreda")}
                  data={woredas}
                  {...registrationForm.getInputProps("woreda")}
                  size="lg"
                  variant="filled"
                  radius="md"
                  required
                />
              </div>

              <Select
                label={
                  <span className="text-gray-700 font-medium">
                    {t("exhibitioncontrol.form.exhibition")}
                  </span>
                }
                placeholder={t("exhibitioncontrol.form.placeholder_exhibition")}
                data={exhibitions.map((ex) => ({
                  value: ex.id.toString(),
                  label: ex.title,
                }))}
                {...registrationForm.getInputProps("exhibition_id")}
                size="lg"
                variant="filled"
                radius="md"
                required
              />

              {registrationSuccess && (
                <Notification
                  icon={<IconCheck size="1.1rem" />}
                  color="teal"
                  onClose={() => setRegistrationSuccess(false)}
                  className="mt-4"
                  withBorder
                >
                  {t("exhibitioncontrol.message.registration_success")}
                </Notification>
              )}

              {error && (
                <Notification
                  icon={<IconX size="1.1rem" />}
                  color="red"
                  onClose={() => setError(null)}
                  className="mt-4"
                  withBorder
                >
                  {error}
                </Notification>
              )}

              <Button
                type="submit"
                fullWidth
                size="xl"
                className="mt-6 h-14 rounded-lg"
                variant="gradient"
                gradient={{ from: "teal", to: "green" }}
                rightIcon={<IconUserPlus size={24} />}
              >
                <span className="font-semibold">
                  {t("exhibitioncontrol.button.register")}
                </span>
              </Button>
            </form>
          </div>
        </Modal>
      </div>
    );
  }

  if (loading) {
    return (
      <Container className="flex justify-center items-center h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Stack align="center" spacing="xl">
            <Loader size="xl" variant="bars" color="blue" />
            <Text size="xl" weight={600} className="text-gray-700">
              {t("exhibitioncontrol.message.loading_exhibitions")}
            </Text>
          </Stack>
        </motion.div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="flex justify-center items-center h-screen">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <Notification
            icon={<IconX size="1.5rem" />}
            color="red"
            title={t("exhibitioncontrol.error.title")}
            className="mb-6"
            withCloseButton={false}
          >
            {error}
          </Notification>
          <Button
            variant="light"
            color="red"
            size="lg"
            onClick={() => window.location.reload()}
            className="shadow-md"
          >
            {t("exhibitioncontrol.button.try_again")}
          </Button>
        </motion.div>
      </Container>
    );
  }

  const exhibitionToShow =
    currentExhibition ||
    (visitorData &&
      exhibitions.find((ex) => ex.id.toString() === visitorData.exhibition_id));

  if (!exhibitionToShow) {
    return (
      <Container size="md" className="flex justify-center items-center h-screen">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <Card
            shadow="xl"
            padding="xl"
            radius="lg"
            className="text-center bg-gradient-to-br from-blue-50 to-teal-50 border border-gray-200"
          >
            <Title order={2} className="mb-6 text-gray-800">
              {t("exhibitioncontrol.title.exhibition_not_found")}
            </Title>
            <Text size="lg" className="mb-8 text-gray-600">
              {t("exhibitioncontrol.message.exhibition_not_found")}
            </Text>
            <Button
              size="lg"
              onClick={() => {
                localStorage.removeItem("verifiedVisitor");
                setAccessGranted(false);
              }}
              variant="gradient"
              gradient={{ from: "blue", to: "teal" }}
              className="shadow-lg"
            >
              {t("exhibitioncontrol.button.register_for_exhibition")}
            </Button>
          </Card>
        </motion.div>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 ">
      {/* Floating Particles Background */}
      <div className="fixed inset-0 overflow-hidden z-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-100 opacity-10"
            style={{
              width: Math.random() * 100 + 20,
              height: Math.random() * 100 + 20,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <Container size="xl" className="relative z-10 py-12 px-4 sm:px-6">
        {/* Header Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <Text
                component="span"
                variant="gradient"
                gradient={{ from: "blue", to: "teal" }}
                size={48}
                weight={700}
                className="block"
              >
                {exhibitionToShow.title}
              </Text>
              {visitorData && (
                <Text size="md" color="dimmed" className="mt-1">
                  {t("exhibitioncontrol.message.welcome_back")}
                  {visitorData.full_name}
                </Text>
              )}
            </div>
            <Button
              variant="outline"
              color="red"
              leftIcon={<IconLogout size={18} />}
              onClick={handleLogout}
              className="shadow-sm"
            >
              {t("exhibitioncontrol.button.logout")}
            </Button>
          </div>

          <Text
            size="lg"
            className="max-w-3xl mx-auto text-center text-gray-600 leading-relaxed"
          >
            {exhibitionToShow.description}
          </Text>
        </motion.div>

        {/* Main Carousel */}
        {exhibitionToShow.image_paths && exhibitionToShow.image_paths.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-16"
          >
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              autoplay={{ delay: 5000, disableOnInteraction: true }}
              navigation
              pagination={{ clickable: true }}
              loop
              className="rounded-2xl overflow-hidden shadow-2xl border-2 border-white border-opacity-30"
            >
              {exhibitionToShow.image_paths.map((img, idx) => (
                <SwiperSlide key={idx}>
                  <div className="relative h-full w-full">
                    <Image
                      src={`${import.meta.env.VITE_FILE_API}${img}`}
                      alt={`${exhibitionToShow.title} - ${idx + 1}`}
                      className="w-full h-full object-fill"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-6">
                      <div>
                        <Text size="xl" weight={600} color="white">
                          {exhibitionToShow.title} - {idx + 1}
                        </Text>
                        {/* <Text color="white" opacity={0.8}>
                          {t("exhibitioncontrol.message.slide_count", {
                            current: idx + 1,
                            total: exhibitionToShow.image_paths?.length,
                          })}
                        </Text> */}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        )}

        {/* Gallery Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Card
            shadow="lg"
            padding="xl"
            radius="lg"
            className="bg-white bg-opacity-90 backdrop-blur-sm border border-gray-200 border-opacity-50"
          >
            {exhibitionToShow.image_paths &&
              exhibitionToShow.image_paths.length > 0 && (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <Text
                      size="xl"
                      weight={600}
                      className="text-gray-800 mb-4 sm:mb-0"
                    >
                      {t("exhibitioncontrol.title.gallery_preview")}
                    </Text>
                    <Button
                      leftIcon={<IconPhoto size={18} />}
                      onClick={() => setShowSlideshow(true)}
                      variant="gradient"
                      gradient={{ from: "purple", to: "pink" }}
                      className="shadow-md"
                    >
                      {t("exhibitioncontrol.button.start_slideshow")}
                    </Button>
                  </div>

                  <SimpleGrid
                    cols={3}
                    spacing="lg"
                    breakpoints={[
                      { maxWidth: 980, cols: 2, spacing: "md" },
                      { maxWidth: 755, cols: 1, spacing: "sm" },
                    ]}
                  >
                    {exhibitionToShow.image_paths.map((img, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md"
                        onClick={() =>
                          handleImageViewed(exhibitionToShow.id, img)
                        }
                      >
                        <div className="aspect-w-16 aspect-h-9">
                          <Image
                            src={`${import.meta.env.VITE_FILE_API}${img}`}
                            alt={`${exhibitionToShow.title} - ${idx + 1}`}
                            className="w-full h-64 object-fill transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <Text color="white" weight={600}>
                            {t("exhibitioncontrol.button.view_full_size")}
                          </Text>
                        </div>
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          {idx + 1}
                        </div>
                      </motion.div>
                    ))}
                  </SimpleGrid>
                </>
              )}
          </Card>
        </motion.div>
      </Container>

      {/* Full-screen Image Modal */}
      <Modal
        opened={showImageModal}
        onClose={() => setShowImageModal(false)}
        size="100%"
        fullScreen
        padding={0}
        withCloseButton={false}
        transitionProps={{ transition: "fade", duration: 200 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center">
          {selectedImage && (
            <Image
              src={selectedImage}
              alt="Selected exhibition image"
              className="max-w-full max-h-full object-contain"
            />
          )}
          <Button
            variant="light"
           
            className="absolute text-white top-10 right-6 z-10 bg-red-600"
            onClick={() => setShowImageModal(false)}
            leftIcon={<IconX size={20} />}
          >
            {t("exhibitioncontrol.button.close")}
          </Button>
        </div>
      </Modal>

    {/* Full-screen Slideshow Modal */}
    <Modal
      opened={showSlideshow}
      onClose={() => setShowSlideshow(false)}
      size="100%"
      fullScreen
      padding={0}
      withCloseButton={false}
      transitionProps={{ transition: 'fade', duration: 200 }}
    >
      <Box className="relative w-full h-full">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          navigation
          pagination={{ clickable: true }}
          className="h-full"
        >
          {exhibitionToShow.image_paths?.map((img, idx) => (
            <SwiperSlide key={idx}>
              <Box className="relative w-full h-full">
                <Image
                  src={`${import.meta.env.VITE_FILE_API}${img}`}
                  alt={`${exhibitionToShow.title} - ${idx + 1}`}
                  className="w-full h-full object-contain"
                />
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
        <Button
          variant="subtle"
          color="gray"
          className="absolute top-4 right-4 z-10"
          onClick={() => setShowSlideshow(false)}
          leftIcon={<IconX size={20} />}
        >
          {t("exhibitioncontrol.button.logout")}
        </Button>
      </Box>
    </Modal>
  </div>
);
}