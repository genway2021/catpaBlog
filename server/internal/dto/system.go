package dto

// SystemStaticInfo 系统静态信息
type SystemStaticInfo struct {
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

	AppVersion string `json:"app_version"`
}

// SystemDynamicInfo 系统动态信息
type SystemDynamicInfo struct {
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

	VersionLatestVersion  string `json:"version_latest_version"`
	VersionLastCheckError string `json:"version_last_check_error"`
}
