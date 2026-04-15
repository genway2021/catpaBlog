package tools

import (
	"context"
	"fmt"

	"flec_blog/internal/dto"
	"flec_blog/internal/service"

	"github.com/google/jsonschema-go/jsonschema"
	sdkmcp "github.com/modelcontextprotocol/go-sdk/mcp"
)

const (
	statsActionDashboard = "dashboard"
	statsActionTrend     = "trend"
)

// StatsQueryInput stats_query 聚合 tool 输入
type StatsQueryInput struct {
	Action  string            `json:"action"`
	Payload StatsQueryPayload `json:"payload"`
}

// StatsQueryPayload stats_query 载荷
type StatsQueryPayload struct {
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
	TrendType string `json:"trend_type"`
}

// StatsQueryOutput stats_query 聚合 tool 输出
type StatsQueryOutput struct {
	Dashboard *dto.DashboardStats `json:"dashboard,omitempty"`
	Trend     []dto.TrendData     `json:"trend,omitempty"`
	Error     string              `json:"error,omitempty"`
}

// StatsWrapper 统计服务包装器
type StatsWrapper struct {
	statsService *service.StatsService
}

// NewStatsWrapper 创建统计服务包装器
func NewStatsWrapper(statsService *service.StatsService) *StatsWrapper {
	return &StatsWrapper{statsService: statsService}
}

// QueryStats 统计查询聚合入口
func (w *StatsWrapper) QueryStats(
	_ context.Context,
	_ *sdkmcp.CallToolRequest,
	input StatsQueryInput,
) (*sdkmcp.CallToolResult, StatsQueryOutput, error) {
	switch input.Action {
	case statsActionDashboard:
		return w.dashboard()
	case statsActionTrend:
		return w.trend(input.Payload)
	default:
		return nil, StatsQueryOutput{}, fmt.Errorf("不支持的操作: %s", input.Action)
	}
}

func (w *StatsWrapper) dashboard() (*sdkmcp.CallToolResult, StatsQueryOutput, error) {
	stats, err := w.statsService.GetDashboardStats()
	if err != nil {
		return nil, StatsQueryOutput{Error: fmt.Sprintf("获取仪表盘统计失败: %v", err)}, nil
	}
	return nil, StatsQueryOutput{Dashboard: stats}, nil
}

func (w *StatsWrapper) trend(payload StatsQueryPayload) (*sdkmcp.CallToolResult, StatsQueryOutput, error) {
	if payload.StartDate == "" {
		return nil, StatsQueryOutput{Error: "开始日期不能为空"}, nil
	}
	if payload.EndDate == "" {
		return nil, StatsQueryOutput{Error: "结束日期不能为空"}, nil
	}

	trend, err := w.statsService.GetTrendData(payload.StartDate, payload.EndDate, payload.TrendType)
	if err != nil {
		return nil, StatsQueryOutput{Error: fmt.Sprintf("获取趋势数据失败: %v", err)}, nil
	}
	return nil, StatsQueryOutput{Trend: trend}, nil
}

// StatsQueryInputSchema 返回 stats_query 的自定义输入 schema
func StatsQueryInputSchema() *jsonschema.Schema {
	emptyPayload := BuildPayloadSchema(map[string]*jsonschema.Schema{})
	trendPayload := BuildPayloadSchema(
		map[string]*jsonschema.Schema{
			"start_date": {Type: "string"},
			"end_date":   {Type: "string"},
			"trend_type": {Type: "string", Enum: []any{"daily", "weekly", "monthly"}},
		},
		"start_date",
		"end_date",
	)

	return &jsonschema.Schema{
		Type: "object",
		Properties: map[string]*jsonschema.Schema{
			"action": {
				Type: "string",
				Enum: []any{
					statsActionDashboard,
					statsActionTrend,
				},
			},
			"payload": {Type: "object"},
		},
		Required: []string{"action", "payload"},
		OneOf: []*jsonschema.Schema{
			BuildActionSchema(statsActionDashboard, "获取仪表盘统计数据概览", emptyPayload),
			BuildActionSchema(statsActionTrend, "获取指定时间段的访问趋势数据", trendPayload),
		},
	}
}
