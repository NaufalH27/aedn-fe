import React, { useMemo, useState, useRef } from "react";
import type { ReqProduct } from "../../types/Products";
import { getUploadProductSignedUrl, submitProduct } from "../../services/ProductService";
import Markdown from 'react-markdown'
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { uploadS3 } from "../../services/S3Service";

type Status = "idle" | "loading" | "success" | "error";


export type FormState = {
  title: string;
  price: string;
  currencyCode: string;
  description: string;
  categoryName: string;
  pictureUrls: string[];
  isActive: boolean;
};

type Props = {
  categories: string[];
  onSuccess?: () => void;
};

function getFileExtension(file: File): string {
  if (file.type) {
    const mimeMap: Record<string, string> = {
      "image/png": "png",
      "image/jpeg": "jpeg",
      "image/jpg": "jpeg",
      "image/gif": "gif",
      "image/webp": "webp",
      "image/bmp": "bmp",
      "image/tiff": "tiff",
      "image/avif": "avif"
    };

    if (mimeMap[file.type]) {
      return mimeMap[file.type];
    }
  }
  throw Error("Unsupported Type File")

}


const currencyList = ["USD", "IDR", "CNY", "RM", "SGD"];

export default function CreateProductForm({
  categories,
  onSuccess,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pictureUrls, setPictureUrls] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);


  const titleRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const [form, setForm] = useState<FormState>({
    title: "",
    price: "",
    currencyCode: "USD",
    description: "",
    categoryName: "",
    pictureUrls: [],
    isActive: true,
  });

  const [categoryInput, setCategoryInput] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);

  const filteredCategories = useMemo(() => {
    if (!categoryInput.trim()) return categories;

    return categories.filter((item) =>
      item.toLowerCase().includes(categoryInput.toLowerCase())
    );
  }, [categories, categoryInput]);

  const setValue = (name: keyof FormState, value: any) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const selectCategory = (value: string) => {
    setValue("categoryName", value);
    setCategoryInput("");
    setShowSuggestion(false);
  };

  const clearCategory = () => {
    setValue("categoryName", "");
    setCategoryInput("");
    setShowSuggestion(true);
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    const payload: ReqProduct = {
      title: form.title,
      price: Number(form.price),
      currencyCode: form.currencyCode,
      description: form.description,
      categoryName:(form.categoryName || categoryInput).trim() || null,
      pictureUrls: pictureUrls,
      isActive: form.isActive,
      quantity: 1,
    };

    setStatus("loading");
    setError(null);

    try {
      await submitProduct(payload);
      setStatus("success");

      setForm({
        title: "",
        price: "",
        currencyCode: "USD",
        description: "",
        categoryName: "",
        pictureUrls: [],
        isActive: true,
      });

      onSuccess?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error";

      setError(message);
      setStatus("error");
    }
  };
  const nextOnEnter = (
    e: React.KeyboardEvent,
    nextRef?: React.RefObject<
    HTMLInputElement | HTMLTextAreaElement | null
    >
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        setError("Cant read File")
        return
      }
      const ext = getFileExtension(file)
    try {
      const signedUrl = await getUploadProductSignedUrl(ext);
      await uploadS3(signedUrl.s3SignedUrl, file, file.type)
      setImages((prev) => [...prev, signedUrl.url]);
      setPictureUrls((prev) => [...prev, signedUrl.key]);
      
    } catch (error) {
      if (error instanceof Error){
        setError(error.message)
      }
        setError("Something Unexpected Happend")
    }

  };

  const underline =
    "border-b border-gray-300 focus-within:border-black focus-within:shadow-[0_2px_0_0_rgba(0,0,0,1)] transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className={underline}>
        <input
          ref={titleRef}
          value={form.title}
          onChange={(e) => setValue("title", e.target.value)}
          placeholder="Commission Title"
          className="w-full py-3 outline-none bg-transparent"
          required
          onKeyDown={(e) => nextOnEnter(e, priceRef)}
        />
      </div>

      <div className="grid gap-5 grid-cols-[1fr_5fr]">

        <div className={underline}>
          <select
            value={form.currencyCode}
            onChange={(e) =>
              setValue("currencyCode", e.target.value)
            }
            className="w-full py-3 outline-none bg-transparent"
          >
            {currencyList.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className={underline}>
          <input
            ref={priceRef}
            type="number"
            value={form.price}
            onChange={(e) => setValue("price", e.target.value)}
            placeholder="Price"
            className="w-full py-3 outline-none bg-transparent"
            onKeyDown={(e) => nextOnEnter(e, categoryRef)}
            required
          />
        </div>
      </div>
      <div className="relative">
        <div className={underline}>
          {!form.categoryName ? (
            <input
              ref={categoryRef}
              onKeyDown={(e) => nextOnEnter(e, descRef)}
              value={categoryInput}
              onChange={(e) => {
                setCategoryInput(e.target.value);
              }}
              onFocus={() => setShowSuggestion(true)}
              onBlur={() => {
                setTimeout(() => setShowSuggestion(false), 150);
              }}
              placeholder="Category"
              className="w-full py-3 outline-none bg-transparent"
            />
          ) : (
            <div className="py-2 flex items-center gap-2">
              <div className="px-4 py-1.5 rounded-full bg-black text-white text-sm flex items-center gap-2">
                <span>{form.categoryName}</span>

                <button
                  type="button"
                  onClick={clearCategory}
                  className="hover:opacity-70"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {!showSuggestion &&
          !form.categoryName &&
          categoryInput.trim() &&
          !filteredCategories.some(
            (item) =>
              item.toLowerCase() ===
              categoryInput.trim().toLowerCase()
          ) && (
            <p className="mt-2 text-sm text-red-500">
              * New Category
            </p>
        )}
        {showSuggestion &&
          !form.categoryName &&
          filteredCategories.length > 0 && (
            <div className="absolute z-30 mt-2 w-full rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
              {filteredCategories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => selectCategory(item)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
      </div>

      <div className={underline}>
        <textarea
          ref={descRef}
          rows={10}
          value={form.description}
          onChange={(e) =>
            setValue("description", e.target.value)
          }
          placeholder="Description"
          className="w-full py-3 outline-none bg-transparent resize-none"
        />
      </div>
      { form.description && (
      <div className="prose max-w-none overflow-auto">
      <p className="font-bold"> Description Preview (markdown): </p>
        <div className="border border-gray-300 p-1 m-2 -px-5">
          <Markdown 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {form.description}
          </Markdown>
        </div>
      </div>

      )}
      <div>
        <p className="text-sm text-gray-500 mb-3">Status</p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setValue("isActive", true)}
            className={`px-4 py-2 rounded-full border transition ${
              form.isActive
                ? "bg-black text-white border-black"
                : "border-gray-300"
            }`}
          >
            Open
          </button>

          <button
            type="button"
            onClick={() => setValue("isActive", false)}
            className={`px-4 py-2 rounded-full border transition ${
              !form.isActive
                ? "bg-black text-white border-black"
                : "border-gray-300"
            }`}
          >
            Closed
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">

        {images.map((src, index) => (
          <div
            key={index}
            className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100"
          >
            <img
              src={src}
              alt={`upload-${index}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        <label className="w-28 h-28 bg-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-300 transition">
          <span className="text-4xl text-gray-500 font-light">+</span>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-2xl bg-black text-white py-3 hover:bg-gray-800 transition disabled:opacity-60"
      >
        {status === "loading"
          ? "Creating..."
          : "Create Commission"}
      </button>

      {status === "success" && (
        <p className="text-sm text-green-600">
          Product created successfully.
        </p>
      )}
    </form>
  );
}


