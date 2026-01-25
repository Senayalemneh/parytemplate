import {
  Box,
  Paper,
  Avatar,
  Text,
  Group,
  Title,
  Divider,
  createStyles,
  useMantineTheme,
  Tooltip,
  Badge,
  ActionIcon,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { getorgStructureRegional } from "../../services/api/main";
import {
  IconChevronDown,
  IconPointFilled,
  IconInfoCircle,
  IconArrowDown,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

import Loader from "../common/loader";

const useStyles = createStyles((theme) => ({
  container: {
    maxWidth: "100vw",
    overflowX: "auto",
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl * 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background:
      theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
  },
  banner: {
    width: "100%",
    background: theme.fn.linearGradient(
      45,
      theme.colors.blue[7],
      theme.colors.cyan[7]
    ),
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    boxShadow: theme.shadows.xl,
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
    "&:before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800' opacity='0.1'%3E%3Cpath fill='%23ffffff' d='M400 0C179.085 0 0 179.085 0 400s179.085 400 400 400 400-179.085 400-400S620.915 0 400 0zm0 720c-176.195 0-320-143.805-320-320s143.805-320 320-320 320 143.805 320 320-143.805 320-320 320z'/%3E%3C/svg%3E")`,
      opacity: 0.1,
    },
  },
  bannerText: {
    color: theme.white,
    fontSize: theme.fontSizes.xxl,
    fontWeight: 700,
    textShadow: "0 2px 4px rgba(0,0,0,0.2)",
    [theme.fn.smallerThan("sm")]: {
      fontSize: theme.fontSizes.lg,
    },
  },
  chartContainer: {
    minWidth: "fit-content",
    padding: theme.spacing.xl,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    background: theme.fn.linearGradient(
      135,
      theme.colors.blue[9] + "10",
      theme.colors.cyan[9] + "10"
    ),
    borderRadius: theme.radius.lg,
    boxShadow: theme.shadows.sm,
    [theme.fn.smallerThan("sm")]: {
      padding: theme.spacing.xs,
    },
  },
  levelContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: theme.spacing.xl,
    width: "100%",
    position: "relative",
    marginTop: theme.spacing.xl,
    [theme.fn.smallerThan("sm")]: {
      flexDirection: "column",
      alignItems: "center",
      gap: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
  },
  card: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    boxShadow: theme.shadows.md,
    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
    width: 240,
    minHeight: 260,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: theme.shadows.lg,
      borderColor: theme.fn.linearGradient(
        45,
        theme.colors.blue[5],
        theme.colors.cyan[5]
      ),
    },
    [theme.fn.smallerThan("sm")]: {
      width: 180,
      minHeight: 200,
      padding: theme.spacing.sm,
    },
  },
  tenure: {
    position: "absolute",
    bottom: theme.spacing.sm,
    right: theme.spacing.sm,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.gray[6],
  },
  topLevelCard: {
    background: theme.fn.linearGradient(
      145,
      theme.colorScheme === "dark"
        ? theme.colors.dark[7]
        : theme.colors.gray[0],
      theme.colorScheme === "dark" ? theme.colors.dark[9] : theme.white
    ),
    borderColor: theme.colors.blue[5],
    borderWidth: 2,
    boxShadow: `0 4px 20px ${
      theme.colorScheme === "dark"
        ? theme.colors.blue[9] + "30"
        : theme.colors.blue[2] + "80"
    }`,
    "&:hover": {
      borderColor: theme.colors.cyan[5],
    },
  },
  connector: {
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: "50%",
      width: 2,
      height: theme.spacing.lg,
      background: theme.fn.linearGradient(
        0,
        theme.colors.blue[5],
        theme.colors.cyan[5]
      ),
      transform: "translateX(-50%)",
      zIndex: -1,
      transition: "height 0.3s ease",
    },
    [theme.fn.smallerThan("sm")]: {
      "&::after": {
        height: theme.spacing.sm,
      },
    },
  },
  childArrow: {
    position: "absolute",
    bottom: -theme.spacing.md,
    left: "50%",
    transform: "translateX(-50%)",
    color: theme.colors.blue[6],
    zIndex: 2,
    animation: "bounce 1.5s infinite",
    "&:hover": {
      color: theme.colors.cyan[6],
    },
    [theme.fn.smallerThan("sm")]: {
      bottom: -theme.spacing.sm,
      display: "none",
    },
  },
  horizontalConnector: {
    position: "absolute",
    top: -theme.spacing.lg,
    left: "50%",
    width: "80%",
    height: 2,
    background: theme.fn.linearGradient(
      90,
      theme.colors.blue[5],
      theme.colors.cyan[5]
    ),
    transform: "translateX(-50%)",
    zIndex: -1,
    transition: "width 0.3s ease",
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },
  toggleButton: {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.sm,
    color: theme.colors.blue[6],
    transition: "all 0.2s ease",
    "&:hover": {
      color: theme.colors.cyan[6],
      transform: "scale(1.1)",
    },
  },
  avatarWrapper: {
    padding: 3,
    borderRadius: "50%",
    background: theme.fn.linearGradient(
      45,
      theme.colors.blue[5],
      theme.colors.cyan[5]
    ),
    margin: "0 auto",
    boxShadow: theme.shadows.sm,
    width: "fit-content",
    transition: "transform 0.3s ease",
    "&:hover": {
      transform: "scale(1.05)",
    },
  },
  avatar: {
    border: `2px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white
    }`,
    transition: "transform 0.3s ease",
    "&:hover": {
      transform: "scale(1.05)",
    },
  },
  nameText: {
    wordBreak: "break-word",
    lineHeight: 1.3,
    fontWeight: 600,
    fontSize: theme.fontSizes.md,
    [theme.fn.smallerThan("sm")]: {
      fontSize: theme.fontSizes.sm,
    },
  },
  titleText: {
    wordBreak: "break-word",
    lineHeight: 1.4,
    fontSize: theme.fontSizes.sm,
    [theme.fn.smallerThan("sm")]: {
      fontSize: theme.fontSizes.xs,
    },
  },
  badge: {
    position: "absolute",
    top: -10,
    right: -10,
    zIndex: 1,
    boxShadow: theme.shadows.sm,
    fontSize: theme.fontSizes.xs,
    padding: theme.spacing.xs,
    background: theme.fn.linearGradient(
      45,
      theme.colors.cyan[5],
      theme.colors.blue[5]
    ),
  },
  infoIcon: {
    position: "absolute",
    bottom: 8,
    right: 8,
    color: theme.colors.gray[6],
    "&:hover": {
      color: theme.colors.cyan[6],
      transform: "scale(1.1)",
    },
  },
  hierarchyLine: {
    position: "absolute",
    height: "100%",
    width: 2,
    background: theme.fn.linearGradient(
      0,
      theme.colors.blue[5],
      theme.colors.cyan[5]
    ),
    left: "50%",
    transform: "translateX(-50%)",
    top: 0,
    zIndex: -1,
    [theme.fn.smallerThan("sm")]: {
      height: 2,
      width: "100%",
      top: "50%",
      left: 0,
      transform: "translateY(-50%)",
    },
  },
  "@keyframes bounce": {
    "0%, 20%, 50%, 80%, 100%": {
      transform: "translateY(0) translateX(-50%)",
    },
    "40%": {
      transform: "translateY(-8px) translateX(-50%)",
    },
    "60%": {
      transform: "translateY(-4px) translateX(-50%)",
    },
  },
}));

interface OrgMemberCardProps {
  member: {
    id: number;
    name: string;
    title: string;
    image: string;
    department?: string;
    children?: OrgMemberCardProps["member"][];
  };
  depth?: number;
  isLastChild?: boolean;
}

const OrgMemberCard = ({
  member,
  depth = 0,
  isLastChild = false,
}: OrgMemberCardProps) => {
  const { classes, cx } = useStyles();
  const theme = useMantineTheme();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);
  const hasChildren = member.children && member.children.length > 0;
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isMobile && depth > 1) {
      setExpanded(false);
    }
  }, [isMobile, depth]);

  const avatarSize = isMobile
    ? depth === 0
      ? 80
      : 60
    : depth === 0
    ? 100
    : 80;

  return (
    <Box
      className="relative"
      style={{
        marginBottom: isMobile && !isLastChild ? theme.spacing.xl : 0,
      }}
    >
      {depth > 0 && !isMobile && <div className={classes.hierarchyLine} />}
      {depth > 0 && isMobile && (
        <div
          className={classes.hierarchyLine}
          style={{
            display: isLastChild ? "none" : "block",
          }}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: depth * 0.1 }}
      >
        <Paper
          className={cx(classes.card, depth === 0 && classes.topLevelCard)}
          style={{
            margin: "0 auto",
            zIndex: 2,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {member.department && (
            <Badge
              className={classes.badge}
              variant="filled"
              size={isMobile ? "xs" : "sm"}
            >
              {t(
                `federalorgstruct.departments.${member.department?.toLowerCase()}`
              )}
            </Badge>
          )}

          <Group position="center" direction="column" spacing="xs" noWrap>
            <motion.div
              animate={{
                scale: isHovered ? 1.05 : 1,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className={classes.avatarWrapper}>
                <Avatar
                  src={
                    member.image.startsWith("http")
                      ? member.image
                      : `https://bole.prosperity.boleprosperityparty.org/CMSFiles/${member.image}`
                  }
                  size={avatarSize}
                  radius="50%"
                  className={classes.avatar}
                />
              </div>
            </motion.div>
          </Group>

          <Text
            size={isMobile ? "sm" : depth === 0 ? "lg" : "md"}
            align="center"
            className={classes.nameText}
            mt="sm"
            gradient={{ from: "blue", to: "cyan", deg: 45 }}
            variant="gradient"
          >
            {member.name}
          </Text>

          <Text
            color="dimmed"
            size={isMobile ? "xs" : "sm"}
            align="center"
            className={classes.titleText}
            mt={4}
          >
            {member.title}
          </Text>

          {hasChildren && (
            <motion.div
              className={classes.toggleButton}
              onClick={() => setExpanded(!expanded)}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05, color: theme.colors.cyan[6] }}
            >
              <IconChevronDown
                size={isMobile ? 16 : 20}
                style={{
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 300ms ease",
                }}
              />
              <Text size="xs" ml="xs" color="dimmed">
                {expanded
                  ? t("federalorgstruct.collapse")
                  : t("federalorgstruct.expand")}
              </Text>
            </motion.div>
          )}

          <Tooltip
            label={t("federalorgstruct.profile_tooltip", { name: member.name })}
            position="bottom"
            withArrow
            transition="slide-down"
            color="blue"
          >
            <ActionIcon className={classes.infoIcon} size="sm" variant="light">
              <IconInfoCircle size={16} />
            </ActionIcon>
          </Tooltip>
        </Paper>
      </motion.div>

      {hasChildren && (
        <AnimatePresence>
          {expanded && (
            <motion.div
              className={classes.levelContainer}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {hasChildren && !isMobile && (
                <motion.div
                  className={classes.horizontalConnector}
                  initial={{ width: 0 }}
                  animate={{ width: "80%" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              )}
              {member.children?.map((child, index) => (
                <div key={child.id} className={cx(classes.connector)}>
                  {!isMobile && (
                    <IconArrowDown size={20} className={classes.childArrow} />
                  )}
                  <OrgMemberCard
                    member={child}
                    depth={depth + 1}
                    isLastChild={index === member.children!.length - 1}
                  />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </Box>
  );
};

const OrganizationalChart = () => {
  const { classes, theme } = useStyles();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { t } = useTranslation();
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["orgStructureregional"],
    queryFn: getorgStructureRegional,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading || isFetching) {
    return <Loader />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 text-center"
      >
        <Paper
          p="lg"
          shadow="md"
          className="inline-block bg-red-100 dark:bg-red-900/30"
          radius="lg"
        >
          <Text color="red" weight={600} size="lg">
            {t("federalorgstruct.error_title")}
          </Text>
          <Text size="sm" color="red" mt="sm">
            {t("federalorgstruct.error_message")}
          </Text>
        </Paper>
      </motion.div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 text-center"
      >
        <Paper
          p="lg"
          shadow="sm"
          className="inline-block bg-blue-50 dark:bg-blue-900/20"
          radius="lg"
        >
          <Text weight={600} size="lg">
            {t("federalorgstruct.empty_title")}
          </Text>
          <Text size="sm" color="dimmed" mt="sm">
            {t("federalorgstruct.empty_message")}
          </Text>
        </Paper>
      </motion.div>
    );
  }

  return (
    <Box className={classes.container}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={classes.banner}
      >
        <Text className={classes.bannerText}>
          {t("federalorgstruct.banner_title_regional")}
        </Text>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <Title
          order={1}
          className={`${
            isMobile ? "text-2xl" : "text-3xl md:text-4xl"
          } font-extrabold mb-3`}
          sx={(theme) => ({
            background: theme.fn.linearGradient(
              45,
              theme.colors.blue[6],
              theme.colors.cyan[6]
            ),
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1.2,
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          })}
        >
          {t("federalorgstruct.title")}
        </Title>
        <Text
          color="dimmed"
          className="max-w-2xl mx-auto"
          size={isMobile ? "sm" : "md"}
          sx={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}
        >
          {t("federalorgstruct.subtitle")}
        </Text>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Divider
          className="mb-8 mx-auto"
          variant="dashed"
          size="sm"
          style={{ maxWidth: 800 }}
          color={theme.colorScheme === "dark" ? "blue.7" : "blue.4"}
          sx={{ borderStyle: "dotted" }}
        />
      </motion.div>

      <div className={classes.chartContainer}>
        {data.map((topLevelMember, index) => (
          <div key={topLevelMember.id} className={classes.levelContainer}>
            <OrgMemberCard
              member={topLevelMember}
              isLastChild={index === data.length - 1}
            />
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 text-center"
      >
        <Text
          size={isMobile ? "xs" : "sm"}
          color="dimmed"
          className="flex items-center justify-center"
        >
        
        </Text>
      </motion.div>
    </Box>
  );
};

export default OrganizationalChart;
