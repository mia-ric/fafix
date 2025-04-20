const compareWithOperator = (comparison: number, operator: string): boolean | null => {
    switch (operator) {
        case '>':
        case 'gt':
            return comparison > 0;
        case '>=':
        case 'ge':
            return comparison >= 0;
        case '<':
        case 'lt':
            return comparison < 0;
        case '<=':
        case 'le':
            return comparison <= 0;
        case '=':
        case 'eq':
        case '===':
            return comparison === 0;
        case '<>':
        case '!==':
        case 'ne':
            return comparison !== 0;
        default:
            return null;
    }
};

/**
 * Semantic Versioning Comparison
 * @param v1
 * @param v2
 * @param operator
 * @returns
 */
function versionCompare(v1: string, v2: string, operator?: string): number | boolean | null {
    const versionMap: Record<string, number> = {
        'dev': -6,
        'alpha': -5,
        'a': -5,
        'beta': -4,
        'b': -4,
        'RC': -3,
        'rc': -3,
        '#': -2,
        'p': 1,
        'pl': 1,
    };

    const parseVersion = (version: string): (number | string)[] => {
        // Remove build metadata (anything after '+')
        version = version.split('+')[0];
        return version
            .replace(/[_\-]/g, '.')
            .replace(/([^\.\d]+)/g, '.$1.')
            .replace(/\.{2,}/g, '.')
            .split('.')
            .map((part) => (Number.isNaN(Number(part)) ? (versionMap[part] ?? -7) : Number(part)));
    };

    const v1Parts = parseVersion(v1);
    const v2Parts = parseVersion(v2);
    const maxLength = Math.max(v1Parts.length, v2Parts.length);

    for (let i = 0; i < maxLength; i++) {
        const num1 = v1Parts[i] ?? 0;
        const num2 = v2Parts[i] ?? 0;

        // Pre-release versions are lower than stable versions
        if (typeof num1 === 'string' && typeof num2 === 'number') return -1;
        if (typeof num2 === 'string' && typeof num1 === 'number') return 1;

        if (num1 !== num2) {
            const comparison = num1 > num2 ? 1 : -1;
            return operator ? compareWithOperator(comparison, operator) : comparison;
        }
    }

    return operator ? compareWithOperator(0, operator) : 0;
}

// Export Module
export default versionCompare;
export { versionCompare };