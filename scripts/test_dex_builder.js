import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { parseDEX } = require('../node_modules/androguard-js/src/dex/parser.js');
import crypto from 'node:crypto';

// Adler32 implementation for DEX checksum
function adler32(buf, offset = 0, len = buf.length - offset) {
  let a = 1;
  let b = 0;
  const MOD = 65521;
  for (let i = offset; i < offset + len; i++) {
    a = (a + buf[i]) % MOD;
    b = (b + a) % MOD;
  }
  return ((b << 16) | a) >>> 0;
}

// Write unsigned LEB128
function writeULEB128(val) {
  const bytes = [];
  let remaining = val >>> 0;
  do {
    let b = remaining & 0x7f;
    remaining >>>= 7;
    if (remaining !== 0) {
      b |= 0x80;
    }
    bytes.push(b);
  } while (remaining !== 0);
  return Buffer.from(bytes);
}

export function buildDex() {
  // String pool (must be sorted in DEX UTF-16 code point order)
  const strings = [
    '<init>',
    'Landroid/app/Activity;',
    'Ljava/lang/Object;',
    'Lorg/nass/unizik/portal/MainActivity;',
    'MainActivity.java',
    'V',
    'VL'
  ];

  // Types (indices into strings)
  const types = [
    1, // Landroid/app/Activity; -> 0
    2, // Ljava/lang/Object; -> 1
    3, // Lorg/nass/unizik/portal/MainActivity; -> 2
    5  // V -> 3
  ];

  // Proto: ()V -> shorty: V (5), return: V (type 3), params: 0
  const protos = [
    { shorty: 5, returnType: 3, paramsOff: 0 }
  ];

  // Methods:
  // 0: Landroid/app/Activity;-><init>()V
  // 1: Lorg/nass/unizik/portal/MainActivity;-><init>()V
  const methods = [
    { classIdx: 0, protoIdx: 0, nameIdx: 0 },
    { classIdx: 2, protoIdx: 0, nameIdx: 0 }
  ];

  // Code item for MainActivity.<init>():
  // invoke-direct {v0}, Landroid/app/Activity;-><init>()V (opcode: 70 10 00 00 00 00)
  // return-void (opcode: 0e 00)
  // Total 4 code units (8 bytes)
  const insns = Buffer.from([
    0x70, 0x10, 0x00, 0x00, 0x00, 0x00, // invoke-direct {v0}, method@0
    0x0e, 0x00                          // return-void
  ]);

  const codeItem = Buffer.alloc(16 + insns.length);
  codeItem.writeUInt16LE(1, 0); // registers_size = 1
  codeItem.writeUInt16LE(1, 2); // ins_size = 1
  codeItem.writeUInt16LE(1, 4); // outs_size = 1
  codeItem.writeUInt16LE(0, 6); // tries_size = 0
  codeItem.writeUInt32LE(0, 8); // debug_info_off = 0
  codeItem.writeUInt32LE(insns.length / 2, 12); // insns_size in 16-bit units = 4
  insns.copy(codeItem, 16);

  // Class data item:
  // static_fields_size: 0
  // instance_fields_size: 0
  // direct_methods_size: 1 (MainActivity.<init>)
  // virtual_methods_size: 0
  // direct_methods: [ method_idx_diff: 1, access_flags: ACC_PUBLIC | ACC_CONSTRUCTOR = 0x10001, code_off ]
  // We'll compute code_off when placing data.

  // Let's compute offsets
  const headerSize = 112;
  const stringIdsOff = headerSize;
  const stringIdsSize = strings.length;
  const stringIdsByteLen = stringIdsSize * 4;

  const typeIdsOff = stringIdsOff + stringIdsByteLen;
  const typeIdsSize = types.length;
  const typeIdsByteLen = typeIdsSize * 4;

  const protoIdsOff = typeIdsOff + typeIdsByteLen;
  const protoIdsSize = protos.length;
  const protoIdsByteLen = protoIdsSize * 12;

  const fieldIdsOff = protoIdsOff + protoIdsByteLen;
  const fieldIdsSize = 0;
  const fieldIdsByteLen = 0;

  const methodIdsOff = fieldIdsOff + fieldIdsByteLen;
  const methodIdsSize = methods.length;
  const methodIdsByteLen = methodIdsSize * 8;

  const classDefsOff = methodIdsOff + methodIdsByteLen;
  const classDefsSize = 1;
  const classDefsByteLen = classDefsSize * 32;

  // Data section starts here
  let dataOff = classDefsOff + classDefsByteLen;
  // Align data section to 4 bytes
  dataOff = (dataOff + 3) & ~3;

  const dataBuffers = [];
  let curDataOff = dataOff;

  // 1. String data items
  const stringDataOffsets = [];
  for (const s of strings) {
    stringDataOffsets.push(curDataOff);
    const uleb = writeULEB128(s.length);
    const strBuf = Buffer.from(s, 'utf8');
    const zero = Buffer.from([0]);
    const item = Buffer.concat([uleb, strBuf, zero]);
    dataBuffers.push(item);
    curDataOff += item.length;
  }

  // Align to 4 bytes for codeItem
  const padCode = ((curDataOff + 3) & ~3) - curDataOff;
  if (padCode > 0) {
    dataBuffers.push(Buffer.alloc(padCode));
    curDataOff += padCode;
  }

  const codeItemOff = curDataOff;
  dataBuffers.push(codeItem);
  curDataOff += codeItem.length;

  // Align to 4 bytes
  const padClassData = ((curDataOff + 3) & ~3) - curDataOff;
  if (padClassData > 0) {
    dataBuffers.push(Buffer.alloc(padClassData));
    curDataOff += padClassData;
  }

  const classDataOff = curDataOff;
  // class data:
  // static_fields_size: 0
  // instance_fields_size: 0
  // direct_methods_size: 1
  // virtual_methods_size: 0
  // direct_method:
  //   method_idx_diff: 1 (method index 1)
  //   access_flags: 0x10001 (ACC_PUBLIC 0x1 | ACC_CONSTRUCTOR 0x10000)
  //   code_off: codeItemOff
  const classDataParts = [
    writeULEB128(0),
    writeULEB128(0),
    writeULEB128(1),
    writeULEB128(0),
    writeULEB128(1),
    writeULEB128(0x10001),
    writeULEB128(codeItemOff)
  ];
  const classDataBuf = Buffer.concat(classDataParts);
  dataBuffers.push(classDataBuf);
  curDataOff += classDataBuf.length;

  // Map list:
  const padMap = ((curDataOff + 3) & ~3) - curDataOff;
  if (padMap > 0) {
    dataBuffers.push(Buffer.alloc(padMap));
    curDataOff += padMap;
  }

  const mapOff = curDataOff;
  const mapItems = [
    { type: 0x0000, size: 1, offset: 0 }, // HEADER_ITEM
    { type: 0x0001, size: stringIdsSize, offset: stringIdsOff }, // STRING_ID_ITEM
    { type: 0x0002, size: typeIdsSize, offset: typeIdsOff }, // TYPE_ID_ITEM
    { type: 0x0003, size: protoIdsSize, offset: protoIdsOff }, // PROTO_ID_ITEM
    { type: 0x0005, size: methodIdsSize, offset: methodIdsOff }, // METHOD_ID_ITEM
    { type: 0x0006, size: classDefsSize, offset: classDefsOff }, // CLASS_DEF_ITEM
    { type: 0x2002, size: strings.length, offset: stringDataOffsets[0] }, // STRING_DATA_ITEM
    { type: 0x2001, size: 1, offset: codeItemOff }, // CODE_ITEM
    { type: 0x2000, size: 1, offset: classDataOff }, // CLASS_DATA_ITEM
    { type: 0x1000, size: 1, offset: mapOff } // MAP_LIST
  ];

  const mapListBuf = Buffer.alloc(4 + mapItems.length * 12);
  mapListBuf.writeUInt32LE(mapItems.length, 0);
  for (let i = 0; i < mapItems.length; i++) {
    mapListBuf.writeUInt16LE(mapItems[i].type, 4 + i * 12);
    mapListBuf.writeUInt16LE(0, 4 + i * 12 + 2);
    mapListBuf.writeUInt32LE(mapItems[i].size, 4 + i * 12 + 4);
    mapListBuf.writeUInt32LE(mapItems[i].offset, 4 + i * 12 + 8);
  }
  dataBuffers.push(mapListBuf);
  curDataOff += mapListBuf.length;

  const totalFileSize = curDataOff;
  const dataSize = totalFileSize - dataOff;

  // Now assemble all sections
  const stringIdsBuf = Buffer.alloc(stringIdsByteLen);
  for (let i = 0; i < stringIdsSize; i++) {
    stringIdsBuf.writeUInt32LE(stringDataOffsets[i], i * 4);
  }

  const typeIdsBuf = Buffer.alloc(typeIdsByteLen);
  for (let i = 0; i < typeIdsSize; i++) {
    typeIdsBuf.writeUInt32LE(types[i], i * 4);
  }

  const protoIdsBuf = Buffer.alloc(protoIdsByteLen);
  for (let i = 0; i < protoIdsSize; i++) {
    protoIdsBuf.writeUInt32LE(protos[i].shorty, i * 12);
    protoIdsBuf.writeUInt32LE(protos[i].returnType, i * 12 + 4);
    protoIdsBuf.writeUInt32LE(protos[i].paramsOff, i * 12 + 8);
  }

  const methodIdsBuf = Buffer.alloc(methodIdsByteLen);
  for (let i = 0; i < methodIdsSize; i++) {
    methodIdsBuf.writeUInt16LE(methods[i].classIdx, i * 8);
    methodIdsBuf.writeUInt16LE(methods[i].protoIdx, i * 8 + 2);
    methodIdsBuf.writeUInt32LE(methods[i].nameIdx, i * 8 + 4);
  }

  const classDefsBuf = Buffer.alloc(classDefsByteLen);
  // MainActivity:
  // class_idx: 2 (Lorg/nass/unizik/portal/MainActivity;)
  // access_flags: 0x0001 (ACC_PUBLIC)
  // superclass_idx: 0 (Landroid/app/Activity;)
  // interfaces_off: 0
  // source_file_idx: 4 (MainActivity.java)
  // annotations_off: 0
  // class_data_off: classDataOff
  // static_values_off: 0
  classDefsBuf.writeUInt32LE(2, 0); // class_idx
  classDefsBuf.writeUInt32LE(0x0001, 4); // access_flags
  classDefsBuf.writeUInt32LE(0, 8); // superclass_idx
  classDefsBuf.writeUInt32LE(0, 12); // interfaces_off
  classDefsBuf.writeUInt32LE(4, 16); // source_file_idx
  classDefsBuf.writeUInt32LE(0, 20); // annotations_off
  classDefsBuf.writeUInt32LE(classDataOff, 24); // class_data_off
  classDefsBuf.writeUInt32LE(0, 28); // static_values_off

  const dataSectionBuf = Buffer.concat(dataBuffers);

  // Pad between classDefs and dataSection if needed
  const padBetween = dataOff - (classDefsOff + classDefsByteLen);
  const padBetweenBuf = Buffer.alloc(padBetween);

  // Construct header
  const header = Buffer.alloc(headerSize);
  header.write('dex\n035\0', 0, 8, 'ascii');
  header.writeUInt32LE(totalFileSize, 32);
  header.writeUInt32LE(headerSize, 36);
  header.writeUInt32LE(0x12345678, 40); // ENDIAN_CONSTANT
  header.writeUInt32LE(0, 44); // link_size
  header.writeUInt32LE(0, 48); // link_off
  header.writeUInt32LE(mapOff, 52); // map_off
  header.writeUInt32LE(stringIdsSize, 56);
  header.writeUInt32LE(stringIdsOff, 60);
  header.writeUInt32LE(typeIdsSize, 64);
  header.writeUInt32LE(typeIdsOff, 68);
  header.writeUInt32LE(protoIdsSize, 72);
  header.writeUInt32LE(protoIdsOff, 76);
  header.writeUInt32LE(fieldIdsSize, 80);
  header.writeUInt32LE(fieldIdsOff, 84);
  header.writeUInt32LE(methodIdsSize, 88);
  header.writeUInt32LE(methodIdsOff, 92);
  header.writeUInt32LE(classDefsSize, 96);
  header.writeUInt32LE(classDefsOff, 100);
  header.writeUInt32LE(dataSize, 104);
  header.writeUInt32LE(dataOff, 108);

  const finalBuf = Buffer.concat([
    header,
    stringIdsBuf,
    typeIdsBuf,
    protoIdsBuf,
    methodIdsBuf,
    classDefsBuf,
    padBetweenBuf,
    dataSectionBuf
  ]);

  // Compute SHA1 over bytes from 32 to end
  const sha1 = crypto.createHash('sha1').update(finalBuf.subarray(32)).digest();
  sha1.copy(finalBuf, 12);

  // Compute Adler32 over bytes from 12 to end
  const adler = adler32(finalBuf, 12);
  finalBuf.writeUInt32LE(adler, 8);

  return finalBuf;
}

const dex = buildDex();
fs.writeFileSync('/tmp/test.dex', dex);
console.log('DEX built, size:', dex.length, 'bytes');

const parsed = parseDEX(dex);
console.log('Parsed DEX successfully!');
console.log('Classes:', parsed.classes.map(c => ({ name: c.type, super: c.superclass, file: c.sourceFile })));
console.log('Methods:', parsed.methods.map(m => `${m.class}->${m.name}`));
