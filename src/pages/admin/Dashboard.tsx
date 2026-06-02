import { useEffect } from "react";
import useAuthStore from "../../store/AuthStore";
import RequestPage from "./Request";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../components/toast";
import OrderPage from "./Order";
import WebsiteProfilePage from "./WebsiteProfile";
import CommissionPage from "./Commissions";

export const tabList = ["Comissions", "Order", "Request", "Website Profile"] as const;

export type Tab = (typeof tabList)[number];

const DEFAULT_TAB: Tab = "Comissions";

function isTab(value: string | null): value is Tab {
  return value !== null && tabList.includes(value as Tab);
}

function assertNever(value: never): never {
  throw new Error(`Unhandled tab: ${value}`);
}

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const tabsQuery = searchParams.get("tabs");

  const { showToast } = useToast();
  const authState = useAuthStore((s) => s.authState);
  const navigate = useNavigate();

  const activeTab: Tab = isTab(tabsQuery) ? tabsQuery : DEFAULT_TAB;

  useEffect(() => {
    if (authState.status !== "authenticated") {
      showToast("error", "Please Login Again as admin");
      navigate("/", { replace: true });
    }
  }, [authState.status, navigate]);

  useEffect(() => {
    if (tabsQuery === null) {
      navigate(`?tabs=${DEFAULT_TAB}`, { replace: true });
      return;
    }

    if (!isTab(tabsQuery)) {
      showToast("error", "Tabs Not Found");
      navigate(`?tabs=${DEFAULT_TAB}`, { replace: true });
    }
  }, [tabsQuery, navigate]);

  if (authState.status !== "authenticated") {
    return null;
  }

  const { fullName, username } = authState.data;
  const usn = fullName?.trim() ? fullName : username;

  const getActiveTab = () => {
    switch (activeTab) {
      case "Comissions":
        return <CommissionPage />;

      case "Order":
        return <OrderPage />;

      case "Request":
        return <RequestPage />;

      case "Website Profile":
        return <WebsiteProfilePage />;

      default:
        return assertNever(activeTab);
    }
  };

  return (
    <div className="flex h-screen bg-white text-black">
      <aside className="w-64 border-r border-gray-200 p-4">
        <h2 className="text-xl font-semibold mb-6">Welcome Back, {usn}</h2>

        <ul className="space-y-2">
          {tabList.map((tab) => (
            <li key={tab}>
              <button
                onClick={() => {
                  navigate(`?tabs=${encodeURIComponent(tab)}`, {
                    replace: true,
                  });
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  activeTab === tab
                    ? "bg-black text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1 p-6 w-full h-full overflow-auto">
        {getActiveTab()}
      </main>
    </div>
  );
}
