import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Layout.module.css'; // <-- Uses the CSS Module
import { useRouter } from 'next/router'; // <-- Imports the router

export default function Layout({ children }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter(); // Get the router

  // Define your auth pages to prevent nav error
  const authPages = ['/select-login', '/login', '/register', '/forgot-password', '/login-2fa'];
  
  // Check if the current page is an auth page
  const isAuthPage = authPages.includes(router.pathname);

  const getUsername = () => {
    if (!user || !user.email) return null;
    return user.email.split('@')[0];
  };

 return (
    <>
      <nav className={styles.navbar}> {/* <-- Use CSS module */}
        <div className={styles.container}>
          <Link href="/" className={styles.logo}>
            CharityPulse
          </Link>
          <div className={styles.navLinks}>
            <Link href="/">Discover Events</Link>
            
            {!loading && (
              user ? (
                <>
                  {/* Show "My Dashboard" only if they are an Organizer/Admin */}
                  {(user.role === 'Organizer' || user.role === 'Admin') && (
                    <Link href="/organiser/dashboard">My Dashboard</Link>
                  )}
                  
                  {/* --- THIS IS THE FIX --- */}
                  <Link href="/setup-mfa">Set up MFA</Link>
                  {/* --------------------- */}
                  
                  <span style={{ fontWeight: 'bold' }}>Welcome, {getUsername()}</span>
                  
                  <button onClick={logout} className={styles.navButtonSecondary}> {/* <-- Use CSS module */}
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/select-login" className={styles.navButton}> {/* <-- Use CSS module */}
                  Login / Register
                </Link>
              )
            )}
          </div>
        </div>
      </nav>
      
      <main>
        {children}
      </main>

      <footer className={styles.footer}> {/* <-- Use CSS module */}
        <p>© 2025 CharityPulse. All rights reserved.</p>
      </footer>
    </>
  );

}