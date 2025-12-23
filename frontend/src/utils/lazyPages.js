import { lazy } from "react";

/* PUBLIC */
export const Landing = lazy(() => import("../pages/Landing"));
export const InterstitialAd = lazy(() => import("../pages/InterstitialAd"));

/* AUTH */
export const Login = lazy(() => import("../pages/Login"));
export const Register = lazy(() => import("../pages/Register"));

/* USER */
export const Dashboard = lazy(() => import("../pages/Dashboard"));
export const ShortenLink = lazy(() => import("../pages/ShortenLink"));
export const Withdraw = lazy(() => import("../pages/Withdraw"));
export const Referrals = lazy(() => import("../pages/Referrals"));
export const Settings = lazy(() => import("../pages/Settings"));

/* ADMIN */
export const AdminDashboard = lazy(() =>
  import("../pages/admin/AdminDashboard")
);
export const AdminUsers = lazy(() =>
  import("../pages/admin/AdminUsers")
);
export const AdminLinks = lazy(() =>
  import("../pages/admin/AdminLinks")
);
export const AdminWithdrawals = lazy(() =>
  import("../pages/admin/AdminWithdrawals")
);
export const AdminCPM = lazy(() =>
  import("../pages/admin/AdminCPM")
);
