// components/AIStatus/AIStatusBadge.tsx - AI service status indicator

import { useState, useEffect } from 'react';
import { getSystemStatus } from '../../services/api';

interface AIProvider {
  name: string;
  type: 'llm' | 'image';
  status: 'available' | 'unavailable' | 'degraded';
}

export function AIStatusBadge() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await getSystemStatus();
        const providerList: AIProvider[] = [];

        if (response.activeLlm) {
          providerList.push({
            name: response.activeLlm,
            type: 'llm',
            status: 'available'
          });
        }

        if (response.activeImage) {
          providerList.push({
            name: response.activeImage,
            type: 'image',
            status: 'available'
          });
        }

        setProviders(providerList);
      } catch {
        setProviders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[#999999] bg-[#F5F0EB] rounded-full">
        <span className="animate-pulse">●</span>
        <span>检测中...</span>
      </span>
    );
  }

  const hasLLM = providers.some(p => p.type === 'llm');
  const hasImage = providers.some(p => p.type === 'image');

  const statusColor = hasLLM
    ? 'bg-[#E8EDE4] text-[#6B7A5D]'
    : 'bg-[#FDF2F2] text-[#C45C5C]';

  const statusIcon = hasLLM ? '●' : '○';
  const statusText = hasLLM
    ? (hasImage ? '全部就绪' : '文本就绪')
    : '未配置';

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-all duration-[250ms] ease-out ${statusColor}`}
      >
        <span>{statusIcon}</span>
        <span>AI {statusText}</span>
      </button>

      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-[#F5F0EB] p-4 z-10">
          <p className="text-xs font-medium text-[#2D2D2D] mb-3">AI 服务状态</p>
          <div className="space-y-2">
            {providers.length === 0 ? (
              <p className="text-xs text-[#999999]">未检测到可用的 AI 服务</p>
            ) : (
              providers.map((provider, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-[#666666]">
                    {provider.type === 'llm' ? '文本生成' : '图像生成'}
                  </span>
                  <span className="text-[#8B9A7D]">{provider.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AIStatusBadge;
