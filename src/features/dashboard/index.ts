// Public API for features/dashboard per ARCHITECTURE.md §4.3

export { DashboardPageView } from './components/DashboardPageView';
export { DashboardHeader } from './components/DashboardHeader';
export { DashboardSidebar } from './components/DashboardSidebar';
export { NotificationDropdown } from './components/NotificationDropdown';
export { AnalyticsView } from './components/AnalyticsView/AnalyticsView';
export { FocusView } from './components/FocusView/FocusView';
export { SocraticAICoach } from './components/FocusView/SocraticAICoach';

export * from './types';
export * from './constants';
export * from './hooks/useDashboardMode';
export * from './hooks/useDashboardData';
export * from './hooks/useNotifications';
export * from './hooks/useSocraticChat';
