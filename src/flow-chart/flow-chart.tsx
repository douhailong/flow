import {
  FlowView,
  FlowViewEdge,
  FlowViewNode,
  FlowViewProvider,
  SelectType,
  useFlowViewer,
  FlowEditorProvider,
  useFlowEditor
} from '@ant-design/pro-flow';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import SiderBar from './components/sider-bar';
import HeaderBar from './components/header-bar';
import Footer from './components/footer';

export type TypeNode = 'root' | 'branch' | 'pureNode' | 'node' | 'tip1' | 'tip2' | 'tip3';

const mode = 'redaonly';

const nodeColor = {
  root: '#40a9ff',
  branch: '#95de64',
  node: '#d9f7be',
  pureNode: 'red',
  tip1: '#ffd6e7',
  tip2: '#ffe58f',
  tip3: '#f0f0f0'
};

function App() {
  const [selectedId, setSelectedId] = useState<string>('root');
  const [show, setShow] = useState(true);
  const [edges, setEdges] = useState<FlowViewEdge[]>([]);
  const [nodes, setNodes] = useState<FlowViewNode[]>([
    {
      id: 'root',
      data: {
        title: '草药管理',
        metadata: {
          type: 'root'
        }
      },
      style: { background: '#40a9ff' }
    }
  ]);

  const { selectNode, selectEdges, selectNodes, zoomToNode, fullScreen } = useFlowViewer();
  const { undo, redo } = useFlowEditor();

  useEffect(() => {
    setShow(false);
    setTimeout(() => setShow(true), 0);
  }, [edges]);

  const onAddBranch = (type: TypeNode) => {
    console.log(type);
    const reg = new RegExp(`^${selectedId}&`);
    const filter = nodes.filter(
      (node) =>
        reg.test(node.id) &&
        typeof Number(node.id.split(`${selectedId}&`)[1]) === 'number' &&
        !Number.isNaN(Number(node.id.split(`${selectedId}&`)[1]))
    );
    const last = filter[filter.length - 1];
    const preNum = last === undefined ? 0 : Number(last.id.split(`${selectedId}&`)[1]);

    setNodes([
      ...nodes,
      {
        id: `${selectedId}&${preNum + 1}`,
        data: {
          title: `${selectedId}&${preNum + 1}`,
          metadata: {
            type
          }
        },
        style: { background: nodeColor[type] }
      }
    ]);

    setEdges([
      ...edges,
      {
        target: `${selectedId}&${preNum + 1}`,
        source: `${selectedId}`,
        id: `${selectedId}&${preNum + 1}`
      }
    ]);
  };

  const onDelete = () => {
    setNodes(nodes.filter((node) => !node.id.startsWith(selectedId)));
    setEdges(edges.filter((edge) => !edge.id.startsWith(selectedId)));
  };

  const onSearch = (value: string) => {
    selectNodes(
      nodes.filter((node) => node.data.title.includes(value)).map((node) => node.id),
      SelectType.SELECT
    );
  };

  const onCopy = () => {
    console.log('--------nodes:', nodes, '----------edges:', edges);
    // console.log(nodes.filter((node) => node.data.metadata.type));
  };

  return (
    <div className='h-full'>
      <HeaderBar
        selectedNode={nodes.find((node) => node.id === selectedId)}
        onAddBranch={onAddBranch}
        onDelete={onDelete}
        onSearch={onSearch}
        onCopy={onCopy}
      />
      <div className='flex h-[calc(100vh-6rem)]'>
        <div className='flex-1'>
          {/* [React Flow]: Couldn't create edge for source handle id: "undefined", edge id: root&1. Help: https://reactflow.dev/error#008 setEdges 会出现这个问题 */}
          {show && (
            <FlowView
              nodes={nodes}
              edges={edges}
              miniMap={false}
              onNodeClick={(e, node) => {
                setSelectedId((pre) => {
                  selectNode(pre, SelectType.DEFAULT);
                  selectNode(node.id, SelectType.SELECT);
                  return node.id;
                });
              }}
            />
          )}
        </div>
        <div className='w-80 m-2'>
          <SiderBar
            selectedNode={nodes.find((node) => node.id === selectedId)}
            onFinish={(title) =>
              setNodes(
                nodes.map((node) => {
                  return node.id === selectedId ? { ...node, data: { ...node.data, title } } : node;
                })
              )
            }
          />
        </div>
      </div>
      <Footer
        nodeNum={nodes.length}
        ruleNum={nodes.filter((node) => node.data.metadata.type.includes('tip1')).length}
        branchNum={nodes.filter((node) => node.data.metadata.type === 'branch').length}
        version={'草药管理v1.1'}
        auditTime={'2023-07-01'}
      />
    </div>
  );
}

function ProApp() {
  return (
    <FlowViewProvider>
      <FlowEditorProvider>
        <App />
      </FlowEditorProvider>
    </FlowViewProvider>
  );
}

export default ProApp;
