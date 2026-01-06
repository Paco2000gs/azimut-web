import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.state.errorInfo = errorInfo;
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ color: '#dc2626' }}>Something went wrong.</h1>
                    <div style={{ backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '8px', border: '1px solid #ef4444' }}>
                        <h3 style={{ marginTop: 0 }}>Error Details:</h3>
                        <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
                            {this.state.error && this.state.error.toString()}
                        </pre>
                        <details style={{ marginTop: '1rem' }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Component Stack</summary>
                            <pre style={{ fontSize: '0.8rem', marginTop: '0.5rem', overflowX: 'auto' }}>
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    </div>
                    <p style={{ marginTop: '2rem' }}>
                        Please try refreshing the page. If the problem persists, check the console for more details.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ padding: '0.5rem 1rem', cursor: 'pointer', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
