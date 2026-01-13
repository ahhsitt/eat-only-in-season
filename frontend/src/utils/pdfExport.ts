// utils/pdfExport.ts - PDF 导出工具函数
// 006-ux-fixes-optimization: 前端 HTML 转 PDF 方案 (html2canvas + jsPDF)

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * PDF 导出选项
 */
export interface PDFExportOptions {
  /** 渲染缩放比例，默认 2（高清） */
  scale?: number;
  /** 背景色，默认 '#FFFFFF' */
  backgroundColor?: string;
  /** PDF 纸张格式，默认 'a4' */
  format?: 'a4' | 'letter';
  /** 纸张方向，默认 'portrait' */
  orientation?: 'portrait' | 'landscape';
}

/**
 * 等待图片加载并转换为 base64（确保 html2canvas 能正确渲染）
 */
async function prepareImagesForExport(element: HTMLElement): Promise<Map<string, string>> {
  const images = element.querySelectorAll('img');
  const urlToBase64 = new Map<string, string>();

  await Promise.all(
    Array.from(images).map(async (img) => {
      // 等待图片加载
      if (!img.complete) {
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      }

      const src = img.src;
      if (!src || src.startsWith('data:')) return;

      // 使用 canvas 转换为 base64
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          urlToBase64.set(src, canvas.toDataURL('image/png'));
        }
      } catch {
        // 忽略转换失败的图片
      }
    })
  );

  return urlToBase64;
}

/**
 * 临时禁用 CSS 动画
 */
function disableAnimations(): HTMLStyleElement {
  const style = document.createElement('style');
  style.id = 'pdf-export-disable-animations';
  style.textContent = `
    *, *::before, *::after {
      animation: none !important;
      transition: none !important;
    }
  `;
  document.head.appendChild(style);
  return style;
}

/**
 * 将 DOM 元素导出为 PDF
 */
export async function exportElementToPDF(
  element: HTMLElement,
  filename: string,
  options?: PDFExportOptions
): Promise<void> {
  const {
    scale = 2,
    backgroundColor = '#FFFFFF',
    format = 'a4',
    orientation = 'portrait',
  } = options || {};

  // 准备图片（转换为 base64）
  const imageBase64Map = await prepareImagesForExport(element);

  // 禁用动画
  const animationStyle = disableAnimations();

  // 保存原始样式和滚动位置
  const originalStyle = element.style.cssText;
  const originalScrollTop = window.scrollY;

  element.style.overflow = 'visible';
  element.style.position = 'relative';
  window.scrollTo(0, 0);

  await new Promise((resolve) => setTimeout(resolve, 100));

  try {
    const canvas = await html2canvas(element, {
      scale,
      logging: false,
      backgroundColor,
      useCORS: true,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: element.scrollHeight,
      ignoreElements: (el) => {
        if (el.getAttribute('data-html2canvas-ignore') === 'true') return true;
        if (el.classList.contains('ant-spin') || el.classList.contains('loading')) return true;
        return false;
      },
      onclone: (clonedDoc) => {
        // 替换图片为 base64
        clonedDoc.querySelectorAll('img').forEach((img) => {
          const base64 = imageBase64Map.get(img.src);
          if (base64) img.src = base64;
        });

        // 确保动画元素可见
        clonedDoc.querySelectorAll('[class*="animate-"], [class*="stagger-"]').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.opacity = '1';
          htmlEl.style.transform = 'none';
        });
      },
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF(orientation === 'portrait' ? 'p' : 'l', 'mm', format);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight();

    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
  } finally {
    element.style.cssText = originalStyle;
    window.scrollTo(0, originalScrollTop);
    animationStyle.remove();
  }
}

export default exportElementToPDF;
