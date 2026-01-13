// Package imagegen provides image generation service using helloagents-go
package imagegen

import (
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/ahhsitt/helloagents-go/pkg/image"
	"github.com/eat-only-in-season/backend/internal/models"
	"github.com/eat-only-in-season/backend/internal/services/ai"
	"github.com/eat-only-in-season/backend/pkg/config"
)

// Service provides image generation functionality
type Service struct {
	config   *config.Config
	provider *ai.ProviderManager
	imageGen image.ImageProvider
}

// NewService creates a new image generation service
func NewService(cfg *config.Config, provider *ai.ProviderManager) (*Service, error) {
	s := &Service{
		config:   cfg,
		provider: provider,
	}

	if err := s.initImageProvider(); err != nil {
		// Image generation is optional, so we don't return an error
		// Just log and continue without image support
		return s, nil
	}

	return s, nil
}

// initImageProvider initializes the image provider based on configuration
func (s *Service) initImageProvider() error {
	var err error

	// Priority 1: Stability AI
	if s.config.HasStability() {
		s.imageGen, err = image.NewImageProvider(image.ProviderStability,
			image.WithAPIKey(s.config.StabilityAPIKey),
		)
		return err
	}

	// Priority 2: OpenAI DALL-E
	if s.config.HasOpenAI() {
		s.imageGen, err = image.NewImageProvider(image.ProviderOpenAI,
			image.WithAPIKey(s.config.OpenAIAPIKey),
		)
		return err
	}

	// Priority 3: DashScope (Wanx)
	if s.config.HasDashScope() {
		s.imageGen, err = image.NewImageProvider(image.ProviderDashScope,
			image.WithAPIKey(s.config.DashScopeAPIKey),
		)
		return err
	}

	return fmt.Errorf("没有配置任何图像生成服务")
}

// IsAvailable checks if image generation is available
func (s *Service) IsAvailable() bool {
	return s.imageGen != nil
}

// GenerateRecipeImage generates an image for a recipe
func (s *Service) GenerateRecipeImage(ctx context.Context, recipe *models.Recipe) (string, error) {
	if !s.IsAvailable() {
		return "", fmt.Errorf("图像生成服务不可用，请配置 Stability AI 或 OpenAI API Key")
	}

	prompt := buildImagePrompt(recipe)

	req := image.ImageRequest{
		Prompt:         prompt,
		ResponseFormat: image.FormatBase64,
		Size:           image.ImageSize{Width: 1024, Height: 1024},
		Style:          image.StylePhotographic,
		Quality:        image.QualityStandard,
	}

	resp, err := s.imageGen.Generate(ctx, req)
	if err != nil {
		return "", fmt.Errorf("生成图片失败: %w", err)
	}

	if len(resp.Images) == 0 {
		return "", fmt.Errorf("没有生成任何图片")
	}

	// Return base64 data if available, otherwise URL will need to be downloaded
	img := resp.Images[0]
	if img.Base64 != "" {
		return img.Base64, nil
	}

	// If we got a URL, we need to download and convert to base64
	if img.URL != "" {
		base64Data, err := downloadAndConvertToBase64(ctx, img.URL)
		if err != nil {
			return "", fmt.Errorf("下载图片失败: %w", err)
		}
		return base64Data, nil
	}

	return "", fmt.Errorf("图片生成响应无效")
}

// buildImagePrompt creates a prompt for image generation
func buildImagePrompt(recipe *models.Recipe) string {
	var sb strings.Builder

	sb.WriteString("A professional food photography shot of ")
	sb.WriteString(recipe.Name)
	sb.WriteString(", a ")
	sb.WriteString(recipe.Cuisine)
	sb.WriteString(" dish. ")

	if len(recipe.SeasonalIngredients) > 0 {
		sb.WriteString("The dish features ")
		sb.WriteString(strings.Join(recipe.SeasonalIngredients[:min(3, len(recipe.SeasonalIngredients))], ", "))
		sb.WriteString(". ")
	}

	sb.WriteString("Beautifully plated on a ceramic dish, natural lighting, warm colors, ")
	sb.WriteString("appetizing presentation, restaurant quality, 4k, photorealistic.")

	return sb.String()
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// downloadAndConvertToBase64 downloads an image from URL and converts to base64
func downloadAndConvertToBase64(ctx context.Context, imageURL string) (string, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", imageURL, nil)
	if err != nil {
		return "", err
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("下载图片失败: HTTP %d", resp.StatusCode)
	}

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	return base64.StdEncoding.EncodeToString(data), nil
}

// GenerateRecipeImageURL generates an image for a recipe and returns the URL directly
func (s *Service) GenerateRecipeImageURL(ctx context.Context, title string, description string) (string, error) {
	if !s.IsAvailable() {
		return "", fmt.Errorf("图像生成服务不可用，请配置图像生成 API Key")
	}

	prompt := buildImagePromptFromTitle(title, description)

	req := image.ImageRequest{
		Prompt:         prompt,
		ResponseFormat: image.FormatURL, // Request URL format
		Size:           image.ImageSize{Width: 1024, Height: 1024},
		Style:          image.StylePhotographic,
		Quality:        image.QualityStandard,
	}

	resp, err := s.imageGen.Generate(ctx, req)
	if err != nil {
		return "", fmt.Errorf("生成图片失败: %w", err)
	}

	if len(resp.Images) == 0 {
		return "", fmt.Errorf("没有生成任何图片")
	}

	img := resp.Images[0]

	// Return URL if available
	if img.URL != "" {
		return img.URL, nil
	}

	// If we got base64, we can't return a URL - this is a limitation
	// In this case, return an error
	return "", fmt.Errorf("图像服务未返回URL格式")
}

// buildImagePromptFromTitle creates a prompt from recipe title and description
// 使用优化的结构化提示词生成
func buildImagePromptFromTitle(title string, description string) string {
	positive, _ := GetOptimizedPrompt(title, description)
	return positive
}
