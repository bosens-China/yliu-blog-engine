/*
 * dify 响应结构
 */

export interface DifyRoot<T extends object> {
  task_id: string;
  workflow_run_id: string;
  data: Data<T>;
}

export interface Data<T extends object> {
  id: string;
  workflow_id: string;
  status: string;
  outputs: Outputs<T>;
  error: string;
  elapsed_time: number;
  total_tokens: number;
  total_steps: number;
  created_at: number;
  finished_at: number;
}

export interface Outputs<T extends object> {
  result: T;
}
