import { Suspense } from 'react';
import MatchGame from '../components/MatchGame';

export default function MatchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-purple-100">
          <div className="flex justify-center items-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Loading game...
          </h2>
        </div>
      </div>
    }>
      <MatchGame />
    </Suspense>
  );
}
