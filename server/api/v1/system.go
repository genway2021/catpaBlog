package v1

import (
	"fmt"
	"os"
	"runtime"
	"time"

	"flec_blog/pkg/email"
	"flec_blog/pkg/feishu"
	"flec_blog/pkg/response"
	"flec_blog/pkg/upload"

	"github.com/gin-gonic/gin"
	"github.com/shirou/gopsutil/v4/cpu"
	"github.com/shirou/gopsutil/v4/disk"
	"github.com/shirou/gopsutil/v4/host"
	"github.com/shirou/gopsutil/v4/load"
	"github.com/shirou/gopsutil/v4/mem"
	"github.com/shirou/gopsutil/v4/net"
	"gorm.io/gorm"
)

// SystemStaticResponse 系统静态信息
type SystemStaticResponse struct {
	CPUCore  int    `json:"cpu_core"`
	CPUModel string `json:"cpu_model"`
	CPUArch  string `json:"cpu_arch"`
	Hostname string `json:"hostname"`
	OS       string `json:"os"`
	ServerIP string `json:"server_ip"`
	Timezone string `json:"timezone"`
	DbType   string `json:"db_type"`

	MemoryTotal uint64 `json:"memory_total"`
	SwapTotal   uint64 `json:"swap_total"`
	DiskTotal   uint64 `json:"disk_total"`
	DbTables    int64  `json:"db_tables"`

	StorageStatus string `json:"storage_status"`
	EmailStatus   string `json:"email_status"`
	FeishuStatus  string `json:"feishu_status"`
}

// SystemDynamicResponse 系统动态信息
type SystemDynamicResponse struct {
	CPUUsage        float64 `json:"cpu_usage"`
	Load1           float64 `json:"load_1"`
	Load5           float64 `json:"load_5"`
	Load15          float64 `json:"load_15"`
	MemoryUsed      uint64  `json:"memory_used"`
	MemoryAvailable uint64  `json:"memory_available"`
	SwapUsed        uint64  `json:"swap_used"`
	HostUptime      int64   `json:"host_uptime"`
	DiskUsed        uint64  `json:"disk_used"`
	DiskFree        uint64  `json:"disk_free"`
	DbStatus        string  `json:"db_status"`
	DbSize          int64   `json:"db_size"`
	DbConnCount     int     `json:"db_conn_count"`
}

type SystemHandler struct {
	db            *gorm.DB
	uploadManager *upload.Manager
	emailClient   *email.Client
	feishuClient  *feishu.Client
}

func NewSystemHandler(db *gorm.DB, uploadManager *upload.Manager, emailClient *email.Client, feishuClient *feishu.Client) *SystemHandler {
	return &SystemHandler{
		db:            db,
		uploadManager: uploadManager,
		emailClient:   emailClient,
		feishuClient:  feishuClient,
	}
}

// GetSystemStatic 获取系统静态信息
func (h *SystemHandler) GetSystemStatic(c *gin.Context) {
	info := &SystemStaticResponse{
		CPUCore: runtime.NumCPU(),
		CPUArch: runtime.GOARCH,
		OS:      runtime.GOOS,
		DbType:  h.getDBType(),
	}

	if ci, err := cpu.Info(); err == nil && len(ci) > 0 {
		info.CPUModel = ci[0].ModelName
	}

	info.Hostname, _ = os.Hostname()
	info.Timezone = time.Now().Location().String()
	info.ServerIP = getServerIP()

	if m, err := mem.VirtualMemory(); err == nil {
		info.MemoryTotal = m.Total
	}
	if s, err := mem.SwapMemory(); err == nil {
		info.SwapTotal = s.Total
	}

	dp := "/"
	if runtime.GOOS == "windows" {
		dp = "C:"
	}
	if du, err := disk.Usage(dp); err == nil {
		info.DiskTotal = du.Total
	}

	info.DbTables = h.getTableCount()
	info.StorageStatus = h.checkStorage()
	info.EmailStatus = h.checkEmail()
	info.FeishuStatus = h.checkFeishu()

	response.Success(c, info)
}

// GetSystemDynamic 获取系统动态信息
func (h *SystemHandler) GetSystemDynamic(c *gin.Context) {
	info := &SystemDynamicResponse{}

	h.setDynamicCPU(info)
	h.setDynamicMemory(info)
	h.setDynamicHost(info)
	h.setDynamicDisk(info)
	h.setDynamicDB(info)

	response.Success(c, info)
}

func (h *SystemHandler) setDynamicCPU(info *SystemDynamicResponse) {
	if p, err := cpu.Percent(time.Second, false); err == nil && len(p) > 0 {
		info.CPUUsage = p[0]
	}
	if l, err := load.Avg(); err == nil {
		info.Load1 = l.Load1
		info.Load5 = l.Load5
		info.Load15 = l.Load15
	}
}

func (h *SystemHandler) setDynamicMemory(info *SystemDynamicResponse) {
	if m, err := mem.VirtualMemory(); err == nil {
		info.MemoryUsed = m.Used
		info.MemoryAvailable = m.Available
	}
	if s, err := mem.SwapMemory(); err == nil {
		info.SwapUsed = s.Used
	}
}

func (h *SystemHandler) setDynamicHost(info *SystemDynamicResponse) {
	if hi, err := host.Info(); err == nil {
		info.HostUptime = int64(hi.Uptime)
	}
}

func (h *SystemHandler) setDynamicDisk(info *SystemDynamicResponse) {
	dp := "/"
	if runtime.GOOS == "windows" {
		dp = "C:"
	}
	if du, err := disk.Usage(dp); err == nil {
		info.DiskUsed = du.Used
		info.DiskFree = du.Free
	}
}

func (h *SystemHandler) setDynamicDB(info *SystemDynamicResponse) {
	info.DbStatus = h.checkDB()
	info.DbSize = h.getDBSize()
	info.DbConnCount = h.getConnCount()
}

func (h *SystemHandler) checkDB() string {
	db, err := h.db.DB()
	if err != nil || db.Ping() != nil {
		return "连接失败"
	}
	return "正常"
}

func (h *SystemHandler) getDBType() string {
	return h.db.Dialector.Name()
}

func (h *SystemHandler) checkStorage() string {
	if h.uploadManager == nil {
		return "未配置"
	}
	if err := h.uploadManager.HealthCheck(); err != nil {
		return "异常"
	}
	return "正常"
}

func (h *SystemHandler) checkEmail() string {
	if h.emailClient == nil {
		return "未配置"
	}
	if err := h.emailClient.HealthCheck(); err != nil {
		return "异常"
	}
	return "正常"
}

func (h *SystemHandler) checkFeishu() string {
	if h.feishuClient == nil {
		return "未配置"
	}
	if err := h.feishuClient.HealthCheck(); err != nil {
		return "异常"
	}
	return "正常"
}

func (h *SystemHandler) getDBSize() int64 {
	var name string
	if err := h.db.Raw("SELECT current_database()").Scan(&name).Error; err != nil || name == "" {
		return 0
	}
	var size int64
	h.db.Raw(fmt.Sprintf("SELECT pg_database_size('%s')", name)).Scan(&size)
	return size
}

func (h *SystemHandler) getTableCount() int64 {
	var name string
	var count int64
	if err := h.db.Raw("SELECT current_database()").Scan(&name).Error; err != nil || name == "" {
		return 0
	}
	h.db.Raw(fmt.Sprintf("SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_catalog = '%s'", name)).Scan(&count)
	return count
}

func (h *SystemHandler) getConnCount() int {
	var name string
	var count int
	if err := h.db.Raw("SELECT current_database()").Scan(&name).Error; err != nil || name == "" {
		return 0
	}
	h.db.Raw(fmt.Sprintf("SELECT count(*) FROM pg_stat_activity WHERE datname = '%s'", name)).Scan(&count)
	return count
}

func getServerIP() string {
	if ifs, err := net.Interfaces(); err == nil {
		for _, i := range ifs {
			for _, addr := range i.Addrs {
				ip := addr.Addr
				if idx := 0; len(ip) > 0 {
					for j, c := range ip {
						if c == '/' {
							idx = j
							break
						}
					}
					if idx > 0 {
						ip = ip[:idx]
					}
				}
				if len(ip) > 0 && ip != "127.0.0.1" && ip[0] != ':' && (ip[0] >= '1' && ip[0] <= '9') {
					return ip
				}
			}
		}
	}
	return "N/A"
}
