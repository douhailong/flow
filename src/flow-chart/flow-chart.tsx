import {
  FlowView,
  FlowViewEdge,
  FlowViewNode,
  FlowViewProvider,
  SelectType,
  useFlowViewer,
  FlowEditorProvider
} from '@ant-design/pro-flow';
import { useEffect, useState } from 'react';
import SiderBar from './components/sider-bar';
import HeaderBar from './components/header-bar';
import Footer from './components/footer';
import {
  type SubmitType,
  type NodeType,
  nodeColors,
  levelColors,
  nodeTypeMapping,
  RootNode,
  ruleId,
  ruleName,
  ruleVersion,
  ruleType,
  mode
} from './utils';
import type { OnFinishProps } from './components/sider-bar';

import { saveRuleDraft, auditRuleDraft, getTreeData } from '@services';
import { useMutation, useQuery } from 'react-query';

import No from '@assets/no.png';
import Yes from '@assets/yes.png';

function App() {
  const [edges, setEdges] = useState<FlowViewEdge[]>([]);
  const [nodes, setNodes] = useState<FlowViewNode[]>(RootNode(ruleName));
  const [selectedId, setSelectedId] = useState<string>('root');
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(false);
    setTimeout(() => setShow(true), 0);
  }, [edges]);

  const { selectNode, selectNodes } = useFlowViewer();

  const getTreeQuery = useQuery(
    ['getTreeQuery'],
    () => getTreeData({ ruleId, ruleVersion, ruleType }),
    {
      onSuccess(res) {
        const data = res.data.data;
        if (data.ruleDataJson && data.ruleRelateJson) {
          setEdges(JSON.parse(data.ruleRelateJson));
          setNodes(JSON.parse(data.ruleDataJson));
        }
      }
    }
  );

  const auditRuleMutation = useMutation(auditRuleDraft, {
    onSuccess() {
      getTreeQuery.refetch();
    }
  });

  const saveRuleMutation = useMutation(saveRuleDraft, {
    onSuccess() {
      getTreeQuery.refetch();
    }
  });

  const nodeNum = nodes.length;
  const ruleNum = nodes.filter((node) => node.data.type === 'tip').length;
  const branchNum = nodes.filter((node) => node.data.type === 'branch').length;
  const selectedNode = nodes.find((node) => node.id === selectedId);
  const parentNode = nodes.find(
    (node) => node.id === edges.find((edge) => edge.target === selectedId)?.source
  );

  const onAddBranch = (type: NodeType) => {
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
          title: `请设置内容`,
          type
        },
        style: { background: nodeColors[type] }
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

  const onSearch = (value: string, clear?: boolean) => {
    if (clear) {
      return selectNodes(
        nodes.map((node) => node.id),
        SelectType.DEFAULT
      );
    }
    selectNodes(
      nodes.filter((node) => node.data.title.includes(value)).map((node) => node.id),
      SelectType.SELECT
    );
    selectNodes(
      nodes.filter((node) => !node.data.title.includes(value)).map((node) => node.id),
      SelectType.DEFAULT
    );
  };

  // TODO
  const onCopy = () => {
    console.log(nodes);
  };

  const onSubmit = (type: SubmitType) => {
    const payload = {
      ruleId,
      ruleNum,
      ruleName,
      ruleBranchNum: branchNum,
      ruleNodeNum: nodeNum,
      ruleRelate: edges,
      ruleData: nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          nodeName: node.data.title,
          nodeType: nodeTypeMapping[node.data.type as NodeType]
        }
      }))
    };

    type === 'audit' && auditRuleMutation.mutate(payload);
    type === 'sava' && saveRuleMutation.mutate(payload);
  };

  const onFinish = ({ step, values, title }: OnFinishProps) => {
    console.log(values, title, 'onfinished');

    if (step === 1) {
      setNodes(
        nodes.map((node) => {
          return node.id === selectedId ? { ...node, data: { ...node.data, title } } : node;
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
                  title,
                  sourceResult: values.sourceResult,
                  logo: values.sourceResult ? (values.sourceResult === 'T' ? Yes : No) : undefined,
                  jsonData: values
                }
              }
            : node;
        })
      );
    }

    if (step === 3) {
      setNodes(
        nodes.map((node) => {
          return node.id === selectedId
            ? {
                ...node,
                data: {
                  ...node.data,
                  title: values.title,
                  logo: values.sourceResult ? (values.sourceResult === 'T' ? Yes : No) : undefined,
                  sourceResult: values.sourceResult,
                  isWarnUse: values.isWarnUse,
                  warnContent: values,
                  titleSlot: {
                    type: 'right',
                    value: values.warnLevel === 3 ? '✘' : '✔'
                  }
                },
                style: { background: levelColors[values.warnLevel] }
              }
            : node;
        })
      );
    }
  };

  return (
    <div className='h-full'>
      <HeaderBar
        selectedNode={selectedNode}
        onAddBranch={onAddBranch}
        onDelete={onDelete}
        onSearch={onSearch}
        onCopy={onCopy}
        onSubmit={onSubmit}
        mode={mode}
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
        {mode === 'mutable' && (
          <div className='w-72 p-2 overflow-y-auto relative'>
            <SiderBar onFinish={onFinish} selectedNode={selectedNode} parentNode={parentNode} />
          </div>
        )}
      </div>
      <Footer nodeNum={nodeNum} ruleNum={ruleNum} branchNum={branchNum} />
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
