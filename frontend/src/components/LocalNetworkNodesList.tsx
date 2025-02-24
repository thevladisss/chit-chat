import { useState, JSX } from 'preact/compat';
import { ILocalNetworkNode } from '../types/LocalNetworkNode';
import './LocalNetworkNodesList.css';
import { sortBy } from 'lodash-es/lodash';
import LocalNetworkNode from './LocalNetworkNode.lazy';
import { range } from 'lodash-es/util';
import { useMemo } from 'react';
import { list } from 'postcss';
import SkeletonRectangle from './skeletons/SkeletonRectangle';

type Props = {
  networkNodesList: ILocalNetworkNode[];
  loading: boolean;

  headingContent?: JSX.Element;

  onSelectNode: (index: number) => void;
};
function LocalNetworkNodesList({
  networkNodesList,
  headingContent,
  loading,
  onSelectNode,
}: Props): JSX.Element {
  const sortedNetworkNodesListByOnline = useMemo(() => {
    return networkNodesList.slice().sort((a, b) => {
      if (a.online) return -1;
      else return 1;
    });
  }, [networkNodesList]);

  const loadingPlaceholders = (
    <>
      {range(6).map(() => {
        return (
          <li>
            <SkeletonRectangle width="100%" height="100px" />
          </li>
        );
      })}
    </>
  );

  return (
    <div className="local-network-nodes-list">
      {headingContent}
      <ul>
        {loading
          ? loadingPlaceholders
          : sortedNetworkNodesListByOnline.map((node, index) => {
              return (
                <li>
                  <LocalNetworkNode
                    ipAddress={node.ipAddress}
                    macAddress={node.macAddress}
                    online={node.online}
                    vendor={node.vendor}
                    key={index}
                    onClick={() => onSelectNode(index)}
                  />
                </li>
              );
            })}
      </ul>
    </div>
  );
}

export default LocalNetworkNodesList;
