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
  RootNode
} from './utils';
import type { OnFinishProps } from './components/sider-bar';
import ConfirmModal from '@components/confirm-modal/confirm-modal';

import {
  saveRuleDraft,
  auditRuleDraft,
  getRuleData,
  judgeHasDraft,
  judgeHasPermission,
  isCanOperation,
  renewal
} from '@services';
import { useMutation, useQuery } from 'react-query';

import No from '@assets/no.png';
import Yes from '@assets/yes.png';

function App() {
  const [copyNode, setCopyNode] = useState<FlowViewNode[]>([]);
  const [edges, setEdges] = useState<FlowViewEdge[]>([]);
  const [nodes, setNodes] = useState<FlowViewNode[]>(RootNode(''));
  const [selectedId, setSelectedId] = useState<string>('');
  const [changedIds, setChangedIds] = useState<string[]>([]);
  const [changedIds2, setChangedIds2] = useState<string[]>([]);
  const [show, setShow] = useState(true);
  const [stores, setStores] = useState({
    version: '',
    ruleType: '',
    ruleName: '',
    auditTime: '',
    hasDraft: '',
    mode: '',
    nodeId: '',
    ruleId: ''
  });

  useEffect(() => {
    window.parent.postMessage({ source: 'flow', data: { loadingCompleted: true } }, '*');

    window.addEventListener('message', function (e) {
      const data = e.data;
      if (data.source === 'parentWindow') {
        const {
          ruleVersion,
          ruleType,
          ruleName,
          auditTime,
          hasDraft,
          mode,
          nodeId = undefined,
          ruleId
        } = data.data;

        setStores({
          version: ruleVersion,
          ruleType,
          ruleName,
          auditTime,
          hasDraft,
          mode,
          nodeId,
          ruleId
        });
      }
      // () => this.window.removeEventListener('message', );
    });

    // setStores({
    //   auditTime: '2024-08-18 16:30:57',
    //   hasDraft: '3',
    //   mode: 'mutable', //mutable
    //   ruleId: 'db68bf3c4675445ca62fa152288d9f98',
    //   ruleName: '妊娠禁忌',
    //   ruleType: '1',
    //   version: 'V1.5',
    //   nodeId: 'root&1&1&2'
    // });
  }, []);

  useEffect(() => {
    setShow(false);
    setTimeout(() => setShow(true), 10);
    if (stores.nodeId && stores.mode === 'check') onLookRunningRule(stores.nodeId);
  }, [edges, nodes]);

  useEffect(() => {
    const nds = nodes.map((node) =>
      changedIds2.includes(node.id) ? { ...node, select: SelectType.SUB_DANGER } : node
    );
    setNodes(nds);
  }, [changedIds2]);

  useEffect(() => {
    const nds = nodes.map((node) =>
      node.id === selectedId
        ? { ...node, select: SelectType.SELECT }
        : {
            ...node,
            select:
              node.select === SelectType.SELECT
                ? changedIds2.includes(node.id)
                  ? SelectType.SUB_DANGER
                  : SelectType.DEFAULT
                : node.id === selectedId
                  ? SelectType.SELECT
                  : node.select
          }
    );
    setNodes(nds);
    stores.ruleId &&
      renewal(stores.ruleId).catch((err) => {
        message.error(err?.data?.errorMsg);
      });
  }, [selectedId]);

  useEffect(() => {
    selectNodes(
      nodes.map((node) => node.id),
      SelectType.DEFAULT
    );
    setTimeout(() => selectNodes(changedIds, SelectType.DANGER), 100);
  }, [changedIds]);

  const { selectNode, selectNodes } = useFlowViewer();

  const judgeHasDraftMutation = useMutation(judgeHasDraft, {
    onSuccess(res) {
      setStores({ ...stores, mode: 'mutable', ruleType: '3' });
      getRuleDataMutation.mutate({
        ruleId: stores.ruleId,
        ruleVersion: stores.version,
        ruleType: stores.ruleType
      });
    }
  });

  const getRuleDataMutation = useMutation(getRuleData, {
    onSuccess(res) {
      const data = res.data.data;
      setNodes([{ ...nodes[0], data: { ...nodes[0].data, title: data.ruleName } }]);
      if (data?.ruleDataJson && data?.ruleRelateJson) {
        setEdges(JSON.parse(data.ruleRelateJson));
        setNodes(JSON.parse(data.ruleDataJson));
      }
    },
    onError() {
      message.error('操作失败，请重试');
    }
  });

  useEffect(() => {
    if (stores.ruleId) {
      getRuleDataMutation.mutate({
        ruleId: stores.ruleId,
        ruleVersion: stores.version,
        ruleType: stores.ruleType
      });
    }
  }, [stores]);

  const auditRuleMutation = useMutation(auditRuleDraft, {
    onSuccess({ data }) {
      message.success('审核成功');
      const { ruleType, version } = data.data;
      setStores({
        ...stores,
        ruleType,
        version: version?.[0] === 'V' ? version : stores.version,
        ruleName: nodes.filter((item: FlowViewNode) => item.id === 'root')?.[0].data.title
      });
      setChangedIds2([]);
      window.parent.postMessage({ source: 'flow', data: { success: true } }, '*');
    },
    onError({ data }) {
      message.error(data.errorMsg);
    }
  });

  const saveRuleMutation = useMutation(saveRuleDraft, {
    onSuccess({ data }) {
      const { ruleType, version } = data.data;
      message.success('保存成功');
      setStores({
        ...stores,
        ruleType,
        version: version?.[0] === 'V' ? version : stores.version,
        ruleName: nodes.filter((item: FlowViewNode) => item.id === 'root')?.[0].data.title
      });
      setChangedIds2([]);
      window.parent.postMessage({ source: 'flow', data: { success: true } }, '*');
    },
    onError({ data }) {
      message.error(data.errorMsg);
    }
  });

  const nodeNum = nodes.length;
  const ruleName = nodes[0].data.title;
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

    setChangedIds2([...new Set([...changedIds2, `${selectedId}&${preNum + 1}`])]);
    setSelectedId(`${selectedId}&${preNum + 1}`);

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
    const nds = nodes.filter(({ id }) => id.includes(selectedId));
    setCopyNode(nds);
    message.success('复制成功');
  };

  const onSwitchToMutable = () => {
    judgeHasPermission(stores.ruleId).then(
      () => {
        switchs();
      },
      ({ data }) => {
        message.error(data.errorMsg);
      }
    );

    function switchs() {
      if (stores.hasDraft === 'true') {
        ConfirmModal({
          title: '编辑提示',
          content: '已有规则草稿，是否前往编辑？',
          onOk: () => {
            setStores({ ...stores, mode: 'mutable', ruleType: '3' });
            setTimeout(
              () =>
                getRuleDataMutation.mutate({
                  ruleId: stores.ruleId,
                  ruleVersion: stores.version,
                  ruleType: stores.ruleType
                }),
              10
            );
          }
        });
      } else {
        judgeHasDraftMutation.mutate(stores.ruleId);
      }
    }
  };

  // TODO
  const onPaste = () => {
    if (!copyNode.length) return message.error('请先复制节点');
    const pasteType = copyNode[0]?.data.type;
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
          (warn ? true : curNode.data.isWarnUse !== 'F')
        )
          result.push(curNode.id);
      }
    }
    setChangedIds(result);
  };

  const onSubmit = async (type: SubmitType) => {
    const { data } = await getRuleData({
      ruleId: stores.ruleId,
      ruleVersion: stores.version,
      ruleType: type === 'sava' ? '3' : '1'
    });
    const ruleData = data?.data?.ruleDataJson;

    const jsonNodes = JSON.stringify(nodes);
    // 接口返回的JSON数据格式和JSON.stringify的不一样
    const jsonData = JSON.stringify(JSON.parse(ruleData ?? '{}'));

    if (jsonData === jsonNodes) {
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

    isCanOperation(stores.ruleId).then(
      () => {
        submit();
      },
      ({ data }) => {
        message.error(data.errorMsg);
      }
    );

    function submit() {
      const nds = nodes.filter((node) => node.data.title === '请设置内容');
      if (nds.length)
        return ConfirmModal({
          title: '提示',
          content: '操作失败，请填写完整节点数据',
          cancelButtonProps: { style: { display: 'none' } }
        });

      const payload = {
        ruleId: stores.ruleId,
        ruleNum,
        ruleName: ruleName,
        ruleBranchNum: branchNum,
        ruleNodeNum: nodeNum,
        ruleRelate: edges,
        ruleData: nodes.map((node) => ({
          ...node,
          select: type === 'audit' ? undefined : node.select,
          data: {
            ...node.data,
            nodeName: node.data.title,
            nodeType: nodeTypeMapping[node.data.type as NodeType]
          }
        }))
      };

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
    }
  };

  const onFinish = ({ step, values, title }: OnFinishProps) => {
    let nds: FlowViewNode[] = [];
    if (step === 1) {
      nds = nodes.map((node) => {
        return node.id === selectedId ? { ...node, data: { ...node.data, title } } : node;
      });
    }

    if (step === 2) {
      function specialJsonData() {
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
      nds = nodes.map((node) => {
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
                specialJsonData: specialJsonData(),
                medNameFilterType: values.medNameFilterType
              }
            }
          : node;
      });
    }

    if (step === 3) {
      nds = nodes.map((node) => {
        return node.id === selectedId
          ? {
              ...node,
              data: {
                ...node.data,
                title,
                logo: values.sourceResult ? (values.sourceResult === 'T' ? Yes : No) : undefined,
                sourceResult: values.sourceResult,
                isWarnUse: values.isWarnUse,
                ...values,
                warnContent: values,
                warnInfo: values.warnContent,
                warnLevel: values.warnLevel,
                titleSlot: {
                  type: 'right',
                  value: values.isWarnUse === 'F' ? '✘' : '✔'
                }
              },
              style: {
                background:
                  // @ts-ignore
                  values.isWarnUse === 'F' ? levelColors.disabled : levelColors[values.color]
              }
            }
          : node;
      });
    }

    const disTipIds = nds
      .filter((node) => node.data.type === 'tip' && node.data.isWarnUse === 'F')
      .map((node) => node.id);

    let result: string[] = [...disTipIds];
    function getDisabled(diseds: string[]) {
      if (!diseds.length) return;
      for (let i = 0; i < edges.length; i++) {
        const curEdg = edges[i];
        if (diseds.includes(curEdg.target)) {
          const preId = edges.find((edge) => edge.target === curEdg.target)?.source;
          if (preId) {
            const es = edges.filter((edge) => edge.source === preId);
            const validEs = es.filter((edge) => result.includes(edge.target));
            if (es.length === validEs.length) {
              result.push(preId);
              getDisabled([preId]);
            }
          }
        }
      }
    }
    getDisabled(disTipIds);
    const nds1 = nds.map((node) => {
      const type = node.data.type as NodeType;
      return result.includes(node.id)
        ? { ...node, style: { background: '#f0f0f0' } }
        : {
            ...node,
            style: {
              background:
                type === 'tip'
                  ? node.data.isWarnUse === 'F'
                    ? levelColors.disabled
                    : // @ts-ignore
                      levelColors[node.data.color]
                  : nodeColors[type]
            }
          };
    });

    setChangedIds2([...new Set([...changedIds2, selectedId])]);
    setNodes(nds1);
    result = [];
  };

  return (
    <div className='h-full'>
      <Spin tip='加载中...' spinning={getRuleDataMutation.isLoading}>
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
                  stores.mode === 'mutable' && setSelectedId(node.id);
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
