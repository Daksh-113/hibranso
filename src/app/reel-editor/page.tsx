import type { Metadata } from "next";
import { ReelEditor } from "@/components/reel-editor/ReelEditor";

export const metadata: Metadata = {
  title: "Reel Editor",
  robots: { index: false, follow: false },
};

export default function ReelEditorPage() {
  return (
    <main className="min-h-screen bg-ivory">
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">
        <h1 className="font-serif text-3xl text-charcoal">Reel Editor</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone">
          Give it your audio and raw video clips — it detects the beat, auto-cuts the clips to match, and exports a
          finished reel. Everything runs locally in your browser; nothing is uploaded anywhere.
        </p>
        <div className="mt-8">
          <ReelEditor />
        </div>
      </div>
    </main>
  );
}
