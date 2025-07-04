"use client";

import { Alert, Button } from "antd";
import { Form, Input, Modal, message as messageAntd } from "antd";
import { memo, useEffect, useState } from "react";
import { IconFormItemLink, IconInfo } from "@/common/components/ui/icon";
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
      case "ginkgoo-background-all-pilot-start-failed": {
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
      title={<div className="box-border pb-6 text-xl font-bold">Start auto-fill</div>}
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
          We've noticed some of your information is missing. To proceed now, we will temporarily fill these gaps with dummy data.
        </div>

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
