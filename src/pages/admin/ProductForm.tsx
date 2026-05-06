import React, { useMemo, useState, useRef, useEffect } from "react"; 
import type { ReqProduct } from "../../types/Products";
import { editProduct, getUploadProductSignedUrl, submitProduct } from "../../services/ProductService";
import Markdown from 'react-markdown'
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { uploadS3 } from "../../services/S3Service";
import { currencyList } from "../../helper/currency";

type Status = "idle" | "loading" | "success" | "error";


export type FormState = {
  id?: string;
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
  data?: FormState;
  onSuccess?: () => void;
  edit?: Boolean;
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

const extractKey = (url: string) => {
  try {
    const u = new URL(url);
    return u.pathname.replace(/^\/+/, ""); 
  } catch {
    return url; 
  }
};


export default function ProductForm({
  categories,
  onSuccess,
  data = {
    title: "",
    price: "",
    currencyCode: "USD",
    description: "",
    categoryName: "",
    pictureUrls: [],
    isActive: true,
  },
  edit = false 
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(data.pictureUrls);


  const titleRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormState>(data);

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

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center", 
      });
    }
  }, [error]);

  const selectCategory = (value: string) => {
    setValue("categoryName", value);
    setCategoryInput("");
    setShowSuggestion(false);
  };

  const clearCategory = () => {
    setValue("categoryName", "");
    setCategoryInput("");
  };

  const handleEdit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setStatus("loading")
    setError(null);

    const payload: ReqProduct = {
      title: form.title,
      price: Number(form.price),
      currencyCode: form.currencyCode,
      description: form.description,
      categoryName:(form.categoryName || categoryInput).trim() || null,
      pictureUrls: images.map(extractKey),
      isActive: form.isActive,
      quantity: 1,
    };

    if (!form.id) {
      setError("Oops, it seems like the product cant be modified for now")
      return
    }


    try {
      await editProduct(payload, form.id);
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

  const resizeTextarea = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";

    const minHeight = 100;
    const maxHeight = 200;

    el.style.height =
      Math.min(Math.max(el.scrollHeight, minHeight), maxHeight) + "px";
  };
  useEffect(() => {
    if (descRef.current) {
      resizeTextarea(descRef.current);
    }
  }, []);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    const payload: ReqProduct = {
      title: form.title,
      price: Number(form.price),
      currencyCode: form.currencyCode,
      description: form.description,
      categoryName:(form.categoryName || categoryInput).trim() || null,
      pictureUrls: images.map(extractKey),
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
  const handleRemoveImage = (indexToRemove: Number) => {
    setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setError(null);
      if (!file) {
        setError("Cant read File")
        return
      }
      const ext = getFileExtension(file)
    try {
      const signedUrl = await getUploadProductSignedUrl(ext);
      await uploadS3(signedUrl.s3SignedUrl, file, file.type)
      setImages((prev) => [...prev, signedUrl.url]);
      
    } catch (error) {
      if (error instanceof Error){
        setError(error.message)

      } else {
        setError("Something Unexpected Happend")
      }
    } finally {
      e.target.value = "";
    }

  };

  const underline =
    "border-b border-gray-300 focus-within:border-black focus-within:shadow-[0_2px_0_0_rgba(0,0,0,1)] transition-all";

  return (
    <div className="relative">
      {status === "loading" && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-50 flex items-center justify-center rounded-2xl">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
        </div>
      )}

    <form onSubmit={edit ? handleEdit : handleSubmit} 
      className={`space-y-7 transition ${
          status === "loading" ? "opacity-50 pointer-events-none" : ""
        }`}
    >
      {error && (
        <div  ref={errorRef} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className={underline}>
        <p className="font-bold"> Title </p>
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


      <p className="font-bold"> Price </p>
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

      <p className="font-bold"> Category </p>
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
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectCategory(item);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
      </div>

      <div className={underline}>
        <p className="font-bold"> Description </p>
        <textarea
          ref={descRef}
          value={form.description}
          onChange={(e) => {
            setValue("description", e.target.value);
            resizeTextarea(e.target);
          }}
          placeholder="Description"
          className="w-full py-3 outline-none bg-transparent resize-none overflow-y-auto"
        />

      </div>
      { form.description && (
      <div className="prose max-w-none overflow-auto">
      <p className="font-bold"> Description Preview (markdown): </p>
        <div className="border border-gray-300 px-4 m-2 ">
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
          <div key={index} className="relative w-28 h-28">
            <div className="w-full h-full rounded-xl overflow-hidden bg-gray-100">
              <img
                src={src}
                alt={`upload-${index}`}
                className="w-full h-full object-cover"
              />
            </div>

            <div
              onClick={() => handleRemoveImage(index)}
              className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 z-10"
            >
              −
            </div>
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
          ? edit ? "Editing..." : "Creating..." 
          : edit ? "Edit Comission" : "Create Commission"}
      </button>

    </form>
  </div>
  );
}


