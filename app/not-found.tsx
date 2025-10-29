export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-cream dark:bg-dark-ocean transition-colors">
      <div className="text-6xl mb-6 animate-bounce-in">🦦</div>
      <h1 className="text-h1 font-bold text-gray-900 dark:text-gray-50">404 - 페이지를 찾을 수 없어요</h1>
      <p className="text-body text-gray-600 dark:text-gray-400 mt-2">찾으시는 페이지가 없네요</p>
    </div>
  );
}
