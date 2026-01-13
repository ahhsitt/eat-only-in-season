// Package ai provides AI provider management
package ai

import (
	"github.com/eat-only-in-season/backend/internal/models"
	"github.com/eat-only-in-season/backend/pkg/config"
)

// ProviderManager manages AI service providers
type ProviderManager struct {
	config         *config.Config
	llmProviders   []models.AIProvider
	imageProviders []models.AIProvider
	activeLLM      string
	activeImage    string
}

// NewProviderManager creates a new provider manager
func NewProviderManager(cfg *config.Config) *ProviderManager {
	pm := &ProviderManager{
		config: cfg,
	}
	pm.detectProviders()
	return pm
}

// detectProviders detects available AI providers from configuration
func (pm *ProviderManager) detectProviders() {
	// LLM Providers (priority order)
	pm.llmProviders = []models.AIProvider{
		{
			Type:      models.AIProviderTypeLLM,
			Provider:  "OpenAI",
			Model:     "gpt-4o-mini",
			Available: pm.config.HasOpenAI(),
			Priority:  1,
		},
		{
			Type:      models.AIProviderTypeLLM,
			Provider:  "DeepSeek",
			Model:     "deepseek-chat",
			Available: pm.config.HasDeepSeek(),
			Priority:  2,
		},
		{
			Type:      models.AIProviderTypeLLM,
			Provider:  "Qwen",
			Model:     "qwen-plus",
			Available: pm.config.HasDashScope(),
			Priority:  3,
		},
		{
			Type:      models.AIProviderTypeLLM,
			Provider:  "Ollama",
			Model:     "llama3",
			Available: pm.config.HasOllama(),
			Priority:  4,
		},
	}

	// Image Providers (priority order)
	pm.imageProviders = []models.AIProvider{
		{
			Type:      models.AIProviderTypeImage,
			Provider:  "DALL-E",
			Model:     "dall-e-3",
			Available: pm.config.HasOpenAI(),
			Priority:  1,
		},
		{
			Type:      models.AIProviderTypeImage,
			Provider:  "通义万象",
			Model:     "wanx-v1",
			Available: pm.config.HasDashScope(),
			Priority:  2,
		},
		{
			Type:      models.AIProviderTypeImage,
			Provider:  "Stability AI",
			Model:     "stable-diffusion-xl",
			Available: pm.config.HasStability(),
			Priority:  3,
		},
	}

	// Set active providers
	pm.activeLLM = pm.getActiveProvider(pm.llmProviders)
	pm.activeImage = pm.getActiveProvider(pm.imageProviders)
}

// getActiveProvider finds the first available provider
func (pm *ProviderManager) getActiveProvider(providers []models.AIProvider) string {
	for _, p := range providers {
		if p.Available {
			return p.Provider
		}
	}
	return ""
}

// GetLLMProviders returns all LLM providers with their status
func (pm *ProviderManager) GetLLMProviders() []models.AIProvider {
	return pm.llmProviders
}

// GetImageProviders returns all image providers with their status
func (pm *ProviderManager) GetImageProviders() []models.AIProvider {
	return pm.imageProviders
}

// GetActiveLLM returns the currently active LLM provider name
func (pm *ProviderManager) GetActiveLLM() string {
	return pm.activeLLM
}

// GetActiveImage returns the currently active image provider name
func (pm *ProviderManager) GetActiveImage() string {
	return pm.activeImage
}

// HasLLM returns true if any LLM provider is available
func (pm *ProviderManager) HasLLM() bool {
	return pm.activeLLM != ""
}

// HasImageGen returns true if any image generation provider is available
func (pm *ProviderManager) HasImageGen() bool {
	return pm.activeImage != ""
}

// GetStatus returns the full system status
func (pm *ProviderManager) GetStatus() models.SystemStatusResponse {
	return models.SystemStatusResponse{
		LLMProviders:   pm.llmProviders,
		ImageProviders: pm.imageProviders,
		ActiveLLM:      pm.activeLLM,
		ActiveImage:    pm.activeImage,
	}
}

// GetConfig returns the config for external use
func (pm *ProviderManager) GetConfig() *config.Config {
	return pm.config
}
