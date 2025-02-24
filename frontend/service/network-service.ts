import { getRequest, postRequest } from './index';
import { ILocalNetworkNode } from '../src/types/LocalNetworkNode';

export const getAllNetworkNodes = () => {
  return getRequest<ILocalNetworkNode[]>('/api/network/nodes');
};

export const getNetworkNodeByIP = (ip: string) => {
  return postRequest<any>(`/api/network/nodes/find/ip`, {
    ip,
  });
};
