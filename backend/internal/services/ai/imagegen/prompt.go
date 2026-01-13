// Package imagegen - 图片提示词生成模块
package imagegen

import (
	"strings"
)

// FishVisualFeatures 鱼类视觉特征映射
// 用于生成精准的图片提示词，确保图片中的鱼类特征与实际菜品匹配
var FishVisualFeatures = map[string]string{
	"马鲛鱼": "Spanish mackerel with distinctive blue-gray back, silver sides, and elongated body shape with pointed snout",
	"鲈鱼":  "sea bass with silver scales, dark spots along lateral line, and rounded body",
	"带鱼":  "hairtail fish with elongated silver ribbon-like body, no scales, metallic sheen",
	"黄花鱼": "yellow croaker with golden-yellow color, distinctive black spots near gills",
	"鲳鱼":  "pomfret with flat diamond-shaped silver body, forked tail",
	"草鱼":  "grass carp with large olive-colored scales, elongated body",
	"鳜鱼":  "mandarin fish with mottled brown-green pattern, large mouth",
	"鲫鱼":  "crucian carp with silver scales, deep body, small mouth",
	"鲤鱼":  "common carp with large golden scales, barbels near mouth",
	"三文鱼": "salmon with pink-orange flesh, distinctive fat marbling",
	"金枪鱼": "tuna with deep red meat, firm texture",
	"石斑鱼": "grouper with mottled brown spots, robust body",
}

// SeafoodVisualFeatures 其他海鲜视觉特征
var SeafoodVisualFeatures = map[string]string{
	"虾":   "prawns with orange-pink shell, curved body, visible segments",
	"螃蟹":  "crab with reddish shell, distinctive claws",
	"龙虾":  "lobster with dark shell, large claws, segmented tail",
	"扇贝":  "scallop with fan-shaped shell, white meat",
	"生蚝":  "oyster with rough gray shell, plump meat",
	"蛤蜊":  "clam with smooth oval shell",
	"鱿鱼":  "squid with white tentacles and tubular body",
	"章鱼":  "octopus with eight tentacles, suction cups visible",
	"海参":  "sea cucumber with dark spiny surface",
	"鲍鱼":  "abalone with iridescent shell, firm meat",
}

// MeatVisualFeatures 肉类视觉特征
var MeatVisualFeatures = map[string]string{
	"牛肉":  "beef with rich red color, visible marbling",
	"猪肉":  "pork with pink color, white fat layers",
	"羊肉":  "lamb with pinkish-red meat, white fat",
	"鸡肉":  "chicken with white meat, golden skin when cooked",
	"鸭肉":  "duck with darker meat, crispy skin",
	"排骨":  "ribs with meat on bone, caramelized exterior",
	"五花肉": "pork belly with distinct layers of fat and meat",
}

// CookingMethodVisuals 烹饪方式视觉特征
var CookingMethodVisuals = map[string]string{
	"清蒸": "steamed with glistening surface, light sauce, fresh herbs garnish, served on plate with steam rising",
	"红烧": "braised with glossy dark sauce, caramelized appearance, rich brown color",
	"炒":  "stir-fried with wok hei char marks, glossy sauce coating",
	"煎":  "pan-fried with golden crispy exterior, slight char marks",
	"炸":  "deep-fried with golden crispy coating, crunchy texture",
	"烤":  "roasted with caramelized surface, golden-brown color",
	"煮":  "boiled in clear or milky broth, soup bowl presentation",
	"蒸":  "steamed with moist surface, natural colors preserved",
	"炖":  "stewed with tender texture, rich sauce, clay pot presentation",
	"凉拌": "cold-dressed with fresh ingredients, light sauce, crisp vegetables",
}

// NegativePrompts 负面提示词，避免生成错误的图片
var NegativePrompts = []string{
	"blurry",
	"low quality",
	"distorted",
	"unappetizing",
	"raw when should be cooked",
	"wrong fish species",
	"cartoonish",
	"artificial looking",
	"plastic appearance",
	"oversaturated colors",
	"unrealistic proportions",
}

// BuildDishPrompt 构建菜品图片提示词
// 根据菜名分析主要食材和烹饪方式，生成精准的提示词
func BuildDishPrompt(dishName string, description string) ImagePrompt {
	prompt := ImagePrompt{
		DishName:    dishName,
		Description: description,
	}

	// 提取主要食材特征
	prompt.MainIngredient = extractIngredientFeatures(dishName)

	// 提取烹饪方式特征
	prompt.CookingMethod = extractCookingMethod(dishName)

	// 构建完整提示词
	prompt.PositivePrompt = buildPositivePrompt(prompt)
	prompt.NegativePrompt = buildNegativePrompt(prompt)

	return prompt
}

// ImagePrompt 图片提示词结构
type ImagePrompt struct {
	DishName       string
	Description    string
	MainIngredient string
	CookingMethod  string
	PositivePrompt string
	NegativePrompt string
}

// extractIngredientFeatures 从菜名中提取主要食材的视觉特征
func extractIngredientFeatures(dishName string) string {
	// 检查鱼类
	for fish, features := range FishVisualFeatures {
		if strings.Contains(dishName, fish) {
			return features
		}
	}

	// 检查其他海鲜
	for seafood, features := range SeafoodVisualFeatures {
		if strings.Contains(dishName, seafood) {
			return features
		}
	}

	// 检查肉类
	for meat, features := range MeatVisualFeatures {
		if strings.Contains(dishName, meat) {
			return features
		}
	}

	return ""
}

// extractCookingMethod 从菜名中提取烹饪方式
func extractCookingMethod(dishName string) string {
	for method, visual := range CookingMethodVisuals {
		if strings.Contains(dishName, method) {
			return visual
		}
	}
	return "beautifully prepared and plated"
}

// buildPositivePrompt 构建正面提示词
func buildPositivePrompt(p ImagePrompt) string {
	var parts []string

	// 基础描述
	parts = append(parts, "A professional food photography shot of "+p.DishName)

	// 主要食材特征
	if p.MainIngredient != "" {
		parts = append(parts, "featuring "+p.MainIngredient)
	}

	// 烹饪方式
	if p.CookingMethod != "" {
		parts = append(parts, p.CookingMethod)
	}

	// 如果有描述，添加部分描述
	if p.Description != "" {
		desc := p.Description
		if len(desc) > 80 {
			desc = desc[:80]
		}
		parts = append(parts, desc)
	}

	// 通用高质量特征
	parts = append(parts,
		"ceramic plate presentation",
		"natural soft lighting",
		"warm color palette",
		"appetizing and fresh appearance",
		"restaurant quality plating",
		"Chinese cuisine authentic style",
		"4k high resolution",
		"photorealistic",
	)

	return strings.Join(parts, ", ")
}

// buildNegativePrompt 构建负面提示词
func buildNegativePrompt(p ImagePrompt) string {
	negatives := make([]string, len(NegativePrompts))
	copy(negatives, NegativePrompts)

	// 根据食材添加特定的负面提示
	if strings.Contains(p.DishName, "马鲛鱼") {
		negatives = append(negatives, "other fish species", "salmon", "cod", "tilapia")
	} else if strings.Contains(p.DishName, "鲈鱼") {
		negatives = append(negatives, "mackerel", "salmon", "wrong fish")
	}

	return strings.Join(negatives, ", ")
}

// GetOptimizedPrompt 获取优化后的提示词（供图片生成服务调用）
func GetOptimizedPrompt(title string, description string) (positive string, negative string) {
	prompt := BuildDishPrompt(title, description)
	return prompt.PositivePrompt, prompt.NegativePrompt
}
