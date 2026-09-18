import fs from 'fs';
import path from 'path';
import { JAVA_PROJECT_FILES } from '../src/data/javaProjectFiles.js';

const targetBase = path.join(process.cwd(), 'spring-boot-project');

console.log(`Exporting ${JAVA_PROJECT_FILES.length} Java Spring Boot project files to ${targetBase}...`);

for (const file of JAVA_PROJECT_FILES) {
  const fullPath = path.join(targetBase, file.path);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, file.content, 'utf-8');
  console.log(` Created: ${file.path}`);
}

// Add executable mvnw scripts
fs.writeFileSync(path.join(targetBase, 'mvnw'), `#!/bin/sh\nexec mvn "$@"\n`, { mode: 0o755 });
fs.writeFileSync(path.join(targetBase, 'mvnw.cmd'), `@echo off\nmvn %*\n`);

console.log('✅ Spring Boot project files successfully written!');
