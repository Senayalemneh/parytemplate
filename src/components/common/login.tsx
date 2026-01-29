


import { useState } from "react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import {
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Paper,
  Stack,
  Overlay,
  Loader,
  Alert,
} from "@mantine/core";
import {
  IconMail,
  IconLock,
  IconShieldLock,
  IconAlertCircle,
} from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";
import { login, userDetail } from "../../services/api/main";
import { ROLE_ENUM } from "../../enums/main";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../context/session-provider";
import { PERMISSIONS } from "../../enums/permissions";

// Replace with your actual image path
import loginImage from "../../assets/BoleLogo.png";

const loginSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

// Define permission sets for each admin type
// Permission sets for each admin type
const ADMIN_PERMISSION_SETS = {
  SUPER_ADMIN: [
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.VIEW_ROLES,
    PERMISSIONS.MANAGE_PERMISSIONS,
    PERMISSIONS.VIEW_PERMISSIONS,
    PERMISSIONS.MANAGE_ROLE_PERMISSIONS,
    PERMISSIONS.VIEW_ROLE_PERMISSIONS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_SUBCITIES,
    PERMISSIONS.VIEW_SUBCITIES,
    PERMISSIONS.MANAGE_WOREDAS,
    PERMISSIONS.VIEW_WOREDAS,
    PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
    PERMISSIONS.MANAGE_AUDIT_LOGS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.BYPASS_PERMISSIONS,
    PERMISSIONS.ACCESS_ADMIN_DASHBOARD,
  ],
  SUBCITY_ADMIN: [
    PERMISSIONS.MANAGE_WOREDAS,
    PERMISSIONS.VIEW_WOREDAS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_NEWS,
    PERMISSIONS.VIEW_NEWS,
    PERMISSIONS.MANAGE_NEWS_MEDIA,
    PERMISSIONS.VIEW_NEWS_MEDIA,
    PERMISSIONS.MANAGE_NEWS_CATEGORIES,
    PERMISSIONS.VIEW_NEWS_CATEGORIES,
    PERMISSIONS.VIEW_NEWS_ANALYTICS,
    PERMISSIONS.MANAGE_GALLERIES,
    PERMISSIONS.VIEW_GALLERIES,
    PERMISSIONS.MANAGE_GALLERY_MEDIA,
    PERMISSIONS.VIEW_GALLERY_MEDIA,
    PERMISSIONS.MANAGE_BOOKS,
    PERMISSIONS.VIEW_BOOKS,
    PERMISSIONS.MANAGE_BOOK_CATEGORIES,
    PERMISSIONS.VIEW_BOOK_CATEGORIES,
    PERMISSIONS.MANAGE_COMPLAINTS,
    PERMISSIONS.VIEW_COMPLAINTS,
    PERMISSIONS.MANAGE_COMPLAINT_ATTACHMENTS,
    PERMISSIONS.VIEW_COMPLAINT_ATTACHMENTS,
    PERMISSIONS.MANAGE_COMPLAINT_NOTES,
    PERMISSIONS.VIEW_COMPLAINT_NOTES,
    PERMISSIONS.MANAGE_DOCUMENTS,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.MANAGE_DOCUMENT_SHARES,
    PERMISSIONS.VIEW_DOCUMENT_SHARES,
    PERMISSIONS.MANAGE_COMMITTEES,
    PERMISSIONS.VIEW_COMMITTEES,
    PERMISSIONS.MANAGE_LEADERS,
    PERMISSIONS.VIEW_LEADERS,
    PERMISSIONS.ACCESS_ADMIN_DASHBOARD,
  ],
  WOREDA_ADMIN: [
    PERMISSIONS.VIEW_WOREDAS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_DOCUMENTS,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.MANAGE_DOCUMENT_SHARES,
    PERMISSIONS.VIEW_DOCUMENT_SHARES,
    PERMISSIONS.MANAGE_COMPLAINTS,
    PERMISSIONS.VIEW_COMPLAINTS,
    PERMISSIONS.MANAGE_COMPLAINT_ATTACHMENTS,
    PERMISSIONS.VIEW_COMPLAINT_ATTACHMENTS,
    PERMISSIONS.VIEW_NEWS,
    PERMISSIONS.VIEW_GALLERIES,
    PERMISSIONS.VIEW_BOOKS,
    PERMISSIONS.MANAGE_SUGGESTIONS,
    PERMISSIONS.VIEW_SUGGESTIONS,
    PERMISSIONS.MANAGE_SUGGESTION_ATTACHMENTS,
    PERMISSIONS.VIEW_SUGGESTION_ATTACHMENTS,
    PERMISSIONS.ACCESS_ADMIN_DASHBOARD,
  ],
  OFFICIAL_ADMIN: [
    PERMISSIONS.MANAGE_FOLDERS,
    PERMISSIONS.VIEW_FOLDERS,
    PERMISSIONS.MANAGE_FOLDER_SHARES,
    PERMISSIONS.VIEW_FOLDER_SHARES,
    PERMISSIONS.MANAGE_DOCUMENTS,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.MANAGE_DOCUMENT_SHARES,
    PERMISSIONS.VIEW_DOCUMENT_SHARES,
    PERMISSIONS.MANAGE_VIDEO_CONFERENCES,
    PERMISSIONS.VIEW_VIDEO_CONFERENCES,
    PERMISSIONS.MANAGE_CONFERENCE_PARTICIPANTS,
    PERMISSIONS.VIEW_CONFERENCE_PARTICIPANTS,
    PERMISSIONS.MANAGE_CHAT_ROOMS,
    PERMISSIONS.VIEW_CHAT_ROOMS,
    PERMISSIONS.MANAGE_CHAT_MESSAGES,
    PERMISSIONS.VIEW_CHAT_MESSAGES,
    PERMISSIONS.MANAGE_CHAT_MESSAGE_ATTACHMENTS,
    PERMISSIONS.VIEW_CHAT_MESSAGE_ATTACHMENTS,
    PERMISSIONS.VIEW_NEWS,
    PERMISSIONS.VIEW_GALLERIES,
    PERMISSIONS.VIEW_BOOKS,
    PERMISSIONS.ACCESS_ADMIN_DASHBOARD,
  ],
};

export default function LoginPage() {
  const [loginError, setLoginError] = useState(null);
  const navigate = useNavigate();
  const { setSession } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: (credentials) => login(credentials),

    onMutate: () => setLoginError(null),

    onError: (error: any) => {
      console.error("Login error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to login. Please try again.";

      setLoginError(errorMessage);

      showNotification({
        title: "Login Failed",
        message: errorMessage,
        color: "red",
        icon: <IconAlertCircle size={18} />,
      });
    },

    onSuccess: (data) => {
      if (data?.code) {
        const errorMessage = data?.message || "Invalid credentials";
        setLoginError(errorMessage);
        return showNotification({
          title: "Login Failed",
          message: errorMessage,
          color: "red",
          icon: <IconAlertCircle size={18} />,
        });
      }

      try {
        // handleLoginSuccess now gets full user data + login info
        handleLoginSuccess(data);

        showNotification({
          title: "Login Successful",
          message: `Welcome back, ${user.name || "User"}!`,
          color: "green",
        });
      } catch (error) {
        console.error("Login processing error:", error);
        setLoginError("Error processing your login. Please try again.");
        showNotification({
          title: "Login Error",
          message: "Error processing your login",
          color: "red",
          icon: <IconAlertCircle size={18} />,
        });
      }
    },
  });


  const onSubmit = (credentials) => {
    mutation.mutate(credentials);
  };

  const handleLoginSuccess = (response) => {
    try {
      console.log("Full login response:", response);

      if (!response) {
        throw new Error("Invalid server response: missing data");
      }

      // Extract data from the nested structure
      const { user } = response;
      console.log(user)
      let { role, woreda, subcity } = user;
      if (!role) {
        role = { id: "addfdsf", "name": "dfadsfa" }
      }
      const permissions = response?.data?.permissions || ["manage_roles",
        "view_roles",
        "manage_permissions",
        "view_permissions",
        "manage_role_permissions",
        "view_role_permissions",
        "manage_subcities",
        "view_subcities",
        "manage_woredas",
        "view_woredas",
        "manage_users",
        "view_users",
        "manage_folders",
        "view_folders",
        "manage_folder_shares",
        "view_folder_shares",
        "manage_documents",
        "view_documents",
        "manage_document_metadata",
        "view_document_metadata",
        "manage_document_shares",
        "view_document_shares",
        "manage_news_categories",
        "view_news_categories",
        "manage_news",
        "view_news",
        "manage_news_media",
        "view_news_media",
        "view_news_analytics",
        "manage_galleries",
        "view_galleries",
        "manage_gallery_media",
        "view_gallery_media",
        "manage_book_categories",
        "view_book_categories",
        "manage_books",
        "view_books",
        "manage_committees",
        "view_committees",
        "manage_complaints",
        "view_complaints",
        "manage_complaint_attachments",
        "view_complaint_attachments",
        "manage_complaint_notes",
        "view_complaint_notes",
        "manage_leaders",
        "view_leaders",
        "manage_suggestions",
        "view_suggestions",
        "manage_suggestion_attachments",
        "view_suggestion_attachments",
        "manage_suggestion_responses",
        "view_suggestion_responses",
        "manage_video_conferences",
        "view_video_conferences",
        "manage_conference_participants",
        "view_conference_participants",
        "manage_conference_recordings",
        "view_conference_recordings",
        "manage_chat_rooms",
        "view_chat_rooms",
        "manage_chat_messages",
        "view_chat_messages",
        "manage_chat_message_attachments",
        "view_chat_message_attachments",
        "manage_audit_logs",
        "view_audit_logs",
        "access_admin_dashboard",
        "manage_system_settings",
        "bypass_permissions",
        "temp_permissions",];

      // Validate required fields
      if (!user?.id) {
        throw new Error("User data is incomplete - missing id");
      }
      if (!role?.id) {
        throw new Error("Role data is incomplete - missing id");
      }
      if (!Array.isArray(permissions)) {
        throw new Error("Permissions should be an array");
      }

      // Prepare data for storage
      const userData = {
        id: user.id,
        name: user.name || "Unknown",
        email: user.email || "",
        roleId: role?.id,
        woredaId: woreda?.id || null,
        subcityId: subcity?.id || null,
      };

      const roleData = {
        id: role.id,
        key: role.role_key || "unknown",
        name: role.name || "Unknown Role",
        description: role.description || "",
      };

      // Store data
      localStorage.setItem("currentUser", JSON.stringify(userData));
      localStorage.setItem("currentRole", JSON.stringify(roleData));

      if (woreda && subcity) {
        localStorage.setItem(
          "currentLocation",
          JSON.stringify({
            woreda: {
              id: woreda.id,
              name: woreda.name || {},
              description: woreda.description || "",
            },
            subcity: {
              id: subcity.id,
              name: subcity.name || {},
              description: subcity.description || "",
            },
          })
        );
      }

      // Store permissions
      localStorage.setItem("userPermissions", JSON.stringify(permissions));

      // Set session
      setSession({
        user: userData,
        role: roleData,
        permissions: permissions.map((p) => p.key),
        isAuthenticated: true,
      });

      // Route user based on permissions and role
      routeUser(permissions, role.role_key || "");
    } catch (error) {
      console.error("Login processing failed:", error);
      // Clear any partial data
      localStorage.removeItem("currentUser");
      localStorage.removeItem("currentRole");
      localStorage.removeItem("currentLocation");
      localStorage.removeItem("userPermissions");

      throw error;
    }
  };

  const hasAnyPermission = (userPermissions, requiredPermissions) => {
    return requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    );
  };

  const routeUser = (permissions = [], roleKey = "") => {
    const permissionKeys = permissions.map((p) => p?.key).filter(Boolean);

    // Helper function to check if user has all critical permissions for a role
    const hasAdminPermissions = (requiredPermissions) => {
      const criticalPermissions = requiredPermissions.filter(
        (p) => p.includes("manage_") || p === PERMISSIONS.BYPASS_PERMISSIONS
      );
      return criticalPermissions.some((p) => permissionKeys.includes(p));
    };

    return navigate("/dashboard/my-dashboard");

  };

  return (
    <div className="min-h-screen flex">
      {/* Left side with image and overlay text */}
      <div className="hidden lg:block relative w-1/2">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${loginImage})`,
            backgroundPosition: "center",
          }}
        >
          <Overlay
            gradient="linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.65) 100%)"
            opacity={0.75}
            zIndex={0}
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center h-full p-16 text-white">
          <Title order={1} className="text-5xl font-bold mb-6">
            Welcome Back!
          </Title>
          <Text className="text-xl mb-8">
            Welcome to Bole Subcity Prosperity Party System!
          </Text>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-1 bg-blue-400 rounded-full"></div>
            <Text className="text-blue-200">Prosperity Party</Text>
          </div>
        </div>
      </div>

      {/* Right side with login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <IconShieldLock size={48} className="text-blue-600 mb-4 mx-auto" />
            <Title order={2} className="text-3xl font-bold text-gray-800 mb-2">
              Sign in to your account
            </Title>
            <Text className="text-gray-500">
              Enter your credentials to access the dashboard
            </Text>
          </div>

          <Paper
            withBorder
            shadow="sm"
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

            {loginError && (
              <Alert
                icon={<IconAlertCircle size={18} />}
                title="Error"
                color="red"
                mb="md"
              >
                {loginError}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing="lg">
                <TextInput
                  label="Email"
                  placeholder="your.email@example.com"
                  icon={<IconMail size={18} />}
                  {...register("email")}
                  error={errors.email?.message}
                  required
                  radius="md"
                  size="md"
                  variant="filled"
                  disabled={mutation.isPending}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  icon={<IconLock size={18} />}
                  {...register("password")}
                  error={errors.password?.message}
                  required
                  radius="md"
                  size="md"
                  variant="filled"
                  disabled={mutation.isPending}
                />

                <Button
                  fullWidth
                  type="submit"
                  loading={mutation.isPending}
                  size="md"
                  radius="md"
                  className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md"
                  disabled={mutation.isPending}
                >
                  Sign in
                </Button>
              </Stack>
            </form>

            <Text className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <a
                href="#"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Contact administrator
              </a>
            </Text>
          </Paper>
        </div>
      </div>
    </div>
  );
}