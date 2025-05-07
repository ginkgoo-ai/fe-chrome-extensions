import { App, Button, Input, Modal } from "antd";
import "./index.less";

export default function MKMainModal(props: { onClose: () => void }) {
  const { onClose } = props || {};

  const { message } = App.useApp();

  return (
    <Modal
      className="m-k-main-modal-wrap"
      open={true}
      title={"CRX Modal"}
      footer={null}
      maskClosable={false}
      onCancel={() => {
        message.info("Close Modal");
        onClose && onClose();
      }}
      width={600}
    >
      <div>hello main modal</div>
      <Input />
      <Button>hello</Button>
    </Modal>
  );
}
