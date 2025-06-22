import semver from 'semver';
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

export class VersionManager {
  /**
   * Check if two agent versions are compatible
   */
  static checkCompatibility(
    requiredVersion: string,
    providedVersion: string
  ): VersionCompatibility {
    try {
      // Clean versions
      const cleanRequired = semver.clean(requiredVersion);
      const cleanProvided = semver.clean(providedVersion);

      if (!cleanRequired || !cleanProvided) {
        return {
          compatible: false,
          reason: 'Invalid version format'
        };
      }

      // Check if provided version satisfies required version range
      if (semver.satisfies(cleanProvided, requiredVersion)) {
        return { compatible: true };
      }

      // Check if it's a major version mismatch
      const requiredMajor = semver.major(cleanRequired);
      const providedMajor = semver.major(cleanProvided);

      if (requiredMajor !== providedMajor) {
        return {
          compatible: false,
          reason: `Major version mismatch: required v${requiredMajor}, provided v${providedMajor}`,
          suggestedVersion: `${requiredMajor}.x.x`
        };
      }

      // Minor version compatibility check
      if (semver.lt(cleanProvided, cleanRequired)) {
        return {
          compatible: false,
          reason: `Version too old: required ${requiredVersion}, provided ${providedVersion}`,
          suggestedVersion: requiredVersion
        };
      }

      return { compatible: true };
    } catch (error) {
      return {
        compatible: false,
        reason: 'Error checking version compatibility'
      };
    }
  }

  /**
   * Suggest version bump based on changes
   */
  static suggestVersionBump(
    currentVersion: string,
    changes: {
      breakingChanges?: boolean;
      newFeatures?: boolean;
      bugFixes?: boolean;
    }
  ): VersionUpdate {
    const current = semver.clean(currentVersion);
    if (!current) {
      throw new Error('Invalid current version');
    }

    let updateType: 'major' | 'minor' | 'patch';
    let newVersion: string;

    if (changes.breakingChanges) {
      updateType = 'major';
      newVersion = semver.inc(current, 'major')!;
    } else if (changes.newFeatures) {
      updateType = 'minor';
      newVersion = semver.inc(current, 'minor')!;
    } else {
      updateType = 'patch';
      newVersion = semver.inc(current, 'patch')!;
    }

    return {
      currentVersion: current,
      newVersion,
      updateType,
      breakingChanges: changes.breakingChanges || false
    };
  }

  /**
   * Check model compatibility
   */
  static checkModelCompatibility(
    agent: AgentMetadata,
    availableModel: string,
    availableContext: number
  ): {
    compatible: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check preferred models
    if (agent.model_requirements?.preferred_models) {
      const isPreferred = agent.model_requirements.preferred_models.some(
        model => availableModel.toLowerCase().includes(model.toLowerCase())
      );
      
      if (!isPreferred) {
        issues.push(
          `Model ${availableModel} is not in preferred models: ${agent.model_requirements.preferred_models.join(', ')}`
        );
      }
    }

    // Check context requirements
    if (agent.model_requirements?.min_context) {
      if (availableContext < agent.model_requirements.min_context) {
        issues.push(
          `Insufficient context: requires ${agent.model_requirements.min_context}, available ${availableContext}`
        );
      }
    }

    return {
      compatible: issues.length === 0,
      issues
    };
  }

  /**
   * Compare two agent versions
   */
  static compareVersions(v1: string, v2: string): -1 | 0 | 1 {
    const clean1 = semver.clean(v1);
    const clean2 = semver.clean(v2);

    if (!clean1 || !clean2) {
      throw new Error('Invalid version format');
    }

    return semver.compare(clean1, clean2);
  }

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
  }[] {
    const grouped = new Map<string, AgentMetadata[]>();

    // Group by name
    for (const agent of agents) {
      const existing = grouped.get(agent.name) || [];
      existing.push(agent);
      grouped.set(agent.name, existing);
    }

    // Create version history
    const history: any[] = [];

    for (const [name, versions] of grouped.entries()) {
      const sortedVersions = versions
        .filter(a => a.version)
        .sort((a, b) => {
          try {
            return this.compareVersions(b.version!, a.version!);
          } catch {
            return 0;
          }
        });

      history.push({
        name,
        versions: sortedVersions.map(agent => ({
          version: agent.version!,
          created: agent.created,
          author: agent.author
        }))
      });
    }

    return history;
  }

  /**
   * Check if update is available
   */
  static hasUpdate(currentVersion: string, latestVersion: string): boolean {
    try {
      const current = semver.clean(currentVersion);
      const latest = semver.clean(latestVersion);

      if (!current || !latest) {
        return false;
      }

      return semver.lt(current, latest);
    } catch {
      return false;
    }
  }

  /**
   * Get semantic version parts
   */
  static parseVersion(version: string): {
    major: number;
    minor: number;
    patch: number;
    prerelease?: string;
    build?: string;
  } | null {
    const clean = semver.clean(version);
    if (!clean) return null;

    const parsed = semver.parse(clean);
    if (!parsed) return null;

    return {
      major: parsed.major,
      minor: parsed.minor,
      patch: parsed.patch,
      prerelease: parsed.prerelease.length > 0 ? parsed.prerelease.join('.') : undefined,
      build: parsed.build.length > 0 ? parsed.build.join('.') : undefined
    };
  }
}