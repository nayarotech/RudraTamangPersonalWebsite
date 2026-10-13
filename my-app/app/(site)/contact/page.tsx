import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/site/Forms";
import { PageHero } from "@/components/site/Section";
import { SocialLinks } from "@/components/site/Social";
import { getSite } from "@/lib/api";
import { pick, t } from "@/lib/i18n";
import { getLang } from "@/lib/lang";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return { title: t(lang).contact.title };
}

export default async function ContactPage() {
  const [site, lang] = await Promise.all([getSite(), getLang()]);
  const d = t(lang);
  const phone = typeof site.phone === "string" ? site.phone : "";
  const email = typeof site.email === "string" ? site.email : "";
  const map = typeof site.map_embed === "string" && site.map_embed.startsWith("https://") ? site.map_embed : "";

  const rows = [
    { icon: MapPin, label: d.contact.office, value: pick(site, "address", lang) },
    { icon: Phone, label: d.contact.phone, value: phone, href: phone && `tel:${phone.replace(/\s/g, "")}` },
    { icon: Mail, label: d.contact.email, value: email, href: email && `mailto:${email}` },
    { icon: Clock, label: d.contact.hours, value: pick(site, "office_hours", lang) },
  ].filter((r) => r.value);

  return (
    <>
      <PageHero kicker={d.contact.kicker} title={d.contact.title} lead={d.contact.lead} />
      <section className="wrap grid gap-14 py-14 md:py-20 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <ul className="border-t border-line">
            {rows.map(({ icon: Icon, label, value, href }) => (
              <li key={label} className="flex gap-5 border-b border-line py-6">
                <Icon className="mt-0.5 size-5 shrink-0 text-blue" strokeWidth={1.75} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
                  {href ? (
                    <a href={href} className="mt-1 block text-lg font-medium hover:text-blue">
                      {value}
                    </a>
                  ) : (
                    <p className="mt-1 text-lg font-medium">{value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <SocialLinks site={site} className="mt-6 -ml-2" iconClass="text-muted hover:text-blue" />
          {map && (
            <div className="mt-8 aspect-[4/3] border border-line bg-paper">
              <iframe src={map} title={d.contact.office} className="h-full w-full grayscale-[40%]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          )}
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <div className="border border-line p-6 md:p-10">
            <ContactForm d={d} />
          </div>
        </div>
      </section>
    </>
  );
}
