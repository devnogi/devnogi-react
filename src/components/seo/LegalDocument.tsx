type LegalDocumentProps = {
  title: string;
  content: string;
};

export default function LegalDocument({ title, content }: LegalDocumentProps) {
  return (
    <article className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-navy-600 dark:bg-navy-800 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
        {title}
      </h1>
      <pre className="mt-6 whitespace-pre-wrap font-sans text-sm leading-7 text-gray-700 dark:text-gray-200">
        {content.trim()}
      </pre>
    </article>
  );
}
