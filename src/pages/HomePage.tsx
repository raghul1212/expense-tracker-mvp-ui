import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();
  const [groupId, setGroupId] = useState('');

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupId.trim()) {
      navigate(`/groups/${groupId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Split Easy
          </h1>
          <p className="text-gray-600">
            Split expenses with friends, settle up later
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/create-group')}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Create New Group
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <form onSubmit={handleJoinGroup}>
            <input
              type="text"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              placeholder="Enter Group ID to join"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            />
            <button
              type="submit"
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Join Existing Group
            </button>
          </form>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2">Features:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Split expenses equally
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Track who owes whom
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              View group summary
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              No sign-up required
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}