import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Layout.module.css';
import { useRouter } from 'next/router'; 

export default function Layout({ children }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const authPages = ['/select-login', '/login', '/register', '/forgot-password', '/login-2fa'];
  
  const isAuthPage = authPages.includes(router.pathname);

  const getUsername = () => {
    if (!user || !user.email) return null;
    return user.email.split('@')[0];
  };

 return (
    <>
      <nav className={styles.navbar}> 
        <div className={styles.container}>
          <Link href="/" className={styles.logo}>
            CharityPulse
          </Link>
          <div className={styles.navLinks}>
            <Link href="/">Discover Events</Link>
            
            {!loading && (
              user ? (
                <>
                  {(user.role === 'Organizer' || user.role === 'Admin') && (
                    <Link href="/organiser/dashboard">My Dashboard</Link>
                  )}
                  
                  <Link href="/setup-mfa">Set up MFA</Link>                  
                  <span style={{ fontWeight: 'bold' }}>Welcome, {getUsername()}</span>
                  
                  <button onClick={logout} className={styles.navButtonSecondary}> 
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/select-login" className={styles.navButton}> 
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

      <footer className={styles.footer}>
        <p>© 2025 CharityPulse. All rights reserved.</p>
      </footer>
    </>
  );

}