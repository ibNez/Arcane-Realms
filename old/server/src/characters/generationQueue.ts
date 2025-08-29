export type GenerationParams = Record<string, any>;

type Job<T> = {
  params: GenerationParams;
  generate: (params: GenerationParams) => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
};

const maxConcurrent = 3;
const activeJobs = new Set<Promise<any>>();
const pendingQueue: Job<any>[] = [];

function processNext() {
  if (pendingQueue.length === 0) return;
  if (activeJobs.size >= maxConcurrent) return;
  const job = pendingQueue.shift()!;
  run(job);
}

function run<T>(job: Job<T>) {
  const p = job.generate(job.params);
  activeJobs.add(p);
  p.then(job.resolve, job.reject).finally(() => {
    activeJobs.delete(p);
    processNext();
  });
}

export function requestGeneration<T>(params: GenerationParams, generate: (params: GenerationParams) => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const job: Job<T> = { params, generate, resolve, reject };
    if (activeJobs.size >= maxConcurrent) {
      pendingQueue.push(job);
    } else {
      run(job);
    }
  });
}
