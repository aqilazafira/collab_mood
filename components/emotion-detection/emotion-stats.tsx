import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface EmotionStatsProps {
  history: any[]
  emotions: any[]
}

export default function EmotionStats({ history, emotions }: EmotionStatsProps) {
  if (!history.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Belum ada data statistik</p>
      </div>
    )
  }

  // Hitung distribusi emosi
  const emotionCounts: Record<string, number> = {}
  history.forEach((item) => {
    if (emotionCounts[item.emotion]) {
      emotionCounts[item.emotion]++
    } else {
      emotionCounts[item.emotion] = 1
    }
  })

  // Format data untuk chart
  const chartData = Object.keys(emotionCounts).map((emotionId) => {
    const emotion = emotions.find((e) => e.id === emotionId)
    return {
      name: emotion?.name || emotionId,
      value: emotionCounts[emotionId],
      color: emotion?.color.replace("text-", "").replace("500", "500") || "gray-500",
    }
  })

  // Warna untuk chart
  const COLORS = {
    green: "#22c55e",
    blue: "#3b82f6",
    red: "#ef4444",
    gray: "#6b7280",
    purple: "#a855f7",
  }

  const getColor = (color: string) => {
    const [base, shade] = color.split("-")
    return COLORS[base as keyof typeof COLORS] || "#6b7280"
  }

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.color)} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} deteksi`, "Jumlah"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-sm">Ringkasan</h4>
        <div className="grid grid-cols-2 gap-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>{item.name}</span>
              <Badge variant="outline">{item.value} kali</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
