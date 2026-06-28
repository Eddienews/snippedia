import { Component, ErrorInfo, ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

class AppErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Keep runtime details for debugging in production/devtools.
    console.error("Unhandled UI error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-black text-white flex items-center justify-center px-6">
          <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="text-white/70 mt-2 text-sm">
              Snippedia hit an unexpected error. Reload to recover.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-5 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 text-white border border-white/10 transition"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
