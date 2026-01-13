// components/PDFExport/PDFExportButton.tsx - PDF export button with options (Ant Design)

import { useState, useCallback } from 'react';
import { Button, Dropdown, message } from 'antd';
import { FilePdfOutlined, LoadingOutlined, DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { exportRecipePDF } from '../../services/api';

interface PDFExportButtonProps {
  recipeId: string;
  recipeName: string;
  hasImage: boolean;
}

export function PDFExportButton({ recipeId, recipeName, hasImage }: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async (includeImage: boolean) => {
    setIsExporting(true);

    try {
      const response = await exportRecipePDF(recipeId, { includeImage });

      // Decode base64 and trigger download
      const binaryString = atob(response.pdfBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = response.fileName || `${recipeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      message.success('PDF 导出成功');
    } catch (error) {
      console.error('PDF export failed:', error);
      message.error('导出 PDF 失败，请稍后重试');
    } finally {
      setIsExporting(false);
    }
  }, [recipeId, recipeName]);

  const handleClick = useCallback(() => {
    // Always export with image if available
    handleExport(hasImage);
  }, [hasImage, handleExport]);

  // Dropdown menu for when image is not available
  const menuItems: MenuProps['items'] = [
    {
      key: 'with-image',
      label: '导出含图版本',
      disabled: !hasImage,
      onClick: () => handleExport(true),
    },
    {
      key: 'without-image',
      label: '导出无图版本',
      onClick: () => handleExport(false),
    },
  ];

  // If image is not available, show dropdown
  if (!hasImage) {
    return (
      <Dropdown menu={{ items: menuItems }} trigger={['click']} disabled={isExporting}>
        <Button
          type="primary"
          icon={isExporting ? <LoadingOutlined /> : <FilePdfOutlined />}
          loading={isExporting}
        >
          {isExporting ? '导出中...' : '导出 PDF'} <DownOutlined />
        </Button>
      </Dropdown>
    );
  }

  return (
    <Button
      type="primary"
      icon={isExporting ? <LoadingOutlined /> : <FilePdfOutlined />}
      onClick={handleClick}
      loading={isExporting}
    >
      {isExporting ? '导出中...' : '导出 PDF'}
    </Button>
  );
}

export default PDFExportButton;
