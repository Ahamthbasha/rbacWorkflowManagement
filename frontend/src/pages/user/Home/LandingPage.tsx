
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  LayoutDashboard,
  Lock,
  MessageSquareMore,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { RootState } from "../../../redux/store";
import Header from "../../../layout/commonLayout/Header";
import Footer from "../../../layout/commonLayout/Footer";

const LandingPage = () => {
  const user = useSelector((state: RootState) => state.user);

  const isLoggedIn = !!user.userId;
  const role = user.role || "guest";
  const userName = user.name?.split(" ")[0] || "there";

  const heroTitle = isLoggedIn
    ? `Welcome back, ${userName}`
    : "Keep every request moving without losing control";

  const heroDescription = isLoggedIn
    ? "Track requests, review approvals, and jump back into your workflow from one place."
    : "A clean role-based workflow system for submitting requests, reviewing approvals, and closing tasks with full visibility.";

  const primaryCta = isLoggedIn
    ? {
        to: "/dashboard",
        label: "Open dashboard",
        icon: LayoutDashboard,
      }
    : {
        to: "/register",
        label: "Get started",
        icon: ArrowRight,
      };

  const secondaryCta = isLoggedIn
    ? {
        to:
          role === "admin"
            ? "/admin/requests"
            : role === "manager"
            ? "/manager/requests"
            : "/myRequests",
        label:
          role === "admin"
            ? "Review requests"
            : role === "manager"
            ? "Manage approvals"
            : "View my requests",
      }
    : {
        to: "/login",
        label: "Sign in",
      };

  const quickActions = isLoggedIn
    ? role === "admin"
      ? [
          {
            title: "Pending closures",
            desc: "Close approved requests and keep the queue clean.",
            to: "/admin/requests",
            icon: CheckCircle2,
          },
          {
            title: "Reopened items",
            desc: "Review reopened requests that need another pass.",
            to: "/admin/requests",
            icon: Clock3,
          },
          {
            title: "System overview",
            desc: "Watch workload, request states, and team activity.",
            to: "/dashboard",
            icon: ShieldCheck,
          },
        ]
      : role === "manager"
      ? [
          {
            title: "Review requests",
            desc: "Approve, reject, or request clarification quickly.",
            to: "/manager/requests",
            icon: MessageSquareMore,
          },
          {
            title: "Team activity",
            desc: "See who submitted what and where things are blocked.",
            to: "/dashboard",
            icon: Users,
          },
          {
            title: "Approval queue",
            desc: "Keep decision-making fast and visible.",
            to: "/manager/requests",
            icon: CheckCircle2,
          },
        ]
      : [
          {
            title: "Create request",
            desc: "Start a new workflow request in a few clicks.",
            to: "/createRequest",
            icon: FileText,
          },
          {
            title: "Track progress",
            desc: "Follow your requests from submission to closure.",
            to: "/myRequests",
            icon: Clock3,
          },
          {
            title: "Check updates",
            desc: "See clarification requests and approval outcomes fast.",
            to: "/dashboard",
            icon: MessageSquareMore,
          },
        ]
    : [
        {
          title: "Submit requests",
          desc: "Users create requests with priority and full details.",
          to: "/register",
          icon: FileText,
        },
        {
          title: "Manager review",
          desc: "Managers approve, reject, or request clarification.",
          to: "/manager/register",
          icon: Users,
        },
        {
          title: "Admin closure",
          desc: "Admins finalize approved workflows with control.",
          to: "/admin/login",
          icon: ShieldCheck,
        },
      ];

  const liveWorkflow = [
    {
      label: "Submitted",
      value: "New request created",
      tone:
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
    },
    {
      label: "In review",
      value: "Waiting for manager action",
      tone:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
    },
    {
      label: "Clarification",
      value: "User response requested",
      tone:
        "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900",
    },
    {
      label: "Closed",
      value: "Workflow completed",
      tone:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
    },
  ];

  const featureBlocks = [
    {
      title: "Role-aware access",
      description:
        "Users, managers, and admins each get focused actions without clutter.",
      icon: ShieldCheck,
    },
    {
      title: "Request visibility",
      description:
        "Every request stays traceable with status updates, comments, and activity history.",
      icon: FileText,
    },
    {
      title: "Faster decisions",
      description:
        "Clarifications, approvals, rejections, and closures happen in one clear flow.",
      icon: CheckCircle2,
    },
    {
      title: "Secure by default",
      description:
        "Authentication and authorization stay built into the workflow, not bolted on later.",
      icon: Lock,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-gray-200 dark:border-gray-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_30%),radial-gradient(circle_at_left,rgba(139,92,246,0.10),transparent_28%)]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 text-sm text-blue-700 dark:text-blue-300 mb-6">
                  <Sparkles className="h-4 w-4" />
                  {isLoggedIn
                    ? `Signed in as ${role}`
                    : "Role-based workflow platform"}
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                  {heroTitle}
                </h1>

                <p className="mt-5 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
                  {heroDescription}
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link
                    to={primaryCta.to}
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <primaryCta.icon className="h-5 w-5 mr-2" />
                    {primaryCta.label}
                  </Link>

                  <Link
                    to={secondaryCta.to}
                    className="inline-flex items-center justify-center rounded-xl border border-gray-300 dark:border-gray-700 px-6 py-3 text-base font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    {secondaryCta.label}
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap gap-3 text-sm">
                  <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-900 px-3 py-1.5 text-gray-600 dark:text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Clear approval flow
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-900 px-3 py-1.5 text-gray-600 dark:text-gray-300">
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                    Role-based access
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-900 px-3 py-1.5 text-gray-600 dark:text-gray-300">
                    <Clock3 className="h-4 w-4 text-amber-500" />
                    Faster turnaround
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 shadow-xl p-5 backdrop-blur">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Workflow overview
                      </p>
                      <h3 className="text-xl font-semibold mt-1">
                        Live request states
                      </h3>
                    </div>
                    <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 p-3">
                      <LayoutDashboard className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {liveWorkflow.map((item) => (
                      <div
                        key={item.label}
                        className={`rounded-2xl border px-4 py-4 ${item.tone}`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                              {item.label}
                            </p>
                            <p className="text-sm mt-1">{item.value}</p>
                          </div>
                          <CheckCircle2 className="h-5 w-5 opacity-80" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Visibility
                      </p>
                      <p className="text-lg font-semibold mt-1">End-to-end</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Access model
                      </p>
                      <p className="text-lg font-semibold mt-1">RBAC</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
              <div>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  Quick actions
                </p>
                <h2 className="text-3xl font-bold">
                  {isLoggedIn
                    ? "Continue where you left off"
                    : "See how the product works"}
                </h2>
              </div>
              {!isLoggedIn && (
                <Link
                  to="/register"
                  className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Create account
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((item) => (
                <Link
                  key={item.title}
                  to={item.to}
                  className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-md transition-all"
                >
                  <div className="inline-flex rounded-xl bg-blue-50 dark:bg-blue-950/30 p-3 mb-4">
                    <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {item.desc}
                  </p>
                  <div className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                    Open
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                Core strengths
              </p>
              <h2 className="text-3xl font-bold">
                Built for real approval workflows
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featureBlocks.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6 bg-gray-50/70 dark:bg-gray-900/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-3">
                      <feature.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-blue-600">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              {isLoggedIn
                ? "Your workspace is ready"
                : "Start with a workflow that stays accountable"}
            </h2>
            <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
              {isLoggedIn
                ? "Jump back in and keep requests moving with less friction and better visibility."
                : "Create requests, review approvals, and close the loop with a system designed for teams."}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={primaryCta.to}
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-base font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
              >
                {primaryCta.label}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>

              {!isLoggedIn && (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-white/70 px-6 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;