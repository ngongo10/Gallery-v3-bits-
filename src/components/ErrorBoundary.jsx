import { Component } from 'react';

/** Catches render crashes so mobile tabs don't hard-reload into a loader loop. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown error' };
  }

  componentDidCatch(error, info) {
    console.error('App crash:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            background: '#050507',
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
            padding: 24,
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, opacity: 0.7, fontSize: 13, letterSpacing: '0.08em' }}>
            SOMETHING WENT WRONG
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.25)',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            RELOAD
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
