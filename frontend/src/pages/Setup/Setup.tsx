// pages/Setup/Setup.tsx - AI service configuration guide

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSystemStatus, healthCheck } from '../../services/api';

interface ProviderConfig {
  name: string;
  envVar: string;
  description: string;
  docsUrl?: string;
}

const llmProviders: ProviderConfig[] = [
  {
    name: 'OpenAI',
    envVar: 'OPENAI_API_KEY',
    description: 'GPT-4/3.5 系列模型',
    docsUrl: 'https://platform.openai.com/'
  },
  {
    name: 'DeepSeek',
    envVar: 'DEEPSEEK_API_KEY',
    description: 'DeepSeek 大语言模型',
    docsUrl: 'https://deepseek.com/'
  },
  {
    name: 'DashScope (Qwen)',
    envVar: 'DASHSCOPE_API_KEY',
    description: '阿里通义千问',
    docsUrl: 'https://dashscope.aliyun.com/'
  },
  {
    name: 'Ollama',
    envVar: 'OLLAMA_HOST',
    description: '本地运行的开源模型',
    docsUrl: 'https://ollama.ai/'
  }
];

const imageProviders: ProviderConfig[] = [
  {
    name: 'Stability AI',
    envVar: 'STABILITY_API_KEY',
    description: 'Stable Diffusion 图像生成',
    docsUrl: 'https://stability.ai/'
  },
  {
    name: 'OpenAI DALL-E',
    envVar: 'OPENAI_API_KEY',
    description: 'DALL-E 3 图像生成（需 OpenAI Key）'
  },
  {
    name: 'DashScope Wanx',
    envVar: 'DASHSCOPE_API_KEY',
    description: '通义万相图像生成（需 DashScope Key）'
  }
];

export function Setup() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [llmProvider, setLlmProvider] = useState<string | null>(null);
  const [imageProvider, setImageProvider] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const connected = await healthCheck();
        setIsConnected(connected);

        if (connected) {
          const status = await getSystemStatus();
          setLlmProvider(status.activeLlm || null);
          setImageProvider(status.activeImage || null);
        }
      } catch {
        setIsConnected(false);
      }
    };

    checkStatus();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F4]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          to="/"
          className="inline-flex items-center text-[#8B9A7D] hover:text-[#7A8A6D] mb-6 transition-colors duration-[250ms] ease-out"
        >
          <span className="mr-1">←</span>
          <span>返回首页</span>
        </Link>

        <h1 className="text-2xl font-semibold text-[#2D2D2D] mb-6">AI 服务配置</h1>

        {/* Connection status */}
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#2D2D2D] mb-4">服务状态</h2>

          {isConnected === null ? (
            <p className="text-[#999999]">检测中...</p>
          ) : isConnected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#8B9A7D]">
                <span>●</span>
                <span>后端服务已连接</span>
              </div>
              {llmProvider ? (
                <div className="flex items-center gap-2 text-[#8B9A7D]">
                  <span>●</span>
                  <span>文本生成: {llmProvider}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[#C45C5C]">
                  <span>○</span>
                  <span>文本生成: 未配置</span>
                </div>
              )}
              {imageProvider ? (
                <div className="flex items-center gap-2 text-[#8B9A7D]">
                  <span>●</span>
                  <span>图像生成: {imageProvider}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[#8B8B5B]">
                  <span>○</span>
                  <span>图像生成: 未配置（可选）</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#C45C5C]">
              <span>○</span>
              <span>无法连接后端服务，请检查服务是否运行</span>
            </div>
          )}
        </div>

        {/* LLM Providers */}
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#2D2D2D] mb-4">
            文本生成服务（必需）
          </h2>
          <p className="text-sm text-[#666666] mb-4">
            至少配置一个以下服务的 API Key：
          </p>
          <div className="space-y-4">
            {llmProviders.map((provider) => (
              <div
                key={provider.envVar}
                className="flex items-start gap-4 p-4 bg-[#F5F0EB] rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-[#2D2D2D]">{provider.name}</h3>
                  <p className="text-sm text-[#999999]">{provider.description}</p>
                  <code className="text-xs text-[#6B7A5D] bg-[#E8EDE4] px-2 py-1 rounded mt-1 inline-block">
                    {provider.envVar}
                  </code>
                </div>
                {provider.docsUrl && (
                  <a
                    href={provider.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#8B9A7D] hover:text-[#7A8A6D] transition-colors duration-[150ms] ease-out"
                  >
                    文档
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Image Providers */}
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#2D2D2D] mb-4">
            图像生成服务（可选）
          </h2>
          <p className="text-sm text-[#666666] mb-4">
            配置后可生成菜品图片：
          </p>
          <div className="space-y-4">
            {imageProviders.map((provider) => (
              <div
                key={provider.name}
                className="flex items-start gap-4 p-4 bg-[#F5F0EB] rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-[#2D2D2D]">{provider.name}</h3>
                  <p className="text-sm text-[#999999]">{provider.description}</p>
                  <code className="text-xs text-[#6B7A5D] bg-[#E8EDE4] px-2 py-1 rounded mt-1 inline-block">
                    {provider.envVar}
                  </code>
                </div>
                {provider.docsUrl && (
                  <a
                    href={provider.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#8B9A7D] hover:text-[#7A8A6D] transition-colors duration-[150ms] ease-out"
                  >
                    文档
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[#F5EBE6] border border-[#E5D5C5] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[#8B6B5B] mb-2">配置说明</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-[#8B6B5B]">
            <li>复制 <code className="bg-[#E5D5C5] px-1 rounded">.env.example</code> 为 <code className="bg-[#E5D5C5] px-1 rounded">.env</code></li>
            <li>填写至少一个 LLM 服务的 API Key</li>
            <li>重启后端服务</li>
            <li>刷新此页面检查状态</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Setup;
