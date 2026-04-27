export default function AchievementsLoading() {
  return (
    <div className="section-padding">
      <div className="container-custom">
        {/* Header skeleton */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="h-4 w-24 bg-gold-100 rounded-full mx-auto animate-pulse" />
          <div className="h-9 w-44 bg-gray-200 rounded-lg mx-auto mt-3 animate-pulse" />
          <div className="h-4 w-72 bg-gray-100 rounded mx-auto mt-4 animate-pulse" />
          <div className="h-4 w-56 bg-gray-100 rounded mx-auto mt-2 animate-pulse" />
        </div>

        {/* Stats row skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm text-center animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="h-8 w-12 bg-gold-100 rounded-lg mx-auto" />
              <div className="h-4 w-20 bg-gray-100 rounded mx-auto mt-2" />
            </div>
          ))}
        </div>

        {/* Achievement cards skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="h-2 bg-gradient-to-r from-gold-300 to-gold-400" />
              <div className="p-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gold-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-full bg-gray-200 rounded" />
                    <div className="h-4 w-3/4 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="h-4 w-full bg-gray-100 rounded" />
                <div className="h-4 w-5/6 bg-gray-100 rounded" />
                <div className="flex gap-2 pt-2">
                  <div className="h-5 w-16 bg-gold-100 rounded-full" />
                  <div className="h-5 w-20 bg-gray-100 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
