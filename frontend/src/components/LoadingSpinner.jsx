function LoadingSpinner() {
  return (
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      <span class="sr-only">Loading...</span>
    </div>
  );
}

export default LoadingSpinner; 