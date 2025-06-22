import { Tag } from 'antd';
import { memo } from 'react';

interface TagStatusProps {
  colorBackground?: string;
  colorText?: string;
  text?: string;
  children?: React.ReactNode;
}

function PureTagStatus(props: TagStatusProps) {
  const { colorBackground, colorText, text, children } = props;

  return (
    <Tag
      color={colorBackground}
      bordered={false}
      style={{
        borderRadius: '6px',
        padding: '6px 11.5px',
        fontSize: '12px',
        fontWeight: 700,
      }}
    >
      {children ? <>{children}</> : <span style={{ color: colorText }}>{text}</span>}
    </Tag>
  );
}

export const TagStatus = memo(PureTagStatus);
