export default function GalleryLoading() {
  return (
    <div className="section-padding">
      <div className="container-custom">
        {/* Header skeleton */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="h-4 w-20 bg-electric-100 rounded-full mx-auto animate-pulse" />
          <div className="h-9 w-40 bg-gray-200 rounded-lg mx-auto mt-3 animate-pulse" />
          <div className="h-4 w-64 bg-gray-100 rounded mx-auto mt-4 animate-pulse" />
        </div>

        {/* Masonry-style grid skeleton */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {[240, 180, 300, 200, 260, 160, 220, 280, 190, 250, 170, 230].map((height, i) => (
            <div
              key={i}
              className="break-inside-avoid bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden animate-pulse"
              style={{
                height: `${height}px`,
                animationDelay: `${i * 60}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
