// Menus.tsx

import {
  Flex,
  Drawer,
  Box,
  Burger,
  NavLink,
  rem,
  Tooltip,
  Avatar,
  Text,
  useMantineTheme,
  Button,
  Transition,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { hasAnyPermission } from "../utils/permission";
import { PERMISSIONS } from "../enums/permissions";
import {
  IconClipboardList,
  IconUserPlus,
  IconUsers,
  IconUserShare,
  IconFiles,
  IconNews,
  IconPhoto,
  IconQuestionMark,
  IconCalendarEvent,
  IconUsersGroup,
  IconUser,
  IconBuildingSkyscraper,
  IconBuildingCommunity,
  IconUsersPlus,
  IconBook,
  IconMail,
  IconAlertCircle,
  IconAlbum,
  IconChecklist,
  IconHierarchy,
  IconBulb,
  IconNotebook,
  IconFileDescription,
  IconBuildingBank,
  IconSpeakerphone,
  IconExternalLink,
  IconReportAnalytics,
  IconActivity,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { useState } from "react";

const Menus = () => {
  const { t } = useTranslation();
  const [drawerOpened, { toggle: toggleDrawer }] = useDisclosure(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const theme = useMantineTheme();

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const currentRole = JSON.parse(localStorage.getItem("currentRole") || "{}");

  const handleSmartChatClick = () => {
    if (currentUser?.id) {
      // Navigate to internal chat page with user ID
      window.location.href = `/chat?userid=${currentUser.id}`;
      // Or if you're using react-router's navigate:
      // navigate(`/chat?userid=${currentUser.id}`);
    } else {
      console.error("User ID not found in localStorage");
    }
  };

  const allMenuItems = [
    // Dashboard
    {
      label: t("Dashboard"),
      to: "/dashboard/my-dashboard",
      icon: <IconUser size={rem(18)} />,
      permission: PERMISSIONS.MANAGE_WOREDAS,
    },
    // Registration Section
    {
      label: t("Registrations"),
      icon: <IconClipboardList size={rem(18)} />,
      permission: PERMISSIONS.MANAGE_WOREDAS,
      children: [
        {
          label: t("Register Subcity"),
          to: "/register/register-subcity",
          icon: <IconBuildingSkyscraper size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_SUBCITIES,
        },
        {
          label: t("Register Woreda"),
          to: "/register/register-woreda",
          icon: <IconBuildingCommunity size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
        },
        {
          label: t("Register Users"),
          to: "/register/register-woreda-admins",
          icon: <IconUsersGroup size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
        },
      ],
    },
    // Role Management
    {
      label: t("Role Management"),
      icon: <IconUsers size={rem(18)} />,
      permission: PERMISSIONS.MANAGE_WOREDAS,
      children: [
        {
          label: t("Create Role"),
          to: "/role/create-role",
          icon: <IconUserPlus size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
        },
        {
          label: t("Assign Permission to Role"),
          to: "/role/assign-role",
          icon: <IconUserShare size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
        },
        {
          label: t("View All Permissions"),
          to: "/role/view-all-permissions",
          icon: <IconUserShare size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
        },
      ],
    },
    {
      label: t("Video Conference"),
      to: "/video-conference",
      icon: <IconFiles size={rem(18)} />,
      permission: PERMISSIONS.MANAGE_VIDEO_CONFERENCES,
    },
    {
      label: t("Smart Chat"),
      icon: (
        <Flex align="center" gap={4}>
          <IconExternalLink size={rem(14)} />
        </Flex>
      ),
      permission: PERMISSIONS.VIEW_FOLDERS,
      onClick: handleSmartChatClick,
      isExternal: true,
    },
    {
      label: t("Document Management"),
      to: "/documents",
      icon: <IconFiles size={rem(18)} />,
      permission: PERMISSIONS.MANAGE_FOLDERS,
    },
    {
      label: t("Staff Management"),
      to: "/staff-management",
      icon: <IconUsersPlus size={rem(18)} />,
      permission: PERMISSIONS.MANAGE_COMMITTEES,
    },

    {
      label: t("Question"),
      icon: <IconUsers size={rem(18)} />,
      permission: PERMISSIONS.VIEW_CHAT_MESSAGES,
      children: [
        {
          label: t("Questionnaires"),
          to: "/questionnaires",
          icon: <IconQuestionMark size={rem(18)} />,
          permission: PERMISSIONS.VIEW_CHAT_MESSAGES,
        },
        {
          label: t("All Results"),
          to: "/all-results",
          icon: <IconUsersPlus size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
        },
        {
          label: t("Trashed Files"),
          to: "/trashedquestions",
          icon: <IconUsersPlus size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
        },
      ],
    },

    {
      label: t("Tendencyy"),
      icon: <IconUsers size={rem(18)} />,
      permission: PERMISSIONS.MANAGE_FOLDERS,
      children: [
        {
          label: t("Tendency"),
          to: "/tendency",
          icon: <IconActivity size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_FOLDERS,
        },
        {
          label: t("Tendency Report"),
          to: "/tendency/report",
          icon: <IconReportAnalytics size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
        },
        {
          label: t("Trashed Files"),
          to: "/tendency/report-trashed",
          icon: <IconReportAnalytics size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
        },
      ],
    },

    {
      label: t("Family Discussion"),
      icon: <IconUsers size={rem(18)} />,
      permission: PERMISSIONS.MANAGE_ROLES,
      children: [
        {
          label: t("Family Discussion"),
          to: "/family-discussion",
          icon: <IconActivity size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_FOLDERS,
        },
        {
          label: t("Family Discussion Report"),
          to: "/family-discussion-report",
          icon: <IconActivity size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
        },
        {
          label: t("Trashed Files"),
          to: "/family-discussion-report-trashed",
          icon: <IconActivity size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
        },
      ],
    },

    {
      label: t("Content Management"),
      icon: <IconNews size={rem(18)} />,
      permission: PERMISSIONS.MANAGE_WOREDAS && PERMISSIONS.MANAGE_BOOKS,
      children: [
        {
          label: t("Exibition"),
          to: "/cms/exibitions",
          icon: <IconSpeakerphone size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
        },
        {
          label: t("Exibition Report"),
          to: "/cms/exibitionsreport",
          icon: <IconSpeakerphone size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
        },
        {
          label: t("Add News"),
          to: "/cms/add-news",
          icon: <IconSpeakerphone size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_NEWS,
        },
        {
          label: "Trashed News",
          to: "/cms/trashednews",
          icon: <IconSpeakerphone size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_NEWS,
        },
        {
          label: "Trashed Books",
          to: "/cms/trashedbooks",
          icon: <IconSpeakerphone size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_NEWS,
        },
        {
          label: t("Add News Category"),
          to: "/cms/add-news-category",
          icon: <IconSpeakerphone size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_NEWS_CATEGORIES,
        },
        {
          label: t("Add Carousel Images"),
          to: "/cms/add-carousel-images",
          icon: <IconPhoto size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_GALLERIES,
        },
        {
          label: t("Add Gallery"),
          to: "/cms/add-gallery",
          icon: <IconAlbum size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_GALLERIES,
        },
        {
          label: t("Post Video"),
          to: "/cms/post-video",
          icon: <IconSpeakerphone size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_GALLERIES,
        },
        {
          label: t("Add Books"),
          to: "/cms/add-books",
          icon: <IconBook size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_BOOKS,
        },
        {
          label: t("Add Our Partners"),
          to: "/cms/add-our-partners",
          icon: <IconBulb size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
        },
        {
          label: t("Add Head Of Government"),
          to: "/cms/add-head-of-government",
          icon: <IconBuildingBank size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
        },
        {
          label: t("Add Head Of Subcity"),
          to: "/cms/add-head-of-subcity",
          icon: <IconHierarchy size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
        },
        {
          label: t("Add Management Team"),
          to: "/cms/add-management-team",
          icon: <IconUsersGroup size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
        },

        {
          label: t("Organizational Structure"),
          icon: <IconNews size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
          children: [
            {
              label: t("Federal"),
              to: "/cms/add-organizational-structure-users",
              icon: <IconBulb size={rem(18)} />,
              permission: PERMISSIONS.MANAGE_WOREDAS,
            },
            {
              label: t("Regional"),
              to: "/cms/addorganizationalstructureregional",
              icon: <IconBulb size={rem(18)} />,
              permission: PERMISSIONS.MANAGE_WOREDAS,
            },
            {
              label: t("Subcity"),
              to: "/cms/addorganizationalstructuresubcity",
              icon: <IconBulb size={rem(18)} />,
              permission: PERMISSIONS.MANAGE_WOREDAS,
            },
            {
              label: t("District"),
              to: "/cms/addorganizationalstructuredistrict",
              icon: <IconBulb size={rem(18)} />,
              permission: PERMISSIONS.MANAGE_WOREDAS,
            },
          ],
        },
        {
          label: t("Add Woredas"),
          to: "/cms/add-woredas",
          icon: <IconChecklist size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
        },
        {
          label: t("Add Announcements"),
          to: "/cms/add-announcements",
          icon: <IconNotebook size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
        },
        {
          label: t("Add Tenders"),
          to: "/cms/add-tenders",
          icon: <IconFileDescription size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
        },
        {
          label: t("Add Events"),
          to: "/cms/add-events",
          icon: <IconCalendarEvent size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
        },
        {
          label: t("View Contacts"),
          to: "/cms/view-contacts",
          icon: <IconMail size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
        },
        {
          label: t("View Complaints"),
          to: "/cms/view-complaints",
          icon: <IconAlertCircle size={rem(18)} />,
          permission: PERMISSIONS.MANAGE_WOREDAS,
        },
      ],
    },
    {
      label: t("Profile"),
      to: "/profile/user-profile",
      icon: <IconUser size={rem(18)} />,
      permission: PERMISSIONS.VIEW_FOLDERS,
    },
  ];

  const filterMenuByPermissions = (menuItems) =>
    menuItems
      .map((menu) => {
        if (menu.children) {
          menu.children = filterMenuByPermissions(menu.children);
          return menu.children.length > 0 ? menu : null;
        }
        return hasAnyPermission([menu.permission]) ? menu : null;
      })
      .filter(Boolean);

  const menus = filterMenuByPermissions(allMenuItems);

  const renderMenuLink = (menu) => {
    if (menu.isExternal) {
      return (
        <Tooltip label={t("Opens in new window")} position="right" withArrow>
          <NavLink
            key={menu.label}
            className="hover:bg-blue-50 transition-colors duration-200 rounded-md cursor-pointer"
            label={sidebarCollapsed ? "" : menu.label}
            icon={menu.icon}
            variant="subtle"
            onClick={menu.onClick}
            styles={{
              root: {
                borderRadius: theme.radius.md,
                "&:hover": {
                  backgroundColor: theme.colors.blue[1],
                },
              },
              label: {
                fontSize: theme.fontSizes.sm,
                display: sidebarCollapsed ? "none" : "block",
              },
            }}
          />
        </Tooltip>
      );
    }

    return (
      <Link to={menu.to} key={menu.label} style={{ textDecoration: "none" }}>
        <NavLink
          className="hover:bg-blue-50 transition-colors duration-200 rounded-md"
          label={sidebarCollapsed ? "" : menu.label}
          active={location.pathname === menu.to}
          icon={menu.icon}
          variant="subtle"
          styles={{
            root: {
              borderRadius: theme.radius.md,
              "&[data-active]": {
                backgroundColor: theme.colors.blue[1],
                color: theme.colors.blue[7],
              },
              "&[data-active]:hover": {
                backgroundColor: theme.colors.blue[2],
              },
            },
            label: {
              fontSize: theme.fontSizes.sm,
              display: sidebarCollapsed ? "none" : "block",
            },
          }}
        />
      </Link>
    );
  };

  const renderMenuWithChildren = (menu) => (
    <NavLink
      key={menu.label}
      className="hover:bg-blue-50 transition-colors duration-200 rounded-md"
      label={sidebarCollapsed ? "" : menu.label}
      icon={menu.icon}
      variant="subtle"
      defaultOpened={false}
      styles={{
        root: {
          borderRadius: theme.radius.md,
        },
        children: {
          paddingLeft: theme.spacing.md,
        },
        label: {
          fontSize: theme.fontSizes.sm,
          display: sidebarCollapsed ? "none" : "block",
        },
      }}
    >
      {menu.children.map((child) =>
        child.children ? renderMenuWithChildren(child) : renderMenuLink(child)
      )}
    </NavLink>
  );

  const SidebarHeader = () => (
    <Box p="md">
      <Flex align="center" gap="sm">
        <Avatar radius="xl" size="lg" color="blue">
          {currentUser?.name?.charAt(0).toUpperCase() || "U"}
        </Avatar>
        {!sidebarCollapsed && (
          <div>
            <Text fw={600}>{currentUser?.name || "User"}</Text>
            <Text size="xs" c="dimmed">
              {currentRole?.name?.am || "User"}
            </Text>
          </div>
        )}
      </Flex>
    </Box>
  );

  const content = (
    <Flex direction="column" h="100%" justify="space-between">
      <Box>
        <SidebarHeader />
        {menus.map((menu) =>
          menu.children?.length
            ? renderMenuWithChildren(menu)
            : renderMenuLink(menu)
        )}
      </Box>
      {!sidebarCollapsed && (
        <Box p="md">
          <Text size="xs" c="dimmed" ta="center">
            © {new Date().getFullYear()} Admin Panel
          </Text>
        </Box>
      )}
    </Flex>
  );

  return (
    <div className="w-auto">
      {/* Mobile Burger */}
      <Burger
        opened={drawerOpened}
        onClick={toggleDrawer}
        className="md:hidden"
        size="sm"
        color="#4b5563"
      />
      {/* Mobile Drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={toggleDrawer}
        position="left"
        size="sm"
        title={<span className="font-semibold">{t("Navigation")}</span>}
        styles={{
          header: {
            borderBottom: `1px solid ${theme.colors.gray[2]}`,
            paddingBottom: theme.spacing.md,
            marginBottom: theme.spacing.md,
          },
        }}
      >
        {content}
      </Drawer>
      {/* Desktop Sidebar */}
      <Transition
        mounted={!sidebarCollapsed}
        transition="slide-right"
        duration={200}
        timingFunction="ease"
      >
        {(styles) => (
          <Box
            style={styles}
            className="hidden md:block fixed left-0 top-20 bottom-0 bg-white border-r border-gray-200 overflow-y-auto w-64 shadow-sm z-10"
          >
            {content}
          </Box>
        )}
      </Transition>
      {/* Collapse/Expand Button */}
      <Button
        className="hidden md:flex fixed left-0 top-20 z-20"
        style={{
          left: sidebarCollapsed ? "0" : "256px",
          transition: "left 200ms ease",
        }}
        variant="filled"
        color="blue"
        size="xs"
        radius="xl"
        p={8}
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        {sidebarCollapsed ? (
          <IconChevronRight size={rem(18)} />
        ) : (
          <IconChevronLeft size={rem(18)} />
        )}
      </Button>
    </div>
  );
};

export default Menus;
