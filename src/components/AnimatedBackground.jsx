import { Suspense, lazy, useMemo, Component } from 'react';
import { useOptions } from '/src/utils/optionsContext';
import { BACKGROUND_CONFIGS } from '/src/data/backgroundConfigs';
import '/src/styles/animated-backgrounds.css';

const reactBitsModules = import.meta.glob('./reactbits/*/*.jsx');

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: false }; }
  static getDerivedStateFromError() { return { error: true }; }
  componentDidCatch(e) { console.warn('[AnimatedBackground] Render error:', e?.message); }
  render() { return this.state.error ? null : this.props.children; }
}

const AnimatedBackground = () => {
  const { options } = useOptions();
  const bgType = options.customAnimatedBackground;
  const savedProps = useMemo(() => options.animatedBgProps || {}, [options.animatedBgProps]);
  const containerStyle = {
    position: 'fixed',
    inset: 0,
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    isolation: 'isolate',
    contain: 'layout paint size',
    backgroundColor: options.bgColor || '#111827',
  };

  const mergedProps = useMemo(() => {
    if (!bgType || bgType === 'StarrySky') return {};
    const defaults = BACKGROUND_CONFIGS[bgType]?.props || {};
    const custom = savedProps[bgType] || {};
    return { ...defaults, ...custom };
  }, [bgType, savedProps]);

  const DynamicComponent = useMemo(() => {
    if (!bgType || bgType === 'StarrySky') return null;
    const modulePath = Object.keys(reactBitsModules).find(p => p.includes(`/${bgType}/${bgType}.jsx`));
    if (!modulePath) { console.warn('[AnimatedBackground] No module found for:', bgType); return null; }
    return lazy(reactBitsModules[modulePath]);
  }, [bgType]);

  if (!bgType) return null;

  if (bgType === 'StarrySky') {
    return (
      <div className="z-[-1] bg-[#050505]" style={containerStyle} aria-hidden="true">
        <div id="stars" />
        <div id="stars2" />
        <div id="stars3" />
      </div>
    );
  }

  if (DynamicComponent) {
    return (
      <div className="z-[-1]" style={containerStyle} aria-hidden="true">
        <ErrorBoundary>
          <Suspense fallback={null}>
            <DynamicComponent {...mergedProps} />
          </Suspense>
        </ErrorBoundary>
      </div>
    );
  }

  return null;
};

export default AnimatedBackground;
