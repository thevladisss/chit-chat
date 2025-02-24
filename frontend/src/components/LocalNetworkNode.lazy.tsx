import LocalNetworkNodes from './LocalNetworkNode';
import { lazy } from 'preact-iso';

const LocalNetworkNodeLazy = lazy(() => {
  return import('./LocalNetworkNode');
});

export default LocalNetworkNodeLazy;
