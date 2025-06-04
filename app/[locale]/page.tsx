import { generateStaticParams as generateStaticParamsInner } from "./params"
import PodcastGeneratorClientPage from "./PodcastGeneratorClientPage"

// Define the locales that should be statically generated
export async function generateStaticParams() {
  return generateStaticParamsInner()
}

export default async function LocalePage() {
  return <PodcastGeneratorClientPage />
}
