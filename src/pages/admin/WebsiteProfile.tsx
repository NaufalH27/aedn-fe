import type {
  WebsiteProfileDto,
  WebsiteProfileRequestDto,
} from "../../types/WebsiteProfile";

import { useToast } from "../../components/toast";
import {
  getUploadProfilePictureSignedUrl,
  getWebsiteProfile,
  updateWebsiteProfile,
} from "../../services/WebsiteProfileService";

import { LoadingModal } from "../../components/loading-modal";
import { LoadingIndicator } from "../../components/loading-indicator";

import { uploadS3 } from "../../services/S3Service";
import { useEffect, useMemo, useState } from "react";
import { getFileExtension } from "../../helper/picture";
import { Camera } from "lucide-react";

const PLACEHOLDER_IMAGE = "/static/placeholder.jpg";

type PageState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: WebsiteProfileDto }
  | { status: "error"; message: string };

type PutState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; error: string };

const profileFields = [
  "photoProfile",
  "personalDescription",
  "email",
  "whatsappUrl",
  "instagramUrl",
  "facebookUrl",
  "vgenUrl",
  "discordUrl",
  "twitterUrl",
] as const satisfies readonly (keyof WebsiteProfileRequestDto)[];

type ProfileField = (typeof profileFields)[number];

const emptyForm: WebsiteProfileRequestDto = {
  photoProfile: null,
  personalDescription: null,
  email: null,
  whatsappUrl: null,
  instagramUrl: null,
  facebookUrl: null,
  vgenUrl: null,
  discordUrl: null,
  twitterUrl: null,
};

function normalizeForm(form: WebsiteProfileRequestDto): WebsiteProfileRequestDto {
  return {
    photoProfile: form.photoProfile || null,
    personalDescription: form.personalDescription || null,
    email: form.email || null,
    whatsappUrl: form.whatsappUrl || null,
    instagramUrl: form.instagramUrl || null,
    facebookUrl: form.facebookUrl || null,
    vgenUrl: form.vgenUrl || null,
    discordUrl: form.discordUrl || null,
    twitterUrl: form.twitterUrl || null,
  };
}

function toRequestDto(data: WebsiteProfileDto): WebsiteProfileRequestDto {
  return {
    photoProfile: data.photoProfile ?? null,
    personalDescription: data.personalDescription ?? null,
    email: data.email ?? null,
    whatsappUrl: data.whatsappUrl ?? null,
    instagramUrl: data.instagramUrl ?? null,
    facebookUrl: data.facebookUrl ?? null,
    vgenUrl: data.vgenUrl ?? null,
    discordUrl: data.discordUrl ?? null,
    twitterUrl: data.twitterUrl ?? null,
  };
}

function isValidUrl(value: string | null): boolean {
  if (!value) return true;
  return URL.canParse(value);
}

const urlFields = [
  {
    field: "whatsappUrl",
    label: "WhatsApp URL (Only shown in Request/Orders Commissions)",
    placeholder: "https://wa.me/628123456789",
  },
  {
    field: "instagramUrl",
    label: "Instagram URL",
    placeholder: "https://instagram.com/username",
  },
  {
    field: "facebookUrl",
    label: "Facebook URL",
    placeholder: "https://facebook.com/username",
  },
  {
    field: "vgenUrl",
    label: "VGen URL",
    placeholder: "https://vgen.co/username",
  },
  {
    field: "discordUrl",
    label: "Discord URL",
    placeholder: "https://discord.gg/yourinvite",
  },
  {
    field: "twitterUrl",
    label: "Twitter/X URL",
    placeholder: "https://x.com/username",
  },
] as const satisfies readonly {
  field: ProfileField;
  label: string;
  placeholder: string;
}[];

export default function WebsiteProfilePage() {
  const [state, setState] = useState<PageState>({ status: "idle" });
  const [putState, setPutState] = useState<PutState>({ status: "idle" });

  const [form, setForm] = useState<WebsiteProfileRequestDto>(emptyForm);
  const [initialForm, setInitialForm] =
    useState<WebsiteProfileRequestDto>(emptyForm);

  const [isUploadPicture, setIsUploadPicture] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);

  const { showToast } = useToast();

  const isChanged = useMemo(() => {
    return (
      JSON.stringify(normalizeForm(form)) !==
      JSON.stringify(normalizeForm(initialForm))
    );
  }, [form, initialForm]);

  const updateDisabled =
    putState.status === "loading" || isUploadPicture || !isChanged;

  const profileImageSrc =
    imagePreviewError || !form.photoProfile
      ? PLACEHOLDER_IMAGE
      : form.photoProfile;

  const handleGetData = async () => {
    setState({ status: "loading" });

    try {
      const result = await getWebsiteProfile();
      const nextForm = toRequestDto(result);

      setForm(nextForm);
      setInitialForm(nextForm);
      setImagePreviewError(false);

      setState({ status: "success", data: result });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const handleChange = (
    field: keyof WebsiteProfileRequestDto,
    value: string | null
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUploadProfile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      showToast("error", "Can't read file");
      return;
    }

    setIsUploadPicture(true);

    try {
      const ext = getFileExtension(file);
      const signedUrl = await getUploadProfilePictureSignedUrl(ext);

      await uploadS3(signedUrl.s3SignedUrl, file, file.type);

      setForm((prev) => ({
        ...prev,
        photoProfile: signedUrl.url,
      }));

      setImagePreviewError(false);
      showToast("success", "Profile picture uploaded successfully!");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown Error";
      showToast("error", errMsg);
    } finally {
      e.target.value = "";
      setIsUploadPicture(false);
    }
  };

  const handleUpdate = async () => {
    if (!isChanged) return;

    if (!isValidUrl(form.photoProfile)) {
      showToast("error", "Profile picture must be a valid URL");
      return;
    }

    const invalidUrlField = urlFields.find(
      ({ field }) => !isValidUrl(form[field])
    );

    if (invalidUrlField) {
      showToast("error", `${invalidUrlField.label} must be a valid URL`);
      return;
    }

    setPutState({ status: "loading" });

    try {
      const payload = normalizeForm(form);
      const result = await updateWebsiteProfile(payload);
      const nextForm = toRequestDto(result);

      setForm(nextForm);
      setInitialForm(nextForm);
      setImagePreviewError(false);

      setState({ status: "success", data: result });
      setPutState({ status: "success" });

      showToast("success", "Website profile updated successfully!");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";

      setPutState({ status: "error", error: errMsg });
      showToast("error", errMsg);
    }
  };

  useEffect(() => {
    handleGetData();
  }, []);

  if (state.status === "loading") {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading website profile...</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-500 mb-4">{state.message}</p>

          <button
            onClick={handleGetData}
            className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <LoadingModal open={putState.status === "loading"} />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Website Profile</h1>
        <p className="text-sm text-gray-500">
          Update your public website profile information.
        </p>
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium mb-3">
            Profile Picture
          </label>

          <div className="relative w-fit">
            <div className="h-32 w-32 overflow-hidden rounded-full bg-gray-100 ring-2 ring-gray-200">
              <img
                src={profileImageSrc}
                alt="profile"
                onError={() => setImagePreviewError(true)}
                className="h-full w-full object-cover"
              />
            </div>

            <label className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-white shadow-lg transition hover:scale-105 hover:bg-gray-50">
              {isUploadPicture ? (
                <LoadingIndicator />
              ) : (
                <Camera size={18} className="text-gray-700" />
              )}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUploadProfile}
                disabled={isUploadPicture || putState.status === "loading"}
              />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Personal Description
          </label>

          <textarea
            value={form.personalDescription ?? ""}
            onChange={(e) =>
              handleChange("personalDescription", e.target.value || null)
            }
            rows={5}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Tell visitors about yourself..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Email Address
          </label>

          <input
            type="email"
            value={form.email ?? ""}
            onChange={(e) => handleChange("email", e.target.value || null)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="hello@example.com"
          />
        </div>

        {urlFields.map(({ field, label, placeholder }) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-2">{label}</label>

            <input
              type="url"
              value={form[field] ?? ""}
              onChange={(e) => handleChange(field, e.target.value || null)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder={placeholder}
            />
          </div>
        ))}

        <div className="mt-2 flex justify-end">
          <button
            onClick={handleUpdate}
            disabled={updateDisabled}
            className={`rounded-xl px-6 py-3 text-sm font-medium text-white transition ${
              updateDisabled
                ? "cursor-not-allowed bg-gray-300"
                : "bg-black hover:bg-gray-800"
            }`}
          >
            {putState.status === "loading"
              ? "Updating..."
              : isUploadPicture
              ? "Uploading..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
