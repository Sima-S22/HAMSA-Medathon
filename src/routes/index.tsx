import { createFileRoute } from "@tanstack/react-router";
import { PhaseOne } from '@/components/hamsa/phase-one';

// The home route ships no og:image, so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: 'HAMSA | همسة — Share how you feel' },
    { name: 'description', content: 'A bilingual child-friendly experience for communicating symptoms with original HAMSA characters and interactive rooms. Communication support only.' },
    { property: 'og:title', content: 'HAMSA | همسة' },
    { property: 'og:description', content: 'A child-friendly bilingual symptom communication experience.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: PhaseOne,
});
