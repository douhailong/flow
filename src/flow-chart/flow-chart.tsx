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
import type { FinishParams } from './components/sider-bar';
import HeaderBar from './components/header-bar';
import Footer from './components/footer';
import No from '@assets/no.png';
import Yes from '@assets/yes.png';
import { saveRuleDraft, auditRuleDraft, getTreeData } from '@services';
import { useMutation, useQuery } from 'react-query';

export type TypeNode = 'root' | 'branch' | 'pureNode' | 'node' | 'tip';

const mode = 'redaonly';

const nodeColor = {
  root: '#40a9ff',
  branch: '#95de64',
  node: '#d9f7be',
  pureNode: '#d9f7be',
  tip: '#ffd6e7'
};

const levelColor = {
  1: '#ffd6e7',
  2: '#ffe58f',
  3: '#f0f0f0'
};

enum typeEnum {
  root = 1,
  branch = 2,
  pureNode = 3,
  node = 3,
  tip = 4
}

function basicNode(title: string) {
  return [
    {
      id: 'root',
      data: {
        title,
        type: 'root'
      },
      style: { background: '#40a9ff' }
    }
  ];
}

const ruleId = '0c336a0ab34d44d688f9a03316b0a1ed';
const ruleName = '121d';

function App() {
  // const { undo, redo } = useFlowEditor();
  const [edges, setEdges] = useState<FlowViewEdge[]>([]);
  const [nodes, setNodes] = useState<FlowViewNode[]>(basicNode(ruleName));
  const [selectedId, setSelectedId] = useState<string>('root');
  const [show, setShow] = useState(true);

  const { selectNode, selectEdges, selectNodes, zoomToNode, fullScreen } = useFlowViewer();

  const getTreeQuery = useQuery(
    ['getTreeData'],
    () => getTreeData({ ruleId: ruleId, ruleType: '3' }),
    {
      onSuccess(res) {
        const data = res.data.data;
        setEdges(JSON.parse(data.ruleRelateJson));
        setNodes(JSON.parse(data.ruleDataJson));
        const r = { nodes: JSON.parse(data.ruleDataJson), edges: JSON.parse(data.ruleRelateJson) };
        console.log(r, 'rrrrr');
      }
    }
  );
  const auditRuleMutation = useMutation(auditRuleDraft, { onSuccess: () => {} });
  const saveRuleMutation = useMutation(saveRuleDraft, { onSuccess: () => {} });

  useEffect(() => {
    setShow(false);
    setTimeout(() => setShow(true), 0);
  }, [edges]);

  const nodeNum = nodes.length;
  const ruleNum = nodes.filter((node) => node.data.type === 'tip').length;
  const branchNum = nodes.filter((node) => node.data.type === 'branch').length;

  const onAddBranch = (type: TypeNode) => {
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
          title: `${type}&请设置节点内容`,
          type
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
    console.log(nodes);
  };
  const onConfirm = (type: 'sava' | 'audit') => {
    const payload = {
      ruleId,
      ruleName,
      ruleBranchNum: branchNum,
      ruleNum,
      ruleNodeNum: nodeNum,
      ruleData: nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          nodeName: node.data.title,
          nodeType: typeEnum[node.data.type]
        }
      })),
      ruleRelate: edges
    };

    type === 'audit' ? auditRuleMutation.mutate(payload) : saveRuleMutation.mutate(payload);
  };

  const onFinish = ({ step, values }: FinishParams) => {
    console.log(values);

    if (step === 1) {
      setNodes(
        nodes.map((node) => {
          return node.id === selectedId
            ? { ...node, data: { ...node.data, title: values.title } }
            : node;
        })
      );
    }

    if (step === 2) {
      setNodes(
        nodes.map((node) => {
          return node.id === selectedId
            ? {
                ...node,
                data: {
                  ...node.data,
                  needJson: 'T',
                  logo: values.sourceResult ? (values.sourceResult === 'T' ? Yes : No) : undefined,
                  jsonData: values
                }
              }
            : node;
        })
      );
    }
  };
  return (
    <div className='h-full'>
      <HeaderBar
        selectedNode={nodes.find((node) => node.id === selectedId)}
        onAddBranch={onAddBranch}
        onDelete={onDelete}
        onSearch={onSearch}
        onCopy={onCopy}
        onConfirm={onConfirm}
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
        <div className='w-72 p-2 overflow-y-auto relative'>
          <SiderBar
            parentNode={nodes.find(
              (node) => node.id === edges.find((edge) => edge.target === selectedId)?.source
            )}
            selectedNode={nodes.find((node) => node.id === selectedId)}
            onFinish={onFinish}
          />
        </div>
      </div>
      <Footer
        nodeNum={nodeNum}
        ruleNum={ruleNum}
        branchNum={branchNum}
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
