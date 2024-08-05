import ReactDOM from 'react-dom/client';
import { ModalFuncProps, ModalProps, Modal, FormProps } from 'antd';

import FormModal from './form-modal';
import { FormInstance } from 'antd/es/form/Form';

export type ConfigType = {
  form?: FormInstance;
  formProps?: FormProps;
} & ModalFuncProps &
  ModalProps;

export type FromModalConfigType = {
  close: (afterClose?: () => void) => void;
} & ConfigType;

export default function ConfirmFormModal(props: ConfigType) {
  const node = document.createDocumentFragment();
  const nodeRoot = ReactDOM.createRoot(node);
  const currentConfig = { ...props, close, open: true };

  function close() {
    render({
      ...currentConfig,
      open: false,
      afterClose() {
        nodeRoot.unmount();
      }
    });
  }

  function render(renderConfig: FromModalConfigType) {
    nodeRoot.render(<FormModal {...renderConfig} />);
  }
  render(currentConfig);
}
