import { AuthProvider } from '../contexts/AuthContext';
import Layout from '../components/Layout';
// Import global styles if you have them
// import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}

export default MyApp;