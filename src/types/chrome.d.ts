declare namespace chrome {
  namespace storage {
    interface StorageArea {
      get(keys?: string | string[] | null): Promise<Record<string, any>>;
      set(items: Record<string, any>): Promise<void>;
      remove(keys: string | string[]): Promise<void>;
      clear(): Promise<void>;
    }
    const sync: StorageArea;
  }

  namespace runtime {
    function sendMessage(message: any, responseCallback?: (response: any) => void): void;
    function getURL(path: string): string;
    const onInstalled: {
      addListener(callback: () => void): void;
    };
    const onMessage: {
      addListener(callback: (message: any, sender: any, sendResponse: (response?: any) => void) => void): void;
    };
  }

  namespace tabs {
    interface Tab {
      id: number;
      url?: string;
      title?: string;
      favIconUrl?: string;
      active?: boolean;
      pinned?: boolean;
      [key: string]: any;
    }

    function get(tabId: number, callback: (tab: Tab) => void): void;
    function query(queryInfo: Record<string, any>, callback: (tabs: Tab[]) => void): void;
    function create(createProperties: Record<string, any>, callback?: (tab: Tab) => void): void;
    function executeScript(tabId: number, details: Record<string, any>, callback?: (result: any[]) => void): void;
    const onUpdated: {
      addListener(callback: (tabId: number, changeInfo: Record<string, any>, tab: Tab) => void): void;
    };
    const onActivated: {
      addListener(callback: (activeInfo: { tabId: number; windowId: number }) => void): void;
    };
    const onRemoved: {
      addListener(callback: (tabId: number, removeInfo: { windowId: number; isWindowClosing: boolean }) => void): void;
    };
  }

  namespace action {
    function disable(): void;
  }

  namespace sidePanel {
    function setPanelBehavior(options: { openPanelOnActionClick: boolean }): Promise<void>;
  }

  namespace commands {
    const onCommand: {
      addListener(callback: (command: string) => void): void;
    };
  }

  namespace declarativeContent {
    class PageStateMatcher {
      constructor(options: {
        pageUrl?: {
          hostPrefix?: string;
          hostSuffix?: string;
          hostEquals?: string;
          schemes?: string[];
        };
      });
    }
    class ShowAction {
      constructor();
    }
    const onPageChanged: {
      removeRules(ruleIdentifiers: string[] | undefined, callback: () => void): void;
      addRules(
        rules: Array<{
          conditions: PageStateMatcher[];
          actions: ShowAction[];
        }>
      ): void;
    };
  }
}
