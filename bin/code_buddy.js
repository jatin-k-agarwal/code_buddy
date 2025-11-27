#!/usr/bin/env node

import { createCommand } from '../src/index.js';

// Create and execute the CLI command
const program = createCommand();
program.parse();