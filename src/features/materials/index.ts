export { MaterialsWorkspace } from './MaterialsWorkspace';
export { DraftGraphEditor } from './DraftGraphEditor';
export { materials } from './materials-api';
export type { Draft, Job, JobSummary, DraftGraph } from './materials-api';

// Real Ingestion Pipeline Data Layer (Phase 1+)
export * from './schemas/ingestion.schema';
export * from './services/ingestion.service';
export * from './hooks/useIngestionJobs';

// Unified AI Materials Processing & Draft Review Hub (Phase 2)
export { MaterialsHubPageView } from './components/hub/MaterialsHubPageView';
export { PipelineStepper } from './components/hub/PipelineStepper';
export { DraftEntitiesChecklist } from './components/hub/DraftEntitiesChecklist';
export { DirectUploadModal } from './components/hub/DirectUploadModal';
export { JobDetailReviewPanel } from './components/hub/JobDetailReviewPanel';

// Legacy Background Tasks UI exports (kept for backwards compatibility)
export { BackgroundTasksPageView } from './components/tasks/BackgroundTasksPageView';
export { TaskTerminalLogModal } from './components/tasks/TaskTerminalLogModal';
export { PipelineSettingsCard } from './components/tasks/PipelineSettingsCard';
export { useMaterialsTasks, materialTasksKeys } from './hooks/useMaterialsTasks';
export * from './schemas/materials-tasks.schema';
export * from './services/materials-tasks.service';
