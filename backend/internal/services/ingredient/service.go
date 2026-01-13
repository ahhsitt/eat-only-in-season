// Package ingredient provides seasonal ingredient services using LLM
package ingredient

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/ahhsitt/helloagents-go/pkg/agents"
	"github.com/ahhsitt/helloagents-go/pkg/core/llm"
	"github.com/eat-only-in-season/backend/internal/models"
	"github.com/eat-only-in-season/backend/internal/services/ai"
	"github.com/eat-only-in-season/backend/pkg/config"
	"github.com/google/uuid"
)

// Service provides ingredient functionality
type Service struct {
	config   *config.Config
	provider *ai.ProviderManager
	llm      llm.Provider
}

// NewService creates a new ingredient service
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

// GetSeasonalIngredients returns seasonal ingredients for a city
func (s *Service) GetSeasonalIngredients(ctx context.Context, city string) (*models.GetIngredientsResponse, error) {
	if !s.provider.HasLLM() {
		return nil, fmt.Errorf("没有可用的 LLM 服务，请配置 API Key")
	}

	// Get current month
	month := time.Now().Month()

	prompt := s.buildIngredientsPrompt(city, int(month))

	response, err := s.callLLM(ctx, prompt)
	if err != nil {
		return nil, fmt.Errorf("获取应季食材失败: %w", err)
	}

	result, err := s.parseIngredientsResponse(response, city)
	if err != nil {
		return nil, fmt.Errorf("解析应季食材响应失败: %w", err)
	}

	return result, nil
}

// GetIngredientDetail returns detailed info for an ingredient
func (s *Service) GetIngredientDetail(ctx context.Context, ingredientID string, ingredientName string) (*models.SeasonalIngredient, error) {
	if !s.provider.HasLLM() {
		return nil, fmt.Errorf("没有可用的 LLM 服务，请配置 API Key")
	}

	prompt := s.buildIngredientDetailPrompt(ingredientName)

	response, err := s.callLLM(ctx, prompt)
	if err != nil {
		return nil, fmt.Errorf("获取食材详情失败: %w", err)
	}

	detail, err := s.parseIngredientDetailResponse(response, ingredientID, ingredientName)
	if err != nil {
		return nil, fmt.Errorf("解析食材详情响应失败: %w", err)
	}

	return detail, nil
}

// buildIngredientsPrompt builds the prompt for seasonal ingredients
// 006-ux-fixes-optimization: 增强季节性和地方特色要求
func (s *Service) buildIngredientsPrompt(city string, month int) string {
	var sb strings.Builder

	sb.WriteString("你是一位专业的营养师和食材专家，精通全球各地的应季食材知识。\n\n")
	sb.WriteString("## 任务\n")
	sb.WriteString("请根据以下信息，返回该地区当季的应季食材列表。\n\n")

	sb.WriteString("## 上下文信息\n")
	sb.WriteString(fmt.Sprintf("- 城市/地区：%s\n", city))
	sb.WriteString(fmt.Sprintf("- 当前月份：%d月\n\n", month))

	sb.WriteString("## 核心要求（必须遵守）\n")
	sb.WriteString("1. **必须排除全年供应的常见食材**（详见排除清单）\n")
	sb.WriteString("2. **只推荐当月应季的时令食材**，强调季节性\n")
	sb.WriteString("3. **根据城市地理特征调整推荐**：\n")
	sb.WriteString("   - 沿海城市（青岛、厦门、大连、深圳、宁波等）：优先推荐当季海鲜，如梭子蟹、带鱼、牡蛎、海虾等\n")
	sb.WriteString("   - 山区城市（贵阳、昆明、张家界、丽江等）：推荐山珍、菌菇、野菜\n")
	sb.WriteString("   - 平原/内陆城市：推荐时令蔬菜水果\n")
	sb.WriteString("4. 推荐的食材必须合法、安全、可食用\n")
	sb.WriteString("5. 所有输出必须使用简体中文\n\n")

	sb.WriteString("## 排除清单（以下食材不得出现在推荐列表中）\n")
	sb.WriteString("- **蛋类**：鸡蛋、鸭蛋、鹌鹑蛋、皮蛋\n")
	sb.WriteString("- **奶类**：牛奶、酸奶、奶酪、黄油\n")
	sb.WriteString("- **常规肉类**：猪肉、牛肉、羊肉、鸡肉、鸭肉\n")
	sb.WriteString("- **主食原料**：大米、小麦、面粉、玉米\n")
	sb.WriteString("- **常年蔬菜**：土豆、洋葱、胡萝卜、白菜、大蒜、生姜\n")
	sb.WriteString("- **豆制品**：豆腐、豆浆、腐竹\n\n")

	sb.WriteString("## 推荐策略\n")
	sb.WriteString("- 优先推荐具有明确季节性的食材（如春笋只有春天有）\n")
	sb.WriteString("- 海鲜类需是当季捕捞的新鲜品种\n")
	sb.WriteString("- 蔬菜水果需是露天自然成熟的时令品种\n")
	sb.WriteString("- 体现地方特色，推荐当地特产\n\n")

	sb.WriteString("## 输出格式要求\n")
	sb.WriteString("1. 按分类返回食材（肉类、蔬菜、水果、海鲜、其他）\n")
	sb.WriteString("2. **不要返回蛋奶分类**（因为都是全年供应的食材）\n")
	sb.WriteString("3. 每种食材包含简短介绍（50字以内），强调季节性原因\n")
	sb.WriteString("4. 每个分类返回3-5种应季食材\n")
	sb.WriteString("5. 如果是国际城市，也要用中文输出食材名称\n\n")

	sb.WriteString("## JSON 输出格式\n")
	sb.WriteString("```json\n")
	sb.WriteString(`{
  "location": {
    "inputName": "用户输入的城市名",
    "matchedName": "匹配到的实际城市/地区名",
    "country": "国家/地区（可选）",
    "season": "春/夏/秋/冬",
    "month": 1
  },
  "categories": [
    {
      "category": "蔬菜",
      "ingredients": [
        {
          "name": "食材名称",
          "briefIntro": "简短介绍（50字内，强调为什么这个季节是最佳食用时机）",
          "seasonMonths": [1, 2, 3]
        }
      ]
    }
  ]
}
`)
	sb.WriteString("```\n")
	sb.WriteString("\n请只输出 JSON，不要添加其他说明文字。")

	return sb.String()
}

// buildIngredientDetailPrompt builds the prompt for ingredient detail
func (s *Service) buildIngredientDetailPrompt(ingredientName string) string {
	var sb strings.Builder

	sb.WriteString("你是一位专业的营养师和食材专家。\n\n")
	sb.WriteString("## 任务\n")
	sb.WriteString(fmt.Sprintf("请为「%s」这种食材提供详细信息。\n\n", ingredientName))

	sb.WriteString("## 要求\n")
	sb.WriteString("1. 所有输出必须使用简体中文\n")
	sb.WriteString("2. 提供应季原因、营养价值、挑选建议、储存建议\n")
	sb.WriteString("3. 内容要实用、具体，适合普通消费者阅读\n\n")

	sb.WriteString("## 输出格式\n")
	sb.WriteString("请以 JSON 格式输出：\n")
	sb.WriteString("```json\n")
	sb.WriteString(`{
  "seasonReason": "为什么这个季节是最佳食用时机",
  "nutrition": "主要营养价值和功效",
  "selectionTips": "如何挑选新鲜优质的食材",
  "storageTips": "如何储存保鲜"
}
`)
	sb.WriteString("```\n")
	sb.WriteString("\n请只输出 JSON，不要添加其他说明文字。")

	return sb.String()
}

// callLLM calls the LLM with the given prompt
func (s *Service) callLLM(ctx context.Context, prompt string) (string, error) {
	agent, err := agents.NewSimple(s.llm,
		agents.WithName("IngredientAgent"),
		agents.WithSystemPrompt("你是一位专业的营养师和食材专家。请严格按照要求的JSON格式输出，所有内容使用简体中文。"),
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

// parseIngredientsResponse parses the LLM response into ingredients response
func (s *Service) parseIngredientsResponse(response string, inputCity string) (*models.GetIngredientsResponse, error) {
	jsonStr := extractJSON(response)

	var raw struct {
		Location struct {
			InputName   string `json:"inputName"`
			MatchedName string `json:"matchedName"`
			Country     string `json:"country"`
			Season      string `json:"season"`
			Month       int    `json:"month"`
		} `json:"location"`
		Categories []struct {
			Category    string `json:"category"`
			Ingredients []struct {
				Name         string `json:"name"`
				BriefIntro   string `json:"briefIntro"`
				SeasonMonths []int  `json:"seasonMonths"`
			} `json:"ingredients"`
		} `json:"categories"`
	}

	if err := json.Unmarshal([]byte(jsonStr), &raw); err != nil {
		return nil, fmt.Errorf("JSON 解析失败: %w", err)
	}

	result := &models.GetIngredientsResponse{
		Location: models.Location{
			InputName:   inputCity,
			MatchedName: raw.Location.MatchedName,
			Country:     raw.Location.Country,
			Season:      raw.Location.Season,
			Month:       raw.Location.Month,
		},
		Categories: make([]models.IngredientCategoryGroup, 0, len(raw.Categories)),
	}

	for _, cat := range raw.Categories {
		category := models.IngredientCategoryGroup{
			Category:    models.IngredientCategory(cat.Category),
			Ingredients: make([]models.SeasonalIngredient, 0, len(cat.Ingredients)),
		}

		for _, ing := range cat.Ingredients {
			ingredient := models.SeasonalIngredient{
				ID:           uuid.New().String(),
				Name:         ing.Name,
				Category:     models.IngredientCategory(cat.Category),
				BriefIntro:   ing.BriefIntro,
				SeasonMonths: ing.SeasonMonths,
			}
			category.Ingredients = append(category.Ingredients, ingredient)
		}

		result.Categories = append(result.Categories, category)
	}

	return result, nil
}

// parseIngredientDetailResponse parses the LLM response into ingredient detail
func (s *Service) parseIngredientDetailResponse(response string, ingredientID string, ingredientName string) (*models.SeasonalIngredient, error) {
	jsonStr := extractJSON(response)

	var raw struct {
		SeasonReason  string `json:"seasonReason"`
		Nutrition     string `json:"nutrition"`
		SelectionTips string `json:"selectionTips"`
		StorageTips   string `json:"storageTips"`
	}

	if err := json.Unmarshal([]byte(jsonStr), &raw); err != nil {
		return nil, fmt.Errorf("JSON 解析失败: %w", err)
	}

	return &models.SeasonalIngredient{
		ID:   ingredientID,
		Name: ingredientName,
		DetailedInfo: &models.IngredientDetail{
			SeasonReason:  raw.SeasonReason,
			Nutrition:     raw.Nutrition,
			SelectionTips: raw.SelectionTips,
			StorageTips:   raw.StorageTips,
		},
	}, nil
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
