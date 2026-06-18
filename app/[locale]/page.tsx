import { redirect } from "next/navigation";
import type { Locale } from "@/i18n/routing";

export default function IndexPage({ params }: { params: { locale: Locale } }) {
  redirect(`/${params.locale}/app/home`);
}
