import {
  FlowView,
  FlowViewEdge,
  FlowViewNode,
  FlowViewProvider,
  SelectType,
  useFlowViewer,
  FlowEditorProvider
} from '@ant-design/pro-flow';
import { message, Spin } from 'antd';
import copyToClipboard from 'copy-to-clipboard';
import { Suspense, useEffect, useState } from 'react';
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
  version,
  ruleType,
  hasDraft,
  auditTime,
  mode,
  nodeId
} from './utils';
import type { OnFinishProps } from './components/sider-bar';
import ConfirmModal from '@components/confirm-modal/confirm-modal';

import {
  saveRuleDraft,
  auditRuleDraft,
  getTreeData,
  judgeHasDraft,
  judgeHasPermission,
  isCanOperation
} from '@services';
import { useMutation, useQuery } from 'react-query';

import No from '@assets/no.png';
import Yes from '@assets/yes.png';

function App() {
  const [copyNode, setCopyNode] = useState<FlowViewNode[]>([]);
  const [edges, setEdges] = useState<FlowViewEdge[]>([]);
  const [nodes, setNodes] = useState<FlowViewNode[]>(RootNode(ruleName));
  const [selectedId, setSelectedId] = useState<string>('root');
  const [changedIds, setChangedIds] = useState<string[]>([]);
  const [show, setShow] = useState(true);
  const [stores, setStores] = useState({
    version,
    ruleType,
    ruleName,
    auditTime,
    hasDraft,
    mode,
    nodeId
  });

  useEffect(() => {
    const { version, ruleType, ruleName, auditTime, mode, hasDraft, nodeId } = stores;
    sessionStorage.setItem('hasDraft', hasDraft);
    sessionStorage.setItem('ruleName', ruleName);
    sessionStorage.setItem('ruleType', ruleType);
    sessionStorage.setItem('version', version);
    sessionStorage.setItem('auditTime', auditTime);
    sessionStorage.setItem('mode', mode);

    // () => sessionStorage.clear();
  }, [stores]);

  useEffect(() => {
    setShow(false);
    setTimeout(() => setShow(true), 10);
    if (stores.nodeId && stores.mode === 'check') onLookRunningRule(stores.nodeId);
  }, [edges, nodes]);

  useEffect(() => {
    setTimeout(() => selectNodes(changedIds, SelectType.DANGER), 100);
  }, [changedIds]);

  const { selectNode, selectNodes } = useFlowViewer();

  const judgeHasDraftMutation = useMutation(judgeHasDraft, {
    onSuccess(res) {
      setStores({ ...stores, mode: 'mutable', ruleType: '3' });
      setTimeout(() => getTreeQuery.refetch(), 10);
    }
  });

  const getTreeQuery = useQuery(
    ['getTreeQuery'],
    () =>
      getTreeData({
        ruleId,
        ruleVersion: stores.version,
        ruleType: stores.ruleType
      }),
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
    onSuccess({ data }) {
      message.success('审核成功');
      const { ruleType, version } = data.data;
      setStores({
        ...stores,
        ruleType,
        version: version[0] === 'V' ? version : stores.version,
        ruleName: nodes.filter((item: FlowViewNode) => item.id === 'root')[0].data.title
      });
      setTimeout(() => getTreeQuery.refetch(), 10);
    }
  });

  const saveRuleMutation = useMutation(saveRuleDraft, {
    onSuccess({ data }) {
      const { ruleType, version } = data.data;
      message.success('保存成功');
      setStores({
        ...stores,
        ruleType,
        version: version[0] === 'V' ? version : stores.version,
        ruleName: nodes.filter((item: FlowViewNode) => item.id === 'root')[0].data.title
      });
      setTimeout(() => getTreeQuery.refetch(), 10);
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
      SelectType.DANGER
    );
    selectNodes(
      nodes.filter((node) => !node.data.title.includes(value)).map((node) => node.id),
      SelectType.DEFAULT
    );
  };

  const onCopy = () => {
    const nds = nodes.filter((node) => node.id.includes(selectedId));
    setCopyNode(nds);
    // message.success('复制成功');
  };

  const onSwitchToMutable = async () => {
    const { data } = await judgeHasPermission(ruleId);

    if (data?.resultCode !== '00000') return message.error('有用户正在编辑规则，无法再次进行编辑');

    if (stores.hasDraft === 'true') {
      ConfirmModal({
        title: '编辑提示',
        content: '已有规则草稿，是否前往编辑？',
        onOk: () => {
          setStores({ ...stores, mode: 'mutable', ruleType: '3' });
          setTimeout(() => getTreeQuery.refetch(), 10);
        }
      });
    } else {
      judgeHasDraftMutation.mutate(ruleId);
    }
  };

  // TODO
  const onPaste = () => {
    if (!copyNode.length) return message.error('请先复制节点');
    const pasteType = copyNode[0].data.type;
    const selectedType = selectedNode?.data.type;

    if (selectedType === 'root') {
      if (pasteType !== 'branch') return message.error('根节点下只可以粘贴分支');
    }

    if (selectedType === 'branch') {
      if (pasteType !== 'pureNode') return message.error('分支下只可以粘贴无判断节点');
    }

    if (selectedType === 'pureNode' || selectedType === 'node') {
      if (pasteType !== 'node' && pasteType !== 'tip')
        return message.error('无判断节点只可以粘贴判断节点和警示');
    }

    // if (firstNodeType !== 'branch' && selectedNode?.data.type === 'root')
    //   return message.error('根节点下只可以粘贴分支');

    // if (firstNodeType !== 'pureNode' && selectedNode?.data.type === 'branch')
    //   return message.error('分支下只可以粘贴无判断节点');

    // if (firstNodeType !== 'tip' && selectedNode?.data.type === 'node')
    //   return message.error('判断节点下只能粘贴警示');

    // if (
    //   (firstNodeType !== 'node' || firstNodeType !== 'tip') &&
    //   selectedNode?.data.type === 'pureNode'
    // )
    //   return message.error('分支下只可以粘贴判断节点和警示');

    const edgs = edges
      .filter((edge) => edge.source === selectedId)
      .map((edge) => Number(edge.id.replace(selectedId + '&', '')));
    const lastNum = Math.max(...edgs);
    const firstId = copyNode[0]?.id;
    const firstPasteId = `${selectedId}&${lastNum + 1}`;
    const newNds = copyNode.map((node) => ({
      ...node,
      id: node.id.replace(firstId, firstPasteId)
    }));
    const newEdgs = newNds.map((node) => ({
      source: node.id.split('&').slice(0, -1).join('&'),
      target: node.id,
      id: node.id
    }));
    setNodes([...nodes, ...newNds]);
    setEdges([...edges, ...newEdgs]);
  };

  const onLookRunningRule = (warn?: string) => {
    const warns = warn
      ? [warn]
      : nodes
          .filter(({ data }) => data.type === 'tip' && data.isWarnUse === 'T')
          .map((node) => node.id);

    const result: string[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const curNode = nodes[i];
      for (let k = 0; k < warns.length; k++) {
        const curWarns = warns[k];
        if (
          curWarns.includes(curNode.id) &&
          !result.includes(curNode.id) &&
          curNode.id !== 'root' &&
          curNode.data.isWarnUse !== 'F'
        )
          result.push(curNode.id);
      }
    }
    setChangedIds(result);
  };

  const onSubmit = async (type: SubmitType) => {
    // const { data } = await isCanOperation(ruleId);

    // if (data?.resultCode !== '00000') return message.error('有用户正在编辑规则，无法再次进行编辑');

    const nds = nodes.filter((node) => node.data.title === '请设置内容');
    if (nds.length)
      return ConfirmModal({
        title: '提示',
        content: '操作失败，请填写完整节点数据',
        cancelButtonProps: { style: { display: 'none' } }
      });

    const payload = {
      ruleId,
      ruleNum,
      ruleName: stores.ruleName,
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

    const jsonNodes = JSON.stringify(nodes);
    // 接口返回的JSON数据格式和JSON.stringify的不一样
    const jsonData = JSON.stringify(
      JSON.parse(getTreeQuery.data?.data?.data?.ruleDataJson ?? '{}')
    );

    if (jsonData === jsonNodes || nodes.length === 1) {
      if (type === 'sava')
        return ConfirmModal({
          title: '保存提示',
          content: '当前规则未做任何修改，保存失败',
          cancelButtonProps: { style: { display: 'none' } }
        });

      if (type === 'audit')
        return ConfirmModal({
          title: '审核提示',
          content: '当前规则未做任何修改，审核失败',
          cancelButtonProps: { style: { display: 'none' } }
        });
    }
    type === 'sava' && saveRuleMutation.mutate(payload);

    const edgs = edges.map((edg) => edg.source);
    const ndss = nodes.filter((node) => !edgs.includes(node.id) && node.data.type !== 'tip');

    if (type === 'audit' && ndss.length)
      return ConfirmModal({
        title: '审核提示',
        content: '审核失败，规则不完整，请进行查验',
        cancelButtonProps: { style: { display: 'none' } }
      });

    type === 'audit' &&
      ConfirmModal({
        title: '审核提示',
        content: '将审核当下修改，通过所有未审核规则',
        onOk: () => auditRuleMutation.mutate(payload)
      });
  };

  const onFinish = ({ step, values, title }: OnFinishProps) => {
    if (step === 1) {
      setNodes(
        nodes.map((node) => {
          return node.id === selectedId ? { ...node, data: { ...node.data, title } } : node;
        })
      );
    }

    if (step === 2) {
      function specialJsonData() {
        console.log(values, '-------------------');

        if (values.ages) {
          const { ages, checkParam, paramVal } = values;
          return ages.map((age: any) => {
            return {
              ...age,
              checkParam,
              checkSign: age.checkSign === 'ignore' ? undefined : age.checkSign,
              descParam: Array.isArray(paramVal) ? 'dict' : 'word'
            };
          });
        }

        if (values.nums) {
          const { nums, checkParam, paramVal } = values;
          return nums.map((num: any) => {
            return {
              ...num,
              checkParam,
              checkSign: num.checkSign === 'ignore' ? undefined : num.checkSign
            };
          });
        }
      }

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
                  jsonData: {
                    ...values,
                    descParam: Array.isArray(values.paramVal) ? 'dict' : 'word'
                  },
                  checkParam: values.checkParam,
                  descParam: Array.isArray(values.paramVal) ? 'dict' : 'word',
                  specialJsonData: specialJsonData()
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
                  title,
                  logo: values.sourceResult ? (values.sourceResult === 'T' ? Yes : No) : undefined,
                  sourceResult: values.sourceResult,
                  isWarnUse: values.isWarnUse,
                  warnContent: values,
                  warnLevel: values.warnLevel,
                  titleSlot: {
                    type: 'right',
                    value: values.isWarnUse === 'F' ? '✘' : '✔'
                  }
                },
                style: {
                  background:
                    // @ts-ignore
                    values.isWarnUse === 'F' ? levelColors.disabled : levelColors[values.warnLevel]
                }
              }
            : node;
        })
      );
    }
  };

  return (
    <div className='h-full'>
      <Spin tip='加载中...' spinning={getTreeQuery.isFetching}>
        <HeaderBar
          selectedNode={selectedNode}
          onSwitchToMutable={onSwitchToMutable}
          onLookRunningRule={onLookRunningRule}
          onPaste={onPaste}
          onAddBranch={onAddBranch}
          onDelete={onDelete}
          onSearch={onSearch}
          onCopy={onCopy}
          onSubmit={onSubmit}
          mode={stores.mode}
        />
        <div className='flex h-[calc(100vh-6rem)]'>
          <div className='flex-1'>
            {/* [React Flow]: Couldn't create edge for source handle id: "undefined", edge id: root&1. Help: https://reactflow.dev/error#008 setEdges 会出现这个问题 */}
            {show && (
              <FlowView
                nodes={nodes}
                edges={edges}
                onNodeClick={(e, node) => {
                  stores.mode === 'mutable' &&
                    setSelectedId((pre) => {
                      selectNode(pre, SelectType.DEFAULT);
                      selectNode(node.id, SelectType.SELECT);
                      return node.id;
                    });
                }}
              />
            )}
          </div>
          {stores.mode === 'mutable' && (
            <div className='w-72 p-2 overflow-y-auto relative'>
              {/* @ts-ignore */}
              <SiderBar onFinish={onFinish} selectedNode={selectedNode} parentNode={parentNode} />
            </div>
          )}
        </div>

        <Footer
          nodeNum={nodeNum}
          ruleNum={ruleNum}
          branchNum={branchNum}
          version={stores.version}
          date={stores.auditTime}
          ruleName={stores.ruleName}
        />
      </Spin>
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
