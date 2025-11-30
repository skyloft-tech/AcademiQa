// @/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode; // Optional custom fallback for specific instances
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Optional: Log to a service like Sentry
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <h1>Something went wrong. Please refresh the page.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;