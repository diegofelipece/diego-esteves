import { readContent } from '../content/read.ts';

const { projects } = readContent();
console.log(`Validated content: ${projects.length} published projects, About, and homepage settings.`);
