import { Component } from "react";
import { cn } from "@/lib/utils";

export class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.warn("WebGL error boundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

export function WebGLFallback({ className, message }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-neutral-100 text-neutral-500 text-sm",
        className
      )}
    >
      <p className="max-w-xs text-center px-4">{message}</p>
    </div>
  );
}
