import { useAITeacher } from "@/hooks";

type Props = {
  englishText?: string;
};

export const RenderEnglish = ({ englishText }: Props) => {
  if (!englishText) return;
  const { english } = useAITeacher();
  return (
    <>
      {english && (
        <p className="inline-block rounded-sm bg-linear-to-br from-blue-300/90 to-white/90 bg-clip-text px-2 text-4xl font-bold text-transparent">
          {englishText}
        </p>
      )}
    </>
  );
};
