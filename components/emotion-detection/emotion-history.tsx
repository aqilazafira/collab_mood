import { Badge } from "@/components/ui/badge"
import { Meh } from "lucide-react"

interface EmotionHistoryProps {
  history: any[]
  emotions: any[]
}

export default function EmotionHistory({ history, emotions }: EmotionHistoryProps) {
  if (!history.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Belum ada riwayat deteksi</p>
      </div>
    )
  }

  const getEmotionIcon = (emotionId: string) => {
    const emotion = emotions.find((e) => e.id === emotionId)
    if (!emotion) return Meh
    return emotion.icon
  }

  const getEmotionColor = (emotionId: string) => {
    const emotion = emotions.find((e) => e.id === emotionId)
    if (!emotion) return "text-gray-500"
    return emotion.color
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
      {history.map((item) => {
        const EmotionIcon = getEmotionIcon(item.emotion)
        const emotionColor = getEmotionColor(item.emotion)

        return (
          <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${emotionColor.replace("text-", "bg-").replace("500", "100")}`}>
                <EmotionIcon className={`h-4 w-4 ${emotionColor}`} />
              </div>
              <div>
                <p className="font-medium">{item.emotionName}</p>
                <p className="text-xs text-gray-500">{item.timestamp}</p>
              </div>
            </div>
            <Badge variant="outline">{Math.round(item.confidence * 100)}%</Badge>
          </div>
        )
      })}
    </div>
  )
}
