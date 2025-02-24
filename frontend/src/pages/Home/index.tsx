import './style.css';
import { useEffect, useMemo, useState } from 'react';
import {
  getAllNetworkNodes,
  getNetworkNodeByIP,
} from '../../../service/network-service';
import { ILocalNetworkNode } from '../../types/LocalNetworkNode';
import LocalNetworkNodesList from '../../components/LocalNetworkNodesList';

export function Home() {
  const [selectedNode, setSelectedNode] = useState<ILocalNetworkNode>();

  const isNodeSelected = useMemo(() => {
    return Boolean(selectedNode);
  }, [selectedNode]);

  const handleSelectNode = async (index: number) => {
    const node = networkNodes[index];

    if (node) {
      getNetworkNodeByIP(node.ipAddress).then(({ data }) => {
        setSelectedNode(data);
      });
    }
  };

  const [networkNodesLoading, setNetworkNodesLoading] = useState(false);
  const [networkNodes, setNetworkNodes] = useState<ILocalNetworkNode[]>([]);

  useEffect(() => {
    setNetworkNodesLoading(true);

    getAllNetworkNodes()
      .then(({ data }) => {
        setNetworkNodes(data);
      })
      .finally(() => {
        setNetworkNodesLoading(false);
      });
  }, []);

  return (
    <div class="home-view">
      <div class="home-view-layout">
        <div>
          {isNodeSelected && (
            <div className="selected-network-node-info">
              Selected Node:
              {JSON.stringify(selectedNode)}
            </div>
          )}
        </div>
        <div>
          <LocalNetworkNodesList
            headingContent={<h2>Network Nodes</h2>}
            onSelectNode={handleSelectNode}
            networkNodesList={networkNodes}
            loading={networkNodesLoading}
          ></LocalNetworkNodesList>
        </div>
      </div>
    </div>
  );
}
