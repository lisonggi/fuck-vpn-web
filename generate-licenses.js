import fs from 'fs';
import {execSync} from 'child_process';

const fileName = "licenses"
const licenses = generateRaw()
generateJson(fileName, licenses)
generateMarkdown(fileName, licenses)

//生成licenses
function generateRaw() {
    console.log('正在生成 raw-licenses.json ...');
    execSync('npx license-checker --production --json > raw-licenses.json', {stdio: 'inherit'});

    console.log('正在处理干净的许可证信息 ...');
    const raw = JSON.parse(fs.readFileSync('raw-licenses.json', 'utf-8'));
    console.log('正在清理 raw-licenses.json ...');
    fs.unlinkSync('raw-licenses.json');
    return Object.fromEntries(
        Object.entries(raw).map(([key, val]) => [
            key,
            {
                licenses: val.licenses || 'UNKNOWN',
                repository: val.repository || '',
                publisher: val.publisher || '',
                url: val.url || ''
            }
        ])
    )
}

// 写 JSON
function generateJson(name, licenses) {
    const fileName = `${name}.json`
    fs.writeFileSync(fileName, JSON.stringify(licenses, null, 2), 'utf-8');
    console.log(`生成完成: ${fileName}`);
}

// 写 Markdown
function generateMarkdown(name, licenses) {
    const fileName = `${name}.md`
    let mdContent = '# THIRD-PARTY LICENSES\n\n';
    for (const [dep, info] of Object.entries(licenses)) {
        mdContent += `## ${dep}\n`;
        mdContent += `- License: ${info.licenses}\n`;
        if (info.publisher) mdContent += `- Publisher: ${info.publisher}\n`;
        if (info.repository) mdContent += `- Repository: ${info.repository}\n`;
        if (info.url) mdContent += `- URL: ${info.url}\n`;
        mdContent += '\n';
    }
    fs.writeFileSync(fileName, mdContent, 'utf-8');
    console.log(`生成完成: ${fileName}`);
}

