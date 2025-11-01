import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import SearchBar from '../search/SearchBar';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-blue-600">
              커뮤니티 포럼
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                홈
              </Link>
              <Link
                to="/boards"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                게시판
              </Link>

              {/* Auth Links */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">
                    환영합니다, {user?.displayName || user?.username}님
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    로그인
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <SearchBar placeholder="게시판이나 게시글을 검색하세요..." />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
