import type { AgentMetadata } from '../types/agent';
export interface VersionCompatibility {
    compatible: boolean;
    reason?: string;
    suggestedVersion?: string;
}
export interface VersionUpdate {
    currentVersion: string;
    newVersion: string;
    updateType: 'major' | 'minor' | 'patch';
    breakingChanges: boolean;
}
export declare class VersionManager {
    /**
     * Check if two agent versions are compatible
     */
    static checkCompatibility(requiredVersion: string, providedVersion: string): VersionCompatibility;
    /**
     * Suggest version bump based on changes
     */
    static suggestVersionBump(currentVersion: string, changes: {
        breakingChanges?: boolean;
        newFeatures?: boolean;
        bugFixes?: boolean;
    }): VersionUpdate;
    /**
     * Check model compatibility
     */
    static checkModelCompatibility(agent: AgentMetadata, availableModel: string, availableContext: number): {
        compatible: boolean;
        issues: string[];
    };
    /**
     * Compare two agent versions
     */
    static compareVersions(v1: string, v2: string): -1 | 0 | 1;
    /**
     * Get version history from a list of agents
     */
    static getVersionHistory(agents: AgentMetadata[]): {
        name: string;
        versions: Array<{
            version: string;
            created?: string;
            author?: string;
        }>;
    }[];
    /**
     * Check if update is available
     */
    static hasUpdate(currentVersion: string, latestVersion: string): boolean;
    /**
     * Get semantic version parts
     */
    static parseVersion(version: string): {
        major: number;
        minor: number;
        patch: number;
        prerelease?: string;
        build?: string;
    } | null;
}
//# sourceMappingURL=version.d.ts.map