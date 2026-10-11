import fs from 'node:fs';
import path from 'node:path';
import archiver from 'node:zlib'; // We can use JS or Python or simple zip
import { execSync } from 'node:child_process';
import { parseAXML } from 'androguard-js';

const rootDir = process.cwd();

// 1. Build AXML Buffer
class AxmlBuilder {
  constructor() {
    this.strings = [];
    this.stringMap = new Map();
  }

  getStringIndex(str) {
    if (this.stringMap.has(str)) {
      return this.stringMap.get(str);
    }
    const idx = this.strings.length;
    this.strings.push(str);
    this.stringMap.set(str, idx);
    return idx;
  }

  build() {
    const nsUri = 'http://schemas.android.com/apk/res/android';
    const nsPrefix = 'android';

    const nsUriIdx = this.getStringIndex(nsUri);
    const nsPrefixIdx = this.getStringIndex(nsPrefix);

    const manifestTagIdx = this.getStringIndex('manifest');
    const appTagIdx = this.getStringIndex('application');
    const actTagIdx = this.getStringIndex('activity');
    const ifTagIdx = this.getStringIndex('intent-filter');
    const actionTagIdx = this.getStringIndex('action');
    const catTagIdx = this.getStringIndex('category');
    const usesSdkTagIdx = this.getStringIndex('uses-sdk');
    const usesPermTagIdx = this.getStringIndex('uses-permission');

    const pkgAttrIdx = this.getStringIndex('package');
    const vCodeAttrIdx = this.getStringIndex('versionCode');
    const vNameAttrIdx = this.getStringIndex('versionName');
    const minSdkAttrIdx = this.getStringIndex('minSdkVersion');
    const targetSdkAttrIdx = this.getStringIndex('targetSdkVersion');
    const nameAttrIdx = this.getStringIndex('name');
    const labelAttrIdx = this.getStringIndex('label');
    const iconAttrIdx = this.getStringIndex('icon');
    const exportedAttrIdx = this.getStringIndex('exported');

    const pkgValIdx = this.getStringIndex('org.nass.unizik.portal');
    const vNameValIdx = this.getStringIndex('1.0.0');
    const appLabelValIdx = this.getStringIndex('NASS UNIZIK');
    const appIconValIdx = this.getStringIndex('@drawable/nass_logo');
    const actNameValIdx = this.getStringIndex('.MainActivity');
    const mainActionValIdx = this.getStringIndex('android.intent.action.MAIN');
    const launcherCatValIdx = this.getStringIndex('android.intent.category.LAUNCHER');
    const permInternetValIdx = this.getStringIndex('android.permission.INTERNET');
    const permNetworkValIdx = this.getStringIndex('android.permission.ACCESS_NETWORK_STATE');

    const strDataOffsets = [];
    const strBuffers = [];
    let curDataOffset = 0;

    for (const s of this.strings) {
      strDataOffsets.push(curDataOffset);
      const strLen = s.length;
      const buf = Buffer.alloc(2 + strLen * 2 + 2);
      buf.writeUInt16LE(strLen, 0);
      buf.write(s, 2, 'utf16le');
      buf.writeUInt16LE(0, 2 + strLen * 2);
      strBuffers.push(buf);
      curDataOffset += buf.length;
    }

    const strTableData = Buffer.concat(strBuffers);
    const padLen = (4 - (strTableData.length % 4)) % 4;
    const paddedStrData = Buffer.concat([strTableData, Buffer.alloc(padLen)]);

    const strPoolHeaderSize = 28;
    const strCount = this.strings.length;
    const strOffsetsLen = strCount * 4;
    const strPoolChunkSize = strPoolHeaderSize + strOffsetsLen + paddedStrData.length;

    const strPoolChunk = Buffer.alloc(strPoolChunkSize);
    strPoolChunk.writeUInt16LE(0x0001, 0);
    strPoolChunk.writeUInt16LE(strPoolHeaderSize, 2);
    strPoolChunk.writeUInt32LE(strPoolChunkSize, 4);
    strPoolChunk.writeUInt32LE(strCount, 8);
    strPoolChunk.writeUInt32LE(0, 12);
    strPoolChunk.writeUInt32LE(0, 16);
    strPoolChunk.writeUInt32LE(strPoolHeaderSize + strOffsetsLen, 20);
    strPoolChunk.writeUInt32LE(0, 24);

    let off = strPoolHeaderSize;
    for (const o of strDataOffsets) {
      strPoolChunk.writeUInt32LE(o, off);
      off += 4;
    }
    paddedStrData.copy(strPoolChunk, off);

    const resIdMap = [
      0x01010000, 0x01010001, 0x01010002, 0x01010003,
      0x0101001b, 0x0101001c, 0x01010010, 0x0101020c, 0x01010270
    ];
    const resMapHeaderSize = 8;
    const resMapChunkSize = resMapHeaderSize + resIdMap.length * 4;
    const resMapChunk = Buffer.alloc(resMapChunkSize);
    resMapChunk.writeUInt16LE(0x0180, 0);
    resMapChunk.writeUInt16LE(resMapHeaderSize, 2);
    resMapChunk.writeUInt32LE(resMapChunkSize, 4);
    for (let i = 0; i < resIdMap.length; i++) {
      resMapChunk.writeUInt32LE(resIdMap[i], 8 + i * 4);
    }

    function createNamespaceChunk(type, prefixIdx, uriIdx, line = 1) {
      const b = Buffer.alloc(24);
      b.writeUInt16LE(type, 0);
      b.writeUInt16LE(16, 2);
      b.writeUInt32LE(24, 4);
      b.writeUInt32LE(line, 8);
      b.writeUInt32LE(0xFFFFFFFF, 12);
      b.writeUInt32LE(prefixIdx, 16);
      b.writeUInt32LE(uriIdx, 20);
      return b;
    }

    function createStartElementChunk(nameIdx, attrs = [], line = 1) {
      const headerSize = 16;
      const attrSize = 20;
      const totalSize = headerSize + 20 + attrs.length * attrSize;
      const b = Buffer.alloc(totalSize);

      b.writeUInt16LE(0x0102, 0);
      b.writeUInt16LE(headerSize, 2);
      b.writeUInt32LE(totalSize, 4);
      b.writeUInt32LE(line, 8);
      b.writeUInt32LE(0xFFFFFFFF, 12);

      b.writeUInt32LE(0xFFFFFFFF, 16);
      b.writeUInt32LE(nameIdx, 20);
      b.writeUInt16LE(20, 24);
      b.writeUInt16LE(20, 26);
      b.writeUInt16LE(attrs.length, 28);
      b.writeUInt16LE(0, 30);
      b.writeUInt16LE(0, 32);
      b.writeUInt16LE(0, 34);

      let cur = 36;
      for (const a of attrs) {
        b.writeUInt32LE(a.ns === undefined ? 0xFFFFFFFF : a.ns, cur);
        b.writeUInt32LE(a.name, cur + 4);
        b.writeUInt32LE(a.rawVal === undefined ? 0xFFFFFFFF : a.rawVal, cur + 8);
        b.writeUInt32LE(a.type, cur + 12);
        b.writeUInt32LE(a.data, cur + 16);
        cur += attrSize;
      }
      return b;
    }

    function createEndElementChunk(nameIdx, line = 1) {
      const b = Buffer.alloc(24);
      b.writeUInt16LE(0x0103, 0);
      b.writeUInt16LE(16, 2);
      b.writeUInt32LE(24, 4);
      b.writeUInt32LE(line, 8);
      b.writeUInt32LE(0xFFFFFFFF, 12);
      b.writeUInt32LE(0xFFFFFFFF, 16);
      b.writeUInt32LE(nameIdx, 20);
      return b;
    }

    const xmlChunks = [];
    xmlChunks.push(createNamespaceChunk(0x0100, nsPrefixIdx, nsUriIdx));

    xmlChunks.push(createStartElementChunk(manifestTagIdx, [
      { ns: 0xFFFFFFFF, name: pkgAttrIdx, rawVal: pkgValIdx, type: 0x03000008, data: pkgValIdx },
      { ns: nsUriIdx, name: vCodeAttrIdx, rawVal: 0xFFFFFFFF, type: 0x10000008, data: 1 },
      { ns: nsUriIdx, name: vNameAttrIdx, rawVal: vNameValIdx, type: 0x03000008, data: vNameValIdx }
    ]));

    xmlChunks.push(createStartElementChunk(usesSdkTagIdx, [
      { ns: nsUriIdx, name: minSdkAttrIdx, rawVal: 0xFFFFFFFF, type: 0x10000008, data: 14 },
      { ns: nsUriIdx, name: targetSdkAttrIdx, rawVal: 0xFFFFFFFF, type: 0x10000008, data: 34 }
    ]));
    xmlChunks.push(createEndElementChunk(usesSdkTagIdx));

    xmlChunks.push(createStartElementChunk(usesPermTagIdx, [
      { ns: nsUriIdx, name: nameAttrIdx, rawVal: permInternetValIdx, type: 0x03000008, data: permInternetValIdx }
    ]));
    xmlChunks.push(createEndElementChunk(usesPermTagIdx));

    xmlChunks.push(createStartElementChunk(usesPermTagIdx, [
      { ns: nsUriIdx, name: nameAttrIdx, rawVal: permNetworkValIdx, type: 0x03000008, data: permNetworkValIdx }
    ]));
    xmlChunks.push(createEndElementChunk(usesPermTagIdx));

    xmlChunks.push(createStartElementChunk(appTagIdx, [
      { ns: nsUriIdx, name: labelAttrIdx, rawVal: appLabelValIdx, type: 0x03000008, data: appLabelValIdx },
      { ns: nsUriIdx, name: iconAttrIdx, rawVal: appIconValIdx, type: 0x03000008, data: appIconValIdx }
    ]));

    xmlChunks.push(createStartElementChunk(actTagIdx, [
      { ns: nsUriIdx, name: nameAttrIdx, rawVal: actNameValIdx, type: 0x03000008, data: actNameValIdx },
      { ns: nsUriIdx, name: exportedAttrIdx, rawVal: 0xFFFFFFFF, type: 0x12000008, data: 0xFFFFFFFF },
      { ns: nsUriIdx, name: labelAttrIdx, rawVal: appLabelValIdx, type: 0x03000008, data: appLabelValIdx }
    ]));

    xmlChunks.push(createStartElementChunk(ifTagIdx, []));
    xmlChunks.push(createStartElementChunk(actionTagIdx, [
      { ns: nsUriIdx, name: nameAttrIdx, rawVal: mainActionValIdx, type: 0x03000008, data: mainActionValIdx }
    ]));
    xmlChunks.push(createEndElementChunk(actionTagIdx));

    xmlChunks.push(createStartElementChunk(catTagIdx, [
      { ns: nsUriIdx, name: launcherCatValIdx, type: 0x03000008, data: launcherCatValIdx }
    ]));
    xmlChunks.push(createEndElementChunk(catTagIdx));

    xmlChunks.push(createEndElementChunk(ifTagIdx));
    xmlChunks.push(createEndElementChunk(actTagIdx));
    xmlChunks.push(createEndElementChunk(appTagIdx));
    xmlChunks.push(createEndElementChunk(manifestTagIdx));
    xmlChunks.push(createNamespaceChunk(0x0101, nsPrefixIdx, nsUriIdx));

    const bodyBuffer = Buffer.concat([strPoolChunk, resMapChunk, ...xmlChunks]);
    const fileHeaderSize = 8;
    const totalFileSize = fileHeaderSize + bodyBuffer.length;

    const fileHeader = Buffer.alloc(fileHeaderSize);
    fileHeader.writeUInt16LE(0x0003, 0);
    fileHeader.writeUInt16LE(fileHeaderSize, 2);
    fileHeader.writeUInt32LE(totalFileSize, 4);

    return Buffer.concat([fileHeader, bodyBuffer]);
  }
}

const axmlBuf = new AxmlBuilder().build();
// Validate with parser
const parsedCheck = parseAXML(axmlBuf);
console.log('Validated AXML package:', parsedCheck.root.attrs.package);

fs.writeFileSync(path.join(rootDir, 'scripts/manifest.axml'), axmlBuf);

// 2. Build iOS MobileConfig (Native WebClip Profile for iOS of all versions)
const logoBase64 = fs.readFileSync(path.join(rootDir, 'resources/images/nass-logo.jpg')).toString('base64');

const mobileconfigContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>PayloadContent</key>
	<array>
		<dict>
			<key>FullScreen</key>
			<true/>
			<key>Icon</key>
			<data>${logoBase64}</data>
			<key>IsRemovable</key>
			<true/>
			<key>Label</key>
			<string>NASS UNIZIK</string>
			<key>PayloadDescription</key>
			<string>Configures NASS UNIZIK Departmental Portal Web Application on iOS</string>
			<key>PayloadDisplayName</key>
			<string>NASS UNIZIK WebClip</string>
			<key>PayloadIdentifier</key>
			<string>org.nass.unizik.portal.webclip</string>
			<key>PayloadType</key>
			<string>com.apple.webClip.managed</string>
			<key>PayloadUUID</key>
			<string>5c7e3a9d-4e2b-4d7a-8f1e-9a2c3b4d5e6f</string>
			<key>PayloadVersion</key>
			<integer>1</integer>
			<key>Precomposed</key>
			<true/>
			<key>URL</key>
			<string>https://ais-pre-qifqk7j2hmny74whndfsvy-880606720684.europe-west2.run.app/</string>
		</dict>
	</array>
	<key>PayloadDescription</key>
	<string>Official native application profile for NASS UNIZIK Department of Statistics Portal.</string>
	<key>PayloadDisplayName</key>
	<string>NASS UNIZIK App</string>
	<key>PayloadIdentifier</key>
	<string>org.nass.unizik.portal.profile</string>
	<key>PayloadOrganization</key>
	<string>National Association of Students of Statistics (NASS), UNIZIK Awka</string>
	<key>PayloadRemovalDisallowed</key>
	<false/>
	<key>PayloadType</key>
	<string>Configuration</string>
	<key>PayloadUUID</key>
	<string>3a7e4b9d-5f2c-4e8b-9a1f-0b3c4d5e6f7a</string>
	<key>PayloadVersion</key>
	<integer>1</integer>
</dict>
</plist>
`;

fs.writeFileSync(path.join(rootDir, 'public/downloads/NASS_UNIZIK.mobileconfig'), mobileconfigContent);
fs.writeFileSync(path.join(rootDir, 'NASS_UNIZIK.mobileconfig'), mobileconfigContent);
console.log('Created iOS NASS_UNIZIK.mobileconfig successfully');
