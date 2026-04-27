export default function NewsLoading() {
  return (
    <div className="section-padding">
      <div className="container-custom">
        {/* Header skeleton */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="h-4 w-28 bg-electric-100 rounded-full mx-auto animate-pulse" />
          <div className="h-9 w-56 bg-gray-200 rounded-lg mx-auto mt-3 animate-pulse" />
          <div className="h-4 w-80 bg-gray-100 rounded mx-auto mt-4 animate-pulse" />
          <div className="h-4 w-64 bg-gray-100 rounded mx-auto mt-2 animate-pulse" />
        </div>

        {/* Cards grid skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Image placeholder */}
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200" />
              {/* Content */}
              <div className="p-5 space-y-3">
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-electric-100 rounded-full" />
                  <div className="h-5 w-20 bg-gray-100 rounded-full" />
                </div>
                <div className="h-5 w-full bg-gray-200 rounded" />
                <div className="h-5 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-100 rounded" />
                <div className="h-4 w-5/6 bg-gray-100 rounded" />
                <div className="h-px bg-gray-100 mt-4" />
                <div className="flex items-center justify-between pt-1">
                  <div className="h-4 w-24 bg-gray-100 rounded" />
                  <div className="h-4 w-16 bg-electric-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
