// Predeclared facts: stripping soft hyphens restores the input, hyphenation removes overflow, short text is untouched.
import { readFileSync } from 'node:fs';

const { results } = JSON.parse(readFileSync('output/metrics.json', 'utf8'));
const [german, english, short] = results;
const failures = [];
if (!results.every((r) => r.roundTrips)) failures.push('soft hyphens are not purely additive');
if (!(german.plainOverflowLines > 0 && german.hyphenatedOverflowLines === 0)) failures.push('German overflow not removed');
if (!(english.plainOverflowLines > 0 && english.hyphenatedOverflowLines === 0)) failures.push('English overflow not removed');
if (short.softHyphenCount !== 0 || short.plainLines.join() !== short.hyphenatedLines.join()) failures.push('short words changed');
if (failures.length) throw new Error(failures.join('; '));
