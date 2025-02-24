import { useState, JSX } from 'preact/compat';
import './LocalNetworkNode.css';

interface Props {
  macAddress: string;
  ipAddress: string;
  online: boolean;
  vendor: string | null;

  onClick: () => void;
}

function LocalNetworkNode(props: Props): JSX.Element {
  return (
    <div
      class={`local-network-node ${props.online ? 'local-network-node--online' : ''}`}
      onClick={props.onClick}
    >
      <ul>
        <li>
          <span class="text-primary-bold">IP Address: </span>
          {props.ipAddress}
        </li>
        <li>
          <span className="text-primary-bold">MAC Address: </span>
          {props.macAddress}
        </li>
        <li>
          <span className="text-primary-bold">Vendor: </span>
          {props.vendor ?? 'Unavailable'}
        </li>
      </ul>
    </div>
  );
}

export default LocalNetworkNode;
