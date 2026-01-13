// components/PreferenceForm/PreferenceForm.tsx - Diet preference form with character counter

import { useState, useCallback, useEffect } from 'react';

interface PreferenceFormProps {
  initialValue?: string;
  maxLength?: number;
  onSave: (text: string) => void;
}

export function PreferenceForm({
  initialValue = '',
  maxLength = 200,
  onSave
}: PreferenceFormProps) {
  const [text, setText] = useState(initialValue);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setText(initialValue);
  }, [initialValue]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value.slice(0, maxLength);
    setText(newText);
    setIsSaved(false);
  }, [maxLength]);

  const handleSave = useCallback(() => {
    onSave(text);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  }, [text, onSave]);

  const remainingChars = maxLength - text.length;
  const isNearLimit = remainingChars <= 20;

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          value={text}
          onChange={handleChange}
          placeholder="例如：我是素食主义者，不吃辣，喜欢清淡口味..."
          className="w-full h-32 p-4 border border-[#E5E5E5] rounded-lg bg-white text-[#2D2D2D] placeholder-[#999999] focus:ring-2 focus:ring-[#8B9A7D] focus:border-transparent resize-none transition-all duration-[150ms] ease-out"
        />
        <div
          className={`absolute bottom-2 right-2 text-sm ${
            isNearLimit ? 'text-[#C45C5C]' : 'text-[#999999]'
          }`}
        >
          {text.length}/{maxLength}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-[#999999]">
          描述您的饮食偏好，AI 会根据您的需求推荐菜谱
        </p>
        <button
          onClick={handleSave}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-[250ms] ease-out ${
            isSaved
              ? 'bg-[#E8EDE4] text-[#6B7A5D]'
              : 'bg-[#8B9A7D] text-white hover:bg-[#7A8A6D]'
          }`}
        >
          {isSaved ? '已保存' : '保存偏好'}
        </button>
      </div>
    </div>
  );
}

export default PreferenceForm;
