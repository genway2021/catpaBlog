package wechatmp

import (
	"bytes"
	"fmt"
	"regexp"
	"strings"

	"golang.org/x/net/html"
)

// WeChatAllowedTags 微信公众号支持的 HTML 标签
var WeChatAllowedTags = map[string]bool{
	"section": true, "p": true, "br": true, "hr": true,
	"h1": true, "h2": true, "h3": true, "h4": true, "h5": true, "h6": true,
	"strong": true, "b": true, "em": true, "i": true, "u": true, "s": true,
	"blockquote": true, "pre": true, "code": true,
	"ul": true, "ol": true, "li": true,
	"table": true, "thead": true, "tbody": true, "tr": true, "th": true, "td": true,
	"a": true, "img": true, "span": true, "div": true, "sup": true, "sub": true,
}

// WeChatAllowedAttrs 微信公众号支持的属性
var WeChatAllowedAttrs = map[string]map[string]bool{
	"a":   {"href": true, "target": true},
	"img": {"src": true, "alt": true, "width": true, "height": true, "data-src": true},
	"*":   {"style": true, "class": true},
}

// ImageInfo 记录需要处理的图片信息
type ImageInfo struct {
	OriginalURL string
	LocalPath   string // 如果是本地路径
	IsExternal  bool
}

// ConvertResult 转换结果
type ConvertResult struct {
	HTML   string
	Images []ImageInfo
}

// ConvertMarkdownToWeChatHTML 将 Markdown 渲染后的 HTML 转换为微信兼容格式
// 该函数接收已渲染的 HTML（由前端 markdown-it 渲染），进行清洗和图片提取
func ConvertMarkdownToWeChatHTML(rawHTML string) (*ConvertResult, error) {
	doc, err := html.Parse(strings.NewReader(rawHTML))
	if err != nil {
		return nil, fmt.Errorf("parse html: %w", err)
	}

	result := &ConvertResult{
		Images: make([]ImageInfo, 0),
	}

	// 遍历并清理 DOM
	cleanNode(doc, result)

	// 渲染回 HTML
	var buf bytes.Buffer
	if err := html.Render(&buf, doc); err != nil {
		return nil, fmt.Errorf("render html: %w", err)
	}

	// 提取 body 内容
	output := buf.String()
	output = extractBodyContent(output)

	// 添加基础内联样式
	output = addInlineStyles(output)

	result.HTML = output
	return result, nil
}

func cleanNode(n *html.Node, result *ConvertResult) {
	if n.Type == html.ElementNode {
		// 检查是否为允许的标签
		if !WeChatAllowedTags[n.Data] {
			// 不支持的标签转为 span 或移除
			switch n.Data {
			case "mark":
				n.Data = "span"
				n.Attr = append(n.Attr, html.Attribute{Key: "style", Val: "background-color:#F3E8FF;padding:0 2px;"})
			case "kbd":
				n.Data = "code"
			case "del":
				n.Data = "s"
			case "ins":
				n.Data = "u"
			default:
				// 其他不支持标签转为 span
				n.Data = "span"
			}
		}

		// 处理图片
		if n.Data == "img" {
			for _, attr := range n.Attr {
				if attr.Key == "src" && attr.Val != "" {
					info := ImageInfo{OriginalURL: attr.Val}
					if strings.HasPrefix(attr.Val, "http://") || strings.HasPrefix(attr.Val, "https://") {
						info.IsExternal = true
					}
					result.Images = append(result.Images, info)
					break
				}
			}
		}

		// 清理列表元素之间的空白文本节点（修复列表空行问题）
		if n.Data == "ul" || n.Data == "ol" {
			removeWhitespaceNodes(n)
		}

		// 处理代码块中的换行符（微信需要 <br> 标签）
		if n.Data == "pre" {
			convertNewlinesToBr(n)
		}

		// 清理不允许的属性
		cleanAttributes(n)
	}

	// 递归处理子节点
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		cleanNode(c, result)
	}
}

// removeWhitespaceNodes 移除列表元素内的纯空白文本节点
func removeWhitespaceNodes(n *html.Node) {
	var toRemove []*html.Node
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		if c.Type == html.TextNode && strings.TrimSpace(c.Data) == "" {
			toRemove = append(toRemove, c)
		}
	}
	for _, node := range toRemove {
		n.RemoveChild(node)
	}
}

// convertNewlinesToBr 将代码块内的换行符转换为 <br> 标签
// 微信公众号不正确处理 <pre> 内的纯换行符，需要转换为 <br>
func convertNewlinesToBr(preNode *html.Node) {
	// 递归处理所有文本节点
	var processNode func(n *html.Node)
	processNode = func(n *html.Node) {
		if n.Type == html.TextNode && strings.Contains(n.Data, "\n") {
			// 将文本按换行符分割，用 <br> 连接
			parts := strings.Split(n.Data, "\n")
			if len(parts) <= 1 {
				return
			}

			parent := n.Parent
			nextSibling := n.NextSibling

			// 移除原文本节点
			parent.RemoveChild(n)

			// 插入分割后的文本和 <br> 标签
			for i, part := range parts {
				// 插入文本节点
				textNode := &html.Node{
					Type: html.TextNode,
					Data: part,
				}
				if nextSibling != nil {
					parent.InsertBefore(textNode, nextSibling)
				} else {
					parent.AppendChild(textNode)
				}

				// 除了最后一个部分，都要插入 <br>
				if i < len(parts)-1 {
					brNode := &html.Node{
						Type: html.ElementNode,
						Data: "br",
					}
					if nextSibling != nil {
						parent.InsertBefore(brNode, nextSibling)
					} else {
						parent.AppendChild(brNode)
					}
				}
			}
			return
		}

		// 递归处理子节点（需要先收集，因为可能会修改）
		var children []*html.Node
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			children = append(children, c)
		}
		for _, c := range children {
			processNode(c)
		}
	}

	processNode(preNode)
}

func cleanAttributes(n *html.Node) {
	allowed := WeChatAllowedAttrs[n.Data]
	global := WeChatAllowedAttrs["*"]

	var newAttrs []html.Attribute
	for _, attr := range n.Attr {
		if (allowed != nil && allowed[attr.Key]) || (global != nil && global[attr.Key]) {
			newAttrs = append(newAttrs, attr)
		}
	}
	n.Attr = newAttrs
}

func extractBodyContent(htmlStr string) string {
	// 简单提取 body 标签内容
	bodyStart := strings.Index(htmlStr, "<body>")
	bodyEnd := strings.LastIndex(htmlStr, "</body>")
	if bodyStart >= 0 && bodyEnd > bodyStart {
		return htmlStr[bodyStart+6 : bodyEnd]
	}
	return htmlStr
}

// addInlineStyles 为常见元素添加内联样式（微信不支持外部 CSS）
// 紫色主题样式 #DEC6FB
func addInlineStyles(htmlStr string) string {
	// 标题样式（左对齐，紫色左边框，统一边距行高）
	htmlStr = addStyleToTag(htmlStr, "h1", "font-size:22px;font-weight:bold;line-height:1.5;padding-left:15px;margin:24px 0 16px;border-left:5px solid #DEC6FB;color:#515151;")
	htmlStr = addStyleToTag(htmlStr, "h2", "font-size:20px;font-weight:bold;line-height:1.5;padding-left:15px;margin:20px 0 14px;border-left:5px solid #DEC6FB;color:#515151;")
	htmlStr = addStyleToTag(htmlStr, "h3", "font-size:18px;font-weight:bold;line-height:1.5;padding-left:15px;margin:18px 0 12px;border-left:5px solid #DEC6FB;color:#515151;")
	htmlStr = addStyleToTag(htmlStr, "h4", "font-size:16px;font-weight:bold;line-height:1.5;padding-left:15px;margin:16px 0 10px;border-left:5px solid #DEC6FB;color:#515151;")
	htmlStr = addStyleToTag(htmlStr, "h5", "font-size:16px;font-weight:bold;line-height:1.5;padding-left:15px;margin:14px 0 8px;border-left:5px solid #DEC6FB;color:#515151;")
	htmlStr = addStyleToTag(htmlStr, "h6", "font-size:16px;font-weight:bold;line-height:1.5;padding-left:15px;margin:14px 0 8px;border-left:5px solid #DEC6FB;color:#515151;")

	// 段落
	htmlStr = addStyleToTag(htmlStr, "p", "font-size:14px;margin:10px 0 10px;padding:0;line-height:1.8;color:#3a3a3a;")

	// 引用块（紫色边框和背景）
	htmlStr = addStyleToTag(htmlStr, "blockquote", "margin:15px 0;padding:10px 15px;border:1px solid #DEC6FB;background:#FAF5FF;color:#595959;")

	// 代码块（white-space: pre-wrap 确保换行符正常显示）
	htmlStr = addStyleToTag(htmlStr, "pre", "margin:15px 0;padding:15px;background:#f5f5f5;border-radius:4px;overflow-x:auto;white-space:pre-wrap;word-wrap:break-word;")
	htmlStr = addStyleToTag(htmlStr, "code", "font-family:Consolas,Monaco,monospace;font-size:14px;color:#9B7BB8;background:#f5f5f5;padding:3px;margin:3px;border-radius:2px;")

	// 列表
	htmlStr = addStyleToTag(htmlStr, "ul", "font-size:15px;margin:10px 0;padding-left:20px;")
	htmlStr = addStyleToTag(htmlStr, "ol", "font-size:15px;margin:10px 0;padding-left:20px;")
	htmlStr = addStyleToTag(htmlStr, "li", "font-size:14px;margin:5px 0;line-height:1.6;")

	// 表格（居中对齐）
	htmlStr = addStyleToTag(htmlStr, "table", "font-size:14px;width:100%;border-collapse:collapse;margin:15px 0;")
	htmlStr = addStyleToTag(htmlStr, "th", "border:1px solid #ddd;padding:8px 12px;background:#f5f5f5;text-align:center;font-weight:bold;")
	htmlStr = addStyleToTag(htmlStr, "td", "border:1px solid #ddd;padding:8px 12px;text-align:center;")

	// 链接（紫色）
	htmlStr = addStyleToTag(htmlStr, "a", "color:#9B7BB8;text-decoration:none;")

	// 图片（圆角）
	htmlStr = addStyleToTag(htmlStr, "img", "max-width:100%;height:auto;display:block;margin:0 auto 15px;border-radius:5px;")

	// 分割线（紫色虚线）
	htmlStr = addStyleToTag(htmlStr, "hr", "border:none;border-top:2px dashed #DEC6FB;margin:25px 0;")

	// 删除线（紫色）
	htmlStr = addStyleToTag(htmlStr, "del", "color:#9B7BB8;")
	htmlStr = addStyleToTag(htmlStr, "s", "color:#9B7BB8;")

	// 上标和下标
	htmlStr = addStyleToTag(htmlStr, "sup", "font-size:smaller;vertical-align:super;")
	htmlStr = addStyleToTag(htmlStr, "sub", "font-size:smaller;vertical-align:sub;")

	return htmlStr
}

func addStyleToTag(htmlStr, tag, style string) string {
	// 匹配开始标签（支持普通标签和自闭合标签）
	// 匹配: <tag>, <tag , <tag/, <tag/> 等情况
	pattern := regexp.MustCompile(fmt.Sprintf(`<%s(\s|>|/>|/)`, tag))
	return pattern.ReplaceAllStringFunc(htmlStr, func(match string) string {
		if strings.HasSuffix(match, "/>") {
			return fmt.Sprintf(`<%s style="%s" />`, tag, style)
		}
		if strings.HasSuffix(match, "/") {
			return fmt.Sprintf(`<%s style="%s" /`, tag, style)
		}
		if strings.HasSuffix(match, ">") {
			return fmt.Sprintf(`<%s style="%s">`, tag, style)
		}
		return fmt.Sprintf(`<%s style="%s" `, tag, style)
	})
}

// ReplaceImageURL 替换 HTML 中的图片 URL
func ReplaceImageURL(htmlStr, oldURL, newURL string) string {
	// 转义特殊字符用于正则
	escaped := regexp.QuoteMeta(oldURL)
	pattern := regexp.MustCompile(fmt.Sprintf(`src=["']%s["']`, escaped))
	return pattern.ReplaceAllString(htmlStr, fmt.Sprintf(`src="%s"`, newURL))
}

// 预编译扩展语法正则
var (
	// ==高亮== 语法
	highlightPattern = regexp.MustCompile(`==([^=]+)==`)
	// ++下划线++ 语法
	underlinePattern = regexp.MustCompile(`\+\+([^+]+)\+\+`)
	// ~~删除线~~ 语法
	strikethroughPattern = regexp.MustCompile(`~~([^~]+)~~`)
	// x^2^ 上标语法
	superscriptPattern = regexp.MustCompile(`\^([^^]+)\^`)
	// H~2~O 下标语法
	subscriptPattern = regexp.MustCompile(`~([^~]+)~`)
	// [[Ctrl]] 键盘按键语法
	kbdPattern = regexp.MustCompile(`\[\[([^\]]+)\]\]`)
	// - [x] 任务列表已完成
	taskDonePattern = regexp.MustCompile(`(?m)^(\s*)- \[[xX]\] `)
	// - [ ] 任务列表未完成
	taskTodoPattern = regexp.MustCompile(`(?m)^(\s*)- \[ \] `)
	// [文本](链接) 匹配 Markdown 链接
	linkPattern = regexp.MustCompile(`\[([^\]]+)\]\(([^)]+)\)`)

	// 自定义块正则（使用 \r?\n 兼容 Windows 换行符）
	// :::note type title ... :::endnote 提示框
	notePattern = regexp.MustCompile(`(?s):::note\s+(\w+)\s+([^\r\n]+)\r?\n(.*?):::endnote`)
	// :::fold title ... :::endfold 折叠面板（微信无JS，直接展开显示）
	foldPattern = regexp.MustCompile(`(?s):::fold\s+([^\r\n]+)\r?\n(.*?):::endfold`)
	// :::link title url [desc] ::: 链接卡片（标题可含空格）
	linkCardPattern = regexp.MustCompile(`:::link\s+(.+?)\s+(https?://[^\s]+)(?:\s+([^:]+))?\s*:::`)
	// :::tabs ... :::endtabs 标签页容器
	tabsPattern = regexp.MustCompile(`(?s):::tabs\r?\n(.*?):::endtabs`)
	// :::tab title ... :::endtab 单个标签页
	tabPattern = regexp.MustCompile(`(?s):::tab\s+([^\r\n]+)\r?\n(.*?):::endtab`)
	// :::video platform id ::: 或 :::video url ::: 在线视频
	videoPattern = regexp.MustCompile(`:::video\s+(\S+)(?:\s+(\S+))?\s*:::`)
)

// ConvertLinksToFootnotes 将 Markdown 链接转换为脚注格式
func ConvertLinksToFootnotes(markdown string) string {
	// 先保护图片语法，用占位符替换
	imagePattern := regexp.MustCompile(`!\[([^\]]*)\]\(([^)]+)\)`)
	var images []string
	protected := imagePattern.ReplaceAllStringFunc(markdown, func(match string) string {
		images = append(images, match)
		return fmt.Sprintf("<<<IMG:%d>>>", len(images)-1)
	})

	// 处理链接
	var links []string

	result := linkPattern.ReplaceAllStringFunc(protected, func(match string) string {
		submatch := linkPattern.FindStringSubmatch(match)
		if len(submatch) < 3 {
			return match
		}
		text := submatch[1]
		url := submatch[2]

		links = append(links, url)
		return fmt.Sprintf("%s<sup>[%d]</sup>", text, len(links))
	})

	// 恢复图片语法
	for i, img := range images {
		result = strings.Replace(result, fmt.Sprintf("<<<IMG:%d>>>", i), img, 1)
	}

	// 如果有链接，在末尾添加脚注（紫色主题）
	if len(links) > 0 {
		result += "\n\n---\n\n<section style=\"font-size:14px;color:#9B7BB8;line-height:1.6;\">"
		for i, url := range links {
			result += fmt.Sprintf("<span style=\"color:#DEC6FB;\">[%d]</span> %s<br/>", i+1, url)
		}
		result += "</section>"
	}

	return result
}

// noteTypeColors 提示框类型对应的边框颜色
var noteTypeColors = map[string]string{
	"info":    "#2196f3",
	"warning": "#ff9800",
	"success": "#4caf50",
	"error":   "#f44336",
}

// ConvertCustomBlocks 转换自定义块语法为 Markdown 原生格式
// 处理顺序：video → link → note → fold → tabs
func ConvertCustomBlocks(markdown string) string {
	// 统一换行符为 \n
	markdown = strings.ReplaceAll(markdown, "\r\n", "\n")

	// 处理视频（公众号不支持iframe/video标签，转为链接卡片）
	markdown = videoPattern.ReplaceAllStringFunc(markdown, func(match string) string {
		submatch := videoPattern.FindStringSubmatch(match)
		if len(submatch) < 2 {
			return match
		}
		platformOrURL := strings.TrimSpace(submatch[1])
		videoID := ""
		if len(submatch) >= 3 {
			videoID = strings.TrimSpace(submatch[2])
		}

		// B站视频
		if platformOrURL == "bilibili" && videoID != "" {
			url := fmt.Sprintf("https://www.bilibili.com/video/%s", videoID)
			return fmt.Sprintf(`<section style="margin:15px 0;padding:12px 15px;border:1px solid #DEC6FB;border-radius:8px;background:#FAF5FF;"><p style="margin:0 0 8px;font-size:14px;color:#9B7BB8;">📺 哔哩哔哩视频</p><a href="%s" style="color:#515151;font-size:14px;text-decoration:none;">点击观看：BV%s</a></section>`, url, videoID)
		}

		// YouTube视频
		if platformOrURL == "youtube" && videoID != "" {
			url := fmt.Sprintf("https://www.youtube.com/watch?v=%s", videoID)
			return fmt.Sprintf(`<section style="margin:15px 0;padding:12px 15px;border:1px solid #DEC6FB;border-radius:8px;background:#FAF5FF;"><p style="margin:0 0 8px;font-size:14px;color:#9B7BB8;">📺 YouTube视频</p><a href="%s" style="color:#515151;font-size:14px;text-decoration:none;">点击观看：%s</a></section>`, url, videoID)
		}

		// 直接视频URL
		if strings.HasPrefix(platformOrURL, "http://") || strings.HasPrefix(platformOrURL, "https://") || strings.HasPrefix(platformOrURL, "/") {
			return fmt.Sprintf(`<section style="margin:15px 0;padding:12px 15px;border:1px solid #DEC6FB;border-radius:8px;background:#FAF5FF;"><p style="margin:0 0 8px;font-size:14px;color:#9B7BB8;">🎬 在线视频</p><a href="%s" style="color:#515151;font-size:14px;text-decoration:none;">点击观看</a></section>`, platformOrURL)
		}

		return match
	})

	// 处理链接卡片（最内层，可能嵌套在 note/fold/tabs 中）
	markdown = linkCardPattern.ReplaceAllStringFunc(markdown, func(match string) string {
		submatch := linkCardPattern.FindStringSubmatch(match)
		if len(submatch) < 3 {
			return match
		}
		title := strings.TrimSpace(submatch[1])
		url := strings.TrimSpace(submatch[2])
		desc := ""
		if len(submatch) >= 4 {
			desc = strings.TrimSpace(submatch[3])
		}

		if desc != "" {
			return fmt.Sprintf("[%s - %s](%s)", title, desc, url)
		}
		return fmt.Sprintf("[%s](%s)", title, url)
	})

	// 处理提示框（可能嵌套在 fold/tabs 中）
	markdown = notePattern.ReplaceAllStringFunc(markdown, func(match string) string {
		submatch := notePattern.FindStringSubmatch(match)
		if len(submatch) < 4 {
			return match
		}
		noteType := strings.TrimSpace(submatch[1])
		title := strings.TrimSpace(submatch[2])
		content := strings.TrimSpace(submatch[3])

		borderColor, ok := noteTypeColors[noteType]
		if !ok {
			borderColor = noteTypeColors["info"]
		}

		lines := strings.Split(content, "\n")
		var quotedLines []string
		for _, line := range lines {
			quotedLines = append(quotedLines, "> "+line)
		}

		return fmt.Sprintf("> **<span style=\"color:%s;\">▎%s</span>**\n>\n%s", borderColor, title, strings.Join(quotedLines, "\n"))
	})

	// 处理折叠面板（可能嵌套在 tabs 中）
	markdown = foldPattern.ReplaceAllStringFunc(markdown, func(match string) string {
		submatch := foldPattern.FindStringSubmatch(match)
		if len(submatch) < 3 {
			return match
		}
		title := strings.TrimSpace(submatch[1])
		content := strings.TrimSpace(submatch[2])

		lines := strings.Split(content, "\n")
		var quotedLines []string
		for _, line := range lines {
			quotedLines = append(quotedLines, "> "+line)
		}

		return fmt.Sprintf("> **%s**\n>\n%s", title, strings.Join(quotedLines, "\n"))
	})

	// 4. 最后处理标签页（最外层）
	markdown = tabsPattern.ReplaceAllStringFunc(markdown, func(match string) string {
		submatch := tabsPattern.FindStringSubmatch(match)
		if len(submatch) < 2 {
			return match
		}
		tabsContent := submatch[1]

		tabs := tabPattern.FindAllStringSubmatch(tabsContent, -1)
		if len(tabs) == 0 {
			return match
		}

		var result strings.Builder
		for i, tab := range tabs {
			if len(tab) < 3 {
				continue
			}
			tabTitle := strings.TrimSpace(tab[1])
			tabContent := strings.TrimSpace(tab[2])

			if i > 0 {
				result.WriteString("\n\n")
			}
			// 用 section 标签实现类似 h4 的样式（不带渐变背景）
			fmt.Fprintf(&result, "<section style=\"font-size:16px;font-weight:bold;line-height:1.5;margin:16px 0 10px;\">%s</section>\n\n%s", tabTitle, tabContent)
		}

		return result.String()
	})

	return markdown
}

// PreprocessMarkdown 预处理 Markdown 扩展语法
// 在 goldmark 渲染之前调用，将扩展语法转换为 HTML 标签
func PreprocessMarkdown(markdown string) string {
	// ==高亮== → <mark>高亮</mark>
	markdown = highlightPattern.ReplaceAllString(markdown, "<mark>$1</mark>")

	// ++下划线++ → <ins>下划线</ins>
	markdown = underlinePattern.ReplaceAllString(markdown, "<ins>$1</ins>")

	// x^2^ → x<sup>2</sup>
	markdown = superscriptPattern.ReplaceAllString(markdown, "<sup>$1</sup>")

	// ~~删除线~~ → <del>删除线</del>（必须在下标之前处理，避免冲突）
	markdown = strikethroughPattern.ReplaceAllString(markdown, "<del>$1</del>")

	// H~2~O → H<sub>2</sub>O
	markdown = subscriptPattern.ReplaceAllString(markdown, "<sub>$1</sub>")

	// [[Ctrl]] → <kbd>Ctrl</kbd>
	markdown = kbdPattern.ReplaceAllString(markdown, "<kbd>$1</kbd>")

	// - [x] → ☑ 已完成任务
	markdown = taskDonePattern.ReplaceAllString(markdown, "$1☑ ")
	// - [ ] → ☐ 未完成任务
	markdown = taskTodoPattern.ReplaceAllString(markdown, "$1☐ ")

	return markdown
}
