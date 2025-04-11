
// Re-export all functions from their respective services
// This maintains backward compatibility with existing imports

// Novel project services
export {
  saveNovelProject,
  loadNovelProject,
  createNewProject,
  addChapter,
  updateChapter,
  deleteChapter,
  renameChapter
} from './novelProjectService';

// Export services
export {
  exportProject,
  downloadAsFile
} from './exportService';

// User services
export {
  getAllUsers,
  createUser,
  authenticateUser,
  deleteUser,
  initUserDatabase
} from './userService';
// Re-export the User type using 'export type'
export type { User } from './userService';

// Admin services
export {
  getAdminSettings,
  updateAdminSettings
} from './adminService';
// Re-export the AdminSettings type using 'export type'
export type { AdminSettings } from './adminService';
