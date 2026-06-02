import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getWebsiteProfile } from "../services/WebsiteProfileService";
import type { WebsiteProfileDto } from "../types/WebsiteProfile";

import {
  FaInstagram,
  FaFacebookF,
  FaDiscord,
  FaTwitter,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";

const PLACEHOLDER_IMAGE = "/static/placeholder.jpg";

export function Home() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<WebsiteProfileDto | null>(null);
  const [profileImageError, setProfileImageError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await getWebsiteProfile();
        setProfile(result);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();
  }, []);

  const profileImageSrc =
    profileImageError || !profile?.photoProfile
      ? PLACEHOLDER_IMAGE
      : profile.photoProfile;

  const socialLinks = [
    {
      href: profile?.instagramUrl,
      icon: FaInstagram,
      label: "Instagram",
    },
    {
      href: profile?.facebookUrl,
      icon: FaFacebookF,
      label: "Facebook",
    },
    {
      href: profile?.twitterUrl,
      icon: FaTwitter,
      label: "Twitter",
    },
    {
      href: profile?.discordUrl,
      icon: FaDiscord,
      label: "Discord",
    },
    {
      href: profile?.vgenUrl,
      label: "VGen",
      image: "/static/vgen.png",
    },
    {
      href: profile?.email ? `mailto:${profile.email}` : null,
      icon: MdEmail,
      label: "Email",
    },
  ].filter((x) => x.href);

  return (
    // 👇 Replace every "xl:" prefix with "[@media(min-width:1400px)]:"
    <section className="grid grid-cols-1 overflow-y-auto bg-white [@media(min-width:1400px)]:min-h-[calc(100vh-4rem)] [@media(min-width:1400px)]:grid-cols-[40%_60%]">
      <div className="relative order-1 [@media(min-width:1400px)]:order-2">
        <img
          src="https://storage.vgen.co/uploads/a1bf0db6-d9a5-48ab-bfda-2e6874d71eea/verified/2616R2PQQD7V/4d69fab3-641e-43a8-ae06-182a3a31f0ac.webp"
          alt=""
          className="h-70 w-full object-cover sm:h-100 [@media(min-width:1400px)]:h-full"
        />
        <div
          className="absolute inset-y-0 left-0 hidden w-1/3 [@media(min-width:1400px)]:block"
          style={{
            background:
              "linear-gradient(to right, white 0%, rgba(255,255,255,.95) 40%, rgba(255,255,255,.6) 70%, transparent 100%)",
          }}
        />
      </div>

      <div className="order-2 flex w-full items-center px-6 py-10 sm:px-10 [@media(min-width:1400px)]:order-1 [@media(min-width:1400px)]:px-16">
        <div className="w-full">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-purple-400 sm:text-sm">
            Aedn Commissions
          </h2>

          <h1 className="text-4xl font-bold leading-tight text-slate-950 sm:text-5xl [@media(min-width:1400px)]:text-6xl">
            Welcome To My Page!
          </h1>

          <div className="my-8 flex flex-col gap-8 md:flex-row md:items-center">
            <img
              src={profileImageSrc}
              alt="Profile"
              onError={() => setProfileImageError(true)}
              className="h-32 w-32 rounded-full border border-slate-300 object-cover sm:h-40 sm:w-40 md:h-44 md:w-44"
            />

            <div className="max-w-xs flex flex-col gap-5 whitespace-pre-line text-slate-600">
              {profile?.personalDescription ? (
                profile.personalDescription
              ) : (
                <> No Information </>
              )}
              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={() => navigate("/commissions")}
                  className="flex items-center justify-center gap-2 rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                >
                  My Open Commissions
                  <ArrowUpRight size={18} />
                </button>

                <button className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800">
                  View My Works
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {socialLinks.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.label}
                  href={item.href ?? "#"}
                  target={item.label === "Email" ? undefined : "_blank"}
                  rel={item.label === "Email" ? undefined : "noreferrer"}
                  aria-label={item.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-950 hover:text-white"
                >
                  {Icon ? (
                    <Icon size={18} />
                  ) : item.image ? (
                    <img
                      src={item.image}
                      alt={item.label}
                      className="h-5 w-5 object-contain"
                    />
                  ) : null}
                </a>
              );
            })}

          </div>

        </div>
      </div>
    </section>
  );
}
