import { useState } from "react";
import type { AuthState } from "../types/Auth";
import { createRequest } from "../services/CommissionService";
import type { Product } from "../types/Products";
import ErrorRedBox from "./error-red-box";
import { LoadingIndicator } from "./loading-indicator";

type Props = {
  authState: AuthState;
  product: Product
};

export default function CommissionRequestForm({
  authState,
  product
}: Props) {
  const initEmail = authState.email ?? ""
  const [name, setName] = useState(authState.username ?? "");
  const [email, setEmail] = useState(initEmail);
  const [isEmailLocked, setIsEmailLocked] = useState(authState.email === "" ? false : true);
  const [deadline, setDeadline] = useState("");
  const [extraInfo, setExtraInfo] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  type requestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string }
  const [reqState, setReqState] = useState<requestState>({ status: "idle" });

  const formatToPostgresTimestamp = (value: string) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toISOString();
  };

  const handleSubmit = async () => {
    if (!acknowledged) return;

    try {
      setReqState({status: "loading"})
      await createRequest({ 
        productId: product.id ,
        productTitle: product.title,
        proposedDeadline: formatToPostgresTimestamp(deadline),
        extraInfo: extraInfo,
        username: name,
        email: email,
        currencyCode: product.currencyCode,
        price: product.price,
      })
      setReqState({status: "success"})
    } catch (err) {
      if (err instanceof Error) {
        setReqState({status: "error", message: err.message})
      } else {
        setReqState({status: "error", message: "Something UnExpected Happend"})
      }
    } 

  };

  return (
    <div className="flex-1 border border-gray-200 rounded-2xl p-6 space-y-5 bg-white">
      {/* Name */}
      <div>
        <label className="block text-sm font-semibold">
          Your Name
        </label>
        <p className="text-xs text-gray-400 mb-1">
          How do you want to be addressed
        </p>
        <input
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Alex / Username"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold">
          Contact Email
        </label>

        <div className="flex items-center gap-2 mt-1">
          <input
            required
            type="email"
            value={email}
            disabled={isEmailLocked}
            onChange={(e) => setEmail(e.target.value)}
            className={`flex-1 border rounded-lg px-3 py-2 text-sm ${
              isEmailLocked ? "bg-gray-100 text-gray-400" : ""
            }`}
          />

          <button
            type="button"
            onClick={() => {
              if (isEmailLocked) setIsEmailLocked(false)
              else {
                setIsEmailLocked(true)
                setEmail(initEmail)
              }

            }}
            className="text-xs px-3 py-2 border rounded-lg hover:bg-gray-50"
          >
            {isEmailLocked ? "Edit" : "cancel" }
          </button>
        </div>
      </div>

      {/* Deadline */}
      <div>
        <label className="block text-sm font-semibold">
          Deadline
        </label>
        <p className="text-xs text-gray-400 mb-1">
          Set the deadline within 7 days minimum
        </p>

        <input
          type="date"
          required
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Extra Info */}
      <div>
        <label className="block text-sm font-semibold">
          Extra Info
        </label>
        <p className="text-xs text-gray-400 mb-1">
          References, notes, preferences, or constraints
        </p>

        <textarea
          value={extraInfo}
          onChange={(e) => setExtraInfo(e.target.value)}
          rows={4}
          className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
        />
      </div>

      {/* Acknowledgement */}
      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
          className="mt-1"
        />
        <span className="text-xs text-gray-600 leading-snug">
          I understand that making this request does not guarantee acceptance
          and the listed price may change depending on the request.
        </span>
      </label>

      {reqState.status === "error" && (
        <ErrorRedBox message={reqState.message}/>
      )}

      {reqState.status === "success" && (
        <div>
          Request Creation Success
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!acknowledged}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center ${
          acknowledged
            ? "bg-black text-white hover:bg-gray-800"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
      {reqState.status === "loading" ? (
        <LoadingIndicator />
      ) : "Submit Request"}
      </button>
    </div>
  );
}
