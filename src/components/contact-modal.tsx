import {
  FaInstagram,
  FaFacebookF,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import type { ContactInfoDto } from "../types/WebsiteProfile";
import Modal from "./modal";
import { useEffect, useState } from "react";
import { getContact } from "../services/WebsiteProfileService";

type ContactModalProps = {
  onClose: () => void;
};

export default function ContactModal({  onClose }: ContactModalProps) {
  const [profile, setProfile] = useState<ContactInfoDto | null>(null);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await getContact();
        setProfile(result);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();
  }, []);
  const contacts = [
    {
      href: profile?.whatsappUrl,
      icon: FaWhatsapp,
      label: "WhatsApp",
    },
    {
      href: profile?.twitterUrl,
      icon: FaTwitter,
      label: "Twitter",
    },
    {
      href: profile?.facebookUrl,
      icon: FaFacebookF,
      label: "Facebook",
    },
    {
      href: profile?.instagramUrl,
      icon: FaInstagram,
      label: "Instagram",
    },
    {
      href: profile?.email ? `mailto:${profile.email}` : null,
      icon: MdEmail,
      label: "Email",
    },
  ].filter((item) => item.href);

  return (
    <Modal title="Contact" onClose={onClose} size="sm">
      <div className="flex flex-col gap-3">
        {contacts.length > 0 ? (
          contacts.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.label}
                href={item.href ?? "#"}
                target={item.label === "Email" ? undefined : "_blank"}
                rel={item.label === "Email" ? undefined : "noreferrer"}
                className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-950 hover:text-white"
              >
                <Icon size={20} />
                {item.label}
              </a>
            );
          })
        ) : (
          <p className="text-sm text-gray-400">No contact available.</p>
        )}
      </div>
    </Modal>
  );
}
