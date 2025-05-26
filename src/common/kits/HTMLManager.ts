import { parse, serialize } from "parse5";
import UtilsManager from "./UtilsManager";

export interface Parse5Node {
  nodeName: string;
  attrs?: Array<{
    name: string;
    value: string;
  }>;
  value?: string;
  parentNode?: Parse5Node | null;
  childNodes?: Parse5Node[];
}

/**
 * @description 处理HTML管理器
 */

class HTMLManager {
  static instance: HTMLManager | null = null;

  static getInstance(): HTMLManager {
    if (!this.instance) {
      this.instance = new HTMLManager();
    }
    return this.instance;
  }

  async queryHtmlInfo(url: string): Promise<string> {
    const html = await fetch(url).then((res) => res.text());
    return html;
  }

  cleansingHtml(params: { html: string }): {
    root: Parse5Node;
    rootHtml: string;
    main: Parse5Node | null;
    mainHtml: string;
    h1: Parse5Node | null;
    h1Text: string;
  } {
    const root = parse(params?.html);
    let main: Parse5Node | null = null;
    let h1: Parse5Node | null = null;

    const processNode = (node: Parse5Node) => {
      if (node.nodeName.toLowerCase() === "main") {
        main = node;
      }

      if (node.nodeName.toLowerCase() === "h1") {
        h1 = node;
      }

      if (node.childNodes) {
        // 修改过滤规则，保留更多必要的元素
        node.childNodes = node.childNodes.filter((child) => {
          const tagName = child?.nodeName?.toLowerCase();
          // 保留更多必要的元素
          return !["head", "meta", "script", "noscript", "style", "link", "svg"].includes(tagName);
        });

        // 处理当前节点的属性：移除style属性
        if (node.attrs) {
          node.attrs = node.attrs.filter((attr) => {
            const attrName = attr?.name?.toLowerCase();
            return !["style"].includes(attrName);
          });
        }

        // 递归处理子节点
        node.childNodes.forEach((child) => {
          processNode(child);
        });
      }
    };

    processNode(root);

    const rootHtml = UtilsManager.formatStr(serialize(root));
    const mainHtml = main ? UtilsManager.formatStr(serialize(main)) : "";
    const h1Text =
      // 获取h1标签下，里面的内容
      (h1 as unknown as Parse5Node)?.childNodes
        ?.find((child: Parse5Node) => {
          return child.nodeName.toLowerCase() === "#text";
        })
        ?.value?.trim() ||
      // 获取h1标签下，第一个span标签里面的内容
      (h1 as unknown as Parse5Node)?.childNodes
        ?.find((child: Parse5Node) => {
          return child.nodeName.toLowerCase() === "span";
        })
        ?.childNodes?.find((grandChild: Parse5Node) => {
          return grandChild.nodeName.toLowerCase() === "#text";
        })
        ?.value?.trim() ||
      "";

    // console.log("cleanHtml", h1);

    return { root, rootHtml, main, mainHtml, h1, h1Text };
  }

  findElementBySelector(root: Parse5Node, selector: string): boolean {
    try {
      // 使用 parse5 的内置功能查找元素
      const findElements = (node: Parse5Node, selector: string): Parse5Node[] => {
        let results: Parse5Node[] = [];

        // 检查当前节点
        if (node.attrs) {
          if (selector.startsWith("#")) {
            const id = selector.substring(1);
            const idAttr = node.attrs.find((attr) => attr.name === "id" && attr.value === id);
            if (idAttr) {
              results.push(node);
            }
          } else if (selector.startsWith(".")) {
            const className = selector.substring(1);
            const classAttr = node.attrs.find((attr) => attr.name === "class" && attr.value.includes(className));
            if (classAttr) {
              results.push(node);
            }
          } else if (selector.startsWith("[")) {
            const attrName = selector.substring(1, selector.indexOf("="));
            const attrValue = selector.substring(selector.indexOf("=") + 1, selector.lastIndexOf("]"));
            // 处理带引号的属性值
            const cleanAttrValue = attrValue.replace(/^['"]|['"]$/g, "");
            const attr = node.attrs.find((attr) => attr.name === attrName && attr.value === cleanAttrValue);
            if (attr) {
              results.push(node);
            }
          } else {
            const tagName = node.nodeName.toLowerCase();
            if (tagName === selector) {
              results.push(node);
            }
          }
        }

        // 递归检查子节点
        if (node.childNodes) {
          node.childNodes.forEach((child) => {
            results = results.concat(findElements(child, selector));
          });
        }

        return results;
      };

      const elements = findElements(root, selector);

      return elements.length > 0;
    } catch (error) {
      return false;
    }
  }
}

export default HTMLManager.getInstance();
