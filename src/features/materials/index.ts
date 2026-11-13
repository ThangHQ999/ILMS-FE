export { MaterialsWorkspace } from './MaterialsWorkspace';
export { DraftGraphEditor } from './DraftGraphEditor';
export { materials } from './materials-api';
export type { Draft, Job, JobSummary, DraftGraph } from './materials-api';

// Background tasks exports
export { BackgroundTasksPageView } from './components/tasks/BackgroundTasksPageView';
export { TaskTerminalLogModal } from './components/tasks/TaskTerminalLogModal';
export { PipelineSettingsCard } from './components/tasks/PipelineSettingsCard';
export { useMaterialsTasks, materialTasksKeys } from './hooks/useMaterialsTasks';
export * from './schemas/materials-tasks.schema';
export * from './services/materials-tasks.service';

