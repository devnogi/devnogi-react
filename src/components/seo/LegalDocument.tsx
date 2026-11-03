type LegalDocumentProps = {
  title: string;
  content: string;
};

export default function LegalDocument({ title, content }: LegalDocumentProps) {
  return (
    <article className="mx-auto max-w-3xl rounded-lg border border-border bg-card p-5 sm:p-8">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <pre className="mt-6 whitespace-pre-wrap break-words font-sans text-sm leading-7 text-gray-700 dark:text-gray-200">
        {content.trim()}
      </pre>
    </article>
  );
}
