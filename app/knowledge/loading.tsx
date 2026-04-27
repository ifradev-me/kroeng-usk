export default function KnowledgeLoading() {
  return (
    <div className="section-padding">
      <div className="container-custom">
        {/* Header skeleton */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="h-4 w-24 bg-electric-100 rounded-full mx-auto animate-pulse" />
          <div className="h-9 w-52 bg-gray-200 rounded-lg mx-auto mt-3 animate-pulse" />
          <div className="h-4 w-72 bg-gray-100 rounded mx-auto mt-4 animate-pulse" />
          <div className="h-4 w-60 bg-gray-100 rounded mx-auto mt-2 animate-pulse" />
        </div>

        {/* Filter tabs skeleton */}
        <div className="flex gap-2 justify-center mb-8 flex-wrap">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 bg-gray-100 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>

        {/* Cards grid skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-electric-100 rounded-lg flex-shrink-0" />
                  <div className="h-5 w-16 bg-gray-100 rounded-full" />
                </div>
                <div className="h-5 w-full bg-gray-200 rounded" />
                <div className="h-5 w-4/5 bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-100 rounded" />
                <div className="h-4 w-5/6 bg-gray-100 rounded" />
                <div className="h-4 w-3/4 bg-gray-100 rounded" />
                <div className="h-px bg-gray-100 mt-4" />
                <div className="flex items-center justify-between pt-1">
                  <div className="h-4 w-20 bg-gray-100 rounded" />
                  <div className="h-8 w-24 bg-electric-100 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
