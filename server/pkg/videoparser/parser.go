package videoparser

import (
	"regexp"
	"strings"
)

// VideoInfo 视频信息
type VideoInfo struct {
	Platform string `json:"platform"` // bilibili, youtube, 或空（本地视频）
	VideoID  string `json:"video_id"` // 视频ID
}

// ParseVideoURL 解析视频URL，识别平台和视频ID
func ParseVideoURL(url string) *VideoInfo {
	if url == "" {
		return nil
	}

	// Bilibili 视频匹配
	// 支持格式：
	// - https://www.bilibili.com/video/BVxxxxxxxxx
	// - https://b23.tv/xxxxxx (短链接)
	if strings.Contains(url, "bilibili.com") || strings.Contains(url, "b23.tv") {
		// 提取BV号
		bvRegex := regexp.MustCompile(`BV[a-zA-Z0-9]+`)
		if match := bvRegex.FindString(url); match != "" {
			return &VideoInfo{
				Platform: "bilibili",
				VideoID:  match,
			}
		}
		// 提取av号
		avRegex := regexp.MustCompile(`av(\d+)`)
		if match := avRegex.FindStringSubmatch(url); len(match) > 1 {
			return &VideoInfo{
				Platform: "bilibili",
				VideoID:  "av" + match[1],
			}
		}
	}

	// YouTube 视频匹配
	// 支持格式：
	// - https://www.youtube.com/watch?v=xxxxxxxxxxx
	// - https://youtu.be/xxxxxxxxxxx
	if strings.Contains(url, "youtube.com") || strings.Contains(url, "youtu.be") {
		// youtu.be 短链接
		if strings.Contains(url, "youtu.be/") {
			parts := strings.Split(url, "youtu.be/")
			if len(parts) > 1 {
				videoID := strings.Split(parts[1], "?")[0]
				videoID = strings.Split(videoID, "&")[0]
				return &VideoInfo{
					Platform: "youtube",
					VideoID:  videoID,
				}
			}
		}
		// youtube.com 标准链接
		vRegex := regexp.MustCompile(`[?&]v=([a-zA-Z0-9_-]+)`)
		if match := vRegex.FindStringSubmatch(url); len(match) > 1 {
			return &VideoInfo{
				Platform: "youtube",
				VideoID:  match[1],
			}
		}
	}

	// 其他URL视为本地视频，不设置platform和videoID
	return &VideoInfo{
		Platform: "",
		VideoID:  "",
	}
}
