import React, { memo, useState } from 'react';
import { ModalProps, ModalFuncProps, Form, FormProps, Modal } from 'antd';

import { FromModalConfigType } from '../index';

import { adapteObject, removeBothEndsSpace } from '../../../utils';

const FormModal = (props: FromModalConfigType) => {
  const { content, close, formProps, onCancel, okButtonProps, onOk, form, ...restProps } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [defaultForm] = Form.useForm();
  return (
    <Modal
      wrapClassName='app-confirm-form-modal'
      onCancel={() => {
        onCancel?.();
        close();
      }}
      onOk={async () => {
        const values = await (form || defaultForm).validateFields();
        const formatValues = adapteObject(values, removeBothEndsSpace);

        if (onOk) {
          const okReturn = onOk(formatValues);
          okReturn
            ? (setIsLoading(true),
              okReturn
                .then((res: any) => {
                  res === undefined ? close(() => setIsLoading(false)) : setIsLoading(false);
                })
                .catch((err: any) => setIsLoading(false)))
            : close();
        }
      }}
      okButtonProps={{
        ...okButtonProps,
        loading: okButtonProps?.loading || isLoading
      }}
      destroyOnClose
      {...restProps}
    >
      <Form
        form={form || defaultForm}
        preserve={false}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 14 }}
        {...formProps}
      >
        {content}
      </Form>
    </Modal>
  );
};

export default memo(FormModal);
