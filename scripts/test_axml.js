import { parseAXML } from 'androguard-js';

// Let's build a clean, valid Android binary XML for AndroidManifest.xml
class AxmlBuilder {
  constructor() {
    this.strings = [];
    this.stringMap = new Map();
    this.resIds = [];
    this.elements = [];
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
    // Collect strings used in manifest
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

    // Attributes
    const pkgAttrIdx = this.getStringIndex('package');
    const vCodeAttrIdx = this.getStringIndex('versionCode');
    const vNameAttrIdx = this.getStringIndex('versionName');
    const minSdkAttrIdx = this.getStringIndex('minSdkVersion');
    const targetSdkAttrIdx = this.getStringIndex('targetSdkVersion');
    const nameAttrIdx = this.getStringIndex('name');
    const labelAttrIdx = this.getStringIndex('label');
    const iconAttrIdx = this.getStringIndex('icon');
    const exportedAttrIdx = this.getStringIndex('exported');
    const themeAttrIdx = this.getStringIndex('theme');

    // Values
    const pkgValIdx = this.getStringIndex('org.nass.unizik.portal');
    const vNameValIdx = this.getStringIndex('1.0.0');
    const appLabelValIdx = this.getStringIndex('NASS UNIZIK');
    const appIconValIdx = this.getStringIndex('@drawable/nass_logo');
    const actNameValIdx = this.getStringIndex('.MainActivity');
    const mainActionValIdx = this.getStringIndex('android.intent.action.MAIN');
    const launcherCatValIdx = this.getStringIndex('android.intent.category.LAUNCHER');
    const permInternetValIdx = this.getStringIndex('android.permission.INTERNET');
    const permNetworkValIdx = this.getStringIndex('android.permission.ACCESS_NETWORK_STATE');

    // 1. Build String Pool Chunk (UTF-16LE)
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
    // Align strTableData to 4 bytes
    const padLen = (4 - (strTableData.length % 4)) % 4;
    const paddedStrData = Buffer.concat([strTableData, Buffer.alloc(padLen)]);

    const strPoolHeaderSize = 28;
    const strCount = this.strings.length;
    const strOffsetsLen = strCount * 4;
    const strPoolChunkSize = strPoolHeaderSize + strOffsetsLen + paddedStrData.length;

    const strPoolChunk = Buffer.alloc(strPoolChunkSize);
    strPoolChunk.writeUInt16LE(0x0001, 0); // RES_STRING_POOL_TYPE
    strPoolChunk.writeUInt16LE(strPoolHeaderSize, 2);
    strPoolChunk.writeUInt32LE(strPoolChunkSize, 4);
    strPoolChunk.writeUInt32LE(strCount, 8); // stringCount
    strPoolChunk.writeUInt32LE(0, 12); // styleCount
    strPoolChunk.writeUInt32LE(0, 16); // flags: UTF-16
    strPoolChunk.writeUInt32LE(strPoolHeaderSize + strOffsetsLen, 20); // stringsStart
    strPoolChunk.writeUInt32LE(0, 24); // stylesStart

    let off = strPoolHeaderSize;
    for (const o of strDataOffsets) {
      strPoolChunk.writeUInt32LE(o, off);
      off += 4;
    }
    paddedStrData.copy(strPoolChunk, off);

    // 2. Resource IDs map
    // We can map known attribute IDs
    const resIdMap = [
      0x01010000, // theme
      0x01010001, // label
      0x01010002, // icon
      0x01010003, // name
      0x0101001b, // versionCode
      0x0101001c, // versionName
      0x01010010, // exported
      0x0101020c, // minSdkVersion
      0x01010270  // targetSdkVersion
    ];
    const resMapHeaderSize = 8;
    const resMapChunkSize = resMapHeaderSize + resIdMap.length * 4;
    const resMapChunk = Buffer.alloc(resMapChunkSize);
    resMapChunk.writeUInt16LE(0x0180, 0); // RES_XML_RESOURCE_MAP_TYPE
    resMapChunk.writeUInt16LE(resMapHeaderSize, 2);
    resMapChunk.writeUInt32LE(resMapChunkSize, 4);
    for (let i = 0; i < resIdMap.length; i++) {
      resMapChunk.writeUInt32LE(resIdMap[i], 8 + i * 4);
    }

    // Helper functions for XML nodes
    function createNamespaceChunk(type, prefixIdx, uriIdx, line = 1) {
      const b = Buffer.alloc(24);
      b.writeUInt16LE(type, 0);
      b.writeUInt16LE(16, 2);
      b.writeUInt32LE(24, 4);
      b.writeUInt32LE(line, 8);
      b.writeUInt32LE(0xFFFFFFFF, 12); // comment
      b.writeUInt32LE(prefixIdx, 16);
      b.writeUInt32LE(uriIdx, 20);
      return b;
    }

    function createStartElementChunk(nameIdx, attrs = [], line = 1) {
      const headerSize = 16;
      const attrSize = 20;
      const totalSize = headerSize + 20 + attrs.length * attrSize;
      const b = Buffer.alloc(totalSize);

      b.writeUInt16LE(0x0102, 0); // RES_XML_START_ELEMENT_TYPE
      b.writeUInt16LE(headerSize, 2);
      b.writeUInt32LE(totalSize, 4);
      b.writeUInt32LE(line, 8);
      b.writeUInt32LE(0xFFFFFFFF, 12); // comment

      b.writeUInt32LE(0xFFFFFFFF, 16); // ns
      b.writeUInt32LE(nameIdx, 20); // name
      b.writeUInt16LE(20, 24); // attributeStart
      b.writeUInt16LE(20, 26); // attributeSize
      b.writeUInt16LE(attrs.length, 28); // attributeCount
      b.writeUInt16LE(0, 30); // idIndex
      b.writeUInt16LE(0, 32); // classIndex
      b.writeUInt16LE(0, 34); // styleIndex

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
      b.writeUInt16LE(0x0103, 0); // RES_XML_END_ELEMENT_TYPE
      b.writeUInt16LE(16, 2);
      b.writeUInt32LE(24, 4);
      b.writeUInt32LE(line, 8);
      b.writeUInt32LE(0xFFFFFFFF, 12); // comment
      b.writeUInt32LE(0xFFFFFFFF, 16); // ns
      b.writeUInt32LE(nameIdx, 20); // name
      return b;
    }

    const xmlChunks = [];

    // Start namespace
    xmlChunks.push(createNamespaceChunk(0x0100, nsPrefixIdx, nsUriIdx));

    // <manifest package="org.nass.unizik.portal" android:versionCode="1" android:versionName="1.0.0">
    xmlChunks.push(createStartElementChunk(manifestTagIdx, [
      { ns: 0xFFFFFFFF, name: pkgAttrIdx, rawVal: pkgValIdx, type: 0x03000008, data: pkgValIdx },
      { ns: nsUriIdx, name: vCodeAttrIdx, rawVal: 0xFFFFFFFF, type: 0x10000008, data: 1 },
      { ns: nsUriIdx, name: vNameAttrIdx, rawVal: vNameValIdx, type: 0x03000008, data: vNameValIdx }
    ]));

    // <uses-sdk android:minSdkVersion="14" android:targetSdkVersion="34" />
    xmlChunks.push(createStartElementChunk(usesSdkTagIdx, [
      { ns: nsUriIdx, name: minSdkAttrIdx, rawVal: 0xFFFFFFFF, type: 0x10000008, data: 14 },
      { ns: nsUriIdx, name: targetSdkAttrIdx, rawVal: 0xFFFFFFFF, type: 0x10000008, data: 34 }
    ]));
    xmlChunks.push(createEndElementChunk(usesSdkTagIdx));

    // <uses-permission android:name="android.permission.INTERNET" />
    xmlChunks.push(createStartElementChunk(usesPermTagIdx, [
      { ns: nsUriIdx, name: nameAttrIdx, rawVal: permInternetValIdx, type: 0x03000008, data: permInternetValIdx }
    ]));
    xmlChunks.push(createEndElementChunk(usesPermTagIdx));

    // <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    xmlChunks.push(createStartElementChunk(usesPermTagIdx, [
      { ns: nsUriIdx, name: nameAttrIdx, rawVal: permNetworkValIdx, type: 0x03000008, data: permNetworkValIdx }
    ]));
    xmlChunks.push(createEndElementChunk(usesPermTagIdx));

    // <application android:label="NASS UNIZIK" android:icon="@drawable/nass_logo">
    xmlChunks.push(createStartElementChunk(appTagIdx, [
      { ns: nsUriIdx, name: labelAttrIdx, rawVal: appLabelValIdx, type: 0x03000008, data: appLabelValIdx },
      { ns: nsUriIdx, name: iconAttrIdx, rawVal: appIconValIdx, type: 0x03000008, data: appIconValIdx }
    ]));

    // <activity android:name=".MainActivity" android:exported="true" android:label="NASS UNIZIK">
    xmlChunks.push(createStartElementChunk(actTagIdx, [
      { ns: nsUriIdx, name: nameAttrIdx, rawVal: actNameValIdx, type: 0x03000008, data: actNameValIdx },
      { ns: nsUriIdx, name: exportedAttrIdx, rawVal: 0xFFFFFFFF, type: 0x12000008, data: 0xFFFFFFFF }, // true
      { ns: nsUriIdx, name: labelAttrIdx, rawVal: appLabelValIdx, type: 0x03000008, data: appLabelValIdx }
    ]));

    // <intent-filter>
    xmlChunks.push(createStartElementChunk(ifTagIdx, []));

    // <action android:name="android.intent.action.MAIN" />
    xmlChunks.push(createStartElementChunk(actionTagIdx, [
      { ns: nsUriIdx, name: nameAttrIdx, rawVal: mainActionValIdx, type: 0x03000008, data: mainActionValIdx }
    ]));
    xmlChunks.push(createEndElementChunk(actionTagIdx));

    // <category android:name="android.intent.category.LAUNCHER" />
    xmlChunks.push(createStartElementChunk(catTagIdx, [
      { ns: nsUriIdx, name: nameAttrIdx, rawVal: launcherCatValIdx, type: 0x03000008, data: launcherCatValIdx }
    ]));
    xmlChunks.push(createEndElementChunk(catTagIdx));

    // </intent-filter>
    xmlChunks.push(createEndElementChunk(ifTagIdx));

    // </activity>
    xmlChunks.push(createEndElementChunk(actTagIdx));

    // </application>
    xmlChunks.push(createEndElementChunk(appTagIdx));

    // </manifest>
    xmlChunks.push(createEndElementChunk(manifestTagIdx));

    // End namespace
    xmlChunks.push(createNamespaceChunk(0x0101, nsPrefixIdx, nsUriIdx));

    const bodyBuffer = Buffer.concat([strPoolChunk, resMapChunk, ...xmlChunks]);
    const fileHeaderSize = 8;
    const totalFileSize = fileHeaderSize + bodyBuffer.length;

    const fileHeader = Buffer.alloc(fileHeaderSize);
    fileHeader.writeUInt16LE(0x0003, 0); // RES_XML_TYPE
    fileHeader.writeUInt16LE(fileHeaderSize, 2);
    fileHeader.writeUInt32LE(totalFileSize, 4);

    return Buffer.concat([fileHeader, bodyBuffer]);
  }
}

const builder = new AxmlBuilder();
const axmlBuf = builder.build();

console.log('Generated AXML Buffer size:', axmlBuf.length);

try {
  const parsed = parseAXML(axmlBuf);
  console.log('SUCCESSFULLY PARSED WITH ANDROGUARD-JS:');
  console.log(JSON.stringify(parsed, null, 2).slice(0, 500));
} catch (err) {
  console.error('Parse error:', err);
}
