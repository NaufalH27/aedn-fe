
export default function LoadingPage() {
  return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="w-full aspect-square rounded-2xl bg-gray-100 animate-pulse" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-16 h-16 rounded-lg bg-gray-100 animate-pulse" />
              ))}
            </div>
            <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 rounded animate-pulse w-2/3" />
            <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
  )
}
