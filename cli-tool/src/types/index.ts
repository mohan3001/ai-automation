export interface CommandOptions {
  path?: string;
  model?: string;
  context?: string;
  output?: string;
  approval?: boolean;
  test?: string;
  project?: string;
  headed?: boolean;
  debug?: boolean;
  num?: string;
}

export interface AIServiceResponse {
  success?: boolean;
  error?: string;
  status?: string;
  llm_status?: {
    status: string;
    message?: string;
  };
  indexing_status?: {
    files_processed?: number;
    error?: string;
  };
  overall_status?: string;
  code?: string;
  file_path?: string;
  results?: any[];
} 