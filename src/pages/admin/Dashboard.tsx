import { useState } from "react";
import useAuthStore from "../../store/AuthStore";
import Product from "./Product";

const tabs = [
  "Comissions",
  "Order",
  "profile",
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Comissions");
    
  const { fullName, username } = useAuthStore.getState();
  const usn = fullName?.trim() ? fullName : username;

  return (
    <div className="flex h-screen bg-white text-black">
      <aside className="w-64 border-r border-gray-200 p-4">
        <h2 className="text-xl font-semibold mb-6">Welcome Back, {usn} </h2>
        <ul className="space-y-2">
          {tabs.map((tab) => (
            <li key={tab}>
              <button
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-3 py-2 rounded-lg transition 
                  ${activeTab === tab ? "bg-black text-white" : "hover:bg-gray-100"}`}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1 p-6 w-full h-full">
      {Product()}
      </main>
    </div>
  );
}

