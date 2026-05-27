import React from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle size={20} className="text-rose-400" />
            <span className="text-rose-400 font-semibold">Something went wrong</span>
          </div>
          <p className="text-rose-300/80 text-sm mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={this.resetError}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Try Again
          </button>
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details className="mt-4 text-xs text-rose-300/60 max-h-32 overflow-y-auto">
              <summary>Error Details (Dev Only)</summary>
              <pre className="mt-2 whitespace-pre-wrap break-words">
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
