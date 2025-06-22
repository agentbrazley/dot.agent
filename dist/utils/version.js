"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionManager = void 0;
const semver_1 = __importDefault(require("semver"));
class VersionManager {
    /**
     * Check if two agent versions are compatible
     */
    static checkCompatibility(requiredVersion, providedVersion) {
        try {
            // Clean versions
            const cleanRequired = semver_1.default.clean(requiredVersion);
            const cleanProvided = semver_1.default.clean(providedVersion);
            if (!cleanRequired || !cleanProvided) {
                return {
                    compatible: false,
                    reason: 'Invalid version format'
                };
            }
            // Check if provided version satisfies required version range
            if (semver_1.default.satisfies(cleanProvided, requiredVersion)) {
                return { compatible: true };
            }
            // Check if it's a major version mismatch
            const requiredMajor = semver_1.default.major(cleanRequired);
            const providedMajor = semver_1.default.major(cleanProvided);
            if (requiredMajor !== providedMajor) {
                return {
                    compatible: false,
                    reason: `Major version mismatch: required v${requiredMajor}, provided v${providedMajor}`,
                    suggestedVersion: `${requiredMajor}.x.x`
                };
            }
            // Minor version compatibility check
            if (semver_1.default.lt(cleanProvided, cleanRequired)) {
                return {
                    compatible: false,
                    reason: `Version too old: required ${requiredVersion}, provided ${providedVersion}`,
                    suggestedVersion: requiredVersion
                };
            }
            return { compatible: true };
        }
        catch (error) {
            return {
                compatible: false,
                reason: 'Error checking version compatibility'
            };
        }
    }
    /**
     * Suggest version bump based on changes
     */
    static suggestVersionBump(currentVersion, changes) {
        const current = semver_1.default.clean(currentVersion);
        if (!current) {
            throw new Error('Invalid current version');
        }
        let updateType;
        let newVersion;
        if (changes.breakingChanges) {
            updateType = 'major';
            newVersion = semver_1.default.inc(current, 'major');
        }
        else if (changes.newFeatures) {
            updateType = 'minor';
            newVersion = semver_1.default.inc(current, 'minor');
        }
        else {
            updateType = 'patch';
            newVersion = semver_1.default.inc(current, 'patch');
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
    static checkModelCompatibility(agent, availableModel, availableContext) {
        const issues = [];
        // Check preferred models
        if (agent.model_requirements?.preferred_models) {
            const isPreferred = agent.model_requirements.preferred_models.some(model => availableModel.toLowerCase().includes(model.toLowerCase()));
            if (!isPreferred) {
                issues.push(`Model ${availableModel} is not in preferred models: ${agent.model_requirements.preferred_models.join(', ')}`);
            }
        }
        // Check context requirements
        if (agent.model_requirements?.min_context) {
            if (availableContext < agent.model_requirements.min_context) {
                issues.push(`Insufficient context: requires ${agent.model_requirements.min_context}, available ${availableContext}`);
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
    static compareVersions(v1, v2) {
        const clean1 = semver_1.default.clean(v1);
        const clean2 = semver_1.default.clean(v2);
        if (!clean1 || !clean2) {
            throw new Error('Invalid version format');
        }
        return semver_1.default.compare(clean1, clean2);
    }
    /**
     * Get version history from a list of agents
     */
    static getVersionHistory(agents) {
        const grouped = new Map();
        // Group by name
        for (const agent of agents) {
            const existing = grouped.get(agent.name) || [];
            existing.push(agent);
            grouped.set(agent.name, existing);
        }
        // Create version history
        const history = [];
        for (const [name, versions] of grouped.entries()) {
            const sortedVersions = versions
                .filter(a => a.version)
                .sort((a, b) => {
                try {
                    return this.compareVersions(b.version, a.version);
                }
                catch {
                    return 0;
                }
            });
            history.push({
                name,
                versions: sortedVersions.map(agent => ({
                    version: agent.version,
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
    static hasUpdate(currentVersion, latestVersion) {
        try {
            const current = semver_1.default.clean(currentVersion);
            const latest = semver_1.default.clean(latestVersion);
            if (!current || !latest) {
                return false;
            }
            return semver_1.default.lt(current, latest);
        }
        catch {
            return false;
        }
    }
    /**
     * Get semantic version parts
     */
    static parseVersion(version) {
        const clean = semver_1.default.clean(version);
        if (!clean)
            return null;
        const parsed = semver_1.default.parse(clean);
        if (!parsed)
            return null;
        return {
            major: parsed.major,
            minor: parsed.minor,
            patch: parsed.patch,
            prerelease: parsed.prerelease.length > 0 ? parsed.prerelease.join('.') : undefined,
            build: parsed.build.length > 0 ? parsed.build.join('.') : undefined
        };
    }
}
exports.VersionManager = VersionManager;
//# sourceMappingURL=version.js.map