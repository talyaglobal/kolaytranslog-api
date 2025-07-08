import { exec } from 'node:child_process';
import { writeFile } from 'node:fs';
import { resolve } from 'node:path';

writeFile(resolve('logs/app.log'), '', (err) => {
	if (err) {
		console.error('Error creating app.log file:', err);
	} else {
		console.log('app.log file created successfully.');
	}
});

writeFile(resolve('logs/error.log'), '', (err) => {
	if (err) {
		console.error('Error creating error.log file:', err);
	} else {
		console.log('error.log file created successfully.');
	}
});

exec('npx prisma generate', (error, stdout, stderr) => {
	if (error) {
		console.error(`Error executing Prisma generate: ${error.message}`);
		return;
	}
	if (stderr) {
		console.error(`Prisma generate stderr: ${stderr}`);
		return;
	}
	console.log(`Prisma generate stdout: ${stdout}`);
});
