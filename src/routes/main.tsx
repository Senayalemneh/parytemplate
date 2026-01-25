import { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./protected-routes";
import LandingPage from "../pages/common/landing-page/main";
import ErrorPage from "../pages/common/error-page";
import Loader from "../components/common/loader";
import { PERMISSIONS } from "../enums/permissions";
import CreateQuestionnairePage from "../pages/qa-section/create-questionnaire-page";
import QuestionnairesPage from "../pages/qa-section/questionnaires-page";
import TrashedQuestion from "../pages/qa-section/qatrashed";
import QuestionnaireDetailPage from "../pages/qa-section/questionnaire-detail-page";
import EditQuestionnairePage from "../pages/qa-section/edit-questionnaire-page";
import TakeQuestionnairePage from "../pages/qa-section/take-questionnaire-page";
import CreateQuestionPage from "../pages/qa-section/create-question-page";
import EditQuestionPage from "../pages/qa-section/edit-question-page";
import ChatPage from "../pages/chat/chat";
// Layouts
import Layout from "../pages/layout";
import AdminPageLayout from "../pages/adminpagelayout";
import AllResultsPage from "../pages/qa-section/all-exam-resilt";
// Common Pages
import About from "../components/About/about";
import HeadsofGovernment from "../components/HeadsofGovernment/headsofgovernment";
import BookStore from "../components/BookStore/bookstore";
import Gallery from "../components/Gallery/gallery";
import IDCardDisplay from "../pages/staff-management/components/id-card-display";
import Video from "../components/Video/videos";
import Compliant from "../components/Compliant/compliant";
import CompliantResponse from "../components/Compliant/compliantResponse";
import Contact from "../components/Contact/contact";
import News from "../components/News/news";
import DetailedNews from "../components/News/DetailedNews";
import Login from "../components/common/login";

import SignUp from "../components/common/signup";

import Exibition from "../pages/contentmanagement/addExibition";
import ExibitionReport from "../pages/contentmanagement/exibitionReport";

import RegisterViewer from "../pages/contentmanagement/registerviewer";

import ExibitionUI from "../pages/exibition/exibition";

import UnauthorizedPage from "../pages/UnauthorizedPage/unauthorized";
import ResultsPage from "../pages/qa-section/results-page";
// Announcement Pages
import Announcements from "../components/Announcement/announcements";
import Event from "../components/Announcement/event";
import Tender from "../components/Announcement/tender";

// Management Pages
import ManagementTeams from "../components/Management/managementTeams";
import Offices from "../components/Management/allorgstruct";
import Woredas from "../components/Management/woredas";
import Tendency from "../pages/tendency/tendency";
import TendencyTrashed from "../pages/tendency/tendencytrashed";
import TendencyType from "../pages/tendency/tendencyReport";
import Familydiscussion from "../pages/familydiscussion/familydiscussion";
import FamilydiscussionReport from "../pages/familydiscussion/familydiscussionreport";
import FamilydiscussionTrashed from "../pages/familydiscussion/familydiscussiontrashed";

// Dashboard Menu
import AllDashboardMenu from "../configs/all-menus";
// Register
import RegisterSubcity from "../pages/registration/registerSubcity";
import RegisterWoreda from "../pages/registration/registerWoreda";
import RegisterUsers from "../pages/registration/registerusers";

// Role Management Pages
import CreateRole from "../pages/rolemanagement/registerRole";
import AssignRole from "../pages/rolemanagement/assignpermissiontoroles";
import ViewAllPermissions from "../pages/rolemanagement/viewallpermissions";

// Document Management
import DocumentManagement from "../pages/documentmanagement/documents";

import VideoConference from "../pages/videoConference/videoConference";
import StaffManagement from "../pages/staff-management/staff-management";
// Content Management Pages
import AddNews from "../pages/contentmanagement/addnews";
import AddNewsCategory from "../pages/contentmanagement/addnewscategory";
import AddCarouselImages from "../pages/contentmanagement/addcarouselimages";
import PostVideo from "../pages/contentmanagement/postVideo";

import AddHeadOfGovernment from "../pages/contentmanagement/addheadofgovernment";
import AddHeadOfSubcity from "../pages/contentmanagement/addheadofsubcity";
import AddOurPartners from "../pages/contentmanagement/addourpartners";
import AddOurSuccess from "../pages/contentmanagement/addoursuccess";
import AddWoredas from "../pages/contentmanagement/addworedas";

import AddManagementTeam from "../pages/contentmanagement/addmanagementteam";
import AddOrganizationalStructureUsers from "../pages/contentmanagement/addorganizationalstructureusers";

import FederalOrgSTRUCT from "../pages/contentmanagement/addorganizationalstructurefederal";
import RegionalORGSTRUCT from "../pages/contentmanagement/addorganizationalstructureregional";
import SubcityORGSTRUCT from "../pages/contentmanagement/addorganizationalstructuresubcity";
import DistrictORGSTRUCT from "../pages/contentmanagement/addorganizationalstructuredistrict";

import AddAnnouncements from "../pages/contentmanagement/addannouncements";
import AddTenders from "../pages/contentmanagement/addtenders";
import AddEvents from "../pages/contentmanagement/addevents";
import AddBooks from "../pages/contentmanagement/addbooks";
import ViewContacts from "../pages/contentmanagement/viewcontacts";
import ViewComplaints from "../pages/contentmanagement/viewcomplaints";
import AddGallery from "../pages/contentmanagement/addgallery";

// Profile
import UserProfile from "../pages/profile/userprofile";

// Dashboard
import MyDashBoard from "../pages/contentmanagement/mydashboard";
import TrashNews from "../pages/contentmanagement/trashnews";
import TrashBooks from "../pages/contentmanagement/trashbooks";

export const routes = () => {
  return createBrowserRouter([
    // Public Routes
    {
      path: "/",
      element: (
        <Layout>
          <LandingPage />
        </Layout>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "/home",
      element: (
        <Layout>
          <LandingPage />
        </Layout>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "/auth/login",
      element: (
        <Suspense fallback={<Loader />}>
          <Layout>
            <Login />
          </Layout>
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },

    {
      path: "/auth/signup",
      element: (
        <Suspense fallback={<Loader />}>
          <Layout>
            <SignUp />
          </Layout>
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "/contact",
      element: (
        <Suspense fallback={<Loader />}>
          <Layout>
            <Contact />
          </Layout>
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "/news",
      element: (
        <Suspense fallback={<Loader />}>
          <Layout>
            <News />
          </Layout>
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },

    {
      path: "/exibition",
      element: (
        <Suspense fallback={<Loader />}>
          <ExibitionUI />
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "/id-card/:id",
      element: (
        <Suspense fallback={<Loader />}>
          <Layout>
            <IDCardDisplay />
          </Layout>
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "/news/:id", // Changed from :slug to :id
      element: (
        <Suspense fallback={<Loader />}>
          <Layout>
            <DetailedNews />
          </Layout>
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "/about",
      element: (
        <Suspense fallback={<Loader />}>
          <Layout>
            <About />
          </Layout>
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "/headsofgovernment",
      element: (
        <Suspense fallback={<Loader />}>
          <Layout>
            <HeadsofGovernment />
          </Layout>
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "/bookstore",
      element: (
        <Suspense fallback={<Loader />}>
          <Layout>
            <BookStore />
          </Layout>
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "/compliant",
      element: (
        <Suspense fallback={<Loader />}>
          <Layout>
            <Compliant />
          </Layout>
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "/compliant/check-response",
      element: (
        <Suspense fallback={<Loader />}>
          <Layout>
            <CompliantResponse />
          </Layout>
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "/gallery",
      element: (
        <Suspense fallback={<Loader />}>
          <Layout>
            <Gallery />
          </Layout>
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "/video",
      element: (
        <Suspense fallback={<Loader />}>
          <Layout>
            <Video />
          </Layout>
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "/announcement/announcements",
      element: (
        <Suspense fallback={<Loader />}>
          <Layout>
            <Announcements />
          </Layout>
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "/announcement/tender",
      element: (
        <Suspense fallback={<Loader />}>
          <Layout>
            <Tender />
          </Layout>
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "/announcement/event",
      element: (
        <Suspense fallback={<Loader />}>
          <Layout>
            <Event />
          </Layout>
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "/management/management-team",
      element: (
        <Suspense fallback={<Loader />}>
          <Layout>
            <ManagementTeams />
          </Layout>
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "/management/management-offices",
      element: (
        <Suspense fallback={<Loader />}>
          <Layout>
            <Offices />
          </Layout>
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "/management/management-woredas",
      element: (
        <Suspense fallback={<Loader />}>
          <Layout>
            <Woredas />
          </Layout>
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "/unauthorized",
      element: (
        <Suspense fallback={<Loader />}>
          <Layout>
            <UnauthorizedPage />
          </Layout>
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },

    // Dashboard
    {
      path: "/dashboard",
      element: <AdminPageLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute
                allowedPermissions={[PERMISSIONS.VIEW_FOLDER_SHARES]}
              >
                <AllDashboardMenu />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },

    {
      path: "/dashboard",
      element: <AdminPageLayout />,
      children: [
        {
          path: "my-dashboard",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_FOLDERS]}>
                <MyDashBoard />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },

    // Registration Routes
    {
      path: "/register",
      element: <AdminPageLayout />,
      children: [
        {
          path: "register-subcity",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute
                allowedPermissions={[PERMISSIONS.MANAGE_SUBCITIES]}
              >
                <RegisterSubcity />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "register-woreda",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.MANAGE_WOREDAS]}>
                <RegisterWoreda />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "register-woreda-admins",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.MANAGE_USERS]}>
                <RegisterUsers />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },

    // Role Management Routes
    {
      path: "/role",
      element: <AdminPageLayout />,
      children: [
        {
          path: "create-role",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.MANAGE_ROLES]}>
                <CreateRole />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "assign-role",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.MANAGE_ROLES]}>
                <AssignRole />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "view-all-permissions",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.MANAGE_ROLES]}>
                <ViewAllPermissions />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },
    {
      path: "/tendency",
      element: <AdminPageLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_FOLDERS]}>
                <Tendency />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },

    {
      path: "/tendency/report-trashed",
      element: <AdminPageLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_FOLDERS]}>
                <TendencyTrashed />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },

    {
      path: "/cms/exibitions",
      element: <AdminPageLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_FOLDERS]}>
                <Exibition />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },
    {
      path: "/cms/trashednews",
      element: <AdminPageLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_FOLDERS]}>
                <TrashNews />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },
    {
      path: "/cms/trashedbooks",
      element: <AdminPageLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_FOLDERS]}>
                <TrashBooks />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },

    {
      path: "/cms/exibitionsreport",
      element: <AdminPageLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_FOLDERS]}>
                <ExibitionReport />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },

    {
      path: "/cms/registerviewer",
      element: <AdminPageLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_FOLDERS]}>
                <RegisterViewer />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },

    {
      path: "/tendency/report",
      element: <AdminPageLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_FOLDERS]}>
                <TendencyType />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },
    {
      path: "/family-discussion",
      element: <AdminPageLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_FOLDERS]}>
                <Familydiscussion />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },

    {
      path: "/family-discussion-report",
      element: <AdminPageLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_FOLDERS]}>
                <FamilydiscussionReport />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },
    {
      path: "/family-discussion-report-trashed",
      element: <AdminPageLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_FOLDERS]}>
                <FamilydiscussionTrashed />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },

    // Document Management
    {
      path: "/documents",
      element: <AdminPageLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_FOLDERS]}>
                <DocumentManagement />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },

    {
      path: "/video-conference",
      element: <AdminPageLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_FOLDERS]}>
                <VideoConference />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },
    {
      path: "/chat",
      element: <AdminPageLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_FOLDERS]}>
                <ChatPage />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },
    {
      path: "/staff-management",
      element: <AdminPageLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_FOLDERS]}>
                <StaffManagement />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },
    {
      path: "/all-results",
      element: <AdminPageLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_FOLDERS]}>
                <AllResultsPage />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },

    {
      path: "/trashedquestions",
      element: <AdminPageLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_FOLDERS]}>
                <TrashedQuestion />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },
    {
      path: "/questionnaires",
      element: <AdminPageLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_FOLDERS]}>
                <QuestionnairesPage />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "create",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.MANAGE_FOLDERS]}>
                <CreateQuestionnairePage />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: ":id",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.MANAGE_FOLDERS]}>
                <QuestionnaireDetailPage />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: ":id/edit",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.MANAGE_FOLDERS]}>
                <EditQuestionnairePage />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: ":id/questions/new",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.MANAGE_FOLDERS]}>
                <CreateQuestionPage />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "questions/:questionId/edit",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.MANAGE_FOLDERS]}>
                <EditQuestionPage />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: ":id/take",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_FOLDERS]}>
                <TakeQuestionnairePage />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: ":id/results",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_FOLDERS]}>
                <ResultsPage />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },
    // Content Management Routes
    {
      path: "/cms",
      element: <AdminPageLayout />,
      children: [
        {
          path: "add-news",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.MANAGE_NEWS]}>
                <AddNews />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "add-news-category",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.MANAGE_NEWS]}>
                <AddNewsCategory />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "add-carousel-images",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute
                allowedPermissions={[PERMISSIONS.MANAGE_GALLERIES]}
              >
                <AddCarouselImages />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },

        {
          path: "/cms/post-video",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute
                allowedPermissions={[PERMISSIONS.MANAGE_GALLERIES]}
              >
                <PostVideo />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "add-head-of-government",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute
                allowedPermissions={[PERMISSIONS.MANAGE_GALLERIES]}
              >
                <AddHeadOfGovernment />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "add-head-of-subcity",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute
                allowedPermissions={[PERMISSIONS.MANAGE_GALLERIES]}
              >
                <AddHeadOfSubcity />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "add-our-partners",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute
                allowedPermissions={[PERMISSIONS.MANAGE_GALLERIES]}
              >
                <AddOurPartners />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "add-our-success",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute
                allowedPermissions={[PERMISSIONS.MANAGE_GALLERIES]}
              >
                <AddOurSuccess />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "add-woredas",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.MANAGE_NEWS]}>
                <AddWoredas />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "add-management-team",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.MANAGE_NEWS]}>
                <AddManagementTeam />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "add-organizational-structure-users",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.MANAGE_NEWS]}>
                <AddOrganizationalStructureUsers />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },

        {
          path: "add-organizational-structure-federal",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.MANAGE_NEWS]}>
                <FederalOrgSTRUCT />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "addorganizationalstructureregional",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.MANAGE_NEWS]}>
                <RegionalORGSTRUCT />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "addorganizationalstructuresubcity",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.MANAGE_NEWS]}>
                <SubcityORGSTRUCT />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "addorganizationalstructuredistrict",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.MANAGE_NEWS]}>
                <DistrictORGSTRUCT />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "add-announcements",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.MANAGE_NEWS]}>
                <AddAnnouncements />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "add-tenders",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.MANAGE_NEWS]}>
                <AddTenders />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "add-events",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.MANAGE_NEWS]}>
                <AddEvents />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "add-books",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_DOCUMENTS]}>
                <AddBooks />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "view-contacts",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_DOCUMENTS]}>
                <ViewContacts />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "view-complaints",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute allowedPermissions={[PERMISSIONS.VIEW_DOCUMENTS]}>
                <ViewComplaints />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "add-gallery",
          element: (
            <Suspense fallback={<Loader />}>
              <ProtectedRoute
                allowedPermissions={[PERMISSIONS.MANAGE_GALLERIES]}
              >
                <AddGallery />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },

    // Profile
    {
      path: "/profile",
      element: <AdminPageLayout />,
      children: [
        {
          path: "user-profile",
          element: (
            <Suspense fallback={<Loader />}>
              <UserProfile />
            </Suspense>
          ),
          errorElement: <ErrorPage />,
        },
      ],
    },
  ]);
};
