export default function StructureLoading() {
  return (
    <div className="section-padding">
      <div className="container-custom">
        {/* Header skeleton */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="h-4 w-28 bg-electric-100 rounded-full mx-auto animate-pulse" />
          <div className="h-9 w-52 bg-gray-200 rounded-lg mx-auto mt-3 animate-pulse" />
          <div className="h-4 w-72 bg-gray-100 rounded mx-auto mt-4 animate-pulse" />
        </div>

        {/* Leader card skeleton */}
        <div className="max-w-sm mx-auto mb-10 animate-pulse">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-electric-100 to-navy-100 mx-auto" />
            <div className="h-5 w-36 bg-gray-200 rounded mx-auto mt-4" />
            <div className="h-4 w-24 bg-electric-100 rounded-full mx-auto mt-2" />
            <div className="h-4 w-32 bg-gray-100 rounded mx-auto mt-2" />
          </div>
        </div>

        {/* Members grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mx-auto" />
              <div className="h-4 w-28 bg-gray-200 rounded mx-auto mt-3" />
              <div className="h-3 w-20 bg-electric-100 rounded-full mx-auto mt-2" />
              <div className="h-3 w-16 bg-gray-100 rounded mx-auto mt-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
