// Package recipe provides recipe recommendation services using LLM
package recipe

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/ahhsitt/helloagents-go/pkg/agents"
	"github.com/ahhsitt/helloagents-go/pkg/core/llm"
	"github.com/eat-only-in-season/backend/internal/i18n"
	"github.com/eat-only-in-season/backend/internal/models"
	"github.com/eat-only-in-season/backend/internal/services/ai"
	"github.com/eat-only-in-season/backend/pkg/config"
	"github.com/google/uuid"
)

// Service provides recipe functionality for the new flow
type Service struct {
	config   *config.Config
	provider *ai.ProviderManager
	llm      llm.Provider
}

// NewService creates a new recipe service
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

// GetRecipeRecommendations returns recipe recommendations based on selected ingredients
func (s *Service) GetRecipeRecommendations(ctx context.Context, req *models.GetRecipesByIngredientsRequest, lang string) (*models.GetRecipesByIngredientsResponse, error) {
	if !s.provider.HasLLM() {
		return nil, fmt.Errorf("没有可用的 LLM 服务，请配置 API Key")
	}

	prompt := s.buildRecipeRecommendationPrompt(req, lang)

	response, err := s.callLLM(ctx, prompt, lang)
	if err != nil {
		return nil, fmt.Errorf("获取菜谱推荐失败: %w", err)
	}

	result, err := s.parseRecipeRecommendationResponse(response, req.Ingredients, lang)
	if err != nil {
		return nil, fmt.Errorf("解析菜谱推荐响应失败: %w", err)
	}

	return result, nil
}

// GetRecipeDetail returns detailed recipe information
func (s *Service) GetRecipeDetail(ctx context.Context, recipeID string, recipeTitle string, lang string) (*models.NewRecipeDetail, error) {
	if !s.provider.HasLLM() {
		return nil, fmt.Errorf("没有可用的 LLM 服务，请配置 API Key")
	}

	prompt := s.buildRecipeDetailPrompt(recipeTitle, lang)

	response, err := s.callLLM(ctx, prompt, lang)
	if err != nil {
		return nil, fmt.Errorf("获取菜谱详情失败: %w", err)
	}

	detail, err := s.parseRecipeDetailResponse(response, recipeID, recipeTitle, lang)
	if err != nil {
		return nil, fmt.Errorf("解析菜谱详情响应失败: %w", err)
	}

	return detail, nil
}

// buildRecipeRecommendationPrompt builds the prompt for recipe recommendations
func (s *Service) buildRecipeRecommendationPrompt(req *models.GetRecipesByIngredientsRequest, lang string) string {
	var sb strings.Builder

	langInstruction := i18n.GetPrompt(lang, "language_instruction")
	if langInstruction == "" {
		langInstruction = "所有输出必须使用简体中文。"
	}

	if lang == "en" {
		sb.WriteString("You are a professional food recommendation expert with expertise in various cuisines.\n\n")
		sb.WriteString("## Task\n")
		sb.WriteString("Please recommend 5 delicious recipes based on the user's selected ingredients.\n\n")

		sb.WriteString("## Context\n")
		if len(req.Ingredients) > 0 {
			sb.WriteString(fmt.Sprintf("- Selected ingredients: %s\n", strings.Join(req.Ingredients, ", ")))
		} else {
			sb.WriteString("- No specific ingredients selected, please recommend popular seasonal recipes\n")
		}
		if req.Location != "" {
			sb.WriteString(fmt.Sprintf("- User location: %s\n", req.Location))
		}
		if req.Preference != "" {
			sb.WriteString(fmt.Sprintf("- User preferences: %s\n", req.Preference))
		}

		sb.WriteString("\n## Requirements\n")
		sb.WriteString(fmt.Sprintf("1. %s\n", langInstruction))
		sb.WriteString("2. Recommend 5 recipes, sorted by number of matched ingredients\n")
		sb.WriteString("3. Prioritize recipes that use the selected ingredients\n")
		sb.WriteString("4. Partial matching is allowed\n")
		sb.WriteString("5. Respect user preferences (e.g., no spicy, light flavor)\n")
		sb.WriteString("6. Difficulty levels: Easy, Medium, Hard\n\n")

		sb.WriteString("## Output Format\n")
		sb.WriteString("Please output in JSON format:\n")
		sb.WriteString("```json\n")
		sb.WriteString(`{
  "recipes": [
    {
      "title": "Recipe name",
      "description": "Brief description (under 100 words)",
      "matchedIngredients": ["ingredient1", "ingredient2"],
      "cookingTime": "30 minutes",
      "difficulty": "easy",
      "tags": ["tag1", "tag2"]
    }
  ]
}
`)
		sb.WriteString("```\n")
		sb.WriteString("\nPlease output JSON only, no additional text.")
	} else {
		sb.WriteString("你是一位专业的美食推荐专家，精通中华料理和各地菜系。\n\n")
		sb.WriteString("## 任务\n")
		sb.WriteString("请根据用户选择的食材，推荐5道美味菜谱。\n\n")

		sb.WriteString("## 上下文信息\n")
		if len(req.Ingredients) > 0 {
			sb.WriteString(fmt.Sprintf("- 用户选择的食材：%s\n", strings.Join(req.Ingredients, "、")))
		} else {
			sb.WriteString("- 用户未选择特定食材，请推荐当季热门菜谱\n")
		}
		if req.Location != "" {
			sb.WriteString(fmt.Sprintf("- 用户所在城市：%s\n", req.Location))
		}
		if req.Preference != "" {
			sb.WriteString(fmt.Sprintf("- 用户偏好：%s\n", req.Preference))
		}

		sb.WriteString("\n## 要求\n")
		sb.WriteString(fmt.Sprintf("1. %s\n", langInstruction))
		sb.WriteString("2. 推荐5道菜谱，按匹配食材数量从多到少排序\n")
		sb.WriteString("3. 如果用户选择了食材，优先推荐能用到这些食材的菜\n")
		sb.WriteString("4. 允许部分匹配（即菜谱不必用到所有选择的食材）\n")
		sb.WriteString("5. 如果用户有偏好（如不吃辣、清淡等），请严格遵守\n")
		sb.WriteString("6. 难度标注为：easy、medium、hard\n\n")

		sb.WriteString("## 输出格式\n")
		sb.WriteString("请以 JSON 格式输出：\n")
		sb.WriteString("```json\n")
		sb.WriteString(`{
  "recipes": [
    {
      "title": "菜名",
      "description": "简短描述（100字内）",
      "matchedIngredients": ["匹配的食材1", "匹配的食材2"],
      "cookingTime": "30分钟",
      "difficulty": "easy",
      "tags": ["标签1", "标签2"]
    }
  ]
}
`)
		sb.WriteString("```\n")
		sb.WriteString("\n请只输出 JSON，不要添加其他说明文字。")
	}

	return sb.String()
}

// buildRecipeDetailPrompt builds the prompt for recipe detail
func (s *Service) buildRecipeDetailPrompt(recipeTitle string, lang string) string {
	var sb strings.Builder

	langInstruction := i18n.GetPrompt(lang, "language_instruction")
	if langInstruction == "" {
		langInstruction = "所有输出必须使用简体中文。"
	}

	if lang == "en" {
		sb.WriteString("You are a professional chef and food writer, skilled at writing detailed and easy-to-follow recipe tutorials.\n\n")
		sb.WriteString("## Task\n")
		sb.WriteString(fmt.Sprintf("Please generate a detailed cooking tutorial for the dish: %s\n\n", recipeTitle))

		sb.WriteString("## Requirements\n")
		sb.WriteString(fmt.Sprintf("1. %s\n", langInstruction))
		sb.WriteString("2. Ingredient list should be precise with amounts (e.g., \"2 eggs\", \"5g salt\")\n")
		sb.WriteString("3. Steps should be clear and detailed, suitable for beginners\n")
		sb.WriteString("4. Provide practical cooking tips\n")
		sb.WriteString("5. Difficulty levels: easy, medium, hard\n\n")

		sb.WriteString("## Output Format\n")
		sb.WriteString("Please output in JSON format:\n")
		sb.WriteString("```json\n")
		sb.WriteString(`{
  "title": "Recipe name",
  "description": "Detailed description",
  "ingredients": [
    {"name": "ingredient name", "amount": "amount", "note": "note (optional)"}
  ],
  "steps": [
    {"stepNumber": 1, "instruction": "step instruction", "duration": "duration (optional)"}
  ],
  "cookingTime": "total time",
  "servings": "2-3 servings",
  "difficulty": "easy",
  "tags": ["tag"],
  "tips": "cooking tips"
}
`)
		sb.WriteString("```\n")
		sb.WriteString("\nPlease output JSON only, no additional text.")
	} else {
		sb.WriteString("你是一位专业的厨师和美食作家，擅长编写详细易懂的菜谱教程。\n\n")
		sb.WriteString("## 任务\n")
		sb.WriteString(fmt.Sprintf("请为「%s」这道菜生成详细的制作教程。\n\n", recipeTitle))

		sb.WriteString("## 要求\n")
		sb.WriteString(fmt.Sprintf("1. %s\n", langInstruction))
		sb.WriteString("2. 食材清单精确到用量（如「鸡蛋 2个」「盐 5克」）\n")
		sb.WriteString("3. 制作步骤详细清晰，适合厨房新手\n")
		sb.WriteString("4. 提供实用的烹饪小贴士\n")
		sb.WriteString("5. 难度标注为：easy、medium、hard\n\n")

		sb.WriteString("## 输出格式\n")
		sb.WriteString("请以 JSON 格式输出：\n")
		sb.WriteString("```json\n")
		sb.WriteString(`{
  "title": "菜名",
  "description": "详细描述",
  "ingredients": [
    {"name": "食材名", "amount": "用量", "note": "备注（可选）"}
  ],
  "steps": [
    {"stepNumber": 1, "instruction": "步骤说明", "duration": "时长（可选）"}
  ],
  "cookingTime": "总时长",
  "servings": "2-3人份",
  "difficulty": "easy",
  "tags": ["标签"],
  "tips": "烹饪小贴士"
}
`)
		sb.WriteString("```\n")
		sb.WriteString("\n请只输出 JSON，不要添加其他说明文字。")
	}

	return sb.String()
}

// callLLM calls the LLM with the given prompt
func (s *Service) callLLM(ctx context.Context, prompt string, lang string) (string, error) {
	var systemPrompt string
	if lang == "en" {
		systemPrompt = "You are a professional food expert. Please output strictly in the required JSON format, all content in English."
	} else {
		systemPrompt = "你是一位专业的美食专家。请严格按照要求的JSON格式输出，所有内容使用简体中文。"
	}

	agent, err := agents.NewSimple(s.llm,
		agents.WithName("RecipeAgent"),
		agents.WithSystemPrompt(systemPrompt),
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

// parseRecipeRecommendationResponse parses the LLM response
func (s *Service) parseRecipeRecommendationResponse(response string, selectedIngredients []string, lang string) (*models.GetRecipesByIngredientsResponse, error) {
	jsonStr := extractJSON(response)

	var raw struct {
		Recipes []struct {
			Title              string   `json:"title"`
			Description        string   `json:"description"`
			MatchedIngredients []string `json:"matchedIngredients"`
			CookingTime        string   `json:"cookingTime"`
			Difficulty         string   `json:"difficulty"`
			Tags               []string `json:"tags"`
		} `json:"recipes"`
	}

	if err := json.Unmarshal([]byte(jsonStr), &raw); err != nil {
		return nil, fmt.Errorf("JSON 解析失败: %w", err)
	}

	result := &models.GetRecipesByIngredientsResponse{
		Recipes: make([]models.RecipeWithMatch, 0, len(raw.Recipes)),
	}

	for _, r := range raw.Recipes {
		// Translate difficulty if needed
		difficultyDisplay := i18n.GetDifficulty(lang, mapDifficultyToCode(r.Difficulty))

		recipe := models.RecipeWithMatch{
			ID:                 uuid.New().String(),
			Title:              r.Title,
			Description:        r.Description,
			MatchedIngredients: r.MatchedIngredients,
			MatchCount:         len(r.MatchedIngredients),
			CookingTime:        r.CookingTime,
			Difficulty:         difficultyDisplay,
			Tags:               r.Tags,
		}
		result.Recipes = append(result.Recipes, recipe)
	}

	return result, nil
}

// mapDifficultyToCode maps difficulty display name to code
func mapDifficultyToCode(name string) string {
	switch name {
	case "简单", "easy", "Easy":
		return "easy"
	case "中等", "medium", "Medium":
		return "medium"
	case "复杂", "困难", "hard", "Hard":
		return "hard"
	default:
		return "medium"
	}
}

// parseRecipeDetailResponse parses the LLM response into recipe detail
func (s *Service) parseRecipeDetailResponse(response string, recipeID string, recipeTitle string, lang string) (*models.NewRecipeDetail, error) {
	jsonStr := extractJSON(response)

	var raw struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Ingredients []struct {
			Name   string `json:"name"`
			Amount string `json:"amount"`
			Note   string `json:"note"`
		} `json:"ingredients"`
		Steps []struct {
			StepNumber  int    `json:"stepNumber"`
			Instruction string `json:"instruction"`
			Duration    string `json:"duration"`
		} `json:"steps"`
		CookingTime string   `json:"cookingTime"`
		Servings    string   `json:"servings"`
		Difficulty  string   `json:"difficulty"`
		Tags        []string `json:"tags"`
		Tips        string   `json:"tips"`
	}

	if err := json.Unmarshal([]byte(jsonStr), &raw); err != nil {
		return nil, fmt.Errorf("JSON 解析失败: %w", err)
	}

	// Translate difficulty if needed
	difficultyDisplay := i18n.GetDifficulty(lang, mapDifficultyToCode(raw.Difficulty))

	detail := &models.NewRecipeDetail{
		ID:          recipeID,
		Title:       raw.Title,
		Description: raw.Description,
		CookingTime: raw.CookingTime,
		Servings:    raw.Servings,
		Difficulty:  difficultyDisplay,
		Tags:        raw.Tags,
		Tips:        raw.Tips,
		Ingredients: make([]models.RecipeIngredient, 0, len(raw.Ingredients)),
		Steps:       make([]models.NewCookingStep, 0, len(raw.Steps)),
	}

	for _, ing := range raw.Ingredients {
		detail.Ingredients = append(detail.Ingredients, models.RecipeIngredient{
			Name:   ing.Name,
			Amount: ing.Amount,
			Note:   ing.Note,
		})
	}

	for _, step := range raw.Steps {
		detail.Steps = append(detail.Steps, models.NewCookingStep{
			StepNumber:  step.StepNumber,
			Instruction: step.Instruction,
			Duration:    step.Duration,
		})
	}

	return detail, nil
}

// extractJSON extracts JSON from a response that may contain extra text
func extractJSON(s string) string {
	s = strings.TrimSpace(s)

	arrayStart := strings.Index(s, "[")
	objectStart := strings.Index(s, "{")

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
		isArray = arrayStart < objectStart
		if isArray {
			start = arrayStart
		} else {
			start = objectStart
		}
	}

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

// findMatchingBracket finds the matching closing bracket
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
