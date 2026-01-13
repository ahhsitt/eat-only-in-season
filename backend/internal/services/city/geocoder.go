// Package city provides city geocoding services
package city

import (
	"context"
	"fmt"
	"strings"

	"github.com/codingsince1985/geo-golang"
	"github.com/codingsince1985/geo-golang/openstreetmap"
	"github.com/eat-only-in-season/backend/internal/cache"
	"github.com/eat-only-in-season/backend/internal/models"
)

// 预定义的热门城市数据（作为后备方案）
var popularCityData = map[string]*models.City{
	"东京": {Name: "东京", DisplayName: "东京", Latitude: 35.6762, Longitude: 139.6503, Country: "日本"},
	"tokyo": {Name: "Tokyo", DisplayName: "Tokyo", Latitude: 35.6762, Longitude: 139.6503, Country: "Japan"},
	"北京": {Name: "北京", DisplayName: "北京", Latitude: 39.9042, Longitude: 116.4074, Country: "中国"},
	"beijing": {Name: "Beijing", DisplayName: "Beijing", Latitude: 39.9042, Longitude: 116.4074, Country: "China"},
	"上海": {Name: "上海", DisplayName: "上海", Latitude: 31.2304, Longitude: 121.4737, Country: "中国"},
	"shanghai": {Name: "Shanghai", DisplayName: "Shanghai", Latitude: 31.2304, Longitude: 121.4737, Country: "China"},
	"广州": {Name: "广州", DisplayName: "广州", Latitude: 23.1291, Longitude: 113.2644, Country: "中国"},
	"guangzhou": {Name: "Guangzhou", DisplayName: "Guangzhou", Latitude: 23.1291, Longitude: 113.2644, Country: "China"},
	"深圳": {Name: "深圳", DisplayName: "深圳", Latitude: 22.5431, Longitude: 114.0579, Country: "中国"},
	"shenzhen": {Name: "Shenzhen", DisplayName: "Shenzhen", Latitude: 22.5431, Longitude: 114.0579, Country: "China"},
	"成都": {Name: "成都", DisplayName: "成都", Latitude: 30.5728, Longitude: 104.0668, Country: "中国"},
	"chengdu": {Name: "Chengdu", DisplayName: "Chengdu", Latitude: 30.5728, Longitude: 104.0668, Country: "China"},
	"巴黎": {Name: "巴黎", DisplayName: "巴黎", Latitude: 48.8566, Longitude: 2.3522, Country: "法国"},
	"paris": {Name: "Paris", DisplayName: "Paris", Latitude: 48.8566, Longitude: 2.3522, Country: "France"},
	"纽约": {Name: "纽约", DisplayName: "纽约", Latitude: 40.7128, Longitude: -74.0060, Country: "美国"},
	"new york": {Name: "New York", DisplayName: "New York", Latitude: 40.7128, Longitude: -74.0060, Country: "USA"},
	"伦敦": {Name: "伦敦", DisplayName: "伦敦", Latitude: 51.5074, Longitude: -0.1278, Country: "英国"},
	"london": {Name: "London", DisplayName: "London", Latitude: 51.5074, Longitude: -0.1278, Country: "UK"},
	"悉尼": {Name: "悉尼", DisplayName: "悉尼", Latitude: -33.8688, Longitude: 151.2093, Country: "澳大利亚"},
	"sydney": {Name: "Sydney", DisplayName: "Sydney", Latitude: -33.8688, Longitude: 151.2093, Country: "Australia"},
	"首尔": {Name: "首尔", DisplayName: "首尔", Latitude: 37.5665, Longitude: 126.9780, Country: "韩国"},
	"seoul": {Name: "Seoul", DisplayName: "Seoul", Latitude: 37.5665, Longitude: 126.9780, Country: "South Korea"},
	"新加坡": {Name: "新加坡", DisplayName: "新加坡", Latitude: 1.3521, Longitude: 103.8198, Country: "新加坡"},
	"singapore": {Name: "Singapore", DisplayName: "Singapore", Latitude: 1.3521, Longitude: 103.8198, Country: "Singapore"},
	"曼谷": {Name: "曼谷", DisplayName: "曼谷", Latitude: 13.7563, Longitude: 100.5018, Country: "泰国"},
	"bangkok": {Name: "Bangkok", DisplayName: "Bangkok", Latitude: 13.7563, Longitude: 100.5018, Country: "Thailand"},
	"迪拜": {Name: "迪拜", DisplayName: "迪拜", Latitude: 25.2048, Longitude: 55.2708, Country: "阿联酋"},
	"dubai": {Name: "Dubai", DisplayName: "Dubai", Latitude: 25.2048, Longitude: 55.2708, Country: "UAE"},
	"香港": {Name: "香港", DisplayName: "香港", Latitude: 22.3193, Longitude: 114.1694, Country: "中国"},
	"hong kong": {Name: "Hong Kong", DisplayName: "Hong Kong", Latitude: 22.3193, Longitude: 114.1694, Country: "China"},
	"台北": {Name: "台北", DisplayName: "台北", Latitude: 25.0330, Longitude: 121.5654, Country: "中国台湾"},
	"taipei": {Name: "Taipei", DisplayName: "Taipei", Latitude: 25.0330, Longitude: 121.5654, Country: "Taiwan"},
}

// Geocoder provides city geocoding functionality
type Geocoder struct {
	provider geo.Geocoder
	cache    *cache.Cache
}

// NewGeocoder creates a new city geocoder using OpenStreetMap/Nominatim
func NewGeocoder(c *cache.Cache) *Geocoder {
	return &Geocoder{
		provider: openstreetmap.Geocoder(),
		cache:    c,
	}
}

// SearchCity searches for a city by name and returns its geographic information
func (g *Geocoder) SearchCity(ctx context.Context, cityName string) (*models.City, error) {
	// Normalize city name
	cityName = strings.TrimSpace(cityName)
	if cityName == "" {
		return nil, fmt.Errorf("城市名称不能为空")
	}

	// Check cache first
	if cached, ok := g.cache.GetCity(cityName); ok {
		return cached, nil
	}

	// Check predefined popular cities (as fallback)
	lowerName := strings.ToLower(cityName)
	if city, ok := popularCityData[lowerName]; ok {
		// Make a copy to avoid modifying the original
		cityCopy := *city
		g.cache.SetCity(cityName, &cityCopy)
		return &cityCopy, nil
	}

	// Also check the original case for Chinese cities
	if city, ok := popularCityData[cityName]; ok {
		cityCopy := *city
		g.cache.SetCity(cityName, &cityCopy)
		return &cityCopy, nil
	}

	// Try geocoding with timeout context
	location, err := g.provider.Geocode(cityName)
	if err != nil {
		return nil, fmt.Errorf("无法识别城市 '%s': %w", cityName, err)
	}

	if location == nil {
		return nil, fmt.Errorf("未找到城市 '%s'，请尝试输入城市的中文或英文名称", cityName)
	}

	// Build city model
	city := &models.City{
		Name:        cityName,
		DisplayName: g.buildDisplayName(cityName, location),
		Latitude:    location.Lat,
		Longitude:   location.Lng,
	}

	// Try to get additional info from reverse geocoding
	address, err := g.provider.ReverseGeocode(location.Lat, location.Lng)
	if err == nil && address != nil {
		city.Country = address.Country
	}

	// Cache the result
	g.cache.SetCity(cityName, city)

	return city, nil
}

// buildDisplayName creates a display name for the city
func (g *Geocoder) buildDisplayName(inputName string, location *geo.Location) string {
	// If the input looks like Chinese, try to add English name
	if containsChinese(inputName) {
		// For now, just use the input name
		// In production, we might want to look up the English name
		return inputName
	}

	// If input is English/Pinyin, we might want to add Chinese name
	// For simplicity, return the input with formatted coordinates context
	return inputName
}

// containsChinese checks if a string contains Chinese characters
func containsChinese(s string) bool {
	for _, r := range s {
		if r >= 0x4e00 && r <= 0x9fff {
			return true
		}
	}
	return false
}

// PopularCities returns a list of popular cities for suggestions
func PopularCities() []string {
	return []string{
		"北京", "上海", "广州", "深圳", "成都",
		"Tokyo", "东京",
		"Paris", "巴黎",
		"New York", "纽约",
		"London", "伦敦",
		"Sydney", "悉尼",
		"Seoul", "首尔",
		"Singapore", "新加坡",
		"Bangkok", "曼谷",
		"Dubai", "迪拜",
	}
}
