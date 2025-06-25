"use client";

import { Button } from "antd";
import { Form, Input, Modal, message as messageAntd } from "antd";
import { memo, useEffect, useState } from "react";
import { IconFormItemLink } from "@/common/components/ui/icon";
import { useEventManager } from "@/common/hooks/useEventManager";

interface ModalNewWorkflowProps {
  isOpen: boolean;
  onOpenUpdate: (value: boolean) => void;
  onFinish: (values: Record<string, string>) => void;
}

function PureModalNewWorkflow(props: ModalNewWorkflowProps) {
  const { isOpen = false, onOpenUpdate, onFinish } = props;

  const [loadingContinue, setLoadingContinue] = useState<boolean>(false);

  useEventManager("ginkgoo-message", (message) => {
    const { type: typeMsg } = message;

    switch (typeMsg) {
      case "ginkgoo-background-all-pilot-no-match-page": {
        const { typeToast, contentToast } = message || {};
        messageAntd.open({
          type: typeToast,
          content: contentToast,
        });
        setLoadingContinue(false);

        break;
      }
      default: {
        break;
      }
    }
  });

  useEffect(() => {
    if (isOpen) {
      setLoadingContinue(false);
    }
  }, [isOpen]);

  const handleNewWorkflowCancel = () => {
    onOpenUpdate?.(false);
  };

  const handleFormFinish = (values: any) => {
    setLoadingContinue(true);
    onFinish?.(values);
  };

  return (
    <Modal
      title={<div className="box-border pb-6 text-xl font-bold">URL</div>}
      closable={false}
      width={700}
      footer={null}
      open={isOpen}
      keyboard={false}
      destroyOnHidden={true}
      // onOk={handleCreateCaseOk}
      onCancel={handleNewWorkflowCancel}
    >
      <Form
        name="new-workflow"
        layout="vertical"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        initialValues={{}}
        requiredMark={false}
        onFinish={handleFormFinish}
        autoComplete="off"
      >
        <div className="mb-4 text-sm text-[#1A1A1AB2]">
          Enter the URL below. Please keep the target page open for the auto-fill to work.
        </div>

        <Form.Item
          label="URL"
          name="url"
          validateTrigger="onSubmit"
          validateFirst={true}
          rules={[
            { required: true, message: "Please input URL" },
            { type: "url", message: "Please input a valid URL" },
            // {
            //   validator: (_, value) => {
            //     if (!value) return Promise.resolve();
            //     try {
            //       // 使用URL构造函数校验
            //       new URL(value);
            //       return Promise.resolve();
            //     } catch (e) {
            //       return Promise.reject(new Error("Please enter a valid URL"));
            //     }
            //   },
            // },
          ]}
        >
          <Input className="!px-3" autoFocus prefix={<IconFormItemLink className="mr-1" size={20} />} placeholder="URL" />
        </Form.Item>

        <div className="mt-2 flex flex-row items-center justify-between gap-6">
          <Button type="default" className="h-[44px] flex-1" onClick={handleNewWorkflowCancel}>
            <span className="font-bold">Cancel</span>
          </Button>
          <Button type="primary" className="h-[44px] flex-1" loading={loadingContinue} htmlType="submit">
            <span className="font-bold">Continue</span>
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

export const ModalNewWorkflow = memo(PureModalNewWorkflow);
