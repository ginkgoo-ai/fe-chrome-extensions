import { Task, TaskCallback } from "@/common/types/task.d";

/**
 * @description 耗时任务管理器
 */
class TaskManager {
  static instance: TaskManager | null = null;
  store!: Map<string, any>;

  static getInstance(): TaskManager {
    if (!this.instance) {
      this.instance = new TaskManager();
      this.instance.store = new Map();
    }
    return this.instance;
  }

  async performTasks(params: {
    deadline: IdleDeadline;
    tasks: Task[];
    results: any[];
    resolve: (value: any[] | PromiseLike<any[]>) => void;
    taskCallback?: TaskCallback;
  }): Promise<void> {
    const { deadline, tasks, results, resolve, taskCallback } = params || {};

    for (let i = 0; deadline.timeRemaining() > 0 && tasks.length > 0; i++) {
      const index = tasks[0].index + i;
      const task = tasks.shift(); // 从任务数组中取出一个任务
      const result = await task?.performTask(task.params); // 执行任务
      taskCallback?.({
        code: "TASK_COMPLETE",
        index,
        res: result,
      });
      results.push(result); // 将结果添加到结果数组中
    }

    if (tasks.length > 0) {
      // 如果还有未执行的任务，继续请求下一个空闲时段执行
      requestIdleCallback(async (newDeadline) => {
        await this.performTasks({ deadline: newDeadline, tasks, results, resolve, taskCallback });
      });
    } else {
      // 所有任务执行完成
      // console.log("result", results);
      resolve(results);
    }
  }

  async startTask(list: Task[] = [], taskCallback?: TaskCallback): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const tasks = list.map((item, index) => {
        return {
          ...item,
          index,
        };
      });
      const results: any[] = [];
      requestIdleCallback(async (deadline) => {
        await this.performTasks({ deadline, tasks, results, resolve, taskCallback });
      });
    });
  }
}

export default TaskManager.getInstance();
