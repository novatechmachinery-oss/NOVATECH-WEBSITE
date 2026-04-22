type IntroSectionProps = {
  paragraphs: string[];
};

export default function IntroSection({ paragraphs }: IntroSectionProps) {
  return (
    <section className="mx-auto max-w-[1740px] border border-slate-200 bg-white px-4 py-4 shadow-sm shadow-slate-200/40 sm:px-6">
      <div className="text-center">
        <h1 className="text-lg font-extrabold uppercase tracking-[0.06em] text-sky-800 sm:text-xl">
          Welcome To Novatech Machinery
        </h1>
      </div>

      <div className="mt-2.5 space-y-2 text-[0.92rem] leading-7 text-slate-600 sm:text-[0.98rem]">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
