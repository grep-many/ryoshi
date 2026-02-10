import { JapaneseWord, useAITeacher } from "@/hooks";
type Props = {
  japanese?: JapaneseWord[];
};
export const RenderJapanese = ({ japanese }: Props) => {
  if (!japanese) return;
  const { furigana } = useAITeacher();
  return (
    <div className="font-jp mt-2 flex flex-wrap gap-1 text-4xl font-bold text-white">
      {japanese.map((word, i) => (
        <span key={i} className="flex flex-col items-center justify-end">
          {furigana && word.reading && (
            <span className="text-2xl text-white/65">{word.reading}</span>
          )}
          {word.word}
        </span>
      ))}
    </div>
  );
};
