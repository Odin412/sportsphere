/**
 * pages.config.js - Page routing configuration
 *
 * All pages are lazy-loaded for optimal bundle splitting.
 * Only the Layout and Feed page are eagerly loaded.
 */
import { lazy } from 'react';
import __Layout from './Layout.jsx';

// Eagerly load the main feed page (always needed)
import Feed from './pages/Feed';

// Lazy-load all other pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminContent = lazy(() => import('./pages/AdminContent'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminHealth = lazy(() => import('./pages/AdminHealth'));
const Advice = lazy(() => import('./pages/Advice'));
const Analytics = lazy(() => import('./pages/Analytics'));
const AthleteInsights = lazy(() => import('./pages/AthleteInsights'));
const BecomeCreator = lazy(() => import('./pages/BecomeCreator'));
const ChallengeDetail = lazy(() => import('./pages/ChallengeDetail'));
const Challenges = lazy(() => import('./pages/Challenges'));
const Coach = lazy(() => import('./pages/Coach'));
const CoachingSessionDetail = lazy(() => import('./pages/CoachingSessionDetail'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const CreateReel = lazy(() => import('./pages/CreateReel'));
const CreatorAI = lazy(() => import('./pages/CreatorAI'));
const CreatorHub = lazy(() => import('./pages/CreatorHub'));
const CreatorShop = lazy(() => import('./pages/CreatorShop'));
const Discover = lazy(() => import('./pages/Discover'));
const Events = lazy(() => import('./pages/Events'));
const Explore = lazy(() => import('./pages/Search'));
const ForYou = lazy(() => import('./pages/ForYou'));
const ForumTopic = lazy(() => import('./pages/ForumTopic'));
const Forums = lazy(() => import('./pages/Forums'));
const GameDay = lazy(() => import('./pages/GameDay'));
const GameRecap = lazy(() => import('./pages/GameRecap'));
const GetNoticed = lazy(() => import('./pages/GetNoticed'));
const GroupDetail = lazy(() => import('./pages/GroupDetail'));
const Groups = lazy(() => import('./pages/Groups'));
const Guidelines = lazy(() => import('./pages/Guidelines'));
const ImportVideos = lazy(() => import('./pages/ImportVideos'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Live = lazy(() => import('./pages/Live'));
const LiveCoaching = lazy(() => import('./pages/LiveCoaching'));
const Messages = lazy(() => import('./pages/Messages'));
const ModerationQueue = lazy(() => import('./pages/ModerationQueue'));
const MyTraining = lazy(() => import('./pages/MyTraining'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const OrgDashboard = lazy(() => import('./pages/OrgDashboard'));
const OrgMessages = lazy(() => import('./pages/OrgMessages'));
const OrgRoster = lazy(() => import('./pages/OrgRoster'));
const OrgSessions = lazy(() => import('./pages/OrgSessions'));
const ParentView = lazy(() => import('./pages/ParentView'));
const PerformanceHub = lazy(() => import('./pages/PerformanceHub'));
const Premium = lazy(() => import('./pages/Premium'));
const ProPathHub = lazy(() => import('./pages/ProPathHub'));
const ScoutCard = lazy(() => import('./pages/ScoutCard'));
const TheVault = lazy(() => import('./pages/TheVault'));
const Profile = lazy(() => import('./pages/Profile'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));
const Reels = lazy(() => import('./pages/Reels'));
const SavedContent = lazy(() => import('./pages/SavedContent'));
const ScoutingHub = lazy(() => import('./pages/ScoutingHub'));
const SearchPage = lazy(() => import('./pages/Search'));
const SportHub = lazy(() => import('./pages/SportHub'));
const Terms = lazy(() => import('./pages/Terms'));
const TrainingPlanDetail = lazy(() => import('./pages/TrainingPlanDetail'));
const TrainingPlans = lazy(() => import('./pages/TrainingPlans'));
const TrendingChallenges = lazy(() => import('./pages/TrendingChallenges'));
const UploadVideo = lazy(() => import('./pages/UploadVideo'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const VideoReview = lazy(() => import('./pages/VideoReview'));
const ViewLive = lazy(() => import('./pages/ViewLive'));

export const PAGES = {
    "Login": Login,
    "Admin": Admin,
    "AdminUsers": AdminUsers,
    "AdminContent": AdminContent,
    "AdminAnalytics": AdminAnalytics,
    "AdminSettings": AdminSettings,
    "AdminHealth": AdminHealth,
    "Advice": Advice,
    "Analytics": Analytics,
    "AthleteInsights": AthleteInsights,
    "BecomeCreator": BecomeCreator,
    "ChallengeDetail": ChallengeDetail,
    "Challenges": Challenges,
    "Coach": Coach,
    "CoachingSessionDetail": CoachingSessionDetail,
    "CreatePost": CreatePost,
    "CreateReel": CreateReel,
    "CreatorAI": CreatorAI,
    "CreatorHub": CreatorHub,
    "CreatorShop": CreatorShop,
    "Discover": Discover,
    "Events": Events,
    "Explore": Explore,
    "Feed": Feed,
    "ForYou": ForYou,
    "ForumTopic": ForumTopic,
    "Forums": Forums,
    "GameDay": GameDay,
    "GameRecap": GameRecap,
    "GetNoticed": GetNoticed,
    "GroupDetail": GroupDetail,
    "Groups": Groups,
    "Guidelines": Guidelines,
    "ImportVideos": ImportVideos,
    "Leaderboard": Leaderboard,
    "Live": Live,
    "LiveCoaching": LiveCoaching,
    "Messages": Messages,
    "ModerationQueue": ModerationQueue,
    "MyTraining": MyTraining,
    "Notifications": Notifications,
    "Onboarding": Onboarding,
    "OrgDashboard": OrgDashboard,
    "OrgMessages": OrgMessages,
    "OrgRoster": OrgRoster,
    "OrgSessions": OrgSessions,
    "ParentView": ParentView,
    "PerformanceHub": PerformanceHub,
    "Premium": Premium,
    "ProPathHub": ProPathHub,
    "ScoutCard": ScoutCard,
    "TheVault": TheVault,
    "Profile": Profile,
    "ProfileSettings": ProfileSettings,
    "Reels": Reels,
    "SavedContent": SavedContent,
    "ScoutingHub": ScoutingHub,
    "Search": SearchPage,
    "SportHub": SportHub,
    "Terms": Terms,
    "TrainingPlanDetail": TrainingPlanDetail,
    "TrainingPlans": TrainingPlans,
    "TrendingChallenges": TrendingChallenges,
    "UploadVideo": UploadVideo,
    "UserProfile": UserProfile,
    "VideoReview": VideoReview,
    "ViewLive": ViewLive,
}

export const pagesConfig = {
    mainPage: "Feed",
    Pages: PAGES,
    Layout: __Layout,
};
