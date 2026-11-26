import { useEffect, useState } from "react";
import { IndexPage } from "./components/IndexPage";
import { ReportView } from "./components/ReportView";
import { findDoc } from "./lib/docs";

type Route = { kind: "index" } | { kind: "report"; slug: string };

function parseHash(): Route {
  const raw = window.location.hash.replace(/^#/, "");
  const match = raw.match(/^\/report\/(.+)$/);
  if (!match?.[1]) {
    return { kind: "index" };
  }
  return { kind: "report", slug: decodeURIComponent(match[1]) };
}

export function App() {
  const [route, setRoute] = useState<Route>(() => parseHash());

  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  if (route.kind === "report") {
    const doc = findDoc(route.slug);
    if (!doc) {
      return (
        <main className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-2xl font-semibold">Document not found</h1>
          <p className="mt-3 text-neutral-600">
            No document matches <code>{route.slug}</code>.
          </p>
          <a className="mt-6 inline-block text-blue-700" href="#/">
            Back to all documents
          </a>
        </main>
      );
    }
    return <ReportView doc={doc} />;
  }

  return <IndexPage />;
}
