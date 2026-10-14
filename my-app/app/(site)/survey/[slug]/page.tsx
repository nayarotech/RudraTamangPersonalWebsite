import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SurveyForm } from "@/components/survey/SurveyForm";
import { api } from "@/lib/api";
import { getLang } from "@/lib/lang";
import type { PublicSurvey } from "@/lib/survey";

const getSurvey = (slug: string) => api<PublicSurvey>(`/surveys/${encodeURIComponent(slug)}`);

export async function generateMetadata({ params }: PageProps<"/survey/[slug]">): Promise<Metadata> {
  const survey = await getSurvey((await params).slug);
  if (!survey) return {};
  const description = survey.description?.slice(0, 200) || undefined;
  return { title: survey.title, description, openGraph: { title: survey.title, description } };
}

export default async function SurveyPage({ params }: PageProps<"/survey/[slug]">) {
  const [{ slug }, lang] = await Promise.all([params, getLang()]);
  const survey = await getSurvey(slug);
  if (!survey) notFound();
  return (
    <div className="bg-paper">
      <div className="wrap max-w-3xl py-10 md:py-16">
        <header className="border-t-4 border-blue bg-white px-5 py-8 md:px-10 md:py-10">
          <p className="kicker">{lang === "np" ? "सर्वेक्षण" : "Survey"}</p>
          <h1 className="display mt-4 text-[clamp(2rem,5vw,3rem)] text-ink">{survey.title}</h1>
          {survey.description && <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-muted">{survey.description}</p>}
        </header>
        <div className="mt-4">
          <SurveyForm survey={survey} lang={lang} />
        </div>
      </div>
    </div>
  );
}
