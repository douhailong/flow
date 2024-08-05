import React from 'react';
import { Modal, ModalFuncProps } from 'antd';
import { ExclamationCircleFilled, CheckCircleOutlined } from '@ant-design/icons';

const ConfirmModal = (props: ModalFuncProps) => {
  function renderIcon(type: ModalFuncProps['type']) {
    switch (type) {
      case 'error':
        return <ExclamationCircleFilled style={{ color: '#FA5151' }} />;

      case 'success':
        return <CheckCircleOutlined style={{ color: '#15AD31' }} />;

      default:
        return undefined;
    }
  }
  Modal.confirm({
    className: 'confirm-modal-container',
    width: 520 || props.width,
    icon: renderIcon(props.type),
    cancelText: false,
    maskClosable: false,
    ...props
  });
};

export default ConfirmModal;
