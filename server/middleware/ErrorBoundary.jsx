import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center">
                    <AlertTriangle className="text-rose-500 mx-auto mb-3" size={32} />
                    <h3 className="text-white font-bold">Something went wrong</h3>
                    <p className="text-gray-400 text-xs mt-1">This component failed to load. Please try refreshing.</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 text-[10px] font-black uppercase bg-gray-800 px-4 py-2 rounded-lg text-white"
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