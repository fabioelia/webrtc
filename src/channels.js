import { ConnectionManager } from './connectionManager';

/*
 * Export any channels that will remain open.
 */
export const communicationChannel = new ConnectionManager();
