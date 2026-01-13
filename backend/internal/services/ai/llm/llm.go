// Package llm provides LLM service using helloagents-go
package llm

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/ahhsitt/helloagents-go/pkg/agents"
	"github.com/ahhsitt/helloagents-go/pkg/core/llm"
	"github.com/eat-only-in-season/backend/internal/models"
	"github.com/eat-only-in-season/backend/internal/services/ai"
	"github.com/eat-only-in-season/backend/pkg/config"
)

// Service provides LLM functionality
type Service struct {
	config   *config.Config
	provider *ai.ProviderManager
	llm      llm.Provider
}

// NewService creates a new LLM service
func NewService(cfg *config.Config, provider *ai.ProviderManager) (*Service, error) {
	s := &Service{
		config:   cfg,
		provider: provider,
	}

	if err := s.initLLM(); err != nil {
		return nil, err
	}

	return s, nil
}

// initLLM initializes the LLM provider based on configuration
func (s *Service) initLLM() error {
	var err error

	// Priority 1: OpenAI
	if s.config.HasOpenAI() {
		opts := []llm.Option{llm.WithAPIKey(s.config.OpenAIAPIKey)}
		if s.config.OpenAIBaseURL != "" {
			opts = append(opts, llm.WithBaseURL(s.config.OpenAIBaseURL))
		}
		s.llm, err = llm.NewOpenAI(opts...)
		return err
	}

	// Priority 2: DeepSeek
	if s.config.HasDeepSeek() {
		s.llm, err = llm.NewDeepSeek(llm.WithAPIKey(s.config.DeepSeekAPIKey))
		return err
	}

	// Priority 3: DashScope (Qwen)
	if s.config.HasDashScope() {
		s.llm, err = llm.NewOpenAI(
			llm.WithAPIKey(s.config.DashScopeAPIKey),
			llm.WithBaseURL("https://dashscope.aliyuncs.com/compatible-mode/v1"),
			llm.WithModel("qwen-plus"),
		)
		return err
	}

	// Priority 4: Ollama
	if s.config.HasOllama() {
		s.llm = llm.NewOllamaClient(
			llm.WithOllamaBaseURL(s.config.OllamaHost),
			llm.WithOllamaModel("llama3"),
		)
		return nil
	}

	return fmt.Errorf("没有配置任何 LLM 服务，请设置 API Key 环境变量")
}

// GenerateRecipes generates seasonal recipe recommendations using LLM
func (s *Service) GenerateRecipes(ctx context.Context, city *models.City, season models.Season, preferenceText string) ([]models.Recipe, error) {
	if !s.provider.HasLLM() {
		return nil, fmt.Errorf("没有可用的 LLM 服务，请配置 API Key")
	}

	prompt := s.buildRecipePrompt(city, season, preferenceText)

	response, err := s.callLLM(ctx, prompt)
	if err != nil {
		return nil, fmt.Errorf("生成菜谱失败: %w", err)
	}

	recipes, err := s.parseRecipeResponse(response)
	if err != nil {
		return nil, fmt.Errorf("解析菜谱响应失败: %w", err)
	}

	return recipes, nil
}

// GenerateRecipeDetail generates detailed recipe information
func (s *Service) GenerateRecipeDetail(ctx context.Context, recipe *models.Recipe, city *models.City, season models.Season) (*models.RecipeDetail, error) {
	if !s.provider.HasLLM() {
		return nil, fmt.Errorf("没有可用的 LLM 服务，请配置 API Key")
	}

	prompt := s.buildDetailPrompt(recipe, city, season)

	response, err := s.callLLM(ctx, prompt)
	if err != nil {
		return nil, fmt.Errorf("生成菜谱详情失败: %w", err)
	}

	detail, err := s.parseDetailResponse(response, recipe.ID)
	if err != nil {
		return nil, fmt.Errorf("解析菜谱详情失败: %w", err)
	}

	return detail, nil
}

// buildRecipePrompt builds the prompt for recipe generation
func (s *Service) buildRecipePrompt(city *models.City, season models.Season, preferenceText string) string {
	var sb strings.Builder

	sb.WriteString("你是一位专业的美食推荐专家，精通全球各地的饮食文化和应季食材。\n\n")
	sb.WriteString("## 任务\n")
	sb.WriteString("请根据以下信息，推荐 3-5 道应季菜谱。\n\n")

	sb.WriteString("## 上下文信息\n")
	sb.WriteString(fmt.Sprintf("- 城市：%s\n", city.DisplayName))
	if city.Country != "" {
		sb.WriteString(fmt.Sprintf("- 国家/地区：%s\n", city.Country))
	}
	sb.WriteString(fmt.Sprintf("- 当前季节：%s（%s）\n", season.Name, string(season.Hemisphere)+"半球"))

	if preferenceText != "" {
		sb.WriteString(fmt.Sprintf("- 用户偏好：%s\n", preferenceText))
	}

	sb.WriteString("\n## 要求\n")
	sb.WriteString("1. 推荐的菜谱应该使用当季应季食材\n")
	sb.WriteString("2. 菜系风格应符合该城市的当地饮食文化\n")
	sb.WriteString("3. 如果用户有特殊偏好（如素食、过敏等），请严格遵守\n")
	sb.WriteString("4. 每道菜需要包含简短描述（50字以内）\n")
	sb.WriteString("5. 标注烹饪难度（easy/medium/hard）和预计时间（分钟）\n\n")

	sb.WriteString("## 输出格式\n")
	sb.WriteString("请以 JSON 数组格式输出，每个菜谱包含以下字段：\n")
	sb.WriteString("```json\n")
	sb.WriteString(`[
  {
    "name": "菜名",
    "description": "简短描述（50字以内）",
    "cookingTime": 30,
    "difficulty": "easy|medium|hard",
    "seasonalIngredients": ["应季食材1", "应季食材2"],
    "cuisine": "菜系风格"
  }
]
`)
	sb.WriteString("```\n")
	sb.WriteString("\n请只输出 JSON，不要添加其他说明文字。")

	return sb.String()
}

// buildDetailPrompt builds the prompt for recipe detail generation
func (s *Service) buildDetailPrompt(recipe *models.Recipe, city *models.City, season models.Season) string {
	var sb strings.Builder

	sb.WriteString("你是一位专业的厨师和美食作家，擅长编写详细易懂的菜谱教程。\n\n")
	sb.WriteString("## 任务\n")
	sb.WriteString(fmt.Sprintf("请为「%s」这道菜生成详细的制作教程。\n\n", recipe.Name))

	sb.WriteString("## 菜品信息\n")
	sb.WriteString(fmt.Sprintf("- 菜名：%s\n", recipe.Name))
	sb.WriteString(fmt.Sprintf("- 描述：%s\n", recipe.Description))
	sb.WriteString(fmt.Sprintf("- 菜系：%s\n", recipe.Cuisine))
	sb.WriteString(fmt.Sprintf("- 城市：%s\n", city.DisplayName))
	sb.WriteString(fmt.Sprintf("- 季节：%s\n", season.Name))
	sb.WriteString(fmt.Sprintf("- 应季食材：%s\n", strings.Join(recipe.SeasonalIngredients, "、")))
	sb.WriteString(fmt.Sprintf("- 预计烹饪时间：%d 分钟\n", recipe.CookingTime))
	sb.WriteString(fmt.Sprintf("- 难度：%s\n\n", recipe.Difficulty))

	sb.WriteString("## 要求\n")
	sb.WriteString("1. 食材清单需要精确到用量和单位（如「鸡蛋 2个」「盐 5克」）\n")
	sb.WriteString("2. 标注哪些是应季食材\n")
	sb.WriteString("3. 制作步骤要详细清晰，适合厨房新手\n")
	sb.WriteString("4. 每个步骤标注预计耗时\n")
	sb.WriteString("5. 添加实用的烹饪小贴士\n\n")

	sb.WriteString("## 输出格式\n")
	sb.WriteString("请以 JSON 格式输出：\n")
	sb.WriteString("```json\n")
	sb.WriteString(`{
  "ingredients": [
    {"name": "食材名", "amount": 2, "unit": "个", "isSeasonal": true}
  ],
  "steps": [
    {"order": 1, "instruction": "步骤说明", "duration": 5, "tip": "小贴士（可选）"}
  ],
  "tips": ["烹饪小贴士1", "烹饪小贴士2"]
}
`)
	sb.WriteString("```\n")
	sb.WriteString("\n请只输出 JSON，不要添加其他说明文字。")

	return sb.String()
}

// callLLM calls the LLM with the given prompt
func (s *Service) callLLM(ctx context.Context, prompt string) (string, error) {
	// Create a simple agent using helloagents-go
	agent, err := agents.NewSimple(s.llm,
		agents.WithName("RecipeAgent"),
		agents.WithSystemPrompt("你是一位专业的美食专家，精通全球各地的饮食文化。请严格按照要求的JSON格式输出。"),
	)
	if err != nil {
		return "", fmt.Errorf("创建 Agent 失败: %w", err)
	}

	input := agents.Input{
		Query: prompt,
	}

	output, err := agent.Run(ctx, input)
	if err != nil {
		return "", err
	}

	return output.Response, nil
}

// parseRecipeResponse parses the LLM response into recipe objects
func (s *Service) parseRecipeResponse(response string) ([]models.Recipe, error) {
	// Extract JSON from response (in case there's extra text)
	jsonStr := extractJSON(response)

	var rawRecipes []struct {
		Name                string   `json:"name"`
		Description         string   `json:"description"`
		CookingTime         int      `json:"cookingTime"`
		Difficulty          string   `json:"difficulty"`
		SeasonalIngredients []string `json:"seasonalIngredients"`
		Cuisine             string   `json:"cuisine"`
	}

	if err := json.Unmarshal([]byte(jsonStr), &rawRecipes); err != nil {
		return nil, fmt.Errorf("JSON 解析失败: %w", err)
	}

	recipes := make([]models.Recipe, len(rawRecipes))
	for i, raw := range rawRecipes {
		recipes[i] = models.Recipe{
			Name:                raw.Name,
			Description:         raw.Description,
			CookingTime:         raw.CookingTime,
			Difficulty:          models.Difficulty(raw.Difficulty),
			SeasonalIngredients: raw.SeasonalIngredients,
			Cuisine:             raw.Cuisine,
			ImageStatus:         models.ImageStatusPending,
		}
	}

	return recipes, nil
}

// parseDetailResponse parses the LLM response into recipe detail
func (s *Service) parseDetailResponse(response string, recipeID string) (*models.RecipeDetail, error) {
	jsonStr := extractJSON(response)

	var raw struct {
		Ingredients []struct {
			Name       string  `json:"name"`
			Amount     float64 `json:"amount"`
			Unit       string  `json:"unit"`
			IsSeasonal bool    `json:"isSeasonal"`
		} `json:"ingredients"`
		Steps []struct {
			Order       int    `json:"order"`
			Instruction string `json:"instruction"`
			Duration    int    `json:"duration"`
			Tip         string `json:"tip"`
		} `json:"steps"`
		Tips []string `json:"tips"`
	}

	if err := json.Unmarshal([]byte(jsonStr), &raw); err != nil {
		return nil, fmt.Errorf("JSON 解析失败: %w", err)
	}

	detail := &models.RecipeDetail{
		RecipeID:    recipeID,
		Ingredients: make([]models.Ingredient, len(raw.Ingredients)),
		Steps:       make([]models.CookingStep, len(raw.Steps)),
		Tips:        raw.Tips,
	}

	for i, ing := range raw.Ingredients {
		detail.Ingredients[i] = models.Ingredient{
			Name:       ing.Name,
			Amount:     ing.Amount,
			Unit:       ing.Unit,
			IsSeasonal: ing.IsSeasonal,
		}
	}

	for i, step := range raw.Steps {
		detail.Steps[i] = models.CookingStep{
			Order:       step.Order,
			Instruction: step.Instruction,
			Duration:    step.Duration,
			Tip:         step.Tip,
		}
	}

	return detail, nil
}

// extractJSON extracts JSON array or object from a response that may contain extra text
func extractJSON(s string) string {
	s = strings.TrimSpace(s)

	// Find the first occurrence of [ or {
	arrayStart := strings.Index(s, "[")
	objectStart := strings.Index(s, "{")

	// Determine which comes first (or only exists)
	var isArray bool
	var start int

	if arrayStart == -1 && objectStart == -1 {
		return s
	} else if arrayStart == -1 {
		isArray = false
		start = objectStart
	} else if objectStart == -1 {
		isArray = true
		start = arrayStart
	} else {
		// Both exist, use whichever comes first
		isArray = arrayStart < objectStart
		if isArray {
			start = arrayStart
		} else {
			start = objectStart
		}
	}

	// Find matching closing bracket using bracket counting
	if isArray {
		end := findMatchingBracket(s, start, '[', ']')
		if end != -1 {
			return s[start : end+1]
		}
	} else {
		end := findMatchingBracket(s, start, '{', '}')
		if end != -1 {
			return s[start : end+1]
		}
	}

	return s
}

// findMatchingBracket finds the matching closing bracket for an opening bracket
func findMatchingBracket(s string, start int, open, close rune) int {
	count := 0
	inString := false
	escape := false

	for i, r := range s[start:] {
		if escape {
			escape = false
			continue
		}
		if r == '\\' && inString {
			escape = true
			continue
		}
		if r == '"' {
			inString = !inString
			continue
		}
		if inString {
			continue
		}
		if r == open {
			count++
		} else if r == close {
			count--
			if count == 0 {
				return start + i
			}
		}
	}
	return -1
}
