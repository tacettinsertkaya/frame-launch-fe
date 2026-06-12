import { EditorShell } from "@/components/editor/EditorShell";

export const metadata = {
  title: "Framelaunch — Editör",
  description: "App Store screenshot editörü",
  alternates: {
    canonical: "/editor",
  },
};

export default function EditorPage() {
  return <EditorShell />;
}
